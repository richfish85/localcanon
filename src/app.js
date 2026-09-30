import { regions, themes, sources, businessCategories, getEntries, parseRoute } from './data.js';
import { photos, photoCollections } from './photos.js';

const main = document.querySelector('#main');
const regionSelect = document.querySelector('#region-select');
const audienceNav = document.querySelector('#audience-nav');
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const title = value => value === 'all' ? 'All themes' : value.charAt(0).toUpperCase() + value.slice(1);
const route = (state, updates = {}) => { const next = { ...state, ...updates }; return `#${next.regionId}/${next.audience}/${next.theme}`; };
let sort = 'title';
let featureIndex = 0;

function photoImage(photo, { className = '', eager = false } = {}) {
  return `<img class="film-photo ${className}" src="${photo.src}" alt="${escape(photo.alt)}" style="object-position: ${photo.position}" ${eager ? 'fetchpriority="high" loading="eager"' : 'loading="lazy"'} decoding="async">`;
}
const photoCredit = photo => `<a href="${photo.url}" target="_blank" rel="noopener noreferrer">Photo by ${escape(photo.credit)} on Unsplash</a>`;

regionSelect.innerHTML = Object.values(regions).map(region => `<option value="${region.id}">${region.name}</option>`).join('');
regionSelect.addEventListener('change', () => { location.hash = route(parseRoute(location.hash), { regionId: regionSelect.value }); });
document.querySelector('.skip-link').addEventListener('click', event => { event.preventDefault(); main.focus(); main.scrollIntoView(); });

function entryCard(entry) {
  return `<article class="entry-card"><div class="card-meta"><span>${title(entry.theme)}</span><span class="status ${entry.status}">${entry.status === 'sourced' ? 'Sources included' : 'Research planned'}</span></div>
    <h3>${escape(entry.title)}</h3><p>${escape(entry.description)}</p>
    <details><summary>Context & sources</summary><p class="small">${escape(entry.scope)}</p>${entry.sourceIds.length ? `<ul>${entry.sourceIds.map(id => { const s = sources[id]; return `<li><a href="${s.url}" target="_blank" rel="noopener noreferrer">${escape(s.publisher)}: ${escape(s.title)}</a><small>Checked ${s.accessed}</small></li>`; }).join('')}</ul>` : '<p class="small">This editorial idea needs local research before publication.</p>'}</details></article>`;
}

function render() {
  const state = parseRoute(location.hash);
  const region = regions[state.regionId];
  const hero = photos[photoCollections[state.regionId].hero];
  document.title = `${region.name} · ${title(state.audience)} | LocalCanon`;
  regionSelect.value = region.id;
  audienceNav.innerHTML = ['visitor', 'business'].map(audience => `<a href="${route(state, { audience })}" ${state.audience === audience ? 'aria-current="page"' : ''}>${audience === 'visitor' ? 'Explore' : 'For local businesses'}</a>`).join('');
  main.innerHTML = `<section class="region-intro" aria-labelledby="region-heading">${photoImage(hero, { className: 'hero-photo', eager: true })}<div class="hero-shade" aria-hidden="true"></div><div class="intro-copy"><p class="eyebrow">${region.country} / ${region.area} <span>Pilot region</span></p><h1 id="region-heading">${region.name}</h1><p class="local-name">${region.localName === region.name ? 'People, ideas and everyday culture in motion.' : `${region.localName} · People, ideas and everyday culture in motion.`}</p><p class="introduction">${region.introduction}</p><a class="hero-link" href="${route(state)}" data-explore>Explore ${region.name}</a></div><aside class="intro-aside"><span class="edition">01 / Living archive</span><h2>${state.audience === 'visitor' ? 'A place, through its people.' : 'Be part of the local story.'}</h2><p>${state.audience === 'visitor' ? region.focus : 'Bring your practice, experience or cultural knowledge into a regional guide.'}</p><a href="${region.officialGuide.url}" target="_blank" rel="noopener noreferrer">${region.officialGuide.label}</a></aside></section><div class="hero-caption">${photoCredit(hero)}</div>
    ${state.audience === 'visitor' ? visitorView(state, region) : businessView(region)}
    <section class="archive-note"><div><p class="eyebrow">Different places. A shared world.</p><h2>A living archive starts with listening.</h2></div><p>This pilot brings sourced introductions together with stories still to be researched. Local voices and cultural context will shape what belongs here.</p></section>`;
  document.querySelector('[data-explore]').addEventListener('click', event => { event.preventDefault(); const section = document.querySelector('.themes-section, .business-section'); section.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); section.querySelector('h2').focus({ preventScroll: true }); });
  const sortSelect = document.querySelector('#sort-select');
  if (sortSelect) { sortSelect.value = sort; sortSelect.addEventListener('change', () => { sort = sortSelect.value; render(); document.querySelector('#sort-select').focus({ preventScroll: true }); }); }
  bindFeature(state);
}

function themeNavigation(state) {
  const collection = photoCollections[state.regionId];
  return themes.map((theme, index) => {
    const photo = photos[collection.themes[theme]];
    return `<a class="theme-tile ${photo ? 'has-photo' : 'type-tile'}" aria-label="${title(theme)}" href="${route(state, { theme })}" ${state.theme === theme ? 'aria-current="page"' : ''}>${photo ? `${photoImage(photo)}<span class="tile-shade" aria-hidden="true"></span>` : `<span class="tile-number" aria-hidden="true">${String(index).padStart(2, '0')}</span>`}<span class="tile-label">${title(theme)}</span></a>`;
  }).join('');
}

