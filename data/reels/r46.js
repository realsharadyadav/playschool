/* Reel 46 — Streaming chat UX (GenAI · ChatBots) */
SS.registerReel({
  id: 'r46', num: 46, section: 'genai', block: 'ChatBots',
  title: 'Streaming chat UX',
  hook: 'Twenty seconds of silence loses users. **Twenty seconds of typing keeps them.**',

  scenes: [
    {
      type: 'bigtext', kicker: 'PERCEIVED LATENCY',
      title: 'Users don’t hate waiting. **They hate not knowing.**',
      sub: 'Streaming: tokens render as generated — the answer types itself.',
      narration: 'A full answer in twenty seconds, delivered all at once, feels broken. The same twenty seconds with words appearing live feels fast — engaged users report waiting contentedly, because progress is visible. That’s the whole trick of streaming: perceived latency drops even when actual latency is identical. And it’s also an engineering tool: first-token time becomes a metric you can watch.'
    },
    {
      type: 'diagram',
      nodes: [
        { e: '⚡', t: 'TTFT < 1s', s: 'first token fast — trim input!' },
        { e: '🌊', t: 'SSE stream', s: 'server-sent events' },
        { e: '➕', t: 'append tokens', s: 'UI grows the bubble' },
        { e: '✅', t: 'finish_reason: stop', s: 'enable input, save history' }
      ],
      narration: 'The flow. Time-to-first-token — under a second is the goal — and the biggest lever is trimming input: retrieval context and history ride the desk (reels 23, 44). Then the server streams chunks over server-sent events; the UI appends them to the bubble in place. When the stream ends with finish-reason stop, the UI unlocks input and the session saves both sides of the turn.'
    },
    {
      type: 'list',
      items: [
        { e: '📡', t: 'stream=True', s: 'the one flag that changes UX' },
        { e: '🔗', t: 'SSE / HTTP chunks', s: 'no websockets needed' },
        { e: '🧵', t: 'async everywhere', s: 'never block the loop (reel 12)' },
        { e: '🛑', t: 'AbortController', s: 'let users cancel — save tokens' }
      ],
      narration: 'The four implementation facts. One flag — stream equals true — flips the response from JSON to a token flow. Server-sent events carry the chunks; plain HTTP, no websocket ceremony. Your backend must be async end to end — a blocking call anywhere stalls the stream (reel 12). And ship a stop button: cancelling a useless generation saves real money at the token meter.'
    },
    {
      type: 'compare',
      cards: [
        { e: '🚫', t: 'Buffer-then-send', s: '20s silence → full text → "why so slow?"' },
        { e: '📈', t: 'True streaming', s: 'instant feedback, cancellable, measurable', win: true }
      ],
      narration: 'The honest trade-off table. Buffer-then-send: simplest backend, worst experience — and you still pay full generation time. True streaming: slightly more code, dramatically better experience, PLUS free observability — first-token time and tokens-per-second become visible per request. There is no production chatbot excuse for the left column.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'UX: shipped. **Now prove the bot is GOOD.**',
      next: 'Next · Reel 47: Chatbot evals',
      narration: 'Streaming turns slow generation into live conversation. Next: evaluation — how do you score a CHATBOT, where every answer is a little different? Conversation-level metrics, judge patterns, and red-teaming. Reel forty-seven, swipe up.'
    }
  ],

  code: {
    title: '🐍 Streaming backend + first-token discipline',
    body:
`import asyncio, httpx
from fastapi import FastAPI
from fastapi.responses import StreamingResponse

app = FastAPI()

async def token_stream(messages: list[dict]):
    async with httpx.AsyncClient(timeout=120) as client:
        async with client.stream(
            "POST",
            "http://localhost:11434/v1/chat/completions",
            json={"model": "llama3.1", "messages": messages,
                  "stream": True, "temperature": 0.3},
        ) as resp:
            async for line in resp.aiter_lines():
                if not line.startswith("data:"):
                    continue
                payload = line[5:].strip()
                if payload == "[DONE]":
                    break
                delta = httpx.jsonlib.loads(payload) \
                    ["choices"][0]["delta"].get("content", "")
                if delta:
                    yield delta          # SSE: "data: <token>\\n\\n"

@app.post("/chat")
async def chat(msg: str):
    return StreamingResponse(token_stream(
        [{"role": "user", "content": msg}]),
        media_type="text/event-stream")`,
    annot: [
      '<b>aiter_lines over client.stream</b> — async end-to-end (reel 12); one blocking call anywhere stalls every client.',
      '<b>yield per delta</b> — flush tokens immediately; buffering in the generator defeats the entire pattern.',
      '<b>media_type text/event-stream</b> — SSE contract the browser’s EventSource (or fetch reader) consumes directly.'
    ]
  },

  recap: [
    'Streaming = <b>perceived latency</b> engineering, one flag deep',
    '<b>TTFT</b> is the metric — trim input context to improve it',
    'Async end-to-end + <b>cancellable</b> — save tokens, keep users'
  ],

  quiz: {
    q: 'Your streaming chat feels slow even though tokens-per-second is high. What metric do you check first?',
    opts: [
      'Total generation time',
      'Time to first token (TTFT) — the silence before the stream starts',
      'Number of chunks per second',
      'Server CPU utilization'
    ],
    a: 1,
    why: 'High tokens-per-second with a bad experience means the DEAD AIR before the first token dominates — usually a large input (history + retrieved context) that must be processed before generation starts. TTFT is where input-trimming (windows, summaries, tighter RAG) pays off; chunk rate only affects the steady-state feel.'
  },

  notes: `
# Streaming chat UX

## The numbers that matter

| Metric | Definition | Healthy |
| --- | --- | --- |
| TTFT | request → first token | < 1.5s |
| TPOT / chunk rate | time per output token | 30–80 tok/s |
| Total latency | request → finish | question-dependent |
| Abort rate | % of streams user-cancelled | watch spikes |

TTFT is dominated by INPUT size — the model processes the whole desk before emitting anything. Levers: smaller windows (44), summaries (45), tighter top-k (39), faster input processing (some providers price/prioritize this differently).

## The plumbing

Server (the code panel): async client → SSE response. Client:
\`\`\`
const res = await fetch("/chat", {method: "POST", ...});
const reader = res.body.getReader();
// decode chunks, append to bubble
\`\`\`
No websockets: HTTP long-lived responses + chunked transfer do the job; proxies and load balancers handle them fine in 2025+.

## Robustness checklist
- **Heartbeat**: send a comment/keep-alive every 15s so proxies don’t idle-close.
- **Error mid-stream**: emit an SSE error event; the UI marks the partial answer clearly — never silently truncate.
- **Cancellation**: client abort → propagate to the provider call (close the httpx stream) — billing stops at disconnection on most providers.
- **History saving**: persist the FULL assistant message only after finish_reason=stop; partials stay marked as such.

## Beyond plain text
- **Tool-call UX**: render tool chips as they arrive (“searching docs…”) — the code panel pattern extends to agent UIs (reel 66’s approval flow).
- **Structured streaming**: with JSON mode (reel 27), stream partial JSON and progressively render cards — advanced but delightful.
- **Voice**: same stream, different renderer — speech pipelines consume deltas with ~300ms lookahead.

> **.NET ↔ Python:** ASP.NET supports SSE via \`IAsyncEnumerable\` responses; the discipline (async-all-the-way, TTFT-first) is identical. Python’s FastAPI example is 20 lines because the ecosystem treats streaming as table stakes.

Next: reel 47 — chatbot evals: scoring conversations, red-teaming, and the eval cadence.
`
});
