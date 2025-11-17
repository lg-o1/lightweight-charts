// 01 — Basic Line (UTCTimestamp) demo module

import {
  LWC,
  setupGlobalErrorLogging,
  mklog,
  clearLog,
  makeContainer,
  ensureResize,
  createChart,
  addLineSeries,
  generateLineDataUTC,
  createToolbar,
  logVersionAndFlags,
} from './shared.js';

const elog = setupGlobalErrorLogging('#log');
const log = mklog('DEMO-01','#log');

clearLog('#log');
logVersionAndFlags(log);

const container = makeContainer('#chart',{ width: 960, height: 480 });
const chart = createChart(container, {
  rightPriceScale: { borderVisible: true },
  timeScale: { rightOffset: 2, fixLeftEdge: true, fixRightEdge: false, borderVisible: true },
  crosshair: { mode: 0 },
});
const disposeResize = ensureResize(chart, container);

const line = addLineSeries(chart, { color: '#2962FF', lineWidth: 2, priceScaleId: 'right' });
const data = generateLineDataUTC(300, { start: 1700000000, stepSec: 60, base: 100 });
line.setData(data);
log('setData(len)', data.length);

function logVisible() {
  const vr = chart.timeScale().getVisibleRange();
  const vl = chart.timeScale().getVisibleLogicalRange();
  log('visibleRange', vr);
  log('visibleLogicalRange', vl);
}

function logAfterAutoscale() {
  const vl = chart.timeScale().getVisibleLogicalRange();
  log('after priceScale.fitContent', { logical: vl });
}

// Toolbar actions
createToolbar('#toolbar', [
  {
    text: 'Fit Content (Time)',
    title: 'chart.timeScale().fitContent()',
    onClick: () => {
      chart.timeScale().fitContent();
      log('action', 'timeScale.fitContent');
      logVisible();
    }
  },
  {
    text: 'Autoscale (Vertical)',
    title: 'Series price scale fitContent',
    onClick: () => {
      try {
        line.priceScale().fitContent();
      } catch (e) {
        log('error', 'priceScale.fitContent failed', e);
      }
      log('action', 'priceScale.fitContent');
      logAfterAutoscale();
      logVisible();
    }
  },
  {
    text: 'Scroll Right',
    title: 'timeScale.scrollToRealTime',
    onClick: () => {
      chart.timeScale().scrollToRealTime();
      log('action', 'timeScale.scrollToRealTime');
      logVisible();
    }
  },
  {
    text: 'Random Update',
    title: 'Mutate last N points and refresh',
    onClick: () => {
      const n = 5;
      const last = data[data.length - 1];
      for (let i = 0; i < n; i++) {
        const t = last.time + (i + 1) * 60;
        const value = Math.max(0, (last.value + (Math.random() - 0.5) * 5)).toFixed(2);
        data.push({ time: t, value: Number(value) });
      }
      line.setData(data);
      chart.timeScale().scrollToRealTime();
      log('action', 'append', n, 'points');
      logVisible();
    }
  },
  {
    text: 'Clear Log',
    title: 'Clear demo log output',
    onClick: () => clearLog('#log')
  },
]);

chart.subscribeCrosshairMove((p) => {
  const c = p.point ? { x: p.point.x, y: p.point.y } : null;
  log('crosshairMove', 'time', p.time, 'price', p.seriesData?.get(line)?.value, 'point', c);
});

chart.subscribeClick((p) => {
  const c = p.point ? { x: p.point.x, y: p.point.y } : null;
  log('click', 'time', p.time, 'point', c);
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  disposeResize();
  chart.remove();
});

// Initial view
chart.timeScale().fitContent();
logVisible();
log('version', LWC.version());