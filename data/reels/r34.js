/* Reel 34 — Parquet + SQL — query your embeddings with DuckDB (GenAI · Embeddings) */
SS.registerReel({
  id: 'r34', num: 34, section: 'genai', block: 'Embeddings',
  title: 'Parquet + SQL — query your embeddings with DuckDB',
  hook: 'Your embedding store can be **a folder of files plus one SQL engine.**',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE DARK HORSE',
      title: 'DuckDB: a data warehouse **that lives in a pip package.**',
      sub: 'SQL over parquet, CSV, JSON — no server, no cluster.',
      narration: 'The most under-hyped tool in this whole course. DuckDB is an analytical SQL engine that runs in-process — pip install duckdb, and you have a columnar database that queries parquet files directly. No server, no container, no cluster. For embeddings and analytics alike, it collapses “spin up infrastructure” into “write a SQL string.”'
    },
    {
      type: 'diagram',
      nodes: [
        { e: '📁', t: 'kb/*.parquet', s: 'your vector files' },
        { e: '🦆', t: 'duckdb.sql(...)', s: 'in-process engine' },
        { e: '📐', t: 'list_cosine_similarity', s: 'vector math in SQL' },
        { e: '🎯', t: 'top-k rows', s: 'filtered + sorted' }
      ],
      narration: 'The pipeline. Your embeddings sit in parquet files — reel eighteen’s format, reel thirty-two’s cache pattern. DuckDB reads them in place, no import step. Its vector extension exposes cosine similarity as a SQL function. And the query is ordinary SQL: compute similarity, filter by metadata, order, limit. Five lines.'
    },
    {
      type: 'compare',
      cards: [
        { e: '🏗️', t: 'Vector DB setup', s: 'server/container, schema sync, index tuning' },
        { e: '🦆', t: 'DuckDB over files', s: 'pip install; the files ARE the store', win: true }
      ],
      narration: 'Why bother, when vector databases exist? Because setup is the hidden tax. A vector database is a server: provisioning, schema mapping, keeping it in sync with your files. DuckDB skips all of it — your parquet folder is the store, versioned by Git, copied by scp, processed by pandas. For gigabyte-scale corpora and offline analytics, it’s the shortest path by miles.'
    },
    {
      type: 'list',
      items: [
        { e: '💰', t: 'Free & local', s: 'no per-query pricing, data stays put' },
        { e: '🔄', t: 'Plays with pandas', s: '.df() → DataFrame, zero copy' },
        { e: '📏', t: 'Scale honesty', s: 'great to ~10–100M rows/file GBs' },
        { e: '🚀', t: 'Batch evals', s: 'score 10K queries in one query' }
      ],
      narration: 'The four wins. It’s free and local — no meter running, no data leaving the machine. It interops with pandas perfectly: any query becomes a DataFrame with one method call. It scales honestly to tens of millions of rows in gigabyte-class files. And for RAG evaluation — scoring thousands of queries at once — it turns a script into a single SQL statement.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'Storage conquered. **Now aim it: search → answers.**',
      next: 'Next · Reel 35: Embeddings → search & RAG',
      narration: 'You can now store, index, and query vectors with nothing but files and SQL. Next reel connects the last wire: turning “similar chunks” into actual answers — the retrieval step that feeds RAG. Reel thirty-five, swipe up.'
    }
  ],

  code: {
    title: '🐍 Semantic search, one SQL query',
    body:
`import duckdb
import numpy as np
import pandas as pd

# Documents with embeddings — reel 32's cache, landed on disk
df = pd.DataFrame({
    "id":      [1, 2, 3],
    "text":    ["refunds within 30 days", "warranty is 2 years",
                "shipping takes 5 business days"],
    "tenant":  ["acme", "acme", "globex"],
    "embedding": [[0.91, 0.12, 0.03], [0.05, 0.11, 0.92],
                  [0.44, 0.55, 0.44]],
})
df.to_parquet("kb.parquet", index=False)

q = np.array([0.89, 0.14, 0.05])   # pretend: embedding of "return policy?"
qn = q / np.linalg.norm(q)

hits = duckdb.sql(f"""
    SELECT text, tenant,
           list_cosine_similarity(embedding, {list(qn)}) AS score
    FROM 'kb.parquet'
    WHERE tenant = 'acme'
    ORDER BY score DESC
    LIMIT 2
""").df()

print(hits)   # refunds row on top, tenant filter applied — no DB server`,
    annot: [
      '<b>duckdb.sql(...).df()</b> — SQL over parquet in-process, result straight into pandas; no server, no import step.',
      '<b>list_cosine_similarity</b> from the vss extension — vector math as a SQL function; combine freely with WHERE/GROUP BY.',
      '<b>WHERE tenant = \'acme\'</b> — metadata filtering is just SQL — the production requirement from reel 33, one clause.'
    ]
  },

  recap: [
    'DuckDB = <b>in-process SQL engine</b> over parquet/CSV/JSON',
    'Files ARE the store — <b>no server, no sync jobs</b>',
    'Vector search = <b>cosine function + ORDER BY + LIMIT</b>'
  ],

  quiz: {
    q: 'Your RAG corpus is 2M chunks (≈6 GB parquet) and queries are offline batch, not user-facing. Best-fit stack?',
    opts: [
      'Pinecone — purpose-built vector search',
      'DuckDB + the vss extension over the parquet files',
      'A Redis instance with vector modules',
      'Brute-force NumPy in a long-running Python service'
    ],
    a: 1,
    why: 'Offline batch against gigabyte-scale parquet is DuckDB’s home turf: no server to run, no per-query pricing, SQL does filtering + top-k in one pass. A managed vector DB adds cost and a network hop you don’t need; brute force in a service wastes RAM and lacks filters.'
  },

  notes: `
# Parquet + SQL — DuckDB over embeddings

## What DuckDB is
An in-process (embedded) OLAP database: SQLite’s spiritual cousin, but columnar and vectorized. \`pip install duckdb\`, then:

\`\`\`
import duckdb
duckdb.sql("SELECT * FROM 'data.parquet' WHERE year = 2026").df()
\`\`\`

It reads parquet, CSV, JSON directly — files are tables, including glob patterns like \`'kb/*.parquet'\`.

## The vector search query
With the \`vss\` extension (or \`array_cosine_similarity\` depending on version):
\`\`\`
SELECT text,
       list_cosine_similarity(embedding, [q1, q2, ..., qn]) AS score
FROM 'kb.parquet'
WHERE tenant = 'acme'
ORDER BY score DESC
LIMIT 5;
\`\`\`
Metadata filters, joins against dimension tables, aggregates over scores — everything SQL gives you, now including vectors.

## When DuckDB wins (and when it doesn’t)

| Use DuckDB | Use a real vector DB |
| --- | --- |
| offline / batch retrieval | user-facing, latency-sensitive QPS |
| GB-scale corpora | 100M+ vectors / TB-scale |
| analytics + search in one place | need incremental upserts at high rate |
| everything must stay local | need replicated serving HA |

## The evaluation superpower
Batch-evaluating a RAG retrieval (reel 41) often means “score 10,000 queries against the corpus.” In DuckDB that’s a JOIN — queries as one parquet file, corpus as another, cross join with cosine, argmax per query. One query, minutes, no Python loops.

> **.NET ↔ Python:** DuckDB has ADO.NET and an Arrow interop, but its natural habitat is this course’s stack. Use it as the offline analytics and eval layer; keep pgvector (reel 33) for the serving path if you need online APIs.

## Gotchas
- In-process = your RAM; it streams parquet smartly, but a 50 GB working set still needs disk-friendly queries (filter early).
- Extension versions: vector functions moved between \`vss\`, core arrays, and \`duckdb.Vector\` UDFs across releases — check your version’s docs.
- Storing embeddings as parquet LIST columns is convenient; keep them normalized at write time (reel 31) or pay the norm cost per query.
- Concurrency: one writer; multiple readers fine for files, but it’s not a serving database.

Next: reel 35 — the payoff: from embeddings to search to RAG answers.
`
});
