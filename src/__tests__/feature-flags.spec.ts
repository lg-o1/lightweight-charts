/* eslint-disable @typescript-eslint/tslint/config, @typescript-eslint/no-floating-promises, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access */
import { describe, it, beforeEach, afterEach } from 'node:test';
import { expect } from 'chai';
import { isEnabled, requireEnabled, setEnabled, allFlags, resetFlags } from '../feature-flags';

describe('feature-flags', () => {
	beforeEach(() => {
		// reset to defaults before each test
		resetFlags();
		// clear any global overrides
		delete (globalThis as any).__LWC_FEATURES;
		delete (globalThis as any).__lwc_features;
	});

	afterEach(() => {
		// cleanup
		resetFlags();
		delete (globalThis as any).__LWC_FEATURES;
		delete (globalThis as any).__lwc_features;
	});

	it('defaults: drawingTools=true, rectangle=false (others false)', () => {
		expect(isEnabled('drawingTools')).to.equal(true);
		expect(isEnabled('rectangle')).to.equal(false);
		expect(isEnabled('ellipse')).to.equal(false);
		expect(isEnabled('triangle')).to.equal(false);
		expect(isEnabled('text')).to.equal(false);
		expect(isEnabled('path')).to.equal(false);
		expect(isEnabled('fillBetween')).to.equal(false);
		expect(isEnabled('forecast')).to.equal(false);
		expect(isEnabled('fib')).to.equal(false);
		expect(isEnabled('gann')).to.equal(false);
		expect(isEnabled('pitchfork')).to.equal(false);

		const snapshot = allFlags();
		expect(snapshot.drawingTools).to.equal(true);
		expect(snapshot.rectangle).to.equal(false);
	});

	it('master gate: specific tool requires drawingTools enabled', () => {
		// enable rectangle but disable master gate
		setEnabled('rectangle', true);
		setEnabled('drawingTools', false);

		// rectangle should still be considered disabled because master is off
		expect(isEnabled('rectangle')).to.equal(false);

		// re-enable master, rectangle should now be effective
		setEnabled('drawingTools', true);
		expect(isEnabled('rectangle')).to.equal(true);
	});

	it('requireEnabled throws when feature disabled', () => {
		// by default rectangle is disabled
		expect(() => requireEnabled('rectangle', 'unit-test')).to.throw(
			'[lightweight-charts] Feature "rectangle" is disabled (at unit-test).'
		);

		// enabling rectangle makes requireEnabled pass
		setEnabled('rectangle', true);
		expect(() => requireEnabled('rectangle', 'unit-test')).not.to.throw();
	});

	it('setEnabled toggles and allFlags returns snapshot (not live object)', () => {
		const before = allFlags();
		expect(before.rectangle).to.equal(false);

		setEnabled('rectangle', true);
		const after = allFlags();
		expect(after.rectangle).to.equal(true);

		// before snapshot should remain unchanged (immutable snapshot)
		expect(before.rectangle).to.equal(false);
	});

	it('resetFlags respects global overrides (__LWC_FEATURES)', () => {
		(globalThis as any).__LWC_FEATURES = { drawingTools: true, rectangle: true, fib: true };

		// reset should apply overrides
		resetFlags();
		expect(isEnabled('drawingTools')).to.equal(true);
		expect(isEnabled('rectangle')).to.equal(true);
		expect(isEnabled('fib')).to.equal(true);

		// master gate still applies
		setEnabled('drawingTools', false);
		expect(isEnabled('rectangle')).to.equal(false);
		expect(isEnabled('fib')).to.equal(false);
	});

	it('resetFlags with lowercase override key (__lwc_features) also works', () => {
		delete (globalThis as any).__LWC_FEATURES;
		(globalThis as any).__lwc_features = { drawingTools: true, gann: true };

		resetFlags();
		expect(isEnabled('drawingTools')).to.equal(true);
		expect(isEnabled('gann')).to.equal(true);
	});

	it('does not throw when no overrides present', () => {
		delete (globalThis as any).__LWC_FEATURES;
		delete (globalThis as any).__lwc_features;

		expect(() => resetFlags()).not.to.throw();
		expect(isEnabled('drawingTools')).to.equal(true);
	});
});
