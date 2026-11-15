import { h, link, avatar, bytes, percent, debounce } from './format.js';
import { crumb, eyebrow, stat, tabs } from './views.js';

export default function leaderboard(data) {
  const entries = data.entries || [];
  const slug = data.competition?.slug || 'makefun-frontend-01';
  const columns = (data.columns || []).filter(column => !column.hidden && column.key !== 'valid');
  const body = h('tbody');
  let query = '';
  let page = 0;
  const label = h('span');
  function draw() {
    const filtered = entries.filter(entry => `${entry.handle} ${entry.title}`.toLowerCase().includes(query));
    const rows = filtered.slice(page * 25, page * 25 + 25).map(entry => {
      const metrics = columns.map(column => {
        const value = entry.values?.[column.key];
        const formatted = column.key === 'bytes' ? bytes(value) : column.key.startsWith('judge') ? percent(value) : value ?? '—';
        return h('td', {}, formatted,
          column.key === 'judge' ? h('span', { class: 'meter' },
            h('i', { style: `width:${Number(value || 0) / 10000}%` })) : null);
      });
      return h('tr', {},
        h('td', {}, `#${entry.rank}`, entry.prize_rank ? h('small', {}, ' · Prize eligible') : null),
        h('td', {}, h('div', { class: 'person' }, avatar(entry.image, entry.handle),
          link(`@${entry.handle}`, `#/u/${entry.handle}`))),
        h('td', { class: 'title-cell' }, entry.title), metrics,
        h('td', {}, h('span', { class: 'valid' }, entry.compliant ? 'Valid' : 'Review'),
          h('small', {}, entry.status)));
    });
    body.replaceChildren(...rows);
    label.textContent = `Page ${page + 1} / ${Math.max(1, Math.ceil(filtered.length / 25))}`;
    previous.disabled = page === 0;
    next.disabled = (page + 1) * 25 >= filtered.length;
  }
  const search = h('input', { type: 'search', placeholder: 'Filter builders…', 'aria-label': 'Filter leaderboard',
    oninput: debounce(event => { query = event.target.value.toLowerCase(); page = 0; draw(); }) });
  const previous = h('button', { onclick: () => { page--; draw(); } }, '← Previous');
  const next = h('button', { onclick: () => { page++; draw(); } }, 'Next →');
  draw();
  const table = h('table', {}, h('thead', {}, h('tr', {},
    ['Rank', 'Builder', 'Submission', ...columns.map(column => column.title), 'Status'].map(title => h('th', {}, title)))), body);
  return h('section', {}, crumb('Leaderboard'), eyebrow('LIVE STANDINGS'),
    h('div', { class: 'page-head' }, h('h1', {}, data.competition?.title || 'Results')),
    tabs(slug, 'leaderboard'),
    h('div', { class: 'telemetry' }, stat('Entries', entries.length),
      stat('Phase', data.phase?.title || 'Development'), stat('Metric', 'Judge win rate'), stat('Status', 'Provisional')),
    h('div', { class: 'toolbar' }, search), h('div', { class: 'table-wrap' }, table),
    h('div', { class: 'toolbar' }, previous, label, next));
}
