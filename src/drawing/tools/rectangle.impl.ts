/* eslint-disable max-classes-per-file */
// @generated-entry
// Stable entry acknowledged by generator checks. This entry is allowed to import from __generated__; production code outside this dir must not.
import { DrawingPrimitiveBase } from '../drawing-primitive-base';
import type { DrawingHoverResult, DrawingPointerEvent, DrawingViewBundle } from '../types';
import { DrawingStateMachine, type DrawingStateId } from '../state/state-machine';
import { ensureFeatureFlagEnabled } from '../../feature-flags';
import type { IPrimitivePaneRenderer, IPrimitivePaneView, PrimitivePaneViewZOrder, DrawingUtils } from '../../model/ipane-primitive';
import type { ISeriesPrimitiveAxisView } from '../../model/iseries-primitive';
import type { AutoscaleInfo } from '../../model/series-options';
import type { Time } from '../../model/horz-scale-behavior-time/types';
import type { Coordinate } from '../../model/coordinate';
import { CanvasRenderingTarget2D } from 'fancy-canvas';
import { BaseHandle } from '../handles/base-handle';
import type { HandleDescriptor, HandleRenderer, HandleRendererDrawContext, HandleStyle } from '../handles/handle-types';
import { DEFAULT_HANDLE_STYLE } from '../handles/default-handle-style';
import { rectangleSpec } from './__generated__/rectangle';
import { rectBoundsPx, rectCornersPx } from '../runtime/geometry';

interface Anchor {
	time: Time;
	price: number;
}
interface RectOptions {
	fillColor: string;
	previewFillColor: string;
	labelColor: string;
	labelTextColor: string;
	showLabels: boolean;
	priceLabelFormatter?: (price: number) => string;
	timeLabelFormatter?: (time: Time) => string;
}
type RectOptionsSnapshot = {
	fillColor: string;
	previewFillColor: string;
	labelColor: string;
	labelTextColor: string;
	showLabels: boolean;
};
interface RectangleSnapshotV1 {
	version: 1;
	anchors: { start: Anchor | null; end: Anchor | null };
	options: RectOptionsSnapshot;
}

export class RectangleDrawingPrimitive extends DrawingPrimitiveBase {
	private _start: Anchor | null = null;
	private _end: Anchor | null = null;

	private _options: RectOptions = {
		fillColor: rectangleSpec.options.find(o => o.name === 'fillColor')?.default as string ?? 'rgba(200, 50, 100, 0.75)',
		previewFillColor: rectangleSpec.options.find(o => o.name === 'previewFillColor')?.default as string ?? 'rgba(200, 50, 100, 0.25)',
		labelColor: rectangleSpec.options.find(o => o.name === 'labelColor')?.default as string ?? 'rgba(200, 50, 100, 1)',
		labelTextColor: rectangleSpec.options.find(o => o.name === 'labelTextColor')?.default as string ?? '#ffffff',
		showLabels: (rectangleSpec.options.find(o => o.name === 'showLabels')?.default as boolean) ?? true,
		priceLabelFormatter: (p: number) => String(p),
		timeLabelFormatter: (t: Time) => String(t),
	};
	private _undoStack: RectangleSnapshotV1[] = [];
	private _redoStack: RectangleSnapshotV1[] = [];

	// Drag/editing state
	private _dragTarget: 'none' | 'body' | 'handle' = 'none';
	private _activeHandleId: string | null = null;
	private _origStart: Anchor | null = null;
	private _origEnd: Anchor | null = null;
	private _dragStartPx: { x: number; y: number } | null = null;
	private _keyListenerInstalled: boolean = false;

	// Views
	private readonly _paneFillView: IPrimitivePaneView;
	private readonly _handlesView: IPrimitivePaneView;
	private readonly _priceAxisPaneView: IPrimitivePaneView;
	private readonly _timeAxisPaneView: IPrimitivePaneView;

	public constructor() {
		super(rectangleSpec.states?.[0] ?? 'idle');
		ensureFeatureFlagEnabled('drawingTools', 'RectangleDrawingPrimitive');
		ensureFeatureFlagEnabled('drawingTools.rectangle', 'RectangleDrawingPrimitive');
		this._paneFillView = new RectanglePaneView(this);
		this._handlesView = new RectangleHandlesPaneView(this);
		this._priceAxisPaneView = new RectanglePriceAxisPaneView(this);
		this._timeAxisPaneView = new RectangleTimeAxisPaneView(this);
	}

