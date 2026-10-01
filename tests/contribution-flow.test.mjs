import test from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import { contributionRoute, mountContributionFlow, steps } from '../src/contribution-flow.js';

test('contribution URLs support existing drafts, named steps and safe fallback', () => {
  assert.deepEqual(contributionRoute('#contribute'), { key: 'new', id: undefined, step: 'context' });
  assert.equal(contributionRoute('#contribute/abc/sources').step, 'sources');
  assert.equal(contributionRoute('#contribute/abc/unknown').step, 'context');
  assert.equal(contributionRoute('#contribute/new/review').id, undefined);
});

test('step navigation keeps values, validates visible fields, moves focus and preserves saved routes', () => {
  const window = new Window({ url: 'https://example.test/#contribute/new/context' });
  globalThis.location = window.location;
  globalThis.matchMedia = () => ({ matches: true });
  window.document.body.innerHTML = `<form>${steps.map(s => `<a data-step>${s}</a><section data-panel="${s}"><h2 tabindex="-1">${s}</h2>${s === 'context' ? '<label>Scope<input required minlength="2" name="scope"></label>' : s === 'story' ? '<textarea name="body"></textarea>' : ''}</section>`).join('')}<p data-progress></p><button type="button" data-back>Back</button><button type="button" data-next>Next</button><button value="submit">Submit</button></form>`;
  const form = window.document.querySelector('form');
  let reviewed = 0, changed = 0;
  const flow = mountContributionFlow(form, { key: 'new', onReview: () => reviewed++, onChange: () => changed++ });
  flow.show('context', false);
  form.querySelector('[data-next]').click();
  assert.equal(window.location.hash, '#contribute/new/context');
  form.elements.scope.value = 'Test place';
  form.elements.scope.dispatchEvent(new window.Event('input', { bubbles: true }));
  form.querySelector('[data-next]').click();
  assert.equal(window.location.hash, '#contribute/new/story');
  flow.show('story');
  form.elements.body.value = 'An unsaved story stays in the same form.';
  flow.show('sources'); flow.show('story');
  assert.equal(form.elements.body.value, 'An unsaved story stays in the same form.');
  assert.equal(window.document.activeElement.textContent, 'story');
  assert.equal(form.querySelector('[data-panel=context]').hidden, true);
  flow.show('review');
  assert.equal(reviewed, 1);
  assert.equal(form.querySelector('[value=submit]').hidden, false);
  assert.equal(form.querySelector('[data-next]').hidden, true);
  assert.match(form.querySelector('[data-progress]').textContent, /Step 4 of 4/);
  flow.setKey('saved-id');
  assert.equal(flow.address('story'), '#contribute/saved-id/story');
  assert.equal(changed, 1);
  assert.equal(form.querySelector('[data-step]').getAttribute('href'), '#contribute/saved-id/context');
  window.close(); delete globalThis.location; delete globalThis.matchMedia;
});
