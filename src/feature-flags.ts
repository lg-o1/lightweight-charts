/* eslint-disable tsdoc/syntax, jsdoc/check-indentation */
/**
 * Lightweight Charts - Feature Flags
 * Centralized runtime flags for drawing tools and advanced annotations.
 * - Master flag "drawingTools" gates all drawing-related features.
 * - Individual flags gate specific tools (rectangle, ellipse, etc.).
 *
 * Runtime override:
 *   globalThis.__LWC_FEATURES or globalThis.__lwc_features (object)
 *   Example:
 *     window.__LWC_FEATURES = { drawingTools: true, rectangle: true }
 *
 * Usage:
 *   import { isEnabled, requireEnabled, setFeatureFlags, allFlags } from './feature-flags';
 *   // Example: enable Rectangle => setFeatureFlags({ 'drawingTools.rectangle': true })
 *   // Guard API example: requireEnabled('drawingTools', 'ChartApi.addDrawingTool')
 */

export type FeatureName =
	| 'drawingTools'
	| 'rectangle'
	| 'ellipse'
	| 'triangle'
	| 'text'
	| 'path'
	| 'fillBetween'
	| 'forecast'
	| 'fib'
	| 'gann'
	| 'pitchfork';

export interface FeatureFlags {
	drawingTools: boolean;
	rectangle: boolean;
	ellipse: boolean;
	triangle: boolean;
	text: boolean;
	path: boolean;
	fillBetween: boolean;
	forecast: boolean;
	fib: boolean;
	gann: boolean;
	pitchfork: boolean;
}

/**
 * Default flags:
 * - drawingTools: true (enable drawing framework by default)
 * - rectangle: false (new feature, opt-in until stabilized)
 * - other advanced tools: false (add incrementally)
 */
const defaultFlags: FeatureFlags = {
	drawingTools: true,
	rectangle: false,
	ellipse: false,
	triangle: false,
	text: false,
	path: false,
	fillBetween: false,
	forecast: false,
	fib: false,
	gann: false,
	pitchfork: false,
};

/**
 * Internal mutable flags storage. Exported via allFlags() as a snapshot.
 */
const flags: FeatureFlags = { ...defaultFlags };
const namedFlags: Map<string, boolean> = new Map();

// Canonical keys list to avoid relying on object key enumeration that might be mangled in bundled builds
const CANONICAL_KEYS = [
	'drawingTools',
	'rectangle',
	'ellipse',
	'triangle',
	'text',
	'path',
	'fillBetween',
	'forecast',
	'fib',
	'gann',
	'pitchfork',
] as const;

// Internal-safe flag accessors to tolerate property renaming in bundled builds (e.g., "_internal_" prefix)
function readFlagValue(rawName: string): boolean | undefined {
	const rec: Record<string, unknown> = flags as unknown as Record<string, unknown>;
	// direct canonical key
	const direct = rec[rawName];
	if (typeof direct === 'boolean') { return direct; }
	// fallback to mangled key
	const internalKey = `_internal_${rawName}`;
	const internalVal = rec[internalKey];
	if (typeof internalVal === 'boolean') { return internalVal; }
	return undefined;
}

function readFlag(name: FeatureName): boolean {
	const v = readFlagValue(name);
	return v === undefined ? false : v;
}

function writeFlag(name: FeatureName, enabled: boolean): void {
	flags[name] = !!enabled;
	const internalKey = `_internal_${name}`;
	const rec: Record<string, unknown> = flags as unknown as Record<string, unknown>;
	if (Object.prototype.hasOwnProperty.call(rec, internalKey)) {
		(rec as Record<string, boolean>)[internalKey] = !!enabled;
	}
}

/**
 * Apply overrides from global object:
 *   globalThis.__LWC_FEATURES or globalThis.__lwc_features
 */
