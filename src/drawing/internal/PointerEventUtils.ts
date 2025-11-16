import type { MouseEventParams } from '../../api/ichart-api';
import type { Time } from '../../model/horz-scale-behavior-time/types';
import type { TouchMouseEventData } from '../../model/touch-mouse-event-data';
import type { DrawingPointerEvent } from '../types';

/**
 * Convert chart MouseEventParams into DrawingPointerEvent used by drawing runtime.
 * Returns null when point is missing (e.g., mouse leave).
 */
export function pointerEventFromParams<THorz extends Time>(
	params: MouseEventParams<THorz>,
	type: 'click' | 'mousemove'
): DrawingPointerEvent<THorz> | null {
	if (!params.point) {
		return null;
	}

	const source = params.sourceEvent;
	const pointX = params.point.x;
	const pointY = params.point.y;

	const price = params.hoveredSeries ? params.hoveredSeries.coordinateToPrice(pointY) : null;

	return {
		clientX: source?.clientX ?? pointX,
		clientY: source?.clientY ?? pointY,
		point: { x: pointX, y: pointY },
		rawEvent: createSyntheticMouseEvent(type, source),
		time: params.time,
		logical: params.logical,
		price: price ?? undefined,
		pointerType: 'mouse',
		isPrimary: true,
		altKey: source?.altKey ?? false,
		ctrlKey: source?.ctrlKey ?? false,
		metaKey: source?.metaKey ?? false,
		shiftKey: source?.shiftKey ?? false,
	};
}

/**
 * Create a synthetic MouseEvent with minimal fields used by pointers pipeline.
 * In Node/test environments where MouseEvent is not available, returns a plain object with { type }.
 */
export function createSyntheticMouseEvent(type: string, data?: TouchMouseEventData): MouseEvent {
	if (typeof (globalThis as any).MouseEvent === 'function') {
		return new MouseEvent(type, {
			clientX: data?.clientX,
			clientY: data?.clientY,
			screenX: data?.screenX,
			screenY: data?.screenY,
			ctrlKey: data?.ctrlKey ?? false,
			altKey: data?.altKey ?? false,
			shiftKey: data?.shiftKey ?? false,
			metaKey: data?.metaKey ?? false,
		});
	}
	return { type } as MouseEvent;
}