// Feature flags removed: exports are now stable and always enabled.
// This stub preserves public API surface for backward compatibility while acting as no-ops.

export type FeatureName = string;

export function isEnabled(_name: FeatureName): boolean {
	// Always enabled
	return true;
}

export function requireEnabled(_name: FeatureName, _where: string): void {
	// No-op: never throws
}

export function ensureFeatureFlagEnabled(_name: string, _where: string): void {
	// No-op: never throws
}

export function setFeatureFlags(_map: Record<string, boolean>): void {
	// No-op
}

export function getFeatureFlag(_name: string): boolean {
	// Always true
	return true;
}

export function allFlags(): Readonly<Record<string, boolean>> {
	// Minimal snapshot to satisfy callers
	return { drawingTools: true };
}

export function resetFlags(): void {
	// No-op
}

export function resetFeatureFlags(): void {
	// Back-compat alias; No-op
}
