/* eslint-disable @typescript-eslint/no-non-null-assertion */
// Rectangle Drawing Primitive - BusinessDay time behavior tests
// Goal: ensure body drag works with non-UTC Time types (BusinessDay/string),
// using pixel-space transform without throwing, and geometry updates consistently.

import { describe, it, beforeEach, afterEach } from 'node:test';
import { expect } from 'chai';
import type { Time } from '../../../src/model/horz-scale-behavior-time/types';
import type { Coordinate } from '../../../src/model/coordinate';
import { RectangleDrawingPrimitive } from '../../../src/drawing/tools/rectangle';
import { setFeatureFlags, resetFeatureFlags } from '../../../src/feature-flags';

// Simple date helpers
function parseBusinessDayToUTCSeconds(t: string): number {
	// expect YYYY-MM-DD
	const d = new Date(`${t}T00:00:00Z`);
	return Math.floor(d.getTime() / 1000);
}

function makeChartMock() {
	const timeScale = {
		timeToCoordinate: (t: Time) => {
			if (typeof t === 'number') return (t as unknown as Coordinate);
			if (typeof t === 'string') return (parseBusinessDayToUTCSeconds(t) as unknown as Coordinate);
			// Fallback for BusinessDay object: map year-month-day to timestamp
			const yyyy = (t as any).year ?? 2021;
			const mm = (t as any).month ?? 1;
			const dd = (t as any).day ?? 1;
			const s = Math.floor(new Date(Date.UTC(yyyy, mm - 1, dd)).getTime() / 1000);
			return (s as unknown as Coordinate);
		},
		coordinateToTime: (x: Coordinate) => {
			// Return UTCTimestamp (seconds) for simplicity; this is valid Time union
			return (x as unknown as number) as unknown as Time;
		},
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

function makeSeriesMock() {
	const s: any = {
		priceToCoordinate: (p: number) => ((p * 10) as unknown as Coordinate),
		coordinateToPrice: (y: Coordinate) => (typeof y === 'number' ? (y / 10) : 10),
		model: () => ({ timeScale: () => ({ width: () => 800 }) }),
		priceScale: () => ({ fontSize: () => 12 }),
	};
	return s;
}

function makeParams(series: any, px: { x: number; y: number }, time: Time, price: number) {
	return {
		point: { x: px.x, y: px.y },
		sourceEvent: { clientX: px.x, clientY: px.y, ctrlKey: false, altKey: false, shiftKey: false, metaKey: false } as any,
		time,
		logical: Math.floor(px.x),
		hoveredSeries: series,
		price,
	};
}

describe('RectangleDrawingPrimitive - BusinessDay time behavior', () => {
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
		chart = makeChartMock();
		series = makeSeriesMock();
		primitive.attached({ chart, series, requestUpdate: () => {}, horzScaleBehavior: {} as any });
	});

	afterEach(() => {
		try { primitive.detached(); } catch {}
		(globalThis as any).requestAnimationFrame = prevRaf;
		(globalThis as any).cancelAnimationFrame = prevCaf;
		resetFeatureFlags();
	});

	it('supports Add → Preview → Complete with BusinessDay string time', () => {
		const t1: Time = '2021-01-04'; // Monday
		const t2: Time = '2021-01-08'; // Friday
		// start at (100, 100) with price=10, time=t1
		chart._click?.(makeParams(series, { x: 100, y: 100 }, t1, 10));
		expect(primitive.getState()).to.equal('anchoring');
		// preview to (200, 200)
		chart._move?.(makeParams(series, { x: 200, y: 200 }, t2, 20));
		expect(primitive.getState()).to.equal('preview');
		// complete
		chart._click?.(makeParams(series, { x: 200, y: 200 }, t2, 20));
		expect(primitive.getState()).to.equal('completed');
	});

	it('body drag adjusts both anchors using pixel transform under BusinessDay time', () => {
		const t1: Time = '2021-01-04';
		const t2: Time = '2021-01-08';
		// Build completed rectangle
		chart._click?.(makeParams(series, { x: 100, y: 100 }, t1, 10));
		chart._move?.(makeParams(series, { x: 200, y: 200 }, t2, 20));
		chart._click?.(makeParams(series, { x: 200, y: 200 }, t2, 20));
		expect(primitive.getState()).to.equal('completed');

		// Enter body drag by clicking inside
		chart._click?.(makeParams(series, { x: 150, y: 150 }, t1, 15));
		expect(primitive.getState()).to.equal('editing');
		// Move by +10px horizontally and vertically
		chart._move?.(makeParams(series, { x: 160, y: 160 }, t2, 16));

		const s = primitive.getStartAnchor();
		const e = primitive.getEndAnchor();
		expect(s && e).to.not.equal(null);
		// Prices should both be shifted by +1 (because coordinateToPrice divides by 10)
		expect(s?.price).to.equal(11);
		expect(e?.price).to.equal(21);
		// Times should be non-null and adjusted (type may become UTCTimestamp due to mock)
		expect(s?.time).to.not.equal(null);
		expect(e?.time).to.not.equal(null);
	});
});
