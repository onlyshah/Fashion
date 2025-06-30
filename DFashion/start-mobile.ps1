Write-Host "Starting DFashion Mobile App..." -ForegroundColor Green

Write-Host "`nStep 1: Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; node app.js"

Write-Host "`nStep 2: Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "`nStep 3: Building Mobile App..." -ForegroundColor Yellow
Set-Location frontend
& npx ng build --configuration=mobile

Write-Host "`nStep 4: Syncing with Android..." -ForegroundColor Yellow
& npx cap sync android

Write-Host "`nStep 5: Starting Mobile App..." -ForegroundColor Yellow
& npx cap run android

Write-Host "`nMobile app should be starting now..." -ForegroundColor Green
Read-Host "Press Enter to continue..."
