import test from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import { entries, getEntries, parseRoute, regions, sources, eventState, melbourneToday } from '../src/data.js';
import { entryCard, collectionNavigation, melbourneOverview, listeningRoom, acknowledgementOfCountry } from '../src/archive-view.js';

const route = (state, updates = {}) => {
  const next = { ...state, ...updates };
  return `#${next.regionId}/${next.audience}/${next.theme}${next.kind === 'all' ? '' : `/${next.kind}`}`;
};

test('Melbourne collection routes combine kind and theme without leaking other regions', () => {
  assert.deepEqual(parseRoute('#melbourne/visitor/art/artist'), { regionId:'melbourne', audience:'visitor', theme:'art', kind:'artist' });
  assert.equal(parseRoute('#melbourne/visitor/all/unknown').kind, 'all');
  assert.equal(parseRoute('#kanazawa/visitor/all/artist').kind, 'all');
  for (const kind of ['festival','artist','place']) {
    const collection = getEntries('melbourne','all','title',kind);
    assert.ok(collection.length > 0);
    assert.ok(collection.every(item => item.regionId === 'melbourne' && item.kind === kind));
  }
  assert.deepEqual(getEntries('melbourne','music','title','place'), []);
  assert.ok(getEntries('melbourne','art','title','artist').every(item => item.kind === 'artist' && item.theme === 'art'));
  for (const entry of getEntries('melbourne')) {
    assert.ok(entry.sourceIds.length);
    assert.ok(entry.scope && entry.location && entry.website);
    for (const sourceId of entry.sourceIds) assert.equal(sources[sourceId].accessed, '2026-10-11');
    if (entry.kind === 'festival') {
      assert.ok(entry.event.start <= entry.event.end);
      assert.equal(entry.event.timezone, 'Australia/Melbourne');
    }
  }
});

test('festival dates distinguish past, published current, scheduled and stale editions', () => {
  const fringe = entries.find(item => item.id === 'melbourne-fringe');
  const midsumma = entries.find(item => item.id === 'melbourne-midsumma');
  assert.equal(eventState(fringe,'2026-09-28').key, 'upcoming');
  assert.equal(eventState(fringe,'2026-09-29').key, 'current');
  assert.equal(eventState(fringe,'2026-10-18').key, 'current');
  assert.equal(eventState(fringe,'2026-10-19').key, 'past');
  assert.equal(eventState(midsumma,'2026-10-11').key, 'upcoming');
  assert.equal(eventState(midsumma,'2026-12-01').key, 'recheck');
  assert.equal(eventState(midsumma,'2027-02-08').key, 'past');
  assert.equal(melbourneToday(new Date('2026-10-10T13:30:00Z')), '2026-10-11');
  assert.equal(melbourneToday(new Date('2026-07-01T14:30:00Z')), '2026-07-02');
});

test('Melbourne overview shows useful live-date links while excluding past editions', () => {
  const window = new Window();
  const state = parseRoute('#melbourne/visitor/all');
  window.document.body.innerHTML = collectionNavigation(state,route) + melbourneOverview(state,regions.melbourne,route,'2026-10-11') + listeningRoom(regions.melbourne);
  assert.equal(window.document.querySelectorAll('.collection-nav a').length,4);
  assert.equal(window.document.querySelector('.collection-nav a[aria-current]').textContent,'Everything22');
  assert.equal(window.document.querySelectorAll('.festival-notebook li').length,3);
  assert.ok(!window.document.querySelector('.festival-notebook').textContent.includes('Moomba'));
  assert.match(window.document.querySelector('.listening').textContent,/Djirri Djirri[\s\S]*Alice Skye/);
  assert.equal(window.document.querySelectorAll('audio, iframe').length,0);
  window.document.body.innerHTML = acknowledgementOfCountry(regions.melbourne);
  assert.match(window.document.body.textContent,/Acknowledgement of Country/);
  assert.match(window.document.body.textContent,/Wurundjeri Woi-wurrung and Bunurong/);
  assert.equal(acknowledgementOfCountry(regions.bandung),'');
  window.document.body.innerHTML = melbourneOverview(state,regions.melbourne,route,'2028-01-01');
  assert.match(window.document.body.textContent,/published festival dates has passed/);
  assert.equal(window.document.querySelectorAll('.festival-notebook li').length,0);
  window.happyDOM.abort();
});

test('entry cards expose evidence and dates and escape text instead of embedding it', () => {
  const window = new Window();
  const moomba = entries.find(item => item.id === 'melbourne-moomba');
  window.document.body.innerHTML = entryCard({...moomba,title:'<script>unsafe</script>'},'2026-10-11');
  assert.equal(window.document.querySelectorAll('script').length,0);
  assert.equal(window.document.querySelector('h3').textContent,'<script>unsafe</script>');
  assert.equal(window.document.querySelector('.event-state').textContent,'Past edition');
  assert.equal(window.document.querySelector('time').getAttribute('datetime'),'2026-03-05');
  assert.match(window.document.querySelector('details').textContent,/City of Melbourne \/ Moomba/);
  assert.match(window.document.querySelector('details').textContent,/Checked 2026-10-11/);
  window.happyDOM.abort();
});
