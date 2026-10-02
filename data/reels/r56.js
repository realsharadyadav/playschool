/* Reel 56 — Reflection & self-correction (Agentic · Agent Fundamentals) */
SS.registerReel({
  id: 'r56', num: 56, section: 'agentic', block: 'Agent Fundamentals',
  title: 'Reflection & self-correction',
  hook: 'Agents fail. **The good ones notice, diagnose, and retry smarter.**',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE MECHANISM',
      title: 'Failure is data. **Reflect on it before you retry it.**',
      sub: 'Reflexion: grade your own work, then act on the grade.',
      narration: 'Here’s the asymmetry that makes agents powerful: humans learn because failure FEELS bad; models retry the same mistake identically, forever, unless you build in the feeling. Reflection is that mechanism — a pause where the agent grades its own attempt, names what went wrong, and produces a better next try. Not blind retries: DIAGNOSED retries. The pattern that turns brittle loops into learning ones.'
    },
    {
      type: 'loop',
      chips: ['Attempt', 'Grade the attempt', 'Reflect: what failed?', 'Retry differently', 'or: succeed'],
      narration: 'The reflection cycle. Attempt: run the tool, draft the answer. Grade: score the attempt — did the SQL execute? Does the draft answer the question? Is the diff correct? Reflect: in words, name the failure mode — wrong table, missing filter, misread the requirement. Retry differently: the reflection text feeds the next attempt, so retry two is NOT retry one. Loop until the grade passes, or the retry budget dies.'
    },
    {
      type: 'compare',
      cards: [
        { e: '🔁', t: 'Naive retry', s: 'same prompt, same error, ×5 — pure token burn' },
        { e: '🩺', t: 'Reflect → retry', s: 'error diagnosed, next attempt corrected', win: true }
      ],
      narration: 'The economics of the two retries. Naive: the loop calls the tool again with the same arguments, gets the same error, five times, then gives up — or worse, succeeds randomly and you learn nothing. Reflect-then-retry: the error message enters the reasoning, the next attempt changes — new arguments, different tool, revised approach. Same retry budget, completely different outcomes. Reflection is how a fixed step-cap buys resilience instead of waste.'
    },
    {
      type: 'list',
      items: [
        { e: '🧪', t: 'Self-grading', s: 'LLM checks its own output' },
        { e: '🗣️', t: 'Verbal reflection', s: '"failed because…" in the trace' },
        { e: '📉', t: 'Retry budgets', s: '3 tries, then escalate (reel 60)' },
        { e: '📚', t: 'Learning across runs', s: 'failures → tips store (reel 57)' }
      ],
      narration: 'The four practices. Self-grading: an LLM call grades the attempt against objective criteria — executable checks where possible (did the query run?), model judgment otherwise. Verbal reflection: the diagnosis is WRITTEN into the trace — words force specificity; "wrong" teaches nothing, "filtered on status instead of status_code" teaches everything. Retry budgets: reflection gets three shots, then a human hears about it. And the advanced move: persist reflections to a store, so the NEXT RUN doesn’t repeat today’s lesson.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'Recovery: engineered. **Now give the agent a past — memory.**',
      next: 'Next · Reel 57: Agent memory',
      narration: 'Reflection closes the loop on failure — the agent now improves within a run. Next: memory across runs — how agents accumulate knowledge, user preferences, and hard-won lessons instead of starting every session as a stranger. Reel fifty-seven, swipe up.'
    }
  ],

  code: {
    title: '🐍 Reflect-then-retry, with a real grader',
    body:
`REFLECT = """The last attempt FAILED.
Attempt: {attempt}
Error/Grade: {verdict}

Diagnose in 1-2 sentences: what specifically went wrong, and what
should change in the NEXT attempt (different args? different tool?
missing prerequisite?). Then produce the corrected attempt as JSON."""

def run_with_reflection(task: str, tools: dict,
                        max_attempts: int = 3) -> str:
    attempt = plan_first_attempt(task)          # initial try
    for n in range(max_attempts):
        verdict = execute_and_grade(attempt, tools)   # objective grade
        if verdict["ok"]:
            return verdict["result"]
        if n == max_attempts - 1:
            break
        # the diagnosis enters the context; next attempt CHANGES
        correction = llm(REFLECT.format(attempt=attempt,
                                        verdict=verdict["error"]),
                         temp=0.0)
        attempt = extract_json(correction)
    escalate_to_human(task, attempt, verdict)   # reel 60
    return "escalated"`,
    annot: [
      '<b>execute_and_grade is objective where possible</b> — SQL runs or it doesn\'t, diffs match or they don\'t; reserve LLM-judging for prose tasks (reel 47).',
      '<b>Reflection happens BEFORE the retry budget decrements</b> — diagnosed retries are the product; blind ones are waste.',
      '<b>The verdict + diagnosis stay in the trace</b> — your post-mortem data for recurring failure clusters (reel 57\'s long-term memory feeds on this).'
    ]
  },

  recap: [
    'Grade attempts <b>objectively</b>; reflect in words',
    'Retry <b>differently</b> — diagnosis drives the change',
    'Budget it: <b>3 tries, then escalate</b>'
  ],

  quiz: {
    q: 'Why write the reflection as natural language ("filtered on the wrong column") instead of just passing the raw error to the next attempt?',
    opts: [
      'Natural language is cheaper than tokens as JSON',
      'The verbal diagnosis forces the model to identify the CAUSE, making the retry targeted instead of another random sample',
      'Error messages are too long for the context window',
      'It improves the readability of logs for compliance only'
    ],
    a: 1,
    why: 'A raw error is data; a diagnosis is a DECISION about the data. Compressing "column status_code does not exist" into "I used status instead of status_code, retry with status_code" forces the model to locate the fault and select the fix — the next attempt is then a correction, not a re-roll. Reflection converts errors into search direction; without it, retries are just expensive coin flips.'
  },

  notes: `
# Reflection & self-correction

## The pattern family (same idea, different names)
- **Reflexion**: verbal self-critique in a scratchpad, fed back into the next attempt — the canonical form (the panel).
- **Self-Refine**: generate → critique → improve, for single-shot OUTPUTS (drafts, code, plans) without tool calls.
- **ReAct + grading**: implicit reflection — observations force re-thinking each cycle (reel 54); explicit grading adds rigor.
- **Constitutional/hierarchical critics**: a second model (or persona) does the grading — cheaper, less self-serving.

## Grading hierarchy (cheap → expensive)
1. **Deterministic checks**: return codes, row counts, schema validation (reel 15), unit tests, diff matches. ALWAYS prefer these.
2. **Tool feedback**: the error strings your tools already return (designed well in reel 53).
3. **LLM-as-judge**: for prose, plans, and anything without an oracle — with rubrics (reel 47).

## Where reflection earns its keep
| Scenario | Without reflection | With |
| --- | --- | --- |
| SQL generation (reel 19) | syntax errors dead-end | error → fix → succeeds |
| Code-writing agents | compiles-or-gives-up | test failures → patch loop |
| Planning (reel 55) | BLOCKED aborts run | re-plan informed by blocker |
| Data reconciliation (reel 67) | mismatches stall | diagnose rule, re-apply |

## Limits — honesty section
- Reflection multiplies LLM calls; budget it per task and in aggregate (reel 13 cost posture).
- Some failures are NOT recoverable by the agent (missing permissions, bad premise); retries become loops. Hard caps + escalation (reel 60) are non-negotiable.
- Self-grading can be confidently wrong — pair LLM grades with at least one deterministic check wherever possible.
- Verbal diagnoses can rationalize: "the tool is broken" when the args were wrong. Include the attempt's actual arguments in the reflection prompt so blame lands accurately.

## Persist the lessons (bridge to 57)
The store of reflections — failure → diagnosis → fix — is your agent's operational experience. Feed distilled entries into long-term memory, and tomorrow's agent starts where today's ended.

Next: reel 57 — agent memory: working, episodic, and long-term.
`
});
