import { createContext, useContext } from 'react';
import type { Child } from '../lib/store';
import type { Band } from '../lib/age';

export type ChildCtx = {
  child: Child;
  /** Give stars and record a finished activity for the grown-ups summary. */
  award: (stars: number, activityId: string) => void;
  go: (route: string) => void;
  home: () => void;
  band: Band;
  /** Open the Help sheet (Childline, 999, breathing) */
  openHelp: () => void;
};

export const ChildContext = createContext<ChildCtx | null>(null);

export function useChild() {
  const c = useContext(ChildContext);
  if (!c) throw new Error('useChild outside ChildApp');
  return c;
}
