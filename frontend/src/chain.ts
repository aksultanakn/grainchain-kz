// ─── GrainChain KZ — On-chain connection layer ────────────────────────────────
// Fill PROGRAM_ID and mint addresses from devnet-addresses.json after deploy.sh

import {
  Connection, PublicKey, SystemProgram, SYSVAR_CLOCK_PUBKEY,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress, TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID, getAccount,
} from "@solana/spl-token";
import { AnchorProvider, Program, BN, Idl } from "@coral-xyz/anchor";

// ─── FILL THESE IN after running `bash scripts/deploy.sh` ─────────────────────
export const PROGRAM_ID   = new PublicKey("4NutBXSNJ9tJLFueRwRd6PjQPzgricziys9uTBLuP8n7");
export const GRAIN_MINT   = new PublicKey("CLxFPnJp2xXVDLpKciAHwW13DQo8qQGKHYUdYXawkfy2");
export const SGRAIN_MINT  = new PublicKey("GNQkAbRkrnL2383dkGMcYcYpnXfsRCBMgtWycYfgVMAW");
export const CGRAIN_MINT  = new PublicKey("2cmjhBb2h922yYKxT8A5VfJbMn4kALcjxXVuyXyGoq2E");
export const CHAIN_MINT   = new PublicKey("11111111111111111111111111111111"); // not yet deployed
export const USDC_MINT    = new PublicKey("7gEJnKHRwHBhMMRUeRvJm7eV4LgAXyU2wduiEs6Prek8");
export const WHEAT_PYTH_FEED = new PublicKey("5ekPhCtu8X9YqBQuqoBCKfhGW7h4RcVNgxFmZCFbFpMJ");

export const RPC_URL = "https://api.devnet.solana.com";
export const EXPLORER = "https://explorer.solana.com";
export const CLUSTER  = "devnet";

// ─── PDA derivations ──────────────────────────────────────────────────────────
export const SEEDS = {
  protocolConfig:   Buffer.from("protocol_config"),
  lendingVault:     Buffer.from("lending_vault"),
  usdcVault:        Buffer.from("usdc_vault"),
  sgrainVault:      Buffer.from("sgrain_vault"),
  grainReserve:     Buffer.from("grain_reserve"),
  carryVault:       Buffer.from("carry_vault"),
  carryOracle:      Buffer.from("carry_oracle"),
  rewardsPool:      Buffer.from("rewards_pool"),
  receipt:          Buffer.from("receipt"),
  silo:             Buffer.from("silo"),
  collateralEscrow: Buffer.from("collateral_escrow"),
  loanPosition:     Buffer.from("loan_position"),
  lenderPosition:   Buffer.from("lender_position"),
  sgrainPosition:   Buffer.from("sgrain_position"),
  carryPosition:    Buffer.from("carry_position"),
  userRewards:      Buffer.from("user_rewards"),
};

export async function getProtocolConfigPDA() {
  return PublicKey.findProgramAddressSync([SEEDS.protocolConfig], PROGRAM_ID);
}
export async function getLendingVaultPDA() {
  return PublicKey.findProgramAddressSync([SEEDS.lendingVault], PROGRAM_ID);
}
export async function getSgrainVaultPDA() {
  return PublicKey.findProgramAddressSync([SEEDS.sgrainVault], PROGRAM_ID);
}
export async function getCarryVaultPDA() {
  return PublicKey.findProgramAddressSync([SEEDS.carryVault], PROGRAM_ID);
}
export async function getCarryOraclePDA() {
  return PublicKey.findProgramAddressSync([SEEDS.carryOracle], PROGRAM_ID);
}
export async function getRewardsPoolPDA() {
  return PublicKey.findProgramAddressSync([SEEDS.rewardsPool], PROGRAM_ID);
}
export async function getLoanPositionPDA(user: PublicKey) {
  return PublicKey.findProgramAddressSync([SEEDS.loanPosition, user.toBytes()], PROGRAM_ID);
}
export async function getCollateralEscrowPDA(user: PublicKey) {
  return PublicKey.findProgramAddressSync([SEEDS.collateralEscrow, user.toBytes()], PROGRAM_ID);
}
export async function getLenderPositionPDA(user: PublicKey) {
  return PublicKey.findProgramAddressSync([SEEDS.lenderPosition, user.toBytes()], PROGRAM_ID);
}
export async function getSgrainPositionPDA(user: PublicKey) {
  return PublicKey.findProgramAddressSync([SEEDS.sgrainPosition, user.toBytes()], PROGRAM_ID);
}
export async function getCarryPositionPDA(user: PublicKey) {
  return PublicKey.findProgramAddressSync([SEEDS.carryPosition, user.toBytes()], PROGRAM_ID);
}
export async function getUserRewardsPDA(user: PublicKey) {
  return PublicKey.findProgramAddressSync([SEEDS.userRewards, user.toBytes()], PROGRAM_ID);
}

// ─── Read all on-chain balances for a wallet ──────────────────────────────────
export interface OnChainWallet {
  sol:    number;
  usdc:   number;
  grain:  number;
  sgrain: number;
  cgrain: number;
  chain:  number;
}

