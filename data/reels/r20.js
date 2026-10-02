/* Reel 20 — What is GenAI? — intuition first (GenAI · Core Concepts) */
SS.registerReel({
  id: 'r20', num: 20, section: 'genai', block: 'Core Concepts',
  title: 'What is GenAI? — intuition first',
  hook: 'GenAI isn’t magic and it isn’t a database. **It’s autocomplete at a mind-bending scale.**',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE INTUITION',
      title: 'An LLM does ONE thing: **predicts the next token.**',
      sub: 'Everything else — chat, code, reasoning — is that skill, scaled.',
      narration: 'Strip away the hype and a large language model does exactly one thing: given some text, predict what token comes next. That’s it. Chatbots, code generation, reasoning demos — all of it emerges from next-token prediction trained on staggering amounts of human text. Hold that intuition; every concept in this section is just this one idea, refined.'
    },
    {
      type: 'tokens',
      examples: [
        { words: ['The', 'capital', 'of', 'France'], cands: [{ w: ' is', p: 70 }, { w: ' was', p: 12 }, { w: ' remains', p: 5 }] },
        { words: ['The', 'capital', 'of', 'France is'], cands: [{ w: ' Paris', p: 93 }, { w: ' Lyon', p: 2 }, { w: ' Brussels', p: 1 }] }
      ],
      narration: 'Watch it happen. Given “The capital of France”, the model ranks every possible next token: “ is” at seventy percent, and so on. After “is”, “ Paris” dominates at ninety-three percent. Generation is this loop, token after token — each new token becomes context for the next prediction. That loop, at scale, is the entire technology.'
    },
    {
      type: 'list',
      items: [
        { e: '📈', t: 'Scale', s: 'trillions of tokens, billions of parameters' },
        { e: '🧮', t: 'Parameters', s: 'tunable knobs — the “knowledge”' },
        { e: '🎓', t: 'Training', s: 'predict text, adjust knobs, repeat' },
        { e: '📊', t: 'Emergence', s: 'skills appear that nobody programmed' }
      ],
      narration: 'Where the power comes from. Scale: trillions of tokens of text and billions of parameters — the adjustable knobs that store what the model learned. Training is brutally simple: predict the next token, measure the error, nudge every knob to do better, repeat a hundred trillion times. And emergence: at that scale, abilities nobody explicitly programmed — translation, reasoning, code — appear as byproducts of pure prediction.'
    },
    {
      type: 'compare',
      cards: [
        { e: '🗄️', t: 'Traditional software', s: 'rules + data → exact answers' },
        { e: '🧠', t: 'GenAI', s: 'learned patterns → probable answers', win: true }
      ],
      narration: 'The paradigm shift, stated for engineers. Traditional software: you write rules, feed data, get exact, repeatable answers — deterministic. GenAI: you show examples, the model learns patterns, and you get probable answers — statistical. That single difference explains everything: the fluency AND the hallucinations, the flexibility AND the unpredictability. Reel twenty-eight covers the failure side; the rest of this section teaches you to wield the capability.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'Intuition: locked. **Now watch the machine think.**',
      next: 'Next · Reel 21: How an LLM thinks',
      narration: 'That’s the foundation: prediction at scale, trained not programmed. Every advanced concept in this section — tokens, context windows, prompting, embeddings — is this one idea with more detail. Next reel: inside the model — how prediction actually works. Swipe up.'
    }
  ],

  code: {
    title: '🐍 Predict-the-next-token, live',
    body:
`import httpx

# The API is simpler than the idea: messages in, tokens out.
# But watch WHAT comes back — one tiny piece at a time.
resp = httpx.post(
    "http://localhost:11434/v1/chat/completions",
    json={"model": "llama3.1", "stream": True,
          "messages": [{"role": "user",
                        "content": "The capital of France is"}]},
    timeout=60,
)

tokens_seen = []
for line in resp.iter_lines():
    if not line.startswith("data:"):
        continue
    payload = line[5:].strip()
    if payload == "[DONE]":
        break
    import json
    d = json.loads(payload)
    delta = d["choices"][0]["delta"].get("content", "")
    if delta:
        tokens_seen.append(delta)

print("".join(tokens_seen))        # -> " Paris" (one token at a time)
print(f"tokens: {tokens_seen}")    # the raw loop, exposed`,
    annot: [
      '<b>stream=True</b> — SSE deltas expose the token-by-token loop that batch responses hide (reel 46 turns this into chat UX).',
      '<b>Each delta is one prediction step</b> — the model re-reads ALL prior text every time; that re-reading is the context window (reel 23).',
      '<b>No database lookup happened</b> — "Paris" is pattern recall from parameters, not a SELECT — which is why it can be wrong (reel 28).'
    ]
  },

  recap: [
    'GenAI = <b>next-token prediction</b>, trained at scale',
    '<b>Trained, not programmed</b> — patterns, not rules',
    'Answers are <b>probable, not exact</b> — hence hallucination risk'
  ],

  quiz: {
    q: 'Why can a model write a correct SQL query it was never explicitly programmed to write?',
    opts: [
      'It looks up the answer in a hidden database of code',
      'It copied the query from its training data verbatim',
      'Emergence — next-token prediction at scale generalizes into skills like coding that nobody hand-programmed',
      'The API layer contains a SQL generator that assists it'
    ],
    a: 2,
    why: 'Training on trillions of tokens (much of it code) tuned billions of parameters to predict plausible continuations; generalize that across enough examples and SQL-writing emerges as a statistical skill. There’s no lookup and no copied answer — which is exactly why the query can also be subtly wrong.'
  },

  notes: `
# What is GenAI? — intuition first

## The one-sentence definition
Generative AI: models trained to predict the next token of text, at a scale where that skill generalizes into generation — chat, code, images, and reasoning-like behavior.

## Vocabulary for the rest of the section

| Term | Plain meaning |
| --- | --- |
| Token | a chunk of text (word piece) — the model’s alphabet (reel 22) |
| Parameter | a learned number; billions of them are the “knowledge” |
| Context | the text provided with each request (reel 23) |
| Inference | generating tokens from a trained model (what APIs sell you) |
| Hallucination | plausible-but-false output (reel 28) |
| Embedding | a vector that represents meaning (reel 29) |

## Why engineers should care differently
GenAI changes the unit of computation: from functions (deterministic) to prompts (probabilistic). Debugging shifts from stack traces to eval suites (reel 47); testing from asserts to rubrics; architecture from rule engines to retrieval + generation (reel 36). The rest of this course is those three shifts, in detail.

## The capability/caution pair
- **Capability**: one model handles translation, summarization, extraction, code, and conversation — no per-task programming.
- **Caution**: the same mechanism produces fluent falsehoods (reel 28), has a finite desk (reel 23), and bills by the token (reel 22). The craft is maximizing the first while engineering against the rest.

## A note on "emergence"
Some debated how “surprising” emergent skills are; what’s not debated: capability scales with parameters and training data over many orders of magnitude, and modern models outperform smaller ones across nearly every language task. Buy capability by the API tier; verify behavior with your own evals, not the marketing.

Next: reel 21 — how an LLM thinks: the inference loop, temperature, and the generation pipeline.
`
});
