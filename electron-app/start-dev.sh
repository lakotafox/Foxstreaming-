#!/bin/bash

# FoxStream Development Launcher
# Tests the Electron app before building

echo "🦊 FoxStream - Starting development mode..."

cd "$(dirname "$0")"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Start the Electron app
echo "Launching FoxStream..."
npm start
