import { describe, it } from 'node:test';
import { expect } from 'chai';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

describe('flags-off bundle exclusions (dist esm)', () => {
	it('default production ESM bundle excludes drawing tools exports', async () => {
		// If dist is not built locally, skip this check. CI verify runs build:prod before tests.
		const mjsUrl = new URL('../../../dist/lightweight-charts.production.mjs', import.meta.url);
		const mjsPath = fileURLToPath(mjsUrl);
		if (!fs.existsSync(mjsPath)) {
			return;
		}

		// Import built ESM bundle; verify no drawing tools are exported when flags are off
		const mod = await import(mjsUrl.href);
		const keys = Object.keys(mod);

		// Sanity: expected public API still present
		expect(keys.includes('createChart')).to.equal(true);
		expect(keys.includes('createTextWatermark')).to.equal(true);

		// Ensure drawing tool exports are NOT present in the default bundle
		const forbidden = ['RectangleDrawingPrimitive', 'RectangleDrawingTool', 'rectangleSpec'];
		for (const k of forbidden) {
			expect(keys.includes(k)).to.equal(false);
		}
		expect(keys.some(k => /^Rectangle/.test(k))).to.equal(false);
	});
});