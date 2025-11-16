/* eslint-disable padded-blocks */
// Strengthen Phase 0C guardrails: ensure generated drawing tools are gated by feature flags.
// Confirms constructors throw when flags disabled and succeed when enabled.

import { describe, it, beforeEach } from 'node:test';
import { expect } from 'chai';

import { setFeatureFlags, resetFeatureFlags } from '../../../src/feature-flags';
import { RectangleDrawingPrimitive } from '../../../src/drawing/tools/rectangle';

describe('drawing tools feature flags (generated)', () => {
	beforeEach(() => {
		resetFeatureFlags();
	});

	it('throws when flags disabled (rectangle)', () => {
		expect(() => new RectangleDrawingPrimitive()).to.throw(/Feature flag/i);
	});

	it('constructs when required flags are enabled (rectangle)', () => {
		setFeatureFlags({
			drawingTools: true,
			'drawingTools.rectangle': true,
		});
		expect(() => new RectangleDrawingPrimitive()).to.not.throw();
	});

});
