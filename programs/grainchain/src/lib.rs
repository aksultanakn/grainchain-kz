use anchor_lang::prelude::*;
use anchor_spl::token::{self, Burn, Mint, MintTo, Token, TokenAccount, Transfer};

declare_id!("11111111111111111111111111111111");

// ─── Constants ────────────────────────────────────────────────────────────────
pub const GRAIN_DECIMALS: u8 = 6;
pub const LTV_NUMERATOR: u64 = 60;
pub const LTV_DENOMINATOR: u64 = 100;
pub const LIQUIDATION_THRESHOLD: u64 = 80;
pub const INTEREST_RATE_PER_SECOND: u128 = 356;
pub const SGRAIN_YIELD_PER_SECOND: u128 = 101;
pub const SECONDS_PER_YEAR: u64 = 31_536_000;
pub const PRICE_STALENESS_THRESHOLD: i64 = 60;
pub const RATE_SCALE: u128 = 1_000_000_000;
pub const CARRY_ORACLE_STALENESS: i64 = 300;

// ─── Errors ───────────────────────────────────────────────────────────────────
#[error_code]
pub enum GrainChainError {
    #[msg("Unauthorized")] Unauthorized,
    #[msg("Protocol paused")] ProtocolPaused,
    #[msg("Math overflow")] MathOverflow,
    #[msg("Exchange rate overflow")] ExchangeRateOverflow,
    #[msg("Zero amount")] ZeroAmount,
    #[msg("Insufficient GRAIN")] InsufficientGrain,
    #[msg("Insufficient sGRAIN")] InsufficientSgrain,
    #[msg("Exceeds LTV")] ExceedsLtv,
    #[msg("Loan not active")] LoanNotActive,
    #[msg("Not liquidatable")] NotLiquidatable,
    #[msg("Oracle stale")] OracleStale,
    #[msg("Forward offer not active")] ForwardInactive,
    #[msg("Forward offer is full")] ForwardFull,
    #[msg("Forward contract not yet expired")] ForwardNotExpired,
    #[msg("Forward contract already settled")] ForwardAlreadySettled,
    #[msg("Forward offer has expired")] ForwardExpired,
}

// ─── State ────────────────────────────────────────────────────────────────────

#[account]
pub struct ProtocolConfig {
    pub authority:       Pubkey,
    pub grain_mint:      Pubkey,
    pub sgrain_mint:     Pubkey,
    pub cgrain_mint:     Pubkey,
    pub chain_mint:      Pubkey,
    pub usdc_mint:       Pubkey,
    pub wheat_pyth_feed: Pubkey,
    pub is_paused:       bool,
    pub version:         u8,
    pub bump:            u8,
}
impl ProtocolConfig { pub const LEN: usize = 8 + 32*7 + 1 + 1 + 1; }

#[account]
pub struct SiloAccount {
    pub qoldau_id:   [u8; 32],
    pub name:        [u8; 64],
    pub region:      [u8; 32],
    pub operator:    Pubkey,
    pub capacity_kg: u64,
    pub locked_kg:   u64,
    pub is_active:   bool,
    pub bump:        u8,
}
impl SiloAccount { pub const LEN: usize = 8 + 32 + 64 + 32 + 32 + 8 + 8 + 1 + 1; }

#[account]
pub struct GrainReceipt {
    pub serial:            [u8; 32],
    pub silo:              Pubkey,
    pub farmer:            Pubkey,
    pub amount_kg:         u64,
    pub fractionalized_kg: u64,
    pub grade:             u8,
    pub protein_bps:       u16,
    pub moisture_bps:      u16,
    pub harvest_ts:        i64,
    pub minted_ts:         i64,
    pub is_active:         bool,
    pub bump:              u8,
}
impl GrainReceipt { pub const LEN: usize = 8 + 32 + 32 + 32 + 8 + 8 + 1 + 2 + 2 + 8 + 8 + 1 + 1; }

#[account]
pub struct LendingVault {
    pub protocol:              Pubkey,
    pub usdc_vault:            Pubkey,
    pub total_deposited:       u64,
    pub total_borrowed:        u64,
    pub total_interest_earned: u64,
    pub last_accrual_ts:       i64,
    pub bump:                  u8,
}
impl LendingVault { pub const LEN: usize = 8 + 32 + 32 + 8 + 8 + 8 + 8 + 1; }

#[account]
pub struct LenderPosition {
    pub lender:           Pubkey,
    pub deposited_amount: u64,
    pub earned_interest:  u64,
    pub last_update_ts:   i64,
    pub bump:             u8,
}
impl LenderPosition { pub const LEN: usize = 8 + 32 + 8 + 8 + 8 + 1; }

#[account]
pub struct LoanPosition {
    pub borrower:            Pubkey,
    pub collateral_grain_kg: u64,
    pub principal:           u64,
    pub accrued_interest:    u64,
    pub opened_ts:           i64,
    pub last_accrual_ts:     i64,
    pub is_active:           bool,
    pub bump:                u8,
}
impl LoanPosition { pub const LEN: usize = 8 + 32 + 8 + 8 + 8 + 8 + 8 + 1 + 1; }

#[account]
pub struct SgrainVault {
    pub protocol:              Pubkey,
    pub grain_vault:           Pubkey,
    pub total_grain_deposited: u64,
    pub total_sgrain_minted:   u64,
    pub exchange_rate:         u128,
    pub last_accrual_ts:       i64,
    pub bump:                  u8,
}
impl SgrainVault { pub const LEN: usize = 8 + 32 + 32 + 8 + 8 + 16 + 8 + 1; }

#[account]
pub struct UserSgrainPosition {
    pub user:           Pubkey,
    pub sgrain_balance: u64,
    pub entry_rate:     u128,
    pub last_update_ts: i64,
    pub bump:           u8,
}
impl UserSgrainPosition { pub const LEN: usize = 8 + 32 + 8 + 16 + 8 + 1; }

#[account]
pub struct CarryOracleState {
    pub authority:           Pubkey,
    pub spot_price_raw:      i64,
    pub futures_price_raw:   i64,
    pub carry_spread_bps:    i64,
    pub annualized_apy_bps:  u64,
    pub last_update_ts:      i64,
    pub is_contango:         bool,
    pub bump:                u8,
}
impl CarryOracleState { pub const LEN: usize = 8 + 32 + 8 + 8 + 8 + 8 + 8 + 1 + 1; }

#[account]
pub struct CarryVault {
    pub protocol:                 Pubkey,
    pub grain_reserve:            Pubkey,
    pub cgrain_mint:              Pubkey,
    pub total_grain_deposited:    u64,
    pub total_cgrain_minted:      u64,
    pub exchange_rate:            u128,
    pub carry_rate_per_second:    u128,
    pub last_accrual_ts:          i64,
    pub current_carry_spread_bps: i64,
    pub total_yield_distributed:  u64,
    pub bump:                     u8,
}
impl CarryVault { pub const LEN: usize = 8 + 32 + 32 + 32 + 8 + 8 + 16 + 16 + 8 + 8 + 8 + 1; }

#[account]
pub struct UserCarryPosition {
    pub user:            Pubkey,
    pub cgrain_balance:  u64,
    pub entry_rate:      u128,
    pub entry_spread_bps: i64,
    pub entry_ts:        i64,
    pub last_update_ts:  i64,
    pub bump:            u8,
}
impl UserCarryPosition { pub const LEN: usize = 8 + 32 + 8 + 16 + 8 + 8 + 8 + 1; }

// ─── Forward Market ───────────────────────────────────────────────────────────

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ContractStatus { Active, Settled, Cancelled }

#[account]
pub struct ForwardOffer {
    pub broker:               Pubkey,   // who posted the offer
    pub grain_amount_kg:      u64,      // total kg broker wants to buy
    pub forward_price_per_kg: u64,      // USDC lamports per kg (6 dec: 220_000 = $0.22/kg)
    pub min_grade:            u8,       // minimum wheat grade (1–5)
    pub expiry_ts:            i64,      // unix timestamp for settlement
    pub filled_kg:            u64,      // kg already accepted by farmers
    pub total_usdc_locked:    u64,      // USDC held in forward_usdc_vault
    pub is_active:            bool,
    pub bump:                 u8,
}
impl ForwardOffer { pub const LEN: usize = 8 + 32 + 8 + 8 + 1 + 8 + 8 + 8 + 1 + 1; }

