// 02 — Candles + Volume (UTCTimestamp) demo module

import {
  LWC,
  setupGlobalErrorLogging,
  mklog,
  clearLog,
  makeContainer,
  ensureResize,
  createChart,
  addCandlesSeries,
  addHistogramSeries,
  generateCandleDataUTC,
  createToolbar,
  logVersionAndFlags,
} from './shared.js';

const elog = setupGlobalErrorLogging('#log');
const log = mklog('DEMO-02','#log');

clearLog('#log');
logVersionAndFlags(log);

const container = makeContainer('#chart',{ width: 960, height: 520 });
const chart = createChart(container, {
  rightPriceScale: { borderVisible: true },
  leftPriceScale: { visible: true, borderVisible: true, mode: 0 },
  timeScale: { rightOffset: 2, borderVisible: true, fixLeftEdge: true, fixRightEdge: false },
  crosshair: { mode: 0 },
  grid: { vertLines: { color: '#eee' }, horzLines: { color: '#eee' } },
});
const disposeResize = ensureResize(chart, container);

const candles = addCandlesSeries(chart, { priceScaleId: 'right' });
const volume = addHistogramSeries(chart, { priceScaleId: 'left' });

const candleData = generateCandleDataUTC(300, { start: 1700000000, stepSec: 60, base: 100 });
candles.setData(candleData);

// derive volume from candle range
function buildVolumeFromCandles(candlesArr) {
  const vol = [];
  for (const c of candlesArr) {
    const range = Math.max(0, c.high - c.low);
    const base = Math.max(100, Math.round(range * 1000));
    const noise = Math.round(Math.random() * base * 0.2);
    vol.push({ time: c.time, value: base + noise, color: c.close >= c.open ? '#26a69a' : '#ef5350' });
  }
  return vol;
}
const volumeData = buildVolumeFromCandles(candleData);
volume.setData(volumeData);
log('setData(candles,len)', candleData.length);
log('setData(volume,len)', volumeData.length);

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
    text: 'Autoscale (Both Price Scales)',
    title: 'priceScale.fitContent on both series',
    onClick: () => {
      try { candles.priceScale().fitContent(); } catch(e){ log('error','candles.fitContent',e); }
      try { volume.priceScale().fitContent(); } catch(e){ log('error','volume.fitContent',e); }
      log('action','priceScale.fitContent both');
      logAfterAutoscale();
      logVisible();
    }
  },
  {
    text: 'Append 5 Bars',
    title: 'Append random bars to both series',
    onClick: () => {
      const last = candleData[candleData.length - 1];
      for (let i = 0; i < 5; i++) {
        const t = last.time + (i + 1) * 60;
        const prevClose = candleData[candleData.length - 1].close;
        const open = prevClose + (Math.random() - 0.5) * 3;
        const close = open + (Math.random() - 0.5) * 5;
        const high = Math.max(open, close) + Math.random() * 2;
        const low = Math.min(open, close) - Math.random() * 2;
        const bar = { time: t, open: +open.toFixed(2), high: +high.toFixed(2), low: +low.toFixed(2), close: +close.toFixed(2) };
        candleData.push(bar);
      }
      candles.setData(candleData);
      const volAppend = buildVolumeFromCandles(candleData.slice(-5));
      for (const v of volAppend) volumeData.push(v);
      volume.setData(volumeData);
      chart.timeScale().scrollToRealTime();
      log('action','append 5 bars');
      logVisible();
      logAfterAutoscale();
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
  const sd = p.seriesData?.get(candles);
  log('crosshairMove', 'time', p.time, 'candle', sd, 'point', c);
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
logAfterAutoscale();
log('version', LWC.version());