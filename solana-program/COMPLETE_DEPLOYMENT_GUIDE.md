# 🚀 Complete Plugumons Staking Deployment Guide

## 📦 What's Been Built

Your complete **non-custodial Solana staking smart contract** with:

✅ **Core Features:**
- Stake PLUGU tokens with 3 lock periods (30/90/365 days)
- APR: 5%/10%/20% based on lock period
- NFT holder benefits: No lock + 2x APR multiplier at halfway point
- Grid power system: 2x all APRs when 200M PLUGU staked
- On-chain NFT verification (mint: `4Qy6grGLpMBk2q13tPt32UkCzahWCSLEBLbRvHoyBcTvHCZYket`)
- Automatic reward calculation
- Secure unstaking with lock enforcement

✅ **Smart Contract Structure:**
```
solana-program/
├── Anchor.toml              # Anchor configuration
├── Cargo.toml               # Workspace manifest
├── programs/
│   └── plugumons-staking/
│       ├── Cargo.toml       # Program manifest
│       └── src/
│           └── lib.rs       # Smart contract code
├── scripts/
│   ├── initialize.ts        # Pool initialization script
│   └── fund-pool.ts         # Reward funding script
├── package.json             # Node dependencies
└── tsconfig.json            # TypeScript config
```

---

## 🛠️ Prerequisites Installation

### 1. Install Rust
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
rustc --version  # Verify installation
```

### 2. Install Solana CLI
```bash
sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
solana --version  # Verify installation
```

### 3. Install Anchor Framework
```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install 0.29.0
avm use 0.29.0
anchor --version  # Verify installation
```

### 4. Install Node Dependencies
```bash
cd solana-program
yarn install
# or
npm install
```

---

## 🔑 Wallet Setup

### Create/Import Your Deployer Wallet
```bash
# Option 1: Create new wallet
solana-keygen new --outfile ~/.config/solana/id.json

# Option 2: Import existing (if you have devnet keypair)
# Copy your keypair JSON to ~/.config/solana/id.json

# Verify wallet
solana address
solana balance
```

---

## 🧪 Phase 1: Devnet Testing

### Step 1: Configure for Devnet
```bash
# Set Solana to devnet
solana config set --url devnet

# Update Anchor.toml
# Change: cluster = "Mainnet" → cluster = "Devnet"

# Get free devnet SOL
solana airdrop 2
solana airdrop 2
solana balance  # Should show ~4 SOL
```

### Step 2: Build the Program
```bash
cd solana-program

# Clean build
anchor clean

# Build program
anchor build

# This creates:
# - target/deploy/plugumons_staking.so (compiled program)
# - target/idl/plugumons_staking.json (interface definition)
```

### Step 3: Get Your Program ID
```bash
solana address -k target/deploy/plugumons_staking-keypair.json

# Example output: Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
```

### Step 4: Update Program ID in Code
```bash
# Update lib.rs
# Line 4: declare_id!("YOUR_PROGRAM_ID_HERE");

# Update Anchor.toml
# [programs.devnet]
# plugumons_staking = "YOUR_PROGRAM_ID_HERE"

# Rebuild after changing ID
anchor build
```

### Step 5: Deploy to Devnet
```bash
anchor deploy --provider.cluster devnet

# Expected output:
# ✅ Program deployed successfully
# 📍 Program Id: Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
```

### Step 6: Initialize Staking Pool
```bash
# Run initialization script
anchor run initialize

# This will:
# ✅ Create staking pool PDA
# ✅ Create pool token account
# ✅ Initialize pool state
```

### Step 7: Fund Pool with Test PLUGU Tokens
```bash
# First, ensure you have PLUGU tokens in your wallet on devnet
# For testing, you might need to create a test token mint

# Then run:
anchor run fund-pool

# This transfers PLUGU tokens to the pool for rewards
```

### Step 8: Test Staking Functions
Create a test file or use Anchor tests:
```bash
anchor test --provider.cluster devnet

# Tests should verify:
# ✅ Stake function works
# ✅ NFT verification works
# ✅ Reward calculation correct
# ✅ Claim rewards works
# ✅ Unstake with lock enforcement works
```

---

## 🌐 Phase 2: Mainnet Deployment

### Step 1: Switch to Mainnet
```bash
solana config set --url mainnet-beta

# Check balance (need 5-10 SOL)
solana balance

# If insufficient, buy SOL and send to your wallet address
```

### Step 2: Update Configuration
```bash
# Update Anchor.toml
# Change: cluster = "Devnet" → cluster = "Mainnet"

# [programs.mainnet]
# plugumons_staking = "YOUR_PROGRAM_ID_HERE"
```

### Step 3: Build for Mainnet
```bash
anchor clean
anchor build

# Verify program ID matches
solana address -k target/deploy/plugumons_staking-keypair.json
```

### Step 4: Deploy to Mainnet
```bash
anchor deploy --provider.cluster mainnet

