# Museum Space - Force Deployment Script
# Deploys to Vercel even when there are no code changes
# Useful for configuration changes, environment updates, or manual triggers

param(
    [switch]$Production,  # Deploy to production (default: preview)
    [switch]$Silent,      # Run without prompts
    [string]$Reason = "Manual deployment trigger"  # Deployment reason
)

$Colors = @{
    Green = "Green"; Red = "Red"; Yellow = "Yellow"; Cyan = "Cyan"; Blue = "Blue"; Magenta = "Magenta"
}

function Write-Success($msg) { Write-Host "✅ $msg" -ForegroundColor $Colors.Green }
function Write-Error($msg) { Write-Host "❌ $msg" -ForegroundColor $Colors.Red }
function Write-Info($msg) { Write-Host "ℹ️  $msg" -ForegroundColor $Colors.Cyan }
function Write-Deploy($msg) { Write-Host "🚀 $msg" -ForegroundColor $Colors.Magenta }

# Header
Write-Host ""
Write-Host "============================================================" -ForegroundColor $Colors.Magenta
Write-Host "   🚀 Museum Space - Force Deployment" -ForegroundColor $Colors.Magenta
Write-Host "============================================================" -ForegroundColor $Colors.Magenta
Write-Host ""

# Change to project directory
Set-Location "C:\Users\user\Museum-Space-B10"

# Show deployment info
$targetEnv = if ($Production) { "PRODUCTION" } else { "PREVIEW" }
$targetUrl = if ($Production) { "https://betlemi10.com" } else { "https://[preview-url].vercel.app" }

Write-Info "Force deployment configuration:"
Write-Host "├─ Target: $targetEnv" -ForegroundColor $Colors.Yellow
Write-Host "├─ Reason: $Reason" -ForegroundColor $Colors.Blue
Write-Host "└─ URL: $targetUrl" -ForegroundColor $Colors.Blue
Write-Host ""

# Confirmation (unless silent)
if (!$Silent) {
    $confirm = Read-Host "🤔 Proceed with force deployment? (y/n)"
    if ($confirm -ne "y" -and $confirm -ne "Y") {
        Write-Info "Deployment cancelled by user"
        exit 0
    }
}

try {
    # Create a deployment trigger
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $triggerContent = @"
Force Deployment Trigger
========================
Timestamp: $timestamp
Reason: $Reason
Target: $targetEnv
Triggered by: $env:USERNAME
"@

    Write-Info "Creating deployment trigger..."
    $triggerContent | Out-File "deploy-trigger.txt" -Encoding UTF8
    
    # Git operations
    Write-Info "Committing trigger..."
    git add deploy-trigger.txt
    git commit -m "🚀 Force deploy trigger: $Reason [$timestamp]"
    
    Write-Info "Pushing to GitHub..."
    git push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Trigger committed and pushed to GitHub"
    } else {
        Write-Error "Git push failed - continuing with direct Vercel deployment"
    }
    
    # Direct Vercel deployment
    Write-Deploy "Triggering Vercel deployment..."
    
    if ($Production) {
        Write-Deploy "Deploying to PRODUCTION..."
        vercel --prod --yes --force
    } else {
        Write-Deploy "Deploying to PREVIEW..."
        vercel --yes --force
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Vercel deployment triggered successfully!"
        
        Write-Host ""
        Write-Host "============================================================" -ForegroundColor $Colors.Green
        Write-Host "   ✅ FORCE DEPLOYMENT COMPLETED" -ForegroundColor $Colors.Green
        Write-Host "============================================================" -ForegroundColor $Colors.Green
        Write-Host "🌐 Target URL: $targetUrl" -ForegroundColor $Colors.Blue
        Write-Host "⏱️  Live in: ~30-90 seconds" -ForegroundColor $Colors.Yellow
        Write-Host "============================================================" -ForegroundColor $Colors.Green
        Write-Host ""
        
        # Optional URL opening
        if (!$Silent) {
            $openUrl = Read-Host "🌐 Open deployment URL? (y/n)"
            if ($openUrl -eq "y" -or $openUrl -eq "Y") {
                if ($Production) {
                    Start-Process "https://betlemi10.com"
                } else {
                    Write-Info "Preview URL will be shown in Vercel CLI output above"
                }
            }
        }
    } else {
        Write-Error "Vercel deployment failed (exit code: $LASTEXITCODE)"
        exit 1
    }
    
} catch {
    Write-Error "Force deployment failed: $($_.Exception.Message)"
    exit 1
}

if (!$Silent) {
    Read-Host "Press Enter to exit"
}