# Quick Build Test Script for Hadal Pool
# Run this to test if everything is ready for deployment

Write-Host "`n🔧 Testing Hadal Pool Build...`n" -ForegroundColor Yellow

# Test 1: Check Node.js
Write-Host "1. Checking Node.js version..." -ForegroundColor Cyan
$nodeVersion = node --version
Write-Host "   ✓ Node.js: $nodeVersion" -ForegroundColor Green

# Test 2: Check if dependencies are installed
Write-Host "`n2. Checking dependencies..." -ForegroundColor Cyan
if (Test-Path "node_modules") {
    Write-Host "   ✓ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "   ✗ Dependencies NOT installed. Run: npm install" -ForegroundColor Red
    exit 1
}

# Test 3: Test build
Write-Host "`n3. Testing build..." -ForegroundColor Cyan
Write-Host "   Running: npm run build`n" -ForegroundColor Gray
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n   ✓ Build successful!" -ForegroundColor Green
    
    # Check build output
    if (Test-Path "dist/public/index.html") {
        Write-Host "   ✓ Build output exists in dist/public/" -ForegroundColor Green
        
        # Check file sizes
        $htmlSize = (Get-Item "dist/public/index.html").Length
        Write-Host "   ✓ index.html size: $([math]::Round($htmlSize/1KB, 2)) KB" -ForegroundColor Green
        
        Write-Host "`n✅ ALL TESTS PASSED! Ready for deployment!`n" -ForegroundColor Green
    } else {
        Write-Host "   ⚠ Build completed but dist/public/index.html not found" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n   ✗ Build FAILED! Fix errors before deployment." -ForegroundColor Red
    Write-Host "`n   Check the errors above and fix them.`n" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Test locally: npm run dev" -ForegroundColor White
Write-Host "   2. Verify branding shows 'Hadal Pool'" -ForegroundColor White
Write-Host "   3. Get API keys from boss" -ForegroundColor White
Write-Host "   4. Test Ledger Nano connection" -ForegroundColor White
Write-Host "`n"


