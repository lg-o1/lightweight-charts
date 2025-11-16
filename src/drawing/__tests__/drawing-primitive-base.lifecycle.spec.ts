import { describe, it, beforeEach, afterEach } from 'node:test';
import { expect } from 'chai';
import type { Time } from '../../model/horz-scale-behavior-time/types';
import type { Coordinate } from '../../model/coordinate';
import { DrawingPrimitiveBase } from '../drawing-primitive-base';

class TestPrimitive extends DrawingPrimitiveBase<Time> {
	public clicks: any[] = [];
	public moves: any[] = [];
	public cancels = 0;
	public geometries = 0;

	public constructor() { super('idle', 8); }

	protected configureStateMachine(_m: any): void { /* lifecycle-only tests */ }
	protected collectViews(): any { return { pane: [], priceAxis: [], timeAxis: [] }; }
	protected performHitTest(): null { return null; }
	public updateAllGeometry(): void { this.geometries++; }

	protected handlePointerClick(event: any): void { this.clicks.push(event); }
	protected handlePointerMove(event: any): void { this.moves.push(event); }
	protected handlePointerCancel(): void { this.cancels++; }

	public attachPublic(p: any) { this.attached(p as any); }
	public detachPublic() { this.detached(); }
	public envPublic(): any { return this.environment(); }
	public requestUpdatePublic(): void { this.requestUpdate(); }
}

function createChartMock(includeDblClick: boolean = true) {
	const timeScale = {
		timeToCoordinate: (_t: Time) => 42,
		coordinateToTime: (_x: Coordinate) => 123 as Time,
	};
	const chart: any = {
		_click: undefined as any,
		_move: undefined as any,
		_dbl: undefined as any,
		subscribeClick(fn: any) { this._click = fn; },
		unsubscribeClick() { this._click = undefined; },
		subscribeCrosshairMove(fn: any) { this._move = fn; },
		unsubscribeCrosshairMove() { this._move = undefined; },
		timeScale() { return timeScale; },
		isDestroyed() { return false; },
	};
	if (includeDblClick) {
		chart.subscribeDblClick = (fn: any) => { chart._dbl = fn; };
		chart.unsubscribeDblClick = () => { chart._dbl = undefined; };
	}
	return chart;
}

function createSeriesMock() {
	const s: any = {
		calls: { priceToCoordinate: 0, coordinateToPrice: 0 },
		priceToCoordinate: (_p: number) => { s.calls.priceToCoordinate++; return 100; },
		coordinateToPrice: (_y: Coordinate) => { s.calls.coordinateToPrice++; return 55; },
	};
	return s;
}

function createPointerParams(series: any) {
	return {
		point: { x: 5, y: 7 },
		sourceEvent: { clientX: 1, clientY: 2, ctrlKey: true } as any,
		time: 111 as Time,
		logical: 5,
		hoveredSeries: series,
	};
}

