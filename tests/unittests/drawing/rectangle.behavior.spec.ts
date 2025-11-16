/* eslint-disable @typescript-eslint/no-non-null-assertion, no-duplicate-imports, @typescript-eslint/no-unnecessary-type-assertion */
// Rectangle Drawing Primitive - behavior tests (Wave0)
// Covers: anchors/state transitions/handles/hit-test/autoscale/labels presence

import { describe, it, beforeEach, afterEach } from 'node:test';
import { expect } from 'chai';
import type { Time } from '../../../src/model/horz-scale-behavior-time/types';
import type { Coordinate } from '../../../src/model/coordinate';
import { RectangleDrawingPrimitive, rectangleSpec } from '../../../src/drawing/tools/rectangle';
import { setFeatureFlags, resetFeatureFlags } from '../../../src/feature-flags';

// Minimal chart/series mocks compatible with DrawingPrimitiveBase.attach lifecycle
function createChartMock() {
	const timeScale = {
		timeToCoordinate: (t: Time) => (typeof t === 'number' ? t : 100) as Coordinate,
		coordinateToTime: (x: Coordinate) => (typeof x === 'number' ? (x as unknown as Time) : (100 as Time)),
		width: () => 800,
	};
	const chart: any = {
		_click: undefined as any,
		_move: undefined as any,
		_dbl: undefined as any,
		subscribeClick(fn: any) { this._click = fn; },
		unsubscribeClick() { this._click = undefined; },
		subscribeCrosshairMove(fn: any) { this._move = fn; },
		unsubscribeCrosshairMove() { this._move = undefined; },
		subscribeDblClick(fn: any) { this._dbl = fn; },
		unsubscribeDblClick() { this._dbl = undefined; },
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
	return {
		point: { x: pxPoint.x!, y: pxPoint.y! },
		sourceEvent: { clientX: pxPoint.x!, clientY: pxPoint.y!, ctrlKey: false, altKey: false, shiftKey: false, metaKey: false } as any,
		time: time ?? (pxPoint.x! as unknown as Time),
		logical: Math.floor(pxPoint.x!),
		hoveredSeries: series,
		price,
	};
}

describe('RectangleDrawingPrimitive (Wave0 behavior)', () => {
	let primitive: RectangleDrawingPrimitive;
	let chart: any;
	let series: any;
	let requestUpdateCalls: number;
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
		requestUpdateCalls = 0;
		primitive.attached({
			chart,
			series,
			requestUpdate: () => { requestUpdateCalls++; },
			horzScaleBehavior: {} as any,
		});
	});

	afterEach(() => {
		try { primitive.detached(); } catch {}
		(globalThis as any).requestAnimationFrame = prevRaf;
		(globalThis as any).cancelAnimationFrame = prevCaf;
		resetFeatureFlags();
	});

	it('spec metadata is consistent', () => {
		expect(rectangleSpec.toolId).to.equal('rectangle');
		expect(rectangleSpec.featureFlag).to.equal('drawingTools.rectangle');
		expect(Array.isArray(rectangleSpec.states)).to.equal(true);
		expect(Array.isArray(rectangleSpec.handles)).to.equal(true);
	});

	it('first click → anchoring; move → preview; second click → completed', () => {
		// First click sets start anchor
		const p1 = makeParams(series, { x: 100, y: 200 }, 100 as Time, 20);
		chart._click?.(p1);
		expect(primitive.getState()).to.equal('anchoring');

		// Move defines preview end anchor
		const p2m = makeParams(series, { x: 200, y: 300 }, 200 as Time, 30);
		chart._move?.(p2m);
		expect(primitive.getState()).to.equal('preview');

		// Second click completes rectangle
		const p2 = makeParams(series, { x: 200, y: 300 }, 200 as Time, 30);
		chart._click?.(p2);
		expect(primitive.getState()).to.equal('completed');
	});

	it('autoscaleInfo merges vertical bounds from anchors', () => {
		// Build anchors through clicks
		chart._click?.(makeParams(series, { x: 100, y: 200 }, 100 as Time, 5));
		chart._move?.(makeParams(series, { x: 200, y: 300 }, 200 as Time, 15));
		chart._click?.(makeParams(series, { x: 200, y: 300 }, 200 as Time, 15));

		const info = primitive.autoscaleInfo(100, 200);
		expect(info).to.not.equal(null);
		expect(info?.priceRange?.minValue).to.equal(20);
		expect(info?.priceRange?.maxValue).to.equal(30);
	});

	it('hitTest detects body inside and returns move cursor', () => {
		// anchors
		chart._click?.(makeParams(series, { x: 100, y: 200 }, 100 as Time, 10));
		chart._move?.(makeParams(series, { x: 300, y: 400 }, 300 as Time, 20));
		chart._click?.(makeParams(series, { x: 300, y: 400 }, 300 as Time, 20));

		// inside point
		const inside = primitive.hitTest(200, 300);
		expect(inside).to.not.equal(null);
		expect(inside?.cursorStyle).to.equal('move');
		expect(inside?.zOrder).to.equal('normal');
	});

	it('handles are created for 4 corners and are hit-testable', () => {
		// anchors
		chart._click?.(makeParams(series, { x: 100, y: 100 }, 100 as Time, 10));
		chart._move?.(makeParams(series, { x: 200, y: 200 }, 200 as Time, 20));
		chart._click?.(makeParams(series, { x: 200, y: 200 }, 200 as Time, 20));

		// The top-left pixel is min-min of (x1,x2) and (y1,y2)
		const tlHit = primitive.hitTest(100, 100);
		const brHit = primitive.hitTest(200, 200);
		expect(tlHit).to.not.equal(null);
		expect(brHit).to.not.equal(null);
		expect(tlHit?.externalId).to.contain('rectangle-handle-');
		expect(brHit?.externalId).to.contain('rectangle-handle-');
		expect(tlHit?.zOrder).to.equal('top');
		expect(brHit?.zOrder).to.equal('top');
	});

	it('labels presence in axis views when showLabels=true', () => {
		// anchors
		chart._click?.(makeParams(series, { x: 100, y: 100 }, 100 as Time, 10));
		chart._move?.(makeParams(series, { x: 200, y: 200 }, 200 as Time, 20));
		chart._click?.(makeParams(series, { x: 200, y: 200 }, 200 as Time, 20));

		// Collect axis views through DrawingPrimitiveBase APIs
		const priceAxisViews = (primitive as any).priceAxisViews();
		const timeAxisViews = (primitive as any).timeAxisViews();
		expect(Array.isArray(priceAxisViews)).to.equal(true);
		expect(Array.isArray(timeAxisViews)).to.equal(true);
		// Expect up to 2 labels per axis (start/end)
		expect(priceAxisViews.length).to.be.greaterThan(0);
		expect(timeAxisViews.length).to.be.greaterThan(0);
	});

	it('requestUpdate coalesces in rectangle flows', () => {
		// Ensure RAF flushes synchronously in unit environment
		const oldRaf = (globalThis as any).requestAnimationFrame;
		(globalThis as any).requestAnimationFrame = (cb: any) => { cb(0); return 1; };

		chart._click?.(makeParams(series, { x: 120, y: 220 }, 120 as Time, 22));
		chart._move?.(makeParams(series, { x: 240, y: 340 }, 240 as Time, 34));
		chart._click?.(makeParams(series, { x: 240, y: 340 }, 240 as Time, 34));

		// Restore RAF
		(globalThis as any).requestAnimationFrame = oldRaf;

		// At least one update scheduled across interactions
		expect(requestUpdateCalls).to.be.greaterThan(0);
	});
});
// Additional Wave0 behavior tests: serialization/undo/redo/delete coverage

