# Code Summarizer

A **local-first, privacy-first** desktop application for analyzing and summarizing code snippets using local AI models. Built with Tauri (Rust) and React (TypeScript).

## Screenshots

![Code Summarizer - Main Interface](screenshot.jpg)

![Code Summarizer - Analysis View](screenshot-2.jpg)

![Code Summarizer - Risk Scan](screenshot-3.jpg)

## Why Code Summarizer?

- **100% Local**: All processing happens on your machine. No cloud calls, no internet required.
- **Privacy-First**: Your potentially sensitive code never leaves your computer.
- **Secret Protection**: Automatic detection and optional masking of secrets before processing.
- **Offline-Capable**: Works entirely offline with a local Ollama instance.
- **Multiple Analysis Modes**: Get summaries, junior-friendly explanations, or security risk assessments.

## Features

- **Supported Languages**: Java, Python, JavaScript, SQL, Visual Basic, JSON, CSS
- **Analysis Modes**:
  - **Summarize**: Get a concise overview with structured breakdown
  - **Explain for Junior**: Beginner-friendly explanations with detailed walkthroughs
  - **Risk Scan**: Security-focused analysis highlighting potential vulnerabilities
- **Secret Scanning**: Detects AWS keys, JWT tokens, passwords, API keys, PEM keys, and Bearer tokens
- **Structured Output**: JSON-validated responses with sections for summary, walkthrough, inputs, outputs, side effects, risks, and confidence scores
- **Copy Functionality**: Copy any section individually to your clipboard

## Prerequisites

Before you can use Code Summarizer, you need:

