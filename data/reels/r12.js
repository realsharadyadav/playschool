/* Reel 12 — async & streaming (Python · Python for GenAI) */
SS.registerReel({
  id: 'r12', num: 12, section: 'python', block: 'Python for GenAI',
  title: 'async & streaming',
  hook: 'LLMs are slow. **async + streaming is how you hide it.**',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE PROBLEM',
      title: 'A 30-second LLM call is **30 seconds of nothing** — unless you stream.',
      sub: 'Users want tokens as they’re generated.',
      narration: 'Hard truth about LLMs: the first useful token takes a couple seconds, and a full answer can take thirty. Block on it and your user stares at a spinner. The fix has two parts: async, so you can do other work while waiting, and streaming, so words appear as the model generates them.'
    },
    {
      type: 'compare',
      cards: [
        { e: '🐢', t: 'Blocking call', s: 'one request at a time; the rest wait' },
        { e: '🚀', t: 'async + streaming', s: 'many calls at once; tokens flow live', win: true }
      ],
      narration: 'Compare the two worlds. Blocking: your code calls the API, the whole thread freezes, nothing else happens. Async: the await keyword yields instead of freezing, so hundreds of calls run concurrently. And streaming means each token arrives the instant it exists — like watching someone type.'
    },
    {
      type: 'diagram',
      nodes: [
        { e: '⏳', t: 'await', s: 'yield, don’t freeze' },
        { e: '🧵', t: 'event loop', s: 'one thread, many tasks' },
        { e: '📨', t: 'AsyncClient', s: 'async httpx' },
        { e: '🌊', t: 'aiter lines()', s: 'stream chunks' }
      ],
      narration: 'The machinery. Await marks a call that might wait — Python hands control to the event loop, which runs other tasks meanwhile. AsyncClient is httpx’s async flavor. And on the response, aiter-lines walks incoming chunks as they arrive — that is streaming in one word.'
    },
    {
      type: 'list',
      items: [
        { e: '🔑', t: 'async def', s: 'functions that can await' },
        { e: '⏸️', t: 'await', s: 'pause HERE, let others run' },
        { e: '🔱', t: 'asyncio.gather', s: 'run many awaits in parallel' },
        { e: '🌊', t: 'aiter_*, async for', s: 'the streaming vocabulary' }
      ],
      narration: 'The four keywords to learn. Async def declares a function that can suspend. Await suspends at that point without blocking the thread. Asyncio dot gather fans out many awaits in parallel — like Task dot WhenAll. And async-for with the aiter methods is how you consume streams.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'Fast and responsive. **Now protect the keys driving it.**',
      next: 'Next · Reel 13: .env & API keys',
      narration: 'Async and streaming: the two skills that separate a demo from an app. Next, the unglamorous one that gets people fired when skipped — managing API keys and environment config. Reel thirteen, swipe up.'
    }
  ],

  code: {
    title: '🐍 Parallel calls + live streaming',
    body:
`import asyncio
import httpx

async def summarize(client, topic):
    """One async call — await yields instead of blocking."""
    resp = await client.post(
        "http://localhost:11434/v1/chat/completions",
        json={"model": "llama3.1",
              "messages": [{"role": "user", "content": f"Summarize: {topic}"}]},
        timeout=60,
    )
    return resp.json()["choices"][0]["message"]["content"]

async def main():
    async with httpx.AsyncClient() as client:
        # Like Task.WhenAll — 3 summaries at once, not 3 × 30s
        results = await asyncio.gather(
            summarize(client, "async/await"),
            summarize(client, "tokenization"),
            summarize(client, "RAG"),
        )
        print(results)

asyncio.run(main())`,
    annot: [
      '<b>async with httpx.AsyncClient()</b> — the async flavor of reel 11’s client; sync calls inside async code block the whole loop.',
      '<b>await</b> on each call yields to the event loop — three summaries run concurrently, wall time ≈ one call, not three.',
      'Streaming builds on this: <b>async for chunk in resp.aiter_lines()</b> processes tokens as they arrive — the pattern behind reel 46’s chat UX.'
    ]
  },

  recap: [
      '<b>async def + await</b> = non-blocking calls on one thread',
      '<b>asyncio.gather</b> ≈ Task.WhenAll — parallel awaits',
      'Streams consume with <b>async for</b> / aiter_lines()'
  ],

  quiz: {
    q: 'You need to call an LLM for 50 documents. Sync httpx in a loop takes ~15 min. What’s the async win?',
    opts: [
      'async makes each single call faster to the server',
      'the calls run concurrently — wall time drops toward one call’s latency',
      'async caches results so you only pay for unique documents',
      'streaming is required before async can work'
    ],
    a: 1,
    why: 'async doesn’t speed up any single request; it removes the idle waiting between them. With gather, 50 overlapping calls finish in roughly the time of the slowest one (respecting rate limits — see reel 14), not 50 × latency.'
  },

  notes: `
# async & streaming

## Why async exists here
An LLM call is mostly **waiting**: send a request, wait seconds-to-minutes for tokens. Sync code blocks the thread for the whole wait. Async code parks that task and runs others — with one thread you overlap hundreds of in-flight calls.

## The core vocabulary

| Concept | Python | C# cousin |
| --- | --- | --- |
| Async function | \`async def f():\` | \`async Task F()\` |
| Suspend point | \`await f()\` | \`await F()\` |
| Entry point | \`asyncio.run(main())\` | \`await\` in Main / host |
| Parallel awaits | \`await asyncio.gather(a(), b())\` | \`Task.WhenAll\` |
| Async HTTP | \`httpx.AsyncClient\` | \`HttpClient\` + async |
| Stream iteration | \`async for x in s.aiter_…()\` | \`await foreach\` |

## Streaming in practice
For chat UIs (reel 46) you don’t want the full answer — you want deltas:

\`\`\`
async with client.stream("POST", url, json=payload) as resp:
    async for line in resp.aiter_lines():
        if line.startswith("data:"):
            delta = json.loads(line[5:])["choices"][0]["delta"]
            print(delta.get("content", ""), end="", flush=True)
\`\`\`

The OpenAI SDK wraps all of this: \`stream=True\` gives you an iterator of chunk objects. Same idea, less plumbing.

## The one rule that matters
**Never call a sync blocking function inside async code** — it freezes the event loop for everyone. Use \`AsyncClient\`, not \`Client\`, inside async functions; use \`asyncio.to_thread(f)\` to wrap unavoidable sync calls (like pyodbc in reel 16).

> **.NET ↔ Python:** Same async/await keywords, same mental model — \`ValueTask\` vs \`Task\` has no Python analog, but the event loop ≈ the SynchronizationContext. If you’ve written async ASP.NET, async Python will feel like home, minus the compiler magic.

## Gotchas
- Forgetting \`await\` returns a coroutine object, not the result — the classic first-day bug.
- Rate limits still apply: 500 concurrent calls will get you 429s. Bound concurrency with a semaphore (reel 14).
- Async adds complexity; for a one-shot script, sync code is honestly fine. Reach for async when you overlap I/O.

Next: reel 13 — .env files and API keys, before any of this touches production.
`
});
