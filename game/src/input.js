// Pointer and keyboard for Soft Serve Summit: the hands in the shop.
// The serve is a little run of steps — pick a cone card, tap a tank on
// the machine, then take hold and circle (swirl.js reads the path) —
// and the finishing tray opens and closes like a real case. Buttons
// still take plain clicks. One geometry, shared with render.js through
// LAYOUT, so what is drawn is exactly what is hit.

import { TOPPING_ORDER, CONE_ORDER, FLAVOUR_ORDER } from './menu.js';
import { SHIFT_ORDER } from './config.js';
import { LAYOUT } from './render.js';
import {
  SCREEN_TITLE, SCREEN_SERVE, SCREEN_TOP, SCREEN_CARD, SCREEN_OVER,
  STEP_CONE, STEP_FLAVOUR, STEP_SWIRL,
  startDay, setShift, pickCone, pickFlavour, declareDone,
  toggleTray, toggleTopping, serveIt, nextCustomer,
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
  if (state.screen === SCREEN_TITLE) {
    // The shift buttons choose the day; anywhere else opens the atelier.
    for (let i = 0; i < SHIFT_ORDER.length; i += 1) {
      if (inRect(x, y, LAYOUT.shiftBtn(i))) { setShift(state, SHIFT_ORDER[i]); return; }
    }
    startDay(state);
    return;
  }
  if (state.screen === SCREEN_SERVE) {
    if (state.step === STEP_CONE) {
      for (let i = 0; i < CONE_ORDER.length; i += 1) {
        if (inRect(x, y, LAYOUT.coneBtn(i))) { pickCone(state, CONE_ORDER[i]); return; }
      }
      return;
    }
    if (state.step === STEP_FLAVOUR) {
      // Tanks first — they are the step — then the compact cone cards,
      // so a cone can still be re-picked before the swirling starts.
      for (let i = 0; i < FLAVOUR_ORDER.length; i += 1) {
        if (inRect(x, y, LAYOUT.tankBtn(i))) { pickFlavour(state, FLAVOUR_ORDER[i]); return; }
      }
      for (let i = 0; i < CONE_ORDER.length; i += 1) {
        if (inRect(x, y, LAYOUT.coneMiniBtn(i))) { pickCone(state, CONE_ORDER[i]); return; }
      }
      return;
    }
    // STEP_SWIRL: the DONE button, or take hold and start circling.
    if (inRect(x, y, LAYOUT.doneBtn)) { declareDone(state); return; }
    swirlBegin(state.swirl, x, y);
    return;
  }
  if (state.screen === SCREEN_TOP) {
    if (state.trayOpen) {
      for (let i = 0; i < TOPPING_ORDER.length; i += 1) {
        if (inRect(x, y, LAYOUT.toppingBtn(i))) { toggleTopping(state, TOPPING_ORDER[i]); return; }
      }
      if (inRect(x, y, LAYOUT.serveBtn)) { toggleTray(state); return; }
      return;
    }
    if (inRect(x, y, LAYOUT.trayBtn)) { toggleTray(state); return; }
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
    if (state.screen === SCREEN_SERVE && state.step === STEP_SWIRL) swirlMove(state.swirl, p.x, p.y);
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
