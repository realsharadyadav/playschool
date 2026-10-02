/* Reel 67 — End-to-end: multi-sheet reconciliation agent (Agentic · Capstone: Excel Agent) */
SS.registerReel({
  id: 'r67', num: 67, section: 'agentic', block: 'Capstone: Excel Agent',
  title: 'End-to-end: multi-sheet reconciliation agent',
  hook: 'The full capstone: **three workbooks, one agent, zero unexplained edits.**',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE FINALE',
      title: 'Reconciliation: **where every skill meets the real world.**',
      sub: 'Two source sheets, one target, one SOP library, one audit trail.',
      narration: 'The hardest version of the problem, and the graduation exam. A target workbook must match TWO source systems — the ERP export and the payment processor\'s report — under a library of SOPs. Discrepancies are real: missing rows, mismatched amounts, status drift. The agent must find them, classify them by rule, propose fixes as cited diffs, and route true ambiguities to humans. Every skill from seventy-four reels shows up for work.'
    },
    {
      type: 'arch',
      layers: [
        { e: '📥', t: 'Ingest & align', s: 'read all three via MCP; key matching' },
        { e: '🔍', t: 'Detect discrepancies', s: 'row-by-row, key by key' },
        { e: '🧠', t: 'Classify per SOP', s: 'each gap → rule or needs_human' },
        { e: '✅', t: 'Diff + approve + apply', s: 'reel 66 pipeline, per workbook' }
      ],
      narration: 'The four phases. Ingest and align: page through all three workbooks via the MCP tools; match rows on the join key — invoice ID — building one aligned view in the agent\'s working memory. Detect: walk the aligned rows and find gaps — in target only, in sources only, amount mismatches, status conflicts. Classify: each discrepancy goes through the SOP library — does a rule cover it? Cited fix, or needs-human. Then the reel-sixty-six pipeline runs per workbook: plan, validate, approve, apply, audit. Four phases, each one a reel you\'ve already passed.'
    },
    {
      type: 'diffapprove',
      sheet: 'Reconciliation.xlsx',
      verdict: 'wait',
      rows: [
        { cell: 'E14', before: '(missing)', after: 'INV-2214 · 890.00', rule: 'SOP-4 sync missing' },
        { cell: 'F22', before: '1,200.00', after: '1,100.00', rule: 'SOP-3: processor fee' },
        { cell: 'G7', before: 'paid', after: 'paid', rule: 'SOP-7: already correct' },
        { cell: 'H31', before: '??', after: 'UNCHANGED', rule: 'SOP-9: needs human' }
      ],
      narration: 'The output artifact — a reconciliation report a CFO can read. Row fourteen: an invoice missing from the target, added per SOP-four. Row twenty-two: amount corrected for the processor fee per SOP-three. Row seven: verified correct, explicitly listed — because a reconciliation that only shows changes hides its coverage; SHOWING the clean rows proves the scan happened. And row thirty-one: the agent\'s proudest moment — an ambiguous three-way conflict it declined to resolve, flagged for a human with both source values quoted. That refusal is the product working.'
    },
    {
      type: 'list',
      items: [
        { e: '🔑', t: 'Key alignment first', s: 'join before compare — always' },
        { e: '📏', t: 'Coverage report', s: 'N rows scanned, M rules fired' },
        { e: '🧾', t: 'Full audit story', s: 'reads, plans, approvals, applies' },
        { e: '🎓', t: 'Lessons to memory', s: 'conflicts → SOP amendments (57)' }
      ],
      narration: 'The four graduation lessons. Key alignment first: reconciliation lives and dies on the join — fuzzy keys, duplicates, and type mismatches (reel 15 coercion traps) cause more bugs than any model error; align before any rule fires. Coverage report: state what was scanned and what fired — silence is indistinguishable from a skipped section. Full audit story: the log now spans reads, plans, rejections, approvals, and applies — a complete narrative of the run. And lessons to memory: recurring conflicts become SOP amendments, so next month\'s run starts smarter. The loop closes — run, distill, improve.'
    },
    {
      type: 'bridge', kicker: 'CAPSTONE COMPLETE',
      title: 'Excel agent: shipped. **Final block: MCP itself.**',
      next: 'Next · Reel 68: The N×M problem',
      narration: 'The capstone is complete — a real reconciliation agent with governed hands, grounded planning, and an audit trail a regulator could love. One block remains, and it\'s the connective tissue of the entire agentic era: MCP — the protocol that makes every tool you\'ve built reusable everywhere. It starts with the problem it solves. Reel sixty-eight, swipe up.'
    }
  ],

  code: {
    title: '🐍 The reconciliation core — alignment to approval',
    body:
`def reconcile(target: str, sources: list[str], sop_query: str) -> Report:
    # Phase 1: ingest + key-align (MCP reads, paged)
    target_rows = read_all(target)                     # via MCP
    source_rows = {s: read_all(s) for s in sources}
    aligned, orphans = align_on_key(target_rows,        # invoice_id join
                                    source_rows)

    # Phase 2: detect discrepancies deterministically
    gaps = [d for d in diff_rows(aligned)]             # pure Python

    # Phase 3: classify per SOP (the reel-66 brain)
    sops = retrieve_sops(sop_query)
    plans = []
    for g in gaps:
        plan = classify_discrepancy(g, sops)           # SheetPlan | needs_human
        plans.append(validate(plan, sops, live_cells()))

    # Phase 4: stage everything; ONE human approval pass
    batch_propose(plans)
    token = wait_for_human_approval(render_report(plans))   # reel 60 gate
    applied = apply_all_approved(token)                # MCP apply_diff
    return Report(coverage=len(aligned), changes=applied,
                  escalations=[p.needs_human for p in plans],
                  audit=get_audit_log())`,
    annot: [
      '<b>diff_rows is pure Python</b> — discrepancy DETECTION is deterministic; the model only CLASSIFIES what the code found. Model-once-removed from the facts.',
      '<b>validate() before staging</b> — every plan re-checks quotes and live cells; the approval UI shows only validated diffs.',
      '<b>ONE approval pass for the batch</b> — humans review a reconciliation REPORT, not fifty individual dialogs; approve-all-with-exceptions is the workflow they already know.'
    ]
  },

  recap: [
    'Align on keys <b>before</b> any rule fires',
    'Detection is <b>code</b>; classification is <b>model</b>',
    'Ship a <b>coverage report + audit story</b>, not just diffs'
  ],

  quiz: {
    q: 'In the reconciliation output, why list rows that were VERIFIED CORRECT (no change needed) alongside the proposed edits?',
    opts: [
      'It makes the report longer and more impressive',
      'Coverage is the proof of work — without verified-correct rows, a skipped section and a clean section look identical',
      'The audit log requires every row to appear',
      'It doubles the token cost, which proves thoroughness'
    ],
    a: 1,
    why: 'A diff-only report has a silent hole: you cannot tell "scanned and correct" from "never scanned." Listing verified rows (or an explicit coverage summary: 1,240 rows scanned, 3 rules fired, 18 verified, 4 escalated) makes the agent\'s work falsifiable — the same principle as eval coverage in reel 41 and the reconciliation\'s core trust mechanism.'
  },

  notes: `
# End-to-end: multi-sheet reconciliation agent

## Architecture recap (every piece, its reel)

| Phase | Mechanism | Reels |
| --- | --- | --- |
| Tool access | Excel MCP server | 65, 72 |
| SOP grounding | retrieval + quote validation | 36–40, 66 |
| Discrepancy detection | deterministic diff (pure Python) | 15, 17 |
| Classification | LLM planner → SheetPlan | 27, 53, 55 |
| Validation | quote-check + before-check | 41, 66 |
| Approval | batched diff report + token | 60 |
| Application | MCP apply_diff | 65 |
| Audit | append-only log | 60, 65 |
| Learning | conflicts → SOP amendments | 56, 57 |

## The alignment phase — where reconciliation actually breaks
- **Key hygiene**: trim, case-fold, normalize separators BEFORE joining; log every key that failed to parse.
- **Duplicates**: same invoice ID twice in a source → surface, don\'t guess; agent picks neither.
- **Type traps**: "1,250.00" strings vs floats vs ints (reel 3/15) — canonicalize to cents-as-int (reel 53) before comparing amounts.
- **Fuzzy keys**: when keys disagree slightly (INV-2214 vs 2214), propose a mapping plan for human approval rather than silently joining.

## Scaling the pattern
- **Monthly runs become scheduled jobs**: the same code, wrapped in an automation (cron/container) with the approval step routed to the responsible human\'s inbox.
- **More workbooks**: the Report format absorbs any source count; alignment keys become a config file.
- **Continuous reconciliation**: smaller batches, streaming diffs, exception-only reports — the audit trail carries over unchanged.

## Failure post-mortems you should pre-write
- **Missed discrepancy**: was detection wrong (code bug) or classification wrong (model)? The code/model split makes this answerable — that separation is the design\'s deepest payoff.
- **Wrong edit applied**: audit log shows which approval token authorized it — human error or UI ambiguity? Feed back into the approval design.
- **Agent escalated everything**: SOP ambiguity — the SOPs need amendments, not the agent more courage.

## The graduation exam, honestly
If you can explain every layer of this system — why detection is code, why citations are substring-checked, why approval is batched, why coverage is reported — you understand applied agentic AI better than most teams shipping it. Reels 68–74 add the protocol that makes all of it composable.

Next: reel 68 — the N×M problem, and how MCP ends it.
`
});
