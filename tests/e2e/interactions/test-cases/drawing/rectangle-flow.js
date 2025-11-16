// Rectangle Drawing Tool end-to-end interactions test
// Scenarios: Add -> Complete -> Body Edit -> Handle Edit -> Undo/Redo -> Autoscale -> Delete

function generateData() {
	const res = [];
	const time = new Date(Date.UTC(2018, 0, 1, 0, 0, 0, 0));
	for (let i = 0; i < 500; ++i) {
		res.push({
			time: time.getTime() / 1000,
			value: i,
		});

		time.setUTCDate(time.getUTCDate() + 1);
	}
	return res;
}

// We use clickXY for deterministic anchor placement (pane size is 600x600 in runner)
function initialInteractionsToPerform() {
	return [
		// 1) First anchor near upper-left quadrant
		{ action: 'clickXY', options: { x: 200, y: 200 } },
		// 2) Second anchor to complete (bottom-right quadrant)
		{ action: 'clickXY', options: { x: 350, y: 350 } },
		// 3) Enter body editing (click inside rectangle)
		{ action: 'clickXY', options: { x: 300, y: 300 } },
		// 4) Move pointer to resize/move body using crosshair move events (no mouse-down required)
		{ action: 'moveMouseBottomRight' },
		// 5) Click outside to finalize editing
		{ action: 'outsideClick' },
	];
}

// Final interactions: hit a corner handle then move pointer, finalize with outside click
function finalInteractionsToPerform() {
	return [
		// Try to hit top-left handle region
		{ action: 'clickXY', options: { x: 200, y: 200 } },
		{ action: 'moveMouseTopLeft' },
		{ action: 'outsideClick' },
	];
}

let chart;
let series;
let rect;
let snapAfterCreate = null;

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
		// Fallback global override for dev if needed
		window.__LWC_FEATURES = { drawingTools: true, rectangle: true };
	}

	// Create and attach rectangle primitive
	rect = new LightweightCharts.RectangleDrawingPrimitive();
	window.rect = rect; // expose for debug/asserts if needed
	series.attachPrimitive(rect);

	// Wait a frame to ensure chart is ready
	return new Promise(resolve => {
		requestAnimationFrame(() => resolve());
	});
}

function afterInitialInteractions() {
	return new Promise(resolve => {
		requestAnimationFrame(() => {
			setTimeout(() => {
				if (!rect) {
					throw new Error('Rectangle primitive not created.');
				}
				const st = (typeof rect.getState === 'function') ? rect.getState() : 'unknown';
				if (st !== 'completed') {
					throw new Error(`Expected state 'completed' after initial clicks, got '${st}'.`);
				}
				const snap = rect.toJSON();
				if (!snap || !snap.anchors || !snap.anchors.start || !snap.anchors.end) {
					throw new Error('Expected anchors after initial interactions.');
				}
				snapAfterCreate = snap;
				resolve();
			}, 200); // delay to avoid dblclick heuristics
		});
	});
}

function afterFinalInteractions() {
	// Validate that after handle/body edit, anchors changed
	const s2 = rect.toJSON();
	if (!s2 || !s2.anchors || !s2.anchors.start || !s2.anchors.end) {
		throw new Error('Expected anchors after editing interactions.');
	}
	const changed =
		JSON.stringify(s2.anchors) !== JSON.stringify(snapAfterCreate.anchors);
	if (!changed) {
		throw new Error('Expected anchors to change after editing interactions.');
	}

	// Undo
	if (typeof rect.undo !== 'function' || !rect.undo()) {
		throw new Error('Expected undo() to succeed.');
	}
	const afterUndo = rect.toJSON();
	if (JSON.stringify(afterUndo.anchors) === JSON.stringify(s2.anchors)) {
		throw new Error('Expected anchors to change after undo.');
	}

	// Redo
	if (typeof rect.redo !== 'function' || !rect.redo()) {
		throw new Error('Expected redo() to succeed.');
	}
	const afterRedo = rect.toJSON();
	if (JSON.stringify(afterRedo.anchors) !== JSON.stringify(s2.anchors)) {
		throw new Error('Expected anchors to match after redo.');
	}

	// Autoscale smoke (should not throw)
	try {
		chart.timeScale().fitContent();
	} catch (e) {
		throw new Error('chart.timeScale().fitContent() should not throw: ' + e);
	}

	// Delete rectangle and verify anchors cleared
	if (typeof rect.deleteSelf !== 'function') {
		throw new Error('deleteSelf() is not available on rectangle.');
	}
	rect.deleteSelf();
	const afterDelete = rect.toJSON();
	if (afterDelete.anchors.start !== null || afterDelete.anchors.end !== null) {
		throw new Error('Expected anchors to be null after delete.');
	}

	return Promise.resolve();
}