/* Reel 14 — Errors & retries — resilient AI calls (Python · Python for GenAI) */
SS.registerReel({
  id: 'r14', num: 14, section: 'python', block: 'Python for GenAI',
  title: 'Errors & retries — resilient AI calls',
  hook: 'LLM APIs fail **constantly.** Retry like you mean it.',

  scenes: [
    {
      type: 'bigtext', kicker: 'REALITY',
      title: '429, 500, timeout — **not bugs. Weather.**',
      sub: 'Retries aren’t optional; they’re the contract.',
      narration: 'Reality check on LLM APIs: rate limits hit without warning, servers return five-hundreds under load, and requests time out mid-generation. None of this is exceptional — it’s Tuesday. Production AI code assumes failure and retries with a strategy, every single call.'
    },
    {
      type: 'diagram',
      nodes: [
        { e: '📞', t: 'call API', s: 'attempt 1' },
        { e: '💥', t: '429 / timeout', s: 'transient failure' },
        { e: '⏳', t: 'wait 1s, 2s, 4s…', s: 'exponential backoff' },
        { e: '✅', t: 'succeed (or give up)', s: 'bounded attempts' }
      ],
      narration: 'The retry loop. Call once. On a transient failure — four-twenty-nine rate limit, five-hundred, timeout — wait, then try again. But double the wait each time: one second, two, four. That’s exponential backoff, and it keeps ten retrying clients from stampeding the API together.'
    },
    {
      type: 'compare',
      cards: [
        { e: '😰', t: 'while loop + sleep', s: 'hand-rolled, buggy, no jitter' },
        { e: '🎯', t: 'tenacity decorators', s: 'declarative retries, battle-tested', win: true }
      ],
      narration: 'You could hand-roll a while loop with sleeps. Everyone’s first version is subtly wrong — no jitter, no exception filtering, infinite loops. Tenacity is the library that gets it right: decorators that declare the policy on the function, one line. Same spirit as Polly in dotnet.'
    },
    {
      type: 'list',
      items: [
        { e: '🔁', t: 'stop_after_attempt(4)', s: 'bounded — retries end' },
        { e: '📈', t: 'wait_exponential', s: '1s → 2s → 4s → 8s' },
        { e: '🎲', t: '+ jitter', s: 'randomize, avoid thundering herd' },
        { e: '🧯', t: 'retry only transient', s: '401? retrying won’t help' }
      ],
      narration: 'The policy levers. Stop after attempt four — unbounded retries are a distributed-systems crime. Exponential waits spread the load. Jitter randomizes each wait so synchronized clients don’t retry in lockstep. And filter what you retry: a four-oh-one means bad credentials — retrying that is pointless.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'Calls survive failure now. **But can you trust the OUTPUT?**',
      next: 'Next · Reel 15: Pydantic — trusting LLM output',
      narration: 'Resilience done — your calls survive the API’s bad days. New question: the call succeeded, but the model returned garbage. Next reel: Pydantic, the library that makes LLM output something you can actually trust. Swipe up.'
    }
  ],

  code: {
    title: '🐍 Retry policy with tenacity',
    body:
`import httpx
from tenacity import (
    retry, stop_after_attempt, wait_exponential_jitter,
    retry_if_exception_type,
)

class RateLimited(Exception):
    """Raised on 429/5xx/timeouts — worth retrying."""

@retry(
    stop=stop_after_attempt(4),                 # give up after 4 tries
    wait=wait_exponential_jitter(initial=1, max=10),  # 1s,2s,4s + jitter
    retry=retry_if_exception_type((RateLimited, httpx.TimeoutException)),
    reraise=True,                                # last error propagates
)
def ask_llm(client, question: str) -> str:
    resp = client.post(
        "http://localhost:11434/v1/chat/completions",
        json={"model": "llama3.1",
              "messages": [{"role": "user", "content": question}]},
        timeout=30,
    )
    if resp.status_code in (429, 500, 502, 503):
        raise RateLimited(f"transient {resp.status_code}")
    resp.raise_for_status()
    return resp.json()["choices"][0]["message"]["content"]`,
    annot: [
      '<b>@retry decorator</b> wraps the whole function — callers see one clean call; the policy lives in one declared place.',
      '<b>wait_exponential_jitter</b> doubles the wait (1s→2s→4s, capped at 10s) and adds randomness — the anti-thundering-herd fix.',
      '<b>retry_if_exception_type</b> is the filter: only transient errors retry; a 401 or validation error fails immediately.'
    ]
  },

  recap: [
    'Retries: <b>bounded attempts</b> + exponential backoff + jitter',
    '<b>tenacity</b> = declarative policy (the Polly of Python)',
    'Retry <b>transient errors only</b> — 401 fails fast'
  ],

  quiz: {
    q: 'Why add random jitter to exponential backoff when retrying a rate-limited API?',
    opts: [
      'Jitter makes each retry faster on average',
      'Synchronized clients would retry at the same instant and re-trigger the limit',
      'The API spec requires a random Retry-After value',
      'It spreads retries across different API endpoints'
    ],
    a: 1,
    why: 'Pure exponential backoff is deterministic: every client that hit the limit at time T retries at T+1s, T+2s, T+4s together — a thundering herd that re-creates the outage. Jitter randomizes each wait, decorrelating the retry storm.'
  },

  notes: `
# Errors & retries — resilient AI calls

## Failure taxonomy

| Error | Meaning | Retry? |
| --- | --- | --- |
| \`httpx.TimeoutException\` | too slow / network | yes, with backoff |
| 429 Too Many Requests | rate limited | yes — honor \`Retry-After\` |
| 500 / 502 / 503 | provider-side issue | yes |
| 401 / 403 | bad key / permissions | **no** — fix config |
| 400 | malformed request | **no** — fix the payload |
| JSON parse error | mid-stream truncation | yes, or re-request |

## The policy shape
\`\`\`
@retry(
    stop=stop_after_attempt(4),
    wait=wait_exponential_jitter(initial=1, max=10),
    retry=retry_if_exception_type((RateLimited, httpx.TimeoutException)),
)
\`\`\`
- **Bounded**: \`stop_after_attempt(4)\` — never infinite.
- **Backoff + jitter**: 1s, 2s, 4s, capped at 10s, each randomized.
- **Filtered**: only transient exceptions qualify.

## Beyond one function
- **Bulk jobs**: wrap \`asyncio.gather\` tasks each with their own retry, and bound concurrency with a semaphore — 500 parallel calls with no limit is how you get 429s forever.
- **Fallback models**: on repeated failure, fail over to a second provider (reel 33 territory).
- **Idempotency**: retries re-run side effects. If the call charges money or writes data, make the operation idempotent or check state after a timeout (reel 19, 66).

> **.NET ↔ Python:** tenacity ≈ Polly (\`Policy.Handle<...>().WaitAndRetry(...)\`). The decorator form is like an attribute in C# — \`[retry(...)]\` over the method. The failure taxonomy and backoff math are stack-independent.

## Cost warning
Retries multiply token spend. A generation that times out at the provider may still bill you — retries aren’t free. Cap \`max_tokens\`, set realistic timeouts, and log retry counts as a first-class metric.

## Observability minimum
Log: attempt number, final outcome, total wall time, token usage. When your job “hangs”, the answer is almost always in the retry loop.

Next: reel 15 — Pydantic: making LLM output structurally trustworthy.
`
});
