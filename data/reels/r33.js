/* Reel 33 — Where to store vectors — the full menu (GenAI · Embeddings) */
SS.registerReel({
  id: 'r33', num: 33, section: 'genai', block: 'Embeddings',
  title: 'Where to store vectors — the full menu',
  hook: 'From a numpy array to a Pinecone cluster. **Choose by scale, not hype.**',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE MENU',
      title: 'Vectors can live **anywhere from RAM to a managed cluster.**',
      sub: 'Five options, honest trade-offs.',
      narration: 'You have embeddings; now they need a home. The menu runs from embarrassingly simple — a NumPy array in memory — to dedicated vector databases with billion-vector capacity. The trap is choosing by hype. Choose by scale: how many vectors, how many queries per second, and how much metadata filtering you need.'
    },
    {
      type: 'list',
      items: [
        { e: '🧮', t: 'In-memory (NumPy)', s: '< 100K vectors, prototypes' },
        { e: '🦆', t: 'DuckDB / files', s: 'parquet + SQL, offline analytics' },
        { e: '🐘', t: 'Postgres + pgvector', s: 'your existing DB gains vectors' },
        { e: '🎯', t: 'Dedicated vector DB', s: 'Qdrant, Pinecone — scale + filters' }
      ],
      narration: 'The ladder. In-memory NumPy: fine under a hundred thousand vectors — brute-force cosine in milliseconds. DuckDB over parquet: SQL analytics on files, offline batch. Postgres plus pgvector: your existing database just grows a vector column — one less system to run. And dedicated databases like Qdrant or Pinecone when you need millions of vectors, high QPS, and rich metadata filtering at once.'
    },
    {
      type: 'compare',
      cards: [
        { e: '🐘', t: 'pgvector (Postgres)', s: 'one system, joins with your data, to ~millions of vectors' },
        { e: '🛰️', t: 'Pinecone (managed)', s: 'zero ops, scales to billions — another bill + system', win: true }
      ],
      narration: 'The classic showdown. Pgvector keeps vectors beside your relational data — join embeddings with your customers table in one query, one backup, one ops team. It comfortably handles millions of vectors. Managed vector databases buy you effortless scale and specialized indexes — at the cost of another vendor, another bill, and data leaving your database. Millions of vectors or modest QPS? Postgres. Billions or heavy scale? Dedicated.'
    },
    {
      type: 'diagram',
      nodes: [
        { e: '📝', t: 'text + metadata', s: 'id, source, date, acl' },
        { e: '🔢', t: 'embedding', s: 'normalized vector' },
        { e: '🗂️', t: 'ANN index', s: 'HNSW — fast approximate search' },
        { e: '🎯', t: 'top-k + filter', s: 'similar AND where tenant=42' }
      ],
      narration: 'Whatever you pick, the anatomy is the same. A record carries the original text, its metadata — source, date, permissions — and the vector. The database builds an approximate-nearest-neighbor index — HNSW is the default champion — and at query time returns the top-k most similar records, optionally filtered by metadata, like tenant ID. That metadata filter is production-critical: never skip it.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'Menu read. **Now build one yourself — with SQL you already know.**',
      next: 'Next · Reel 34: Parquet + SQL — DuckDB',
      narration: 'The full menu, honestly priced. Before you adopt any of them, the next reel shows the under-appreciated option in action: querying a vector store with plain SQL via DuckDB — no new database, no new vendor. Reel thirty-four, swipe up.'
    }
  ],

  code: {
    title: '🐍 Vector search, zero infrastructure',
    body:
`import numpy as np

# Option 1: brute-force in memory — honest and fast enough < ~100K vectors
class TinyVectorStore:
    def __init__(self):
        self.texts, self.vectors = [], []

    def add(self, text: str, vec: np.ndarray) -> None:
        self.texts.append(text)
        self.vectors.append(vec / np.linalg.norm(vec))  # normalize at write

    def search(self, q: np.ndarray, k: int = 5) -> list[tuple[str, float]]:
        qn = q / np.linalg.norm(q)
        sims = np.array(self.vectors) @ qn            # one matmul
        top = sims.argsort()[::-1][:k]
        return [(self.texts[i], float(sims[i])) for i in top]

# Same interface EVERY store shares: add(text, vec) / search(q, k)
store = TinyVectorStore()
store.add("refunds within 30 days", np.array([0.9, 0.1, 0.0]))
store.add("warranty lasts 2 years", np.array([0.0, 0.2, 0.9]))
print(store.search(np.array([0.85, 0.15, 0.1]), k=1))`,
    annot: [
      '<b>add / search</b> — this two-method interface is the whole contract; every vector DB is a drop-in upgrade behind it.',
      '<b>Normalize at write, matmul at read</b> — reel 31’s trick means search is ONE matrix multiply, vectorized in C.',
      '<b>~100K vectors × 768 dims ≈ 300 MB</b> — fits in RAM easily; brute force is honest until your latency budget says otherwise.'
    ]
  },

  recap: [
    '< 100K vectors: <b>in-memory is fine</b> — don’t buy infrastructure',
    'Millions + relational data: <b>Postgres + pgvector</b>',
    'Billions / heavy QPS: <b>Qdrant, Pinecone</b> — managed scale'
  ],

  quiz: {
    q: 'You have 400K document vectors, an existing Postgres estate, and need to filter by customer_id. Best-fit storage?',
    opts: [
      'Pinecone — purpose-built for vectors',
      'A dedicated in-process FAISS index rebuilt nightly',
      'Postgres + pgvector — vectors and filters in the system you already run',
      'Parquet files scanned per query with DuckDB'
    ],
    a: 2,
    why: '400K vectors is comfortable pgvector territory (HNSW index), and the customer_id filter is a plain SQL WHERE — no sync jobs, no second system, backups and access control inherited from Postgres. Pinecone solves a scale problem you don’t have; per-query parquet scans ignore your latency needs.'
  },

  notes: `
# Where to store vectors — the full menu

## The decision matrix

| Store | Sweet spot | Pros | Cons |
| --- | --- | --- | --- |
| NumPy in-memory | < 100–500K vectors, prototypes | zero deps, honest brute force | rebuild on restart, no filters, no sharing |
| FAISS (library) | 1M–100M, offline/batch | blazing ANN, in-process | just an index — no DB features (no metadata, no updates) |
| DuckDB (+ VSS) | analytics over parquet | SQL over files, local | not a serving layer for high QPS |
| Postgres + pgvector | 100K–5M+, with relational data | ONE system: joins, filters, backups, permissions | index build times; not billion-scale |
| Qdrant / Weaviate / Milvus | 1M–1B, serving | purpose-built ANN + filters + ops | new system to run (or rent) |
| Pinecone / managed | scale without ops | zero infra, autoscaling | cost, data egress, vendor |

## The pgvector pattern (the .NET-team favorite)
\`\`\`
CREATE TABLE docs (
  id bigint primary key,
  content text,
  customer_id int,
  embedding vector(768)
);
CREATE INDEX ON docs USING hnsw (embedding vector_cosine_ops);
-- query: similarity + metadata filter in one SQL statement
SELECT content, embedding <=> $1 AS dist FROM docs
WHERE customer_id = 42 ORDER BY embedding <=> $1 LIMIT 5;
\`\`\`
One backup strategy. One permission model. Your EF Core app can read what your Python pipeline wrote.

## HNSW — the index to know
Hierarchical Navigable Small World: a graph where similar vectors are neighbors, searched greedily. It’s the default in pgvector, Qdrant, FAISS-as-HNSW, and most managed stores. Knobs: \`m\` (graph connectivity), \`ef_construction\` (build quality), \`hnsw.ef_search\` (query quality/recall vs speed). Tuning these is how you buy recall back.

## Metadata filtering — the production requirement
“Top-k similar” is rarely the real query. The real query is “top-k similar **among this tenant’s documents, created after March, not deleted**.” Without metadata filters you’re post-filtering a toy. With them (pgvector WHERE clauses, Qdrant/Pinecone filter DSL), it’s a product.

> **.NET ↔ Python:** pgvector is the great equalizer — your ASP.NET API and Python ingestion pipeline share one Postgres. FAISS/Qdrant/Pinecone all have .NET clients too, but the ecosystem gravity (examples, tooling) is Python-side; another case for the “Python at the AI edge” split from reel 1.

## Gotchas
- Storing vectors without the source text — you’ll need it for citations and debugging.
- Forgetting index builds are I/O-heavy — schedule them, don’t do them inline at insert time on hot tables.
- ANN means approximate: measure recall@k against brute force when tuning (reel 41 covers evaluation).

Next: reel 34 — DuckDB: SQL over your embedding files, no database server at all.
`
});
