/**
 * Drawing Tools Geometry Helpers
 * Unifies normalizedGeometry & pointToPriceTime utilities.
 * Provides rectangle corner/bounds utilities shared by templates & primitives.
 */

export interface Point {
  x: number;
  y: number;
}
export interface PriceTimeAnchor {
  price: number;
  time: unknown;
}

export interface CoordinateTransform {
  priceToCoordinate(price: number): number | null;
  coordinateToPrice(y: number): number | null;
  timeToCoordinate(time: unknown): number | null;
  coordinateToTime(x: number): unknown;
}

export interface GeometryEnvironment {
  coordinateTransform: CoordinateTransform;
}

/**
 * Convert a pixel point to a price/time anchor using the environment transforms.
 */
export function pointToPriceTime(env: GeometryEnvironment, point: Point): PriceTimeAnchor | null {
  const price = env.coordinateTransform.coordinateToPrice(point.y);
  const time = env.coordinateTransform.coordinateToTime(point.x);
  if (price == null || time == null) { return null; }
  return { price: price as number, time };
}

/**
 * Calculate rectangle bounds in pixel space for two price/time anchors.
 */
export function rectBoundsPx(
  env: GeometryEnvironment,
  start: PriceTimeAnchor | null,
  end: PriceTimeAnchor | null
): { left: number; right: number; top: number; bottom: number } | null {
  if (!start || !end) { return null; }
  const x1 = env.coordinateTransform.timeToCoordinate(start.time);
  const x2 = env.coordinateTransform.timeToCoordinate(end.time);
  const y1 = env.coordinateTransform.priceToCoordinate(start.price);
  const y2 = env.coordinateTransform.priceToCoordinate(end.price);
  if (x1 == null || x2 == null || y1 == null || y2 == null) { return null; }
  const left = Math.min(x1 as number, x2 as number);
  const right = Math.max(x1 as number, x2 as number);
  const top = Math.min(y1 as number, y2 as number);
  const bottom = Math.max(y1 as number, y2 as number);
  return { left, right, top, bottom };
}

/**
 * Calculate rectangle corner positions in pixel space.
 */
export function rectCornersPx(
  env: GeometryEnvironment,
  start: PriceTimeAnchor | null,
  end: PriceTimeAnchor | null
): { topLeft: Point; topRight: Point; bottomLeft: Point; bottomRight: Point } | null {
  const bounds = rectBoundsPx(env, start, end);
  if (!bounds) { return null; }
  const { left, right, top, bottom } = bounds;
  const topLeft: Point = { x: left, y: top };
  const topRight: Point = { x: right, y: top };
  const bottomLeft: Point = { x: left, y: bottom };
  const bottomRight: Point = { x: right, y: bottom };
  return { topLeft, topRight, bottomLeft, bottomRight };
}

/**
 * Normalize two anchors (utility placeholder for future geometry families).
 * Currently returns them as-is; can be extended to enforce ordering or tolerance.
 */
export function normalizeAnchors(
  start: PriceTimeAnchor | null,
  end: PriceTimeAnchor | null
): { start: PriceTimeAnchor; end: PriceTimeAnchor } | null {
  if (!start || !end) { return null; }
  return { start, end };
}