	public getStartAnchor(): Anchor | null { return this._start; }
	public getEndAnchor(): Anchor | null { return this._end; }

	protected override configureStateMachine(machine: DrawingStateMachine<DrawingPointerEvent>): void {
		machine.registerState('idle', {});
		machine.registerState('anchoring', {});
		machine.registerState('preview', {});
		machine.registerState('editing', {});
		machine.registerState('completed', {});
	}

	/* eslint-disable-next-line complexity */
	protected override handlePointerClick(event: DrawingPointerEvent): void {
		const state = this.stateMachine().state();
		// First anchor
		if (this._start === null && event.price != null && event.time != null) {
			this._pushUndo();
			this._start = { price: event.price, time: event.time };
			this.stateMachine().transition('anchoring', event);
			this.requestUpdate();
			return;
		}

		// While anchoring/preview, click should complete the rectangle even if _end already set by move
		if (this._start !== null && (state === 'anchoring' || state === 'preview')) {
			if (event.price != null && event.time != null) {
				this._pushUndo();
				this._end = { price: event.price, time: event.time };
			}
			this.stateMachine().transition('completed', event);
			this.updateAllGeometry();
			this.requestUpdate();
			return;
		}

		// Completed rectangle: determine edit target (handle vs body) and enter editing
		if (this._start !== null && this._end !== null) {
			// Prefer handle under cursor
			const hit = (event.point && event.point.x != null && event.point.y != null)
				? this.handlesController().hitTest(event.point.x, event.point.y)
				: null;
			if (hit) {
				// Begin handle edit: push undo and capture original anchors for ESC revert
				this._pushUndo();
				this._origStart = this._start ? { price: this._start.price, time: this._start.time } : null;
				this._origEnd = this._end ? { price: this._end.price, time: this._end.time } : null;

				this._dragTarget = 'handle';
				this._activeHandleId = hit.handle.id();
				this.stateMachine().transition('editing', event);
				return;
			}

			// Fallback to body hit
			const bounds = this._boundsPx();
			if (bounds && event.point && event.point.x != null && event.point.y != null) {
				const { left, right, top, bottom } = bounds;
				const inside = event.point.x >= left && event.point.x <= right && event.point.y >= top && event.point.y <= bottom;
				if (inside) {
					// Begin body drag: push undo and capture originals
					this._pushUndo();
					this._dragTarget = 'body';
					this._activeHandleId = null;
					this._origStart = this._start ? { price: this._start.price, time: this._start.time } : null;
					this._origEnd = this._end ? { price: this._end.price, time: this._end.time } : null;
					this._dragStartPx = (event.point && event.point.x != null && event.point.y != null) ? { x: event.point.x, y: event.point.y } : null;
					this.stateMachine().transition('editing', event);
					return;
				}
			}

			// If neither handle nor body: toggle out of editing if currently editing, else ignore
			if (state === 'editing') {
				this._dragTarget = 'none';
				this._activeHandleId = null;
				this._origStart = null;
				this._origEnd = null;
				this.stateMachine().transition('completed', event);
			}
			return;
		}
	}

