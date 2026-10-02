/* Reel 45 — Summarization memory (GenAI · ChatBots) */
SS.registerReel({
  id: 'r45', num: 45, section: 'genai', block: 'ChatBots',
  title: 'Summarization memory',
  hook: 'Past its window, memory becomes **a rolling brief — written by the model itself.**',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE IDEA',
      title: 'When turns slide off, **don’t delete them. Compress them.**',
      sub: 'A living summary rides along in place of ancient history.',
      narration: 'Sliding windows delete the past; pinned facts save only the lucky few. Summarization memory is the elegant middle: as old turns leave the window, fold them into a running summary — a brief, written by the model, that captures what happened and what matters. Every payload then carries: system prompt, the rolling summary, recent turns. Three layers, each cheap.'
    },
    {
      type: 'diagram',
      nodes: [
        { e: '📜', t: 'turns 1–14', s: 'slide off window' },
        { e: '✍️', t: 'summarize into brief', s: 'existing brief + old turns' },
        { e: '📄', t: 'rolling summary', s: '"User: Ana. Goal: refund…"' },
        { e: '📦', t: 'payload', s: 'system + brief + last 6 turns' }
      ],
      narration: 'The rolling mechanism. When turns one through fourteen leave the ten-turn window, they merge into the existing summary: new brief equals old brief plus those turns, compressed. The result is a living document — “User is Ana, returning order A-4421, prefers store credit, frustrated about shipping delay” — that rides in every payload alongside the recent window. Delete nothing; compress everything.'
    },
    {
      type: 'compare',
      cards: [
        { e: '🧾', t: 'Raw history (30 turns)', s: '~9K tokens, facts buried, cost per call' },
        { e: '📄', t: 'Summary + window', s: '~800 tokens, facts surfaced, 10× cheaper', win: true }
      ],
      narration: 'The economics. Thirty raw turns — nine thousand tokens of transcript, facts buried in chit-chat, billed every call. The summary plus a six-turn window: eight hundred tokens, facts surfaced at the top, an order of magnitude cheaper per turn. And unlike the raw log, the summary is legible — you can read what the bot remembers.'
    },
    {
      type: 'list',
      items: [
        { e: '🎯', t: 'Update on slide-off', s: 'trigger: oldest turn exits' },
        { e: '🧬', t: 'Merge, not rewrite', s: 'brief + old turns → new brief' },
        { e: '🔑', t: 'Structured brief', s: 'facts, goals, decisions, open Qs' },
        { e: '🧪', t: 'Summary = eval target', s: 'does the brief carry the facts?' }
      ],
      narration: 'The four disciplines. Update when turns slide off — the same trigger as pinning. Always MERGE into the existing brief; rewriting from scratch drifts and loses facts. Structure the brief — user facts, goals, decisions made, open questions — headings force completeness. And evaluate it: feed the brief-only payload old questions and check the answers survive the compression.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'Memory: architected. **Now make it FEEL instant.**',
      next: 'Next · Reel 46: Streaming chat UX',
      narration: 'Rolling summaries close the memory block — you now own what the model remembers and what it costs. Next: the experience layer. Streaming: making answers appear word by word so a twenty-second generation feels like two. Reel forty-six, swipe up.'
    }
  ],

  code: {
    title: '🐍 Rolling summary memory, complete',
    body:
`SUMMARIZE = """Merge the OLD SUMMARY and the NEW TURNS into one brief.
Keep: user facts, goals, decisions, identifiers, open questions.
Drop: pleasantries. Max 120 words. Structured with headings.

OLD SUMMARY:
{old}

NEW TURNS:
{turns}

NEW SUMMARY:"""

class SummaryMemory:
    def __init__(self, window_turns: int = 6, max_words: int = 120):
        self.full, self.window = [], window_turns
        self.summary = "(conversation just started)"
        self.max_words = max_words

    def add(self, role: str, content: str) -> None:
        self.full.append({"role": role, "content": content})
        # as soon as more than "window" turns exist, compress the excess
        excess = len(self.full) - self.window * 2
        if excess >= 2:
            old_turns = self.full[:excess]
            self.full = self.full[excess:]
            self.summary = llm(SUMMARIZE.format(
                old=self.summary,
                turns=[m["content"] for m in old_turns],
            ), temp=0.0)

    def compose(self, system: str, new_msg: str) -> list[dict]:
        brief = f"\\n\\nCONVERSATION SO FAR:\\n{self.summary}"
        return [{"role": "system", "content": system + brief},
                *self.full,
                {"role": "user", "content": new_msg}]`,
    annot: [
      '<b>Merge-on-slide-off</b> — O(1) updates per turn, no full-history re-summarization, drift bounded by the window.',
      '<b>Structured brief headings</b> (facts/goals/decisions/open) — free-form summaries quietly drop identifiers.',
      '<b>Max-words cap (~120)</b> — the brief is permanent payload; let it grow unbounded and you’ve rebuilt the original problem.'
    ]
  },

  recap: [
    'Compress slide-offs into a <b>rolling brief</b> — merge, don’t rewrite',
    'Payload = <b>system + brief + recent window</b> — ~10× cheaper than full history',
    '<b>Structure the brief</b> and eval old-question recall against it'
  ],

  quiz: {
    q: 'Why merge new turns into the EXISTING summary instead of re-summarizing the whole conversation each time?',
    opts: [
      'Merging produces more eloquent prose',
      'Cost is O(1) per slide-off instead of O(history) — and repeated full rewrites drift and drop facts',
      'The API requires summaries under a fixed size',
      'Rewriting would exceed the context window'
    ],
    a: 1,
    why: 'Rolling merge keeps each update tiny (brief + a few turns) and total cost linear in conversation length. Full re-summarization costs grow with history AND are lossier in practice — each rewrite is another chance for the model to drop a fact, so errors compound. Merge also preserves a stable artifact you can diff and debug.'
  },

  notes: `
# Summarization memory

## The payload anatomy (final form)
\`\`\`
[system prompt]
[CONVERSATION SO FAR: rolling summary, ~120 words, structured]
[last N turns — the window]
[user's new message]
\`\`\`
Reel 44’s pinned facts can fold INTO the summary (“Known facts” heading) — one artifact, one update path.

## The merge prompt, dissected
- **Keep list**: facts, goals, decisions, identifiers, open questions — tells the model what “matters” means.
- **Drop list**: pleasantries — fights transcript bloat.
- **Max words**: hard cap — the brief is permanent payload.
- **Headings**: force coverage; free text quietly omits.

## Failure modes and countermeasures

| Failure | Symptom | Fix |
| --- | --- | --- |
| Fact drop | old order number gone | “identifiers” in keep-list; spot evals |
| Summary drift | brief slowly fictionalizes | re-ground: require brief to quote turns verbatim where possible |
| Bloat | brief grows past cap | enforce max-words in prompt + truncate hard |
| Over-compression | nuances lost (“user was sarcastic”) | pin critical tone/intent facts separately |
| Merge-order bugs | new facts overwrite old | chronological merge; append new sections |

## Eval the summary like a retrieval system
Golden-set trick from reel 41: take conversations where a fact appeared at turn 2; ask questions about it at turn 30; run the bot summary-only (no window help). If recall craters, the brief format or merge prompt needs work. This test catches memory regressions BEFORE users do.

## When summaries aren’t enough
- **Precise recall** of exact wording (contracts, specs) → store raw docs and retrieve (Tier 4, reels 36/57).
- **Cross-session continuity** → persist summaries to the user profile DB.
- **Multi-agent debates** → each agent keeps its own brief; shared state belongs in the store, not prompts.

> **.NET ↔ Python:** the summary is just another string in your compose step. LLM call for merging is identical over any SDK. Cache the brief per session in Redis; update under a lock if your bot streams concurrent turns.

Next: reel 46 — streaming chat UX: perceived latency engineering.
`
});
