/* Reel 64 — SOPs × spreadsheets — the real problem (Agentic · Capstone: Excel Agent) */
SS.registerReel({
  id: 'r64', num: 64, section: 'agentic', block: 'Capstone: Excel Agent',
  title: 'SOPs × spreadsheets — the real problem',
  hook: 'Millions of humans do this daily. **No software solves it. Agents can.**',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE PROBLEM',
      title: 'Every office runs on spreadsheets **governed by Word documents.**',
      sub: 'SOPs: the rules. Spreadsheets: the reality. Humans: the bridge.',
      narration: 'Here is the most common knowledge-work task on earth, and the least automated: follow a Standard Operating Procedure — a written document — and apply it to a spreadsheet. Invoice processing, expense audits, data cleanup, reconciliation. Millions of people read rule fourteen, squint at column H, make the edit, and repeat. Software never solved it because every company\'s SOPs differ — until agents that can READ rules and ACT on files made it solvable.'
    },
    {
      type: 'compare',
      cards: [
        { e: '🧑‍💼', t: 'Human SOP worker', s: 'careful, slow, inconsistent, 8h/day' },
        { e: '🤖', t: 'SOP-following agent', s: 'careful, tireless, consistent, auditable', win: true }
      ],
      narration: 'The staffing comparison. Humans reading SOPs get tired: rule twelve drifts by Friday, edge cases get inconsistent calls, and every decision is invisible. An agent reads the SOP fresh on every cell, applies rules identically at 5 p.m. and 5 a.m., and — the killer feature — writes an AUDIT TRAIL: which rule fired, what changed, why. Not replacing judgment: industrializing consistency, and reserving humans for the judgment calls.'
    },
    {
      type: 'list',
      items: [
        { e: '📄', t: 'SOPs are instructions', s: 'prose rules, edge cases, examples' },
        { e: '📊', t: 'Sheets are state', s: 'rows, columns, cells to change' },
        { e: '🔍', t: 'Gap: comprehension', s: "rules → concrete cell edits" },
        { e: '✅', t: 'Gap: verification', s: 'edits → validated + approved' }
      ],
      narration: 'Why this is an agent problem and not a script. SOPs are PROSE — written for humans, full of edge cases and judgment words like "reasonable" and "if unusual". Spreadsheets are STATE — concrete cells that must change correctly. The gap is comprehension: turning rule text into cell-level edits requires reading, reasoning, and applying — the exact agent loop. And the second gap is verification: edits must be validated against the rules and approved by a human before they commit. Two gaps, two agent capabilities, one capstone.'
    },
    {
      type: 'diffapprove',
      sheet: 'Invoices.xlsx',
      verdict: 'wait',
      rows: [
        { cell: 'B4', before: '1,250.00', after: '1,240.00', rule: 'SOP-3 rounding' },
        { cell: 'C9', before: 'ACME', after: 'ACME Ltd', rule: 'SOP-1 vendor names' },
        { cell: 'D2', before: 'pending', after: 'approved', rule: 'SOP-7 status flow' }
      ],
      narration: 'The product, visualized. The agent proposes a DIFF — not silent edits: cell B4, twelve-fifty to twelve-forty, because SOP-three says round to the nearest ten; C9 normalized per SOP-one; D2 status advanced per SOP-seven. Every proposed change carries its rule citation. A human glances at the diff, sees the reasoning, and approves or rejects — reel sixty\'s approval gate as a spreadsheet review UI. This is where the capstone is headed: build it in the next three reels.'
    },
    {
      type: 'bridge', kicker: 'THE CAPSTONE',
      title: 'Problem framed. **Build the machine: an Excel MCP server.**',
      next: 'Next · Reel 65: Build the Excel MCP server',
      narration: 'The problem every office knows, the pattern this entire course built. The capstone assembles it: an MCP server that gives agents safe, structured hands for spreadsheets — next reel. Then the SOP-following brain, then the end-to-end reconciliation agent with approvals. Reel sixty-five, swipe up.'
    }
  ],

  code: {
    title: '🐍 The SOP-execution contract (design first)',
    body:
`from pydantic import BaseModel

class RuleHit(BaseModel):
    rule_id: str          # "SOP-3" — cite the exact rule
    row: int              # which spreadsheet row
    cell: str             # e.g. "B4"
    before: str
    after: str
    justification: str    # quote the SOP sentence that fired

class SheetPlan(BaseModel):
    sheet: str
    changes: list[RuleHit]
    needs_human: list[str]   # judgment calls: "unusual amount, SOP-9"

# The agent's job, fully specified:
#   read SOP (procedural memory, reel 57)
#   scan sheet via tools (reel 65's MCP server)
#   emit SheetPlan (structured output, reel 27)
#   human approves (reel 60) -> apply -> audit log
# Anything that can't cite a rule_id goes to needs_human.`,
    annot: [
      '<b>RuleHit.justification quotes the SOP</b> — attribution is the anti-hallucination control: a change that can\'t quote its rule doesn\'t ship.',
      '<b>needs_human is a first-class field</b> — "unusual", "suspicious", "manager discretion" in SOP text route here by design (reel 60).',
      '<b>SheetPlan is the whole handoff</b> — typed contract between brain and hands, exactly like reel 58\'s inter-agent contracts.'
    ]
  },

  recap: [
    'SOPs = prose rules; sheets = cell state — <b>agents bridge them</b>',
    'Output is a <b>diff with rule citations</b>, not silent edits',
      '"Judgment words" in SOPs → <b>needs_human</b>, by design'
  ],

  quiz: {
    q: 'An SOP says "flag unusual amounts for review." The agent finds a $9,999 invoice (threshold is $10,000). Correct behavior?',
    opts: [
      'Edit nothing — the amount is under the stated threshold',
      'Approve it — the rules were followed exactly',
      'Include it in needs_human with the SOP quote and the near-threshold evidence — "unusual" is a judgment call the SOP assigns to humans',
      'Reject the invoice outright'
    ],
    a: 2,
    why: '"Unusual" is deliberately a judgment word — the SOP assigns it to humans. A just-under-threshold value is exactly the pattern "unusual" exists to catch; the agent\'s job is to surface it WITH evidence (quote + amount + threshold proximity), not to silently pass or unilaterally reject. Correct handling of judgment words is what makes the system trustworthy at 5 a.m.'
  },

  notes: `
# SOPs × spreadsheets — the real problem

## Why traditional automation failed here
- **Rules engines**: require SOPs translated into code — translation lag, every SOP change needs a developer, edge cases drown in conditionals.
- **RPA bots**: replay clicks — break on layout changes, encode zero understanding, audit nothing.
- **Spreadsheet formulas**: live IN the sheet — can\'t read prose, can\'t quote a rule, can\'t escalate judgment.
The missing piece was always COMPREHENSION of prose rules — which is precisely what LLMs added to the world.

## The shape of real SOPs (and what agents must handle)
- Explicit rules: "Round amounts to the nearest 10 (SOP-3)."
- Conditional rules: "If the vendor is new AND amount > $5,000, require manager approval (SOP-5)."
- Judgment rules: "Flag anything that looks unusual (SOP-9)." → needs_human.
- Examples and counterexamples: few-shot gold (reel 26) — include them in the SOP context.
- Cross-references: "Follow SOP-2 for date formats." → multi-hop reading.

## The trust contract
1. **No uncited edits**: every change carries rule_id + quote (the panel\'s RuleHit).
2. **No judgment calls by the agent**: "unusual"/"suspicious"/"manager discretion" → needs_human.
3. **No silent writes**: apply only after approval; audit log records actor (human/agent), rule, before/after.
4. **Verifiable coverage**: scan report — which rows matched which rules, which rows matched nothing.

## Where the pieces come from
- Reading SOPs + grounding answers: reels 25–28, 36–40 (RAG over the SOP library).
- Spreadsheet hands: MCP server — next reel (65).
- Structured plans: reels 27, 53, 58 (typed contracts).
- Approval + audit: reel 60.
- Reflection on rule conflicts: reel 56.
- End-to-end: reel 67.

## Business framing (for the meeting with your CFO)
Back-of-envelope: 2 hours/day of SOP-sheet work per knowledge worker, error rate ~2–5% on manual entry, audit cost on every mistake. An agent with a 95%+ grounded-edit rate and full attribution pays for its tokens in the first week — and the audit trail alone often justifies the project under compliance budgets.

Next: reel 65 — the hands: an Excel MCP server agents can safely use.
`
});
