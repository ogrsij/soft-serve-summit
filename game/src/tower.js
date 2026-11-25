// The tower itself: how soft serve grows while the cone is circled, how
// the stack leans and sways as it climbs, and when it gives up and
// topples. Layers are recorded every LAYER_STEP pixels, each with the
// roundness of the circling that laid it; score.js grades them later.
// The lean is not a fixed punishment: the drive's centroid — where the
// player centres their circles — is where the new cream lands, so a
// leaning tower can be circled back upright by a steady hand.

import { GROW_PER_RADIAN, LAYER_STEP, RADIUS_BASE, RADIUS_TIP, toppleLimit } from './config.js';

/** Radius of a swirl at height `h`: full at the cone, curling to a tip. */
export function radiusAt(h) {
  const t = Math.min(1, h / 430);
  return RADIUS_BASE + (RADIUS_TIP - RADIUS_BASE) * t;
}

/** A fresh, empty tower on its cone. */
export function createTower() {
  return {
    heightPx: 0,
    layers: [],
    lean: 0,
    leanVel: 0,
    swayPhase: 0,
    holding: false,
    toppled: false,
    toppleT: 0,
    finished: false,
  };
}

/**
 * Advance the tower. `drive` is the hand's work this frame, read by
 * swirl.js: { spinning, spinDelta, centroidX, roundness }. Height comes
 * from spinDelta alone — a still hand lays nothing. The lean springs
 * toward the centroid: circle centred and the stack stands straight;
 * circle against a lean and the new cream walks the top back home.
 * Clean circles also damp the sway, so recovery is a feel, not a fluke.
 */
export function updateTower(tw, dt, drive) {
  if (tw.toppled) {
    tw.toppleT += dt;
    return;
  }
  if (tw.finished) return;
  tw.holding = drive.spinning;
  tw.swayPhase += dt * (2.1 + tw.heightPx * 0.006);

  if (drive.spinning && Math.abs(drive.spinDelta) > 0) {
    const before = tw.heightPx;
    // Sloppy laps still lay cream, just less of it per turn.
    const efficiency = 0.55 + 0.45 * drive.roundness;
    tw.heightPx += Math.abs(drive.spinDelta) * GROW_PER_RADIAN * efficiency;
    // Record a scoring layer each LAYER_STEP of new height, stamped with
    // the roundness of the circling that laid it.
    let mark = Math.floor(before / LAYER_STEP) * LAYER_STEP + LAYER_STEP;
    while (mark <= tw.heightPx) {
      tw.layers.push({ dx: tw.lean, r: radiusAt(mark), y: mark, q: drive.roundness });
      mark += LAYER_STEP;
    }
    // The sway pushes harder the taller the stack stands, and ragged
    // circling shakes it; the hand's centre is the counterweight.
    const swayForce = Math.sin(tw.swayPhase) * (6 + tw.heightPx * 0.08)
      + Math.sin(tw.swayPhase * 1.7) * (1 - drive.roundness) * 22;
    tw.leanVel += swayForce * dt;
    const target = Math.max(-120, Math.min(120, drive.centroidX));
    tw.leanVel += (target - tw.lean) * dt * 7.5;
    tw.leanVel *= Math.exp(-dt * (2.4 + drive.roundness * 2.2));
    tw.lean += tw.leanVel * dt;
    if (tw.heightPx > 55 && Math.abs(tw.lean) > toppleLimit(tw.heightPx)) {
      tw.toppled = true;
      tw.toppleT = 0;
    }
  } else {
    // No circling, no growth: the stack settles back toward centre.
    tw.leanVel += (0 - tw.lean) * dt * 3.0;
    tw.leanVel *= Math.exp(-dt * 4.5);
    tw.lean += tw.leanVel * dt;
  }
}

/** Stop the serve where it stands (the player let go for good). */
export function finishTower(tw) {
  tw.finished = true;
  tw.holding = false;
}

/** Mean lean and worst lean across the recorded layers, for scoring. */
export function leanStats(tw) {
  if (tw.layers.length === 0) return { mean: 0, worst: 0 };
  let sum = 0;
  let worst = 0;
  for (const layer of tw.layers) {
    sum += Math.abs(layer.dx);
    worst = Math.max(worst, Math.abs(layer.dx));
  }
  return { mean: sum / tw.layers.length, worst };
}

/** Mean roundness of the circling that laid the layers (1 = perfect laps). */
export function roundnessMean(tw) {
  if (tw.layers.length === 0) return 0.85;
  let sum = 0;
  for (const layer of tw.layers) sum += layer.q ?? 0.85;
  return sum / tw.layers.length;
}

/** How jerky the steering was: mean step between neighbouring layers' centres. */
export function smoothness(tw) {
  if (tw.layers.length < 2) return 0;
  let sum = 0;
  for (let i = 1; i < tw.layers.length; i += 1) {
    sum += Math.abs(tw.layers[i].dx - tw.layers[i - 1].dx);
  }
  return sum / (tw.layers.length - 1);
}
