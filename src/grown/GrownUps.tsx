import { useState } from 'react';
import { newChild, newId, useStore, type Child } from '../lib/store';
import { ageFrom, bandFor, BANDS } from '../lib/age';
import { buddyById } from '../data/buddies';
import { CARDS, cardById } from '../data/cards';
import { Pic, ToggleRow } from '../components/Bits';
import { ACTIVITY_NAMES } from '../child/activities';

export function GrownUps({ onExit }: { onExit: () => void }) {
  const { data } = useStore();
  const [editing, setEditing] = useState<string | 'new' | null>(data.children.length ? null : 'new');

  if (editing === 'new') return <AddChild onDone={() => setEditing(null)} canCancel={data.children.length > 0} />;
  const child = data.children.find((c) => c.id === editing);
  if (child) return <ChildSettings child={child} onBack={() => setEditing(null)} />;

  return (
    <div className="shell grown">
      <div className="topbar">
        <h1>Grown-ups</h1>
        <span className="spacer" />
        <button className="btn go" onClick={onExit}>
          Done
        </button>
      </div>
      <div className="screen">
        {data.children
          .filter((c) => (c.notices ?? []).length > 0)
          .map((c) => (
            <div key={`n-${c.id}`} className="notice" role="alert">
              <strong>Please check in with {c.nickname}</strong>
              <span>
                Something came up on {new Date(c.notices![c.notices!.length - 1]).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })} that{' '}
                {c.nickname} may need a grown-up's help with. Find a calm moment and ask how things are going.
              </span>
              <button className="btn" onClick={() => setEditing(c.id)}>
                Open {c.nickname}'s settings
              </button>
            </div>
          ))}
        {data.children.map((c) => (
          <button key={c.id} className="kid-card" onClick={() => setEditing(c.id)} style={{ fontSize: '1.2rem' }}>
            <Pic name={c.buddyId ? buddyById(c.buddyId).art : 'hatching-chick'} size={56} />
            <span style={{ flex: 1 }}>
              {c.nickname}
              <small className="muted" style={{ display: 'block', fontFamily: 'var(--font-read)', fontSize: '0.95rem' }}>
                {BANDS[bandFor(ageFrom(c.dob))].name}, age {ageFrom(c.dob)} · {c.stars} stars
              </small>
            </span>
            <span className="muted" style={{ fontSize: '1rem' }}>
              Settings
            </span>
          </button>
        ))}
        <button className="btn wide" onClick={() => setEditing('new')}>
          Add a child
        </button>
        <div className="panel">
          <h2>How safety works</h2>
          <p>
            Your child talks only to their buddy. There are no other users, no web browsing, and no way to share photos or videos. The Help heart is
            on every screen, even during breaks. It tells your child to speak to a grown-up they trust and shows Childline's free number, 0800 1111.
          </p>
        </div>
      </div>
    </div>
  );
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function AddChild({ onDone, canCancel }: { onDone: () => void; canCancel: boolean }) {
  const { addChild } = useStore();
  const [nickname, setNickname] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [msg, setMsg] = useState('');
  const thisYear = new Date().getFullYear();

  const save = () => {
    const name = nickname.trim();
    if (!name) return setMsg('Add a first name or nickname.');
    if (!day || !month || !year) return setMsg('Add their full date of birth.');
    const d = new Date(Number(year), Number(month) - 1, Number(day));
    if (d.getMonth() !== Number(month) - 1) return setMsg("That date doesn't exist. Check the day and month.");
    const dob = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    const age = ageFrom(dob);
    if (age < 3 || age > 16) return setMsg('This app is for children aged 3 to 16.');
    addChild(newChild({ nickname: name.slice(0, 20), dob, buddyId: '', buddyName: '' }));
    onDone();
  };

  return (
    <div className="shell grown">
      <div className="topbar">
        {canCancel && (
          <button className="btn quiet" onClick={onDone}>
            Back
          </button>
        )}
      </div>
      <div className="screen">
        <div className="panel">
          <h1>Add a child</h1>
          <div className="field">
            <label htmlFor="nick">First name or nickname</label>
            <input id="nick" className="input" value={nickname} maxLength={20} onChange={(e) => setNickname(e.target.value)} autoComplete="off" />
            <span className="hint">Their buddy will use this name. No surname needed.</span>
          </div>
          <fieldset className="field" style={{ border: 'none', padding: 0, margin: 0 }}>
            <legend style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 6 }}>Date of birth</legend>
            <div className="date-row">
              <select className="input" aria-label="Day" value={day} onChange={(e) => setDay(e.target.value)}>
                <option value="">Day</option>
                {Array.from({ length: 31 }, (_, i) => (
                  <option key={i} value={String(i + 1)}>
                    {i + 1}
                  </option>
                ))}
              </select>
              <select className="input" aria-label="Month" value={month} onChange={(e) => setMonth(e.target.value)}>
                <option value="">Month</option>
                {MONTHS.map((m, i) => (
                  <option key={m} value={String(i + 1)}>
                    {m}
                  </option>
                ))}
              </select>
              <select className="input" aria-label="Year" value={year} onChange={(e) => setYear(e.target.value)}>
                <option value="">Year</option>
                {Array.from({ length: 15 }, (_, i) => thisYear - 2 - i).map((y) => (
                  <option key={y} value={String(y)}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <span className="hint">Used to pick the right lessons for their age, and so their buddy can wish them a happy birthday.</span>
          </fieldset>
          {msg && <p className="msg">{msg}</p>}
          <button className="btn go big wide" onClick={save}>
            Add child
          </button>
          <p className="muted">Your child picks and names their own buddy the first time they open the app.</p>
        </div>
      </div>
    </div>
  );
}

function ChildSettings({ child, onBack }: { child: Child; onBack: () => void }) {
  const { updateChild, removeChild } = useStore();
  const [sure, setSure] = useState(false);
  const set = (patch: Partial<Child>) => updateChild(child.id, patch);
  const age = ageFrom(child.dob);
  const done = Object.entries(child.skills).filter(([, n]) => n > 0);

  return (
    <div className="shell grown">
      <div className="topbar">
        <button className="btn quiet" onClick={onBack}>
          Back
        </button>
      </div>
      <div className="screen">
        <h1>{child.nickname}</h1>
        <p className="muted" style={{ marginTop: -10 }}>
          Age {age} · {BANDS[bandFor(age)].name} ({BANDS[bandFor(age)].ages})
          {child.buddyName ? ` · buddy ${child.buddyName} the ${buddyById(child.buddyId).kind.toLowerCase()}` : ''}
        </p>

        {(child.notices ?? []).length > 0 && (
          <div className="notice" role="alert">
            <strong>Please check in with {child.nickname}</strong>
            <span>
              While using the app, {child.nickname} said something that suggests they may be worried, hurt or unsafe. They were shown Childline (0800 1111) and
              told to talk to a grown-up they trust. For their privacy, the conversation isn't saved. Find a calm moment, ask how things are going, and
              listen. If you think a child is in danger, call 999. For advice, call the NSPCC helpline on 0808 800 5000.
            </span>
            <button className="btn" onClick={() => set({ notices: [] })}>
              I've checked in
            </button>
          </div>
        )}

        <div className="panel">
          <h2>What they've practised</h2>
          {done.length === 0 ? (
            <p className="muted">Nothing yet. Activities your child finishes will show here.</p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 22 }}>
              {done.map(([id, n]) => (
                <li key={id}>
                  {ACTIVITY_NAMES[id] ?? id}: {n} {n === 1 ? 'time' : 'times'}
                </li>
              ))}
            </ul>
          )}
          <p className="muted">
            {child.stars} stars earned. Chats are never shown here: this is a learning summary, not monitoring.
          </p>
        </div>

        <div className="panel">
          <h2>Comfort</h2>
          <ToggleRow title="Low Sensory Mode" hint="Softer colours, no movement, no chimes." on={child.lowSensory} onChange={(v) => set({ lowSensory: v })} />
          <ToggleRow title="Easy-read letters" hint="A clearer, wider typeface for every word." on={child.easyRead} onChange={(v) => set({ easyRead: v })} />
          <ToggleRow title="Buddy's voice" hint="The buddy reads everything aloud." on={child.voiceOn} onChange={(v) => set({ voiceOn: v })} />
        </div>

        <div className="panel">
          <h2>Breaks</h2>
          <div className="field">
            <label htmlFor="play">Play time before a break</label>
            <select id="play" className="input" value={child.playMinutes} onChange={(e) => set({ playMinutes: Number(e.target.value) })}>
              {[20, 30, 45].map((m) => (
                <option key={m} value={m}>
                  {m} minutes
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="brk">Break length</label>
            <select id="brk" className="input" value={child.breakMinutes} onChange={(e) => set({ breakMinutes: Number(e.target.value) })}>
              {[10, 15, 20, 30].map((m) => (
                <option key={m} value={m}>
                  {m} minutes
                </option>
              ))}
            </select>
            <span className="hint">A sand timer appears 5 minutes before each break, so it never comes as a surprise.</span>
          </div>
          {child.breakUntil > Date.now() && (
            <button className="btn" onClick={() => set({ breakUntil: 0, usedMs: 0 })}>
              End this break now
            </button>
          )}
        </div>

        <RoutineBuilder child={child} />

        <div className="panel">
          <h2>Remove {child.nickname}</h2>
          <p className="muted">This deletes their profile, buddy and stars from this device.</p>
          {!sure ? (
            <button className="btn" onClick={() => setSure(true)}>
              Remove profile
            </button>
          ) : (
            <div className="row">
              <button
                className="btn"
                onClick={() => {
                  removeChild(child.id);
                  onBack();
                }}
              >
                Yes, remove {child.nickname}
              </button>
              <button className="btn quiet" onClick={() => setSure(false)}>
                Keep
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RoutineBuilder({ child }: { child: Child }) {
  const { updateChild } = useStore();
  const [adding, setAdding] = useState(false);
  const r = child.routine;
  const setR = (routine: Child['routine']) => updateChild(child.id, { routine });
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= r.length) return;
    const n = [...r];
    [n[i], n[j]] = [n[j], n[i]];
    setR(n);
  };

  return (
    <div className="panel">
      <h2>Now & Next board</h2>
      <p className="muted">Set today's routine. Your child sees what's happening now and what comes next, one card at a time.</p>
      {r.length === 0 && <p className="muted">No cards yet.</p>}
      {r.map((item, i) => {
        const c = cardById(item.card);
        return (
          <div key={item.id} className="row" style={{ flexWrap: 'nowrap' }}>
            <Pic name={c.art} size={40} />
            <span style={{ flex: 1, textDecoration: item.done ? 'line-through' : 'none' }}>{c.label}</span>
            <button className="btn quiet" aria-label="Move up" onClick={() => move(i, -1)}>
              ▲
            </button>
            <button className="btn quiet" aria-label="Move down" onClick={() => move(i, 1)}>
              ▼
            </button>
            <button className="btn quiet" aria-label={`Remove ${c.label}`} onClick={() => setR(r.filter((x) => x.id !== item.id))}>
              ✕
            </button>
          </div>
        );
      })}
      {adding ? (
        <div className="buddy-grid">
          {CARDS.map((c) => (
            <button
              key={c.id}
              className="buddy-pick"
              style={{ fontSize: '0.95rem' }}
              onClick={() => {
                setR([...r, { id: newId(), card: c.id, done: false }]);
                setAdding(false);
              }}
            >
              <Pic name={c.art} size={48} />
              {c.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="row">
          <button className="btn" onClick={() => setAdding(true)}>
            Add a card
          </button>
          {r.some((x) => x.done) && (
            <button className="btn quiet" onClick={() => setR(r.map((x) => ({ ...x, done: false })))}>
              Start the day again
            </button>
          )}
        </div>
      )}
    </div>
  );
}
