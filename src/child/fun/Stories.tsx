import { useState } from 'react';
import { useChild } from '../context';
import { BuddySays } from '../../components/Buddy';
import { Dots, Pic } from '../../components/Bits';
import { Finished } from '../games/GameKit';
import type { Band } from '../../lib/age';

type Story = { id: string; title: string; art: string; bands?: Band[]; pages: { art: string; text: string }[] };

// Social stories: short, literal, first-person, so new things feel known before they happen
const STORIES: Story[] = [
  {
    id: 'dentist',
    title: 'Going to the dentist',
    art: 'tooth',
    bands: ['little', 'explorers', 'builders'],
    pages: [
      { art: 'tooth', text: 'Sometimes I go to the dentist. The dentist helps keep my teeth healthy.' },
      { art: 'seat', text: 'I might wait in a waiting room first. I can bring a book or a toy.' },
      { art: 'seat', text: 'Then I sit in a big chair. The chair can move up and lean back. That is okay.' },
      { art: 'sun', text: 'There is a bright light, so the dentist can see. I can close my eyes if I like.' },
      { art: 'tooth', text: 'The dentist counts my teeth with a little mirror. It does not hurt.' },
      { art: 'sparkles', text: 'When it is finished, I can go home. I was brave and my teeth are healthy.' },
    ],
  },
  {
    id: 'haircut',
    title: 'Getting a haircut',
    art: 'barber-pole',
    bands: ['little', 'explorers', 'builders'],
    pages: [
      { art: 'barber-pole', text: 'When my hair gets long, I go and get it cut.' },
      { art: 'seat', text: 'I sit in a special chair. It might go up and down.' },
      { art: 'scissors', text: 'The hairdresser uses scissors or clippers. Clippers buzz. The buzzing is just a noise.' },
      { art: 'droplet', text: 'Sometimes they spray a little water on my hair. It might feel cold.' },
      { art: 'hugging-face', text: 'If I need a break, I can say "stop, please". That is allowed.' },
      { art: 'sparkles', text: 'When it is finished, my hair is shorter and tidy. I did it!' },
    ],
  },
  {
    id: 'school',
    title: 'Starting a new school',
    art: 'school',
    bands: ['little', 'explorers'],
    pages: [
      { art: 'school', text: 'Soon I will go to a new school. New places can feel strange at first.' },
      { art: 'backpack', text: 'I will pack my bag the night before, so I am ready.' },
      { art: 'house', text: 'A grown-up will take me to the school and show me where to go.' },
      { art: 'books', text: 'My teacher will tell me what to do. If I do not understand, I can ask.' },
      { art: 'red-apple', text: 'There is a time for lunch and a time to play.' },
      { art: 'hugging-face', text: 'Each day it will feel a little more normal. Grown-ups at school are there to help me.' },
    ],
  },
  {
    id: 'secondary',
    title: 'Moving up to secondary school',
    art: 'backpack',
    bands: ['builders'],
    pages: [
      { art: 'school', text: 'Secondary school is bigger than primary school. Lots of people feel nervous at first. That is normal.' },
      { art: 'books', text: 'I will have a timetable. It shows which lesson is next and which room it is in.' },
      { art: 'alarm-clock', text: 'A bell rings when lessons change. Everyone moves to a new room. I can follow my timetable or ask a teacher.' },
      { art: 'backpack', text: 'I pack my bag the night before, using my timetable, so I have the right books.' },
      { art: 'hugging-face', text: 'Every class has a form tutor. If I feel lost or worried, I can tell my form tutor.' },
      { art: 'sparkles', text: 'After a few weeks, the corridors and the bells will feel normal. I will have done it.' },
    ],
  },
  {
    id: 'interview',
    title: 'Going to an interview',
    art: 'seat',
    bands: ['ready'],
    pages: [
      { art: 'books', text: 'Before the interview, I find out a little about the place. I think about why I want to go there.' },
      { art: 't-shirt', text: 'I wear clean, tidy clothes. I plan my journey and aim to arrive 10 minutes early.' },
      { art: 'hugging-face', text: 'When I arrive, I say who I am and that I have an interview. Then I wait.' },
      { art: 'seat', text: 'The interviewer asks questions. I can take a moment to think before I answer. That is allowed.' },
      { art: 'hugging-face', text: 'If I do not understand a question, I can say, "Could you say that another way, please?"' },
      { art: 'sparkles', text: 'At the end, I say thank you. Whatever happens, every interview is good practice.' },
    ],
  },
  {
    id: 'firstjob',
    title: 'My first day at work',
    art: 'house',
    bands: ['ready'],
    pages: [
      { art: 'alarm-clock', text: 'On my first day, I get there on time. A manager or a colleague will show me around.' },
      { art: 'books', text: 'There will be lots of new things to remember. I can write notes on my phone or in a notebook.' },
      { art: 'hugging-face', text: 'Nobody expects me to know everything on day one. Asking questions shows I want to get it right.' },
      { art: 'red-apple', text: 'I will have a break. I can ask when it is and where people go.' },
      { art: 'sparkles', text: 'At the end of the day, I can be proud. The first day is the hardest, and I did it.' },
    ],
  },
];
export function Stories() {
  const { child, band } = useChild();
  const list = STORIES.filter((x) => !x.bands || x.bands.includes(band));
  const [story, setStory] = useState<Story | null>(null);
  const [page, setPage] = useState(0);
  const [finished, setFinished] = useState(false);

  if (finished && story)
    return (
      <Finished
        activityId="stories"
        stars={1}
        onAgain={() => {
          setFinished(false);
          setStory(null);
          setPage(0);
        }}
      />
    );

  if (!story)
    return (
      <div className="screen">
        <BuddySays buddyId={child.buddyId} size="small" text="Which story shall I read to you?" />
        <div className="tiles">
          {list.map((s) => (
            <button key={s.id} className="tile story" onClick={() => setStory(s)}>
              <Pic name={s.art} size={76} />
              {s.title}
            </button>
          ))}
        </div>
      </div>
    );

  const p = story.pages[page];
  const last = page === story.pages.length - 1;
  return (
    <div className="screen">
      <BuddySays buddyId={child.buddyId} size="small" text={p.text} />
      <div className="stage" style={{ background: 'var(--honey-pale)', boxShadow: 'none' }}>
        <h2>{story.title}</h2>
        <Pic name={p.art} size={150} />
        <p className="story-text">{p.text}</p>
        <Dots total={story.pages.length} done={page + 1} />
        <button className="btn go big wide" onClick={() => (last ? setFinished(true) : setPage(page + 1))}>
          {last ? 'The end' : 'Next page'}
        </button>
        {page > 0 && (
          <button className="btn quiet" onClick={() => setPage(page - 1)}>
            Go back a page
          </button>
        )}
      </div>
    </div>
  );
}
