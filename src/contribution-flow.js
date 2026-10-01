export const steps = ['context', 'story', 'sources', 'review'];
export const stepNames = ['Context', 'Story', 'Sources & media', 'Review & submit'];

export function contributionRoute(hash) {
  const [, key = 'new', step = 'context'] = hash.split('/');
  return { key, id: key === 'new' ? undefined : key, step: steps.includes(step) ? step : 'context' };
}

export function mountContributionFlow(form, { key, onReview, onChange }) {
  const panels = [...form.querySelectorAll('[data-panel]')];
  const stepLinks = [...form.querySelectorAll('[data-step]')];
  const back = form.querySelector('[data-back]');
  const next = form.querySelector('[data-next]');
  const submit = form.querySelector('[value="submit"]');
  const progress = form.querySelector('[data-progress]');
  let current = -1;
  let routeKey = key;
  const address = step => `#contribute/${routeKey}/${step}`;
  function show(step, focus = true) {
    const index = steps.indexOf(step);
    if (index === current) return;
    const direction = index >= current ? 1 : -1;
    current = index;
    panels.forEach((panel, i) => { panel.hidden = i !== index; });
    stepLinks.forEach((a, i) => {
      a.href = address(steps[i]);
      if (i === index) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current');
    });
    progress.textContent = `Step ${index + 1} of ${steps.length} — ${stepNames[index]}`;
    back.hidden = index === 0; next.hidden = index === steps.length - 1; submit.hidden = index !== steps.length - 1;
    if (index === 3) onReview();
    const panel = panels[index];
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches && panel.animate) {
      panel.animate([{ opacity: .5, transform: `translateX(${direction * 24}px)` }, { opacity: 1, transform: 'translateX(0)' }], { duration: 180, easing: 'ease-out' });
    }
    if (focus) panel.querySelector('h2').focus({ preventScroll: true });
  }
  next.addEventListener('click', () => {
    const invalid = [...panels[current].querySelectorAll('input,select,textarea')].find(el => !el.checkValidity() || (el.minLength > 0 && el.value.trim().length < el.minLength));
    if (invalid) { invalid.focus(); invalid.reportValidity(); progress.textContent = `Step ${current + 1} of 4 — check ${invalid.closest('label')?.firstChild.textContent.trim() || 'this field'}.`; return; }
    location.hash = address(steps[current + 1]);
  });
  back.addEventListener('click', () => { location.hash = address(steps[current - 1]); });
  form.addEventListener('input', onChange);
  form.addEventListener('change', onChange);
  return { show, setKey(value) { routeKey = value; stepLinks.forEach((a, i) => { a.href = address(steps[i]); }); }, address };
}
