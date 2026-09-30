// Evidence applies to the specific description, not every possible regional association.
export const themes = ['all', 'people', 'food', 'music', 'dance', 'language', 'fashion', 'beliefs', 'craft', 'events'];

export const regions = {
  bandung: {
    id: 'bandung', name: 'Bandung', localName: 'Bandung', country: 'Indonesia', area: 'West Java',
    introduction: 'Begin with the people who make a place: its music, its craft, and the stories carried into everyday life.',
    focus: 'Sundanese culture, contemporary voices, and everyday city life.',
    officialGuide: { label: 'Bandung city government', url: 'https://bandung.go.id/' },
    music: { tradition: 'Start with angklung', contemporary: 'A contemporary Bandung artist',
      research: 'Choose a local traditional performer, a contemporary artist and a representative track. Record their connection to Bandung and obtain media permission before featuring them.' }
  },
  kanazawa: {
    id: 'kanazawa', name: 'Kanazawa', localName: '金沢', country: 'Japan', area: 'Ishikawa',
    introduction: 'Look beyond the itinerary. Follow the makers, performances, and neighbourhood stories that give a city its character.',
    focus: 'Craft traditions, performing arts, and present-day local culture.',
    officialGuide: { label: 'Visit Kanazawa — official guide', url: 'https://visitkanazawa.jp/en/' },
    music: { tradition: 'A traditional Kanazawa performance', contemporary: 'A contemporary Kanazawa artist',
      research: 'Research locally rooted traditional performers and contemporary artists. Verify regional connections and select licensed listening links before publication.' }
  }
};

export const sources = {
  'unesco-angklung': { id: 'unesco-angklung', title: 'Indonesian Angklung', publisher: 'UNESCO Intangible Cultural Heritage', url: 'https://ich.unesco.org/en/RL/indonesian-angklung-00393', accessed: '2026-09-30' },
  'kanazawa-yuzen': { id: 'kanazawa-yuzen', title: 'Kanazawa’s Kaga Yuzen: hand-painted kimono silks to dye for', publisher: 'Visit Kanazawa', url: 'https://visitkanazawa.jp/en/feature/detail_381.html', accessed: '2026-09-30' },
  'kanazawa-crafts': { id: 'kanazawa-crafts', title: 'Traditional Craft of Kanazawa', publisher: 'Visit Kanazawa', url: 'https://visitkanazawa.jp/en/crafts', accessed: '2026-09-30' }
};

export const entries = [
  { id: 'angklung', regionId: 'bandung', theme: 'music', title: 'Angklung: a shared sound',
    description: 'Bamboo tubes in a frame create the sound of this Indonesian musical instrument. UNESCO records its place in community customs and cultural identity.',
    scope: 'Indonesia. Bandung performer and venue research is still needed.', status: 'sourced',
    sourceIds: ['unesco-angklung'], artist: null, year: null, genre: 'Traditional', media: null },
  { id: 'bandung-contemporary', regionId: 'bandung', theme: 'music', title: 'The city’s contemporary voices',
    description: 'A space for a local artist and a featured song, with context connecting the work to the place.',
    scope: 'Bandung', status: 'research', sourceIds: [], artist: null, year: null, genre: null, media: null },
  { id: 'bandung-makers', regionId: 'bandung', theme: 'craft', title: 'Meet a Bandung maker',
    description: 'A proposed portrait of a local craftsperson: their materials, process and relationship to the city.',
    scope: 'Bandung', status: 'research', sourceIds: [], artist: null, year: null, genre: null, media: null },
  { id: 'bandung-food', regionId: 'bandung', theme: 'food', title: 'A recipe, and the person behind it',
    description: 'A proposed community story about a dish, with the contributor’s own account and regional context.',
    scope: 'Bandung', status: 'research', sourceIds: [], artist: null, year: null, genre: null, media: null },
  { id: 'kaga-yuzen', regionId: 'kanazawa', theme: 'craft', title: 'Kaga Yuzen: colour carried on silk',
    description: 'Explore Kanazawa’s tradition of hand-painted kimono silks through the city’s official cultural guide.',
    scope: 'Kanazawa', status: 'sourced', sourceIds: ['kanazawa-yuzen'], artist: null, year: null, genre: null, media: null },
  { id: 'kanazawa-gold-leaf', regionId: 'kanazawa', theme: 'craft', title: 'An introduction to gold leaf',
    description: 'The official Kanazawa craft guide includes gold leaf among the city’s craft traditions.',
    scope: 'Kanazawa', status: 'sourced', sourceIds: ['kanazawa-crafts'], artist: null, year: null, genre: null, media: null },
  { id: 'kanazawa-traditional', regionId: 'kanazawa', theme: 'music', title: 'Listen to a local tradition',
    description: 'A space for a traditional performer, with context explaining the performance and its local roots.',
    scope: 'Kanazawa', status: 'research', sourceIds: [], artist: null, year: null, genre: 'Traditional', media: null },
  { id: 'kanazawa-contemporary', regionId: 'kanazawa', theme: 'music', title: 'A new voice from Kanazawa',
    description: 'A space for a contemporary artist and featured track, alongside the region’s traditional performers.',
    scope: 'Kanazawa', status: 'research', sourceIds: [], artist: null, year: null, genre: null, media: null }
];

export const businessCategories = ['Artisans & makers', 'Performers & artists', 'Food & hospitality', 'Guides & experiences', 'Cultural organisations'];

export function getEntries(regionId, theme = 'all', sort = 'title') {
  const result = entries.filter(entry => entry.regionId === regionId && (theme === 'all' || entry.theme === theme));
  const key = ['title', 'artist', 'year', 'genre'].includes(sort) ? sort : 'title';
  return result.sort((a, b) => {
    const av = a[key], bv = b[key];
    if (av == null && bv == null) return a.title.localeCompare(b.title);
    if (av == null) return 1;
    if (bv == null) return -1;
    return key === 'year' ? bv - av : String(av).localeCompare(String(bv)) || a.title.localeCompare(b.title);
  });
}

export function parseRoute(hash = '') {
  const [region, audience, theme] = hash.replace(/^#/, '').split('/');
  return { regionId: Object.hasOwn(regions, region) ? region : 'bandung', audience: audience === 'business' ? 'business' : 'visitor', theme: themes.includes(theme) ? theme : 'all' };
}
