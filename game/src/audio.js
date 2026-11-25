// Tiny WebAudio kitchen: every sound is synthesised, no audio files.
// The context wakes on the first pointer press (browsers keep it asleep
// until then), and the M key or the speaker button mutes the room.

let ctx = null;
let master = null;
let muted = false;
let musicTimer = null;
let musicStep = 0;

/** Create the context on first use; returns null while audio is unavailable. */
function ensureContext() {
  if (ctx) return ctx;
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor();
  master = ctx.createGain();
  master.gain.value = muted ? 0 : 0.5;
  master.connect(ctx.destination);
  return ctx;
}

/** Call from any pointer handler so later sounds can play. */
export function wakeAudio() {
  const c = ensureContext();
  if (c && c.state === 'suspended') c.resume();
}

/** One soft sine blip, the everyday click of the kitchen. */
export function blip(freq = 660, seconds = 0.07, type = 'sine', gain = 0.16) {
  const c = ensureContext();
  if (!c || muted) return;
  const osc = c.createOscillator();
  const amp = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  amp.gain.setValueAtTime(gain, c.currentTime);
  amp.gain.exponentialRampToValueAtTime(0.001, c.currentTime + seconds);
  osc.connect(amp).connect(master);
  osc.start();
  osc.stop(c.currentTime + seconds);
}

/** The service bell: two bright partials, rung when a plate goes out. */
export function ding() {
  blip(1318, 0.35, 'triangle', 0.22);
  blip(1975, 0.28, 'sine', 0.12);
}

/** A short rising arpeggio when coins land in the till. */
export function coinJingle() {
  const notes = [880, 1108, 1318, 1760];
  notes.forEach((freq, i) => {
    setTimeout(() => blip(freq, 0.12, 'square', 0.07), i * 55);
  });
}

/** A low disappointed slide when a customer gives up and leaves. */
export function sadSlide() {
  const c = ensureContext();
  if (!c || muted) return;
  const osc = c.createOscillator();
  const amp = c.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(220, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(110, c.currentTime + 0.4);
  amp.gain.setValueAtTime(0.08, c.currentTime);
  amp.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.42);
  osc.connect(amp).connect(master);
  osc.start();
  osc.stop(c.currentTime + 0.45);
}

/** Grill sizzle: a burst of filtered noise while food cooks. */
export function sizzle(seconds = 0.5) {
  const c = ensureContext();
  if (!c || muted) return;
  const length = Math.max(1, Math.floor(c.sampleRate * seconds));
  const buffer = c.createBuffer(1, length, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 3200;
  const amp = c.createGain();
  amp.gain.value = 0.05;
  src.connect(filter).connect(amp).connect(master);
  src.start();
}

/** A gentle café loop: a four-chord pluck pattern, scheduled while playing. */
const CHORDS = [
  [261.6, 329.6, 392.0],
  [220.0, 261.6, 329.6],
  [174.6, 220.0, 261.6],
  [196.0, 246.9, 392.0],
];

export function startMusic() {
  const c = ensureContext();
  if (!c || musicTimer !== null) return;
  musicTimer = setInterval(() => {
    if (muted) return;
    const chord = CHORDS[Math.floor(musicStep / 2) % CHORDS.length];
    const note = chord[musicStep % chord.length];
    blip(note, 0.5, 'triangle', 0.045);
    if (musicStep % 2 === 0) blip(chord[0] / 2, 0.6, 'sine', 0.05);
    musicStep += 1;
  }, 340);
}

export function stopMusic() {
  if (musicTimer !== null) clearInterval(musicTimer);
  musicTimer = null;
  musicStep = 0;
}

/** Flip the mute; returns the new state so the button can redraw. */
export function toggleMute() {
  muted = !muted;
  if (master) master.gain.value = muted ? 0 : 0.5;
  return muted;
}

export function isMuted() {
  return muted;
}
