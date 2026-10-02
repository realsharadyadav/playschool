/* Reel 41 — RAG failure modes & evaluation (GenAI · RAG) */
SS.registerReel({
  id: 'r41', num: 41, section: 'genai', block: 'RAG',
  title: 'RAG failure modes & evaluation',
  hook: 'Every RAG system fails. **The question is whether YOU find it first.**',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE LAW',
      title: 'RAG quality is **measurable. And unmeasured = broken.**',
      sub: 'Two stages, two metrics: retrieval recall, answer faithfulness.',
      narration: 'The law of RAG: systems don’t degrade loudly — they degrade plausibly. A chunking regression means answers still read beautifully and are now subtly wrong. The only defense is measurement. Two stages, two questions: did retrieval FIND the right chunk — that’s recall. And did the answer STAY FAITHFUL to it — that’s faithfulness. Measure both, on every change.'
    },
    {
      type: 'diagram',
      nodes: [
        { e: '❓', t: 'golden questions', s: '50–100 with known answers' },
        { e: '🔍', t: 'retrieve', s: 'same path as production' },
        { e: '✅', t: 'recall@k', s: 'right chunk in top-k?' },
        { e: '🤖', t: 'judge: faithful?', s: 'LLM-as-judge' }
      ],
      narration: 'The harness. Build a golden set: fifty to a hundred real questions, each with the chunk that SHOULD answer it. Run retrieval — the same code production runs — and score recall-at-k: how often the right chunk makes the top-k. Then judge faithfulness: does the generated answer only claim what the retrieved chunks support? A second, cheap LLM call does the judging.'
    },
    {
      type: 'list',
      items: [
        { e: '🕳️', t: 'Retrieval misses', s: 'right chunk not in top-k' },
        { e: '🌊', t: 'Context overflow', s: 'diluted desk (reel 23)' },
        { e: '🎭', t: 'Faithfulness drift', s: 'model goes off-script' },
        { e: '🧟', t: 'Stale knowledge', s: 'docs moved, store didn’t' }
      ],
      narration: 'The failure catalog. Retrieval misses — the right chunk never surfaces; usually chunking or embedding problems. Context overflow — too many chunks dilute attention, the middle gets lost. Faithfulness drift — the model adds knowledge from training that the chunks don’t support. And stale knowledge — the document changed, the store didn’t. Each has a different fix; measurement tells you WHICH is breaking.'
    },
    {
      type: 'compare',
      cards: [
        { e: '😶‍🌫️', t: '“Users haven’t complained”', s: 'the default monitoring strategy' },
        { e: '📏', t: 'Golden set + CI check', s: 'recall@5 and faithfulness on every change', win: true }
      ],
      narration: 'The two monitoring philosophies. Silence from users proves nothing — users silently abandon tools that answer plausibly-wrong. The professional version: a versioned golden set, re-run on every prompt change, embedding swap, or chunking tweak — recall-at-five and faithfulness as CI checks, like unit tests for your pipeline. A failed check blocks the deploy, exactly like a failing test should.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'Basic RAG: battle-tested. **Now the advanced arsenal.**',
      next: 'Next · Reel 42: Advanced RAG — HyDE & agentic RAG',
      narration: 'You can now prove a RAG system works — and catch it the day it stops. The RAG block closes with the advanced patterns: query rewriting, HyDE, and when retrieval grows an agent brain of its own. Reel forty-two, swipe up.'
    }
  ],

  code: {
    title: '🐍 The eval harness, golden-set edition',
    body:
`import httpx

GOLDEN = [
    # (question, must_appear_in_answer_chunk)
    {"q": "return window for refunds?", "chunk_id": "returns.md#2"},
    {"q": "warranty length?",          "chunk_id": "warranty.md#1"},
    # ... grow to 50-100 from real user questions
]

def recall_at_k(store, embed, k: int = 5) -> float:
    hits = 0
    for g in GOLDEN:
        ids = retrieve_ids(store, embed(g["q"]), k)   # production path
        hits += g["chunk_id"] in ids
    return hits / len(GOLDEN)

JUDGE = """You are a strict grader. Context: {ctx}
Answer: {ans}
Question: {q}
Does the answer claim ONLY what the context supports? Reply PASS or FAIL."""

def faithful(ctx: str, q: str, ans: str) -> bool:
    r = httpx.post("http://localhost:11434/v1/chat/completions",
                   json={"model": "llama3.1",
                         "messages": [{"role": "user",
                                       "content": JUDGE.format(ctx=ctx, q=q, ans=ans)}],
                         "temperature": 0.0}, timeout=60)
    return "PASS" in r.json()["choices"][0]["message"]["content"]`,
    annot: [
      '<b>Golden set from real questions</b> — 50–100 items beats 1,000 synthetic ones; harvest from actual user queries.',
      '<b>retrieve_ids uses the PRODUCTION retrieval path</b> — evaluating different code measures a system you don’t run.',
      '<b>LLM-as-judge at temperature 0</b> — cheap, consistent faithfulness checks; spot-check 10% manually to calibrate the judge itself.'
    ]
  },

  recap: [
    'Two metrics: <b>recall@k</b> (retrieval) + <b>faithfulness</b> (generation)',
    '<b>Golden set</b> = 50–100 real Q&A pairs, versioned',
    'Run it in <b>CI on every change</b> — prompts, models, chunking'
  ],

  quiz: {
    q: 'After a “harmless” prompt tweak, users say answers “feel off.” Retrieval metrics unchanged. What do you check next?',
    opts: [
      'Recall@k — retrieval must have degraded',
      'Faithfulness — the generation layer may now go beyond retrieved context',
      'Embedding model version drift',
      'Nothing — user perception isn’t measurable'
    ],
    a: 1,
    why: 'Unchanged recall with degraded answers points at the generation layer: the new prompt likely weakened the grounding constraints (e.g., dropped "ONLY from context"), letting the model blend training-data knowledge with retrieved chunks. Faithfulness judging detects exactly this; recall cannot.'
  },

  notes: `
# RAG failure modes & evaluation

## The failure catalog, with fixes

| Failure | Signature | Fix |
| --- | --- | --- |
| Retrieval miss | right chunk not in top-k | chunking (37), hybrid (39), better embeddings (32) |
| Chunk boundary split | answer half in two chunks | overlap, parent-child (37) |
| Context dilution | right chunk in context, ignored | fewer/better chunks, rerank (39), reposition key chunks at edges (23) |
| Faithfulness drift | claims beyond context | prompt grounding clauses (25/28), temperature 0 (24) |
| Stale store | answers cite old policy | scheduled re-ingest, content-hash diffing (32) |
| Filter leaks | cross-tenant results | metadata filters in ANN, not post-filtering (33) |

## Metrics that matter

| Metric | Definition | Target |
| --- | --- | --- |
| recall@k | % of golden questions whose chunk is in top-k | > 0.85 |
| precision@k | % of top-k chunks that are relevant | > 0.6 |
| faithfulness | % of answers judged context-supported | > 0.95 |
| answer relevance | judge: does it answer the question? | > 0.9 |

MRR/NDCG if you have graded relevance (rank of correct chunk) — nice, but recall@k plus faithfulness catches 90% of regressions.

## LLM-as-judge, done safely
- Use a cheap, fast model; temperature 0; a binary PASS/FAIL contract (reel 27).
- Include the EXACT retrieved context in the judge prompt — it grades grounding, not world knowledge.
- Calibrate: hand-label 50 judge outputs; if judge-human agreement < 90%, rewrite the rubric.
- Watch for judge bias (verbosity preference) — short answers sometimes get unfair FAILs.

## The golden set lifecycle
1. **Seed** from real user questions (support tickets, search logs).
2. **Annotate**: for each, the chunk-id(s) that answer it.
3. **Version** it with the code — it IS a test suite.
4. **Re-run** on every change: prompt, model, embedding, chunking, store.
5. **Expand** monthly from new production traffic.

## CI shape
\`\`\`
PR changes prompt.py -> run eval.py -> recall@5 >= 0.85 and faithfulness >= 0.95
                                        or the deploy stops.
\`\`\`
Five minutes of compute, and your RAG stops silently rotting.

> **.NET ↔ Python:** the harness is a client of your retrieval service — implementable in xUnit against the same API. The golden set is stack-neutral JSON; both stacks, one source of truth.

Next: reel 42 — advanced RAG: HyDE, query rewriting, and agentic retrieval.
`
});
