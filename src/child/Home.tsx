import { useEffect, useState } from 'react';
import { useChild } from './context';
import { ACTIVITIES, GROUP_NAMES, type Group } from './activities';
import { BuddySays } from '../components/Buddy';
import { Confetti, Pic } from '../components/Bits';
import { isBirthday, ageFrom } from '../lib/age';
import { cardById } from '../data/cards';
import { useStore } from '../lib/store';
import { speak } from '../lib/speech';

function greeting(name: string, teen: boolean) {
  const h = new Date().getHours();
  const part = h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening';
  return teen ? `Good ${part}, ${name}. What do you want to work on?` : `Good ${part}, ${name}! What shall we do?`;
}

export function Home() {
  const { child, go, band } = useChild();
  const { updateChild } = useStore();
  const year = new Date().getFullYear();
  const birthday = isBirthday(child.dob) && child.birthdaySungYear !== year;
  const [party, setParty] = useState(false);

  useEffect(() => {
    if (!birthday) return;
    setParty(true);
    const age = ageFrom(child.dob);
    speak(
      `Happy birthday to you, happy birthday to you, happy birthday dear ${child.nickname}, happy birthday to you! You're ${age} today. Hooray!`,
      { rate: 0.85, pitch: 1.2 },
    );
    updateChild(child.id, { birthdaySungYear: year });
  }, [birthday, child.dob, child.id, child.nickname, updateChild, year]);

  const next = child.routine.find((r) => !r.done);
  const groups: Group[] = ['learn', 'life', 'calm', 'story'];
  const mine = ACTIVITIES.filter((a) => a.bands.includes(band));

  return (
    <div className={`screen band-${band}`}>
      <Confetti show={party} />
      {party ? (
        <div className="stage" style={{ background: 'var(--honey-pale)', boxShadow: 'none' }}>
          <Pic name="birthday-cake" size={110} />
          <h1>Happy birthday, {child.nickname}!</h1>
          <p>{child.buddyName} sang you a song. Have a wonderful day!</p>
        </div>
      ) : (
        <BuddySays buddyId={child.buddyId} size={band === 'ready' ? 'small' : ''} text={greeting(child.nickname, band === 'ready')} />
      )}

      <button className="ask-card" onClick={() => go('ask')}>
        <Pic name="hugging-face" size={band === 'ready' ? 48 : 60} />
        <span>
          <strong>Ask {child.buddyName}</strong>
          <small>{band === 'little' ? 'Ask me a question' : 'Homework, questions, anything you wonder about'}</small>
        </span>
      </button>

      {next && (
        <button className="now-card" onClick={() => go('nownext')}>
          <Pic name={cardById(next.card).art} size={64} />
          <span>
            <small>Now</small>
            <strong>{cardById(next.card).label}</strong>
          </span>
        </button>
      )}

      {groups.map((g) => {
        const items = mine.filter((a) => a.group === g && (a.id !== 'nownext' || child.routine.length > 0));
        if (!items.length) return null;
        return (
          <section key={g} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h2 className="section-name">{GROUP_NAMES[g]}</h2>
            <div className="tiles">
              {items.map((a) => (
                <button key={a.id} className={`tile ${a.group}`} onClick={() => go(a.id)}>
                  <Pic name={a.art} size={76} />
                  {a.name}
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
