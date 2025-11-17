// 03 — Basic Line (BusinessDay) demo module

import {
  LWC,
  setupGlobalErrorLogging,
  mklog,
  clearLog,
  makeContainer,
  ensureResize,
  createChart,
  addLineSeries,
  generateLineDataBusinessDay,
  createToolbar,
  logVersionAndFlags,
} from './shared.js';

const elog = setupGlobalErrorLogging('#log');
const log = mklog('DEMO-03','#log');

clearLog('#log');
logVersionAndFlags(log);

const container = makeContainer('#chart',{ width: 960, height: 480 });
const chart = createChart(container, {
  rightPriceScale: { borderVisible: true },
  timeScale: { rightOffset: 2, borderVisible: true, fixLeftEdge: true, fixRightEdge: false },
  crosshair: { mode: 0 },
  grid: { vertLines: { color: '#eee' }, horzLines: { color: '#eee' } },
});
const disposeResize = ensureResize(chart, container);

const line = addLineSeries(chart, { color: '#0B84F3', lineWidth: 2, priceScaleId: 'right' });
const data = generateLineDataBusinessDay(250, { start: { year: 2023, month: 1, day: 3 }, base: 100 });
line.setData(data);
log('setData(BusinessDay,len)', data.length);

function fmtBD(t){
  if (!t) return '-';
  if (typeof t === 'string' || typeof t === 'number') return String(t);
  return `${t.year}-${String(t.month).padStart(2,'0')}-${String(t.day).padStart(2,'0')}`;
}

function logVisible() {
  const vr = chart.timeScale().getVisibleRange();
  const vl = chart.timeScale().getVisibleLogicalRange();
  log('visibleRange (BusinessDay)', vr);
  log('visibleLogicalRange', vl);
}

function logAfterAutoscale() {
  const vl = chart.timeScale().getVisibleLogicalRange();
  log('after priceScale.fitContent', { logical: vl });
}

// Toolbar
createToolbar('#toolbar', [
  {
    text: 'Fit Content (Time)',
    onClick: () => {
      chart.timeScale().fitContent();
      log('action','fitContent');
      logVisible();
    }
  },
  {
    text: 'Autoscale (Vertical)',
    onClick: () => {
      try { line.priceScale().fitContent(); } catch(e){ log('error','priceScale.fitContent', e); }
      log('action','priceScale.fitContent');
      logAfterAutoscale();
      logVisible();
    }
  },
  {
    text: 'Scroll To Right',
    onClick: () => {
      chart.timeScale().scrollToRealTime();
      log('action','scrollToRealTime');
      logVisible();
    }
  },
  {
    text: 'Append 5 Days',
    onClick: () => {
      // Append next 5 business days with random values
      const last = data[data.length - 1];
      let d = last.time;
      for (let i = 0; i < 5; i++) {
        // simplistic business-day increment (use generator internal for correctness)
        const dt = new Date(Date.UTC(d.year, d.month - 1, d.day));
        dt.setUTCDate(dt.getUTCDate() + 1);
        const wd = dt.getUTCDay();
        if (wd === 0) dt.setUTCDate(dt.getUTCDate() + 1);
        if (wd === 6) dt.setUTCDate(dt.getUTCDate() + 2);
        d = { year: dt.getUTCFullYear(), month: dt.getUTCMonth() + 1, day: dt.getUTCDate() };
        const prev = data[data.length - 1].value;
        const value = Math.max(0, (prev + (Math.random() - 0.5) * 3));
        data.push({ time: d, value: Number(value.toFixed(2)) });
      }
      line.setData(data);
      chart.timeScale().scrollToRealTime();
      log('action','append 5 business days');
      logVisible();
    }
  },
  {
    text: 'Clear Log',
    onClick: () => clearLog('#log')
  },
]);

// Crosshair logging with BusinessDay formatting
const elTime = document.getElementById('kv-time');
const elPrice = document.getElementById('kv-price');
const elPoint = document.getElementById('kv-point');

chart.subscribeCrosshairMove((p) => {
  const c = p.point ? { x: p.point.x, y: p.point.y } : null;
  const sd = p.seriesData?.get(line);
  elTime.textContent = fmtBD(p.time);
  elPrice.textContent = sd && typeof sd.value === 'number' ? sd.value.toFixed(2) : '-';
  elPoint.textContent = c ? `${c.x},${c.y}` : '-';
  log('crosshairMove', 'time', fmtBD(p.time), 'price', elPrice.textContent, 'point', c);
});

chart.subscribeClick((p) => {
  const c = p.point ? { x: p.point.x, y: p.point.y } : null;
  log('click', 'time', fmtBD(p.time), 'point', c);
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  disposeResize();
  chart.remove();
});

// Initial
chart.timeScale().fitContent();
logVisible();
log('version', LWC.version());