	/* eslint-disable-next-line complexity */
	protected override handlePointerMove(event: DrawingPointerEvent): void {
		const state = this.stateMachine().state();
		// Anchoring → preview
		if (state === 'anchoring' && this._start !== null && event.price != null && event.time != null) {
			this._end = { price: event.price, time: event.time };
			this.stateMachine().transition('preview', event);
			this.updateAllGeometry();
			this.requestUpdate();
			return;
		}

		// Editing: handle or body drag
		if (state === 'editing' && this._start !== null && this._end !== null) {
			// Handle drag (prefer explicit selection from click; fallback to hit under cursor)
			const handleId = this._dragTarget === 'handle'
				? this._activeHandleId
				: (event.point && event.point.x != null && event.point.y != null
					? this.handlesController().hitTest(event.point.x, event.point.y)?.handle.id()
					: undefined);

			if (handleId && event.price != null && event.time != null) {
				switch (handleId) {
					case 'topLeft':
						this._start = { price: event.price, time: event.time };
						break;
					case 'bottomRight':
						this._end = { price: event.price, time: event.time };
						break;
					case 'topRight':
						this._start = { price: event.price, time: this._start.time };
						this._end = { price: this._end.price, time: event.time };
						break;
					case 'bottomLeft':
						this._start = { price: this._start.price, time: event.time };
						this._end = { price: event.price, time: this._end.time };
						break;
				}
				this.updateAllGeometry();
				this.requestUpdate();
				return;
			}

			// Body drag: move both anchors by delta using pixel-space transform to support all time types
			if (this._dragTarget === 'body' && this._origStart && this._origEnd && this._dragStartPx && event.point && event.point.x != null && event.point.y != null) {
				const env = this.environment();
				const dx = event.point.x - this._dragStartPx.x;
				const dy = event.point.y - this._dragStartPx.y;

				const sTimePx = env.coordinateTransform.timeToCoordinate(this._origStart.time);
				const eTimePx = env.coordinateTransform.timeToCoordinate(this._origEnd.time);
				const sPricePx = env.coordinateTransform.priceToCoordinate(this._origStart.price);
				const ePricePx = env.coordinateTransform.priceToCoordinate(this._origEnd.price);

				if (sTimePx == null || eTimePx == null || sPricePx == null || ePricePx == null) { return; }

				const nextStartTime = env.coordinateTransform.coordinateToTime(((sTimePx as number) + dx) as Coordinate) as Time;
				const nextEndTime = env.coordinateTransform.coordinateToTime(((eTimePx as number) + dx) as Coordinate) as Time;
				const nextStartPrice = env.coordinateTransform.coordinateToPrice(((sPricePx as number) + dy) as Coordinate);
				const nextEndPrice = env.coordinateTransform.coordinateToPrice(((ePricePx as number) + dy) as Coordinate);

				if (nextStartPrice == null || nextEndPrice == null || nextStartTime == null || nextEndTime == null) { return; }

				const nextStart: Anchor = { price: nextStartPrice as number, time: nextStartTime };
				const nextEnd: Anchor = { price: nextEndPrice as number, time: nextEndTime };

				this._start = nextStart;
				this._end = nextEnd;
				this.updateAllGeometry();
				this.requestUpdate();
			}
		}
	}

	protected override handlePointerCancel(): void {
		// no-op
	}

	protected override collectViews(): DrawingViewBundle {
		const priceAxis: ISeriesPrimitiveAxisView[] = [];
		const timeAxis: ISeriesPrimitiveAxisView[] = [];

		if (this._options.showLabels) {
			if (this._start) {
				priceAxis.push(new RectAxisLabelViewPrice(this, 'start'));
				timeAxis.push(new RectAxisLabelViewTime(this, 'start'));
			}
			if (this._end) {
				priceAxis.push(new RectAxisLabelViewPrice(this, 'end'));
				timeAxis.push(new RectAxisLabelViewTime(this, 'end'));
			}
		}

		return {
			pane: [this._paneFillView, this._handlesView],
			priceAxis,
			timeAxis,
			priceAxisPane: [this._priceAxisPaneView],
			timeAxisPane: [this._timeAxisPaneView],
		};
	}

	protected override performHitTest(event: DrawingPointerEvent): DrawingHoverResult | null {
		// Guard against missing pointer coordinates (e.g., keyboard-driven events)
		if (!event.point || event.point.x == null || event.point.y == null) {
			this.handlesController().setHovered(null);
			return null;
		}

		const hit = this.handlesController().hitTest(event.point.x, event.point.y);
		if (hit) {
			this.handlesController().setHovered(hit.handle.id());
			return {
				cursor: hit.descriptor.cursor ?? 'default',
				externalId: `rectangle-handle-${hit.handle.id()}`,
				zOrder: 'top',
			};
		}
		this.handlesController().setHovered(null);

		const bounds = this._boundsPx();
		if (!bounds) { return null; }
		const { left, right, top, bottom } = bounds;
		const inside = event.point.x >= left && event.point.x <= right && event.point.y >= top && event.point.y <= bottom;
		if (!inside) { return null; }
		return {
			cursor: 'move',
			externalId: 'rectangle-body',
			zOrder: 'normal',
		};
	}

