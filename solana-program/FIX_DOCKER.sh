#!/bin/bash
# Fix Docker permissions in WSL

echo "🐳 Fixing Docker permissions for WSL"
echo ""

# Add user to docker group
echo "1️⃣ Adding user to docker group..."
sudo usermod -aG docker $USER

echo "   ✅ User added to docker group"
echo ""

# Start Docker service
echo "2️⃣ Starting Docker service..."
sudo service docker start

echo "   ✅ Docker service started"
echo ""

# Test Docker
echo "3️⃣ Testing Docker..."
docker ps

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Docker is working!"
    echo ""
    echo "🎯 Now you can build with Docker:"
    echo ""
    echo "   docker pull projectserum/build:v0.29.0"
    echo "   docker run --rm -v \$(pwd):/workspace -w /workspace projectserum/build:v0.29.0 anchor build"
    echo ""
else
    echo ""
    echo "⚠️  Docker test failed"
    echo ""
    echo "💡 You may need to:"
    echo "   1. Log out and log back in (for group changes to take effect)"
    echo "   2. Or run: newgrp docker"
    echo "   3. Make sure Docker Desktop is running on Windows"
    echo ""
    echo "Then try again:"
    echo "   docker ps"
fi
