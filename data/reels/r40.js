/* Reel 40 — Build your first RAG — from scratch (GenAI · RAG) */
SS.registerReel({
  id: 'r40', num: 40, section: 'genai', block: 'RAG',
  title: 'Build your first RAG — from scratch',
  hook: '~120 lines. Every stage you’ve learned. **One working system.**',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE BUILD',
      title: 'No framework. **Just the reels, assembled.**',
      sub: 'chunk → embed → store → retrieve → generate — you own each line.',
      narration: 'Time to prove the learning. This RAG system uses nothing but the pieces you’ve already built: reel thirty-seven’s chunker, thirty-two’s embedder, thirty-four’s parquet store, thirty-one’s cosine search, and twenty-five’s grounded prompt. No LangChain, no framework — because you can’t debug what you don’t understand, and after this reel, you understand every line.'
    },
    {
      type: 'arch',
      layers: [
        { e: '📄', t: 'docs', s: 'markdown files on disk' },
        { e: '✂️', t: 'chunk + embed', s: 'reels 37 + 32' },
        { e: '🗄️', t: 'store.parquet', s: 'reel 18/34 format' },
        { e: '🤖', t: 'retrieve + answer', s: 'reels 31 + 25' }
      ],
      narration: 'The system, top to bottom. Documents live as files. A build script chunks and embeds them into a parquet store — offline, idempotent, re-runnable. The query path loads the store once, embeds the question, finds the nearest chunks by cosine, and asks the LLM to answer strictly from them. Ingestion and querying are separate programs — that separation is deliberate.'
    },
    {
      type: 'list',
      items: [
        { e: '📦', t: 'ingest.py', s: 'files → kb.parquet (offline)' },
        { e: '💬', t: 'ask.py', s: 'question → cited answer' },
        { e: '🔄', t: 'idempotent', s: 're-run freely, same result' },
        { e: '🧪', t: 'eval.py', s: 'reel 41 plugs in here' }
      ],
      narration: 'Three programs, clean seams. Ingest-dot-py builds the knowledge base — delete the parquet, re-run, identical store. Ask-dot-py is the runtime — loads once, answers many. Both share one config and one embed function. And eval-dot-py — coming in reel forty-one — scores the whole thing against test questions through the same seams.'
    },
    {
      type: 'chat',
      bubbles: [
        { who: 'you', text: 'build it' },
        { who: 'bot', text: 'kb.parquet: 214 chunks, 768 dims', tool: 'ingest.py · 40s' },
        { who: 'you', text: 'can i return without a receipt?' },
        { who: 'bot', text: 'Yes — store credit is issued. [2]', tool: 'cos 0.81 · llama3.1' }
      ],
      narration: 'The transcript of victory. Run ingest-dot-py once: two hundred fourteen chunks, thirty-five megabytes of parquet, forty seconds. Then ask anything: the retriever finds the chunk, the generator answers with a citation — chunk two — and the score, zero-point-eight-one cosine, tells you the retrieval was confident, not lucky.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'It works. **But does it work WELL? Measure it.**',
      next: 'Next · Reel 41: RAG failure modes & evaluation',
      narration: 'A RAG system that runs is not a RAG system that works. Next reel: the failure-mode catalog — every way this quietly breaks — and the evaluation harness that catches them before your users do. Reel forty-one, swipe up.'
    }
  ],

  code: {
    title: '🐍 RAG from scratch — the complete core',
    body:
`import duckdb, httpx
import numpy as np
import pandas as pd

MODEL_EMB, MODEL_LLM = "nomic-embed-text", "llama3.1"

def embed(texts: list[str]) -> np.ndarray:
    r = httpx.post("http://localhost:11434/v1/embeddings",
                   json={"model": MODEL_EMB, "input": texts}, timeout=120)
    E = np.array([d["embedding"] for d in r.json()["data"]])
    return E / np.linalg.norm(E, axis=1, keepdims=True)

def chunk(text: str, n: int = 900, overlap: int = 150) -> list[str]:
    paras, out = text.split("\\n\\n"), []
    cur = ""
    for p in paras:
        if len(cur) + len(p) < n:
            cur = (cur + "\\n\\n" + p).strip()
        else:
            if cur:
                out.append(cur)
            cur = p
    if cur:
        out.append(cur)
    return [out[0]] + [out[i - 1][-overlap:] + c
                       for i, c in enumerate(out[1:], 1)]

def ingest(files: list[str]) -> None:
    rows = []
    for f in files:
        for i, c in enumerate(chunk(open(f).read()), 1):
            rows.append({"src": f, "n": i, "text": c})
    df = pd.DataFrame(rows)
    df["embedding"] = list(embed(df["text"].tolist()))
    df.to_parquet("kb.parquet", index=False)   # idempotent: rebuild freely

def answer(q: str, k: int = 4) -> str:
    df = duckdb.sql("SELECT src, n, text, embedding FROM 'kb.parquet'").df()
    qv = embed([q])[0]
    sims = np.stack(df["embedding"].to_numpy()) @ qv
    top = sims.argsort()[::-1][:k]
    ctx = "\\n".join(f"[{j+1}] ({df.src[i]}#{df.n[i]}) {df.text[i]}"
                     for j, i in enumerate(top))
    prompt = (f"Answer ONLY from the context; cite [n]; "
              f"say 'I don't know' otherwise.\\n{ctx}\\n\\nQ: {q}")
    r = httpx.post("http://localhost:11434/v1/chat/completions",
                   json={"model": MODEL_LLM,
                         "messages": [{"role": "user", "content": prompt}],
                         "temperature": 0.0}, timeout=120)
    return r.json()["choices"][0]["message"]["content"]`,
    annot: [
      '<b>ingest() is a pure function of the files</b> — delete kb.parquet, re-run, identical result: reproducibility is what makes debugging possible.',
      '<b>answer() loads the store per call here for clarity</b> — production caches df and the matrix (reel 23’s desk budget applies).',
      '<b>Every stage maps to a reel</b>: chunk=37, embed=32, store=18/34, retrieve=31, prompt=25 — no hidden framework magic anywhere.'
    ]
  },

  recap: [
    '<b>ingest.py / ask.py</b> — offline build, online answer',
    'Parquet store = <b>idempotent, rebuildable, diffable</b>',
    'No frameworks — <b>every line is a reel you own</b>'
  ],

  quiz: {
    q: 'Why does this build separate ingest and query into different programs instead of one auto-ingesting app?',
    opts: [
      'Python cannot do both in one process',
      'Ingestion is slow and offline-tolerant; queries are latency-critical — mixing them couples every request to pipeline failures',
      'Parquet files lock while being read',
      'Ollama requires separate processes for embed and chat'
    ],
    a: 1,
    why: 'Ingestion (embeddings, chunking, IO) takes seconds-to-minutes and tolerates retries; a user question needs an answer in under a second. Separate programs let you re-ingest on a schedule without touching serving, retry failed batches freely, and keep request-path code small and fast. The store file is the contract between them.'
  },

  notes: `
# Build your first RAG — from scratch

## System inventory

| Component | Reel | Line count |
| --- | --- | --- |
| chunker (paragraph + overlap) | 37 | ~15 |
| embedder (batched, normalized) | 32 | ~5 |
| store (parquet via pandas/DuckDB) | 18/34 | ~3 |
| retriever (cosine matmul) | 31 | ~4 |
| grounded prompt + LLM call | 25/27 | ~10 |

Everything else — files, dicts, httpx — you learned in the Python section. Total: about a hundred twenty lines for a working system. That’s the point: RAG is composition, not magic.

## Running it

\`\`\`
# 1. Build the knowledge base (once, then on doc changes)
python ingest.py docs/*.md
# -> kb.parquet

# 2. Ask questions
python ask.py "what's the refund policy?"
# -> "Customers may return items within 30 days. [1]"
\`\`\`

Swap Ollama URLs for OpenAI/Anthropic by changing two strings — the seams hold (reel 36).

## Production hardening checklist (apply later, in order)
1. **Cache the store** in memory at startup; reload on file-change signal — no per-query parquet reads.
2. **Add metadata filters** (\`tenant\`, \`acl\`) at the DuckDB WHERE — one clause (reel 33).
3. **Hybrid retrieval** — merge BM25 ranks (reel 39) before the cosine pass.
4. **Retries + timeouts** on both HTTP calls (reel 14) — Ollama restarts, APIs hiccup.
5. **Structured output** — schema-constrain the answer JSON (reel 27) if a UI consumes it.
6. **Eval harness** — the very next reel.

## Why no framework?
LangChain/LlamaIndex earn their keep at orchestration scale (agents, multi-index, streaming UX). For a single-store RAG they add indirection without adding capability — and every abstraction becomes a debugging tax the first time retrieval misbehaves at 2 a.m. Build it bare once; adopt frameworks for the orchestration they genuinely simplify (reels 59, 73), not to avoid writing a hundred lines you understand.

> **.NET ↔ Python:** the architecture ports cleanly — ASP.NET serving + Python ingestion against the same parquet/pgvector store is a common real-world split (reels 1, 33).

Next: reel 41 — RAG failure modes and the evaluation harness that finds them.
`
});
