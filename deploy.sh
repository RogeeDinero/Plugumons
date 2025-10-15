#!/bin/bash

# Plugumons Staking Deployment Script
# This script helps deploy to various platforms

echo "🚀 Plugumons Staking Deployment Helper"
echo "======================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env file with your REWARD_WALLET_PRIVATE_KEY"
    exit 1
fi

# Check if private key is set
if grep -q "YOUR_PRIVATE_KEY_HERE" .env; then
    echo "❌ Error: Private key not configured!"
    echo "Please replace YOUR_PRIVATE_KEY_HERE in .env with your actual key"
    exit 1
fi

echo "✅ Environment configuration found"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Test the server
echo "🧪 Testing server..."
node server.js &
SERVER_PID=$!
sleep 3

# Check if server is running
if ps -p $SERVER_PID > /dev/null; then
    echo "✅ Server started successfully"
    
    # Test API
    HEALTH_CHECK=$(curl -s http://localhost:3000/api/health)
    if [[ $HEALTH_CHECK == *"ok"* ]]; then
        echo "✅ API health check passed"
    else
        echo "❌ API health check failed"
        kill $SERVER_PID
        exit 1
    fi
    
    kill $SERVER_PID
    sleep 1
else
    echo "❌ Server failed to start"
    exit 1
fi

echo ""
echo "✅ All checks passed! Ready for deployment"
echo ""
echo "Choose your deployment method:"
echo "1. VPS/EC2 (Manual deployment)"
echo "2. Heroku (Cloud platform)"
echo "3. Render (Cloud platform)"
echo "4. PM2 (Local production)"
echo ""
read -p "Enter choice (1-4) or press Enter to skip: " choice

case $choice in
    1)
        echo ""
        echo "📋 VPS Deployment Instructions:"
        echo "1. Copy all files to your server"
        echo "2. Run: npm install"
        echo "3. Run: pm2 start server.js --name plugumons-staking"
        echo ""
        echo "See DEPLOYMENT.md for detailed instructions"
        ;;
    2)
        echo ""
        echo "📋 Heroku Deployment:"
        echo "Run these commands:"
        echo "  heroku create plugumons-staking"
        echo "  heroku config:set REWARD_WALLET_PRIVATE_KEY=your_key"
        echo "  git push heroku main"
        ;;
    3)
        echo ""
        echo "📋 Render Deployment:"
        echo "1. Push code to GitHub"
        echo "2. Go to https://render.com"
        echo "3. Create new Web Service from your repo"
        echo "4. Add REWARD_WALLET_PRIVATE_KEY in environment variables"
        ;;
    4)
        echo ""
        echo "🚀 Starting with PM2..."
        if ! command -v pm2 &> /dev/null; then
            echo "Installing PM2..."
            npm install -g pm2
        fi
        pm2 start server.js --name plugumons-staking
        pm2 save
        echo "✅ Server running with PM2"
        echo "Use 'pm2 logs' to view logs"
        echo "Use 'pm2 status' to check status"
        ;;
    *)
        echo ""
        echo "💡 Manual deployment selected"
        echo "Run: npm start (for development)"
        echo "Or see DEPLOYMENT.md for production deployment"
        ;;
esac

echo ""
echo "✅ Deployment helper complete!"
echo ""
echo "📚 Documentation:"
echo "  - DEPLOYMENT.md - Full deployment guide"
echo "  - STAKING_SETUP.md - Features & setup"
echo "  - QUICK_START.md - Quick start guide"
echo ""
