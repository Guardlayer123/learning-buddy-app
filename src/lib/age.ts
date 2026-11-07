export type Band = 'little' | 'explorers' | 'builders' | 'ready';

export const BANDS: Record<Band, { name: string; ages: string }> = {
  little: { name: 'Little Steps', ages: '3–5' },
  explorers: { name: 'Explorers', ages: '6–8' },
  builders: { name: 'Builders', ages: '9–12' },
  ready: { name: 'Ready for Life', ages: '13–16' },
};

export function ageFrom(dob: string, now = new Date()): number {
  const d = new Date(dob + 'T12:00:00');
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

export function bandFor(age: number): Band {
  if (age <= 5) return 'little';
  if (age <= 8) return 'explorers';
  if (age <= 12) return 'builders';
  return 'ready';
}

export function isBirthday(dob: string, now = new Date()): boolean {
  const d = new Date(dob + 'T12:00:00');
  return d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}
