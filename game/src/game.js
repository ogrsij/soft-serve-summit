// The day at the atelier: five customers, five serves. This file owns the
// round flow — title, the little shop steps (pick a cone, tap a tank,
// swirl, top it), the judge's card, day results — while tower.js runs
// the stack and score.js grades it. Nothing is pre-picked for the
// player any more: the ticket says what is wanted, the hands choose.

import { CUSTOMERS_PER_DAY, SHIFTS } from './config.js';
import { CUSTOMER_PLAN, HEIGHT_GOALS, MAX_TOPPINGS } from './menu.js';
import { createTower, updateTower, finishTower } from './tower.js';
import { createSwirl, consumeSpin, isSpinning, swirlClock } from './swirl.js';
import { gradeServe } from './score.js';
import { blip, ding, coinJingle, sadSlide } from './audio.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_SERVE = 'serve';
export const SCREEN_TOP = 'top';
export const SCREEN_CARD = 'card';
export const SCREEN_OVER = 'over';

/** The shop steps inside one serve, in the order the hands take them. */
export const STEP_CONE = 'cone';
export const STEP_FLAVOUR = 'flavour';
export const STEP_SWIRL = 'swirl';

/** A fresh game on the title screen. */
export function createGame() {
  return {
    screen: SCREEN_TITLE,
    time: 0,
    shift: 'regular',
    customerIndex: 0,
    customer: null,
    patience: SHIFTS.regular.patience,
    patienceMax: SHIFTS.regular.patience,
    step: STEP_CONE,
    selCone: null,
    selFlavour: null,
    goalCm: 0,
    goalBand: 0,
    trayOpen: false,
    happyFaceUntil: 0,
    tower: createTower(),
    toppings: [],
    swirl: createSwirl(),
    toppleWait: 0,
    result: null,
    results: [],
    totalScore: 0,
    bestGrade: 'C',
    message: '',
    messageT: 0,
  };
}

/** Choose the day's shift on the title screen. */
export function setShift(state, id) {
  if (!SHIFTS[id]) return;
  state.shift = id;
  blip(700, 0.06, 'sine', 0.1);
}

/** Open the atelier and welcome the first customer. */
export function startDay(state) {
  state.results = [];
  state.totalScore = 0;
  state.bestGrade = 'C';
  state.customerIndex = 0;
  state.patienceMax = SHIFTS[state.shift].patience;
  beginCustomer(state);
}

/** Seat the current customer: a fresh ticket, empty hands, full patience. */
export function beginCustomer(state) {
  state.customer = CUSTOMER_PLAN[state.customerIndex];
  state.patience = state.patienceMax;
  const goal = HEIGHT_GOALS[state.customer.goal];
  state.goalCm = Math.round(goal.cm * SHIFTS[state.shift].goalScale * 10) / 10;
  state.goalBand = goal.band;
  state.step = STEP_CONE;
  state.selCone = null;
  state.selFlavour = null;
  state.trayOpen = false;
  state.tower = createTower();
  state.toppings = [];
  state.result = null;
  state.swirl = createSwirl();
  state.toppleWait = 0;
  state.screen = SCREEN_SERVE;
  say(state, `${state.customer.name} is here! First — pick a cone.`, 2.4);
}

/** Say something on the little chalkboard line, briefly. */
export function say(state, text, seconds = 1.8) {
  state.message = text;
  state.messageT = seconds;
}

/**
 * Pick (or re-pick) the cone. Allowed any time before the swirling
 * starts; the first pick moves the shop on to choosing a flavour.
 */
export function pickCone(state, id) {
  if (state.screen !== SCREEN_SERVE || state.step === STEP_SWIRL) return;
  state.selCone = id;
  blip(560, 0.07, 'triangle', 0.12);
  if (state.step === STEP_CONE) {
    state.step = STEP_FLAVOUR;
    say(state, 'Now tap a tank on the twirl-o-matic!', 2.0);
  }
}

/**
 * Pick the flavour by tapping one of the machine's tanks. Allowed from
 * the flavour step; the pick starts the swirling, and the machine is
 * visibly pleased about it.
 */
export function pickFlavour(state, id) {
  if (state.screen !== SCREEN_SERVE) return;
  if (state.step === STEP_CONE) {
    say(state, 'A cone first — then the flavour!');
    return;
  }
  if (state.step !== STEP_FLAVOUR) return;
  state.selFlavour = id;
  state.step = STEP_SWIRL;
  state.happyFaceUntil = state.time + 1.4;
  blip(920, 0.09, 'sine', 0.13);
  say(state, 'Trace circles to swirl it up!', 1.8);
}

