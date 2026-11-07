import { useCallback, useEffect, useMemo, useState } from 'react';
import { useStore, type Child } from '../lib/store';
import { ChildContext } from './context';
import { ACTIVITIES } from './activities';
import { Home } from './Home';
import { BuddyPicker } from './BuddyPicker';
import { BreakScreen } from './BreakScreen';
import { HelpSheet } from './HelpSheet';
import { Pic } from '../components/Bits';
import { stopSpeaking } from '../lib/speech';
import { chimeStar } from '../lib/sound';
import { ageFrom, bandFor } from '../lib/age';

const TICK = 10_000;

export function ChildApp({ child, onExit, onGrownUps }: { child: Child; onExit: () => void; onGrownUps: () => void }) {
  const { updateChild } = useStore();
  const [route, setRoute] = useState('home');
  const [help, setHelp] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Count time used while the app is on screen, and start a break when play time is up
  useEffect(() => {
    const t = setInterval(() => {
      setNow(Date.now());
      if (document.visibilityState !== 'visible') return;
      updateChild(child.id, (c) => {
        if (c.breakUntil > Date.now()) return {};
        const used = c.usedMs + TICK;
        if (used >= c.playMinutes * 60_000) return { usedMs: 0, breakUntil: Date.now() + c.breakMinutes * 60_000 };
        return { usedMs: used };
      });
    }, TICK);
    return () => clearInterval(t);
  }, [child.id, updateChild]);

  useEffect(() => () => stopSpeaking(), []);

  const award = useCallback(
    (stars: number, activityId: string) => {
      chimeStar();
      updateChild(child.id, (c) => ({ stars: c.stars + stars, skills: { ...c.skills, [activityId]: (c.skills[activityId] ?? 0) + 1 } }));
    },
    [child.id, updateChild],
  );
  const go = useCallback((r: string) => {
    stopSpeaking();
    setRoute(r);
    window.scrollTo(0, 0);
  }, []);
  const home = useCallback(() => go('home'), [go]);
  const band = bandFor(ageFrom(child.dob));
  const openHelp = useCallback(() => setHelp(true), []);
  const ctx = useMemo(() => ({ child, award, go, home, band, openHelp }), [child, award, go, home, band, openHelp]);

  const onBreak = child.breakUntil > now;
  const minutesLeft = Math.max(0, child.playMinutes - Math.floor(child.usedMs / 60_000));

  if (!child.buddyId) {
    return (
      <ChildContext.Provider value={ctx}>
        <BuddyPicker />
      </ChildContext.Provider>
    );
  }

  const activity = ACTIVITIES.find((a) => a.id === route);
  const Screen = activity?.Screen;

  return (
    <ChildContext.Provider value={ctx}>
      <div className="shell">
        <div className="topbar">
          {route === 'home' ? (
            <button className="btn quiet" onClick={onExit} aria-label="Switch child">
              Switch
            </button>
          ) : (
            <button className="round" onClick={home} aria-label="Home">
              <Pic name="house" size={34} />
            </button>
          )}
          <span className="star-jar" aria-label={`${child.stars} stars`}>
            <Pic name="star" size={38} />
            {child.stars}
          </span>
          <span className="spacer" />
          <button className="help-heart" onClick={() => setHelp(true)}>
            <Pic name="red-heart" size={36} />
            Help
          </button>
        </div>
        {minutesLeft <= 5 && !onBreak && (
          <div className="break-row">
            <span className="sand-chip" role="status">
              <SandTimer fraction={Math.min(1, (child.usedMs / 60_000 - (child.playMinutes - 5)) / 5)} />
              {minutesLeft <= 1 ? 'Break in 1 minute' : `Break in ${minutesLeft} minutes`}
            </span>
          </div>
        )}
        {Screen ? <Screen /> : <Home />}
      </div>
      {onBreak && <BreakScreen until={child.breakUntil} now={now} onHelp={() => setHelp(true)} onGrownUps={onGrownUps} />}
      {help && (
        <HelpSheet
          onClose={() => setHelp(false)}
          onCalm={() => {
            setHelp(false);
            if (!onBreak) go('calm');
          }}
        />
      )}
    </ChildContext.Provider>
  );
}

/** A small sand timer that empties as break time gets closer. */
export function SandTimer({ fraction }: { fraction: number }) {
  const f = Math.max(0, Math.min(1, fraction));
  const top = 14 * (1 - f);
  const bottom = 14 * f;
  return (
    <svg width="26" height="34" viewBox="0 0 26 34" aria-hidden="true">
      <path d="M3 2h20M3 32h20" stroke="var(--ink-soft)" strokeWidth="3" strokeLinecap="round" />
      <path d="M5 3c0 8 8 10 8 14s-8 6-8 14h16c0-8-8-10-8-14s8-6 8-14z" fill="var(--paper)" stroke="var(--ink-soft)" strokeWidth="2" />
      <path d={`M${13 - top * 0.55} ${17 - top} L${13 + top * 0.55} ${17 - top} L13 17z`} fill="var(--honey)" />
      <path d={`M5.5 31 L20.5 31 L${13 + bottom * 0.5} ${31 - bottom} L${13 - bottom * 0.5} ${31 - bottom}z`} fill="var(--honey)" />
    </svg>
  );
}
