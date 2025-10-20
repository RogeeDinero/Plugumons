#!/bin/bash
# Comprehensive fix for Cargo.lock version 4 issue

set -e

echo "🔧 Fixing Cargo.lock version 4 issue - Comprehensive Fix"
echo ""

# Navigate to solana-program
cd /mnt/c/Users/GamingPc/Plugumons/solana-program

# Pull latest changes
echo "📥 Pulling latest changes..."
cd ..
git pull origin main
cd solana-program

echo ""
echo "🎯 Solution 1: Using Rust 1.79.0 (Anchor's recommended version)"
echo "   This is the version Anchor 0.32.1 was tested with."
echo ""

# Install Rust 1.79.0
echo "📦 Installing Rust 1.79.0..."
rustup install 1.79.0
rustup override set 1.79.0

# Verify
echo ""
echo "✅ Rust version:"
rustc --version

# Clean everything
echo ""
echo "🧹 Cleaning all build artifacts..."
rm -f Cargo.lock
rm -rf target/
rm -rf .anchor/
find . -name "Cargo.lock" -type f -delete

# Build with 1.79.0
echo ""
echo "🏗️  Building with Rust 1.79.0..."
if anchor build; then
    echo ""
    echo "✅✅✅ SUCCESS! Build completed with Rust 1.79.0 ✅✅✅"
    echo ""
    echo "📦 Built artifacts:"
    ls -lh target/deploy/*.so 2>/dev/null
    echo ""
    echo "📍 Program ID:"
    solana address -k target/deploy/plugumons_staking-keypair.json
    echo ""
    echo "🎯 Next steps:"
    echo "   1. Deploy to devnet: anchor deploy --provider.cluster devnet"
    echo "   2. Initialize pool: anchor run initialize"
    echo "   3. Fund pool: anchor run fund-pool"
    exit 0
fi

echo ""
echo "❌ Build with 1.79.0 failed. Trying alternative solutions..."
echo ""

# Solution 2: Use nightly with lockfile v4 support
echo "🎯 Solution 2: Using Rust nightly (full lockfile v4 support)"
rustup install nightly
rustup override set nightly

rm -f Cargo.lock
rm -rf target/

echo "🏗️  Building with Rust nightly..."
if anchor build; then
    echo ""
    echo "✅✅✅ SUCCESS! Build completed with Rust nightly ✅✅✅"
    echo ""
    echo "⚠️  Note: You're using nightly Rust. For production, consider switching back to stable 1.79.0"
    exit 0
fi

echo ""
echo "❌ Nightly also failed. Trying final solution..."
echo ""

# Solution 3: Downgrade to Anchor 0.29.0
echo "🎯 Solution 3: Downgrading to Anchor 0.29.0"
rustup override set 1.79.0
avm install 0.29.0
avm use 0.29.0

# Update Anchor.toml
sed -i 's/anchor_version = "0.32.1"/anchor_version = "0.29.0"/' Anchor.toml

# Update Cargo.toml
cd programs/plugumons-staking
sed -i 's/anchor-lang = "0.32.1"/anchor-lang = "0.29.0"/' Cargo.toml
sed -i 's/anchor-spl = "0.32.1"/anchor-spl = "0.29.0"/' Cargo.toml
cd ../..

rm -f Cargo.lock
rm -rf target/

echo "🏗️  Building with Anchor 0.29.0..."
if anchor build; then
    echo ""
    echo "✅✅✅ SUCCESS! Build completed with Anchor 0.29.0 ✅✅✅"
    echo ""
    echo "⚠️  Note: Using Anchor 0.29.0 (older version)"
    exit 0
fi

echo ""
echo "❌ All automatic solutions failed."
echo ""
echo "📋 Manual troubleshooting needed:"
echo "   1. Check Rust installation: rustc --version"
echo "   2. Check Anchor version: anchor --version"
echo "   3. Try building a simple Anchor project to test setup"
echo "   4. Check Anchor GitHub issues for similar problems"
echo ""
echo "💡 You can also try:"
echo "   - Reinstalling Anchor: cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked"
echo "   - Using Docker for a clean environment"
echo ""

exit 1
