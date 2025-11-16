import { describe, it, beforeEach, afterEach } from 'node:test';
import { expect } from 'chai';
import type { Time } from '../../model/horz-scale-behavior-time/types';
import type { Coordinate } from '../../model/coordinate';
import { DrawingPrimitiveBase } from '../drawing-primitive-base';

class TestPrimitive extends DrawingPrimitiveBase<Time> {
	public clicks: any[] = [];
	public moves: any[] = [];
	public cancels = 0;

	public constructor() { super('idle', 8); }

	protected configureStateMachine(_m: any): void { /* no-op for unit test */ }
	protected collectViews(): any { return { pane: [] }; }
	protected performHitTest(): null { return null; }
	public updateAllGeometry(): void { /* no-op */ }

	protected handlePointerClick(event: any): void { this.clicks.push(event); }
	protected handlePointerMove(event: any): void { this.moves.push(event); }
	protected handlePointerCancel(): void { this.cancels++; }

	// public wrappers to access protected members for unit tests
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

describe('DrawingPrimitiveBase (attach/detach/caching)', () => {
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
		// ensure detach doesn't throw
		try { primitive.detachPublic(); } catch {}
	});

	it('attaches and subscribes handlers (dblclick optional)', () => {
		primitive.attachPublic({
			chart: chart as any,
			series: series as any,
			requestUpdate: () => { requestUpdateCalls++; },
			horzScaleBehavior: {} as any,
		});
		expect(chart._click).to.be.a('function');
		expect(chart._move).to.be.a('function');
		// dblclick may or may not exist
		if ('subscribeDblClick' in chart) {
			expect(chart._dbl).to.be.a('function');
		}
		primitive.detachPublic();
		expect(chart._click).to.equal(undefined);
		expect(chart._move).to.equal(undefined);
	});

	it('coordinateTransform caches until flush', () => {
		primitive.attachPublic({
			chart: chart as any,
			series: series as any,
			requestUpdate: () => { requestUpdateCalls++; },
			horzScaleBehavior: {} as any,
		});
		const env = primitive.envPublic();
		// cached calls
		env.coordinateTransform.priceToCoordinate(10);
		env.coordinateTransform.priceToCoordinate(10);
		expect(series.calls.priceToCoordinate).to.equal(1);

		// flush via RAF
		const oldRaf = (globalThis as any).requestAnimationFrame;
		(globalThis as any).requestAnimationFrame = (cb: Function) => { cb(0); return 1; };
		primitive.requestUpdatePublic();
		(globalThis as any).requestAnimationFrame = oldRaf;

		env.coordinateTransform.priceToCoordinate(10);
		expect(series.calls.priceToCoordinate).to.equal(2);
	});

	it('hitTest returns null by default', () => {
		primitive.attachPublic({
			chart: chart as any,
			series: series as any,
			requestUpdate: () => { requestUpdateCalls++; },
			horzScaleBehavior: {} as any,
		});
		const res = primitive.hitTest(10, 5);
		expect(res).to.equal(null);
	});

	it('requestUpdate coalesces multiple calls before RAF scheduling', () => {
		primitive.attachPublic({
			chart: chart as any,
			series: series as any,
			requestUpdate: () => { requestUpdateCalls++; },
			horzScaleBehavior: {} as any,
		});
		let rafCount = 0;
		const oldRaf = (globalThis as any).requestAnimationFrame;
		(globalThis as any).requestAnimationFrame = (_cb: any) => { rafCount++; return 1; };

		primitive.requestUpdatePublic();
		primitive.requestUpdatePublic();

		// still pending, coalesced to a single raf schedule
		expect(requestUpdateCalls).to.equal(0);
		expect(rafCount).to.equal(1);

		(globalThis as any).requestAnimationFrame = oldRaf;
	});

	it('pointer click/move/cancel handlers are wired', () => {
		primitive.attachPublic({
			chart: chart as any,
			series: series as any,
			requestUpdate: () => { requestUpdateCalls++; },
			horzScaleBehavior: {} as any,
		});
		const params = createPointerParams(series);
		// simulate chart handlers
		chart._click?.(params);
		chart._move?.(params);
		expect(primitive.clicks.length).to.equal(1);
		expect(primitive.moves.length).to.equal(1);

		// simulate cancel by missing point
		chart._move?.({ point: undefined } as any);
		expect(primitive.cancels).to.be.greaterThan(0);
	});
});