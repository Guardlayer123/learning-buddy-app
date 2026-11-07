import { useEffect } from 'react';
import { useChild } from './context';
import { Buddy } from '../components/Buddy';
import { Pic } from '../components/Bits';
import { speak } from '../lib/speech';

export function BreakScreen({ until, now, onHelp, onGrownUps }: { until: number; now: number; onHelp: () => void; onGrownUps: () => void }) {
  const { child } = useChild();
  const mins = Math.max(1, Math.ceil((until - now) / 60_000));

  useEffect(() => {
    speak(`Time for a break, ${child.nickname}. ${child.buddyName} is having a little rest too. Have a drink of water, stretch, or go and play. I'll be here when you get back!`);
  }, [child.nickname, child.buddyName]);

  return (
    <div className="break-screen" role="dialog" aria-label="Break time">
      <Buddy buddyId={child.buddyId} mood="sleep" size="large" />
      <h1>Break time</h1>
      <p style={{ maxWidth: 460 }}>
        {child.buddyName} is having a rest. You've done lots today! See you in {mins} {mins === 1 ? 'minute' : 'minutes'}.
      </p>
      <div className="break-ideas">
        <div>
          <Pic name="droplet" size={54} />
          Drink water
        </div>
        <div>
          <Pic name="leaf-fluttering-in-wind" size={54} />
          Stretch
        </div>
        <div>
          <Pic name="teddy-bear" size={54} />
          Play
        </div>
      </div>
      <button className="help-heart" onClick={onHelp}>
        <Pic name="red-heart" size={36} />
        Help
      </button>
      <button className="btn quiet" onClick={onGrownUps}>
        Grown-ups
      </button>
    </div>
  );
}
