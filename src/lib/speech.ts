// Speaks in the most natural British English voice the device has.
// A recorded natural voice from the server will replace this before launch.
let enabled = true;
let chosen: SpeechSynthesisVoice | null = null;

const PREFERRED = [/sonia.*natural/i, /libby.*natural/i, /natural.*en-gb/i, /serena/i, /kate/i, /google uk english female/i, /martha/i, /stephanie/i];

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof speechSynthesis === 'undefined') return null;
  const voices = speechSynthesis.getVoices();
  const gb = voices.filter((v) => /en[-_]GB/i.test(v.lang));
  for (const re of PREFERRED) {
    const v = gb.find((x) => re.test(x.name)) ?? voices.find((x) => re.test(x.name) && /en/i.test(x.lang));
    if (v) return v;
  }
  return gb[0] ?? voices.find((v) => /^en/i.test(v.lang)) ?? null;
}

if (typeof speechSynthesis !== 'undefined') {
  speechSynthesis.onvoiceschanged = () => {
    chosen = pickVoice();
  };
}

export function setVoiceOn(on: boolean) {
  enabled = on;
  if (!on) stopSpeaking();
}

export function speak(text: string, opts: { rate?: number; pitch?: number } = {}) {
  if (!enabled || typeof speechSynthesis === 'undefined') return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    chosen = chosen ?? pickVoice();
    if (chosen) u.voice = chosen;
    u.lang = 'en-GB';
    u.rate = opts.rate ?? 0.9;
    u.pitch = opts.pitch ?? 1.05;
    speechSynthesis.speak(u);
  } catch {
    /* speech is a nice extra; the text is always on screen */
  }
}

export function stopSpeaking() {
  try {
    speechSynthesis?.cancel();
  } catch {
    /* ignore */
  }
}
