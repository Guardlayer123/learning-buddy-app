import { useEffect, useState } from 'react';
import { useStore } from './lib/store';
import { setVoiceOn } from './lib/speech';
import { setMuted } from './lib/sound';
import { Welcome } from './grown/Welcome';
import { GrownUps } from './grown/GrownUps';
import { PinCheck } from './grown/Pin';
import { WhoIsLearning } from './child/WhoIsLearning';
import { ChildApp } from './child/ChildApp';
import { TestGate } from './grown/TestGate';

type View = { name: 'who' } | { name: 'pin' } | { name: 'grown' } | { name: 'child'; id: string };

export default function App() {
  return (
    <TestGate>
      <Main />
    </TestGate>
  );
}

function Main() {
  const { data } = useStore();
  const [view, setView] = useState<View>({ name: 'who' });

  const child = view.name === 'child' ? data.children.find((c) => c.id === view.id) : undefined;

  // Each child's comfort settings apply while they are using the app
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('low-sensory', !!child?.lowSensory);
    root.classList.toggle('easy-read', !!child?.easyRead);
    setMuted(!!child?.lowSensory);
    setVoiceOn(child ? child.voiceOn : true);
  }, [child?.lowSensory, child?.easyRead, child?.voiceOn, child]);

  if (!data.pinHash) return <Welcome onDone={() => setView({ name: 'grown' })} />;

  if (view.name === 'pin') return <PinCheck onOk={() => setView({ name: 'grown' })} onCancel={() => setView({ name: 'who' })} />;
  if (view.name === 'grown') return <GrownUps onExit={() => setView({ name: 'who' })} />;
  if (view.name === 'child' && child) return <ChildApp child={child} onExit={() => setView({ name: 'who' })} onGrownUps={() => setView({ name: 'pin' })} />;

  return <WhoIsLearning onPick={(id) => setView({ name: 'child', id })} onGrownUps={() => setView({ name: 'pin' })} />;
}
