/* Reel 24 — Temperature, top-p & max_tokens (GenAI · Core Concepts) */
SS.registerReel({
  id: 'r24', num: 24, section: 'genai', block: 'Core Concepts',
  title: 'Temperature, top-p & max_tokens',
  hook: 'Three dials on the model. **Most people turn the wrong one.**',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE DIALS',
      title: 'Same model, three dials: **temperature, top-p, max_tokens.**',
      sub: 'Determinism, breadth, and length — independently.',
      narration: 'Every generation request carries three knobs, and confusing them is the most common config bug in GenAI. Temperature controls randomness. Top-p controls the candidate pool. Max tokens controls length. They do different jobs — and the defaults are rarely right for production.'
    },
    {
      type: 'compare',
      cards: [
        { e: '🧊', t: 'Temperature 0', s: 'greedy — nearly deterministic, same answer' },
        { e: '🎲', t: 'Temperature 1+', s: 'wild — creative, unstable, risky', win: true }
      ],
      narration: 'Temperature first. At zero, the model picks the single most likely token every step — same input, same output, almost every time. Crank it toward one and the distribution flattens: unlikely tokens become plausible, answers vary wildly, and quality becomes a lottery.'
    },
    {
      type: 'list',
      items: [
        { e: '⚙️', t: '0.0 – extraction', s: 'SQL, JSON, classification' },
        { e: '🌡️', t: '0.2–0.4 – workhorse', s: 'support answers, summaries' },
        { e: '🎨', t: '0.7+ – creative', s: 'brainstorming, naming, copy' },
        { e: '🔝', t: 'top-p 0.9', s: 'nucleus cap — trim the tail' }
      ],
      narration: 'The settings that survive production. Zero for anything structured — SQL, JSON, extraction — because format is law. Point-two to point-four for everyday work: varied enough to sound human, stable enough to trust. Point-seven plus only for brainstorming. And top-p point-nine caps the candidate pool, trimming the long tail of weird tokens.'
    },
    {
      type: 'diagram',
      nodes: [
        { e: '🔢', t: 'max_tokens', s: 'hard stop on output' },
        { e: '✂️', t: 'cut mid-sentence', s: 'finish_reason = length' },
        { e: '💰', t: 'bills you anyway', s: 'generated tokens cost' },
        { e: '🛡️', t: 'set it high + check', s: 'detect truncation' }
      ],
      narration: 'Max tokens is the blunt one: a hard cap on generation. Hit it and the text cuts mid-sentence — and here’s the trap — you still pay for every generated token. Production rule: set the cap above your expected answer and ALWAYS check the finish-reason field for “length”, so truncation never masquerades as a complete answer.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'Dials set. **Now the skill that multiplies everything: prompting.**',
      next: 'Next · Reel 25: Prompt engineering 101 — roles',
      narration: 'Temperature, top-p, max tokens — the raw physics of generation, now under your control. Next, the human skill that bends those physics: prompt engineering, starting with the highest-leverage trick of all — roles. Reel twenty-five, swipe up.'
    }
  ],

  code: {
    title: '🐍 The production generation call',
    body:
`import httpx

def generate(prompt: str, *, temp: float = 0.0, max_tokens: int = 2_000) -> str:
    """One disciplined call: explicit dials, truncation checked."""
    resp = httpx.post(
        "http://localhost:11434/v1/chat/completions",
        json={
            "model": "llama3.1",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": temp,      # 0 for structured, 0.3 for prose
            "top_p": 0.9,             # trim the weird tail
            "max_tokens": max_tokens, # hard cap — check finish_reason!
        },
        timeout=120,
    )
    d = resp.json()
    choice = d["choices"][0]
    if choice["finish_reason"] == "length":
        raise RuntimeError("truncated — raise max_tokens or shorten input")
    return choice["message"]["content"]

# Extraction? Freeze it. Brainstorm? Loosen it.
sql = generate("Write a SELECT for open orders. JSON only.", temp=0.0)
names = generate("10 names for a logging library, one per line", temp=0.8)`,
    annot: [
      '<b>temperature=0.0</b> for extraction — near-deterministic output is what makes parsing (reel 15) reliable.',
      '<b>finish_reason == "length"</b> is the truncation signal — treat it as an error, never as a complete answer.',
      'Dials are <b>per-call</b>: the same model can be frozen for SQL and loose for brainstorming — pick per use case, not per project.'
    ]
  },

  recap: [
    '<b>Temperature</b> = randomness: 0 structured, 0.3 prose, 0.7+ creative',
    '<b>top-p</b> caps the candidate pool — trim the weird tail',
    '<b>max_tokens</b> hard-caps output — always check finish_reason'
  ],

  quiz: {
    q: 'You’re extracting invoice fields to JSON with Pydantic validation, and 3% of calls fail validation. First knob to turn?',
    opts: [
      'Raise temperature so the model “tries different approaches”',
      'Drop temperature to 0 (or near it) for near-deterministic structure',
      'Raise top_p to 1.0 to give the model full freedom',
      'Raise max_tokens so it can explain its JSON'
    ],
    a: 1,
    why: 'Extraction is a formatting task, not a creative one. Near-zero temperature collapses the output distribution onto the most likely valid shape, eliminating the sampling noise that causes sporadic validation failures. Higher temperature or top_p adds exactly the variance you’re trying to remove.'
  },

  notes: `
# Temperature, top-p & max_tokens

## Temperature — the randomness dial
Generation samples from a probability distribution over next tokens. Temperature rescales it:

\`\`\`
logits -> logits / temperature -> softmax -> sample
\`\`\`
- \`T → 0\`: distribution sharpens to argmax — nearly deterministic.
- \`T = 1\`: the model’s native distribution.
- \`T > 1\`: flattens — unlikely tokens become likely. Chaos.

Even at \`T=0\`, tiny run-to-run differences can appear (batching non-determinism in providers). Don’t architect around bit-exact equality; architect around validation (reel 15) and retries (reel 14).

## Top-p (nucleus sampling)
Consider only the smallest set of tokens whose cumulative probability exceeds p. \`top_p=0.9\` means: sample among the tokens covering ninety percent of the probability mass; discard the weird ten percent. Practical pairing: keep \`top_p=0.9\`–\`0.95\` and steer mainly with temperature. Some teams prefer fixing \`temperature=0\` equivalents per task and only touching top-p.

## max_tokens — length and money
- A hard cutoff: output stops mid-token-stream when reached.
- \`finish_reason == "length"\` tells you it happened. CHECK IT.
- Cost = tokens generated; a runaway generation at high temperature with a big cap is a bill event. Combine with per-request budgets (reel 13’s spend limits).

## Recipes that survive contact with production

| Task | temperature | top_p | max_tokens |
| --- | --- | --- | --- |
| SQL/JSON extraction | 0.0 | 1.0 | 2–4K |
| Support-answer drafting | 0.2–0.3 | 0.9 | 1K |
| Summarization | 0.2 | 0.9 | 1.5K |
| Brainstorming/naming | 0.7–0.9 | 0.95 | 1K |
| Agent reasoning loops | 0.0–0.3 | 0.9 | 4K |

## The mistake matrix
- Cranking temperature because outputs feel “boring” → you wanted a better prompt (reel 25), not more entropy.
- Leaving max_tokens at the SDK default (often 16–256 in older stacks) → mystery truncations.
- Setting temperature 0 and expecting perfectly parseable output → still validate with Pydantic; providers aren’t bit-deterministic.

Next: reel 25 — prompt engineering: roles, the highest-leverage technique in the whole course.
`
});
