/* Reel 30 — Types of embeddings — word, sentence, image, code… (GenAI · Embeddings) */
SS.registerReel({
  id: 'r30', num: 30, section: 'genai', block: 'Embeddings',
  title: 'Types of embeddings — word, sentence, image, code…',
  hook: '“Embeddings” is a family, not a thing. **Pick the right member.**',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE FAMILY',
      title: 'Embeddings embed **different kinds of things.**',
      sub: 'Words, sentences, documents, images, audio, code — each has its own models.',
      narration: '“Embeddings” sounds like one technology; it’s a whole family. What gets embedded — a word, a paragraph, an image, a function — determines which model you use, what “similar” means, and whether your search actually works. Reel twenty-nine gave you the intuition; this reel is the field guide.'
    },
    {
      type: 'list',
      items: [
        { e: '🔤', t: 'Word embeddings', s: 'static per-word vectors (Word2Vec era)' },
        { e: '📝', t: 'Sentence embeddings', s: 'one vector per sentence/paragraph' },
        { e: '🖼️', t: 'Image embeddings', s: 'CLIP-style: images AND text, one space' },
        { e: '💻', t: 'Code embeddings', s: 'functions/repos as vectors' }
      ],
      narration: 'The main members. Word embeddings — one fixed vector per word, the classic two-thousand-teens approach; fine for linguistics, useless for meaning in context. Sentence embeddings — one vector per sentence or paragraph, the modern workhorse for search and RAG. Image embeddings — models like CLIP that put images and text in the SAME space, powering “search photos by description”. And code embeddings, so you can semantic-search a codebase.'
    },
    {
      type: 'compare',
      cards: [
        { e: '🏛️', t: 'Word2Vec (2013)', s: '“king - man + woman ≈ queen” — but "bank" gets ONE vector' },
        { e: '🏆', t: 'Sentence transformers', s: 'context-aware: same word, different meaning → different vector', win: true }
      ],
      narration: 'The generational leap. Old word embeddings were famous for king minus man plus woman equals queen — and infamous for giving the word “bank” ONE vector whether you mean a riverbank or a savings bank. Modern sentence embeddings are context-aware: the vector reflects the actual meaning in context. That’s why they’re the default for everything in this course.'
    },
    {
      type: 'diagram',
      nodes: [
        { e: '🖼️', t: 'photo of a dog', s: 'image encoder' },
        { e: '🧭', t: 'shared space', s: 'same dimensions' },
        { e: '💬', t: '"a dog at the beach"', s: 'text encoder' },
        { e: '🎯', t: 'near each other', s: 'cross-modal match' }
      ],
      narration: 'The mind-bending one: multimodal embeddings. Models like CLIP train an image encoder and a text encoder to place matching pairs near each other — so a photo of a dog and the sentence “a dog at the beach” land as neighbors in the same vector space. That’s how “search my photo library by typing a sentence” works.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'Types mapped. **Now measure what “near” means.**',
      next: 'Next · Reel 31: Cosine similarity playground',
      narration: 'The family tree is drawn: sentence embeddings are your default, multimodal is your superpower. Next: the math that decides what counts as “similar” — cosine similarity, three lines of NumPy, and the numbers you’ll eyeball for the rest of your career. Reel thirty-one, swipe up.'
    }
  ],

  code: {
    title: '🐍 One space, two modalities (CLIP-style idea)',
    body:
`import numpy as np

# Simplified stand-in for what CLIP achieves: aligned embeddings.
# In reality: image encoder + text encoder trained together.
# Here: two "encoders" that both map into the same 3-D space.

def text_embed(s: str) -> np.ndarray:
    themes = {"dog": [1.0, 0.1, 0.0], "beach": [0.9, 0.2, 0.1],
              "invoice": [0.0, 0.1, 1.0], "payment": [0.1, 0.0, 0.9]}
    v = np.zeros(3)
    for word, vec in themes.items():
        if word in s:
            v += np.array(vec)
    return v / (np.linalg.norm(v) or 1)   # unit vector

def image_embed(label: str) -> np.ndarray:
    return text_embed(label)              # "same space" means same geometry

dog_photo = image_embed("dog beach")
caption = text_embed("a dog at the beach")
invoice = text_embed("invoice payment")

print(np.dot(dog_photo, caption))  # ~1.0  — cross-modal match
print(np.dot(dog_photo, invoice))  # ~0.1  — unrelated`,
    annot: [
      '<b>Unit vectors + dot product</b> = cosine similarity — the one formula under all semantic search (detailed next reel).',
      '<b>Cross-modal</b> works ONLY because both encoders were trained into the SAME space — the alignment is the achievement.',
      'Real models use 384–3,072 dimensions and learned encoders — this toy just shows the geometry is real.'
    ]
  },

  recap: [
    'Sentence embeddings = <b>modern default</b> for search/RAG',
    'Word embeddings: <b>one vector per word</b>, no context — legacy',
    '<b>Multimodal</b> (CLIP): images + text share one space'
  ],

  quiz: {
    q: 'You need “find similar support tickets” for a RAG system. Which embedding type?',
    opts: [
      'Word2Vec word embeddings, averaged per ticket',
      'Sentence embeddings over whole tickets',
      'Image embeddings on ticket screenshots only',
      'Token-frequency (TF-IDF) vectors — same thing, cheaper'
    ],
    a: 1,
    why: 'Whole-ticket semantics is exactly what sentence embeddings encode — context-aware meaning per text unit. Averaging word vectors loses word order and context; image embeddings ignore the text; TF-IDF matches shared words, not meaning ("refund" vs "money back").'
  },

  notes: `
# Types of embeddings — word, sentence, image, code…

## The family tree

| Generation | What it embeds | Examples | Status |
| --- | --- | --- | --- |
| Word | individual words | Word2Vec, GloVe, fastText | legacy — research/linguistics |
| Contextual word | words in context (internal to LLMs) | BERT layers | you rarely touch these directly |
| Sentence/paragraph | sentences, paragraphs, docs | Sentence-BERT, text-embedding-3, e5, bge | **the default for search/RAG** |
| Image (+ text) | images, aligned with text | CLIP, SigLIP | multimodal search |
| Code | functions, snippets, repos | code-search models, voyage-code | semantic code search |
| Audio | speech/music segments | CLAP-style | niche |

## What “embedding” shares across all of them
- A fixed-length float vector (384–4,096 dims typically).
- Trained so **semantic proximity ≈ geometric proximity**.
- Model-specific: vectors from different models are INCOMPATIBLE — never mix spaces (a classic migration bug).

## Word vs sentence, concretely
- Word embedding: \`bank\` → one vector. Riverbank or Wells Fargo? The vector can’t say. 
- Sentence embedding: “I sat by the riverbank” vs “the bank approved my loan” → two different vectors, correctly dissimilar.

## Multimodal: why it matters
CLIP-style training pairs images with captions and pulls their embeddings together. Consequences:
- text→image search (“find: ‘red car in snow’”)
- image→image dedup, moderation filters
- zero-shot classification (“does this photo depict X?” — embed the label, compare)

## Picking a model (the practical shortlist)
- General text: OpenAI \`text-embedding-3-large/small\`, Cohere embed-v3/v4, open: \`bge-large\`, \`e5-mistral\`.
- Code: voyage-code or code-specific open models.
- Multimodal: CLIP/SigLIP family (open), or provider equivalents.
Benchmark against YOUR data (reel 32) — leaderboards lie by task.

> **.NET ↔ Python:** the embeddings ecosystem is Python-first — providers ship SDKs, MTEB benchmarks assume it. The pattern from reel 1 holds: embed in Python, store wherever, consume from anywhere.

Next: reel 31 — cosine similarity: the distance metric that runs the whole show.
`
});
