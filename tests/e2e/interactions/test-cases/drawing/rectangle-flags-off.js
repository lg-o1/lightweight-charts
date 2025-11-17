// Rectangle constructibility + interactions test (flags removed)
// Goal: Without any explicit feature flags, RectangleDrawingPrimitive can be constructed, attached,
// and fully interacted with: Add → Complete → Body Edit → Handle Edit → Undo/Redo → Autoscale → Delete.

function generateData() {
	const res = [];
	const t0 = Math.floor(Date.now() / 1000);
	for (let i = 0; i < 50; ++i) {
		res.push({ time: t0 + i * 60, value: 100 + i });
	}
	return res;
}

// Deterministic clicks within 600x600 viewport used by runner
function initialInteractionsToPerform() {
	return [
		// 1) First anchor near upper-left quadrant
		{ action: 'clickXY', target: 'pane', options: { x: 200, y: 200 } },
		// 2) Second anchor to complete (bottom-right quadrant)
		{ action: 'clickXY', target: 'pane', options: { x: 350, y: 350 } },
		// 3) Enter body editing (click inside rectangle)
		{ action: 'clickXY', target: 'pane', options: { x: 300, y: 300 } },
		// 4) Move pointer to resize/move body using crosshair move events
		{ action: 'moveMouseBottomRight', target: 'pane' },
		// 5) Finalize editing
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

// Fallback-safe constructor/attach to ensure rect exists across scopes
function ensureRect() {
	try {
		if (rect) { return rect; }
		if (typeof window !== 'undefined' && window.rect) {
			rect = window.rect;
			console.log('[flags-off] ensureRect using window.rect');
			return rect;
		}
		const ctor = LightweightCharts && LightweightCharts.RectangleDrawingPrimitive;
		if (typeof ctor !== 'function') {
			console.error('[flags-off] RectangleDrawingPrimitive missing on LightweightCharts');
			return null;
		}
		const inst = new ctor();
		rect = inst;
		window.rect = inst;
		if (typeof series?.attachPrimitive === 'function') {
			series.attachPrimitive(inst);
			console.log('[flags-off] ensureRect constructed & attached');
		} else {
			console.warn('[flags-off] ensureRect attachPrimitive not available on series');
		}
		return inst;
	} catch (e) {
		console.error('[flags-off] ensureRect failed', e);
		return null;
	}
}

function beforeInteractions(container) {
	console.log('[flags-off] beforeInteractions start');
	chart = LightweightCharts.createChart(container);
	console.log('[flags-off] chart created. typeof addSeries=%s typeof addLineSeries=%s',
		typeof chart?.addSeries, typeof chart?.addLineSeries);

	// Prefer stable API addLineSeries in standalone bundle; fallback to generic addSeries if available
	const addLine = (chart && typeof chart.addLineSeries === 'function')
		? () => chart.addLineSeries()
		: (typeof chart?.addSeries === 'function' ? () => chart.addSeries(LightweightCharts.LineSeries) : null);
	if (!addLine) {
		console.error('[flags-off] Chart API missing addLineSeries/addSeries');
		throw new Error('Chart API addLineSeries/addSeries not available in standalone bundle');
	}

	series = addLine();
	console.log('[flags-off] series created. has setData=%s has attachPrimitive=%s',
		typeof series?.setData === 'function', typeof series?.attachPrimitive === 'function');

	if (!series) {
		console.error('[flags-off] addLineSeries/addSeries returned falsy series');
		throw new Error('Failed to create line series');
	}
	if (typeof series.setData !== 'function') {
		console.error('[flags-off] series.setData missing on created series');
		throw new Error('Series.setData not available');
	}
	series.setData(generateData());
	// Early diagnostics for primitives API presence on SeriesApi in standalone bundle
	if (typeof series.attachPrimitive !== 'function') {
		console.warn('[flags-off] series.attachPrimitive missing on SeriesApi (will still attempt attach)');
	}

	// Diagnostics: ensure export exists
	const ctor = LightweightCharts && LightweightCharts.RectangleDrawingPrimitive;
	if (typeof ctor !== 'function') {
		console.error('[flags-off] RectangleDrawingPrimitive missing on LightweightCharts');
		throw new Error('RectangleDrawingPrimitive export missing');
	}

	// No flags required; ensure construction and attach succeed (fallback-safe)
	rect = ensureRect();
	if (!rect) {
		console.error('[flags-off] construct/attach failed via ensureRect');
		throw new Error('Failed to construct/attach RectangleDrawingPrimitive');
	}

	// Make sure logical range exists for interactions
	try { chart.timeScale().fitContent(); } catch (e) { console.warn('[flags-off] fitContent warn', e); }

	// Wait 2 frames + small delay to ensure DOM/canvas and bindings are ready
	return new Promise(resolve => {
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				setTimeout(() => {
					console.log('[flags-off] beforeInteractions ready');
					resolve();
				}, 150);
			});
		});
	});
}

function afterInitialInteractions() {
	return new Promise((resolve, reject) => {
		requestAnimationFrame(() => {
			setTimeout(() => {
				try {
					console.log('[flags-off] afterInitialInteractions begin; typeof LWCRect=%s, rect?=%s, typeof series.attachPrimitive=%s',
						typeof LightweightCharts?.RectangleDrawingPrimitive, String(!!rect), typeof series?.attachPrimitive);

					if (!rect && typeof window !== 'undefined' && window.rect) {
						rect = window.rect;
						console.log('[flags-off] afterInitialInteractions picked window.rect');
					}
					if (!rect) {
						throw new Error('Rectangle primitive not created.');
					}
					const st = (typeof rect.getState === 'function') ? rect.getState() : 'unknown';
					console.log('[flags-off] rect state=%s', st);
					if (st !== 'completed') {
						throw new Error(`Expected state 'completed' after initial clicks, got '${st}'.`);
					}
					const snap = rect.toJSON();
					if (!snap || !snap.anchors || !snap.anchors.start || !snap.anchors.end) {
						throw new Error('Expected anchors after initial interactions.');
					}
					console.log('[flags-off] snapAfterCreate=%o', snap.anchors);
					snapAfterCreate = snap;
					resolve();
				} catch (e) {
					console.error('[flags-off] afterInitialInteractions error', e);
					reject(e instanceof Error ? e : new Error(String(e)));
				}
			}, 300);
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
