@echo off
echo ========================================
echo    HDESS - Starting All Services
echo ========================================
echo.

echo Starting services in separate windows...
echo.

echo [1/3] Starting Authentication API (Port 5001)...
start "HDESS Auth API" cmd /k "cd /d %~dp0 && python start-auth-api.py"
timeout /t 3 /nobreak >nul

echo [2/3] Starting Image Processing API (Port 8080)...
start "HDESS Image API" cmd /k "cd /d %~dp0 && python start-backend-simple.py"
timeout /t 3 /nobreak >nul

echo [3/3] Starting Frontend Development Server (Port 5173)...
start "HDESS Frontend" cmd /k "cd /d %~dp0 && npm run dev"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo All services are starting up!
echo ========================================
echo.
echo Services:
echo - Authentication API: http://localhost:5001
echo - Image Processing API: http://localhost:8080  
echo - Frontend: http://localhost:5173
echo.
echo Wait a few moments for all services to be ready.
echo You can now open http://localhost:5173 in your browser.
echo.
echo Press any key to exit this window...
pause >nul