1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **Rust** (latest stable) - [Install](https://rustup.rs/)
3. **Ollama** - Local LLM server - [Download](https://ollama.ai/)

## Installation

### 1. Install Ollama

Download and install Ollama from [ollama.ai](https://ollama.ai/)

### 2. Pull a Model

After installing Ollama, pull a model. **Choose based on your available RAM:**

```bash
# Very lightweight - ~650MB model, works on systems with 2-4GB RAM
ollama pull tinyllama

# Lightweight - ~2GB model, requires 4-6GB system RAM
ollama pull llama2

# Better quality - ~4GB model, requires 8GB+ system RAM
ollama pull codellama

# High quality - ~4.5GB model, requires 8GB+ system RAM
ollama pull mistral
```

**Important:** Each model needs ~2x its size in RAM when running. If you get memory errors, use a smaller model.

Verify Ollama is running:
```bash
ollama list
```

### 3. Clone and Setup This Project

```bash
# Clone the repository
git clone https://github.com/sekacorn/CodeSummarizer.git
cd CodeSummarizer

# Install frontend dependencies
npm install

# Generate app icons (first-time setup only)
npm run generate-icons

# The Rust dependencies will be handled by Tauri automatically
```

**Note:** If icons are missing, you can regenerate them anytime with `npm run generate-icons`.

## Running the Application

### Development Mode

```bash
npm run tauri dev
```

This will:
1. Start the Vite development server
2. Compile the Rust backend
3. Launch the application window

### Production Build

```bash
npm run tauri build
```

The built application will be in `src-tauri/target/release/`.

## Usage

1. **Start Ollama**: Make sure Ollama is running (`ollama serve`)
2. **Launch the App**: Run `npm run tauri dev`
3. **Select Language**: Choose the programming language of your code
4. **Select Model**: Pick an Ollama model from the dropdown
5. **Configure Secret Masking**: Toggle "Mask secrets before sending to model" (ON by default)
6. **Paste Code**: Enter your code in the text area
7. **Choose Action**:
   - Click **Summarize** for a high-level overview
   - Click **Explain for Junior** for beginner-friendly explanations
   - Click **Risk Scan** for security analysis
8. **Review Results**: The right panel will display structured analysis with copyable sections

## Troubleshooting

### Ollama is not running

**Error**: "Ollama is not running. Please start Ollama and try again."

**Solution**:
```bash
# Start Ollama server
ollama serve
```

Or if Ollama is installed as a service, ensure it's running in the background.

### No models found

**Error**: "No models found. Please pull a model using 'ollama pull <model-name>'."

**Solution**:
```bash
# Pull a model
ollama pull llama2

# Verify it's installed
ollama list
```

### Out of Memory Error

**Error**: "model requires more system memory (X GiB) than is available (Y GiB)"

**Solution**:
This means the model you selected is too large for your system's available RAM. Each model requires approximately 2x its download size in system memory when running.

```bash
# For systems with 2-4GB RAM
ollama pull tinyllama

# For systems with 4-6GB RAM
ollama pull llama2

# For systems with 8GB+ RAM
ollama pull codellama
ollama pull mistral
```

After pulling a smaller model, select it from the dropdown in the app and try again.

### Request timed out / Slow on CPU

**Error**: "Request to Ollama timed out. The model may be too large or your system may be slow."

**Solutions**:
- Use a smaller model (e.g., `tinyllama` or `llama2` instead of `codellama`)
- Ensure Ollama is configured to use GPU if available
- Close other resource-intensive applications
- Increase the timeout (requires code modification in `src-tauri/src/commands/ollama.rs`)

### Model not found

**Error**: "Model 'xyz' not found. Please pull it using 'ollama pull xyz'."

**Solution**:
```bash
ollama pull <model-name>
```

### JSON parsing failed

**Issue**: Model output is not valid JSON

**Explanation**: Sometimes models don't follow the JSON format strictly, especially smaller models.

**Solutions**:
- Try a more capable model (e.g., `mistral` or `codellama`)
- Check the "Show Raw Model Output" to see what the model returned
- Retry the analysis

### Port conflicts

If you see errors about port 1420 being in use:

1. Stop any other Vite/Tauri dev servers
2. Or modify the port in `vite.config.ts`

## Security Features

### Secret Detection

The app automatically scans for:
- **AWS Access Keys**: Pattern `AKIA[0-9A-Z]{16}`
- **JWT Tokens**: Three base64url segments separated by dots
- **Credentials**: password/secret/api_key assignments
- **PEM Private Keys**: `-----BEGIN PRIVATE KEY-----` blocks
- **Bearer Tokens**: Authorization headers with Bearer tokens

### Secret Masking

When enabled (default), detected secrets are replaced with `***REDACTED***` before sending to the local model.

### No Data Persistence

- Code is **never** written to disk by this application
- No telemetry or logging of your code
- All processing happens in-memory

### Localhost-Only Communication

- All model requests go exclusively to `http://127.0.0.1:11434`
- No external network requests are made

## Architecture

```
code-summarizer/
├── src/                      # Frontend (React + TypeScript)
│   ├── components/           # React components
│   ├── lib/                  # API, schemas, utilities
│   ├── App.tsx               # Main application
│   ├── main.tsx              # Entry point
│   └── styles.css            # Styling
├── src-tauri/                # Backend (Rust)
│   ├── src/
│   │   ├── commands/         # Tauri commands
│   │   │   ├── ollama.rs     # Ollama integration
│   │   │   ├── secrets.rs    # Secret scanning
│   │   │   ├── prompt.rs     # Prompt templates
│   │   │   └── types.rs      # Shared types
│   │   └── main.rs           # Tauri entry point
│   ├── Cargo.toml            # Rust dependencies
│   └── tauri.conf.json       # Tauri configuration
├── package.json              # Node dependencies
└── vite.config.ts            # Vite configuration
```

## Technologies Used

- **Frontend**: React 18, TypeScript, Vite, Zod (schema validation)
- **Backend**: Rust, Tauri, reqwest (HTTP client), regex (pattern matching), serde (serialization)
- **AI**: Ollama (local LLM server)

## Development

### Icon Generation

The app uses a custom icon generation script. Icons are automatically generated from an SVG template:

```bash
# Generate all required icon formats
npm run generate-icons
```

This creates:
- Windows: `icon.ico`
- macOS: `icon.icns`
- Linux/Web: Various PNG sizes (32x32, 128x128, etc.)

The generated icons are placed in `src-tauri/icons/`. The source files (`app-icon.svg` and `app-icon.png`) are temporary and excluded from git.

### Development Scripts

```bash
# Start dev server (frontend only)
npm run dev

# Start full Tauri app in dev mode
npm run tauri:dev

# Build for production
npm run tauri:build

# Generate icons
npm run generate-icons
```

### Adding New Languages

Edit `src/lib/languages.ts` and add your language to `SUPPORTED_LANGUAGES`.

### Customizing Prompts

Modify `src-tauri/src/commands/prompt.rs` to adjust how prompts are constructed for different analysis modes.

### Adding New Secret Patterns

Add regex patterns in `src-tauri/src/commands/secrets.rs` in the `scan_for_secrets` function.

## License

This project is provided as-is for local use. Modify and distribute as needed.

## Contributing

Contributions are welcome! Please ensure:
- Code passes TypeScript and Rust compilation
- Secret scanning tests pass
- UI remains clean and functional
- Security-first principles are maintained

## FAQ

**Q: Does this send my code to the internet?**
A: No. All processing is 100% local. The app only communicates with Ollama running on localhost (127.0.0.1).

**Q: Can I use this offline?**
A: Yes, as long as Ollama and the required models are already installed and running locally.

**Q: What models work best?**
A: For code analysis:
- **Best on limited RAM (2-4GB)**: `tinyllama` - Fast but basic analysis
- **Balanced (4-6GB)**: `llama2` - Good quality and reasonable speed
- **Best quality (8GB+)**: `codellama` or `mistral` - Most accurate analysis

Choose based on your available system RAM. Models need ~2x their size in memory when running.

**Q: Why is the analysis slow?**
A: LLM inference on CPU can be slow. Consider using a GPU-accelerated setup with Ollama or using smaller models.

**Q: Can I analyze large files?**
A: The app is designed for code snippets. Very large files may hit token limits in the model. Break them into smaller logical sections.

## Support

For issues or questions:
- Check the Troubleshooting section above
- Verify Ollama is running and models are installed
- Check the browser/dev console for errors (in dev mode)

---

**Built with privacy and security in mind. Your code stays on your machine.**
