import { useState } from 'react';
import { useChild } from '../context';
import { BuddySays } from '../../components/Buddy';
import { Pic } from '../../components/Bits';

// Small real-world steps: the buddy is a practice partner, never a replacement for people
const MISSIONS = [
  { art: 'hugging-face', text: 'Say hello to someone today and smile.' },
  { art: 'red-heart', text: 'Ask someone at home how their day was.' },
  { art: 'teddy-bear', text: 'Ask a friend if they would like to play with you.' },
  { art: 'sparkles', text: 'Say thank you to someone who helps you.' },
  { art: 'books', text: 'Tell a grown-up one thing you learned today.' },
  { art: 'crayon', text: 'Draw a picture and give it to someone you love.' },
  { art: 'soccer-ball', text: 'Take turns in a game with someone.' },
];

export function Mission() {
  const { child, award } = useChild();
  const day = Math.floor(Date.now() / 86_400_000);
  const m = MISSIONS[day % MISSIONS.length];
  const [stage, setStage] = useState<'set' | 'ask' | 'reply'>('set');
  const [reply, setReply] = useState('');

  const replies = [
    { art: 'sun', label: 'It went well', say: 'Brilliant! I knew you could do it. Real people are the best.' },
    { art: 'sun-behind-cloud', label: 'It was okay', say: 'Well done for trying. Trying is the brave part.' },
    { art: 'cloud-with-rain', label: 'It was tricky', say: "That's okay. Tricky things get easier with practice. You could tell a grown-up how it felt." },
  ];

  return (
    <div className="screen">
      <BuddySays
        buddyId={child.buddyId}
        mood={stage === 'reply' ? 'cheer' : 'idle'}
        text={stage === 'set' ? `Here's your mission for today. ${m.text}` : stage === 'ask' ? 'How did it go?' : reply}
      />
      <div className="stage" style={{ background: 'var(--honey-pale)', boxShadow: 'none' }}>
        <Pic name={m.art} size={110} />
        <h2 style={{ textAlign: 'center' }}>{m.text}</h2>
        {stage === 'set' && (
          <button className="btn go big wide" onClick={() => setStage('ask')}>
            I did it!
          </button>
        )}
        {stage === 'ask' && (
          <div className="choices pics">
            {replies.map((r) => (
              <button
                key={r.label}
                className="choice"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '1rem' }}
                onClick={() => {
                  award(2, 'mission');
                  setReply(r.say);
                  setStage('reply');
                }}
              >
                <Pic name={r.art} size={56} />
                {r.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
