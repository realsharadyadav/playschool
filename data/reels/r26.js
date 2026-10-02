/* Reel 26 — Prompt patterns — few-shot & chain-of-thought (GenAI · Core Concepts) */
SS.registerReel({
  id: 'r26', num: 26, section: 'genai', block: 'Core Concepts',
  title: 'Prompt patterns — few-shot & chain-of-thought',
  hook: 'Show, don’t tell. **Examples beat instructions — and reasoning beats guessing.**',

  scenes: [
    {
      type: 'bigtext', kicker: 'PATTERN #2',
      title: 'Instructions describe. **Examples define.**',
      sub: 'Few-shot: teach by demonstration, not description.',
      narration: 'The second pattern is humbling: examples usually beat instructions. Telling the model “classify sentiment, be careful with negation” is weaker than showing it three classified sentences — including one tricky negation. Models are pattern machines; demonstrations are higher-bandwidth than descriptions. That’s few-shot prompting.'
    },
    {
      type: 'chat',
      bubbles: [
        { who: 'you', text: '"Loved it" -> POSITIVE' },
        { who: 'you', text: '"Not great" -> NEGATIVE' },
        { who: 'you', text: '"I can\'t complain" -> POSITIVE' },
        { who: 'bot', text: '"Wouldn\'t buy again" -> NEGATIVE', tool: 'generalizes the pattern' }
      ],
      narration: 'A few-shot exchange. You supply input-output pairs — the third one is the trap: “I can’t complain” sounds negative, means positive. With that example in context, the model generalizes the pattern and classifies “Wouldn’t buy again” correctly — a case pure instructions routinely miss.'
    },
    {
      type: 'compare',
      cards: [
        { e: '🗣️', t: 'Zero-shot: instructions only', s: 'fast, cheap — but shape is a guess' },
        { e: '📚', t: 'Few-shot: 3–5 examples', s: 'format + edge cases nailed', win: true }
      ],
      narration: 'When to use which. Zero-shot — instructions only — is fine for common tasks the model knows well. The moment your output shape is specific — your taxonomy, your CSV format, your tone — few-shot wins. Three to five examples is the sweet spot; past ten you’re mostly burning tokens.'
    },
    {
      type: 'list',
      items: [
        { e: '💭', t: '“Let’s think step by step”', s: 'unlocks multi-step reasoning' },
        { e: '🔀', t: 'CoT before the answer', s: 'reasoning, then conclusion' },
        { e: '🧮', t: 'Math & logic jump', s: 'arithmetic errors drop hard' },
        { e: '⚠️', t: 'Don’t show users CoT', s: 'summarize; hide the scratchpad' }
      ],
      narration: 'Pattern three: chain-of-thought. Add “let’s think step by step” and the model writes its reasoning before its answer — and multi-step problems that fail silently suddenly work. Math and logic see the biggest jumps. One caution: that reasoning is scratch-pad — show users a summary, not the raw stream-of-thought.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'Reliable reasoning, yes. **Reliable FORMAT, next.**',
      next: 'Next · Reel 27: Structured output & JSON mode',
      narration: 'Few-shot for shape, chain-of-thought for reasoning — the two patterns you’ll use in every prompt from here on. Next: making the model emit machine-parseable JSON on demand, and what to do when it doesn’t. Reel twenty-seven, swipe up.'
    }
  ],

  code: {
    title: '🐍 Few-shot + chain-of-thought, one prompt',
    body:
`import httpx

FEWSHOT = """Classify support tickets by urgency. Examples:
"i cant log in, payroll is due" -> URGENT
"feature idea: dark mode" -> LOW
"invoice has wrong address" -> NORMAL
"site is down for all users" -> URGENT"""

def classify(ticket: str) -> str:
    resp = httpx.post(
        "http://localhost:11434/v1/chat/completions",
        json={
            "model": "llama3.1",
            "messages": [
                {"role": "system", "content": FEWSHOT},
                {"role": "user", "content": ticket},
            ],
            "temperature": 0.0,      # classification: freeze the output
        },
        timeout=30,
    )
    return resp.json()["choices"][0]["message"]["content"].strip()

print(classify("my timesheet wont submit and its due today"))  # -> URGENT`,
    annot: [
      'Examples in the <b>system</b> message define the label set — the model learns your taxonomy, not a generic one.',
      '<b>temperature 0.0</b> again: classification is deterministic work; entropy here is pure risk.',
      'Include <b>edge cases</b> among the examples ("can\'t complain" traps) — the model generalizes from what you demonstrate, including your traps.'
    ]
  },

  recap: [
    'Few-shot: <b>3–5 examples</b> define format better than paragraphs',
    'Chain-of-thought: <b>reason first, answer second</b> — big math/logic gains',
      'Show users the <b>summary</b>, never the raw chain-of-thought'
  ],

  quiz: {
    q: 'Your format instructions say “output valid JSON,” but 5% of calls still wrap it in prose. Cheapest reliable fix?',
    opts: [
      'Repeat the instruction in ALL CAPS',
      'Add two example user→JSON-output pairs to the prompt',
      'Raise temperature so it varies until it works',
      'Switch to a smaller, more obedient model'
    ],
    a: 1,
    why: 'Demonstrations constrain output shape far more reliably than descriptions — the model pattern-matches the examples’ exact format. Two few-shot examples typically eliminate prose-wrapping; it’s also the seed of structured output (reel 27) and tool calling (reel 52).'
  },

  notes: `
# Prompt patterns — few-shot & chain-of-thought

## Few-shot prompting
Provide \`k\` labeled examples in the prompt, then the unlabeled input. The model completes the pattern.

**Where it shines:**
- Custom taxonomies/label sets the model wasn’t trained on
- Precise output formats (your CSV headers, your casing rules)
- Tone imitation (“write like these three samples”)

**Rules of thumb:**
- 3–5 examples beats 1; ~10+ rarely adds much but cost.
- Cover the edge cases in your examples — the model generalizes from your traps.
- Keep example format byte-identical to the desired output (whitespace matters).

## Chain-of-thought (CoT)
Prompt the model to reason before answering: “Let’s think step by step” or “First analyze, then conclude.” Gains concentrate in:
- multi-step arithmetic and logic
- constraint satisfaction (scheduling, packing)
- compare-and-decide tasks

Modern models often reason internally without the phrase; explicit CoT still helps for hard problems and for **verifiability** — you can read the reasoning.

> **Production note:** chain-of-thought is scratch-pad, not product copy. Surface a concise summary; exposing raw CoT leaks your reasoning scaffolding to users and adds attack surface (attackers can steer the scratch-pad).

## Combining them
The code panel stacks both: few-shot defines the labels, and the reasoning habit transfers. For agent prompts (reel 54), the pattern becomes: role + few-shot trajectories + “think step by step before acting.”

## Failure modes
- **Format drift**: examples inconsistently formatted → output inconsistently formatted. Audit your shots.
- **Example fixation**: with few shots, the model may copy example content rather than reasoning about new input — vary surface details between examples.
- **CoT hallucination**: reasoning can rationalize a wrong answer confidently. CoT improves reasoning; validation (reel 15) still gates truth.

Next: reel 27 — structured output and JSON mode: formats enforced by the API, not by prayer.
`
});
