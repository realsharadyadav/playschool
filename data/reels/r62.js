/* Reel 62 — Use case: coding agent (Agentic · Agentic Use Cases) */
SS.registerReel({
  id: 'r62', num: 62, section: 'agentic', block: 'Agentic Use Cases',
  title: 'Use case: coding agent',
  hook: 'The highest-stakes agent loop: **it edits the code you ship.**',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE USE CASE',
      title: 'Coding agents: ReAct **with a compiler for a conscience.**',
      sub: 'Write → run tests → read failures → fix. The loop that writes software.',
      narration: 'Every pattern you\'ve learned converges here. A coding agent is a ReAct loop (54) whose observations come from the most honest oracle in engineering: the compiler and the test suite. It writes code, runs it, reads the failures, fixes, repeats. No hallucination survives a failing test — which makes this the agent use case with the tightest feedback loop and the highest stakes, because its output IS your product.'
    },
    {
      type: 'loop',
      chips: ['Read spec + codebase', 'Plan (reel 55)', 'Edit files', 'Run tests', 'Reflect on failures (56)', 'Green → PR'],
      narration: 'The coding loop, one honest cycle. Read the spec and the relevant code. Plan: decompose into atomic edits — this is where reel fifty-five\'s planner earns its keep. Edit files through tools. Run the tests — the reality check no other agent gets so cheaply. Failures feed reflection: the traceback IS the diagnosis material. Green tests: stop, open a pull request with the trace as its description. Plan, edit, verify, reflect — with the compiler as referee.'
    },
    {
      type: 'list',
      items: [
        { e: '📂', t: 'Scoped context', s: 'relevant files only, not the repo' },
        { e: '🧪', t: 'Test-driven oracle', s: 'failures = free diagnoses' },
        { e: '🌿', t: 'Branch isolation', s: 'agent works on a throwaway branch' },
        { e: '👀', t: 'Human review', s: 'PR reviewed like any junior dev\'s' }
      ],
      narration: 'The four disciplines. Scoped context: the agent reads the files the task touches — a repo-wide dump blows the desk (23); retrieval over symbols, like reel forty-two\'s agentic search, finds the relevant code. Test oracle: failures are free diagnoses — reflection (56) with perfect evidence. Branch isolation: every run works on its own branch — a confused agent can\'t touch main. And human review: the agent opens a PR like a junior developer — reviewed,CI-gated, never auto-merged. Governance from reel sixty, applied to code.'
    },
    {
      type: 'compare',
      cards: [
        { e: '🎰', t: 'Autonomous "fix the bug"', s: 'unscoped, unverifiable, unshippable' },
        { e: '🎯', t: 'Spec → plan → edit → test → PR', s: 'scoped, verified, reviewable', win: true }
      ],
      narration: 'Why framing beats freedom. "Fix the bug" unscoped produces confident diffs across forty files, half of them wrong. The professional framing: a SPEC — the failing test or the issue text — decomposed into an edit plan, executed against scoped files, verified by the test suite, delivered as a reviewable PR. The autonomy paradox resolves again: tighter framing produces MORE useful agency, not less.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'Code: conquered. **Now agents that face customers.**',
      next: 'Next · Reel 63: Use case: support agent',
      narration: 'The coding agent closes the builder-use-cases: the tightest feedback loop in the course. Next, the opposite environment — no compiler oracle, human customers, emotional stakes. The support agent. Reel sixty-three, swipe up.'
    }
  ],

  code: {
    title: '🐍 The coding loop, minimal and honest',
    body:
`import subprocess

TOOLS = {
    "read_file":  lambda path: open(path).read(),
    "write_file": lambda path, content: open(path, "w").write(content),
    "run_tests":  lambda: subprocess.run(
                      ["pytest", "-x", "-q"], capture_output=True,
                      text=True, timeout=300).stdout
                  + subprocess.run(
                      ["echo", ""], capture_output=True, text=True).stdout,
}

SYSTEM = """You are a coding agent. Loop: read relevant files,
plan minimal edits, write them, run_tests().
If tests pass, reply FINAL with a summary.
If they fail, reflect on the traceback and fix. Max 8 edit rounds."""

def coding_agent(issue: str, max_rounds: int = 8) -> str:
    log = [{"role": "user", "content": f"ISSUE:\\n{issue}"}]
    for round_ in range(max_rounds):
        reply = call_llm(SYSTEM, log)            # propose next step
        log += replay_tool_calls(reply, TOOLS)   # execute + append results
        if "FINAL" in reply:
            return reply
    return "round budget exhausted — opening draft PR for human review"`,
    annot: [
      '<b>run_tests is the oracle</b> — pytest output is observation gold: stack traces give reflection (56) perfect material, unlike prose agents\' vague "quality".',
      '<b>max_rounds caps the loop</b> — 8 edit rounds, then the partial work ships as a draft PR anyway (reel 60 escalation, coding flavor).',
      '<b>Write tools on a branch</b> — in real deployment, the whole session runs in a git worktree; nothing touches main without review.'
    ]
  },

  recap: [
    'Coding agent = <b>ReAct + compiler oracle</b>',
    'Scope context to <b>task-relevant files</b>',
    'Ship as <b>PR, human-reviewed</b> — like a junior dev'
  ],

  quiz: {
    q: 'Why do coding agents improve faster per step than research or support agents?',
    opts: [
      'Code models are inherently smarter',
      'Their observations are machine-verifiable — tests and compilers give binary, instant, evidence-rich feedback that reflection can act on',
      'They use bigger context windows',
      'Developers write better specs than users'
    ],
    a: 1,
    why: 'The feedback loop is the teacher. A test failure is unambiguous, immediate, and diagnostic (file, line, expected vs actual) — reflection converts it into a targeted fix, and the next run verifies. Research agents get ambiguous observations; support agents get emotional ambiguity. Coding agents get a compiler — the cheapest, richest oracle in the course, which is why code was the first domain where agent loops visibly worked.'
  },

  notes: `
# Use case: coding agent

## The anatomy (all previous reels, visible)
| Component | Reel | Coding flavor |
| --- | --- | --- |
| Brain + tools | 51–52 | read/write/run tools over a repo |
| ReAct loop | 54 | thought: plan the edit; observation: test output |
| Planning | 55 | issue → atomic edit checklist |
| Reflection | 56 | traceback → diagnosis → corrected edit |
| Memory | 57 | codebase conventions, past review feedback |
| Teams | 58 | writer + reviewer + tester crews (big refactors) |
| Frameworks | 59 | LangGraph/Cursor-style harnesses wrap exactly this |
| Guardrails | 60 | branch isolation, PR review, round caps |

## Context strategy — the make-or-break detail
Repos exceed any desk. The agent needs:
- **Symbol-aware retrieval** (reel 42): find definitions/usages of the symbols in the issue, not keyword matches.
- **Just-in-time reads**: fetch file contents when the plan touches them; never preload the repo.
- **Test output trimming**: full pytest logs can be thousands of tokens — extract failures, cap per-file context (the reflection prompt wants the traceback, not the whole suite).

## Workflow integration (how real teams run these)
1. Issue/ticket → agent session on a fresh branch (worktree).
2. Agent loops: plan → edit → test → reflect (capped rounds).
3. Green: open PR with trace-linked summary; red after cap: draft PR + honest failure notes.
4. CI runs (human-configured gates); human reviews like any junior\'s PR.
5. Audit: sessions logged (57) — patterns feed better specs and tooling.

## Limits — honesty section
- **Architecture-level changes** exceed current loop competence; agents excel at bounded, test-covered tasks.
- **Test coverage IS the competence ceiling**: no tests → no oracle → hallucinated "done". Invest in tests before agents.
- **Security**: an agent writing code is an injection target (malicious repo contents — reel 74). Sandboxed execution, no secrets in the environment, reviewed diffs only.

## The junior-dev framing
Treat the agent like a fast, tireless, overconfident junior: clear specs, scoped tasks, mandatory tests, mandatory review. Teams that frame it this way ship; teams that frame it as "autonomous senior" get incidents and revert wars.

Next: reel 63 — the support agent: the same anatomy, the fuzziest oracle.
`
});
