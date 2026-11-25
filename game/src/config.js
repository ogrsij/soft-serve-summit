// Shared constants for Soft Serve Summit: field size, palette and tower physics.

export const FIELD = { width: 1280, height: 800 };

/** Warm atelier palette, used by every drawing helper in render.js. */
export const INK = '#4a2f1d';
export const PAPER = '#fff6e3';
export const CREAM = '#f7e7c8';
export const WOOD = '#a06a35';
export const WOOD_DARK = '#7c4f24';
export const WALL = '#f6dcb2';
export const RED = '#e4572e';
export const GREEN = '#5da85f';
export const GOLD = '#f2b234';
export const PINK = '#f6a8b8';

/** Where the cone stands, and the soft serve machine beside it. */
export const CONE_X = 640;
export const CONE_TOP_Y = 560;
export const FLOOR_Y = 726;

/** Tower growth: pixels of height a second of holding buys. */
export const GROW_PER_SECOND = 58;
/** A scoring layer is recorded every time the tower grows this many pixels. */
export const LAYER_STEP = 7;
/** Radius of the bottom swirl and of the tip, in pixels. Plump on purpose:
 * a real serve spills a little over the cone's rim. */
export const RADIUS_BASE = 58;
export const RADIUS_TIP = 21;

/** Lean (pixels of top offset) that topples the tower, by height: taller is touchier. */
export function toppleLimit(heightPx) {
  return Math.max(30, 60 - heightPx * 0.055);
}

/** Customers in one day at the atelier. */
export const CUSTOMERS_PER_DAY = 5;
/** Patience seconds a customer brings; what is left becomes the tip. */
export const PATIENCE_SECONDS = 42;
