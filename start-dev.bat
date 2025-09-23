@echo off
echo 🚀 Starting GLM AI Config development environment...
echo.

echo ⚛️  Starting React development server...
start /B cmd /c "npm run dev > react.log 2>&1"

echo Waiting for React server to start...
timeout /t 10 /nobreak > nul

echo 🔧 Starting Electron...
set ELECTRON_IS_DEV=true
electron .

echo.
echo 🛑 Development environment stopped.
pause