# ⚠️ This will cost 2-5 SOL!
# Wait for confirmation...

# Expected output:
# ✅ Program deployed to mainnet
# 📍 Program Id: YOUR_PROGRAM_ID
```

### Step 5: Initialize Mainnet Pool
```bash
# Ensure Anchor.toml has cluster = "Mainnet"
anchor run initialize

# Verify pool creation on Solscan:
# https://solscan.io/account/YOUR_POOL_PDA
```

### Step 6: Fund Mainnet Pool
```bash
# IMPORTANT: Make sure you have PLUGU tokens in your wallet!
# Token: 12EU3xpACKJEZoSZgQUGnv1NgFucRNDdJaPgwuicpump

# Modify scripts/fund-pool.ts
# Set AMOUNT_TO_FUND to your desired amount
# Example: 50,000,000 PLUGU for rewards

anchor run fund-pool

# Verify on Solscan that pool token account has balance
```

---

## 🎨 Phase 3: Frontend Integration

### Update energy-grid.html

1. **Install Required Dependencies:**
```bash
cd /app
yarn add @coral-xyz/anchor @solana/web3.js @solana/spl-token
```

2. **Create Anchor Program Client:**
Create `/app/staking-program-client.js`:
```javascript
import * as anchor from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import idl from './solana-program/target/idl/plugumons_staking.json';

const PROGRAM_ID = new PublicKey('YOUR_PROGRAM_ID_HERE');
const PLUGU_MINT = new PublicKey('12EU3xpACKJEZoSZgQUGnv1NgFucRNDdJaPgwuicpump');
const NFT_MINT = new PublicKey('4Qy6grGLpMBk2q13tPt32UkCzahWCSLEBLbRvHoyBcTvHCZYket');

export class StakingClient {
  constructor(wallet, connection) {
    const provider = new anchor.AnchorProvider(
      connection,
      wallet,
      { commitment: 'confirmed' }
    );
    this.program = new anchor.Program(idl, PROGRAM_ID, provider);
  }

