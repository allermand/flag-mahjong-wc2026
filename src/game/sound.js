// Tiny Web Audio synthesiser — no audio files, works offline.
// Sounds are generated on the fly: a poof on match, a fanfare on win, and a
// descending tone on loss. Honours an on/off flag toggled from the UI.

let ctx = null;
let enabled = true;

export function setSoundEnabled(value) {
  enabled = value;
}

// Lazily create / resume the AudioContext (browsers require a user gesture,
// which has always happened by the time we play anything).
function audio() {
  if (!ctx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    ctx = new Ctx();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// A single shaped oscillator note (optionally gliding to another pitch).
function tone(freq, startAt, dur, { type = 'sine', gain = 0.2, slideTo = null } = {}) {
  const c = audio();
  if (!c) return;
  const t0 = c.currentTime + startAt;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
}

// A filtered burst of white noise — the "poof".
function noiseBurst(dur, { gain = 0.28, from = 1600, to = 400 } = {}) {
  const c = audio();
  if (!c) return;
  const t0 = c.currentTime;
  const size = Math.max(1, Math.floor(c.sampleRate * dur));
  const buffer = c.createBuffer(1, size, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < size; i += 1) data[i] = Math.random() * 2 - 1;

  const src = c.createBufferSource();
  src.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(from, t0);
  filter.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

  src.connect(filter).connect(g).connect(c.destination);
  src.start(t0);
  src.stop(t0 + dur + 0.02);
}

export function playPoof() {
  if (!enabled) return;
  noiseBurst(0.22);
}

export function playWin() {
  if (!enabled) return;
  // Rising arpeggio C5–E5–G5–C6.
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
    tone(f, i * 0.12, 0.28, { type: 'triangle', gain: 0.22 })
  );
}

export function playLose() {
  if (!enabled) return;
  // Two descending notes, the second sliding down — a sad "wah-wah".
  tone(392, 0, 0.26, { type: 'sawtooth', gain: 0.18 });
  tone(311.13, 0.24, 0.55, { type: 'sawtooth', gain: 0.18, slideTo: 174.61 });
}
