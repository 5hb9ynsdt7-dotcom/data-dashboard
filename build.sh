#!/bin/bash
# Railway build script for Data Dashboard

echo "=== Building Data Dashboard ==="

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install --production=false

# Build React frontend
echo "Building React frontend..."
npm run build

# Verify build
if [ -f "build/index.html" ]; then
    echo "✓ Build successful: build/index.html exists"
else
    echo "✗ Build failed: build/index.html not found"
    exit 1
fi

echo "=== Build complete ==="
