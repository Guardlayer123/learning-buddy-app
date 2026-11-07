import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useChild } from '../context';
import { BuddySays, type Mood } from '../../components/Buddy';
import { Confetti, Dots, Pic, PRAISE, OOPS, pick } from '../../components/Bits';
import { chimeTry, chimeYes } from '../../lib/sound';

export const ROUNDS = 5;

/** Shared feedback for every game: endless retries, praise, a little wobble for "oops", never lost lives. */
export function useFeedback() {
  const [mood, setMood] = useState<Mood>('idle');
  const [line, setLine] = useState('');
  const [pulse, setPulse] = useState(0);
  const yes = (extra = '') => {
    chimeYes();
    setMood('cheer');
    setPulse((p) => p + 1);
    setLine(`${pick(PRAISE)}${extra ? ' ' + extra : ''}`);
  };
  const no = (hint = '') => {
    chimeTry();
    setMood('oops');
    setPulse((p) => p + 1);
    setLine(hint || pick(OOPS));
  };
  const say = (t: string) => {
    setMood('idle');
    setLine(t);
  };
  return { mood, line, pulse, yes, no, say };
}

export function Finished({ activityId, onAgain, stars = 3 }: { activityId: string; onAgain: () => void; stars?: number }) {
  const { child, award, home } = useChild();
  const given = useRef(false);
  const [party, setParty] = useState(false);
  useEffect(() => {
    if (given.current) return;
    given.current = true;
    award(stars, activityId);
    setParty(true);
  }, [award, stars, activityId]);
  return (
    <div className="screen">
      <Confetti show={party} />
      <BuddySays buddyId={child.buddyId} mood="cheer" text={`You did it, ${child.nickname}! Here are ${stars} stars for your jar.`} />
      <div className="stage">
        <div className="row" style={{ justifyContent: 'center' }}>
          {Array.from({ length: stars }, (_, i) => (
            <Pic key={i} name="glowing-star" size={72} />
          ))}
        </div>
        <button className="btn go big wide" onClick={onAgain}>
          Play again
        </button>
        <button className="btn big wide" onClick={home}>
          Back home
        </button>
      </div>
    </div>
  );
}

export function GameFrame({ title, round, mood, line, pulse = 0, spoken, children }: { title: string; round: number; mood: Mood; line: string; pulse?: number; spoken?: string; children: ReactNode }) {
  const { child } = useChild();
  return (
    <div className="screen">
      <BuddySays buddyId={child.buddyId} mood={mood} text={line} size="small" pulse={pulse} spoken={spoken} />
      <div className="stage">
        <h2>{title}</h2>
        {children}
        <Dots total={ROUNDS} done={round} />
      </div>
    </div>
  );
}