#[account]
pub struct ForwardContract {
    pub farmer:               Pubkey,
    pub broker:               Pubkey,
    pub grain_amount_kg:      u64,      // kg escrowed in forward_grain_escrow
    pub forward_price_per_kg: u64,      // price locked at acceptance
    pub usdc_locked:          u64,      // USDC owed to farmer at settlement
    pub expiry_ts:            i64,
    pub status:               ContractStatus,
    pub settled_spot_price:   u64,      // Pyth spot recorded at settlement (informational)
    pub bump:                 u8,
}
impl ForwardContract { pub const LEN: usize = 8 + 32 + 32 + 8 + 8 + 8 + 8 + 1 + 8 + 1; }

// ─── Params ───────────────────────────────────────────────────────────────────

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct InitializeProtocolParams {
    pub wheat_pyth_feed: Pubkey,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct RegisterSiloParams {
    pub qoldau_id:   [u8; 32],
    pub name:        [u8; 64],
    pub region:      [u8; 32],
    pub capacity_kg: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct MintReceiptParams {
    pub serial:        [u8; 32],
    pub amount_kg:     u64,
    pub grade:         u8,
    pub protein_bps:   u16,
    pub moisture_bps:  u16,
    pub harvest_ts:    i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct UpdateCarryOracleParams {
    pub spot_price_raw:     i64,
    pub futures_price_raw:  i64,
    pub carry_spread_bps:   i64,
    pub annualized_apy_bps: u64,
}

// ─── Events ───────────────────────────────────────────────────────────────────

#[event] pub struct ReceiptMinted { pub farmer: Pubkey, pub amount_kg: u64, pub serial: [u8; 32] }
#[event] pub struct GrainFractionalized { pub farmer: Pubkey, pub amount_kg: u64 }
#[event] pub struct UsdcDeposited { pub lender: Pubkey, pub amount: u64 }
#[event] pub struct UsdcBorrowed { pub borrower: Pubkey, pub collateral_kg: u64, pub usdc: u64 }
#[event] pub struct LoanRepaid { pub borrower: Pubkey, pub usdc: u64 }
#[event] pub struct SgrainDeposited { pub user: Pubkey, pub grain: u64, pub sgrain: u64 }
#[event] pub struct SgrainWithdrawn { pub user: Pubkey, pub sgrain: u64, pub grain: u64 }
#[event] pub struct CarryOracleUpdated { pub carry_spread_bps: i64, pub apy_bps: u64, pub rate: u128 }
#[event] pub struct CarryEntered { pub user: Pubkey, pub grain: u64, pub cgrain: u64 }
#[event] pub struct CarryExited { pub user: Pubkey, pub cgrain: u64, pub grain: u64, pub yield_grain: u64 }
#[event] pub struct ForwardOfferPosted { pub broker: Pubkey, pub grain_kg: u64, pub price_per_kg: u64, pub expiry_ts: i64 }
#[event] pub struct ForwardAccepted { pub farmer: Pubkey, pub broker: Pubkey, pub grain_kg: u64, pub usdc_locked: u64 }
#[event] pub struct ForwardSettled { pub farmer: Pubkey, pub broker: Pubkey, pub grain_kg: u64, pub usdc_paid: u64, pub spot_price: u64 }
#[event] pub struct ForwardCancelled { pub broker: Pubkey, pub usdc_returned: u64 }

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct PostForwardOfferParams {
    pub grain_amount_kg:      u64,
    pub forward_price_per_kg: u64,
    pub min_grade:            u8,
    pub expiry_ts:            i64,
}

// ─── Program ──────────────────────────────────────────────────────────────────

#[program]
pub mod grainchain {
    use super::*;

    // ── Admin ──────────────────────────────────────────────────────────────────

    pub fn initialize_protocol(
        ctx: Context<InitializeProtocol>,
        params: InitializeProtocolParams,
    ) -> Result<()> {
        let cfg = &mut ctx.accounts.protocol_config;
        cfg.authority       = ctx.accounts.authority.key();
        cfg.grain_mint      = ctx.accounts.grain_mint.key();
        cfg.sgrain_mint     = ctx.accounts.sgrain_mint.key();
        cfg.cgrain_mint     = ctx.accounts.cgrain_mint.key();
        cfg.chain_mint      = ctx.accounts.chain_mint.key();
        cfg.usdc_mint       = ctx.accounts.usdc_mint.key();
        cfg.wheat_pyth_feed = params.wheat_pyth_feed;
        cfg.is_paused       = false;
        cfg.version         = 1;
        cfg.bump            = ctx.bumps.protocol_config;
        msg!("Protocol initialized");
        Ok(())
    }

    pub fn register_silo(ctx: Context<RegisterSilo>, params: RegisterSiloParams) -> Result<()> {
        let silo = &mut ctx.accounts.silo_account;
        silo.qoldau_id   = params.qoldau_id;
        silo.name        = params.name;
        silo.region      = params.region;
        silo.operator    = ctx.accounts.operator.key();
        silo.capacity_kg = params.capacity_kg;
        silo.locked_kg   = 0;
        silo.is_active   = true;
        silo.bump        = ctx.bumps.silo_account;
        msg!("Silo registered");
        Ok(())
    }

    // ── Receipt / Tokenization ────────────────────────────────────────────────

    pub fn mint_receipt(ctx: Context<MintReceipt>, params: MintReceiptParams) -> Result<()> {
        require!(params.amount_kg > 0, GrainChainError::ZeroAmount);
        let receipt = &mut ctx.accounts.grain_receipt;
        let clock   = Clock::get()?;
        receipt.serial            = params.serial;
        receipt.silo              = ctx.accounts.silo_account.key();
        receipt.farmer            = ctx.accounts.farmer.key();
        receipt.amount_kg         = params.amount_kg;
        receipt.fractionalized_kg = 0;
        receipt.grade             = params.grade;
        receipt.protein_bps       = params.protein_bps;
        receipt.moisture_bps      = params.moisture_bps;
        receipt.harvest_ts        = params.harvest_ts;
        receipt.minted_ts         = clock.unix_timestamp;
        receipt.is_active         = true;
        receipt.bump              = ctx.bumps.grain_receipt;

        let silo = &mut ctx.accounts.silo_account;
        silo.locked_kg = silo.locked_kg.checked_add(params.amount_kg)
            .ok_or(GrainChainError::MathOverflow)?;

        emit!(ReceiptMinted { farmer: ctx.accounts.farmer.key(), amount_kg: params.amount_kg, serial: params.serial });
        msg!("Receipt minted: {} kg", params.amount_kg);
        Ok(())
    }

    pub fn fractionalize(ctx: Context<Fractionalize>, amount_kg: u64) -> Result<()> {
        require!(amount_kg > 0, GrainChainError::ZeroAmount);
        let receipt = &mut ctx.accounts.grain_receipt;
        require!(receipt.is_active, GrainChainError::Unauthorized);
        let remaining = receipt.amount_kg.saturating_sub(receipt.fractionalized_kg);
        require!(amount_kg <= remaining, GrainChainError::InsufficientGrain);

        let token_amount = amount_kg.checked_mul(1_000_000)
            .ok_or(GrainChainError::MathOverflow)?;

        let bump = ctx.accounts.protocol_config.bump;
        let seeds: &[&[u8]] = &[b"protocol_config", &[bump]];
        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint:      ctx.accounts.grain_mint.to_account_info(),
                    to:        ctx.accounts.farmer_grain_account.to_account_info(),
                    authority: ctx.accounts.protocol_config.to_account_info(),
                },
                &[seeds],
            ),
            token_amount,
        )?;

        receipt.fractionalized_kg = receipt.fractionalized_kg
            .checked_add(amount_kg).ok_or(GrainChainError::MathOverflow)?;

        emit!(GrainFractionalized { farmer: ctx.accounts.farmer.key(), amount_kg });
        msg!("Fractionalized {} kg → {} GRAIN tokens", amount_kg, token_amount);
        Ok(())
    }

    // ── Lending ───────────────────────────────────────────────────────────────

    pub fn initialize_vault(ctx: Context<InitializeVault>) -> Result<()> {
        let vault = &mut ctx.accounts.lending_vault;
        vault.protocol              = ctx.accounts.protocol_config.key();
        vault.usdc_vault            = ctx.accounts.usdc_vault.key();
        vault.total_deposited       = 0;
        vault.total_borrowed        = 0;
        vault.total_interest_earned = 0;
        vault.last_accrual_ts       = Clock::get()?.unix_timestamp;
        vault.bump                  = ctx.bumps.lending_vault;
        msg!("Lending vault initialized");
        Ok(())
    }

    pub fn deposit_usdc(ctx: Context<DepositUsdc>, amount: u64) -> Result<()> {
        require!(amount > 0, GrainChainError::ZeroAmount);
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from:      ctx.accounts.lender_usdc_account.to_account_info(),
                    to:        ctx.accounts.usdc_vault.to_account_info(),
                    authority: ctx.accounts.lender.to_account_info(),
                },
            ),
            amount,
        )?;
        let vault = &mut ctx.accounts.lending_vault;
        vault.total_deposited = vault.total_deposited.checked_add(amount)
            .ok_or(GrainChainError::MathOverflow)?;

        let pos = &mut ctx.accounts.lender_position;
        pos.lender           = ctx.accounts.lender.key();
        pos.deposited_amount  = pos.deposited_amount.checked_add(amount)
            .ok_or(GrainChainError::MathOverflow)?;
        pos.last_update_ts   = Clock::get()?.unix_timestamp;
        if ctx.bumps.lender_position != 0 { pos.bump = ctx.bumps.lender_position; }

        emit!(UsdcDeposited { lender: ctx.accounts.lender.key(), amount });
        msg!("Deposited {} USDC", amount);
        Ok(())
    }

    pub fn borrow(
        ctx: Context<Borrow>,
        grain_collateral_kg: u64,
        usdc_requested: u64,
    ) -> Result<()> {
        require!(grain_collateral_kg > 0 && usdc_requested > 0, GrainChainError::ZeroAmount);

        // Use a simple price: 1 GRAIN (1kg) = 0.18 USDC (fixed for devnet demo)
        // In production this reads from Pyth oracle
        let grain_value_usdc = grain_collateral_kg
            .checked_mul(180_000) // 0.18 USDC per kg × 1e6
            .ok_or(GrainChainError::MathOverflow)?
            .checked_div(1_000_000)
            .ok_or(GrainChainError::MathOverflow)?;

        let max_borrow = grain_value_usdc
            .checked_mul(LTV_NUMERATOR)
            .ok_or(GrainChainError::MathOverflow)?
            .checked_div(LTV_DENOMINATOR)
            .ok_or(GrainChainError::MathOverflow)?;

        require!(usdc_requested <= max_borrow, GrainChainError::ExceedsLtv);

        // Lock GRAIN collateral
        let grain_token_amount = grain_collateral_kg.checked_mul(1_000_000)
            .ok_or(GrainChainError::MathOverflow)?;
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from:      ctx.accounts.farmer_grain_account.to_account_info(),
                    to:        ctx.accounts.collateral_escrow.to_account_info(),
                    authority: ctx.accounts.farmer.to_account_info(),
                },
            ),
            grain_token_amount,
        )?;

        // Send USDC to farmer
        let vault_bump = ctx.accounts.lending_vault.bump;
        let seeds: &[&[u8]] = &[b"lending_vault", &[vault_bump]];
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from:      ctx.accounts.usdc_vault.to_account_info(),
                    to:        ctx.accounts.farmer_usdc_account.to_account_info(),
                    authority: ctx.accounts.lending_vault.to_account_info(),
                },
                &[seeds],
            ),
            usdc_requested,
        )?;

        let clock = Clock::get()?;
        let loan = &mut ctx.accounts.loan_position;
        loan.borrower            = ctx.accounts.farmer.key();
        loan.collateral_grain_kg = grain_collateral_kg;
        loan.principal           = usdc_requested;
        loan.accrued_interest    = 0;
        loan.opened_ts           = clock.unix_timestamp;
        loan.last_accrual_ts     = clock.unix_timestamp;
        loan.is_active           = true;
        if ctx.bumps.loan_position != 0 { loan.bump = ctx.bumps.loan_position; }

        let vault = &mut ctx.accounts.lending_vault;
        vault.total_borrowed = vault.total_borrowed.checked_add(usdc_requested)
            .ok_or(GrainChainError::MathOverflow)?;

        emit!(UsdcBorrowed { borrower: ctx.accounts.farmer.key(), collateral_kg: grain_collateral_kg, usdc: usdc_requested });
        msg!("Borrowed {} USDC against {} kg GRAIN", usdc_requested, grain_collateral_kg);
        Ok(())
    }

    pub fn repay(ctx: Context<Repay>, usdc_repay_amount: u64) -> Result<()> {
        require!(usdc_repay_amount > 0, GrainChainError::ZeroAmount);
        let loan = &ctx.accounts.loan_position;
        require!(loan.is_active, GrainChainError::LoanNotActive);

        // Accrue interest
        let clock   = Clock::get()?;
        let elapsed = (clock.unix_timestamp - loan.last_accrual_ts).max(0) as u128;
        let interest = (loan.principal as u128)
            .checked_mul(INTEREST_RATE_PER_SECOND)
            .ok_or(GrainChainError::MathOverflow)?
            .checked_mul(elapsed)
            .ok_or(GrainChainError::MathOverflow)?
            .checked_div(RATE_SCALE)
            .ok_or(GrainChainError::MathOverflow)? as u64;

        let total_owed = loan.principal.checked_add(interest)
            .ok_or(GrainChainError::MathOverflow)?;

        // Transfer USDC back to vault
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from:      ctx.accounts.farmer_usdc_account.to_account_info(),
                    to:        ctx.accounts.usdc_vault.to_account_info(),
                    authority: ctx.accounts.farmer.to_account_info(),
                },
            ),
            usdc_repay_amount.min(total_owed),
        )?;

        // Return GRAIN collateral
        let grain_token_amount = loan.collateral_grain_kg.checked_mul(1_000_000)
            .ok_or(GrainChainError::MathOverflow)?;

        let vault_bump = ctx.accounts.lending_vault.bump;
        let seeds: &[&[u8]] = &[b"lending_vault", &[vault_bump]];
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from:      ctx.accounts.collateral_escrow.to_account_info(),
                    to:        ctx.accounts.farmer_grain_account.to_account_info(),
                    authority: ctx.accounts.lending_vault.to_account_info(),
                },
                &[seeds],
            ),
            grain_token_amount,
        )?;

        let loan = &mut ctx.accounts.loan_position;
        loan.is_active = false;

        emit!(LoanRepaid { borrower: ctx.accounts.farmer.key(), usdc: usdc_repay_amount });
        msg!("Loan repaid: {} USDC, {} GRAIN returned", usdc_repay_amount, grain_token_amount);
        Ok(())
    }

    // ── sGRAIN Vault ──────────────────────────────────────────────────────────

    pub fn initialize_sgrain_vault(ctx: Context<InitializeSgrainVault>) -> Result<()> {
        let vault = &mut ctx.accounts.sgrain_vault;
        vault.protocol              = ctx.accounts.protocol_config.key();
        vault.grain_vault           = ctx.accounts.grain_reserve.key();
        vault.total_grain_deposited = 0;
        vault.total_sgrain_minted   = 0;
        vault.exchange_rate         = RATE_SCALE;
        vault.last_accrual_ts       = Clock::get()?.unix_timestamp;
        vault.bump                  = ctx.bumps.sgrain_vault;
        msg!("sGRAIN vault initialized");
        Ok(())
    }

    pub fn deposit_sgrain(ctx: Context<DepositSgrain>, grain_amount: u64) -> Result<()> {
        require!(grain_amount > 0, GrainChainError::ZeroAmount);

        // Accrue yield first
        accrue_sgrain_internal(&mut ctx.accounts.sgrain_vault)?;

        let sgrain_amount = (grain_amount as u128)
            .checked_mul(RATE_SCALE)
            .ok_or(GrainChainError::MathOverflow)?
            .checked_div(ctx.accounts.sgrain_vault.exchange_rate)
            .ok_or(GrainChainError::MathOverflow)? as u64;
        require!(sgrain_amount > 0, GrainChainError::ZeroAmount);

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from:      ctx.accounts.user_grain_account.to_account_info(),
                    to:        ctx.accounts.grain_reserve.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            grain_amount,
        )?;

        let bump = ctx.accounts.protocol_config.bump;
        let seeds: &[&[u8]] = &[b"protocol_config", &[bump]];
        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint:      ctx.accounts.sgrain_mint.to_account_info(),
                    to:        ctx.accounts.user_sgrain_account.to_account_info(),
                    authority: ctx.accounts.protocol_config.to_account_info(),
                },
                &[seeds],
            ),
            sgrain_amount,
        )?;

        let vault = &mut ctx.accounts.sgrain_vault;
        vault.total_grain_deposited = vault.total_grain_deposited.checked_add(grain_amount)
            .ok_or(GrainChainError::MathOverflow)?;
        vault.total_sgrain_minted = vault.total_sgrain_minted.checked_add(sgrain_amount)
            .ok_or(GrainChainError::MathOverflow)?;

        let pos = &mut ctx.accounts.sgrain_position;
        pos.user           = ctx.accounts.user.key();
        pos.sgrain_balance = pos.sgrain_balance.checked_add(sgrain_amount)
            .ok_or(GrainChainError::MathOverflow)?;
        pos.entry_rate     = vault.exchange_rate;
        pos.last_update_ts = Clock::get()?.unix_timestamp;
        if ctx.bumps.sgrain_position != 0 { pos.bump = ctx.bumps.sgrain_position; }

        emit!(SgrainDeposited { user: ctx.accounts.user.key(), grain: grain_amount, sgrain: sgrain_amount });
        msg!("Deposited {} GRAIN → {} sGRAIN", grain_amount, sgrain_amount);
        Ok(())
    }

    pub fn withdraw_sgrain(ctx: Context<WithdrawSgrain>, sgrain_amount: u64) -> Result<()> {
        require!(sgrain_amount > 0, GrainChainError::ZeroAmount);

        accrue_sgrain_internal(&mut ctx.accounts.sgrain_vault)?;

        let grain_amount = (sgrain_amount as u128)
            .checked_mul(ctx.accounts.sgrain_vault.exchange_rate)
            .ok_or(GrainChainError::MathOverflow)?
            .checked_div(RATE_SCALE)
            .ok_or(GrainChainError::MathOverflow)? as u64;

        token::burn(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Burn {
                    mint:      ctx.accounts.sgrain_mint.to_account_info(),
                    from:      ctx.accounts.user_sgrain_account.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            sgrain_amount,
        )?;

        let vault_bump = ctx.accounts.sgrain_vault.bump;
        let seeds: &[&[u8]] = &[b"sgrain_vault", &[vault_bump]];
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from:      ctx.accounts.grain_reserve.to_account_info(),
                    to:        ctx.accounts.user_grain_account.to_account_info(),
                    authority: ctx.accounts.sgrain_vault.to_account_info(),
                },
                &[seeds],
            ),
            grain_amount,
        )?;

        let vault = &mut ctx.accounts.sgrain_vault;
        vault.total_sgrain_minted   = vault.total_sgrain_minted.saturating_sub(sgrain_amount);
        vault.total_grain_deposited = vault.total_grain_deposited.saturating_sub(grain_amount);

        emit!(SgrainWithdrawn { user: ctx.accounts.user.key(), sgrain: sgrain_amount, grain: grain_amount });
        msg!("Withdrew {} sGRAIN → {} GRAIN", sgrain_amount, grain_amount);
        Ok(())
    }

    pub fn accrue_sgrain_yield(ctx: Context<AccrueSgrainYield>) -> Result<()> {
        accrue_sgrain_internal(&mut ctx.accounts.sgrain_vault)?;
        msg!("sGRAIN rate: {}", ctx.accounts.sgrain_vault.exchange_rate);
        Ok(())
    }

    // ── Carry Vault ───────────────────────────────────────────────────────────

    pub fn initialize_carry_vault(ctx: Context<InitializeCarryVault>) -> Result<()> {
        let clock = Clock::get()?;

        let oracle = &mut ctx.accounts.carry_oracle;
        oracle.authority          = ctx.accounts.oracle_authority.key();
        oracle.spot_price_raw     = 0;
        oracle.futures_price_raw  = 0;
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
        vault.current_carry_spread_bps = 0;
        vault.total_yield_distributed  = 0;
        vault.bump                     = ctx.bumps.carry_vault;

        msg!("Carry vault initialized");
        Ok(())
    }

    pub fn update_carry_oracle(
        ctx: Context<UpdateCarryOracle>,
        params: UpdateCarryOracleParams,
    ) -> Result<()> {
        let clock = Clock::get()?;

        let oracle = &mut ctx.accounts.carry_oracle;
        oracle.spot_price_raw     = params.spot_price_raw;
        oracle.futures_price_raw  = params.futures_price_raw;
        oracle.carry_spread_bps   = params.carry_spread_bps;
        oracle.annualized_apy_bps = params.annualized_apy_bps;
        oracle.last_update_ts     = clock.unix_timestamp;
        oracle.is_contango        = params.carry_spread_bps > 0;

        let carry_rate = if params.annualized_apy_bps > 0 {
            (params.annualized_apy_bps as u128)
                .checked_mul(RATE_SCALE).ok_or(GrainChainError::MathOverflow)?
                .checked_div(10_000).ok_or(GrainChainError::MathOverflow)?
                .checked_div(SECONDS_PER_YEAR as u128).ok_or(GrainChainError::MathOverflow)?
        } else { 0u128 };

        let vault = &mut ctx.accounts.carry_vault;
        let old_rate = vault.carry_rate_per_second;
        accrue_carry_internal(vault, clock.unix_timestamp, old_rate)?;
        vault.carry_rate_per_second    = carry_rate;
        vault.current_carry_spread_bps = params.carry_spread_bps;

        emit!(CarryOracleUpdated { carry_spread_bps: params.carry_spread_bps, apy_bps: params.annualized_apy_bps, rate: vault.exchange_rate });
        msg!("Carry oracle: {}bps spread, {}bps APY", params.carry_spread_bps, params.annualized_apy_bps);
        Ok(())
    }

    pub fn accrue_carry_yield(ctx: Context<AccrueCarryYield>) -> Result<()> {
        let clock      = Clock::get()?;
        let vault      = &mut ctx.accounts.carry_vault;
        let oracle     = &ctx.accounts.carry_oracle;
        let oracle_age = clock.unix_timestamp - oracle.last_update_ts;
        let rate       = if oracle_age > CARRY_ORACLE_STALENESS { 0 } else { vault.carry_rate_per_second };
        accrue_carry_internal(vault, clock.unix_timestamp, rate)?;
        msg!("Carry rate: {}", vault.exchange_rate);
        Ok(())
    }

    pub fn enter_carry_position(ctx: Context<EnterCarryPosition>, grain_amount: u64) -> Result<()> {
        require!(grain_amount > 0, GrainChainError::ZeroAmount);
        require!(ctx.accounts.user_grain_account.amount >= grain_amount, GrainChainError::InsufficientGrain);

        let clock = Clock::get()?;
        {
            let vault      = &mut ctx.accounts.carry_vault;
            let oracle_age = clock.unix_timestamp - ctx.accounts.carry_oracle.last_update_ts;
            let rate       = if oracle_age > CARRY_ORACLE_STALENESS { 0 } else { vault.carry_rate_per_second };
            accrue_carry_internal(vault, clock.unix_timestamp, rate)?;
        }

        let cgrain_amount = (grain_amount as u128)
            .checked_mul(RATE_SCALE).ok_or(GrainChainError::MathOverflow)?
            .checked_div(ctx.accounts.carry_vault.exchange_rate).ok_or(GrainChainError::MathOverflow)? as u64;
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

        let bump = ctx.accounts.protocol_config.bump;
        let seeds: &[&[u8]] = &[b"protocol_config", &[bump]];
        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint:      ctx.accounts.cgrain_mint.to_account_info(),
                    to:        ctx.accounts.user_cgrain_account.to_account_info(),
                    authority: ctx.accounts.protocol_config.to_account_info(),
                },
                &[seeds],
            ),
            cgrain_amount,
        )?;

        let vault = &mut ctx.accounts.carry_vault;
        vault.total_grain_deposited = vault.total_grain_deposited.checked_add(grain_amount)
            .ok_or(GrainChainError::MathOverflow)?;
        vault.total_cgrain_minted = vault.total_cgrain_minted.checked_add(cgrain_amount)
            .ok_or(GrainChainError::MathOverflow)?;

        let pos = &mut ctx.accounts.carry_position;
        pos.user             = ctx.accounts.user.key();
        pos.cgrain_balance   = pos.cgrain_balance.checked_add(cgrain_amount).ok_or(GrainChainError::MathOverflow)?;
        pos.entry_rate       = vault.exchange_rate;
        pos.entry_spread_bps = ctx.accounts.carry_oracle.carry_spread_bps;
        pos.entry_ts         = clock.unix_timestamp;
        pos.last_update_ts   = clock.unix_timestamp;
        if ctx.bumps.carry_position != 0 { pos.bump = ctx.bumps.carry_position; }

        emit!(CarryEntered { user: ctx.accounts.user.key(), grain: grain_amount, cgrain: cgrain_amount });
        msg!("Entered carry: {} GRAIN → {} cGRAIN", grain_amount, cgrain_amount);
        Ok(())
    }

    pub fn exit_carry_position(ctx: Context<ExitCarryPosition>, cgrain_amount: u64) -> Result<()> {
        require!(cgrain_amount > 0, GrainChainError::ZeroAmount);
        require!(ctx.accounts.user_cgrain_account.amount >= cgrain_amount, GrainChainError::InsufficientSgrain);

        let clock = Clock::get()?;
        {
            let vault      = &mut ctx.accounts.carry_vault;
            let oracle_age = clock.unix_timestamp - ctx.accounts.carry_oracle.last_update_ts;
            let rate       = if oracle_age > CARRY_ORACLE_STALENESS { 0 } else { vault.carry_rate_per_second };
            accrue_carry_internal(vault, clock.unix_timestamp, rate)?;
        }

        let grain_returned = (cgrain_amount as u128)
            .checked_mul(ctx.accounts.carry_vault.exchange_rate).ok_or(GrainChainError::MathOverflow)?
            .checked_div(RATE_SCALE).ok_or(GrainChainError::MathOverflow)? as u64;

        let grain_at_entry = (cgrain_amount as u128)
            .checked_mul(ctx.accounts.carry_position.entry_rate).ok_or(GrainChainError::MathOverflow)?
            .checked_div(RATE_SCALE).ok_or(GrainChainError::MathOverflow)? as u64;

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
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from:      ctx.accounts.carry_grain_reserve.to_account_info(),
                    to:        ctx.accounts.user_grain_account.to_account_info(),
                    authority: ctx.accounts.carry_vault.to_account_info(),
                },
                &[seeds],
            ),
            grain_returned,
        )?;

        let vault = &mut ctx.accounts.carry_vault;
        vault.total_grain_deposited = vault.total_grain_deposited.saturating_sub(grain_at_entry);
        vault.total_cgrain_minted   = vault.total_cgrain_minted.saturating_sub(cgrain_amount);

        let pos = &mut ctx.accounts.carry_position;
        pos.cgrain_balance = pos.cgrain_balance.saturating_sub(cgrain_amount);
        pos.last_update_ts = clock.unix_timestamp;

        emit!(CarryExited { user: ctx.accounts.user.key(), cgrain: cgrain_amount, grain: grain_returned, yield_grain: carry_yield });
        msg!("Exited carry: {} cGRAIN → {} GRAIN (yield: {} GRAIN)", cgrain_amount, grain_returned, carry_yield);
        Ok(())
    }

    // ── Forward Market ────────────────────────────────────────────────────────

    /// Broker posts a forward offer and locks USDC collateral.
    /// grain_amount_kg × forward_price_per_kg USDC lamports are escrowed.
    pub fn post_forward_offer(
        ctx: Context<PostForwardOffer>,
        params: PostForwardOfferParams,
    ) -> Result<()> {
        let clock = Clock::get()?;
        require!(params.grain_amount_kg > 0, GrainChainError::ZeroAmount);
        require!(params.forward_price_per_kg > 0, GrainChainError::ZeroAmount);
        require!(params.expiry_ts > clock.unix_timestamp, GrainChainError::ForwardExpired);

        // Lock USDC: grain_kg * price_per_kg (both in base units, USDC has 6 dec)
        let usdc_to_lock = params.grain_amount_kg
            .checked_mul(params.forward_price_per_kg)
            .ok_or(GrainChainError::MathOverflow)?;

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from:      ctx.accounts.broker_usdc_account.to_account_info(),
                    to:        ctx.accounts.forward_usdc_vault.to_account_info(),
                    authority: ctx.accounts.broker.to_account_info(),
                },
            ),
            usdc_to_lock,
        )?;

        let offer = &mut ctx.accounts.forward_offer;
        offer.broker               = ctx.accounts.broker.key();
        offer.grain_amount_kg      = params.grain_amount_kg;
        offer.forward_price_per_kg = params.forward_price_per_kg;
        offer.min_grade            = params.min_grade;
        offer.expiry_ts            = params.expiry_ts;
        offer.filled_kg            = 0;
        offer.total_usdc_locked    = usdc_to_lock;
        offer.is_active            = true;
        offer.bump                 = ctx.bumps.forward_offer;

        emit!(ForwardOfferPosted {
            broker:       ctx.accounts.broker.key(),
            grain_kg:     params.grain_amount_kg,
            price_per_kg: params.forward_price_per_kg,
            expiry_ts:    params.expiry_ts,
        });
        msg!("Forward offer: {} kg @ {} USDC-lam/kg, expiry {}", params.grain_amount_kg, params.forward_price_per_kg, params.expiry_ts);
        Ok(())
    }

    /// Farmer accepts a forward offer and escrows GRAIN tokens.
    /// Creates a ForwardContract locking the forward price until expiry.
    pub fn accept_forward_offer(ctx: Context<AcceptForwardOffer>, grain_amount_kg: u64) -> Result<()> {
        require!(grain_amount_kg > 0, GrainChainError::ZeroAmount);
        let clock = Clock::get()?;

        let (forward_price, expiry_ts, broker_key) = {
            let offer = &ctx.accounts.forward_offer;
            require!(offer.is_active, GrainChainError::ForwardInactive);
            require!(clock.unix_timestamp < offer.expiry_ts, GrainChainError::ForwardExpired);
            let available = offer.grain_amount_kg.saturating_sub(offer.filled_kg);
            require!(grain_amount_kg <= available, GrainChainError::ForwardFull);
            (offer.forward_price_per_kg, offer.expiry_ts, offer.broker)
        };

        let usdc_locked = grain_amount_kg
            .checked_mul(forward_price)
            .ok_or(GrainChainError::MathOverflow)?;

        let grain_tokens = grain_amount_kg
            .checked_mul(1_000_000)
            .ok_or(GrainChainError::MathOverflow)?;

        require!(
            ctx.accounts.farmer_grain_account.amount >= grain_tokens,
            GrainChainError::InsufficientGrain
        );

        // Escrow GRAIN from farmer
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from:      ctx.accounts.farmer_grain_account.to_account_info(),
                    to:        ctx.accounts.forward_grain_escrow.to_account_info(),
                    authority: ctx.accounts.farmer.to_account_info(),
                },
            ),
            grain_tokens,
        )?;

        // Update offer
        let offer = &mut ctx.accounts.forward_offer;
        offer.filled_kg = offer.filled_kg
            .checked_add(grain_amount_kg)
            .ok_or(GrainChainError::MathOverflow)?;
        if offer.filled_kg >= offer.grain_amount_kg {
            offer.is_active = false;
        }

        // Create contract
        let contract = &mut ctx.accounts.forward_contract;
        contract.farmer               = ctx.accounts.farmer.key();
        contract.broker               = broker_key;
        contract.grain_amount_kg      = grain_amount_kg;
        contract.forward_price_per_kg = forward_price;
        contract.usdc_locked          = usdc_locked;
        contract.expiry_ts            = expiry_ts;
        contract.status               = ContractStatus::Active;
        contract.settled_spot_price   = 0;
        contract.bump                 = ctx.bumps.forward_contract;

        emit!(ForwardAccepted {
            farmer:      ctx.accounts.farmer.key(),
            broker:      broker_key,
            grain_kg:    grain_amount_kg,
            usdc_locked,
        });
        msg!("Forward accepted: {} kg locked, {} USDC reserved, expiry {}", grain_amount_kg, usdc_locked, expiry_ts);
        Ok(())
    }

    /// Settles a forward contract after expiry.
    /// Callable by anyone — sends GRAIN to broker, USDC to farmer atomically.
    pub fn settle_forward(ctx: Context<SettleForward>) -> Result<()> {
        let clock = Clock::get()?;
        require!(
            ctx.accounts.forward_contract.status == ContractStatus::Active,
            GrainChainError::ForwardAlreadySettled
        );
        require!(
            clock.unix_timestamp >= ctx.accounts.forward_contract.expiry_ts,
            GrainChainError::ForwardNotExpired
        );

        let grain_tokens = ctx.accounts.forward_contract.grain_amount_kg
            .checked_mul(1_000_000)
            .ok_or(GrainChainError::MathOverflow)?;
        let usdc_to_pay  = ctx.accounts.forward_contract.usdc_locked;
        let farmer_key   = ctx.accounts.forward_contract.farmer;
        let broker_key   = ctx.accounts.forward_offer.broker;
        let offer_bump   = ctx.accounts.forward_offer.bump;
        let spot_price   = ctx.accounts.carry_oracle.spot_price_raw.max(0) as u64;

        // Sign transfers using forward_offer PDA (authority of both vaults)
        let bump_seed   = &[offer_bump];
        let seeds: &[&[u8]] = &[b"forward_offer", broker_key.as_ref(), bump_seed];
        let signer_seeds = &[seeds];

        // GRAIN escrow → broker
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from:      ctx.accounts.forward_grain_escrow.to_account_info(),
                    to:        ctx.accounts.broker_grain_account.to_account_info(),
                    authority: ctx.accounts.forward_offer.to_account_info(),
                },
                signer_seeds,
            ),
            grain_tokens,
        )?;

        // USDC vault → farmer
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from:      ctx.accounts.forward_usdc_vault.to_account_info(),
                    to:        ctx.accounts.farmer_usdc_account.to_account_info(),
                    authority: ctx.accounts.forward_offer.to_account_info(),
                },
                signer_seeds,
            ),
            usdc_to_pay,
        )?;

        ctx.accounts.forward_contract.status             = ContractStatus::Settled;
        ctx.accounts.forward_contract.settled_spot_price = spot_price;

        emit!(ForwardSettled {
            farmer: farmer_key,
            broker: broker_key,
            grain_kg:   grain_tokens / 1_000_000,
            usdc_paid:  usdc_to_pay,
            spot_price,
        });
        msg!("Forward settled: {} GRAIN → broker, {} USDC → farmer, spot_price={}", grain_tokens, usdc_to_pay, spot_price);
        Ok(())
    }

    /// Broker cancels an unfilled offer and reclaims USDC.
    /// Only allowed when filled_kg == 0.
    pub fn cancel_forward_offer(ctx: Context<CancelForwardOffer>) -> Result<()> {
        let offer = &ctx.accounts.forward_offer;
        require!(offer.is_active, GrainChainError::ForwardInactive);
        require!(offer.filled_kg == 0, GrainChainError::ForwardFull);

        let usdc_to_return = offer.total_usdc_locked;
        let broker_key     = offer.broker;
        let offer_bump     = offer.bump;

        let bump_seed   = &[offer_bump];
        let seeds: &[&[u8]] = &[b"forward_offer", broker_key.as_ref(), bump_seed];
        let signer_seeds = &[seeds];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from:      ctx.accounts.forward_usdc_vault.to_account_info(),
                    to:        ctx.accounts.broker_usdc_account.to_account_info(),
                    authority: ctx.accounts.forward_offer.to_account_info(),
                },
                signer_seeds,
            ),
            usdc_to_return,
        )?;

        ctx.accounts.forward_offer.is_active = false;

        emit!(ForwardCancelled { broker: ctx.accounts.broker.key(), usdc_returned: usdc_to_return });
        msg!("Forward offer cancelled, {} USDC returned", usdc_to_return);
        Ok(())
    }
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

