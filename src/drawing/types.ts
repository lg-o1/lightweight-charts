import type { CanvasRenderingTarget2D } from 'fancy-canvas';

import type { IChartApiBase } from '../api/ichart-api';
import type { ISeriesApi } from '../api/iseries-api';
import type { Coordinate } from '../model/coordinate';
import type { Time } from '../model/horz-scale-behavior-time/types';
import type { IPrimitivePaneView, PrimitivePaneViewZOrder } from '../model/ipane-primitive';
import type { ISeriesPrimitiveAxisView } from '../model/iseries-primitive';
import type { SeriesType } from '../model/series-options';

export interface DrawingCoordinateTransform<THorz extends Time = Time> {
	priceToCoordinate(price: number): Coordinate | null;
	coordinateToPrice(y: Coordinate): number | null;
	timeToCoordinate(time: THorz): Coordinate | null;
	coordinateToTime(x: Coordinate): THorz | null;
}

export interface DrawingEnvironment<THorz extends Time = Time> {
	chart: IChartApiBase<THorz>;
	series: ISeriesApi<SeriesType, THorz>;
	coordinateTransform: DrawingCoordinateTransform<THorz>;
	requestUpdate: () => void;
}

export interface DrawingPointerEvent<THorz extends Time = Time> {
	clientX: number;
	clientY: number;
	point: { x: number; y: number };
	rawEvent: MouseEvent;
	time?: THorz;
	logical?: number;
	price?: number;
	pointerType: 'mouse' | 'pen' | 'touch';
	isPrimary: boolean;
	altKey: boolean;
	ctrlKey: boolean;
	metaKey: boolean;
	shiftKey: boolean;
}

export interface DrawingRenderScope {
	target: CanvasRenderingTarget2D;
	horizontalPixelRatio: number;
	verticalPixelRatio: number;
}

export type DrawingZOrder = PrimitivePaneViewZOrder | 'background';

export interface DrawingHoverResult {
	cursor: string;
	externalId?: string;
	zOrder: DrawingZOrder;
	isBackground?: boolean;
}

export interface DrawingViewBundle {
	pane: readonly IPrimitivePaneView[];
	priceAxis?: readonly ISeriesPrimitiveAxisView[];
	timeAxis?: readonly ISeriesPrimitiveAxisView[];
	priceAxisPane?: readonly IPrimitivePaneView[];
	timeAxisPane?: readonly IPrimitivePaneView[];
}
