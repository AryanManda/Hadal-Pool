# Privacy Mixer Deployment Script
# Run this script to deploy the project

Write-Host "🚀 Privacy Mixer Deployment Script" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (-not (Test-Path .env)) {
    Write-Host "⚠️  WARNING: .env file not found!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please create a .env file with the following variables:" -ForegroundColor Yellow
    Write-Host "  SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY" -ForegroundColor Gray
    Write-Host "  PRIVATE_KEY=your_private_key_here" -ForegroundColor Gray
    Write-Host "  ETHERSCAN_API_KEY=your_etherscan_key" -ForegroundColor Gray
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}

# Check Hardhat installation
Write-Host "📦 Checking Hardhat installation..." -ForegroundColor Cyan
$hardhatVersion = npx hardhat --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Hardhat installed: $hardhatVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Hardhat not found. Installing..." -ForegroundColor Red
    npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
}

Write-Host ""
Write-Host "Select deployment option:" -ForegroundColor Cyan
Write-Host "1. Deploy Smart Contract to Sepolia (Testnet)" -ForegroundColor White
Write-Host "2. Deploy Smart Contract to Mainnet (⚠️  Requires security audit!)" -ForegroundColor White
Write-Host "3. Build Frontend/Backend only" -ForegroundColor White
Write-Host "4. Full Deployment (Contract + Frontend/Backend)" -ForegroundColor White
Write-Host ""
$choice = Read-Host "Enter your choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🚀 Deploying to Sepolia Testnet..." -ForegroundColor Cyan
        npx hardhat run deploy-sepolia.cjs
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ Contract deployed successfully!" -ForegroundColor Green
            Write-Host "📝 Next steps:" -ForegroundColor Yellow
            Write-Host "   1. Update client/src/lib/contracts.ts with the new address" -ForegroundColor Gray
            Write-Host "   2. Test deposits and withdrawals" -ForegroundColor Gray
        }
    }
    "2" {
        Write-Host ""
        Write-Host "⚠️  WARNING: Mainnet deployment requires:" -ForegroundColor Red
        Write-Host "   - Security audit" -ForegroundColor Yellow
        Write-Host "   - Extensive testnet testing" -ForegroundColor Yellow
        Write-Host "   - Multi-sig wallet setup" -ForegroundColor Yellow
        Write-Host ""
        $confirm = Read-Host "Are you sure you want to deploy to Mainnet? (yes/no)"
        if ($confirm -eq "yes") {
            Write-Host ""
            Write-Host "🚀 Deploying to Mainnet..." -ForegroundColor Cyan
            npx hardhat run scripts/deploy.cjs --network mainnet
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "✅ Contract deployed successfully!" -ForegroundColor Green
                Write-Host "📝 Next steps:" -ForegroundColor Yellow
                Write-Host "   1. Verify contracts on Etherscan" -ForegroundColor Gray
                Write-Host "   2. Update client/src/lib/contracts.ts with the new address" -ForegroundColor Gray
            }
        } else {
            Write-Host "Deployment cancelled." -ForegroundColor Yellow
        }
    }
    "3" {
        Write-Host ""
        Write-Host "🏗️  Building Frontend/Backend..." -ForegroundColor Cyan
        npm run build
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ Build completed successfully!" -ForegroundColor Green
            Write-Host "📝 Next steps:" -ForegroundColor Yellow
            Write-Host "   - Deploy dist/ folder to your hosting provider" -ForegroundColor Gray
            Write-Host "   - Or use: vercel --prod (for Vercel)" -ForegroundColor Gray
            Write-Host "   - Or use: netlify deploy --prod --dir=dist/public (for Netlify)" -ForegroundColor Gray
        }
    }
    "4" {
        Write-Host ""
        Write-Host "🚀 Full Deployment..." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Step 1: Deploying Smart Contract..." -ForegroundColor Cyan
        $network = Read-Host "Deploy to Sepolia or Mainnet? (sepolia/mainnet)"
        if ($network -eq "mainnet") {
            Write-Host "⚠️  WARNING: Mainnet deployment requires security audit!" -ForegroundColor Red
            $confirm = Read-Host "Continue? (yes/no)"
            if ($confirm -ne "yes") {
                exit 1
            }
            npx hardhat run scripts/deploy.cjs --network mainnet
        } else {
            npx hardhat run deploy-sepolia.cjs
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "Step 2: Building Frontend/Backend..." -ForegroundColor Cyan
            npm run build
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "✅ Full deployment completed!" -ForegroundColor Green
                Write-Host "📝 Next steps:" -ForegroundColor Yellow
                Write-Host "   1. Update contract address in client/src/lib/contracts.ts" -ForegroundColor Gray
                Write-Host "   2. Deploy dist/ folder to hosting" -ForegroundColor Gray
            }
        }
    }
    default {
        Write-Host "Invalid choice. Exiting." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "✨ Deployment process completed!" -ForegroundColor Green



