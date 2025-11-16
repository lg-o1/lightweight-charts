import type { Handle, HandleDescriptor, HandleStyle, HandleRenderer } from './handle-types';

/**
 * Basic implementation of a drawing handle that stores descriptor data and delegates rendering
 * to an injected {@link HandleRenderer}. Higher level tools can extend this class to add custom
 * behaviour (e.g. constrained movement, snapping) while still benefiting from the shared
 * descriptor/update logic.
 */
export class BaseHandle implements Handle {
	private _descriptor: HandleDescriptor;
	private readonly _renderer: HandleRenderer;

	public constructor(
		id: string,
		position: { x: number; y: number },
		renderer: HandleRenderer,
		shape: HandleDescriptor['shape'],
		style: HandleStyle = {},
		cursor?: string,
		metadata?: Record<string, unknown>
	) {
		this._renderer = renderer;
		this._descriptor = {
			id,
			position: { x: position.x, y: position.y },
			shape,
			style: { ...style },
			cursor,
			metadata: metadata ? { ...metadata } : undefined,
			halo: style.size,
			isHovered: false,
			isActive: false,
		};
	}

	public id(): string {
		return this._descriptor.id;
	}

	public position(): { x: number; y: number } {
		return this._descriptor.position;
	}

	public descriptor(): HandleDescriptor {
		return this._descriptor;
	}

	public renderer(): HandleRenderer {
		return this._renderer;
	}

	public setPosition(position: { x: number; y: number }): void {
		this._descriptor = {
			...this._descriptor,
			position: { x: position.x, y: position.y },
		};
	}

	public setHovered(hovered: boolean): void {
		if (this._descriptor.isHovered === hovered) {
			return;
		}
		this._descriptor = {
			...this._descriptor,
			isHovered: hovered,
		};
	}

	public setActive(active: boolean): void {
		if (this._descriptor.isActive === active) {
			return;
		}
		this._descriptor = {
			...this._descriptor,
			isActive: active,
		};
	}

	public updateStyle(style: Partial<HandleStyle>): void {
		const nextStyle: HandleStyle = {
			...this._descriptor.style,
			...style,
		};
		this._descriptor = {
			...this._descriptor,
			style: nextStyle,
			halo: style.size ?? this._descriptor.halo,
		};
	}

	public updateMetadata(metadata: Record<string, unknown>): void {
		this._descriptor = {
			...this._descriptor,
			metadata: {
				...(this._descriptor.metadata ?? {}),
				...metadata,
			},
		};
	}
}
