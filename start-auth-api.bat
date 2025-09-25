@echo off
echo Starting HDESS Authentication API...
echo.

cd /d "%~dp0api"

echo Installing Python dependencies...
python -m pip install -r requirements.txt

echo.
echo Starting Authentication API server on port 5001...
python auth_api.py

pause
