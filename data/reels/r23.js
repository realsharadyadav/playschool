/* Reel 23 — Context window — the model’s desk (GenAI · Core Concepts) */
SS.registerReel({
  id: 'r23', num: 23, section: 'genai', block: 'Core Concepts',
  title: 'Context window — the model’s desk',
  hook: 'The model has a desk, not a filing cabinet. **Overflow spills on the floor.**',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE METAPHOR',
      title: 'Everything the model knows is **on one desk.**',
      sub: 'System prompt + history + your message + its reply. All at once.',
      narration: 'A model has no memory between calls. Everything it considers in one answer — the system prompt, the conversation history, retrieved documents, your current question, and space for its reply — must fit on one desk: the context window. Overflow doesn’t file away; it gets truncated or errors.'
    },
    {
      type: 'diagram',
      nodes: [
        { e: '📋', t: 'System prompt', s: 'permanent desk space' },
        { e: '💬', t: 'Chat history', s: 'grows every turn' },
        { e: '📚', t: 'Retrieved docs', s: 'RAG chunks (reel 36)' },
        { e: '🆓', t: 'Room to answer', s: 'output tokens reserve' }
      ],
      narration: 'The desk, section by section. The system prompt is permanent real estate — it lives in every single call. Chat history grows turn by turn. Retrieved documents pile on when you do RAG. And you must leave room for the answer itself — output tokens come out of the same budget.'
    },
    {
      type: 'compare',
      cards: [
        { e: '🪟', t: 'Small window (4K–8K)', s: 'cheap, fast — summary tasks' },
        { e: '🏟️', t: 'Large window (128K–1M)', s: 'pricey — but "lost in the middle"', win: true }
      ],
      narration: 'Windows come in sizes. Small ones are cheap and fast — fine for classification and short summaries. Large ones hold whole codebases — at a price, and with a catch: models attend best to the start and end of context. Information buried in the middle gets under-used. Bigger desk, not perfect memory.'
    },
    {
      type: 'list',
      items: [
        { e: '⚖️', t: 'Bigger ≠ free', s: 'price scales with context' },
        { e: '✂️', t: 'Middle gets lost', s: 'put key facts first/last' },
        { e: '🔁', t: 'History compounds', s: 'long chats overflow silently' },
        { e: '🧹', t: 'Prune & summarize', s: 'memory reels: 44–45' }
      ],
      narration: 'Four operating rules. Cost scales with tokens sent, so huge windows inflate every call. The middle of long context gets lost — lead and close with what matters. Long conversations compound history until something silently drops. And the fix is active pruning — that’s exactly what reels forty-four and forty-five teach.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'Space managed. **Now control what the model DOES with it.**',
      next: 'Next · Reel 24: Temperature, top-p & max_tokens',
      narration: 'The desk is sized and organized. Next: the three dials that steer generation — temperature, top-p, and max tokens. Small numbers, huge behavioral difference. Reel twenty-four, swipe up.'
    }
  ],

  code: {
    title: '🐍 Fit the budget or fail loudly',
    body:
`import tiktoken

WINDOW = 8_192          # e.g. a small model
RESERVED_OUTPUT = 512

def fit(history: list[dict], system: str, next_msg: str) -> bool:
    """True if everything fits with room to answer."""
    enc = tiktoken.get_encoding("o200k_base")
    total = len(enc.encode(system))
    for m in history:
        total += len(enc.encode(m["content"]))
    total += len(enc.encode(next_msg))
    return total + RESERVED_OUTPUT <= WINDOW

# History grows forever — this check catches overflow BEFORE the API call
msgs = [{"role": "user", "content": "contract review part " + str(i)}
        for i in range(1, 400)]

while msgs and not fit(msgs, "You are a legal assistant.", "continue"):
    msgs.pop(1)          # drop oldest turns (keep system + latest)

print(f"kept {len(msgs)} messages — fits: {fit(msgs, 'sys', 'go')}")`,
    annot: [
      '<b>Count BEFORE the API call</b> — overflow should be your design decision (what to drop), never the provider’s error.',
      '<b>msgs.pop(1)</b> drops the oldest user turn — index 0-style sliding window over history; reel 44 does this properly.',
      '<b>RESERVED_OUTPUT</b> — the answer needs desk space too; forgetting this is the classic “fits but can’t reply” bug.'
    ]
  },

  recap: [
    'One desk per call: <b>system + history + docs + answer</b>',
    'Middle of long context gets **lost** — order matters',
    '<b>Count and prune before sending</b>, never overflow silently'
  ],

  quiz: {
    q: 'A RAG pipeline stuffs 90 retrieved chunks into a 128K context and the answers get WORSE. Most likely reason?',
    opts: [
      'The model cannot read more than 32K tokens',
      'Relevant chunks landed in the middle — the model under-attends to mid-context',
      'Retrieved documents consume output tokens',
      'The system prompt was pushed out of the window'
    ],
    a: 1,
    why: '“Lost in the middle”: attention is strongest at context start and end; chunks buried mid-window are effectively skimmed. More context isn’t better context — retrieval quality and placement beat raw volume (reels 37 and 39 cover the fixes).'
  },

  notes: `
# Context window — the model’s desk

## The accounting identity
\`\`\`
tokens_used = system_prompt + sum(history) + retrieved_docs + user_msg
must satisfy: tokens_used + max_output ≤ context_window
\`\`\`
Every call pays for the WHOLE desk, not just the new message. A 20-turn chat resends all 20 turns each time — that’s why long conversations get expensive fast.

## Window sizes (order of magnitude, 2025–26)

| Tier | Typical | Good for |
| --- | --- | --- |
| Small | 4K–8K | classification, extraction, short Q&A |
| Mid | 32K–128K | most RAG, agent loops, code review |
| Large | 200K–1M | repo-scale analysis, long-document work |

Bigger windows cost more per call and are slower. Don’t buy desk you don’t use.

## The “lost in the middle” effect
Benchmarks show accuracy is best for facts at the START and END of the context, dropping in the middle. Practical consequences:
- In RAG: place the strongest chunks first/last, or rerank so the best sits at an edge (reel 39).
- In instructions: repeat the critical constraint near the end, right before the question.
- In code review prompts: the diff matters most — don’t bury it under 40 files of surrounding text.

## Management strategies

| Strategy | Where |
| --- | --- |
| Sliding window (drop oldest turns) | reel 44 |
| Summarize old turns into one message | reel 45 |
| Retrieve only what fits (top-k) | reels 36–40 |
| Count tokens pre-flight | the code panel above |
| Reserve output headroom | always |

## Failure modes to expect
- **Silent truncation**: some stacks trim the middle or oldest message instead of erroring — check your SDK’s behavior.
- **System prompt eviction**: pathological cases where history crowds out instructions; cap history size explicitly.
- **Cost spiral**: 100K of history per turn × 100 users — measure tokens per conversation, not per message.

Next: reel 24 — temperature, top-p, and max_tokens: the dials that shape every output.
`
});
