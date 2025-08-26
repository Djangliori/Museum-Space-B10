# Museum Space - Environment Variables Management
# Handles Vercel environment variables for production and preview

param(
    [string]$Action = "list",  # list, update, backup, restore, test
    [switch]$Production,       # Target production environment
    [switch]$Preview,         # Target preview environment  
    [switch]$All              # Target all environments
)

$Colors = @{
    Green = "Green"; Red = "Red"; Yellow = "Yellow"; Cyan = "Cyan"; Blue = "Blue"
}

function Write-Success($msg) { Write-Host "✅ $msg" -ForegroundColor $Colors.Green }
function Write-Error($msg) { Write-Host "❌ $msg" -ForegroundColor $Colors.Red }
function Write-Info($msg) { Write-Host "ℹ️  $msg" -ForegroundColor $Colors.Cyan }
function Write-Warning($msg) { Write-Host "⚠️  $msg" -ForegroundColor $Colors.Yellow }

# Environment variables configuration
$EnvVars = @{
    "UNIPAY_MERCHANT_ID" = "5015191030581"
    "UNIPAY_API_KEY" = "bc6f5073-6d1c-4abe-8456-1bb814077f6e"
}

function Get-TargetEnvironments {
    $environments = @()
    if ($Production -or $All) { $environments += "production" }
    if ($Preview -or $All) { $environments += "preview" }
    if ($environments.Count -eq 0) { $environments = @("production") }  # Default
    return $environments
}

function Show-EnvironmentList {
    Write-Info "Current Vercel Environment Variables:"
    try {
        vercel env ls
        Write-Success "Environment variables listed successfully"
    }
    catch {
        Write-Error "Failed to list environment variables: $($_.Exception.Message)"
    }
}

function Update-EnvironmentVariables {
    $environments = Get-TargetEnvironments
    Write-Info "Updating environment variables for: $($environments -join ', ')"
    
    foreach ($env in $environments) {
        Write-Info "Processing environment: $env"
        
        foreach ($var in $EnvVars.GetEnumerator()) {
            try {
                Write-Info "  Setting $($var.Key) in $env..."
                
                # Remove existing (suppress errors)
                vercel env rm $var.Key $env --yes 2>$null | Out-Null
                
                # Add new value
                $var.Value | vercel env add $var.Key $env --yes | Out-Null
                
                Write-Success "  ✓ $($var.Key) updated in $env"
            }
            catch {
                Write-Error "  ✗ Failed to update $($var.Key) in $env"
            }
        }
    }
}

function Backup-EnvironmentVariables {
    $backupFile = "env-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
    Write-Info "Creating environment backup: $backupFile"
    
    try {
        $envList = vercel env ls --json | ConvertFrom-Json
        $envList | ConvertTo-Json -Depth 10 | Out-File $backupFile -Encoding UTF8
        Write-Success "Environment backup saved: $backupFile"
    }
    catch {
        Write-Error "Backup failed: $($_.Exception.Message)"
    }
}

function Test-EnvironmentVariables {
    Write-Info "Testing environment variables via API endpoint..."
    
    try {
        $response = Invoke-RestMethod -Uri "https://betlemi10.com/api/test-env" -Method GET
        
        Write-Info "Environment Test Results:"
        Write-Host "├─ Status: $($response.status)" -ForegroundColor $(if($response.status -eq "READY") { $Colors.Green } else { $Colors.Yellow })
        Write-Host "├─ Timestamp: $($response.timestamp)" -ForegroundColor $Colors.Blue
        Write-Host "├─ Node Version: $($response.node_version)" -ForegroundColor $Colors.Blue
        Write-Host "├─ Vercel Region: $($response.vercel_region)" -ForegroundColor $Colors.Blue
        Write-Host "└─ API Connectivity: $($response.api_connectivity)" -ForegroundColor $(if($response.api_connectivity -eq "REACHABLE") { $Colors.Green } else { $Colors.Yellow })
        
        Write-Host ""
        Write-Info "Environment Variables Status:"
        foreach ($var in $response.environment_variables.PSObject.Properties) {
            $status = if ($var.Value.configured) { "✅" } else { "❌" }
            Write-Host "├─ $($var.Name): $status $($var.Value.value)" -ForegroundColor $(if($var.Value.configured) { $Colors.Green } else { $Colors.Red })
        }
        
        if ($response.status -eq "READY") {
            Write-Success "All environment variables are properly configured!"
        } else {
            Write-Warning "Some environment variables need attention"
        }
    }
    catch {
        Write-Error "Environment test failed: $($_.Exception.Message)"
        Write-Info "Make sure the site is deployed and accessible"
    }
}

# Main execution
Write-Host ""
Write-Host "============================================================" -ForegroundColor $Colors.Cyan
Write-Host "   🔧 Museum Space - Environment Variables Manager" -ForegroundColor $Colors.Cyan
Write-Host "============================================================" -ForegroundColor $Colors.Cyan
Write-Host ""

# Change to project directory
Set-Location "C:\Users\user\Museum-Space-B10"

switch ($Action.ToLower()) {
    "list" { Show-EnvironmentList }
    "update" { Update-EnvironmentVariables }
    "backup" { Backup-EnvironmentVariables }
    "test" { Test-EnvironmentVariables }
    default {
        Write-Info "Available actions:"
        Write-Host "  list    - List current environment variables"
        Write-Host "  update  - Update environment variables"
        Write-Host "  backup  - Create backup of current environment"
        Write-Host "  test    - Test environment variables via API"
        Write-Host ""
        Write-Info "Usage examples:"
        Write-Host "  .\manage-env.ps1 -Action list"
        Write-Host "  .\manage-env.ps1 -Action update -All"
        Write-Host "  .\manage-env.ps1 -Action test"
    }
}

Write-Host ""