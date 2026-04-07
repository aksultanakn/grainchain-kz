use anchor_lang::prelude::*;
use anchor_spl::token::{self, Burn, Mint, MintTo, Token, TokenAccount, Transfer};

use crate::errors::GrainChainError;
use crate::state::*;

// ─── initialize_carry_vault ───────────────────────────────────────────────────

#[derive(Accounts)]
pub struct InitializeCarryVault<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        constraint = protocol_config.authority == authority.key() @ GrainChainError::Unauthorized,
        constraint = !protocol_config.is_paused @ GrainChainError::ProtocolPaused,
        seeds = [b"protocol_config"],
        bump = protocol_config.bump,
    )]
    pub protocol_config: Account<'info, ProtocolConfig>,

    #[account(
        init,
        payer = authority,
        space = CarryVault::LEN,
        seeds = [b"carry_vault"],
        bump,
    )]
    pub carry_vault: Account<'info, CarryVault>,

    #[account(
        init,
        payer = authority,
        token::mint = grain_mint,
        token::authority = carry_vault,
        seeds = [b"carry_grain_reserve"],
        bump,
    )]
    pub carry_grain_reserve: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = authority,
        space = CarryOracleState::LEN,
        seeds = [b"carry_oracle"],
        bump,
    )]
    pub carry_oracle: Account<'info, CarryOracleState>,

    #[account(address = protocol_config.grain_mint)]
    pub grain_mint: Account<'info, Mint>,

    #[account(
        constraint = cgrain_mint.decimals == GRAIN_DECIMALS @ GrainChainError::Unauthorized,
    )]
    pub cgrain_mint: Account<'info, Mint>,

    /// CHECK: oracle authority stored for update_carry_oracle auth check
    pub oracle_authority: UncheckedAccount<'info>,

    pub token_program:  Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn initialize_carry_vault(ctx: Context<InitializeCarryVault>) -> Result<()> {
    let clock = Clock::get()?;

    let oracle = &mut ctx.accounts.carry_oracle;
    oracle.authority          = ctx.accounts.oracle_authority.key();
    oracle.spot_price         = 0;
    oracle.futures_price      = 0;
    oracle.carry_spread_bps   = 0;
    oracle.annualized_apy_bps = 0;
    oracle.last_update_ts     = clock.unix_timestamp;
    oracle.is_contango        = false;
    oracle.bump               = ctx.bumps.carry_oracle;

    let vault = &mut ctx.accounts.carry_vault;
    vault.protocol                 = ctx.accounts.protocol_config.key();
    vault.grain_reserve            = ctx.accounts.carry_grain_reserve.key();
    vault.cgrain_mint              = ctx.accounts.cgrain_mint.key();
    vault.total_grain_deposited    = 0;
    vault.total_cgrain_minted      = 0;
    vault.exchange_rate            = RATE_SCALE;
    vault.carry_rate_per_second    = 0;
    vault.last_accrual_ts          = clock.unix_timestamp;
    vault.last_oracle_update_ts    = clock.unix_timestamp;
    vault.current_carry_spread_bps = 0;
    vault.total_yield_distributed  = 0;
    vault.bump                     = ctx.bumps.carry_vault;

    msg!("Carry vault initialized. Oracle: {}", ctx.accounts.oracle_authority.key());
    Ok(())
}

// ─── update_carry_oracle ──────────────────────────────────────────────────────

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct UpdateCarryOracleParams {
    pub spot_price:         i64,
    pub futures_price:      i64,
    pub carry_spread_bps:   i64,
    pub annualized_apy_bps: u64,
}

#[derive(Accounts)]
pub struct UpdateCarryOracle<'info> {
    pub oracle: Signer<'info>,

    #[account(
        mut,
        seeds = [b"carry_oracle"],
        bump = carry_oracle.bump,
        constraint = carry_oracle.authority == oracle.key() @ GrainChainError::Unauthorized,
    )]
    pub carry_oracle: Account<'info, CarryOracleState>,

    #[account(
        mut,
        seeds = [b"carry_vault"],
        bump = carry_vault.bump,
    )]
    pub carry_vault: Account<'info, CarryVault>,
}

