/* eslint-disable @typescript-eslint/no-non-null-assertion */
// Rectangle Drawing Primitive - controller keyboard dispatch tests
// Ensure central controller path (onKeyDownFromController) triggers the same behavior
// as legacy per-instance listeners for Escape/Delete.

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
	const resolvedTime: Time = (time !== undefined ? time : (x as unknown as Time));
	return {
		point: { x, y },
		sourceEvent: { clientX: x, clientY: y, ctrlKey: false, altKey: false, shiftKey: false, metaKey: false } as any,
		time: resolvedTime,
		logical: Math.floor(x),
		hoveredSeries: series,
		price,
	};
}

describe('RectangleDrawingPrimitive - controller key dispatch', () => {
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

		// Build completed rectangle: start (100,10 @ 100), end (200,20 @ 200)
		chart._click?.(makeParams(series, { x: 100, y: 100 }, 100 as Time, 10));
		chart._move?.(makeParams(series, { x: 200, y: 200 }, 200 as Time, 20));
		chart._click?.(makeParams(series, { x: 200, y: 200 }, 200 as Time, 20));
		expect(primitive.getState()).to.equal('completed');
	});

	afterEach(() => {
		try { primitive.detached(); } catch {}
		(globalThis as any).requestAnimationFrame = prevRaf;
		(globalThis as any).cancelAnimationFrame = prevCaf;
		resetFeatureFlags();
	});

	it('Escape sent via controller reverts editing to completed', () => {
		// Click inside to enter editing
		chart._click?.(makeParams(series, { x: 150, y: 150 }, 150 as Time, 15));
		expect(primitive.getState()).to.equal('editing');
		// Trigger through controller public API
		primitive.onKeyDownFromController({ key: 'Escape' } as any);
		expect(primitive.getState()).to.equal('completed');
	});

	it('Delete sent via controller deletes rectangle to idle', () => {
		primitive.onKeyDownFromController({ key: 'Delete' } as any);
		expect(primitive.getState()).to.equal('idle');
		expect(primitive.getStartAnchor()).to.equal(null);
		expect(primitive.getEndAnchor()).to.equal(null);
	});
});
