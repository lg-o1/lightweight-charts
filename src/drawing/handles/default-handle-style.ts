// Default handle rendering style for drawing tools
// Centralized to avoid per-tool hardcoding; tools may read and override selectively via options

import type { HandleStyle } from './handle-types';

export const DEFAULT_HANDLE_STYLE: Readonly<HandleStyle> = Object.freeze({
	// Visual size in CSS pixels (scaled by canvas pixel ratio in renderer)
	size: 8,
	// Base colors
	fill: '#ffffff',
	stroke: '#333333',
	lineWidth: 1,
	// Interaction variants
	hoverFill: '#ffeeaa',
	activeFill: '#ffcc66',
});
