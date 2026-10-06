export const navigation = [
  { label: 'Designs', href: '#designs' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Occasions', href: '#occasions' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];
export const designs = [
  {
    id: 'birthday',
    number: '01',
    name: 'Birthday',
    title: 'Another trip around the sun.',
    description: 'Make their day impossible to forget.',
    color: '#f20c95',
    ink: '#292b1c',
    sampleName: 'CHRISTOPHER',
    sampleAge: '18',
    sampleMessage: 'NOW YOU HAVE THE FREEDOM!',
  },
  {
    id: 'name-day',
    number: '02',
    name: 'Name day',
    title: 'A name worth celebrating.',
    description: 'A small occasion. A big smile.',
    color: '#c5acf2',
    ink: '#38244f',
    sampleName: 'SOPHIE',
    sampleAge: '',
    sampleMessage: 'A LITTLE SOMETHING. JUST FOR YOU.',
  },
  {
    id: 'friends',
    number: '03',
    name: 'Best friends',
    title: 'Partners in absolutely everything.',
    description: 'For the person who knows too much.',
    color: '#f39563',
    ink: '#7d2535',
    sampleName: 'BESTIE',
    sampleAge: '',
    sampleMessage: 'LIFE IS BETTER WITH YOU.',
  },
  {
    id: 'anniversary',
    number: '04',
    name: 'Anniversary',
    title: 'To us. And everything ahead.',
    description: 'Your story, wrapped around a can.',
    color: '#e980a1',
    ink: '#69234b',
    sampleName: 'YOU + ME',
    sampleAge: '',
    sampleMessage: 'SAME TIME. NEXT LIFETIME.',
  },
] as const;
export type DesignId = (typeof designs)[number]['id'];
export const occasions = [
  { name: 'Birthdays', note: 'Another year. An original gift.', design: 'birthday' },
  { name: 'Love', note: 'Say the thing. Make it theirs.', design: 'anniversary' },
  { name: 'Best friends', note: 'Inside jokes belong on the outside.', design: 'friends' },
  { name: 'Weddings', note: 'A little keepsake of a very big day.', design: 'anniversary' },
  { name: 'Thank you', note: 'A small gesture that says a lot.', design: 'name-day' },
  { name: 'Anniversaries', note: 'Here’s to your next chapter.', design: 'anniversary' },
  { name: 'Just because', note: 'You don’t always need a reason.', design: 'friends' },
];
export const lifestyle = {
  // Generated editorial placeholders, not customer photography. See ASSETS.md.
  main: {
    src: import.meta.env.BASE_URL + 'images/lifestyle/gift-placeholder.webp',
    alt: 'Illustrative birthday scene: one friend gives another a graffiti birthday can beside a birthday cake',
  },
  secondary: {
    src: import.meta.env.BASE_URL + 'images/lifestyle/together-placeholder.webp',
    alt: 'Illustrative wedding scene: a couple toasts with sunset anniversary slim cans in a garden',
  },
};
