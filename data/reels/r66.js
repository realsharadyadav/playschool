/* Reel 66 — The SOP-following agent — plan, validate, approve (Agentic · Capstone: Excel Agent) */
SS.registerReel({
  id: 'r66', num: 66, section: 'agentic', block: 'Capstone: Excel Agent',
  title: 'The SOP-following agent — plan, validate, approve',
  hook: 'Brain meets hands: **SOPs in, cited diffs out, humans approve.**',

  scenes: [
    {
      type: 'loop',
      chips: ['Load SOP context', 'read_rows (paged)', 'Plan edits per rule', 'validate citations', 'propose_edits', 'human approves → apply'],
      narration: 'The SOP agent loop, one full cycle. Load the SOP context — the relevant procedure documents, pinned like procedural memory. Read the sheet through the MCP tools, paged. Plan: for each applicable rule, draft the cell edits as RuleHits with citations. Validate: does every RuleHit quote a real SOP sentence? Do the before-values match what\'s actually in the cells? Propose the staged diff. Human approves. Apply. The whole course — retrieval, structured output, reflection, governance — in one loop.'
    },
    {
      type: 'bigtext', kicker: 'THE CONTRACT',
      title: 'No rule citation, **no edit.** No grounding, **no proposal.**',
      sub: 'The two invariants that make the system trustworthy.',
      narration: 'Two invariants hold the entire system together. One: no edit ships without a rule citation — the SOP quote IS the justification, and unquoted edits are rejected at validation. Two: no proposal ships without grounding — retrieval must find the SOP text behind every citation, or the change routes to needs-human instead. These aren\'t prompt suggestions; they\'re validation code. Hallucinated rules can\'t survive a quote-check against the real document; hallucinated citations can\'t survive a grounding check.'
    },
    {
      type: 'diagram',
      nodes: [
        { e: '📚', t: 'SOP library', s: 'retrieved per rule (36–40)' },
        { e: '🧠', t: 'Planner', s: 'rows × rules → RuleHits' },
        { e: '✅', t: 'Validator', s: 'quote-check + before-check' },
        { e: '👤', t: 'Approval UI', s: 'diff + citations → token' }
      ],
      narration: 'The pipeline, four stations. The SOP library: retrieval grounds the agent in the actual procedure text — never the model\'s memory of what SOP-three probably says. The planner: for each row, check each applicable rule, emit RuleHits — plan first, act never. The validator: two programmatic checks — the quoted SOP sentence EXISTS in the retrieved document, and the recorded before-value EQUALS the cell\'s current content. Both cheap, both deterministic, both fatal to hallucination. Then the approval UI renders the surviving diff for a human signature.'
    },
    {
      type: 'compare',
      cards: [
        { e: '🗣️', t: '"I followed the SOP" (prose)', s: 'unverifiable, unfixable' },
        { e: '🧾', t: 'Cited diff + validation report', s: 'auditable, approvable, improvable', win: true }
      ],
      narration: 'The difference between an agent and an employee you\'d fire. Prose claims are vibes — "I followed the procedure" proves nothing and fixes nothing. The cited diff with its validation report is an artifact: every change reviewable in seconds, every rule-check auditable forever, every rejection a labeled training case for the eval suite. When the diff is wrong, you SEE where; when it\'s right, approval takes one glance. Trust isn\'t requested — it\'s engineered.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'Brain and hands: united. **The finale: end-to-end reconciliation.**',
      next: 'Next · Reel 67: End-to-end: multi-sheet reconciliation agent',
      narration: 'The SOP-following brain is complete: grounded planning, programmatic validation, human approval. The capstone finale assembles everything into the hardest version — reconciling MULTIPLE spreadsheets against each other, with rule conflicts, judgment calls, and a full audit story. Reel sixty-seven, swipe up.'
    }
  ],

  code: {
    title: '🐍 Planner + validator: the trustworthy core',
    body:
`PLAN = """You are an SOP-following data agent.
Given SOP RULES and ROWS, propose edits as RuleHits.
HARD RULES:
- Every RuleHit MUST quote the exact SOP sentence it applies.
- If a rule contains judgment words (unusual, suspicious),
  put the row in needs_human instead.
- Verify 'before' against the provided rows, not memory.

SOP RULES: {sops}
ROWS: {rows}

Output: SheetPlan JSON."""

def validate(plan: SheetPlan, sops_text: str, sheet_rows: dict) -> SheetPlan:
    ok, needs = [], []
    for ch in plan.changes:
        quote_ok = ch.justification.strip() in sops_text   # quote exists
        before_ok = sheet_rows.get(ch.cell) == ch.before   # cell matches
        (ok if quote_ok and before_ok else needs).append(ch)
    return SheetPlan(sheet=plan.sheet, changes=ok,
                     needs_human=plan.needs_human +
                     [f"{c.cell}: validation failed" for c in needs])

sops = retrieve_sops("invoice processing")     # reels 36-40
rows = read_rows_paged("Invoices", 1, 200)     # MCP tool
plan = SheetPlan.parse_raw(llm(PLAN.format(sops=sops, rows=rows), temp=0.0))
clean = validate(plan, sops, rows)             # deterministic gate
propose_edits(clean.json())                    # stage for approval`,
    annot: [
      '<b>quote in sops_text</b> — the citation must be a VERBATIM substring of the retrieved SOP; paraphrased rules are rejected (this one check kills most hallucination).',
      '<b>before == cell content</b> — stale reads are caught; the sheet changed between read and plan? Validation fails the edit to needs_human instead of corrupting data.',
      '<b>temperature 0.0 planning</b> — rule application is deterministic work; the creativity budget is zero (reel 24).'
    ]
  },

  recap: [
    'Invariants: <b>no citation → no edit</b>; <b>no grounding → no proposal</b>',
    'Validator is <b>deterministic code</b>, not prompt promises',
    'Judgment words → <b>needs_human</b> — by construction'
  ],

  quiz: {
    q: 'Why validate the RuleHit\'s quoted SOP sentence against the retrieved document text rather than trusting the model\'s citation?',
    opts: [
      'The model might cite the wrong SOP number by typo',
      'A probabilistic generator can produce plausible-but-fabricated quotes — substring verification against the actual document is a deterministic check that fabricated rules cannot pass',
      'Validation improves the formatting of the audit log',
      'The MCP server requires exact quotes for storage'
    ],
    a: 1,
    why: 'Models generate plausible text, including plausible rule quotes that were never in the SOP (reel 28 — hallucination applies to citations too). A substring check against the retrieved document is cheap, deterministic, and fatal to fabricated rules: if the quote isn\'t in the document, the edit cannot proceed. This is grounding verification (reel 41) applied at the cell level.'
  },

  notes: `
# The SOP-following agent — plan, validate, approve

## The pipeline, restated as a data flow
\`\`\`
SOP library ──retrieve──▶ SOP context ─┐
                                        ├─▶ PLANNER ─▶ SheetPlan
sheet rows ──MCP read────▶ rows ──────┘                    │
                                                           ▼
                                              VALIDATOR (deterministic)
                                                ├─ quote-check vs SOP text
                                                └─ before-check vs live cells
                                                           ▼
                                        clean changes ─▶ propose_edits
                                        failed checks ─▶ needs_human
                                                           ▼
                                              APPROVAL UI ─▶ token ─▶ apply
\`\`\`

## Design decisions and their reel lineage
- **Planner emits structured SheetPlan** — reels 27/53 (schema-constrained output beats prose plans).
- **SOP context via retrieval** — reels 36–40; pin the full SOP set when small, retrieve per-rule when large.
- **Paged reads** — reel 65; the planner sees the sheet in 200-row windows with row-offsets recorded.
- **Deterministic validator** — reels 41/47; LLM proposes, code disposes.
- **needs_human routing** — reels 60/64; judgment words and validation failures take the same escalator.
- **Temperature 0** — reel 24; rule application permits no sampling.

## Handling rule conflicts (reflection, reel 56)
Real SOPs contradict: SOP-3 says round to nearest 10; SOP-12 says never alter billed amounts. The planner hits both → the validator can\'t resolve prose conflicts. Protocol: conflicting rules go to needs_human WITH both quotes and a one-line conflict summary. Do NOT let the model pick a winner — precedence is a business decision, recorded as a new SOP amendment.

## The eval suite for this agent (reels 41/47, specialized)
- Golden workbook + SOP pairs → expected diffs; measure edit precision/recall.
- Injected hallucination tests: SOPs that DON\'T contain a plausible rule — does the agent invent it? (Validator should catch; test that it does.)
- Stale-read tests: sheet mutates between read and validate — before-check must fail the edit.
- Judgment-word tests: "unusual" cases route to needs_human, not to edits.

## Rollout pattern (earn autonomy, reel 60)
1. Shadow mode: agent plans, humans execute — measure plan accuracy.
2. Assist mode: validated diffs auto-apply under $X; judgment calls always human.
3. Supervised autonomy: audit sampling weekly; promote/demote per rule.

> **.NET ↔ Python:** validator and policy are pure code — portable anywhere. The planner lives where the LLM plumbing is richest (Python); the MCP seam keeps the Excel server consumable from ASP.NET tooling too.

Next: reel 67 — the finale: multi-sheet reconciliation, end to end.
`
});