	protected override updateAllGeometry(): void {
		const h = this.handlesController();
		const corners = this._cornerPositionsPx();
		if (!corners) {
			h.clear();
			return;
		}
		const style: HandleStyle = DEFAULT_HANDLE_STYLE;
		const renderer = new SquareHandleRenderer();
		const upsert = (id: string, pos: { x: number; y: number }, cursor: string) => {
			const existing = h.get(id);
			if (existing) {
				existing.setPosition(pos);
				existing.updateStyle(style);
				existing.updateMetadata({ corner: id });
			} else {
				const handle = new BaseHandle(id, pos, renderer, 'square', style, cursor, { corner: id });
				h.add(handle);
			}
		};
		upsert('topLeft', corners.topLeft, 'nwse-resize');
		upsert('topRight', corners.topRight, 'nesw-resize');
		upsert('bottomLeft', corners.bottomLeft, 'nesw-resize');
		upsert('bottomRight', corners.bottomRight, 'nwse-resize');
	}

	public autoscaleInfo(startLogical: number, endLogical: number): AutoscaleInfo | null {
		if (this._start === null || this._end === null) { return null; }
		const min = Math.min(this._start.price, this._end.price);
		const max = Math.max(this._start.price, this._end.price);
		// Maintain consistent autoscale semantics across preview/completed,
		// and provide explicit margins to avoid UI jitter.
		return {
			priceRange: { minValue: min, maxValue: max },
			margins: { above: 0, below: 0 },
		};
	}

	private _boundsPx(): { left: number; right: number; top: number; bottom: number } | null {
		return rectBoundsPx(this.environment(), this._start, this._end);
	}

	private _cornerPositionsPx(): { topLeft: { x: number; y: number }; topRight: { x: number; y: number }; bottomLeft: { x: number; y: number }; bottomRight: { x: number; y: number } } | null {
		return rectCornersPx(this.environment(), this._start, this._end);
	}

	// Public proxies for renderers
	public getBoundsPxForView(): { left: number; right: number; top: number; bottom: number } | null { return this._boundsPx(); }
	public getOptions(): Readonly<typeof this._options> { return this._options; }
	public getState(): DrawingStateId { return this.stateMachine().state(); }
	public drawHandlesToTarget(target: CanvasRenderingTarget2D): void {
		target.useBitmapCoordinateSpace(scope => {
			for (const handle of this.handlesController().handles()) {
				handle.renderer().draw(handle.descriptor(), scope.context, {
					pixelRatio: { horizontal: scope.horizontalPixelRatio, vertical: scope.verticalPixelRatio },
				});
			}
		});
	}

	private _snapshot(): RectangleSnapshotV1 {
		return {
			version: 1,
			anchors: { start: this._start, end: this._end },
			options: {
				fillColor: this._options.fillColor,
				previewFillColor: this._options.previewFillColor,
				labelColor: this._options.labelColor,
				labelTextColor: this._options.labelTextColor,
				showLabels: this._options.showLabels,
			},
		};
	}

	private _applySnapshot(s: RectangleSnapshotV1): void {
		this._start = s.anchors.start;
		this._end = s.anchors.end;
		this._options = { ...this._options, ...s.options };
		// Set state based on anchors to support undo/redo and JSON restore flows.
		if (this._start && this._end) {
			this.stateMachine().transition('completed');
		} else {
			this.stateMachine().transition('idle');
		}
		this.updateAllGeometry();
		this.requestUpdate();
	}

	private _pushUndo(): void {
		this._undoStack.push(this._snapshot());
		this._redoStack.length = 0;
		if (this._undoStack.length > 64) {
			this._undoStack.shift();
		}
	}

	public toJSON(): RectangleSnapshotV1 { return this._snapshot(); }

	public static fromJSON(snapshot: RectangleSnapshotV1): RectangleDrawingPrimitive {
		const inst = new RectangleDrawingPrimitive();
		if (snapshot && snapshot.version === 1) {
			(inst as any)._start = snapshot.anchors.start;
			(inst as any)._end = snapshot.anchors.end;
			(inst as any)._options = { ...(inst as any)._options, ...snapshot.options };
			if (snapshot.anchors.start && snapshot.anchors.end) {
				(inst as any).stateMachine().transition('completed');
			}
			// Defer geometry until attached(): environment() isn't available pre-attach.
			// DrawingPrimitiveBase.attached() will call updateAllGeometry() and requestUpdate().
		}
		return inst;
	}

	public undo(): boolean {
		if (this._undoStack.length === 0) { return false; }
		const prev = this._undoStack.pop() as RectangleSnapshotV1;
		const current = this._snapshot();
		// Push current state so that redo can re-apply it after undo.
		this._redoStack.push(current);
		this._applySnapshot(prev);
		return true;
	}

