// Buddy Brain: the safe AI behind "Ask the buddy".
// Runs as a Railway Function (Bun). No chats are stored here.
//
// Variables (set in Railway):
//   ANTHROPIC_API_KEY  the AI key (referenced from willsorted-server)
//   TEST_PASSWORD      the one shared tester password (set by James, never shown in the app)
//   TOKEN_SECRET       long random string used to sign tester sessions
//   ALLOWED_ORIGINS    comma-separated sites allowed to call this server
//   MODEL              optional, defaults to claude-sonnet-5-5

const MODEL = Bun.env.MODEL || 'claude-sonnet-5-5';
const ORIGINS = (Bun.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
const enc = new TextEncoder();

// ---------- helpers ----------
function cors(origin: string | null): Record<string, string> {
  const ok = origin && (ORIGINS.includes(origin) || ORIGINS.includes('*'));
  return {
    'Access-Control-Allow-Origin': ok ? origin! : ORIGINS[0] || 'null',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(body: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...cors(origin) },
  });
}

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(Bun.env.TOKEN_SECRET || ''), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return Buffer.from(sig).toString('base64url');
}

function sameText(a: string, b: string) {
  const x = enc.encode(a);
  const y = enc.encode(b);
  if (x.length !== y.length) return false;
  let d = 0;
  for (let i = 0; i < x.length; i++) d |= x[i] ^ y[i];
  return d === 0;
}

async function makeToken() {
  const exp = Date.now() + 30 * 86_400_000;
  return `${exp}.${await hmac(`tester.${exp}`)}`;
}

async function tokenOk(auth: string | null) {
  const t = (auth || '').replace(/^Bearer /, '');
  const [exp, sig] = t.split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return sameText(sig, await hmac(`tester.${exp}`));
}

// Simple per-address limits, held in memory
const hits = new Map<string, number[]>();
function limited(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const list = (hits.get(key) || []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) hits.clear();
  return list.length > max;
}

// Personal details are removed before anything reaches the AI
function redact(text: string) {
  return text
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[email removed]')
    .replace(/(\+?\d[\d\s-]{8,}\d)/g, '[number removed]')
    .replace(/\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/gi, '[postcode removed]');
}

// Words that always count as serious, whatever the AI says
const DANGER = [
  /\b(kill|hurt|harm|cut)\s+(my ?self|myself)\b/i,
  /\b(want|wanna|going) to die\b/i,
  /\bsuicid/i,
  /\bself[- ]?harm/i,
  /\bend (it all|my life)\b/i,
  /\b(touch(ed|es|ing)?|touchy)\b.*\b(private|privates|down there|where i don'?t like|i didn'?t want)\b/i,
  /\b(keep|our) (it )?(a )?secret\b.*\b(adult|man|woman|grown|uncle|older)\b/i,
  /\b(adult|man|woman|older (boy|girl|person)|stranger)\b.*\b(secret|send (me )?(a )?(pic|photo)|meet (up|me))\b/i,
  /\b(hits|hit|beats|beat|kicks|punches|hurts) me\b/i,
  /\b(abus(e|ed|ing))\b/i,
  /\bsend (me )?(nudes|naked)\b/i,
];
const WORRY = [/\bbull(y|ied|ies|ying)\b/i, /\b(scared|frightened|afraid|lonely|nobody likes me|no friends|hate myself|sad all the time)\b/i];

const BAND_STYLE: Record<string, string> = {
  little: 'The child is 3 to 5. Use very short sentences of 3 to 8 words. One idea at a time. Simple, concrete words only.',
  explorers: 'The child is 6 to 8. Use short, simple sentences. Explain one step at a time with everyday examples.',
  builders: 'The child is 9 to 12. Use clear, friendly language. You can explain a little more, still step by step.',
  ready: 'The young person is 13 to 16. Talk to them with respect, like a calm, knowledgeable coach. Not babyish.',
};

function systemPrompt(p: { nickname: string; band: string; buddyName: string; buddyKind: string; mode: string }) {
  const base = `You are ${p.buddyName}, a kind ${p.buddyKind.toLowerCase()} who is a learning buddy in a children's learning app made in the UK. You are talking with ${p.nickname}. ${BAND_STYLE[p.band] ?? BAND_STYLE.explorers}

How you talk:
- Always write in British English (colour, mum, maths, favourite, practise as a verb). Use UK school terms (Year 4, GCSE, primary and secondary school, rubber, pounds and pence).
- Many children using this app are autistic or have ADHD. Be calm, warm and literal. Avoid sarcasm, idioms and vague phrases; if you use a figure of speech, explain it. Keep replies short: 1 to 4 sentences, or a short numbered list for steps. No emojis, no markdown headings, no bold.
- Never pressure. Offer choices ("Would you like to try...?"). Mistakes are fine and normal.
- For homework, help them think it through with hints and questions; don't just hand over full answers to work they're meant to do themselves.

Your boundaries:
- You are a learning buddy, not a friend or a parent. If they say you're their best or only friend, be warm but encourage real friends and family: suggest one small, easy step towards a real person.
- Never ask for or repeat personal details (surname, address, school name, phone number, passwords, photos). If they share them, kindly say not to share those online.
- Never suggest meeting anyone, keeping secrets from grown-ups, or contacting anyone except trusted adults, Childline (0800 1111) or 999 in an emergency.
- Grown-up topics (sex, relationships beyond simple friendship, drugs, alcohol, violence detail, scary or gory content): don't go into them. Gently say that's a good question for a grown-up they trust.
- Health, medicine, diagnoses: you are not a doctor. Suggest asking a parent, carer, teacher or doctor. Never diagnose.
- Religion and politics: only if they ask. Then explain fairly what different people believe, with no favourites and no judgement.
- If you don't know or aren't sure, say so honestly.

Keeping them safe:
- If they mention being hurt, touched in a way they didn't like, an adult asking for secrets or photos, bullying, feeling like they want to hurt themselves or not be alive, or being in danger: stay calm and kind, say it's not their fault and they were right to say something, tell them to tell a grown-up they trust as soon as they can, and give Childline 0800 1111 (free, any time). If they're in danger right now, say to call 999.
- Never promise to keep a secret.`;

  const interview =
    p.mode === 'interview'
      ? `

Right now you are helping ${p.nickname} practise for a job, college or apprenticeship interview. Act as a friendly interviewer: ask one common interview question at a time, wait for their answer, then give one specific positive comment and one small tip, then ask the next question. Keep it encouraging.`
      : '';

  const output = `

Reply ONLY with a JSON object, no other text, in this exact shape:
{"reply": "what you say to the child", "safety": "none" | "worried" | "danger", "harm_at_home": true | false}
- safety "danger": abuse, grooming, being touched inappropriately, being hit or hurt by someone, self-harm or suicidal feelings, or immediate danger.
- safety "worried": bullying, feeling very sad, scared, lonely or anxious, but no immediate danger.
- harm_at_home: true only if the danger seems to come from someone they live with.`;

  return base + interview + output;
}

