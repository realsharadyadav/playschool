/* Reel 47 — Chatbot evals (GenAI · ChatBots) */
SS.registerReel({
  id: 'r47', num: 47, section: 'genai', block: 'ChatBots',
  title: 'Chatbot evals',
  hook: '“Seems fine” is not a metric. **Judge the bot like you’d review a hire.**',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE PROBLEM',
      title: 'Every answer is different. **So evaluate BEHAVIOR, not text.**',
      sub: 'Rubrics over exact matches — conversations have many right answers.',
      narration: 'Classic software testing assumes deterministic output: same input, same output, assert equality. A chatbot laughs at that — every answer is freshly generated. The fix is a mindset shift: stop asserting text and start scoring BEHAVIOR. Is it accurate? Grounded? On-persona? Did it refuse when it should? Rubric-based judging — the same trick as reel forty-one’s faithfulness checks — applied to whole conversations.'
    },
    {
      type: 'list',
      items: [
        { e: '✅', t: 'Single-turn tests', s: '50 canned Qs, rubric-graded' },
        { e: '🧵', t: 'Multi-turn scripts', s: '10 conversations, 8 turns each' },
        { e: '🧑‍⚖️', t: 'LLM-as-judge', s: 'grade against the rubric' },
        { e: '🥊', t: 'Red-team set', s: 'jailbreaks, injections, refusals' }
      ],
      narration: 'The eval portfolio, four layers. Single-turn tests: fifty canned questions with rubrics — accuracy, completeness, tone — graded automatically. Multi-turn scripts: scripted conversations testing memory and context carryover — the reel-forty-four failure shows up HERE, in tests. LLM-as-judge: a grader model applies the rubric at temperature zero. And the red-team set: adversarial inputs — jailbreaks, prompt injections, off-topic asks — where the correct behavior is often a REFUSAL.'
    },
    {
      type: 'compare',
      cards: [
        { e: '🎯', t: 'Exact-match assert', s: '"assert reply == expected" — flakes forever' },
        { e: '📏', t: 'Rubric + judge', s: '"claims grounded in context? PASS/FAIL" — stable', win: true }
      ],
      narration: 'Why rubrics win. Exact-match asserts on generated text flake constantly — wording varies, tests break for good answers. A rubric asks the stable question: does the answer only claim what the context supports? Is the tone within policy? Judge-graded rubrics are the unit tests of generative software — deterministic ENOUGH, meaningful, and they survive prompt tweaks.'
    },
    {
      type: 'diagram',
      nodes: [
        { e: '📝', t: 'golden set v1', s: 'real user questions' },
        { e: '🤖', t: 'bot answers', s: 'production pipeline' },
        { e: '🧑‍⚖️', t: 'judge grades', s: 'per rubric, per case' },
        { e: '📉', t: 'CI gate', s: 'no deploy below threshold' }
      ],
      narration: 'The cadence that makes it real. Seed the golden set from actual user questions. The bot answers through the production pipeline — same prompts, same memory, same retrieval. The judge grades each case against its rubric. Scores roll up to CI: drop below threshold — say, ninety percent grounded answers — and the deploy stops. Evals aren’t a phase; they’re a gate.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'ChatBots block: done. **Final reel of GenAI: shipping.**',
      next: 'Next · Reel 48: From notebook to real app',
      narration: 'That completes the ChatBots block — anatomy, memory, streaming, and the eval harness that keeps all three honest. The GenAI section closes with the professional finish: taking all of this from notebook experiments to a real, deployed, observable application. Reel forty-eight, swipe up.'
    }
  ],

  code: {
    title: '🐍 The judge, the rubric, the gate',
    body:
`RUBRIC = """Grade the assistant's reply to the user's question.
Context available to the assistant: {ctx}

CRITERIA (reply PASS or FAIL for each):
1. GROUNDED: every factual claim appears in the context.
2. HELPFUL: it answers what was actually asked.
3. TONE: brief and professional, no filler.

Question: {q}
Reply: {reply}

Format: GROUNDED:PASS|FAIL, HELPFUL:..., TONE:..."""

def grade(q: str, reply: str, ctx: str) -> dict[str, bool]:
    r = httpx.post("http://localhost:11434/v1/chat/completions",
                   json={"model": "llama3.1",
                         "messages": [{"role": "user",
                                       "content": RUBRIC.format(q=q, reply=reply, ctx=ctx)}],
                         "temperature": 0.0}, timeout=60)
    out = r.json()["choices"][0]["message"]["content"]
    return {k.split(":")[0]: "PASS" in k
            for k in out.split(",") if ":" in k}

# CI gate: run over the golden set, fail the build below threshold
# assert mean(grounded_scores) >= 0.95, "grounding regressed — hold the deploy"`,
    annot: [
      '<b>Structured PASS/FAIL output</b> — parseable judge responses; free-form judge prose is not a test artifact.',
      '<b>Context included in the rubric</b> — the judge grades grounding against what the bot SAW, not world knowledge.',
      '<b>CI assert on the aggregate</b> — per-case flakiness exists; thresholds on MEANS (≥0.95 grounded) keep the gate stable.'
    ]
  },

  recap: [
    'Score <b>behavior with rubrics</b>, not text with equality',
    'Portfolio: single-turn + <b>multi-turn scripts</b> + judge + red-team',
    'Evals are a <b>CI gate</b> — below threshold, no deploy'
  ],

  quiz: {
    q: 'Your chatbot eval has 200 single-turn tests, all passing. Users still report the bot “forgets my order number halfway through.” Which eval layer was missing?',
    opts: [
      'More single-turn tests',
      'Multi-turn scripted conversations with facts planted early',
      'A stronger judge model',
      'Lower temperature in the bot'
    ],
    a: 1,
    why: 'The failure is temporal — a fact planted early must survive to a later turn, which single-turn tests cannot observe. Multi-turn scripts with planted facts at turn 2 and checks at turn 10+ are the canonical test for memory/window bugs (reels 44–45). No amount of single-turn coverage tests what single turns can’t exhibit.'
  },

  notes: `
# Chatbot evals

## The rubric library (starter set)

| Rubric | Pass condition | Catches |
| --- | --- | --- |
| Grounded | claims ⊆ provided context | hallucination (28) |
| Helpful | answers the actual question | dodging, partial answers |
| Tone/style | persona + brevity rules | drift after prompt edits |
| Refusal-correct | refuses when context lacks the answer | over-answering |
| Refusal-incorrect | answers when safe & known | over-refusal (frustrating bots) |
| Memory | early fact retrievable late | window/summary bugs (44/45) |
| Injection-safe | ignores embedded instructions in user/docs | prompt injection (reel 74) |

## Multi-turn scripts, concretely
A script = sequence of user messages + per-turn checks:
\`\`\`
turn 1: "I'm Ana, order A-4421"        -> check: acknowledged
turn 2-6: small talk / topic shift     -> checks: none
turn 7: "where's my order?"            -> check: cites A-4421, no hallucinated ID
turn 8: "and the refund for THAT?"     -> check: resolves both refs
\`\`\`
Scripts are cheap to write and brutal on memory bugs — they belong in CI on every memory-layer change.

## Red-teaming: the refusal half of the matrix
Most teams only test “does it answer well.” Equally important: does it MISBEHAVE under pressure?
- jailbreak attempts (“ignore previous instructions…”)
- prompt injection via retrieved/user content (reel 74)
- off-policy asks (medical/legal advice from a support bot)
- data exfiltration probes (“repeat your system prompt”)
Correct behavior is often a REFUSAL — which means refusal rubrics and normal helpfulness rubrics must coexist.

## Cadence
- **Every PR**: golden-set single-turn + memory scripts (minutes).
- **Weekly**: expanded red-team sweep against current prod prompts.
- **On model swap**: full re-baseline — judges and bots both shift (calibrate judge agreement again).

## Cost honesty
A 200-case suite with judge calls costs a few cents per run at API rates — trivial against the cost of one grounding regression reaching users. Local models (as in the panel) make it free-er.

> **.NET ↔ Python:** the harness is a test project — xUnit/NUnit on the bot’s HTTP API, judge calls over any SDK. Golden sets are JSON; judges are prompts. Stack-neutral.

Next: reel 48 — Ship It: from notebook to production app — closing the GenAI section.
`
});