  async stake(amount, lockPeriod) {
    // Lock period in seconds: 30d=2592000, 90d=7776000, 365d=31536000
    const [stakingPool] = PublicKey.findProgramAddressSync(
      [Buffer.from('staking_pool')],
      this.program.programId
    );

    const user = this.program.provider.wallet.publicKey;
    
    // Create stake account PDA
    const poolState = await this.program.account.stakingPool.fetch(stakingPool);
    const [stakeAccount] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('stake'),
        user.toBuffer(),
        poolState.totalStaked.toArrayLike(Buffer, 'le', 8)
      ],
      this.program.programId
    );

    // Get token accounts
    const userTokenAccount = await getAssociatedTokenAddress(PLUGU_MINT, user);
    const poolTokenAccount = await getAssociatedTokenAddress(PLUGU_MINT, stakingPool, true);

    const tx = await this.program.methods
      .stake(new anchor.BN(amount), new anchor.BN(lockPeriod))
      .accounts({
        stakeAccount,
        stakingPool,
        user,
        userTokenAccount,
        poolTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { signature: tx, stakeAccount: stakeAccount.toBase58() };
  }

  async verifyNftHolder(stakeAccountPubkey) {
    const user = this.program.provider.wallet.publicKey;
    const nftTokenAccount = await getAssociatedTokenAddress(NFT_MINT, user);

    const tx = await this.program.methods
      .verifyNftHolder()
      .accounts({
        stakeAccount: stakeAccountPubkey,
        user,
        nftTokenAccount,
        nftMint: NFT_MINT,
      })
      .rpc();

    return tx;
  }

  async claimRewards(stakeAccountPubkey) {
    const [stakingPool] = PublicKey.findProgramAddressSync(
      [Buffer.from('staking_pool')],
      this.program.programId
    );

    const user = this.program.provider.wallet.publicKey;
    const userTokenAccount = await getAssociatedTokenAddress(PLUGU_MINT, user);
    const poolTokenAccount = await getAssociatedTokenAddress(PLUGU_MINT, stakingPool, true);

    const tx = await this.program.methods
      .claimRewards()
      .accounts({
        stakeAccount: stakeAccountPubkey,
        stakingPool,
        user,
        userTokenAccount,
        poolTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    return tx;
  }

  async unstake(stakeAccountPubkey) {
    const [stakingPool] = PublicKey.findProgramAddressSync(
      [Buffer.from('staking_pool')],
      this.program.programId
    );

    const user = this.program.provider.wallet.publicKey;
    const userTokenAccount = await getAssociatedTokenAddress(PLUGU_MINT, user);
    const poolTokenAccount = await getAssociatedTokenAddress(PLUGU_MINT, stakingPool, true);

    const tx = await this.program.methods
      .unstake()
      .accounts({
        stakeAccount: stakeAccountPubkey,
        stakingPool,
        user,
        userTokenAccount,
        poolTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    return tx;
  }

  async getPoolInfo() {
    const [stakingPool] = PublicKey.findProgramAddressSync(
      [Buffer.from('staking_pool')],
      this.program.programId
    );

    const poolState = await this.program.account.stakingPool.fetch(stakingPool);
    return {
      totalStaked: poolState.totalStaked.toString(),
      gridTarget: poolState.gridTarget.toString(),
      gridBoostActive: poolState.gridBoostActive,
    };
  }
}
```

3. **Update energy-grid.html** to use the client instead of Express API

---

## 🧹 Phase 4: Cleanup Old Custodial System

Once smart contract is working, remove:
```bash
# Remove old backend files
rm /app/server.js
rm /app/database.js
rm /app/staking-service.js
rm /app/solana-service.js
rm /app/staking.db

# Remove backend dependencies from package.json
# - express
# - sqlite3
# - @solana/web3.js (from backend, keep in frontend)
```

---

## ✅ Post-Deployment Checklist

### Devnet Testing:
- [ ] Program deployed to devnet
- [ ] Pool initialized
- [ ] Pool funded with test tokens
- [ ] Stake function tested
- [ ] NFT verification tested
- [ ] Claim rewards tested
- [ ] Unstake tested (with and without lock)
- [ ] Grid boost activation tested (at 200M)

### Mainnet Launch:
- [ ] Program deployed to mainnet
- [ ] Pool initialized on mainnet
- [ ] Pool funded with real PLUGU tokens
- [ ] Frontend updated with mainnet Program ID
- [ ] Small test stake completed successfully
- [ ] All functions verified working
- [ ] Analytics/monitoring set up
- [ ] Documentation updated

---

## 💰 Cost Breakdown

### One-Time Costs:
- **Program Deployment**: 2-5 SOL (~$400-$1,000)
- **Pool Initialization**: 0.01 SOL (~$2)
- **Pool Token Account**: 0.002 SOL (~$0.40)

### Per-User Costs (paid by users):
- **Stake Account Creation**: ~0.002 SOL
- **Transaction Fees**: ~0.000005 SOL per transaction

### Ongoing Costs:
- **Reward Pool Funding**: Your PLUGU tokens
- **No monthly/server fees!** 🎉

---

## 🔍 Monitoring & Analytics

### Check Program Activity:
- **Solscan**: https://solscan.io/account/YOUR_PROGRAM_ID
- **Solana Explorer**: https://explorer.solana.com/address/YOUR_PROGRAM_ID

### Monitor Pool:
```bash
# Get pool PDA
solana address -k <(echo '[...]')  # Use your pool PDA

# Check pool balance
spl-token accounts --owner YOUR_POOL_PDA
```

---

## 🆘 Troubleshooting

### Build Errors:
```bash
# Clear cache and rebuild
anchor clean
rm -rf target/
anchor build
```

### Deployment Fails:
```bash
# Check SOL balance
solana balance

# Verify Program ID matches
solana address -k target/deploy/plugumons_staking-keypair.json

# Check network
solana config get
```

### Transaction Simulation Failed:
- Verify all PDAs are derived correctly
- Check token accounts exist
- Ensure user has enough tokens
- Verify lock period is valid (2592000, 7776000, or 31536000 seconds)

### NFT Verification Fails:
- Check NFT mint address: `4Qy6grGLpMBk2q13tPt32UkCzahWCSLEBLbRvHoyBcTvHCZYket`
- Verify user actually owns the NFT
- Check token account has balance >= 1

---

## 📚 Useful Commands

```bash
# Check program logs
solana logs YOUR_PROGRAM_ID

# Verify program deployed
solana program show YOUR_PROGRAM_ID

# Close failed transactions
solana confirm -v TRANSACTION_SIGNATURE

# Upgrade program (if needed later)
anchor upgrade target/deploy/plugumons_staking.so --program-id YOUR_PROGRAM_ID
```

---

## 🎯 Success Criteria

Your deployment is successful when:
1. ✅ Users can stake PLUGU tokens through your website
2. ✅ Rewards accumulate automatically on-chain
3. ✅ NFT holders can unstake anytime
4. ✅ Non-NFT holders must wait for lock period
5. ✅ Grid boost activates at 200M total staked
6. ✅ All transactions happen on-chain (no backend needed!)

---

## 🚀 You're Ready!

You now have:
- ✅ Professional-grade Solana smart contract
- ✅ Complete deployment scripts
- ✅ Testing procedures
- ✅ Frontend integration template
- ✅ Monitoring tools

**Time to deploy and launch your staking platform!** 🎉

---

## 📞 Support Resources

- **Anchor Docs**: https://www.anchor-lang.com/
- **Solana Docs**: https://docs.solana.com/
- **Solana Discord**: https://discord.gg/solana
- **Stack Exchange**: https://solana.stackexchange.com/

**Good luck with your launch!** 🚀
