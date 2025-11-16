// Rectangle ESC & DoubleClick interactions test
// Scenarios:
// - Add -> Complete
// - DoubleClick (enter editing)
// - ESC to cancel editing and revert to completed
// - Assert final state and anchors unchanged

function generateData() {
	const res = [];
	const time = new Date(Date.UTC(2018, 0, 1, 0, 0, 0, 0));
	for (let i = 0; i < 300; ++i) {
		res.push({
			time: time.getTime() / 1000,
			value: 100 + Math.sin(i / 10) * 10,
		});
		time.setUTCDate(time.getUTCDate() + 1);
	}
	return res;
}

// We use deterministic pane coordinates (600x600 viewport).
// DoubleClick action targets pane center; Rectangle primitive consumes dblclick when completed.
function initialInteractionsToPerform() {
	return [
		{ action: 'clickXY', options: { x: 200, y: 200 } }, // start
		{ action: 'clickXY', options: { x: 360, y: 360 } }, // end -> completed
		{ action: 'doubleClick', target: 'pane' }, // enter editing
	];
}

function finalInteractionsToPerform() {
	// No more pointer actions needed; ESC is dispatched in afterInitialInteractions hook.
	return [];
}

let chart;
let series;
let rect;
let snapOnComplete = null;

function beforeInteractions(container) {
	chart = LightweightCharts.createChart(container);
	series = chart.addSeries(LightweightCharts.LineSeries);
	series.setData(generateData());

	// Enable feature flags in standalone bundle (flags-on build exposes API).
	if (typeof LightweightCharts.setFeatureFlags === 'function') {
		LightweightCharts.setFeatureFlags({
			drawingTools: true,
			'drawingTools.rectangle': true,
		});
	} else {
		// Fallback global override for dev
		window.__LWC_FEATURES = { drawingTools: true, rectangle: true };
	}

	// Create and attach rectangle primitive
	rect = new LightweightCharts.RectangleDrawingPrimitive();
	series.attachPrimitive(rect);

	// Wait a frame to ensure chart is ready
	return new Promise(resolve => requestAnimationFrame(resolve));
}

function afterInitialInteractions() {
	return new Promise(resolve => {
		requestAnimationFrame(() => {
			setTimeout(() => {
				// At this point, rectangle should be in 'editing' due to doubleClick
				const st = (typeof rect.getState === 'function') ? rect.getState() : 'unknown';
				if (st !== 'editing') {
					throw new Error(`Expected state 'editing' after doubleClick, got '${st}'.`);
				}
				// Record anchors snapshot at completed (before editing started)
				// If doubleClick happened, anchors should still be the same (editing mode active).
				const s = rect.toJSON();
				if (!s || !s.anchors || !s.anchors.start || !s.anchors.end) {
					throw new Error('Expected anchors after initial interactions.');
				}
				snapOnComplete = s;

				// Dispatch ESC key to cancel editing and revert to completed
				const ev = new KeyboardEvent('keydown', { key: 'Escape' });
				window.dispatchEvent(ev);

				// Validate state reverted to completed and anchors unchanged
				const st2 = rect.getState();
				if (st2 !== 'completed') {
					throw new Error(`Expected state 'completed' after ESC, got '${st2}'.`);
				}
				const s2 = rect.toJSON();
				if (JSON.stringify(s2.anchors) !== JSON.stringify(snapOnComplete.anchors)) {
					throw new Error('Expected anchors unchanged after ESC cancel.');
				}
				resolve();
			}, 120);
		});
	});
}

function afterFinalInteractions() {
	// No-op; page runner asserts no errors
	return Promise.resolve();
}
