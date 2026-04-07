# 🌾 GrainChain KZ

> **Tokenized Kazakh grain warehouse receipts on Solana.**  
> Built for [Decentrathon 2026](https://colosseum.com) — National Solana Hackathon.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-grainchain--kz.vercel.app-brightgreen?style=for-the-badge)](https://grainchain-kz.vercel.app)
[![Solana Testnet](https://img.shields.io/badge/Solana-Testnet-9945FF?style=for-the-badge&logo=solana)](https://explorer.solana.com/?cluster=testnet)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

---

## What is GrainChain KZ?

Kazakhstan is the world's 11th largest wheat producer. Every harvest season, farmers sell at seasonal lows — forced by cash flow needs — only to watch prices rise through winter. GrainChain KZ fixes this.

**Farmers deposit wheat at licensed silos → mint GRAIN SPL tokens (1 token = 1 kg) → borrow USDC at 60% LTV, sell P2P, or deposit into yield vaults. Lenders earn 8–14% APY.**

The Carry Vault captures the CME ZW March futures contango spread (~18.4% avg 2005–2024), letting farmers earn while they wait for better prices.

---

## Live Addresses (Solana Testnet)

> Fill these in after running `bash scripts/deploy.sh`

| Account | Address |
|---------|---------|
| Program ID | `(run deploy.sh)` |
| GRAIN Mint | `(run deploy.sh)` |
| sGRAIN Vault | `(run deploy.sh)` |
| cGRAIN Carry Vault | `(run deploy.sh)` |
| USDC Mint (mock) | `(run deploy.sh)` |

Explorer: `https://explorer.solana.com/?cluster=testnet`

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        GrainChain KZ                        │
├─────────────┬──────────────┬──────────────┬─────────────────┤
│   Farmers   │    Market    │   Lenders    │  Carry Vault    │
│             │              │              │                 │
│ Mint GRAIN  │  P2P trade   │ Deposit USDC │ Lock GRAIN for  │
│ Borrow USDC │  GRAIN lots  │ Earn 8-14%   │ futures carry   │
│ 60% LTV     │  at oracle   │ APY          │ ~18% APY        │
│             │  price       │              │ (ZW contango)   │
└──────┬──────┴──────┬───────┴──────┬───────┴────────┬────────┘
       │             │              │                │
       └─────────────┴──────────────┴────────────────┘
                              │
                    ┌─────────▼────────┐
                    │  Solana Testnet  │
                    │  Anchor 0.30.1   │
                    │  SPL Token Ext.  │
                    │  Pyth Oracle     │
                    └──────────────────┘
```

### Token Mechanics

| Token | Description | Supply |
|-------|-------------|--------|
| **GRAIN** | 1 token = 1 kg wheat. Minted on silo deposit, burned on redemption. | Dynamic |
| **sGRAIN** | Yield-bearing vault token. Accrues 3.2% APY storage fee yield. | Dynamic |
| **cGRAIN** | Carry vault token. Accrues ~15–20% APY from CME futures contango. | Dynamic |
| **CHAIN** | Governance token. Earned by protocol participants. | 10M fixed |

### Key Constants

```rust
GRAIN_DECIMALS           = 6        // 1 GRAIN = 1_000_000 lamports = 1 kg
LTV_NUMERATOR            = 60       // 60% LTV for USDC loans
LIQUIDATION_THRESHOLD    = 80       // Liquidate if collateral < 80% LTV
INTEREST_RATE_PER_SECOND = 356      // ~11.2% APR
SGRAIN_YIELD_PER_SECOND  = 101      // ~3.2% APY
RATE_SCALE               = 1_000_000_000  // 1e9 exchange rate precision
```

---

## Smart Contract Structure

```
programs/grainchain/src/
├── lib.rs              # Program entry, all instruction routing
├── state.rs            # Account structs (sizes pre-calculated)
├── errors.rs           # 30 typed GrainChainError variants
└── instructions/
    ├── admin.rs        # initialize_protocol, register_silo
    ├── receipt.rs      # mint_receipt, fractionalize, redeem
    ├── lending.rs      # deposit_usdc, withdraw_usdc, borrow, repay, liquidate
    ├── sgrain.rs       # deposit_sgrain, withdraw_sgrain, accrue_sgrain_yield
    ├── carry.rs        # initialize_carry_vault, enter/exit_carry_position, accrue_carry_yield
    └── rewards.rs      # initialize_rewards, claim_rewards
```

### PDA Seeds

```
protocol_config     [b"protocol_config"]
silo_account        [b"silo", qoldau_id_bytes]
grain_receipt       [b"receipt", serial_bytes]
lending_vault       [b"lending_vault"]
usdc_vault          [b"usdc_vault"]
collateral_escrow   [b"collateral_escrow", farmer_pubkey]
loan_position       [b"loan_position", farmer_pubkey]
lender_position     [b"lender_position", lender_pubkey]
sgrain_vault        [b"sgrain_vault"]
grain_reserve       [b"grain_reserve"]
sgrain_position     [b"sgrain_position", user_pubkey]
carry_vault         [b"carry_vault"]
carry_position      [b"carry_position", user_pubkey]
rewards_pool        [b"rewards_pool"]
user_rewards        [b"user_rewards", user_pubkey]
```

---

## Carry Yield Strategy

KZ spring wheat harvests Aug–Sep at seasonal price lows. CME ZW March futures trade at a premium (contango). Historical Sep→Mar spread: **avg +18.4% (2005–2024), positive in 16/20 years**.

```
1. Physical GRAIN held in licensed silo (already happening)
2. Sell synthetic deferred forward at harvest (lock in carry)
3. cGRAIN exchange rate accrues carry spread / (365/180) per second
4. Exit in March: more GRAIN + USDC carry yield returned
```

The Carry Oracle reads Pyth ZW1! spot AND ZW March futures price:
```
Carry spread = (futures_price - spot_price) / spot_price  [annualized]
```

**Pyth Testnet Feeds:**
- ZW1! (spot/near-month): `5ekPhCtu8X9YqBQuqoBCKfhGW7h4RcVNgxFmZCFbFpMJ`
- ZW March futures: See [Pyth Price Feed IDs](https://pyth.network/developers/price-feed-ids)

---

## Legal Context (Kazakhstan)

| | |
|-|-|
| 📜 **Kazakhstan Law on Grain (2001)** | Grain receipts are legal financial instruments |
| ✅ **2022 Amendment** | Digital tokens legally replace paper receipts |
| 🏛️ **AIFC** | English common law, 0% VAT, Fintech Lab sandbox |
| 🌐 **Qoldau.kz** | Government grain registry — 192 licensed silos |
| 🚀 **Kostanay Pilot (Sep 2025)** | Ministry of AI + AIFC blockchain grain program |

GrainChain KZ is the Solana-native implementation of what the government is actively building toward.

---

## Quick Start

### Prerequisites

- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools) ≥ 1.18
- [Anchor CLI](https://www.anchor-lang.com/docs/installation) 0.30.1
- [Node.js](https://nodejs.org) ≥ 18
- [Yarn](https://yarnpkg.com)

### Deploy to Testnet

```bash
# 1. Clone the repo
git clone https://github.com/aksultanakn/grainchain-kz.git
cd grainchain-kz

# 2. Install dependencies
yarn install

# 3. Configure Solana for testnet
solana config set --url https://api.testnet.solana.com

# 4. Airdrop SOL (testnet)
solana airdrop 2

# 5. Full deployment (builds, deploys, creates mints)
bash scripts/deploy.sh

# 6. Initialize PDAs
yarn init

# 7. Seed demo data (3 receipts, 50k USDC, sGRAIN state)
yarn seed

# 8. Create judge wallets
yarn wallets
```

### Run the Demo

```bash
# Full 9-step end-to-end demo
yarn demo

# Keep yield ticking during presentation (run in parallel)
yarn crank --interval 10
yarn carry-oracle --interval 15
```

### Frontend

```bash
cd frontend
yarn install
yarn dev
# → http://localhost:5173
```

---

## Judge Testing

After running `bash scripts/deploy.sh` + `yarn wallets`:

1. Open `judge-wallets.json` for public addresses
2. Import any private key from `judge-wallets-private.json` into Phantom
3. Set Phantom to **Testnet** mode
4. Visit the live demo: **[grainchain-kz.vercel.app](https://grainchain-kz.vercel.app)**

**Demo flow:**
1. 🌾 **Farmer tab** — Mint a GRAIN receipt (simulates silo deposit)
2. 💰 **Farmer tab** → Borrow USDC at 60% LTV (Pyth oracle prices)
3. 📈 **Market tab** — Buy/sell GRAIN lots P2P
4. 🏦 **Lender tab** — Deposit USDC, earn 8–14% APY
5. ⚡ **Carry Vault tab** — Enter carry position, watch cGRAIN rate tick

```bash
# Verify on-chain state
solana account <sgrain_vault_address> --url testnet   # sGRAIN exchange rate
solana account <carry_vault_address> --url testnet    # cGRAIN rate (higher)
```

---

## Scripts Reference

| Script | Description |
|--------|-------------|
| `bash scripts/deploy.sh` | Full testnet deployment |
| `yarn init` | Initialize all PDAs on-chain |
| `yarn seed` | Seed 3 receipts + 50k USDC + sGRAIN |
| `yarn wallets` | Create 5 funded judge wallets |
| `yarn demo` | Full 9-step end-to-end demo |
| `yarn crank` | Keep sGRAIN rate ticking |
| `yarn carry-oracle` | Post carry rate from Pyth spread |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Blockchain | Solana (Testnet) |
| Smart Contracts | Anchor 0.30.1 (Rust) |
| Tokens | SPL Token + Token Extensions |
| Oracle | Pyth Network (ZW1! CME Wheat) |
| Frontend | React 18 + Vite + TypeScript |
| Wallet | Phantom |
| Hosting | Vercel |

---

## Team

Built in Kazakhstan for the Decentrathon 2026 National Solana Hackathon.

---

## License

MIT © 2026 GrainChain KZ