pub fn update_carry_oracle(
    ctx: Context<UpdateCarryOracle>,
    params: UpdateCarryOracleParams,
) -> Result<()> {
    let clock = Clock::get()?;

    let oracle = &mut ctx.accounts.carry_oracle;
    oracle.spot_price         = params.spot_price;
    oracle.futures_price      = params.futures_price;
    oracle.carry_spread_bps   = params.carry_spread_bps;
    oracle.annualized_apy_bps = params.annualized_apy_bps;
    oracle.last_update_ts     = clock.unix_timestamp;
    oracle.is_contango        = params.carry_spread_bps > 0;

    // Derive per-second carry rate
    let carry_rate = if params.annualized_apy_bps > 0 {
        (params.annualized_apy_bps as u128)
            .checked_mul(RATE_SCALE)
            .ok_or(GrainChainError::MathOverflow)?
            .checked_div(10_000)
            .ok_or(GrainChainError::MathOverflow)?
            .checked_div(SECONDS_PER_YEAR as u128)
            .ok_or(GrainChainError::MathOverflow)?
    } else {
        0u128
    };

    // Accrue with old rate before switching
    let vault = &mut ctx.accounts.carry_vault;
    let elapsed = (clock.unix_timestamp - vault.last_accrual_ts).max(0) as u128;
    if elapsed > 0 && vault.carry_rate_per_second > 0 {
        let delta = vault.exchange_rate
            .checked_mul(vault.carry_rate_per_second)
            .ok_or(GrainChainError::MathOverflow)?
            .checked_mul(elapsed)
            .ok_or(GrainChainError::MathOverflow)?
            .checked_div(RATE_SCALE)
            .ok_or(GrainChainError::MathOverflow)?;
        vault.exchange_rate = vault.exchange_rate
            .checked_add(delta)
            .ok_or(GrainChainError::ExchangeRateOverflow)?;
    }
    vault.carry_rate_per_second    = carry_rate;
    vault.last_accrual_ts          = clock.unix_timestamp;
    vault.last_oracle_update_ts    = clock.unix_timestamp;
    vault.current_carry_spread_bps = params.carry_spread_bps;

    emit!(CarryOracleUpdated {
        spot_price:         params.spot_price,
        futures_price:      params.futures_price,
        carry_spread_bps:   params.carry_spread_bps,
        annualized_apy_bps: params.annualized_apy_bps,
        is_contango:        params.carry_spread_bps > 0,
        current_rate:       vault.exchange_rate,
        timestamp:          clock.unix_timestamp,
    });

    msg!("Carry oracle: {}bps spread, {}bps APY, rate {}",
        params.carry_spread_bps, params.annualized_apy_bps, vault.exchange_rate);
    Ok(())
}

// ─── accrue_carry_yield ───────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct AccrueCarryYield<'info> {
    pub crank: Signer<'info>,

    #[account(mut, seeds = [b"carry_vault"], bump = carry_vault.bump)]
    pub carry_vault: Account<'info, CarryVault>,

    #[account(seeds = [b"carry_oracle"], bump = carry_oracle.bump)]
    pub carry_oracle: Account<'info, CarryOracleState>,
}

pub fn accrue_carry_yield(ctx: Context<AccrueCarryYield>) -> Result<()> {
    let vault  = &mut ctx.accounts.carry_vault;
    let oracle = &ctx.accounts.carry_oracle;
    let clock  = Clock::get()?;
    let now    = clock.unix_timestamp;

    let elapsed    = (now - vault.last_accrual_ts).max(0) as u128;
    let oracle_age = now - oracle.last_update_ts;

    if elapsed == 0 { return Ok(()); }

    let effective_rate = if oracle_age > CARRY_ORACLE_STALENESS {
        msg!("Carry oracle stale ({}s) — zero yield", oracle_age);
        0u128
    } else {
        vault.carry_rate_per_second
    };

    if effective_rate > 0 {
        let delta = vault.exchange_rate
            .checked_mul(effective_rate)
            .ok_or(GrainChainError::ExchangeRateOverflow)?
            .checked_mul(elapsed)
            .ok_or(GrainChainError::ExchangeRateOverflow)?
            .checked_div(RATE_SCALE)
            .ok_or(GrainChainError::ExchangeRateOverflow)?;

        vault.exchange_rate = vault.exchange_rate
            .checked_add(delta)
            .ok_or(GrainChainError::ExchangeRateOverflow)?;

        if vault.total_cgrain_minted > 0 {
            let yield_grain = delta
                .checked_mul(vault.total_cgrain_minted as u128)
                .ok_or(GrainChainError::MathOverflow)?
                .checked_div(RATE_SCALE)
                .ok_or(GrainChainError::MathOverflow)? as u64;
            vault.total_yield_distributed =
                vault.total_yield_distributed.saturating_add(yield_grain);
        }
    }

    vault.last_accrual_ts = now;
    msg!("Carry crank: rate={} elapsed={}s oracle_age={}s", vault.exchange_rate, elapsed, oracle_age);
    Ok(())
}