	public redo(): boolean {
		if (this._redoStack.length === 0) { return false; }
		const next = this._redoStack.pop() as RectangleSnapshotV1;
		const current = this._snapshot();
		this._undoStack.push(current);
		this._applySnapshot(next);
		return true;
	}

	public deleteSelf(): void {
		this._pushUndo();
		this._start = null;
		this._end = null;
		this._dragTarget = 'none';
		this._activeHandleId = null;
		this._origStart = null;
		this._origEnd = null;
		this.handlesController().clear();
		this.stateMachine().transition('idle');
		this.requestUpdate();
	}

	// Ensure state restoration after attach (e.g., fromJSON or undo/redo) when anchors exist.
	public override attached(param: any): void {
		super.attached(param);
		// Reset transient drag state
		this._dragTarget = 'none';
		this._activeHandleId = null;
		this._origStart = null;
		this._origEnd = null;

		// Install keyboard listeners (Esc cancel, Delete/Backspace remove)
		try {
			const g: any = (typeof globalThis !== 'undefined') ? (globalThis as any) : undefined;
			const w: any = g?.window ?? g;
			if (w && typeof w.addEventListener === 'function' && !this._keyListenerInstalled) {
				w.addEventListener('keydown', this._onKeyDown as any, true);
				this._keyListenerInstalled = true;
			}
		} catch {
			// ignore in non-DOM environments
		}

		this._dragStartPx = null;

		if (this._start && this._end) {
			this.stateMachine().transition('completed');
			this.updateAllGeometry();
			this.requestUpdate();
		}
	}

	// Enter editing mode on double-click when anchors exist (consumes dblclick)
	protected override handlePointerDblClick(): boolean {
		if (this._start && this._end) {
			// reset transient drag state
			this._dragTarget = 'none';
			this._activeHandleId = null;
			this._origStart = null;
			this._origEnd = null;

			this.stateMachine().transition('editing');
			this.requestUpdate();
			return true;
		}
		return false;
	}

	public override detached(): void {
		// Remove keyboard listeners
		try {
			const g: any = (typeof globalThis !== 'undefined') ? (globalThis as any) : undefined;
			const w: any = g?.window ?? g;
			if (w && typeof w.removeEventListener === 'function' && this._keyListenerInstalled) {
				w.removeEventListener('keydown', this._onKeyDown as any, true);
				this._keyListenerInstalled = false;
			}
		} catch {
			// ignore in non-DOM environments
		}

		// Clear transient drag state
		this._dragTarget = 'none';
		this._activeHandleId = null;
		this._dragStartPx = null;
		this._origStart = null;
		this._origEnd = null;

		super.detached();
	}

	/* eslint-disable-next-line complexity */
	private readonly _onKeyDown = (ev: KeyboardEvent | { key?: string; code?: string } | null | undefined): void => {
		const kobj = ev as { key?: string; code?: string } | undefined;
		const keyRaw = String(kobj?.key ?? kobj?.code ?? '');
		const key = keyRaw.toLowerCase();
		const state = this.stateMachine().state();

		// ESC: cancel current operation
		if (key === 'escape' || key === 'esc') {
			// Cancel anchoring/preview → back to idle and clear anchors
			if (state === 'anchoring' || state === 'preview') {
				this._pushUndo();
				this._start = null;
				this._end = null;
				this.handlesController().clear();
				this.stateMachine().transition('idle');
				this.requestUpdate();
				return;
			}

			// Cancel editing → revert to original anchors if present and finish editing
			if (state === 'editing') {
				if (this._origStart && this._origEnd) {
					this._start = { price: this._origStart.price, time: this._origStart.time };
					this._end = { price: this._origEnd.price, time: this._origEnd.time };
					this.updateAllGeometry();
				}
				this._dragTarget = 'none';
				this._activeHandleId = null;
				this._origStart = null;
				this._origEnd = null;
				this.stateMachine().transition('completed');
				this.requestUpdate();
				return;
			}
		}

		// Delete / Backspace: delete the rectangle
		if (key === 'delete' || key === 'backspace') {
			if (this._start && this._end) {
				this.deleteSelf();
			}
		}
	};
}

