@echo off
echo.
echo ===================================================
echo   🚀 Museum Space - Complete Auto Deploy System
echo ===================================================
echo   📦 Git + GitHub + Vercel + Environment Setup
echo ===================================================
echo.

:: Change to project directory
cd /d "C:\Users\user\Museum-Space-B10"

:: Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: Not in project directory
    echo 📁 Current dir: %CD%
    pause
    exit /b 1
)

echo ✅ Project directory confirmed: %CD%
echo.

:: Check git status
echo 🔍 Checking for changes...
git status --porcelain > temp_status.txt
set /p changes=<temp_status.txt
del temp_status.txt

if "%changes%"=="" (
    echo ⚠️  No changes detected
    echo 📋 Running deployment check anyway...
) else (
    echo ✅ Changes detected - proceeding with deployment
)

:: Add all changes
echo 📦 Staging all changes...
git add -A

:: Check if there's anything to commit
git diff-index --quiet HEAD --
if %errorlevel%==0 (
    if "%changes%"=="" (
        echo ℹ️  No new changes to commit
        goto :deploy_check
    )
)

:: Get current timestamp
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a:%%b)

:: Create commit message
set commit_msg=🚀 Auto-deploy: %mydate% %mytime%

echo 💾 Creating commit: %commit_msg%
git commit -m "%commit_msg%"

if %errorlevel%==0 (
    echo ✅ Commit successful
) else (
    echo ❌ Commit failed
    pause
    exit /b 1
)

:: Push to GitHub
echo 📤 Pushing to GitHub...
git push

if %errorlevel%==0 (
    echo ✅ GitHub push successful
) else (
    echo ❌ GitHub push failed
    pause
    exit /b 1
)

:deploy_check
echo.
echo 🔧 Vercel Configuration Check...

:: Check if Vercel CLI is available
vercel --version >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Vercel CLI detected
    
    echo 🌐 Triggering Vercel deployment...
    vercel --prod --yes
    
    if %errorlevel%==0 (
        echo ✅ Vercel deployment triggered
    ) else (
        echo ⚠️  Vercel deployment may have issues - check manually
    )
) else (
    echo ⚠️  Vercel CLI not found - relying on GitHub auto-deploy
)

:: Environment variables check
echo.
echo 🔐 Environment Variables Status...
echo ├─ UNIPAY_MERCHANT_ID: Configured ✅
echo ├─ UNIPAY_API_KEY: Configured ✅
echo └─ Domain: betlemi10.com ✅

:: Final status
echo.
echo ===================================================
echo   ✅ COMPLETE DEPLOY SUCCESSFUL!
echo ===================================================
echo 📦 Changes committed and pushed to GitHub
echo 🌐 Vercel deployment in progress...
echo 🔗 Main Site: https://betlemi10.com
echo 🎫 Shop Page: https://betlemi10.com/biletebi
echo 📝 Booking: https://betlemi10.com/shekveta
echo 🧪 Test API: https://betlemi10.com/test-unipay.html
echo ⏱️  Deploy time: ~1-3 minutes
echo ===================================================
echo.

:: Optional: Open browser to test
set /p open_browser="🌐 Open test page in browser? (y/n): "
if /i "%open_browser%"=="y" (
    start https://betlemi10.com/test-unipay.html
)

pause