// ─── enter_carry_position ─────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct EnterCarryPosition<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        constraint = !protocol_config.is_paused @ GrainChainError::ProtocolPaused,
        seeds = [b"protocol_config"], bump = protocol_config.bump,
    )]
    pub protocol_config: Account<'info, ProtocolConfig>,

    #[account(mut, seeds = [b"carry_vault"], bump = carry_vault.bump)]
    pub carry_vault: Account<'info, CarryVault>,

    #[account(seeds = [b"carry_oracle"], bump = carry_oracle.bump)]
    pub carry_oracle: Account<'info, CarryOracleState>,

    #[account(mut, seeds = [b"carry_grain_reserve"], bump)]
    pub carry_grain_reserve: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = user_grain_account.owner == user.key(),
        constraint = user_grain_account.mint == protocol_config.grain_mint,
    )]
    pub user_grain_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = cgrain_mint.key() == carry_vault.cgrain_mint @ GrainChainError::Unauthorized,
    )]
    pub cgrain_mint: Account<'info, Mint>,

    #[account(
        mut,
        constraint = user_cgrain_account.owner == user.key(),
        constraint = user_cgrain_account.mint == carry_vault.cgrain_mint,
    )]
    pub user_cgrain_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed, payer = user, space = UserCarryPosition::LEN,
        seeds = [b"carry_position", user.key().as_ref()], bump,
    )]
    pub carry_position: Account<'info, UserCarryPosition>,

    pub token_program:  Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn enter_carry_position(ctx: Context<EnterCarryPosition>, grain_amount: u64) -> Result<()> {
    require!(grain_amount > 0, GrainChainError::ZeroAmount);
    require!(
        ctx.accounts.user_grain_account.amount >= grain_amount,
        GrainChainError::InsufficientGrain
    );

    let clock = Clock::get()?;

    // Inline accrue
    {
        let vault      = &mut ctx.accounts.carry_vault;
        let oracle_age = clock.unix_timestamp - ctx.accounts.carry_oracle.last_update_ts;
        let elapsed    = (clock.unix_timestamp - vault.last_accrual_ts).max(0) as u128;
        if elapsed > 0 && vault.carry_rate_per_second > 0 && oracle_age <= CARRY_ORACLE_STALENESS {
            let delta = vault.exchange_rate
                .checked_mul(vault.carry_rate_per_second)
                .ok_or(GrainChainError::ExchangeRateOverflow)?
                .checked_mul(elapsed)
                .ok_or(GrainChainError::ExchangeRateOverflow)?
                .checked_div(RATE_SCALE)
                .ok_or(GrainChainError::ExchangeRateOverflow)?;
            vault.exchange_rate = vault.exchange_rate
                .checked_add(delta)
                .ok_or(GrainChainError::ExchangeRateOverflow)?;
        }
        vault.last_accrual_ts = clock.unix_timestamp;
    }

    let cgrain_amount = {
        let vault = &ctx.accounts.carry_vault;
        (grain_amount as u128)
            .checked_mul(RATE_SCALE)
            .ok_or(GrainChainError::MathOverflow)?
            .checked_div(vault.exchange_rate)
            .ok_or(GrainChainError::MathOverflow)? as u64
    };
    require!(cgrain_amount > 0, GrainChainError::ZeroAmount);

    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from:      ctx.accounts.user_grain_account.to_account_info(),
                to:        ctx.accounts.carry_grain_reserve.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        ),
        grain_amount,
    )?;

    let config_bump = ctx.accounts.protocol_config.bump;
    let seeds: &[&[u8]] = &[b"protocol_config", &[config_bump]];
    let signer_seeds = &[seeds];

    token::mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint:      ctx.accounts.cgrain_mint.to_account_info(),
                to:        ctx.accounts.user_cgrain_account.to_account_info(),
                authority: ctx.accounts.protocol_config.to_account_info(),
            },
            signer_seeds,
        ),
        cgrain_amount,
    )?;

    {
        let vault = &mut ctx.accounts.carry_vault;
        vault.total_grain_deposited = vault.total_grain_deposited
            .checked_add(grain_amount).ok_or(GrainChainError::MathOverflow)?;
        vault.total_cgrain_minted = vault.total_cgrain_minted
            .checked_add(cgrain_amount).ok_or(GrainChainError::MathOverflow)?;
    }

    let pos = &mut ctx.accounts.carry_position;
    let oracle = &ctx.accounts.carry_oracle;
    let vault  = &ctx.accounts.carry_vault;
    pos.user             = ctx.accounts.user.key();
    pos.cgrain_balance   = pos.cgrain_balance
        .checked_add(cgrain_amount).ok_or(GrainChainError::MathOverflow)?;
    pos.entry_rate       = vault.exchange_rate;
    pos.entry_spread_bps = oracle.carry_spread_bps;
    pos.entry_spot_price = oracle.spot_price;
    pos.last_update_ts   = clock.unix_timestamp;
    if ctx.bumps.carry_position != 0 { pos.bump = ctx.bumps.carry_position; }

    emit!(CarryPositionEntered {
        user:                   ctx.accounts.user.key(),
        grain_deposited:        grain_amount,
        cgrain_minted:          cgrain_amount,
        entry_carry_spread_bps: oracle.carry_spread_bps,
        entry_exchange_rate:    vault.exchange_rate,
        is_contango:            oracle.is_contango,
        timestamp:              clock.unix_timestamp,
    });

    msg!("Entered carry: {} GRAIN → {} cGRAIN | carry APY: {}bps",
        grain_amount, cgrain_amount, oracle.annualized_apy_bps);
    Ok(())
}

