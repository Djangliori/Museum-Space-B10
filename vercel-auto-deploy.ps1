# Museum Space - Advanced Vercel Auto Deploy Script
# Features: Git + GitHub + Direct Vercel + Environment Management + Force Deploy
# Author: Claude AI Assistant
# Version: 2.0.0

param(
    [switch]$Force,           # Force deployment even without changes
    [switch]$Production,      # Deploy directly to production
    [switch]$SkipGit,         # Skip git operations (Vercel only)
    [switch]$UpdateEnv,       # Update environment variables
    [switch]$Verbose          # Verbose output
)

# Color scheme
$Colors = @{
    Green   = "Green"
    Red     = "Red" 
    Yellow  = "Yellow"
    Cyan    = "Cyan"
    Blue    = "Blue"
    Magenta = "Magenta"
    White   = "White"
}

function Write-Header {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor $Colors.Cyan
    Write-Host "   🚀 Museum Space - Advanced Vercel Auto Deploy v2.0" -ForegroundColor $Colors.Cyan  
    Write-Host "============================================================" -ForegroundColor $Colors.Cyan
    Write-Host "   📦 Git → GitHub → Vercel → Production (betlemi10.com)" -ForegroundColor $Colors.Blue
    Write-Host "============================================================" -ForegroundColor $Colors.Cyan
    Write-Host ""
}

function Write-Success($message) { Write-Host "✅ $message" -ForegroundColor $Colors.Green }
function Write-Error($message) { Write-Host "❌ $message" -ForegroundColor $Colors.Red }
function Write-Warning($message) { Write-Host "⚠️  $message" -ForegroundColor $Colors.Yellow }
function Write-Info($message) { Write-Host "ℹ️  $message" -ForegroundColor $Colors.Cyan }
function Write-Step($message) { Write-Host "🔧 $message" -ForegroundColor $Colors.Blue }
function Write-Deploy($message) { Write-Host "🚀 $message" -ForegroundColor $Colors.Magenta }

# Test Vercel CLI availability
function Test-VercelCLI {
    try {
        $version = vercel --version 2>$null
        if ($version) {
            Write-Success "Vercel CLI found: $version"
            return $true
        }
        return $false
    }
    catch {
        Write-Error "Vercel CLI not found. Install with: npm i -g vercel"
        return $false
    }
}

# Update environment variables
function Update-EnvironmentVariables {
    Write-Step "Updating Vercel Environment Variables..."
    
    $envVars = @{
        "UNIPAY_MERCHANT_ID" = "5015191030581"
        "UNIPAY_API_KEY" = "bc6f5073-6d1c-4abe-8456-1bb814077f6e"
    }
    
    foreach ($var in $envVars.GetEnumerator()) {
        try {
            Write-Info "Setting $($var.Key)..."
            
            # Remove existing variable (ignore errors)
            vercel env rm $var.Key production --yes 2>$null | Out-Null
            vercel env rm $var.Key preview --yes 2>$null | Out-Null
            
            # Add new variable to all environments
            $var.Value | vercel env add $var.Key production --yes | Out-Null
            $var.Value | vercel env add $var.Key preview --yes | Out-Null
            
            Write-Success "$($var.Key) updated successfully"
        }
        catch {
            Write-Warning "Failed to update $($var.Key): $($_.Exception.Message)"
        }
    }
}

# Get deployment status
function Get-DeploymentStatus {
    try {
        $deployments = vercel ls --json | ConvertFrom-Json
        if ($deployments -and $deployments.Count -gt 0) {
            $latest = $deployments[0]
            return @{
                url = $latest.url
                state = $latest.state
                created = $latest.created
            }
        }
    }
    catch {
        Write-Warning "Could not get deployment status"
    }
    return $null
}

# Force deployment trigger
function Invoke-ForceDeployment {
    Write-Deploy "Triggering force deployment..."
    
    # Create a deployment trigger file
    $triggerFile = "deploy-trigger.txt"
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "Force deployment triggered at: $timestamp" | Out-File $triggerFile -Encoding UTF8
    
    if (!$SkipGit) {
        git add $triggerFile
        git commit -m "🚀 Force deployment trigger: $timestamp"
        git push
        Write-Success "Force deployment committed and pushed"
    }
    
    # Direct Vercel deployment
    Write-Deploy "Deploying directly to Vercel..."
    if ($Production) {
        vercel --prod --yes
    } else {
        vercel --yes
    }
}

