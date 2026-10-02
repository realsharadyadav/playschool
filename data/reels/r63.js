/* Reel 63 — Use case: support agent (Agentic · Agentic Use Cases) */
SS.registerReel({
  id: 'r63', num: 63, section: 'agentic', block: 'Agentic Use Cases',
  title: 'Use case: support agent',
  hook: 'No compiler oracle, real emotions, money on the line. **The hardest agent job.**',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE USE CASE',
      title: 'Support: the agent job where **the tests are human and the stakes are churn.**',
      sub: 'Resolve or escalate — every ticket, every time.',
      narration: 'Close out the applied trio: research agent found knowledge, coding agent shipped code, and the support agent faces the hardest environment — no test oracle, emotional users, refund dollars, and a churn metric watching every interaction. The mission is binary and brutal: RESOLVE the ticket correctly, or ESCALATE it to a human fast. An agent that resolves well saves millions; one that escalates badly burns trust and budget.'
    },
    {
      type: 'arch',
      layers: [
        { e: '🎫', t: 'Triage', s: 'classify: refund / bug / how-to / angry' },
        { e: '🔍', t: 'Investigate', s: 'RAG over policy + order lookup tools' },
        { e: '✍️', t: 'Resolve or escalate', s: 'draft answer — or hand off with notes' },
        { e: '📊', t: 'Learn', s: 'resolutions feed memory (57) + evals (47)' }
      ],
      narration: 'The support pipeline, four stations. Triage: classify the ticket — refund request, bug report, how-to, or angry-customer alert; classification routes everything downstream. Investigate: RAG over your policy documents (reels 36–40) plus order-status tools (reel 52) — grounding is non-negotiable when quoting policy. Resolve or escalate: draft the answer with citations, or hand off to a human WITH the investigation notes attached — a good escalation is a solved-first-contact waiting to happen. And learn: every resolution distills into memory; every outcome feeds the eval suite.'
    },
    {
      type: 'compare',
      cards: [
        { e: '🤖', t: 'Auto-reply everything', s: 'confident wrongness at scale — churn' },
        { e: '🤝', t: 'Resolve-or-escalate', s: 'fast confident resolutions, honest handoffs', win: true }
      ],
      narration: 'The defining design decision. Auto-reply-everything maximizes deflection and minimizes trust — one confidently-wrong refund policy at scale is a viral incident. Resolve-or-escalate accepts lower automation numbers for higher correctness: the agent resolves what it can GROUND — policy cited, order verified — and escalates the rest with notes. Deflection rate stops being the KPI; first-contact resolution and escalation quality become the truth.'
    },
    {
      type: 'list',
      items: [
        { e: '📚', t: 'Grounded answers only', s: 'cite policy chunks or escalate' },
        { e: '👤', t: 'Anger detection', s: 'frustration → human, fast' },
        { e: '🧾', t: 'Escalation notes', s: 'summary + evidence + tried-so-far' },
        { e: '📏', t: 'Eval from transcripts', s: 'rubrics + red-team (reel 47)' }
      ],
      narration: 'The four support disciplines. Grounded answers only: every policy claim carries a citation — if retrieval can\'t ground it, the agent escalates rather than improvises (reel 28\'s hallucination, business-priced). Anger detection: frustration is a routing signal, not a sentiment score — a furious customer escalates immediately, because a wrong automated reply to anger is the churn event you\'re paying to avoid. Escalation notes: the human inherits a summary, the evidence, and what was already tried — escalation quality is a first-class metric. And eval from transcripts: the rubric suite runs on real conversations weekly, red-team cases included.'
    },
    {
      type: 'bridge', kicker: 'BLOCK COMPLETE',
      title: 'Use cases: done. **Now the capstone — spreadsheets, SOPs, and MCP.**',
      next: 'Next · Reel 64: SOPs × spreadsheets — the real problem',
      narration: 'That completes the use-cases block — research, coding, support: one anatomy, three oracles of very different honesty. Everything converges now. The capstone block: the Excel agent. Real spreadsheets, real SOP documents, MCP tooling, and human approvals — the full course in one build. Reel sixty-four, swipe up.'
    }
  ],

  code: {
    title: '🐍 The resolve-or-escalate core',
    body:
`SYSTEM = """You are a support agent for Contoso.
TOOLS: search_policy, get_order, issue_refund (confirm-gated).
RULES:
1. Answer ONLY from search_policy results — cite [n].
2. If get_order is needed, call it before answering.
3. If the answer isn't grounded, or the customer is angry
   (caps, insults, "manager"), escalate.
4. Escalations must include: summary, evidence, tried-so-far.

Reply JSON: {"action": "reply"|"escalate",
             "text": ..., "citations": [...],
             "escalation_notes": ...}"""

def handle_ticket(ticket: str) -> dict:
    for attempt in range(3):
        out = json.loads(call_llm(SYSTEM, [{"role": "user",
                                            "content": ticket}]))
        if out["action"] == "escalate":
            route_to_human(ticket, out["escalation_notes"])
            return out
        grounded = all(c in retrieved_chunk_ids()      # verify citations!
                       for c in out["citations"])
        if grounded:
            send_to_customer(out["text"]); return out
        # citation hallucination — reflect and retry (reel 56)
    route_to_human(ticket, "citation verification failed")
    return {"action": "escalate"}`,
    annot: [
      '<b>grounded = citations actually in retrieved ids</b> — never trust the model\'s citation list; verify against what retrieval really returned (reel 28, automated).',
      '<b>Anger is a routing rule, not a vibe</b> — explicit escalation triggers in the system prompt beat downstream sentiment models for reliability.',
      '<b>Failed verification escalates</b> — after 3 grounded-attempts, a human inherits the ticket; graceful degradation is a designed path, not an error.'
    ]
  },

  recap: [
    'Mission: <b>resolve grounded, escalate honestly</b>',
    'Citations <b>verified programmatically</b>, not trusted',
    'Anger → <b>immediate human routing</b>; notes make escalation cheap'
  ],

  quiz: {
    q: 'Why is deflection rate a dangerous primary KPI for a support agent?',
    opts: [
      'It measures speed rather than correctness — optimizing it rewards confidently-wrong auto-replies that maximize silent churn',
      'It cannot be measured automatically',
      'It penalizes escalation even when escalation was the right call',
      'All of the above'
    ],
    a: 3,
    why: 'Deflection counts "not escalated" as success regardless of answer quality — it rewards the exact failure mode that destroys trust (confident hallucinated policy answers), it\'s blind to silent churn, and it structurally punishes correct escalations. Replace it with first-contact resolution, escalation quality, and post-resolution customer satisfaction.'
  },

  notes: `
# Use case: support agent

## Why support is the hardest agent job
| Dimension | Coding agent | Support agent |
| --- | --- | --- |
| Oracle | compiler/tests — binary, instant | human satisfaction — delayed, ambiguous |
| Error cost | bad diff (caught in review) | wrong refund / broken promise (churn) |
| Input trust | repo content (semi-trusted) | user text — adversarial & emotional (74) |
| Feedback | traceback (diagnostic) | "that didn\'t help" (useless) |

Every soft skill in the course — grounding (28), citation verification (41), escalation design (60), rubric evals (47) — becomes load-bearing here.

## The support agent stack
- **Triage model**: few-shot classifier (reel 26) → route to playbooks.
- **Policy brain**: RAG over policy/handbook with mandatory citations (36–40).
- **Action tools**: get_order, issue_refund — confirm-gated per reel 60 with amount thresholds.
- **Tone layer**: system-prompt voice rules (25) + brief empathy framing; escalate anger per rules.
- **Memory**: customer history, past tickets, preferences (57).
- **Evals**: transcript rubrics weekly + red-team injection cases (47).

## Escalation notes — the underrated art
\`\`\`
SUMMARY: refund request for order A-4421, delivered late
EVIDENCE: policy [3] allows late-delivery refunds; order shows 9-day delay
TRIED: offered store credit (customer declined), policy citation sent
SUGGESTED: full refund per policy, customer tier: Gold
\`\`\`
A human reading this resolves in one minute. Escalation notes are the agent\'s last product — measure their quality like answers.

## Metrics that tell the truth
- First-contact resolution rate (by agent vs human lane)
- Escalation quality score (human rating of notes)
- Grounded-answer rate (citation-verified)
- CSAT on agent-handled tickets
- Cost per resolution vs fully-human baseline

## Common failure modes
- **Policy drift**: docs updated, store stale (36/41) — freshness SLAs on ingestion.
- **Over-escalation**: agent escalates everything (unusable economics) — tune the escalate rules with eval data, not vibes.
- **Under-escalation**: agent improvises beyond policy — citation verification (the panel) is the enforcement point.

Next: reel 64 — the capstone begins: SOPs × spreadsheets, the real problem.
`
});
