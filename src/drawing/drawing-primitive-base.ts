import { CanvasRenderingTarget2D } from 'fancy-canvas';

import type { MouseEventHandler, MouseEventParams } from '../api/ichart-api';
import type { ISeriesApi } from '../api/iseries-api';
import type { ISeriesPrimitive, SeriesAttachedParameter } from '../api/iseries-primitive-api';
import { ensureDefined } from '../helpers/assertions';
import type { Coordinate } from '../model/coordinate';
import type {
	IPrimitivePaneView,
	PrimitiveHoveredItem,
	PrimitivePaneViewZOrder,
} from '../model/ipane-primitive';
import type { ISeriesPrimitiveAxisView } from '../model/iseries-primitive';
import type { SeriesType } from '../model/series-options';
import type { Time } from '../model/horz-scale-behavior-time/types';

import { TTLCache } from './internal/TTLCache';
import { pointerEventFromParams, createSyntheticMouseEvent } from './internal/PointerEventUtils';
import { subscribeAll, type SubscriptionsHandle } from './internal/ChartSubscriptions';

import type {
	DrawingEnvironment,
	DrawingHoverResult,
	DrawingPointerEvent,
	DrawingRenderScope,
	DrawingViewBundle,
	DrawingZOrder,
} from './types';
import { HandleController } from './handles/handle-controller';
import { DrawingStateMachine, type DrawingStateId, type DrawingStateTransitionHook } from './state/state-machine';

type AttachedParam<THorz extends Time> = SeriesAttachedParameter<THorz, SeriesType>;


const RAF_FALLBACK_TIMEOUT = 16;
const DEFAULT_CACHE_LIMIT = 256;
const DEFAULT_CACHE_TTL = 32;


/**
 * Base class for drawing primitives attached to a series. Provides common lifecycle handling,
 * coordinate caching, request batching, and pointer event conversion. Concrete tools should
 * extend this class and wire their state machine + geometry via {@link configureStateMachine}.
 */
export abstract class DrawingPrimitiveBase<THorz extends Time = Time> implements ISeriesPrimitive<THorz> {
	private _environment: DrawingEnvironment<THorz> | undefined;
	private _requestUpdateInternal: (() => void) | undefined;

	private readonly _stateMachine: DrawingStateMachine<DrawingPointerEvent<THorz>>;
	private readonly _handleController = new HandleController();

	private readonly _coordinateCacheLimit: number;
	private readonly _coordinateCacheTtl: number;

	private readonly _priceToCoordinateCache: TTLCache<number, Coordinate | null>;
	private readonly _coordinateToPriceCache: TTLCache<Coordinate, number | null>;
	private readonly _timeToCoordinateCache: TTLCache<THorz, Coordinate | null>;
	private readonly _coordinateToTimeCache: TTLCache<Coordinate, THorz | null>;

	private _pendingFrame: number | null = null;
	private _pendingTimeout: ReturnType<typeof setTimeout> | null = null;
	// _dblClickSubscribed removed; ChartSubscriptions handles dblclick lifecycle.
	private _subscriptions: SubscriptionsHandle | undefined;

	protected constructor(
		initialState: DrawingStateId = 'idle',
		cacheLimit: number = DEFAULT_CACHE_LIMIT,
		cacheTtl: number = DEFAULT_CACHE_TTL
	) {
		this._stateMachine = new DrawingStateMachine(initialState);
		this._coordinateCacheLimit = cacheLimit;
		this._coordinateCacheTtl = cacheTtl;

		this._priceToCoordinateCache = new TTLCache<number, Coordinate | null>(this._coordinateCacheLimit, this._coordinateCacheTtl);
		this._coordinateToPriceCache = new TTLCache<Coordinate, number | null>(this._coordinateCacheLimit, this._coordinateCacheTtl);
		this._timeToCoordinateCache = new TTLCache<THorz, Coordinate | null>(this._coordinateCacheLimit, this._coordinateCacheTtl);
		this._coordinateToTimeCache = new TTLCache<Coordinate, THorz | null>(this._coordinateCacheLimit, this._coordinateCacheTtl);

		this._stateMachine.setAfterTransitionHook(this._afterTransitionHook.bind(this));
		this.configureStateMachine(this._stateMachine);
	}

	// ------------------------------------------------------------------------------------
	// ISeriesPrimitive implementation
	// ------------------------------------------------------------------------------------

