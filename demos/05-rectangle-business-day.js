// 05 — Rectangle Interactions (BusinessDay) demo module

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
  RectangleDrawingPrimitive,
  logRectangleAutoscale,
} from './shared.js';

// Logging and flags
const elog = setupGlobalErrorLogging('#log');
const log = mklog('DEMO-05','#log');
clearLog('#log');
logVersionAndFlags(log);

// Always-On: drawing tools are enabled by default

// Chart and data
const container = makeContainer('#chart',{ width: 960, height: 520 });
const chart = createChart(container, {
  rightPriceScale: { borderVisible: true },
  timeScale: { rightOffset: 2, borderVisible: true, fixLeftEdge: true, fixRightEdge: false },
  crosshair: { mode: 0 },
  grid: { vertLines: { color: '#eee' }, horzLines: { color: '#eee' } },
});
const disposeResize = ensureResize(chart, container);

const series = addLineSeries(chart, { color: '#0B84F3', lineWidth: 2, priceScaleId: 'right' });
const data = generateLineDataBusinessDay(320, { start: { year: 2023, month: 1, day: 3 }, base: 100 });
series.setData(data);

chart.timeScale().fitContent();

// Rectangle state
const rectangles = [];
let activeIndex = -1;
let adding = false;
let lastSnapshot = null;

function activeRect() {
  return activeIndex >= 0 ? rectangles[activeIndex] : null;
}

function setActiveByIndex(idx) {
  if (idx >= 0 && idx < rectangles.length) {
    activeIndex = idx;
    log('activeRect#', activeIndex);
  }
}

function setActiveByHit(ev) {
  for (let i = rectangles.length - 1; i >= 0; i--) {
    const r = rectangles[i];
    try {
      const ht = r.performHitTest(ev);
      if (ht) {
        activeIndex = i;
        log('hit', ht.externalId, 'cursor', ht.cursor, 'z', ht.zOrder, 'rect#', i);
        return r;
      }
    } catch {}
  }
  return null;
}

function fmtBD(t){
  if (!t) return '-';
  if (typeof t === 'string' || typeof t === 'number') return String(t);
  return `${t.year}-${String(t.month).padStart(2,'0')}-${String(t.day).padStart(2,'0')}`;
}

function evFrom(param) {
  if (!param || !param.point || param.point.x == null || param.point.y == null) return null;
  const x = param.point.x, y = param.point.y;
  // Convert pixel to BusinessDay time and price
  const time = chart.timeScale().coordinateToTime(x);
  if (!time) return null;
  const price = series.coordinateToPrice(y);
  if (price == null) return null;
  return { time, price, point: { x, y } };
}

function startAdd() {
  const rect = new RectangleDrawingPrimitive();
  rectangles.push(rect);
  activeIndex = rectangles.length - 1;
  series.attachPrimitive(rect);
  adding = true;
  log('startAdd', 'rect#', activeIndex);
}

function stopAdd() {
  adding = false;
  log('stopAdd');
}

function deleteActive() {
  const r = activeRect(); if (!r) return;
  try { r.deleteSelf(); log('deleteSelf()', 'rect#', activeIndex); } catch (e) { log('error', 'deleteSelf', e); }
}

function undoActive() {
  const r = activeRect(); if (!r) return;
  log('undo()', r.undo());
}

function redoActive() {
  const r = activeRect(); if (!r) return;
  log('redo()', r.redo());
}

function autoscaleRect() {
  const r = activeRect(); if (!r) return;
  const info = logRectangleAutoscale(chart, r, log);
  try { series.priceScale().fitContent(); } catch (e) { log('error','fitContent',e); }
  log('autoscale applied to price scale (vertical-only), info:', info);
}

// Toolbar
createToolbar('#toolbar', [
  { text: 'Add Rectangle', onClick: () => startAdd() },
  { text: 'Stop Add', onClick: () => stopAdd() },
  { text: 'Undo', onClick: () => undoActive() },
  { text: 'Redo', onClick: () => redoActive() },
  { text: 'Delete', onClick: () => deleteActive() },
  { text: 'Autoscale (Vertical)', onClick: () => autoscaleRect() },
  { text: 'Fit Content (Time)', onClick: () => { chart.timeScale().fitContent(); log('timeScale.fitContent'); } },
  {
    text: 'Toggle Labels',
    onClick: () => {
      const r = activeRect(); if (!r) return;
      const show = !(r.getOptions ? r.getOptions().showLabels : true);
      if (r.applyOptions) r.applyOptions({ showLabels: show });
      log('applyOptions',{ showLabels: show });
    }
  },
  { text: 'Snapshot ⭘', onClick: () => { const r = activeRect(); if (!r) return; lastSnapshot = r.toJSON(); log('snapshot', lastSnapshot); } },
  {
    text: 'Restore ⟲',
    onClick: () => {
      if (!lastSnapshot) return;
      const restored = RectangleDrawingPrimitive.fromJSON(lastSnapshot);
      series.attachPrimitive(restored);
      rectangles.push(restored);
      activeIndex = rectangles.length - 1;
      log('restored from snapshot -> rect#', activeIndex);
    }
  },
  { text: 'Prev', onClick: () => setActiveByIndex(Math.max(0, activeIndex - 1)) },
  { text: 'Next', onClick: () => setActiveByIndex(Math.min(rectangles.length - 1, activeIndex + 1)) },
  { text: 'Clear Log', onClick: () => clearLog('#log') },
]);

// Pointer wiring
chart.subscribeClick((param) => {
  const ev = evFrom(param);
  if (!ev) { log('click(no-ev)', fmtBD(param.time)); return; }

  if (adding) {
    const r = activeRect(); if (!r) return;
    try {
      r.handlePointerClick(ev);
      log('add.click', 'state=', r.getState && r.getState());
      if (r.getState && r.getState() === 'preview') {
        // next click will complete
      } else if (r.getState && r.getState() === 'completed') {
        stopAdd();
      }
    } catch (e) {
      log('error','handlePointerClick(add)', e);
    }
    return;
  }

  // Hit select and forward to edit/body
  let r = activeRect();
  const hitRect = setActiveByHit(ev);
  if (hitRect) r = hitRect;
  if (r) {
    try {
      r.handlePointerClick(ev);
      log('edit.click', 'state=', r.getState && r.getState());
    } catch (e) {
      log('error','handlePointerClick(edit)', e);
    }
  }
});

chart.subscribeCrosshairMove((param) => {
  const ev = evFrom(param);
  if (!ev) return;

  const r = activeRect(); if (!r) return;
  const state = r.getState ? r.getState() : 'unknown';

  if (adding || state === 'anchoring' || state === 'preview' || state === 'editing') {
    try { r.handlePointerMove(ev); } catch (e) { log('error','handlePointerMove', e); }
  }
});

// Keyboard helpers
window.addEventListener('keydown', (e) => {
  const r = activeRect(); if (!r) return;
  try {
    if (typeof r.onKeyDownFromController === 'function') {
      r.onKeyDownFromController(e);
      log('key', e.key, 'state=', r.getState && r.getState());
    } else {
      if (e.key === 'Delete' || e.key === 'Backspace') deleteActive();
      if (e.key === 'Escape' || e.key === 'Esc') stopAdd();
    }
  } catch (err) {
    log('error','onKeyDown', err);
  }
});

// Cleanup
window.addEventListener('beforeunload', () => {
  disposeResize();
  chart.remove();
});

log('Data points (BD):', data.length);
log('Note', 'Autoscale: vertical price range only. Use Fit Content for time range.');