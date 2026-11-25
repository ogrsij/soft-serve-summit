// Pointer and keyboard for Soft Serve Summit: the hand on the cone.
// Pressing the field takes hold of the cone; from there, only circling
// lays soft serve (swirl.js reads the path). Buttons still take plain
// clicks. One geometry, shared with render.js through LAYOUT, so what
// is drawn is exactly what is hit.

import { TOPPING_ORDER } from './menu.js';
import { LAYOUT } from './render.js';
import {
  SCREEN_TITLE, SCREEN_SERVE, SCREEN_TOP, SCREEN_CARD, SCREEN_OVER,
  startDay, declareDone, toggleTopping, serveIt, nextCustomer,
} from './game.js';
import { swirlBegin, swirlMove, swirlEnd } from './swirl.js';
import { wakeAudio, toggleMute, blip } from './audio.js';

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
    // Take hold of the cone: the circling starts here.
    swirlBegin(state.swirl, x, y);
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
    if (state.screen === SCREEN_SERVE) swirlMove(state.swirl, p.x, p.y);
  });
  const release = () => { swirlEnd(state.swirl); };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    if (event.code === 'Space') event.preventDefault();
    if (event.code === 'Space' || event.code === 'Enter') {
      wakeAudio();
      primaryAction(state);
    }
    if (event.code === 'KeyM') state.muted = toggleMute();
  });
}

/** A tiny click for button presses that game.js does not already voice. */
export function uiClick() {
  blip(600, 0.05, 'sine', 0.08);
}