	public attached(param: AttachedParam<THorz>): void {
		const { chart, series, requestUpdate } = param;

		this._clearCoordinateCaches();

		this._environment = {
			chart,
			series: series as unknown as ISeriesApi<SeriesType, THorz>,
			requestUpdate: () => this.requestUpdate(),
			coordinateTransform: {
				priceToCoordinate: (price: number) =>
					this._priceToCoordinateCache.getOrCompute(price, () => series.priceToCoordinate(price)),
				coordinateToPrice: (y: Coordinate) =>
					this._coordinateToPriceCache.getOrCompute(y, () => series.coordinateToPrice(y)),
				timeToCoordinate: (time: THorz) =>
					this._timeToCoordinateCache.getOrCompute(time, () => chart.timeScale().timeToCoordinate(time)),
				coordinateToTime: (x: Coordinate) =>
					this._coordinateToTimeCache.getOrCompute(x, () => chart.timeScale().coordinateToTime(x) as THorz | null),
			},
		};

		this._requestUpdateInternal = requestUpdate;

		this._subscriptions = subscribeAll(chart, {
			click: this._handleChartClick,
			move: this._handleCrosshairMove,
			dblClick: this._handleChartDblClick,
		});
		// dblclick subscription handled by _subscriptions handle

		this._stateMachine.reset();
		this.updateAllGeometry();
		this.requestUpdate();
	}

	public detached(): void {
		if (!this._environment) {
			return;
		}

		this._subscriptions?.unsubscribe();

		this._cancelScheduledUpdate();
		this._clearCoordinateCaches();

		this._environment = undefined;
		this._requestUpdateInternal = undefined;
		// dblclick subscription state is derived from _subscriptions; nothing to reset
		this._subscriptions = undefined;

		this._stateMachine.reset();
	}

	// Backwards-compatible aliases (some external code/tests may use attach/detach)
	public attach(param: AttachedParam<THorz>): void {
		this.attached(param);
	}

	public detach(): void {
		this.detached();
	}

	public updateAllViews(): void {
		this._clearCoordinateCaches();
		this.updateAllGeometry();
		this.requestUpdate();
	}

	public paneViews(): readonly IPrimitivePaneView[] {
		return this.collectViews().pane;
	}

	public priceAxisViews(): readonly ISeriesPrimitiveAxisView[] {
		return this.collectViews().priceAxis ?? [];
	}

	public timeAxisViews(): readonly ISeriesPrimitiveAxisView[] {
		return this.collectViews().timeAxis ?? [];
	}

	public priceAxisPaneViews(): readonly IPrimitivePaneView[] {
		return this.collectViews().priceAxisPane ?? [];
	}

	public timeAxisPaneViews(): readonly IPrimitivePaneView[] {
		return this.collectViews().timeAxisPane ?? [];
	}

	public hitTest(x: number, y: number): PrimitiveHoveredItem | null {
		if (!this._environment) {
			return null;
		}

		const pointerEvent: DrawingPointerEvent<THorz> = {
			clientX: x,
			clientY: y,
			point: { x, y },
			rawEvent: createSyntheticMouseEvent('mousemove'),
			pointerType: 'mouse',
			isPrimary: true,
			altKey: false,
			ctrlKey: false,
			metaKey: false,
			shiftKey: false,
		};

		const hoverResult = this.performHitTest(pointerEvent);
		if (!hoverResult) {
			return null;
		}

		return {
			cursorStyle: hoverResult.cursor,
			externalId: hoverResult.externalId ?? '__drawing__',
			zOrder: this.zOrderToPane(hoverResult.zOrder),
			isBackground: hoverResult.isBackground ?? false,
		};
	}

	// ------------------------------------------------------------------------------------
	// Protected helper API
	// ------------------------------------------------------------------------------------

	public environment(): DrawingEnvironment<THorz> {
		return ensureDefined(this._environment);
	}

	protected stateMachine(): DrawingStateMachine<DrawingPointerEvent<THorz>> {
		return this._stateMachine;
	}

	public requestUpdate(): void {
		const g: any = (typeof globalThis !== 'undefined') ? (globalThis as any) : undefined;
		const w: any = g?.window;
		const raf: any = g?.requestAnimationFrame ?? w?.requestAnimationFrame;

		// already scheduled via RAF - coalesce
		if (this._pendingFrame !== null) {
			return;
		}

		// if previously scheduled via setTimeout but RAF is now available, upgrade to RAF
		if (this._pendingTimeout !== null) {
			if (typeof raf === 'function') {
				clearTimeout(this._pendingTimeout);
				this._pendingTimeout = null;
				this._pendingFrame = raf(this._flushUpdate);
			}
			return;
		}

		// schedule fresh
		if (typeof raf === 'function') {
			this._pendingFrame = raf(this._flushUpdate);
		} else {
			this._pendingTimeout = setTimeout(this._flushUpdate, RAF_FALLBACK_TIMEOUT);
		}
	}

	protected renderScope(target: CanvasRenderingTarget2D): DrawingRenderScope {
		return {
			target,
			horizontalPixelRatio: target.horizontalPixelRatio,
			verticalPixelRatio: target.verticalPixelRatio,
		};
	}

