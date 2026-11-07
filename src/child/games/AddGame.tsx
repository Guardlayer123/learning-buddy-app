import { useEffect, useState } from 'react';
import { GameFrame, Finished, ROUNDS, useFeedback } from './GameKit';
import { Pic, shuffle } from '../../components/Bits';
import { speak } from '../../lib/speech';

const FRUIT = [
  { art: 'red-apple', one: 'apple', many: 'apples' },
  { art: 'banana', one: 'banana', many: 'bananas' },
  { art: 'strawberry', one: 'strawberry', many: 'strawberries' },
  { art: 'carrot', one: 'carrot', many: 'carrots' },
  { art: 'cookie', one: 'biscuit', many: 'biscuits' },
  { art: 'duck', one: 'duck', many: 'ducks' },
];

function makeRound(round: number) {
  const max = round < 2 ? 5 : round < 4 ? 8 : 10;
  const a = 1 + Math.floor(Math.random() * (max - 1));
  const b = 1 + Math.floor(Math.random() * (max - a));
  const sum = a + b;
  const opts = new Set([sum]);
  for (const d of shuffle([-1, 1, 2, -2])) {
    if (opts.size === 3) break;
    if (sum + d > 0) opts.add(sum + d);
  }
  return { a, b, sum, fruit: FRUIT[Math.floor(Math.random() * FRUIT.length)], options: shuffle([...opts]) };
}

const name = (f: (typeof FRUIT)[number], n: number) => `${n} ${n === 1 ? f.one : f.many}`;

export function AddGame() {
  const [round, setRound] = useState(0);
  const [q, setQ] = useState(() => makeRound(0));
  const [counted, setCounted] = useState<number[]>([]);
  const [tried, setTried] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const fb = useFeedback();

  useEffect(() => {
    if (round < ROUNDS) fb.say(`${name(q.fruit, q.a)} and ${name(q.fruit, q.b)}. How many altogether? Tap each one to count.`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  if (round >= ROUNDS)
    return (
      <Finished
        activityId="adding"
        onAgain={() => {
          setRound(0);
          setQ(makeRound(0));
          setCounted([]);
          setTried([]);
          setSolved(false);
        }}
      />
    );

  const tapItem = (i: number) => {
    if (counted.includes(i)) return;
    const next = [...counted, i];
    setCounted(next);
    speak(String(next.length), { rate: 1 });
  };

  const choose = (n: number) => {
    if (solved) return;
    if (n === q.sum) {
      setSolved(true);
      fb.yes(`${q.a} add ${q.b} makes ${q.sum}.`);
      setTimeout(() => {
        const r = round + 1;
        setRound(r);
        setQ(makeRound(r));
        setCounted([]);
        setTried([]);
        setSolved(false);
      }, 2600);
    } else {
      setTried((t) => [...t, n]);
      fb.no('Not quite. Try tapping each one to count them.');
    }
  };

  const group = (count: number, offset: number) => (
    <div className="row" style={{ justifyContent: 'center', gap: 4, maxWidth: 260 }}>
      {Array.from({ length: count }, (_, k) => {
        const i = offset + k;
        const n = counted.indexOf(i);
        return (
          <button
            key={i}
            onClick={() => tapItem(i)}
            aria-label={n >= 0 ? `Counted ${n + 1}` : 'Count this one'}
            style={{ border: 'none', background: 'none', padding: 2, position: 'relative' }}
          >
            <Pic name={q.fruit.art} size={50} />
            {n >= 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  background: 'var(--meadow)',
                  color: '#fff',
                  borderRadius: 999,
                  minWidth: 26,
                  height: 26,
                  fontFamily: 'var(--font-play)',
                  fontWeight: 600,
                  fontSize: 15,
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                {n + 1}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <GameFrame title="Adding up" round={round} mood={fb.mood} line={fb.line} pulse={fb.pulse}>
      <div className="row" style={{ justifyContent: 'center', alignItems: 'center', gap: 12 }}>
        {group(q.a, 0)}
        <span style={{ fontFamily: 'var(--font-play)', fontSize: '2.4rem', fontWeight: 600 }}>+</span>
        {group(q.b, q.a)}
      </div>
      <p style={{ fontFamily: 'var(--font-play)', fontSize: '1.8rem', fontWeight: 600 }}>
        {q.a} + {q.b} = {solved ? q.sum : '?'}
      </p>
      <div className="choices" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {q.options.map((n) => (
          <button
            key={n}
            className={`choice ${solved && n === q.sum ? 'right' : ''} ${tried.includes(n) ? 'tried' : ''}`}
            style={{ fontSize: '2rem' }}
            onClick={() => choose(n)}
            disabled={tried.includes(n)}
          >
            {n}
          </button>
        ))}
      </div>
    </GameFrame>
  );
}
