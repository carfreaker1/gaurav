const photos = import.meta.glob('../assets/*.jpg', { eager: true, query: '?url', import: 'default' });
const videos = import.meta.glob('../assets/*.mp4', { eager: true, query: '?url', import: 'default' });
const photo = (name) => photos['../assets/' + name];
export const content = {
  name: 'Gaurav',
  birthday: { day: 30, month: 9, startYear: 2026, timeZone: 'Asia/Kolkata' },
  heroLines: ['Out of the', 'ordinary'],
  heroDescription: 'Good company. A little ambition. And a life worth looking back on. Welcome to my world.',
  lifestyleTitle: ['Not a highlight reel.', 'A way of life.'],
  scrollWords: ['GAURAV / DRIVE', 'STYLE / MOMENTS', 'ENERGY / MEMORIES'],
  birthdayWish: 'Another year. Another chapter. Here\u2019s to the people, the places, and the memories still to come.',

  date: '30 · 09 · 2026',
  shortDate: '30.09.26',
  edition: 'September 30, 2026',
  headline: 'A life in motion.',
  introLines: ['Another year.', 'Another story.'],
  galleryTitle: 'More than moments',
  socialTitle: ['Life, beyond', 'the frame'],
  birthdayHeadline: 'TODAY IS YOUR DAY.',
  introCopy: 'Here’s to the roads less travelled. The people who make it worthwhile. And the moments that become a part of you.',
  instagram: { handle: '@vip_gaurav_01', url: 'https://www.instagram.com/vip_gaurav_01/' },
  creator: { handle: '@carfreaker1', url: 'https://www.instagram.com/carfreaker1' },
  portrait: photo('best_pic.jpg'),
  messageTitleLines: ['For the memories', 'still to come.'],
  message: 'Here’s to another year of chasing what moves you. To late nights, open roads, and the people who make every mile worth it. May this next chapter bring you more of everything you love — and a few beautiful surprises along the way.\n\nHappy birthday, Gaurav. The best is still ahead.',
  messageSignature: 'With love. Always.',
  gallery: [
    { title: 'DRIVE', subtitle: 'Find your own direction.', image: photo('vip_gaurav_01_1747301243_3632948604203035740_52152715795.jpg') },
    { title: 'STYLE', subtitle: 'Make every day your own.', image: photo('vip_gaurav_01_1740570399_3576486192378047715_52152715795.jpg') },
    { title: 'MOMENTS', subtitle: 'The ones worth keeping.', image: photo('vip_gaurav_01_1759206904_3732820528014138512_52152715795.jpg') },
    { title: 'ENERGY', subtitle: 'Keep the feeling alive.', image: photo('vip_gaurav_01_1779556014_3903520822462730240_52152715795.jpg'), video: Object.values(videos)[0] },
    { title: 'MEMORIES', subtitle: 'Some things stay with you.', image: photo('vip_gaurav_01_1784395667_3944118788604647671_52152715795.jpg'), video: Object.values(videos)[1] },
  ],
};