// ─── exit_carry_position ──────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct ExitCarryPosition<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        constraint = !protocol_config.is_paused @ GrainChainError::ProtocolPaused,
        seeds = [b"protocol_config"], bump = protocol_config.bump,
    )]
    pub protocol_config: Account<'info, ProtocolConfig>,

    #[account(mut, seeds = [b"carry_vault"], bump = carry_vault.bump)]
    pub carry_vault: Account<'info, CarryVault>,

    #[account(seeds = [b"carry_oracle"], bump = carry_oracle.bump)]
    pub carry_oracle: Account<'info, CarryOracleState>,

    #[account(mut, seeds = [b"carry_grain_reserve"], bump)]
    pub carry_grain_reserve: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = user_grain_account.owner == user.key(),
        constraint = user_grain_account.mint == protocol_config.grain_mint,
    )]
    pub user_grain_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = cgrain_mint.key() == carry_vault.cgrain_mint @ GrainChainError::Unauthorized,
    )]
    pub cgrain_mint: Account<'info, Mint>,

    #[account(
        mut,
        constraint = user_cgrain_account.owner == user.key(),
        constraint = user_cgrain_account.mint == carry_vault.cgrain_mint,
    )]
    pub user_cgrain_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"carry_position", user.key().as_ref()],
        bump = carry_position.bump,
        constraint = carry_position.user == user.key() @ GrainChainError::Unauthorized,
    )]
    pub carry_position: Account<'info, UserCarryPosition>,

    pub token_program: Program<'info, Token>,
}

