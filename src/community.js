import { regions, themes } from './data.js';
import { contributionRoute, mountContributionFlow, steps, stepNames } from './contribution-flow.js';
import { client, communityApi as api } from './community-api.js';
import { escapeHtml as e, safeUrl, validateProfile, validateContribution, contributionTypes, statusLabels } from './community-model.js';

let session = null;
let editor = false;
let recovery = false;
let generation = 0;
let publicGeneration = 0;
let main;
let renderArchive;
let activeFlow;
const unsavedContributions = new Map();
const savedNewRoutes = new Map();
let dirtyContribution = false;
window.addEventListener('beforeunload', event => { if (dirtyContribution) { event.preventDefault(); event.returnValue = ''; } });
const regionOptions = selected => Object.values(regions).map(r => `<option value="${r.id}" ${selected === r.id ? 'selected' : ''}>${r.name}</option>`).join('');
const themeOptions = selected => themes.slice(1).map(t => `<option ${selected === t ? 'selected' : ''} value="${t}">${t.charAt(0).toUpperCase() + t.slice(1)}</option>`).join('');
const ordinaryField = (name, label, value = '', extra = '') => `<label>${label}<input name="${name}" value="${e(value)}" ${extra}></label>`;
const field = (name, label, value = '', extra = '') => extra.includes('type="password"')
  ? `<div class="password-field"><label for="password-${name}">${label}</label><div class="password-control"><input id="password-${name}" name="${name}" value="${e(value)}" ${extra}><button type="button" data-password-toggle="password-${name}" aria-controls="password-${name}" aria-label="Show ${label.toLowerCase()}" aria-pressed="false">Show</button></div></div>`
  : ordinaryField(name, label, value, extra);
const textarea = (name, label, value = '', extra = '') => `<label>${label}<textarea name="${name}" ${extra}>${e(value)}</textarea></label>`;
const message = () => '<p class="form-message" role="status" aria-live="polite"></p>';
const link = (url, text) => safeUrl(url) ? `<a href="${e(safeUrl(url))}" target="_blank" rel="noopener noreferrer">${e(text)}</a>` : e(text);
const status = value => `<span class="community-status">${e(statusLabels[value] || value)}</span>`;

function shell(title, intro, content) {
  document.title = `${title} | LocalCanon`;
  main.innerHTML = `<section class="community-page"><p class="eyebrow">Local voices / Shared understanding</p><h1>${e(title)}</h1><p class="community-intro">${intro}</p>${session ? `<nav class="workspace-nav" aria-label="Contributor workspace"><a href="#account">My contributions</a><a href="#account/profile">My profile</a><a href="#contribute">New contribution</a>${editor ? '<a href="#review">Review queue</a>' : ''}<button class="quiet-button" data-signout>Sign out</button></nav>` : ''}${content}</section>`;
  main.querySelectorAll('[data-password-toggle]').forEach(button => button.addEventListener('click', () => {
    const input = document.getElementById(button.dataset.passwordToggle);
    const start = input.selectionStart, end = input.selectionEnd;
    const reveal = input.type === 'password';
    input.type = reveal ? 'text' : 'password';
    button.textContent = reveal ? 'Hide' : 'Show';
    button.setAttribute('aria-pressed', String(reveal));
    button.setAttribute('aria-label', `${reveal ? 'Hide' : 'Show'} ${input.labels[0].textContent.toLowerCase()}`);
    input.setSelectionRange(start, end);
  }));
  main.querySelector('[data-signout]')?.addEventListener('click', async event => {
    const button = event.currentTarget;
    button.disabled = true;
    try { await api.signOut(); session = null; editor = false; unsavedContributions.clear(); savedNewRoutes.clear(); dirtyContribution = false; generation++; updateNav(); location.hash = '#account'; await renderCommunity(); } catch { button.disabled = false; button.textContent = 'Sign out failed; retry'; }
  });
}

function updateNav() {
  const nav = document.querySelector('#contributor-nav');
  nav.innerHTML = `<a href="#contribute">Contribute</a><a href="#account">${session ? 'My account' : 'Sign in'}</a>`;
}

