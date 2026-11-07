import { useState } from 'react';
import { useChild } from '../context';
import { BuddySays } from '../../components/Buddy';

// Every joke says why it's funny, because word play can be confusing
const JOKES = [
  { q: 'What do you call a dinosaur that is sleeping?', a: 'A dino-snore!', why: '"Snore" sounds like "saur", the end of dinosaur.' },
  { q: 'Why did the cow cross the road?', a: 'To get to the udder side!', why: '"Udder" is part of a cow, and it sounds like "other".' },
  { q: 'What do you call a bear with no teeth?', a: 'A gummy bear!', why: 'Without teeth you only have gums. Gummy bears are also sweets.' },
  { q: 'Why are fish so clever?', a: 'Because they live in schools!', why: 'A big group of fish is called a school.' },
  { q: 'What has hands but cannot clap?', a: 'A clock!', why: 'Clocks have hands that point to the time, not hands like ours.' },
  { q: 'What do you call a sleeping bull?', a: 'A bulldozer!', why: 'To doze means to have a little sleep. A bulldozer is also a big digger.' },
  { q: 'Why did the teddy bear say no to pudding?', a: 'Because it was already stuffed!', why: 'Teddies are full of stuffing, and "stuffed" also means very full of food.' },
  { q: 'What do you call a pig that does karate?', a: 'A pork chop!', why: 'A chop is a karate move. A pork chop is also a kind of meat.' },
  { q: 'What kind of tree fits in your hand?', a: 'A palm tree!', why: 'The palm is the inside of your hand. A palm tree is a real tree.' },
  { q: 'Why did the banana go to the doctor?', a: "Because it wasn't peeling well!", why: '"Peeling" sounds like "feeling". You peel a banana.' },
];

export function Jokes() {
  const { child, award } = useChild();
  const [i, setI] = useState(() => Math.floor(Math.random() * JOKES.length));
  const [stage, setStage] = useState<'q' | 'a' | 'why'>('q');
  const [count, setCount] = useState(0);
  const j = JOKES[i];

  const text = stage === 'q' ? j.q : stage === 'a' ? j.a : j.why;

  return (
    <div className="screen">
      <BuddySays buddyId={child.buddyId} mood={stage === 'a' ? 'cheer' : 'idle'} text={text} />
      <div className="stage" style={{ background: 'var(--honey-pale)', boxShadow: 'none' }}>
        <p style={{ fontFamily: 'var(--font-play)', fontSize: '1.5rem', fontWeight: 500, textAlign: 'center' }}>{j.q}</p>
        {stage !== 'q' && <p style={{ fontFamily: 'var(--font-play)', fontSize: '1.8rem', fontWeight: 600, textAlign: 'center' }}>{j.a}</p>}
        {stage === 'why' && <p style={{ textAlign: 'center' }}>{j.why}</p>}
        {stage === 'q' && (
          <button className="btn go big wide" onClick={() => setStage('a')}>
            Tell me!
          </button>
        )}
        {stage === 'a' && (
          <button className="btn big wide" onClick={() => setStage('why')}>
            Why is that funny?
          </button>
        )}
        {stage !== 'q' && (
          <button
            className="btn go big wide"
            onClick={() => {
              const c = count + 1;
              setCount(c);
              if (c === 3) award(1, 'jokes');
              setI((i + 1 + Math.floor(Math.random() * (JOKES.length - 1))) % JOKES.length);
              setStage('q');
            }}
          >
            Another joke
          </button>
        )}
      </div>
    </div>
  );
}
