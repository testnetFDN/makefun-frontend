import { h, money, date, countdown, markdown } from './format.js';
import { crumb, eyebrow, stat, tabs } from './views.js';

export default function bounty(b) {
  const rewards = b.rewardsNow || [];
  const brief = h('article', { class: 'panel' },
    eyebrow('THE BRIEF'), markdown(b.description || b.summary));
  if (b.rules) brief.append(h('h3', {}, 'Rules'), markdown(b.rules));
  if (b.rulesNote) brief.append(markdown(b.rulesNote));
  const rewardRows = rewards.map(reward => h('tr', {},
    h('td', {}, `#${reward.place}`),
    h('td', {}, money(reward.baseUsd)),
    h('td', {}, money(reward.feeShareUsd)),
    h('td', {}, money(reward.amountUsd))));
  const rewardPanel = h('aside', { class: 'panel' },
    h('h2', {}, 'Live rewards'),
    h('p', { class: 'muted' }, 'Base rewards + your share of the fee pot.'),
    h('div', { class: 'table-wrap' }, h('table', { class: 'compact' },
      h('thead', {}, h('tr', {}, ['Place', 'Base', 'Fees', 'Live'].map(label => h('th', {}, label)))),
      h('tbody', {}, rewardRows))));
  const heading = h('div', { class: 'page-head' },
    h('div', {}, eyebrow('LIVE BOUNTY BRIEF'), h('h1', {}, b.title)),
    h('span', { class: 'pill open' }, b.status || 'Open'));
  const metrics = h('div', { class: 'kpis' },
    stat('Base reward', money(b.rewardAmount)),
    stat('Live pot', money(b.potUsd), `+${money(b.entryFeesUsd)} fees`),
    stat('Entry fee', money(b.entryFeeUsd)),
    stat('Entries / payers', `${b.submissionCount} / ${b.entryFeePayers}`),
    stat('Time left', countdown(b.deadline), `Ends ${date(b.deadline)}`));
  const phases = h('div', { class: 'phase-strip' },
    (b.phases || []).map(phase => h('div', {},
      h('span', {}, phase.title), h('small', {}, date(phase.starts_at), ' → ', date(phase.ends_at)))));
  return h('section', {}, crumb(b.title), heading, tabs(b.slug, 'overview'),
    metrics, h('div', { class: 'detail-grid' }, brief, rewardPanel), phases);
}