describe('DrawingPrimitiveBase lifecycle', () => {
	let primitive: TestPrimitive;
	let chart: any;
	let series: any;
	let requestUpdateCalls: number;

	beforeEach(() => {
		primitive = new TestPrimitive();
		chart = createChartMock(true);
		series = createSeriesMock();
		requestUpdateCalls = 0;
	});

	afterEach(() => {
		try { primitive.detachPublic(); } catch {}
	});

	it('attach subscribes handlers and detach unsubscribes', () => {
		primitive.attachPublic({
			chart,
			series,
			requestUpdate: () => { requestUpdateCalls++; },
			horzScaleBehavior: {} as any,
		});

		expect(chart._click).to.be.a('function');
		expect(chart._move).to.be.a('function');
		if ('subscribeDblClick' in chart) {
			expect(chart._dbl).to.be.a('function');
		}

		primitive.detachPublic();

		expect(chart._click).to.equal(undefined);
		expect(chart._move).to.equal(undefined);
	});

	it('environment accessible only after attach', () => {
		expect(() => primitive.envPublic()).to.throw();
		primitive.attachPublic({
			chart,
			series,
			requestUpdate: () => { requestUpdateCalls++; },
			horzScaleBehavior: {} as any,
		});
		expect(() => primitive.envPublic()).not.to.throw();
		const env = primitive.envPublic();
		expect(env.chart).to.equal(chart);
	});

	it('updateAllViews clears caches, updates geometry and schedules request', () => {
		primitive.attachPublic({
			chart,
			series,
			requestUpdate: () => { requestUpdateCalls++; },
			horzScaleBehavior: {} as any,
		});
		const env = primitive.envPublic();
		env.coordinateTransform.priceToCoordinate(21);
		env.coordinateTransform.priceToCoordinate(21);
		expect(series.calls.priceToCoordinate).to.equal(1);

		primitive.updateAllViews();
		expect(primitive.geometries).to.equal(1);
		expect(requestUpdateCalls).to.equal(1);

		env.coordinateTransform.priceToCoordinate(21);
		expect(series.calls.priceToCoordinate).to.equal(2);
	});

	it('requestUpdate coalesces via RAF and flushes once', () => {
		primitive.attachPublic({
			chart,
			series,
			requestUpdate: () => { requestUpdateCalls++; },
			horzScaleBehavior: {} as any,
		});
		let stored: any = null;
		const oldRaf = (globalThis as any).requestAnimationFrame;
		(globalThis as any).requestAnimationFrame = (cb: any) => { stored = cb; return 1; };

		primitive.requestUpdatePublic();
		primitive.requestUpdatePublic();
		// still pending
		expect(requestUpdateCalls).to.equal(0);

		if (typeof stored === 'function') { stored(0); }
		expect(requestUpdateCalls).to.equal(1);

		(globalThis as any).requestAnimationFrame = oldRaf;
	});

	it('requestUpdate falls back to setTimeout when RAF missing', () => {
		primitive.attachPublic({
			chart,
			series,
			requestUpdate: () => { requestUpdateCalls++; },
			horzScaleBehavior: {} as any,
		});
		const originalRaf = (globalThis as any).requestAnimationFrame;
		// remove RAF
		delete (globalThis as any).requestAnimationFrame;

		let stored: any = null;
		const oldSetTimeout = (globalThis as any).setTimeout;
		(globalThis as any).setTimeout = (cb: any) => { stored = cb; return 1; };

		primitive.requestUpdatePublic();
		expect(typeof stored).to.equal('function');
		if (typeof stored === 'function') { stored(); }
		expect(requestUpdateCalls).to.equal(1);

		// restore
		(globalThis as any).setTimeout = oldSetTimeout;
		(globalThis as any).requestAnimationFrame = originalRaf;
	});

	it('detach cancels scheduled RAF and timeouts', () => {
		primitive.attachPublic({
			chart,
			series,
			requestUpdate: () => { requestUpdateCalls++; },
			horzScaleBehavior: {} as any,
		});

		let rafCanceled = 0;
		let timeoutCleared = 0;
		const oldCancel = (globalThis as any).cancelAnimationFrame;
		const oldClear = (globalThis as any).clearTimeout;
		(globalThis as any).cancelAnimationFrame = () => { rafCanceled++; };
		(globalThis as any).clearTimeout = () => { timeoutCleared++; };

		// schedule via RAF
		const oldRaf = (globalThis as any).requestAnimationFrame;
		(globalThis as any).requestAnimationFrame = (_cb: any) => 1;

		primitive.requestUpdatePublic();
		primitive.detachPublic();

		expect(rafCanceled + timeoutCleared).to.be.greaterThan(0);

		// restore
		(globalThis as any).requestAnimationFrame = oldRaf;
		(globalThis as any).cancelAnimationFrame = oldCancel;
		(globalThis as any).clearTimeout = oldClear;
	});

	it('pointer handlers wired through chart subscriptions (smoke)', () => {
		primitive.attachPublic({
			chart,
			series,
			requestUpdate: () => { requestUpdateCalls++; },
			horzScaleBehavior: {} as any,
		});
		const params = createPointerParams(series);
		chart._click?.(params);
		chart._move?.(params);
		expect(primitive.clicks.length).to.equal(1);
		expect(primitive.moves.length).to.equal(1);
		chart._move?.({ point: undefined } as any);
		expect(primitive.cancels).to.be.greaterThan(0);
	});
});