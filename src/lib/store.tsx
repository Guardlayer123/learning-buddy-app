import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type RoutineItem = { id: string; card: string; done: boolean };

export type Child = {
  id: string;
  nickname: string;
  dob: string; // YYYY-MM-DD, entered by the parent, used for age band and birthday only
  buddyId: string;
  buddyName: string;
  stars: number;
  lowSensory: boolean;
  easyRead: boolean;
  voiceOn: boolean;
  playMinutes: number; // minutes of use before a break
  breakMinutes: number;
  usedMs: number; // use since the last break
  breakUntil: number; // epoch ms, 0 when no break
  routine: RoutineItem[];
  birthdaySungYear: number;
  skills: Record<string, number>; // activity id -> times completed (for the grown-ups summary)
  notices?: number[]; // times when something serious came up, so a grown-up can check in (no chat text kept)
};

export type Data = {
  version: 1;
  pinHash: string;
  children: Child[];
};

const KEY = 'learning-buddy-v1';
const EMPTY: Data = { version: 1, pinHash: '', children: [] };

function load(): Data {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const d = JSON.parse(raw) as Data;
    return d && d.version === 1 ? d : EMPTY;
  } catch {
    return EMPTY;
  }
}

function save(d: Data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(d));
  } catch {
    /* storage unavailable: the app still works for this visit */
  }
}

export async function hashPin(pin: string): Promise<string> {
  const bytes = new TextEncoder().encode('learning-buddy:' + pin);
  const buf = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export const newId = () => Math.random().toString(36).slice(2, 10);

export function newChild(p: Pick<Child, 'nickname' | 'dob' | 'buddyId' | 'buddyName'>): Child {
  return {
    ...p,
    id: newId(),
    stars: 0,
    lowSensory: false,
    easyRead: false,
    voiceOn: true,
    playMinutes: 45,
    breakMinutes: 15,
    usedMs: 0,
    breakUntil: 0,
    routine: [],
    birthdaySungYear: 0,
    skills: {},
    notices: [],
  };
}

type Ctx = {
  data: Data;
  setPinHash: (h: string) => void;
  addChild: (c: Child) => void;
  updateChild: (id: string, patch: Partial<Child> | ((c: Child) => Partial<Child>)) => void;
  removeChild: (id: string) => void;
  resetAll: () => void;
};

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data>(load);

  useEffect(() => {
    save(data);
  }, [data]);

  const setPinHash = useCallback((pinHash: string) => setData((d) => ({ ...d, pinHash })), []);
  const addChild = useCallback((c: Child) => setData((d) => ({ ...d, children: [...d.children, c] })), []);
  const updateChild = useCallback<Ctx['updateChild']>(
    (id, patch) =>
      setData((d) => ({
        ...d,
        children: d.children.map((c) => (c.id === id ? { ...c, ...(typeof patch === 'function' ? patch(c) : patch) } : c)),
      })),
    [],
  );
  const removeChild = useCallback((id: string) => setData((d) => ({ ...d, children: d.children.filter((c) => c.id !== id) })), []);
  const resetAll = useCallback(() => setData(EMPTY), []);

  const value = useMemo(() => ({ data, setPinHash, addChild, updateChild, removeChild, resetAll }), [data, setPinHash, addChild, updateChild, removeChild, resetAll]);
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error('useStore outside provider');
  return c;
}
