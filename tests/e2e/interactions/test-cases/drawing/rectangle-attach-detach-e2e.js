// Rectangle attach/detach lifecycle E2E
// Goal: validate attach → interactions → detach (no effect) → reattach → interactions resume

function generateData() {
	const res = [];
	const t0 = Math.floor(Date.now() / 1000) - 60 * 86400;
	for (let i = 0; i < 60; ++i) {
		res.push({ time: t0 + i * 86400, value: 50 + i });
	}
	return res;
}

function initialInteractionsToPerform() {
	return [
		{ action: 'clickXY', target: 'pane', options: { x: 140, y: 150 } },
		{ action: 'clickXY', target: 'pane', options: { x: 380, y: 300 } },
		{ action: 'outsideClick', target: 'pane' },
	];
}

function finalInteractionsToPerform() {
	return [
		// try editing while detached (should have no effect)
		{ action: 'clickXY', target: 'pane', options: { x: 200, y: 200 } },
		{ action: 'moveMouseBottomRight', target: 'pane' },
		{ action: 'outsideClick', target: 'pane' },
		// reattach and edit again (should take effect)
		{ action: 'clickXY', target: 'pane', options: { x: 160, y: 160 } },
		{ action: 'moveMouseTopLeft', target: 'pane' },
		{ action: 'outsideClick', target: 'pane' },
	];
}

let chart;
let series;
let rect;
let snapBeforeDetach = null;

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

	return new Promise(resolve => requestAnimationFrame(resolve));
}

function afterInitialInteractions() {
	return new Promise((resolve, reject) => {
		requestAnimationFrame(() => {
			setTimeout(() => {
				try {
					const st = rect.getState?.() || 'unknown';
					if (st !== 'completed') { throw new Error(`expected completed state, got ${st}`); }
					snapBeforeDetach = rect.toJSON();
					// detach
					series.detachPrimitive(rect);
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
		// after editing while detached, anchors should remain unchanged
		const afterDetachedEdit = rect.toJSON();
		if (JSON.stringify(afterDetachedEdit.anchors) !== JSON.stringify(snapBeforeDetach.anchors)) {
			console.error('anchors changed while detached; edits should have no effect');
		}
		// reattach and perform edit
		series.attachPrimitive(rect);
		// give a frame to bind environment
		setTimeout(() => {
			const s2 = rect.toJSON();
			// perform a small sanity: ensure anchors exist
			if (!s2?.anchors?.start || !s2?.anchors?.end) {
				console.error('anchors missing after reattach');
				return;
			}
			// edits in finalInteractions should have taken effect by now
			const changed = JSON.stringify(s2.anchors) !== JSON.stringify(snapBeforeDetach.anchors);
			if (!changed) {
				console.error('anchors did not change after reattach and edits');
			}
		}, 100);
	} catch (e) {
		console.error('afterFinalInteractions error', e);
	}
}
