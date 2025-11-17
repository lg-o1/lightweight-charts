// 07 — Rectangle Memory Attach/Detach demo module

import {
  LWC,
  setupGlobalErrorLogging,
  mklog,
  clearLog,
  makeContainer,
  createChart,
  addLineSeries,
  generateLineDataUTC,
  logVersionAndFlags,
  RectangleDrawingPrimitive,
  memorySnapshot,
} from './shared.js';

const elog = setupGlobalErrorLogging('#log');
const log = mklog('DEMO-07','#log');
clearLog('#log');
logVersionAndFlags(log);

// UI references
const elControls = document.getElementById('controls');
const elCfgCycles = document.getElementById('cfg-cycles');
const elCfgRects = document.getElementById('cfg-rects');
const elCfgDelay = document.getElementById('cfg-delay');
const elCycle = document.getElementById('stat-cycle');
const elMem = document.getElementById('stat-mem');

// defaults / config
let cfgCycles = 10;
let cfgRects = 50;
let cfgDelay = 1000;
let running = false;

function updateCfgDisplay() {
  elCfgCycles.textContent = String(cfgCycles);
  elCfgRects.textContent = String(cfgRects);
  elCfgDelay.textContent = String(cfgDelay);
}
updateCfgDisplay();

// Controls
const inpCycles = document.createElement('input');
inpCycles.type = 'number';
inpCycles.value = String(cfgCycles);
inpCycles.min = '1';
inpCycles.addEventListener('change', () => { cfgCycles = Math.max(1, Number(inpCycles.value)||1); updateCfgDisplay(); });
elControls.appendChild(document.createTextNode('Cycles:'));
elControls.appendChild(inpCycles);

const inpRects = document.createElement('input');
inpRects.type = 'number';
inpRects.value = String(cfgRects);
inpRects.min = '1';
inpRects.addEventListener('change', () => { cfgRects = Math.max(1, Number(inpRects.value)||1); updateCfgDisplay(); });
elControls.appendChild(document.createTextNode('Rects per cycle:'));
elControls.appendChild(inpRects);

const inpDelay = document.createElement('input');
inpDelay.type = 'number';
inpDelay.value = String(cfgDelay);
inpDelay.min = '0';
inpDelay.addEventListener('change', () => { cfgDelay = Math.max(0, Number(inpDelay.value)||0); updateCfgDisplay(); });
elControls.appendChild(document.createTextNode('Delay ms:'));
elControls.appendChild(inpDelay);

const btnStart = document.createElement('button');
btnStart.textContent = 'Start';
elControls.appendChild(btnStart);

const btnStop = document.createElement('button');
btnStop.textContent = 'Stop';
elControls.appendChild(btnStop);

const btnClear = document.createElement('button');
btnClear.textContent = 'Clear Log';
elControls.appendChild(btnClear);

btnClear.addEventListener('click', () => clearLog('#log'));

btnStop.addEventListener('click', () => {
  log('stop requested');
  running = false;
});

btnStart.addEventListener('click', async () => {
  if (running) { log('already running'); return; }
  running = true;
  cfgCycles = Math.max(1, Number(inpCycles.value) || 1);
  cfgRects = Math.max(1, Number(inpRects.value) || 1);
  cfgDelay = Math.max(0, Number(inpDelay.value) || 0);
  updateCfgDisplay();
  await runCycles(cfgCycles, cfgRects, cfgDelay);
});

// chart container for reuse
const container = makeContainer('#chart',{ width: 960, height: 520 });

function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

async function runCycles(cycles, rectsPerCycle, delayMs) {
  log('runCycles', cycles, 'cycles,', rectsPerCycle, 'rects/cycle,', delayMs, 'ms delay');
  const mem0 = memorySnapshot();
  if (mem0) { log('memorySnapshot(start)', mem0); elMem.textContent = JSON.stringify(mem0); }

  for (let c = 0; c < cycles && running; c++) {
    elCycle.textContent = String(c+1) + '/' + String(cycles);
    log('cycle start', c+1);

    // create chart and series
    const chart = createChart(container, {
      width: container.clientWidth, height: container.clientHeight,
      rightPriceScale: { borderVisible: true },
      timeScale: { rightOffset: 2, borderVisible: true, fixLeftEdge: true, fixRightEdge: false },
    });
    const series = addLineSeries(chart, { color: '#0B84F3', lineWidth: 1, priceScaleId: 'right' });
    const data = generateLineDataUTC(400, { start: 1700000000, stepSec: 60, base: 100 });
    series.setData(data);
    chart.timeScale().fitContent();

    // attach primitives
    const attached = [];
    for (let i = 0; i < rectsPerCycle; i++) {
      try {
        const i1 = Math.max(5, Math.floor(Math.random() * (data.length - 20)));
        const i2 = Math.min(data.length - 5, i1 + Math.floor(Math.random() * 20) + 1);
        const start = { time: data[i1].time, price: +(Math.min(data[i1].value, data[i2].value) - Math.random()*2).toFixed(2) };
        const end = { time: data[i2].time, price: +(Math.max(data[i1].value, data[i2].value) + Math.random()*2).toFixed(2) };
        const snap = { version:1, anchors: { start, end }, options: { showLabels: false } };
        const r = RectangleDrawingPrimitive.fromJSON(snap);
        series.attachPrimitive(r);
        attached.push(r);
      } catch (e) {
        log('error attach', e && e.message ? e.message : e);
      }
    }
    log('attached', attached.length, 'rectangles');

    // small pause to allow internal attach processing
    await sleep(150);

    // detach primitives
    for (const r of attached) {
      try { series.detachPrimitive(r); } catch (e) { /* ignore */ }
    }
    attached.length = 0;
    log('detached all primitives');

    // remove chart
    try { chart.remove(); } catch (e) { log('error removing chart', e); }

    // force break references
    await sleep(delayMs);
    const mem = memorySnapshot();
    log('memorySnapshot after cycle', c+1, mem || 'memory API not available');
    if (mem) elMem.textContent = JSON.stringify({ used: mem.usedJSHeapSize, total: mem.totalJSHeapSize });
  }

  // final summary
  const memFinal = memorySnapshot();
  log('final memorySnapshot', memFinal || 'memory API not available');
  if (memFinal) elMem.textContent = JSON.stringify({ used: memFinal.usedJSHeapSize, total: memFinal.totalJSHeapSize });
  elCycle.textContent = '-';
  running = false;
  log('runCycles complete');
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  running = false;
});

// initial
log('version', LWC.version());