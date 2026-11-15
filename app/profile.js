import { h, link, avatar, money, date } from './format.js';
import { crumb, eyebrow, stat } from './views.js';

export default function profile(data) {
  const p = data.profile || data;
  const handle = p.handle || p.username || 'builder';
  const record = p.record || p.stats || p;
  const submissions = data.submissions || p.submissions || [];
  const payouts = data.payouts || p.payouts || [];
  const heading = h('div', { class: 'profile-head' },
    avatar(p.avatar_url || p.avatar || p.image, handle),
    h('div', {}, eyebrow('BUILDER PROFILE'), h('h1', {}, `@${handle}`),
      h('h2', {}, p.display_name || p.name || 'Independent builder'),
      h('p', {}, p.bio || 'Building in public on make.fun.'),
      h('small', {}, p.joined_at ? `Joined ${date(p.joined_at)}` : 'Public account')));
  const stats = h('div', { class: 'kpis' },
    stat('Entered', record.entered ?? submissions.length),
    stat('Placed', record.placed ?? 0),
    stat('Won', record.won ?? 0),
    stat('Best rank', record.best_rank ?? '—'),
    stat('Total earned', money(record.total_earned_usd || record.total_earned)));
  const historyRows = submissions.map(s => {
    const slug = s.competition?.slug || s.competition_slug || s.slug || 'makefun-frontend-01';
    return h('tr', {}, h('td', {}, link(s.title || slug, `#/bounty/${slug}`)),
      h('td', {}, link('Standings ↗', `#/bounty/${slug}/leaderboard`)),
      h('td', {}, s.status || 'Submitted'));
  });
  const payoutRows = payouts.map(payout => h('tr', {},
    h('td', {}, date(payout.created_at)), h('td', {}, money(payout.amount_usd))));
  const history = h('article', { class: 'panel' }, h('h2', {}, 'Submission history'),
    h('div', { class: 'table-wrap' }, h('table', {}, h('tbody', {}, historyRows))));
  const payments = h('aside', { class: 'panel' }, h('h2', {}, 'Payouts'),
    payoutRows.length ? h('table', {}, h('tbody', {}, payoutRows)) : h('p', { class: 'muted' }, 'No payouts recorded yet.'));
  return h('section', {}, crumb(`@${handle}`), heading, stats,
    h('div', { class: 'detail-grid' }, history, payments));
}
