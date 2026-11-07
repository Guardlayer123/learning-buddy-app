import { useState } from 'react';
import { hashPin, useStore } from '../lib/store';
import { PinPad } from './Pin';
import { Pic } from '../components/Bits';

export function Welcome({ onDone }: { onDone: () => void }) {
  const { setPinHash } = useStore();
  const [step, setStep] = useState<'hello' | 'pin1' | 'pin2'>('hello');
  const [first, setFirst] = useState('');
  const [error, setError] = useState('');

  return (
    <div className="shell grown">
      <div className="screen" style={{ justifyContent: 'center' }}>
        {step === 'hello' && (
          <div className="panel">
            <div className="row" style={{ gap: 6 }}>
              <Pic name="dog-face" size={64} />
              <Pic name="owl" size={64} />
              <Pic name="panda" size={64} />
            </div>
            <h1>Welcome, grown-ups</h1>
            <p>
              A calm learning buddy for your child. It helps with maths, reading, telling the time and everyday skills, one small step at a time.
            </p>
            <ul style={{ margin: 0, paddingLeft: 22 }}>
              <li>No adverts and nothing to buy inside the app.</li>
              <li>No chatting with other people, and no photos or videos.</li>
              <li>Built-in breaks so screen time stays healthy.</li>
              <li>Everything you enter stays on this device.</li>
            </ul>
            <p className="muted">First, set a 4-digit PIN. It keeps the grown-ups area for you only.</p>
            <button className="btn go big wide" onClick={() => setStep('pin1')}>
              Set my PIN
            </button>
          </div>
        )}
        {step === 'pin1' && (
          <PinPad
            title="Choose a PIN"
            sub="Pick 4 numbers your child won't guess."
            error={error}
            onComplete={(p) => {
              setFirst(p);
              setError('');
              setStep('pin2');
            }}
          />
        )}
        {step === 'pin2' && (
          <PinPad
            title="Type it again"
            sub="Just to check."
            error={error}
            onComplete={async (p) => {
              if (p !== first) {
                setError("Those didn't match. Choose your PIN again.");
                setStep('pin1');
                return;
              }
              setPinHash(await hashPin(p));
              onDone();
            }}
          />
        )}
      </div>
    </div>
  );
}
