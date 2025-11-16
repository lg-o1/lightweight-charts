// Runtime geometry helpers for rectangle
import type { DrawingEnvironment } from '../types';
import type { Time } from '../../model/horz-scale-behavior-time/types';

export interface RectBounds {
	left: number;
	right: number;
	top: number;
	bottom: number;
}

export interface RectCorners {
	topLeft: { x: number; y: number };
	topRight: { x: number; y: number };
	bottomLeft: { x: number; y: number };
	bottomRight: { x: number; y: number };
}

export type AnchorLike<TH extends Time> = {
	time: TH;
	price: number;
};

/**
 * Compute rectangle bounds in pixel space from 2 price-time anchors.
 * Returns null if coordinate transforms cannot produce valid pixels.
 */
export function rectBoundsPx<TH extends Time>(
	env: DrawingEnvironment<TH>,
	start: AnchorLike<TH> | null,
	end: AnchorLike<TH> | null
): RectBounds | null {
	if (!start || !end) { return null; }

	const x1 = env.coordinateTransform.timeToCoordinate(start.time);
	const x2 = env.coordinateTransform.timeToCoordinate(end.time);
	const y1 = env.coordinateTransform.priceToCoordinate(start.price);
	const y2 = env.coordinateTransform.priceToCoordinate(end.price);

	if (x1 == null || x2 == null || y1 == null || y2 == null) { return null; }

	const left = Math.min(x1 as number, x2 as number);
	const right = Math.max(x1 as number, x2 as number);
	const top = Math.min(y1 as number, y2 as number);
	const bottom = Math.max(y1 as number, y2 as number);

	return { left, right, top, bottom };
}

/**
 * Compute rectangle corner positions in pixel space from 2 price-time anchors.
 * Returns null if bounds cannot be produced.
 */
export function rectCornersPx<TH extends Time>(
	env: DrawingEnvironment<TH>,
	start: AnchorLike<TH> | null,
	end: AnchorLike<TH> | null
): RectCorners | null {
	const bounds = rectBoundsPx(env, start, end);
	if (!bounds) { return null; }

	return {
		topLeft: { x: bounds.left, y: bounds.top },
		topRight: { x: bounds.right, y: bounds.top },
		bottomLeft: { x: bounds.left, y: bounds.bottom },
		bottomRight: { x: bounds.right, y: bounds.bottom },
	};
}