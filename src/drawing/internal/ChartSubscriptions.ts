import type { IChartApiBase, MouseEventHandler } from '../../api/ichart-api';
import type { Time } from '../../model/horz-scale-behavior-time/types';

type ChartWithOptionalDblClick<THorz extends Time> = IChartApiBase<THorz> & Partial<{
	subscribeDblClick(handler: MouseEventHandler<THorz>): void;
	unsubscribeDblClick(handler: MouseEventHandler<THorz>): void;
}>;

export interface SubscriptionsHandle {
	unsubscribe(): void;
	dblClickSubscribed: boolean;
}

/**
 * Subscribe to click/crosshairMove and optionally to dblclick (if chart supports it).
 * Returns a handle with a single unsubscribe() to clean up.
 */
export function subscribeAll<THorz extends Time>(
	chart: IChartApiBase<THorz>,
	handlers: {
		click: MouseEventHandler<THorz>;
		move: MouseEventHandler<THorz>;
		dblClick?: MouseEventHandler<THorz>;
	}
): SubscriptionsHandle {
	chart.subscribeClick(handlers.click);
	chart.subscribeCrosshairMove(handlers.move);

	const chartWithDbl = chart as ChartWithOptionalDblClick<THorz>;
	let dblClickSubscribed = false;

	if (handlers.dblClick && typeof chartWithDbl.subscribeDblClick === 'function') {
		chartWithDbl.subscribeDblClick(handlers.dblClick);
		dblClickSubscribed = true;
	}

	return {
		dblClickSubscribed,
		unsubscribe: () => {
			chart.unsubscribeClick(handlers.click);
			chart.unsubscribeCrosshairMove(handlers.move);
			if (dblClickSubscribed && typeof chartWithDbl.unsubscribeDblClick === 'function' && handlers.dblClick) {
				chartWithDbl.unsubscribeDblClick(handlers.dblClick);
			}
		},
	};
}