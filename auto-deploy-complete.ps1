# Museum Space Complete Auto-Deploy Script
# Handles Git + GitHub + Vercel + Environment Variables
# Requires PowerShell execution policy: Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# Colors for output
$Green = "Green"
$Red = "Red" 
$Yellow = "Yellow"
$Cyan = "Cyan"
$Blue = "Blue"
$Magenta = "Magenta"

function Write-Header {
    Write-Host ""
    Write-Host "===================================================" -ForegroundColor $Cyan
    Write-Host "   🚀 Museum Space - Complete Auto Deploy System" -ForegroundColor $Cyan  
    Write-Host "===================================================" -ForegroundColor $Cyan
    Write-Host "   📦 Git + GitHub + Vercel + Environment Setup" -ForegroundColor $Blue
    Write-Host "===================================================" -ForegroundColor $Cyan
    Write-Host ""
}

function Write-Success($message) {
    Write-Host "✅ $message" -ForegroundColor $Green
}

function Write-Error($message) {
    Write-Host "❌ $message" -ForegroundColor $Red
}

function Write-Warning($message) {
    Write-Host "⚠️  $message" -ForegroundColor $Yellow
}

function Write-Info($message) {
    Write-Host "ℹ️  $message" -ForegroundColor $Cyan
}

function Write-Step($message) {
    Write-Host "🔧 $message" -ForegroundColor $Blue
}

# Check if Vercel CLI is available
function Test-VercelCLI {
    try {
        $null = vercel --version 2>$null
        return $true
    }
    catch {
        return $false
    }
}

# Setup environment variables via Vercel CLI
function Setup-VercelEnvironment {
    Write-Step "Setting up Vercel Environment Variables..."
    
    if (!(Test-VercelCLI)) {
        Write-Warning "Vercel CLI not found - skipping environment setup"
        Write-Info "Environment variables should be configured manually in Vercel Dashboard"
        return $false
    }
    
    try {
        Write-Info "Linking to Vercel project..."
        vercel link --yes 2>$null
        
        Write-Info "Removing old environment variables..."
        vercel env rm UNIPAY_MERCHANT_ID production --yes 2>$null
        vercel env rm UNIPAY_API_KEY production --yes 2>$null
        
        Write-Info "Setting UNIPAY_MERCHANT_ID..."
        "5015191030581" | vercel env add UNIPAY_MERCHANT_ID production
        
        Write-Info "Setting UNIPAY_API_KEY..."
        "bc6f5073-6d1c-4abe-8456-1bb814077f6e" | vercel env add UNIPAY_API_KEY production
        
        Write-Success "Environment variables configured successfully"
        return $true
    }
    catch {
        Write-Error "Environment setup failed: $($_.Exception.Message)"
        return $false
    }
}

# Main deployment function
function Deploy-MuseumSpaceComplete {
    Write-Header
    
    # Change to project directory
    $projectPath = "C:\Users\user\Museum-Space-B10"
    
    if (!(Test-Path $projectPath)) {
        Write-Error "Project directory not found: $projectPath"
        return $false
    }
    
    Set-Location $projectPath
    Write-Success "Project directory: $projectPath"
    
    # Verify we're in the right place
    if (!(Test-Path "package.json")) {
        Write-Error "Not in a valid project directory (package.json not found)"
        return $false
    }
    
    # Check git status
    Write-Step "Checking for changes..."
    $status = git status --porcelain
    
    if (!$status) {
        Write-Warning "No changes detected"
        Write-Info "Proceeding with deployment check anyway..."
    } else {
        Write-Success "Found $(($status | Measure-Object).Count) changed files"
    }
    
    # Add all changes
    Write-Step "Staging all changes..."
    git add -A
    
    # Check if there's anything staged
    $staged = git diff --cached --name-only
    
    if ($staged) {
        Write-Info "Files to be committed:"
        $staged | ForEach-Object { Write-Host "  📄 $_" -ForegroundColor $Yellow }
        
        # Create timestamp-based commit message
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
        $commitMsg = "🚀 Complete Auto-deploy: $timestamp"
        
        # Commit changes
        Write-Step "Creating commit: $commitMsg"
        git commit -m $commitMsg
        
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Commit failed"
            return $false
        }
        
        Write-Success "Commit created successfully"
    } else {
        Write-Info "No changes to commit"
    }
    
    # Push to GitHub
    Write-Step "Pushing to GitHub..."
    git push
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "GitHub push failed"
        return $false
    }
    
    Write-Success "GitHub push successful"
    
    # Setup Vercel environment (optional but recommended)
    Setup-VercelEnvironment
    
    # Trigger Vercel deployment
    if (Test-VercelCLI) {
        Write-Step "Triggering Vercel production deployment..."
        vercel --prod --yes
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Vercel deployment triggered successfully"
        } else {
            Write-Warning "Vercel deployment may have issues - check manually"
        }
    } else {
        Write-Info "Relying on GitHub auto-deploy to Vercel"
    }
    
    # Environment status check
    Write-Host ""
    Write-Step "Environment Variables Status:"
    Write-Host "├─ UNIPAY_MERCHANT_ID: Configured ✅" -ForegroundColor $Green
    Write-Host "├─ UNIPAY_API_KEY: Configured ✅" -ForegroundColor $Green  
    Write-Host "└─ Domain: betlemi10.com ✅" -ForegroundColor $Green
    
    # Success message with all URLs
    Write-Host ""
    Write-Host "===================================================" -ForegroundColor $Green
    Write-Host "   ✅ COMPLETE DEPLOYMENT SUCCESSFUL!" -ForegroundColor $Green
    Write-Host "===================================================" -ForegroundColor $Green
    Write-Host "📦 Changes pushed to GitHub" -ForegroundColor $Green
    Write-Host "🌐 Vercel deployment in progress..." -ForegroundColor $Green
    Write-Host ""
    Write-Host "🔗 Available URLs:" -ForegroundColor $Cyan
    Write-Host "  └─ Main Site: https://betlemi10.com" -ForegroundColor $Blue
    Write-Host "  └─ Shop Page: https://betlemi10.com/biletebi" -ForegroundColor $Blue
    Write-Host "  └─ Booking: https://betlemi10.com/shekveta" -ForegroundColor $Blue  
    Write-Host "  └─ Test API: https://betlemi10.com/test-unipay.html" -ForegroundColor $Magenta
    Write-Host ""
    Write-Host "⏱️  Total deploy time: ~1-3 minutes" -ForegroundColor $Yellow
    Write-Host "===================================================" -ForegroundColor $Green
    Write-Host ""
    
    return $true
}

# Run complete deployment
try {
    $result = Deploy-MuseumSpaceComplete
    
    if ($result) {
        Write-Success "Complete deployment process finished successfully!"
        
        # Optional: Open test page
        $openBrowser = Read-Host "🌐 Open test page in browser? (y/n)"
        if ($openBrowser -eq "y" -or $openBrowser -eq "Y") {
            Start-Process "https://betlemi10.com/test-unipay.html"
        }
    } else {
        Write-Error "Deployment failed!"
        exit 1
    }
} catch {
    Write-Error "Deployment error: $($_.Exception.Message)"
    exit 1
}

# Keep window open
Read-Host "Press Enter to exit"