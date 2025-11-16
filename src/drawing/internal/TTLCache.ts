/**
 * Internal TTL + capacity FIFO cache used by drawing runtime.
 * - Eviction policy: FIFO by insertion order (not LRU)
 * - Freshness: entry usable if now - stamp <= ttlMs
 */
export class TTLCache<K, V> {
	private readonly _limit: number;
	private readonly _ttlMs: number;
	private readonly _now: () => number;
	private readonly _map: Map<K, { value: V; stamp: number }>;

	constructor(limit: number, ttlMs: number, nowProvider?: () => number) {
		const l = Math.max(1, Math.floor(Number.isFinite(limit) ? limit : 1));
		this._limit = l;
		this._ttlMs = Math.max(0, Math.floor(Number.isFinite(ttlMs) ? ttlMs : 0));
		this._now = nowProvider ?? (() => Date.now());
		this._map = new Map();
	}

	public get(key: K): V | undefined {
		const e = this._map.get(key);
		if (!e) { return undefined; }
		if (this._isFresh(e.stamp)) { return e.value; }
		return undefined;
	}

	public set(key: K, value: V): void {
		if (!this._map.has(key) && this._map.size >= this._limit) {
			this._evictOne();
		}
		this._map.set(key, { value, stamp: this._now() });
	}

	public getOrCompute(key: K, compute: () => V): V {
		const now = this._now();
		const e = this._map.get(key);
		if (e && this._isFresh(e.stamp, now)) {
			return e.value;
		}
		const value = compute();
		if (!this._map.has(key) && this._map.size >= this._limit) {
			this._evictOne();
		}
		this._map.set(key, { value, stamp: now });
		return value;
	}

	public clear(): void {
		this._map.clear();
	}

	private _evictOne(): void {
		const it = this._map.keys();
		const first = it.next();
		if (!first.done) {
			this._map.delete(first.value);
		}
	}

	private _isFresh(stamp: number, now?: number): boolean {
		const n = now ?? this._now();
		return (n - stamp) <= this._ttlMs;
	}
}