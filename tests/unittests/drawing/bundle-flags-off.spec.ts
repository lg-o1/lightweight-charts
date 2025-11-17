import { describe, it } from 'node:test';
import { expect } from 'chai';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

describe('bundle includes drawing tools (dist esm)', () => {
	it('default production ESM bundle includes rectangle drawing exports', async () => {
		// If dist is not built locally, skip this check. CI verify runs build:prod before tests.
		const mjsUrl = new URL('../../../dist/lightweight-charts.production.mjs', import.meta.url);
		const mjsPath = fileURLToPath(mjsUrl);
		if (!fs.existsSync(mjsPath)) {
			return;
		}

		// Import built ESM bundle; verify drawing tool exports are present
		const mod = await import(mjsUrl.href);
		const keys = Object.keys(mod);

		// Sanity: expected public API still present
		expect(keys.includes('createChart')).to.equal(true);
		expect(keys.includes('createTextWatermark')).to.equal(true);

		// Ensure rectangle drawing tool exports are present in the default bundle
		const required = ['RectangleDrawingPrimitive', 'RectangleDrawingTool', 'rectangleSpec'];
		for (const k of required) {
			expect(keys.includes(k)).to.equal(true);
		}
		// Rectangle namespace consistency
		expect(keys.some(k => /^Rectangle/.test(k))).to.equal(true);
	});
});
