import { useChild } from '../context';
import { BuddySays } from '../../components/Buddy';
import { Pic } from '../../components/Bits';
import { cardById } from '../../data/cards';
import { useStore } from '../../lib/store';
import { chimeYes } from '../../lib/sound';

export function NowNext() {
  const { child, award } = useChild();
  const { updateChild } = useStore();
  const left = child.routine.filter((r) => !r.done);
  const now = left[0];
  const next = left[1];

  const finish = () => {
    if (!now) return;
    chimeYes();
    updateChild(child.id, (c) => ({ routine: c.routine.map((r) => (r.id === now.id ? { ...r, done: true } : r)) }));
    award(1, 'nownext');
  };

  if (!now)
    return (
      <div className="screen">
        <BuddySays buddyId={child.buddyId} mood="cheer" text="You finished everything on your board. Amazing!" />
      </div>
    );

  const n = cardById(now.card);
  return (
    <div className="screen">
      <BuddySays
        buddyId={child.buddyId}
        size="small"
        text={next ? `Now: ${n.label.toLowerCase()}. Next: ${cardById(next.card).label.toLowerCase()}.` : `Now: ${n.label.toLowerCase()}. That's the last one!`}
      />
      <div className="stage" style={{ boxShadow: 'inset 0 0 0 4px var(--meadow)' }}>
        <span style={{ fontFamily: 'var(--font-play)', fontWeight: 600, color: 'var(--meadow)', fontSize: '1.3rem' }}>Now</span>
        <Pic name={n.art} size={150} />
        <h1>{n.label}</h1>
        <button className="btn go big wide" onClick={finish}>
          I've done it!
        </button>
      </div>
      {next && (
        <div className="stage" style={{ flexDirection: 'row', justifyContent: 'center', padding: 14, opacity: 0.85 }}>
          <span style={{ fontFamily: 'var(--font-play)', fontWeight: 600, color: 'var(--ink-soft)' }}>Next</span>
          <Pic name={cardById(next.card).art} size={56} />
          <strong style={{ fontFamily: 'var(--font-play)', fontWeight: 500, fontSize: '1.3rem' }}>{cardById(next.card).label}</strong>
        </div>
      )}
    </div>
  );
}
