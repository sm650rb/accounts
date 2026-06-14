#!/usr/bin/env node
/**
 * Copy assets into .next/standalone for production deploy (FTP / Node hosting).
 * Run from acc/ after `npm run build`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const accRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const standalone = path.join(accRoot, '.next/standalone');

if (!fs.existsSync(standalone)) {
  console.error('Standalone output missing. Run: npm run build');
  process.exit(1);
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`[prepare] Skipping missing path: ${src}`);
    return;
  }
  fs.rmSync(dest, { recursive: true, force: true });
  fs.cpSync(src, dest, { recursive: true });
}

console.log('[prepare] Copying .next/static → standalone/.next/static');
copyDir(path.join(accRoot, '.next/static'), path.join(standalone, '.next/static'));

console.log('[prepare] Copying public → standalone/public');
copyDir(path.join(accRoot, 'public'), path.join(standalone, 'public'));

console.log('[prepare] Copying sql → standalone/sql');
copyDir(path.join(accRoot, 'sql'), path.join(standalone, 'sql'));

const scriptsDest = path.join(standalone, 'scripts');
fs.mkdirSync(scriptsDest, { recursive: true });

for (const name of ['run-migrations.mjs', 'start-production.sh']) {
  const src = path.join(accRoot, 'scripts', name);
  fs.copyFileSync(src, path.join(scriptsDest, name));
  if (name.endsWith('.sh')) {
    fs.chmodSync(path.join(scriptsDest, name), 0o755);
  }
}

const startJs = `const { execSync } = require('node:child_process');

process.chdir(__dirname);

try {
  execSync('node scripts/run-migrations.mjs', { stdio: 'inherit', env: process.env });
} catch {
  process.exit(1);
}

require('./server.js');
`;
fs.writeFileSync(path.join(standalone, 'start.js'), startJs);

const pkgPath = path.join(standalone, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = {
  prestart: 'node scripts/run-migrations.mjs',
  start: 'node server.js',
  'start:prod': 'node start.js',
  migrate: 'node scripts/run-migrations.mjs',
};
fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

fs.copyFileSync(
  path.join(accRoot, '.env.production.example'),
  path.join(standalone, '.env.production.example'),
);

const envSrc = path.join(accRoot, '.env');
if (fs.existsSync(envSrc)) {
  fs.copyFileSync(envSrc, path.join(standalone, '.env'));
  console.log('[prepare] Copied .env → standalone/.env (production deploy)');
} else {
  console.warn('[prepare] No acc/.env — create one from .env.production.example before deploy');
}

console.log('[prepare] Standalone bundle ready at acc/.next/standalone');
