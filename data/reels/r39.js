/* Reel 39 — Retrieval tricks — hybrid & reranking (GenAI · RAG) */
SS.registerReel({
  id: 'r39', num: 39, section: 'genai', block: 'RAG',
  title: 'Retrieval tricks — hybrid & reranking',
  hook: 'Pure vector search misses the obvious. **Two tricks fix most of it.**',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE GAP',
      title: 'Semantic search is fuzzy. **Sometimes you need exact.**',
      sub: 'Error codes, product IDs, names — vectors glide right past them.',
      narration: 'Vector search understands meaning — and that’s exactly its failure mode. Search for “error ECONNREFUSED” and semantic search happily returns documents about connection problems in general, burying the one page that mentions the exact code. SKUs, function names, legal citations: some queries need literal matching, not vibes. That’s the first trick: hybrid.'
    },
    {
      type: 'compare',
      cards: [
        { e: '🔢', t: 'Keyword (BM25)', s: 'exact tokens, no meaning' },
        { e: '🧬', t: 'Dense (vectors)', s: 'meaning, no exactness' }
      ],
      narration: 'Neither side wins alone. Keyword search — the BM25 of Elasticsearch fame — matches exact terms perfectly and understands nothing. Dense vector search understands everything and matches exactly nothing. Side by side before the fix: complementary failure modes. Now watch the trick.'
    },
    {
      type: 'diagram',
      nodes: [
        { e: '🔢', t: 'BM25 top-50', s: 'exact matches' },
        { e: '🧬', t: 'Vector top-50', s: 'semantic matches' },
        { e: '⚖️', t: 'RRF fusion', s: 'merge the ranked lists' },
        { e: '🏆', t: 'unified top-k', s: 'best of both' }
      ],
      narration: 'Hybrid search. Run both: keyword retrieval, vector retrieval. Now merge the two ranked lists with reciprocal rank fusion — score each document by the sum of inverse ranks across the lists. A doc that’s fourth on both lists beats one that’s first on one and absent on the other. No weights to tune, robust in practice — this is the standard production recipe.'
    },
    {
      type: 'list',
      items: [
        { e: '🥈', t: 'Retrieve wide', s: 'top-50, not top-5' },
        { e: '🔍', t: 'Rerank cross-encoder', s: 'query+doc scored together' },
        { e: '🏅', t: 'Keep top-5', s: 'precision, in order' },
        { e: '💸', t: 'Costs latency+coins', s: 'per (query, doc) pair' }
      ],
      narration: 'Trick two: reranking. Retrieve wide — fifty candidates, cheap and shallow. Then a cross-encoder reranker reads the query AND each document together and scores relevance properly — the slow, accurate pass. Keep the top five. You pay: one reranker call per candidate pair, some latency. You get: the single biggest retrieval-quality jump available — often ten to twenty points of recall.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'Retrieval, mastered. **Now build the whole thing — from zero.**',
      next: 'Next · Reel 40: Build your first RAG — from scratch',
      narration: 'Hybrid plus rerank: the two moves that separate textbook RAG from production RAG. Next reel assembles everything — chunking, embedding, storage, retrieval, generation — into one working system you can read end to end. Reel forty, swipe up.'
    }
  ],

  code: {
    title: '🐍 Hybrid + rerank, the production retrieval core',
    body:
`import numpy as np

# 1) BM25-lite (keyword side) — exact tokens win here
def bm25_scores(query: str, docs: list[str], k1=1.5, b=0.75) -> list[float]:
    tokens = [d.lower().split() for d in docs]
    avg = sum(len(t) for t in tokens) / len(tokens)
    scores = []
    for toks in tokens:
        s, q = 0.0, query.lower().split()
        for term in set(q):
            f = toks.count(term)
            s += f * (k1 + 1) / (f + k1 * (1 - b + b * len(toks) / avg))
        scores.append(s)
    return scores

# 2) Vector side (reel 32/34 — embed + cosine)
#    q_vec = embed([query])[0]; vec_scores = E @ normalize(q_vec)

# 3) Reciprocal Rank Fusion — merge ANY ranked lists, no tuning
def rrf(lists: list[list[int]], k: int = 60, top: int = 10) -> list[int]:
    score = {}
    for lst in lists:
        for rank, doc in enumerate(lst):
            score[doc] = score.get(doc, 0.0) + 1.0 / (k + rank + 1)
    return [d for d, _ in sorted(score.items(),
                                 key=lambda x: -x[1])[:top]]

# usage: kw_ranked = argsort(bm25_scores(q, docs))[::-1]
#        vec_ranked = argsort(vec_scores)[::-1]
#        fused = rrf([list(kw_ranked), list(vec_ranked)])
#        final = reranker.rerank(q, [docs[i] for i in fused])[:5]`,
    annot: [
      '<b>bm25_scores</b> — TF-IDF’s smarter sibling; the k1/b constants are the classic defaults, rarely need tuning.',
      '<b>rrf(..., k=60)</b> — the standard fusion constant; merges any number of ranked lists without weights or normalization.',
      '<b>Retrieve wide (50) → fuse → rerank → keep 5</b> — the pipeline shape; each stage buys precision with a different currency.'
    ]
  },

  recap: [
    '<b>Hybrid</b> = BM25 exact + vector meaning, merged by RRF',
    '<b>Rerank</b> = cross-encoder pass over ~50 candidates → top-5',
      'Together: <b>+10–20 recall points</b> for modest latency cost'
  ],

  quiz: {
    q: 'User searches "ERR-4421 timeout" and pure vector search returns generic timeout docs while the exact error page ranks #34. Best fix?',
    opts: [
      'Increase k from 5 to 50 and hope it enters the prompt',
      'Add keyword (BM25) retrieval and fuse with RRF — exact codes match literally',
      'Fine-tune the embedding model on your error pages',
      'Ask the LLM to be more careful about error codes'
    ],
    a: 1,
    why: 'Exact identifiers are keyword-shaped information; dense embeddings spread their meaning across similar terms and dilute exact matches. Hybrid retrieval (BM25 + vectors, RRF-fused) surfaces exact-code pages while keeping semantic coverage — a pipeline change, not a model retraining project.'
  },

  notes: `
# Retrieval tricks — hybrid & reranking

## Why pure vector search under-delivers
Dense embeddings compress meaning into a fixed vector; distinctive surface details — error codes, SKUs, person names, API identifiers — contribute only a small fraction of that vector. Queries anchored on such tokens need literal matching. Symptom: the right doc is “semantically close” but ranks below top-k.

## Hybrid: BM25 + vectors + RRF

| Stage | Tool | Cost |
| --- | --- | --- |
| Keyword rank | BM25 (or Postgres tsvector, Elasticsearch) | trivial |
| Semantic rank | embedding + cosine (reels 31–32) | one embed call |
| Fuse | RRF: \`score(d) += 1/(k + rank)\` | microseconds |
| (Optional) | weighted fusion — needs tuning | fragile |

RRF’s magic: rank-based, scale-free, no normalization. k=60 is the community default; top-k per list of 50–100.

## Reranking: the quality multiplier
- **Bi-encoder** (what your embeddings do): query and doc encoded separately, similarity = cheap dot product — fast, shallow.
- **Cross-encoder** (the reranker): query and doc concatenated, passed through a transformer, relevance score — slow, deep.

Pipeline: **retrieve 50 → rerank with cross-encoder → keep top 5**. Rerankers (Cohere Rerank, bge-reranker, Jina) add ~100–500ms and per-call cost; buy them back in recall. Rerank AFTER fusion — it reorders, it doesn’t retrieve.

## When to add what

| Symptom | Add |
| --- | --- |
| Exact IDs/codes missed | hybrid keyword |
| Right chunk at rank 8–20 | reranker |
| Right chunk at rank 200+ | chunking/embedding problem (reels 32, 37) |
| Right chunk, wrong tenant | metadata filters (reel 33) |
| Everything right, answer still wrong | generation/prompt layer (25–28) |

## Latency budget, honestly
Query embed (~50ms) + ANN (~10ms) + rerank 50 docs (~200–400ms) ≈ under half a second end to end. Parallelize embed calls with generation pre-warm; cache frequent queries. Streaming the LLM answer (reel 12/46) hides most of the rerank latency anyway.

> **.NET ↔ Python:** BM25/RRF are pure functions — port anywhere. Rerankers are hosted APIs or Python-served models; from ASP.NET, call the same retrieval service (reel 36’s seam) and the stack boundary stays clean.

Next: reel 40 — the build: a complete from-scratch RAG system.
`
});
