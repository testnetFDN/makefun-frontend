import { h, link, money, countdown, reconcileChildren, debounce } from './format.js';

export const eyebrow = text => h('p', { class: 'eyebrow' }, text);
export const stat = (label, value, note = '') => h('div', { class: 'stat' },
  h('span', {}, label), h('strong', {}, value), h('small', {}, note));
export const tabs = (slug, active) => h('nav', { class: 'tabs', 'aria-label': 'Bounty views' },
  link('Overview', `#/bounty/${slug}`, active === 'overview' ? 'selected' : ''),
  link('Leaderboard ↗', `#/bounty/${slug}/leaderboard`, active === 'leaderboard' ? 'selected' : ''));
export const crumb = title => h('div', { class: 'crumb' }, link('Board', '#/'), ' / ', title);
export function card(b) {
  const status = b.status || (new Date(b.deadline) > Date.now() ? 'open' : 'resolved');
  const sponsor = typeof b.sponsor === 'object' ? b.sponsor : { name: b.sponsor };
  return h('article', { class: 'bounty-card' },
    h('div', { class: 'card-top' }, h('span', { class: `pill ${status}` }, status),
      h('span', { class: 'category' }, b.category || 'Bounty'), countdown(b.deadline)),
    h('p', { class: 'sponsor' }, `${sponsor?.name || 'make.fun'} ${sponsor?.isVerified ? '✓' : ''}`),
    h('h2', {}, link(b.title, `#/bounty/${b.slug}`)),
    h('p', { class: 'summary' }, b.summary || 'Build something exceptional. Explore the brief, rules and live rewards.'),
    h('div', { class: 'finance' }, stat('Base reward', money(b.rewardAmount)),
      stat('Live pot', money(b.potUsd ?? b.rewardAmount), `+${money(b.entryFeesUsd)} fees`),
      stat('Entry fee', money(b.entryFeeUsd)), stat('Entries / payers', `${b.submissionCount || 0} / ${b.entryFeePayers || 0}`)),
    h('div', { class: 'skills' }, (b.skills || []).map(skill => h('span', {}, skill))),
    h('div', { class: 'card-bottom' }, link('Explore bounty ↗', `#/bounty/${b.slug}`),
      link('Leaderboard →', `#/bounty/${b.slug}/leaderboard`)));
}
export function board(data) {
  const items = data.items || [];
  let status = 'all';
  let category = 'all';
  let query = '';
  let sort = 'pot';
  const open = items.filter(b => (b.status || 'open') === 'open');
  const nearest = [...open].sort((a, b) => new Date(a.deadline) - new Date(b.deadline))[0];
  const grid = h('div', { class: 'grid' });
  const count = h('span', { class: 'result-count' });
  function draw() {
    const filtered = items.filter(b => (status === 'all' || b.status === status) &&
      (category === 'all' || b.category === category) &&
      `${b.title} ${b.summary} ${(b.skills || []).join(' ')}`.toLowerCase().includes(query));
    filtered.sort((a, b) => sort === 'deadline' ? new Date(a.deadline) - new Date(b.deadline) :
      Number(sort === 'entries' ? b.submissionCount : sort === 'base' ? b.rewardAmount : b.potUsd ?? b.rewardAmount) -
      Number(sort === 'entries' ? a.submissionCount : sort === 'base' ? a.rewardAmount : a.potUsd ?? a.rewardAmount));
    reconcileChildren(grid, filtered, b => b.slug, card);
    count.textContent = `${filtered.length} opportunities`;
    if (!filtered.length) grid.append(h('p', { class: 'empty' }, 'No matches. Try a broader search.'));
  }
  function pills(values, change) {
    const box = h('div', { class: 'pills' });
    for (const value of values) {
      const button = h('button', { class: value === 'all' ? 'selected' : '', onclick: () => {
        box.querySelectorAll('button').forEach(node => node.classList.toggle('selected', node === button));
        change(value);
        draw();
      } }, value);
      box.append(button);
    }
    return box;
  }
  const search = h('input', { type: 'search', placeholder: 'Search your next challenge…', 'aria-label': 'Search bounties',
    oninput: debounce(event => { query = event.target.value.toLowerCase(); draw(); }) });
  const select = h('select', { 'aria-label': 'Sort bounties', onchange: event => { sort = event.target.value; draw(); } },
    [['pot', 'Live pot'], ['base', 'Base reward'], ['deadline', 'Deadline'], ['entries', 'Entries']].map(([value, title]) => h('option', { value }, `Sort: ${title}`)));
  draw();
  return h('section', {},
    h('div', { class: 'hero' }, h('div', {}, eyebrow('THE BUILDER’S OPPORTUNITY DESK'),
      h('h1', {}, 'Good work. ', h('span', {}, 'Great rewards.')),
      h('p', {}, 'Find your next challenge. Build in the open. Make it count.')),
      h('div', { class: 'hero-note' }, h('span', { class: 'live' }, '● MARKET IS LIVE'), h('p', {}, 'Your next idea', h('br'), 'starts here. ↙'))),
    h('div', { class: 'telemetry' }, stat('Open bounties', open.length, 'Ready for your best work'),
      stat('Combined live pot', money(open.reduce((n, b) => n + Number(b.potUsd ?? b.rewardAmount), 0)), 'Base rewards + entry fees'),
      stat('Total submissions', items.reduce((n, b) => n + Number(b.submissionCount || 0), 0), 'Builders making their mark'),
      stat('Shortest active deadline', nearest ? countdown(nearest.deadline) : '—', 'Every second counts')),
    h('div', { class: 'section-title' }, h('h2', {}, 'The bounty board'), count),
    h('div', { class: 'toolbar' }, pills(['all', 'open', 'resolved'], value => { status = value; }), search, select),
    h('div', { class: 'category-row' }, h('span', {}, 'DISCIPLINE'), pills(['all', ...new Set(items.map(b => b.category).filter(Boolean))], value => { category = value; })), grid);
}
