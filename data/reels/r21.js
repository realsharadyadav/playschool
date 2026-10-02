/* Reel 14 — How an LLM thinks (GenAI · Core Concepts) */
SS.registerReel({
  id: 'r21', num: 21, section: 'genai', block: 'Core Concepts',
  title: 'How an LLM thinks',
  hook: 'This AI is **predicting the future** — one word at a time.',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE BIG IDEA',
      title: 'How does an **LLM** actually think?',
      sub: 'Strip away the magic — one simple idea, repeated forever.',
      narration: 'How does an AI like ChatGPT actually work? Strip away the magic, and you will find one simple idea — repeated billions of times.'
    },
    {
      type: 'tokens', loop: true,
      examples: [
        { words: ['The', 'cat', 'sat', 'on', 'the'], cands: [{ w: 'mat', p: 72 }, { w: 'moon', p: 14 }, { w: 'rug', p: 9 }] },
        { words: ['My', 'coffee', 'is', 'too'], cands: [{ w: 'hot', p: 64 }, { w: 'cold', p: 21 }, { w: 'big', p: 7 }] }
      ],
      narration: 'Give it some text — “the cat sat on the” — and it does exactly one thing: it guesses the next word. Not understands… guesses. “Mat” is the safest bet, so “mat” is what comes out.'
    },
    {
      type: 'tokens',
      examples: [
        { words: ['Paris', 'is', 'the', 'capital', 'of'], cands: [{ w: 'France', p: 81 }, { w: 'Europe', p: 6 }, { w: 'light', p: 3 }] }
      ],
      narration: 'Change the text, and the guess changes. “Paris is the capital of…” — now the most likely word is “France”. Every answer you have ever seen is thousands of tiny guesses, chained together.'
    },
    {
      type: 'list',
      items: [
        { e: '👀', t: 'Read the text', s: 'everything written so far' },
        { e: '🎲', t: 'Guess the next word', s: 'the single most likely one' },
        { e: '🔁', t: 'Repeat forever', s: 'each guess joins the text' }
      ],
      narration: 'Read the text. Predict one word. Add that word in… and predict again. That is the entire loop. All the training, all the transformers — everything exists to make each guess smarter.'
    },
    {
      type: 'bigtext', kicker: 'THE CATCH',
      title: 'Best **guesser** on Earth ≠ best **understander**',
      sub: 'Brilliant one second — confidently wrong the next.',
      narration: 'Now here is the catch. It is the world’s best guesser — not the world’s best understander. Brilliant one second, confidently inventing facts the next. Remember this. It matters later.'
    },
    {
      type: 'bridge', kicker: 'COMING UP',
      title: 'But computers only do **numbers** — so how does a *word* become a number?',
      next: 'Swipe up · Embeddings explained',
      narration: 'But hold on — text is words, and computers only do numbers. So how does a word become a number the model can use? Swipe up. That is exactly where we go next.'
    }
  ],

  code: {
    title: '🐍 Prompt it, watch it guess',
    body:
`# An LLM is a next-token predictor
import openai

response = openai.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user",
               "content": "The cat sat on the"}],
    max_tokens=3,
)

print(response.choices[0].message.content)  # -> "mat"`,
    annot: [
      '<b>max_tokens=3</b> — ask for a tiny completion and you literally watch the first guess.',
      'The model doesn’t look “mat” up in a database — it computes probabilities and picks one.',
      'Change the prompt and the same model happily “guesses” something completely different.'
    ]
  },

  recap: [
    'An LLM predicts **one word at a time**',
    'Loop: read text → guess next word → repeat',
    'Great guessing ≠ understanding — it can **hallucinate**'
  ],

  quiz: {
    q: 'At every single step, an LLM…',
    opts: [
      'Understands meaning like a human does',
      'Predicts the most likely next token',
      'Searches the internet for the answer',
      'Copies an answer from its training data'
    ],
    a: 1,
    why: 'An LLM computes a probability for every possible next token and picks one. Human-style understanding isn’t in the loop — that’s exactly why grounding tricks like RAG exist (coming in this course).'
  },

  notes: `
# How an LLM thinks

## The one-line mental model
An LLM is a **next-token prediction machine**. Given some text, it outputs a probability for every possible next piece of text (token), picks one, appends it, and repeats.

## Tokens, not words
The unit is a **token** — usually a word, part of a word, or punctuation. “unbelievable” might be 3 tokens: \`un\` \`believ\` \`able\`. (Reel 15 goes deep.)

## Under the hood: a probability distribution
For “The cat sat on the ___”, the model outputs something like:
- \`mat\` → 72%
- \`moon\` → 14%
- \`rug\` → 9%
- everything else → the remaining 5%

That distribution is learned from trillions of words of training text — the model absorbed statistical patterns of how humans use language.

## Why it feels like thinking
- The loop runs **fast** (tens of tokens per second).
- Training data contained reasoning, code, math, stories — so the patterns include *styles of thinking*.
- With the right prompting, the guesses look like step-by-step reasoning.

## The critical catch: hallucination
Because the model predicts what *sounds right* rather than what *is true*, it can produce confident, fluent, **wrong** answers. Mitigations you’ll learn later:
- Grounding with **RAG** (reels 27–32)
- Structured output & validation (reel 20)
- Evals (reel 37)

## Vocabulary for the next reels
- **Token**: the atomic text unit
- **Logits**: raw scores before they become probabilities
- **Sampling**: how a token is chosen from the distribution (temperature, reel 17)
`
});