fn accrue_sgrain_internal(vault: &mut SgrainVault) -> Result<()> {
    let now     = Clock::get()?.unix_timestamp;
    let elapsed = (now - vault.last_accrual_ts).max(0) as u128;
    if elapsed > 0 {
        let delta = vault.exchange_rate
            .checked_mul(SGRAIN_YIELD_PER_SECOND).ok_or(GrainChainError::MathOverflow)?
            .checked_mul(elapsed).ok_or(GrainChainError::MathOverflow)?
            .checked_div(RATE_SCALE).ok_or(GrainChainError::MathOverflow)?;
        vault.exchange_rate = vault.exchange_rate.checked_add(delta)
            .ok_or(GrainChainError::ExchangeRateOverflow)?;
        vault.last_accrual_ts = now;
    }
    Ok(())
}

fn accrue_carry_internal(vault: &mut CarryVault, now: i64, rate: u128) -> Result<()> {
    let elapsed = (now - vault.last_accrual_ts).max(0) as u128;
    if elapsed > 0 && rate > 0 {
        let delta = vault.exchange_rate
            .checked_mul(rate).ok_or(GrainChainError::ExchangeRateOverflow)?
            .checked_mul(elapsed).ok_or(GrainChainError::ExchangeRateOverflow)?
            .checked_div(RATE_SCALE).ok_or(GrainChainError::ExchangeRateOverflow)?;
        vault.exchange_rate = vault.exchange_rate.checked_add(delta)
            .ok_or(GrainChainError::ExchangeRateOverflow)?;
        if vault.total_cgrain_minted > 0 {
            let yield_grain = delta.checked_mul(vault.total_cgrain_minted as u128)
                .ok_or(GrainChainError::MathOverflow)?
                .checked_div(RATE_SCALE).ok_or(GrainChainError::MathOverflow)? as u64;
            vault.total_yield_distributed = vault.total_yield_distributed.saturating_add(yield_grain);
        }
    }
    vault.last_accrual_ts = now;
    Ok(())
}

