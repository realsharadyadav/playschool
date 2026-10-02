/* Reel 57 — Agent memory (Agentic · Agent Fundamentals) */
SS.registerReel({
  id: 'r57', num: 57, section: 'agentic', block: 'Agent Fundamentals',
  title: 'Agent memory',
  hook: 'Every session starts as a stranger. **Memory ends that.**',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE PROBLEM',
      title: 'The context window is a **short-term memory only.**',
      sub: 'It resets every run. Long-term memory is a design choice.',
      narration: 'An agent’s context is its working memory — vivid, fast, and GONE the moment the run ends. Every new session, the brain wakes up a stranger: no memory of yesterday’s tasks, no record of user preferences, no lessons from past failures. Human memory has three stores — working, episodic, long-term semantic — and serious agents need the same architecture, deliberately designed.'
    },
    {
      type: 'list',
      items: [
        { e: '🧠', t: 'Working memory', s: 'the context window itself' },
        { e: '📖', t: 'Episodic memory', s: 'logs of past runs — searchable' },
        { e: '🏛️', t: 'Semantic memory', s: 'facts, preferences, distilled lessons' },
        { e: '🗂️', t: 'Procedural memory', s: 'playbooks: how we do things here' }
      ],
      narration: 'The four stores. Working memory: the context window — cap it, summarize it, but it’s ephemeral by nature. Episodic: the structured logs of past runs — traces, plans, outcomes — stored and searchable, so the agent can recall “what happened last Tuesday.” Semantic: distilled facts — user preferences, system state, lessons learned — the agent’s knowledge about the world. And procedural: playbooks and SOPs — not memories OF events, but memories of HOW — which is exactly what reel sixty-six’s Excel agent runs on.'
    },
    {
      type: 'diagram',
      nodes: [
        { e: '🏃', t: 'agent runs', s: 'traces, results, reflections' },
        { e: '⛏️', t: 'distillation', s: 'extract durable facts & lessons' },
        { e: '🗄️', t: 'memory store', s: 'DB + vector index' },
        { e: '🔁', t: 'inject at start', s: 'relevant memories → context' }
      ],
      narration: 'The memory lifecycle. Runs produce traces — reel fifty-four’s ReAct logs, fifty-six’s reflections. Distillation is the janitorial step most teams skip: after each run, an LLM pass extracts what’s DURABLE — the user prefers CSV, the staging table lives in schema X, retries fail when the VPN drops. The store keeps these as records plus a vector index for fuzzy recall. And at the start of each new run, retrieval injects the relevant memories into the working context. Run, distill, store, recall — the loop that compounds.'
    },
    {
      type: 'compare',
      cards: [
        { e: '🗑️', t: 'No memory', s: 'every run re-discovers everything' },
        { e: '💾', t: 'Memory, designed', s: 'users recognized, lessons retained, runs accelerate', win: true }
      ],
      narration: 'The payoff asymmetry. Without memory, an agent that reconciled your spreadsheets yesterday starts from zero today — re-learning formats, re-failing the same edge cases. With designed memory, runs accelerate: preferences apply instantly, yesterday’s reflections preempt today’s errors, and users feel KNOWN — the difference between a tool and an assistant. The cost is real — storage, distillation passes, retrieval — but it’s the cheapest intelligence you can buy.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'One brain, remembering. **Now several brains, collaborating.**',
      next: 'Next · Reel 58: Multi-agent teams',
      narration: 'Memory makes an agent continuous across time. The next scaling axis is width: multiple agents, each specialized, collaborating on problems one brain can’t hold. Multi-agent teams — patterns and pitfalls. Reel fifty-eight, swipe up.'
    }
  ],

  code: {
    title: '🐍 The memory layer: write, index, recall',
    body:
`import duckdb, httpx

# The store: a table of memories (facts + lessons), vector-searchable.
def remember(kind: str, text: str, vec: list[float]) -> None:
    duckdb.sql(f"""
        INSERT INTO memories VALUES
        ('{kind}', '{text}', {list(vec)})""")

DISTILL = """From this run trace, extract durable memories.
Categories: user_preference | system_fact | lesson_learned | playbook_step.
Skip anything run-specific. One per line, format: CATEGORY: text

TRACE: {trace}"""

def distill(trace: str) -> None:
    out = llm(DISTILL.format(trace=trace[-4000:]), temp=0.0)
    for line in out.splitlines():
        if ":" in line:
            kind, text = line.split(":", 1)
            remember(kind.strip(), text.strip(),
                     embed(text.strip())[0].tolist())

def recall(query: str, k: int = 5) -> list[str]:
    qv = embed([query])[0]
    rows = duckdb.sql(f"""
        SELECT text FROM memories
        ORDER BY list_cosine_similarity(embedding, {list(qv)})
        LIMIT {k}""").fetchall()
    return [r[0] for r in rows]

# Startup: relevant memories become part of the system prompt.
context = "\\n".join(recall(user_goal))`,
    annot: [
      '<b>Distillation is a separate LLM pass</b> — extraction from raw traces; inline memory-writing mid-run pollutes focus and context.',
      '<b>Categories are load-bearing</b> — \`lesson_learned\` vs \`user_preference\` get different trust, TTLs, and injection styles.',
      '<b>recall() at startup, not mid-loop</b> — memory informs the plan; mid-loop retrieval is the reel-42 agentic-RAG pattern, used sparingly.'
    ]
  },

  recap: [
    'Four stores: <b>working, episodic, semantic, procedural</b>',
    'Lifecycle: <b>run → distill → store → recall</b>',
    'Memory is <b>injected at startup</b>, not searched mid-loop'
  ],

  quiz: {
    q: 'Why is a separate “distillation” pass (extracting durable memories from traces) better than having the agent write memories inline during its run?',
    opts: [
      'Inline writes would exceed the API rate limit',
      'Mid-run, the agent lacks the full picture and its memory-writes compete with task focus; a post-run pass sees the whole trace and writes only what proved durable',
      'Traces are stored in a different database from memories',
      'Distillation passes are required by data-protection law'
    ],
    a: 1,
    why: 'During a run, the agent can\'t know which details will matter later — inline writes tend to capture noise (transient errors, temporary state) while consuming context and attention. A post-run distillation sees outcomes and reflections (56), so it can distinguish "the VPN drops every morning" (durable lesson) from "row 42 was missing today" (incident). Separation of execution from consolidation is the same reason humans journal after the day, not during it.'
  },

  notes: `
# Agent memory

## The four-store architecture

| Store | Implementation | Lifetime |
| --- | --- | --- |
| Working | context window (+ reel 44/45 windowing & summaries) | one run |
| Episodic | run traces in DB/S3, metadata-indexed | months |
| Semantic | distilled facts table + vector index | until invalidated |
| Procedural | playbooks/SOPs as prompt-able documents | versioned |

Episodic answers "what happened"; semantic answers "what is true"; procedural answers "how we do it". Conflating them is the most common memory-design bug.

## Distillation rules that keep memory clean
- **Post-run, not inline** (the panel’s lesson).
- **Categorize on write** — preferences, facts, lessons, procedures get different handling.
- **TTL and review**: lessons expire (the VPN got fixed); preferences get confirmed. Stale memory is worse than none — it confidently misleads.
- **Provenance on every memory**: which run, which trace offset. Debugging "where did the agent learn THAT?" must be answerable.

## Recall design
- **Startup injection**: top-k memories by goal-similarity join the system prompt (the panel). Cheap, predictable.
- **Mid-loop recall** = agentic RAG (reel 42): the agent searches memory as a tool. Powerful, budget it.
- **Recency + relevance hybrid**: yesterday’s lessons should outrank a vaguely-relevant three-month-old one — blend vector score with time decay.

## Memory hygiene (the unglamorous truth)
- **Writes need gates**: not every run produces a lesson. Low-value memories are spam; require the distiller to justify.
- **User-controlled memory**: "forget my X" is a product feature and a privacy obligation — deletions must actually delete (embeddings included).
- **Injection budget**: memories are permanent context-tax (reel 23). Cap the startup block (~500 tokens); more memory ≠ better memory.

## Where this pays off concretely
- Support agents: user history, past ticket resolutions (reel 63).
- Excel/SOP agents: the SOP library IS procedural memory (reel 66).
- Coding agents: codebase conventions, past review feedback.

> **.NET ↔ Python:** the store is a DB — Postgres/pgvector again. Distillation is one LLM call; recall is one query. The architecture is stack-neutral; Python keeps the tooling edge.

Next: reel 58 — multi-agent teams: when one brain isn’t enough.
`
});
