// Sync flags-on Standalone IIFE build to demo vendor directory (Windows-friendly)
// Usage: cross-env LWC_SIZE_LIMIT_MODE=flags-on node ./scripts/sync-standalone-flags-on-to-demo-v0.js

import { copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolve paths relative to this script file to avoid cwd issues
const scriptDir = resolve(fileURLToPath(import.meta.url), '..');
const projectRoot = resolve(scriptDir, '..');
const dist = resolve(projectRoot, 'dist');
const demoVendor = resolve(projectRoot, '..', 'lightweight-charts-demo', 'v0', 'vendor');

function sync(file) {
	const src = resolve(dist, file);
	const dst = resolve(demoVendor, file);
	mkdirSync(demoVendor, { recursive: true });
	if (existsSync(src)) {
		copyFileSync(src, dst);
		// eslint-disable-next-line no-console
		console.log(`[sync] ${src} -> ${dst}`);
	} else {
		console.warn(`[skip] missing ${src}`);
	}
}

// Copy both production and development standalone bundles (iife+esm)
const files = [
	'lightweight-charts.standalone.production.js',
	'lightweight-charts.standalone.production.mjs',
	'lightweight-charts.standalone.development.js',
	'lightweight-charts.standalone.development.mjs',
];

for (const f of files) {
	sync(f);
}

console.log('[sync] Completed flags-on standalone bundle sync to demo v0/vendor');
