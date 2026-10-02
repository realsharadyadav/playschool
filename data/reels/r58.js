/* Reel 58 — Multi-agent teams (Agentic · Agent Fundamentals) */
SS.registerReel({
  id: 'r58', num: 58, section: 'agentic', block: 'Agent Fundamentals',
  title: 'Multi-agent teams',
  hook: 'One agent is a specialist. **A team is a company.** Hire carefully.',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE IDEA',
      title: 'Divide the labor. **Multiply the context.**',
      sub: 'Specialized agents each get a full desk for THEIR job.',
      narration: 'Why multi-agent at all? One agent juggling research, writing, and verification burns its context on role-switching and compromises on all three. A team divides labor: the researcher gets a full desk for searching, the writer a full desk for drafting, the critic a full desk for review. Each agent simpler, each context cleaner. The cost: coordination — and coordination is where multi-agent systems live or die.'
    },
    {
      type: 'diagram',
      nodes: [
        { e: '🔍', t: 'Researcher', s: 'searches, reads, takes notes' },
        { e: '✍️', t: 'Writer', s: 'drafts from the notes' },
        { e: '🧐', t: 'Critic', s: 'grades against requirements' },
        { e: '🔁', t: 'Orchestrator', s: 'routes work, ends loops' }
      ],
      narration: 'The classic crew. A researcher gathers facts with search tools. A writer receives ONLY the notes and drafts — clean context, no search-result sludge. A critic grades the draft against the requirements — fresh eyes that didn\'t write it, so it sees the gaps. And an orchestrator routes: notes to writer, draft to critic, failed grades back around, passed grades to done. Four single-purpose brains, one conveyor.'
    },
    {
      type: 'compare',
      cards: [
        { e: '🧠', t: 'Monolith agent', s: 'one context: research sludge + draft + review' },
        { e: '👥', t: 'Specialized crew', s: 'clean contexts, clear contracts, more calls', win: true }
      ],
      narration: 'The honest trade-off. The monolith burns context mixing roles — by the review phase, its desk is a landfill of search snippets, and quality suffers. The crew keeps every desk clean: the writer never sees raw search noise, the critic never bonds with the draft. You pay in orchestration calls, message-passing design, and more total tokens. For complex deliverables — reports, codebases, reconciliations — the crew wins. For three-step tasks, it\'s ceremony.'
    },
    {
      type: 'list',
      items: [
        { e: '📇', t: 'Clear contracts', s: 'typed inputs/outputs between agents' },
        { e: '🧾', t: 'Handoffs are data', s: 'notes objects, not chat logs' },
        { e: '🛑', t: 'Loop breakers', s: 'max rounds, escalation paths' },
        { e: '🧍', t: 'Roles ≠ personas', s: 'system prompts define jobs, not costumes' }
      ],
      narration: 'The four coordination disciplines. Contracts: each agent declares what it takes in and returns — Pydantic models, like tool schemas for teammates. Handoffs are DATA — a notes object, a draft document — not transcripts of chatter; every word between agents is tokens. Loop breakers: writer-critic rounds cap at three, then escalate — two agents can politely argue forever. And roles are JOBS, not theater: "you are a skeptical reviewer who checks X against Y" beats "you are a wise wizard".'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'Teams designed. **Now stop hand-rolling: the frameworks.**',
      next: 'Next · Reel 59: Agent frameworks — LangGraph to CrewAI',
      narration: 'You can now staff a team — roles, contracts, handoffs, loop breakers. Rolling that by hand gets old fast, which is why frameworks exist. Next reel: the agent framework landscape — LangGraph, CrewAI, and when to skip them all. Reel fifty-nine, swipe up.'
    }
  ],

  code: {
    title: '🐍 A crew, hand-rolled — the whole pattern',
    body:
`from pydantic import BaseModel

class Notes(BaseModel):
    facts: list[str]
    sources: list[str]

class Draft(BaseModel):
    text: str
    citations: list[str]

class Review(BaseModel):
    pass_: bool
    issues: list[str]

def run_crew(goal: str) -> Draft:
    # 1. Researcher: full desk for searching
    notes = agent(
        system="You are a researcher. Gather facts with search tools. "
               "Return structured Notes only.",
        tools=[search_web, read_page],
        output=Notes,
    ).run(goal)

    # 2. Writer: clean desk, notes only — no search sludge
    draft = agent(
        system="You are a writer. Draft from the NOTES provided. "
               "Cite sources. Return structured Draft only.",
        output=Draft,
    ).run(f"GOAL: {goal}\\nNOTES: {notes.json()}")

    # 3. Critic: fresh eyes, requirements in hand
    for round_ in range(3):                      # loop breaker
        review = agent(
            system="You are a critic. Check the draft against the GOAL. "
                   "Pass only if every claim is cited and on-topic.",
            output=Review,
        ).run(f"GOAL: {goal}\\nDRAFT: {draft.json()}")
        if review.pass_:
            return draft
        draft = agent(system="You are the writer. Revise per ISSUES.",
                      output=Draft,
                      ).run(f"DRAFT: {draft.json()}\\nISSUES: {review.json()}")

    return escalate_to_human(goal, draft)         # reel 60`,
    annot: [
      '<b>Typed handoffs (Notes/Draft/Review)</b> — Pydantic contracts between agents, exactly like tool schemas (52/53): the crew\'s wiring is the same skill.',
      '<b>Clean-desk discipline</b> — the writer never receives search results, only distilled notes; context hygiene is the crew\'s entire advantage.',
      '<b>range(3) is the load-bearing line</b> — unbounded writer-critic loops are how multi-agent demos become five-figure token bills.'
    ]
  },

  recap: [
    'Crew pattern: <b>research → write → critique</b>, orchestrated',
    'Handoffs are <b>typed data objects</b>, not transcripts',
    'Always <b>cap review rounds</b> — teams can argue forever'
  ],

  quiz: {
    q: 'In a writer-critic crew, what breaks if the writer and critic share one growing conversation log instead of clean handoff objects?',
    opts: [
      'Nothing — shared context improves collaboration',
      'The shared log fills both desks with noise, re-anchoring bias (critic saw drafts form), and hides the contracts — losing the crew\'s three advantages',
      'It only wastes tokens, quality stays the same',
      'The orchestrator cannot route messages anymore'
    ],
    a: 1,
    why: 'The crew\'s value IS context isolation: clean desks (no sludge), fresh eyes (critic unbiased by watching the draft form), and explicit contracts (typed objects). One shared log destroys all three — it\'s a monolith with extra steps AND the coordination overhead. That\'s the canonical multi-agent anti-pattern: teams in name, shared-context in practice.'
  },

  notes: `
# Multi-agent teams

## Topologies (know the menu)

| Topology | Shape | Best for |
| --- | --- | --- |
| Sequential pipeline | A → B → C | fixed workflows (research → draft → review) |
| Orchestrator-workers | boss delegates to specialists, collects results | dynamic task routing |
| Debate/consensus | N agents argue, judge decides | high-stakes analysis |
| Hierarchical teams | team leads with their own crews | large deliverables (the "company") |

The panel is a pipeline with one loop. LangGraph (next reel) implements all four as graphs.

## When multi-agent ISN'T worth it
- The task fits in one context with one role.
- Coordination contracts would be longer than the task.
- You're using agents to mask an unclear goal — split the GOAL first (reel 55).
A useful rule: **start monolith, split when a context overflows or a role needs fresh eyes.** Premature distribution is the microservices mistake, rerun with tokens.

## Coordination failure modes

| Symptom | Cause | Fix |
| --- | --- | --- |
| Endless revision loops | no round caps, no pass criteria | hard caps + structured Review.pass_ |
| Telephone game | handoffs as prose summaries | typed objects with required fields |
| Agent echo chamber | same model, same prompt style for every role | differentiate system prompts; consider different models/temps per role |
| Orchestrator bottleneck | boss does all thinking | push decisions to workers; orchestrator routes only |
| Cost explosion | N agents × M rounds × long contexts | per-agent budgets; summary handoffs (57) |

## Contracts between agents — design them like APIs
\`\`\`
class Handoff(BaseModel):
    summary: str            # what the previous stage concluded
    artifacts: list[str]    # paths/ids to full outputs
    open_issues: list[str]  # what the next stage must handle
\`\`\`
Required fields force completeness; optional fields invite omission.

> **.NET ↔ Python:** pipelines of typed transforms — your middleware instincts apply directly. Frameworks below smooth the orchestration, but the design disciplines (contracts, caps, clean desks) are yours to enforce regardless of stack.

Next: reel 59 — the frameworks: LangGraph, CrewAI, and honest adoption criteria.
`
});
