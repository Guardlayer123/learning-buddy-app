import { useEffect, useRef, useState } from 'react';
import { useChild } from '../context';
import { BuddySays, Buddy } from '../../components/Buddy';
import { Dots, Pic } from '../../components/Bits';
import { Finished } from '../games/GameKit';
import { speak } from '../../lib/speech';
import { chimeYes } from '../../lib/sound';

type Step = {
  say: string;
  art?: string;
  /** Hands-only filmed clip, added later to /clips/<name>.mp4 */
  clip?: string;
  extra?: 'pea';
  timer?: { seconds: number; zones: { at: number; say: string; label: string }[]; label: string };
};

function Clip({ name, art }: { name?: string; art?: string }) {
  const [failed, setFailed] = useState(!name);
  const { child } = useChild();
  if (!failed && name)
    return (
      <video
        src={`${import.meta.env.BASE_URL}clips/${name}.mp4`}
        autoPlay
        loop
        muted
        playsInline
        controls={false}
        disablePictureInPicture
        controlsList="nodownload noplaybackrate"
        onContextMenu={(e) => e.preventDefault()}
        onError={() => setFailed(true)}
        style={{ width: '100%', maxWidth: 420, borderRadius: 20, background: 'var(--sky)' }}
      />
    );
  return art ? <Pic name={art} size={150} /> : <Buddy buddyId={child.buddyId} size="large" />;
}

function PeaSize() {
  return (
    <div className="pea">
      <div>
        <div className="dot" style={{ background: '#7cc46b', boxShadow: 'inset -4px -4px 0 rgba(0,0,0,0.12)' }} />A pea
      </div>
      <span style={{ fontSize: '2rem' }}>=</span>
      <div>
        <div className="dot" style={{ background: '#fff', boxShadow: 'inset 0 0 0 3px var(--pond), inset -4px -4px 0 rgba(0,0,0,0.06)' }} />
        Your toothpaste
      </div>
    </div>
  );
}

