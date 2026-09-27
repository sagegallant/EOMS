import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

if (!fs.existsSync(distDir)) {
  console.error('❌ dist/ directory not found. Please run vite build first.');
  process.exit(1);
}

// 1. Copy index.html to 404.html for GitHub Pages fallback
const indexPath = path.join(distDir, 'index.html');
const notFoundPath = path.join(distDir, '404.html');

if (fs.existsSync(indexPath)) {
  fs.copyFileSync(indexPath, notFoundPath);
  console.log('✔ Created 404.html for GitHub Pages SPA routing fallback.');
}

// 2. Create .nojekyll to prevent GitHub Pages from ignoring special directories
const noJekyllPath = path.join(distDir, '.nojekyll');
fs.writeFileSync(noJekyllPath, '');
console.log('✔ Created .nojekyll flag file.');

console.log('🎉 GitHub Pages static bundle prepared successfully in client/dist/!');
