/* Reel 38 — Vector databases compared — FAISS to Pinecone (GenAI · RAG) */
SS.registerReel({
  id: 'r38', num: 38, section: 'genai', block: 'RAG',
  title: 'Vector databases compared — FAISS to Pinecone',
  hook: 'Under the hood they’re all **HNSW graphs and trade-offs.** See the machinery.',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE INDEX',
      title: 'Every vector DB is an **ANN index with a personality.**',
      sub: 'Approximate nearest neighbor: speed bought with recall.',
      narration: 'Strip the marketing and every vector database is the same machine: an approximate nearest neighbor index — usually an HNSW graph — wrapped in different packaging. Understanding that machine lets you compare honestly: it’s never “which is best”, it’s “which packaging fits my scale, filters, and ops budget.”'
    },
    {
      type: 'diagram',
      nodes: [
        { e: '➡️', t: 'entry point', s: 'top layer' },
        { e: '🔗', t: 'skip links', s: 'long-range hops' },
        { e: '🕸️', t: 'dense graph', s: 'neighbors ≈ similar' },
        { e: '🎯', t: 'greedy walk', s: 'descend to nearest' }
      ],
      narration: 'HNSW — the index inside nearly everything. Picture a graph where similar vectors are linked, stacked in layers. Search starts at the top layer with long-range skip links and greedily walks toward the query, descending layer by layer until it settles among the nearest neighbors. Few hops, millions of vectors, sub-millisecond answers — at the cost of a little recall.'
    },
    {
      type: 'list',
      items: [
        { e: '🧮', t: 'FAISS', s: 'a library, not a DB — blazing, bare' },
        { e: '🐘', t: 'pgvector', s: 'Postgres gains vectors + SQL' },
        { e: '⚡', t: 'Qdrant', s: 'open-source serving DB, filters native' },
        { e: '🛰️', t: 'Pinecone', s: 'managed scale, zero ops, per-token pricing' }
      ],
      narration: 'The contenders. FAISS: Meta’s library — the fastest brute-force-ish index you can hold, but zero database features: no updates, no filters, no server. Pgvector: vectors as a Postgres column — joins, WHERE clauses, backups, all inherited. Qdrant: a purpose-built open-source vector database — native filtering, snapshots, horizontal scale. Pinecone: the managed benchmark — zero operations, elastic scale, another line item and another egress path.'
    },
    {
      type: 'compare',
      cards: [
        { e: '🏠', t: 'Self-hosted (Qdrant/pgvector)', s: 'your hardware, your rules, your pager' },
        { e: '🏨', t: 'Managed (Pinecone/Weaviate Cloud)', s: 'their pager, their meter', win: true }
      ],
      narration: 'The real decision is operations, not technology. Self-hosted — pgvector or Qdrant on your infrastructure: full control, data never leaves, and you own the uptime. Managed: no clusters to nurse, scales while you sleep, and you pay continuously for the privilege. The recall and latency differences between serious options are smaller than the operational difference. Choose your pager policy first.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'Store chosen. **Now squeeze more recall from every query.**',
      next: 'Next · Reel 39: Retrieval tricks — hybrid & reranking',
      narration: 'The index machinery is demystified — HNSW walks graphs so you don’t scan millions of vectors. Next: retrieval craft — hybrid search, the keyword-plus-vector trick, and reranking, the cheapest quality boost in RAG. Reel thirty-nine, swipe up.'
    }
  ],

  code: {
    title: '🐍 One interface, four stores',
    body:
`import numpy as np

# The store interface every option satisfies (reel 33's contract):
class VectorStore:
    def upsert(self, ids, texts, vectors, meta): ...
    def search(self, q: np.ndarray, k=5, where=None): ...

# FAISS — in-process, fastest, YOU build the DB features:
import faiss
index = faiss.IndexHNSWFlat(768, 32)         # dims, graph connectivity M
index.add(np.array(vectors, dtype="float32"))
D, I = index.search(np.array([q]), k=5)      # D: scores, I: row ids

# Qdrant — same call, server-side with filters:
# client.search(collection="docs", query_vector=q.tolist(),
#               query_filter=Filter(must=[FieldCondition(
#                   key="tenant", match=MatchValue(value="acme"))]),
#               limit=5)

# pgvector — it's just SQL (reel 33):
# SELECT id, text FROM docs
# WHERE tenant='acme' ORDER BY embedding <=> $1 LIMIT 5;`,
    annot: [
      '<b>faiss.IndexHNSWFlat(dims, M)</b> — the graph index in two args; M controls recall/memory: 16–64 is the practical band.',
      '<b>search returns (distances, ids)</b> — FAISS gives you raw speed; metadata, filtering, and durability are your homework.',
      '<b>Same contract everywhere</b> — upsert / search(where=…) — swapping FAISS → Qdrant → pgvector is a constructor change, not a rewrite.'
    ]
  },

  recap: [
    'All serious stores ride <b>HNSW</b>: layered greedy graph walk',
    '<b>FAISS</b> = library; <b>pgvector/Qdrant</b> = databases; <b>Pinecone</b> = service',
    'The real choice is <b>ops</b>: self-hosted control vs managed meter'
  ],

  quiz: {
    q: 'You need vector search inside an existing multi-tenant Postgres app with row-level ACLs already enforced in SQL. Lowest-risk option?',
    opts: [
      'FAISS, rebuilt nightly and filtered in application code',
      'pgvector — vectors join the existing tables, ACLs and filters stay in SQL',
      'Pinecone, syncing tenant metadata as filter payloads',
      'Qdrant on new VMs with a nightly Postgres sync job'
    ],
    a: 1,
    why: 'pgvector keeps one source of truth: the embeddings live beside the rows, so tenant ACLs, joins, backups, and transactions are the ones you already have. The alternatives introduce a second system and a sync job — which eventually disagrees with the primary store at the worst moment.'
  },

  notes: `
# Vector databases compared — FAISS to Pinecone

## The ANN trade, stated honestly
Exact search = scan everything = correct but slow at scale. ANN (approximate nearest neighbor) = index the space so you visit a tiny fraction = fast, occasionally missing the true nearest. You tune the recall/speed dial with index parameters. For RAG, recall@5 of 95%+ is usually indistinguishable from perfect — users never see ranks 6+.

## HNSW knobs (all stores expose them)

| Knob | Effect | Practical range |
| --- | --- | --- |
| \`M\` (graph connectivity) | recall ↑, memory ↑ | 16–64 |
| \`ef_construction\` | build quality (recall ceiling) | 64–200 |
| \`ef_search\` / \`hnsw.ef\` | query recall ↔ latency | 64–512 |
| top-k | results returned | 5–20 (before rerank) |

Bigger \`ef_search\` literally walks further before answering — the recall/latency dial at query time.

## The contenders, scored for RAG work

| | Speed | Filters | Ops | Cost shape |
| --- | --- | --- | --- | --- |
| FAISS | fastest | DIY | you own everything | free |
| pgvector | fast to ~few M | SQL (best) | inherits Postgres | your Postgres |
| Qdrant | fast | native, good | containers/K8s | your infra |
| Milvus | very fast at scale | native | heavier footprint | your infra |
| Pinecone | fast | native | zero | per-token + storage |

## Filtered ANN — the detail that bites
Naive pattern: retrieve top-100, then filter by tenant → you may return 3 results that passed the filter, having ignored the 97 that didn’t. **Filtered ANN** applies the filter DURING the graph walk (pgvector iterative scans, Qdrant/Pinecone native filters). If your queries are always per-tenant, verify your store does filtered ANN — and benchmark recall WITH the filter, not without.

## Benchmark honestly
- Measure **recall@k against brute force** on your vectors with your filters.
- Load-test at your real QPS with your real payload sizes.
- “Pinecone vs Qdrant” blog posts benchmark toy datasets; yours won’t be.

> **.NET ↔ Python:** pgvector is again the equalizer — your ASP.NET app queries the same store as the Python pipeline. For FAISS/Qdrant-style serving from .NET, clients exist, but the ecosystem’s tooling and examples assume Python; keep the vector layer behind an HTTP seam (reel 1) and both stacks stay simple.

Next: reel 39 — retrieval craft: hybrid search and reranking, the two cheapest quality wins in RAG.
`
});
