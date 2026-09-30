import test from 'node:test';
import assert from 'node:assert/strict';
import { entries, regions, sources, themes, getEntries, parseRoute } from '../src/data.js';
import { resolvePublicPath, createAppServer } from '../scripts/server.mjs';
import { photos, photoCollections } from '../src/photos.js';
import { readFile, stat } from 'node:fs/promises';

test('content uses valid regions, themes and sources; sourced entries have evidence', () => {
  assert.equal(new Set(entries.map(entry => entry.id)).size, entries.length);
  for (const entry of entries) {
    assert.ok(Object.hasOwn(regions, entry.regionId));
    assert.ok(themes.includes(entry.theme));
    assert.ok(['sourced', 'research'].includes(entry.status));
    if (entry.status === 'sourced') assert.ok(entry.sourceIds.length);
    for (const id of entry.sourceIds) assert.ok(Object.hasOwn(sources, id));
  }
});

test('theme selection stays inside the region and handles empty collections', () => {
  const result = getEntries('kanazawa', 'craft');
  assert.equal(result.length, 2);
  assert.ok(result.every(entry => entry.regionId === 'kanazawa' && entry.theme === 'craft'));
  assert.deepEqual(getEntries('bandung', 'events'), []);
});

test('unknown routes fall back to Bandung visitor overview', () => {
  assert.deepEqual(parseRoute('#invalid/admin/invalid'), { regionId: 'bandung', audience: 'visitor', theme: 'all' });
  assert.equal(parseRoute('#kanazawa/business/music').audience, 'business');
});

test('public path resolution blocks traversal and private project files', () => {
  for (const path of ['/.git/config', '/package.json', '/src/%2e%2e/package.json', '/src/%2e%2e/%2e%2e/AGENTS.md', '/docs/.secret', '/src/%5c..%5cpackage.json', '/src/%00bad', '/src/%zz']) assert.equal(resolvePublicPath(path), null);
  assert.ok(resolvePublicPath('/src/app.js'));
});

test('HTTP server serves app assets and rejects unsupported methods', async () => {
  const server = createAppServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  try {
    assert.equal((await fetch(url)).status, 200);
    const asset = await fetch(`${url}/src/data.js`);
    assert.match(asset.headers.get('content-type'), /javascript/);
    const photo = await fetch(`${url}/assets/photos/bandung-night.jpg`);
    assert.equal(photo.status, 200);
    assert.equal(photo.headers.get('content-type'), 'image/jpeg');
    assert.equal((await fetch(`${url}/.git/config`)).status, 404);
    assert.equal((await fetch(url, { method: 'POST' })).status, 405);
  } finally { await new Promise(resolve => server.close(resolve)); }
});

test('six local photos have credits and stay within their region', async () => {
  assert.equal(Object.keys(photos).length, 6);
  const credits = await readFile(new URL('../assets/photos/credits.txt', import.meta.url), 'utf8');
  for (const photo of Object.values(photos)) {
    assert.ok((await stat(new URL(`../${photo.src}`, import.meta.url))).size > 10000);
    assert.ok(credits.includes(photo.src.split('/').at(-1)) && credits.includes(photo.credit));
  }
  for (const [regionId, collection] of Object.entries(photoCollections)) {
    for (const id of [collection.hero, ...collection.features, ...collection.sidebar, ...Object.values(collection.themes)]) assert.equal(photos[id].regionId, regionId);
  }
});
