// Stand-in buddies (Microsoft Fluent 3D art, MIT licence) until the commissioned illustrations arrive.
export type BuddyKind = { id: string; kind: string; art: string; suggested: string };

export const BUDDIES: BuddyKind[] = [
  { id: 'puppy', kind: 'Puppy', art: 'dog-face', suggested: 'Biscuit' },
  { id: 'kitten', kind: 'Kitten', art: 'cat-face', suggested: 'Pickle' },
  { id: 'bunny', kind: 'Bunny', art: 'rabbit-face', suggested: 'Clover' },
  { id: 'panda', kind: 'Panda', art: 'panda', suggested: 'Bamboo' },
  { id: 'fox', kind: 'Fox', art: 'fox', suggested: 'Maple' },
  { id: 'owl', kind: 'Owl', art: 'owl', suggested: 'Hoot' },
];

export const buddyById = (id: string) => BUDDIES.find((b) => b.id === id) ?? BUDDIES[0];

export const art = (name: string) => `${import.meta.env.BASE_URL}art/${name}.png`;
