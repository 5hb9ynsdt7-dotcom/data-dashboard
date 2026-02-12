#!/bin/bash
# Start script for Railway deployment

echo "=== Starting Data Dashboard ==="

# Activate virtual environment
source /opt/venv/bin/activate

# Check if build directory exists
if [ ! -d "build" ]; then
    echo "Error: build directory not found!"
    echo "This should have been created during the build phase."
    exit 1
fi

echo "✓ Build directory found"
echo "✓ Virtual environment activated"
echo "Starting Flask server..."

# Start the Flask application
python app.py
