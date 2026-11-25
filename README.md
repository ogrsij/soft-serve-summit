# soft-serve-summit

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/ogrsij/soft-serve-summit/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/ogrsij/soft-serve-summit/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

Soft Serve Summit is a browser cooking game about how good a serve you
can make. You hold the cone in your own hand: trace circles to swirl the
soft serve higher, and steady the tower yourself — where you centre your
circles is where the new cream lands, so circling against a lean walks
the top back upright. Five customers a day hand you order tickets —
a flavour, a cone, a height to aim for, a topping they dream of — and
every serve is graded on height, balance, evenness of the swirls and
how well it matches the ticket. Plain static files and canvas; no build
step, no dependencies, everything original.

![Cover](screenshots/1-swirl.jpg)

## The game

Five customers visit your little soft serve atelier. Each hands you an
order ticket — a flavour, a cone, a height to aim for, a topping they
dream of, and a trait that bends the judging — and watches the waiting
gauge while you work.

- **Trace circles** around the cone with the mouse or a finger: the
  serve grows only while you honestly circle — holding still lays
  nothing. Rounder laps lay evener swirls.
- **Steady the lean yourself**: where you centre your circles is where
  the new cream lands. When the tower leans, circle a little against
  the tilt and walk the top back upright. The taller the tower, the
  harder it sways, and a leaning tower left alone topples.
- **Let go** to pause and breathe; press **DONE!** when it stands right.
- **Finish** with up to two toppings — match the ticket's request — and
  ring the bell.

Every serve is graded like a judge's card: height, balance, evenness of
the swirls, how well it matches the order, and a little flair. Grades run
C to S. Run out of waiting time and the customer simply leaves — the day
goes on.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

The game is plain static files under `game/` — no build step, no network.
Sounds and music are synthesised with WebAudio; the art is drawn in
canvas. Everything is original.

## Layout

- `main.ts` — the hand-in program: copies `game/` and `screenshots/` to
  the output directory and writes `dossier.json` via
  `vendor/makefun-game.ts` (the make.fun kit library, unchanged).
- `game/src/` — one file per job: `tower.js` grows and topples the stack,
  `swirl.js` reads the circling hand, `score.js` grades it, `game.js`
  runs the day, `render.js` draws it, `input.js` wires the pointer,
  `menu.js` is the menu board, `shots.js` stages the screenshots.
- `screenshots/` — four renders of the game itself, taken by its maker.

## License

MIT — see `LICENSE`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=z2men2sp&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
