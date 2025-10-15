# ⚡ Plugumons Energy Grid - Solana Staking Platform

**Live Staking Platform for PLUGU Token on Solana Mainnet**

![Solana](https://img.shields.io/badge/Solana-Mainnet-green)
![Node.js](https://img.shields.io/badge/Node.js-18+-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 🎯 Features

### Staking System
- ✅ **Multiple Lock Periods**: 30, 90, 365 days with 5%, 10%, 20% APR
- ✅ **NFT Holder Benefits**: No lock period + 2x multiplier after halfway point
- ✅ **Grid Power System**: 2x APR boost for all when 200M PLUGU staked
- ✅ **Real-time Rewards**: Automatic calculation and distribution
- ✅ **Top 5 Leaderboard**: Live ranking of top stakers

### Wallet Integration
- ✅ **Phantom Wallet**: Full support ✅
- ✅ **Solflare Wallet**: Full support ✅
- ✅ **Backpack Wallet**: Full support ✅
- ✅ Direct connection with auto-detection

### Security
- ✅ Private keys secured in `.env` (not in git)
- ✅ Production-ready with token transfers
- ✅ Database-backed stake tracking
- ✅ Solana blockchain verification

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Solana wallet with PLUGU tokens

### Installation

1. **Clone and Install:**
```bash
git clone <your-repo-url>
cd plugumons-staking
npm install
```

2. **Configure Environment:**
```bash
# .env file is already created
# Edit /app/.env and add your private key:
REWARD_WALLET_PRIVATE_KEY=your_key_here
```

3. **Fund Reward Wallet:**
Send PLUGU tokens to:
```
HaLue8w9EcBS4j3vTzHoyBcTvZCV6dWPd9YQce7S2QZZ
```

4. **Start Server:**
```bash
npm start
```

5. **Visit:**
```
http://localhost:3000
```

---

## 📊 Staking Tiers

### Standard Users
| Lock Period | APR | Can Unstake Early? |
|------------|-----|-------------------|
| 30 Days | 5% | ❌ No |
| 90 Days | 10% | ❌ No |
| 365 Days | 20% | ❌ No |

### NFT Holders (Plugumons Collection)
| Lock Period | Base APR | Halfway Bonus | Total APR |
|------------|----------|---------------|-----------|
| 30 Days | 5% | 2x after 15 days | 10% |
| 90 Days | 10% | 2x after 45 days | 20% |
| 365 Days | 20% | 2x after 182 days | 40% |
| **Special** | - | No Lock Period | Can unstake anytime |

### Grid Boost (200M+ PLUGU Staked)
- 🔥 **ALL APRs double** for everyone
- 🔥 **Stacks with NFT bonuses**
- 🔥 Example: NFT holder at 365 days = 40% × 2 = **80% APR!**

---

## 🔐 Token Addresses

```
PLUGU Token: 12EU3xpACKJEZoSZgQUGnv1NgFucRNDdJaPgwuicpump
Plugumons NFT: 4Qy6grGLpMBk2q13tPt32UkCzahWCSLEBLbRvHCZYket
Reward Wallet: HaLue8w9EcBS4j3vTzHoyBcTvZCV6dWPd9YQce7S2QZZ
```

---

## 📁 Project Structure

```
/app/
├── server.js              # Express API server
├── database.js            # SQLite database layer
├── solana-service.js      # Blockchain integration
├── staking-service.js     # Staking business logic
├── index.html             # Home page
├── energy-grid.html       # Staking interface
├── mystery-box.html       # Mystery box feature
├── .env                   # Environment variables (not in git)
├── .env.example           # Template for .env
├── package.json           # Dependencies
└── staking.db            # SQLite database (auto-created)
```

---

## 🛠️ API Endpoints

### Public Endpoints
- `GET /api/grid/stats` - Grid statistics
- `GET /api/leaderboard?limit=5` - Top stakers
- `GET /api/health` - Health check

### User Endpoints
- `GET /api/stakes/:walletAddress` - User's stakes
- `GET /api/user/stats/:walletAddress` - User statistics
- `GET /api/nft/check/:walletAddress` - NFT ownership
- `GET /api/balance/:walletAddress` - Token balance

### Transaction Endpoints
- `POST /api/stake` - Create new stake
- `POST /api/unstake` - Unstake tokens
- `POST /api/claim` - Claim rewards

---

## 🚀 Deployment

### Option 1: VPS (DigitalOcean, AWS, Linode)
```bash
# Install PM2
npm install -g pm2

# Start server
pm2 start server.js --name plugumons-staking
pm2 save
pm2 startup

# Setup Nginx + SSL (optional)
# See DEPLOYMENT.md for full guide
```

### Option 2: Heroku
```bash
heroku create plugumons-staking
heroku config:set REWARD_WALLET_PRIVATE_KEY=your_key
git push heroku main
```

### Option 3: Render
1. Push to GitHub
2. Create Web Service on Render
3. Add environment variables
4. Deploy automatically

**Full deployment guide:** See `DEPLOYMENT.md`

---

## 📚 Documentation

- **[QUICK_START.md](QUICK_START.md)** - 3-step setup guide
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide
- **[STAKING_SETUP.md](STAKING_SETUP.md)** - Features & configuration

---

## 🔒 Security

### Protected Files (Never Pushed to Git)
- ❌ `.env` - Contains private key
- ❌ `staking.db` - Local database
- ❌ `node_modules/` - Dependencies

### Safety Measures
- ✅ `.gitignore` configured
- ✅ Environment variables for secrets
- ✅ Private key never in code
- ✅ Transaction verification
- ✅ Error handling for token transfers

---

## 🧪 Testing

### Start Development Server
```bash
npm start
```

### Test Workflow
1. Visit `http://localhost:3000/energy-grid`
2. Connect wallet (Phantom/Solflare/Backpack)
3. Create test stake with small amount
4. Verify stake appears in "Power Stations"
5. Check leaderboard updates
6. Test reward calculation
7. Try claiming rewards
8. Verify transaction on Solana Explorer

### API Testing
```bash
# Health check
curl http://localhost:3000/api/health

# Grid stats
curl http://localhost:3000/api/grid/stats

# Leaderboard
curl http://localhost:3000/api/leaderboard?limit=5
```

---

## 🐛 Troubleshooting

### "Private key not set" error
- Edit `/app/.env`
- Add your actual private key
- Restart server

### "Insufficient funds" error
- Check reward wallet balance
- Send more PLUGU tokens to reward wallet

### Wallet connection fails
- Ensure wallet extension is installed
- Refresh page and try again
- Check browser console for errors

### Port 3000 already in use
```bash
# Find and kill process
lsof -i :3000
kill -9 <PID>
```

---

## 📊 Monitoring

### Check Server Status
```bash
pm2 status
pm2 logs plugumons-staking
```

### Monitor Reward Wallet
Visit Solana Explorer:
```
https://explorer.solana.com/address/HaLue8w9EcBS4j3vTzHoyBcTvZCV6dWPd9YQce7S2QZZ
```

### Database Queries
```bash
sqlite3 staking.db "SELECT COUNT(*) FROM stakes WHERE status='active';"
sqlite3 staking.db "SELECT SUM(amount) FROM stakes WHERE status='active';"
```

---

## 🎯 Roadmap

- [x] Multi-period staking (30/90/365 days)
- [x] NFT holder benefits
- [x] Grid power boost system
- [x] Leaderboard
- [x] Real-time rewards
- [x] Phantom wallet support
- [x] Solflare wallet support
- [x] Backpack wallet support
- [ ] Mobile responsive improvements
- [ ] Staking history page
- [ ] Email notifications
- [ ] Advanced analytics dashboard
- [ ] Governance integration

---

## 💻 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite (better-sqlite3)
- **Blockchain**: Solana Web3.js, SPL Token
- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Wallets**: Phantom, Solflare, Backpack integration

---

## 📞 Support

### Common Issues
1. Wallet not connecting → Check if extension installed
2. Rewards not showing → Wait ~30 seconds for blockchain sync
3. Transaction failed → Check wallet has SOL for gas fees
4. Server not starting → Verify .env configuration

### Resources
- [Solana Docs](https://docs.solana.com)
- [Phantom Wallet](https://phantom.app)
- [Solflare Wallet](https://solflare.com)
- [SPL Token Docs](https://spl.solana.com/token)

---

## 📄 License

MIT License - feel free to use and modify

---

## 🙏 Credits

Built for the Plugumons community ⚡

**Catch one before they short-circuit!** 🔌

---

## ⚡ Quick Commands

```bash
# Development
npm start

# Production with PM2
pm2 start server.js --name plugumons-staking

# View logs
pm2 logs

# Restart
pm2 restart plugumons-staking

# Stop
pm2 stop plugumons-staking

# Deploy helper
./deploy.sh
```

---

**Ready to stake?** Visit the Energy Grid and power up! ⚡