class RectanglePaneRenderer implements IPrimitivePaneRenderer {
	private readonly _primitive: RectangleDrawingPrimitive;
	public constructor(p: RectangleDrawingPrimitive) { this._primitive = p; }
	public draw(target: CanvasRenderingTarget2D, _utils?: DrawingUtils): void {
		const bounds = this._primitive.getBoundsPxForView();
		if (!bounds) { return; }
		const state = this._primitive.getState();
		const fill = (state === 'preview') ? this._primitive.getOptions().previewFillColor : this._primitive.getOptions().fillColor;
		target.useBitmapCoordinateSpace(scope => {
			const ctx = scope.context;
			ctx.save();
			ctx.fillStyle = fill;
			const w = Math.max(0, bounds.right - bounds.left);
			const h = Math.max(0, bounds.bottom - bounds.top);
			ctx.fillRect(bounds.left, bounds.top, w, h);
			ctx.restore();
		});
	}
}

class SquareHandleRenderer implements HandleRenderer {
	public draw(descriptor: HandleDescriptor, ctx: CanvasRenderingContext2D, _context: HandleRendererDrawContext): void {
		const size = descriptor.style.size ?? 8;
		const half = size / 2;
		const x = descriptor.position.x - half;
		const y = descriptor.position.y - half;
		const fill = descriptor.isActive ? (descriptor.style.activeFill ?? descriptor.style.fill ?? '#fff')
			: descriptor.isHovered ? (descriptor.style.hoverFill ?? descriptor.style.fill ?? '#fff')
			: (descriptor.style.fill ?? '#fff');
		const stroke = descriptor.style.stroke ?? '#333';
		const lw = descriptor.style.lineWidth ?? 1;
		ctx.save();
		ctx.lineWidth = lw;
		ctx.strokeStyle = stroke;
		ctx.fillStyle = fill;
		if (descriptor.style.shadowBlur && descriptor.style.shadowColor) {
			ctx.shadowBlur = descriptor.style.shadowBlur;
			ctx.shadowColor = descriptor.style.shadowColor;
		}
		ctx.beginPath();
		ctx.rect(x, y, size, size);
		ctx.fill();
		ctx.stroke();
		ctx.restore();
	}
}

class RectangleHandlesRenderer implements IPrimitivePaneRenderer {
	private readonly _primitive: RectangleDrawingPrimitive;
	public constructor(p: RectangleDrawingPrimitive) { this._primitive = p; }
	public draw(target: CanvasRenderingTarget2D): void {
		this._primitive.drawHandlesToTarget(target);
	}
}

class RectanglePaneView implements IPrimitivePaneView {
	private readonly _renderer: RectanglePaneRenderer;
	public constructor(p: RectangleDrawingPrimitive) { this._renderer = new RectanglePaneRenderer(p); }
	public renderer(): IPrimitivePaneRenderer | null { return this._renderer; }
	public zOrder(): PrimitivePaneViewZOrder { return 'normal'; }
}

class RectangleHandlesPaneView implements IPrimitivePaneView {
	private readonly _renderer: RectangleHandlesRenderer;
	public constructor(p: RectangleDrawingPrimitive) { this._renderer = new RectangleHandlesRenderer(p); }
	public renderer(): IPrimitivePaneRenderer | null { return this._renderer; }
	public zOrder(): PrimitivePaneViewZOrder { return 'top'; }
}

class RectAxisLabelViewPrice implements ISeriesPrimitiveAxisView {
	private readonly _primitive: RectangleDrawingPrimitive;
	private readonly _anchor: 'start' | 'end';
	public constructor(p: RectangleDrawingPrimitive, anchor: 'start' | 'end') { this._primitive = p; this._anchor = anchor; }
	public coordinate(): number {
		if (!this._primitive.getOptions().showLabels) { return -1; }
		const env = this._primitive.environment();
		const a = this._anchor === 'start' ? this._primitive.getStartAnchor() : this._primitive.getEndAnchor();
		if (!a) { return -1; }
		const y = env.coordinateTransform.priceToCoordinate(a.price);
		return (y ?? -1) as number;
	}
	public fixedCoordinate?(): number | undefined { return undefined; }
	public text(): string {
		const a = this._anchor === 'start' ? this._primitive.getStartAnchor() : this._primitive.getEndAnchor();
		const fmt = this._primitive.getOptions().priceLabelFormatter;
		return a ? (fmt ? fmt(a.price) : String(a.price)) : '';
	}
	public textColor(): string { return this._primitive.getOptions().labelTextColor; }
	public backColor(): string { return this._primitive.getOptions().labelColor; }
	public visible?(): boolean {
		const a = this._anchor === 'start' ? this._primitive.getStartAnchor() : this._primitive.getEndAnchor();
		return this._primitive.getOptions().showLabels && !!a;
	}
	public tickVisible?(): boolean { return true; }
}

