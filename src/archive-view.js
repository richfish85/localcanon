import { sources, entryKinds, getEntries, eventState, melbourneToday } from './data.js';
import { escapeHtml as escape } from './community-model.js';

const label = value => value.charAt(0).toUpperCase() + value.slice(1);
const externalLink = (url, text, className = '') => `<a class="${className}" href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(text)}</a>`;
const displayDate = value => new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Australia/Melbourne' }).format(new Date(`${value}T12:00:00+11:00`));

export function acknowledgementOfCountry(region) {
  if (region.id !== 'melbourne') return '';
  return `<section class="archive-note acknowledgement" aria-labelledby="country-heading"><div><p class="eyebrow">Country & continuing cultures</p><h2 id="country-heading">Acknowledgement of Country</h2></div><div><p>LocalCanon acknowledges the Wurundjeri Woi-wurrung and Bunurong / Boon Wurrung peoples of the Kulin Nation as Traditional Owners of the lands and waters of Melbourne. We pay our respects to Elders past and present and recognise their continuing connections to Country, culture and community.</p><p>We also acknowledge Aboriginal and Torres Strait Islander peoples whose stories and creative work are shared in this collection.</p>${externalLink('https://participate.melbourne.vic.gov.au/reconciliation-2024-2027/story/1110/526', 'Traditional Owners: City of Melbourne', 'read-link')}</div></section>`;
}

export function eventMarkup(entry, today = melbourneToday()) {
  if (!entry.event) return '';
  const status = eventState(entry, today);
  const dates = `<time datetime="${entry.event.start}">${displayDate(entry.event.start)}</time>${entry.event.start === entry.event.end ? '' : ` – <time datetime="${entry.event.end}">${displayDate(entry.event.end)}</time>`}`;
  return `<div class="event-dates"><span class="event-state ${status.key}">${status.label}</span><p>${dates}</p><small>${entry.event.edition} edition · Melbourne local dates</small></div>`;
}

export function entryCard(entry, today = melbourneToday()) {
  const kind = entry.kind ? { festival: 'Festival', artist: 'Artist / performer', place: 'Cultural place' }[entry.kind] : label(entry.theme);
  const action = { festival: 'Visit the organiser', artist: 'Explore the artist & work', place: 'Plan a visit' }[entry.kind];
  return `<article class="entry-card" id="entry-${escape(entry.id)}"><div class="card-meta"><span>${escape(kind)}</span><span class="status ${entry.status}">${entry.status === 'sourced' ? 'Sources included' : 'Research planned'}</span></div>
    <h3>${escape(entry.title)}</h3>${entry.location ? `<p class="entry-location">${escape(entry.location)}</p>` : ''}${eventMarkup(entry, today)}<p>${escape(entry.description)}</p>
    ${entry.visitNote ? `<p class="small">${escape(entry.visitNote)}</p>` : ''}${entry.website ? externalLink(entry.website, action, 'read-link') : ''}
    <details><summary>Context & sources</summary><p class="small">${escape(entry.scope)}</p>${entry.sourceIds.length ? `<ul>${entry.sourceIds.map(id => { const s = sources[id]; return `<li>${externalLink(s.url, `${s.publisher}: ${s.title}`)}<small>Checked ${s.accessed}</small></li>`; }).join('')}</ul>` : '<p class="small">This editorial idea needs local research before publication.</p>'}</details></article>`;
}

export function collectionNavigation(state, route) {
  return `<nav class="collection-nav" aria-label="Melbourne collections">${Object.entries(entryKinds).map(([kind, text]) => `<a href="${route(state, { kind, theme: 'all' })}" ${state.kind === kind ? 'aria-current="page"' : ''}>${text}<span>${getEntries(state.regionId, 'all', 'title', kind).length}</span></a>`).join('')}</nav>`;
}

export function melbourneOverview(state, region, route, today = melbourneToday()) {
  const festivals = getEntries('melbourne', 'all', 'title', 'festival').filter(entry => entry.event.end >= today).sort((a, b) => a.event.start.localeCompare(b.event.start)).slice(0, 3);
  const countrySource = sources[region.countrySourceId];
  return `<section class="regional-notebook" aria-labelledby="notebook-heading"><div class="notebook-intro"><p class="eyebrow">The Melbourne notebook</p><h2 id="notebook-heading">Culture is something people keep making.</h2><p>${escape(region.countryNote)}</p>${externalLink(countrySource.url, 'Start with Koorie Heritage Trust', 'read-link')}<p class="small">A first, manually researched collection · checked 11 October 2026. These are editorial starting points; inclusion does not imply a partnership or endorsement.</p></div><aside class="festival-notebook" aria-labelledby="festival-notebook-heading"><p class="eyebrow">Dates to explore</p><h2 id="festival-notebook-heading">From the festival calendar</h2>${festivals.length ? `<ul>${festivals.map(entry => `<li><h3>${externalLink(entry.website, entry.title)}</h3>${eventMarkup(entry, today)}</li>`).join('')}</ul>` : '<p>This first set of published festival dates has passed. Explore the festival archive and organisers’ latest programmes.</p>'}<a class="read-link" href="${route(state, { kind: 'festival', theme: 'all' })}">Explore all festivals</a><p class="small">Check the organiser for current programmes, tickets and changes before visiting.</p></aside></section>`;
}

export function listeningRoom(region) {
  const music = region.music;
  return `<section class="listening" aria-labelledby="listen-heading"><div><p class="eyebrow">The listening room</p><h2 id="listen-heading">${escape(music.heading || 'Tradition, then the next generation.')}</h2><p>Hear the region’s roots alongside the people making music today.</p></div><div class="listening-columns"><article><span class="small">${escape(music.traditionLabel || '01 / Traditional spotlight')}</span><h3>${escape(music.tradition)}</h3><p>${escape(music.traditionDescription || 'Performer selection in progress')}</p>${music.traditionUrl ? externalLink(music.traditionUrl, music.traditionLink, 'read-link') : ''}</article><article><span class="small">02 / Artist & featured song</span><h3>${escape(music.contemporary)}</h3><p>${escape(music.contemporaryDescription || 'Artist and track selection in progress')}</p>${music.contemporaryUrl ? externalLink(music.contemporaryUrl, music.contemporaryLink, 'read-link') : ''}</article></div><details><summary>About this collection</summary><p>${escape(music.research)}</p></details></section>`;
}
