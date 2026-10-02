/* Reel 22 — Embeddings explained (GenAI · Embeddings) */
SS.registerReel({
  id: 'r29', num: 29, section: 'genai', block: 'Embeddings',
  title: 'Embeddings explained',
  hook: 'What if **“meaning”** is just… geometry?',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE PROBLEM',
      title: 'Computers don’t get **words**. They get **numbers**.',
      sub: 'So AI engineers did something genius: they turned meaning into numbers.',
      narration: 'Computers don’t understand words — they only crunch numbers. So here’s the genius trick AI engineers came up with: turn meaning itself into numbers.'
    },
    {
      type: 'embednums', word: 'cat', vals: ['0.21', '-0.83', '0.47', '0.05', '-0.62', '0.91', '-0.14'], dims: '×1,536', countTo: 1536,
      narration: 'Take the word “cat”. An embedding model converts it into a long list of numbers — hundreds, sometimes thousands. “Cat” becomes one single point in a space with one thousand five hundred and thirty-six dimensions.'
    },
    {
      type: 'vector',
      points: [
        { n: 'cat', x: 40, y: 42, c: '#a78bfa', hi: true },
        { n: 'kitten', x: 50, y: 32, c: '#a78bfa' },
        { n: 'dog', x: 54, y: 50, c: '#818cf8' },
        { n: 'banana', x: 79, y: 24, c: '#facc15' },
        { n: 'truck', x: 23, y: 74, c: '#fb923c' }
      ],
      pairs: [
        { a: 'cat', b: 'kitten', color: '#4ade80', tag: '0.86 · similar meaning' },
        { a: 'cat', b: 'truck', color: '#f87171', tag: '0.09 · different meaning' }
      ],
      narration: 'Now the magic. Words with similar meanings land close together. “Cat” and “kitten” — neighbors. “Banana”? Different neighborhood. “Truck”? Nowhere near. Meaning has become distance.'
    },
    {
      type: 'list',
      items: [
        { e: '📏', t: 'Cosine similarity', s: 'a score from −1 to +1' },
        { e: '🧭', t: 'Same direction → similar meaning', s: 'the angle matters, not just distance' },
        { e: '🔎', t: 'Search becomes geometry', s: '“find the points nearest my question”' }
      ],
      narration: 'We measure closeness with cosine similarity — a score from minus one to one. Point the same direction? Similar meaning. Point apart? Unrelated. So search becomes geometry: find the points closest to my question.'
    },
    {
      type: 'list',
      items: [
        { e: '🔍', t: 'Semantic search', s: 'find ideas, not just matching keywords' },
        { e: '🛒', t: 'Recommendations', s: '“people like you also liked…”' },
        { e: '🧠', t: 'The engine inside RAG', s: 'the cure for chatbot hallucination — reels 27 to 32' }
      ],
      narration: 'This one trick powers semantic search — finding ideas, not just keyword matches. It powers recommendations. And it’s the engine inside RAG — the technique that stops chatbots from making things up.'
    },
    {
      type: 'bridge', kicker: 'COMING UP',
      title: 'Not all embeddings are equal — **word, sentence, image, code**…',
      next: 'Next · Types of embeddings (Reel 23)',
      narration: 'And not all embeddings are the same. There are word embeddings, sentence embeddings — even image and code embeddings. That’s the next piece — swipe on.'
    }
  ],

  code: {
    title: '🐍 From words to similarity in 10 lines',
    body:
`# Embeddings: text -> numbers -> meaning
import numpy as np
from openai import OpenAI

client = OpenAI()
data = client.embeddings.create(
    model="text-embedding-3-small",
    input=["cat", "kitten", "truck"],
).data

def cos(a, b):
    return a @ b / (np.linalg.norm(a) * np.linalg.norm(b))

print(cos(data[0].embedding, data[1].embedding))  # ~0.86
print(cos(data[0].embedding, data[2].embedding))  # ~0.09`,
    annot: [
      'One API call turns each word into a <b>1,536-number vector</b>.',
      'cosine similarity: <b>1</b> = same direction · <b>0</b> = unrelated.',
      'cat↔kitten scores high, cat↔truck scores low — <b>geometry = meaning</b>.'
    ]
  },

  recap: [
    'Embeddings turn text → **lists of numbers** (vectors)',
    'Similar meaning → points **close together** in space',
    'Cosine similarity scores “closeness of meaning”'
  ],

  quiz: {
    q: 'In embedding space, two words with very similar meanings will…',
    opts: [
      'Be far apart from each other',
      'Be close together / point the same way',
      'Have exactly the same spelling',
      'Get rejected by the model'
    ],
    a: 1,
    why: 'Similar meanings produce vectors with high cosine similarity — they cluster in the same region of space. That’s exactly what makes semantic search and RAG work.'
  },

  notes: `
# Embeddings explained

## What an embedding is
An embedding is a **vector** — a list of floating-point numbers — that represents the *meaning* of a piece of text. Similar meanings → similar vectors. It is produced by a model trained specifically for this (an “embedding model”), not by the chat model itself.

## The geometric intuition
- Each word/sentence becomes one point in a very high-dimensional space (512–4,096 dims).
- During training, the model learns to place **semantically similar items near each other**.
- Result: “king − man + woman ≈ queen” style relationships become arithmetic you can actually do on the vectors.

## Cosine similarity
The standard way to compare two vectors:
\`similarity(a, b) = (a · b) / (|a| × |b|)\`
- **1** → same direction (very similar)
- **0** → unrelated
- **−1** → opposite

(Euclidean distance is also used; cosine ignores vector length and cares only about direction, which works better for text.)

## Why this changes everything
- **Semantic search**: a question and its answer get close vectors even when they share zero keywords.
- **Recommendation**: “users with similar taste vectors liked X”.
- **RAG**: retrieve the chunks whose vectors are closest to the question — feed *real facts* to the model (reels 27–32).

## Types (preview of Reel 23)
- **Word embeddings** — Word2Vec, GloVe (one vector per word)
- **Sentence/text embeddings** — Sentence-BERT, OpenAI \`text-embedding-3\` (one vector per passage)
- **Image embeddings** — CLIP (images in the same space as text!)
- **Code embeddings** — for semantic code search
- **Dense vs sparse** — few fat numbers vs many mostly-zero numbers (keyword-ish)
`
});
