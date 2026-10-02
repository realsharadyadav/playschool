/* Reel 37 — Chunking strategies (GenAI · RAG) */
SS.registerReel({
  id: 'r37', num: 37, section: 'genai', block: 'RAG',
  title: 'Chunking strategies',
  hook: 'Wrong chunks = unfindable knowledge. **This reel saves your RAG.**',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE SILENT KILLER',
      title: 'Chunk wrong and **retrieval can never recover.**',
      sub: 'The answer exists in your docs — cut into pieces that lost it.',
      narration: 'The most common RAG failure isn’t the model or the vector database. It’s the knife. Chunking decides what atoms of knowledge exist — and a question can only be answered from chunks that actually contain its answer. Slice mid-sentence and you’ve shredded meaning before a single embedding is computed.'
    },
    {
      type: 'compare',
      cards: [
        { e: '✂️', t: 'Fixed-size splits (500 chars)', s: 'simple — severs tables, code, paragraphs' },
        { e: '🧠', t: 'Structure-aware chunks', s: 'by heading / paragraph / function', win: true }
      ],
      narration: 'The two philosophies. Fixed-size: every five hundred characters, cut. Simple, uniform — and it slices through the middle of tables, code blocks, and arguments. Structure-aware: split on what the document MEANS — headings, paragraphs, function boundaries. More code, dramatically better atoms. Start structural, fall back to fixed.'
    },
    {
      type: 'list',
      items: [
        { e: '📏', t: '200–500 tokens', s: 'the survival band for chunks' },
        { e: '🔂', t: '10–20% overlap', s: 'context bridges the cuts' },
        { e: '📌', t: 'One idea per chunk', s: 'a chunk IS an answer unit' },
        { e: '🧬', t: 'Parent-child', s: 'small for search, big for context' }
      ],
      narration: 'The four rules. Size: two hundred to five hundred tokens — small enough to be specific, big enough to carry context. Overlap: ten to twenty percent, so a fact split across a boundary survives in both pieces. One idea per chunk: ask “could this chunk alone answer a question?” And the advanced move — parent-child: retrieve on small precise chunks, but feed the LLM their larger parent sections.'
    },
    {
      type: 'tokens',
      examples: [
        { words: ['## Returns', 'Customers may', 'return items'], cands: [{ w: ' within', p: 55 }, { w: ' freely', p: 12 }, { w: ' never', p: 3 }] }
      ],
      narration: 'Watch overlap do its job. A sentence crossing a chunk boundary — “Customers may return items within thirty days” — gets split after “items”. Without overlap, a query about the return window finds a chunk ending in “items” and learns nothing. Ten percent overlap means that sentence lives whole in the next chunk, and retrieval finds it.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'Chunks perfected. **Now store them in something built for the job.**',
      next: 'Next · Reel 38: Vector databases compared — FAISS to Pinecone',
      narration: 'Chunking: the unglamorous decision that decides whether RAG works. Next: the storage layer in anger — a tour of real vector databases, their indexes, and which one fits which scale. Reel thirty-eight, swipe up.'
    }
  ],

  code: {
    title: '🐍 Chunker that respects structure',
    body:
`import re

def chunk_md(text: str, max_chars: int = 900, overlap: int = 150) -> list[str]:
    """Split on paragraph boundaries; hard-cut only oversized blocks."""
    blocks = re.split(r"\\n\\s*\\n", text)      # paragraphs first
    chunks, cur = [], ""

    for b in blocks:
        candidate = (cur + "\\n\\n" + b).strip()
        if len(candidate) <= max_chars:
            cur = candidate
            continue
        if cur:
            chunks.append(cur)
        # oversized single block? fall back to sentence cuts
        if len(b) > max_chars:
            sents = re.split(r"(?<=[.!?]) ", b)
            cur = ""
            for s in sents:
                if len(cur) + len(s) + 1 <= max_chars:
                    cur = (cur + " " + s).strip()
                else:
                    if cur:
                        chunks.append(cur)
                    cur = s
        else:
            cur = b

    if cur:
        chunks.append(cur)

    # overlap: tail of each chunk prefixes the next
    return [chunks[0]] + [chunks[i - 1][-overlap:] + c
                          for i, c in enumerate(chunks[1:], 1)]

doc = "## Returns\\n\\nCustomers may return items within 30 days.\\n\\n" \\
      "Refunds go to the original payment method.\\n\\n## Warranty\\n\\n" \\
      "All products carry a 2 year warranty."
for i, c in enumerate(chunk_md(doc), 1):
    print(f"--- chunk {i} ({len(c)} chars) ---\\n{c[:80]}…")`,
    annot: [
      '<b>Paragraph boundaries first</b> — structure-aware beats fixed-size because ideas live in paragraphs, not character counts.',
      '<b>Sentence-level fallback</b> for oversized blocks — never hard-cut mid-sentence unless the block itself is pathological.',
      '<b>Overlap on write</b> — bake the 10–15% bridge into the chunks; never simulate overlap at query time.'
    ]
  },

  recap: [
    'Chunk = <b>one answerable unit of knowledge</b>',
    '200–500 tokens + <b>10–20% overlap</b>',
    'Structure-aware beats fixed-size — <b>paragraphs, not characters</b>'
  ],

  quiz: {
    q: 'Queries about warranty terms retrieve the warranty heading but miss the 2-year duration, which sits in the next paragraph. Most likely cause?',
    opts: [
      'The embedding model is too small',
      'The heading and the duration landed in separate chunks, and the heading chunk alone answers nothing',
      'Cosine similarity cannot compare headings with sentences',
      'The vector store needs more RAM'
    ],
    a: 1,
    why: 'A heading alone (“## Warranty”) is a content-free chunk — nothing to match against. The fact users ask about lives in the following paragraph as its own chunk. Retrieval finds the (useless) heading chunk and never surfaces the duration. Fix: chunk so headings travel with their content, and size chunks to keep an idea intact.'
  },

  notes: `
# Chunking strategies

## Why chunking outranks everything
Retrieval matches queries to chunks. If the answer’s atomic unit was destroyed at ingest — a table split in half, a heading separated from its body — no embedding model, index, or reranker can reassemble what no longer exists in any single retrievable object.

## The strategy menu

| Strategy | How | When |
| --- | --- | --- |
| Fixed-size | cut every N chars/tokens | quick prototypes only |
| Recursive/structure-aware | split on headings, paragraphs, then sentences | **default for docs** |
| Semantic | embed each sentence; cut where similarity drops | higher quality, slower, pricier |
| Agentic/LLM chunking | model decides boundaries | rare; expensive |
| Parent-child | index small child chunks; return parents | long documents, precise retrieval + rich context |

## Rules that survive production
1. **Size 200–500 tokens** (≈150–400 words). Below: chunks lack context. Above: diluted embeddings, wasted desk space (reel 23).
2. **Overlap 10–20%** of chunk size. Pure overhead at query time is zero; the insurance against boundary-split facts is priceless.
3. **Headings travel with content.** “## Warranty” alone is a zero-information chunk.
4. **Tables and code are special**: keep tables whole (or row-groups with headers), functions whole. Splitting code mid-function creates unanswerable fragments.
5. **Keep metadata per chunk**: source doc, section path, page — citations and filters depend on it (reel 36).

## Parent-child, the power move
- **Child chunks** (128–256 tokens) — precise retrieval: small, specific, high-signal matches.
- **Parent chunks** (1–2K tokens) — rich context: the section the child came from, fed to the LLM.
Retrieve children, expand to parents, dedupe, stuff. This gets precision AND context — most serious RAG systems land here.

> **.NET ↔ Python:** chunking is plain text engineering — ports anywhere. The ecosystem helpers (LangChain splitters, unstructured) are Python-first; a 40-line recursive splitter (the code panel) covers most real documents without a dependency.

## Quick eval for your chunks
Take 30 real questions with known answers. For each, ask: does SOME chunk contain the answer, whole? If <90% yes, fix chunking before touching anything downstream — reels 38–40 build on this foundation.

Next: reel 38 — vector databases in anger: FAISS to Pinecone, indexes included.
`
});
