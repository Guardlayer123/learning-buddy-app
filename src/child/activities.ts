import type { ComponentType } from 'react';
import type { Band } from '../lib/age';
import { TimeGame } from './games/TimeGame';
import { AddGame } from './games/AddGame';
import { SoundsGame } from './games/SoundsGame';
import { CountGame, FirstSoundGame } from './games/LittleGames';
import { TimesGame, MoneyGame } from './games/BuilderGames';
import { TeethLesson, HandsLesson, LacesLesson, DressedLesson, SandwichLesson, ButtonLesson } from './life/Lessons';
import { BudgetGame, FormPractice, CVBuilder, RevisionTimer } from './ready/ReadyTools';
import { Calm } from './calm/Calm';
import { Feelings } from './calm/Feelings';
import { NowNext } from './calm/NowNext';
import { Stories } from './fun/Stories';
import { Jokes } from './fun/Jokes';
import { Mission } from './fun/Mission';
import { Ask, Interview } from './ask/Ask';

export type Group = 'ask' | 'learn' | 'life' | 'calm' | 'story';

export type Activity = { id: string; name: string; art: string; group: Group; bands: Band[]; Screen: ComponentType };

const ALL: Band[] = ['little', 'explorers', 'builders', 'ready'];

export const ACTIVITIES: Activity[] = [
  { id: 'ask', name: 'Ask me anything', art: 'hugging-face', group: 'ask', bands: ALL, Screen: Ask },

  { id: 'count', name: 'Counting', art: 'duck', group: 'learn', bands: ['little'], Screen: CountGame },
  { id: 'firstsounds', name: 'First sounds', art: 'sun', group: 'learn', bands: ['little'], Screen: FirstSoundGame },
  { id: 'sounds', name: 'Letter sounds', art: 'books', group: 'learn', bands: ['explorers'], Screen: SoundsGame },
  { id: 'adding', name: 'Adding up', art: 'red-apple', group: 'learn', bands: ['explorers'], Screen: AddGame },
  { id: 'time', name: 'Telling the time', art: 'alarm-clock', group: 'learn', bands: ['explorers', 'builders'], Screen: TimeGame },
  { id: 'times', name: 'Times tables', art: 'pencil', group: 'learn', bands: ['builders'], Screen: TimesGame },
  { id: 'money', name: 'Money and change', art: 'star', group: 'learn', bands: ['builders'], Screen: MoneyGame },
  { id: 'revision', name: 'Revision timer', art: 'books', group: 'learn', bands: ['ready'], Screen: RevisionTimer },
  { id: 'interview', name: 'Interview practice', art: 'seat', group: 'learn', bands: ['ready'], Screen: Interview },

  { id: 'teeth', name: 'Brush teeth', art: 'toothbrush', group: 'life', bands: ['little', 'explorers'], Screen: TeethLesson },
  { id: 'hands', name: 'Wash hands', art: 'soap', group: 'life', bands: ['little', 'explorers'], Screen: HandsLesson },
  { id: 'dressed', name: 'Get dressed', art: 't-shirt', group: 'life', bands: ['little', 'explorers'], Screen: DressedLesson },
  { id: 'laces', name: 'Tie laces', art: 'running-shoe', group: 'life', bands: ['explorers', 'builders'], Screen: LacesLesson },
  { id: 'sandwich', name: 'Make a sandwich', art: 'bread', group: 'life', bands: ['builders'], Screen: SandwichLesson },
  { id: 'button', name: 'Sew on a button', art: 'scissors', group: 'life', bands: ['builders'], Screen: ButtonLesson },
  { id: 'budget', name: 'Budget a week', art: 'wrapped-gift', group: 'life', bands: ['ready'], Screen: BudgetGame },
  { id: 'forms', name: 'Fill in a form', art: 'pencil', group: 'life', bands: ['ready'], Screen: FormPractice },
  { id: 'cv', name: 'Build my CV', art: 'trophy', group: 'life', bands: ['ready'], Screen: CVBuilder },

  { id: 'calm', name: 'Calm corner', art: 'tulip', group: 'calm', bands: ALL, Screen: Calm },
  { id: 'feelings', name: 'How I feel', art: 'sun-behind-cloud', group: 'calm', bands: ALL, Screen: Feelings },
  { id: 'nownext', name: 'Now & Next', art: 'house', group: 'calm', bands: ALL, Screen: NowNext },

  { id: 'stories', name: 'Ready for new things', art: 'school', group: 'story', bands: ALL, Screen: Stories },
  { id: 'jokes', name: 'Joke time', art: 'party-popper', group: 'story', bands: ['little', 'explorers', 'builders'], Screen: Jokes },
  { id: 'mission', name: "Today's mission", art: 'trophy', group: 'story', bands: ['explorers', 'builders', 'ready'], Screen: Mission },
];

export const ACTIVITY_NAMES: Record<string, string> = Object.fromEntries(ACTIVITIES.map((a) => [a.id, a.name]));

export const GROUP_NAMES: Record<Group, string> = {
  ask: 'Ask',
  learn: 'Learn',
  life: 'Everyday skills',
  calm: 'Feel calm',
  story: 'Stories and fun',
};
