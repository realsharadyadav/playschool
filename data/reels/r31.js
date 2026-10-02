/* Reel 31 — Cosine similarity playground (GenAI · Embeddings) */
SS.registerReel({
  id: 'r31', num: 31, section: 'genai', block: 'Embeddings',
  title: 'Cosine similarity playground',
  hook: 'One formula decides what “similar” means. **Three lines of NumPy.**',

  scenes: [
    {
      type: 'vector',
      points: [
        { n: '"puppy"', x: 80, y: 75, c: '#4caf50', hi: true },
        { n: '"dog"', x: 72, y: 68, c: '#4caf50', hi: true },
        { n: '"kitten"', x: 70, y: 45, c: '#2196f3' },
        { n: '"car"', x: 25, y: 30, c: '#9e9e9e' }
      ],
      pairs: [
        { a: 0, b: 1, color: '#4caf50', tag: 'cos ≈ 0.99' },
        { a: 1, b: 3, color: '#9e9e9e', tag: 'cos ≈ 0.2' }
      ],
      narration: 'The whole idea on one plot. Embeddings are arrows from the origin, and “similar” means “points in roughly the same direction.” Puppy and dog — near-parallel arrows, cosine similarity near one. Car — a completely different direction, near zero. The angle IS the meaning.'
    },
    {
      type: 'bigtext', kicker: 'THE FORMULA',
      title: 'Cosine similarity: **the angle, not the distance.**',
      sub: 'cos = (A·B) / (|A| × |B|) → 1 same, 0 orthogonal, −1 opposite.',
      narration: 'The formula, in words: dot the two vectors, divide by both their lengths. What you get is the cosine of the angle between them — one means same direction, zero means unrelated, minus one means opposite. The reason we use the angle and not plain distance: it ignores how LONG the vectors are and measures only where they point.'
    },
    {
      type: 'compare',
      cards: [
        { e: '📏', t: 'Euclidean distance', s: 'punishes long/short vectors — usually wrong' },
        { e: '📐', t: 'Cosine similarity', s: 'direction only — the embedding standard', win: true }
      ],
      narration: 'Why not straight-line distance? Because embedding models don’t control vector length consistently — length often encodes frequency or model quirks, not meaning. Two sentences with identical meaning can have different magnitudes. Cosine strips magnitude away and compares pure direction — that’s why every vector database defaults to it.'
    },
    {
      type: 'list',
      items: [
        { e: '🥇', t: '> 0.8', s: 'near-duplicates, paraphrases' },
        { e: '🥈', t: '0.5 – 0.8', s: 'topically related' },
        { e: '🥉', t: '< 0.3', s: 'effectively unrelated' },
        { e: '⚠️', t: 'Thresholds are empirical', s: 'calibrate on YOUR data' }
      ],
      narration: 'Reading the numbers. Above point-eight: near-duplicates — dedupe territory. Point-five to eight: topically related — your retrieval candidates. Below point-three: noise. But these bands are not laws — they shift with model, data, and chunk size. Calibrate thresholds on your own labeled pairs before trusting them.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'Metric mastered. **Now the models that produce the vectors.**',
      next: 'Next · Reel 32: Embedding models in practice',
      narration: 'Cosine similarity: one formula, lifetime of use. Next: choosing and using actual embedding models — dimensions, cost, batching, and the normalization trick that makes the dot product do double duty. Reel thirty-two, swipe up.'
    }
  ],

  code: {
    title: '🐍 Cosine similarity, from scratch to production',
    body:
`import numpy as np

def cosine(a: np.ndarray, b: np.ndarray) -> float:
    """Angle between vectors: 1 = same direction, 0 = unrelated."""
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

rng = np.random.default_rng(42)
e_puppy  = rng.normal(size=8) * np.array([1, 1, 1, 0, 0, 0, 0, 0])
e_dog    = rng.normal(size=8) * np.array([1, 1, 1, 0, 0, 0, 0, 0]) + 0.05
e_car    = rng.normal(size=8) * np.array([0, 0, 0, 0, 1, 1, 1, 1])

print(f"puppy vs dog : {cosine(e_puppy, e_dog):.3f}")   # high
print(f"puppy vs car : {cosine(e_puppy, e_car):.3f}")   # ~0

# Production trick: normalize once, then dot == cosine
def normalize(m: np.ndarray) -> np.ndarray:
    return m / np.linalg.norm(m, axis=1, keepdims=True)

E = normalize(np.vstack([e_puppy, e_dog, e_car]))
sim = E @ E.T          # pairwise matrix, all dot products
print(np.round(sim, 3))`,
    annot: [
      '<b>np.dot / (norm×norm)</b> — the formula verbatim; for 1-vs-1 this is all you ever need.',
      '<b>Normalize then dot</b>: dividing by the norm ONCE turns every later comparison into a matrix multiply — the speed trick every vector DB uses.',
      '<b>E @ E.T</b> computes ALL pairwise similarities in one vectorized op — NumPy does in C what loops do in minutes.'
    ]
  },

  recap: [
    'Cosine = <b>angle, not length</b>: 1 same, 0 unrelated',
    '<b>Normalize once</b> → dot product IS cosine',
    'Thresholds (<0.3 / 0.5–0.8 / >0.8) — <b>calibrate on your data</b>'
  ],

  quiz: {
    q: 'Two embeddings have cosine similarity 0.95 but very different vector lengths. Are they semantically similar?',
    opts: [
      'No — length difference means different meanings',
      'Yes — cosine ignores magnitude; direction is what encodes meaning',
      'Only if they come from the same document',
      'Impossible to tell without the raw text'
    ],
    a: 1,
    why: 'Cosine similarity is explicitly magnitude-invariant: it divides out both lengths, leaving only direction. That’s precisely why it’s the standard for embeddings — vector length is a model artifact, while direction encodes semantics.'
  },

  notes: `
# Cosine similarity playground

## The one formula
\`\`\`
cos(A, B) = (A · B) / (|A| × |B|)
\`\`\`
- \`cos = 1\`: same direction → same meaning.
- \`cos = 0\`: orthogonal → unrelated.
- \`cos < 0\`: opposite — rare with embeddings, usually an artifact.

## Why cosine and not Euclidean distance
Embedding models are not length-calibrated: common words, short texts, and model quirks inflate or shrink magnitudes without changing meaning. Euclidean distance mixes direction and length; cosine isolates direction. Rule: **compare directions, ignore lengths** — unless your specific model docs say otherwise.

## The normalize trick (production-grade)
If you divide every vector by its length ONCE at insert time:
\`\`\`
cos(a,b) == a_norm · b_norm       # no division per query!
\`\`\`
Then similarity search becomes a matrix multiply (or an ANN index lookup — reel 38). This is why ingestion pipelines store \`normalize(embedding)\` — not the raw vector.

## What the numbers mean (starting bands)

| cos | Interpretation | Use |
| --- | --- | --- |
| > 0.85 | near-duplicate / paraphrase | dedupe, plagiarism checks |
| 0.6 – 0.85 | strongly related | confident retrieval hits |
| 0.3 – 0.6 | loose topical relation | candidates — verify |
| < 0.3 | unrelated | filter out |

Calibrate on YOUR data: plot score distributions for known-positive vs known-negative pairs, pick the threshold at the crossing point. Bands vary by model (384-dim open models score differently than 3k-dim frontier ones) and by chunking (reel 37).

## Other metrics you’ll meet
- **Dot product**: same as cosine after normalization; some ANN indexes prefer it (one less step).
- **Euclidean**: fine if vectors are normalized AND your index assumes it — know your DB default (reel 38).
- **Manhattan/hamming**: special-purpose; ignore unless your DB docs demand them.

## Gotchas
- Comparing vectors from DIFFERENT models: meaningless numbers, no error raised.
- Similarity is not probability: 0.72 doesn’t mean “72% match” — no calibrated semantics.
- Thresholds drift when you swap embedding models — re-calibrate after any migration.

Next: reel 32 — embedding models in practice: choosing, batching, normalizing.
`
});
