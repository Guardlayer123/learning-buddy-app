import { useEffect, useState, type ReactNode } from 'react';
import { art } from '../data/buddies';

export function Pic({ name, size = 72, alt = '' }: { name: string; size?: number; alt?: string }) {
  return <img src={art(name)} alt={alt} width={size} height={size} draggable={false} style={{ width: size, height: size }} />;
}

export function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return <button className="switch" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} />;
}

export function ToggleRow({ title, hint, on, onChange }: { title: string; hint?: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="toggle-row">
      <div className="text">
        {title}
        {hint && <small>{hint}</small>}
      </div>
      <Switch on={on} onChange={onChange} label={title} />
    </div>
  );
}

export function Dots({ total, done }: { total: number; done: number }) {
  return (
    <div className="progress-dots" aria-label={`${done} of ${total} done`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={i < done ? 'on' : ''} />
      ))}
    </div>
  );
}

const COLOURS = ['#f0b23e', '#4f9a6a', '#4d8fb0', '#ee8f86', '#9e8cd6'];
export function Confetti({ show }: { show: boolean }) {
  const [pieces, setPieces] = useState<ReactNode[]>([]);
  useEffect(() => {
    if (!show) return;
    setPieces(
      Array.from({ length: 40 }, (_, i) => (
        <i
          key={i}
          style={{
            left: `${Math.random() * 100}%`,
            background: COLOURS[i % COLOURS.length],
            animationDelay: `${Math.random() * 0.6}s`,
            animationDuration: `${2 + Math.random() * 1.4}s`,
          }}
        />
      )),
    );
    const t = setTimeout(() => setPieces([]), 3800);
    return () => clearTimeout(t);
  }, [show]);
  if (!pieces.length) return null;
  return <div className="confetti">{pieces}</div>;
}

export function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

export const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

export const PRAISE = ['Well done!', 'Brilliant!', 'You got it!', 'Super work!', 'Fantastic!', 'Great thinking!'];
export const OOPS = ['Oops, not quite. Have another go!', 'Nearly! Try again.', 'Not that one. You can do it!'];
