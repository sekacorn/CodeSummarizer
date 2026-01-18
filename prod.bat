@echo off
REM Production build script for Code Summarizer (Windows)
REM This script builds the application for distribution

echo =========================================
echo   Code Summarizer - Production Build
echo =========================================
echo.

REM Check if dependencies are installed
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
) else (
    echo [OK] Dependencies already installed
)

echo.
echo Building Code Summarizer for production...
echo This may take a few minutes...
echo.

call npm run tauri build

if %errorlevel% equ 0 (
    echo.
    echo =========================================
    echo   Build completed successfully!
    echo =========================================
    echo.
    echo Your application has been built and can be found in:
    echo   src-tauri\target\release\
    echo.
    echo Windows installer:
    echo   src-tauri\target\release\bundle\msi\
    echo.
    echo Executable:
    echo   src-tauri\target\release\code-summarizer.exe
    echo.
) else (
    echo.
    echo =========================================
    echo   Build failed!
    echo =========================================
    echo Please check the error messages above.
    exit /b 1
)

pause
