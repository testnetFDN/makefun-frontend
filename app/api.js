// Small, bounded conditional cache; storage is an optional acceleration layer.
const base = 'https://make.fun/api';
const cache = new Map();
const pending = new Map();
const storageKey = 'studio-cache-v1';
try {
  for (const [key, value] of JSON.parse(sessionStorage.getItem(storageKey) || '[]')) {
    cache.set(key, value);
  }
} catch { /* Private browsing can deny storage. */ }

function remember(path, value) {
  cache.delete(path);
  cache.set(path, value);
  while (cache.size > 12) cache.delete(cache.keys().next().value);
  try {
    sessionStorage.setItem(storageKey, JSON.stringify([...cache]));
  } catch { /* A full quota does not affect navigation. */ }
}

async function refresh(path, signal) {
  const previous = cache.get(path);
  const headers = previous?.etag ? { 'If-None-Match': previous.etag } : {};
  const response = await fetch(base + path, { headers, signal });
  if (response.status === 304 && previous) return previous.data;
  if (!response.ok) throw new Error(`API ${response.status}: please try again.`);
  const data = await response.json();
  remember(path, { data, etag: response.headers.get('etag'), time: Date.now() });
  return data;
}

export async function get(path, { signal, update } = {}) {
  const previous = cache.get(path);
  let request = pending.get(path);
  if (!request || request.signal?.aborted) {
    const promise = refresh(path, signal);
    request = { promise, signal };
    pending.set(path, request);
    promise.finally(() => {
      if (pending.get(path) === request) pending.delete(path);
    }).catch(() => {});
  }
  if (previous) {
    remember(path, previous);
    request.promise.then(data => {
      if (!signal?.aborted) update?.(data);
    }).catch(() => {});
    return previous.data;
  }
  return request.promise;
}
