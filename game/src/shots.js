// Screenshot scenes behind ?shot=title|swirl|top|card|over. Each builds its
// moment with the game's own state and grading functions — a real serve at a
// photogenic instant — so the maker's screenshots are honest renders.

import { PATIENCE_SECONDS } from './config.js';
import { createTower, finishTower, radiusAt } from './tower.js';
import { gradeServe } from './score.js';
import {
  SCREEN_SERVE, SCREEN_TOP, SCREEN_CARD, SCREEN_OVER,
  createGame, startDay, beginCustomer,
} from './game.js';

/** A hand-laid tower: `wobble` is how brave its lean looks, in pixels. */
function laidTower(heightPx, wobble, phase = 0) {
  const tower = createTower();
  tower.heightPx = heightPx;
  for (let y = 7; y <= heightPx; y += 7) {
    tower.layers.push({ dx: Math.sin(y * 0.03 + phase) * wobble, r: radiusAt(y), y });
  }
  tower.lean = tower.layers.length ? tower.layers[tower.layers.length - 1].dx : 0;
  return tower;
}

/** Stage the named scene into `state`; unknown names keep the title screen. */
export function stageShot(state, name) {
  if (name === 'swirl') {
    startDay(state);
    // Mimi's strawberry, mid-swirl: tall already, swaying, nozzle streaming.
    state.tower = laidTower(238, 7);
    state.tower.holding = true;
    state.holding = true;
    state.steer = 16;
    state.patience = PATIENCE_SECONDS * 0.72;
    state.messageT = 0;
    return;
  }
  if (name === 'top') {
    startDay(state);
    state.customerIndex = 1;
    beginCustomer(state);
    // Ponta's grand vanilla, swirled and finished, one topping already on.
    state.tower = laidTower(268, 5, 1.2);
    finishTower(state.tower);
    state.toppings = ['wafer'];
    state.patience = PATIENCE_SECONDS * 0.6;
    state.screen = SCREEN_TOP;
    state.messageT = 0;
    return;
  }
  if (name === 'card') {
    startDay(state);
    state.customerIndex = 2;
    beginCustomer(state);
    // Kero's petit matcha, neat as a pin, crowned with the asked-for star.
    state.tower = laidTower(140, 2.5, 0.6);
    finishTower(state.tower);
    state.toppings = ['star'];
    state.result = gradeServe(state.tower, state.customer, state.toppings, 0.8);
    state.results = [state.result];
    state.totalScore = state.result.total;
    state.bestGrade = state.result.grade;
    state.screen = SCREEN_CARD;
    state.messageT = 0;
    return;
  }
  if (name === 'over') {
    const plan = [
      { h: 210, w: 6, tops: ['cherry', 'sprinkle'], pat: 0.7 },
      { h: 285, w: 8, tops: ['wafer'], pat: 0.55 },
      { h: 140, w: 2.5, tops: ['star'], pat: 0.8 },
      { h: 330, w: 11, tops: ['sauce'], pat: 0.4 },
      { h: 268, w: 5, tops: ['sprinkle', 'cherry'], pat: 0.65 },
    ];
    Object.assign(state, createGame());
    state.results = plan.map((p, i) => {
      const tower = laidTower(p.h, p.w, i);
      finishTower(tower);
      return gradeServe(tower, CUSTOMER_FOR_SHOT[i], p.tops, p.pat);
    });
    state.totalScore = state.results.reduce((sum, r) => sum + r.total, 0);
    state.bestGrade = state.results.reduce((best, r) => (gradeRankOf(r.grade) > gradeRankOf(best) ? r.grade : best), 'C');
    state.customerIndex = 4;
    state.customer = CUSTOMER_FOR_SHOT[4];
    state.screen = SCREEN_OVER;
    return;
  }
  // 'title' and anything else: the title screen as it opens.
}

import { CUSTOMER_PLAN as CUSTOMER_FOR_SHOT } from './menu.js';
import { gradeRank as gradeRankOf } from './game.js';
