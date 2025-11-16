// Centralized keyboard event dispatcher for drawing tools
// MVP: manage a set of registered tools and forward keydown events to the most recently active tool

export interface KeydownConsumer {
	// A public method expected by the controller
	onKeyDownFromController(ev: KeyboardEvent | { key?: string; code?: string } | null | undefined): void;
}

class DrawingToolControllerImpl {
	private _installed = false;
	private _stack: KeydownConsumer[] = [];

	register(tool: KeydownConsumer): void {
		// Move to top if already in stack (re-attach)
		const i = this._stack.indexOf(tool);
		if (i >= 0) { this._stack.splice(i, 1); }
		this._stack.push(tool);
		this._ensureInstalled();
	}

	deregister(tool: KeydownConsumer): void {
		const i = this._stack.indexOf(tool);
		if (i >= 0) { this._stack.splice(i, 1); }
		this._teardownIfIdle();
	}

	private _ensureInstalled(): void {
		if (this._installed) { return; }
		try {
			const g: any = (typeof globalThis !== 'undefined') ? (globalThis as any) : undefined;
			const w: any = g?.window ?? g;
			if (w && typeof w.addEventListener === 'function') {
				w.addEventListener('keydown', this._onKeyDown, true);
				this._installed = true;
			}
		} catch {
			// ignore in non-DOM environments
		}
	}

	private _teardownIfIdle(): void {
		if (this._stack.length > 0 || !this._installed) { return; }
		try {
			const g: any = (typeof globalThis !== 'undefined') ? (globalThis as any) : undefined;
			const w: any = g?.window ?? g;
			if (w && typeof w.removeEventListener === 'function') {
				w.removeEventListener('keydown', this._onKeyDown, true);
				this._installed = false;
			}
		} catch {
			// ignore
		}
	}

	private _onKeyDown = (ev: KeyboardEvent | { key?: string; code?: string } | null | undefined): void => {
		// Forward to the most recent registered tool (top of stack)
		const last = this._stack[this._stack.length - 1];
		if (last && typeof last.onKeyDownFromController === 'function') {
			try { last.onKeyDownFromController(ev); } catch (_err) { void _err; }
		}
	};
}

let singleton: DrawingToolControllerImpl | null = null;
export function getDrawingToolController(): DrawingToolControllerImpl {
	if (singleton == null) { singleton = new DrawingToolControllerImpl(); }
	return singleton;
}
