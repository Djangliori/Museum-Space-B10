@echo off
echo.
echo ===================================================
echo   🚀 Museum Space - Quick Vercel Deploy
echo ===================================================
echo.

cd /d "C:\Users\user\Museum-Space-B10"

echo ✅ Staging all changes...
git add -A

echo ✅ Creating commit...
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a:%%b)
git commit -m "🚀 Quick deploy: %mydate% %mytime%"

echo ✅ Pushing to GitHub...
git push

echo ✅ Deploying to Vercel Production...
vercel --prod --yes

echo.
echo ===================================================
echo   ✅ QUICK DEPLOYMENT COMPLETE!
echo   🌐 Live at: https://betlemi10.com
echo   ⏱️  Available in ~30-60 seconds
echo ===================================================
echo.

pause