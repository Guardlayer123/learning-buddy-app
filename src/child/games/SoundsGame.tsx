import { useEffect, useRef, useState } from 'react';
import { GameFrame, Finished, ROUNDS, useFeedback } from './GameKit';
import { Pic, shuffle } from '../../components/Bits';
import { speak } from '../../lib/speech';

// Each word split into its sounds, the way UK schools teach phonics
const WORDS = [
  { word: 'cat', sounds: ['c', 'a', 't'], art: 'cat-face' },
  { word: 'dog', sounds: ['d', 'o', 'g'], art: 'dog-face' },
  { word: 'sun', sounds: ['s', 'u', 'n'], art: 'sun' },
  { word: 'bus', sounds: ['b', 'u', 's'], art: 'bus' },
  { word: 'fox', sounds: ['f', 'o', 'x'], art: 'fox' },
  { word: 'bed', sounds: ['b', 'e', 'd'], art: 'bed' },
  { word: 'duck', sounds: ['d', 'u', 'ck'], art: 'duck' },
  { word: 'fish', sounds: ['f', 'i', 'sh'], art: 'fish' },
  { word: 'frog', sounds: ['f', 'r', 'o', 'g'], art: 'frog' },
  { word: 'tent', sounds: ['t', 'e', 'n', 't'], art: 'tent' },
];

// Stand-in pronunciations until real recordings of each pure sound are added to /sounds/<sound>.mp3
const SPOKEN: Record<string, string> = {
  a: 'a', b: 'buh', c: 'k', ck: 'k', d: 'duh', e: 'eh', f: 'fff', g: 'guh', i: 'ih', n: 'nnn', o: 'o', r: 'rrr', s: 'sss', sh: 'shh', t: 't', u: 'uh', x: 'ks',
};

function playSound(s: string) {
  const audio = new Audio(`${import.meta.env.BASE_URL}sounds/${s}.mp3`);
  audio.play().catch(() => speak(SPOKEN[s] ?? s, { rate: 0.8 }));
}

function makeRound(used: string[]) {
  const pool = WORDS.filter((w) => !used.includes(w.word));
  const answer = pool[Math.floor(Math.random() * pool.length)];
  const others = shuffle(WORDS.filter((w) => w.word !== answer.word)).slice(0, 2);
  return { answer, options: shuffle([answer, ...others]) };
}

export function SoundsGame() {
  const [round, setRound] = useState(0);
  const used = useRef<string[]>([]);
  const [q, setQ] = useState(() => makeRound([]));
  const [heard, setHeard] = useState(0);
  const [blended, setBlended] = useState(false);
  const [blendSpoken, setBlendSpoken] = useState<string | undefined>();
  const [tried, setTried] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  const fb = useFeedback();

  useEffect(() => {
    if (round < ROUNDS) fb.say('Tap each sound in order, then blend them together.');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const reset = (r: number) => {
    used.current = r === 0 ? [] : [...used.current, q.answer.word];
    setRound(r);
    setQ(makeRound(used.current));
    setHeard(0);
    setBlended(false);
    setBlendSpoken(undefined);
    setTried([]);
    setSolved(false);
  };

  if (round >= ROUNDS) return <Finished activityId="sounds" onAgain={() => reset(0)} />;

  const tapSound = (i: number) => {
    playSound(q.answer.sounds[i]);
    if (i === heard) setHeard(heard + 1);
  };

  const blend = () => {
    setBlended(true);
    setBlendSpoken(`${q.answer.sounds.map((x) => SPOKEN[x] ?? x).join(', ')}... ${q.answer.word}! Which picture is ${q.answer.word}?`);
    fb.say(`${q.answer.sounds.join(' - ')}... ${q.answer.word}! Which picture is ${q.answer.word}?`);
  };

  const choose = (w: string) => {
    if (solved) return;
    setBlendSpoken(undefined);
    if (w === q.answer.word) {
      setSolved(true);
      fb.yes(`That's ${q.answer.word}.`);
      setTimeout(() => reset(round + 1), 2400);
    } else {
      setTried((t) => [...t, w]);
      fb.no();
    }
  };

  return (
    <GameFrame title="Letter sounds" round={round} mood={fb.mood} line={fb.line} pulse={fb.pulse} spoken={blendSpoken}>
      <div className="row" style={{ justifyContent: 'center', gap: 8, flexWrap: 'nowrap' }}>
        {q.answer.sounds.map((s, i) => (
          <button
            key={i}
            onClick={() => tapSound(i)}
            className="choice"
            aria-label={`Sound ${s}`}
            style={{
              minWidth: q.answer.sounds.length > 3 ? 62 : 76,
              padding: '12px 8px',
              fontSize: '2.2rem',
              background: i < heard ? 'var(--meadow-pale)' : i === heard ? 'var(--honey-pale)' : 'var(--sky)',
              boxShadow: i === heard ? 'inset 0 0 0 3px var(--honey)' : undefined,
            }}
          >
            {s}
          </button>
        ))}
      </div>
      {!blended ? (
        <button className="btn go big" disabled={heard < q.answer.sounds.length} onClick={blend}>
          Blend it!
        </button>
      ) : (
        <>
          <p style={{ fontFamily: 'var(--font-play)', fontSize: '2.4rem', fontWeight: 600, letterSpacing: '0.04em' }}>{q.answer.word}</p>
          <div className="choices pics">
            {q.options.map((w) => (
              <button
                key={w.word}
                className={`choice ${solved && w.word === q.answer.word ? 'right' : ''} ${tried.includes(w.word) ? 'tried' : ''}`}
                onClick={() => choose(w.word)}
                disabled={tried.includes(w.word)}
                aria-label={w.word}
              >
                <Pic name={w.art} size={72} />
              </button>
            ))}
          </div>
        </>
      )}
    </GameFrame>
  );
}