import { describe as describe2, it as it2, beforeEach as beforeEach2, afterEach as afterEach2 } from 'node:test';
import { expect as expect2 } from 'chai';
import type { Time as Time2 } from '../../../src/model/horz-scale-behavior-time/types';
import type { Coordinate as Coordinate2 } from '../../../src/model/coordinate';
import { RectangleDrawingPrimitive as RectangleDrawingPrimitive2 } from '../../../src/drawing/tools/rectangle';
import { setFeatureFlags as setFeatureFlags2, resetFeatureFlags as resetFeatureFlags2 } from '../../../src/feature-flags';

describe2('RectangleDrawingPrimitive (Wave0 serialize/undo/delete)', () => {
	let chart2: any;
	let series2: any;
	let prevRaf2: any;
	let prevCaf2: any;

	// Reuse helpers defined earlier in the file
	function createChartMock2() {
		const timeScale = {
			timeToCoordinate: (t: Time2) => (typeof t === 'number' ? t : 100) as Coordinate2,
			coordinateToTime: (x: Coordinate2) => (typeof x === 'number' ? (x as unknown as Time2) : (100 as Time2)),
			width: () => 800,
		};
		const chart: any = {
			_click: undefined as any,
			_move: undefined as any,
			_dbl: undefined as any,
			subscribeClick(fn: any) { this._click = fn; },
			unsubscribeClick() { this._click = undefined; },
			subscribeCrosshairMove(fn: any) { this._move = fn; },
			unsubscribeCrosshairMove() { this._move = undefined; },
			subscribeDblClick(fn: any) { this._dbl = fn; },
			unsubscribeDblClick() { this._dbl = undefined; },
			timeScale() { return timeScale; },
			isDestroyed() { return false; },
			model() { return { timeScale: () => timeScale }; },
		};
		return chart;
	}

	function createSeriesMock2() {
		const s: any = {
			priceToCoordinate: (p: number) => (typeof p === 'number' ? (p * 10) : 100) as Coordinate2,
			coordinateToPrice: (y: Coordinate2) => (typeof y === 'number' ? (y / 10) : 10),
			model: () => ({ timeScale: () => ({ width: () => 800 }) }),
			priceScale: () => ({ fontSize: () => 12 }),
		};
		return s;
	}

	function makeParams2(series: any, pxPoint: { x?: number; y?: number } | null, time?: Time2, price?: number) {
		if (!pxPoint || pxPoint.x === undefined || pxPoint.y === undefined) {
			return { point: undefined };
		}
		return {
			point: { x: pxPoint.x!, y: pxPoint.y! },
			sourceEvent: { clientX: pxPoint.x!, clientY: pxPoint.y!, ctrlKey: false, altKey: false, shiftKey: false, metaKey: false } as any,
			time: time ?? (pxPoint.x! as unknown as Time2),
			logical: Math.floor(pxPoint.x!),
			hoveredSeries: series,
			price,
		};
	}

	beforeEach2(() => {
		setFeatureFlags2({ 'drawingTools.rectangle': true });
		prevRaf2 = (globalThis as any).requestAnimationFrame;
		prevCaf2 = (globalThis as any).cancelAnimationFrame;
		(globalThis as any).requestAnimationFrame = (cb: (t?: any) => void) => { try { cb(); } catch {} return 1 as any; };
		(globalThis as any).cancelAnimationFrame = (_: any) => {};
		chart2 = createChartMock2();
		series2 = createSeriesMock2();
	});

	afterEach2(() => {
		(globalThis as any).requestAnimationFrame = prevRaf2;
		(globalThis as any).cancelAnimationFrame = prevCaf2;
		resetFeatureFlags2();
	});

	it2('serialization round-trip: toJSON/fromJSON retains anchors/state/autoscale', () => {
		const prim1 = new RectangleDrawingPrimitive2();
		prim1.attached({
			chart: chart2,
			series: series2,
			requestUpdate: () => {},
			horzScaleBehavior: {} as any,
		});

		// Build rectangle via interactions (start at price=20 time=100; end at price=30 time=200)
		chart2._click?.(makeParams2(series2, { x: 100, y: 200 }, 100 as Time2, 20));
		chart2._move?.(makeParams2(series2, { x: 200, y: 300 }, 200 as Time2, 30));
		chart2._click?.(makeParams2(series2, { x: 200, y: 300 }, 200 as Time2, 30));

		const snap = prim1.toJSON();
		const prim2 = RectangleDrawingPrimitive2.fromJSON(snap);
		prim2.attached({
			chart: chart2,
			series: series2,
			requestUpdate: () => {},
			horzScaleBehavior: {} as any,
		});

		expect2(prim2.getState()).to.equal('completed');
		expect2(prim2.getStartAnchor()?.price).to.equal(20);
		expect2(prim2.getEndAnchor()?.price).to.equal(30);

		const info2 = prim2.autoscaleInfo(100, 200);
		expect2(info2).to.not.equal(null);
		expect2(info2?.priceRange?.minValue).to.equal(20);
		expect2(info2?.priceRange?.maxValue).to.equal(30);

		prim2.detached();
		prim1.detached();
	});

	it2('deleteSelf → undo → redo restores anchors and state', () => {
		const prim = new RectangleDrawingPrimitive2();
		prim.attached({
			chart: chart2,
			series: series2,
			requestUpdate: () => {},
			horzScaleBehavior: {} as any,
		});

		// Build rectangle (start price=10 time=100; end price=20 time=200)
		chart2._click?.(makeParams2(series2, { x: 100, y: 100 }, 100 as Time2, 10));
		chart2._move?.(makeParams2(series2, { x: 200, y: 200 }, 200 as Time2, 20));
		chart2._click?.(makeParams2(series2, { x: 200, y: 200 }, 200 as Time2, 20));

		const start = prim.getStartAnchor();
		const end = prim.getEndAnchor();
		expect2(prim.getState()).to.equal('completed');

		// Delete should clear anchors, handles and reset to idle
		prim.deleteSelf();
		expect2(prim.getState()).to.equal('idle');
		const insideAfterDelete = prim.hitTest(150, 150);
		expect2(insideAfterDelete).to.equal(null);

		// Undo should restore snapshot
		const u = prim.undo();
		expect2(u).to.equal(true);
		expect2(prim.getState()).to.equal('completed');
		expect2(prim.getStartAnchor()?.price).to.equal(start?.price);
		expect2(prim.getEndAnchor()?.price).to.equal(end?.price);

		// Redo should re-apply the post-undo "current" snapshot (re-delete) → back to idle
		const r = prim.redo();
		expect2(r).to.equal(true);
		expect2(prim.getState()).to.equal('idle');
		expect2(prim.getStartAnchor()).to.equal(null);
		expect2(prim.getEndAnchor()).to.equal(null);
		const insideAfterRedo = prim.hitTest(150, 150);
		expect2(insideAfterRedo).to.equal(null);

		prim.detached();
	});

	it2('toJSON includes options keys for rectangle', () => {
		const prim = new RectangleDrawingPrimitive2();
		prim.attached({
			chart: chart2,
			series: series2,
			requestUpdate: () => {},
			horzScaleBehavior: {} as any,
		});

		// Build rectangle
		chart2._click?.(makeParams2(series2, { x: 120, y: 220 }, 120 as Time2, 22));
		chart2._move?.(makeParams2(series2, { x: 240, y: 340 }, 240 as Time2, 34));
		chart2._click?.(makeParams2(series2, { x: 240, y: 340 }, 240 as Time2, 34));

		const snap: any = prim.toJSON();
		expect2(snap && snap.options).to.be.an('object');
		for (const k of ['fillColor', 'previewFillColor', 'labelColor', 'labelTextColor', 'showLabels']) {
			expect2(Object.prototype.hasOwnProperty.call(snap.options, k)).to.equal(true);
		}

		prim.detached();
	});
});
// Wave0 advanced interactions and semantics tests

