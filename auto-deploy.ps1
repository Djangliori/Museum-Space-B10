# Museum Space Auto-Deploy Script
# Requires PowerShell execution policy: Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# Colors for output
$Green = "Green"
$Red = "Red" 
$Yellow = "Yellow"
$Cyan = "Cyan"

function Write-Header {
    Write-Host ""
    Write-Host "===================================================" -ForegroundColor $Cyan
    Write-Host "   🚀 Museum Space - Auto Deploy System" -ForegroundColor $Cyan  
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

# Main deployment function
function Deploy-MuseumSpace {
    Write-Header
    
    # Change to project directory
    $projectPath = "C:\Users\user\Desktop\Museum space"
    
    if (!(Test-Path $projectPath)) {
        Write-Error "Project directory not found: $projectPath"
        return $false
    }
    
    Set-Location $projectPath
    Write-Info "Working directory: $projectPath"
    
    # Check git status
    Write-Info "Checking for changes..."
    $status = git status --porcelain
    
    if (!$status) {
        Write-Warning "No changes detected - nothing to deploy"
        return $true
    }
    
    Write-Success "Found $(($status | Measure-Object).Count) changed files"
    
    # Add all changes
    Write-Info "Staging changes..."
    git add -A
    
    # Check if there's anything staged
    $staged = git diff --cached --name-only
    if (!$staged) {
        Write-Warning "No changes staged for commit"
        return $true
    }
    
    # Create timestamp-based commit message
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
    $commitMsg = "🚀 Auto-deploy: $timestamp"
    
    # Show what will be committed
    Write-Info "Files to be committed:"
    $staged | ForEach-Object { Write-Host "  📄 $_" -ForegroundColor $Yellow }
    
    # Commit changes
    Write-Info "Creating commit..."
    git commit -m $commitMsg
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Commit failed"
        return $false
    }
    
    Write-Success "Commit created successfully"
    
    # Push to GitHub
    Write-Info "Pushing to GitHub..."
    git push
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Push failed"
        return $false
    }
    
    # Success message
    Write-Host ""
    Write-Host "===================================================" -ForegroundColor $Green
    Write-Host "   ✅ DEPLOYMENT SUCCESSFUL!" -ForegroundColor $Green
    Write-Host "===================================================" -ForegroundColor $Green
    Write-Host "📦 Changes pushed to GitHub" -ForegroundColor $Green
    Write-Host "🌐 Vercel auto-deploy starting..." -ForegroundColor $Green
    Write-Host "🔗 Live URL: https://betlemi10.com" -ForegroundColor $Green
    Write-Host "🔗 Shop URL: https://betlemi10.com/shop.html" -ForegroundColor $Green
    Write-Host "⏱️  Deploy time: ~1-2 minutes" -ForegroundColor $Green
    Write-Host "===================================================" -ForegroundColor $Green
    Write-Host ""
    
    return $true
}

# Run deployment
try {
    $result = Deploy-MuseumSpace
    
    if ($result) {
        Write-Success "Deployment process completed successfully!"
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