// 06 — Rectangle Performance (200+ instances, 5s drag, ~60 FPS) demo module

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
  startFpsMeter,
  memorySnapshot,
} from './shared.js';

const elog = setupGlobalErrorLogging('#log');
const log = mklog('DEMO-06','#log');
clearLog('#log');
logVersionAndFlags(log);

// Always-On: drawing tools are enabled by default

const elRects = document.getElementById('stat-rects');
const elActive = document.getElementById('stat-active');
const elDrag = document.getElementById('stat-drag');
const elFps = document.getElementById('stat-fps');

// Chart + data
const container = makeContainer('#chart',{ width: 960, height: 520 });
const chart = createChart(container, {
  rightPriceScale: { borderVisible: true },
  timeScale: { rightOffset: 2, borderVisible: true, fixLeftEdge: true, fixRightEdge: false },
  crosshair: { mode: 0 },
  grid: { vertLines: { color: '#eee' }, horzLines: { color: '#eee' } },
});
const disposeResize = ensureResize(chart, container);

const series = addLineSeries(chart, { color: '#0B84F3', lineWidth: 2, priceScaleId: 'right' });
const data = generateLineDataUTC(480, { start: 1700000000, stepSec: 60, base: 100 });
series.setData(data);
chart.timeScale().fitContent();

// Rectangles
const rectangles = [];
let activeIndex = -1;

function setActive(i) {
  if (i >= 0 && i < rectangles.length) {
    activeIndex = i;
    elActive.textContent = String(activeIndex);
  }
}
function activeRect() {
  return activeIndex >= 0 ? rectangles[activeIndex] : null;
}

function rnd(min, max) {
  return Math.random() * (max - min) + min;
}

function spawnRectangles(n = 220) {
  const N = Math.max(1, n);
  const L = data.length;
  for (let i = 0; i < N; i++) {
    const i1 = Math.max(10, Math.floor(rnd(10, L - 40)));
    const i2 = Math.min(L - 10, i1 + Math.floor(rnd(3, 24)));
    const t1 = data[i1].time;
    const t2 = data[i2].time;
    const v1 = data[i1].value;
    const v2 = data[i2].value;
    // choose price band with slight random padding
    const pmin = Math.min(v1, v2) - rnd(0, 2.5);
    const pmax = Math.max(v1, v2) + rnd(0, 2.5);
    const start = { time: t1, price: +(pmin).toFixed(2) };
    const end   = { time: t2, price: +(pmax).toFixed(2) };

    const r = new RectangleDrawingPrimitive();
    // tint for visibility, keep translucent
    const hue = Math.floor((i / N) * 240);
    r.applyOptions?.({
      fillColor: `hsla(${hue}, 70%, 60%, 0.15)`,
      previewFillColor: `hsla(${hue}, 70%, 60%, 0.10)`,
      labelColor: `hsla(${hue}, 70%, 50%, 0.6)`,
      labelTextColor: '#111',
      showLabels: false,
    });

    // Seed via snapshot so we avoid interactive clicks for mass placement
    const snap = {
      version: 1,
      anchors: { start, end },
      options: {
        fillColor: `hsla(${hue}, 70%, 60%, 0.15)`,
        previewFillColor: `hsla(${hue}, 70%, 60%, 0.10)`,
        labelColor: `hsla(${hue}, 70%, 50%, 0.6)`,
        labelTextColor: '#111',
        showLabels: false,
      },
    };
    const seeded = RectangleDrawingPrimitive.fromJSON(snap);
    series.attachPrimitive(seeded);
    rectangles.push(seeded);
  }
  elRects.textContent = String(rectangles.length);
  if (activeIndex < 0) setActive(Math.floor(rectangles.length / 2));
  log('spawned', N, 'rectangles; total=', rectangles.length);
}

function clearRectangles() {
  for (const r of rectangles) {
    try { series.detachPrimitive(r); } catch {}
  }
  rectangles.length = 0;
  activeIndex = -1;
  elRects.textContent = '0';
  elActive.textContent = '-';
  log('cleared rectangles');
}

// Simulation: 5s body drag with FPS meter
let simRunning = false;
let stopFps = null;

function boundsCenterPx(r) {
  try {
    const b = r.getBoundsPxForView?.();
    if (!b) return null;
    const cx = (b.left + b.right) / 2;
    const cy = (b.top + b.bottom) / 2;
    return { x: cx, y: cy };
  } catch { return null; }
}

