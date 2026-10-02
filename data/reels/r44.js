/* Reel 44 — Conversation memory (GenAI · ChatBots) */
SS.registerReel({
  id: 'r44', num: 44, section: 'genai', block: 'ChatBots',
  title: 'Conversation memory',
  hook: 'Unbounded history breaks. **The sliding window is v1.**',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE PROBLEM',
      title: 'History grows forever. **The desk does not.**',
      sub: 'At some turn, something gets dropped. Choose WHAT, deliberately.',
      narration: 'Reel forty-three ended with the cost curve: every turn resends everything. Left alone, a long conversation eventually overflows the context window — or silently bankrupts you. Memory management is the art of choosing what to drop. The first strategy is the simplest one that works: the sliding window.'
    },
    {
      type: 'diagram',
      nodes: [
        { e: '🗂️', t: 'full history', s: 'stored, all of it' },
        { e: '✂️', t: 'keep last N turns', s: 'e.g. last 10' },
        { e: '📦', t: 'compose payload', s: 'system + window + new msg' },
        { e: '🧠', t: 'recent = coherent', s: '"that" still resolves' }
      ],
      narration: 'The sliding window. Store the full history in your database — never lose it. But for each API call, send only the LAST N turns: the ten most recent exchanges, say. Pronouns like “that” still resolve because the referent is usually recent. Simple, predictable, fast — and it has one glaring hole, coming right up.'
    },
    {
      type: 'tokens',
      examples: [
        { words: ['Turn', '2:', 'My'], cands: [{ w: ' order', p: 48 }, { w: ' name', p: 22 }, { w: ' dog', p: 6 }] }
      ],
      narration: 'The hole in the window. Turn two, the user said their order number. Turn twenty, they ask “where’s my order?” — and the window only holds the last ten turns. The model never sees that number, and confidently invents one. Sliding windows keep RECENT coherence and drop EARLY facts. Names, IDs, preferences — they all live in the danger zone.'
    },
    {
      type: 'list',
      items: [
        { e: '🪟', t: 'Sliding window', s: 'last N turns — simple, lossy' },
        { e: '🏷️', t: 'Entity extraction', s: 'pin names, IDs, prefs' },
        { e: '🗄️', t: 'Long-term store', s: 'facts in DB, retrieved' },
        { e: '📄', t: 'Summary memory', s: 'compress old turns (reel 45)' }
      ],
      narration: 'The memory stack that actually works. Sliding window for recency. Entity extraction: pull durable facts — names, order IDs, preferences — out of early turns and pin them into the system area. A long-term store for real persistence, retrieved when relevant. And summary memory, the next reel: compress everything old into a rolling brief. Compose all four, in that order of adoption.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'Window sliding. **Now compress what falls off.**',
      next: 'Next · Reel 45: Summarization memory',
      narration: 'The sliding window keeps things simple and breaks on early facts. The elegant fix for what falls off the edge: summarize it. Rolling summaries — how to build them, when they fail — next reel. Swipe up.'
    }
  ],

  code: {
    title: '🐍 Sliding window + pinned facts',
    body:
`class SlidingMemory:
    def __init__(self, window_turns: int = 10):
        self.full = []                # everything, stored forever
        self.window = window_turns    # turns sent to the model
        self.facts: list[str] = []    # pinned early facts

    def add(self, role: str, content: str) -> None:
        self.full.append({"role": role, "content": content})

    def pin_facts(self, llm) -> None:
        """Mine early turns for durable facts before they slide off."""
        early = self.full[:-self.window * 2]
        if not early:
            return
        prompt = ("Extract durable facts (names, IDs, preferences). "
                  "One per line. Turns: " +
                  str([m["content"] for m in early]))
        facts = llm(prompt).strip().splitlines()
        self.facts = [f for f in facts if f][:20]   # cap the pinboard

    def compose(self, system: str, new_msg: str) -> list[dict]:
        recent = self.full[-self.window * 2:]       # user+assistant pairs
        fact_block = "\\n".join(f"- {f}" for f in self.facts)
        sys_msg = system + (f"\\nKnown facts:\\n{fact_block}"
                            if self.facts else "")
        return [{"role": "system", "content": sys_msg},
                *recent,
                {"role": "user", "content": new_msg}]`,
    annot: [
      '<b>self.full never shrinks</b> — the DB of record; only the composed payload is windowed.',
      '<b>pin_facts mines EARLY turns</b> — the region about to slide off — so order numbers and names survive in the system area.',
      '<b>Cap the pinboard (~20 facts)</b> — unbounded fact lists recreate the overflow problem one level up.'
    ]
  },

  recap: [
    'Store everything; <b>send only the last N turns</b>',
    'Sliding windows <b>drop early facts</b> — pin them',
    'Stack: window → <b>pinned facts</b> → long-term store → summaries'
  ],

  quiz: {
    q: 'A support bot with a 10-turn window fails on “where’s my order?” — the order number was given in turn 3. Fix with the LEAST new infrastructure?',
    opts: [
      'Switch to a model with a 1M-token context window',
      'Extract durable facts (order numbers, names) from early turns and pin them into the system prompt',
      'Delete history older than 10 turns to save cost',
      'Ask the user to repeat their order number every conversation'
    ],
    a: 1,
    why: 'The window works for recency; the failure is an EARLY durable fact. Entity/fact extraction pins exactly that class of information into every payload — one extra LLM call per window-slide, no new infrastructure. Bigger windows defer the problem at higher cost per turn, forever.'
  },

  notes: `
# Conversation memory

## The memory hierarchy (adopt in this order)

| Tier | Keeps | Cost | Failure it fixes |
| --- | --- | --- | --- |
| 0. Full log | everything | storage only | audit, re-processing |
| 1. Sliding window | last N turns | none | context overflow, runaway tokens |
| 2. Pinned facts | durable entities | 1 LLM call per slide | “that” referencing early facts |
| 3. Rolling summary | compressed history | 1 LLM call per slide | topics/context older than window |
| 4. Long-term store | searchable knowledge | infra | cross-session memory, user profiles |

Tiers 0–2 cover most support-bot and assistant use cases. Tier 3 is next reel. Tier 4 is RAG wearing a trench coat (reels 36/57).

## Sliding window details that matter
- **Count turns, not messages**: one turn = user + assistant. \`window * 2\` messages.
- **Keep the system prompt intact**: window the USER history, never the instructions.
- **When to trigger pinning**: when the oldest kept turn is about to slide off — cheap trigger, bounded work.
- **Window size calibration**: 8–20 turns covers most dialogue coherence; longer windows buy little because models also suffer “lost in the middle” (reel 23).

## Entity/fact extraction, practical
Prompt (temperature 0): “Extract durable facts from this conversation: names, identifiers, dates, stated preferences. One per line. Skip pleasantries.” Then:
- **Dedupe** against existing pins (string similarity is fine).
- **Prefer specificity**: “order #A-4421” beats “has an order”.
- **Expire stale facts** (“my old address was…” vs “my new address is…”).

## What sliding windows can’t fix
- Multi-topic threads where topic A resurfaces after 15 turns of topic B.
- Users who reference decisions made an hour ago (“like I said before about the refund”).
- Anything requiring TRUE cross-session memory.
That’s when summaries (45) and stores (57) enter.

> **.NET ↔ Python:** \`SlidingMemory\` ≈ a scoped service holding a \`List<ChatMessage>\` plus a \`HashSet<string>\` of pinned facts; the compose step is pure function. Storage tier (Tier 0) is your usual SQL/Redis.

## Ops notes
- Log token counts per composition — memory bugs show up as sudden input-token spikes.
- Test the boundary: scripted 30-turn conversations with facts planted at turn 2 belong in your eval suite (reel 47).

Next: reel 45 — summarization memory: compressing the past without losing it.
`
});
