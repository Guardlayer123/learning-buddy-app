import { useState, type ReactNode } from 'react';
import { getToken, login } from '../lib/api';
import { Pic } from '../components/Bits';

/** Private test version: one shared password, no sign-up, no way to change it in the app. */
export function TestGate({ children }: { children: ReactNode }) {
  const [ok, setOk] = useState(() => !!getToken());
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  if (ok) return <>{children}</>;

  const go = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return setMsg('Enter the test password.');
    setBusy(true);
    setMsg('');
    const r = await login(password);
    setBusy(false);
    if (r.ok) setOk(true);
    else setMsg(r.error);
  };

  return (
    <div className="shell grown">
      <form className="screen" style={{ justifyContent: 'center' }} onSubmit={go}>
        <div className="panel">
          <div className="row" style={{ gap: 6 }}>
            <Pic name="fox" size={56} />
            <Pic name="owl" size={56} />
          </div>
          <h1>Private test version</h1>
          <p className="muted">This app is still being built. Enter the password you were given.</p>
          <div className="field">
            <label htmlFor="tp">Password</label>
            <input id="tp" className="input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {msg && <p className="msg">{msg}</p>}
          <button className="btn go big wide" type="submit" disabled={busy}>
            {busy ? 'Checking…' : 'Open the app'}
          </button>
        </div>
      </form>
    </div>
  );
}
