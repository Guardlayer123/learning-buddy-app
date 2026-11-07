import { useEffect, useState } from 'react';
import { GameFrame, Finished, ROUNDS, useFeedback } from './GameKit';
import { shuffle } from '../../components/Bits';

/* ---------- Times tables ---------- */
const TABLES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

function timesRound(table: number) {
  const b = 1 + Math.floor(Math.random() * 12);
  const ans = table * b;
  const opts = new Set([ans]);
  for (const d of shuffle([table, -table, 1, -1, 2])) {
    if (opts.size === 4) break;
    if (ans + d > 0) opts.add(ans + d);
  }
  return { a: table, b, ans, options: shuffle([...opts]) };
}

export function TimesGame() {
  const [table, setTable] = useState(0);
  const [round, setRound] = useState(0);
  const [q, setQ] = useState(() => timesRound(2));
  const [tried, setTried] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const fb = useFeedback();

  useEffect(() => {
    if (!table) fb.say('Which times table shall we practise?');
    else if (round < ROUNDS) fb.say(`What is ${q.a} times ${q.b}?`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, table]);

  const start = (t: number, r = 0) => {
    setTable(t);
    setRound(r);
    setQ(timesRound(t));
    setTried([]);
    setSolved(false);
  };

  if (!table)
    return (
      <GameFrame title="Times tables" round={0} mood={fb.mood} line={fb.line} pulse={fb.pulse}>
        <div className="choices" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {TABLES.map((t) => (
            <button key={t} className="choice" onClick={() => start(t)}>
              {t}×
            </button>
          ))}
        </div>
      </GameFrame>
    );
  if (round >= ROUNDS) return <Finished activityId="times" onAgain={() => setTable(0)} />;

  const choose = (n: number) => {
    if (solved) return;
    if (n === q.ans) {
      setSolved(true);
      fb.yes(`${q.a} times ${q.b} is ${q.ans}.`);
      setTimeout(() => start(table, round + 1), 2000);
    } else {
      setTried((t) => [...t, n]);
      fb.no(`Not quite. Try counting up in ${q.a}s, ${q.b} times.`);
    }
  };

  return (
    <GameFrame title={`The ${table} times table`} round={round} mood={fb.mood} line={fb.line} pulse={fb.pulse}>
      <p className="big-sum">
        {q.a} × {q.b} = {solved ? q.ans : '?'}
      </p>
      <div className="choices" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        {q.options.map((n) => (
          <button
            key={n}
            className={`choice ${solved && n === q.ans ? 'right' : ''} ${tried.includes(n) ? 'tried' : ''}`}
            style={{ fontSize: '2rem' }}
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

/* ---------- Money ---------- */
const COINS = [1, 2, 5, 10, 20, 50, 100, 200];
const label = (p: number) => (p >= 100 ? `£${p / 100}` : `${p}p`);
export const money = (p: number) => (p >= 100 ? `£${(p / 100).toFixed(2)}` : `${p}p`);

function Coin({ p }: { p: number }) {
  const gold = p === 1 || p === 2 ? '#c9814a' : p >= 100 ? '#d9b44a' : '#c4ccd4';
  const size = p === 1 || p === 5 ? 54 : p === 2 || p === 10 || p === 50 ? 64 : p === 20 ? 56 : 66;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-label={label(p)} role="img">
      {p === 20 || p === 50 ? (
        <polygon
          points={Array.from({ length: 7 }, (_, i) => {
            const a = (i * 2 * Math.PI) / 7 - Math.PI / 2;
            return `${50 + 46 * Math.cos(a)},${50 + 46 * Math.sin(a)}`;
          }).join(' ')}
          fill={gold}
          stroke="rgba(0,0,0,0.25)"
          strokeWidth="3"
        />
      ) : (
        <circle cx="50" cy="50" r="46" fill={gold} stroke="rgba(0,0,0,0.25)" strokeWidth="3" />
      )}
      {p === 200 && <circle cx="50" cy="50" r="30" fill="#c4ccd4" />}
      <text x="50" y="60" textAnchor="middle" fontSize="28" fontWeight="700" fontFamily="var(--font-play)" fill="#23324a">
        {label(p)}
      </text>
    </svg>
  );
}

type MoneyQ = { kind: 'total'; coins: number[]; ans: number; options: number[] } | { kind: 'change'; price: number; paid: number; ans: number; options: number[] };

function moneyRound(round: number): MoneyQ {
  if (round % 2 === 0) {
    const coins = Array.from({ length: 2 + Math.floor(Math.random() * 3) }, () => COINS[Math.floor(Math.random() * (round < 2 ? 6 : 8))]).sort((a, b) => b - a);
    const ans = coins.reduce((s, c) => s + c, 0);
    const opts = new Set([ans]);
    for (const d of shuffle([10, -10, 5, -5, 1])) if (opts.size < 3 && ans + d > 0) opts.add(ans + d);
    return { kind: 'total', coins, ans, options: shuffle([...opts]) };
  }
  const paid = round < 3 ? 100 : 500;
  const price = paid === 100 ? 5 * (2 + Math.floor(Math.random() * 18)) : 10 * (5 + Math.floor(Math.random() * 44));
  const ans = paid - price;
  const opts = new Set([ans]);
  for (const d of shuffle([10, -10, 5, -5, 20])) if (opts.size < 3 && ans + d > 0) opts.add(ans + d);
  return { kind: 'change', price, paid, ans, options: shuffle([...opts]) };
}

export function MoneyGame() {
  const [round, setRound] = useState(0);
  const [q, setQ] = useState(() => moneyRound(0));
  const [tried, setTried] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const fb = useFeedback();

  useEffect(() => {
    if (round >= ROUNDS) return;
    fb.say(q.kind === 'total' ? 'How much money is here altogether?' : `It costs ${money(q.price)}. You pay with ${money(q.paid)}. How much change do you get?`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const next = (r: number) => {
    setRound(r);
    setQ(moneyRound(r));
    setTried([]);
    setSolved(false);
  };
  if (round >= ROUNDS) return <Finished activityId="money" onAgain={() => next(0)} />;

  const choose = (n: number) => {
    if (solved) return;
    if (n === q.ans) {
      setSolved(true);
      fb.yes(q.kind === 'total' ? `That's ${money(n)}.` : `${money(q.paid)} take away ${money(q.price)} is ${money(n)}.`);
      setTimeout(() => next(round + 1), 2400);
    } else {
      setTried((t) => [...t, n]);
      fb.no(q.kind === 'total' ? 'Not quite. Start with the biggest coin and add the others one at a time.' : `Not quite. Count up from ${money(q.price)} to ${money(q.paid)}.`);
    }
  };

  return (
    <GameFrame title="Money" round={round} mood={fb.mood} line={fb.line} pulse={fb.pulse}>
      {q.kind === 'total' ? (
        <div className="row" style={{ justifyContent: 'center' }}>
          {q.coins.map((c, i) => (
            <Coin key={i} p={c} />
          ))}
        </div>
      ) : (
        <div className="price-tag">
          <span>Costs {money(q.price)}</span>
          <span>You pay {money(q.paid)}</span>
        </div>
      )}
      <div className="choices">
        {q.options.map((n) => (
          <button
            key={n}
            className={`choice ${solved && n === q.ans ? 'right' : ''} ${tried.includes(n) ? 'tried' : ''}`}
            disabled={tried.includes(n)}
            onClick={() => choose(n)}
          >
            {money(n)}
          </button>
        ))}
      </div>
    </GameFrame>
  );
}