// ─── Account Contexts ─────────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct InitializeProtocol<'info> {
    #[account(mut)] pub authority: Signer<'info>,
    #[account(init, payer = authority, space = ProtocolConfig::LEN, seeds = [b"protocol_config"], bump)]
    pub protocol_config: Account<'info, ProtocolConfig>,
    pub grain_mint:  Account<'info, Mint>,
    pub sgrain_mint: Account<'info, Mint>,
    pub cgrain_mint: Account<'info, Mint>,
    pub chain_mint:  Account<'info, Mint>,
    pub usdc_mint:   Account<'info, Mint>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(params: RegisterSiloParams)]
pub struct RegisterSilo<'info> {
    #[account(mut)] pub authority: Signer<'info>,
    #[account(constraint = protocol_config.authority == authority.key() @ GrainChainError::Unauthorized, seeds = [b"protocol_config"], bump = protocol_config.bump)]
    pub protocol_config: Account<'info, ProtocolConfig>,
    /// CHECK: operator pubkey
    pub operator: UncheckedAccount<'info>,
    #[account(init, payer = authority, space = SiloAccount::LEN, seeds = [b"silo", params.qoldau_id.as_ref()], bump)]
    pub silo_account: Account<'info, SiloAccount>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(params: MintReceiptParams)]
