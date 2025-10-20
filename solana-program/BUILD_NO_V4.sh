#!/bin/bash
# Build without lockfile version 4 by using older Cargo behavior

echo "🎯 Building without lockfile v4 (using environment override)"
echo ""

cd /mnt/c/Users/GamingPc/Plugumons/solana-program

# Ensure stable Rust
rustup default stable

echo "✅ Rust: $(rustc --version)"
echo "✅ Cargo: $(cargo --version)"
echo ""

# Deep clean
echo "🧹 Cleaning..."
rm -f Cargo.lock programs/*/Cargo.lock
rm -rf target/ .anchor/

# Method 1: Try with CARGO_RESOLVER_INCOMPATIBLE_RUST_VERSIONS=fallback
echo "🏗️  Method 1: Building with resolver fallback..."
CARGO_RESOLVER_INCOMPATIBLE_RUST_VERSIONS=fallback anchor build 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Method 1 succeeded!"
    ls -lh target/deploy/*.so
    exit 0
fi

echo ""
echo "❌ Method 1 failed"
echo ""

# Method 2: Build each program individually
echo "🏗️  Method 2: Building programs individually..."
cd programs/plugumons-staking

cargo build-sbf 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Method 2 succeeded!"
    find ../../target -name "*.so"
    exit 0
fi

echo ""
echo "❌ Method 2 failed"
echo ""

# Method 3: Try with --locked flag removed (generate fresh lockfile)
echo "🏗️  Method 3: Fresh lockfile generation..."
cd ../..
anchor build --skip-lint 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Method 3 succeeded!"
    ls -lh target/deploy/*.so
    exit 0
fi

echo ""
echo "❌ All methods failed"
echo ""
echo "📋 This appears to be an Anchor 0.32.1 + Solana CLI compatibility issue"
echo ""
echo "🎯 Recommendations:"
echo "   1. Try building on a different machine/OS"
echo "   2. Use Docker: docker run -v \$(pwd):/workspace projectserum/build anchor build"
echo "   3. Downgrade to Anchor 0.29.0 (more stable)"
echo "   4. Wait for Anchor 0.32.2 which may fix this issue"