function TimedStep({ timer, onDone }: { timer: NonNullable<Step['timer']>; onDone: () => void }) {
  const [running, setRunning] = useState(false);
  const [left, setLeft] = useState(timer.seconds);
  const spoken = useRef(new Set<number>());

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => clearInterval(t);
  }, [running]);

  const elapsed = timer.seconds - left;
  const zoneIdx = timer.zones.reduce((acc, z, i) => (elapsed >= z.at ? i : acc), 0);
  const zone = timer.zones[zoneIdx];

  useEffect(() => {
    if (!running) return;
    if (!spoken.current.has(zoneIdx)) {
      spoken.current.add(zoneIdx);
      speak(zone.say);
    }
    if (left === 0) {
      chimeYes();
      speak('Finished! Great job.');
      setRunning(false);
      onDone();
    }
  }, [running, zoneIdx, zone.say, left, onDone]);

  const frac = elapsed / timer.seconds;
  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, '0');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, width: '100%' }}>
      <svg width="180" height="180" viewBox="0 0 180 180" aria-hidden="true">
        <circle cx="90" cy="90" r="78" fill="none" stroke="var(--sky-deep)" strokeWidth="16" />
        <circle
          cx="90"
          cy="90"
          r="78"
          fill="none"
          stroke="var(--meadow)"
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 78}`}
          strokeDashoffset={`${2 * Math.PI * 78 * (1 - frac)}`}
          transform="rotate(-90 90 90)"
        />
        <text x="90" y="102" textAnchor="middle" fontSize="38" fontFamily="var(--font-play)" fontWeight="600" fill="var(--ink)">
          {mm}:{ss}
        </text>
      </svg>
      <p style={{ fontFamily: 'var(--font-play)', fontSize: '1.5rem', fontWeight: 500, textAlign: 'center' }}>{running || left === 0 ? zone.label : timer.label}</p>
      {!running && left > 0 && (
        <button className="btn go big wide" onClick={() => setRunning(true)}>
          Start together
        </button>
      )}
    </div>
  );
}

function Lesson({ id, title, steps }: { id: string; title: string; steps: Step[] }) {
  const { child } = useChild();
  const [i, setI] = useState(0);
  const [timerDone, setTimerDone] = useState(false);
  const [finished, setFinished] = useState(false);

  if (finished)
    return (
      <Finished
        activityId={id}
        stars={2}
        onAgain={() => {
          setI(0);
          setTimerDone(false);
          setFinished(false);
        }}
      />
    );

  const step = steps[i];
  const last = i === steps.length - 1;
  const blocked = !!step.timer && !timerDone;

  return (
    <div className="screen">
      <BuddySays buddyId={child.buddyId} text={step.say} size="small" />
      <div className="stage">
        <h2>{title}</h2>
        {step.timer ? (
          <TimedStep key={i} timer={step.timer} onDone={() => setTimerDone(true)} />
        ) : (
          <>
            <Clip key={i} name={step.clip} art={step.art} />
            {step.extra === 'pea' && <PeaSize />}
          </>
        )}
        <Dots total={steps.length} done={i + 1} />
        <button
          className="btn go big wide"
          disabled={blocked}
          onClick={() => {
            if (last) setFinished(true);
            else {
              setI(i + 1);
              setTimerDone(false);
            }
          }}
        >
          {last ? 'All done!' : 'Done that, next'}
        </button>
        {i > 0 && (
          <button className="btn quiet" onClick={() => setI(i - 1)}>
            Go back a step
          </button>
        )}
      </div>
    </div>
  );
}

export function TeethLesson() {
  return (
    <Lesson
      id="teeth"
      title="Brush teeth"
      steps={[
        { say: 'Get your toothbrush and toothpaste. Wet the brush under the tap.', art: 'toothbrush', clip: 'teeth-1-wet' },
        { say: 'Squeeze out a tiny blob of toothpaste, the same size as a pea. Just a little bit!', art: 'toothbrush', clip: 'teeth-2-paste', extra: 'pea' },
        {
          say: "Now let's brush together for two minutes. Press start, and I'll tell you where to brush.",
          timer: {
            seconds: 120,
            label: 'Brush for 2 minutes',
            zones: [
              { at: 0, say: 'Brush your top teeth on this side. Little circles.', label: 'Top teeth, this side' },
              { at: 30, say: 'Now the top teeth on the other side.', label: 'Top teeth, other side' },
              { at: 60, say: "Halfway! Now the bottom teeth on this side. Don't forget the backs.", label: 'Bottom teeth, this side' },
              { at: 90, say: 'Last bit! Bottom teeth on the other side, and the chewing tops.', label: 'Bottom teeth, other side' },
              { at: 110, say: 'Ten more seconds!', label: 'Ten more seconds!' },
            ],
          },
        },
        { say: "Spit out the toothpaste. Don't rinse with water, so the toothpaste keeps working.", art: 'droplet', clip: 'teeth-4-spit' },
        { say: 'Rinse your toothbrush and put it away. Sparkly clean teeth!', art: 'sparkles', clip: 'teeth-5-away' },
      ]}
    />
  );
}

export function HandsLesson() {
  return (
    <Lesson
      id="hands"
      title="Wash hands"
      steps={[
        { say: 'Turn on the tap and wet your hands.', art: 'droplet', clip: 'hands-1-wet' },
        { say: 'Put some soap on your hands.', art: 'soap', clip: 'hands-2-soap' },
        {
          say: "Rub, rub, rub for twenty seconds. Press start and I'll count with you.",
          timer: {
            seconds: 20,
            label: 'Scrub for 20 seconds',
            zones: [
              { at: 0, say: 'Rub your palms together.', label: 'Palms together' },
              { at: 5, say: 'Now the backs of your hands.', label: 'Backs of hands' },
              { at: 10, say: 'In between your fingers.', label: 'Between fingers' },
              { at: 15, say: 'Your thumbs and fingertips.', label: 'Thumbs and fingertips' },
            ],
          },
        },
        { say: 'Rinse off all the bubbles under the tap.', art: 'droplet', clip: 'hands-4-rinse' },
        { say: 'Dry your hands on a towel. All clean!', art: 'sparkles', clip: 'hands-5-dry' },
      ]}
    />
  );
}

export function LacesLesson() {
  return (
    <Lesson
      id="laces"
      title="Tie laces"
      steps={[
        { say: 'Hold one lace in each hand. Cross them over to make an X.', art: 'running-shoe', clip: 'laces-1-cross' },
        { say: 'Tuck the top lace under and through. Pull both ends tight.', art: 'running-shoe', clip: 'laces-2-tuck' },
        { say: 'Fold one lace into a loop. This is a bunny ear.', art: 'rabbit-face', clip: 'laces-3-ear' },
        { say: 'Fold the other lace into a loop too. Now you have two bunny ears.', art: 'rabbit-face', clip: 'laces-4-ears' },
        { say: 'Cross the bunny ears over each other to make an X.', art: 'rabbit-face', clip: 'laces-5-cross' },
        { say: 'Tuck one bunny ear under and through the hole.', art: 'rabbit-face', clip: 'laces-6-through' },
        { say: 'Pull both bunny ears tight. You tied your laces!', art: 'running-shoe', clip: 'laces-7-pull' },
      ]}
    />
  );
}

export function DressedLesson() {
  return (
    <Lesson
      id="dressed"
      title="Get dressed"
      steps={[
        { say: 'Pants first! Put your pants on.', clip: 'dressed-1-pants' },
        { say: 'Now your socks. One on each foot.', art: 'socks', clip: 'dressed-2-socks' },
        { say: 'Next, your trousers. One leg, then the other leg.', art: 'jeans', clip: 'dressed-3-trousers' },
        { say: 'Now your top. Head through first, then one arm, then the other arm.', art: 't-shirt', clip: 'dressed-4-top' },
        { say: 'Last of all, your shoes. You got dressed all by yourself!', art: 'running-shoe', clip: 'dressed-5-shoes' },
      ]}
    />
  );
}

export function SandwichLesson() {
  return (
    <Lesson
      id="sandwich"
      title="Make a sandwich"
      steps={[
        { say: 'Wash your hands first. Clean hands keep food safe.', art: 'soap', clip: 'sandwich-1-hands' },
        { say: 'Get two slices of bread, a plate, a butter knife and your fillings.', art: 'bread', clip: 'sandwich-2-things' },
        { say: 'Spread butter thinly on one side of each slice. Go right to the edges.', art: 'bread', clip: 'sandwich-3-butter' },
        { say: 'Put your filling on one slice, like cheese or ham. Not too much, or it falls out.', art: 'cookie', clip: 'sandwich-4-filling' },
        { say: 'Put the other slice on top, butter side down. Press gently.', art: 'bread', clip: 'sandwich-5-top' },
        { say: 'Cut it in half with the knife, holding the bread with your other hand away from the blade. Then tidy up!', art: 'sparkles', clip: 'sandwich-6-cut' },
      ]}
    />
  );
}

export function ButtonLesson() {
  return (
    <Lesson
      id="button"
      title="Sew on a button"
      steps={[
        { say: 'Ask a grown-up for a needle, thread and the button. Needles are sharp, so go slowly.', art: 'scissors', clip: 'button-1-kit' },
        { say: 'Cut a piece of thread as long as your arm. Push one end through the hole in the needle.', art: 'scissors', clip: 'button-2-thread' },
        { say: 'Pull the two ends of thread together and tie a knot at the end.', clip: 'button-3-knot' },
        { say: 'Push the needle up from the back of the fabric, where the button goes, and through one hole in the button.', clip: 'button-4-up' },
        { say: 'Go down through the next hole and back through the fabric. Do this up and down about six times.', clip: 'button-5-sew' },
        { say: 'Finish at the back. Make a few small stitches in the same place, then cut the thread. Your button is on!', art: 'sparkles', clip: 'button-6-finish' },
      ]}
    />
  );
}
