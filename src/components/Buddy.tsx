import { useEffect, useState } from 'react';
import { art, buddyById } from '../data/buddies';
import { speak } from '../lib/speech';

export type Mood = 'idle' | 'cheer' | 'oops' | 'sleep';

export function Buddy({ buddyId, mood = 'idle', size = '', pulse = 0 }: { buddyId: string; mood?: Mood; size?: '' | 'small' | 'large'; pulse?: number }) {
  const b = buddyById(buddyId);
  // Re-key on mood change so the jump or wobble plays each time
  const [tick, setTick] = useState(0);
  useEffect(() => {
    setTick((t) => t + 1);
  }, [mood, pulse]);
  return (
    <div className={`buddy ${size} ${mood === 'idle' ? '' : mood}`} aria-hidden="true">
      <img key={tick} src={art(b.art)} alt="" draggable={false} />
      {mood === 'sleep' && <span className="zzz">z z</span>}
    </div>
  );
}

/** The buddy with a speech bubble. Speaks the line aloud whenever it changes. */
export function BuddySays({
  buddyId,
  text,
  mood = 'idle',
  size = '',
  speakIt = true,
  pulse = 0,
  spoken,
}: {
  buddyId: string;
  text: string;
  mood?: Mood;
  size?: '' | 'small' | 'large';
  speakIt?: boolean;
  pulse?: number;
  /** What to say aloud, when it differs from what's shown */
  spoken?: string;
}) {
  useEffect(() => {
    if (speakIt && text) speak(spoken ?? text);
  }, [text, speakIt, pulse, spoken]);
  return (
    <div className={`buddy-row ${size === 'large' ? 'stacked' : ''}`}>
      <Buddy buddyId={buddyId} mood={mood} size={size} pulse={pulse} />
      <div className="bubble" role="status" aria-live="polite">
        {text}
        <button className="say-again" onClick={() => speak(spoken ?? text)} aria-label="Say it again">
          🔈
        </button>
      </div>
    </div>
  );
}
