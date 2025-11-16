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

	protected configureStateMachine(_m: any): void { /* pointer-events-only tests */ }
	protected collectViews(): any { return { pane: [], priceAxis: [], timeAxis: [] }; }
	protected performHitTest(): null { return null; }
	public updateAllGeometry(): void { /* no-op */ }

	protected handlePointerClick(event: any): void { this.clicks.push(event); }
	protected handlePointerMove(event: any): void { this.moves.push(event); }
	protected handlePointerCancel(): void { this.cancels++; }

	public attachPublic(p: any) { this.attached(p as any); }
	public detachPublic() { this.detached(); }
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
		priceToCoordinate: (_p: number) => 100,
		coordinateToPrice: (_y: Coordinate) => 55,
	};
	return s;
}

function createPointerParams(series: any) {
	return {
		point: { x: 5, y: 7 },
		sourceEvent: { clientX: 1, clientY: 2, ctrlKey: true, altKey: false, shiftKey: false, metaKey: false } as any,
		time: 111 as Time,
		logical: 5,
		hoveredSeries: series,
	};
}

describe('DrawingPrimitiveBase pointer events', () => {
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

	it('click/move handlers record events from chart subscriptions', () => {
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
	});

	it('move with missing point triggers cancel', () => {
		primitive.attachPublic({
			chart,
			series,
			requestUpdate: () => { requestUpdateCalls++; },
			horzScaleBehavior: {} as any,
		});

		chart._move?.({ point: undefined } as any);
		expect(primitive.cancels).to.be.greaterThan(0);
	});

	it('dblclick resets state machine (smoke)', () => {
		primitive.attachPublic({
			chart,
			series,
			requestUpdate: () => { requestUpdateCalls++; },
			horzScaleBehavior: {} as any,
		});
		// If chart supports dblclick, ensure handler exists
		if ('subscribeDblClick' in chart) {
			expect(typeof chart._dbl).to.equal('function');
		}
	});
});