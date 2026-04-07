use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;


declare_id!("GRNchain1111111111111111111111111111111111111");

#[program]
pub mod grainchain {
    use super::*;

    // ─── Admin ────────────────────────────────────────────────────────────────

    /// Initialize the global protocol config (run once by deployer).
    pub fn initialize_protocol(
        ctx: Context<InitializeProtocol>,
        params: InitializeProtocolParams,
    ) -> Result<()> {
        instructions::admin::initialize_protocol(ctx, params)
    }

    /// Register a licensed Qoldau silo as an approved custodian.
    pub fn register_silo(
        ctx: Context<RegisterSilo>,
        params: RegisterSiloParams,
    ) -> Result<()> {
        instructions::admin::register_silo(ctx, params)
    }

    // ─── Receipt / Tokenization ────────────────────────────────────────────────

    /// Oracle posts a signed Qoldau receipt on-chain → mints a cNFT-style receipt PDA.
    pub fn mint_receipt(
        ctx: Context<MintReceipt>,
        params: MintReceiptParams,
    ) -> Result<()> {
        instructions::receipt::mint_receipt(ctx, params)
    }

    /// Farmer fractionalizes a receipt PDA into GRAIN SPL tokens (1 token = 1 kg).
    pub fn fractionalize(
        ctx: Context<Fractionalize>,
        amount_kg: u64,
    ) -> Result<()> {
        instructions::receipt::fractionalize(ctx, amount_kg)
    }

    /// Buyer redeems GRAIN tokens → burns them → unlocks physical grain at silo.
    pub fn redeem(
        ctx: Context<Redeem>,
        amount_kg: u64,
    ) -> Result<()> {
        instructions::receipt::redeem(ctx, amount_kg)
    }

    // ─── Lending ───────────────────────────────────────────────────────────────

    /// Initialize the USDC lending vault (one per protocol).
    pub fn initialize_vault(ctx: Context<InitializeVault>) -> Result<()> {
        instructions::lending::initialize_vault(ctx)
    }

    /// USDC lender deposits into the lending vault and receives yield tracking.
    pub fn deposit_usdc(
        ctx: Context<DepositUsdc>,
        amount: u64,
    ) -> Result<()> {
        instructions::lending::deposit_usdc(ctx, amount)
    }

    /// Lender withdraws USDC + accrued interest from the vault.
    pub fn withdraw_usdc(
        ctx: Context<WithdrawUsdc>,
        amount: u64,
    ) -> Result<()> {
        instructions::lending::withdraw_usdc(ctx, amount)
    }

    /// Farmer opens a GRAIN-collateralized USDC loan (60% LTV, Pyth price).
    pub fn borrow(
        ctx: Context<Borrow>,
        grain_collateral_kg: u64,
        usdc_requested: u64,
    ) -> Result<()> {
        instructions::lending::borrow(ctx, grain_collateral_kg, usdc_requested)
    }

    /// Farmer repays USDC loan + interest → GRAIN collateral unlocked.
    pub fn repay(
        ctx: Context<Repay>,
        usdc_repay_amount: u64,
    ) -> Result<()> {
        instructions::lending::repay(ctx, usdc_repay_amount)
    }

    /// Liquidate an undercollateralized position (callable by anyone, keeper bot).
    pub fn liquidate(ctx: Context<Liquidate>) -> Result<()> {
        instructions::lending::liquidate(ctx)
    }

    // ─── sGRAIN Savings Vault ─────────────────────────────────────────────────

    /// Initialize the sGRAIN yield vault (one per protocol).
    pub fn initialize_sgrain_vault(ctx: Context<InitializeSgrainVault>) -> Result<()> {
        instructions::sgrain::initialize_sgrain_vault(ctx)
    }

    /// Deposit GRAIN → receive sGRAIN yield-bearing tokens.
    pub fn deposit_sgrain(
        ctx: Context<DepositSgrain>,
        grain_amount: u64,
    ) -> Result<()> {
        instructions::sgrain::deposit_sgrain(ctx, grain_amount)
    }

    /// Withdraw sGRAIN → receive GRAIN at the current (higher) exchange rate.
    pub fn withdraw_sgrain(
        ctx: Context<WithdrawSgrain>,
        sgrain_amount: u64,
    ) -> Result<()> {
        instructions::sgrain::withdraw_sgrain(ctx, sgrain_amount)
    }

    /// Crank: update the sGRAIN/GRAIN exchange rate accumulator (permissionless).
    pub fn accrue_sgrain_yield(ctx: Context<AccrueSgrainYield>) -> Result<()> {
        instructions::sgrain::accrue_sgrain_yield(ctx)
    }

    // ─── CHAIN Governance Rewards ─────────────────────────────────────────────

    /// Initialize the CHAIN rewards program.
    pub fn initialize_rewards(
        ctx: Context<InitializeRewards>,
        params: InitializeRewardsParams,
    ) -> Result<()> {
        instructions::rewards::initialize_rewards(ctx, params)
    }

    /// Farmer claims pro-rata CHAIN governance tokens based on sGRAIN balance.
    pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
        instructions::rewards::claim_rewards(ctx)
    }

    // ─── Carry Yield Vault ────────────────────────────────────────────────────

    /// Initialize the carry vault + oracle state.
    pub fn initialize_carry_vault(ctx: Context<InitializeCarryVault>) -> Result<()> {
        instructions::carry::initialize_carry_vault(ctx)
    }

    /// Oracle posts current CME ZW Sep/Mar contango spread on-chain.
    pub fn update_carry_oracle(
        ctx: Context<UpdateCarryOracle>,
        params: UpdateCarryOracleParams,
    ) -> Result<()> {
        instructions::carry::update_carry_oracle(ctx, params)
    }

    /// Permissionless crank: tick the cGRAIN exchange rate using current carry spread.
    pub fn accrue_carry_yield(ctx: Context<AccrueCarryYield>) -> Result<()> {
        instructions::carry::accrue_carry_yield(ctx)
    }

    /// Deposit GRAIN → receive cGRAIN at current carry-enhanced exchange rate.
    pub fn enter_carry_position(
        ctx: Context<EnterCarryPosition>,
        grain_amount: u64,
    ) -> Result<()> {
        instructions::carry::enter_carry_position(ctx, grain_amount)
    }

    /// Burn cGRAIN → receive GRAIN at current (higher) exchange rate.
    pub fn exit_carry_position(
        ctx: Context<ExitCarryPosition>,
        cgrain_amount: u64,
    ) -> Result<()> {
        instructions::carry::exit_carry_position(ctx, cgrain_amount)
    }
}
