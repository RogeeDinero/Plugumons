# ⚡ Quick Start - 3 Steps to Production

## 1️⃣ Add Your Private Key (2 minutes)

**Open:** `/app/.env`

**Find this line:**
```env
REWARD_WALLET_PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE
```

**Replace with your actual key:**
```env
REWARD_WALLET_PRIVATE_KEY=5J7x8K9m2N3p4Q5r6S7t8U9v1W2x3Y4z...
```

**Get your key from:**
- Phantom: Menu → Settings → Export Private Key
- Solflare: Settings → Security → Export Private Key
- Backpack: Settings → Security → Export Private Key

---

## 2️⃣ Fund Reward Wallet (1 minute)

Send PLUGU tokens to:
```
HaLue8w9EcBS4j3vTzHoyBcTvZCV6dWPd9YQce7S2QZZ
```

**How much?** Enough to cover expected rewards + 20% buffer

---

## 3️⃣ Start & Test (1 minute)

```bash
npm start
```

Visit: `http://localhost:3000/energy-grid`

Test with small stake first!

---

## ✅ Safety Checklist

- ✅ `.env` is in `.gitignore` (already done)
- ✅ Private key in `.env` file only
- ✅ Reward wallet funded with PLUGU
- ✅ Production mode enabled (already done)
- ✅ Ready to push to GitHub safely

---

## 🔒 What's Protected

**Will NOT go to GitHub:**
- ❌ `.env` (your private key)
- ❌ `staking.db` (local database)
- ❌ `node_modules/`

**Will go to GitHub:**
- ✅ All source code
- ✅ `.env.example` (template)
- ✅ Documentation

---

## 🚀 Push to GitHub

Just click "Save to GitHub" button or type:
```
Push this code to GitHub
```

**Your private key is protected and will NOT be uploaded!**

---

## 📖 Need More Details?

- Full setup guide: `PRODUCTION_SETUP.md`
- Feature documentation: `STAKING_SETUP.md`
- Code is production-ready NOW!

**You're all set!** 🎉
