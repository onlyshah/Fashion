@echo off
echo Starting DFashion Mobile App...

echo.
echo Step 1: Starting Backend Server...
start "Backend Server" cmd /k "cd backend && node app.js"

echo.
echo Step 2: Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo Step 3: Building Mobile App...
cd frontend
call npx ng build --configuration=mobile

echo.
echo Step 4: Syncing with Android...
call npx cap sync android

echo.
echo Step 5: Starting Mobile App...
call npx cap run android

echo.
echo Mobile app should be starting now...
pause
