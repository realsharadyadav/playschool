/* Reel 54 — ReAct — reasoning + acting (Agentic · Agent Fundamentals) */
SS.registerReel({
  id: 'r54', num: 54, section: 'agentic', block: 'Agent Fundamentals',
  title: 'ReAct — reasoning + acting',
  hook: 'Reason a little. Act. Observe. Repeat. **The pattern that made agents work.**',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE PATTERN',
      title: 'Don’t think forever. **Think one step, then act.**',
      sub: 'Thought → Action → Observation — interleaved, not batched.',
      narration: 'Early agents failed in two directions: pure reasoning — the model plans ten steps in its head, and reality ruins step three — and pure acting — call after call with no plan, thrashing. ReAct, reasoning-plus-action, is the middle path: interleave small reasoning steps with actions and observations. Think a little, act, see what happened, think again. Reality corrects the plan every cycle.'
    },
    {
      type: 'loop',
      chips: ['Thought: need live data', 'Action: search_orders', 'Observation: 3 orders', 'Thought: refund = #2', 'Action: create_refund', 'Answer: done'],
      narration: 'A ReAct trace, one cycle per chip. Thought: I need live order data — short, focused reasoning. Action: call search-orders. Observation: three orders returned. Thought: the refund candidate is number two. Action: create the refund. Each thought is JUST enough to pick the next action; each observation grounds the next thought. The trace itself is the audit log — every decision is inspectable.'
    },
    {
      type: 'compare',
      cards: [
        { e: '🧘', t: 'Plan-then-execute', s: '10-step plan, reality ruins step 3, no recovery' },
        { e: '🏃', t: 'ReAct', s: 'plans one step ahead, reality-corrected every cycle', win: true }
      ],
      narration: 'Why interleaving beats planning. Plan-then-execute writes a beautiful ten-step plan, then the world contradicts step three — an order missing, an API error — and the agent has no protocol for recovery; it’s committed. ReAct never commits beyond one step. Each observation is a reality check that reshapes the next thought. Less elegant on paper, vastly more robust in production — which is why every serious framework builds on it.'
    },
    {
      type: 'list',
      items: [
        { e: '💭', t: 'Thought: brief', s: 'one decision, not an essay' },
        { e: '🎯', t: 'Action: one tool call', s: 'atomic, observable' },
        { e: '👁️', t: 'Observation: result', s: 'feeds the next thought' },
        { e: '📏', t: 'Structured traces', s: 'auditable, evaluable, debuggable' }
      ],
      narration: 'The four disciplines. Thoughts are one or two sentences — enough to choose the next action, never a manifesto. Actions are single, atomic tool calls — one observable thing at a time. Observations are the raw tool results, unedited. And the whole trace — every thought, action, observation — is structured data: your audit log for compliance, your eval corpus for testing, your debugger for the 2 a.m. incident.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'ReAct: the reflex. **Now the foresight: planning.**',
      next: 'Next · Reel 55: Planning & task decomposition',
      narration: 'ReAct gives the agent a reflex — reason, act, observe, repeat. But some tasks are too big for one-step-lookahead: “migrate this database” needs a plan BEFORE the first action. Planning and decomposition — the when and how — next reel. Swipe up.'
    }
  ],

  code: {
    title: '🐍 A ReAct loop you can read like a log',
    body:
`import json

SYSTEM = """You are a ReAct agent. Each turn, output ONE of:
THOUGHT: <one or two sentences reasoning about the next step>
ACTION: <tool name> | <json args>
OBSERVATION: <tool result>   (provided by the system)
FINAL: <the answer to the user>"""

def react_agent(goal: str, tools: dict, max_steps: int = 10) -> str:
    log = [f"GOAL: {goal}"]
    for step in range(max_steps):
        reply = llm([{"role": "system", "content": SYSTEM},
                     {"role": "user", "content": "\\n".join(log)}],
                    temp=0.0)
        line = reply.strip()
        log.append(line)                       # the trace grows

        if line.startswith("THOUGHT"):
            continue                           # reasoning, no action
        if line.startswith("FINAL"):
            return line[6:].strip()
        if line.startswith("ACTION"):
            _, rest = line.split("|", 1)
            name, args = rest.split("|", 1) if "|" in rest else (rest, "{}")
            result = tools[name.strip()](**json.loads(args))
            log.append(f"OBSERVATION: {result}")   # reality checks in
    return "MAX STEPS — escalate to human."

# The log afterward: GOAL -> THOUGHT -> ACTION -> OBSERVATION -> ... -> FINAL
# is your audit trail AND your eval data (reels 47, 66).`,
    annot: [
      '<b>log.append(line)</b> — the trace IS the context; every cycle the brain re-reads its own reasoning, correcting drift.',
      '<b>OBSERVATION injected by the SYSTEM</b> — tool results are facts, never model-invented; keeping them system-authored prevents the brain from hallucinating results.',
      '<b>The returned log is triple-duty</b> — audit trail for compliance, eval corpus for testing (47), incident debugger — free artifacts of the pattern.'
    ]
  },

  recap: [
    'ReAct = <b>interleaved</b> thought / action / observation',
    'Thoughts: <b>one step ahead</b>, never full plans',
    'Traces are <b>structured, inspectable</b> byproducts — keep them'
  ],

  quiz: {
    q: 'A ReAct agent on a multi-step task keeps failing at step 5 because step 2’s action returned unexpected data. Why does ReAct handle this better than plan-then-execute?',
    opts: [
      'It re-plans the entire task from scratch after every step',
      'Each observation enters the trace before the next thought, so the plan adapts one step at a time instead of following a stale commitment',
      'It skips failed steps automatically',
      'It uses a different model for planning vs acting'
    ],
    a: 1,
    why: 'Plan-then-execute commits to a multi-step sequence that unexpected data invalidates with no recovery protocol. ReAct never commits beyond the next action: the surprising observation is written into the log, the next thought reasons from THAT reality, and the trajectory bends. Adaptation is structural, not a special error-handling mode.'
  },

  notes: `
# ReAct — reasoning + acting

## The pattern, formalized
\`\`\`
loop until done or cap:
    thought     = model(reason over goal + trace)         # cognition
    action      = one tool call chosen by the thought     # hands
    observation = execute(action) — SYSTEM-provided       # eyes
    trace      += [thought, action, observation]          # memory
\`\`\`
The trace replaces both the master plan and the working memory.

## Why it works (the three mechanisms)
1. **Grounding**: observations are real data, injected by the runtime — the brain can't confabulate tool results it never saw (contrast: asking the model to "imagine" what a tool would return).
2. **Incremental commitment**: one-step lookahead means maximum flexibility; cost is more model calls than a plan-then-execute success case — a trade you happily make.
3. **Legibility**: the trace is human-readable reasoning + verifiable actions — the only agent pattern your compliance team will love.

## Native vs DIY ReAct
- **DIY** (the panel): prompt the THOUGHT/ACTION/FINAL protocol — works on any model, perfect for learning, easy to instrument.
- **Native tool calling** (reel 52) + explicit "think step by step before acting" instructions gives ReAct with structured actions — what most frameworks do internally.
- **Structured reasoning**: some stacks add a \`reasoning\` field to tool-call schemas, keeping thoughts machine-readable. Do this in production — regex-parsing "THOUGHT:" lines is a demo habit.

## Failure modes

| Symptom | Cause | Fix |
| --- | --- | --- |
| Thought essays | no brevity instruction | "one or two sentences" + model the length |
| Action thrashing | same action repeating | track attempts in trace; force a different-action rule |
| Silent loops | no step cap | hard max_steps + escalate (reel 60) |
| Hallucinated observations | model writes its own OBS lines | system-role injection only; strip model "OBSERVATION:" lines |
| Premature FINAL | answer before enough evidence | require N observations before FINAL for research tasks |

## Evals for ReAct (preview of reel 56)
Replay traces against golden tasks: did the agent reach the goal? How many steps? Any unnecessary actions? Trace-level evals catch behavior regressions that output-only tests miss.

Next: reel 55 — planning & decomposition: when one-step lookahead isn’t enough.
`
});
