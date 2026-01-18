#!/bin/bash

# Production build script for Code Summarizer
# This script builds the application for distribution

echo "========================================="
echo "  Code Summarizer - Production Build"
echo "========================================="
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
else
    echo "✓ Dependencies already installed"
fi

echo ""
echo "Building Code Summarizer for production..."
echo "This may take a few minutes..."
echo ""

npm run tauri build

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================="
    echo "  Build completed successfully!"
    echo "========================================="
    echo ""
    echo "Your application has been built and can be found in:"
    echo "  src-tauri/target/release/"
    echo ""

    # Detect OS and show appropriate binary location
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macOS app bundle:"
        echo "  src-tauri/target/release/bundle/macos/"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "Linux executable:"
        echo "  src-tauri/target/release/code-summarizer"
        echo "AppImage (if built):"
        echo "  src-tauri/target/release/bundle/appimage/"
    fi
else
    echo ""
    echo "========================================="
    echo "  Build failed!"
    echo "========================================="
    echo "Please check the error messages above."
    exit 1
fi
