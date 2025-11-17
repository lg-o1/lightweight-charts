// Index module for Lightweight Charts demos (Vite/html-server compatible)
// Requires window.process polyfill set by index.html before this module executes

import * as LWC from './lib/lwc.esm.js';

const out = document.getElementById('log');
const lines = [];

function toStr(a) {
  try { return typeof a === 'string' ? a : JSON.stringify(a); } catch { return String(a); }
}

function logLine(...args) {
  console.log(...args);
  lines.push(args.map(toStr).join(' '));
  if (out) out.textContent = lines.join('\n');
}

logLine('LightweightCharts.version():', LWC.version());
logLine('DrawingTools:', 'always-enabled');