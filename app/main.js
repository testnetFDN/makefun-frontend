// Hash router + render pipeline. One request per view; revisits render instantly from the
// api cache (ETag revalidates in one cheap call), the ticker updates deadlines in place,
// and window.__shotReady tells a screenshot script when the data is on screen.
//
//   #/                            the board
//   #/bounty/<slug>               one bounty
//   #/bounty/<slug>/leaderboard   that bounty's leaderboard
//   #/account/<handle>            an account's public profile
//   #/rankings                    global rankings

import { board, bounty, bountyLeaderboard, profile, rankings } from './api.js';
import { boardPage, bountyPage, leaderboardPage, profilePage, rankingsPage } from './views.js';
import { esc, timeLeft } from './format.js';

const app = document.getElementById('app');

function shell(html) {
  app.innerHTML = html;
  window.__shotReady = true;
}

function loading(title) {
  window.__shotReady = false;
  app.innerHTML = `<p class="load">${esc(title)} — loading…</p>`;
}

function failed(err, back) {
  app.innerHTML = `<p class="load">failed: ${esc(err.message ?? err)}</p><p><a href="${back}">back</a></p>`;
  window.__shotReady = true;
}

async function showBoard() {
  loading('Live bounties');
  document.title = 'make.fun — live bounty board';
  let sort = sessionStorage.getItem('sort') || 'pot';
  let items = [];
  const draw = () => { shell(boardPage(items, sort)); wireSort(); };
  const wireSort = () => {
    for (const btn of app.querySelectorAll('.sort button')) {
      btn.onclick = () => { sort = btn.dataset.sort; sessionStorage.setItem('sort', sort); draw(); };
    }
  };
  try {
    items = (await board()).items ?? [];
    draw();
  } catch (err) {
    failed(err, '#/');
  }
}

async function showBounty(slug) {
  loading('Bounty');
  document.title = `bounty | make.fun`;
  try {
    const b = await bounty(slug);
    document.title = `${b.title} | make.fun`;
    shell(bountyPage(b));
  } catch (err) {
    failed(err, '#/');
  }
}

async function showLeaderboard(slug) {
  loading('Leaderboard');
  document.title = 'leaderboard | make.fun';
  try {
    shell(leaderboardPage(slug, await bountyLeaderboard(slug)));
  } catch (err) {
    failed(err, `#/bounty/${encodeURIComponent(slug)}`);
  }
}

async function showProfile(handle) {
  loading('Profile');
  document.title = `@${handle} | make.fun`;
  try {
    shell(profilePage(await profile(handle)));
  } catch (err) {
    failed(err, '#/');
  }
}

async function showRankings() {
  loading('Rankings');
  document.title = 'rankings | make.fun';
  try {
    shell(rankingsPage(await rankings()));
  } catch (err) {
    failed(err, '#/');
  }
}

function route() {
  window.__shotReady = false;
  window.scrollTo(0, 0);
  const hash = location.hash || '#/';
  const bountyM = hash.match(/^#\/bounty\/([^/]+)\/leaderboard$/);
  const oneM = hash.match(/^#\/bounty\/([^/]+)$/);
  const whoM = hash.match(/^#\/account\/([^/]+)$/);
  if (bountyM) return showLeaderboard(decodeURIComponent(bountyM[1]));
  if (oneM) return showBounty(decodeURIComponent(oneM[1]));
  if (whoM) return showProfile(decodeURIComponent(whoM[1]));
  if (hash === '#/rankings') return showRankings();
  return showBoard();
}

// deadlines tick in place every 30s — no refetch, no rebuild
setInterval(() => {
  for (const el of app.querySelectorAll('[data-deadline]')) {
    const iso = el.dataset.deadline;
    el.textContent = new Date(iso).getTime() > Date.now() ? `⏳ ${timeLeft(iso)}` : 'ended';
  }
  document.getElementById('clock').textContent = `${new Date().toISOString().slice(11, 16)} UTC`;
}, 30000);

window.addEventListener('hashchange', route);
route();