pub struct MintReceipt<'info> {
    #[account(mut)] pub oracle: Signer<'info>,
    /// CHECK: farmer who receives receipt
    pub farmer: UncheckedAccount<'info>,
    #[account(mut, seeds = [b"silo", silo_account.qoldau_id.as_ref()], bump = silo_account.bump)]
    pub silo_account: Account<'info, SiloAccount>,
    #[account(init, payer = oracle, space = GrainReceipt::LEN, seeds = [b"receipt", params.serial.as_ref()], bump)]
    pub grain_receipt: Account<'info, GrainReceipt>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Fractionalize<'info> {
    #[account(mut)] pub farmer: Signer<'info>,
    #[account(seeds = [b"protocol_config"], bump = protocol_config.bump)]
    pub protocol_config: Account<'info, ProtocolConfig>,
    #[account(mut, seeds = [b"receipt", grain_receipt.serial.as_ref()], bump = grain_receipt.bump, constraint = grain_receipt.farmer == farmer.key() @ GrainChainError::Unauthorized)]
    pub grain_receipt: Account<'info, GrainReceipt>,
    #[account(mut, address = protocol_config.grain_mint)]
    pub grain_mint: Account<'info, Mint>,
    #[account(mut, constraint = farmer_grain_account.owner == farmer.key())]
    pub farmer_grain_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct InitializeVault<'info> {
    #[account(mut)] pub authority: Signer<'info>,
    #[account(constraint = protocol_config.authority == authority.key() @ GrainChainError::Unauthorized, seeds = [b"protocol_config"], bump = protocol_config.bump)]
    pub protocol_config: Box<Account<'info, ProtocolConfig>>,
    #[account(init, payer = authority, space = LendingVault::LEN, seeds = [b"lending_vault"], bump)]
    pub lending_vault: Box<Account<'info, LendingVault>>,
    #[account(init, payer = authority, token::mint = usdc_mint, token::authority = lending_vault, seeds = [b"usdc_vault"], bump)]
    pub usdc_vault: Box<Account<'info, TokenAccount>>,
    #[account(address = protocol_config.usdc_mint)]
    pub usdc_mint: Box<Account<'info, Mint>>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct DepositUsdc<'info> {
    #[account(mut)] pub lender: Signer<'info>,
    #[account(mut, seeds = [b"lending_vault"], bump = lending_vault.bump)]
    pub lending_vault: Account<'info, LendingVault>,
    #[account(mut, seeds = [b"usdc_vault"], bump)]
    pub usdc_vault: Account<'info, TokenAccount>,
    #[account(mut, constraint = lender_usdc_account.owner == lender.key())]
    pub lender_usdc_account: Account<'info, TokenAccount>,
    #[account(init_if_needed, payer = lender, space = LenderPosition::LEN, seeds = [b"lender_position", lender.key().as_ref()], bump)]
    pub lender_position: Account<'info, LenderPosition>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Borrow<'info> {
    #[account(mut)] pub farmer: Signer<'info>,
    #[account(seeds = [b"protocol_config"], bump = protocol_config.bump)]
    pub protocol_config: Box<Account<'info, ProtocolConfig>>,
    #[account(mut, seeds = [b"lending_vault"], bump = lending_vault.bump)]
    pub lending_vault: Box<Account<'info, LendingVault>>,
    #[account(mut, seeds = [b"usdc_vault"], bump)]
    pub usdc_vault: Box<Account<'info, TokenAccount>>,
    #[account(mut, constraint = farmer_grain_account.owner == farmer.key())]
    pub farmer_grain_account: Box<Account<'info, TokenAccount>>,
    #[account(mut, constraint = farmer_usdc_account.owner == farmer.key())]
    pub farmer_usdc_account: Box<Account<'info, TokenAccount>>,
    #[account(init, payer = farmer, token::mint = grain_mint, token::authority = lending_vault, seeds = [b"collateral_escrow", farmer.key().as_ref()], bump)]
    pub collateral_escrow: Box<Account<'info, TokenAccount>>,
    #[account(init_if_needed, payer = farmer, space = LoanPosition::LEN, seeds = [b"loan_position", farmer.key().as_ref()], bump)]
    pub loan_position: Box<Account<'info, LoanPosition>>,
    #[account(address = protocol_config.grain_mint)]
    pub grain_mint: Box<Account<'info, Mint>>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Repay<'info> {
    #[account(mut)] pub farmer: Signer<'info>,
    #[account(mut, seeds = [b"lending_vault"], bump = lending_vault.bump)]
    pub lending_vault: Account<'info, LendingVault>,
    #[account(mut, seeds = [b"usdc_vault"], bump)]
    pub usdc_vault: Account<'info, TokenAccount>,
    #[account(mut, seeds = [b"collateral_escrow", farmer.key().as_ref()], bump)]
    pub collateral_escrow: Account<'info, TokenAccount>,
    #[account(mut, constraint = farmer_grain_account.owner == farmer.key())]
    pub farmer_grain_account: Account<'info, TokenAccount>,
    #[account(mut, constraint = farmer_usdc_account.owner == farmer.key())]
    pub farmer_usdc_account: Account<'info, TokenAccount>,
    #[account(mut, seeds = [b"loan_position", farmer.key().as_ref()], bump = loan_position.bump)]
    pub loan_position: Account<'info, LoanPosition>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct InitializeSgrainVault<'info> {
    #[account(mut)] pub authority: Signer<'info>,
    #[account(constraint = protocol_config.authority == authority.key() @ GrainChainError::Unauthorized, seeds = [b"protocol_config"], bump = protocol_config.bump)]
    pub protocol_config: Box<Account<'info, ProtocolConfig>>,
    #[account(init, payer = authority, space = SgrainVault::LEN, seeds = [b"sgrain_vault"], bump)]
    pub sgrain_vault: Box<Account<'info, SgrainVault>>,
    #[account(init, payer = authority, token::mint = grain_mint, token::authority = sgrain_vault, seeds = [b"grain_reserve"], bump)]
    pub grain_reserve: Box<Account<'info, TokenAccount>>,
    #[account(address = protocol_config.grain_mint)]
    pub grain_mint: Box<Account<'info, Mint>>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct DepositSgrain<'info> {
    #[account(mut)] pub user: Signer<'info>,
    #[account(seeds = [b"protocol_config"], bump = protocol_config.bump)]
    pub protocol_config: Box<Account<'info, ProtocolConfig>>,
    #[account(mut, seeds = [b"sgrain_vault"], bump = sgrain_vault.bump)]
    pub sgrain_vault: Box<Account<'info, SgrainVault>>,
    #[account(mut, seeds = [b"grain_reserve"], bump)]
    pub grain_reserve: Box<Account<'info, TokenAccount>>,
    #[account(mut, address = protocol_config.sgrain_mint)]
    pub sgrain_mint: Box<Account<'info, Mint>>,
    #[account(mut, constraint = user_grain_account.owner == user.key())]
    pub user_grain_account: Box<Account<'info, TokenAccount>>,
    #[account(mut, constraint = user_sgrain_account.owner == user.key())]
    pub user_sgrain_account: Box<Account<'info, TokenAccount>>,
    #[account(init_if_needed, payer = user, space = UserSgrainPosition::LEN, seeds = [b"sgrain_position", user.key().as_ref()], bump)]
    pub sgrain_position: Box<Account<'info, UserSgrainPosition>>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct WithdrawSgrain<'info> {
    #[account(mut)] pub user: Signer<'info>,
    #[account(seeds = [b"protocol_config"], bump = protocol_config.bump)]
    pub protocol_config: Account<'info, ProtocolConfig>,
    #[account(mut, seeds = [b"sgrain_vault"], bump = sgrain_vault.bump)]
    pub sgrain_vault: Account<'info, SgrainVault>,
    #[account(mut, seeds = [b"grain_reserve"], bump)]
    pub grain_reserve: Account<'info, TokenAccount>,
    #[account(mut, address = protocol_config.sgrain_mint)]
    pub sgrain_mint: Account<'info, Mint>,
    #[account(mut, constraint = user_grain_account.owner == user.key())]
    pub user_grain_account: Account<'info, TokenAccount>,
    #[account(mut, constraint = user_sgrain_account.owner == user.key())]
    pub user_sgrain_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct AccrueSgrainYield<'info> {
    pub crank: Signer<'info>,
    #[account(mut, seeds = [b"sgrain_vault"], bump = sgrain_vault.bump)]
    pub sgrain_vault: Account<'info, SgrainVault>,
}

#[derive(Accounts)]
pub struct InitializeCarryVault<'info> {
    #[account(mut)] pub authority: Signer<'info>,
    #[account(constraint = protocol_config.authority == authority.key() @ GrainChainError::Unauthorized, seeds = [b"protocol_config"], bump = protocol_config.bump)]
    pub protocol_config: Box<Account<'info, ProtocolConfig>>,
    #[account(init, payer = authority, space = CarryVault::LEN, seeds = [b"carry_vault"], bump)]
    pub carry_vault: Box<Account<'info, CarryVault>>,
    #[account(init, payer = authority, token::mint = grain_mint, token::authority = carry_vault, seeds = [b"carry_grain_reserve"], bump)]
    pub carry_grain_reserve: Box<Account<'info, TokenAccount>>,
    #[account(init, payer = authority, space = CarryOracleState::LEN, seeds = [b"carry_oracle"], bump)]
    pub carry_oracle: Box<Account<'info, CarryOracleState>>,
    #[account(address = protocol_config.grain_mint)]
    pub grain_mint: Box<Account<'info, Mint>>,
    #[account(address = protocol_config.cgrain_mint)]
    pub cgrain_mint: Box<Account<'info, Mint>>,
    /// CHECK: oracle signer pubkey
    pub oracle_authority: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct UpdateCarryOracle<'info> {
    pub oracle: Signer<'info>,
    #[account(mut, seeds = [b"carry_oracle"], bump = carry_oracle.bump, constraint = carry_oracle.authority == oracle.key() @ GrainChainError::Unauthorized)]
    pub carry_oracle: Account<'info, CarryOracleState>,
    #[account(mut, seeds = [b"carry_vault"], bump = carry_vault.bump)]
    pub carry_vault: Account<'info, CarryVault>,
}

#[derive(Accounts)]
pub struct AccrueCarryYield<'info> {
    pub crank: Signer<'info>,
    #[account(mut, seeds = [b"carry_vault"], bump = carry_vault.bump)]
    pub carry_vault: Account<'info, CarryVault>,
    #[account(seeds = [b"carry_oracle"], bump = carry_oracle.bump)]
    pub carry_oracle: Account<'info, CarryOracleState>,
}

#[derive(Accounts)]
pub struct EnterCarryPosition<'info> {
    #[account(mut)] pub user: Signer<'info>,
    #[account(seeds = [b"protocol_config"], bump = protocol_config.bump)]
    pub protocol_config: Box<Account<'info, ProtocolConfig>>,
    #[account(mut, seeds = [b"carry_vault"], bump = carry_vault.bump)]
    pub carry_vault: Box<Account<'info, CarryVault>>,
    #[account(seeds = [b"carry_oracle"], bump = carry_oracle.bump)]
    pub carry_oracle: Box<Account<'info, CarryOracleState>>,
    #[account(mut, seeds = [b"carry_grain_reserve"], bump)]
    pub carry_grain_reserve: Box<Account<'info, TokenAccount>>,
    #[account(mut, constraint = user_grain_account.owner == user.key())]
    pub user_grain_account: Box<Account<'info, TokenAccount>>,
    #[account(mut, address = protocol_config.cgrain_mint)]
    pub cgrain_mint: Box<Account<'info, Mint>>,
    #[account(mut, constraint = user_cgrain_account.owner == user.key())]
    pub user_cgrain_account: Box<Account<'info, TokenAccount>>,
    #[account(init_if_needed, payer = user, space = UserCarryPosition::LEN, seeds = [b"carry_position", user.key().as_ref()], bump)]
    pub carry_position: Box<Account<'info, UserCarryPosition>>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct ExitCarryPosition<'info> {
    #[account(mut)] pub user: Signer<'info>,
    #[account(seeds = [b"protocol_config"], bump = protocol_config.bump)]
    pub protocol_config: Box<Account<'info, ProtocolConfig>>,
    #[account(mut, seeds = [b"carry_vault"], bump = carry_vault.bump)]
    pub carry_vault: Box<Account<'info, CarryVault>>,
    #[account(seeds = [b"carry_oracle"], bump = carry_oracle.bump)]
    pub carry_oracle: Box<Account<'info, CarryOracleState>>,
    #[account(mut, seeds = [b"carry_grain_reserve"], bump)]
    pub carry_grain_reserve: Box<Account<'info, TokenAccount>>,
    #[account(mut, constraint = user_grain_account.owner == user.key())]
    pub user_grain_account: Box<Account<'info, TokenAccount>>,
    #[account(mut, address = protocol_config.cgrain_mint)]
    pub cgrain_mint: Box<Account<'info, Mint>>,
    #[account(mut, constraint = user_cgrain_account.owner == user.key())]
    pub user_cgrain_account: Box<Account<'info, TokenAccount>>,
    #[account(mut, seeds = [b"carry_position", user.key().as_ref()], bump = carry_position.bump, constraint = carry_position.user == user.key() @ GrainChainError::Unauthorized)]
    pub carry_position: Box<Account<'info, UserCarryPosition>>,
    pub token_program: Program<'info, Token>,
}

// ─── Forward Market Contexts ──────────────────────────────────────────────────

/// Broker posts an offer and locks USDC.
/// One active offer per broker (seeds = broker pubkey).
#[derive(Accounts)]
pub struct PostForwardOffer<'info> {
    #[account(mut)]
    pub broker: Signer<'info>,

    #[account(
        constraint = !protocol_config.is_paused @ GrainChainError::ProtocolPaused,
        seeds = [b"protocol_config"], bump = protocol_config.bump,
    )]
    pub protocol_config: Box<Account<'info, ProtocolConfig>>,

    #[account(
        init, payer = broker, space = ForwardOffer::LEN,
        seeds = [b"forward_offer", broker.key().as_ref()], bump,
    )]
    pub forward_offer: Box<Account<'info, ForwardOffer>>,

    /// Holds broker's locked USDC; authority = forward_offer PDA.
    #[account(
        init, payer = broker,
        token::mint = usdc_mint,
        token::authority = forward_offer,
        seeds = [b"forward_usdc_vault", broker.key().as_ref()], bump,
    )]
    pub forward_usdc_vault: Box<Account<'info, TokenAccount>>,

    #[account(mut, constraint = broker_usdc_account.owner == broker.key())]
    pub broker_usdc_account: Box<Account<'info, TokenAccount>>,

    #[account(address = protocol_config.usdc_mint)]
    pub usdc_mint: Box<Account<'info, Mint>>,

    pub token_program:  Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

