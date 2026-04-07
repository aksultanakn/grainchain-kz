// ─── GrainChain KZ — On-chain transactions ────────────────────────────────────
import { PublicKey, SystemProgram, SYSVAR_CLOCK_PUBKEY } from "@solana/web3.js";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAccount } from "@solana/spl-token";
import { Program, BN, AnchorProvider } from "@coral-xyz/anchor";
import {
  PROGRAM_ID, GRAIN_MINT, SGRAIN_MINT, CGRAIN_MINT, USDC_MINT, CHAIN_MINT,
  WHEAT_PYTH_FEED,
  getProtocolConfigPDA, getLendingVaultPDA, getSgrainVaultPDA,
  getCarryVaultPDA, getCarryOraclePDA, getRewardsPoolPDA,
  getLoanPositionPDA, getCollateralEscrowPDA, getLenderPositionPDA,
  getSgrainPositionPDA, getCarryPositionPDA, getUserRewardsPDA,
} from "./chain";

// Helper: ensure ATA exists, create if not
async function ensureAta(provider: AnchorProvider, mint: PublicKey, owner: PublicKey): Promise<PublicKey> {
  const ata = await getAssociatedTokenAddress(mint, owner);
  try {
    await getAccount(provider.connection, ata);
  } catch {
    const ix = createAssociatedTokenAccountInstruction(
      provider.wallet.publicKey, ata, owner, mint
    );
    const tx = new (await import("@solana/web3.js")).Transaction().add(ix);
    await provider.sendAndConfirm(tx);
  }
  return ata;
}

// ─── Fractionalize receipt → mint GRAIN tokens ────────────────────────────────
export async function txFractionalize(
  program: Program,
  provider: AnchorProvider,
  receiptPda: PublicKey,
  amountKg: number,
): Promise<string> {
  const user = provider.wallet.publicKey;
  const [protocolConfig] = getProtocolConfigPDA() as unknown as [PublicKey, number];
  const grainAta = await ensureAta(provider, GRAIN_MINT, user);

  const sig = await (program.methods as any)
    .fractionalize(new BN(amountKg))
    .accounts({
      farmer:         user,
      receipt:        receiptPda,
      protocolConfig,
      grainMint:      GRAIN_MINT,
      farmerGrainAta: grainAta,
      tokenProgram:   TOKEN_PROGRAM_ID,
    })
    .rpc();

  return sig;
}

// ─── Deposit USDC → lending vault ─────────────────────────────────────────────
export async function txDepositUsdc(
  program: Program,
  provider: AnchorProvider,
  amountUsdc: number, // in lamports (6 decimals)
): Promise<string> {
  const user = provider.wallet.publicKey;
  const [protocolConfig] = getProtocolConfigPDA() as unknown as [PublicKey, number];
  const [lendingVault]   = getLendingVaultPDA()   as unknown as [PublicKey, number];
  const usdcAta          = await getAssociatedTokenAddress(USDC_MINT, user);
  const [usdcVaultPda]   = PublicKey.findProgramAddressSync([Buffer.from("usdc_vault")], PROGRAM_ID);

  const sig = await (program.methods as any)
    .depositUsdc(new BN(amountUsdc))
    .accounts({
      lender:         user,
      lendingVault,
      protocolConfig,
      lenderUsdcAta:  usdcAta,
      usdcVault:      usdcVaultPda,
      usdcMint:       USDC_MINT,
      tokenProgram:   TOKEN_PROGRAM_ID,
      systemProgram:  SystemProgram.programId,
    })
    .rpc();

  return sig;
}

// ─── Borrow USDC against GRAIN collateral ─────────────────────────────────────
export async function txBorrow(
  program: Program,
  provider: AnchorProvider,
  grainCollateralKg: number,
  usdcRequested: number,
): Promise<string> {
  const user = provider.wallet.publicKey;
  const [protocolConfig]   = getProtocolConfigPDA()        as unknown as [PublicKey, number];
  const [lendingVault]     = getLendingVaultPDA()          as unknown as [PublicKey, number];
  const [loanPosition]     = getLoanPositionPDA(user)      as unknown as [PublicKey, number];
  const [collateralEscrow] = getCollateralEscrowPDA(user)  as unknown as [PublicKey, number];
  const [usdcVaultPda]     = PublicKey.findProgramAddressSync([Buffer.from("usdc_vault")], PROGRAM_ID);
  const grainAta           = await getAssociatedTokenAddress(GRAIN_MINT, user);
  const usdcAta            = await ensureAta(provider, USDC_MINT, user);

  const sig = await (program.methods as any)
    .borrow(new BN(grainCollateralKg), new BN(usdcRequested))
    .accounts({
      farmer:           user,
      loanPosition,
      lendingVault,
      protocolConfig,
      collateralEscrow,
      farmerGrainAta:   grainAta,
      farmerUsdcAta:    usdcAta,
      grainMint:        GRAIN_MINT,
      usdcMint:         USDC_MINT,
      usdcVault:        usdcVaultPda,
      pythPriceFeed:    WHEAT_PYTH_FEED,
      tokenProgram:     TOKEN_PROGRAM_ID,
      systemProgram:    SystemProgram.programId,
    })
    .rpc();

  return sig;
}

