# Museum Space - Master Deployment Script
# Universal deployment script with multiple deployment options
# Usage: .\deploy.ps1 [options]

param(
    [string]$Mode = "auto",        # auto, quick, force, env-only
    [switch]$Production,           # Target production
    [switch]$SkipGit,             # Skip git operations
    [switch]$UpdateEnv,           # Update environment variables
    [switch]$Test,                # Test deployment after completion
    [switch]$Verbose,             # Verbose output
    [switch]$Silent,              # Silent execution
    [switch]$Help                 # Show help
)

# Show help
if ($Help) {
    Write-Host @"

Museum Space Deployment Script - Help
=====================================

USAGE:
  .\deploy.ps1 [MODE] [OPTIONS]

MODES:
  auto      - Standard deployment (git + github + vercel) [DEFAULT]
  quick     - Quick deployment (minimal output)
  force     - Force deployment even without changes
  env-only  - Update environment variables only
  test      - Test current deployment

OPTIONS:
  -Production    Deploy to production environment
  -SkipGit      Skip git operations (Vercel only)
  -UpdateEnv    Update environment variables
  -Test         Test deployment after completion
  -Verbose      Show detailed output
  -Silent       Minimal output, no prompts

EXAMPLES:
  .\deploy.ps1                                    # Standard deployment
  .\deploy.ps1 -Mode quick -Production            # Quick production deploy
  .\deploy.ps1 -Mode force -Production -Silent    # Force production deploy silently
  .\deploy.ps1 -Mode env-only                     # Update environment variables only
  .\deploy.ps1 -UpdateEnv -Test -Verbose          # Full deployment with testing

URLS:
  Production: https://betlemi10.com
  Shop:       https://betlemi10.com/biletebi
  Booking:    https://betlemi10.com/shekveta
  API Test:   https://betlemi10.com/api/test-env

"@
    exit 0
}

# Import functions (simplified inline version)
$Colors = @{ Green="Green"; Red="Red"; Yellow="Yellow"; Cyan="Cyan"; Blue="Blue"; Magenta="Magenta" }
function Write-Success($m) { if(!$Silent) { Write-Host "✅ $m" -ForegroundColor $Colors.Green } }
function Write-Error($m) { Write-Host "❌ $m" -ForegroundColor $Colors.Red }
function Write-Info($m) { if(!$Silent) { Write-Host "ℹ️  $m" -ForegroundColor $Colors.Cyan } }
function Write-Step($m) { if(!$Silent) { Write-Host "🔧 $m" -ForegroundColor $Colors.Blue } }

# Main execution router
function Invoke-DeploymentMode {
    switch ($Mode.ToLower()) {
        "auto" {
            Write-Info "Running advanced auto-deployment..."
            & ".\vercel-auto-deploy.ps1" @($Production ? "-Production" : "") @($SkipGit ? "-SkipGit" : "") @($UpdateEnv ? "-UpdateEnv" : "") @($Verbose ? "-Verbose" : "")
        }
        "quick" {
            Write-Info "Running quick deployment..."
            if ($Production) {
                & ".\quick-deploy.bat"
            } else {
                # Quick preview deploy
                git add -A; git commit -m "🚀 Quick deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"; git push; vercel --yes
            }
        }
        "force" {
            Write-Info "Running force deployment..."
            $reason = if ($Silent) { "Automated force deploy" } else { Read-Host "Deployment reason (optional)" }
            if (!$reason) { $reason = "Manual force deployment" }
            & ".\force-deploy.ps1" @($Production ? "-Production" : "") @($Silent ? "-Silent" : "") "-Reason" $reason
        }
        "env-only" {
            Write-Info "Updating environment variables only..."
            & ".\manage-env.ps1" -Action update @($Production ? "-Production" : "") @($UpdateEnv ? "-All" : "")
        }
        "test" {
            Write-Info "Testing current deployment..."
            & ".\manage-env.ps1" -Action test
        }
        default {
            Write-Error "Unknown mode: $Mode. Use -Help for usage information."
            exit 1
        }
    }
}

# Pre-flight checks
Write-Info "Museum Space Deployment Controller v2.0"
Set-Location "C:\Users\user\Museum-Space-B10"

if (!(Test-Path "vercel.json")) {
    Write-Error "Not in Museum Space project directory"
    exit 1
}

# Check Vercel CLI
try {
    $null = vercel --version 2>$null
    Write-Success "Vercel CLI ready"
} catch {
    Write-Error "Vercel CLI not found. Install: npm i -g vercel"
    exit 1
}

# Execute deployment
try {
    $startTime = Get-Date
    Invoke-DeploymentMode
    
    # Post-deployment testing
    if ($Test -and $Mode -ne "test") {
        Write-Step "Running post-deployment test..."
        Start-Sleep -Seconds 10
        & ".\manage-env.ps1" -Action test
    }
    
    if (!$Silent) {
        $duration = (Get-Date) - $startTime
        Write-Success "Deployment completed in $([math]::Round($duration.TotalSeconds, 1))s"
    }
    
} catch {
    Write-Error "Deployment failed: $($_.Exception.Message)"
    if ($Verbose) { Write-Host $_.ScriptStackTrace -ForegroundColor $Colors.Red }
    exit 1
}