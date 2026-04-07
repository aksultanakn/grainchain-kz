#!/usr/bin/env bash
# =============================================================================
# GrainChain KZ — Testnet Setup & Deployment Script
# Run this once to bootstrap the full protocol on Solana testnet
# =============================================================================

set -e  # exit on error
set -u  # exit on undefined variable

# ── Colors for output ────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; NC='\033[0m'
info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[OK]${NC} $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
header()  { echo -e "\n${CYAN}══════════════════════════════════════════${NC}"; echo -e "${CYAN}  $1${NC}"; echo -e "${CYAN}══════════════════════════════════════════${NC}"; }

# ── Config ───────────────────────────────────────────────────────────────────
NETWORK="testnet"
RPC_URL="https://api.testnet.solana.com"
KEYPAIR_PATH="$HOME/.config/solana/id.json"
PROGRAM_KEYPAIR="target/deploy/grainchain-keypair.json"
OUTPUT_FILE="testnet-addresses.json"

# Pyth testnet ZW1! wheat price feed (CBOT Wheat Futures)
# See: https://pyth.network/developers/price-feed-ids
PYTH_WHEAT_FEED="5ekPhCtu8X9YqBQuqoBCKfhGW7h4RcVNgxFmZCFbFpMJ"

header "GrainChain KZ — Testnet Deployment"
echo ""

# ── Step 1: Verify tools ─────────────────────────────────────────────────────
header "Step 1: Verifying tools"
command -v solana  >/dev/null 2>&1 || { echo "Install Solana CLI first"; exit 1; }
command -v anchor  >/dev/null 2>&1 || { echo "Install Anchor CLI first"; exit 1; }
command -v spl-token >/dev/null 2>&1 || cargo install spl-token-cli

success "solana:    $(solana --version)"
success "anchor:    $(anchor --version)"

# ── Step 2: Configure network ────────────────────────────────────────────────
header "Step 2: Configuring network"
solana config set --url $RPC_URL --keypair $KEYPAIR_PATH
info "Network: $NETWORK"
info "RPC: $RPC_URL"
ADMIN_PUBKEY=$(solana address)
success "Admin wallet: $ADMIN_PUBKEY"

# ── Step 3: Fund wallet ───────────────────────────────────────────────────────
header "Step 3: Funding admin wallet"
BALANCE=$(solana balance --lamports | awk '{print $1}')
info "Current balance: $(echo "scale=4; $BALANCE/1000000000" | bc) SOL"
if [ "$BALANCE" -lt 3000000000 ]; then
    info "Balance low — requesting airdrops..."
    solana airdrop 2 || warn "Airdrop may have failed (rate limited), try again in 30s"
    sleep 5
    solana airdrop 2 || warn "Second airdrop failed"
    sleep 5
fi
BALANCE=$(solana balance --lamports | awk '{print $1}')
success "Balance after airdrop: $(echo "scale=4; $BALANCE/1000000000" | bc) SOL"

# ── Step 4: Build program ─────────────────────────────────────────────────────
header "Step 4: Building Anchor program"
anchor build
success "Build complete"

# Get the program ID from the keypair
PROGRAM_ID=$(solana-keygen pubkey $PROGRAM_KEYPAIR)
info "Program ID: $PROGRAM_ID"

# Update declare_id! in lib.rs and Anchor.toml
sed -i.bak "s/GRNchain1111111111111111111111111111111111111/$PROGRAM_ID/g" \
    programs/grainchain/src/lib.rs Anchor.toml
info "Updated program ID in source files"

# Rebuild with correct program ID
anchor build
success "Rebuild complete with correct program ID"

# ── Step 5: Deploy program ────────────────────────────────────────────────────
header "Step 5: Deploying program to testnet"
anchor deploy --provider.cluster $NETWORK
success "Program deployed: $PROGRAM_ID"
info "Explorer: https://explorer.solana.com/address/$PROGRAM_ID?cluster=testnet"

# ── Step 6: Create token mints ────────────────────────────────────────────────
header "Step 6: Creating SPL token mints"

