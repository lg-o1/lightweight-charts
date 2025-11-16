// Rectangle Drawing Tool performance baseline (200 instances + drag bursts)
// Goals:
// - Create 200 RectangleDrawingPrimitive instances
// - Perform repeated pane drags to stress crosshair/move pipeline
// - Wait ~5s to simulate sustained interaction window
// - Ensure no page errors are thrown

function generateData() {
	const res = [];
	const time = new Date(Date.UTC(2018, 0, 1, 0, 0, 0, 0));
	for (let i = 0; i < 500; ++i) {
		res.push({
			time: time.getTime() / 1000,
			value: 100 + Math.sin(i / 10) * 10,
		});
		time.setUTCDate(time.getUTCDate() + 1);
	}
	return res;
}

function initialInteractionsToPerform() {
	// Perform a series of drags on the pane to exercise crosshair/pointer/move paths.
	// We intentionally chain many short bursts to simulate drag activity without changing anchors.
	const iters = 20; // 20 H + 20 V = 40 bursts
	/** @type {Array<{action: string, target?: string}>} */
	const actions = [{ action: 'click', target: 'pane' }];

	for (let i = 0; i < iters; i++) {
		actions.push({ action: 'horizontalDrag', target: 'pane' });
		actions.push({ action: 'verticalDrag', target: 'pane' });
	}

	return actions;
}

function finalInteractionsToPerform() {
	// No final clicks required; we keep this minimal to avoid extending wall time.
	return [];
}

let chart;
let series;

function beforeInteractions(container) {
	chart = LightweightCharts.createChart(container);
	series = chart.addSeries(LightweightCharts.LineSeries);
	series.setData(generateData());

	// Enable drawing flags (flags-on standalone exposes the API)
	if (typeof LightweightCharts.setFeatureFlags === 'function') {
		LightweightCharts.setFeatureFlags({
			drawingTools: true,
			'drawingTools.rectangle': true,
		});
	} else {
		// Fallback (dev-only) global override if needed locally
		window.__LWC_FEATURES = { drawingTools: true, rectangle: true };
	}

	// Create 200 rectangles (anchored by time/price) and attach
	const now = Math.floor(Date.now() / 1000);
	for (let i = 0; i < 200; i++) {
		const snap = {
			version: 1,
			anchors: {
				start: { time: now + i * 2, price: 90 + (i % 20) },
				end: { time: now + i * 2 + 10, price: 110 + (i % 20) },
			},
			options: {
				fillColor: 'rgba(50,120,200,0.28)',
				previewFillColor: 'rgba(50,120,200,0.18)',
				labelColor: 'rgba(50,120,200,1)',
				labelTextColor: '#ffffff',
				showLabels: (i % 8) === 0, // fewer labels to keep axis readable
			},
		};
		const rect = LightweightCharts.RectangleDrawingPrimitive.fromJSON(snap);
		series.attachPrimitive(rect);
	}

	// Fit content initially
	try {
		chart.timeScale().fitContent();
	} catch {}

	// Ensure the page had a frame to render before we start the interactions
	return new Promise(resolve => requestAnimationFrame(resolve));
}

function afterInitialInteractions() {
	// Allow about 5 seconds of sustained test window. We don't actively drive
	// puppeteer mouse here because perform_interactions.ts executes the bursts already.
	// This delay ensures any async raf-batched updates and garbage collection settle.
	return new Promise(resolve => {
		requestAnimationFrame(() => {
			setTimeout(resolve, 5000);
		});
	});
}

function afterFinalInteractions() {
	// If any console errors occurred, the framework runner will fail this test.
	// No explicit assertion here beyond ensuring the page executes without errors.
	return Promise.resolve();
}