// Boot and heartbeat of Soft Serve Summit: wire input, run the frame loop,
// keep the screen-reader status line honest. With ?shot=<name> the game
// stages a screenshot scene instead of opening on the title screen.

import { createGame, updateGame, SCREEN_CARD, SCREEN_OVER } from './game.js';
import { draw } from './render.js';
import { attachInput } from './input.js';
import { startMusic, stopMusic } from './audio.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');

const state = createGame();
state.muted = false;
attachInput(canvas, state);
// A handle for the maker's own play-tests (harmless in play).
window.__summit = state;

const shotName = new URLSearchParams(location.search).get('shot');
if (shotName) stageShot(state, shotName);

let lastScreen = state.screen;
function announce() {
  if (state.screen === lastScreen) return;
  lastScreen = state.screen;
  if (state.screen === SCREEN_CARD && state.result) {
    status.textContent = state.result.left
      ? 'The customer left. No points for that serve.'
      : `Graded ${state.result.grade}: ${state.result.total} points, ${state.result.cm.toFixed(1)} centimetres tall.`;
  } else if (state.screen === SCREEN_OVER) {
    status.textContent = `Closing time. Day total ${state.totalScore} points.`;
  }
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (shotName) {
    // Screenshot scenes hold their pose; only the room's life moves.
    state.time += dt;
  } else {
    updateGame(state, dt);
    if (state.screen !== 'title' && state.screen !== SCREEN_OVER) startMusic();
    if (state.screen === SCREEN_OVER) stopMusic();
  }
  announce();
  draw(ctx, state);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