function featureMarkup(state) {
  const collection = photoCollections[state.regionId];
  const photo = photos[collection.features[featureIndex % collection.features.length]];
  return `<figure class="feature-image">${photoImage(photo)}<figcaption>${photoCredit(photo)}</figcaption></figure><div class="feature-copy"><p class="eyebrow">${photo.label}</p><h2 id="feature-heading">${photo.title}</h2><p>${photo.description}</p><p class="photo-location">${photo.location}</p><a class="read-link" href="${photo.url}" target="_blank" rel="noopener noreferrer">View photograph</a><div class="feature-controls"><span aria-live="polite">${String(featureIndex + 1).padStart(2, '0')} / 03</span><div><button type="button" data-feature-step="-1" aria-label="Previous photograph">‹</button><button type="button" data-feature-step="1" aria-label="Next photograph">›</button></div></div></div>`;
}

function magazineSpread(state) {
  const collection = photoCollections[state.regionId];
  return `<section class="magazine-spread" aria-label="Photographic stories"><div class="feature-story" id="feature-story" aria-labelledby="feature-heading">${featureMarkup(state)}</div><aside class="community-panel"><div class="community-heading"><h2>From the neighbourhood</h2><span class="edition">Photo notes</span></div><div class="community-stories">${collection.sidebar.map(id => { const photo = photos[id]; return `<article><a class="community-image" href="${photo.url}" target="_blank" rel="noopener noreferrer" aria-label="View ${escape(photo.title)} on Unsplash">${photoImage(photo)}</a><h3><a href="${photo.url}" target="_blank" rel="noopener noreferrer">${photo.title}</a></h3><p>${photo.location}</p><small>${photoCredit(photo)}</small></article>`; }).join('')}</div></aside></section>`;
}

function bindFeature(state) {
  document.querySelectorAll('[data-feature-step]').forEach(button => button.addEventListener('click', () => {
    const direction = Number(button.dataset.featureStep);
    featureIndex = (featureIndex + direction + photoCollections[state.regionId].features.length) % photoCollections[state.regionId].features.length;
    document.querySelector('#feature-story').innerHTML = featureMarkup(state);
    bindFeature(state);
    document.querySelector(`[data-feature-step="${direction}"]`).focus({ preventScroll: true });
  }));
}

function visitorView(state, region) {
  const selected = getEntries(state.regionId, state.theme, sort);
  return `<section class="themes-section" aria-labelledby="theme-heading"><div class="section-heading"><h2 id="theme-heading" tabindex="-1">Explore by theme</h2><span class="small">Follow your curiosity</span></div><nav class="theme-nav" aria-label="Culture themes">${themeNavigation(state)}</nav></section>
    ${state.theme === 'all' ? magazineSpread(state) : ''}
    ${(state.theme === 'all' || state.theme === 'music') ? `<section class="listening" aria-labelledby="listen-heading"><div><p class="eyebrow">The listening room</p><h2 id="listen-heading">Tradition, then the next generation.</h2><p>Hear the region’s roots alongside the people making music today.</p></div><div class="listening-columns"><article><span class="small">01 / Traditional spotlight</span><h3>${region.music.tradition}</h3><p>Performer selection in progress</p></article><article><span class="small">02 / Artist & featured song</span><h3>${region.music.contemporary}</h3><p>Artist and track selection in progress</p></article></div><details><summary>About this collection</summary><p>${region.music.research}</p></details></section>` : ''}
    <section class="collection" aria-labelledby="collection-heading"><div class="section-heading"><div><p class="eyebrow">${state.theme === 'all' ? 'From the archive' : title(state.theme)}</p><h2 id="collection-heading">Stories & starting points</h2></div><label class="sort-label">Sort by <select id="sort-select"><option value="title">Title</option><option value="year">Year</option><option value="artist">Artist</option><option value="genre">Genre</option></select></label></div><p class="small result-count" role="status">${selected.length} ${selected.length === 1 ? 'entry' : 'entries'} · ${region.name}</p><div class="entries">${selected.length ? selected.map(entryCard).join('') : `<div class="empty"><h3>This chapter is still open.</h3><p>We’re gathering ${title(state.theme).toLowerCase()} stories for ${region.name}. Explore another theme while this collection grows.</p><a href="${route(state, { theme: 'all' })}">View all themes</a></div>`}</div></section>`;
}

function businessView(region) {
  return `<section class="business-section" aria-labelledby="business-heading"><p class="eyebrow">Local participation</p><h2 id="business-heading" tabindex="-1">A guide with room for your voice.</h2><p class="business-lead">LocalCanon's business layer will connect visitors with local makers, performers and cultural experiences, with a clear distinction between editorial stories and commercial listings.</p><div class="business-details"><div><h3 id="categories-heading">Proposed directory categories</h3><ul class="business-categories" aria-labelledby="categories-heading">${businessCategories.map(category => `<li>${escape(category)}</li>`).join('')}</ul></div><div class="business-roadmap"><h3>Preparing the ${region.name} directory</h3><p>The first step is local research and conversations with contributors. Business profiles, listing submissions and claim verification are planned; submissions are not open yet.</p></div></div></section>`;
}

window.addEventListener('hashchange', () => { featureIndex = 0; render(); });
render();
