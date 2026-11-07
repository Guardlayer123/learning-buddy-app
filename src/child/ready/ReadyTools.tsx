import { useEffect, useMemo, useState } from 'react';
import { useChild } from '../context';
import { BuddySays } from '../../components/Buddy';
import { Pic } from '../../components/Bits';
import { Finished } from '../games/GameKit';
import { speak } from '../../lib/speech';
import { chimeYes } from '../../lib/sound';
import { money } from '../games/BuilderGames';

/* ---------- Budget a week ---------- */
type Item = { id: string; label: string; cost: number; need: boolean; art: string };
const WEEKS: { title: string; budget: number; items: Item[] }[] = [
  {
    title: 'Your first part-time job week',
    budget: 4000,
    items: [
      { id: 'bus', label: 'Bus pass for work', cost: 1200, need: true, art: 'bus' },
      { id: 'lunch', label: 'Lunches', cost: 1000, need: true, art: 'bread' },
      { id: 'phone', label: 'Phone top-up', cost: 500, need: true, art: 'musical-notes' },
      { id: 'cinema', label: 'Cinema with friends', cost: 900, need: false, art: 'party-popper' },
      { id: 'game', label: 'New game', cost: 2500, need: false, art: 'trophy' },
      { id: 'snacks', label: 'Snacks', cost: 400, need: false, art: 'cookie' },
      { id: 'save', label: 'Put in savings', cost: 800, need: false, art: 'star' },
    ],
  },
  {
    title: 'A week at college',
    budget: 3500,
    items: [
      { id: 'travel', label: 'Train fares', cost: 1500, need: true, art: 'bus' },
      { id: 'food', label: 'Food shop', cost: 1200, need: true, art: 'red-apple' },
      { id: 'books', label: 'Course book', cost: 600, need: true, art: 'books' },
      { id: 'trainers', label: 'New trainers', cost: 4500, need: false, art: 'running-shoe' },
      { id: 'coffee', label: 'Hot chocolates', cost: 500, need: false, art: 'teapot' },
      { id: 'gift', label: "Friend's birthday present", cost: 800, need: false, art: 'wrapped-gift' },
    ],
  },
];

