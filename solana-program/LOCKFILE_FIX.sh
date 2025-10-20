#!/bin/bash
# Fix Cargo.lock version 4 issue

echo "🔧 Fixing Cargo.lock version issue..."

# Step 1: Go to parent directory
cd /mnt/c/Users/GamingPc/Plugumons

# Step 2: Pull latest changes (includes .gitignore and resolver fix)
echo "📥 Pulling latest changes from GitHub..."
git pull origin main

# Step 3: Go to solana-program
cd solana-program

# Step 4: Remove Cargo.lock if it exists
echo "🗑️  Removing old Cargo.lock..."
rm -f Cargo.lock
find . -name "Cargo.lock" -delete

# Step 5: Update Rust to latest stable
echo "🦀 Updating Rust to latest stable..."
rustup update stable
rustup default stable

# Step 6: Clean everything
echo "🧹 Cleaning build artifacts..."
rm -rf target/
rm -rf .anchor/
anchor clean 2>/dev/null || true

# Step 7: Build with proper environment
echo "🏗️  Building program..."
CARGO_NET_GIT_FETCH_WITH_CLI=true anchor build

# Check if build succeeded
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "📦 Built artifacts:"
    ls -lh target/deploy/*.so 2>/dev/null || echo "   (checking...)"
    echo ""
    echo "🎯 Next steps:"
    echo "   1. Deploy to devnet: anchor deploy --provider.cluster devnet"
    echo "   2. Initialize pool: anchor run initialize"
    echo "   3. Fund pool: anchor run fund-pool"
else
    echo "❌ Build failed. Checking diagnostics..."
    echo ""
    echo "📋 System info:"
    echo "   Rust: $(rustc --version)"
    echo "   Anchor: $(anchor --version)"
    echo "   Solana: $(solana --version)"
fi
