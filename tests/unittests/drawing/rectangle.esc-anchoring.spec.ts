/* eslint-disable @typescript-eslint/no-non-null-assertion */
// Rectangle Drawing Primitive - ESC from anchoring/preview should reset to idle and clear anchors

import { describe, it, beforeEach, afterEach } from 'node:test';
import { expect } from 'chai';
import type { Time } from '../../../src/model/horz-scale-behavior-time/types';
import type { Coordinate } from '../../../src/model/coordinate';
import { RectangleDrawingPrimitive } from '../../../src/drawing/tools/rectangle';
import { setFeatureFlags, resetFeatureFlags } from '../../../src/feature-flags';

function createChartMock() {
	const timeScale = {
		timeToCoordinate: (t: Time) => (typeof t === 'number' ? t : 100) as Coordinate,
		coordinateToTime: (x: Coordinate) => (typeof x === 'number' ? (x as unknown as Time) : (100 as Time)),
		width: () => 800,
	};
	const chart: any = {
		_click: undefined as any,
		_move: undefined as any,
		subscribeClick(fn: any) { this._click = fn; },
		unsubscribeClick() { this._click = undefined; },
		subscribeCrosshairMove(fn: any) { this._move = fn; },
		unsubscribeCrosshairMove() { this._move = undefined; },
		timeScale() { return timeScale; },
		isDestroyed() { return false; },
		model() { return { timeScale: () => timeScale }; },
	};
	return chart;
}

function createSeriesMock() {
	const s: any = {
		priceToCoordinate: (p: number) => (typeof p === 'number' ? (p * 10) : 100) as Coordinate,
		coordinateToPrice: (y: Coordinate) => (typeof y === 'number' ? (y / 10) : 10),
		model: () => ({ timeScale: () => ({ width: () => 800 }) }),
		priceScale: () => ({ fontSize: () => 12 }),
	};
	return s;
}

function makeParams(series: any, pxPoint: { x?: number; y?: number } | null, time?: Time, price?: number) {
	if (!pxPoint || pxPoint.x === undefined || pxPoint.y === undefined) {
		return { point: undefined };
	}
	const x = pxPoint.x;
	const y = pxPoint.y;
	const resolvedTime = (time !== undefined ? time : x);
	return {
		point: { x, y },
		sourceEvent: { clientX: x, clientY: y, ctrlKey: false, altKey: false, shiftKey: false, metaKey: false },
		time: resolvedTime,
		logical: Math.floor(x),
		hoveredSeries: series,
		price,
	};
}

describe('RectangleDrawingPrimitive - ESC from anchoring/preview', () => {
	let primitive: RectangleDrawingPrimitive;
	let chart: any;
	let series: any;
	let prevRaf: any;
	let prevCaf: any;

	beforeEach(() => {
		setFeatureFlags({ 'drawingTools.rectangle': true });
		prevRaf = (globalThis as any).requestAnimationFrame;
		prevCaf = (globalThis as any).cancelAnimationFrame;
		(globalThis as any).requestAnimationFrame = (cb: (t?: any) => void) => { try { cb(); } catch {} return 1 as any; };
		(globalThis as any).cancelAnimationFrame = (_: any) => {};
		primitive = new RectangleDrawingPrimitive();
		chart = createChartMock();
		series = createSeriesMock();
		primitive.attached({ chart, series, requestUpdate: () => {}, horzScaleBehavior: {} as any });
	});

	afterEach(() => {
		try { primitive.detached(); } catch {}
		(globalThis as any).requestAnimationFrame = prevRaf;
		(globalThis as any).cancelAnimationFrame = prevCaf;
		resetFeatureFlags();
	});

	it('ESC from anchoring returns to idle and clears anchors', () => {
		chart._click?.(makeParams(series, { x: 100, y: 100 }, 100 as Time, 10));
		expect(primitive.getState()).to.equal('anchoring');
		primitive.onKeyDownFromController({ key: 'Escape' } as any);
		expect(primitive.getState()).to.equal('idle');
		expect(primitive.getStartAnchor()).to.equal(null);
		expect(primitive.getEndAnchor()).to.equal(null);
	});

	it('ESC from preview returns to idle and clears anchors', () => {
		chart._click?.(makeParams(series, { x: 100, y: 100 }, 100 as Time, 10));
		chart._move?.(makeParams(series, { x: 200, y: 200 }, 200 as Time, 20));
		expect(primitive.getState()).to.equal('preview');
		primitive.onKeyDownFromController({ key: 'Escape' } as any);
		expect(primitive.getState()).to.equal('idle');
		expect(primitive.getStartAnchor()).to.equal(null);
		expect(primitive.getEndAnchor()).to.equal(null);
	});
});
