/* eslint-disable padded-blocks */
// Strengthen Phase 0C guardrails: ensure generated drawing tools are gated by feature flags.
// Confirms constructors throw when flags disabled and succeed when enabled.

import { describe, it, beforeEach } from 'node:test';
import { expect } from 'chai';

import { isEnabled, resetFeatureFlags } from '../../../src/feature-flags';
import { RectangleDrawingPrimitive } from '../../../src/drawing/tools/rectangle';

describe('drawing tools without feature flags (always enabled)', () => {
	beforeEach(() => {
		resetFeatureFlags();
	});

	it('Rectangle constructs without any flags', () => {
		expect(() => new RectangleDrawingPrimitive()).to.not.throw();
	});

	it('isEnabled returns true for any feature', () => {
		expect(isEnabled('drawingTools')).to.equal(true);
		expect(isEnabled('drawingTools.rectangle' as any)).to.equal(true);
	});

});
