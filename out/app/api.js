// make.fun public API client: GET only, ETag revalidation + in-memory cache.
// The API binds ETags to the minute: an If-None-Match inside the same minute answers 304,
// so revisiting a view costs one cheap round trip (or zero, from memory) instead of a refetch.

const API = 'https://make.fun/api';
const mem = new Map(); // path -> { etag, data }

async function get(path) {
  const hit = mem.get(path);
  const init = hit && hit.etag ? { headers: { 'If-None-Match': hit.etag } } : {};
  let res;
  for (let attempt = 0; ; attempt++) {
    try {
      res = await fetch(API + path, init);
      break;
    } catch (err) {
      if (attempt >= 2) throw err; // jaringan sempoyot: coba lagi sampai 2x
      await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
    }
  }
  if (res.status === 304 && hit) return hit.data;
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  const data = await res.json();
  mem.set(path, { etag: res.headers.get('ETag'), data });
  return data;
}

export const board = (limit = 60) => get(`/competitions?status=open&limit=${limit}&activity=times`);
export const bounty = (slug) => get(`/competitions/${encodeURIComponent(slug)}`);
export const bountyLeaderboard = (slug) => get(`/competitions/${encodeURIComponent(slug)}/leaderboard`);
export const profile = (handle) => get(`/profiles/${encodeURIComponent(handle)}`);
export const rankings = (order = 'paid', limit = 60) => get(`/rankings?order=${order}&limit=${limit}`);
