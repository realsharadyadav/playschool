/* Reel 42 — Advanced RAG — HyDE & agentic RAG (GenAI · RAG) */
SS.registerReel({
  id: 'r42', num: 42, section: 'genai', block: 'RAG',
  title: 'Advanced RAG — HyDE & agentic RAG',
  hook: 'When top-k isn’t enough: **rewrite the question. Or let an agent steer.**',

  scenes: [
    {
      type: 'bigtext', kicker: 'BEYOND TOP-K',
      title: 'Some questions **can’t be embedded as asked.**',
      sub: '"What did we decide about that vendor?" — that vendor. Which one?',
      narration: 'Plain retrieval embeds the question and matches. But real questions are messy: pronouns with no referent, jargon that maps to different words in your docs, multi-part asks that need several retrievals. Advanced RAG attacks this two ways: fix the QUERY before retrieval — that’s HyDE and friends — or put an AGENT between the question and the store. Escalate in that order.'
    },
    {
      type: 'diagram',
      nodes: [
        { e: '❓', t: 'vague question', s: '"return policy for that thing"' },
        { e: '✍️', t: 'LLM rewrites', s: 'specific + keyword-rich' },
        { e: '📄', t: 'HyDE: fake answer', s: 'hypothetical document' },
        { e: '🎯', t: 'embed the fake', s: 'lands near real answers' }
      ],
      narration: 'Query rewriting and HyDE. First: have the LLM rewrite the question — resolve “that thing” into “Bluetooth speaker”, add likely keywords. Second, the clever one — HyDE, hypothetical document embeddings: instead of embedding the question, ask the model to write the ANSWER it wishes it had, then embed THAT. Answers live in the same vocabulary as your documents, so the search lands closer — questions and docs no longer speak different languages.'
    },
    {
      type: 'compare',
      cards: [
        { e: '🔁', t: 'One-shot retrieval', s: 'question → top-k → answer' },
        { e: '🕵️', t: 'Agentic retrieval', s: 'plan → search → read → refine → search again', win: true }
      ],
      narration: 'The escalation. One-shot: single embed, single top-k, done — right for most questions. Agentic: a loop where the retriever becomes a tool an agent can call repeatedly — read results, realize the first search missed, reformulate, search again, follow references between documents. More capable, more tokens, more latency. The rule: don’t pay agent costs for questions top-k already answers.'
    },
    {
      type: 'list',
      items: [
        { e: '🔀', t: 'Multi-query', s: '3 rephrasings, fused results' },
        { e: '🪜', t: 'Step-back', s: 'retrieve broad, then narrow' },
        { e: '🔗', t: 'GraphRAG', s: 'entities + relationships traversal' },
        { e: '🧭', t: 'Router', s: 'agent picks: top-k or deep dive' }
      ],
      narration: 'The advanced arsenal. Multi-query: generate three rephrasings, retrieve each, fuse — cheap, catches phrasing mismatches. Step-back prompting: retrieve a broad concept first, then the specifics — fixes overly-narrow embeddings. GraphRAG: extract entities and relationships into a graph, traverse it for multi-hop questions like “which suppliers of our top customer missed deadlines?” And the meta-move — a router that classifies the question and picks the cheapest strategy that can answer it.'
    },
    {
      type: 'bridge', kicker: 'BLOCK COMPLETE',
      title: 'RAG: mastered. **Next block: systems that CONVERSE.**',
      next: 'Next · Reel 43: Anatomy of a chatbot',
      narration: 'That completes RAG — from chunking to agentic retrieval, with the eval harness to prove it all. Next block turns the pipeline into a product: chatbots. Architecture, memory, streaming, and how to evaluate a conversation. Reel forty-three, swipe up.'
    }
  ],

  code: {
    title: '🐍 HyDE + multi-query in fifteen lines',
    body:
`import httpx

def llm(prompt: str, temp: float = 0.0) -> str:
    r = httpx.post("http://localhost:11434/v1/chat/completions",
                   json={"model": "llama3.1",
                         "messages": [{"role": "user", "content": prompt}],
                         "temperature": temp}, timeout=60)
    return r.json()["choices"][0]["message"]["content"]

def hyde_queries(q: str, n: int = 3) -> list[str]:
    """One rewrite + n hypothetical answers — embed ALL of them."""
    rewrite = llm(f"Rewrite as a specific, keyword-rich search query: {q}")
    docs = [llm(f"Write the 2-sentence document that would answer: {r}",
                temp=0.4)
            for r in [rewrite] * n]
    return [rewrite, *docs]

def retrieve_multi(q: str, k: int = 5) -> list[str]:
    texts = hyde_queries(q)                    # 1 query + 3 hypothetical docs
    vecs = embed(texts)                        # reel 32's batched embedder
    sims = np.stack(df["embedding"].to_numpy()) @ vecs.T   # |store| × 4
    best = sims.max(axis=1).argsort()[::-1][:k]  # fuse: max over variants
    return [df.text[i] for i in best]`,
    annot: [
      '<b>Embed hypothetical ANSWERS, not the question</b> — docs and answers share vocabulary; questions don’t (HyDE’s core insight).',
      '<b>Fusion = max over variant scores</b> — a chunk matching ANY variant ranks high; no weights, no RRF bookkeeping needed here.',
      '<b>temperature 0.4 for HyDE docs</b> — slight variety across the n samples diversifies what gets retrieved.'
    ]
  },

  recap: [
    '<b>HyDE</b>: embed a hypothetical ANSWER, not the question',
    '<b>Multi-query / step-back</b>: rephrase, retrieve wide, fuse',
    '<b>Agentic retrieval</b> last — cost is only justified past top-k’s ceiling'
  ],

  quiz: {
    q: 'Users ask “what’s the policy on returning the ANC headphones?” but the docs only say “noise-cancelling earbuds.” Retrieval keeps missing. Which advanced technique targets this exact mismatch?',
    opts: [
      'Reranking with a cross-encoder',
      'Query rewriting / multi-query — map product jargon to the docs’ vocabulary',
      'GraphRAG with entity traversal',
      'Larger top-k (50 instead of 5)'
    ],
    a: 1,
    why: 'This is a vocabulary mismatch: the query says “ANC headphones,” the docs say “noise-cancelling earbuds” — semantically close but not cosine-close enough. Query rewriting / multi-query generation bridges jargon by producing variants in the documents’ own terms (“noise-cancelling earbuds return policy”). Reranking reorders what was already found; it can’t find chunks cosine missed.'
  },

  notes: `
# Advanced RAG — HyDE & agentic RAG

## The query-side problem
Retrieval fails in two directions: questions phrased unlike the documents (vocabulary gap), and questions whose answer spans multiple retrievals (multi-hop). Fix the query, or add reasoning between question and store.

## The toolbox, cheapest to priciest

| Technique | What it does | Cost |
| --- | --- | --- |
| Query rewriting | LLM makes the question specific/keyword-rich | 1 small LLM call |
| Multi-query | 3 rephrasings, retrieve all, fuse | 3× retrieval + calls |
| HyDE | generate hypothetical answer, embed IT | 1–3 LLM calls |
| Step-back | retrieve broad concept, then specifics | 2 retrieval passes |
| RAG-Fusion | multi-query + RRF merge | multi-query + fusion |
| Agentic retrieval | LLM loop: search, read, decide, re-search | unbounded-ish |
| GraphRAG | entities/relations graph traversal | heavy preprocessing |

## HyDE, the star
Questions are short and interrogative; documents are declarative statements. Their embeddings live in different neighborhoods. HyDE closes the gap: \`LLM(question) → hypothetical answer → embed → search\`. The fake answer’s vocabulary matches real docs, so cosine lands near genuine answers. Works even when the hypothetical contains small errors — retrieval is forgiving.

## Agentic retrieval — when to actually use it
Signals: golden-set questions where the answer chunk requires TWO searches (comparison across docs, follow-the-reference questions); users asking multi-part questions; cross-document synthesis (“summarize all warranty differences”). The agent (reels 49–59) gets \`search(query)\` as a tool and loops: observe results, reason, reformulate, repeat — with a hard step cap (3–5) and budget guard (reel 60).

## Anti-patterns
- HyDE on exact-ID queries — hypothetical answers blur the exact token (use hybrid, reel 39).
- Agentic loops with no step cap — one pathological question = one invoice.
- GraphRAG for a 200-page policy handbook — build the basic pipeline first, measure (reel 41), then escalate.

> **.NET ↔ Python:** all of these are more LLM calls around the same retrieval seam. If your store sits behind an HTTP API (reel 36), HyDE and multi-query are client-side strategy patterns — language-agnostic.

Next: reel 43 — the ChatBots block: from pipeline to product.
`
});
