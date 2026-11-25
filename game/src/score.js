// The judge's card: how a finished serve is graded. Height, balance and
// smoothness make the base 90, the customer's height goal adds up to 10,
// toppings add flair, and the trait on the ticket bends one part of the card.
// A toppled tower is capped: it was tall, but it is on the floor.

import { HEIGHT_GOALS, TRAITS, pxToCm } from './menu.js';
import { leanStats, smoothness } from './tower.js';

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
 * Returns the full breakdown the results card shows.
 */
export function gradeServe(tower, customer, toppings, patienceLeft) {
  const cm = pxToCm(tower.heightPx);
  const goal = HEIGHT_GOALS[customer.goal];
  const trait = TRAITS[customer.trait];
  const stats = leanStats(tower);
  const jerk = smoothness(tower);

  // Height: full marks at the Summit line, scaled down for shorter stacks.
  let height = Math.min(40, (tower.heightPx / 360) * 40);
  // Balance: a centred stack keeps its points; lean and wobble take them away.
  let balance = Math.max(0, 30 - stats.mean * 0.85 - Math.max(0, stats.worst - 18) * 0.5);
  // Uniformity: smooth steering lays even swirls; jerky hands lay messy ones.
  let uniform = Math.max(0, 20 - jerk * 5.2);
  // Order match: land inside the customer's height band for up to 10,
  // and crown it with the topping the ticket asked for, for 4 more.
  const off = Math.abs(cm - goal.cm);
  let goalPts = Math.max(0, 10 - Math.max(0, off - goal.band) * 2.6);
  const toppingHit = toppings.includes(customer.wants);
  if (toppingHit) goalPts += 4;
  // Flair: toppings chosen, up to two, plus a kind word for a quick serve.
  let flair = toppings.length * 2 + Math.round(patienceLeft * 2);

  // The ticket's trait bends its favourite part of the card.
  if (trait.focus === 'height') height = Math.min(44, height * 1.12);
  if (trait.focus === 'balance') balance = Math.min(33, balance * 1.12);
  if (trait.focus === 'uniform') uniform = Math.min(22, uniform * 1.12);
  if (trait.focus === 'flair') flair = Math.min(9, flair + toppings.length);

  let total = height + balance + uniform + goalPts + flair;
  if (tower.toppled) total *= 0.55;
  total = Math.max(1, Math.min(100, Math.round(total)));

  return {
    cm,
    height: Math.round(height),
    balance: Math.round(balance),
    uniform: Math.round(uniform),
    goal: Math.round(goalPts),
    flair: Math.round(flair),
    total,
    grade: tower.toppled ? (total >= 62 ? 'B' : 'C') : gradeOf(total),
    toppled: tower.toppled,
    leanMean: Math.round(stats.mean),
    goalName: goal.name,
    goalCm: goal.cm,
    toppingHit,
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
    { key: 'uniform', value: result.uniform, text: 'Tall and proud! Smoother steering evens the swirls.' },
    { key: 'goal', value: result.goal, text: `${customer.name} dreamed of a ${result.goalName} (${result.goalCm} cm).` },
  ];
  parts.sort((a, b) => a.value - b.value);
  return parts[0].text;
}
