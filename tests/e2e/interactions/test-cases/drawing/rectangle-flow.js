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
		{ action: 'clickXY', target: 'pane', options: { x: 200, y: 200 } },
		// 2) Second anchor to complete (bottom-right quadrant)
		{ action: 'clickXY', target: 'pane', options: { x: 350, y: 350 } },
		// 3) Enter body editing (click inside rectangle)
		{ action: 'clickXY', target: 'pane', options: { x: 300, y: 300 } },
		// 4) Move pointer to resize/move body using crosshair move events (no mouse-down required)
		{ action: 'moveMouseBottomRight', target: 'pane' },
		// 5) Click outside to finalize editing (outside pane)
		{ action: 'outsideClick', target: 'pane' },
	];
}

// Final interactions: hit a corner handle then move pointer, finalize with outside click
function finalInteractionsToPerform() {
	return [
		// Try to hit top-left handle region
		{ action: 'clickXY', target: 'pane', options: { x: 200, y: 200 } },
		{ action: 'moveMouseTopLeft', target: 'pane' },
		{ action: 'outsideClick', target: 'pane' },
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
	return new Promise((resolve, reject) => {
		requestAnimationFrame(() => {
			setTimeout(() => {
				try {
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
				} catch (e) {
					reject(e instanceof Error ? e : new Error(String(e)));
				}
			}, 500);
		});
	});
}

function afterFinalInteractions() {
	try {
		// Validate that after handle/body edit, anchors changed
		const s2 = rect.toJSON();
		if (!s2 || !s2.anchors || !s2.anchors.start || !s2.anchors.end) {
			console.error('Expected anchors after editing interactions.');
			return;
		}
		const changed = JSON.stringify(s2.anchors) !== JSON.stringify(snapAfterCreate.anchors);
		if (!changed) {
			console.error('Expected anchors to change after editing interactions.');
			return;
		}
		// Undo/Redo checks
		if (typeof rect.undo !== 'function' || !rect.undo()) {
			console.error('Expected undo() to succeed.');
		}
		const afterUndo = rect.toJSON();
		if (JSON.stringify(afterUndo.anchors) === JSON.stringify(s2.anchors)) {
			console.error('Expected anchors to change after undo.');
		}
		if (typeof rect.redo !== 'function' || !rect.redo()) {
			console.error('Expected redo() to succeed.');
		}
		const afterRedo = rect.toJSON();
		if (JSON.stringify(afterRedo.anchors) !== JSON.stringify(s2.anchors)) {
			console.error('Expected anchors to match after redo.');
		}
		// Autoscale smoke
		try { chart.timeScale().fitContent(); } catch (e) { console.error('fitContent threw', e); }
		// Delete rectangle and verify anchors cleared
		if (typeof rect.deleteSelf !== 'function') {
			console.error('deleteSelf() is not available on rectangle.');
			return;
		}
		rect.deleteSelf();
		const afterDelete = rect.toJSON();
		if (afterDelete.anchors.start !== null || afterDelete.anchors.end !== null) {
			console.error('Expected anchors to be null after delete.');
		}
	} catch (e) {
		console.error('afterFinalInteractions error', e);
	}
}
