// Talks to Buddy Brain, the safe AI server.
export const BRAIN_URL = 'https://buddy-brain-production.up.railway.app';
const TOKEN_KEY = 'learning-buddy-token';

export function getToken(): string {
  try {
    const t = localStorage.getItem(TOKEN_KEY) || '';
    const exp = Number(t.split('.')[0]);
    return exp > Date.now() ? t : '';
  } catch {
    return '';
  }
}

function setToken(t: string) {
  try {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export async function login(password: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const r = await fetch(`${BRAIN_URL}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
    const d = await r.json();
    if (r.ok && d.token) {
      setToken(d.token);
      return { ok: true };
    }
    return { ok: false, error: d.error || "That password isn't right." };
  } catch {
    return { ok: false, error: "Can't reach the server. Check your internet connection and try again." };
  }
}

export type Turn = { role: 'child' | 'buddy'; text: string };
export type Safety = 'none' | 'worried' | 'danger';
export type AskResult = { reply: string; safety: Safety; harmAtHome: boolean } | { error: 'signed-out' | 'busy' | 'offline' | 'unavailable' };

export async function ask(p: {
  nickname: string;
  band: string;
  buddyName: string;
  buddyKind: string;
  mode: 'chat' | 'interview';
  history: Turn[];
  message: string;
}): Promise<AskResult> {
  try {
    const r = await fetch(`${BRAIN_URL}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(p),
    });
    const d = await r.json();
    if (r.status === 401) {
      setToken('');
      return { error: 'signed-out' };
    }
    if (r.status === 429) return { error: 'busy' };
    if (!r.ok || !d.reply) return { error: 'unavailable' };
    return { reply: d.reply, safety: d.safety, harmAtHome: !!d.harm_at_home };
  } catch {
    return { error: 'offline' };
  }
}