export function BudgetGame() {
  const { child } = useChild();
  const [w, setW] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [done, setDone] = useState(false);
  const week = WEEKS[w];
  const spent = week.items.filter((i) => picked.includes(i.id)).reduce((s, i) => s + i.cost, 0);
  const left = week.budget - spent;
  const missingNeeds = week.items.filter((i) => i.need && !picked.includes(i.id));
  const good = left >= 0 && missingNeeds.length === 0;

  if (done)
    return (
      <Finished
        activityId="budget"
        onAgain={() => {
          setDone(false);
          setW(0);
          setPicked([]);
          setChecked(false);
        }}
      />
    );

  const feedback = !checked
    ? `${week.title}. You have ${money(week.budget)}. Pick what to spend it on. Things you need come first, then things you want.`
    : left < 0
      ? `You've gone ${money(-left)} over. Take something off. Which of these is a want, not a need?`
      : missingNeeds.length
        ? `You're within budget, but you've missed something you need: ${missingNeeds[0].label.toLowerCase()}. Needs come first.`
        : `Well planned, ${child.nickname}. All your needs are covered and you have ${money(left)} left over.`;

  return (
    <div className="screen">
      <BuddySays buddyId={child.buddyId} size="small" mood={checked && good ? 'cheer' : checked ? 'oops' : 'idle'} text={feedback} />
      <div className="stage">
        <h2>Budget a week</h2>
        <div className={`budget-meter ${left < 0 ? 'over' : ''}`}>
          <span>Spent {money(spent)}</span>
          <strong>{left >= 0 ? `${money(left)} left` : `${money(-left)} over`}</strong>
        </div>
        <div className="budget-list">
          {week.items.map((i) => {
            const on = picked.includes(i.id);
            return (
              <button
                key={i.id}
                className={`budget-item ${on ? 'on' : ''}`}
                aria-pressed={on}
                onClick={() => {
                  setChecked(false);
                  setPicked((p) => (on ? p.filter((x) => x !== i.id) : [...p, i.id]));
                }}
              >
                <Pic name={i.art} size={40} />
                <span style={{ flex: 1 }}>
                  {i.label}
                  <small>{i.need ? 'Need' : 'Want'}</small>
                </span>
                <strong>{money(i.cost)}</strong>
              </button>
            );
          })}
        </div>
        {checked && good ? (
          <button
            className="btn go big wide"
            onClick={() => {
              if (w + 1 < WEEKS.length) {
                setW(w + 1);
                setPicked([]);
                setChecked(false);
              } else setDone(true);
            }}
          >
            {w + 1 < WEEKS.length ? 'Next week' : 'Finish'}
          </button>
        ) : (
          <button className="btn go big wide" onClick={() => setChecked(true)}>
            Check my budget
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- Form-filling practice (pretend details only) ---------- */
const PERSON = { first: 'Alex', last: 'Morgan', day: '14', month: '03', year: '2009', line1: '12 Park Road', town: 'Chester', postcode: 'CH1 2AB', email: 'alex.morgan@example.com' };
const FIELDS: { id: keyof typeof PERSON; label: string; tip: string; caps?: boolean }[] = [
  { id: 'first', label: 'First name', tip: 'Your first name is the name people call you. Write it in BLOCK CAPITALS on this form.', caps: true },
  { id: 'last', label: 'Surname', tip: 'Surname means your family name, sometimes called last name. Block capitals again.', caps: true },
  { id: 'day', label: 'Date of birth: day (DD)', tip: 'DD means two numbers for the day. The 4th would be 04.' },
  { id: 'month', label: 'Date of birth: month (MM)', tip: 'MM means two numbers for the month. March is the 3rd month, so 03.' },
  { id: 'year', label: 'Date of birth: year (YYYY)', tip: 'YYYY means all four numbers of the year.' },
  { id: 'line1', label: 'Address line 1', tip: 'The house number and street name go on the first line.' },
  { id: 'town', label: 'Town or city', tip: 'The town or city name.' },
  { id: 'postcode', label: 'Postcode', tip: 'UK postcodes have two parts with a space in the middle, like CH1 2AB.', caps: true },
  { id: 'email', label: 'Email address', tip: 'Check each letter carefully. One wrong letter and the email goes nowhere.' },
];

export function FormPractice() {
  const { child } = useChild();
  const [vals, setVals] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [done, setDone] = useState(false);
  const expected = (f: (typeof FIELDS)[number]) => (f.caps ? PERSON[f.id].toUpperCase() : PERSON[f.id]);
  const right = (f: (typeof FIELDS)[number]) => (vals[f.id] ?? '').trim().replace(/\s+/g, ' ') === expected(f);
  const wrong = FIELDS.filter((f) => !right(f));

  if (done) return <Finished activityId="forms" onAgain={() => { setDone(false); setVals({}); setChecked(false); }} />;

  return (
    <div className="screen">
      <BuddySays
        buddyId={child.buddyId}
        size="small"
        mood={checked && !wrong.length ? 'cheer' : 'idle'}
        text={
          !checked
            ? "Let's practise filling in a form. Use Alex's pretend details on the card, never your own. Read each tip first."
            : wrong.length
              ? `Nearly there. Check ${wrong.length === 1 ? 'the box' : 'the boxes'} marked in pink and read the tip.`
              : 'Perfect form! Forms for jobs, college and the doctor all work like this.'
        }
      />
      <div className="stage" style={{ alignItems: 'stretch' }}>
        <div className="id-card">
          <strong>Pretend person</strong>
          <span>Alex Morgan, born 14 March 2009</span>
          <span>12 Park Road, Chester, CH1 2AB</span>
          <span>alex.morgan@example.com</span>
        </div>
        <h2>Application form</h2>
        <p className="muted" style={{ marginTop: -10 }}>Please write in BLOCK CAPITALS where marked.</p>
        {FIELDS.map((f) => (
          <div key={f.id} className="field">
            <label htmlFor={`f-${f.id}`}>
              {f.label}
              {f.caps ? ' (BLOCK CAPITALS)' : ''}
            </label>
            <input
              id={`f-${f.id}`}
              className="input"
              autoComplete="off"
              value={vals[f.id] ?? ''}
              onFocus={() => speak(f.tip)}
              onChange={(e) => {
                setChecked(false);
                setVals((v) => ({ ...v, [f.id]: e.target.value }));
              }}
              style={checked && !right(f) ? { borderColor: 'var(--blush)', background: 'var(--blush-pale)' } : undefined}
            />
            <span className="hint">{f.tip}</span>
          </div>
        ))}
        {checked && !wrong.length ? (
          <button className="btn go big wide" onClick={() => setDone(true)}>
            Finish
          </button>
        ) : (
          <button className="btn go big wide" onClick={() => setChecked(true)}>
            Check my form
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- CV builder ---------- */
const SKILL_CHOICES = ['Reliable', 'Good with computers', 'Team player', 'Good listener', 'Organised', 'Creative', 'Calm under pressure', 'Good at maths', 'Kind to customers', 'Hard-working', 'Good attention to detail', 'Quick learner'];

type CV = { about: string; skills: string[]; school: string; experience: string; interests: string };
const EMPTY: CV = { about: '', skills: [], school: '', experience: '', interests: '' };

export function CVBuilder() {
  const { child } = useChild();
  const key = `cv-${child.id}`;
  const [cv, setCv] = useState<CV>(() => {
    try {
      return { ...EMPTY, ...JSON.parse(localStorage.getItem(key) || '{}') };
    } catch {
      return EMPTY;
    }
  });
  const [step, setStep] = useState(0);
  const [copied, setCopied] = useState('');
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(cv));
    } catch {
      /* ignore */
    }
  }, [cv, key]);

  const STEPS = [
    { title: 'About me', say: 'Write two or three sentences about yourself, as if to an employer. What are you like, and what are you looking for?', field: 'about' as const, eg: 'I am a friendly, reliable student at secondary school. I am looking for a weekend job where I can learn new skills.' },
    { title: 'My skills', say: 'Pick up to five skills that are true about you. Think of times you showed each one.', field: 'skills' as const, eg: '' },
    { title: 'Education', say: 'Write your school or college and the subjects you are taking. Add your school name only when you send it.', field: 'school' as const, eg: 'Secondary school, 2021 to now. GCSEs in English, maths, science, art and geography.' },
    { title: 'Experience', say: 'Any jobs, volunteering, clubs or helping out count. Say what you did.', field: 'experience' as const, eg: 'Helped at the school open day, showing visitors around. Member of the football team for two years.' },
    { title: 'Interests', say: 'A few hobbies or interests. These help an employer get to know you.', field: 'interests' as const, eg: 'Drawing, cooking for my family, and looking after our dog.' },
  ];

  const text = useMemo(
    () =>
      [
        `${child.nickname.toUpperCase()}`,
        '[Add your phone number and email here when you send it]',
        '',
        'ABOUT ME',
        cv.about,
        '',
        'SKILLS',
        ...cv.skills.map((s) => `- ${s}`),
        '',
        'EDUCATION',
        cv.school,
        '',
        'EXPERIENCE',
        cv.experience,
        '',
        'INTERESTS',
        cv.interests,
        '',
        'References available on request.',
      ].join('\n'),
    [cv, child.nickname],
  );

  if (step >= STEPS.length)
    return (
      <div className="screen">
        <BuddySays buddyId={child.buddyId} mood="cheer" size="small" text="Here is your CV. Ask a grown-up to read it with you before you send it anywhere." />
        <div className="stage" style={{ alignItems: 'stretch' }}>
          <pre className="cv-preview">{text}</pre>
          <button
            className="btn go big wide"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(text);
                setCopied('Copied. Paste it into a document to finish it.');
              } catch {
                setCopied('Copying is blocked here. Select the text above and copy it.');
              }
            }}
          >
            Copy my CV
          </button>
          {copied && <p className="muted">{copied}</p>}
          <button className="btn wide" onClick={() => setStep(0)}>
            Edit it
          </button>
        </div>
      </div>
    );

  const s = STEPS[step];
  return (
    <div className="screen">
      <BuddySays buddyId={child.buddyId} size="small" text={s.say} />
      <div className="stage" style={{ alignItems: 'stretch' }}>
        <h2>
          CV builder: {s.title} ({step + 1} of {STEPS.length})
        </h2>
        {s.field === 'skills' ? (
          <div className="starters" style={{ justifyContent: 'flex-start' }}>
            {SKILL_CHOICES.map((k) => {
              const on = cv.skills.includes(k);
              return (
                <button
                  key={k}
                  className="starter"
                  aria-pressed={on}
                  style={on ? { background: 'var(--meadow)', color: '#fff' } : undefined}
                  onClick={() => setCv((c) => ({ ...c, skills: on ? c.skills.filter((x) => x !== k) : c.skills.length < 5 ? [...c.skills, k] : c.skills }))}
                >
                  {k}
                </button>
              );
            })}
          </div>
        ) : (
          <>
            <label htmlFor="cv-field" className="sr-only">
              {s.title}
            </label>
            <textarea id="cv-field" className="input" rows={5} maxLength={600} value={cv[s.field]} onChange={(e) => setCv((c) => ({ ...c, [s.field]: e.target.value }))} />
            <p className="hint muted">Example: {s.eg}</p>
          </>
        )}
        <button
          className="btn go big wide"
          onClick={() => {
            chimeYes();
            setStep(step + 1);
          }}
        >
          {step === STEPS.length - 1 ? 'See my CV' : 'Next'}
        </button>
        {step > 0 && (
          <button className="btn quiet" onClick={() => setStep(step - 1)}>
            Go back
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- Revision timer ---------- */
export function RevisionTimer() {
  const { child, award } = useChild();
  const [focus, setFocus] = useState(20);
  const [phase, setPhase] = useState<'set' | 'focus' | 'rest' | 'done'>('set');
  const [left, setLeft] = useState(0);
  const [subject, setSubject] = useState('');

  useEffect(() => {
    if (phase !== 'focus' && phase !== 'rest') return;
    const t = setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (left > 0) return;
    if (phase === 'focus') {
      chimeYes();
      speak('Time for a five-minute break. Stand up, stretch and have some water.');
      award(2, 'revision');
      setPhase('rest');
      setLeft(5 * 60);
    } else if (phase === 'rest') {
      chimeYes();
      speak('Break over. Well done for that session.');
      setPhase('done');
    }
  }, [left, phase, award]);

  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, '0');

  return (
    <div className="screen">
      <BuddySays
        buddyId={child.buddyId}
        size="small"
        text={
          phase === 'set'
            ? 'Pick one subject and a short time. Short, focused sessions work better than long ones. Put your phone in another room.'
            : phase === 'focus'
              ? `Focus on ${subject || 'your revision'}. I'll tell you when to stop.`
              : phase === 'rest'
                ? 'Break time. Move about and have a drink.'
                : 'Session done. Write down one thing you learned, then choose whether to do another.'
        }
      />
      <div className="stage">
        <h2>Revision timer</h2>
        {phase === 'set' && (
          <>
            <div className="field" style={{ width: '100%' }}>
              <label htmlFor="subj">What are you revising?</label>
              <input id="subj" className="input" maxLength={40} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="For example, French vocabulary" />
            </div>
            <div className="choices" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {[15, 20, 25].map((m) => (
                <button key={m} className={`choice ${focus === m ? 'right' : ''}`} onClick={() => setFocus(m)}>
                  {m} min
                </button>
              ))}
            </div>
            <button
              className="btn go big wide"
              onClick={() => {
                setLeft(focus * 60);
                setPhase('focus');
              }}
            >
              Start focusing
            </button>
          </>
        )}
        {(phase === 'focus' || phase === 'rest') && (
          <>
            <p className="big-sum" style={{ fontSize: '3.4rem' }}>
              {mm}:{ss}
            </p>
            <p style={{ fontFamily: 'var(--font-play)', fontSize: '1.3rem' }}>{phase === 'focus' ? 'Focus time' : 'Break'}</p>
            <button className="btn quiet" onClick={() => setPhase('set')}>
              Stop
            </button>
          </>
        )}
        {phase === 'done' && (
          <button className="btn go big wide" onClick={() => setPhase('set')}>
            Do another session
          </button>
        )}
      </div>
    </div>
  );
}
