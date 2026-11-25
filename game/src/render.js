// Every pixel of Soft Serve Summit: the atelier, the machine, the tower,
// the customers and the cards. Pure canvas, flat colours, warm light.
// LAYOUT is shared with input.js so buttons are drawn and hit in one place.

import { FIELD, INK, PAPER, CREAM, WOOD, WOOD_DARK, WALL, RED, GREEN, GOLD, PINK, CONE_X, CONE_TOP_Y, FLOOR_Y, GUIDE_X, GUIDE_Y, GUIDE_R, SHIFTS, SHIFT_ORDER } from './config.js';
import { FLAVOURS, CONES, TOPPINGS, TOPPING_ORDER, CONE_ORDER, FLAVOUR_ORDER, HEIGHT_GOALS, TRAITS, CUSTOMER_PLAN, pxToCm } from './menu.js';
import { radiusAt } from './tower.js';
import { isSpinning, swirlClock } from './swirl.js';
import { SCREEN_TITLE, SCREEN_SERVE, SCREEN_TOP, SCREEN_CARD, SCREEN_OVER, STEP_CONE, STEP_FLAVOUR, STEP_SWIRL, gradeRank } from './game.js';

export const LAYOUT = {
  doneBtn: { x: 520, y: 726, w: 240, h: 56 },
  serveBtn: { x: 1000, y: 714, w: 224, h: 56 },
  trayBtn: { x: 250, y: 714, w: 230, h: 56 },
  nextBtn: { x: 520, y: 664, w: 240, h: 54 },
  againBtn: { x: 520, y: 690, w: 240, h: 54 },
  muteBtn: { x: 1218, y: 12, w: 46, h: 46 },
  toppingBtn: (i) => ({ x: 196 + i * 148, y: 706, w: 132, h: 62 }),
  coneBtn: (i) => ({ x: 170 + i * 320, y: 694, w: 300, h: 92 }),
  coneMiniBtn: (i) => ({ x: 391 + i * 170, y: 712, w: 158, h: 62 }),
  tankBtn: (i) => ({ x: 64 + i * 50, y: 116, w: 44, h: 54 }),
  shiftBtn: (i) => ({ x: 92 + i * 372, y: 678, w: 352, h: 44 }),
  openBtn: { x: 470, y: 734, w: 340, h: 50 },
};

