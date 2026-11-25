// The judge's card: how a finished serve is graded. Height, balance and
// smoothness make the base, the customer's height goal adds its share,
// and a new slice — ticket accuracy — rewards picking the very cone,
// flavour and topping the ticket asked for. Toppings still add flair,
// and the trait on the ticket bends one part of the card. A toppled
// tower is capped: it was tall, but it is on the floor.

import { HEIGHT_GOALS, TRAITS, pxToCm } from './menu.js';
import { leanStats, smoothness, roundnessMean } from './tower.js';

/** Grade letters by total: the atelier's stamp of approval. */
export function gradeOf(total) {
  if (total >= 90) return 'S';
  if (total >= 78) return 'A';
  if (total >= 62) return 'B';
  return 'C';
}

/**
 * Grade a finished (or toppled) tower for one customer.
 * `customer` is the plan entry; `toppings` the chosen topping ids;
 * `patienceLeft` is 0..1 of the customer's patience remaining.
 * `picks` says what the player actually chose — { cone, flavour } — and
 * the shift-bent goal — { goalCm, goalBand }; anything missing counts as
 * exactly what the ticket asked for (staged scenes grade that way).
 * Returns the full breakdown the results card shows.
 */
export function gradeServe(tower, customer, toppings, patienceLeft, picks = {}) {
  const cm = pxToCm(tower.heightPx);
  const goal = HEIGHT_GOALS[customer.goal];
  const trait = TRAITS[customer.trait];
  const stats = leanStats(tower);
  const jerk = smoothness(tower);
  const round = roundnessMean(tower);

  const pickedCone = picks.cone ?? customer.cone;
  const pickedFlavour = picks.flavour ?? customer.flavour;
  const goalCm = picks.goalCm ?? goal.cm;
  const goalBand = picks.goalBand ?? goal.band;

  // Height: full marks at the Summit line, scaled down for shorter stacks.
  let height = Math.min(36, (tower.heightPx / 360) * 36);
  // Balance: a centred stack keeps its points; lean and wobble take them away.
  let balance = Math.max(0, 27 - stats.mean * 0.8 - Math.max(0, stats.worst - 18) * 0.45);
  // Uniformity: the roundness of the laps that laid the swirls, with a
  // word against centres that wandered from layer to layer.
  let uniform = Math.max(0, 17 - (1 - round) * 15 - jerk * 3.2);
  // Height goal: land inside the customer's (shift-bent) band for up to 8.
  const off = Math.abs(cm - goalCm);
  let goalPts = Math.max(0, 8 - Math.max(0, off - goalBand) * 2.6);
  // Ticket accuracy: the serve the ticket actually ordered — the right
  // cone, the right flavour, and the topping it dreamed of on top.
  const coneHit = pickedCone === customer.cone;
  const flavourHit = pickedFlavour === customer.flavour;
  const toppingHit = toppings.includes(customer.wants);
  const accuracy = (coneHit ? 3 : 0) + (flavourHit ? 3 : 0) + (toppingHit ? 4 : 0);
  // Flair: toppings chosen, up to two, plus a kind word for a quick serve.
  let flair = toppings.length * 2 + Math.round(patienceLeft * 2);

  // The ticket's trait bends its favourite part of the card.
  if (trait.focus === 'height') height = Math.min(40, height * 1.12);
  if (trait.focus === 'balance') balance = Math.min(30, balance * 1.12);
  if (trait.focus === 'uniform') uniform = Math.min(19, uniform * 1.12);
  if (trait.focus === 'flair') flair = Math.min(9, flair + toppings.length);

  let total = height + balance + uniform + goalPts + accuracy + flair;
  if (tower.toppled) total *= 0.55;
  total = Math.max(1, Math.min(100, Math.round(total)));

  return {
    cm,
    height: Math.round(height),
    balance: Math.round(balance),
    uniform: Math.round(uniform),
    goal: Math.round(goalPts),
    accuracy,
    flair: Math.round(flair),
    total,
    grade: tower.toppled ? (total >= 62 ? 'B' : 'C') : gradeOf(total),
    toppled: tower.toppled,
    leanMean: Math.round(stats.mean),
    goalName: goal.name,
    goalCm,
    coneHit,
    flavourHit,
    toppingHit,
    pickedCone,
    pickedFlavour,
    wants: customer.wants,
  };
}

/** One warm sentence for the results card, picked from the weakest part. */
export function verdictLine(result, customer) {
  if (result.toppled) return 'It leaned, it listed… it lay down. The height was brave!';
  if (result.grade === 'S') return 'A summit of a swirl! The atelier applauds.';
  const parts = [
    { key: 'height', value: result.height, text: 'A little more height next time — reach for the sky!' },
    { key: 'balance', value: result.balance, text: 'Lovely swirl! A steadier centre would crown it.' },
    { key: 'uniform', value: result.uniform, text: 'Tall and proud! Rounder circles even the swirls.' },
    { key: 'goal', value: result.goal, text: `${customer.name} dreamed of a ${result.goalName} (${result.goalCm} cm).` },
  ];
  parts.sort((a, b) => a.value - b.value);
  return parts[0].text;
}
