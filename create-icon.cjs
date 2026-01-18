// Simple script to create a basic app icon
const fs = require('fs');
const sharp = require('sharp');

async function createIcon() {
  // Create a simple SVG icon
  const size = 1024;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="#4A90E2" rx="180"/>

  <!-- Code brackets -->
  <g fill="white" stroke="white" stroke-width="40" stroke-linecap="round" stroke-linejoin="round">
    <!-- Left bracket -->
    <path d="M 350 300 L 250 512 L 350 724" fill="none"/>
    <!-- Right bracket -->
    <path d="M 674 300 L 774 512 L 674 724" fill="none"/>
    <!-- Middle slash -->
    <path d="M 580 300 L 444 724" fill="none"/>
  </g>
</svg>`;

  // Save SVG
  fs.writeFileSync('app-icon.svg', svg);
  console.log('Created app-icon.svg');

  // Convert to PNG
  await sharp(Buffer.from(svg))
    .resize(1024, 1024)
    .png()
    .toFile('app-icon.png');

  console.log('Created app-icon.png (1024x1024)');
}

createIcon().catch(console.error);