type Turn = { role: 'child' | 'buddy'; text: string };

async function askAI(body: any) {
  const nickname = String(body.nickname || 'friend').slice(0, 20);
  const band = ['little', 'explorers', 'builders', 'ready'].includes(body.band) ? body.band : 'explorers';
  const buddyName = String(body.buddyName || 'Buddy').slice(0, 14);
  const buddyKind = String(body.buddyKind || 'animal').slice(0, 14);
  const mode = body.mode === 'interview' ? 'interview' : 'chat';
  const message = redact(String(body.message || '').slice(0, 500)).trim();
  const history: Turn[] = Array.isArray(body.history) ? body.history.slice(-10) : [];

  if (!message) return { reply: 'I’m listening. What would you like to ask?', safety: 'none', harm_at_home: false };

  const messages: { role: 'user' | 'assistant'; content: string }[] = [];
  for (const t of history) {
    const text = redact(String(t?.text || '').slice(0, 600));
    if (!text) continue;
    const role = t.role === 'buddy' ? 'assistant' : 'user';
    if (messages.length && messages[messages.length - 1].role === role) messages[messages.length - 1].content += '\n' + text;
    else messages.push({ role, content: role === 'assistant' ? JSON.stringify({ reply: text, safety: 'none', harm_at_home: false }) : text });
  }
  while (messages.length && messages[0].role !== 'user') messages.shift();
  if (messages.length && messages[messages.length - 1].role === 'user') messages[messages.length - 1].content += '\n' + message;
  else messages.push({ role: 'user', content: message });

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': Bun.env.ANTHROPIC_API_KEY || '',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({ model: MODEL, max_tokens: 500, system: systemPrompt({ nickname, band, buddyName, buddyKind, mode }), messages }),
  });
  if (!res.ok) {
    console.error('AI error', res.status, (await res.text()).slice(0, 300));
    throw new Error('ai');
  }
  const data: any = await res.json();
  const raw: string = (data.content || []).map((c: any) => c.text || '').join('').trim();

  let out = { reply: '', safety: 'none', harm_at_home: false };
  try {
    const m = raw.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(m ? m[0] : raw);
    out = {
      reply: String(parsed.reply || '').slice(0, 1200),
      safety: ['none', 'worried', 'danger'].includes(parsed.safety) ? parsed.safety : 'none',
      harm_at_home: parsed.harm_at_home === true,
    };
  } catch {
    out.reply = raw.replace(/[{}"]/g, '').slice(0, 1200);
  }

  // The word screen can only raise the level, never lower it
  if (DANGER.some((r) => r.test(message))) out.safety = 'danger';
  else if (out.safety === 'none' && WORRY.some((r) => r.test(message))) out.safety = 'worried';
  if (!out.reply) out.reply = "Let's ask a grown-up you trust about that one.";

  console.log(JSON.stringify({ at: new Date().toISOString(), band, mode, safety: out.safety })); // no chat text is logged
  return out;
}

Bun.serve({
  port: Number(Bun.env.PORT || 3000),
  async fetch(req, server) {
    const url = new URL(req.url);
    const origin = req.headers.get('origin');
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || server.requestIP(req)?.address || 'unknown';

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) });
    if (url.pathname === '/health') return json({ ok: true }, 200, origin);

    if (req.method === 'POST' && url.pathname === '/login') {
      if (limited(`login:${ip}`, 8, 15 * 60_000)) return json({ error: 'Too many tries. Wait 15 minutes, then try again.' }, 429, origin);
      const body: any = await req.json().catch(() => ({}));
      const pass = String(body.password || '');
      if (!Bun.env.TEST_PASSWORD || !Bun.env.TOKEN_SECRET) return json({ error: 'The test password has not been set up yet.' }, 503, origin);
      if (!sameText(pass, Bun.env.TEST_PASSWORD)) return json({ error: "That password isn't right." }, 401, origin);
      return json({ token: await makeToken() }, 200, origin);
    }

    if (req.method === 'POST' && url.pathname === '/ask') {
      if (!(await tokenOk(req.headers.get('authorization')))) return json({ error: 'signed-out' }, 401, origin);
      if (limited(`ask:${ip}`, 40, 10 * 60_000)) return json({ error: 'busy' }, 429, origin);
      const body = await req.json().catch(() => ({}));
      try {
        return json(await askAI(body), 200, origin);
      } catch {
        return json({ error: 'unavailable' }, 502, origin);
      }
    }

    return json({ error: 'not found' }, 404, origin);
  },
});

console.log('Buddy Brain listening');