info "Creating GRAIN mint (6 decimals)..."
GRAIN_MINT=$(spl-token create-token --decimals 6 | grep "Creating token" | awk '{print $3}')
success "GRAIN mint: $GRAIN_MINT"

info "Creating sGRAIN mint (6 decimals)..."
SGRAIN_MINT=$(spl-token create-token --decimals 6 | grep "Creating token" | awk '{print $3}')
success "sGRAIN mint: $SGRAIN_MINT"

info "Creating CHAIN mint (6 decimals)..."
CHAIN_MINT=$(spl-token create-token --decimals 6 | grep "Creating token" | awk '{print $3}')
success "CHAIN mint: $CHAIN_MINT"

# For testnet: use a mock USDC mint we control
# On mainnet this would be: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
info "Creating mock USDC mint (6 decimals)..."
USDC_MINT=$(spl-token create-token --decimals 6 | grep "Creating token" | awk '{print $3}')
success "Mock USDC mint: $USDC_MINT"
warn "NOTE: Using mock USDC for testnet. Mainnet uses Circle's USDC."

# ── Step 7: Create admin token accounts ──────────────────────────────────────
header "Step 7: Creating admin token accounts"
ADMIN_GRAIN=$(spl-token create-account $GRAIN_MINT | grep "Creating account" | awk '{print $3}')
ADMIN_SGRAIN=$(spl-token create-account $SGRAIN_MINT | grep "Creating account" | awk '{print $3}')
ADMIN_CHAIN=$(spl-token create-account $CHAIN_MINT | grep "Creating account" | awk '{print $3}')
ADMIN_USDC=$(spl-token create-account $USDC_MINT | grep "Creating account" | awk '{print $3}')
success "Admin token accounts created"

# ── Step 8: Mint initial supply for testing ───────────────────────────────────
header "Step 8: Minting initial test supply"

# Mint mock USDC for lenders (100M USDC = enough for demo)
info "Minting 100,000,000 mock USDC for demo pool..."
spl-token mint $USDC_MINT 100000000 $ADMIN_USDC
success "100M mock USDC minted"

# Mint initial CHAIN supply (10M for rewards program)
info "Minting 10,000,000 CHAIN governance tokens..."
spl-token mint $CHAIN_MINT 10000000 $ADMIN_CHAIN
success "10M CHAIN minted"

echo ""
info "Mints created. Now run the initialization script (init-protocol.ts)"

# ── Step 9: Save all addresses ────────────────────────────────────────────────
header "Step 9: Saving addresses to $OUTPUT_FILE"

cat > $OUTPUT_FILE << EOF
{
  "network": "$NETWORK",
  "rpc": "$RPC_URL",
  "deployedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "programId": "$PROGRAM_ID",
  "admin": "$ADMIN_PUBKEY",
  "mints": {
    "grain": "$GRAIN_MINT",
    "sgrain": "$SGRAIN_MINT",
    "chain": "$CHAIN_MINT",
    "usdc": "$USDC_MINT"
  },
  "oracles": {
    "wheatPythFeed": "$PYTH_WHEAT_FEED"
  },
  "adminTokenAccounts": {
    "grain": "$ADMIN_GRAIN",
    "sgrain": "$ADMIN_SGRAIN",
    "chain": "$ADMIN_CHAIN",
    "usdc": "$ADMIN_USDC"
  },
  "explorerLinks": {
    "program": "https://explorer.solana.com/address/$PROGRAM_ID?cluster=testnet",
    "grainMint": "https://explorer.solana.com/address/$GRAIN_MINT?cluster=testnet",
    "usdcMint": "https://explorer.solana.com/address/$USDC_MINT?cluster=testnet"
  }
}
EOF

success "Addresses saved to $OUTPUT_FILE"
cat $OUTPUT_FILE

header "Deployment complete!"
echo -e "Next step: run ${CYAN}npx ts-node scripts/init-protocol.ts${NC}"
echo -e "Then:      run ${CYAN}npx ts-node scripts/seed-demo-data.ts${NC}"
echo -e "Then:      run ${CYAN}npx ts-node scripts/create-judge-wallets.ts${NC}"
