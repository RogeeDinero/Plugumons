#!/bin/bash
# Build with Rust nightly using the lockfile v4 flag

echo "🚀 Building Solana program with Rust nightly + lockfile v4 support"
echo ""

cd /mnt/c/Users/GamingPc/Plugumons/solana-program

# Install nightly if not present
echo "📦 Installing Rust nightly..."
rustup install nightly

# Set nightly as override for this directory
rustup override set nightly

# Verify
echo ""
echo "✅ Active Rust version:"
rustc --version

# Clean
echo ""
echo "🧹 Cleaning build artifacts..."
rm -f Cargo.lock
rm -rf target/ .anchor/

# Build with lockfile v4 flag
echo ""
echo "🏗️  Building with -Znext-lockfile-bump flag..."
RUSTFLAGS="-Znext-lockfile-bump" cargo build-sbf

# If cargo build-sbf doesn't work, try regular anchor build
if [ $? -ne 0 ]; then
    echo ""
    echo "Trying alternative: cargo +nightly build with flag..."
    cargo +nightly build --release -Z next-lockfile-bump
fi

# Try anchor build with nightly
if [ $? -ne 0 ]; then
    echo ""
    echo "Trying: anchor build with nightly override..."
    CARGO="+nightly" anchor build
fi

echo ""
echo "📋 If build succeeded, you should see .so files in target/deploy/"
ls -lh target/deploy/*.so 2>/dev/null || echo "❌ No .so files found"
