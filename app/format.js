// All API text enters the document as text nodes, never HTML.
export function h(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null || value === false) continue;
    if (key.startsWith('on')) node.addEventListener(key.substring(2), value);
    else if (key === 'class') node.className = value;
    else node.setAttribute(key, value);
  }
  node.append(...children.flat(Infinity).filter(x => x != null));
  return node;
}
export const link = (text, href, cls) => h('a', { href, class: cls }, text);
export const money = value => Number(value || 0).toLocaleString('en-US', {
  style: 'currency', currency: 'USD', maximumFractionDigits: 2,
});
export const bytes = value => `${(Number(value || 0) / 1024).toFixed(1)} KB`;
export const percent = value => value == null ? '—' : `${(Number(value) / 10000).toFixed(2)}%`;
export const date = value => value ? new Date(value).toLocaleString('en-US', {
  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC',
}) + ' UTC' : '—';
export function timeLeft(value) {
  const seconds = Math.max(0, Math.floor((new Date(value) - Date.now()) / 1000));
  if (!seconds) return 'Ended';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor(seconds % 86400 / 3600);
  return days ? `${days}d ${hours}h left` : `${hours}h ${Math.floor(seconds % 3600 / 60)}m left`;
}
export const countdown = value => h('span', { 'data-deadline': value }, timeLeft(value));
setInterval(() => {
  for (const node of document.querySelectorAll('[data-deadline]')) {
    const text = timeLeft(node.dataset.deadline);
    if (node.textContent !== text) node.textContent = text;
  }
}, 1000);

export function avatar(image, name = '?') {
  const box = h('span', { class: 'avatar', 'aria-label': name }, name.substring(0, 2).toUpperCase());
  if (image) {
    const url = new URL(image, 'https://make.fun');
    if (url.origin === 'https://make.fun') {
      const img = h('img', { src: url.href, crossorigin: 'anonymous', alt: '', loading: 'lazy' });
      img.addEventListener('error', () => img.remove());
      box.append(img);
    }
  }
  return box;
}
export function reconcileChildren(parent, items, key, render) {
  const old = new Map([...parent.children].map(node => [node.dataset.key, node]));
  const nodes = items.map(item => {
    const id = String(key(item));
    const node = old.get(id) || render(item);
    node.dataset.key = id;
    return node;
  });
  parent.replaceChildren(...nodes);
}
export function markdown(text) {
  const box = h('div', { class: 'prose' });
  for (const line of String(text || '').split('\n')) {
    if (!line.trim()) continue;
    const heading = line.match(/^(#{1,3})\s+(.*)/);
    const bullet = line.match(/^[-*]\s+(.*)/);
    const node = h(heading ? 'h3' : 'p', {}, heading ? heading[2] : bullet ? `• ${bullet[1]}` : line);
    box.append(node);
  }
  return box;
}
export const debounce = (fn, delay = 180) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};
