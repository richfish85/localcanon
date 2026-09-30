import { regions, themes } from './data.js';

export const contributionTypes = { story: 'Local story', correction: 'Correction', suggestion: 'Artist, tradition or source suggestion' };
export const statusLabels = { draft: 'Draft', pending: 'Awaiting review', changes_requested: 'Changes requested', approved: 'Published', rejected: 'Not accepted', withdrawn: 'Withdrawn' };
export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export function safeUrl(value) {
  if (!value) return '';
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : ''; } catch { return ''; }
}
export function validateProfile(input) {
  const result = { display_name: String(input.display_name || '').trim(), bio: String(input.bio || '').trim(), region_id: input.region_id || null, connection: String(input.connection || '').trim(), website: String(input.website || '').trim(), is_public: input.is_public === true };
  if (result.display_name.length < 2 || result.display_name.length > 80) throw new Error('Use a display name between 2 and 80 characters.');
  if (result.bio.length > 1000 || result.connection.length > 300) throw new Error('Keep your bio under 1,000 characters and regional connection under 300.');
  if (result.region_id && !Object.hasOwn(regions, result.region_id)) throw new Error('Choose one of the pilot regions.');
  if (result.website && (!safeUrl(result.website) || result.website.length > 2000)) throw new Error('Use a complete http or https website address without login details.');
  return result;
}
export function validateContribution(input, forSubmission = false) {
  const result = {
    kind: input.kind, region_id: input.region_id, theme: input.theme,
    title: String(input.title || '').trim(), body: String(input.body || '').trim(),
    scope: String(input.scope || '').trim(), evidence_kind: input.evidence_kind,
    sources: String(input.source_text || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean),
    media_url: String(input.media_url || '').trim(), media_creator: String(input.media_creator || '').trim(),
    media_rights: input.media_rights || 'link_only', publish_consent: input.publish_consent === true,
  };
  if (!Object.hasOwn(contributionTypes, result.kind)) throw new Error('Choose a contribution type.');
  if (!Object.hasOwn(regions, result.region_id) || !themes.slice(1).includes(result.theme)) throw new Error('Choose a region and theme.');
  if (result.title.length < 3 || result.title.length > 160) throw new Error('Use a title between 3 and 160 characters.');
  if (result.body.length < 20 || result.body.length > 12000) throw new Error('Write between 20 and 12,000 characters.');
  if (result.scope.length < 2 || result.scope.length > 300) throw new Error('Describe the geographic scope in 2 to 300 characters.');
  if (!['documented', 'firsthand'].includes(result.evidence_kind)) throw new Error('Choose how you know this information.');
  if (result.sources.length > 8 || result.sources.some(url => url.length > 2000 || !safeUrl(url))) throw new Error('Add up to eight complete http or https source links, one per line.');
  if (result.media_url && (!safeUrl(result.media_url) || result.media_url.length > 2000 || !result.media_creator || result.media_creator.length > 200)) throw new Error('A media reference needs a valid link and a creator or credit (up to 200 characters).');
  if (!['link_only', 'own_work', 'permission_recorded'].includes(result.media_rights)) throw new Error('Choose the rights status for the media reference.');
  if (forSubmission && (!result.publish_consent || (result.evidence_kind === 'documented' && !result.sources.length))) throw new Error('Give publication permission and include a source for documented claims.');
  return result;
}
