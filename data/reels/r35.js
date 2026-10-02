/* Reel 35 — Embeddings → search & RAG (GenAI · Embeddings) */
SS.registerReel({
  id: 'r35', num: 35, section: 'genai', block: 'Embeddings',
  title: 'Embeddings → search & RAG',
  hook: 'Retrieval is the engine. **RAG is the car.** Time to drive.',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE PAYOFF',
      title: 'You’ve built every part. **Now assemble the machine.**',
      sub: 'embed → store → retrieve → prompt → answer.',
      narration: 'Take stock: you can embed text, store vectors, and query similarity. Those three pieces, composed with an LLM call, produce the single most important pattern in applied GenAI: retrieval-augmented generation. RAG. This reel is the assembly — the end-to-end loop that the next five reels dissect and harden.'
    },
    {
      type: 'loop',
      chips: ['embed query', 'ANN search', 'fetch chunks', 'stuff prompt', 'LLM answers'],
      narration: 'The RAG loop, one cycle. Embed the user’s question. Search the vector store for the nearest chunks. Fetch those chunks — the retrieval. Stuff them into the prompt as context. The LLM answers using that context — augmented generation. Question in, grounded answer out.'
    },
    {
      type: 'diagram',
      nodes: [
        { e: '❓', t: 'user question', s: '"refund window?"' },
        { e: '🔍', t: 'retrieval', s: 'top-3 chunks by cosine' },
        { e: '📄', t: 'grounded prompt', s: 'context + question' },
        { e: '✅', t: 'answer + citations', s: '"30 days [1]"' }
      ],
      narration: 'See why it defeats hallucination — reel twenty-eight’s enemy. The model never reaches for training-data memories about refunds; it reads YOUR policy chunks, placed in the prompt. The answer is generated from supplied evidence, and citations tell the user exactly which chunk each claim came from.'
    },
    {
      type: 'list',
      items: [
        { e: '🧱', t: 'Ingestion', s: 'docs → chunks → embeddings → store' },
        { e: '🔍', t: 'Retrieval', s: 'query → top-k chunks (filtered)' },
        { e: '📄', t: 'Augmentation', s: 'chunks into the prompt template' },
        { e: '🗣️', t: 'Generation', s: 'grounded, cited answers' }
      ],
      narration: 'The four stages, named — you’ll hear these constantly. Ingestion: pipeline the documents through chunking and embedding into the store — done once, offline. Retrieval: at query time, embed the question and pull top-k. Augmentation: place chunks into the prompt with instructions. Generation: the model answers from the context. Reels thirty-seven and forty harden each stage.'
    },
    {
      type: 'bridge', kicker: 'BLOCK COMPLETE',
      title: 'Embeddings: conquered. **Next block: RAG in depth.**',
      next: 'Next · Reel 36: RAG — the big picture',
      narration: 'That closes the embeddings block — meaning as geometry, from tokens to a working retrieval engine. Next block goes deep on the pattern you just assembled: RAG architecture, chunking, vector DBs in anger, retrieval tricks, and building one from scratch. Reel thirty-six, swipe up.'
    }
  ],

  code: {
    title: '🐍 Minimal RAG — every stage visible',
    body:
`import duckdb, httpx
import numpy as np

STORE = "kb.parquet"   # id, text, tenant, embedding — reel 34's format

def embed(text: str) -> np.ndarray:
    resp = httpx.post("http://localhost:11434/v1/embeddings",
                      json={"model": "nomic-embed-text", "input": [text]},
                      timeout=60)
    return np.array(resp.json()["data"][0]["embedding"])

def retrieve(q: str, k: int = 3) -> list[str]:
    qn = (q_embed := embed(q)) / np.linalg.norm(q_embed)
    rows = duckdb.sql(f"""
        SELECT text FROM '{STORE}'
        ORDER BY list_cosine_similarity(embedding, {list(qn)}) DESC
        LIMIT {k}""").fetchall()
    return [r[0] for r in rows]

def answer(q: str) -> str:
    ctx = "\\n".join(f"[{i+1}] {t}" for i, t in enumerate(retrieve(q)))
    prompt = f"Answer using ONLY this context. Cite [n].\\n{ctx}\\n\\nQuestion: {q}"
    resp = httpx.post("http://localhost:11434/v1/chat/completions",
                      json={"model": "llama3.1",
                            "messages": [{"role": "user", "content": prompt}],
                            "temperature": 0.0}, timeout=60)
    return resp.json()["choices"][0]["message"]["content"]

print(answer("how long do i have to return something?"))`,
    annot: [
      '<b>retrieve()</b> — embed the question, cosine-search the store, return raw chunk texts (reel 34’s query, production-hardened).',
      '<b>Context assembly</b> — numbered chunks [1][2][3] give the model citation anchors (reel 28’s verification pattern).',
      '<b>"ONLY this context" + temperature 0</b> — the two clauses that convert a generalist model into a grounded answer engine.'
    ]
  },

  recap: [
    'RAG = <b>retrieve → stuff prompt → generate</b>',
    'Answers are <b>grounded</b> — model reads, not recalls',
    'Citations make claims <b>verifiable</b>'
  ],

  quiz: {
    q: 'In the RAG loop, which stage is responsible for defeating hallucination?',
    opts: [
      'Generation — the model is careful when answering',
      'Retrieval — grounding supplies the evidence the model must use',
      'Embedding — vector math is more truthful than text',
      'Chunking — smaller pieces are harder to invent'
    ],
    a: 1,
    why: 'Retrieval grounds the answer: the model generates from supplied evidence instead of parametric memory. Generation just writes; embeddings and chunking are plumbing. When RAG hallucinates anyway, the failure is almost always retrieval — wrong or missing chunks — which is why reels 37–39 exist.'
  },

  notes: `
# Embeddings → search & RAG

## The whole loop in five lines
1. **Ingest** documents → chunks → embeddings → store (offline, reel 32).
2. **Embed the query** at request time.
3. **Retrieve** top-k chunks by cosine (with metadata filters, reel 33).
4. **Augment**: insert chunks into the prompt with numbering and instructions.
5. **Generate** with citations; low temperature.

## Why RAG beats fine-tuning (for knowledge)
| | RAG | Fine-tuning |
| --- | --- | --- |
| Knowledge freshness | update the store, instant | retrain, hours + cost |
| Citations/attribution | natural (chunk [n]) | none |
| Cost per update | re-embed changed docs | full training run |
| Teaches behavior/style? | weakly | strongly |

The pattern: **RAG for knowledge, fine-tuning for behavior** (tone, format rigor, task style). Most products need only the first.

## What breaks first in production
1. **Chunking** — naive 500-char splits shred tables and code (reel 37).
2. **Retrieval quality** — top-k by pure cosine misses keyword-exact matches (reel 39).
3. **Context abuse** — stuffing 40 chunks; the model attends to the edges (reel 23’s lost-in-the-middle).
4. **No evals** — nobody measures whether retrieval actually finds the right chunk (reel 41).

## Prompt template that survives contact
\`\`\`
You answer using ONLY the numbered context below.
Cite claims with [n]. If the answer isn't in the context, say "I don't know."

CONTEXT:
[1] ...
[2] ...

QUESTION: {q}
\`\`\`
- Numbering gives citation anchors AND lets you verify attribution programmatically.
- The explicit refusal phrase is the anti-hallucination valve (reel 28).

## The .NET-shape of all this
Ingestion and retrieval are Python-side (reel 1’s split); the serving API can be ASP.NET calling the same vector store — pgvector makes this natural (reel 33). Same store, two stacks, one product.

Next: reel 36 — the RAG block opens: architecture, components, and where teams over-engineer.
`
});
