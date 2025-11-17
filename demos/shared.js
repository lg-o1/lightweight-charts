// Wave0 Demos Shared Utilities (ESM)
// This module centralizes logging, data generators, feature flags, chart bootstrapping and tools helpers.

import * as LWC from './lib/lwc.esm.js';
import { RectangleDrawingPrimitive } from './lib/lwc.esm.js';

// Avoid dev-server 404 for /favicon.ico: inject a tiny SVG favicon if none exists
(function ensureFavicon() {
  try {
    if (document.querySelector('link[rel="icon"]')) return;
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#0B84F3"/><text x="32" y="42" font-size="36" text-anchor="middle" fill="#fff">L</text></svg>';
    const href = 'data:image/svg+xml,' + encodeURIComponent(svg);
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = href;
    document.head.appendChild(link);
  } catch {}
})();
// Logging utilities
export function setupGlobalErrorLogging(target = '#log') {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  const append = (level, ...args) => {
    const line = `[${level}] ` + args.map(a => {
      try { return typeof a === 'string' ? a : JSON.stringify(a); } catch { return String(a); }
    }).join(' ');
    console[level === 'error' ? 'error' : 'log'](line);
    if (el) { el.textContent += line + '\n'; }
  };
  window.addEventListener('error', (e) => {
    append('error', 'window.error', e.message, e.filename, `${e.lineno}:${e.colno}`, e.error?.stack);
  });
  window.addEventListener('unhandledrejection', (e) => {
    append('error', 'unhandledrejection', e.reason);
  });
  return { append };
}

export function mklog(scope = 'DEMO', target = '#log') {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  return (...args) => {
    const line = `[${scope}] ` + args.map(a => {
      try { return typeof a === 'string' ? a : JSON.stringify(a); } catch { return String(a); }
    }).join(' ');
    console.log(line);
    if (el) { el.textContent += line + '\n'; }
  };
}

export function clearLog(target = '#log') {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (el) el.textContent = '';
}

// Feature Flags
/* Feature flags removed: drawing tools are always enabled (Always-On). */

export function logVersionAndFlags(log = console.log) {
  try { log('LightweightCharts.version()', LWC.version()); } catch (e) { log('version() error', e); }
  log('DrawingTools', 'always-enabled');
}

// DOM helpers
export function makeContainer(selectorOrElement, { width = 960, height = 480 } = {}) {
  const el = typeof selectorOrElement === 'string' ? document.querySelector(selectorOrElement) : selectorOrElement;
  if (!el) throw new Error('Container not found: ' + selectorOrElement);
  el.style.width = width + 'px';
  el.style.height = height + 'px';
  el.style.border = '1px solid #e5e7eb';
  el.style.background = '#fff';
  return el;
}

export function ensureResize(chart, container) {
  if (!('ResizeObserver' in window)) return () => {};
  const ro = new ResizeObserver(() => chart.resize(container.clientWidth, container.clientHeight));
  ro.observe(container);
  return () => ro.disconnect();
}

// Chart and series
export function createChart(container, options = {}) {
  const chart = LWC.createChart(container, {
    width: container.clientWidth,
    height: container.clientHeight,
    layout: { textColor: '#111', background: { type: 'solid', color: '#fafafa' } },
    grid: { vertLines: { color: '#efefef' }, horzLines: { color: '#efefef' } },
    ...options,
  });
  return chart;
}

export function addLineSeries(chart, options = {}) {
  // New API: add built-in series via addSeries(LineSeries)
  return chart.addSeries(LWC.LineSeries, { color: '#2962FF', lineWidth: 2, ...options });
}
export function addCandlesSeries(chart, options = {}) {
  return chart.addSeries(
    LWC.CandlestickSeries,
    { upColor: '#26a69a', downColor: '#ef5350', borderVisible: false, wickUpColor: '#26a69a', wickDownColor: '#ef5350', ...options }
  );
}
export function addHistogramSeries(chart, options = {}) {
  return chart.addSeries(
    LWC.HistogramSeries,
    { color: '#a0a0a0', priceFormat: { type: 'volume' }, priceScaleId: 'left', ...options }
  );
}

