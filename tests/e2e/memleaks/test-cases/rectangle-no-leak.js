// Rectangle drawing tool memleaks scenario (no leak expected)
// - Setup: load library.js, enable flags, create chart+series
// - Action: attach/detach Rectangle primitives in a loop (20x)
// - Back: remove chart/container to allow GC; no leaks expected

/** @type {import('@memlab/core/dist/lib/Types').IScenario} */
export const scenario = {
	setup: async function(page) {
		// Load standalone bundle as window.LightweightCharts
		await page.addScriptTag({ url: 'library.js' });

		// Prepare chart + series
		await page.evaluate(() => {
			// Ensure flags-on build exposes feature flag controls
			if (typeof window.LightweightCharts.setFeatureFlags === 'function') {
				window.LightweightCharts.setFeatureFlags({
					drawingTools: true,
					'drawingTools.rectangle': true,
				});
			} else {
				// Fallback global override (dev only)
				window.__LWC_FEATURES = { drawingTools: true, rectangle: true };
			}

			const container = document.getElementById('container');
			const chart = window.LightweightCharts.createChart(container);
			const series = chart.addSeries(window.LightweightCharts.LineSeries);
			series.setData([
				{ time: 0, value: 100 },
				{ time: 1, value: 101 },
				{ time: 2, value: 102 },
				{ time: 3, value: 103 },
				{ time: 4, value: 104 },
			]);

			// Store on window for later action/back phases
			window.__mem_chart = chart;
			window.__mem_series = series;
		});
	},

	action: async function(page) {
		// Attach/detach rectangles in a loop to exercise lifecycle without leaks
		await page.evaluate(() => {
			const series = window.__mem_series;
			if (!series) throw new Error('Series not found in action phase');

			const now = Math.floor(Date.now() / 1000);
			const createSnapshot = (i) => ({
				version: 1,
				anchors: {
					start: { time: now + i, price: 100 + i },
					end: { time: now + i + 10, price: 110 + i },
				},
				options: {
					fillColor: 'rgba(100,150,200,0.6)',
					previewFillColor: 'rgba(100,150,200,0.3)',
					labelColor: 'rgba(100,150,200,1.0)',
					labelTextColor: '#ffffff',
					showLabels: true,
				},
			});

			for (let i = 0; i < 20; i++) {
				// Construct with anchors via fromJSON
				const rect = window.LightweightCharts.RectangleDrawingPrimitive.fromJSON(createSnapshot(i));
				// Attach, then detach
				series.attachPrimitive(rect);
				series.detachPrimitive(rect);
			}
		});
	},

	back: async function(page) {
		// Remove chart and container to allow GC to reclaim objects
		await page.evaluate(() => {
			try {
				const chart = window.__mem_chart;
				if (chart && typeof chart.remove === 'function') {
					// If chart offers an API, call it (no-op in LWC)
				}
			} catch {}
			const container = document.getElementById('container');
			if (container && container.parentElement) {
				container.parentElement.removeChild(container);
			}
			// Cleanup globals
			window.__mem_chart = undefined;
			window.__mem_series = undefined;
		});
	},

	// No leaks expected in this scenario
	expectFail: false,
	allowedLeaks: [],
};