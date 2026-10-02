/* Reel 32 — Embedding models in practice (GenAI · Embeddings) */
SS.registerReel({
  id: 'r32', num: 32, section: 'genai', block: 'Embeddings',
  title: 'Embedding models in practice',
  hook: 'Frontier API or local open model? **The answer is a spreadsheet row.**',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE CHOICE',
      title: 'Every embedding call: **model × dimensions × price.**',
      sub: 'The three numbers that decide your architecture.',
      narration: 'Using embeddings in anger means choosing a model, and the choice boils down to three numbers: quality on YOUR data, vector dimensions, and price per million tokens. Dimensions decide your storage and speed; quality decides whether your retrieval works at all. Let’s run the real options.'
    },
    {
      type: 'compare',
      cards: [
        { e: '🌩️', t: 'Frontier APIs', s: 'OpenAI, Cohere, Voyage — best quality, per-token pricing' },
        { e: '🏠', t: 'Local open models', s: 'bge, e5, nomic — free, private, needs a GPU-ish box', win: true }
      ],
      narration: 'The big fork. Frontier APIs — OpenAI, Cohere, Voyage — give top benchmark quality and zero ops, and every token costs a fraction of a cent but it’s billed forever. Local open models like bge or e5 run free forever on your hardware, keep data in-house, and have closed most of the quality gap for mainstream text. Many production systems mix: embed sensitive docs locally, everything else via API.'
    },
    {
      type: 'list',
      items: [
        { e: '📐', t: 'Dimensions', s: '384–3,072 floats per vector' },
        { e: '✂️', t: 'Matryoshka / truncation', s: 'cut dims, keep most quality' },
        { e: '📦', t: 'Batch the calls', s: 'send 100s of texts per request' },
        { e: '🧾', t: 'Prefix matters', s: '"passage: "/"query: " (E5-style)' }
      ],
      narration: 'The operational details. Dimensions: three hundred eighty-four to three thousand floats per item — storage and search cost scale linearly. Matryoshka models let you truncate dimensions and keep most of the quality — huge storage saver. Batch embedding calls — hundreds of texts per request, one round trip. And some models REQUIRE prefixes: passage-colon for documents, query-colon for searches — skip them and quality silently drops.'
    },
    {
      type: 'chat',
      bubbles: [
        { who: 'you', text: 'embed these 500 chunks', tool: 'batch: 500 texts' },
        { who: 'bot', text: '500 × 1024-dim vectors', tool: '1 API call · cached' },
        { who: 'bot', text: 'query: "refund policy?" → top 5 in 12ms', tool: 'ANN index' }
      ],
      narration: 'The production loop. Embed once — batched, cached to parquet like reel eighteen showed — then every query is a tiny call and a blazing fast approximate-nearest-neighbor lookup. Notice the asymmetry: embedding documents is the expensive, done-once part; embedding queries is cheap and happens at request time.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'Model chosen. **Now where do the vectors LIVE?**',
      next: 'Next · Reel 33: Where to store vectors — the full menu',
      narration: 'Model picked, batched, cached. The architectural question ahead: where do these vectors actually live — Postgres, a vector database, plain files? Full menu, with prices, next reel. Swipe up.'
    }
  ],

  code: {
    title: '🐍 Embed, cache, and query — production shape',
    body:
`import numpy as np
import pandas as pd
import httpx

def embed(texts: list[str]) -> np.ndarray:
    """One batched call — the ONLY pattern to use in production."""
    resp = httpx.post(
        "http://localhost:11434/v1/embeddings",
        json={"model": "nomic-embed-text", "input": texts},
        timeout=120,
    )
    rows = [d["embedding"] for d in resp.json()["data"]]
    return np.array(rows)

chunks = ["refunds within 30 days", "store credit for no receipt",
          "shipping takes 5 days", "warranty is 2 years"]

E = embed(chunks)
E = E / np.linalg.norm(E, axis=1, keepdims=True)   # normalize once

df = pd.DataFrame({"text": chunks})
df["embedding"] = list(E)
df.to_parquet("kb.parquet", index=False)             # cache — never re-pay

# Query time: embed the question, dot against the store
q = embed(["can i return without a receipt?"])[0]
q = q / np.linalg.norm(q)
sims = E @ q
print(chunks[int(np.argmax(sims))])                  # -> store credit…`,
    annot: [
      '<b>Batched input</b> — hundreds of texts per call; per-request overhead dominates, so amortize it.',
      '<b>Normalize once at write time</b> (reel 31’s trick) — query-time similarity is then a single matrix multiply.',
      '<b>Parquet cache</b> — embeddings are deterministic per model+text; store them (reel 18) and you never pay twice.'
    ]
  },

  recap: [
    'Choose: <b>frontier API</b> vs <b>local open model</b> — often both',
    '<b>Batch</b> embeds; <b>normalize once</b>; cache to parquet',
    'Mind <b>prefixes</b> and <b>dimensions</b> — silent quality knobs'
  ],

  quiz: {
    q: 'A RAG system re-embeds all 200K documents on every deploy, taking 3 hours and costing $40. What’s the standard fix?',
    opts: [
      'Use a smaller embedding model so calls are faster',
      'Cache the embeddings (parquet/vector DB) keyed by content hash — recompute only changed documents',
      'Lower the temperature of the embedding model',
      'Switch to cosine distance so fewer dimensions are needed'
    ],
    a: 1,
    why: 'Embeddings are a pure function of (model, text). Storing them — reel 18’s parquet pattern or directly in the vector DB — turns each deploy into a diff: hash documents, embed only new/changed ones. Model swaps still force a full re-embed, but routine deploys become near-instant and free.'
  },

  notes: `
# Embedding models in practice

## The decision inputs

| Factor | Frontier API (OpenAI/Cohere/Voyage) | Local open (bge/e5/nomic) |
| --- | --- | --- |
| Quality | top of MTEB | 90–98% of frontier for mainstream text |
| Cost | per million tokens, forever | hardware you already own |
| Privacy | leaves your network | stays on your machine |
| Ops | none | serve + scale the model |
| Dimensions | often selectable (e.g. 256–3072) | fixed by model |

The mature answer for many teams: **local for sensitive corpora, API for the rest**, behind one internal \`embed(texts) -> np.ndarray\` function so the choice is swappable.

## The six operational rules
1. **Batch**: send hundreds of texts per call. Throughput >> latency for ingestion.
2. **Cache**: store (content_hash → vector). Re-embed only on change; model upgrades are the only full rebuild.
3. **Normalize at write time**: dot product becomes your similarity (reel 31).
4. **Respect prefixes**: E5 wants \`"passage: "\`/\`"query: "\`; nomic wants \`"search_document: "\`/\`"search_query: "\`. Wrong prefix = invisible quality loss.
5. **Dimensions are a budget**: Matryoshka-style models (OpenAI v3, some bge) keep quality at 256–1024 dims — 3–10× cheaper storage and faster search than full size.
6. **Benchmark on your data**: leaderboards (MTEB) rank general quality; build a 50-query golden set from YOUR corpus and measure recall@5 before committing.

## Throughput math (why batching matters)
One-at-a-time: 100K docs × 50ms overhead ≈ 90 min of pure round trips. Batched at 500/request: 200 requests — the network disappears and you’re limited by the encoder itself. Same for local models: batching is how you use the GPU fully.

## Where this feeds
The vectors you produce here land in a store — that’s the very next decision (reel 33). The same \`embed()\` function returns in reels 34 (DuckDB), 40 (RAG), and 66 (Excel agent memory).

> **.NET ↔ Python:** same architecture ports 1:1 — the embed-and-cache pipeline is stack-agnostic. Python’s edge stays the SDK breadth and the embedding model serving stack (Ollama, TEI).

## Gotchas
- Rate limits hit during bulk ingestion — back off (reel 14), or you’ll half-fail a 3-hour job.
- Storing embeddings without the model version + prefix config — future you will re-debug a silent quality regression.
- Rounding floats when serializing (CSV!) destroys similarity — use parquet/binary, not text formats.

Next: reel 33 — the full menu of vector storage: Postgres to Pinecone.
`
});