class RectAxisLabelViewTime implements ISeriesPrimitiveAxisView {
	private readonly _primitive: RectangleDrawingPrimitive;
	private readonly _anchor: 'start' | 'end';
	public constructor(p: RectangleDrawingPrimitive, anchor: 'start' | 'end') { this._primitive = p; this._anchor = anchor; }
	public coordinate(): number {
		if (!this._primitive.getOptions().showLabels) { return -1; }
		const env = this._primitive.environment();
		const a = this._anchor === 'start' ? this._primitive.getStartAnchor() : this._primitive.getEndAnchor();
		if (!a) { return -1; }
		const x = env.coordinateTransform.timeToCoordinate(a.time);
		return (x ?? -1) as number;
	}
	public fixedCoordinate?(): number | undefined { return undefined; }
	public text(): string {
		const a = this._anchor === 'start' ? this._primitive.getStartAnchor() : this._primitive.getEndAnchor();
		const fmt = this._primitive.getOptions().timeLabelFormatter;
		return a ? (fmt ? fmt(a.time) : String(a.time)) : '';
	}
	public textColor(): string { return this._primitive.getOptions().labelTextColor; }
	public backColor(): string { return this._primitive.getOptions().labelColor; }
	public visible?(): boolean {
		const a = this._anchor === 'start' ? this._primitive.getStartAnchor() : this._primitive.getEndAnchor();
		return this._primitive.getOptions().showLabels && !!a;
	}
	public tickVisible?(): boolean { return true; }
}

class RectangleAxisPaneRenderer implements IPrimitivePaneRenderer {
	private readonly _primitive: RectangleDrawingPrimitive;
	private readonly _vertical: boolean;
	public constructor(p: RectangleDrawingPrimitive, vertical: boolean) {
		this._primitive = p;
		this._vertical = vertical;
	}
	public draw(target: CanvasRenderingTarget2D): void {
		const start = this._primitive.getStartAnchor();
		const end = this._primitive.getEndAnchor();
		if (!start || !end) { return; }
		const env = this._primitive.environment();
		const c1 = this._vertical
			? env.coordinateTransform.priceToCoordinate(start.price)
			: env.coordinateTransform.timeToCoordinate(start.time);
		const c2 = this._vertical
			? env.coordinateTransform.priceToCoordinate(end.price)
			: env.coordinateTransform.timeToCoordinate(end.time);
		if (c1 == null || c2 == null) { return; }
		const a = Math.min(c1 as number, c2 as number);
		const b = Math.max(c1 as number, c2 as number);
		target.useBitmapCoordinateSpace(scope => {
			const ctx = scope.context;
			ctx.save();
			ctx.globalAlpha = 0.5;
			ctx.fillStyle = this._primitive.getOptions().labelColor;
			if (this._vertical) {
				const h = Math.max(0, b - a);
				const w = Math.max(2, 12 * scope.horizontalPixelRatio);
				ctx.fillRect(0, a, w, h);
			} else {
				const w = Math.max(0, b - a);
				const h = Math.max(2, 12 * scope.verticalPixelRatio);
				ctx.fillRect(a, 0, w, h);
			}
			ctx.restore();
		});
	}
}

class RectanglePriceAxisPaneView implements IPrimitivePaneView {
	private readonly _renderer: RectangleAxisPaneRenderer;
	public constructor(p: RectangleDrawingPrimitive) { this._renderer = new RectangleAxisPaneRenderer(p, true); }
	public renderer(): IPrimitivePaneRenderer | null { return this._renderer; }
	public zOrder(): PrimitivePaneViewZOrder { return 'bottom'; }
}

class RectangleTimeAxisPaneView implements IPrimitivePaneView {
	private readonly _renderer: RectangleAxisPaneRenderer;
	public constructor(p: RectangleDrawingPrimitive) { this._renderer = new RectangleAxisPaneRenderer(p, false); }
	public renderer(): IPrimitivePaneRenderer | null { return this._renderer; }
	public zOrder(): PrimitivePaneViewZOrder { return 'bottom'; }
}

export class RectangleDrawingTool {
	public readonly spec = rectangleSpec;
}

export { rectangleSpec } from './__generated__/rectangle';
