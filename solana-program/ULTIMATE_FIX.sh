#!/bin/bash
# Ultimate fix: Use stable Rust 1.81+ which supports lockfile v4

echo "🎯 ULTIMATE FIX - Using Rust 1.81+ (stable with lockfile v4 support)"
echo ""

cd /mnt/c/Users/GamingPc/Plugumons/solana-program

# Install latest stable Rust (1.81+)
echo "📦 Installing latest stable Rust..."
rustup install stable
rustup update stable
rustup override set stable

echo ""
echo "✅ Active Rust version:"
rustc --version

# The key: Use Rust 1.81 or later which natively supports lockfile v4
RUST_VERSION=$(rustc --version | grep -oP '\d+\.\d+' | head -1)
echo ""
echo "📊 Rust major version: $RUST_VERSION"

# Clean everything
echo ""
echo "🧹 Cleaning..."
rm -f Cargo.lock
rm -rf target/ .anchor/

# Build - stable 1.81+ supports lockfile v4 natively
echo ""
echo "🏗️  Building with Rust stable (lockfile v4 supported)..."

if anchor build; then
    echo ""
    echo "✅✅✅ SUCCESS! ✅✅✅"
    echo ""
    echo "📦 Built program:"
    ls -lh target/deploy/*.so
    echo ""
    echo "📍 Program ID:"
    solana address -k target/deploy/plugumons_staking-keypair.json
    echo ""
    echo "🎯 Next: anchor deploy --provider.cluster devnet"
    exit 0
else
    echo ""
    echo "❌ Build failed with stable"
    echo ""
    echo "🔍 Diagnostics:"
    echo "   Rust: $(rustc --version)"
    echo "   Anchor: $(anchor --version)"
    echo "   Solana: $(solana --version)"
    echo ""
    echo "💡 Last resort: Try building without Anchor:"
    echo "   cd programs/plugumons-staking"
    echo "   cargo build-sbf"
    exit 1
fi
