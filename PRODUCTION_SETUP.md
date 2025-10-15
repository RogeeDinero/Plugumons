# 🚀 Production Setup Guide - Plugumons Staking

## 📋 Complete Setup Checklist

### ✅ Step 1: Verify .gitignore (Security Check)

Your `.gitignore` file already contains:
```
.env
*.env
*.env.*
node_modules/
```

**✓ This means your private key will NEVER be pushed to GitHub**

---

### ✅ Step 2: Set Up Your Private Key

#### 2.1 Get Your Private Key from Wallet

**Option A: Phantom Wallet**
1. Open Phantom wallet extension
2. Click the menu icon (☰) in top left
3. Click **Settings**
4. Scroll down and click **"Export Private Key"**
5. Enter your wallet password
6. Click **"Continue"**
7. Copy the Base58 string (looks like: `5J7x8K9m2N3p4Q5r6S7t8U9v1W2x3Y4z5A6b7C8d9E...`)

**Option B: Solflare Wallet**
1. Open Solflare wallet
2. Go to **Settings** → **Security**
3. Click **"Export Private Key"**
4. Enter your password
5. Copy the private key

**Option C: Backpack Wallet**
1. Open Backpack wallet
2. Go to **Settings** → **Security**
3. Click **"Export Private Key"**
4. Copy the key

#### 2.2 Add Private Key to .env File

**Location:** `/app/.env` (file already created for you)

Open `/app/.env` and replace `YOUR_PRIVATE_KEY_HERE` with your actual private key:

```env
REWARD_WALLET_PRIVATE_KEY=5J7x8K9m2N3p4Q5r6S7t8U9v1W2x3Y4z5A6b7C8d9E...
```

**Example:**
```env
# Before:
REWARD_WALLET_PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE

# After:
REWARD_WALLET_PRIVATE_KEY=5J7x8K9m2N3p4Q5r6S7t8U9v1W2x3Y4z5A6b7C8d9E1f2G3h4I5j6K7
```

---

### ✅ Step 3: Fund the Reward Wallet

Send PLUGU tokens to your reward wallet address:
```
HaLue8w9EcBS4j3vTzHoyBcTvZCV6dWPd9YQce7S2QZZ
```

**How much to send:**
- Calculate expected rewards for your stakers
- Add a buffer (recommend 20-30% extra)
- Example: If expecting 1M PLUGU in rewards, send 1.3M PLUGU

**How to send:**
1. Open your wallet
2. Click "Send"
3. Paste address: `HaLue8w9EcBS4j3vTzHoyBcTvZCV6dWPd9YQce7S2QZZ`
4. Enter amount
5. Confirm transaction

---

### ✅ Step 4: Production Mode is NOW ENABLED

**The system is now in PRODUCTION MODE by default!**

When users claim rewards, the system will:
1. ✅ Calculate rewards
2. ✅ Update database
3. ✅ **Send actual PLUGU tokens** from reward wallet to user
4. ✅ Return transaction signature

#### To Return to Demo Mode (if needed):
Edit `/app/server.js` around line 179 and comment out this section:
```javascript
// COMMENT THIS BLOCK FOR DEMO MODE:
try {
  const transferResult = await solanaService.sendRewards(walletAddress, result.amount);
  // ... rest of the code
} catch (transferError) {
  // ...
}
```

---

### ✅ Step 5: Test the Setup

#### 5.1 Start the Server
```bash
npm start
```

#### 5.2 Check Private Key is Loaded
Look for this in the console output:
```
🚀 Plugumons Staking Server running on port 3000
```

If you see errors about `REWARD_WALLET_PRIVATE_KEY`, check your .env file.

#### 5.3 Test with Small Amount First
1. Connect a test wallet
2. Create a small stake (e.g., 100 PLUGU)
3. Wait a few minutes for rewards to accumulate
4. Try claiming rewards
5. Verify tokens arrive in the wallet
6. Check transaction on Solana Explorer

---

