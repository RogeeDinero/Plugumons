# 🔧 Build Solutions - Cargo.lock Version 4 Issue

## 🎯 Problem Summary
Anchor 0.32.1 generates Cargo.lock with version 4, which requires:
- Rust 1.81+ (stable with native v4 support)
- OR Rust nightly with `-Znext-lockfile-bump` flag

Your system shows Rust being overridden to 1.75.0-dev by Solana toolchain.

---

## ✅ Solution 1: Use Latest Stable Rust (RECOMMENDED)

Rust 1.81+ has native lockfile v4 support:

```bash
cd /mnt/c/Users/GamingPc/Plugumons/solana-program

# Pull latest fixes
cd ..
git pull origin main
cd solana-program

# Run ultimate fix script
chmod +x ULTIMATE_FIX.sh
./ULTIMATE_FIX.sh
```

**This script will:**
- Install latest stable Rust (1.81+)
- Set as override for the project
- Clean and build with native lockfile v4 support

---

## ✅ Solution 2: Direct Build (Skip Anchor CLI)

If Anchor CLI has issues, build directly with Solana's tools:

```bash
chmod +x BUILD_DIRECT.sh
./BUILD_DIRECT.sh
```

**This builds the program using `cargo-build-sbf` directly.**

---

## ✅ Solution 3: Manual Step-by-Step

If scripts don't work, try these manual steps:

### A. Update Rust to 1.81+
```bash
# Update rustup itself
rustup self update

# Install latest stable
rustup update stable

# Set as default
rustup default stable

# Verify (should show 1.81 or higher)
rustc --version
```

### B. Remove toolchain overrides
```bash
cd /mnt/c/Users/GamingPc/Plugumons/solana-program

# Remove any rust-toolchain files
rm -f rust-toolchain.toml rust-toolchain

# Remove directory override
rustup override unset

# Verify no overrides
rustup show
```

### C. Clean and build
```bash
rm -f Cargo.lock
rm -rf target/ .anchor/

# Build
anchor build
```

---

## ✅ Solution 4: Downgrade to Anchor 0.29.0

If all else fails, use older Anchor version (no lockfile v4):

```bash
# Install Anchor 0.29.0
avm install 0.29.0 --force
avm use 0.29.0

# Update Anchor.toml
sed -i 's/anchor_version = "0.32.1"/anchor_version = "0.29.0"/' Anchor.toml

# Update program Cargo.toml
cd programs/plugumons-staking
sed -i 's/anchor-lang = "0.32.1"/anchor-lang = "0.29.0"/' Cargo.toml
sed -i 's/anchor-spl = "0.32.1"/anchor-spl = "0.29.0"/' Cargo.toml
cd ../..

# Clean and build
rm -f Cargo.lock
rm -rf target/
anchor build
```

---

## 🔍 Debugging Steps

### Check Rust version conflicts:
```bash
# System default
rustc --version

# What rustup shows
rustup show

# Active toolchain
rustup toolchain list

# Check for overrides
ls -la | grep rust-toolchain
cat rust-toolchain.toml 2>/dev/null
```

### Check Solana installation:
```bash
solana --version
which solana
which cargo-build-sbf
```

### Check Anchor installation:
```bash
anchor --version
avm list
```

---

## 💡 Understanding the Issue

**Cargo.lock version 4** was introduced for future Cargo enhancements:
- **Rust 1.81+**: Native support (stable)
- **Rust 1.76-1.80**: Requires nightly + flag
- **Rust <1.76**: Not supported

**The conflict:**
- Anchor 0.32.1 generates v4 lockfiles
- Solana tools may use older Rust
- This creates incompatibility

**Solutions:**
1. Use Rust 1.81+ (native v4 support) ✅ Best
2. Build without Anchor CLI ✅ Alternative
3. Downgrade Anchor to 0.29.0 ✅ Fallback

---

## 🎯 Recommended Approach

**Try in this order:**

1. **ULTIMATE_FIX.sh** - Uses Rust 1.81+
   ```bash
   chmod +x ULTIMATE_FIX.sh && ./ULTIMATE_FIX.sh
   ```

2. **BUILD_DIRECT.sh** - Bypass Anchor CLI
   ```bash
   chmod +x BUILD_DIRECT.sh && ./BUILD_DIRECT.sh
   ```

3. **Manual Rust update** - Follow Solution 3 steps above

4. **Downgrade Anchor** - Follow Solution 4

---

## 📞 If Nothing Works

Check these:

1. **WSL/Linux issue?** Try on native Linux or macOS
2. **Solana version?** Update: `solana-install update`
3. **Anchor corruption?** Reinstall: `cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked --force`
4. **Fresh environment?** Try in Docker or clean VM

---

## ✅ After Successful Build

You should see:
```
Built program: target/deploy/plugumons_staking.so
IDL: target/idl/plugumons_staking.json
```

Then:
```bash
# Deploy to devnet
anchor deploy --provider.cluster devnet

# Initialize
anchor run initialize

# Fund
anchor run fund-pool
```

---

**Start with ULTIMATE_FIX.sh - it should work!** 🚀
