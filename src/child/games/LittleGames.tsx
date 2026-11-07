import { useEffect, useState } from 'react';
import { GameFrame, Finished, ROUNDS, useFeedback } from './GameKit';
import { Pic, shuffle } from '../../components/Bits';
import { speak } from '../../lib/speech';

const THINGS = [
  { art: 'duck', one: 'duck', many: 'ducks' },
  { art: 'red-apple', one: 'apple', many: 'apples' },
  { art: 'star', one: 'star', many: 'stars' },
  { art: 'balloon', one: 'balloon', many: 'balloons' },
  { art: 'butterfly', one: 'butterfly', many: 'butterflies' },
  { art: 'teddy-bear', one: 'teddy', many: 'teddies' },
];
const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

function countRound(round: number) {
  const max = round < 2 ? 3 : round < 4 ? 5 : 6;
  const n = 1 + Math.floor(Math.random() * max);
  const opts = new Set([n]);
  for (const d of shuffle([1, -1, 2, -2])) {
    if (opts.size === 3) break;
    if (n + d >= 1) opts.add(n + d);
  }
  return { n, thing: THINGS[Math.floor(Math.random() * THINGS.length)], options: [...opts].sort((a, b) => a - b) };
}

/** Ages 3–5: tap each picture to count it, then pick the number. */
export function CountGame() {
  const [round, setRound] = useState(0);
  const [q, setQ] = useState(() => countRound(0));
  const [counted, setCounted] = useState<number[]>([]);
  const [tried, setTried] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const fb = useFeedback();

  useEffect(() => {
    if (round < ROUNDS) fb.say(`How many ${q.thing.many}? Tap each one to count.`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const next = (r: number) => {
    setRound(r);
    setQ(countRound(r));
    setCounted([]);
    setTried([]);
    setSolved(false);
  };
  if (round >= ROUNDS) return <Finished activityId="count" onAgain={() => next(0)} />;

  const tap = (i: number) => {
    if (counted.includes(i)) return;
    const c = [...counted, i];
    setCounted(c);
    speak(NUMBER_WORDS[c.length], { rate: 0.9 });
  };
  const choose = (n: number) => {
    if (solved) return;
    if (n === q.n) {
      setSolved(true);
      fb.yes(`${NUMBER_WORDS[n]} ${n === 1 ? q.thing.one : q.thing.many}!`);
      setTimeout(() => next(round + 1), 2300);
    } else {
      setTried((t) => [...t, n]);
      fb.no('Let’s count them together. Tap each one.');
      setCounted([]);
    }
  };

  return (
    <GameFrame title="Counting" round={round} mood={fb.mood} line={fb.line} pulse={fb.pulse}>
      <div className="row" style={{ justifyContent: 'center', gap: 6, maxWidth: 320 }}>
        {Array.from({ length: q.n }, (_, i) => {
          const k = counted.indexOf(i);
          return (
            <button
              key={i}
              onClick={() => tap(i)}
              aria-label={k >= 0 ? `Counted ${k + 1}` : 'Count this one'}
              style={{ border: 'none', background: 'none', padding: 2, position: 'relative' }}
            >
              <Pic name={q.thing.art} size={72} />
              {k >= 0 && <span className="count-badge">{k + 1}</span>}
            </button>
          );
        })}
      </div>
      <div className="choices" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {q.options.map((n) => (
          <button
            key={n}
            className={`choice ${solved && n === q.n ? 'right' : ''} ${tried.includes(n) ? 'tried' : ''}`}
            style={{ fontSize: '2.4rem', minHeight: 84 }}
            disabled={tried.includes(n)}
            onClick={() => choose(n)}
          >
            {n}
          </button>
        ))}
      </div>
    </GameFrame>
  );
}

// First sounds: the word, its first sound, and how to say that sound
const WORDS = [
  { word: 'sun', art: 'sun', s: 's', say: 'sss' },
  { word: 'socks', art: 'socks', s: 's', say: 'sss' },
  { word: 'cat', art: 'cat-face', s: 'c', say: 'k' },
  { word: 'carrot', art: 'carrot', s: 'c', say: 'k' },
  { word: 'dog', art: 'dog-face', s: 'd', say: 'duh' },
  { word: 'duck', art: 'duck', s: 'd', say: 'duh' },
  { word: 'fish', art: 'fish', s: 'f', say: 'fff' },
  { word: 'frog', art: 'frog', s: 'f', say: 'fff' },
  { word: 'bus', art: 'bus', s: 'b', say: 'buh' },
  { word: 'banana', art: 'banana', s: 'b', say: 'buh' },
  { word: 'mouse', art: 'mouse-face', s: 'm', say: 'mmm' },
  { word: 'milk', art: 'glass-of-milk', s: 'm', say: 'mmm' },
  { word: 'tent', art: 'tent', s: 't', say: 't' },
  { word: 'tooth', art: 'tooth', s: 't', say: 't' },
  { word: 'apple', art: 'red-apple', s: 'a', say: 'a' },
];

function soundRound() {
  const answer = WORDS[Math.floor(Math.random() * WORDS.length)];
  const others = shuffle(WORDS.filter((w) => w.s !== answer.s));
  const picked = [answer, others[0], others.find((w) => w.s !== others[0].s)!];
  return { answer, options: shuffle(picked) };
}

/** Ages 3–5: which picture starts with this sound? */
export function FirstSoundGame() {
  const [round, setRound] = useState(0);
  const [q, setQ] = useState(soundRound);
  const [tried, setTried] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  const fb = useFeedback();

  useEffect(() => {
    if (round < ROUNDS) fb.say(`Which one starts with ${q.answer.say}?`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const next = (r: number) => {
    setRound(r);
    setQ(soundRound());
    setTried([]);
    setSolved(false);
  };
  if (round >= ROUNDS) return <Finished activityId="firstsounds" onAgain={() => next(0)} />;

  const choose = (w: string) => {
    if (solved) return;
    if (w === q.answer.word) {
      setSolved(true);
      fb.yes(`${q.answer.say}, ${q.answer.word}!`);
      setTimeout(() => next(round + 1), 2300);
    } else {
      setTried((t) => [...t, w]);
      speak(w);
      fb.no(`That's ${w}. Listen: ${q.answer.say}. Try again!`);
    }
  };

  return (
    <GameFrame title="First sounds" round={round} mood={fb.mood} line={fb.line} pulse={fb.pulse}>
      <button className="choice" style={{ fontSize: '3.4rem', minWidth: 120, minHeight: 100 }} onClick={() => speak(q.answer.say, { rate: 0.8 })} aria-label={`Hear the sound ${q.answer.s}`}>
        {q.answer.s}
      </button>
      <div className="choices pics">
        {q.options.map((w) => (
          <button
            key={w.word}
            className={`choice ${solved && w.word === q.answer.word ? 'right' : ''} ${tried.includes(w.word) ? 'tried' : ''}`}
            disabled={tried.includes(w.word)}
            onClick={() => choose(w.word)}
            aria-label={w.word}
          >
            <Pic name={w.art} size={80} />
          </button>
        ))}
      </div>
    </GameFrame>
  );
}