export function isCommunityRoute() { return /^#(?:account|contribute|review|profile|privacy)(?:\/|$)/.test(location.hash); }

export async function initCommunity(archiveRenderer) {
  main = document.querySelector('#main'); renderArchive = archiveRenderer; updateNav();
  if (!api) return;
  client.auth.onAuthStateChange((event, next) => {
    if (event === 'PASSWORD_RECOVERY') recovery = true;
    session = next; if (!next) { editor = false; unsavedContributions.clear(); savedNewRoutes.clear(); dirtyContribution = false; }
    updateNav();
    // Supabase warns against awaiting other auth operations inside this callback.
    if (event !== 'TOKEN_REFRESHED' && event !== 'USER_UPDATED') setTimeout(() => { if (isCommunityRoute()) renderCommunity(); }, 0);
  });
  try {
    session = await api.session();
    if (new URL(location.href).searchParams.has('code')) {
      // The SDK exchanges the PKCE code on initialization. Remove it after success.
      if (session) history.replaceState(null, '', location.pathname + location.hash);
    }
    updateNav();
    if (isCommunityRoute()) await renderCommunity();
  } catch { if (isCommunityRoute()) shell('Account unavailable', 'We could not reach the account service.', '<p>Please try again shortly. Your contributions have not been changed.</p>'); }
}

function bindForm(selector, action) {
  const form = main.querySelector(selector);
  form?.addEventListener('submit', async event => {
    event.preventDefault();
    const notice = form.querySelector('.form-message');
    const buttons = [...form.querySelectorAll('button')];
    const submitter = event.submitter?.value;
    buttons.forEach(b => { b.disabled = true; });
    notice.classList.remove('error');
    notice.textContent = 'Working…';
    try { await action(Object.fromEntries(new FormData(form)), notice, submitter, form); }
    catch (error) { notice.textContent = friendlyError(error); notice.classList.add('error'); }
    finally { buttons.forEach(b => { b.disabled = false; }); }
  });
}

function friendlyError(error) {
  const text = String(error?.message || 'The request could not be completed. Please try again.');
  if (/fetch|network/i.test(text)) return 'We could not reach the service. Check your connection and try again.';
  if (/invalid login credentials/i.test(text)) return 'The email or password was not recognised.';
  if (/email not confirmed/i.test(text)) return 'Confirm your email before signing in. You can resend the confirmation below.';
  if (/email.*(?:not authorized|not allowed)/i.test(text)) return 'Public registration is not open yet. This pilot can currently confirm only approved test accounts.';
  if (/rate limit|too many/i.test(text)) return 'Too many requests. Please wait a few minutes before trying again.';
  if (/check constraint|violates|not-null/i.test(text)) return 'Some fields are incomplete or too long. Check the form and try again.';
  return text;
}

function authView(mode = 'signin') {
  if (!api) {
    shell('Contribute to LocalCanon', 'Share a local story, suggest a source, or help correct the archive.', '<div class="account-notice"><h2>Accounts are being prepared</h2><p>Registration will open when the account service is connected. Nothing entered here is saved or submitted.</p><a href="#bandung/visitor/all">Explore the archive</a></div>'); return;
  }
  const signup = mode === 'register';
  const reset = mode === 'forgot';
  const pilot = import.meta.env.VITE_REGISTRATION_MODE !== 'open' && signup ? '<p class="pilot-note"><strong>Limited pilot:</strong> account confirmation is currently available only for approved test accounts. Public registration will open once email delivery is ready.</p>' : '';
  shell(signup ? 'Become a contributor' : reset ? 'Reset your password' : 'Welcome back', signup ? 'Bring local knowledge into the archive. Every contribution receives editorial review.' : reset ? 'We’ll email you a link to choose a new password.' : 'Sign in to work on your profile and contributions.', `${pilot}<div class="account-layout"><form id="auth-form" class="community-form">${signup ? field('display_name', 'Display name', '', 'required minlength="2" maxlength="80" autocomplete="nickname"') : ''}${field('email', 'Email address', '', 'type="email" required autocomplete="email" maxlength="254"')}${!reset ? field('password', 'Password', '', `type="password" required ${signup ? 'minlength="12"' : ''} maxlength="128" autocomplete="${signup ? 'new-password' : 'current-password'}"`) : ''}${signup ? '<p class="small">Use at least 12 characters. Your email stays private; your display name credits published contributions.</p><label class="check-label"><input name="understood" type="checkbox" required> I understand the <a href="#privacy">contributor privacy and publication rules</a>.</label>' : ''}<button class="community-button" type="submit">${signup ? 'Create account' : reset ? 'Send reset link' : 'Sign in'}</button>${message()}<div class="account-links">${signup || reset ? '<a href="#account/signin">Back to sign in</a>' : '<a href="#account/register">Create an account</a><a href="#account/forgot">Forgot password?</a><a href="#account/confirm">Resend confirmation</a>'}</div></form><aside class="contributor-guidance"><h2>Start with what you know.</h2><p>Tell us where a story belongs, how you know it, and who should receive credit. Sources and first-hand accounts have different roles.</p><ol><li>Create a profile.</li><li>Save a draft with context and sources.</li><li>Submit it for review.</li><li>Follow feedback in your account.</li></ol><p>No contribution appears publicly until an editor approves it.</p></aside></div>`);
  bindForm('#auth-form', async (data, notice) => {
    if (signup) {
      const profile = validateProfile({ display_name: data.display_name });
      if (data.password.length < 12 || data.password.length > 128) throw new Error('Use a password between 12 and 128 characters.');
      const response = await api.signUp(data.email.trim(), data.password, profile.display_name);
      main.querySelector('[name=password]').value = '';
      if (response.session) { session = response.session; location.hash = '#account/profile'; }
      else { notice.textContent = 'Check your email for the confirmation link, then sign in. If you already have an account, use Sign in or Reset password.'; }
    } else if (reset) { await api.recover(data.email.trim()); notice.textContent = 'If this address has an account, a reset link will arrive shortly. Check your spam folder too.'; }
    else { const response = await api.signIn(data.email.trim(), data.password); session = response.session; location.hash = '#account'; await renderCommunity(); }
  });
}

function confirmView() {
  shell('Confirm your email', 'Use the link in your confirmation email, or ask for another.', `<form id="confirm-form" class="community-form narrow-form">${field('email','Email address','','type="email" required autocomplete="email"')}<button class="community-button">Resend confirmation</button>${message()}<a href="#account/signin">Back to sign in</a></form>`);
  bindForm('#confirm-form', async (data, notice) => { await api.resend(data.email.trim()); notice.textContent = 'If confirmation is needed, an email will arrive shortly. Check your spam folder.'; });
}

function resetView() {
  if (!session) { shell('Open your reset email', 'Use the reset link we sent before choosing a new password.', '<a href="#account/forgot">Request a new reset link</a>'); return; }
  shell('Choose a new password', 'Use a long password that you don’t use elsewhere.', `<form id="reset-form" class="community-form narrow-form">${field('password','New password','','type="password" required minlength="12" maxlength="128" autocomplete="new-password"')}${field('confirm','Repeat password','','type="password" required minlength="12" maxlength="128" autocomplete="new-password"')}<button class="community-button">Save password</button>${message()}</form>`);
  bindForm('#reset-form', async data => { if (data.password !== data.confirm) throw new Error('The passwords do not match.'); await api.reset(data.password); recovery = false; location.hash = '#account'; });
}

async function profileView(token) {
  const profile = await api.profile(session.user.id); if (token !== generation) return;
  shell('Your contributor profile', 'Choose how you are credited and describe your connection to a place.', `<form id="profile-form" class="community-form profile-form"><div class="profile-columns"><section><h2>Identity & biography</h2>${field('display_name','Display name',profile.display_name,'required minlength="2" maxlength="80" autocomplete="nickname"')}${textarea('bio','Short bio',profile.bio,'maxlength="1000" rows="4"')}${field('website','Website (optional)',profile.website,'type="url" maxlength="2000" placeholder="https://"')}</section><section><h2>Connection & visibility</h2><label>Region<select name="region_id"><option value="">No preference</option>${regionOptions(profile.region_id)}</select></label>${textarea('connection','Your connection to the region',profile.connection,'maxlength="300" rows="3"')}<label class="check-label"><input name="is_public" type="checkbox" ${profile.is_public ? 'checked' : ''}> Make my profile public.</label><p class="small">Public profiles show the fields above. Your email is never shown. Published contributions carry your display name even if your profile stays private.</p></section></div><div class="form-actions"><button class="community-button">Save profile</button>${message()}</div></form>`);
  bindForm('#profile-form', async (data, notice) => { await api.saveProfile(session.user.id, validateProfile({ ...data, is_public: data.is_public === 'on' })); notice.textContent = 'Profile saved.'; });
}

async function dashboard(token) {
  const items = await api.contributions(session.user.id); if (token !== generation) return;
  shell('Your contributions', 'Drafts stay private. Submitted work is visible to you and the editorial team.', `<div class="workspace-heading"><h2>Your working collection</h2><a class="community-button" href="#contribute">New contribution</a></div>${items.length ? `<ul class="contribution-list">${items.map(item => `<li><div><p class="small">${e(regions[item.region_id]?.name)} / ${e(contributionTypes[item.kind])} · ${status(item.status)}</p><h3>${e(item.title)}</h3>${item.review_note ? `<p class="editor-feedback"><strong>Editor feedback:</strong> ${e(item.review_note)}</p>` : ''}<p class="small">Updated ${e(new Date(item.updated_at).toLocaleDateString())}</p></div><div class="row-actions">${['draft','changes_requested'].includes(item.status) ? `<a href="#contribute/${item.id}">Edit contribution</a>` : `<a href="#account/contribution/${item.id}">View contribution</a>`}${item.status !== 'withdrawn' ? `<button class="quiet-button" data-withdraw="${item.id}">Withdraw</button>` : ''}</div></li>`).join('')}</ul><p class="small">Showing up to your 100 most recently updated contributions.</p>` : '<div class="empty"><h2>Your first story starts here.</h2><p>Share a first-hand account, suggest a source, or help correct a specific entry.</p></div>'}${message()}`);
  main.querySelectorAll('[data-withdraw]').forEach(button => button.addEventListener('click', async () => {
    const id = button.dataset.withdraw;
    if (!button.dataset.confirm) { button.dataset.confirm = 'yes'; button.textContent = 'Confirm withdrawal'; return; }
    button.disabled = true;
    try { await api.withdraw(id); renderArchive(); await renderCommunity(); } catch (error) { main.querySelector('.form-message').textContent = friendlyError(error); button.disabled = false; }
  }));
}

async function contributionForm(id, token) {
  const ownerId = session.user.id;
  const cacheKey = `${ownerId}/${id || "new"}`;
  let item = id ? await api.contribution(id) : { region_id: document.querySelector('#region-select').value, kind: 'story', theme: 'people', evidence_kind: 'documented', media_rights: 'link_only' };
  if (token !== generation) return;
  if (id && (item.owner_id !== session.user.id || !['draft','changes_requested'].includes(item.status))) { shell('Contribution locked', 'Submitted contributions remain unchanged during review.', '<a href="#account">Return to your contributions</a>'); return; }
  item = { ...item, ...unsavedContributions.get(cacheKey) };
  shell(id ? 'Continue your contribution' : 'Share local knowledge', 'Be specific about the place, the people, and what your evidence supports.', `${item.review_note ? `<p class="editor-feedback"><strong>Editor feedback:</strong> ${e(item.review_note)}</p>` : ''}<form id="contribution-form" class="community-form contribution-wizard" novalidate data-key="${id || 'new'}" data-user="${session.user.id}"><nav class="step-nav" aria-label="Contribution steps">${steps.map((step,i) => `<a data-step href="#contribute/${id || 'new'}/${step}"><span>${i + 1}.</span> ${stepNames[i]}</a>`).join('')}</nav><p class="step-progress" data-progress role="status" aria-live="polite"></p><section data-panel="context"><h2 tabindex="-1">Place & context</h2><div class="form-grid"><label>Contribution type<select name="kind">${Object.entries(contributionTypes).map(([v,label]) => `<option value="${v}" ${item.kind === v ? 'selected' : ''}>${label}</option>`).join('')}</select></label><label>Region<select name="region_id">${regionOptions(item.region_id)}</select></label><label>Theme<select name="theme">${themeOptions(item.theme)}</select></label><label>How do you know?<select name="evidence_kind"><option value="documented" ${item.evidence_kind === 'documented' ? 'selected' : ''}>Documented sources</option><option value="firsthand" ${item.evidence_kind === 'firsthand' ? 'selected' : ''}>First-hand account</option></select></label></div>${field('scope','Geographic scope',item.scope,'required minlength="2" maxlength="300" placeholder="For example: a named neighbourhood in Bandung"')}</section><section data-panel="story" hidden><h2 tabindex="-1">Tell your story</h2>${field('title','Title',item.title,'required minlength="3" maxlength="160"')}${textarea('body','Your story, correction or suggestion',item.body,'required minlength="20" maxlength="12000" rows="10"')}<p class="small">For a correction, name the entry and explain what should change. Separate observation from interpretation. Do not include private contact details or sensitive personal information.</p></section><section data-panel="sources" hidden><h2 tabindex="-1">Sources & media</h2><div class="sources-columns"><div>${textarea('source_text','Source links — one per line',(item.sources || []).join('\n'),'rows="4" placeholder="https://…"')}<p class="small">Up to eight links. Documented claims need at least one; first-hand accounts should explain your connection and when the observation was made.</p></div><details class="media-disclosure" ${item.media_url ? 'open' : ''}><summary>Add a media reference (optional)</summary><fieldset><legend>Media credit & rights</legend><p class="small">Link to a photograph, song or artwork for review. We do not copy, upload or embed it automatically.</p>${field('media_url','Original media link',item.media_url,'type="url" maxlength="2000"')}${field('media_creator','Creator / credit',item.media_creator,'maxlength="200"')}<label>Rights status<select name="media_rights"><option value="link_only" ${item.media_rights === 'link_only' ? 'selected' : ''}>Reference link only</option><option value="own_work" ${item.media_rights === 'own_work' ? 'selected' : ''}>My own work</option><option value="permission_recorded" ${item.media_rights === 'permission_recorded' ? 'selected' : ''}>Permission recorded — explain in the contribution</option></select></label></fieldset></details></div></section><section data-panel="review" hidden><h2 tabindex="-1">Review & submit</h2><div data-review-summary></div><label class="check-label"><input name="publish_consent" type="checkbox" ${item.publish_consent ? 'checked' : ''}> I permit LocalCanon to publish this contribution with my display-name credit after review, and confirm that I have permission to share it.</label><p class="small">This permission applies to the submitted text; a media link does not grant reuse rights. You can withdraw a contribution through your account. <a href="#privacy">Read the contribution rules</a>.</p></section><div class="form-actions wizard-actions"><button type="button" class="community-button secondary" data-back>Back</button><button class="community-button secondary" name="action" value="draft">Save draft</button><button type="button" class="community-button" data-next>Next</button><button class="community-button" name="action" value="submit" hidden>Submit for review</button></div>${message()}</form>`);
  let savedId = id;
  const form = main.querySelector('#contribution-form');
  const read = () => {
    const data = Object.fromEntries(new FormData(form));
    return { ...data, sources: (data.source_text || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean), publish_consent: data.publish_consent === 'on' };
  };
  const flow = mountContributionFlow(form, {
    key: id || 'new',
    onReview: () => { form.querySelector('[data-review-summary]').innerHTML = contributionDetail(read()); },
    onChange: () => { unsavedContributions.set(`${ownerId}/${savedId || 'new'}`, read()); dirtyContribution = true; },
  });
  activeFlow = flow;
  flow.show(contributionRoute(location.hash).step, false);
  bindForm('#contribution-form', async (data, notice, action) => {
    let payload;
    try { payload = validateContribution({ ...data, publish_consent: data.publish_consent === 'on' }, action === 'submit'); }
    catch (error) {
      const target = /title|Write between/.test(error.message) ? 'story' : /scope|region|theme|type/.test(error.message) ? 'context' : /permission/.test(error.message) && data.publish_consent !== 'on' ? 'review' : 'sources';
      history.replaceState(null, '', flow.address(target)); flow.show(target);
      throw error;
    }
    savedId = await api.save(payload, savedId);
    const previousKey = form.dataset.key;
    if (previousKey === 'new') savedNewRoutes.set(ownerId, savedId);
    form.dataset.key = savedId;
    flow.setKey(savedId);
    unsavedContributions.delete(`${ownerId}/${previousKey}`);
    unsavedContributions.delete(`${ownerId}/${savedId}`);
    dirtyContribution = unsavedContributions.size > 0;
    if (form.isConnected) history.replaceState(null, '', flow.address(contributionRoute(location.hash).step));
    notice.textContent = 'Draft saved.';
    if (action === 'submit') { await api.submit(savedId); if (form.isConnected) location.hash = '#account'; }
  });
}

function contributionDetail(item) {
  return `<div class="contribution-detail"><p class="small">${e(regions[item.region_id]?.name)} / ${e(item.theme)} / ${e(contributionTypes[item.kind])}</p><h2>${e(item.title)}</h2><p class="story-body">${e(item.body)}</p><dl><dt>Geographic scope</dt><dd>${e(item.scope)}</dd><dt>Evidence</dt><dd>${item.evidence_kind === 'firsthand' ? 'First-hand account' : 'Documented sources'}</dd><dt>Publication credit</dt><dd>${e(item.credit_name || 'Assigned on submission')}</dd></dl>${item.sources?.length ? `<h3>Sources</h3><ul>${item.sources.map((url,i) => `<li>${link(url,`Source ${i + 1}: ${url}`)}</li>`).join('')}</ul>` : ''}${item.media_url ? `<p>${link(item.media_url,'Open media reference')} · ${e(item.media_creator)} · ${e(item.media_rights.replaceAll('_',' '))}</p>` : ''}${item.review_note ? `<p class="editor-feedback"><strong>Editor feedback:</strong> ${e(item.review_note)}</p>` : ''}</div>`;
}

async function reviewQueue(token) {
  if (!editor) { shell('Editor access required', 'Only assigned editors can read the review queue.', '<a href="#account">Return to your account</a>'); return; }
  const items = await api.queue(); if (token !== generation) return;
  shell('Editorial review', 'Check geographic scope, sources, credit, consent and media rights before publishing.', `${items.length ? items.map(item => `<article class="review-item">${contributionDetail(item)}<p class="small">Publication permission recorded: ${item.publish_consent ? 'Yes' : 'No'}</p>${item.owner_id === session.user.id ? '<p>Another editor must review your contribution.</p>' : `<form class="review-form community-form" data-review="${item.id}">${textarea('feedback','Feedback for the contributor','','maxlength="2000" rows="3"')}<div class="form-actions"><button class="community-button" name="decision" value="approved">Approve and publish</button><button class="community-button secondary" name="decision" value="changes_requested">Request changes</button><button class="quiet-button" name="decision" value="rejected">Decline</button></div>${message()}</form>`}</article>`).join('') : '<p>There are no contributions awaiting review.</p>'}<p class="small">Showing the oldest 100 pending contributions first.</p>`);
  main.querySelectorAll('[data-review]').forEach(form => bindForm(`[data-review="${form.dataset.review}"]`, async (data, notice, decision) => { await api.review(form.dataset.review, decision, data.feedback.trim()); await renderCommunity(); }));
}

function privacyView() {
  shell('Contributor privacy & publication', 'Understand what is saved, who can read it, and what becomes public.', `<div class="reading-column"><h2>Your account</h2><p>Supabase manages your email, password and sign-in session. LocalCanon stores your display name and optional profile details. Your email is not part of a public profile or contribution.</p><h2>Your profile</h2><p>Profiles are private by default. If you make yours public, your display name, bio, region, regional connection and website can be read by anyone. You can turn public visibility off again.</p><h2>Your contributions</h2><p>Drafts, submissions and review feedback can be read by you and assigned editors. Only approved text, sources, media references and your display-name credit appear in the archive. Corrections are published as correction notes; they do not silently replace an existing entry.</p><h2>Consent and attribution</h2><p>Submit only material you have permission to share. Each submission records publication permission. A referenced photo or song remains a link, with its creator and declared rights status; it is not automatically copied or embedded. First-hand accounts remain labelled as such.</p><h2>Withdrawal and account removal</h2><p>Withdraw a contribution from your account to remove it from LocalCanon’s public collection and stop review. It remains in your private contribution history. External copies and browser caches may persist. For account deletion or data-removal requests, contact <a href="mailto:killchainfiles@proton.me">killchainfiles@proton.me</a>.</p><h2>Sessions</h2><p>A sign-in session is kept in this browser so you can return to your work. Sign out on shared devices. We do not add advertising or analytics trackers to this contribution flow.</p><a href="#account">Return to your account</a></div>`);
}

export async function renderCommunity() {
  const token = ++generation;
  if (!main) return;
  if (location.hash.startsWith('#contribute') && session && !recovery) {
    if (location.hash === '#contribute') savedNewRoutes.delete(session.user.id);
    if (location.hash.startsWith('#contribute/new/') && savedNewRoutes.has(session.user.id)) {
      history.replaceState(null, '', `#contribute/${savedNewRoutes.get(session.user.id)}/${contributionRoute(location.hash).step}`);
    }
    const route = contributionRoute(location.hash);
    const mounted = main.querySelector('#contribution-form');
    if (mounted?.dataset.key === route.key && mounted.dataset.user === session.user.id && activeFlow) {
      document.title = `Step ${steps.indexOf(route.step) + 1}: ${stepNames[steps.indexOf(route.step)]} | LocalCanon`;
      activeFlow.show(route.step); return;
    }
  }
  const [, route, segment, id] = location.hash.match(/^#([^/]+)(?:\/([^/]+))?(?:\/([^/]+))?/) || [];
  if (route === 'privacy') { privacyView(); return; }
  if (!api) { authView(); return; }
  const hashError = new URLSearchParams(location.hash.slice(1)).get('error_description');
  if (hashError) { shell('Sign-in link unavailable', e(hashError), '<a href="#account/signin">Return to sign in</a>'); return; }
  if (route === 'profile') {
    if (!/^[\da-f-]{36}$/i.test(segment || '')) { shell('Profile unavailable', 'This profile address is not valid.', '<a href="#bandung/visitor/all">Return to the archive</a>'); return; }
    try {
      const profile = await api.publicProfile(segment); if (token !== generation) return;
      shell(profile?.display_name || 'Private profile', profile ? 'LocalCanon contributor' : 'This contributor has not shared a public profile.', profile ? `<div class="reading-column"><p class="story-body">${e(profile.bio)}</p><p>${e(regions[profile.region_id]?.name || '')}</p><p>${e(profile.connection)}</p>${profile.website ? link(profile.website,'Contributor website') : ''}</div>` : '');
    } catch (error) { if (token === generation) shell('Profile unavailable', e(friendlyError(error)), '<a href="#bandung/visitor/all">Return to the archive</a>'); }
    return;
  }
  if (route === 'account' && segment === 'reset') { resetView(); return; }
  if (!session) { if (segment === 'confirm') confirmView(); else authView(route === 'account' ? segment : 'signin'); return; }
  if (recovery) { resetView(); return; }
  shell('Your account', 'Loading your workspace…', '<p role="status">Please wait.</p>');
  try {
    editor = await api.isEditor(); if (token !== generation) return;
    if (route === 'review') await reviewQueue(token);
    else if (route === 'contribute') await contributionForm(contributionRoute(location.hash).id, token);
    else if (segment === 'profile') await profileView(token);
    else if (segment === 'contribution') { const item = await api.contribution(id); if (token === generation) shell(item.title, statusLabels[item.status], contributionDetail(item)); }
    else await dashboard(token);
  } catch (error) { if (token === generation) shell('Workspace unavailable', e(friendlyError(error)), '<a href="#account">Try again</a>'); }
}

export async function renderPublished(state) {
  const token = ++publicGeneration;
  const container = document.querySelector('#community-collection');
  if (!container || !api) return;
  try {
    const items = await api.published(state.regionId, state.theme);
    if (token !== publicGeneration || !container.isConnected) return;
    container.innerHTML = `<div class="section-heading"><div><p class="eyebrow">Local voices</p><h2>Community contributions</h2></div><a href="#contribute">Share your knowledge</a></div>${items.length ? items.map(item => `<article class="published-story"><p class="small">${e(contributionTypes[item.kind])} · ${item.evidence_kind === 'firsthand' ? 'First-hand account / Editorially reviewed' : 'Documented account / Editorially reviewed'}</p>${contributionDetail(item)}<p class="small">By <a href="#profile/${item.contributor_id}">${e(item.credit_name)}</a> · Published ${e(new Date(item.published_at).toLocaleDateString())}</p></article>`).join('') : '<p>No reviewed community contributions have been published for this selection yet.</p>'}`;
  } catch { if (token === publicGeneration && container.isConnected) container.innerHTML = '<p class="small">Community contributions could not be loaded. The original archive remains available; try refreshing shortly.</p>'; }
}
