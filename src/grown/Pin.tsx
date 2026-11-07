import { useState } from 'react';
import { hashPin, useStore } from '../lib/store';

export function PinPad({ title, sub, onComplete, error }: { title: string; sub?: string; onComplete: (pin: string) => void; error?: string }) {
  const [pin, setPin] = useState('');
  const press = (d: string) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    if (next.length === 4) {
      setTimeout(() => {
        onComplete(next);
        setPin('');
      }, 120);
    }
  };
  return (
    <div className="panel" style={{ alignItems: 'center', textAlign: 'center' }}>
      <h2>{title}</h2>
      {sub && <p className="muted">{sub}</p>}
      <div className="pin-dots" aria-label={`${pin.length} of 4 digits entered`}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={i < pin.length ? 'on' : ''} />
        ))}
      </div>
      {error && <p className="msg">{error}</p>}
      <div className="pin-pad">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button key={d} onClick={() => press(d)}>
            {d}
          </button>
        ))}
        <span />
        <button onClick={() => press('0')}>0</button>
        <button onClick={() => setPin((p) => p.slice(0, -1))} aria-label="Delete">
          ⌫
        </button>
      </div>
    </div>
  );
}

/** Grown-up gate: the parent's PIN, stored only as a hash on this device. */
export function PinCheck({ onOk, onCancel }: { onOk: () => void; onCancel: () => void }) {
  const { data, resetAll } = useStore();
  const [error, setError] = useState('');
  const [forgot, setForgot] = useState(false);
  const [sure, setSure] = useState(false);

  return (
    <div className="shell grown">
      <div className="topbar">
        <button className="btn quiet" onClick={onCancel}>
          Back
        </button>
      </div>
      <div className="screen">
        <PinPad
          title="Grown-ups only"
          sub="Enter your 4-digit PIN."
          error={error}
          onComplete={async (pin) => {
            if ((await hashPin(pin)) === data.pinHash) onOk();
            else setError('That PIN is not right. Try again.');
          }}
        />
        {!forgot ? (
          <button className="btn quiet" onClick={() => setForgot(true)}>
            Forgotten your PIN?
          </button>
        ) : (
          <div className="panel">
            <p>
              The PIN can't be recovered, because nothing leaves this device. You can start again, which removes every child's profile and stars from
              this device.
            </p>
            {!sure ? (
              <button className="btn" onClick={() => setSure(true)}>
                Start again
              </button>
            ) : (
              <div className="row">
                <button className="btn" onClick={resetAll}>
                  Yes, remove everything
                </button>
                <button className="btn quiet" onClick={() => setSure(false)}>
                  Keep everything
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
