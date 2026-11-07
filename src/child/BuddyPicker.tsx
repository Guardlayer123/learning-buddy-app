import { useState } from 'react';
import { BUDDIES, buddyById } from '../data/buddies';
import { useStore } from '../lib/store';
import { useChild } from './context';
import { BuddySays } from '../components/Buddy';
import { Confetti, Pic } from '../components/Bits';
import { speak } from '../lib/speech';

export function BuddyPicker() {
  const { child } = useChild();
  const { updateChild } = useStore();
  const [chosen, setChosen] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState<'pick' | 'name' | 'hello'>('pick');
  const b = chosen ? buddyById(chosen) : null;

  if (step === 'hello' && b) {
    return (
      <div className="shell">
        <Confetti show />
        <div className="screen" style={{ justifyContent: 'center' }}>
          <BuddySays
            buddyId={b.id}
            size="large"
            mood="cheer"
            text={`Hello ${child.nickname}! I'm ${name}. I'm so happy to be your buddy. Let's learn together, one small step at a time.`}
          />
          <button className="btn go big wide" onClick={() => updateChild(child.id, { buddyId: b.id, buddyName: name })}>
            Let's go!
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="shell">
      <div className="screen">
        {step === 'pick' && (
          <>
            <h1>Hi {child.nickname}! Pick your buddy.</h1>
            <div className="buddy-grid">
              {BUDDIES.map((x) => (
                <button
                  key={x.id}
                  className="buddy-pick"
                  aria-pressed={chosen === x.id}
                  onClick={() => {
                    setChosen(x.id);
                    speak(`The ${x.kind.toLowerCase()}!`);
                  }}
                >
                  <Pic name={x.art} size={76} />
                  {x.kind}
                </button>
              ))}
            </div>
            <button
              className="btn go big wide"
              disabled={!chosen}
              onClick={() => {
                setName(buddyById(chosen).suggested);
                setStep('name');
              }}
            >
              This one!
            </button>
          </>
        )}
        {step === 'name' && b && (
          <>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Pic name={b.art} size={160} />
            </div>
            <h1 style={{ textAlign: 'center' }}>What's your {b.kind.toLowerCase()} called?</h1>
            <input
              className="input"
              style={{ fontSize: '1.6rem', textAlign: 'center', fontFamily: 'var(--font-play)' }}
              value={name}
              maxLength={14}
              onChange={(e) => setName(e.target.value.replace(/[^\p{L}\p{N} '-]/gu, ''))}
              aria-label="Buddy's name"
            />
            <p className="muted" style={{ textAlign: 'center' }}>
              Keep this name or type a new one.
            </p>
            <button className="btn go big wide" disabled={!name.trim()} onClick={() => setStep('hello')}>
              That's the name!
            </button>
            <button className="btn quiet" onClick={() => setStep('pick')}>
              Pick a different buddy
            </button>
          </>
        )}
      </div>
    </div>
  );
}
