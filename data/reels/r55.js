/* Reel 55 — Planning & task decomposition (Agentic · Agent Fundamentals) */
SS.registerReel({
  id: 'r55', num: 55, section: 'agentic', block: 'Agent Fundamentals',
  title: 'Planning & task decomposition',
  hook: '“Migrate the database” is not one task. **It’s twelve wearing a trench coat.**',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE SKILL',
      title: 'Big tasks fail whole. **Decomposed tasks fail small — and recover.**',
      sub: 'Planning: turn a goal into an ordered checklist the loop can execute.',
      narration: 'ReAct’s one-step lookahead excels at reactive tasks. But some goals are inherently multi-phase: migrate this database, produce this quarter’s report, reconcile these forty spreadsheets. Handled as one blob, they fail opaquely halfway through. The planning skill: decompose the goal into an ordered, checkable task list BEFORE acting — then let the ReAct loop execute one task at a time, re-planning when reality objects.'
    },
    {
      type: 'diagram',
      nodes: [
        { e: '🎯', t: 'goal', s: '"quarterly sales report"' },
        { e: '✂️', t: 'decompose', s: 'LLM writes the task list' },
        { e: '📋', t: '1. pull data 2. validate…', s: 'ordered, atomic, checkable' },
        { e: '🔁', t: 'execute + re-plan', s: 'one task per loop' }
      ],
      narration: 'The planning pipeline. The goal goes in: quarterly sales report. The LLM decomposes — this is one more generation call, asking the model to break the goal into atomic tasks: pull the data, validate it, compute the aggregates, draft the narrative, format the PDF. The plan is an ORDERED LIST, each item small enough to verify. Then the execution loop works the list top to bottom — and when a task fails or reveals new work, the plan is revised, not abandoned.'
    },
    {
      type: 'list',
      items: [
        { e: '⚛️', t: 'Atomic tasks', s: 'one tool-call-ish each' },
        { e: '🔢', t: 'Ordered, but…', s: 'sequence matters, allow reorder' },
        { e: '✔️', t: 'Checkable done', s: 'objective completion criteria' },
        { e: '🧊', t: 'Frozen mid-execution', s: 'plan edits need a reason' }
      ],
      narration: 'The four plan disciplines. Atomic: each task is roughly one action — if it needs an “and”, split it. Ordered: sequence usually matters, but let execution re-sequence adjacent independent tasks. Checkable: every task has objective done-criteria — “data pulled” means the row count matches, not a vibe. And frozen-ish: mid-run plan edits are allowed but must be JUSTIFIED in the trace — otherwise the plan mutates into whatever’s convenient and you’ve lost the plot.'
    },
    {
      type: 'compare',
      cards: [
        { e: '📉', t: 'No plan — pure ReAct', s: 'thrashing on 12-step tasks, forgotten sub-goals' },
        { e: '📈', t: 'Plan + ReAct execution', s: 'structured progress, re-plan on surprises', win: true }
      ],
      narration: 'When to add the planner. Pure ReAct on a long task forgets sub-goals — the context fills with observations and the original goal drifts. The planner writes the goal DOWN as a list, so nothing is remembered only implicitly. Execution stays ReAct — one task, one thought, one action. The plan supplies the what-and-when; the loop supplies the how-and-now. Together: the standard architecture of serious agents, from research assistants to the Excel reconciliation agent you’ll build in reel sixty-seven.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'Plan made. **What happens when steps FAIL? Reflection.**',
      next: 'Next · Reel 56: Reflection & self-correction',
      narration: 'Decomposition turns monsters into checklists. But checklists meet reality — failed steps, bad data, wrong assumptions. The next mechanism is how agents recover instead of collapsing: reflection and self-correction. Reel fifty-six, swipe up.'
    }
  ],

  code: {
    title: '🐍 Plan-then-execute, with honest re-planning',
    body:
`PLANNER = """Decompose this goal into an ordered task list.
Rules: atomic tasks (one action each), objective done-criteria,
max 8 tasks. Reply as a JSON array of {"task": ..., "done_when": ...}.

GOAL: {goal}"""

EXECUTOR = """You are executing a plan. Completed tasks and results:
{progress}
Current task: {task}
Do it. If impossible, say BLOCKED: <reason>. When done, say DONE: <result>.
Otherwise call the appropriate tool."""

def plan_and_run(goal: str, tools: dict, max_steps: int = 30) -> str:
    plan = json.loads(llm(PLANNER.format(goal=goal), temp=0.0))
    progress, step = [], 0

    for i, item in enumerate(plan):
        while step < max_steps:
            step += 1
            reply = llm(EXECUTOR.format(
                progress=json.dumps(progress[-3:]),   # rolling window (44)
                task=item["task"]))
            if reply.startswith("BLOCKED"):
                # RE-PLAN: fold the blocker back into a fresh plan
                plan = replan(goal, progress, reply, plan[i:])
                break                                # work the new plan
            if reply.startswith("DONE"):
                progress.append({"task": item["task"],
                                 "result": reply[5:].strip()})
                break
            # otherwise: a tool call happens (omitted for brevity — reel 54)
        else:
            return "step budget exhausted — escalate (reel 60)"
    return summarize(goal, progress)`,
    annot: [
      '<b>PLANNER prompt returns JSON</b> — a plan is DATA (list of {task, done_when}), not prose; data can be inspected, reordered, persisted.',
      '<b>progress[-3:]</b> — rolling window on plan history, not the whole trace; agents drown in their own observations (reel 44).',
      '<b>BLOCKED → replan()</b> — the load-bearing move: failure re-enters the planner with the reason attached, producing a revised plan instead of a dead agent.'
    ]
  },

  recap: [
    'Decompose goals into <b>atomic, ordered, checkable</b> tasks',
    'Plan is <b>data</b> — JSON, inspectable, re-plannable',
    '<b>Blocked ≠ dead</b>: re-plan with the reason, keep going'
  ],

  quiz: {
    q: 'An agent executing a 7-task plan hits BLOCKED at task 4: "the reporting table doesn’t exist." What’s the correct architectural response?',
    opts: [
      'Skip task 4 and continue with task 5',
      'Retry task 4 up to 10 times — it may transiently succeed',
      'Invoke the planner again with goal + progress + blocker to produce a revised plan, then continue',
      'Abort the whole run and alert a human'
    ],
    a: 2,
    why: 'The blocker is INFORMATION, not just failure: "table missing" suggests new sub-tasks (find the data source, create/migrate the table). Re-planning folds that reality into a revised task list and continues — the plan-and-replan loop. Skipping loses the goal; blind retries burn budget; aborting wastes a recoverable situation. (True dead-ends after re-planning DO escalate — reel 60.)'
  },

  notes: `
# Planning & task decomposition

## When to plan vs pure ReAct

| Task shape | Strategy |
| --- | --- |
| 1–4 steps, reactive (lookup, answer) | pure ReAct — planning overhead buys nothing |
| 5–15 steps, sequential dependencies | plan first, execute per-task |
| parallelizable sub-tasks | plan + spawn sub-agents (reel 58) |
| unknown structure (research) | plan with broad strokes, re-plan aggressively |

A good heuristic: if YOU would write a checklist before starting, the agent should too.

## The plan as an artifact
- **Persist it**: plans are resumable state — a crashed run re-reads the plan and completed-task log instead of starting over.
- **Show it**: UIs that display the live plan ("step 3 of 7: validating data…") get trust that final answers alone never earn (reel 46’s streaming, applied to agency).
- **Eval it**: trace-level evals check plan quality — were tasks atomic? Did re-plans shrink or grow task counts? (reel 47’s rubric thinking, applied to behavior.)

## Common planner failure modes

| Failure | Fix |
| --- | --- |
| Mega-tasks ("analyze the data") | prompt constraint + example decomposition in the planner prompt (few-shot, reel 26) |
| Over-planning 40 steps for a 5-step job | cap tasks; tell the planner the tool inventory so it plans realistically |
| Plan ignored during execution | inject current-task + plan into EVERY executor call; progress is context, not memory |
| Re-plan thrash | limit re-plans (e.g. 3); escalate after (reel 60) |

## Hierarchical planning (the 30-second version)
Big goals get a two-level plan: coarse phases (gather → analyze → deliver), each decomposed lazily when reached. LangGraph (reel 59) implements this as graph hierarchies; DIY: call the PLANNER again per phase. Lazy decomposition keeps early context small.

> **.NET ↔ Python:** the planner/executor split is pure orchestration — a for-loop over a JSON list. Everything ports. Python’s advantage remains the model-side plumbing; the architecture is yours in any stack.

Next: reel 56 — reflection & self-correction: how agents turn failures into progress.
`
});