export async function fetchWalletBalances(
  connection: Connection,
  user: PublicKey
): Promise<OnChainWallet> {
  try {
    const [sol, grainAta, sgrainAta, cgrainAta, chainAta, usdcAta] = await Promise.all([
      connection.getBalance(user),
      getAssociatedTokenAddress(GRAIN_MINT, user),
      getAssociatedTokenAddress(SGRAIN_MINT, user),
      getAssociatedTokenAddress(CGRAIN_MINT, user),
      getAssociatedTokenAddress(CHAIN_MINT, user),
      getAssociatedTokenAddress(USDC_MINT, user),
    ]);

    const fetchBal = async (ata: PublicKey) => {
      try {
        const acc = await getAccount(connection, ata);
        return Number(acc.amount);
      } catch { return 0; }
    };

    const [grain, sgrain, cgrain, chain, usdc] = await Promise.all([
      fetchBal(grainAta),
      fetchBal(sgrainAta),
      fetchBal(cgrainAta),
      fetchBal(chainAta),
      fetchBal(usdcAta),
    ]);

    return { sol: sol / 1e9, usdc, grain, sgrain, cgrain, chain };
  } catch (e) {
    console.error("fetchWalletBalances error:", e);
    return { sol: 0, usdc: 0, grain: 0, sgrain: 0, cgrain: 0, chain: 0 };
  }
}

// ─── Read sGRAIN vault exchange rate ─────────────────────────────────────────
export async function fetchSgrainRate(program: Program): Promise<number> {
  try {
    const [pda] = getSgrainVaultPDA() as unknown as [PublicKey, number];
    const vault = await (program.account as any).sgrainVault.fetch(pda);
    return Number(vault.exchangeRate);
  } catch { return 1_000_000_000; }
}

// ─── Read carry vault state ───────────────────────────────────────────────────
export interface CarryVaultState {
  exchangeRate:       number;
  carrySpreadBps:     number;
  annualizedApyBps:   number;
  isContango:         boolean;
  lastOracleUpdateTs: number;
}

export async function fetchCarryVaultState(program: Program): Promise<CarryVaultState> {
  try {
    const [vaultPda] = getCarryVaultPDA() as unknown as [PublicKey, number];
    const [oraclePda] = getCarryOraclePDA() as unknown as [PublicKey, number];
    const [vault, oracle] = await Promise.all([
      (program.account as any).carryVault.fetch(vaultPda),
      (program.account as any).carryOracleState.fetch(oraclePda),
    ]);
    return {
      exchangeRate:       Number(vault.exchangeRate),
      carrySpreadBps:     Number(oracle.carrySpreadBps),
      annualizedApyBps:   Number(oracle.annualizedApyBps),
      isContango:         oracle.isContango,
      lastOracleUpdateTs: Number(oracle.lastUpdateTs),
    };
  } catch {
    return { exchangeRate: 1_000_000_000, carrySpreadBps: 1480, annualizedApyBps: 1480, isContango: true, lastOracleUpdateTs: 0 };
  }
}

// ─── Read loan position ───────────────────────────────────────────────────────
export interface LoanState {
  active:          boolean;
  collateralGrain: number;
  principal:       number;
  accruedInterest: number;
  openedTs:        number;
}

export async function fetchLoanPosition(program: Program, user: PublicKey): Promise<LoanState> {
  try {
    const [pda] = getLoanPositionPDA(user) as unknown as [PublicKey, number];
    const pos = await (program.account as any).loanPosition.fetch(pda);
    return {
      active:          pos.isActive,
      collateralGrain: Number(pos.collateralGrainKg),
      principal:       Number(pos.principal),
      accruedInterest: Number(pos.accruedInterest),
      openedTs:        Number(pos.openedTs),
    };
  } catch {
    return { active: false, collateralGrain: 0, principal: 0, accruedInterest: 0, openedTs: 0 };
  }
}

// ─── Read lender position ─────────────────────────────────────────────────────
export async function fetchLenderPosition(program: Program, user: PublicKey) {
  try {
    const [pda] = getLenderPositionPDA(user) as unknown as [PublicKey, number];
    const pos = await (program.account as any).lenderPosition.fetch(pda);
    return { deposited: Number(pos.depositedAmount), earned: Number(pos.earnedInterest) };
  } catch {
    return { deposited: 0, earned: 0 };
  }
}

// ─── Read carry position ──────────────────────────────────────────────────────
export async function fetchCarryPosition(program: Program, user: PublicKey) {
  try {
    const [pda] = getCarryPositionPDA(user) as unknown as [PublicKey, number];
    const pos = await (program.account as any).userCarryPosition.fetch(pda);
    return { cgrain: Number(pos.cgrainBalance), entryRate: Number(pos.entryRate), entryTs: Number(pos.entryTs) };
  } catch {
    return { cgrain: 0, entryRate: 1_000_000_000, entryTs: 0 };
  }
}

// ─── Explorer link helpers ────────────────────────────────────────────────────
export const explorerTx  = (sig: string) => `${EXPLORER}/tx/${sig}?cluster=${CLUSTER}`;
export const explorerAddr = (addr: string) => `${EXPLORER}/address/${addr}?cluster=${CLUSTER}`;
