import { useState } from 'react';
import { useChild } from '../context';
import { BuddySays } from '../../components/Buddy';
import { Pic } from '../../components/Bits';

const WEATHER = [
  { id: 'happy', art: 'sun', label: 'Sunny', feel: 'happy', reply: "Sunny inside! I'm so glad you feel happy. What made you smile today? You could tell someone at home about it." },
  { id: 'okay', art: 'sun-behind-cloud', label: 'Cloudy', feel: 'okay', reply: 'A bit cloudy. That is completely fine. Some days are just okay.' },
  { id: 'sad', art: 'cloud-with-rain', label: 'Rainy', feel: 'sad', reply: "Rainy feelings are hard. It's okay to feel sad. Telling a grown-up you trust can really help. Shall we breathe together?" },
  { id: 'cross', art: 'cloud-with-lightning-and-rain', label: 'Stormy', feel: 'cross', reply: "Stormy feelings are big. It's okay to feel cross. Let's slow down with some breathing, then you could tell a grown-up what happened." },
  { id: 'worried', art: 'leaf-fluttering-in-wind', label: 'Windy', feel: 'worried or wobbly', reply: 'Windy and wobbly. Worries feel smaller when you share them with a grown-up you trust. Shall we breathe together first?' },
  { id: 'tired', art: 'snowflake', label: 'Frosty', feel: 'tired or slow', reply: 'Frosty and slow. Maybe you need a rest, a drink of water or a snack.' },
];

export function Feelings() {
  const { child, award, go } = useChild();
  const [picked, setPicked] = useState<(typeof WEATHER)[number] | null>(null);

  return (
    <div className="screen">
      <BuddySays buddyId={child.buddyId} size="small" text={picked ? picked.reply : 'What is the weather like inside you today? Tap the one that feels right.'} />
      <div className="stage">
        <h2>How I feel</h2>
        <div className="choices pics">
          {WEATHER.map((w) => (
            <button
              key={w.id}
              className={`choice ${picked?.id === w.id ? 'right' : ''}`}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, fontSize: '1.1rem' }}
              onClick={() => {
                if (!picked) award(1, 'feelings');
                setPicked(w);
              }}
            >
              <Pic name={w.art} size={64} />
              {w.label}
            </button>
          ))}
        </div>
        {picked && ['sad', 'cross', 'worried'].includes(picked.id) && (
          <button className="btn go big wide" onClick={() => go('calm')}>
            <Pic name="tulip" size={36} />
            Breathe with me
          </button>
        )}
      </div>
    </div>
  );
}
