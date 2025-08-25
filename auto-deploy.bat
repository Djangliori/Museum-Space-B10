@echo off
echo.
echo ===================================================
echo   🚀 Museum Space - Auto Deploy System
echo ===================================================
echo.

:: Change to project directory
cd /d "C:\Users\user\Desktop\Museum space"

:: Check if there are changes
git status --porcelain > nul
if %errorlevel%==0 (
    echo ✅ Checking for changes...
) else (
    echo ❌ Git error - aborting
    pause
    exit /b 1
)

:: Add all changes
echo ✅ Adding changes to git...
git add -A

:: Check if there's anything to commit
git diff-index --quiet HEAD --
if %errorlevel%==0 (
    echo ⚠️  No changes to commit
    pause
    exit /b 0
)

:: Get current timestamp
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a:%%b)

:: Create commit message
set commit_msg=🚀 Auto-deploy: %mydate% %mytime%

:: Commit changes
echo ✅ Committing changes...
git commit -m "%commit_msg%"

if %errorlevel%==0 (
    echo ✅ Commit successful
) else (
    echo ❌ Commit failed
    pause
    exit /b 1
)

:: Push to GitHub
echo ✅ Pushing to GitHub...
git push

if %errorlevel%==0 (
    echo.
    echo ===================================================
    echo   ✅ DEPLOY SUCCESSFUL!
    echo   📦 Changes pushed to GitHub
    echo   🌐 Vercel will auto-deploy in ~1 minute
    echo   🔗 Live URL: https://betlemi10.com
    echo ===================================================
    echo.
) else (
    echo ❌ Push failed
    pause
    exit /b 1
)

pause