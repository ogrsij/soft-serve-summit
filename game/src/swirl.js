// The hand on the cone: how the player's circling is read. Soft serve is
// laid by tracing circles around the guide ring — never by holding still.
// Two things are measured separately, because they are two skills:
//   roundness — how circular the traced path is around its OWN centre
//               (a clean lap, wherever it is centred, lays an even swirl);
//   centroid  — where that centre sits against the guide's centre.
//               Circling off-centre lays the new cream off-centre, which
//               is how a leaning tower is talked back upright: lean right,
//               circle a little left, and the stack walks home.
// Both are graded over the last full turn of travel, so the reading is
// about the circle actually traced, not a fragment of arc. Rotation is
// accumulated signed, so wiggling back and forth lays nothing: only
// honest circling grows the tower.

import { GUIDE_X, GUIDE_Y } from './config.js';

/** Seconds of trail the renderer keeps glowing behind the finger. */
const TRAIL_SECONDS = 1.5;
/** Pointer closer than this to the guide centre has no usable angle. */
const MIN_RADIUS = 16;
/** One pointer event may claim at most this much turn (radians). */
const MAX_STEP = 0.7;
const FULL_TURN = Math.PI * 2;
/** Roundness at or above this reads as a clean lap (the ring's gold). */
const CLEAN_ROUNDNESS = 0.7;
/** Clean laps after which the tracing guide fades away for the serve. */
export const GUIDE_FADE_LAPS = 3;
/** Seconds the guide takes to fade once the laps are proven. */
const GUIDE_FADE_SECONDS = 0.65;

/** A fresh tracker: no hand on the cone yet. */
export function createSwirl() {
  return {
    active: false,        // the pointer is down on the field
    spin: 0,              // signed radians banked since the last frame
    lastTheta: null,      // last pointer angle around the guide centre
    lastPoint: null,      // last pointer point, for the near-centre guard
    cumAngle: 0,          // signed radians turned since the press began
    totalAbs: 0,          // unsigned radians turned since the press began
    samples: [],          // {x, y, cum} of this press, for the grading window
    statsAt: 0,           // cumAngle where the window was last graded
    laps: 0,              // full turns this serve
    serveAngle: 0,        // signed radians banked this serve, across presses
    lapMark: 0,           // serveAngle magnitude already counted into laps
    cleanLaps: 0,         // full turns this serve whose grading read clean
    guideFadeStart: null, // clock time the guide began to fade, if it has
    centroidX: 0,         // smoothed lap centre, px from the guide centre
    roundness: 0.8,       // smoothed lap roundness, 0..1 (neutral at first)
    lastQuality: 0,       // roundness of the freshest grading, for the glow
    trail: [],            // recent pointer points {x, y, t} for the ribbon
    lastSpinT: -9,        // clock time of the last honest rotation
    holdPose: false,      // screenshot scenes may freeze a mid-swirl pose
  };
}

/** The tracker's clock: seconds, matching the trail's fade. */
export function swirlClock() {
  return performance.now() / 1000;
}

function pushTrail(sw, x, y) {
  const t = swirlClock();
  sw.trail.push({ x, y, t });
  while (sw.trail.length && (t - sw.trail[0].t > TRAIL_SECONDS || sw.trail.length > 110)) {
    sw.trail.shift();
  }
}

/** Angle of a point around the guide centre, or null when too close in. */
function thetaOf(x, y) {
  const dx = x - GUIDE_X;
  const dy = y - GUIDE_Y;
  if (Math.hypot(dx, dy) < MIN_RADIUS) return null;
  return Math.atan2(dy, dx);
}

/** The finger lands: start reading its circles. */
export function swirlBegin(sw, x, y) {
  sw.active = true;
  sw.lastTheta = thetaOf(x, y);
  sw.lastPoint = { x, y };
  sw.cumAngle = 0;
  sw.totalAbs = 0;
  sw.statsAt = 0;
  sw.samples = [{ x, y, cum: 0 }];
  pushTrail(sw, x, y);
}

/** The finger lifts: the hand leaves the cone. */
export function swirlEnd(sw) {
  sw.active = false;
  sw.lastTheta = null;
  sw.lastPoint = null;
  sw.samples = [];
}

/**
 * Grade the last full turn of travel: the shape of the path around its
 * own centre (roundness), and where that centre sat (centroid). Called
 * every quarter turn, always over a full turn of samples, so a fragment
 * of arc can neither fake nor ruin the reading.
 */
