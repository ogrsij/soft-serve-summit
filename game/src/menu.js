// The atelier's menu board: flavours, cones, toppings and the customers who
// order them. A customer asks for one flavour in one cone, a height to aim
// for, and brings a trait that bends how the serve is scored.

export const FLAVOURS = {
  vanilla:   { name: 'Vanilla Bean',  body: '#fff3d6', shade: '#ecd9a8', fleck: '#8a6b3a' },
  strawberry:{ name: 'Strawberry',    body: '#ffc2d1', shade: '#f19bb3', fleck: '#d1607f' },
  matcha:    { name: 'Matcha',        body: '#cfe3a8', shade: '#a7c47e', fleck: '#6d8f4e' },
  chocolate: { name: 'Chocolate',     body: '#a9744f', shade: '#845431', fleck: '#5f3a20' },
  soda:      { name: 'Ramune Soda',   body: '#bfe6f5', shade: '#8fcbe8', fleck: '#4d93b8' },
};

export const CONES = {
  waffle: { name: 'Waffle Cone',   body: '#d99a4e', line: '#b57a35' },
  choc:   { name: 'Choco Cone',    body: '#7a4a28', line: '#5f3a20' },
  cup:    { name: 'Paper Cup',     body: '#fdfdf8', line: '#d8d2c0' },
};

/** Clicked after the swirl stops; up to two, each a little flourish. */
export const TOPPINGS = {
  cherry:   { name: 'Cherry',        colour: '#d92b3a' },
  sauce:    { name: 'Choco Sauce',   colour: '#5f3a20' },
  sprinkle: { name: 'Sprinkles',     colour: '#f2b234' },
  wafer:    { name: 'Wafer Stick',   colour: '#e6c07a' },
  star:     { name: 'Star Candy',    colour: '#ffb703' },
};
export const TOPPING_ORDER = ['cherry', 'sauce', 'sprinkle', 'wafer', 'star'];
export const MAX_TOPPINGS = 2;

/** What a customer hopes for, in centimetres of soft serve above the cone. */
export const HEIGHT_GOALS = {
  petit:  { name: 'Petit',  cm: 9,  band: 3.2 },
  classic:{ name: 'Classic', cm: 14, band: 3.6 },
  grand:  { name: 'Grand',  cm: 19, band: 4.0 },
  summit: { name: 'Summit', cm: 24, band: 4.4 },
};

/** Traits bend one part of the score: read them on the order ticket. */
export const TRAITS = {
  dreamer:  { name: 'Sky-high dreamer',  note: 'Height counts double-ish. Go tall!', focus: 'height' },
  neat:     { name: 'Neat freak',        note: 'Smooth, even swirls or nothing.', focus: 'uniform' },
  wobbly:   { name: 'Balance critic',    note: 'Judges the lean. Keep it centred.', focus: 'balance' },
  sweet:    { name: 'Sweet tooth',       note: 'Loves toppings. Finish with flair.', focus: 'flair' },
};

/** The day's five customers: name, face kind, flavour, cone, goal, trait. */
export const CUSTOMER_PLAN = [
  { name: 'Mimi',  animal: 'rabbit', flavour: 'strawberry', cone: 'waffle', goal: 'classic', trait: 'sweet', wants: 'cherry' },
  { name: 'Ponta', animal: 'bear',   flavour: 'vanilla',    cone: 'waffle', goal: 'grand',   trait: 'dreamer', wants: 'wafer' },
  { name: 'Kero',  animal: 'frog',   flavour: 'matcha',     cone: 'cup',    goal: 'petit',   trait: 'neat', wants: 'star' },
  { name: 'Nia',   animal: 'cat',    flavour: 'chocolate',  cone: 'choc',   goal: 'summit',  trait: 'wobbly', wants: 'sauce' },
  { name: 'Piu',   animal: 'bird',   flavour: 'soda',       cone: 'waffle', goal: 'grand',   trait: 'dreamer', wants: 'wafer' },
];

/** Pixels of tower to centimetres on the height ruler (about 15 px per cm). */
export const PX_PER_CM = 15;

/** Height of `px` pixels, in centimetres, one decimal. */
export function pxToCm(px) {
  return Math.round((px / PX_PER_CM) * 10) / 10;
}