### ✅ Step 6: Push to GitHub (Your Code is Safe!)

Your `.gitignore` ensures these files are NOT pushed:
- ❌ `.env` (contains private key)
- ❌ `node_modules/`
- ❌ `staking.db` (local database)

**What WILL be pushed:**
- ✅ All source code files
- ✅ `package.json`
- ✅ `.env.example` (template without keys)
- ✅ Documentation files

**To push to GitHub:**
```bash
# Option 1: Use Emergent UI
Click "Save to GitHub" button

# Option 2: Use chat command
Type: "Push this code to GitHub"

# Option 3: Manual (if you prefer)
git add .
git commit -m "Add Plugumons staking system"
git push
```

---

## 📁 File Structure After Setup

```
/app/
├── .env                          # ❌ NOT in git (has private key)
├── .env.example                  # ✅ In git (template only)
├── .gitignore                    # ✅ In git (protects .env)
├── database.js                   # ✅ In git
├── solana-service.js            # ✅ In git
├── staking-service.js           # ✅ In git
├── server.js                     # ✅ In git (production mode)
├── energy-grid.html             # ✅ In git
├── index.html                    # ✅ In git
├── staking.db                    # ❌ NOT in git (local data)
├── STAKING_SETUP.md             # ✅ In git
└── PRODUCTION_SETUP.md          # ✅ In git (this file)
```

---

## 🔐 Security Best Practices

### ✅ DO:
- ✓ Keep `.env` file on your local machine only
- ✓ Use `.env.example` for templates without secrets
- ✓ Test with small amounts first
- ✓ Monitor your reward wallet balance
- ✓ Keep backup of your private key in secure location (password manager, hardware wallet)

### ❌ DON'T:
- ✗ Never commit `.env` to git
- ✗ Never share your private key
- ✗ Never post `.env` contents in chat/support
- ✗ Don't use main wallet with large funds for rewards
- ✗ Don't ignore transaction errors

---

## 🐛 Troubleshooting

### Issue: "REWARD_WALLET_PRIVATE_KEY not set"
**Solution:** 
1. Check `/app/.env` exists
2. Verify `REWARD_WALLET_PRIVATE_KEY=` has your actual key
3. Restart the server: `npm start`

### Issue: "Insufficient funds" error
**Solution:**
1. Check reward wallet balance on Solana Explorer
2. Send more PLUGU tokens to: `HaLue8w9EcBS4j3vTzHoyBcTvZCV6dWPd9YQce7S2QZZ`

### Issue: "Invalid private key"
**Solution:**
1. Private key should be Base58 encoded (87-88 characters)
2. No spaces or line breaks
3. Get fresh export from wallet

### Issue: Token transfers failing
**Solution:**
1. Check Solana RPC endpoint is working: `https://api.mainnet-beta.solana.com`
2. Verify token mint address is correct
3. Check reward wallet has SOL for transaction fees (~0.01 SOL)

---

## 📊 Monitoring

### Check Reward Wallet Balance
```bash
# Visit Solana Explorer
https://explorer.solana.com/address/HaLue8w9EcBS4j3vTzHoyBcTvZCV6dWPd9YQce7S2QZZ
```

### Check Transaction History
All reward distributions are logged in database:
- Table: `reward_claims`
- Contains: stake_id, wallet_address, amount, claimed_at

---

## 🚀 You're Ready!

Your setup is complete:
- ✅ Private key secured in `.env`
- ✅ `.gitignore` protecting sensitive files
- ✅ Production mode enabled
- ✅ Ready to push to GitHub safely
- ✅ Token transfers will work when users claim rewards

**Start the server and you're live!**
```bash
npm start
```

Visit: `http://localhost:3000/energy-grid`

---

## 📞 Need Help?

If you encounter issues:
1. Check console logs for error messages
2. Verify `.env` file setup
3. Test with small amounts first
4. Check Solana network status
5. Ask in chat for support

**Your private key is safe and will never be pushed to GitHub!** 🔐