/// Farmer accepts an offer and escrows GRAIN.
/// One contract per farmer–broker pair.
#[derive(Accounts)]
pub struct AcceptForwardOffer<'info> {
    #[account(mut)]
    pub farmer: Signer<'info>,

    #[account(
        constraint = !protocol_config.is_paused @ GrainChainError::ProtocolPaused,
        seeds = [b"protocol_config"], bump = protocol_config.bump,
    )]
    pub protocol_config: Box<Account<'info, ProtocolConfig>>,

    #[account(
        mut,
        seeds = [b"forward_offer", forward_offer.broker.as_ref()],
        bump = forward_offer.bump,
    )]
    pub forward_offer: Box<Account<'info, ForwardOffer>>,

    /// Holds farmer's escrowed GRAIN; authority = forward_offer PDA.
    #[account(
        init, payer = farmer,
        token::mint = grain_mint,
        token::authority = forward_offer,
        seeds = [b"forward_grain_escrow", farmer.key().as_ref(), forward_offer.broker.as_ref()], bump,
    )]
    pub forward_grain_escrow: Box<Account<'info, TokenAccount>>,

    #[account(
        init, payer = farmer, space = ForwardContract::LEN,
        seeds = [b"forward_contract", farmer.key().as_ref(), forward_offer.broker.as_ref()], bump,
    )]
    pub forward_contract: Box<Account<'info, ForwardContract>>,

    #[account(mut, constraint = farmer_grain_account.owner == farmer.key())]
    pub farmer_grain_account: Box<Account<'info, TokenAccount>>,

    #[account(address = protocol_config.grain_mint)]
    pub grain_mint: Box<Account<'info, Mint>>,

    pub token_program:  Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

