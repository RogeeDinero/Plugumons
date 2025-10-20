# 🔧 Fix Build Issues - Run These Commands

## Problem Summary:
- Anchor version mismatch (0.29.0 → 0.32.1)
- Cargo.lock incompatibility
- Dependency conflicts

## ✅ Solution - Run These Commands:

### Step 1: Navigate to project
```bash
cd /mnt/c/Users/GamingPc/Plugumons/solana-program
```

### Step 2: Delete old lock files
```bash
rm Cargo.lock
rm -rf target/
```

### Step 3: Pull latest changes from GitHub
Since I just updated the files, pull them:
```bash
cd /mnt/c/Users/GamingPc/Plugumons
git pull origin main
```

### Step 4: Clean and rebuild
```bash
cd solana-program
anchor clean
anchor build
```

## 🎯 What Was Fixed:

### 1. Anchor.toml
```toml
[toolchain]
anchor_version = "0.32.1"  # ← Added to match your CLI
```

### 2. Cargo.toml (Program)
```toml
[dependencies]
anchor-lang = "0.32.1"     # ← Upgraded from 0.29.0
anchor-spl = "0.32.1"      # ← Upgraded from 0.29.0
# Removed solana-program   # ← Removed (use anchor-lang export)
```

### 3. lib.rs
```rust
use anchor_lang::solana_program::pubkey::Pubkey as SolanaPubkey;
// Now uses anchor-lang's exported solana_program
```

### 4. package.json
```json
"@coral-xyz/anchor": "^0.32.1"  // Upgraded
"@solana/spl-token": "^0.4.9"   // Updated
"@solana/web3.js": "^1.95.0"    // Updated
```

---

## If Build Still Fails:

### Option A: Install Anchor 0.29.0 (Original Version)
```bash
avm install 0.29.0
avm use 0.29.0
```

Then change Anchor.toml back to:
```toml
[toolchain]
anchor_version = "0.29.0"
```

And downgrade dependencies in Cargo.toml:
```toml
anchor-lang = "0.29.0"
anchor-spl = "0.29.0"
```

### Option B: Continue with 0.32.1 (Recommended)
The files are now updated for 0.32.1. Just:
1. Delete Cargo.lock
2. Pull from GitHub
3. Run `anchor build`

---

## Expected Successful Build Output:

```
Compiling plugumons-staking v0.1.0
Finished release [optimized] target(s) in X.XXs
✅ Built program: target/deploy/plugumons_staking.so
✅ IDL: target/idl/plugumons_staking.json
```

---

## Quick Command Sequence:

```bash
# Full clean and rebuild
cd /mnt/c/Users/GamingPc/Plugumons/solana-program
rm -rf Cargo.lock target/
git pull origin main
anchor clean
anchor build
```

---

## 🎯 After Successful Build:

You can then:
```bash
# Deploy to devnet
anchor deploy --provider.cluster devnet

# Initialize pool
anchor run initialize

# Fund pool
anchor run fund-pool
```

---

## 📞 If Still Having Issues:

Check:
1. Rust version: `rustc --version` (should be 1.79.0+)
2. Anchor version: `anchor --version` (should be 0.32.1)
3. Solana version: `solana --version` (should be 1.18.0+)

Update if needed:
```bash
# Update Rust
rustup update

# Install/switch Anchor version
avm install 0.32.1
avm use 0.32.1

# Update Solana CLI
solana-install update
```

---

**The files have been updated. Pull from GitHub and rebuild!** 🚀