/** The player declares the swirl finished: on to toppings (or the card). */
export function declareDone(state) {
  if (state.screen !== SCREEN_SERVE || state.step !== STEP_SWIRL || state.tower.toppled) return;
  if (state.tower.heightPx < 24) {
    say(state, 'A little taller first — trace circles to swirl!');
    return;
  }
  finishTower(state.tower);
  state.trayOpen = false;
  state.screen = SCREEN_TOP;
  blip(760, 0.08, 'sine', 0.12);
}

/** Open or close the toppings tray in the finishing phase. */
export function toggleTray(state) {
  if (state.screen !== SCREEN_TOP) return;
  state.trayOpen = !state.trayOpen;
  blip(state.trayOpen ? 840 : 500, 0.06, 'sine', 0.1);
}

/** Add or remove a topping, from inside the open tray. */
export function toggleTopping(state, id) {
  if (state.screen !== SCREEN_TOP || !state.trayOpen) return;
  const at = state.toppings.indexOf(id);
  if (at !== -1) {
    state.toppings.splice(at, 1);
    blip(420, 0.06, 'sine', 0.1);
    return;
  }
  if (state.toppings.length >= MAX_TOPPINGS) {
    say(state, `Two toppings is plenty, says ${state.customer.name}.`);
    return;
  }
  state.toppings.push(id);
  blip(880, 0.07, 'triangle', 0.12);
}

/** Hand the serve over: grade it and show the judge's card. */
export function serveIt(state) {
  const ready = state.screen === SCREEN_TOP || state.tower.toppled || state.tower.finished;
  if (!ready) return;
  const patienceLeft = Math.max(0, state.patience / state.patienceMax);
  state.result = gradeServe(state.tower, state.customer, state.toppings, patienceLeft, {
    cone: state.selCone,
    flavour: state.selFlavour,
    goalCm: state.goalCm,
    goalBand: state.goalBand,
  });
  state.results.push(state.result);
  state.totalScore += state.result.total;
  if (gradeRank(state.result.grade) > gradeRank(state.bestGrade)) state.bestGrade = state.result.grade;
  state.screen = SCREEN_CARD;
  if (state.tower.toppled) sadSlide();
  else { ding(); coinJingle(); }
}

/** Card dismissed: next customer, or closing time after the fifth. */
export function nextCustomer(state) {
  state.customerIndex += 1;
  if (state.customerIndex >= CUSTOMERS_PER_DAY) {
    state.screen = SCREEN_OVER;
    return;
  }
  beginCustomer(state);
}

/** Grade letters ranked for "best grade of the day". */
export function gradeRank(grade) {
  return { C: 0, B: 1, A: 2, S: 3 }[grade] ?? 0;
}

/**
 * The waiting gauge ran dry: the order lapses and the customer leaves.
 * No game over — the day moves on to the next customer, one serve poorer.
 */
export function customerLeaves(state) {
  state.result = {
    left: true, total: 0, grade: '–', cm: 0, height: 0, balance: 0,
    uniform: 0, goal: 0, accuracy: 0, flair: 0, toppled: false,
    coneHit: false, flavourHit: false, toppingHit: false,
    pickedCone: state.selCone, pickedFlavour: state.selFlavour,
    wants: state.customer.wants, goalName: '', goalCm: state.goalCm, leanMean: 0,
  };
  state.results.push(state.result);
  state.screen = SCREEN_CARD;
  sadSlide();
}

/** Advance the world one frame; input.js feeds state.swirl via swirl.js. */
export function updateGame(state, dt) {
  state.time += dt;
  if (state.messageT > 0) state.messageT -= dt;

  // The waiting gauge drains through every step of the serve — picking,
  // swirling, finishing: it is seasoning, never the main course —
  // running dry loses the order, never the day.
  if (state.screen === SCREEN_SERVE || state.screen === SCREEN_TOP) {
    state.patience = Math.max(0, state.patience - dt);
    if (state.patience <= 0 && !state.tower.toppled) {
      customerLeaves(state);
      return;
    }
  }
  if (state.screen !== SCREEN_SERVE || state.step !== STEP_SWIRL) return;

  const drive = {
    spinning: isSpinning(state.swirl, swirlClock()),
    spinDelta: consumeSpin(state.swirl),
    centroidX: state.swirl.centroidX,
    roundness: state.swirl.roundness,
  };
  updateTower(state.tower, dt, drive);

  if (state.tower.toppled) {
    state.toppleWait += dt;
    if (state.toppleWait > 1.25) serveIt(state);
  }
}
