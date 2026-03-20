#!/bin/bash

# First-time setup script for Code Summarizer
# Run this after cloning the repository

echo "========================================="
echo "  Code Summarizer - First Time Setup"
echo "========================================="
echo ""

ERRORS=0

# 1. Check Node.js
echo "Checking prerequisites..."
echo ""

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "[OK] Node.js $NODE_VERSION"
else
    echo "[MISSING] Node.js is not installed."
    echo "  Install from: https://nodejs.org/"
    ERRORS=$((ERRORS + 1))
fi

# 2. Check Rust
if command -v rustc &> /dev/null; then
    RUST_VERSION=$(rustc --version | awk '{print $2}')
    echo "[OK] Rust $RUST_VERSION"
else
    echo "[MISSING] Rust is not installed."
    echo "  Install from: https://rustup.rs/"
    ERRORS=$((ERRORS + 1))
fi

# 3. Check Cargo
if command -v cargo &> /dev/null; then
    echo "[OK] Cargo available"
else
    echo "[MISSING] Cargo is not installed (comes with Rust)."
    echo "  Install from: https://rustup.rs/"
    ERRORS=$((ERRORS + 1))
fi

# 4. Check Ollama
if command -v ollama &> /dev/null; then
    echo "[OK] Ollama installed"
else
    echo "[MISSING] Ollama is not installed."
    echo "  Install from: https://ollama.ai/"
    ERRORS=$((ERRORS + 1))
fi

# 5. Check if Ollama is running
if curl -s http://127.0.0.1:11434/api/tags > /dev/null 2>&1; then
    echo "[OK] Ollama is running"

    # Check for models
    MODEL_COUNT=$(curl -s http://127.0.0.1:11434/api/tags | grep -o '"name"' | wc -l)
    if [ "$MODEL_COUNT" -gt 0 ]; then
        echo "[OK] $MODEL_COUNT model(s) available"
    else
        echo "[WARNING] No models found. Pull one with: ollama pull llama2"
    fi
else
    echo "[WARNING] Ollama is not running. Start it with: ollama serve"
fi

echo ""

# Stop if prerequisites are missing
if [ $ERRORS -gt 0 ]; then
    echo "========================================="
    echo "  $ERRORS prerequisite(s) missing."
    echo "  Please install them and re-run setup."
    echo "========================================="
    exit 1
fi

# 6. Install npm dependencies
echo "Installing npm dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "[FAILED] npm install failed. Check the errors above."
    exit 1
fi
echo "[OK] Dependencies installed"
echo ""

# 7. Generate icons
echo "Generating application icons..."
npm run generate-icons 2>/dev/null
if [ $? -eq 0 ]; then
    echo "[OK] Icons generated"
else
    echo "[WARNING] Icon generation failed (non-critical). You can retry with: npm run generate-icons"
fi
echo ""

# 8. Run tests
echo "Running tests to verify setup..."
echo ""

echo "--- TypeScript tests ---"
npx vitest run 2>&1
TS_RESULT=$?

echo ""
echo "--- Rust tests ---"
cd src-tauri && cargo test 2>&1
RUST_RESULT=$?
cd ..

echo ""
if [ $TS_RESULT -eq 0 ] && [ $RUST_RESULT -eq 0 ]; then
    echo "[OK] All tests passed"
else
    echo "[WARNING] Some tests failed. Check the output above."
fi

echo ""
echo "========================================="
echo "  Setup complete!"
echo "========================================="
echo ""
echo "To start the app in development mode:"
echo "  npm run tauri:dev"
echo ""
echo "To build for production:"
echo "  npm run tauri:build"
echo ""
echo "Make sure Ollama is running before starting the app:"
echo "  ollama serve"
echo ""
