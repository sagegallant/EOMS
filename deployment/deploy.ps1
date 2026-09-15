# ==============================================================================
# Employee Onboarding Management System (EOMS) - Windows Production Deployment
# ==============================================================================

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting EOMS Automated Production Deployment..." -ForegroundColor Cyan

# 1. Verify Prerequisites
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "❌ Node.js is required but not installed."
    exit 1
}

Write-Host "✔ Prerequisites verified: Node $(node -v)" -ForegroundColor Green

# 2. Server Installation & Seeding
Write-Host "📦 Installing server dependencies..." -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot\..\server"
npm install

Write-Host "🌱 Running database migrations and idempotent corporate seeding..." -ForegroundColor Yellow
npm run seed

Write-Host "🧪 Running automated multi-phase test suite..." -ForegroundColor Yellow
npm test

# 3. Client Installation & Production Bundle Build
Write-Host "📦 Building client production bundle..." -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot\..\client"
npm install
npm run build

Write-Host "🎉 EOMS successfully verified, seeded, and built for production deployment!" -ForegroundColor Green
Write-Host "To launch in production:"
Write-Host "  - Backend: cd server; npm start"
Write-Host "  - Frontend: npx serve -s client/dist -l 3000"
