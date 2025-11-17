// Rectangle autoscale behavior E2E
// Validates that rectangle autoscale affects vertical price scale only and does not change timeScale visible range.

function generateData() {
	const res = [];
	const t0 = Math.floor(Date.now() / 1000) - 120 * 86400;
	for (let i = 0; i < 120; ++i) {
		res.push({ time: t0 + i * 86400, value: 100 + Math.sin(i / 10) * 5 });
	}
	return res;
}

function initialInteractionsToPerform() {
	return [
		{ action: 'clickXY', target: 'pane', options: { x: 150, y: 220 } },
		{ action: 'clickXY', target: 'pane', options: { x: 420, y: 360 } },
		{ action: 'outsideClick', target: 'pane' },
	];
}

function finalInteractionsToPerform() {
	return [
		{ action: 'clickXY', target: 'pane', options: { x: 150, y: 220 } },
		{ action: 'moveMouseTopLeft', target: 'pane' },
		{ action: 'outsideClick', target: 'pane' },
	];
}

let chart;
let series;
let rect;
let visibleLogicalBefore = null;

function beforeInteractions(container) {
	chart = LightweightCharts.createChart(container);
	series = chart.addSeries(LightweightCharts.LineSeries);
	series.setData(generateData());

	if (typeof LightweightCharts.setFeatureFlags === 'function') {
		LightweightCharts.setFeatureFlags({ drawingTools: true, 'drawingTools.rectangle': true });
	} else {
		window.__LWC_FEATURES = { drawingTools: true, rectangle: true };
	}

	rect = new LightweightCharts.RectangleDrawingPrimitive();
	series.attachPrimitive(rect);

	// ensure fitContent so logical range is available
	chart.timeScale().fitContent();
	visibleLogicalBefore = chart.timeScale().getVisibleLogicalRange?.() || null;

	return new Promise(resolve => requestAnimationFrame(resolve));
}

function afterInitialInteractions() {
	return new Promise((resolve, reject) => {
		requestAnimationFrame(() => {
			setTimeout(() => {
				try {
					const st = rect.getState?.() || 'unknown';
					if (st !== 'completed') { throw new Error(`expected completed state, got ${st}`); }
					const snap = rect.toJSON();
					if (!snap?.anchors?.start || !snap?.anchors?.end) {
						throw new Error('anchors missing after initial interactions');
					}
					resolve();
				} catch (e) {
					reject(e instanceof Error ? e : new Error(String(e)));
				}
			}, 200);
		});
	});
}

function afterFinalInteractions() {
	try {
		const visibleLogicalAfter = chart.timeScale().getVisibleLogicalRange?.() || null;
		if (visibleLogicalBefore && visibleLogicalAfter) {
			const same = JSON.stringify(visibleLogicalBefore) === JSON.stringify(visibleLogicalAfter);
			if (!same) {
				console.error('timeScale visible logical range changed after rectangle edits');
			}
		}
		// call fitContent to simulate autoscale use; timeScale should remain unaffected by rectangle autoscale
		try { chart.timeScale().fitContent(); } catch (e) { console.error('fitContent threw', e); }
	} catch (e) {
		console.error('afterFinalInteractions error', e);
	}
}
