export type HandleShape = 'square' | 'circle' | 'diamond';

export interface HandleInteractionState {
	hovered?: boolean;
	active?: boolean;
}

export interface HandleStyle {
	fill?: string;
	stroke?: string;
	lineWidth?: number;
	size?: number;
	shadowBlur?: number;
	shadowColor?: string;
	hoverFill?: string;
	hoverStroke?: string;
	activeFill?: string;
	activeStroke?: string;
}

export interface HandleDescriptor {
	id: string;
	position: { x: number; y: number };
	shape: HandleShape;
	style: HandleStyle;
	cursor?: string;
	halo?: number;
	isHovered?: boolean;
	isActive?: boolean;
	metadata?: Record<string, unknown>;
}

export interface HandleRendererDrawContext {
	pixelRatio: {
		horizontal: number;
		vertical: number;
	};
}

export interface HandleRenderer {
	draw(descriptor: HandleDescriptor, ctx: CanvasRenderingContext2D, context: HandleRendererDrawContext): void;
}

export interface Handle {
	id(): string;
	position(): { x: number; y: number };
	descriptor(): HandleDescriptor;
	renderer(): HandleRenderer;

	setPosition(position: { x: number; y: number }): void;
	setHovered(hovered: boolean): void;
	setActive(active: boolean): void;
	updateStyle(style: Partial<HandleStyle>): void;
	updateMetadata(metadata: Record<string, unknown>): void;
}