// Data generators
export function generateLineDataUTC(count = 200, { start = 1700000000, stepSec = 60, base = 100 } = {}) {
  const data = [];
  let t = start;
  let v = base;
  for (let i = 0; i < count; i++) {
    v += (Math.random() - 0.5) * 2;
    data.push({ time: t, value: Math.max(0, Number(v.toFixed(2))) });
    t += stepSec;
  }
  return data;
}

export function generateCandleDataUTC(count = 200, { start = 1700000000, stepSec = 60, base = 100 } = {}) {
  const data = [];
  let t = start;
  let price = base;
  for (let i = 0; i < count; i++) {
    const open = price + (Math.random() - 0.5) * 4;
    const close = open + (Math.random() - 0.5) * 6;
    const high = Math.max(open, close) + Math.random() * 3;
    const low = Math.min(open, close) - Math.random() * 3;
    data.push({ time: t, open: +open.toFixed(2), high: +high.toFixed(2), low: +low.toFixed(2), close: +close.toFixed(2) });
    price = close;
    t += stepSec;
  }
  return data;
}

function nextBusinessDay(d) {
  const dt = new Date(Date.UTC(d.year, d.month - 1, d.day));
  dt.setUTCDate(dt.getUTCDate() + 1);
  const wd = dt.getUTCDay();
  if (wd === 0) dt.setUTCDate(dt.getUTCDate() + 1); // Sunday->Monday
  if (wd === 6) dt.setUTCDate(dt.getUTCDate() + 2); // Saturday->Monday
  return { year: dt.getUTCFullYear(), month: dt.getUTCMonth() + 1, day: dt.getUTCDate() };
}

export function generateLineDataBusinessDay(count = 200, { start = { year: 2023, month: 1, day: 2 }, base = 100 } = {}) {
  const data = [];
  let date = start;
  let v = base;
  for (let i = 0; i < count; i++) {
    v += (Math.random() - 0.5) * 2;
    data.push({ time: date, value: Math.max(0, Number(v.toFixed(2))) });
    date = nextBusinessDay(date);
  }
  return data;
}

// Rectangle primitive helpers
export function attachRectanglePrimitive(series, options = {}) {
  // Always-On: no runtime guards required
  const rect = new RectangleDrawingPrimitive();
  if (rect.applyOptions && options) rect.applyOptions(options);
  series.attachPrimitive(rect);
  return rect;
}

export function detachRectanglePrimitive(series, rect) {
  try { series.detachPrimitive(rect); } catch {}
}

export function logRectangleAutoscale(chart, rect, log = console.log) {
  const range = chart.timeScale().getVisibleLogicalRange();
  const res = rect.autoscaleInfo ? rect.autoscaleInfo(range?.from ?? 0, range?.to ?? 0) : null;
  log('rectangle.autoscaleInfo()', res);
  return res;
}

// FPS meter
export function startFpsMeter(label = 'fps', log = console.log) {
  let running = true;
  let frames = 0;
  let last = performance.now();
  const samples = [];
  let raf = 0;
  function loop(ts) {
    frames++;
    if (ts - last >= 1000) {
      const fps = (frames * 1000) / (ts - last);
      samples.push(fps);
      log('FPS', label, fps.toFixed(1));
      frames = 0;
      last = ts;
    }
    if (running) raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);
  return () => {
    running = false;
    cancelAnimationFrame(raf);
    return samples;
  };
}

// Memory snapshot (best-effort, Chrome only)
export function memorySnapshot() {
  const m = performance && performance.memory;
  if (!m) return null;
  return {
    usedJSHeapSize: m.usedJSHeapSize,
    totalJSHeapSize: m.totalJSHeapSize,
    jsHeapSizeLimit: m.jsHeapSizeLimit,
    ts: performance.now(),
  };
}

// Toolbar
export function createToolbar(containerOrSelector, buttons = []) {
  const container = typeof containerOrSelector === 'string' ? document.querySelector(containerOrSelector) : containerOrSelector;
  const bar = document.createElement('div');
  bar.style.display = 'flex';
  bar.style.gap = '8px';
  bar.style.alignItems = 'center';
  bar.style.margin = '8px 0';
  for (const b of buttons) {
    const btn = document.createElement('button');
    btn.textContent = b.text;
    btn.title = b.title || b.text;
    btn.onclick = b.onClick;
    bar.appendChild(btn);
  }
  container.appendChild(bar);
  return bar;
}

export { LWC, RectangleDrawingPrimitive };