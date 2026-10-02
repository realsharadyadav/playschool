/* Reel 61 — Use case: research agent (Agentic AI · Agentic Use Cases) */
SS.registerReel({
  id: 'r61', num: 61, section: 'agentic', block: 'Agentic Use Cases',
  title: 'Use case: research agent',
  hook: 'A research agent turns **sources into citations**, not hallucinations.',

  scenes: [
    {
      type: 'bigtext', kicker: 'USE CASE #1',
      title: 'Deep research, **minus the weekends**.',
      sub: 'Planner → Searcher → Reader → Writer',
      narration: 'First real use case: the research agent. You give it a question — it comes back with a sourced report. Four roles work the problem: planner, searcher, reader, writer.'
    },
    {
      type: 'diagram', linkLabel: 'hands off',
      nodes: [
        { e: '🧭', t: 'Planner', s: 'brief → sub-questions' },
        { e: '🔎', t: 'Searcher', s: 'queries, hoards URLs' },
        { e: '📄', t: 'Reader', s: 'verbatim cited passages' },
        { e: '✍️', t: 'Writer', s: 'sourced report' }
      ],
      narration: 'The planner breaks your brief into sub-questions. The searcher runs queries and hoards URLs. The reader opens each source and pulls out cited passages. The writer stitches it all into the report.'
    },
    {
      type: 'loop',
      chips: ['🔍 search("langgraph vs crewai 2025")', '🌐 fetch_page(url)', '✂️ verify_quote(raw, claim)', '📚 write_section(draft)'],
      narration: 'Inside, it’s the same observe-think-act loop you know from reel fifty-four. Query, fetch, verify a quote against the raw page, draft a section — then plan the next move. Repeat until every sub-question is answered.'
    },
    {
      type: 'chat',
      bubbles: [
        { who: 'you', text: 'Compare LangGraph vs CrewAI for production agents — cite everything.' },
        { who: 'bot', text: 'Splitting into 4 sub-questions. Searching…', tool: 'search("LangGraph CrewAI production 2025")' },
        { who: 'bot', text: '9 sources found. Verifying quotes before I write a word…', tool: 'verify_quote(src3, "checkpointing")' },
        { who: 'bot', text: 'Report ready: 6 pages, 22 citations, 2 gaps flagged 👇' }
      ],
      narration: 'Watch it work: compare LangGraph versus CrewAI for production, cite everything. It searches, then refuses to write a single line until each quote is verified against the raw page.'
    },
    {
      type: 'list',
      items: [
        { e: '🚫', t: 'No source, no claim', s: 'every sentence carries a URL' },
        { e: '🧾', t: 'Verbatim quotes only', s: 'paraphrase invites hallucination' },
        { e: '🧪', t: 'Verify before writing', s: 'quote must exist in raw text' },
        { e: '🕳️', t: 'Flag the gaps', s: 'unanswered sub-questions, honestly' }
      ],
      narration: 'Citation discipline is the whole game. No source, no claim. Quotes verbatim, verified in the raw text. And when a sub-question stays unanswered, the report says so — no filler.'
    },
    {
      type: 'bridge', kicker: 'COMING UP',
      title: 'Next: an agent that writes **code** — file tools, patches, sandboxes.',
      next: 'Next · Reel 62: Use case: coding agent',
      narration: 'Same loop, different job next: an agent that writes code. File tools, patch discipline, sandboxes, and a human approving every diff. That is reel sixty-two.'
    }
  ],

  code: {
    title: '🐍 The search tool + citation gate',
    body:
`# pip install tavily-python
from tavily import TavilyClient

tavily = TavilyClient()          # reads TAVILY_API_KEY

def search_tool(query: str, max_results: int = 5) -> list[dict]:
    """The searcher’s only tool: web search that returns raw pages."""
    resp = tavily.search(query=query, max_results=max_results,
                         include_raw_content=True)
    return [{"title": r["title"], "url": r["url"],
             "excerpt": r["content"][:400],
             "raw": r.get("raw_content", "")} for r in resp["results"]]

def cite(source: dict, claim: str, quote: str) -> str:
    """The writer’s rule: a claim ships only with a verified verbatim quote."""
    if quote.lower() not in source["raw"].lower():
        raise ValueError(f"quote not found in {source['url']}")
    return f"[{source['title']}]({source['url']}): “{quote}” — {claim}"`,
    annot: [
      '<b>tavily.search(..., include_raw_content=True)</b> fetches full page text, not snippets — the raw material citations are verified against.',
      'The reader never paraphrases: <b>cite()</b> raises unless the quote appears verbatim in the fetched source.',
      'A failed verification means the claim is <b>dropped or flagged</b> — never silently rewritten.'
    ]
  },

  recap: [
    'Four roles: planner → searcher → reader → **writer**',
    'Verify every quote against **raw** pages',
    'No source, no **claim**'
  ],

  quiz: {
    q: 'A research agent should verify every quote by…',
    opts: [
      'Asking the LLM whether the claim sounds right',
      'Checking the quote appears verbatim in the fetched raw page',
      'Counting how many sources mention the topic',
      'Setting temperature to zero while writing'
    ],
    a: 1,
    why: 'The LLM is a next-token guesser (reel 21) — “sounds right” is exactly what hallucination is. Only a verbatim match against the fetched page grounds the claim; temperature only changes sampling, not truth.'
  },

  notes: `
# Use case: research agent

## The shape
A research agent turns “go find out X” into a **sourced deliverable**. The proven decomposition is four roles:

| Role | Job | Typical tools |
|---|---|---|
| 🧭 Planner | Break the brief into sub-questions; budget searches per question | LLM (reel 55 patterns) |
| 🔎 Searcher | Run queries, dedupe canonical URLs, hoard candidates | Tavily, SerpAPI, Brave Search API |
| 📄 Reader | Fetch pages, extract **verbatim** passages tied to claims | \`httpx\`, trafilatura |
| ✍️ Writer | Synthesize cross-checked notes; flag gaps | LLM + structured output (reel 27) |

## Why roles instead of one mega-prompt
- **Context hygiene** — the writer never sees forty raw pages, only verified quotes. Your context window (reel 23) survives.
- **Testable stages** — you can eval the searcher (did it find authoritative domains?) independently of the writer (reel 37).
- It maps cleanly onto a LangGraph graph or a CrewAI crew (reel 59), but the roles can also live as plain functions in one process.

## Citation discipline
> A research agent without citation discipline is a **hallucination machine with a search API**. The verify-before-write rule is the entire difference.

- Quotes are **verbatim** — paraphrase is where invented facts sneak in.
- Every claim stores URL + retrieval date.
- No source found? The claim is dropped or explicitly marked “unverified”.
- **Gap honesty**: sub-questions that stayed unanswered are listed in the report, not papered over.

## The code sketch
\`tavily.search()\` params worth knowing: \`include_raw_content=True\` returns full page markdown (heavier, but it’s what verification needs), \`max_results\` caps the funnel, \`search_depth="advanced"\` for harder queries, \`days=365\` for recency, \`include_domains=[...]\` to pin authoritative sources.

## Production gotchas
- **Cost**: raw pages are token-hungry. Summarize per source, then synthesize (map-refine, reel 45) instead of one mega-prompt.
- **Paywalls / bot protection**: expect 403s; degrade gracefully and note the gap.
- **Duplicates**: dedupe by canonical URL before embedding or reranking (reel 39).
- **Rot**: web pages change; store the fetched snapshot you verified against.

## Coming up
Same loop, new job: an agent that writes code — file tools, patch discipline, sandboxing. Reel 62.
`
});
