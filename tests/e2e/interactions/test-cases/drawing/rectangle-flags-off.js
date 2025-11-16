// Rectangle flags-off behavior test
// Goal: With drawingTools turned off, constructing RectangleDrawingPrimitive should fail.
// The test throws if construction DOES NOT fail (i.e., flags guard broken).

function generateData() {
	const res = [];
	const t0 = Math.floor(Date.now() / 1000);
	for (let i = 0; i < 50; ++i) {
		res.push({ time: t0 + i * 60, value: 100 + i });
	}
	return res;
}

function initialInteractionsToPerform() {
	// No pointer interactions required; everything is done via afterInitialInteractions.
	return [];
}

function finalInteractionsToPerform() {
	return [];
}

let chart;
let series;

function beforeInteractions(container) {
	chart = LightweightCharts.createChart(container);
	series = chart.addSeries(LightweightCharts.LineSeries);
	series.setData(generateData());

	// Ensure flags are OFF explicitly
	if (typeof LightweightCharts.setFeatureFlags === 'function') {
		LightweightCharts.setFeatureFlags({
			drawingTools: false,
			'drawingTools.rectangle': false,
		});
	} else {
		// Fallback global override for dev-only
		window.__LWC_FEATURES = { drawingTools: false, rectangle: false };
	}

	// Wait a frame to ensure chart is ready
	return new Promise(resolve => requestAnimationFrame(resolve));
}

function afterInitialInteractions() {
	return new Promise(resolve => {
		requestAnimationFrame(() => {
			setTimeout(() => {
				let failedAsExpected = false;
				try {
					// Attempt to construct rectangle with flags-off should throw due to ensureFeatureFlagEnabled
					const rect = new LightweightCharts.RectangleDrawingPrimitive();
					// Mark usage to satisfy lint even if guard fails (rect exists)
					void rect;
					// If we reached here, guard failed
					failedAsExpected = false;
				} catch (e) {
					failedAsExpected = true;
				}

				if (!failedAsExpected) {
					throw new Error('RectangleDrawingPrimitive should NOT be constructible when flags are off.');
				}
				resolve();
			}, 100);
		});
	});
}

function afterFinalInteractions() {
	// No-op; page runner asserts no errors
	return Promise.resolve();
}
