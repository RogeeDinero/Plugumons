#!/bin/bash
# Downgrade to Anchor 0.29.0 - Most reliable solution

echo "🎯 Downgrading to Anchor 0.29.0 (stable, proven)"
echo "   This is the MOST RELIABLE solution for the lockfile issue"
echo ""

cd /mnt/c/Users/GamingPc/Plugumons/solana-program

# Install Anchor 0.29.0
echo "📦 Installing Anchor 0.29.0..."
avm install 0.29.0 --force
avm use 0.29.0

echo ""
echo "✅ Anchor version:"
anchor --version

# Update Anchor.toml
echo ""
echo "📝 Updating Anchor.toml..."
sed -i 's/anchor_version = "0.32.1"/anchor_version = "0.29.0"/' Anchor.toml

# Update program Cargo.toml
echo "📝 Updating program Cargo.toml..."
sed -i 's/anchor-lang = "0.32.1"/anchor-lang = "0.29.0"/' programs/plugumons-staking/Cargo.toml
sed -i 's/anchor-spl = "0.32.1"/anchor-spl = "0.29.0"/' programs/plugumons-staking/Cargo.toml

# Show changes
echo ""
echo "✅ Configuration updated:"
echo "   Anchor.toml:"
grep anchor_version Anchor.toml
echo "   Cargo.toml:"
grep "anchor-" programs/plugumons-staking/Cargo.toml

# Clean everything
echo ""
echo "🧹 Cleaning build artifacts..."
rm -f Cargo.lock
rm -f programs/*/Cargo.lock
rm -rf target/
rm -rf .anchor/

# Set Rust version
rustup default stable
echo ""
echo "✅ Rust: $(rustc --version)"

# Build
echo ""
echo "🏗️  Building with Anchor 0.29.0..."
echo "   (This should work now!)"
echo ""

if anchor build; then
    echo ""
    echo "✅✅✅ SUCCESS! Build completed with Anchor 0.29.0 ✅✅✅"
    echo ""
    echo "📦 Built program:"
    ls -lh target/deploy/*.so
    echo ""
    echo "📍 Program ID:"
    solana address -k target/deploy/plugumons_staking-keypair.json
    echo ""
    echo "🎯 Next steps:"
    echo "   1. Deploy to devnet: anchor deploy --provider.cluster devnet"
    echo "   2. Initialize pool: anchor run initialize"
    echo "   3. Fund pool: anchor run fund-pool"
    echo ""
    echo "✅ Your program is ready to deploy!"
    exit 0
else
    echo ""
    echo "❌ Build failed even with Anchor 0.29.0"
    echo ""
    echo "🔍 This suggests a deeper issue with your environment."
    echo ""
    echo "📋 Diagnostics:"
    echo "   Rust: $(rustc --version)"
    echo "   Anchor: $(anchor --version)"
    echo "   Solana: $(solana --version)"
    echo ""
    echo "💡 Try:"
    echo "   1. Building on a different machine"
    echo "   2. Using Docker (see FINAL_SOLUTION.md)"
    echo "   3. Manual build: cd programs/plugumons-staking && cargo build-sbf"
    exit 1
fi
