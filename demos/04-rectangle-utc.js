// 04 — Rectangle Interactions (UTCTimestamp) demo module

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
  RectangleDrawingPrimitive,
  logRectangleAutoscale,
} from './shared.js';

// Logging and version/flags
const elog = setupGlobalErrorLogging('#log');
const log = mklog('DEMO-04', '#log');
clearLog('#log');
logVersionAndFlags(log);

// Always-On: drawing tools are enabled by default
// Chart and data
const container = makeContainer('#chart', { width: 960, height: 520 });
const chart = createChart(container, {
  rightPriceScale: { borderVisible: true },
  timeScale: { rightOffset: 2, borderVisible: true, fixLeftEdge: true, fixRightEdge: false },
  crosshair: { mode: 0 },
  grid: { vertLines: { color: '#eee' }, horzLines: { color: '#eee' } },
});
const disposeResize = ensureResize(chart, container);

const series = addLineSeries(chart, { color: '#0B84F3', lineWidth: 2, priceScaleId: 'right' });
const data = generateLineDataUTC(320, { start: 1700000000, stepSec: 60, base: 100 });
series.setData(data);

chart.timeScale().fitContent();

// Rectangle tool state
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
  // Choose the first rectangle with a hit; prefer handle over body (performHitTest already does handle-first)
  for (let i = rectangles.length - 1; i >= 0; i--) {
    const r = rectangles[i];
    try {
      const ht = r.performHitTest(ev);
      if (ht) {
        activeIndex = i;
        log('hit', ht.externalId, 'cursor', ht.cursor, 'z', ht.zOrder, 'rect#', i);
        return r;
      }
    } catch (e) {
      // ignore one rect failure
    }
  }
  return null;
}

function evFrom(param) {
  if (!param || !param.point) return null;
  const pt = param.point;
  if (pt.x == null || pt.y == null || !param.time) return null;
  const price = series.coordinateToPrice(pt.y);
  if (price == null) return null;
  return { time: param.time, price, point: { x: pt.x, y: pt.y } };
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
  const r = activeRect();
  if (!r) return;
  try {
    r.deleteSelf();
    log('deleteSelf()', 'rect#', activeIndex);
  } catch (e) {
    log('error', 'deleteSelf', e);
  }
}

function undoActive() {
  const r = activeRect();
  if (!r) return;
  const ok = r.undo();
  log('undo()', ok);
}

function redoActive() {
  const r = activeRect();
  if (!r) return;
  const ok = r.redo();
  log('redo()', ok);
}

function autoscaleRect() {
  const r = activeRect();
  if (!r) return;
  const info = logRectangleAutoscale(chart, r, log);
  // vertical-only expected; refresh autoscale by forcing a re-evaluation of the current time range
  try {
    const ts = chart.timeScale();
    const getVR = ts.getVisibleRange || ts.getVisibleLogicalRange;
    const setVR = ts.setVisibleRange || ts.setVisibleLogicalRange;
    if (getVR && setVR) {
      const vr = getVR.call(ts);
      if (vr) setVR.call(ts, vr);
    }
  } catch (e) {
    log('error', 'autoscale-refresh', e);
  }
  log('autoscale refresh applied (vertical-only). info:', info);
}

// Toolbar
createToolbar('#toolbar', [
  { text: 'Add Rectangle', title: 'Click to start, then click chart to set start/end', onClick: () => startAdd() },
  { text: 'Stop Add', title: 'Exit add/preview mode', onClick: () => stopAdd() },
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
      log('applyOptions', { showLabels: show });
    }
  },
  {
    text: 'Snapshot ⭘',
    title: 'toJSON()',
    onClick: () => {
      const r = activeRect(); if (!r) return;
      lastSnapshot = r.toJSON();
      log('snapshot', lastSnapshot);
    }
  },
  {
    text: 'Restore ⟲',
    title: 'fromJSON()',
    onClick: () => {
      if (!lastSnapshot) return;
      const r = new RectangleDrawingPrimitive();
      series.attachPrimitive(r);
      rectangles.push(r);
      activeIndex = rectangles.length - 1;
      const restored = RectangleDrawingPrimitive.fromJSON(lastSnapshot);
      // Replace newly attached instance with restored one by reattaching
      try { series.detachPrimitive(r); } catch {}
      series.attachPrimitive(restored);
      rectangles[activeIndex] = restored;
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
  if (!ev) { log('click(no-ev)', param.time); return; }

  if (adding) {
    // forward to the active (just created) rectangle
    const r = activeRect();
    if (!r) return;
    try {
      r.handlePointerClick(ev);
      log('add.click', 'state=', r.getState && r.getState());
      if (r.getState && r.getState() === 'completed') {
        stopAdd();
      }
    } catch (e) {
      log('error', 'handlePointerClick(add)', e);
    }
    return;
  }

  // Not adding: hit-test and forward to selected rect (handle/body)
  let r = activeRect();
  const hitRect = setActiveByHit(ev);
  if (hitRect) {
    r = hitRect;
  }
  if (r) {
    try {
      r.handlePointerClick(ev);
      log('edit.click', 'state=', r.getState && r.getState());
    } catch (e) {
      log('error', 'handlePointerClick(edit)', e);
    }
  }
});

chart.subscribeCrosshairMove((param) => {
  const ev = evFrom(param);
  if (!ev) return;

  const r = activeRect();
  if (!r) return;

  const state = r.getState ? r.getState() : 'unknown';
  // Forward moves while anchoring/preview/editing/body-drag
  if (adding || state === 'anchoring' || state === 'preview' || state === 'editing') {
    try {
      r.handlePointerMove(ev);
    } catch (e) {
      log('error', 'handlePointerMove', e);
    }
  }
});

// Keyboard helpers: Delete / Escape routed to active rectangle
window.addEventListener('keydown', (e) => {
  const r = activeRect();
  if (!r) return;
  try {
    if (typeof r.onKeyDownFromController === 'function') {
      r.onKeyDownFromController(e);
      log('key', e.key, 'state=', r.getState && r.getState());
    } else {
      if (e.key === 'Delete' || e.key === 'Backspace') deleteActive();
      if (e.key === 'Escape' || e.key === 'Esc') stopAdd();
    }
  } catch (err) {
    log('error', 'onKeyDown', err);
  }
});

// Cleanup on unload
window.addEventListener('beforeunload', () => {
  disposeResize();
  chart.remove();
});

// Initial info
logVersionAndFlags(log);
log('Data points', data.length);
log('Hint', '1) Click "Add Rectangle", 2) Click chart to set start, 3) Move mouse to preview, 4) Click again to complete.');
log('Hint', 'Double-click rectangle to enter editing; click a handle or inside body to drag; use Undo/Redo; press Delete to remove.');
log('Note', 'Autoscale: vertical price range only. Use Fit Content to manage time range.');