import { describe as describe3, it as it3, beforeEach as beforeEach3, afterEach as afterEach3 } from 'node:test';
import { expect as expect3 } from 'chai';
import type { Time as Time3 } from '../../../src/model/horz-scale-behavior-time/types';
import { RectangleDrawingPrimitive as RectangleDrawingPrimitive3 } from '../../../src/drawing/tools/rectangle';
import { setFeatureFlags as setFeatureFlags3, resetFeatureFlags as resetFeatureFlags3 } from '../../../src/feature-flags';

describe3('RectangleDrawingPrimitive (Wave0 interactions advanced)', () => {
	let primitive: RectangleDrawingPrimitive3;
	let chart: any;
	let series: any;
	let prevRaf: any;
	let prevCaf: any;

	beforeEach3(() => {
		setFeatureFlags3({ 'drawingTools.rectangle': true });
		prevRaf = (globalThis as any).requestAnimationFrame;
		prevCaf = (globalThis as any).cancelAnimationFrame;
		(globalThis as any).requestAnimationFrame = (cb: (t?: any) => void) => { try { cb(); } catch {} return 1 as any; };
		(globalThis as any).cancelAnimationFrame = (_: any) => {};

		primitive = new RectangleDrawingPrimitive3();
		chart = createChartMock();
		series = createSeriesMock();

		primitive.attached({
			chart,
			series,
			requestUpdate: () => {},
			horzScaleBehavior: {} as any,
		});

		// Build a completed rectangle:
		// start: time=100, price=10 (px: 100,100), end: time=200, price=20 (px: 200,200)
		chart._click?.(makeParams(series, { x: 100, y: 100 }, 100 as Time3, 10));
		chart._move?.(makeParams(series, { x: 200, y: 200 }, 200 as Time3, 20));
		chart._click?.(makeParams(series, { x: 200, y: 200 }, 200 as Time3, 20));
		expect3(primitive.getState()).to.equal('completed');
	});

	afterEach3(() => {
		try { primitive.detached(); } catch {}
		(globalThis as any).requestAnimationFrame = prevRaf;
		(globalThis as any).cancelAnimationFrame = prevCaf;
		resetFeatureFlags3();
	});

	it3('handle click enters editing and drag updates anchors', () => {
		// Click on top-left handle (100,100)
		chart._click?.(makeParams(series, { x: 100, y: 100 }, 100 as Time3, 10));
		expect3(primitive.getState()).to.equal('editing');

		// Drag handle to (80,80) => expect start anchor updated to time=80, price=8
		chart._move?.(makeParams(series, { x: 80, y: 80 }, 80 as Time3, 8));
		expect3(primitive.getStartAnchor()?.time).to.equal(80);
		expect3(primitive.getStartAnchor()?.price).to.equal(8);
		// End anchor remains unchanged
		expect3(primitive.getEndAnchor()?.time).to.equal(200);
		expect3(primitive.getEndAnchor()?.price).to.equal(20);
	});

	it3('body drag moves both anchors by delta (dt, dp)', () => {
		// Click inside body center (150,150) to begin body drag
		chart._click?.(makeParams(series, { x: 150, y: 150 }, 150 as Time3, 15));
		expect3(primitive.getState()).to.equal('editing');

		// Move to (160,160) => dt=+10, dp=+1; start becomes (110,11), end becomes (210,21)
		chart._move?.(makeParams(series, { x: 160, y: 160 }, 160 as Time3, 16));

		expect3(primitive.getStartAnchor()?.time).to.equal(110);
		expect3(primitive.getStartAnchor()?.price).to.equal(11);
		expect3(primitive.getEndAnchor()?.time).to.equal(210);
		expect3(primitive.getEndAnchor()?.price).to.equal(21);
	});

	it3('Esc cancels editing and reverts to original anchors', () => {
		// Enter body drag and modify
		chart._click?.(makeParams(series, { x: 150, y: 150 }, 150 as Time3, 15));
		expect3(primitive.getState()).to.equal('editing');
		chart._move?.(makeParams(series, { x: 160, y: 160 }, 160 as Time3, 16));

		// Trigger Escape via internal handler
		(primitive as any)._onKeyDown?.({ key: 'Escape' });

		// Reverted to original completed anchors (100,10) and (200,20) and exited editing
		expect3(primitive.getState()).to.equal('completed');
		expect3(primitive.getStartAnchor()?.time).to.equal(100);
		expect3(primitive.getStartAnchor()?.price).to.equal(10);
		expect3(primitive.getEndAnchor()?.time).to.equal(200);
		expect3(primitive.getEndAnchor()?.price).to.equal(20);
	});

	it3('Delete removes rectangle (idle, no hits inside)', () => {
		(primitive as any)._onKeyDown?.({ key: 'Delete' });
		expect3(primitive.getState()).to.equal('idle');
		expect3(primitive.getStartAnchor()).to.equal(null);
		expect3(primitive.getEndAnchor()).to.equal(null);
		const inside = primitive.hitTest(150, 150);
		expect3(inside).to.equal(null);
	});

	it3('empty click outside cancels editing back to completed', () => {
		// Enter editing by clicking body
		chart._click?.(makeParams(series, { x: 150, y: 150 }, 150 as Time3, 15));
		expect3(primitive.getState()).to.equal('editing');

		// Click far outside bounds → should exit editing to completed
		chart._click?.(makeParams(series, { x: 500, y: 500 }, 500 as Time3, 50));
		expect3(primitive.getState()).to.equal('completed');
	});

	it3('autoscale returns explicit zero margins for stable layout', () => {
		const info = primitive.autoscaleInfo(0, 100);
		expect3(info).to.not.equal(null);
		expect3(info?.margins).to.deep.equal({ above: 0, below: 0 });
	});
});