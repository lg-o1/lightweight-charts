// Wave0 integration: chart init with zero data, then setData and complete rectangle
// Goal: ensure no crash on zero-data, and after data arrives interactions can complete

function generateData() {
	const res = [];
	const t0 = Math.floor(Date.now() / 1000) - 60 * 86400;
	for (let i = 0; i < 60; ++i) {
		res.push({ time: t0 + i * 86400, value: 100 + i });
	}
	return res;
}

function initialInteractionsToPerform() {
	return [
		// with zero data, just a no-op click to ensure stability
		{ action: 'outsideClick', target: 'pane' },
	];
}

function finalInteractionsToPerform() {
	return [
		// after data is set in afterInitialInteractions, perform normal rectangle creation
		{ action: 'clickXY', target: 'pane', options: { x: 180, y: 200 } },
		{ action: 'clickXY', target: 'pane', options: { x: 360, y: 340 } },
		{ action: 'outsideClick', target: 'pane' },
	];
}

let chart;
let series;
let rect;

function beforeInteractions(container) {
	chart = LightweightCharts.createChart(container);
	series = chart.addSeries(LightweightCharts.LineSeries);
	// NOTE: do NOT setData here (zero data scenario)

	// features are always-on, but keep backward compatibility
	if (typeof LightweightCharts.setFeatureFlags === 'function') {
		LightweightCharts.setFeatureFlags({ drawingTools: true, 'drawingTools.rectangle': true });
	}

	rect = new LightweightCharts.RectangleDrawingPrimitive();
	series.attachPrimitive(rect);

	return new Promise(resolve => requestAnimationFrame(resolve));
}

function afterInitialInteractions() {
	return new Promise((resolve, reject) => {
		requestAnimationFrame(() => {
			try {
				series.setData(generateData());
				// give a couple of frames to build scales
				setTimeout(resolve, 150);
			} catch (e) {
				reject(e instanceof Error ? e : new Error(String(e)));
			}
		});
	});
}

function afterFinalInteractions() {
	try {
		const st = rect.getState?.() || 'unknown';
		if (st !== 'completed') {
			console.error(`expected completed after final, got ${st}`);
		}
		const snap = rect.toJSON?.();
		if (!snap?.anchors?.start || !snap?.anchors?.end) {
			console.error('expected anchors snapshot after final interactions');
		}
	} catch (e) {
		console.error('afterFinalInteractions error', e);
	}
}