/// Settles an expired contract atomically: GRAIN → broker, USDC → farmer.
/// Callable by anyone after expiry_ts (permissionless crank).
/// Pass farmer and broker as UncheckedAccounts for PDA derivation.
#[derive(Accounts)]
pub struct SettleForward<'info> {
    pub settler: Signer<'info>,

    /// CHECK: farmer pubkey for PDA derivation; validated via constraint on forward_contract
    pub farmer: UncheckedAccount<'info>,
    /// CHECK: broker pubkey for PDA derivation; validated via constraint on forward_offer
    pub broker: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [b"forward_offer", broker.key().as_ref()],
        bump = forward_offer.bump,
        constraint = forward_offer.broker == broker.key() @ GrainChainError::Unauthorized,
    )]
    pub forward_offer: Box<Account<'info, ForwardOffer>>,

    #[account(
        mut,
        seeds = [b"forward_contract", farmer.key().as_ref(), broker.key().as_ref()],
        bump = forward_contract.bump,
        constraint = forward_contract.farmer == farmer.key() @ GrainChainError::Unauthorized,
        constraint = forward_contract.broker == broker.key() @ GrainChainError::Unauthorized,
    )]
    pub forward_contract: Box<Account<'info, ForwardContract>>,

    #[account(mut, seeds = [b"forward_grain_escrow", farmer.key().as_ref(), broker.key().as_ref()], bump)]
    pub forward_grain_escrow: Box<Account<'info, TokenAccount>>,

    #[account(mut, seeds = [b"forward_usdc_vault", broker.key().as_ref()], bump)]
    pub forward_usdc_vault: Box<Account<'info, TokenAccount>>,

    #[account(mut, constraint = farmer_usdc_account.owner == farmer.key())]
    pub farmer_usdc_account: Box<Account<'info, TokenAccount>>,

    #[account(mut, constraint = broker_grain_account.owner == broker.key())]
    pub broker_grain_account: Box<Account<'info, TokenAccount>>,

    /// Used to record spot price at settlement (informational, not enforced).
    #[account(seeds = [b"carry_oracle"], bump = carry_oracle.bump)]
    pub carry_oracle: Box<Account<'info, CarryOracleState>>,

    pub token_program: Program<'info, Token>,
}

/// Broker cancels an unfilled offer and reclaims USDC.
#[derive(Accounts)]
pub struct CancelForwardOffer<'info> {
    #[account(mut)]
    pub broker: Signer<'info>,

    #[account(
        mut,
        seeds = [b"forward_offer", broker.key().as_ref()],
        bump = forward_offer.bump,
        constraint = forward_offer.broker == broker.key() @ GrainChainError::Unauthorized,
    )]
    pub forward_offer: Box<Account<'info, ForwardOffer>>,

    #[account(mut, seeds = [b"forward_usdc_vault", broker.key().as_ref()], bump)]
    pub forward_usdc_vault: Box<Account<'info, TokenAccount>>,

    #[account(mut, constraint = broker_usdc_account.owner == broker.key())]
    pub broker_usdc_account: Box<Account<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,
}