// ─── Repay USDC loan ──────────────────────────────────────────────────────────
export async function txRepay(
  program: Program,
  provider: AnchorProvider,
  usdcAmount: number,
): Promise<string> {
  const user = provider.wallet.publicKey;
  const [protocolConfig]   = getProtocolConfigPDA()       as unknown as [PublicKey, number];
  const [lendingVault]     = getLendingVaultPDA()         as unknown as [PublicKey, number];
  const [loanPosition]     = getLoanPositionPDA(user)     as unknown as [PublicKey, number];
  const [collateralEscrow] = getCollateralEscrowPDA(user) as unknown as [PublicKey, number];
  const [usdcVaultPda]     = PublicKey.findProgramAddressSync([Buffer.from("usdc_vault")], PROGRAM_ID);
  const grainAta           = await getAssociatedTokenAddress(GRAIN_MINT, user);
  const usdcAta            = await getAssociatedTokenAddress(USDC_MINT, user);

  const sig = await (program.methods as any)
    .repay(new BN(usdcAmount))
    .accounts({
      farmer:           user,
      loanPosition,
      lendingVault,
      protocolConfig,
      collateralEscrow,
      farmerGrainAta:   grainAta,
      farmerUsdcAta:    usdcAta,
      grainMint:        GRAIN_MINT,
      usdcVault:        usdcVaultPda,
      tokenProgram:     TOKEN_PROGRAM_ID,
    })
    .rpc();

  return sig;
}

