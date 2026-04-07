use anchor_lang::prelude::*;

pub const GRAIN_DECIMALS: u8 = 6;
pub const SGRAIN_DECIMALS: u8 = 6;
pub const CGRAIN_DECIMALS: u8 = 6;
pub const USDC_DECIMALS: u8 = 6;

pub const LTV_NUMERATOR: u64 = 60;
pub const LTV_DENOMINATOR: u64 = 100;
pub const LIQUIDATION_THRESHOLD: u64 = 80;
// ~11.2% APR per second: 0.112 / 31_536_000 * 1e9
pub const INTEREST_RATE_PER_SECOND: u128 = 356;
// ~3.2% APY per second: 0.032 / 31_536_000 * 1e9
pub const SGRAIN_YIELD_PER_SECOND: u128 = 101;
pub const SECONDS_PER_YEAR: u64 = 31_536_000;
pub const PRICE_STALENESS_THRESHOLD: i64 = 60;
pub const RATE_SCALE: u128 = 1_000_000_000;
pub const CARRY_ORACLE_STALENESS: i64 = 300; // 5 min max age

// ─── ProtocolConfig ───────────────────────────────────────────────────────────
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
impl ProtocolConfig {
    pub const LEN: usize = 8 + 32*6 + 1 + 1 + 1;
}

// ─── SiloAccount ─────────────────────────────────────────────────────────────
#[account]
pub struct SiloAccount {
    pub qoldau_id:       [u8; 32],
    pub name:            [u8; 64],
    pub region:          [u8; 32],
    pub operator:        Pubkey,
    pub capacity_kg:     u64,
    pub locked_kg:       u64,
    pub is_active:       bool,
    pub total_fees_paid: u64,
    pub bump:            u8,
}
impl SiloAccount {
    pub const LEN: usize = 8 + 32 + 64 + 32 + 32 + 8 + 8 + 1 + 8 + 1;
}

// ─── GrainReceipt ─────────────────────────────────────────────────────────────
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ReceiptStatus { Active, Fractionalized, Redeemed }

#[account]
pub struct GrainReceipt {
    pub serial:            [u8; 32],
    pub silo:              Pubkey,
    pub farmer:            Pubkey,
    pub amount_kg:         u64,
    pub fractionalized_kg: u64,
    pub redeemed_kg:       u64,
    pub grade:             u8,
    pub protein_bps:       u16,
    pub moisture_bps:      u16,
    pub harvest_ts:        i64,
    pub minted_ts:         i64,
    pub status:            ReceiptStatus,
    pub bump:              u8,
}
impl GrainReceipt {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 8*4 + 1 + 2 + 2 + 8 + 8 + 1 + 1;
}

// ─── LendingVault ─────────────────────────────────────────────────────────────
#[account]
pub struct LendingVault {
    pub protocol:               Pubkey,
    pub usdc_vault:             Pubkey,
    pub total_deposited:        u64,
    pub total_borrowed:         u64,
    pub total_interest_earned:  u64,
    pub last_accrual_ts:        i64,
    pub bump:                   u8,
}
impl LendingVault {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 8 + 8 + 8 + 1;
}

// ─── LenderPosition ───────────────────────────────────────────────────────────
#[account]
pub struct LenderPosition {
    pub lender:           Pubkey,
    pub deposited_amount: u64,
    pub earned_interest:  u64,
    pub last_update_ts:   i64,
    pub bump:             u8,
}
impl LenderPosition {
    pub const LEN: usize = 8 + 32 + 8 + 8 + 8 + 1;
}

// ─── LoanPosition ─────────────────────────────────────────────────────────────
#[account]
pub struct LoanPosition {
    pub borrower:             Pubkey,
    pub collateral_grain_kg:  u64,
    pub principal:            u64,
    pub accrued_interest:     u64,
    pub opened_ts:            i64,
    pub last_accrual_ts:      i64,
    pub interest_rate_bps:    u16,
    pub is_active:            bool,
    pub bump:                 u8,
}
impl LoanPosition {
    pub const LEN: usize = 8 + 32 + 8 + 8 + 8 + 8 + 8 + 2 + 1 + 1;
}

