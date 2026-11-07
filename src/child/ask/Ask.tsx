import { useEffect, useRef, useState } from 'react';
import { useChild } from '../context';
import { Buddy, type Mood } from '../../components/Buddy';
import { Pic } from '../../components/Bits';
import { buddyById } from '../../data/buddies';
import { ask, type Turn } from '../../lib/api';
import { speak } from '../../lib/speech';
import { useStore } from '../../lib/store';

const STARTERS: Record<string, string[]> = {
  little: ['Why is grass green?', 'Tell me about elephants', 'What do bees do?'],
  explorers: ['Why is the sky blue?', 'How do I spell "because"?', 'What do dinosaurs eat?'],
  builders: ['Help me with my times tables', 'How do volcanoes work?', 'How do I make a new friend?'],
  ready: ['Help me plan my revision', 'How do I open a bank account?', 'How do I write a good email?'],
};

// Talking instead of typing, where the device supports it (British English)
type Rec = { lang: string; interimResults: boolean; maxAlternatives: number; start: () => void; stop: () => void; onresult: ((e: { results: { 0: { transcript: string } }[] }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null };
const RecCtor: (new () => Rec) | undefined = (window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec }).SpeechRecognition ??
  (window as unknown as { webkitSpeechRecognition?: new () => Rec }).webkitSpeechRecognition;

const PROBLEMS: Record<string, string> = {
  busy: "I need a little rest. Let's try again in a few minutes.",
  offline: "I can't hear you right now. Check the internet is on, then try again.",
  unavailable: "Something went wrong at my end. Let's try again in a moment.",
  'signed-out': 'The test password has run out. Ask a grown-up to open the app again.',
};

export function Ask({ mode = 'chat' }: { mode?: 'chat' | 'interview' }) {
  const { child, band, openHelp, go } = useChild();
  const { updateChild } = useStore();
  const b = buddyById(child.buddyId);
  const opening =
    mode === 'interview'
      ? `Let's practise for an interview, ${child.nickname}. I'll ask a question, you answer, then I'll give you a tip. Say "ready" when you are.`
      : `Hi ${child.nickname}! Ask me anything you're wondering about. I'm a learning buddy, so for big worries, always tell a grown-up you trust too.`;
  const [turns, setTurns] = useState<Turn[]>([{ role: 'buddy', text: opening }]);
  const [text, setText] = useState('');
  const [thinking, setThinking] = useState(false);
  const [mood, setMood] = useState<Mood>('idle');
  const [worried, setWorried] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const [listening, setListening] = useState(false);
  const rec = useRef<Rec | null>(null);

  const talk = () => {
    if (!RecCtor) return;
    if (listening) {
      rec.current?.stop();
      return;
    }
    const r = new RecCtor();
    r.lang = 'en-GB';
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.onresult = (e) => {
      const said = e.results[0]?.[0]?.transcript ?? '';
      if (said) send(said);
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    rec.current = r;
    setListening(true);
    r.start();
  };

  useEffect(() => {
    speak(opening);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [turns, thinking]);

  const send = async (msg: string) => {
    const message = msg.trim().slice(0, 500);
    if (!message || thinking) return;
    const history = turns.slice(1).slice(-10);
    setTurns((t) => [...t, { role: 'child', text: message }]);
    setText('');
    setThinking(true);
    setMood('idle');
    const r = await ask({ nickname: child.nickname, band, buddyName: child.buddyName, buddyKind: b.kind, mode, history, message });
    setThinking(false);
    if ('error' in r) {
      setTurns((t) => [...t, { role: 'buddy', text: PROBLEMS[r.error] }]);
      speak(PROBLEMS[r.error]);
      return;
    }
    setTurns((t) => [...t, { role: 'buddy', text: r.reply }]);
    speak(r.reply);
    if (r.safety === 'danger') {
      // Help is shown straight away. A grown-up is asked to check in, unless the worry is about someone at home.
      if (!r.harmAtHome) updateChild(child.id, (c) => ({ notices: [...(c.notices ?? []), Date.now()].slice(-20) }));
      setTimeout(openHelp, 2500);
    } else if (r.safety === 'worried') {
      setWorried(true);
    } else {
      setMood('cheer');
    }
  };

  return (
    <div className={`screen ask band-${band}`}>
      <div className="chat" aria-live="polite">
        {turns.map((t, i) =>
          t.role === 'buddy' ? (
            <div key={i} className="msg-row buddy-side">
              <Buddy buddyId={child.buddyId} size="small" mood={i === turns.length - 1 ? mood : 'idle'} />
              <div className="chat-msg buddy-msg">
                {t.text}
                <button className="say-again" onClick={() => speak(t.text)} aria-label="Say it again">
                  🔈
                </button>
              </div>
            </div>
          ) : (
            <div key={i} className="msg-row child-side">
              <div className="chat-msg child-msg">{t.text}</div>
            </div>
          ),
        )}
        {thinking && (
          <div className="msg-row buddy-side">
            <Buddy buddyId={child.buddyId} size="small" />
            <div className="chat-msg buddy-msg thinking" aria-label={`${child.buddyName} is thinking`}>
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
        <div ref={end} />
      </div>

      {worried && (
        <div className="row" style={{ justifyContent: 'center' }}>
          <button className="btn" onClick={() => go('calm')}>
            <Pic name="tulip" size={30} />
            Breathe with me
          </button>
          <button className="btn" onClick={openHelp}>
            <Pic name="red-heart" size={30} />
            Who can help?
          </button>
        </div>
      )}

      {turns.length === 1 && mode === 'chat' && (
        <div className="starters">
          {(STARTERS[band] ?? STARTERS.explorers).map((s) => (
            <button key={s} className="starter" onClick={() => send(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        className={`composer ${RecCtor ? 'has-talk' : ''}`}
        onSubmit={(e) => {
          e.preventDefault();
          send(text);
        }}
      >
        <label htmlFor="ask-box" className="sr-only">
          Your message
        </label>
        <textarea
          id="ask-box"
          className="input"
          rows={2}
          maxLength={500}
          placeholder={mode === 'interview' ? 'Type your answer…' : `Ask ${child.buddyName}…`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send(text);
            }
          }}
        />
        {RecCtor && (
          <button type="button" className={`btn talk ${listening ? 'on' : ''}`} onClick={talk} aria-label={listening ? 'Stop listening' : 'Talk instead of typing'} disabled={thinking}>
            {listening ? 'Listening…' : 'Talk'}
          </button>
        )}
        <button className="btn go" type="submit" disabled={!text.trim() || thinking}>
          Send
        </button>
      </form>
      <p className="muted" style={{ fontSize: '0.85rem', textAlign: 'center' }}>
        Don't share your full name, address, school or phone number. {child.buddyName} can make mistakes, so check big things with a grown-up.
      </p>
    </div>
  );
}

export function Interview() {
  return <Ask mode="interview" />;
}
