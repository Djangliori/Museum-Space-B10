@echo off
echo.
echo ================================================
echo   🚀 Simple Museum Space Deploy
echo ================================================
echo.

cd /d "C:\Users\user\Museum-Space-B10"

echo ✅ Creating dummy change to trigger deployment...
echo Deployment triggered at: %date% %time% > deployment-log.txt

echo ✅ Adding changes...
git add -A

echo ✅ Committing...
git commit -m "🚀 Force deployment: %date% %time%"

echo ✅ Pushing to GitHub (triggers Vercel)...
git push

echo.
echo ================================================
echo   ✅ DEPLOYMENT TRIGGERED!
echo   🌐 Live Site: https://betlemi10.com
echo   🧪 Test API: https://betlemi10.com/test-unipay.html
echo   ⏱️  Available in ~1-2 minutes
echo ================================================
echo.

pause