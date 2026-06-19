import { readFileSync } from "node:fs";

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const packageJson = readJson("package.json");
const tauriConfig = readJson("src-tauri/tauri.conf.json");
const cargoToml = readFileSync("src-tauri/Cargo.toml", "utf8");
const languages = readFileSync("src/lib/languages.ts", "utf8");
const license = readFileSync("LICENSE", "utf8");

const fail = (message) => {
  console.error(`release check failed: ${message}`);
  process.exitCode = 1;
};

const cargoVersion = cargoToml.match(/^version\s*=\s*"([^"]+)"/m)?.[1];
if (packageJson.version !== tauriConfig.package.version || packageJson.version !== cargoVersion) {
  fail("package.json, Cargo.toml, and tauri.conf.json versions must match");
}
if (packageJson.license !== "GPL-3.0-or-later" || !cargoToml.includes('license = "GPL-3.0-or-later"')) {
  fail("GPL-3.0-or-later metadata must be preserved");
}
if (!license.includes("GNU GENERAL PUBLIC LICENSE") || !license.includes("version 3")) {
  fail("LICENSE must contain the GNU GPL v3 notice");
}
for (const target of ["nsis", "msi"]) {
  if (!tauriConfig.tauri.bundle.targets.includes(target)) fail(`missing ${target} bundle target`);
}
if (tauriConfig.tauri.bundle.windows.webviewInstallMode.type !== "offlineInstaller") {
  fail("Windows installers must include the offline WebView2 installer");
}
if (tauriConfig.tauri.allowlist.all !== false || tauriConfig.tauri.allowlist.http.request !== false) {
  fail("Tauri allowlist is broader than expected");
}
if (!tauriConfig.tauri.security.csp.includes("http://127.0.0.1:11434")) {
  fail("CSP must not permit a non-loopback Ollama endpoint");
}

const requiredLanguages = [
  "PL/SQL", "T-SQL", "SAS", "R", "MATLAB", "VHDL", "Verilog", "SystemVerilog",
  "VB.NET", "Pascal", "Delphi/Object Pascal", "ABAP", "XML", "XSLT", "Terraform/HCL",
];
for (const language of requiredLanguages) {
  if (!languages.includes(`"${language}"`)) fail(`missing language: ${language}`);
}

if (!process.exitCode) console.log(`Release invariants verified for v${packageJson.version}.`);
