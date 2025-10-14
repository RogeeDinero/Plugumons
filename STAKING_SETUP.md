# Plugumons Energy Grid - Staking Setup Guide

## 🚀 Features Implemented

### ✅ Fixed Energy Grid Button
- The "Access The Energy Grid" button on the home page now works and navigates to the staking page

### ✅ Staking System
- **Multiple Lock Periods**: 30, 90, and 365 days with increasing APRs (5%, 10%, 20%)
- **NFT Holder Benefits**: 
  - No lock period (can unstake anytime)
  - 2x multiplier after reaching halfway point of lock period
- **Grid Power System**: 
  - 200M PLUGU target for 100% charge
  - 2x APR boost for ALL users when grid reaches 100%
  - Real-time tracking of total staked and charge percentage
- **Reward Calculator**: Accurate projections based on amount and lock period
- **Top 5 Leaderboard**: Shows highest stakers and their rewards

### ✅ Wallet Integration
- Direct wallet connection for Phantom, Solflare, and Backpack wallets
- Automatic wallet detection
- Real-time balance and stake tracking

### ✅ Backend Infrastructure
- SQLite database for stake tracking
- RESTful API endpoints for all staking operations
- Solana blockchain integration for NFT verification
- Cached NFT holder verification (updates every 5 minutes)

## 📋 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `/app` directory:

```bash
cp .env.example .env
```

### 3. Add Reward Wallet Private Key

**CRITICAL**: You need to add your reward wallet's private key to the `.env` file for reward distribution.

#### How to Get Your Private Key:

**From Phantom Wallet:**
1. Open Phantom wallet
2. Click the menu (three lines) → Settings
3. Click "Export Private Key"
4. Enter your password
5. Copy the Base58 string

**From Solflare Wallet:**
1. Open Solflare wallet
2. Go to Settings → Security
3. Click "Export Private Key"
4. Enter your password
5. Copy the key

**From Backpack Wallet:**
1. Open Backpack
2. Go to Settings → Security
3. Export your private key
4. Copy the key

#### Add to .env file:
```env
REWARD_WALLET_PRIVATE_KEY=your_base58_private_key_here
```

**⚠️ SECURITY WARNING**: 
- NEVER share your private key
- NEVER commit .env file to git
- The .env file is already in .gitignore
- This private key has access to the reward wallet: `HaLue8w9EcBS4j3vTzHoyBcTvZCV6dWPd9YQce7S2QZZ`

### 4. Fund the Reward Wallet

Make sure the reward wallet has enough PLUGU tokens to distribute rewards. Transfer tokens to:
```
HaLue8w9EcBS4j3vTzHoyBcTvZCV6dWPd9YQce7S2QZZ
```

### 5. Start the Server

```bash
npm start
```

The server will start on http://localhost:3000

## 🎮 How to Use

### For Users:

1. **Visit the Energy Grid**: Click "Access The Energy Grid" from the home page
2. **Connect Wallet**: Click "Connect Wallet" and select your Solana wallet (Phantom, Solflare, or Backpack)
3. **View NFT Benefits**: The system automatically detects if you hold Plugumons NFTs
4. **Calculate Rewards**: Use the calculator to see projected earnings
5. **Stake Tokens**: 
   - Enter amount
   - Select lock period (30/90/365 days)
   - Click "Start Staking"
   - Note: In production, you'd transfer tokens first
6. **Monitor Stakes**: View your active power stations with real-time rewards
7. **Claim Rewards**: Click "Claim Rewards" to receive your earned tokens
8. **Unstake**: NFT holders can unstake anytime; others must wait for lock period

### For Developers:

#### API Endpoints:

- `GET /api/grid/stats` - Get grid statistics
- `GET /api/leaderboard?limit=5` - Get top stakers
- `GET /api/stakes/:walletAddress` - Get user's stakes
- `GET /api/user/stats/:walletAddress` - Get user statistics
- `GET /api/nft/check/:walletAddress` - Check NFT ownership
- `GET /api/balance/:walletAddress` - Get token balance
- `POST /api/stake` - Create new stake
- `POST /api/unstake` - Unstake tokens
- `POST /api/claim` - Claim rewards
- `GET /api/health` - Health check

## 🔐 Token Addresses

- **PLUGU Token**: `12EU3xpACKJEZoSZgQUGnv1NgFucRNDdJaPgwuicpump`
- **Plugumons NFT Collection**: `4Qy6grGLpMBk2q13tPt32UkCzahWCSLEBLbRvHCZYket`
- **Reward Wallet**: `HaLue8w9EcBS4j3vTzHoyBcTvZCV6dWPd9YQce7S2QZZ`

## 📊 Staking Tiers

### Non-NFT Holders:
- **30 Days**: 5% APR (locked)
- **90 Days**: 10% APR (locked)
- **365 Days**: 20% APR (locked)

### NFT Holders:
- **No Lock Period**: Can unstake anytime
- **Bonus Multiplier**: 2x APR after halfway point
  - 30 Days: 10% APR (after 15 days)
  - 90 Days: 20% APR (after 45 days)
  - 365 Days: 40% APR (after 182 days)

### Grid Boost (When 200M+ PLUGU Staked):
- **All APRs double** for everyone
- **Stacks with NFT bonuses**
- Example: NFT holder at 365 days = 40% × 2 = 80% APR!

## 🛠️ Technology Stack

- **Frontend**: HTML, CSS (Tailwind-inspired), Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: SQLite (better-sqlite3)
- **Blockchain**: Solana Web3.js, SPL Token
- **Wallets**: Phantom, Solflare, Backpack integration

## 📝 Database Schema

The staking system uses SQLite with the following tables:

- **stakes**: Active and completed stakes
- **nft_holders**: Cached NFT ownership data
- **reward_claims**: History of reward distributions

## 🚨 Important Notes

1. **Demo Mode**: The current implementation tracks stakes in the database but doesn't require actual token transfers. For production:
   - Implement token transfer verification
   - Add staking pool contract
   - Enable actual reward distributions

2. **NFT Verification**: Uses cached verification (5-minute refresh). For real-time verification, adjust the cache duration.

3. **Reward Distribution**: Currently simulated. Uncomment the token transfer code in `server.js` to enable actual distributions once you add the private key.

4. **Security**: This is a prototype. For production:
   - Add proper authentication
   - Implement rate limiting
   - Use secure key management (AWS KMS, HashiCorp Vault, etc.)
   - Add transaction signing verification
   - Implement proper error handling

## 🧪 Testing

Test the system with these steps:

1. Connect a wallet (use a test wallet, not your main wallet)
2. Create a stake with a small amount
3. Verify the stake appears in "Your Power Stations"
4. Check the leaderboard updates
5. Test the calculator with different amounts and periods
6. Test claim rewards (will show success but won't transfer tokens without private key)
7. Test unstaking

## 📞 Support

For issues or questions:
- Check the browser console for errors
- Verify your .env file is configured correctly
- Ensure the reward wallet has sufficient PLUGU tokens
- Check that Solana RPC endpoint is accessible

## 🎯 Next Steps

To make this production-ready:

1. ✅ Add the reward wallet private key to .env
2. ✅ Fund the reward wallet with PLUGU tokens
3. ⚠️ Implement actual token transfer verification for staking
4. ⚠️ Enable token distribution (uncomment code in server.js)
5. ⚠️ Add comprehensive error handling
6. ⚠️ Implement user authentication
7. ⚠️ Add transaction history tracking
8. ⚠️ Deploy to production server
9. ⚠️ Set up monitoring and logging
10. ⚠️ Security audit

---

**Built with ⚡ for the Plugumons community**
