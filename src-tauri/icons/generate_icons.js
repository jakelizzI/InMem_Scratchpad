import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base64 valid 1x1 transparent PNG
const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAADhJREFUeJztwQENAAAAwqD3T20PBxQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8GA8AAAB052qgAAAAABJRU5ErkJggg==';
const buffer = Buffer.from(base64Png, 'base64');

const iconsDir = __dirname;
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const files = ['32x32.png', '128x128.png', '128x128@2x.png', 'icon.icns', 'icon.ico'];

files.forEach(file => {
  const filePath = path.join(iconsDir, file);
  fs.writeFileSync(filePath, buffer);
  console.log(`Created ${file}`);
});
