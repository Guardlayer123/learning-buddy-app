import { useEffect, useState } from 'react';
import { GameFrame, Finished, ROUNDS, useFeedback } from './GameKit';
import { shuffle } from '../../components/Bits';
import { useChild } from '../context';

type T = { h: number; m: number };

const WORDS = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const nextHour = (h: number) => (h % 12) + 1;

const PAST: Record<number, string> = { 5: 'five', 10: 'ten', 15: 'quarter', 20: 'twenty', 25: 'twenty-five', 30: 'half' };

export function say(t: T): string {
  if (t.m === 0) return `${t.h} o'clock`;
  if (t.m <= 30) return `${PAST[t.m]} past ${t.h}`;
  return `${PAST[60 - t.m]} to ${nextHour(t.h)}`;
}
const sayAloud = (t: T) => say(t).replace(/\d+/, (n) => WORDS[Number(n)]);

function levelFor(round: number, older: boolean): number[] {
  if (older) return round < 2 ? [0, 15, 30, 45] : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  if (round < 2) return [0];
  if (round < 4) return [0, 30];
  return [0, 15, 30, 45];
}

function makeRound(round: number, older = false) {
  const mins = levelFor(round, older);
  const rand = (): T => ({ h: 1 + Math.floor(Math.random() * 12), m: mins[Math.floor(Math.random() * mins.length)] });
  const answer = rand();
  const seen = new Set([say(answer)]);
  const options: T[] = [answer];
  // Mix in near-misses that teach: same hour but other minutes, or the hour either side
  const near: T[] = shuffle([
    { h: answer.h, m: shuffle(mins).find((m) => m !== answer.m) ?? 0 },
    { h: nextHour(answer.h), m: answer.m },
    { h: answer.h === 1 ? 12 : answer.h - 1, m: answer.m },
  ] as T[]);
  for (const t of [...near, rand(), rand(), rand()]) {
    if (options.length === 3) break;
    if (!seen.has(say(t))) {
      seen.add(say(t));
      options.push(t);
    }
  }
  return { answer, options: shuffle(options) };
}

export function Clock({ t, size = 240 }: { t: T; size?: number }) {
  const minuteAngle = t.m * 6;
  const hourAngle = (t.h % 12) * 30 + t.m * 0.5;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" role="img" aria-label={`A clock showing ${say(t)}`}>
      <circle cx="100" cy="100" r="94" fill="#fff" stroke="var(--ink)" strokeWidth="6" />
      {Array.from({ length: 60 }, (_, i) => {
        const big = i % 5 === 0;
        const a = (i * 6 * Math.PI) / 180;
        const r1 = big ? 78 : 84;
        return (
          <line
            key={i}
            x1={100 + r1 * Math.sin(a)}
            y1={100 - r1 * Math.cos(a)}
            x2={100 + 88 * Math.sin(a)}
            y2={100 - 88 * Math.cos(a)}
            stroke="var(--ink-soft)"
            strokeWidth={big ? 3 : 1}
          />
        );
      })}
      {/* Hour hand: short and thick. Minute hand: long and thin. */}
      <line x1="100" y1="100" x2="100" y2="54" stroke="var(--pond)" strokeWidth="10" strokeLinecap="round" transform={`rotate(${hourAngle} 100 100)`} />
      <line x1="100" y1="100" x2="100" y2="24" stroke="var(--blush)" strokeWidth="6" strokeLinecap="round" transform={`rotate(${minuteAngle} 100 100)`} />
      <circle cx="100" cy="100" r="7" fill="var(--ink)" />
      {Array.from({ length: 12 }, (_, i) => {
        const n = i + 1;
        const a = (n * 30 * Math.PI) / 180;
        return (
          <text key={n} x={100 + 64 * Math.sin(a)} y={100 - 64 * Math.cos(a) + 7} textAnchor="middle" fontSize="20" fontFamily="var(--font-play)" fontWeight="600" fill="var(--ink)" stroke="#fff" strokeWidth="5" paintOrder="stroke">
            {n}
          </text>
        );
      })}
    </svg>
  );
}

export function TimeGame() {
  const older = useChild().band === 'builders';
  const [round, setRound] = useState(0);
  const [q, setQ] = useState(() => makeRound(0, older));
  const [tried, setTried] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  const fb = useFeedback();

  useEffect(() => {
    if (round < ROUNDS) {
      fb.say(
        round === 0
          ? older
            ? 'Each number on the clock is 5 minutes for the long hand. Count round in fives. What time is it?'
            : 'The short blue hand shows the hour. The long pink hand shows the minutes. What time does the clock say?'
          : 'What time does the clock say?',
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  if (round >= ROUNDS)
    return (
      <Finished
        activityId="time"
        onAgain={() => {
          setRound(0);
          setQ(makeRound(0, older));
          setTried([]);
          setSolved(false);
        }}
      />
    );

  const choose = (t: T) => {
    if (solved) return;
    if (say(t) === say(q.answer)) {
      setSolved(true);
      fb.yes(`It's ${sayAloud(t)}.`);
      setTimeout(() => {
        const r = round + 1;
        setRound(r);
        setQ(makeRound(r, older));
        setTried([]);
        setSolved(false);
      }, 2400);
    } else {
      setTried((x) => [...x, say(t)]);
      fb.no(q.answer.m === 0 ? 'Not quite. Look where the short hand points.' : older ? 'Not quite. Count the long hand round in fives.' : 'Not quite. Look at the long hand first.');
    }
  };

  return (
    <GameFrame title="Telling the time" round={round} mood={fb.mood} line={fb.line} pulse={fb.pulse}>
      <Clock t={q.answer} />
      <div className="choices">
        {q.options.map((t) => (
          <button
            key={say(t)}
            className={`choice ${solved && say(t) === say(q.answer) ? 'right' : ''} ${tried.includes(say(t)) ? 'tried' : ''}`}
            onClick={() => choose(t)}
            disabled={tried.includes(say(t))}
          >
            {say(t)}
          </button>
        ))}
      </div>
    </GameFrame>
  );
}
