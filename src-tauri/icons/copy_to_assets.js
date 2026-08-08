import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceIconPath = path.resolve(__dirname, '../../imm_icon.png');
const assetsDir = path.resolve(__dirname, '../../src/assets');

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

if (fs.existsSync(sourceIconPath)) {
  fs.copyFileSync(sourceIconPath, path.join(assetsDir, 'icon.png'));
  console.log('Successfully copied icon to src/assets/icon.png!');
}