pub fn exit_carry_position(ctx: Context<ExitCarryPosition>, cgrain_amount: u64) -> Result<()> {
    require!(cgrain_amount > 0, GrainChainError::ZeroAmount);
    require!(
        ctx.accounts.user_cgrain_account.amount >= cgrain_amount,
        GrainChainError::InsufficientSgrain
    );

    let clock = Clock::get()?;

    // Inline accrue
    {
        let vault      = &mut ctx.accounts.carry_vault;
        let oracle_age = clock.unix_timestamp - ctx.accounts.carry_oracle.last_update_ts;
        let elapsed    = (clock.unix_timestamp - vault.last_accrual_ts).max(0) as u128;
        if elapsed > 0 && vault.carry_rate_per_second > 0 && oracle_age <= CARRY_ORACLE_STALENESS {
            let delta = vault.exchange_rate
                .checked_mul(vault.carry_rate_per_second)
                .ok_or(GrainChainError::ExchangeRateOverflow)?
                .checked_mul(elapsed)
                .ok_or(GrainChainError::ExchangeRateOverflow)?
                .checked_div(RATE_SCALE)
                .ok_or(GrainChainError::ExchangeRateOverflow)?;
            vault.exchange_rate = vault.exchange_rate
                .checked_add(delta)
                .ok_or(GrainChainError::ExchangeRateOverflow)?;
        }
        vault.last_accrual_ts = clock.unix_timestamp;
    }

    let grain_returned = {
        let vault = &ctx.accounts.carry_vault;
        (cgrain_amount as u128)
            .checked_mul(vault.exchange_rate)
            .ok_or(GrainChainError::MathOverflow)?
            .checked_div(RATE_SCALE)
            .ok_or(GrainChainError::MathOverflow)? as u64
    };

    let grain_at_entry = {
        let pos = &ctx.accounts.carry_position;
        (cgrain_amount as u128)
            .checked_mul(pos.entry_rate)
            .ok_or(GrainChainError::MathOverflow)?
            .checked_div(RATE_SCALE)
            .ok_or(GrainChainError::MathOverflow)? as u64
    };

    let carry_yield = grain_returned.saturating_sub(grain_at_entry);

    token::burn(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Burn {
                mint:      ctx.accounts.cgrain_mint.to_account_info(),
                from:      ctx.accounts.user_cgrain_account.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        ),
        cgrain_amount,
    )?;

    let vault_bump = ctx.accounts.carry_vault.bump;
    let seeds: &[&[u8]] = &[b"carry_vault", &[vault_bump]];
    let signer_seeds = &[seeds];

    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from:      ctx.accounts.carry_grain_reserve.to_account_info(),
                to:        ctx.accounts.user_grain_account.to_account_info(),
                authority: ctx.accounts.carry_vault.to_account_info(),
            },
            signer_seeds,
        ),
        grain_returned,
    )?;

    {
        let vault = &mut ctx.accounts.carry_vault;
        vault.total_grain_deposited = vault.total_grain_deposited.saturating_sub(grain_at_entry);
        vault.total_cgrain_minted   = vault.total_cgrain_minted.saturating_sub(cgrain_amount);
    }

    {
        let pos = &mut ctx.accounts.carry_position;
        pos.cgrain_balance = pos.cgrain_balance.saturating_sub(cgrain_amount);
        pos.last_update_ts = clock.unix_timestamp;
    }

    emit!(CarryPositionExited {
        user:               ctx.accounts.user.key(),
        cgrain_burned:      cgrain_amount,
        grain_returned,
        carry_yield_grain:  carry_yield,
        exit_exchange_rate: ctx.accounts.carry_vault.exchange_rate,
        exit_spread_bps:    ctx.accounts.carry_oracle.carry_spread_bps,
        timestamp:          clock.unix_timestamp,
    });

    msg!("Exited carry: {} cGRAIN → {} GRAIN (yield: {} GRAIN)",
        cgrain_amount, grain_returned, carry_yield);
    Ok(())
}

// ─── Events ───────────────────────────────────────────────────────────────────

#[event]
pub struct CarryOracleUpdated {
    pub spot_price:         i64,
    pub futures_price:      i64,
    pub carry_spread_bps:   i64,
    pub annualized_apy_bps: u64,
    pub is_contango:        bool,
    pub current_rate:       u128,
    pub timestamp:          i64,
}

#[event]
pub struct CarryPositionEntered {
    pub user:                   Pubkey,
    pub grain_deposited:        u64,
    pub cgrain_minted:          u64,
    pub entry_carry_spread_bps: i64,
    pub entry_exchange_rate:    u128,
    pub is_contango:            bool,
    pub timestamp:              i64,
}

#[event]
pub struct CarryPositionExited {
    pub user:               Pubkey,
    pub cgrain_burned:      u64,
    pub grain_returned:     u64,
    pub carry_yield_grain:  u64,
    pub exit_exchange_rate: u128,
    pub exit_spread_bps:    i64,
    pub timestamp:          i64,
}
