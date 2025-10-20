#!/bin/bash
# Fix AVM installation and build

echo "🔧 Fixing Anchor installation and rebuilding"
echo ""

cd /mnt/c/Users/GamingPc/Plugumons/solana-program

# Step 1: Remove conflicting anchor binaries
echo "1️⃣ Removing conflicting Anchor binaries..."
rm -f ~/.cargo/bin/anchor
rm -f ~/.avm/bin/anchor
rm -rf ~/.avm/versions/0.29.0
rm -rf ~/.avm/versions/0.32.1

echo "   ✅ Cleaned up existing Anchor installations"
echo ""

# Step 2: Reinstall AVM itself
echo "2️⃣ Reinstalling AVM..."
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force

echo "   ✅ AVM reinstalled"
echo ""

# Step 3: Install Anchor 0.29.0
echo "3️⃣ Installing Anchor 0.29.0..."
avm install 0.29.0
avm use 0.29.0

echo ""
echo "   ✅ Anchor version:"
anchor --version
echo ""

# Step 4: Update config files
echo "4️⃣ Updating configuration..."
sed -i 's/anchor_version = "0.32.1"/anchor_version = "0.29.0"/' Anchor.toml
sed -i 's/anchor-lang = "0.32.1"/anchor-lang = "0.29.0"/' programs/plugumons-staking/Cargo.toml
sed -i 's/anchor-spl = "0.32.1"/anchor-spl = "0.29.0"/' programs/plugumons-staking/Cargo.toml

echo "   ✅ Configuration updated"
echo ""

# Step 5: Deep clean
echo "5️⃣ Deep cleaning build artifacts..."
rm -f Cargo.lock
find . -name "Cargo.lock" -type f -delete
rm -rf target/
rm -rf .anchor/
rm -rf programs/*/target/

echo "   ✅ Cleaned"
echo ""

# Step 6: Set Rust
rustup default stable
rustup override unset

echo "   ✅ Rust: $(rustc --version)"
echo ""

# Step 7: Build
echo "6️⃣ Building with Anchor 0.29.0..."
echo ""

if anchor build; then
    echo ""
    echo "🎉🎉🎉 SUCCESS! 🎉🎉🎉"
    echo ""
    echo "📦 Built program:"
    ls -lh target/deploy/*.so
    echo ""
    echo "📍 Program ID:"
    solana address -k target/deploy/plugumons_staking-keypair.json
    echo ""
    echo "✅ Ready to deploy!"
    exit 0
else
    echo ""
    echo "❌ Build still failed"
    echo ""
    echo "Let's try manual cargo build..."
    cd programs/plugumons-staking
    
    # Remove any lockfile here too
    rm -f Cargo.lock
    
    echo ""
    echo "Trying: cargo build-sbf"
    cargo build-sbf
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Manual build succeeded!"
        echo ""
        find ../../target -name "*.so" -type f
        exit 0
    else
        echo ""
        echo "❌ Manual build also failed"
        echo ""
        echo "📋 At this point, the issue is environmental."
        echo ""
        echo "💡 Options:"
        echo "   1. Fix Docker permissions (see next steps below)"
        echo "   2. Try on a different machine"
        echo "   3. Use Solana Playground: https://beta.solpg.io/"
        exit 1
    fi
fi
