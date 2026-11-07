import { useEffect, useState } from 'react';
import { useChild } from '../context';
import { BuddySays } from '../../components/Buddy';
import { Dots, Pic } from '../../components/Bits';
import { Finished } from '../games/GameKit';
import { art, buddyById } from '../../data/buddies';
import { speak } from '../../lib/speech';

const BREATHS = 5;
const IN = 4;
const OUT = 4;

export function Calm() {
  const { child } = useChild();
  const [running, setRunning] = useState(false);
  const [t, setT] = useState(0); // seconds since starting
  const cycle = IN + OUT;
  const breath = Math.min(BREATHS, Math.floor(t / cycle));
  const within = t % cycle;
  const phase: 'in' | 'out' = within < IN ? 'in' : 'out';
  const count = phase === 'in' ? within : within - IN;
  const done = t >= BREATHS * cycle;

  useEffect(() => {
    if (!running || done) return;
    const id = setInterval(() => setT((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [running, done]);

  useEffect(() => {
    if (running && !done) speak(phase === 'in' ? 'Smell the flower.' : 'Blow out the candle, slowly.', { rate: 0.8 });
  }, [running, done, phase, breath]);

  if (done)
    return (
      <Finished
        activityId="calm"
        stars={1}
        onAgain={() => {
          setRunning(false);
          setT(0);
        }}
      />
    );

  const b = buddyById(child.buddyId);
  const scale = running ? (phase === 'in' ? 1 + ((count + 1) / IN) * 0.25 : 1.25 - ((count + 1) / OUT) * 0.25) : 1;

  return (
    <div className="screen">
      <BuddySays
        buddyId={child.buddyId}
        size="small"
        speakIt={!running}
        text={running ? `Breathe with me. ${phase === 'in' ? 'Smell the flower.' : 'Blow out the candle.'}` : "Let's take five slow breaths together. Breathe in like you're smelling a flower, and out like you're blowing out a candle."}
      />
      <div className="stage" style={{ background: 'var(--lilac-pale)', boxShadow: 'none', minHeight: 420, justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ opacity: phase === 'in' || !running ? 1 : 0.35, transition: 'opacity 0.6s' }}>
            <Pic name="tulip" size={70} />
          </div>
          <img
            src={art(b.art)}
            alt=""
            style={{ width: 170, height: 170, transform: `scale(${scale})`, transition: 'transform 1s ease-in-out' }}
          />
          <div style={{ opacity: phase === 'out' && running ? 1 : 0.35, transition: 'opacity 0.6s' }}>
            <Pic name="candle" size={70} />
          </div>
        </div>
        <p style={{ fontFamily: 'var(--font-play)', fontSize: '2rem', fontWeight: 600, minHeight: 50 }}>
          {running ? (phase === 'in' ? 'Breathe in…' : 'Breathe out…') : ''}
        </p>
        {running ? (
          <div className="progress-dots" aria-label={`Count ${count + 1}`}>
            {Array.from({ length: phase === 'in' ? IN : OUT }, (_, i) => (
              <span key={i} className={i <= count ? 'on' : ''} />
            ))}
          </div>
        ) : (
          <button
            className="btn go big"
            onClick={() => setRunning(true)}
          >
            Start breathing
          </button>
        )}
        <Dots total={BREATHS} done={breath} />
      </div>
    </div>
  );
}