function gradeWindow(sw) {
  sw.statsAt = sw.cumAngle;
  const dir = sw.cumAngle >= 0 ? 1 : -1;
  const from = sw.cumAngle - dir * FULL_TURN;
  const lo = Math.min(from, sw.cumAngle);
  const hi = Math.max(from, sw.cumAngle);
  const pts = sw.samples.filter((s) => s.cum >= lo && s.cum <= hi);
  if (pts.length < 10) return;
  let cx = 0;
  let cy = 0;
  for (const p of pts) { cx += p.x; cy += p.y; }
  cx /= pts.length;
  cy /= pts.length;
  let meanR = 0;
  const radii = pts.map((p) => Math.hypot(p.x - cx, p.y - cy));
  for (const r of radii) meanR += r;
  meanR /= radii.length;
  if (meanR <= 4) return;
  let varR = 0;
  for (const r of radii) varR += (r - meanR) * (r - meanR);
  const stdR = Math.sqrt(varR / radii.length);
  const roundness = Math.max(0, Math.min(1, 1 - (stdR / meanR) * 2.4));
  sw.lastQuality = roundness;
  // Smooth both readings so one ragged passage cannot jerk the tower.
  sw.roundness = sw.roundness * 0.5 + roundness * 0.5;
  sw.centroidX = sw.centroidX * 0.45 + (cx - GUIDE_X) * 0.55;
  // Count this serve's clean laps off this same full-turn grading:
  // every time the banked turn crosses another full circle, the
  // freshest window's roundness decides whether that lap was clean.
  while (Math.abs(sw.serveAngle) - sw.lapMark >= FULL_TURN) {
    sw.lapMark += FULL_TURN;
    if (roundness >= CLEAN_ROUNDNESS) sw.cleanLaps += 1;
  }
  if (sw.cleanLaps >= GUIDE_FADE_LAPS && sw.guideFadeStart === null) {
    sw.guideFadeStart = swirlClock();
  }
}

/** The finger moves: bank its turn, and grade the window as it fills. */
export function swirlMove(sw, x, y) {
  if (!sw.active) return;
  pushTrail(sw, x, y);
  const theta = thetaOf(x, y);
  if (theta === null) return;
  if (sw.lastTheta === null) {
    sw.lastTheta = theta;
    sw.lastPoint = { x, y };
    sw.samples.push({ x, y, cum: sw.cumAngle });
    return;
  }
  // A step that passes near the centre proves nothing about circling —
  // the angle flips there — so it banks no turn. (A straight drag back
  // and forth through the middle must not farm swirls.)
  const nearCentre = Math.min(
    Math.hypot(x - GUIDE_X, y - GUIDE_Y),
    Math.hypot(sw.lastPoint.x - GUIDE_X, sw.lastPoint.y - GUIDE_Y),
  ) < MIN_RADIUS * 2.1;
  let d = theta - sw.lastTheta;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  d = Math.max(-MAX_STEP, Math.min(MAX_STEP, d));
  sw.lastTheta = theta;
  sw.lastPoint = { x, y };
  sw.samples.push({ x, y, cum: sw.cumAngle });
  if (sw.samples.length > 900) sw.samples.splice(0, 300);
  if (d === 0 || nearCentre) return;
  sw.spin += d;
  sw.cumAngle += d;
  sw.serveAngle += d;
  sw.totalAbs += Math.abs(d);
  sw.laps = Math.floor(sw.totalAbs / FULL_TURN);
  sw.lastSpinT = swirlClock();
  // Fix the sample's angle tag now that this step's turn is known.
  sw.samples[sw.samples.length - 1].cum = sw.cumAngle;
  if (Math.abs(sw.cumAngle - sw.statsAt) >= Math.PI / 2) gradeWindow(sw);
}

/** Radians banked since the last frame; the tower grows by these alone. */
export function consumeSpin(sw) {
  const spun = sw.spin;
  sw.spin = 0;
  return spun;
}

/** True while the hand is honestly circling (or a shot holds the pose). */
export function isSpinning(sw, now) {
  if (!sw.active) return false;
  if (sw.holdPose) return true;
  return now - sw.lastSpinT < 0.3;
}

/**
 * How visible the tracing guide still is, 1..0. The ring and its
 * arrows are training wheels: once the hand has laid GUIDE_FADE_LAPS
 * clean laps they fade away over a breath, and the rest of the serve
 * is flown on feel — the centre cross and the lap-centre dot are not
 * the guide's to take, and they stay. Gone stays gone for the serve;
 * the next customer's fresh tracker brings the guide back.
 */
export function guideAlpha(sw, now) {
  if (sw.guideFadeStart === null) return 1;
  const t = (now - sw.guideFadeStart) / GUIDE_FADE_SECONDS;
  if (t >= 1) return 0;
  const s = t * t * (3 - 2 * t); // smoothstep: leaves softly, lands softly
  return 1 - s;
}
