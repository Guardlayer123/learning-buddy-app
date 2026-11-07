import { useStore } from '../lib/store';
import { buddyById } from '../data/buddies';
import { Pic } from '../components/Bits';

export function WhoIsLearning({ onPick, onGrownUps }: { onPick: (id: string) => void; onGrownUps: () => void }) {
  const { data } = useStore();
  return (
    <div className="shell">
      <div className="topbar">
        <span className="spacer" />
        <button className="btn quiet" onClick={onGrownUps}>
          Grown-ups
        </button>
      </div>
      <div className="screen" style={{ justifyContent: 'center' }}>
        <h1 style={{ textAlign: 'center' }}>Who's learning today?</h1>
        <div className="kid-list">
          {data.children.map((c) => (
            <button key={c.id} className="kid-card" onClick={() => onPick(c.id)}>
              <Pic name={c.buddyId ? buddyById(c.buddyId).art : 'hatching-chick'} size={76} />
              {c.nickname}
            </button>
          ))}
        </div>
        {data.children.length === 0 && (
          <p className="muted" style={{ textAlign: 'center' }}>
            Ask a grown-up to add you first.
          </p>
        )}
      </div>
    </div>
  );
}
