import { get } from './api.js';
import { h } from './format.js';
import { board } from './views.js';

const content = document.querySelector('main');
let navigation;
let serial = 0;
const loadBounty = () => import('./bounty.js');
const loadLeaderboard = () => import('./leaderboard.js');
const loadProfile = () => import('./profile.js');

async function render() {
  navigation?.abort();
  navigation = new AbortController();
  const ticket = ++serial;
  document.body.dataset.shotReady = 'false';
  const parts = (location.hash.startsWith('#/') ? location.hash.substring(1) : location.pathname).split('/').filter(Boolean);
  const slug = encodeURIComponent(decodeURIComponent(parts[1] || ''));
  let path = '/competitions?limit=50';
  let view = board;
  content.setAttribute('aria-busy', 'true');
  content.replaceChildren(h('p', { class: 'loading' }, 'Loading live opportunities…'));
  try {
    if (parts[0] === 'bounty') {
      const leaderboard = parts[2] === 'leaderboard';
      view = (await (leaderboard ? loadLeaderboard() : loadBounty())).default;
      path = `/competitions/${slug}${leaderboard ? '/leaderboard' : ''}`;
    } else if (parts[0] === 'u') {
      view = (await loadProfile()).default;
      path = `/profiles/${slug}`;
    }
    const paint = data => {
      if (ticket !== serial) return;
      content.replaceChildren(view(data));
      document.title = `${data.title || data.competition?.title || data.handle || 'Bounty board'} / make.fun studio`;
      content.setAttribute('aria-busy', 'false');
      document.body.dataset.shotReady = 'true';
    };
    paint(await get(path, { signal: navigation.signal, update: paint }));
    window.scrollTo(0, 0);
  } catch (error) {
    if (error.name === 'AbortError' || ticket !== serial) return;
    content.replaceChildren(h('div', { class: 'empty', role: 'alert' },
      h('h1', {}, 'Connection paused'), h('p', {}, error.message),
      h('button', { onclick: render }, 'Try again')));
    content.setAttribute('aria-busy', 'false');
  }
}

document.querySelector('#jump').addEventListener('submit', event => {
  event.preventDefault();
  const handle = document.querySelector('#handle').value.trim() || 'testnetfdn';
  location.hash = `/u/${encodeURIComponent(handle.startsWith('@') ? handle.substring(1) : handle)}`;
});
document.addEventListener('pointerover', event => {
  const href = event.target.closest('a')?.getAttribute('href') || '';
  if (href.startsWith('#/u/')) loadProfile();
  else if (href.endsWith('/leaderboard')) loadLeaderboard();
  else if (href.startsWith('#/bounty/')) loadBounty();
}, { passive: true });
window.addEventListener('hashchange', render);
window.addEventListener('popstate', render);
render();