	protected zOrderToPane(zOrder: DrawingZOrder): PrimitivePaneViewZOrder {
		switch (zOrder) {
			case 'bottom':
			case 'normal':
			case 'top':
				return zOrder;
			default:
				return 'normal';
		}
	}

	protected handlesController(): HandleController {
		return this._handleController;
	}

	protected setAfterTransitionHook(hook: DrawingStateTransitionHook<DrawingPointerEvent<THorz>> | null): void {
		this._stateMachine.setAfterTransitionHook(hook);
	}

	protected abstract configureStateMachine(machine: DrawingStateMachine<DrawingPointerEvent<THorz>>): void;

	protected abstract handlePointerClick(event: DrawingPointerEvent<THorz>): void;
	protected abstract handlePointerMove(event: DrawingPointerEvent<THorz>): void;
	protected abstract handlePointerCancel(): void;

	protected abstract collectViews(): DrawingViewBundle;
	protected abstract performHitTest(event: DrawingPointerEvent<THorz>): DrawingHoverResult | null;
	protected abstract updateAllGeometry(): void;

	// Optional extension point
	protected onAfterStateTransition(_from: DrawingStateId, _to: DrawingStateId, _context?: DrawingPointerEvent<THorz>): void {
		// Subclasses may override.
	}

	// Optional dblclick hook; return true to consume and prevent default reset
	// Subclasses may override to implement dblclick semantics (e.g., enter editing).
	// No event is passed because dblclick coordinates aren't provided by ChartSubscriptions.
	// Tools should decide based on their current state/anchors.
	// Default: not handled (returns false).
	protected handlePointerDblClick(): boolean {
		return false;
	}

	// ------------------------------------------------------------------------------------
	// Internal helpers
	// ------------------------------------------------------------------------------------

	private _enrichPointerEvent(ev: DrawingPointerEvent<THorz>): DrawingPointerEvent<THorz> {
		try {
			const env = this._environment;
			if (!env || !ev.point) { return ev; }
			if (ev.price == null) {
				const p = env.coordinateTransform.coordinateToPrice(ev.point.y as Coordinate);
				if (p != null) { (ev as any).price = p as number; }
			}
			if (ev.time == null) {
				const t = env.coordinateTransform.coordinateToTime(ev.point.x as Coordinate);
				if (t != null) { (ev as any).time = t as any; }
			}
		} catch {}
		return ev;
	}

	private readonly _handleChartClick: MouseEventHandler<THorz> = (params: MouseEventParams<THorz>) => {
		if (!this._environment) {
			return;
		}

		let pointerEvent = pointerEventFromParams(params, 'click');
		if (!pointerEvent) {
			return;
		}
		pointerEvent = this._enrichPointerEvent(pointerEvent);

		this._stateMachine.pointerClick(pointerEvent);
		this.handlePointerClick(pointerEvent);
	};

	private readonly _handleCrosshairMove: MouseEventHandler<THorz> = (params: MouseEventParams<THorz>) => {
		if (!this._environment) {
			return;
		}

		let pointerEvent = pointerEventFromParams(params, 'mousemove');
		if (!pointerEvent) {
			this._stateMachine.pointerCancel();
			this.handlePointerCancel();
			return;
		}
		pointerEvent = this._enrichPointerEvent(pointerEvent);

		this._stateMachine.pointerMove(pointerEvent);
		this.handlePointerMove(pointerEvent);
	};

	private readonly _handleChartDblClick: MouseEventHandler<THorz> = () => {
		// Allow subclass to consume dblclick (e.g., enter editing mode).
		if (this.handlePointerDblClick()) {
			return;
		}
		this._stateMachine.reset();
	};



	private _clearCoordinateCaches(): void {
		this._priceToCoordinateCache.clear();
		this._coordinateToPriceCache.clear();
		this._timeToCoordinateCache.clear();
		this._coordinateToTimeCache.clear();
	}

	private _cancelScheduledUpdate(): void {
		const g: any = (typeof globalThis !== 'undefined') ? (globalThis as any) : undefined;
		const w: any = g?.window;
		const caf: any = g?.cancelAnimationFrame ?? w?.cancelAnimationFrame;

		if (this._pendingFrame !== null && typeof caf === 'function') {
			caf(this._pendingFrame);
		}

		if (this._pendingTimeout !== null) {
			clearTimeout(this._pendingTimeout);
		}

		this._pendingFrame = null;
		this._pendingTimeout = null;
	}


	private readonly _flushUpdate = (): void => {
		this._pendingFrame = null;
		this._pendingTimeout = null;
		this._clearCoordinateCaches();
		this._requestUpdateInternal?.();
	};

	private _afterTransitionHook(from: DrawingStateId, to: DrawingStateId, context?: DrawingPointerEvent<THorz>): void {
		this.onAfterStateTransition(from, to, context);
	}
}
