/* Reel 28 — Hallucination — why models invent facts (GenAI · Core Concepts) */
SS.registerReel({
  id: 'r28', num: 28, section: 'genai', block: 'Core Concepts',
  title: 'Hallucination — why models invent facts',
  hook: 'The model isn’t lying. **It’s doing exactly what it was built to do.**',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE DEFECT',
      title: 'Fluent, confident, **completely fabricated.**',
      sub: 'Hallucination: plausible-sounding statements with no basis in fact.',
      narration: 'Hallucination is the defining defect of LLMs: output that sounds authoritative and is simply made up — case law that doesn’t exist, functions that were never in the API, quotes nobody said. Here’s the reframe that makes it manageable: the model isn’t broken. It’s doing exactly what it was trained to do — produce plausible text — and plausibility is not truth.'
    },
    {
      type: 'diagram',
      nodes: [
        { e: '📚', t: 'Training: predict text', s: 'plausibility is the ONLY target' },
        { e: '🎯', t: 'Truth never scored', s: 'no fact-checking gradient' },
        { e: '🕳️', t: 'Knowledge gap', s: 'question exceeds training data' },
        { e: '✨', t: 'Plausible fill', s: 'a guess, delivered as fact' }
      ],
      narration: 'The mechanism. Training optimizes one thing: predicting plausible next tokens. There is no truth signal in the loss function — the model is never penalized for being wrong, only for being improbable. So when a question reaches past its knowledge, the model doesn’t say “I don’t know”. It fills the gap with the most plausible-sounding continuation. That’s a hallucination.'
    },
    {
      type: 'list',
      items: [
        { e: '📉', t: 'Low-frequency facts', s: 'niche names, old docs, small APIs' },
        { e: '➕', t: 'Forced specifics', s: '“exact date”, “page number”' },
        { e: '🧵', t: 'Long generations', s: 'drift compounds turn by turn' },
        { e: '🔀', t: 'Blended sources', s: 'merging two real things into one fake' }
      ],
      narration: 'When it strikes. Rare facts — the niche library, the old API version — because the training signal was thin. Forced specificity: demand a page number and you’ll get a confident page number, invented. Long outputs drift. And the sneakiest: blending two real facts into one plausible hybrid that never existed.'
    },
    {
      type: 'compare',
      cards: [
        { e: '🚫', t: '“Never hallucinate.”', s: 'instructions reduce it — don’t remove it' },
        { e: '🛡️', t: 'Ground + verify', s: 'RAG, citations, validation — engineered away', win: true }
      ],
      narration: 'What actually works. Prompt instructions like “don’t make things up” trim hallucination at the margins — they can’t fix a training-objective gap. The engineering answer: ground the model — give it source documents and forbid outside knowledge — then verify what you can. That’s RAG, coming in reels thirty-six onward.'
    },
    {
      type: 'bridge', kicker: 'BLOCK COMPLETE',
      title: 'Core concepts: done. **Next block: the geometry of meaning.**',
      next: 'Next · Reel 29: Embeddings explained',
      narration: 'Core concepts complete — you now know how models generate, what the dials do, how to prompt reliably, and why they lie. Next block: embeddings, the technology that turns text into geometry and makes search-by-meaning real. Reel twenty-nine, swipe up.'
    }
  ],

  code: {
    title: '🐍 Grounded answers: cite-or-refuse pattern',
    body:
`import httpx

SYSTEM = """You answer ONLY from the CONTEXT below.
Rules:
- Every claim must end with a citation [n] pointing at a context item.
- If the context does not contain the answer, say "NOT IN CONTEXT".
- Never use outside knowledge.

CONTEXT:
[1] Refunds are accepted within 30 days of purchase.
[2] Store credit is issued for returns without a receipt."""

def ask(q: str) -> str:
    resp = httpx.post(
        "http://localhost:11434/v1/chat/completions",
        json={"model": "llama3.1",
              "messages": [{"role": "system", "content": SYSTEM},
                           {"role": "user", "content": q}],
              "temperature": 0.0},
        timeout=60,
    )
    return resp.json()["choices"][0]["message"]["content"]

print(ask("what's the refund window?"))   # cites [1]
print(ask("do you ship to canada?"))      # -> NOT IN CONTEXT`,
    annot: [
      '<b>"ONLY from CONTEXT" + a refusal phrase</b> — the two clauses that turn a generalist into a grounded system.',
      '<b>Citations [n]</b> let you VERIFY grounding programmatically: does the cited item actually contain the claim?',
      '<b>temperature 0.0</b> — grounding is precision work; entropy just invents more creatively.'
    ]
  },

  recap: [
    'Hallucination = <b>plausibility training</b>, not malice',
    'Hits on <b>rare facts, forced specifics, long outputs</b>',
    'Defense: <b>ground + verify</b> — instructions alone don’t scale'
  ],

  quiz: {
    q: 'Why can’t a well-written prompt (“never invent facts”) fully solve hallucination?',
    opts: [
      'Models deliberately disobey instructions about facts',
      'Hallucination comes from the training objective — plausibility, not truth — so instructions can only trim the edges',
      'Prompts get truncated before the instruction is read',
      'It does solve it, if written strongly enough'
    ],
    a: 1,
    why: 'The training objective rewards probable text, not accurate text. When knowledge runs out, the most probable continuation is a confident guess. Instructions shift behavior at the margin; only engineering controls — grounding in provided sources, citations, and verification — structurally prevent fabrication.'
  },

  notes: `
# Hallucination — why models invent facts

## The root cause, precisely
The training loss is next-token plausibility against human text. Two consequences:
1. **Truth is not in the loss.** A model gets identical gradients for a true sentence and a false-but-common one.
2. **Confidence is style.** Human text states false things confidently all the time; the model learned that register too.

So hallucination isn’t a bug to patch — it’s the system working as designed, with truth as an afterthought.

## Taxonomy (know your enemy)

| Type | Example | Trigger |
| --- | --- | --- |
| Factual fabrication | “The court ruled in Farley v. Acme (2019)…” | rare/legal/niche knowledge |
| Source invention | “As the Microsoft docs state on page 84…” | forced citation/specificity |
| API hallucination | \`client.models.enumerate()\` (doesn’t exist) | small or changed libraries |
| Conflation | merging two real APIs into one fake | similar entities |
| Drift | answer slowly departs from the source | long generations |

## The defense stack (in order of leverage)
1. **Grounding (RAG, reel 36)**: restrict the answer to retrieved sources; the model now cites instead of recalls.
2. **Refusal training in the prompt**: an explicit “say NOT IN CONTEXT” escape valve — models hallucinate less when saying “I don’t know” is sanctioned.
3. **Citations + programmatic checks**: require [n] references; verify each cited span supports the claim (string/semantic match).
4. **Schema + validation (reel 15/27)**: at least catch the shape; cross-check numbers against source text.
5. **Lower temperature**: reduces sampling noise; pairs with everything above.

## Honest limits
- Grounded models still misread sources — attribution errors, not fabrications.
- Math/dates still need calculators and validators, not bigger prompts.
- Eval harnesses (reel 47) should include a “refusal accuracy” metric: does it refuse when it SHOULD?

> **For .NET teams:** this is why the “let’s just wrap the API” phase always ends at the same wall. Wrapping exposes raw plausibility; grounding and verification are application-layer work — and they’re stack-agnostic skills this course builds for Python.

Next: reel 29 — embeddings: turning meaning into geometry.
`
});