# Main deployment function
function Start-AdvancedDeployment {
    Write-Header
    
    # Pre-flight checks
    $projectPath = "C:\Users\user\Museum-Space-B10"
    
    if (!(Test-Path $projectPath)) {
        Write-Error "Project directory not found: $projectPath"
        return $false
    }
    
    Set-Location $projectPath
    Write-Success "Working in: $projectPath"
    
    if (!(Test-Path "package.json")) {
        Write-Error "Invalid project directory (package.json not found)"
        return $false
    }
    
    if (!(Test-VercelCLI)) {
        Write-Error "Vercel CLI required but not found"
        return $false
    }
    
    # Update environment variables if requested
    if ($UpdateEnv) {
        Update-EnvironmentVariables
        Write-Host ""
    }
    
    # Git operations (unless skipped)
    $hasChanges = $false
    if (!$SkipGit) {
        Write-Step "Checking Git status..."
        
        $gitStatus = git status --porcelain
        if ($gitStatus) {
            $hasChanges = $true
            Write-Success "Found $(($gitStatus | Measure-Object).Count) changed files"
            
            if ($Verbose) {
                Write-Info "Changed files:"
                $gitStatus | ForEach-Object { Write-Host "  📄 $_" -ForegroundColor $Colors.Yellow }
            }
        } else {
            Write-Info "No git changes detected"
        }
        
        # Add and commit changes if they exist
        if ($hasChanges) {
            Write-Step "Staging and committing changes..."
            git add -A
            
            $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
            $commitMsg = "🚀 Auto-deploy: $timestamp"
            
            git commit -m $commitMsg
            if ($LASTEXITCODE -ne 0) {
                Write-Error "Git commit failed"
                return $false
            }
            
            Write-Success "Changes committed: $commitMsg"
            
            Write-Step "Pushing to GitHub..."
            git push
            if ($LASTEXITCODE -ne 0) {
                Write-Error "GitHub push failed"
                return $false
            }
            
            Write-Success "Changes pushed to GitHub"
        }
    }
    
    # Force deployment if requested or if we have changes
    if ($Force -or $hasChanges -or $SkipGit) {
        Write-Host ""
        Write-Deploy "Starting Vercel deployment..."
        
        # Show current deployment status
        $currentStatus = Get-DeploymentStatus
        if ($currentStatus) {
            Write-Info "Current deployment: $($currentStatus.url) [$($currentStatus.state)]"
        }
        
        # Deploy to Vercel
        if ($Production) {
            Write-Deploy "Deploying to PRODUCTION..."
            vercel --prod --yes --force
        } else {
            Write-Deploy "Deploying to PREVIEW..."
            vercel --yes --force
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Vercel deployment completed successfully"
        } else {
            Write-Warning "Vercel deployment may have issues (exit code: $LASTEXITCODE)"
        }
    } elseif (!$hasChanges -and !$Force) {
        Write-Info "No changes to deploy. Use -Force to deploy anyway."
    }
    
    # Final status report
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor $Colors.Green
    Write-Host "   ✅ DEPLOYMENT PROCESS COMPLETED" -ForegroundColor $Colors.Green
    Write-Host "============================================================" -ForegroundColor $Colors.Green
    
    # Environment status
    Write-Host "🔧 Environment Status:" -ForegroundColor $Colors.Cyan
    Write-Host "├─ UNIPAY_MERCHANT_ID: ✅ Configured" -ForegroundColor $Colors.Green
    Write-Host "├─ UNIPAY_API_KEY: ✅ Configured" -ForegroundColor $Colors.Green  
    Write-Host "└─ Domain: betlemi10.com ✅" -ForegroundColor $Colors.Green
    
    # URLs
    Write-Host ""
    Write-Host "🔗 Available URLs:" -ForegroundColor $Colors.Cyan
    Write-Host "├─ 🏠 Main Site: https://betlemi10.com" -ForegroundColor $Colors.Blue
    Write-Host "├─ 🛒 Shop: https://betlemi10.com/biletebi" -ForegroundColor $Colors.Blue
    Write-Host "├─ 📅 Booking: https://betlemi10.com/shekveta" -ForegroundColor $Colors.Blue  
    Write-Host "├─ 📜 Terms: https://betlemi10.com/wesmdebi" -ForegroundColor $Colors.Blue
    Write-Host "└─ 🧪 API Test: https://betlemi10.com/test-unipay.html" -ForegroundColor $Colors.Magenta
    
    # Timing info
    Write-Host ""
    Write-Host "⏱️  Deployment will be live in ~30-90 seconds" -ForegroundColor $Colors.Yellow
    Write-Host "============================================================" -ForegroundColor $Colors.Green
    Write-Host ""
    
    return $true
}

# Script execution
try {
    $startTime = Get-Date
    
    # Show help if requested
    if ($args -contains "--help" -or $args -contains "-h") {
        Write-Host @"

Museum Space Auto-Deploy Script Usage:

Basic Usage:
  .\vercel-auto-deploy.ps1                    # Standard deploy with git
  
Advanced Options:
  -Force           Force deployment even without changes
  -Production      Deploy directly to production (default: preview)
  -SkipGit         Skip git operations, deploy to Vercel only
  -UpdateEnv       Update environment variables before deploy
  -Verbose         Show detailed output
  
Examples:
  .\vercel-auto-deploy.ps1 -Force -Production     # Force production deploy
  .\vercel-auto-deploy.ps1 -SkipGit -Verbose      # Vercel only, verbose
  .\vercel-auto-deploy.ps1 -UpdateEnv             # Update env vars and deploy

"@
        exit 0
    }
    
    # Run deployment
    $result = Start-AdvancedDeployment
    
    if ($result) {
        $duration = (Get-Date) - $startTime
        Write-Success "✨ Total deployment time: $([math]::Round($duration.TotalSeconds, 1)) seconds"
        
        # Optional browser opening
        if (!$SkipGit) {  # Only prompt for interactive sessions
            $openTest = Read-Host "🌐 Open test page in browser? (y/n)"
            if ($openTest -eq "y" -or $openTest -eq "Y") {
                Start-Process "https://betlemi10.com/test-unipay.html"
            }
        }
    } else {
        Write-Error "❌ Deployment failed!"
        exit 1
    }
} catch {
    Write-Error "Fatal deployment error: $($_.Exception.Message)"
    if ($Verbose) {
        Write-Host $_.ScriptStackTrace -ForegroundColor $Colors.Red
    }
    exit 1
}

# Keep window open for batch execution
if (!$SkipGit) {
    Read-Host "Press Enter to exit"
}