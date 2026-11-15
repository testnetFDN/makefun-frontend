import { h, link, avatar, money, date } from './format.js';
import { crumb, eyebrow, stat } from './views.js';

function table(labels, rows) {
  return h('div', { class: 'table-wrap' }, h('table', { class: 'compact' },
    h('thead', {}, h('tr', {}, labels.map(label => h('th', {}, label)))),
    h('tbody', {}, rows)));
}

export default function profile(data) {
  const p = data.profile || data;
  const handle = p.handle || p.username || 'builder';
  const record = p.record || p.stats || p;
  const submissions = data.solutions || data.submissions || p.solutions || p.submissions || [];
  const payouts = data.payouts || p.payouts || [];
  const heading = h('div', { class: 'profile-head' },
    avatar(p.avatar_url || p.avatar?.url || p.image, handle),
    h('div', {}, eyebrow('BUILDER PROFILE'), h('h1', {}, `@${handle}`),
      h('h2', {}, p.display_name || p.name || 'Independent builder'),
      h('p', {}, p.bio || 'Building in public on make.fun.'),
      h('small', {}, p.joined_at ? `Joined ${date(p.joined_at)}` : 'Public account')));
  const stats = h('div', { class: 'kpis' },
    stat('Entered', record.competitions_entered ?? submissions.length),
    stat('Placed', record.competitions_placed ?? 0),
    stat('Won', record.competitions_won ?? 0),
    stat('Best rank', record.best_placement ?? '—'),
    stat('Total earned', money(record.prize_usd)));
  const historyRows = submissions.map(s => {
    const slug = s.competition?.slug || s.competition_slug;
    const title = s.competition?.title || slug || 'Competition';
    return h('tr', {},
      h('td', {}, slug ? link(title, `#/bounty/${encodeURIComponent(slug)}`) : title),
      h('td', {}, s.title || 'Untitled submission'),
      h('td', {}, s.score?.display ?? '—'),
      h('td', {}, s.placement != null ? `#${s.placement}` : s.status || s.competition?.status || 'Submitted'));
  });
  const payoutRows = payouts.map(payout => h('tr', {},
    h('td', {}, date(payout.paid_at || payout.created_at)),
    h('td', {}, payout.competition?.title || 'Competition'),
    h('td', {}, payout.place != null ? `#${payout.place}` : '—'),
    h('td', {}, money(payout.amount_usd))));
  const history = h('article', { class: 'panel' }, h('h2', {}, 'Submission history'),
    table(['Competition', 'Submission', 'Score', 'Status / placement'], historyRows));
  const payments = h('aside', { class: 'panel' }, h('h2', {}, 'Payouts'),
    table(['Date', 'Competition', 'Place', 'Amount'], payoutRows),
    payouts.length ? null : h('p', { class: 'muted' }, 'No payouts recorded yet.'));
  return h('section', {}, crumb(`@${handle}`), heading, stats,
    h('div', { class: 'detail-grid' }, history, payments));
}
