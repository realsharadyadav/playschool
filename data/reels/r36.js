/* Reel 36 — RAG: the big picture (GenAI · RAG) */
SS.registerReel({
  id: 'r36', num: 36, section: 'genai', block: 'RAG',
  title: 'RAG: the big picture',
  hook: 'RAG is an architecture, not a library. **Here’s the full map.**',

  scenes: [
    {
      type: 'arch',
      layers: [
        { e: '📥', t: 'Ingestion pipeline', s: 'load → clean → chunk → embed → index' },
        { e: '🗄️', t: 'Vector store (+ metadata)', s: 'embeddings + source, acl, dates' },
        { e: '🔍', t: 'Retrieval service', s: 'query → top-k, filtered, reranked' },
        { e: '🗣️', t: 'Generation API', s: 'grounded prompt → cited answer' }
      ],
      narration: 'RAG as an architecture, four layers. The ingestion pipeline runs offline: load documents, clean, chunk, embed, index. The vector store holds embeddings plus metadata — access control lists, dates, sources. The retrieval service answers “give me the k most relevant chunks for this question.” And the generation API composes the grounded prompt and streams the answer. Each layer is independently replaceable — that’s the point.'
    },
    {
      type: 'bigtext', kicker: 'THE PROMISE',
      title: 'RAG = **your data + their intelligence.**',
      sub: 'Private, fresh, attributable — without training anything.',
      narration: 'Why the industry converged on this pattern: it gives the model YOUR knowledge without touching its weights. Private documents stay in your store, never in training. Updates are as fast as re-embedding a file — no fine-tuning run. And because answers cite retrieved chunks, attribution is built in. RAG is how enterprises adopt LLMs without shipping their data to a model vendor.'
    },
    {
      type: 'list',
      items: [
        { e: '🧩', t: 'Ingestion', s: 'the pipeline nobody demos' },
        { e: '🔍', t: 'Retrieval', s: 'where quality is won or lost' },
        { e: '📄', t: 'Augmented prompt', s: 'instructions + context assembly' },
        { e: '📏', t: 'Evaluation', s: 'the layer everyone skips' }
      ],
      narration: 'Four layers, four truths. Ingestion is unglamorous plumbing — and half the real work. Retrieval quality decides everything downstream; a perfect generator can’t fix a missed chunk. Prompt assembly is a craft of templates and budgets. And evaluation — the layer everyone skips — is the difference between a demo and a system. Reels thirty-seven through forty-one take each in turn.'
    },
    {
      type: 'compare',
      cards: [
        { e: '🤖', t: '"Just ask the LLM"', s: 'generic, stale, unverifiable' },
        { e: '🏆', t: 'RAG', s: 'private data, fresh, cited, cheaper than fine-tuning', win: true }
      ],
      narration: 'The sales pitch in one compare. Raw LLM: general knowledge from training — generic, potentially stale, no sources. RAG: your data, current as of the last ingest, with citations, at the cost of some embedding calls. For enterprise knowledge work, it’s not a close contest — which is why RAG appears in reels forty through forty-two again in agentic clothing.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'Map drawn. **First hard problem: chopping documents without destroying them.**',
      next: 'Next · Reel 37: Chunking strategies',
      narration: 'The architecture is mapped. The first layer we harden is the one that quietly destroys most RAG systems: chunking. Cut a document wrong and retrieval can never recover. Strategies, sizes, and overlap — next reel. Swipe up.'
    }
  ],

  code: {
    title: '🐍 RAG as four composable functions',
    body:
`# The whole architecture, compressed to its seams.
# Each function is a layer; each is independently replaceable.

def ingest(docs):                       # offline pipeline
    chunks = [chunk(d) for d in docs]   # reel 37
    vectors = embed([c.text for c in chunks])  # reel 32
    store.upsert(chunks, vectors)       # reel 33/34

def retrieve(q, k=5, **filters):        # online, per-query
    qv = embed([q])[0]
    return store.search(qv, k=k, filters=filters)  # + rerank (reel 39)

def build_prompt(q, chunks):            # prompt assembly
    ctx = "\\n".join(f"[{i+1}] {c.text}" for i, c in enumerate(chunks))
    return TEMPLATE.format(context=ctx, question=q)

def answer(q, **filters):               # the API the app calls
    return llm(generate(build_prompt(q, retrieve(q, **filters))))`,
    annot: [
      '<b>Seams, not steps</b> — swap chunk(), store, or llm without touching the rest; this is why RAG architectures survive vendor churn.',
      '<b>ingest() is offline</b> — batch, retry, re-run freely (reels 14/32); retrieve()/answer() are the latency-critical online path.',
      '<b>filters flow from the app</b> — tenant ACLs become store filters at the seam (reel 33’s metadata-filter requirement).'
    ]
  },

  recap: [
    'Four layers: <b>ingest, store, retrieve, generate</b>',
    'Quality is won in <b>retrieval</b>, lost in <b>chunking</b>',
    '<b>Evaluation</b> is the layer everyone skips — don’t'
  ],

  quiz: {
    q: 'Your RAG answers are fluent but wrong on specifics. Retrieval traces show the right chunk ranked #9 of 10. Which layer do you fix first?',
    opts: [
      'Generation — use a bigger model',
      'Retrieval — improve ranking so the right chunk lands in top-k',
      'Ingestion — embed with a larger embedding model',
      'Prompt — demand more careful answers'
    ],
    a: 1,
    why: 'Garbage in, garbage out is the law: if the evidence isn’t retrieved, no generator can answer correctly. Retrieval problems (ranking, chunking, filters) precede generation problems. Fix top-k composition first — better chunking (37), hybrid search (39), reranking (39) — before reaching for a bigger model.'
  },

  notes: `
# RAG: the big picture

## Architecture anatomy

| Layer | Responsibility | Key decisions | Reels |
| --- | --- | --- | --- |
| Ingestion | docs → chunks → embeddings → store | loaders, cleaning, chunk size, batching | 37, 32 |
| Storage | vectors + text + metadata | Postgres vs dedicated, index type, ACL fields | 33, 34 |
| Retrieval | query → relevant chunks | top-k, filters, hybrid, rerank | 39 |
| Generation | grounded prompt → answer | template, citations, temperature | 25–28 |
| Evaluation | measure both stages | recall@k, answer faithfulness | 41, 47 |

## Design principles that pay off
1. **Offline/online split**: ingestion tolerates hours and retries; retrieval answers in milliseconds. Never do embedding calls synchronously in the request path for documents — only for the tiny query.
2. **Metadata from day one**: \`source\`, \`updated_at\`, \`tenant_id\`, \`acl\` — retrofitting filters later means re-ingesting everything.
3. **Text travels with vectors**: the chunk text lives beside its embedding in the store; citations, debugging, and re-chunking all depend on it.
4. **Replaceable seams**: keep \`embed()\`, \`store\`, \`llm\` behind small interfaces (the code panel). Vendor swaps become config, not rewrites.

## Where teams over-engineer
- Multi-hop agentic retrieval before basic top-k works (reel 42 for when it’s justified).
- Custom embedding fine-tuning before exhausting retrieval tuning.
- Complex document hierarchies when 80% of questions are answered by 512-token chunks.

## Where teams under-engineer
- **Chunking** (reel 37) — the silent killer.
- **Evals** (reel 41) — nobody knows if it works.
- **Freshness** — stale embeddings serving outdated policy docs; ingestion must be repeatable and scheduled.

## Cost shape (back-of-envelope, 1M chunks of ~500 tokens)
- Ingest once: ~500M embedding tokens ≈ tens of dollars at API rates; free on local models.
- Query: one small embedding + k×~500 tokens of context per question — context tokens dominate at scale (reel 23’s desk).

Next: reel 37 — chunking: the highest-leverage, lowest-glamour decision in RAG.
`
});
