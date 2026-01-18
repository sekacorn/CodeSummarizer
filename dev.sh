#!/bin/bash

# Development mode startup script for Code Summarizer
# This script starts the app in development mode with hot-reload

echo "========================================="
echo "  Code Summarizer - Development Mode"
echo "========================================="
echo ""

# Check if Ollama is running
echo "Checking if Ollama is running..."
if ! curl -s http://127.0.0.1:11434/api/tags > /dev/null 2>&1; then
    echo "WARNING: Ollama doesn't appear to be running!"
    echo "Please start Ollama with: ollama serve"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✓ Ollama is running"
fi

echo ""
echo "Installing dependencies (if needed)..."
npm install

echo ""
echo "Starting Code Summarizer in development mode..."
echo "The app will open in a new window."
echo "Press Ctrl+C to stop."
echo ""

npm run tauri dev
