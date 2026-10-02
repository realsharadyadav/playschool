/* Reel 11 — Calling APIs with httpx (Python · Python for GenAI) */
SS.registerReel({
  id: 'r11', num: 11, section: 'python', block: 'Python for GenAI',
  title: 'Calling APIs with httpx',
  hook: 'Every AI service is an HTTP call. **httpx is your HttpClient — but nicer.**',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE TOOL',
      title: 'httpx: the one client for **every API you’ll ever call.**',
      sub: 'Sync, async, streaming, retries — one API surface.',
      narration: 'Before agents and frameworks, there is one primitive: the HTTP call. Every LLM API, every embedding service, every internal tool you’ll wire up — it’s HTTP with JSON bodies. httpx is the modern Python client for it, and it’s the same muscle whether you’re calling OpenAI or your own ASP.NET endpoints.'
    },
    {
      type: 'compare',
      cards: [
        { e: '🕸️', t: 'requests — the old way', s: 'sync-only, no HTTP/2, maintenance mode' },
        { e: '⚡', t: 'httpx — the now way', s: 'sync + async + streaming, HTTP/2', win: true }
      ],
      narration: 'You’ll see a lot of older code using the requests library. It’s fine, but it’s sync-only and effectively frozen. httpx does everything requests does, plus async support and streaming — and the OpenAI SDK itself is built on it. Learn one, know both.'
    },
    {
      type: 'diagram',
      nodes: [
        { e: '📮', t: 'httpx.post(url)', s: 'method + endpoint' },
        { e: '🧾', t: 'json= / headers=', s: 'body + auth, no serialization' },
        { e: '✅', t: 'resp.status_code', s: '200? 401? 429?' },
        { e: '📦', t: 'resp.json()', s: 'dict, ready to use' }
      ],
      narration: 'The call shape. Method plus URL: get, post, put. The json-equals keyword takes a dict and serializes it, setting the content-type header for you. Then inspect the status code — two hundred good, four-oh-one unauthorized, four-twenty-nine rate limited — and resp dot json hands you a dict.'
    },
    {
      type: 'list',
      items: [
        { e: '🔑', t: 'headers={...}', s: 'Authorization: Bearer …' },
        { e: '⏱️', t: 'timeout=30', s: 'always set one — AI calls hang' },
        { e: '🔁', t: 'raise_for_status()', s: 'turn 4xx/5xx into exceptions' },
        { e: '🌊', t: 'client = httpx.Client()', s: 'reuse connections, like HttpClient' }
      ],
      narration: 'Four habits. Pass headers for auth — bearer tokens, API keys. Always set a timeout, because AI endpoints love to hang. Raise-for-status converts errors into exceptions you can catch. And reuse one client so connections pool, exactly like you’d reuse HttpClient in dotnet.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'Sync calls work. **But AI answers are slow — so we stream.**',
      next: 'Next · Reel 12: async & streaming',
      narration: 'You can now call any API on earth from Python. One problem: LLM answers take seconds to minutes. Blocking on them is death for UX. Next reel: async and streaming — how httpx and the OpenAI SDK deliver tokens as they’re generated. Swipe up.'
    }
  ],

  code: {
    title: '🐍 httpx — the call patterns you’ll reuse',
    body:
`import httpx

API = "https://api.example.com/v1"

# One reusable client — connection pooling, like a shared HttpClient
with httpx.Client(base_url=API, timeout=30) as client:
    # POST with a JSON body — dict in, dict out
    resp = client.post(
        "/chat",
        headers={"Authorization": "Bearer sk-..."},
        json={"model": "gpt-4o", "message": "hi"},
    )
    resp.raise_for_status()          # 4xx/5xx -> exception
    data = resp.json()
    print(data["reply"])

    # GET with query params — no manual URL building
    r2 = client.get("/models", params={"limit": 10})
    names = [m["id"] for m in r2.json()["data"]]`,
    annot: [
      '<b>httpx.Client(base_url=…)</b> pools connections across calls — the HttpClient reuse rule, same reason: socket exhaustion.',
      '<b>json=</b> serializes the dict and sets Content-Type automatically; <b>params=</b> URL-encodes query strings.',
      '<b>raise_for_status()</b> is the error contract — without it, a 500 response silently flows into resp.json() and explodes weirdly.'
    ]
  },

  recap: [
    '<b>httpx.Client</b> pools connections — reuse it, like HttpClient',
    '<b>json=</b> serializes dicts; <b>params=</b> builds query strings',
    'Always set a <b>timeout</b> — AI endpoints hang'
  ],

  quiz: {
    q: 'Why is reusing one httpx.Client better than calling httpx.post(...) for every request?',
    opts: [
      'It makes the JSON parsing faster',
      'It pools TCP connections — avoids socket exhaustion and TLS re-handshakes',
      'It caches responses so the server is never hit twice',
      'It encrypts the traffic with a client-side certificate'
    ],
    a: 1,
    why: 'A new top-level call opens a fresh connection (and TLS handshake) per request. A shared Client keeps a connection pool — the same reason .NET guidance says reuse HttpClient. Under load, per-call clients exhaust ephemeral ports.'
  },

  notes: `
# Calling APIs with httpx

## httpx vs requests
| | requests | httpx |
| --- | --- | --- |
| Maintenance | feature-frozen | active |
| Async | no | \`httpx.AsyncClient\` |
| Streaming | clunky | first-class |
| HTTP/2 | no | yes |
| Used by OpenAI SDK | no | **yes** |

New code: httpx. Reading old code: requests — \`requests.get(url).json()\` translates directly.

## The call vocabulary

| You want | You write |
| --- | --- |
| GET with query string | \`client.get("/models", params={"limit": 10})\` |
| POST JSON | \`client.post(url, json={...})\` |
| Auth header | \`headers={"Authorization": "Bearer " + key}\` |
| Form data | \`data={...}\` instead of \`json\` |
| Raw bytes upload | \`content=b"..."\` |
| Check errors | \`resp.raise_for_status()\` |
| Parse response | \`resp.json()\` → dict |

## Timeouts — non-negotiable
\`timeout=30\` is seconds, total. Without it, a hung AI endpoint blocks your script forever. For LLM calls use generous-but-finite values: 60–120s for completions, and shorter (10s) for fast endpoints. Reel 14 adds retry logic on top.

## The HttpClient rules apply
1. **Reuse the client** — one per app/scope, not per call. \`with httpx.Client(...) as c:\` handles cleanup.
2. **Don’t block async code with sync calls** — in async apps use \`AsyncClient\` (reel 12).
3. **Respect 429s** — rate-limit responses include \`Retry-After\`; honor it instead of hammering (reel 14 does this properly).

> **.NET ↔ Python:** \`httpx.Client\` ≈ \`HttpClient\`, \`resp.raise_for_status()\` ≈ \`resp.EnsureSuccessStatusCode()\`, \`resp.json()\` ≈ \`JsonSerializer.Deserialize<...>\` minus the type parameter. You already know this library — it just dresses differently.

## Common failure modes
- \`ConnectError\` / \`ConnectTimeout\` — network or wrong host; check VPN/base_url.
- \`HTTPStatusError: 401\` — bad or missing API key.
- \`HTTPStatusError: 429\` — rate limited; back off exponentially.
- \`RemoteProtocolError\` — server dropped mid-response; retry, or stream for long generations.

Next: reel 12 — async and streaming, because nobody wants to watch a spinner for thirty seconds.
`
});
