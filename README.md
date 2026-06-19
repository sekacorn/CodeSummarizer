# Code Summarizer

[![Latest release](https://img.shields.io/github/v/release/sekacorn/CodeSummarizer)](https://github.com/sekacorn/CodeSummarizer/releases/latest)
[![Windows build](https://github.com/sekacorn/CodeSummarizer/actions/workflows/windows-release.yml/badge.svg)](https://github.com/sekacorn/CodeSummarizer/actions/workflows/windows-release.yml)
[![License: GPL-3.0-or-later](https://img.shields.io/badge/license-GPL--3.0--or--later-blue.svg)](LICENSE)
![Rust](https://img.shields.io/badge/backend-Rust-orange)
![Tauri](https://img.shields.io/badge/desktop-Tauri-24C8DB)
![Windows](https://img.shields.io/badge/platform-Windows-0078D4)

A **local-first, privacy-first, offline-capable** desktop application for analyzing code snippets with local AI models. It is built for developers who need help understanding code without sending source material to the internet, especially junior developers working in sensitive environments where cloud tools are not allowed. Built with Tauri (Rust) and React (TypeScript).

## Screenshots

![Code Summarizer - Main Interface](screenshot.jpg)

![Code Summarizer - Analysis View](screenshot-2.jpg)

![Code Summarizer - Risk Scan](screenshot-3.jpg)

## The Problem It Solves

Many developers, especially junior developers, run into situations where they need fast answers about code but cannot safely paste that code into an online AI tool, forum, or third-party website.

This becomes even more important in **government, regulated, classified-adjacent, or otherwise sensitive work** where:

- Code may contain confidential business logic, internal architecture, or protected data patterns
- Internet access may be restricted or discouraged
- Approved tooling must run locally
- Senior developers are not always immediately available to explain unfamiliar code or review a tricky snippet

Code Summarizer is designed for exactly that gap:

- You need help understanding code
- You need that help **now**
- You cannot rely on cloud-based developer assistants
- You still want a reliable, structured answer without exposing sensitive material

This project came out of a real need: needing support on an assignment when experienced developers were unavailable, while still needing to respect privacy and environment constraints.

## Selling Points

- **100% Local**: All processing happens on your machine. No cloud calls, no external AI APIs.
- **Privacy-First by Design**: Your potentially sensitive code stays on your computer.
- **Built for Sensitive Workflows**: Useful for government, enterprise, regulated, or air-gapped style environments.
- **Junior Developer Friendly**: Explains code in plain language when you need guidance and no senior developer is available.
- **Secret Protection**: Automatically detects and can mask secrets before sending code to the local model.
- **Offline-Capable**: Works without internet access once Ollama and your models are installed locally.
- **Multiple Analysis Modes**: Get summaries, junior-friendly explanations, security risk assessments, or syntax validation.
- **Desktop App, Not a Browser Dependency**: A focused local application rather than a web service that requires trust in external infrastructure.

## Why Code Summarizer?

- **Acts like a local coding assistant** for moments when you need an explanation, a sanity check, or a quick risk review
- **Safer for sensitive code** than cloud-based chat tools
- **Helpful for onboarding and self-unblocking** when teammates are unavailable
- **Structured outputs** make it easier to review, copy, and share sanitized findings internally
- **Simple local setup** with Ollama keeps the stack understandable and auditable

## Features

- **Supported Languages for Analysis**: Java, Python, JavaScript, SQL, VBA, JSON, CSS, DAX, C, C++, C#, Assembly, Fortran, COBOL, BASH, PL/SQL, T-SQL, SAS, R, MATLAB, VHDL, Verilog, SystemVerilog, VB.NET, Pascal, Delphi/Object Pascal, ABAP, XML, XSLT, Terraform/HCL
- **Analysis Modes**:
  - **Summarize**: Get a concise overview with structured breakdown
  - **Explain for Junior**: Beginner-friendly explanations with detailed walkthroughs
  - **Risk Scan**: Security-focused analysis highlighting potential vulnerabilities
  - **Validate**: LLM-based validation that checks for likely syntax errors and structural issues, with line/column locations when the model can infer them
- **Secret Scanning**: Detects AWS keys, JWT tokens, passwords, API keys, PEM keys, and Bearer tokens
- **Structured Output**: JSON-validated responses with sections for summary, walkthrough, inputs, outputs, side effects, risks, and confidence scores
- **Copy Functionality**: Copy any section individually to your clipboard

### What "Supported" Means

In this project, a supported language means:

- You can select it in the app
- The selected language is passed into the prompt so the local model analyzes the snippet in that language context
- You can use all four analysis modes with it: Summarize, Explain for Junior, Risk Scan, and Validate

It does **not** currently mean:

- A dedicated compiler integration
- A language server integration
- A formal parser or AST-based validator
- Guaranteed compiler-accurate syntax checking

The **Validate** feature is currently **model-guided validation**, not a replacement for running a real compiler, interpreter, linter, or assembler for that language.

## Who This Is For

- Junior developers working with unfamiliar codebases
- Developers in government or security-sensitive environments
- Teams that cannot use cloud AI tools because of privacy or compliance constraints
- Engineers who want a local-only assistant for explaining snippets, checking risks, and validating structure

## Typical Use Cases

- Understanding a legacy function when no senior engineer is available
- Getting a junior-friendly explanation of a code snippet from an internal assignment
- Reviewing code for obvious risks before asking for formal review
- Validating syntax or structure before handing work off to a teammate
- Safely inspecting code that should not leave a protected environment

## Prerequisites

Release users need:

1. Windows 10 or Windows 11 (64-bit)
2. **Ollama**, installed separately from [ollama.com](https://ollama.com/)
3. At least one local Ollama model

The MSI and NSIS installers include the offline Microsoft Edge WebView2 installer. Release users do **not** need Node.js or Rust. Developers building from source need Node.js 22 and the stable Rust toolchain.

## Installation

### Windows release

1. Download the NSIS `Setup.exe` (recommended for most users) or MSI from [GitHub Releases](https://github.com/sekacorn/CodeSummarizer/releases).
2. Download `SHA256SUMS.txt` and verify the file, for example:

   ```powershell
   Get-FileHash .\CodeSummarizer-1.0.0-windows-x64-setup.exe -Algorithm SHA256
   ```

3. Run the installer. Unsigned community builds may display Microsoft SmartScreen warnings; verify the checksum and release source before continuing.
4. Install Ollama and pull a model as described below.

The portable ZIP is useful when installation is not permitted. Extract it and run `Code Summarizer.exe`; it requires WebView2 to already be installed. See [WINDOWS_RELEASE.md](WINDOWS_RELEASE.md) for installer, silent-install, uninstall, and packaging details.

### 1. Install Ollama

Download and install Ollama from [ollama.com](https://ollama.com/). Ollama and model files are not bundled, installed, updated, or licensed by Code Summarizer.

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

### 3. Build from source (developers only)

```bash
# Clone the repository
git clone https://github.com/sekacorn/CodeSummarizer.git
cd CodeSummarizer

# Run the setup script (checks prerequisites, installs deps, generates icons, runs tests)
# Windows:
setup.bat
# macOS/Linux:
chmod +x setup.sh && ./setup.sh
```

Or if you prefer to do it manually:

```bash
npm ci
npm run generate-icons
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

### Production Windows build

```bash
npm run tauri:build:windows
```

The verified MSI, NSIS installer, portable ZIP, and SHA-256 manifest will be in `artifacts/`.

## Usage

1. **Start Ollama**: Make sure Ollama is running (`ollama serve`)
2. **Launch the App**: Start the installed app from the Start menu (or use `npm run tauri dev` when developing)
3. **Select Language**: Choose the programming language of your code
4. **Select Model**: Pick an Ollama model from the dropdown
5. **Configure Secret Masking**: Toggle "Mask secrets before sending to model" (ON by default)
6. **Paste Code**: Enter your code in the text area
7. **Choose Action**:
   - Click **Summarize** for a high-level overview
   - Click **Explain for Junior** for beginner-friendly explanations
   - Click **Risk Scan** for security analysis
   - Click **Validate** to check for syntax errors (shows line and column numbers)
8. **Review Results**: The right panel will display structured analysis with copyable sections

### Recommended Workflow for Sensitive Environments

1. Run Ollama locally on the approved machine
2. Keep **"Mask secrets before sending to model"** enabled
3. Paste only the code snippet you need help understanding
4. Start with **Explain for Junior** if you need plain-language guidance
5. Use **Risk Scan** when reviewing code that may touch authentication, data access, or external systems
6. Use **Validate** when you need a quick local syntax or structure check

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

Sensitive Mode independently enforces redaction at the Rust command boundary, hides raw model output, and disables clipboard export. Parsed output and raw model output still exist temporarily in application memory while a response is processed.

### No Data Persistence

- Code is **never** written to disk by this application
- No telemetry or logging of your code
- All processing happens in-memory

### Localhost-Only Communication

- All model requests go exclusively to `http://127.0.0.1:11434`
- No external network requests are made
- The Rust backend uses a fixed loopback URL; the frontend cannot choose another endpoint

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
npm run tauri:build:windows

# Run TypeScript/schema tests, frontend build, Rust/redaction tests, and release checks
npm run verify

# Generate icons
npm run generate-icons
```

### Adding New Languages

Edit `src/lib/languages.ts` and add your language to `SUPPORTED_LANGUAGES`.

Because language handling is currently prompt-based, adding a language to the list makes it available for model-driven analysis in the UI. It does not automatically add compiler-aware or parser-aware validation for that language.

### Customizing Prompts

Modify `src-tauri/src/commands/prompt.rs` to adjust how prompts are constructed for different analysis modes.

### Adding New Secret Patterns

Add regex patterns in `src-tauri/src/commands/secrets.rs` in the `scan_for_secrets` function.

## License

This project is licensed under the GNU General Public License v3.0 or later
(GPL-3.0-or-later). See the [LICENSE](LICENSE) file for details.

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

**Q: Is this meant for junior developers?**
A: Yes. One of the main goals is to help junior developers understand code safely in environments where asking a cloud AI tool is not an option and a senior developer may not be immediately available.

**Q: Why not just use ChatGPT, Copilot, or another online tool?**
A: In many sensitive environments, that may not be allowed or appropriate. Code Summarizer is designed for situations where privacy, local execution, and no internet dependency matter more than cloud convenience.

**Q: Is this useful for government or regulated work?**
A: That is one of the core use cases. If your environment requires local processing, minimal data exposure, and no external API calls, this app is built to fit that workflow.

**Q: What models work best?**
A: For code analysis:
- **Best on limited RAM (2-4GB)**: `tinyllama` - Fast but basic analysis
- **Balanced (4-6GB)**: `llama2` - Good quality and reasonable speed
- **Best quality (8GB+)**: `codellama` or `mistral` - Most accurate analysis

Choose based on your available system RAM. Models need ~2x their size in memory when running.

**Q: Does "Validate" use real compilers or parsers for each language?**
A: No. Today, Validate uses the local language model to identify likely syntax, type, and structural issues. It is useful for quick local feedback, but it should not be treated as a substitute for a real compiler, interpreter, linter, shell checker, assembler, or language-specific toolchain.

**Q: Why is the analysis slow?**
A: LLM inference on CPU can be slow. Consider using a GPU-accelerated setup with Ollama or using smaller models.

**Q: Can I analyze large files?**
A: The app is designed for code snippets. Very large files may hit token limits in the model. Break them into smaller logical sections.

## Support

For issues or questions:
- Check the Troubleshooting section above
- Verify Ollama is running and models are installed
- Check the browser/dev console for errors (in dev mode)

## Security

See [SECURITY.md](SECURITY.md) for the project's security policy, limitations, vulnerability reporting process, and guidance for evaluating the app in sensitive environments.

Additional review-oriented documentation:

- [PRIVACY.md](PRIVACY.md)
- [THREAT_MODEL.md](THREAT_MODEL.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [WINDOWS_RELEASE.md](WINDOWS_RELEASE.md)
- [RELEASE_NOTES.md](RELEASE_NOTES.md)
- [AUDIT_READINESS.md](AUDIT_READINESS.md)
- [RESTRICTED_DEPLOYMENT.md](RESTRICTED_DEPLOYMENT.md)

---

**Built for developers who need help without giving up privacy. Your code stays on your machine.**
