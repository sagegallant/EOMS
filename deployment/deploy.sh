#!/usr/bin/env bash
# ==============================================================================
# Employee Onboarding Management System (EOMS) - Production Deployment Script
# ==============================================================================

set -euo pipefail

echo "🚀 Starting EOMS Automated Production Deployment..."

# 1. Verify Prerequisites
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required but not installed."; exit 1; }

echo "✔ Prerequisites verified: Node $(node -v), npm $(npm -v)"

# 2. Server Installation & Seeding
echo "📦 Installing server dependencies..."
cd server
npm ci --prefer-offline || npm install

echo "🌱 Running database migrations and idempotent corporate seeding..."
npm run seed

echo "🧪 Running automated multi-phase test suite..."
npm test

# 3. Client Installation & Production Bundle Build
echo "📦 Building client production bundle..."
cd ../client
npm ci --prefer-offline || npm install
npm run build

echo "🎉 EOMS successfully verified, seeded, and built for production deployment!"
echo "To launch in production:"
echo "  - Backend: cd server && npm start"
echo "  - Frontend: serve -s client/dist -l 3000"
