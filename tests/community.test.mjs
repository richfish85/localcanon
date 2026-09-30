import test from 'node:test';
import assert from 'node:assert/strict';
import { safeUrl, escapeHtml, validateProfile, validateContribution } from '../src/community-model.js';

const draft = { kind: 'story', region_id: 'bandung', theme: 'food', title: 'Synthetic test story', body: 'Synthetic account for permission testing only.', scope: 'Synthetic Bandung neighbourhood', evidence_kind: 'documented', source_text: 'https://example.com/source', publish_consent: true };
test('contribution validation rejects executable URLs, unsupported geography and absent consent', () => {
  assert.equal(safeUrl('javascript:alert(1)'), '');
  assert.equal(safeUrl('https://user:password@example.com'), '');
  assert.match(escapeHtml('<img onerror="bad">'), /^&lt;/);
  assert.throws(() => validateContribution({ ...draft, source_text: 'javascript:alert(1)' }, true));
  assert.throws(() => validateContribution({ ...draft, region_id: 'pekalongan' }, true));
  assert.throws(() => validateContribution({ ...draft, publish_consent: false }, true));
  assert.throws(() => validateContribution({ ...draft, source_text: '' }, true));
  assert.equal(validateContribution({ ...draft, source_text: '', evidence_kind: 'firsthand' }, true).evidence_kind, 'firsthand');
});
test('profiles default private and exclude user-supplied role/id/email fields', () => {
  const profile = validateProfile({ display_name: 'Test contributor', role: 'editor', id: 'other-user', email: 'private@example.com' });
  assert.equal(profile.is_public, false);
  assert.equal(profile.role, undefined);
  assert.equal(profile.id, undefined);
  assert.equal(profile.email, undefined);
});
