import { useEffect } from 'react';
import { speak } from '../lib/speech';
import { Pic } from '../components/Bits';

const LINE =
  "If you feel upset, scared, or someone is hurting you, tell a grown-up you trust, like a parent, a teacher or a family friend. It's never too small to tell. You can also call Childline, free, any time.";

export function HelpSheet({ onClose, onCalm }: { onClose: () => void; onCalm: () => void }) {
  useEffect(() => {
    speak(LINE);
  }, []);
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="help-title" onClick={(e) => e.stopPropagation()}>
        <div className="row" style={{ flexWrap: 'nowrap' }}>
          <Pic name="hugging-face" size={64} />
          <h2 id="help-title">You're not on your own</h2>
        </div>
        <p>{LINE}</p>
        <div className="call-card">
          <span>Childline, free and private</span>
          <strong style={{ fontFamily: 'var(--font-play)', fontSize: '1.7rem' }}>0800 1111</strong>
          <span className="muted">You can talk about anything. It won't show on a phone bill.</span>
        </div>
        <div className="call-card" style={{ background: 'var(--honey-pale)' }}>
          <span>If you are in danger right now</span>
          <strong style={{ fontFamily: 'var(--font-play)', fontSize: '1.7rem' }}>Call 999</strong>
        </div>
        <button className="btn big wide" onClick={onCalm}>
          <Pic name="tulip" size={36} />
          Breathe with my buddy
        </button>
        <button className="btn go big wide" onClick={onClose}>
          I'm okay now
        </button>
      </div>
    </div>
  );
}
