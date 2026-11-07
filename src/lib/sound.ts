// Soft chimes made in code. Muted in Low Sensory Mode.
let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(m: boolean) {
  muted = m;
}

function tone(freq: number, start: number, dur: number, vol = 0.08) {
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, ctx.currentTime + start);
  g.gain.linearRampToValueAtTime(vol, ctx.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);
  o.connect(g).connect(ctx.destination);
  o.start(ctx.currentTime + start);
  o.stop(ctx.currentTime + start + dur + 0.05);
}

function ready() {
  if (muted) return false;
  try {
    ctx = ctx ?? new AudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    return true;
  } catch {
    return false;
  }
}

export function chimeYes() {
  if (!ready()) return;
  tone(660, 0, 0.25);
  tone(880, 0.12, 0.35);
}

export function chimeTry() {
  if (!ready()) return;
  tone(440, 0, 0.3, 0.05);
}

export function chimeStar() {
  if (!ready()) return;
  [784, 988, 1175, 1568].forEach((f, i) => tone(f, i * 0.09, 0.3, 0.06));
}
