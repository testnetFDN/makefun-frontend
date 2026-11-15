// The surfaces, each a function from API data to HTML. One request per view; the router
// re-renders from cache instantly on revisit, and the ticker updates deadlines in place.

import { date, dur, esc, money, takesEntries, timeLeft } from './format.js';

const pot = (b) => money(b.potUsd ?? b.rewardAmount);
const feeTag = (b) => (b.entryFeeUsd ? `<span class="tag fee">fee ${money(b.entryFeeUsd)}</span>` : '');

function stateTag(b) {
  return takesEntries(b.deadline)
    ? `<span class="tag live" data-deadline="${esc(b.deadline)}">⏳ ${timeLeft(b.deadline)}</span>`
    : '<span class="tag ended">ended</span>';
}

/** The bounty board: every open bounty with its live pot, entry fee, time left and entries. */
export function boardPage(items, sort = 'pot') {
  const open = (b) => takesEntries(b.deadline);
    const rows = [...items]
    .sort((a, b) => {
      if (open(a) !== open(b)) return open(a) ? -1 : 1; // live dulu, ended tenggelam
      if (sort === 'pot') return potNum(b) - potNum(a);
      return new Date(a.deadline) - new Date(b.deadline);
    })
    .map(
      (b) => `
      <tr>
        <td class="t"><a href="#/bounty/${encodeURIComponent(b.slug)}">${esc(b.title)}</a>
          <span class="cat">${esc(b.category ?? '')}</span></td>
        <td class="n pot">${pot(b)}</td>
        <td class="n">${b.entryFeeUsd ? money(b.entryFeeUsd) : '—'}</td>
        <td class="n" data-deadline="${esc(b.deadline)}">${stateTag(b)}</td>
        <td class="n">${b.submissionCount ?? 0}</td>
      </tr>`,
    )
    .join('');
  return `
  <div class="head"><h1>Live bounties</h1>
    <span class="sort">sort:
      <button data-sort="pot" ${sort === 'pot' ? 'class=on' : ''}>pot</button>
      <button data-sort="deadline" ${sort === 'deadline' ? 'class=on' : ''}>deadline</button>
    </span></div>
  <table class="board"><thead><tr>
    <th>Bounty</th><th class="n">Live pot</th><th class="n">Fee</th><th class="n">Time left</th><th class="n">Entries</th>
  </tr></thead><tbody>${rows}</tbody></table>
  <p class="count">${items.length} open</p>`;
}

const potNum = (b) => Number(b.potUsd ?? b.rewardAmount ?? 0);

/** One bounty: summary, description, rules, the rewards table with the live pot, dates, status. */
export function bountyPage(b) {
  const rewards = (b.rewardsNow ?? b.rewards ?? [])
    .map((r) => `<tr><td class="place">${esc(r.place ?? r.rank ?? '')}</td><td class="n">${money(r.amountUsd ?? r.usd ?? r.amount)}</td></tr>`)
    .join('');
  const skills = (b.skills ?? []).map((s) => `<span class="tag">${esc(s)}</span>`).join(' ');
  const open = takesEntries(b.deadline);
  return `
  <p><a href="#/">← all bounties</a> · <a href="#/bounty/${encodeURIComponent(b.slug)}/leaderboard">leaderboard</a></p>
  <h1>${esc(b.title)}</h1>
  <div class="meta">
    ${stateTag(b)} ${feeTag(b)}
    <span class="tag pot">pot ${pot(b)}</span>
    <span class="tag">${b.submissionCount ?? 0} entries</span>
    ${skills}
  </div>
  <p class="sum">${esc(b.summary ?? '')}</p>
  <dl class="facts">
    <dt>Live pot</dt><dd>${pot(b)}</dd>
    <dt>Entry fee</dt><dd>${b.entryFeeUsd ? money(b.entryFeeUsd) : 'none'}</dd>
    <dt>Deadline</dt><dd>${date(b.deadline)} · ${open ? `closes in ${dur(new Date(b.deadline).getTime() - Date.now())}` : 'closed'}</dd>
    <dt>Entries</dt><dd>${b.submissionCount ?? 0}</dd>
    <dt>Status</dt><dd>${open ? 'taking entries' : 'closed for entries'}</dd>
  </dl>
  ${rewards ? `<h2>Rewards</h2><table class="rewards"><thead><tr><th>Place</th><th class="n">Prize</th></tr></thead><tbody>${rewards}</tbody></table>` : ''}
  <h2>Description</h2><div class="desc">${esc(b.description ?? '')}</div>
  <h2>Rules</h2><div class="desc">${esc(b.rules ?? b.summary ?? '')}</div>`;
}

