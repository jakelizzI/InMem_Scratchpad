import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceIconPath = path.resolve(__dirname, '../../imm_icon.png');
const publicDir = path.resolve(__dirname, '../../public');
const iconsDir = __dirname;

if (!fs.existsSync(sourceIconPath)) {
  console.error(`Source icon not found at: ${sourceIconPath}`);
  process.exit(1);
}

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const pngBuffer = fs.readFileSync(sourceIconPath);

// Copy to public directory for Web UI / Favicon
fs.writeFileSync(path.join(publicDir, 'imm_icon.png'), pngBuffer);
fs.writeFileSync(path.join(publicDir, 'favicon.png'), pngBuffer);

// Copy PNG formats for Tauri icons
fs.writeFileSync(path.join(iconsDir, '32x32.png'), pngBuffer);
fs.writeFileSync(path.join(iconsDir, '128x128.png'), pngBuffer);
fs.writeFileSync(path.join(iconsDir, '128x128@2x.png'), pngBuffer);
fs.writeFileSync(path.join(iconsDir, 'icon.icns'), pngBuffer);

// Construct Windows 3.00 ICO file format embedding the source PNG payload
const icoHeader = Buffer.from([
  0x00, 0x00, // Reserved
  0x01, 0x00, // Type 1 = ICO
  0x01, 0x00, // Count = 1 image
  0x00,       // Width = 0 (means 256 or custom)
  0x00,       // Height = 0 (means 256 or custom)
  0x00,       // Color count = 0
  0x00,       // Reserved
  0x01, 0x00, // Color planes = 1
  0x20, 0x00, // Bits per pixel = 32
  pngBuffer.length & 0xff, (pngBuffer.length >> 8) & 0xff, (pngBuffer.length >> 16) & 0xff, (pngBuffer.length >> 24) & 0xff, // PNG size
  0x16, 0x00, 0x00, 0x00 // Offset of image payload (22 bytes)
]);

const icoBuffer = Buffer.concat([icoHeader, pngBuffer]);
fs.writeFileSync(path.join(iconsDir, 'icon.ico'), icoBuffer);

console.log('Successfully installed and converted imm_icon.png across all Tauri icons and Web assets!');
