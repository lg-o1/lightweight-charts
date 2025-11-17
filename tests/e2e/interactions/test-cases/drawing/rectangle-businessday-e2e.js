// Rectangle Drawing Tool E2E with BusinessDay data
// Validates Add → Complete → Edit (body/handle) → Undo/Redo → Delete
// using series data expressed as BusinessDay objects to exercise time mapping.

function generateBusinessDayData() {
	const res = [];
	let year = 2021;
	let month = 1;
	let day = 4; // Monday
	for (let i = 0; i < 120; ++i) {
		res.push({ time: { year, month, day }, value: 100 + i });
		// advance day; keep it simple (not skipping weekends for the purpose of time mapping)
		day += 1;
		if (day > 28) { day = 1; month += 1; if (month > 12) { month = 1; year += 1; } }
	}
	return res;
}

// Deterministic clicks within 600x600 viewport used by runner
function initialInteractionsToPerform() {
	return [
		// anchor 1
		{ action: 'clickXY', target: 'pane', options: { x: 180, y: 180 } },
		// anchor 2 (complete)
		{ action: 'clickXY', target: 'pane', options: { x: 360, y: 340 } },
		// enter body editing
		{ action: 'clickXY', target: 'pane', options: { x: 260, y: 260 } },
		// move pointer (edit body)
		{ action: 'moveMouseBottomRight', target: 'pane' },
		// finalize body edit
		{ action: 'outsideClick', target: 'pane' },
	];
}

function finalInteractionsToPerform() {
	return [
		// hit a handle and move
		{ action: 'clickXY', target: 'pane', options: { x: 180, y: 180 } },
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
	series.setData(generateBusinessDayData());

	// enable drawing tool flags
	if (typeof LightweightCharts.setFeatureFlags === 'function') {
		LightweightCharts.setFeatureFlags({ drawingTools: true, 'drawingTools.rectangle': true });
	} else {
		window.__LWC_FEATURES = { drawingTools: true, rectangle: true };
	}

	rect = new LightweightCharts.RectangleDrawingPrimitive();
	series.attachPrimitive(rect);

	return new Promise(resolve => requestAnimationFrame(resolve));
}

function afterInitialInteractions() {
	return new Promise((resolve, reject) => {
		requestAnimationFrame(() => {
			setTimeout(() => {
				try {
					if (!rect) { throw new Error('rectangle not created'); }
					const st = rect.getState?.() || 'unknown';
					if (st !== 'completed') { throw new Error(`expected completed after initial, got ${st}`); }
					const snap = rect.toJSON();
					if (!snap || !snap.anchors || !snap.anchors.start || !snap.anchors.end) {
						throw new Error('expected anchors snapshot after initial interactions');
					}
					// ensure times exist (BusinessDay data should map through timeScale)
					if (snap.anchors.start.time == null || snap.anchors.end.time == null) {
						throw new Error('expected non-null times on anchors');
					}
					snapAfterCreate = snap;
					resolve();
				} catch (e) {
					reject(e instanceof Error ? e : new Error(String(e)));
				}
			}, 300);
		});
	});
}

function afterFinalInteractions() {
	try {
		const s2 = rect.toJSON();
		if (!s2 || !s2.anchors || !s2.anchors.start || !s2.anchors.end) {
			console.error('expected anchors after final interactions');
			return;
		}
		const changed = JSON.stringify(s2.anchors) !== JSON.stringify(snapAfterCreate.anchors);
		if (!changed) { console.error('anchors did not change after edits'); }

		if (typeof rect.undo !== 'function' || !rect.undo()) {
			console.error('undo failed or not available');
		}
		const afterUndo = rect.toJSON();
		if (JSON.stringify(afterUndo.anchors) === JSON.stringify(s2.anchors)) {
			console.error('anchors unchanged after undo');
		}
		if (typeof rect.redo !== 'function' || !rect.redo()) {
			console.error('redo failed or not available');
		}
		const afterRedo = rect.toJSON();
		if (JSON.stringify(afterRedo.anchors) !== JSON.stringify(s2.anchors)) {
			console.error('anchors mismatch after redo');
		}

		try { chart.timeScale().fitContent(); } catch (e) { console.error('fitContent threw', e); }

		if (typeof rect.deleteSelf !== 'function') {
			console.error('deleteSelf() not available');
			return;
		}
		rect.deleteSelf();
		const afterDelete = rect.toJSON();
		if (afterDelete.anchors.start !== null || afterDelete.anchors.end !== null) {
			console.error('expected anchors null after delete');
		}
	} catch (e) {
		console.error('afterFinalInteractions error', e);
	}
}