// ─── SgrainVault ──────────────────────────────────────────────────────────────
#[account]
pub struct SgrainVault {
    pub protocol:                Pubkey,
    pub grain_vault:             Pubkey,
    pub total_grain_deposited:   u64,
    pub total_sgrain_minted:     u64,
    pub exchange_rate:           u128,
    pub last_accrual_ts:         i64,
    pub total_yield_distributed: u64,
    pub bump:                    u8,
}
impl SgrainVault {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 8 + 16 + 8 + 8 + 1;
}

// ─── UserSgrainPosition ───────────────────────────────────────────────────────
#[account]
pub struct UserSgrainPosition {
    pub user:            Pubkey,
    pub sgrain_balance:  u64,
    pub entry_rate:      u128,
    pub last_update_ts:  i64,
    pub rewards_claimed: u64,
    pub bump:            u8,
}
impl UserSgrainPosition {
    pub const LEN: usize = 8 + 32 + 8 + 16 + 8 + 8 + 1;
}

// ─── CarryOracleState ─────────────────────────────────────────────────────────
#[account]
pub struct CarryOracleState {
    pub authority:           Pubkey,
    pub spot_price_raw:      i64,
    pub futures_price_raw:   i64,
    pub carry_spread_bps:    i64,   // (futures-spot)/spot * 10000, signed
    pub annualized_apy_bps:  u64,   // absolute APY in basis points
    pub last_update_ts:      i64,
    pub is_contango:         bool,
    pub price_expo:          i32,
    pub bump:                u8,
}
impl CarryOracleState {
    pub const LEN: usize = 8 + 32 + 8 + 8 + 8 + 8 + 8 + 1 + 4 + 1;
}

// ─── CarryVault ───────────────────────────────────────────────────────────────
#[account]
pub struct CarryVault {
    pub protocol:                  Pubkey,
    pub grain_reserve:             Pubkey,
    pub oracle:                    Pubkey,
    pub total_grain_deposited:     u64,
    pub total_cgrain_minted:       u64,
    /// cGRAIN/GRAIN exchange rate × RATE_SCALE. Starts at 1e9, only increases.
    pub exchange_rate:             u128,
    /// Per-second accrual derived from oracle carry_spread_bps
    pub carry_rate_per_second:     u128,
    pub last_accrual_ts:           i64,
    pub last_oracle_update_ts:     i64,
    pub current_carry_spread_bps:  i64,
    pub total_yield_distributed:   u64,
    pub bump:                      u8,
}
impl CarryVault {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 8 + 8 + 16 + 16 + 8 + 8 + 8 + 8 + 1;
}

// ─── UserCarryPosition ────────────────────────────────────────────────────────
#[account]
pub struct UserCarryPosition {
    pub user:                    Pubkey,
    pub cgrain_balance:          u64,
    pub entry_rate:              u128,
    pub entry_spread_bps:        i64,
    pub entry_ts:                i64,
    pub last_update_ts:          i64,
    pub bump:                    u8,
}
impl UserCarryPosition {
    pub const LEN: usize = 8 + 32 + 8 + 16 + 8 + 8 + 8 + 1;
}

// ─── RewardsPool ──────────────────────────────────────────────────────────────
#[account]
pub struct RewardsPool {
    pub protocol:                  Pubkey,
    pub total_chain_allocated:     u64,
    pub total_chain_distributed:   u64,
    pub emission_rate:             u64,
    pub start_ts:                  i64,
    pub end_ts:                    i64,
    pub reward_per_token_stored:   u128,
    pub last_update_ts:            i64,
    pub total_sgrain_staked:       u64,
    pub bump:                      u8,
}
impl RewardsPool {
    pub const LEN: usize = 8 + 32 + 8 + 8 + 8 + 8 + 8 + 16 + 8 + 8 + 1;
}

// ─── UserRewardAccount ────────────────────────────────────────────────────────
#[account]
pub struct UserRewardAccount {
    pub user:                  Pubkey,
    pub reward_per_token_paid: u128,
    pub rewards_pending:       u64,
    pub total_claimed:         u64,
    pub last_claim_ts:         i64,
    pub bump:                  u8,
}
impl UserRewardAccount {
    pub const LEN: usize = 8 + 32 + 16 + 8 + 8 + 8 + 1;
}
