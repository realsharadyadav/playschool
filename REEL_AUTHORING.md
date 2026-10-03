# SwipeScript AI — Reel Authoring Spec (READ FULLY BEFORE WRITING)

You are authoring reels (micro-lessons) for **SwipeScript AI**, a TikTok-style learning app for developers. Audience: working software developers (mostly .NET/C# background) becoming GenAI/Agentic developers. They asked for **technical depth and real example code** — no fluff, no analogies-for-grandma. Talk like a senior dev explaining to another senior dev.

## 0. Golden rules

1. **Real, runnable Python.** Every `code.body` must be plausible, modern (3.11+), idiomatic code using REAL libraries (`openai`, `httpx`, `pydantic`, `pandas`, `pyarrow`, `duckdb`, `pyodbc`, `sqlalchemy`, `tenacity`, `mcp`, `langgraph`…). No pseudo-code, no `your_code_here`.
2. **Every scene has `narration`** — spoken aloud by TTS. Write for the ear: contractions, direct address, no markdown. 20–38 words each (~8–14s spoken). Name-drop real APIs, parameters, file formats.
3. **Only use the scene types in §3** — never invent new types. If an idea doesn't fit a type, reshape the idea.
4. **Cross-reference other reels by number** ("you'll build this in reel 40", "remember reel 15?"). Full list is in `js/data.js`.
5. **Hook ≤ 15 words**, one `**bold**` highlight, developer tone.
6. Notes = the "full info" reference: **350–600 words** of markdown with headers, ≥1 table or `>` callout, inline `` `code` ``.
7. Recap = exactly 3 strings, ≤12 words each, one `**bold**` each.
8. Quiz = 1 question, 4 options, `a` = 0-based index of correct option, `why` = 1–3 sentences with real technical reasoning.
9. Python-section reels (r1–r19): notes MUST include a `> **.NET ↔ Python:** …` callout mapping to the .NET equivalent.
10. Verify each file with `node --check` before finishing. IDs: `r{N}` unpadded; file `data/reels/r{N}.js`.

## 1. File template (copy exactly)

```js
/* Reel {N} — {Title} ({Section label} · {Block}) */
SS.registerReel({
  id: 'r{N}', num: {N}, section: '{python|genai|agentic}', block: '{Block}',
  title: '{Title}',
  hook: '{one line, with **bold**}',

  scenes: [
    /* 5–7 scenes, each: { type, narration, ...sceneParams } */
  ],

  code: {
    title: '🐍 {short title}',
    body:
`{12–28 lines of real Python}`,
    annot: [
      '{3 bullet annotations; <b>bold</b> key terms allowed}',
      '…',
      '…'
    ]
  },

  recap: ['…', '…', '…'],

  quiz: { q: '…', opts: ['…', '…', '…', '…'], a: {0-3}, why: '…' },

  notes: `
# {Title}
{markdown body — ## sections, - bullets, > callouts, tables, \`inline code\`}
`
});
```

Section values: python (r1–19), genai (r20–48), agentic (r49–74). Blocks as listed in `js/data.js`. `code.body` is a JS template literal — escape backticks/`${` inside if any (avoid them).

## 2. Narration voice

Senior-dev-to-senior-dev: "Here's the thing —", "Watch what happens:", "This is where .NET devs get bitten:", "Same idea as Dapper, three lines." Numbers spoken as words where natural ("one thousand five hundred"). Spell out symbols the TTS must say ("dot env", "SQL Server", "parquet", "args-kwargs"). No emojis in narration.

## 3. Scene type catalog — exact schemas

- `bigtext`: `{ kicker, title, sub? }` — bold statement. `title` may contain `**bold**`.
- `bridge`: `{ kicker?, title, next }` — "what's next" teaser; `next` = chip text like 'Next · Reel 22: Tokens'.
- `list`: `{ items: [{ e: '🎯', t, s }] }` — 3–4 cards; `e` = emoji, `t` = bold title (≤6 words), `s` = one-line sub.
- `compare`: `{ cards: [{ e, t, s, win? }] }` — exactly 2 cards + VS; `win:true` highlights the right answer/side.
- `tokens`: `{ examples: [{ words: ['…','…'], cands: [{ w, p }] }], loop? }` — next-token prediction animation. 3–6 words, 2–4 candidates with % (sum < 100).
- `vector`: `{ points: [{ n, x, y, c?, hi? }], pairs?: [{ a, b, color, tag }] }` — scatter in % coords (10–90), optional similarity lines.
- `embednums`: `{ word, vals: [7 strings], dims: '×1,536', countTo }` — word → numbers animation.
- `loop`: `{ chips?: [strings] }` — agent observe→think→act cycle (auto-layout; you only pass tool-call chip labels).
- `chat`: `{ bubbles: [{ who: 'you'|'bot', text, tool? }] }` — 3–5 chat bubbles; `tool` renders a tool-chip.
- `diagram`: `{ nodes: [{ e, t, s? }], cycle?, linkLabel? }` — 3–4 nodes in a row with animated connectors.
- `arch`: `{ layers: [{ e, t, s }], cycle? }` — NEW. Vertical stack architecture diagram (3–4 layers, top→bottom flow).
- `diffapprove`: `{ sheet?, verdict?: 'wait'|'approved', rows: [{ cell, before, after, rule }] }` — NEW. Spreadsheet diff (3–5 rows). Use in Excel/SOP/DB-write contexts.

Scene plan pattern (use it): 1× `bigtext` (the problem/promise) → 2–3× interactive visuals (`tokens`/`vector`/`diagram`/`arch`/`loop`/`diffapprove`/`chat`) → 1× `list` (the pattern/steps) → 1× `bigtext` or `bridge` (payoff + next).

## 4. Quality bar (what "done" means)

- A dev who watches the reel + reads notes + runs the code can actually DO the thing.
- Notes include the gotchas that bite in production (types, injection, async pitfalls, cost).
- Quiz tests understanding, not trivia.
- No hype words ("revolutionary", "game-changer"). Concrete nouns only.

## 5. Deploy checklist (GitHub Pages + service worker)

The app is a static site served from GitHub Pages and ships with a service worker (`sw.js`) that precaches the shell. The worker caches same-origin files **with the `?v=` query stripped**, so bumping the query alone does NOT refresh returning users' caches.

With every deploy:

1. Change any code/CSS → **bump `VERSION` at the top of `sw.js`** (e.g. `ps-shell-v1` → `ps-shell-v2`). This is the release trigger: on activate, the old cache is deleted and the new shell is precached. Changing only reel *content* in `data/reels/` requires this too.
2. Optional cosmetic bump: keep `?v=` in `index.html` in sync (`?v=11`, …) so non-SW loads (first visit, dev) skip the browser cache.
3. Verify: `node --check` every changed JS file.
4. Commit + push to `main`. GitHub Pages publishes within ~1 min; verify with `curl -s https://realsharadyadav.github.io/playschool/ | grep -c "VERSION-string-you-expect"` (or check an asset URL returns 200).
5. Navigations are network-first, so visitors always get the newest HTML; assets serve cache-first offline from the precached shell.

Testing locally with the SW active: hard-refresh, or DevTools → Application → Service Workers → Unregister (then reload) to bypass a stale cache.
