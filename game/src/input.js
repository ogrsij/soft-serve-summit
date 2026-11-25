// Pointer and keyboard for Soft Serve Summit: hold to swirl, steer to
// balance. One geometry, shared with render.js through LAYOUT, so what is
// drawn is exactly what is hit.

import { CONE_X } from './config.js';
import { TOPPING_ORDER } from './menu.js';
import { LAYOUT } from './render.js';
import {
  SCREEN_TITLE, SCREEN_SERVE, SCREEN_TOP, SCREEN_CARD, SCREEN_OVER,
  startDay, declareDone, toggleTopping, serveIt, nextCustomer,
} from './game.js';
import { wakeAudio, toggleMute, blip } from './audio.js';

/** Keys currently held, for steering in the main loop. */
export const keysDown = new Set();

function inRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

/** Canvas coordinates from a pointer event, whatever the display size. */
export function toGame(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * canvas.width,
    y: ((event.clientY - rect.top) / rect.height) * canvas.height,
  };
}

/** The one context action per screen: Enter and clicks on buttons share it. */
export function primaryAction(state) {
  if (state.screen === SCREEN_TITLE) startDay(state);
  else if (state.screen === SCREEN_SERVE) declareDone(state);
  else if (state.screen === SCREEN_TOP) serveIt(state);
  else if (state.screen === SCREEN_CARD) nextCustomer(state);
  else if (state.screen === SCREEN_OVER) startDay(state);
}

function onPress(state, x, y) {
  wakeAudio();
  if (inRect(x, y, LAYOUT.muteBtn)) {
    state.muted = toggleMute();
    return;
  }
  if (state.screen === SCREEN_TITLE) { startDay(state); return; }
  if (state.screen === SCREEN_SERVE) {
    if (inRect(x, y, LAYOUT.doneBtn)) { declareDone(state); return; }
    state.holding = true;
    state.steer = clampSteer(x);
    return;
  }
  if (state.screen === SCREEN_TOP) {
    for (let i = 0; i < TOPPING_ORDER.length; i += 1) {
      if (inRect(x, y, LAYOUT.toppingBtn(i))) { toggleTopping(state, TOPPING_ORDER[i]); return; }
    }
    if (inRect(x, y, LAYOUT.serveBtn)) { serveIt(state); return; }
    return;
  }
  if (state.screen === SCREEN_CARD) {
    if (inRect(x, y, LAYOUT.nextBtn)) nextCustomer(state);
    return;
  }
  if (state.screen === SCREEN_OVER) {
    if (inRect(x, y, LAYOUT.againBtn)) startDay(state);
  }
}

/** Steering is the nozzle's offset from the cone, clamped to a fair reach. */
export function clampSteer(x) {
  return Math.max(-120, Math.min(120, x - CONE_X));
}

/** Wire the canvas and keyboard to the game state. */
export function attachInput(canvas, state) {
  canvas.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    const p = toGame(canvas, event);
    onPress(state, p.x, p.y);
  });
  canvas.addEventListener('pointermove', (event) => {
    const p = toGame(canvas, event);
    if (state.screen === SCREEN_SERVE) state.steer = clampSteer(p.x);
  });
  const release = () => { state.holding = false; };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    keysDown.add(event.code);
    if (event.code === 'Space') {
      event.preventDefault();
      wakeAudio();
      if (state.screen === SCREEN_SERVE) state.holding = true;
      else primaryAction(state);
    }
    if (event.code === 'Enter') primaryAction(state);
    if (event.code === 'KeyM') state.muted = toggleMute();
  });
  window.addEventListener('keyup', (event) => {
    keysDown.delete(event.code);
    if (event.code === 'Space') state.holding = false;
  });
}

/** Per-frame keyboard steering: arrows walk the nozzle, smoothly. */
export function steerFromKeys(state, dt) {
  if (state.screen !== SCREEN_SERVE) return;
  const speed = 300;
  if (keysDown.has('ArrowLeft')) state.steer = Math.max(-120, state.steer - speed * dt);
  if (keysDown.has('ArrowRight')) state.steer = Math.min(120, state.steer + speed * dt);
}

/** A tiny click for button presses that game.js does not already voice. */
export function uiClick() {
  blip(600, 0.05, 'sine', 0.08);
}
