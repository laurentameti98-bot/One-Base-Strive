#!/usr/bin/env bash

# Dev runner that ensures correct Node version and pnpm setup
# Usage: ./scripts/dev.sh or pnpm dev:cursor

set -euo pipefail

echo "🔧 Setting up development environment..."

# Source nvm (works in non-interactive shells)
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  echo "📦 Loading nvm..."
  source "$NVM_DIR/nvm.sh"
else
  echo "❌ Error: nvm not found at $NVM_DIR/nvm.sh"
  echo "Please install nvm: https://github.com/nvm-sh/nvm"
  exit 1
fi

# Use Node 20 LTS
echo "🔄 Switching to Node 20..."
nvm use 20 || {
  echo "📥 Node 20 not installed, installing..."
  nvm install 20
  nvm use 20
}

# Show Node version
NODE_VERSION=$(node --version)
echo "✅ Using Node $NODE_VERSION"

# Activate pnpm via corepack
echo "🔧 Activating pnpm@9.0.0..."
corepack enable 2>/dev/null || {
  echo "⚠️  corepack enable failed (might need sudo), trying to continue..."
}
corepack prepare pnpm@9.0.0 --activate

# Ensure we're in the project root
cd "$(dirname "$0")/.."

# Check if node_modules exists and better-sqlite3 is compiled for current Node version
if [ -d "node_modules" ]; then
  echo "🔍 Checking if dependencies need rebuilding..."
  # Try to run a quick check from apps/api - if better-sqlite3 fails, we need to rebuild
  (cd apps/api && node -e "require('better-sqlite3')") 2>/dev/null || {
    echo "🔄 Rebuilding native dependencies for Node $NODE_VERSION..."
    pnpm rebuild better-sqlite3
  }
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies with pnpm..."
  pnpm install
fi

# Start development servers
echo ""
echo "🚀 Starting development servers..."
echo ""

pnpm dev
