@echo off
echo Installing optimized dependencies...

cd api
pip install flask==2.3.3
pip install flask-cors==4.0.0
pip install flask-limiter==3.5.0
pip install redis==5.0.1
pip install celery==5.3.4
pip install python-magic==0.4.27
pip install gunicorn==21.2.0
pip install python-dotenv==1.0.0
pip install psutil==5.9.6

echo.
echo Dependencies installed successfully!
echo.
echo To start the optimized backend:
echo   cd api
echo   python realesrgan_api.py
echo.
echo To start frontend:
echo   npm run dev
echo.
pause