/** A bounty's leaderboard: the judge/score table with every column the API publishes. */
export function leaderboardPage(slug, data) {
  const cols = (data.columns ?? []).filter((c) => !c.hidden);
  const rows = (data.entries ?? [])
    .map(
      (e) => `<tr>
      <td class="place">${e.rank}</td>
      <td class="t"><a href="#/account/${encodeURIComponent(e.handle)}">@${esc(e.handle)}</a></td>
      <td class="t">${esc(e.title ?? '')}</td>
      ${cols.map((c) => `<td class="n">${esc(e.display?.[c.key] ?? e.values?.[c.key] ?? '')}</td>`).join('')}
    </tr>`,
    )
    .join('');
  const head = cols.map((c) => `<th class="n">${esc(c.title)}</th>`).join('');
  return `
  <p><a href="#/bounty/${encodeURIComponent(slug)}">← bounty</a></p>
  <h1>Leaderboard</h1>
  <table class="board"><thead><tr><th>#</th><th>Handle</th><th>Entry</th>${head}</tr></thead><tbody>${rows}</tbody></table>
  <p class="count">${(data.entries ?? []).length} ranked · ranked by ${esc(data.rank_key ?? '')}</p>`;
}

/** An account's public profile: record, and every solution with its score. */
export function profilePage(p) {
  const rec = p.record ?? {};
  const avatar = p.image
    ? `<img crossorigin="anonymous" src="${esc(p.image)}" alt="" width="56" height="56">`
    : `<span class="avatar">${esc((p.handle ?? '?')[0]?.toUpperCase())}</span>`;
  const sols = (p.solutions ?? [])
    .map(
      (s) => `<tr>
      <td class="t"><a href="#/bounty/${encodeURIComponent(s.competition?.slug ?? '')}">${esc(s.competition?.title ?? '')}</a></td>
      <td class="t">${esc(s.title ?? '')}</td>
      <td class="n">${s.placement ?? '—'}</td>
      <td class="n">${esc(s.score?.display ?? '')}</td>
    </tr>`,
    )
    .join('');
  return `
  <div class="who">${avatar}
    <div><h1>${esc(p.display_name ?? p.handle)}</h1>
    <p class="sum">@${esc(p.handle)} · joined ${date(p.joined_at)}${p.bio ? ` · ${esc(p.bio)}` : ''}</p></div></div>
  <dl class="facts row">
    <dt>Entered</dt><dd>${rec.competitions_entered ?? 0}</dd>
    <dt>Placed</dt><dd>${rec.competitions_placed ?? 0}</dd>
    <dt>Won</dt><dd>${rec.competitions_won ?? 0}</dd>
    <dt>Podiums</dt><dd>${rec.podium_finishes ?? 0}</dd>
    <dt>Best place</dt><dd>${rec.best_placement ?? '—'}</dd>
    <dt>Prizes</dt><dd>${money(rec.prize_usd ?? 0)}</dd>
  </dl>
  <h2>Solutions</h2>
  <table class="board"><thead><tr><th>Bounty</th><th>Entry</th><th class="n">Place</th><th class="n">Score</th></tr></thead><tbody>${sols}</tbody></table>`;
}

/** Global rankings (a bonus surface the API publishes). */
export function rankingsPage(data) {
  const rows = (data.items ?? [])
    .map((r) => `<tr><td class="place">${esc(r.rank ?? '')}</td><td class="t"><a href="#/account/${encodeURIComponent(r.handle ?? '')}">@${esc(r.handle ?? '')}</a></td><td class="n">${money(r.record?.prize_usd ?? 0)}</td></tr>`)
    .join('');
  return `<h1>Rankings by prizes won</h1><table class="board"><thead><tr><th>#</th><th>Handle</th><th class="n">Prizes</th></tr></thead><tbody>${rows}</tbody></table>`;
}
