import type { Handle, HandleDescriptor } from './handle-types';

export interface HandleHitTestResult {
	handle: Handle;
	descriptor: HandleDescriptor;
}

export class HandleController {
	private readonly _handles = new Map<string, Handle>();

	public add(handle: Handle): void {
		this._handles.set(handle.id(), handle);
	}

	public upsert(handle: Handle): void {
		this._handles.set(handle.id(), handle);
	}

	public delete(id: string): void {
		this._handles.delete(id);
	}

	public clear(): void {
		this._handles.clear();
	}

	public has(id: string): boolean {
		return this._handles.has(id);
	}

	public get(id: string): Handle | undefined {
		return this._handles.get(id);
	}

	public handles(): Iterable<Handle> {
		return this._handles.values();
	}

	public setHovered(id: string | null): void {
		for (const handle of this._handles.values()) {
			handle.setHovered(handle.id() === id);
		}
	}

	public setActive(id: string | null): void {
		for (const handle of this._handles.values()) {
			handle.setActive(handle.id() === id);
		}
	}

	public hitTest(x: number, y: number): HandleHitTestResult | null {
		for (const handle of Array.from(this._handles.values()).reverse()) {
			const descriptor = handle.descriptor();
			if (this._containsPoint(descriptor, x, y)) {
				return { handle, descriptor };
			}
		}

		return null;
	}

	private _containsPoint(descriptor: HandleDescriptor, x: number, y: number): boolean {
		const size = descriptor.style.size ?? 8;
		const half = size / 2;
		const left = descriptor.position.x - half;
		const top = descriptor.position.y - half;
		const right = descriptor.position.x + half;
		const bottom = descriptor.position.y + half;

		return x >= left && x <= right && y >= top && y <= bottom;
	}
}