function applyOverridesFromGlobal(): void {
	try {
		const globalRecord = globalThis as Record<string, unknown>;
		const g = (globalRecord.__LWC_FEATURES ?? globalRecord.__lwc_features);
		if (g && typeof g === 'object') {
			const gRec = g as Record<string, unknown>;
			for (const k of Object.keys(flags) as (keyof FeatureFlags)[]) {
				if (Object.prototype.hasOwnProperty.call(gRec, k)) {
					const val = gRec[k];
					flags[k] = Boolean(val);
				}
			}
		}
	} catch {
		// ignore
	}
}
applyOverridesFromGlobal();

/**
 * Check if feature is enabled.
 * Master "drawingTools" must be enabled for any specific drawing feature to be considered enabled.
 */
export function isEnabled(name: FeatureName): boolean {
	// Master gate with internal-aware read
	const master = readFlag('drawingTools');
	if (name !== 'drawingTools' && !master) {
		return false;
	}
	return !!readFlag(name);
}

/**
 * Require feature to be enabled or throw with a helpful message.
 * Provide "where" for context (e.g., API method or tool name).
 */
export function requireEnabled(name: FeatureName, where: string): void {
	if (!isEnabled(name)) {
		throw new Error(`[lightweight-charts] Feature "${name}" is disabled (at ${where}).`);
	}
}

/**
 * Enable/disable a feature programmatically.
 * Useful for tests or gated beta releases.
 */
export function setEnabled(name: FeatureName, enabled: boolean): void {
	writeFlag(name, enabled);
}

/**
 * Returns a shallow snapshot of current flags.
 */
export function allFlags(): Readonly<FeatureFlags> {
	return { ...flags };
}

/**
 * Reset to defaults (tests utility).
 */
export function resetFlags(): void {
	Object.assign(flags, defaultFlags);
	applyOverridesFromGlobal();
}

/**
 * Bulk set feature flags. Supports both flat keys ('rectangle') and dot-keys ('drawingTools.rectangle').
 */
export function setFeatureFlags(map: Record<string, boolean>): void {
	for (const [k, v] of Object.entries(map)) {
		if (k === 'drawingTools') {
			writeFlag('drawingTools', !!v);
			continue;
		}
		if (k.includes('.')) {
			const [root, child] = k.split('.', 2);
			if (root === 'drawingTools' && child) {
				// child is a canonical tool key if known
				if ((CANONICAL_KEYS as readonly string[]).includes(child)) {
					writeFlag(child as FeatureName, !!v);
				}
				namedFlags.set(k, !!v);
				continue;
			}
		}
		if ((CANONICAL_KEYS as readonly string[]).includes(k)) {
			writeFlag(k as FeatureName, !!v);
		} else {
			namedFlags.set(k, !!v);
		}
	}
}

/**
 * Query a dot-keyed flag, e.g. 'drawingTools.rectangle'.
 */
export function getFeatureFlag(name: string): boolean {
	if (name === 'drawingTools') {
		return isEnabled('drawingTools');
	}
	// Plain canonical key
	if (!name.includes('.') && (CANONICAL_KEYS as readonly string[]).includes(name)) {
		return isEnabled(name as FeatureName);
	}
	// Fallback to named (dot-key) storage
	return !!namedFlags.get(name);
}

/**
 * Ensure a feature flag is enabled, supports dot-key names e.g. 'drawingTools.rectangle'.
 * Throws a descriptive error if disabled.
 */
export function ensureFeatureFlagEnabled(name: string, where: string): void {
	// Master gate
	if (name === 'drawingTools') {
		requireEnabled('drawingTools', where);
		return;
	}
	// Dot-key child: require master + check named flag via getFeatureFlag (supports keys like 'drawingTools.watermarkTextShadow')
	if (name.includes('.')) {
		const [root] = name.split('.', 2);
		if (root === 'drawingTools') {
			requireEnabled('drawingTools', where);
			if (!getFeatureFlag(name)) {
				throw new Error(`[lightweight-charts] Feature flag "${name}" is disabled (at ${where}).`);
			}
			return;
		}
	}
	// Plain feature name in union
	if (!isEnabled(name as FeatureName)) {
		throw new Error(`[lightweight-charts] Feature flag "${name}" is disabled (at ${where}).`);
	}
}

 /**
  * Back-compat testing alias expected by unit tests.
  */
export function resetFeatureFlags(): void {
	resetFlags();
}
