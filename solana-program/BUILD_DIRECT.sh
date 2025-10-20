#!/bin/bash
# Build directly with cargo-build-sbf, bypassing Anchor

echo "🔧 Direct Build - Bypassing Anchor CLI"
echo "   Using Solana's cargo-build-sbf directly"
echo ""

cd /mnt/c/Users/GamingPc/Plugumons/solana-program

# Use system stable Rust
rustup default stable

echo "✅ Rust version: $(rustc --version)"
echo "✅ Solana version: $(solana --version)"
echo ""

# Clean
rm -f Cargo.lock
rm -rf target/

# Build the program directly
echo "🏗️  Building program with cargo-build-sbf..."
cd programs/plugumons-staking

if cargo build-sbf; then
    echo ""
    echo "✅✅✅ SUCCESS! Program built! ✅✅✅"
    echo ""
    echo "📦 Output:"
    find ../../target -name "*.so" -type f
    echo ""
    echo "💡 To deploy:"
    echo "   solana program deploy ../../target/deploy/plugumons_staking.so --program-id ../../target/deploy/plugumons_staking-keypair.json"
else
    echo ""
    echo "❌ Direct build also failed"
    echo ""
    echo "📋 Please check:"
    echo "   1. Solana CLI installed: solana --version"
    echo "   2. BPF toolchain installed: solana-install init"
    echo "   3. Try: rustup default stable && rustup update"
fi