/** Rounded-rectangle path (the house style: everything is a little round). */
export function rr(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function fillRr(ctx, x, y, w, h, r, colour) {
  rr(ctx, x, y, w, h, r);
  ctx.fillStyle = colour;
  ctx.fill();
}

function text(ctx, str, x, y, size, colour, align = 'center', weight = 'bold') {
  ctx.font = `${weight} ${size}px "Trebuchet MS", "Segoe UI", sans-serif`;
  ctx.fillStyle = colour;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

/** The room: tiled wall, a sunny window, the counter and its wooden front. */
function drawRoom(ctx, state) {
  ctx.fillStyle = WALL;
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  ctx.strokeStyle = 'rgba(160,110,50,0.16)';
  ctx.lineWidth = 2;
  for (let x = 0; x < FIELD.width; x += 64) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 452); ctx.stroke();
  }
  for (let y = 32; y < 452; y += 64) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(FIELD.width, y); ctx.stroke();
  }
  // Window with a striped awning, left of the ticket board. The view is
  // clipped to the frame, and the hills are grounded on the frame's
  // bottom edge, so nothing floats past the wood.
  ctx.save();
  rr(ctx, 372, 66, 210, 196, 12); ctx.clip();
  ctx.fillStyle = '#bfe6f5';
  ctx.fillRect(372, 66, 210, 196);
  ctx.fillStyle = '#ffe9a8';
  ctx.beginPath(); ctx.arc(430, 116, 26, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath(); ctx.ellipse(516, 104, 30, 11, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(538, 96, 20, 9, 0, 0, Math.PI * 2); ctx.fill();
  // Hills, both feet planted on the window's bottom edge (y = 262).
  ctx.fillStyle = '#8fce7e';
  ctx.beginPath(); ctx.ellipse(420, 268, 110, 34, 0, Math.PI, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#a8d8a0';
  ctx.beginPath(); ctx.ellipse(520, 268, 120, 44, 0, Math.PI, Math.PI * 2); ctx.fill();
  // One small tree on the nearer hill.
  ctx.fillStyle = '#7c4f24';
  ctx.fillRect(488, 224, 5, 14);
  ctx.fillStyle = '#5da85f';
  ctx.beginPath(); ctx.arc(490, 214, 15, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(479, 224, 10, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(501, 224, 10, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = WOOD_DARK; ctx.lineWidth = 6;
  rr(ctx, 372, 66, 210, 196, 12); ctx.stroke();
  for (let i = 0; i < 5; i += 1) {
    ctx.fillStyle = i % 2 ? '#fff6e3' : RED;
    ctx.beginPath();
    ctx.moveTo(366 + i * 44, 66); ctx.lineTo(410 + i * 44, 66);
    ctx.lineTo(404 + i * 44, 44); ctx.lineTo(372 + i * 44, 44);
    ctx.closePath(); ctx.fill();
  }
  // Counter: pale slab, warm wooden front.
  ctx.fillStyle = '#e8c188';
  ctx.fillRect(0, 452, FIELD.width, 34);
  ctx.fillStyle = WOOD;
  ctx.fillRect(0, 486, FIELD.width, FIELD.height - 486);
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  for (let x = 40; x < FIELD.width; x += 120) ctx.fillRect(x, 486, 3, FIELD.height - 486);
  // Hanging sign.
  fillRr(ctx, 448, 8, 384, 44, 12, WOOD_DARK);
  text(ctx, 'SOFT SERVE SUMMIT — atelier', 640, 31, 24, '#ffe9a8');
}

/**
 * The soft serve machine: five flavour tanks on top — the flavour step
 * is played right here, by tapping one — a lever, a happy face.
 */
function drawMachine(ctx, state) {
  const x = 52, y = 168, w = 268, h = 318;
  fillRr(ctx, x, y, w, h, 20, '#f2f0e9');
  ctx.fillStyle = '#d9d4c7';
  ctx.fillRect(x, y + h - 46, w, 46);
  fillRr(ctx, x + 18, y + 60, w - 36, 150, 14, '#fdfcf7');
  // Tanks on top, one per flavour, in the machine's own colours. While
  // the flavour step is open they pulse gold — tap me! — and the chosen
  // one wears a steady gold ring and a tick.
  const choosing = state.screen === SCREEN_SERVE && state.step === STEP_FLAVOUR;
  FLAVOUR_ORDER.forEach((id, i) => {
    const rect = LAYOUT.tankBtn(i);
    const colour = FLAVOURS[id].body;
    if (choosing) {
      const pulse = 0.55 + Math.sin(state.time * 5 + i * 0.7) * 0.35;
      ctx.save();
      ctx.globalAlpha = pulse;
      ctx.strokeStyle = GOLD; ctx.lineWidth = 3.5;
      rr(ctx, rect.x - 4, rect.y - 4, rect.w + 8, rect.h + 8, 12); ctx.stroke();
      ctx.restore();
    }
    fillRr(ctx, rect.x, rect.y, rect.w, rect.h, 10, colour);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillRect(rect.x + 7, rect.y + 7, 9, rect.h - 16);
    if (state.selFlavour === id) {
      ctx.strokeStyle = GOLD; ctx.lineWidth = 4;
      rr(ctx, rect.x - 2, rect.y - 2, rect.w + 4, rect.h + 4, 11); ctx.stroke();
      ctx.fillStyle = GOLD;
      ctx.beginPath(); ctx.arc(rect.x + rect.w - 4, rect.y + 2, 10, 0, Math.PI * 2); ctx.fill();
      text(ctx, '✓', rect.x + rect.w - 4, rect.y + 3, 14, '#fff6e3');
    }
  });
  fillRr(ctx, x + 8, y - 8, w - 16, 10, 5, '#d9d4c7');
  // Face: two eyes and a smile — the machine is pleased to see you, and
  // squeezes its eyes shut with joy for a moment when a flavour lands.
  const happy = state.time < (state.happyFaceUntil || 0);
  ctx.fillStyle = INK;
  ctx.strokeStyle = INK;
  if (happy) {
    ctx.lineWidth = 4.5; ctx.lineCap = 'round';
    for (const ex of [x + 92, x + 176]) {
      ctx.beginPath(); ctx.arc(ex, y + 120, 10, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
    }
  } else {
    ctx.beginPath(); ctx.arc(x + 92, y + 116, 9, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 176, y + 116, 9, 0, Math.PI * 2); ctx.fill();
  }
  ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(x + 134, y + 128, happy ? 30 : 26, 0.25 * Math.PI, 0.75 * Math.PI); ctx.stroke();
  // Lever and nozzle over the drip tray.
  fillRr(ctx, x + 196, y + 84, 16, 74, 8, '#b8b2a4');
  ctx.fillStyle = RED;
  ctx.beginPath(); ctx.arc(x + 204, y + 78, 13, 0, Math.PI * 2); ctx.fill();
  fillRr(ctx, x + 30, y + h - 92, w - 60, 14, 7, '#b8b2a4');
  text(ctx, 'twirl-o-matic 3000', x + w / 2, y + h - 22, 17, '#8a8272');
}

/** The little steel stand: a post down to a base, and — while it waits
 * empty — a ring at rim height where the cone will sit. */
function drawStand(ctx, cx = CONE_X, postTopY = CONE_TOP_Y + 100, ringY = null) {
  ctx.fillStyle = '#b8b2a4';
  ctx.fillRect(cx - 6, postTopY, 12, FLOOR_Y - postTopY);
  ctx.beginPath(); ctx.ellipse(cx, FLOOR_Y, 54, 10, 0, 0, Math.PI * 2); ctx.fill();
  if (ringY !== null) {
    ctx.beginPath(); ctx.ellipse(cx, ringY, 30, 8, 0, 0, Math.PI * 2); ctx.fill();
  }
}

/** A cone (or cake cup) standing in its holder at CONE_X. */
export function drawCone(ctx, coneId, cx = CONE_X, topY = CONE_TOP_Y) {
  const cone = CONES[coneId];
  if (coneId === 'cup') {
    // The Cake Cone: a flat-topped wafer cup — trapezoid walls, a crisp
    // rim, and the wafer's horizontal bake stripes.
    ctx.fillStyle = cone.body;
    ctx.beginPath();
    ctx.moveTo(cx - 46, topY); ctx.lineTo(cx + 46, topY);
    ctx.lineTo(cx + 32, topY + 96); ctx.lineTo(cx - 32, topY + 96);
    ctx.closePath(); ctx.fill();
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - 46, topY); ctx.lineTo(cx + 46, topY);
    ctx.lineTo(cx + 32, topY + 96); ctx.lineTo(cx - 32, topY + 96);
    ctx.closePath(); ctx.clip();
    ctx.strokeStyle = cone.line; ctx.lineWidth = 3;
    for (let y = topY + 18; y < topY + 96; y += 15) {
      ctx.beginPath(); ctx.moveTo(cx - 48, y); ctx.lineTo(cx + 48, y); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(cx - 46, topY, 14, 96);
    ctx.restore();
    ctx.fillStyle = '#f7dc9e';
    ctx.fillRect(cx - 49, topY - 6, 98, 10);
    ctx.strokeStyle = cone.line; ctx.lineWidth = 2.5;
    ctx.strokeRect(cx - 49, topY - 6, 98, 10);
    drawStand(ctx, cx, topY + 96);
    return;
  }
  // Waffle and Sugar share the pointed body; sugar runs darker,
  // narrower and longer, with a finer hatch.
  const sugar = coneId === 'choc';
  const halfW = sugar ? 38 : 46;
  const len = sugar ? 132 : 118;
  ctx.fillStyle = cone.body;
  ctx.beginPath();
  ctx.moveTo(cx - halfW, topY); ctx.lineTo(cx + halfW, topY);
  ctx.lineTo(cx, topY + len);
  ctx.closePath(); ctx.fill();
  // The waffle cross-hatch, clipped to the cone so it never spills.
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx - halfW, topY); ctx.lineTo(cx + halfW, topY);
  ctx.lineTo(cx, topY + len);
  ctx.closePath(); ctx.clip();
  ctx.strokeStyle = cone.line; ctx.lineWidth = sugar ? 2 : 2.5;
  const step = sugar ? 15 : 20;
  for (let i = -3; i <= 3; i += 1) {
    ctx.beginPath();
    ctx.moveTo(cx + i * step - 12, topY + 8); ctx.lineTo(cx + i * 8, topY + len - 10);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + i * step + 12, topY + 8); ctx.lineTo(cx - i * 8, topY + len - 10);
    ctx.stroke();
  }
  ctx.restore();
  ctx.fillStyle = 'rgba(0,0,0,0.13)';
  ctx.fillRect(cx - halfW, topY, halfW * 2, 8);
  drawStand(ctx, cx, topY + len);
}

/** A pocket-size cone for the choice cards: same three silhouettes. */
function drawMiniCone(ctx, coneId, cx, topY) {
  const cone = CONES[coneId];
  ctx.fillStyle = cone.body;
  if (coneId === 'cup') {
    ctx.beginPath();
    ctx.moveTo(cx - 23, topY); ctx.lineTo(cx + 23, topY);
    ctx.lineTo(cx + 16, topY + 48); ctx.lineTo(cx - 16, topY + 48);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = cone.line; ctx.lineWidth = 2;
    for (let y = topY + 12; y < topY + 48; y += 11) {
      ctx.beginPath(); ctx.moveTo(cx - 22, y); ctx.lineTo(cx + 22, y); ctx.stroke();
    }
    ctx.fillStyle = '#f7dc9e';
    ctx.fillRect(cx - 25, topY - 4, 50, 6);
    return;
  }
  const sugar = coneId === 'choc';
  const halfW = sugar ? 17 : 21;
  const len = sugar ? 56 : 50;
  ctx.beginPath();
  ctx.moveTo(cx - halfW, topY); ctx.lineTo(cx + halfW, topY);
  ctx.lineTo(cx, topY + len);
  ctx.closePath(); ctx.fill();
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx - halfW, topY); ctx.lineTo(cx + halfW, topY);
  ctx.lineTo(cx, topY + len);
  ctx.closePath(); ctx.clip();
  ctx.strokeStyle = cone.line; ctx.lineWidth = 1.8;
  for (let i = -2; i <= 2; i += 1) {
    ctx.beginPath(); ctx.moveTo(cx + i * 9 - 6, topY + 4); ctx.lineTo(cx + i * 4, topY + len - 4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + i * 9 + 6, topY + 4); ctx.lineTo(cx - i * 4, topY + len - 4); ctx.stroke();
  }
  ctx.restore();
}

/** Blend two hex colours: t = 0 gives `a`, t = 1 gives `b`. */
function mixHex(a, b, t) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

/** Vertical rise of one full turn of the piped rope, in pixels. */
const TURN_PITCH = 33;

/** The warm greige every cream shadow leans toward — never a hard grey. */
const WARM_SHADOW = '#7d6242';

/** A flavour's shadow side: its own colour pulled toward warm greige. */
function shadowOf(flavour, t) {
  return mixHex(flavour.body, WARM_SHADOW, t);
}

/** Radius of the rope itself (its tube) at height `y`. */
function tubeRadiusAt(y) {
  return Math.min(21, Math.max(10.5, radiusAt(y) * 0.68));
}

/**
 * The tower's half-widths at height `y`: the taper, breathed on by two
 * slow organic swells, and bulged where the rope itself passes each
 * edge — the left edge swells half a turn after the right, so the
 * silhouette undulates like a coil instead of a turned post.
 */
function edgeWidths(y) {
  const phase = (Math.PI * 2 * y) / TURN_PITCH;
  const wob = 1 + 0.045 * Math.sin(y * 0.052 + 1.7) + 0.03 * Math.sin(y * 0.021 + 0.4);
  const base = radiusAt(y) * wob;
  const bulge = Math.min(0.05, (tubeRadiusAt(y) * 0.17) / Math.max(1, base));
  return {
    l: base * (1 + bulge * Math.cos(phase - Math.PI)),
    r: base * (1 + bulge * Math.cos(phase)),
    mid: base,
  };
}

/** Stroke a point list as a soft, feathered band: three widening passes. */
function softStroke(ctx, pts, width, colour, alpha) {
  if (pts.length < 2) return;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const passes = [[1.75, 0.2], [1.15, 0.38], [0.68, 0.62]];
  for (const [scale, share] of passes) {
    ctx.strokeStyle = colour;
    ctx.globalAlpha = alpha * share;
    ctx.lineWidth = Math.max(1, width * scale);
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length - 1; i += 1) {
      const mx = (pts[i].x + pts[i + 1].x) / 2;
      const my = (pts[i].y + pts[i + 1].y) / 2;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
    }
    const last = pts[pts.length - 1];
    ctx.lineTo(last.x, last.y);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Points along one turn of the helix as it crosses the front of the
 * tower, lifted `lift` pixels above the turn's ridge line. Across the
 * front the rope climbs half a pitch from the right edge to the left;
 * that diagonal flow is what makes the stack read as one continuous
 * spiral of whipped cream instead of a pile of separate rings.
 */
function ridgePoints(tower, cx, topY, k, lift) {
  const pts = [];
  for (let i = 0; i <= 12; i += 1) {
    const u = -1 + (i / 12) * 2;
    const theta = Math.acos(Math.max(-1, Math.min(1, u)));
    const y = k * TURN_PITCH + (TURN_PITCH / (Math.PI * 2)) * theta + lift;
    pts.push({ x: cx + dxAt(tower, y) + u * edgeWidths(y).mid * 0.99, y: topY - y });
  }
  return pts;
}

/** The tower's outline as a Path2D, crowned with a soft dome. */
function towerSilhouette(tower, cx, topY) {
  const H = tower.heightPx;
  const ys = [];
  for (let y = 0; y <= H; y += 3) ys.push(y);
  if (ys[ys.length - 1] < H) ys.push(H);
  const leftPts = ys.map((y) => ({ x: cx + dxAt(tower, y) - edgeWidths(y).l, y: topY - y }));
  const rightPts = ys.map((y) => ({ x: cx + dxAt(tower, y) + edgeWidths(y).r, y: topY - y }));
  const path = new Path2D();
  path.moveTo(leftPts[0].x, leftPts[0].y + 3);
  for (const p of leftPts) path.lineTo(p.x, p.y);
  const topAxis = cx + dxAt(tower, H);
  const topRight = rightPts[rightPts.length - 1];
  path.quadraticCurveTo(topAxis, topY - H - 7, topRight.x, topRight.y);
  for (let i = rightPts.length - 1; i >= 0; i -= 1) path.lineTo(rightPts[i].x, rightPts[i].y);
  path.closePath();
  return path;
}

/** The curled peak at the very top: a plump teardrop with a flicked curl. */
function drawTip(ctx, cx, cy, r, flavour) {
  const w = Math.max(10, r * 0.55);
  const h = Math.max(22, r * 1.05);
  const grad = ctx.createLinearGradient(0, cy - h, 0, cy + 4);
  grad.addColorStop(0, mixHex(flavour.body, '#ffffff', 0.5));
  grad.addColorStop(0.55, flavour.body);
  grad.addColorStop(1, shadowOf(flavour, 0.34));
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(cx - w, cy + 4);
  ctx.quadraticCurveTo(cx - w * 0.85, cy - h * 0.7, cx + w * 0.1, cy - h * 0.92);
  ctx.quadraticCurveTo(cx + w * 0.72, cy - h * 1.06, cx + w * 0.78, cy - h * 0.6);
  ctx.quadraticCurveTo(cx + w * 0.9, cy - h * 0.2, cx + w, cy + 4);
  ctx.quadraticCurveTo(cx, cy + w * 0.28, cx - w, cy + 4);
  ctx.closePath(); ctx.fill();
  // The little flick where the peak curls over.
  ctx.strokeStyle = mixHex(flavour.body, '#ffffff', 0.28);
  ctx.lineWidth = Math.max(3.5, r * 0.14);
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(cx + w * 0.34, cy - h * 0.9, w * 0.3, Math.PI * 0.75, Math.PI * 1.95); ctx.stroke();
  // A soft sheen on the peak's shoulder — whipped, not glossy.
  ctx.fillStyle = 'rgba(255,255,255,0.26)';
  ctx.beginPath(); ctx.ellipse(cx - w * 0.3, cy - h * 0.42, w * 0.26, h * 0.16, -0.4, 0, Math.PI * 2); ctx.fill();
}

/** A tiny four-point sparkle, for finished serves. */
function drawSparkle(ctx, x, y, s, colour) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.moveTo(x, y - s);
  ctx.quadraticCurveTo(x, y, x + s, y);
  ctx.quadraticCurveTo(x, y, x, y + s);
  ctx.quadraticCurveTo(x, y, x - s, y);
  ctx.quadraticCurveTo(x, y, x, y - s);
  ctx.closePath(); ctx.fill();
}

/** The tower's centre offset at height `y`, smoothed from its layers. */
function dxAt(tower, y) {
  const layers = tower.layers;
  if (!layers.length) return tower.lean || 0;
  if (y <= layers[0].y) return layers[0].dx;
  for (let i = 1; i < layers.length; i += 1) {
    if (y <= layers[i].y) {
      const a = layers[i - 1];
      const b = layers[i];
      const t = (y - a.y) / Math.max(1, b.y - a.y);
      return a.dx + (b.dx - a.dx) * t;
    }
  }
  return layers[layers.length - 1].dx;
}

/** Toppings, drawn at the tower's crown once chosen. */
function drawToppings(ctx, toppings, cx, cy, flavour) {
  for (const id of toppings) {
    if (id === 'sauce') {
      ctx.fillStyle = TOPPINGS.sauce.colour;
      ctx.beginPath(); ctx.ellipse(cx, cy - 2, 20, 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(cx - 16, cy - 2, 6, 14); ctx.fillRect(cx + 4, cy - 2, 6, 18); ctx.fillRect(cx + 12, cy - 2, 5, 11);
    } else if (id === 'cherry') {
      ctx.strokeStyle = '#5d7d3a'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(cx + 8, cy - 12); ctx.quadraticCurveTo(cx + 16, cy - 26, cx + 24, cy - 24); ctx.stroke();
      ctx.fillStyle = TOPPINGS.cherry.colour;
      ctx.beginPath(); ctx.arc(cx + 6, cy - 8, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath(); ctx.arc(cx + 3, cy - 11, 3.4, 0, Math.PI * 2); ctx.fill();
    } else if (id === 'sprinkle') {
      const cols = ['#e4572e', '#f2b234', '#5da85f', '#4d93b8', '#d1607f'];
      for (let i = 0; i < 14; i += 1) {
        const a = (i / 14) * Math.PI * 2;
        ctx.strokeStyle = cols[i % cols.length]; ctx.lineWidth = 3;
        const sx = cx + Math.cos(a) * 15, sy = cy - 4 + Math.sin(a) * 5;
        ctx.beginPath(); ctx.moveTo(sx - 3, sy); ctx.lineTo(sx + 3, sy + 2); ctx.stroke();
      }
    } else if (id === 'wafer') {
      ctx.save();
      ctx.translate(cx + 16, cy - 16); ctx.rotate(0.5);
      ctx.fillStyle = TOPPINGS.wafer.colour;
      ctx.fillRect(-5, -34, 10, 40);
      ctx.strokeStyle = '#b57a35'; ctx.lineWidth = 2;
      for (let i = 0; i < 4; i += 1) { ctx.beginPath(); ctx.moveTo(-5, -28 + i * 9); ctx.lineTo(5, -24 + i * 9); ctx.stroke(); }
      ctx.restore();
    } else if (id === 'star') {
      ctx.fillStyle = TOPPINGS.star.colour;
      ctx.beginPath();
      for (let i = 0; i < 10; i += 1) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const r = i % 2 === 0 ? 13 : 5.5;
        const px = cx - 12 + Math.cos(a) * r, py = cy - 10 + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath(); ctx.fill();
    }
  }
}

/**
 * The tower itself, from its recorded layers. When `toppled`, the stack is
 * drawn tipping over around the cone's rim, further the longer it has fallen.
 */
export function drawTower(ctx, tower, flavourId, toppings, cx = CONE_X, topY = CONE_TOP_Y) {
  const flavour = FLAVOURS[flavourId];
  ctx.save();
  if (tower.toppled) {
    const fall = Math.min(1, tower.toppleT * 1.6);
    const dir = tower.lean >= 0 ? 1 : -1;
    ctx.translate(cx, topY);
    ctx.rotate(dir * fall * 1.35);
    ctx.translate(-cx, -topY);
  }
  if (tower.heightPx > 0) {
    // One continuous piped rope, not a stack of rings: a breathing
    // silhouette filled with the cream, then every turn of the helix
    // shaded along its diagonal — a lit ridge, a soft fall, and a warm
    // shadow tucked into the groove above it — crowned by a curled
    // peak, and — for a serve that made it — a little sparkle.
    const topDx = dxAt(tower, tower.heightPx);
    const crownR = radiusAt(tower.heightPx);
    const crownY = topY - tower.heightPx;
    const H = tower.heightPx;
    const silhouette = towerSilhouette(tower, cx, topY);
    const baseGrad = ctx.createLinearGradient(0, crownY, 0, topY);
    baseGrad.addColorStop(0, mixHex(flavour.body, '#ffffff', 0.22));
    baseGrad.addColorStop(0.55, flavour.body);
    baseGrad.addColorStop(1, shadowOf(flavour, 0.14));
    ctx.fillStyle = baseGrad;
    ctx.fill(silhouette);
    ctx.save();
    ctx.clip(silhouette);
    const turns = Math.ceil(H / TURN_PITCH) + 1;
    for (let k = 0; k < turns; k += 1) {
      // One plump fold of the rope: a filled band between two diagonal
      // groove curves, graded across its whole thickness — shadowed
      // where it tucks under the fold above, lit along its ridge, and
      // falling into warm shadow at its underside. Filled bands, not
      // stripes: the fold itself is the shape.
      const lo = ridgePoints(tower, cx, topY, k, -TURN_PITCH * 0.45);
      const hi = ridgePoints(tower, cx, topY, k, TURN_PITCH * 0.55);
      const band = new Path2D();
      band.moveTo(lo[0].x, lo[0].y);
      for (let i = 1; i < lo.length - 1; i += 1) {
        band.quadraticCurveTo(lo[i].x, lo[i].y, (lo[i].x + lo[i + 1].x) / 2, (lo[i].y + lo[i + 1].y) / 2);
      }
      band.lineTo(lo[lo.length - 1].x, lo[lo.length - 1].y);
      const hir = [...hi].reverse();
      band.lineTo(hir[0].x, hir[0].y);
      for (let i = 1; i < hir.length - 1; i += 1) {
        band.quadraticCurveTo(hir[i].x, hir[i].y, (hir[i].x + hir[i + 1].x) / 2, (hir[i].y + hir[i + 1].y) / 2);
      }
      band.lineTo(hir[hir.length - 1].x, hir[hir.length - 1].y);
      band.closePath();
      const mid = Math.floor(lo.length / 2);
      const g = ctx.createLinearGradient(0, hi[mid].y, 0, lo[mid].y);
      g.addColorStop(0, shadowOf(flavour, 0.3));
      g.addColorStop(0.3, flavour.body);
      g.addColorStop(0.52, mixHex(flavour.body, '#ffffff', 0.3));
      g.addColorStop(0.78, mixHex(flavour.body, '#ffffff', 0.08));
      g.addColorStop(1, shadowOf(flavour, 0.38));
      ctx.fillStyle = g;
      ctx.fill(band);
      // The groove seam and the ridge light, feathered over the fill.
      const tube = tubeRadiusAt(Math.min(H, k * TURN_PITCH + TURN_PITCH / 2));
      softStroke(ctx, hi, tube * 0.7, shadowOf(flavour, 0.5), 0.3);
      softStroke(ctx, ridgePoints(tower, cx, topY, k, 0), tube * 0.7, mixHex(flavour.body, '#ffffff', 0.55), 0.18);
    }
    // Cylindrical light: lit from the upper left, the flanks fall away
    // warm. The gradient spans the whole lean of the tower.
    let boxL = Infinity;
    let boxR = -Infinity;
    for (let y = 0; y <= H; y += 20) {
      const ax = cx + dxAt(tower, y);
      boxL = Math.min(boxL, ax - radiusAt(y));
      boxR = Math.max(boxR, ax + radiusAt(y));
    }
    boxL -= 8;
    boxR += 8;
    const cyl = ctx.createLinearGradient(boxL, 0, boxR, 0);
    cyl.addColorStop(0, 'rgba(125,98,66,0.26)');
    cyl.addColorStop(0.25, 'rgba(255,255,255,0.10)');
    cyl.addColorStop(0.55, 'rgba(255,255,255,0)');
    cyl.addColorStop(1, 'rgba(125,98,66,0.32)');
    ctx.fillStyle = cyl;
    ctx.fillRect(boxL, crownY - 34, boxR - boxL, H + 38);
    // Where the cream settles onto the cone, a soft contact shadow.
    ctx.fillStyle = shadowOf(flavour, 0.45);
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.ellipse(cx + dxAt(tower, 0), topY - 1, radiusAt(0) * 0.95, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
    if (tower.finished || tower.toppled) {
      drawTip(ctx, cx + topDx, crownY - crownR * 0.18, crownR, flavour);
    }
    if (toppings && toppings.length) drawToppings(ctx, toppings, cx + topDx, crownY - 6, flavour);
    if (tower.finished && !tower.toppled) {
      ctx.globalAlpha = 0.9;
      drawSparkle(ctx, cx + topDx - crownR - 15, crownY - 14, 7, GOLD);
      drawSparkle(ctx, cx + topDx + crownR + 17, crownY + 8, 5.5, '#ffffff');
      drawSparkle(ctx, cx + topDx + 12, crownY - crownR - 28, 5, GOLD);
      ctx.globalAlpha = 1;
    }
  }
  ctx.restore();
  if (tower.toppled && tower.toppleT > 0.55) {
    // The splat: what is left of greatness, on the counter.
    ctx.fillStyle = flavour.body;
    ctx.beginPath(); ctx.ellipse(cx + (tower.lean >= 0 ? 120 : -120), FLOOR_Y - 6, 74, 13, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = flavour.shade;
    ctx.beginPath(); ctx.ellipse(cx + (tower.lean >= 0 ? 96 : -96), FLOOR_Y - 12, 34, 9, 0, 0, Math.PI * 2); ctx.fill();
  }
}

/** A customer's face: round head, kind ears, a mood from the waiting gauge. */
export function drawAnimal(ctx, kind, cx, cy, r, mood, t) {
  const bob = Math.sin(t * 2.2 + cx) * 2;
  cy += bob;
  const fur = {
    rabbit: '#fdfdf8', bear: '#b57f45', panda: '#fdfdf8',
    cat: '#f2a65a', frog: '#79c25f', bird: '#8fcbe8',
  }[kind] || '#fdfdf8';
  // Ears and bumps first, so the head circle overlaps their roots.
  ctx.fillStyle = kind === 'panda' ? '#3a3a3a' : fur;
  if (kind === 'rabbit') {
    for (const s of [-1, 1]) {
      ctx.beginPath(); ctx.ellipse(cx + s * r * 0.45, cy - r * 1.22, r * 0.24, r * 0.62, s * 0.15, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = PINK;
      ctx.beginPath(); ctx.ellipse(cx + s * r * 0.45, cy - r * 1.22, r * 0.11, r * 0.4, s * 0.15, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = fur;
    }
  } else if (kind === 'bear' || kind === 'panda') {
    ctx.beginPath(); ctx.arc(cx - r * 0.72, cy - r * 0.72, r * 0.34, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + r * 0.72, cy - r * 0.72, r * 0.34, 0, Math.PI * 2); ctx.fill();
  } else if (kind === 'cat') {
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(cx + s * r * 0.88, cy - r * 0.42); ctx.lineTo(cx + s * r * 0.6, cy - r * 1.12); ctx.lineTo(cx + s * r * 0.16, cy - r * 0.76);
      ctx.closePath(); ctx.fill();
    }
  } else if (kind === 'frog') {
    ctx.beginPath(); ctx.arc(cx - r * 0.55, cy - r * 0.85, r * 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + r * 0.55, cy - r * 0.85, r * 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fdfdf8';
    ctx.beginPath(); ctx.arc(cx - r * 0.55, cy - r * 0.88, r * 0.19, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + r * 0.55, cy - r * 0.88, r * 0.19, 0, Math.PI * 2); ctx.fill();
  }
  // The head itself.
  ctx.fillStyle = fur;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  if (kind === 'bear' || kind === 'panda') {
    ctx.fillStyle = kind === 'panda' ? '#fdfdf8' : '#e0aa6e';
    ctx.beginPath(); ctx.ellipse(cx, cy + r * 0.3, r * 0.44, r * 0.32, 0, 0, Math.PI * 2); ctx.fill();
  }
  if (kind === 'bird') {
    ctx.fillStyle = '#f2b234';
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.2, cy + r * 0.08); ctx.lineTo(cx + r * 0.2, cy + r * 0.08); ctx.lineTo(cx, cy + r * 0.4);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = RED; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx, cy - r * 0.95); ctx.quadraticCurveTo(cx + 6, cy - r - 12, cx + 13, cy - r - 5); ctx.stroke();
  }
  // Eyes and mouth carry the mood.
  ctx.fillStyle = INK;
  const eyeY = cy - r * 0.12;
  if (kind === 'frog') {
    ctx.beginPath(); ctx.arc(cx - r * 0.55, eyeY - r * 0.74, r * 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + r * 0.55, eyeY - r * 0.74, r * 0.1, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.beginPath(); ctx.arc(cx - r * 0.34, eyeY, r * 0.09, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + r * 0.34, eyeY, r * 0.09, 0, Math.PI * 2); ctx.fill();
  }
  ctx.strokeStyle = INK; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
  ctx.beginPath();
  if (mood === 'happy') ctx.arc(cx, cy + r * 0.16, r * 0.34, 0.15 * Math.PI, 0.85 * Math.PI);
  else if (mood === 'sad') ctx.arc(cx, cy + r * 0.52, r * 0.3, 1.15 * Math.PI, 1.85 * Math.PI);
  else { ctx.moveTo(cx - r * 0.2, cy + r * 0.32); ctx.lineTo(cx + r * 0.2, cy + r * 0.32); }
  ctx.stroke();
  if (kind === 'cat') {
    ctx.lineWidth = 2.2;
    for (const s of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(cx + s * r * 0.55, cy + r * 0.12); ctx.lineTo(cx + s * r * 0.95, cy + r * 0.02); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + s * r * 0.55, cy + r * 0.28); ctx.lineTo(cx + s * r * 0.95, cy + r * 0.3); ctx.stroke();
    }
  }
  if (kind === 'rabbit') {
    ctx.fillStyle = PINK;
    ctx.beginPath(); ctx.ellipse(cx, cy + r * 0.18, r * 0.09, r * 0.06, 0, 0, Math.PI * 2); ctx.fill();
  }
}

/** The order ticket: who, what flavour, how tall, which topping, how patient. */
function drawTicket(ctx, state) {
  const c = state.customer;
  const x = 928, y = 66, w = 324, h = 300;
  fillRr(ctx, x - 8, y - 8, w + 16, h + 16, 14, WOOD_DARK);
  fillRr(ctx, x, y, w, h, 10, PAPER);
  ctx.fillStyle = RED;
  ctx.beginPath(); ctx.arc(x + w / 2, y + 12, 7, 0, Math.PI * 2); ctx.fill();
  const mood = state.patience > state.patienceMax * 0.5 ? 'happy' : state.patience > state.patienceMax * 0.24 ? 'ok' : 'sad';
  drawAnimal(ctx, c.animal, x + 52, y + 66, 34, mood, state.time);
  text(ctx, c.name, x + 100, y + 48, 27, INK, 'left');
  text(ctx, `Customer ${state.customerIndex + 1} of 5`, x + 100, y + 78, 16, '#8a6b4a', 'left', 'normal');
  const flavour = FLAVOURS[c.flavour];
  ctx.fillStyle = flavour.body;
  ctx.beginPath(); ctx.ellipse(x + 34, y + 128, 15, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x + 34, y + 121, 11, 8, 0, 0, Math.PI * 2); ctx.fill();
  text(ctx, `${flavour.name} · ${CONES[c.cone].name}`, x + 58, y + 126, 19, INK, 'left');
  const goal = HEIGHT_GOALS[c.goal];
  text(ctx, `Goal: ${goal.name} — ${state.goalCm} cm tall`, x + 24, y + 162, 20, '#b97f10', 'left');
  text(ctx, `…with ${TOPPINGS[c.wants].name} on top!`, x + 24, y + 192, 19, INK, 'left');
  const trait = TRAITS[c.trait];
  text(ctx, trait.name, x + 24, y + 220, 18, '#7c4f24', 'left');
  text(ctx, trait.note, x + 24, y + 242, 15.5, '#8a6b4a', 'left', 'normal');
  // The waiting gauge: it drains as the customer waits.
  fillRr(ctx, x + 22, y + h - 30, w - 44, 14, 7, '#e8dcc2');
  const frac = Math.max(0, state.patience / state.patienceMax);
  fillRr(ctx, x + 22, y + h - 30, (w - 44) * frac, 14, 7, frac > 0.24 ? GREEN : RED);
  text(ctx, 'waiting', x + w - 24, y + h - 44, 14, '#8a6b4a', 'right', 'normal');
}

/** The height ruler beside the cone, with the goal band lit up. */
function drawRuler(ctx, state) {
  const x = 742;
  const bandTop = CONE_TOP_Y - (state.goalCm + state.goalBand) * 15;
  const bandBot = CONE_TOP_Y - Math.max(0, (state.goalCm - state.goalBand)) * 15;
  ctx.fillStyle = 'rgba(93,168,95,0.35)';
  ctx.fillRect(x - 10, bandTop, 24, bandBot - bandTop);
  ctx.fillStyle = 'rgba(74,47,29,0.55)';
  ctx.fillRect(x + 12, 130, 4, CONE_TOP_Y - 130);
  ctx.font = 'bold 13px "Trebuchet MS", sans-serif';
  ctx.fillStyle = '#7c4f24'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  for (let cm = 0; cm <= 28; cm += 4) {
    const y = CONE_TOP_Y - cm * 15;
    ctx.fillRect(x + 4, y, cm % 8 === 0 ? 14 : 9, 2.4);
    ctx.fillText(`${cm}`, x + 22, y);
  }
  const cmNow = pxToCm(state.tower.heightPx);
  text(ctx, `${cmNow.toFixed(1)} cm`, x + 16, 112, 19, '#b97f10');
}

/** The wobble gauge: a needle that leans with the tower's lean. */
function drawWobbleGauge(ctx, state) {
  const x = 196, y = 618;
  fillRr(ctx, x - 128, y - 66, 256, 108, 16, '#fdfcf7');
  ctx.strokeStyle = '#d9d4c7'; ctx.lineWidth = 3; rr(ctx, x - 128, y - 66, 256, 108, 16); ctx.stroke();
  text(ctx, 'WOBBLE-O-METER', x, y - 42, 16, '#8a8272');
  const from = state.tower;
  const limit = 60;
  const frac = Math.max(-1, Math.min(1, from.lean / limit));
  ctx.strokeStyle = '#e8dcc2'; ctx.lineWidth = 10; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(x, y + 26, 62, Math.PI, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = RED;
  ctx.beginPath(); ctx.arc(x, y + 26, 62, Math.PI * 1.82, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y + 26, 62, Math.PI, Math.PI * 1.18); ctx.stroke();
  const a = Math.PI + (frac * 0.5 + 0.5) * Math.PI;
  ctx.strokeStyle = INK; ctx.lineWidth = 4.5;
  ctx.beginPath(); ctx.moveTo(x, y + 26); ctx.lineTo(x + Math.cos(a) * 54, y + 26 + Math.sin(a) * 54); ctx.stroke();
  ctx.fillStyle = INK;
  ctx.beginPath(); ctx.arc(x, y + 26, 7, 0, Math.PI * 2); ctx.fill();
}

/** A chunky café button; returns nothing, input.js owns the same rects. */
export function drawButton(ctx, rect, label, colour, dim = false) {
  ctx.save();
  if (dim) ctx.globalAlpha = 0.45;
  fillRr(ctx, rect.x, rect.y + 4, rect.w, rect.h, 14, 'rgba(0,0,0,0.25)');
  fillRr(ctx, rect.x, rect.y, rect.w, rect.h, 14, colour);
  ctx.strokeStyle = 'rgba(74,47,29,0.5)'; ctx.lineWidth = 2.5;
  rr(ctx, rect.x, rect.y, rect.w, rect.h, 14); ctx.stroke();
  text(ctx, label, rect.x + rect.w / 2, rect.y + rect.h / 2 + 1, 23, '#fff6e3');
  ctx.restore();
}

/** Top strip: day score so far (not on the title screen), and the mute button. */
function drawHud(ctx, state, showScore = true) {
  if (showScore) {
    fillRr(ctx, 16, 12, 430, 46, 12, 'rgba(255,246,227,0.92)');
    text(ctx, `Day score  ${state.totalScore}  ·  ${SHIFTS[state.shift].name}`, 34, 36, 21, INK, 'left');
  }
  fillRr(ctx, LAYOUT.muteBtn.x, LAYOUT.muteBtn.y, LAYOUT.muteBtn.w, LAYOUT.muteBtn.h, 12, 'rgba(255,246,227,0.92)');
  text(ctx, state.muted ? '✕' : '♪', LAYOUT.muteBtn.x + 23, LAYOUT.muteBtn.y + 24, 24, INK);
  if (state.messageT > 0 && state.message) {
    fillRr(ctx, 400, 62, 480, 36, 18, 'rgba(74,47,29,0.88)');
    text(ctx, state.message, 640, 81, 19, '#ffe9a8');
  }
}

/**
 * The nozzle arm: the machine never moves — the hand circles the cone
 * beneath it. The stream flows only while the circling is honest.
 */
function drawNozzle(ctx, state) {
  const nx = CONE_X;
  const topY = state.tower.heightPx > 0 ? CONE_TOP_Y - state.tower.heightPx : CONE_TOP_Y;
  ctx.strokeStyle = '#8a8272'; ctx.lineWidth = 10; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(nx, 58); ctx.lineTo(nx, topY - 66); ctx.stroke();
  fillRr(ctx, nx - 30, topY - 70, 60, 26, 9, '#d9d4c7');
  ctx.fillStyle = '#8a8272';
  ctx.beginPath();
  ctx.moveTo(nx - 13, topY - 44); ctx.lineTo(nx + 13, topY - 44); ctx.lineTo(nx, topY - 22);
  ctx.closePath(); ctx.fill();
  if (isSpinning(state.swirl, swirlClock()) && !state.tower.toppled) {
    // The stream of soft serve, nozzle to tower top.
    ctx.strokeStyle = FLAVOURS[state.selFlavour || state.customer.flavour].body; ctx.lineWidth = 17;
    ctx.beginPath(); ctx.moveTo(nx, topY - 22); ctx.lineTo(CONE_X + state.tower.lean, topY + 2); ctx.stroke();
  }
}

/**
 * The swirl guide and the hand's ribbon: a dashed ring around the cone
 * to trace, arrows riding it to suggest the motion, and the fading trail
 * of where the finger has just been. A clean lap lights the ring gold.
 * The small cross is the ring's true centre; the dot is where the
 * player's own laps are centred — when the tower leans, the dot belongs
 * on the other side, and the player can watch it walk the top back home.
 */
function drawSwirlGuide(ctx, state) {
  const sw = state.swirl;
  const now = swirlClock();
  const spinning = isSpinning(sw, now);
  const good = spinning && sw.lastQuality >= 0.7;
  ctx.save();
  if (good) { ctx.shadowColor = 'rgba(242,178,52,0.9)'; ctx.shadowBlur = 15; }
  ctx.strokeStyle = good ? GOLD : 'rgba(124,79,36,0.42)';
  ctx.lineWidth = good ? 5 : 3.5;
  ctx.setLineDash([14, 10]);
  ctx.beginPath(); ctx.arc(GUIDE_X, GUIDE_Y, GUIDE_R, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
  // Two arrowheads riding the ring, turning slowly with the room's life.
  ctx.fillStyle = good ? GOLD : 'rgba(124,79,36,0.55)';
  for (const off of [0, Math.PI]) {
    const a = state.time * 0.9 + off;
    ctx.save();
    ctx.translate(GUIDE_X + Math.cos(a) * GUIDE_R, GUIDE_Y + Math.sin(a) * GUIDE_R);
    ctx.rotate(a + Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(10, 0); ctx.lineTo(-7, -6.5); ctx.lineTo(-7, 6.5);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  // The ring's true centre, and where the player's laps are centred.
  ctx.strokeStyle = 'rgba(74,47,29,0.5)'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(GUIDE_X - 7, GUIDE_Y); ctx.lineTo(GUIDE_X + 7, GUIDE_Y);
  ctx.moveTo(GUIDE_X, GUIDE_Y - 7); ctx.lineTo(GUIDE_X, GUIDE_Y + 7);
  ctx.stroke();
  if (sw.laps > 0) {
    const cx = GUIDE_X + sw.centroidX;
    ctx.strokeStyle = 'rgba(74,47,29,0.3)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(GUIDE_X, GUIDE_Y); ctx.lineTo(cx, GUIDE_Y); ctx.stroke();
    ctx.fillStyle = good ? GOLD : '#b57a35';
    ctx.beginPath(); ctx.arc(cx, GUIDE_Y, 6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,246,227,0.9)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, GUIDE_Y, 6, 0, Math.PI * 2); ctx.stroke();
  }
  // The ribbon: the finger's last moments, fading as they age. A pale
  // halo under a deeper flavour tint, so the path reads both over the
  // cream it is laying and over the counter behind it.
  const flavour = FLAVOURS[state.selFlavour || state.customer.flavour];
  ctx.lineCap = 'round';
  for (const pass of [0, 1]) {
    for (let i = 1; i < sw.trail.length; i += 1) {
      const a = sw.trail[i - 1];
      const b = sw.trail[i];
      const age = now - b.t;
      if (age > 1.5) continue;
      const fade = 1 - age / 1.5;
      ctx.strokeStyle = pass === 0 ? '#fff6e3' : flavour.shade;
      ctx.globalAlpha = pass === 0 ? fade * 0.4 : fade * 0.85;
      ctx.lineWidth = pass === 0 ? 11 : 6.5;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}

/** A small topping icon for the finishing tray buttons. */
function drawToppingIcon(ctx, id, cx, cy) {
  if (id === 'cherry') {
    ctx.fillStyle = TOPPINGS.cherry.colour;
    ctx.beginPath(); ctx.arc(cx, cy + 4, 11, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#5d7d3a'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx + 2, cy - 4); ctx.quadraticCurveTo(cx + 8, cy - 16, cx + 15, cy - 14); ctx.stroke();
  } else if (id === 'sauce') {
    ctx.fillStyle = TOPPINGS.sauce.colour;
    ctx.beginPath(); ctx.ellipse(cx, cy, 15, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(cx - 10, cy, 5, 10); ctx.fillRect(cx + 5, cy, 5, 13);
  } else if (id === 'sprinkle') {
    const cols = ['#e4572e', '#f2b234', '#5da85f', '#4d93b8'];
    cols.forEach((colour, i) => {
      ctx.strokeStyle = colour; ctx.lineWidth = 4; ctx.lineCap = 'round';
      const a = (i / 4) * Math.PI * 2 + 0.4;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 9 - 4, cy + Math.sin(a) * 6);
      ctx.lineTo(cx + Math.cos(a) * 9 + 4, cy + Math.sin(a) * 6 + 3);
      ctx.stroke();
    });
  } else if (id === 'wafer') {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(0.45);
    ctx.fillStyle = TOPPINGS.wafer.colour; ctx.fillRect(-6, -16, 12, 32);
    ctx.strokeStyle = '#b57a35'; ctx.lineWidth = 2;
    for (let i = 0; i < 3; i += 1) { ctx.beginPath(); ctx.moveTo(-6, -9 + i * 9); ctx.lineTo(6, -5 + i * 9); ctx.stroke(); }
    ctx.restore();
  } else if (id === 'star') {
    ctx.fillStyle = TOPPINGS.star.colour;
    ctx.beginPath();
    for (let i = 0; i < 10; i += 1) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const r = i % 2 === 0 ? 14 : 6;
      const px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill();
  }
}

/** The dark workbench strip the shop steps are played on. */
function drawStrip(ctx) {
  ctx.fillStyle = 'rgba(46,29,18,0.82)';
  ctx.fillRect(0, 686, FIELD.width, FIELD.height - 686);
}

/**
 * The cone step: three cards on the workbench, one per cone. In its big
 * form it opens the serve; in its compact form it rides along under the
 * flavour step, so a cone can still be re-picked before the swirling.
 */
function drawConeStrip(ctx, state, compact) {
  drawStrip(ctx);
  const c = state.customer;
  if (compact) {
    text(ctx, `Step 2 of 3 — tap a tank on the twirl-o-matic!  (Wrong cone? Tap below to change it.)`, 640, 668, 19, '#ffe9a8');
    CONE_ORDER.forEach((id, i) => {
      const rect = LAYOUT.coneMiniBtn(i);
      const chosen = state.selCone === id;
      fillRr(ctx, rect.x, rect.y, rect.w, rect.h, 12, chosen ? '#ffe1a8' : PAPER);
      if (chosen) { ctx.strokeStyle = GOLD; ctx.lineWidth = 4; rr(ctx, rect.x, rect.y, rect.w, rect.h, 12); ctx.stroke(); }
      drawMiniCone(ctx, id, rect.x + 30, rect.y + 8);
      text(ctx, CONES[id].name.replace(' Cone', ''), rect.x + 58, rect.y + 31, 15.5, INK, 'left');
    });
    return;
  }
  text(ctx, `Step 1 of 3 — pick a cone! ${c.name} asked for a ${CONES[c.cone].name}.`, 640, 668, 20, '#ffe9a8');
  CONE_ORDER.forEach((id, i) => {
    const rect = LAYOUT.coneBtn(i);
    const chosen = state.selCone === id;
    fillRr(ctx, rect.x, rect.y, rect.w, rect.h, 14, chosen ? '#ffe1a8' : PAPER);
    if (chosen) { ctx.strokeStyle = GOLD; ctx.lineWidth = 4; rr(ctx, rect.x, rect.y, rect.w, rect.h, 14); ctx.stroke(); }
    drawMiniCone(ctx, id, rect.x + 52, rect.y + 20);
    text(ctx, CONES[id].name, rect.x + 96, rect.y + 46, 21, INK, 'left');
  });
}

/**
 * The finishing strip: a Toppings button that opens the tray, the tray
 * itself (five choices and a Done), and the Serve it! bell throughout.
 */
function drawFinishStrip(ctx, state) {
  drawStrip(ctx);
  const c = state.customer;
  if (!state.trayOpen) {
    const chosen = state.toppings.length
      ? `On top: ${state.toppings.map((id) => TOPPINGS[id].name).join(' + ')}`
      : 'No toppings yet — the tray is full of lovely things.';
    text(ctx, `Finish it! ${chosen}`, 640, 668, 20, '#ffe9a8');
    drawButton(ctx, LAYOUT.trayBtn, 'Toppings 🧺', '#8a5a2e');
    drawButton(ctx, LAYOUT.serveBtn, 'Serve it! 🔔', GREEN);
    return;
  }
  text(ctx, `Pick up to 2 toppings — ${c.name} asked for ${TOPPINGS[c.wants].name}.`, 800, 668, 20, '#ffe9a8');
  TOPPING_ORDER.forEach((id, i) => {
    const rect = LAYOUT.toppingBtn(i);
    const chosen = state.toppings.includes(id);
    fillRr(ctx, rect.x, rect.y, rect.w, rect.h, 12, chosen ? '#ffe1a8' : PAPER);
    if (chosen) { ctx.strokeStyle = GOLD; ctx.lineWidth = 4; rr(ctx, rect.x, rect.y, rect.w, rect.h, 12); ctx.stroke(); }
    drawToppingIcon(ctx, id, rect.x + 26, rect.y + 31);
    // Shrink the label until it fits its button ("Choco Sauce" is the widest).
    let labelSize = 14.5;
    ctx.font = `bold ${labelSize}px "Trebuchet MS", "Segoe UI", sans-serif`;
    while (ctx.measureText(TOPPINGS[id].name).width > rect.w - 54 && labelSize > 10) {
      labelSize -= 1;
      ctx.font = `bold ${labelSize}px "Trebuchet MS", "Segoe UI", sans-serif`;
    }
    text(ctx, TOPPINGS[id].name, rect.x + 48, rect.y + 31, labelSize, INK, 'left');
  });
  drawButton(ctx, LAYOUT.serveBtn, 'Done ✔', '#8a5a2e');
}

/** A demo tower for the title screen, swaying gently on its cone. */
function titleTower(state) {
  const layers = [];
  for (let y = 7; y <= 252; y += 7) {
    layers.push({ dx: Math.sin(y * 0.05) * 7, r: radiusAt(y), y });
  }
  return {
    heightPx: 252, layers, lean: Math.sin(state.time * 1.4) * 9,
    toppled: false, toppleT: 0, finished: true,
  };
}

/** The title screen: the shop sign, a showpiece tower, and how to play. */
function drawTitle(ctx, state) {
  drawMachine(ctx, state);
  drawCone(ctx, 'waffle');
  drawTower(ctx, titleTower(state), 'strawberry', ['cherry', 'wafer']);
  fillRr(ctx, 330, 120, 620, 128, 22, WOOD_DARK);
  fillRr(ctx, 342, 132, 596, 104, 16, '#8a5a2e');
  text(ctx, 'SOFT SERVE SUMMIT', 640, 168, 55, '#ffe9a8');
  text(ctx, 'how tall can you swirl?', 640, 214, 24, '#fff6e3', 'center', 'normal');
  const tips = [
    ['1', 'PICK the order', 'a cone, then tap a tank'],
    ['2', 'SWIRL in circles', 'trace circles around the cone'],
    ['3', 'STEADY the lean', 'centre your circle against it'],
    ['4', 'TOP it & serve', 'open the tray, ring the bell'],
  ];
  tips.forEach((tip, i) => {
    const x = 92 + i * 282;
    fillRr(ctx, x, 560, 258, 108, 14, 'rgba(255,246,227,0.95)');
    ctx.fillStyle = RED;
    ctx.beginPath(); ctx.arc(x + 30, 590, 16, 0, Math.PI * 2); ctx.fill();
    text(ctx, tip[0], x + 30, 591, 20, '#fff6e3');
    text(ctx, tip[1], x + 54, 590, 19.5, INK, 'left');
    text(ctx, tip[2], x + 20, 632, 15.5, '#7c4f24', 'left', 'normal');
  });
  // Today's shift: three buttons, the picked one in gold.
  SHIFT_ORDER.forEach((id, i) => {
    const rect = LAYOUT.shiftBtn(i);
    const chosen = state.shift === id;
    fillRr(ctx, rect.x, rect.y + 3, rect.w, rect.h, 12, 'rgba(0,0,0,0.25)');
    fillRr(ctx, rect.x, rect.y, rect.w, rect.h, 12, chosen ? GOLD : PAPER);
    ctx.strokeStyle = 'rgba(74,47,29,0.5)'; ctx.lineWidth = 2.5;
    rr(ctx, rect.x, rect.y, rect.w, rect.h, 12); ctx.stroke();
    text(ctx, SHIFTS[id].name, rect.x + rect.w / 2, rect.y + 16, 17, INK);
    text(ctx, SHIFTS[id].note, rect.x + rect.w / 2, rect.y + 34, 12.5, '#7c4f24', 'center', 'normal');
  });
  const pulse = 0.85 + Math.sin(state.time * 3.2) * 0.15;
  ctx.save();
  ctx.globalAlpha = pulse;
  drawButton(ctx, LAYOUT.openBtn, 'Click to open the atelier', GREEN);
  ctx.restore();
}

/** One breakdown bar on the judge's card. */
function drawBar(ctx, x, y, label, value, max) {
  text(ctx, label, x, y + 10, 18, INK, 'left');
  fillRr(ctx, x + 130, y, 300, 20, 10, '#e8dcc2');
  fillRr(ctx, x + 130, y, 300 * Math.min(1, value / max), 20, 10, GOLD);
  text(ctx, `${value}`, x + 448, y + 10, 18, INK, 'left');
}

/** The judge's card: the finished serve, its grade stamp, and why. */
function drawCard(ctx, state) {
  ctx.fillStyle = 'rgba(46,29,18,0.55)';
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  fillRr(ctx, 300, 66, 680, 668, 22, PAPER);
  ctx.strokeStyle = WOOD_DARK; ctx.lineWidth = 4; rr(ctx, 300, 66, 680, 668, 22); ctx.stroke();
  const c = state.customer;
  const r = state.result;
  if (r.left) {
    drawAnimal(ctx, c.animal, 640, 240, 62, 'sad', state.time);
    text(ctx, `${c.name} waited… and waited…`, 640, 350, 32, INK);
    text(ctx, 'The waiting gauge ran dry, so the order lapsed.', 640, 396, 20, '#7c4f24', 'center', 'normal');
    text(ctx, 'No hard feelings — the next customer is already smiling.', 640, 428, 20, '#7c4f24', 'center', 'normal');
    text(ctx, '+0', 640, 500, 44, RED);
    drawButton(ctx, LAYOUT.nextBtn, state.customerIndex >= 4 ? 'See the day' : 'Next customer', GREEN);
    return;
  }
  text(ctx, `For ${c.name}: ${FLAVOURS[c.flavour].name}`, 640, 108, 27, INK);
  // The serve itself, scaled to fit its frame — drawn as it was handed
  // over: the cone and flavour the player actually picked.
  const scale = Math.min(1, 400 / Math.max(1, state.tower.heightPx + 150));
  ctx.save();
  ctx.translate(452, 566);
  ctx.scale(scale, scale);
  ctx.translate(-452, -566);
  drawCone(ctx, state.selCone || c.cone, 452, 436);
  drawTower(ctx, state.tower, state.selFlavour || c.flavour, state.toppings, 452, 436);
  ctx.restore();
  // The breakdown, right of the serve.
  const bx = 486, by = 156;
  drawBar(ctx, bx, by, 'Height', r.height, 40);
  drawBar(ctx, bx, by + 40, 'Balance', r.balance, 30);
  drawBar(ctx, bx, by + 80, 'Even swirls', r.uniform, 19);
  drawBar(ctx, bx, by + 120, 'Height goal', r.goal, 8);
  drawBar(ctx, bx, by + 160, 'Ticket match', r.accuracy, 10);
  drawBar(ctx, bx, by + 200, 'Flair', r.flair, 9);
  text(ctx, `${r.cm.toFixed(1)} cm tall (goal ${r.goalCm} cm)`, bx + 130, by + 252, 18, '#7c4f24', 'left', 'normal');
  const mark = (hit) => (hit ? '✓' : '✗');
  text(ctx, `Ticket: cone ${mark(r.coneHit)} · flavour ${mark(r.flavourHit)} · topping ${mark(r.toppingHit)}`, bx + 130, by + 282, 18, '#7c4f24', 'left', 'normal');
  text(ctx, verdictText(r, c), 640, 616, 19.5, INK);
  // Grade stamp and total.
  ctx.save();
  ctx.translate(884, 150); ctx.rotate(-0.16);
  ctx.strokeStyle = r.grade === 'S' ? GOLD : r.grade === 'A' ? GREEN : r.grade === 'B' ? '#4d93b8' : RED;
  ctx.lineWidth = 6;
  ctx.beginPath(); ctx.arc(0, 0, 44, 0, Math.PI * 2); ctx.stroke();
  text(ctx, r.grade, 0, 4, 52, ctx.strokeStyle);
  ctx.restore();
  // The total, with a small "/100" riding at its lower right.
  ctx.font = 'bold 46px "Trebuchet MS", "Segoe UI", sans-serif';
  const totalW = ctx.measureText(`${r.total}`).width;
  ctx.font = 'normal 20px "Trebuchet MS", "Segoe UI", sans-serif';
  const perW = ctx.measureText('/100').width;
  const totalCx = 640 - perW / 2;
  text(ctx, `${r.total}`, totalCx, 556, 46, '#b97f10');
  text(ctx, '/100', totalCx + totalW / 2 + 5, 568, 20, '#8a6b4a', 'left', 'normal');
  drawButton(ctx, LAYOUT.nextBtn, state.customerIndex >= 4 ? 'See the day' : 'Next customer', GREEN);
}

/** The verdict sentence on the judge's card, keyed to what decided it. */
function verdictText(r, c) {
  if (r.toppled) return 'It leaned, it listed… it lay down. The height was brave!';
  if (r.grade === 'S') return 'A summit of a swirl! The atelier applauds.';
  if (r.accuracy <= 3) return 'A fine swirl — but not quite the serve on the ticket.';
  if (r.goal >= 7) return `Right on the ticket — ${r.cm.toFixed(1)} cm against a ${r.goalCm} cm dream!`;
  if (r.balance <= r.height && r.balance <= r.uniform) return 'Lovely swirl! A steadier centre would crown it.';
  if (r.uniform <= r.height) return 'Tall and proud! Rounder circles even the swirls.';
  return `${c.name} dreamed of a ${r.goalName} (${r.goalCm} cm) — closer next time!`;
}

/** Closing time: the day's five cards and the total on the board. */
function drawOver(ctx, state) {
  ctx.fillStyle = 'rgba(46,29,18,0.55)';
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  fillRr(ctx, 330, 60, 620, 680, 22, PAPER);
  ctx.strokeStyle = WOOD_DARK; ctx.lineWidth = 4; rr(ctx, 330, 60, 620, 680, 22); ctx.stroke();
  text(ctx, 'Closing time at the Summit', 640, 112, 31, INK);
  state.results.forEach((r, i) => {
    const y = 168 + i * 62;
    const c = CUSTOMER_PLAN[i];
    drawAnimal(ctx, c.animal, 408, y + 18, 21, r.left ? 'sad' : 'happy', state.time);
    text(ctx, c.name, 446, y + 18, 21, INK, 'left');
    text(ctx, r.left ? 'left hungry' : `${r.cm.toFixed(1)} cm · grade ${r.grade}`, 640, y + 18, 20, '#7c4f24', 'left');
    text(ctx, `${r.total}`, 884, y + 18, 23, '#b97f10', 'right');
  });
  const stars = state.totalScore >= 360 ? 3 : state.totalScore >= 260 ? 2 : 1;
  text(ctx, '★'.repeat(stars) + '☆'.repeat(3 - stars), 640, 506, 44, GOLD);
  // The day total, with a small "/500" after it (five customers, 100 each).
  const totalStr = `Day total  ${state.totalScore}`;
  const gradeStr = `   ·   best grade ${state.bestGrade}`;
  ctx.font = 'bold 26px "Trebuchet MS", "Segoe UI", sans-serif';
  const totalStrW = ctx.measureText(totalStr).width;
  const gradeStrW = ctx.measureText(gradeStr).width;
  ctx.font = 'normal 16px "Trebuchet MS", "Segoe UI", sans-serif';
  const per500W = ctx.measureText('/500').width;
  const lineX = 640 - (totalStrW + per500W + 4 + gradeStrW) / 2;
  text(ctx, totalStr, lineX, 560, 26, INK, 'left');
  text(ctx, '/500', lineX + totalStrW + 2, 567, 16, '#8a6b4a', 'left', 'normal');
  text(ctx, gradeStr, lineX + totalStrW + per500W + 4, 560, 26, INK, 'left');
  text(ctx, 'Thank you for swirling with us today.', 640, 606, 19, '#7c4f24', 'center', 'normal');
  drawButton(ctx, LAYOUT.againBtn, 'Open again tomorrow', GREEN);
}

/** Draw the whole game for the current screen. */
export function draw(ctx, state) {
  drawRoom(ctx, state);
  if (state.screen === SCREEN_TITLE) {
    drawTitle(ctx, state);
    drawHud(ctx, state, false);
    return;
  }
  drawMachine(ctx, state);
  if (state.screen === SCREEN_SERVE || state.screen === SCREEN_TOP) {
    drawTicket(ctx, state);
    // The cone on the stand is the one the player picked; before that,
    // the stand waits empty with its ring showing.
    if (state.selCone) drawCone(ctx, state.selCone);
    else drawStand(ctx, CONE_X, CONE_TOP_Y + 100, CONE_TOP_Y + 2);
    drawTower(ctx, state.tower, state.selFlavour || state.customer.flavour, state.screen === SCREEN_TOP || state.tower.finished ? state.toppings : []);
    if (state.screen === SCREEN_SERVE) drawNozzle(ctx, state);
    drawRuler(ctx, state);
    drawWobbleGauge(ctx, state);
    if (state.screen === SCREEN_SERVE) {
      if (state.step === STEP_CONE) {
        drawConeStrip(ctx, state, false);
      } else if (state.step === STEP_FLAVOUR) {
        drawConeStrip(ctx, state, true);
      } else {
        drawSwirlGuide(ctx, state);
        drawButton(ctx, LAYOUT.doneBtn, 'DONE! ✔', RED, state.tower.heightPx < 24);
        text(ctx, 'TRACE CIRCLES around the cone to swirl · centre your circle against the lean to steady it', 640, 706, 17, '#ffe9a8');
      }
    } else {
      drawFinishStrip(ctx, state);
    }
  }
  if (state.screen === SCREEN_CARD) drawCard(ctx, state);
  if (state.screen === SCREEN_OVER) drawOver(ctx, state);
  drawHud(ctx, state);
}