// ─── Deposit GRAIN → sGRAIN vault ─────────────────────────────────────────────
export async function txDepositSgrain(
  program: Program,
  provider: AnchorProvider,
  grainAmount: number,
): Promise<string> {
  const user = provider.wallet.publicKey;
  const [protocolConfig] = getProtocolConfigPDA()    as unknown as [PublicKey, number];
  const [sgrainVault]    = getSgrainVaultPDA()       as unknown as [PublicKey, number];
  const [sgrainPosition] = getSgrainPositionPDA(user) as unknown as [PublicKey, number];
  const [grainReserve]   = PublicKey.findProgramAddressSync([Buffer.from("grain_reserve")], PROGRAM_ID);
  const grainAta         = await getAssociatedTokenAddress(GRAIN_MINT, user);
  const sgrainAta        = await ensureAta(provider, SGRAIN_MINT, user);

  const sig = await (program.methods as any)
    .depositSgrain(new BN(grainAmount))
    .accounts({
      user,
      sgrainVault,
      sgrainPosition,
      protocolConfig,
      grainReserve,
      userGrainAta:  grainAta,
      userSgrainAta: sgrainAta,
      grainMint:     GRAIN_MINT,
      sgrainMint:    SGRAIN_MINT,
      tokenProgram:  TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return sig;
}

// ─── Withdraw sGRAIN → GRAIN ──────────────────────────────────────────────────
export async function txWithdrawSgrain(
  program: Program,
  provider: AnchorProvider,
  sgrainAmount: number,
): Promise<string> {
  const user = provider.wallet.publicKey;
  const [protocolConfig] = getProtocolConfigPDA()     as unknown as [PublicKey, number];
  const [sgrainVault]    = getSgrainVaultPDA()        as unknown as [PublicKey, number];
  const [sgrainPosition] = getSgrainPositionPDA(user) as unknown as [PublicKey, number];
  const [grainReserve]   = PublicKey.findProgramAddressSync([Buffer.from("grain_reserve")], PROGRAM_ID);
  const grainAta         = await ensureAta(provider, GRAIN_MINT, user);
  const sgrainAta        = await getAssociatedTokenAddress(SGRAIN_MINT, user);

  const sig = await (program.methods as any)
    .withdrawSgrain(new BN(sgrainAmount))
    .accounts({
      user,
      sgrainVault,
      sgrainPosition,
      protocolConfig,
      grainReserve,
      userGrainAta:  grainAta,
      userSgrainAta: sgrainAta,
      grainMint:     GRAIN_MINT,
      sgrainMint:    SGRAIN_MINT,
      tokenProgram:  TOKEN_PROGRAM_ID,
    })
    .rpc();

  return sig;
}

// ─── Enter carry position: GRAIN → cGRAIN ─────────────────────────────────────
export async function txEnterCarry(
  program: Program,
  provider: AnchorProvider,
  grainAmount: number,
): Promise<string> {
  const user = provider.wallet.publicKey;
  const [protocolConfig] = getProtocolConfigPDA()     as unknown as [PublicKey, number];
  const [carryVault]     = getCarryVaultPDA()         as unknown as [PublicKey, number];
  const [carryOracle]    = getCarryOraclePDA()        as unknown as [PublicKey, number];
  const [carryPosition]  = getCarryPositionPDA(user)  as unknown as [PublicKey, number];
  const [carryReserve]   = PublicKey.findProgramAddressSync([Buffer.from("carry_grain_reserve")], PROGRAM_ID);
  const grainAta         = await getAssociatedTokenAddress(GRAIN_MINT, user);
  const cgrainAta        = await ensureAta(provider, CGRAIN_MINT, user);

  const sig = await (program.methods as any)
    .enterCarryPosition(new BN(grainAmount))
    .accounts({
      user,
      carryVault,
      carryOracle,
      carryPosition,
      protocolConfig,
      carryGrainReserve: carryReserve,
      userGrainAta:      grainAta,
      userCgrainAta:     cgrainAta,
      grainMint:         GRAIN_MINT,
      cgrainMint:        CGRAIN_MINT,
      tokenProgram:      TOKEN_PROGRAM_ID,
      systemProgram:     SystemProgram.programId,
    })
    .rpc();

  return sig;
}

// ─── Exit carry position: cGRAIN → GRAIN ──────────────────────────────────────
export async function txExitCarry(
  program: Program,
  provider: AnchorProvider,
  cgrainAmount: number,
): Promise<string> {
  const user = provider.wallet.publicKey;
  const [protocolConfig] = getProtocolConfigPDA()    as unknown as [PublicKey, number];
  const [carryVault]     = getCarryVaultPDA()        as unknown as [PublicKey, number];
  const [carryPosition]  = getCarryPositionPDA(user) as unknown as [PublicKey, number];
  const [carryReserve]   = PublicKey.findProgramAddressSync([Buffer.from("carry_grain_reserve")], PROGRAM_ID);
  const grainAta         = await ensureAta(provider, GRAIN_MINT, user);
  const cgrainAta        = await getAssociatedTokenAddress(CGRAIN_MINT, user);

  const sig = await (program.methods as any)
    .exitCarryPosition(new BN(cgrainAmount))
    .accounts({
      user,
      carryVault,
      carryPosition,
      protocolConfig,
      carryGrainReserve: carryReserve,
      userGrainAta:      grainAta,
      userCgrainAta:     cgrainAta,
      grainMint:         GRAIN_MINT,
      cgrainMint:        CGRAIN_MINT,
      tokenProgram:      TOKEN_PROGRAM_ID,
    })
    .rpc();

  return sig;
}

// ─── Claim CHAIN rewards ──────────────────────────────────────────────────────
export async function txClaimRewards(
  program: Program,
  provider: AnchorProvider,
): Promise<string> {
  const user = provider.wallet.publicKey;
  const [protocolConfig] = getProtocolConfigPDA()     as unknown as [PublicKey, number];
  const [rewardsPool]    = getRewardsPoolPDA()        as unknown as [PublicKey, number];
  const [sgrainPosition] = getSgrainPositionPDA(user) as unknown as [PublicKey, number];
  const [userRewards]    = getUserRewardsPDA(user)    as unknown as [PublicKey, number];
  const chainAta         = await ensureAta(provider, CHAIN_MINT, user);
  const [chainVault]     = PublicKey.findProgramAddressSync([Buffer.from("chain_vault")], PROGRAM_ID);

  const sig = await (program.methods as any)
    .claimRewards()
    .accounts({
      user,
      rewardsPool,
      sgrainPosition,
      userRewards,
      protocolConfig,
      chainVault,
      userChainAta:  chainAta,
      chainMint:     CHAIN_MINT,
      tokenProgram:  TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return sig;
}
