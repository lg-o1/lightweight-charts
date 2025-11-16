export type DrawingStateId = string;

export interface DrawingStateHandlers<TContext = unknown> {
	onEnter?(context?: TContext): void;
	onExit?(): void;
	onPointerClick?(context: TContext): void;
	onPointerMove?(context: TContext): void;
	onPointerCancel?(): void;
	onReset?(): void;
}

export type DrawingStateTransitionHook<TContext = unknown> = (from: DrawingStateId, to: DrawingStateId, context?: TContext) => void;

/**
 * Minimal event-driven state machine for drawing tool interactions.
 */
export class DrawingStateMachine<TContext = unknown> {
	private readonly _states = new Map<DrawingStateId, DrawingStateHandlers<TContext>>();
	private readonly _initialState: DrawingStateId;
	private _currentState: DrawingStateId;
	private _afterTransitionHook: DrawingStateTransitionHook<TContext> | null = null;

	public constructor(initial: DrawingStateId) {
		this._initialState = initial;
		this._currentState = initial;
	}

	public registerState(id: DrawingStateId, handlers: DrawingStateHandlers<TContext>): void {
		this._states.set(id, handlers);
	}

	public state(): DrawingStateId {
		return this._currentState;
	}

	public setAfterTransitionHook(hook: DrawingStateTransitionHook<TContext> | null): void {
		this._afterTransitionHook = hook;
	}

	public transition(next: DrawingStateId, context?: TContext): void {
		if (this._currentState === next) {
			return;
		}

		this._states.get(this._currentState)?.onExit?.();

		const previous = this._currentState;
		this._currentState = next;

		this._states.get(this._currentState)?.onEnter?.(context);

		this._afterTransitionHook?.(previous, next, context);
	}

	public pointerClick(context: TContext): void {
		this._states.get(this._currentState)?.onPointerClick?.(context);
	}

	public pointerMove(context: TContext): void {
		this._states.get(this._currentState)?.onPointerMove?.(context);
	}

	public pointerCancel(): void {
		this._states.get(this._currentState)?.onPointerCancel?.();
	}

	public reset(): void {
		this._states.get(this._currentState)?.onReset?.();
		if (this._currentState !== this._initialState) {
			this._states.get(this._currentState)?.onExit?.();
			const previous = this._currentState;
			this._currentState = this._initialState;
			this._states.get(this._currentState)?.onEnter?.();
			this._afterTransitionHook?.(previous, this._currentState);
		}
	}
}
