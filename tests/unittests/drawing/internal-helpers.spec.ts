import { describe, it, beforeEach, afterEach } from 'node:test';
import { expect } from 'chai';
import type { Time } from '../../../src/model/horz-scale-behavior-time/types';
import type { Coordinate } from '../../../src/model/coordinate';
import { TTLCache } from '../../../src/drawing/internal/TTLCache';
import { pointerEventFromParams, createSyntheticMouseEvent } from '../../../src/drawing/internal/PointerEventUtils';
import { subscribeAll } from '../../../src/drawing/internal/ChartSubscriptions';

describe('TTLCache', () => {
  let now = 0;
  const nowProvider = () => now;

  beforeEach(() => { now = 0; });
  afterEach(() => { /* no-op */ });

  it('getOrCompute caches within TTL and recomputes after expiry', () => {
    const c = new TTLCache<string, number>(2, 10, nowProvider);
    let computeCalls = 0;
    const compute = () => { computeCalls++; return 42 + computeCalls; };

    const v1 = c.getOrCompute('a', compute);
    expect(v1).to.equal(43);
    expect(computeCalls).to.equal(1);

    const v2 = c.getOrCompute('a', compute);
    expect(v2).to.equal(43);
    expect(computeCalls).to.equal(1);

    now = 11; // expire
    const miss = c.get('a');
    expect(miss).to.equal(undefined);

    const v3 = c.getOrCompute('a', compute);
    expect(v3).to.equal(44);
    expect(computeCalls).to.equal(2);
  });

  it('FIFO eviction when capacity exceeded', () => {
    const c = new TTLCache<string, number>(2, 100, nowProvider);
    c.getOrCompute('k1', () => 1);
    c.getOrCompute('k2', () => 2);
    c.getOrCompute('k3', () => 3); // evicts k1
    expect(c.get('k1')).to.equal(undefined);
    expect(c.get('k2')).to.equal(2);
    expect(c.get('k3')).to.equal(3);
  });

  it('clear empties cache', () => {
    const c = new TTLCache<string, number>(3, 100, nowProvider);
    c.set('a', 1);
    c.set('b', 2);
    expect(c.get('a')).to.equal(1);
    c.clear();
    expect(c.get('a')).to.equal(undefined);
    expect(c.get('b')).to.equal(undefined);
  });
});

describe('PointerEventUtils', () => {
  it('returns null when params.point is missing', () => {
    const evt = pointerEventFromParams<any>({ point: undefined } as any, 'mousemove');
    expect(evt).to.equal(null);
  });

  it('maps fields and uses hoveredSeries to compute price', () => {
    const series = { coordinateToPrice: (_y: Coordinate) => 55 };
    const params = {
      point: { x: 10, y: 20 },
      hoveredSeries: series,
      sourceEvent: { clientX: 1, clientY: 2, altKey: true, ctrlKey: false, metaKey: true, shiftKey: true } as any,
      time: 111 as Time,
      logical: 7,
    };
    const evt = pointerEventFromParams<Time>(params as any, 'click');
    expect(evt).to.not.equal(null);
    if (!evt) { return; }
    expect(evt.point.x).to.equal(10);
    expect(evt.point.y).to.equal(20);
    expect(evt.clientX).to.equal(1);
    expect(evt.clientY).to.equal(2);
    expect(evt.price).to.equal(55);
    expect(evt.pointerType).to.equal('mouse');
    expect(evt.isPrimary).to.equal(true);
    expect(evt.altKey).to.equal(true);
    expect(evt.ctrlKey).to.equal(false);
    expect(evt.metaKey).to.equal(true);
    expect(evt.shiftKey).to.equal(true);
  });

  it('createSyntheticMouseEvent falls back in Node', () => {
    const saved = (globalThis as any).MouseEvent;
    try {
      (globalThis as any).MouseEvent = undefined;
      const e = createSyntheticMouseEvent('click', { clientX: 5, clientY: 6 } as any);
      expect((e as any).type).to.equal('click');
    } finally {
      (globalThis as any).MouseEvent = saved;
    }
  });
});

describe('ChartSubscriptions', () => {
  function createChartMock(includeDbl: boolean) {
    const chart: any = {
      _click: undefined as any,
      _move: undefined as any,
      _dbl: undefined as any,
      subscribeClick(fn: any) { this._click = fn; },
      unsubscribeClick(_fn?: any) { this._click = undefined; },
      subscribeCrosshairMove(fn: any) { this._move = fn; },
      unsubscribeCrosshairMove(_fn?: any) { this._move = undefined; },
    };
    if (includeDbl) {
      chart.subscribeDblClick = (fn: any) => { chart._dbl = fn; };
      chart.unsubscribeDblClick = (_fn?: any) => { chart._dbl = undefined; };
    }
    chart.timeScale = () => ({ timeToCoordinate: () => 0, coordinateToTime: () => 0 });
    return chart;
  }

  it('subscribes/unsubscribes click/move and dblclick when supported', () => {
    const chart = createChartMock(true);
    const h = subscribeAll<any>(chart, { click: () => {}, move: () => {}, dblClick: () => {} });
    expect(h.dblClickSubscribed).to.equal(true);
    expect(typeof chart._click).to.equal('function');
    expect(typeof chart._move).to.equal('function');
    expect(typeof chart._dbl).to.equal('function');
    h.unsubscribe();
    expect(chart._click).to.equal(undefined);
    expect(chart._move).to.equal(undefined);
    expect(chart._dbl).to.equal(undefined);
  });

  it('subscribes/unsubscribes without dblclick when not supported', () => {
    const chart = createChartMock(false);
    const h = subscribeAll<any>(chart, { click: () => {}, move: () => {}, dblClick: () => {} });
    expect(h.dblClickSubscribed).to.equal(false);
    expect(typeof chart._click).to.equal('function');
    expect(typeof chart._move).to.equal('function');
    expect(chart._dbl).to.equal(undefined);
    h.unsubscribe();
    expect(chart._click).to.equal(undefined);
    expect(chart._move).to.equal(undefined);
    expect(chart._dbl).to.equal(undefined);
  });
});