// The tower itself: how soft serve grows while the nozzle is held, how the
// stack leans and sways as it climbs, and when it gives up and topples.
// Layers are recorded every LAYER_STEP pixels; score.js grades them later.

import { GROW_PER_SECOND, LAYER_STEP, RADIUS_BASE, RADIUS_TIP, toppleLimit } from './config.js';

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
 * Advance the tower. `steer` is where the player wants the top, in pixels
 * from the cone's centre (pointer or keys). While held, the serve grows and
 * the sway grows with it; released, the stack settles a little.
 */
export function updateTower(tw, dt, holding, steer) {
  if (tw.toppled) {
    tw.toppleT += dt;
    return;
  }
  if (tw.finished) return;
  tw.holding = holding;
  tw.swayPhase += dt * (2.1 + tw.heightPx * 0.006);

  if (holding) {
    const before = tw.heightPx;
    tw.heightPx += GROW_PER_SECOND * dt;
    // Record a scoring layer each LAYER_STEP of new height.
    let mark = Math.floor(before / LAYER_STEP) * LAYER_STEP + LAYER_STEP;
    while (mark <= tw.heightPx) {
      tw.layers.push({ dx: tw.lean, r: radiusAt(mark), y: mark });
      mark += LAYER_STEP;
    }
    // The sway pushes harder the taller the stack stands.
    const swayForce = Math.sin(tw.swayPhase) * (10 + tw.heightPx * 0.11);
    tw.leanVel += swayForce * dt;
    tw.leanVel += (steer - tw.lean) * dt * 7.5;
    tw.leanVel *= Math.exp(-dt * 2.6);
    tw.lean += tw.leanVel * dt;
    if (tw.heightPx > 55 && Math.abs(tw.lean) > toppleLimit(tw.heightPx)) {
      tw.toppled = true;
      tw.toppleT = 0;
    }
  } else {
    // Released hands: the stack settles back toward centre, slowly.
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

/** How jerky the steering was: mean step between neighbouring layers' centres. */
export function smoothness(tw) {
  if (tw.layers.length < 2) return 0;
  let sum = 0;
  for (let i = 1; i < tw.layers.length; i += 1) {
    sum += Math.abs(tw.layers[i].dx - tw.layers[i - 1].dx);
  }
  return sum / (tw.layers.length - 1);
}
