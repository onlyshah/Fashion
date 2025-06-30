# DFashion Mobile App Login Troubleshooting Guide

## Quick Start (Recommended)

### Option 1: Use Startup Scripts
1. **Double-click** `start-mobile.bat` (Windows Command Prompt)
2. **OR Right-click** `start-mobile.ps1` → "Run with PowerShell"

### Option 2: Manual Steps
1. **Start Backend:**
   ```bash
   cd backend
   node app.js
   ```
   ✅ Look for: "🔐 JWT_SECRET loaded: true"

2. **Build & Run Mobile:**
   ```bash
   cd frontend
   npx ng build --configuration=mobile
   npx cap sync android
   npx cap run android
   ```

## Test Credentials
- **Email:** `rajesh@example.com`
- **Password:** `password123`

## Common Issues & Solutions

### Issue 1: "JWT_SECRET not found"
**Solution:** Restart backend - the .env file should load automatically

### Issue 2: "Network Error" or "Connection Refused"
**Solution:** 
- Ensure backend is running on port 5000
- Check if mobile app is using correct URL (10.0.2.2:5000)

### Issue 3: "Invalid Credentials" 
**Solution:**
- Use exact credentials: `rajesh@example.com` / `password123`
- Check if backend database is seeded

### Issue 4: Mobile App Won't Start
**Solution:**
- Ensure Android emulator is running
- Try: `npx cap open android` to open in Android Studio

## Verification Steps

1. **Backend Health Check:**
   ```bash
   curl http://localhost:5000/health
   ```

2. **Mobile API Test:**
   ```bash
   curl -X POST http://10.0.2.2:5000/api/auth/login \
   -H "Content-Type: application/json" \
   -d '{"email":"rajesh@example.com","password":"password123"}'
   ```

3. **Check Environment URLs:**
   - Web: `http://localhost:5000/api`
   - Mobile: `http://10.0.2.2:5000/api`

## If Still Not Working

1. **Clear Everything:**
   ```bash
   cd frontend
   rm -rf dist .angular node_modules
   npm install
   ```

2. **Rebuild from Scratch:**
   ```bash
   npx ng build --configuration=mobile
   npx cap sync android
   npx cap run android
   ```

3. **Check Android Logs:**
   ```bash
   adb logcat | grep -i "dfashion\|capacitor\|error"
   ```

## Success Indicators
- ✅ Backend shows "JWT_SECRET loaded: true"
- ✅ Mobile app opens login screen
- ✅ Login with test credentials works
- ✅ Redirects to home page after login
