@echo off
REM Development mode startup script for Code Summarizer (Windows)
REM This script starts the app in development mode with hot-reload

echo =========================================
echo   Code Summarizer - Development Mode
echo =========================================
echo.

REM Check if Ollama is running
echo Checking if Ollama is running...
curl -s http://127.0.0.1:11434/api/tags >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Ollama doesn't appear to be running!
    echo Please start Ollama first.
    echo.
    set /p continue="Continue anyway? (y/n): "
    if /i not "%continue%"=="y" exit /b 1
) else (
    echo [OK] Ollama is running
)

echo.
echo Installing dependencies (if needed)...
call npm install

echo.
echo Starting Code Summarizer in development mode...
echo The app will open in a new window.
echo Press Ctrl+C to stop.
echo.

call npm run tauri dev