function pxToEvent(x, y) {
  const time = chart.timeScale().coordinateToTime(x);
  const price = series.coordinateToPrice(y);
  if (time == null || price == null) return null;
  return { time, price, point: { x, y } };
}

async function runDrag5s() {
  const r = activeRect();
  if (!r) { log('no active rectangle'); return; }
  const c = boundsCenterPx(r);
  if (!c) { log('cannot resolve bounds center'); return; }

  // Begin body-drag by "clicking" inside
  const startEv = pxToEvent(c.x, c.y);
  if (!startEv) { log('center not mappable'); return; }
  try { r.handlePointerClick(startEv); } catch (e) { log('error','begin body click', e); return; }

  // Configure loop
  simRunning = true;
  elDrag.textContent = 'running';
  stopFps = startFpsMeter('rect-drag', (...args) => {
    const last = args[args.length - 1];
    if (typeof last === 'number') elFps.textContent = String(last);
    log(...args);
  });

  const startTs = performance.now();
  let raf = 0;
  const baseX = c.x;
  const baseY = c.y;
  const ampX = Math.min(120, container.clientWidth * 0.12);
  const ampY = Math.min(60, container.clientHeight * 0.10);

  function loop(ts) {
    if (!simRunning) return;
    const t = (ts - startTs) / 1000; // seconds
    const dx = Math.sin(t * 2 * Math.PI * 0.5) * ampX; // 0.5 Hz
    const dy = Math.cos(t * 2 * Math.PI * 0.5) * ampY * 0.5;

    const nx = baseX + dx;
    const ny = Math.max(0, Math.min(container.clientHeight, baseY + dy));
    const ev = pxToEvent(nx, ny);
    if (ev) {
      try { r.handlePointerMove(ev); } catch (e) { log('error','handlePointerMove', e); }
    }

    if (ts - startTs >= 5000) {
      // end
      simRunning = false;
      elDrag.textContent = 'idle';
      try {
        // one final click to exit editing to completed (optional)
        const endClick = pxToEvent(nx, ny);
        if (endClick) r.handlePointerClick(endClick);
      } catch {}
      const samples = stopFps ? stopFps() : [];
      stopFps = null;
      if (samples && samples.length) {
        const min = Math.min(...samples).toFixed(1);
        const max = Math.max(...samples).toFixed(1);
        const avg = (samples.reduce((a,b)=>a+b,0)/samples.length).toFixed(1);
        log('FPS summary (5s): avg=', avg, 'min=', min, 'max=', max, 'samples=', samples.length);
      }
      const mem = memorySnapshot();
      if (mem) log('memorySnapshot(end)', mem);
      return;
    }
    raf = requestAnimationFrame(loop);
  }
  const mem0 = memorySnapshot();
  if (mem0) log('memorySnapshot(start)', mem0);
  requestAnimationFrame(loop);
}

// Toolbar
createToolbar('#toolbar', [
  { text: 'Spawn 220 Rectangles', onClick: () => spawnRectangles(220) },
  { text: 'Clear Rectangles', onClick: () => clearRectangles() },
  { text: 'Pick First', onClick: () => setActive(0) },
  { text: 'Pick Middle', onClick: () => setActive(Math.floor(rectangles.length/2)) },
  { text: 'Pick Last', onClick: () => setActive(rectangles.length - 1) },
  { text: 'Start 5s Drag Test', onClick: () => runDrag5s() },
  { text: 'Fit Content (Time)', onClick: () => { chart.timeScale().fitContent(); log('timeScale.fitContent'); } },
  { text: 'Toggle Labels (Active)', onClick: () => {
      const r = activeRect(); if (!r) return;
      const show = !(r.getOptions ? r.getOptions().showLabels : true);
      r.applyOptions?.({ showLabels: show });
      log('applyOptions',{ showLabels: show });
    }
  },
  { text: 'Log Memory Snapshot', onClick: () => log('memorySnapshot()', memorySnapshot()) },
  { text: 'Clear Log', onClick: () => clearLog('#log') },
]);

// Initial spawn
spawnRectangles(220);

// Crosshair logging to verify pointer transforms under load
chart.subscribeCrosshairMove((p) => {
  const c = p.point ? { x: p.point.x, y: p.point.y } : null;
  log('crosshairMove', 'time', p.time, 'point', c);
});

// Cleanup
window.addEventListener('beforeunload', () => {
  try { if (stopFps) stopFps(); } catch {}
  disposeResize();
  chart.remove();
});

log('version', LWC.version());