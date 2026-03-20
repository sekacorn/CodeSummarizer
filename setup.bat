@echo off
REM First-time setup script for Code Summarizer (Windows)
REM Run this after cloning the repository

echo =========================================
echo   Code Summarizer - First Time Setup
echo =========================================
echo.

set ERRORS=0

REM 1. Check Node.js
echo Checking prerequisites...
echo.

where node >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do echo [OK] Node.js %%i
) else (
    echo [MISSING] Node.js is not installed.
    echo   Install from: https://nodejs.org/
    set /a ERRORS+=1
)

REM 2. Check Rust
where rustc >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=2" %%i in ('rustc --version') do echo [OK] Rust %%i
) else (
    echo [MISSING] Rust is not installed.
    echo   Install from: https://rustup.rs/
    set /a ERRORS+=1
)

REM 3. Check Cargo
where cargo >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Cargo available
) else (
    echo [MISSING] Cargo is not installed (comes with Rust^).
    echo   Install from: https://rustup.rs/
    set /a ERRORS+=1
)

REM 4. Check Ollama
where ollama >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Ollama installed
) else (
    echo [MISSING] Ollama is not installed.
    echo   Install from: https://ollama.ai/
    set /a ERRORS+=1
)

REM 5. Check if Ollama is running
curl -s http://127.0.0.1:11434/api/tags >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Ollama is running
) else (
    echo [WARNING] Ollama is not running. Start it with: ollama serve
)

echo.

REM Stop if prerequisites are missing
if %ERRORS% gtr 0 (
    echo =========================================
    echo   %ERRORS% prerequisite(s^) missing.
    echo   Please install them and re-run setup.
    echo =========================================
    exit /b 1
)

REM 6. Install npm dependencies
echo Installing npm dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [FAILED] npm install failed. Check the errors above.
    exit /b 1
)
echo [OK] Dependencies installed
echo.

REM 7. Generate icons
echo Generating application icons...
call npm run generate-icons >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Icons generated
) else (
    echo [WARNING] Icon generation failed (non-critical^). You can retry with: npm run generate-icons
)
echo.

REM 8. Run tests
echo Running tests to verify setup...
echo.

echo --- TypeScript tests ---
call npx vitest run
set TS_RESULT=%errorlevel%

echo.
echo --- Rust tests ---
pushd src-tauri
call cargo test
set RUST_RESULT=%errorlevel%
popd

echo.
if %TS_RESULT% equ 0 if %RUST_RESULT% equ 0 (
    echo [OK] All tests passed
) else (
    echo [WARNING] Some tests failed. Check the output above.
)

echo.
echo =========================================
echo   Setup complete!
echo =========================================
echo.
echo To start the app in development mode:
echo   npm run tauri:dev
echo.
echo To build for production:
echo   npm run tauri:build
echo.
echo Make sure Ollama is running before starting the app:
echo   ollama serve
echo.

pause
