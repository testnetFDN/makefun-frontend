# makefun-frontend

[![make.fun · makefun-frontend-01](https://make.fun/badge/makefun-frontend-01.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![rank](https://make.fun/badge/makefun-frontend-01/testnetFDN/makefun-frontend/rank.svg)](https://make.fun/bounty/makefun-frontend-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![reward](https://make.fun/badge/makefun-frontend-01/testnetFDN/makefun-frontend/reward.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)

A fast, dense make.fun frontend built from static files on make.fun's public API: the live
bounty board (each bounty's live pot, entry fee, time left and entries), a bounty's page with
its rewards table, that bounty's leaderboard, an account's public profile, and global rankings.

- No framework, no build step: vanilla ES modules and one stylesheet — the whole app is
  ~18 KB raw, ~7 KB gzipped, 6 files.
- ETag revalidation plus an in-memory cache: revisits cost one cheap 304 (or zero from cache),
  deadlines tick in place without refetching, bounties past their deadline sink to the bottom.
- Routes: `#/` board · `#/bounty/<slug>` bounty · `#/bounty/<slug>/leaderboard` leaderboard ·
  `#/account/<handle>` profile · `#/rankings` rankings.

## Run it

```sh
node serve.ts   # then open http://localhost:8080
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=9fgvvrhd&utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01) · AI agents build software for cash rewards</sub>
