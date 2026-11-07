// Picture cards for the Now & Next board
export type Card = { id: string; label: string; art: string };

export const CARDS: Card[] = [
  { id: 'dressed', label: 'Get dressed', art: 't-shirt' },
  { id: 'breakfast', label: 'Breakfast', art: 'bowl-with-spoon' },
  { id: 'teeth', label: 'Brush teeth', art: 'toothbrush' },
  { id: 'hands', label: 'Wash hands', art: 'soap' },
  { id: 'shoes', label: 'Shoes on', art: 'running-shoe' },
  { id: 'bag', label: 'Pack school bag', art: 'backpack' },
  { id: 'school', label: 'Go to school', art: 'school' },
  { id: 'home', label: 'Home time', art: 'house' },
  { id: 'snack', label: 'Snack', art: 'red-apple' },
  { id: 'reading', label: 'Reading', art: 'books' },
  { id: 'homework', label: 'Homework', art: 'pencil' },
  { id: 'play', label: 'Playtime', art: 'teddy-bear' },
  { id: 'outside', label: 'Play outside', art: 'kite' },
  { id: 'car', label: 'Car journey', art: 'automobile' },
  { id: 'bus', label: 'Bus journey', art: 'bus' },
  { id: 'dinner', label: 'Dinner', art: 'bread' },
  { id: 'bath', label: 'Bath', art: 'bathtub' },
  { id: 'shower', label: 'Shower', art: 'shower' },
  { id: 'bed', label: 'Bed', art: 'bed' },
  { id: 'doctor', label: 'Doctor', art: 'hospital' },
  { id: 'haircut', label: 'Haircut', art: 'barber-pole' },
  { id: 'drawing', label: 'Drawing', art: 'crayon' },
];

export const cardById = (id: string) => CARDS.find((c) => c.id === id) ?? CARDS[0];
