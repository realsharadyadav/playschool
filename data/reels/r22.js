/* Reel 22 — Tokens & tokenization (GenAI · Core Concepts) */
SS.registerReel({
  id: 'r22', num: 22, section: 'genai', block: 'Core Concepts',
  title: 'Tokens & tokenization',
  hook: 'Models don’t read words. **They read tokens.** Here’s the map.',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE UNIT',
      title: 'A token is **not a word.** Sometimes it’s half of one.',
      sub: '"unbelievable" can be 3 tokens. " the" is one.',
      narration: 'First correction to your mental model: language models don’t process words. They process tokens — chunks of text from a fixed vocabulary, usually three hundred to five hundred of them, learned during training. A token might be a whole word, a syllable, or a single space with the following letter.'
    },
    {
      type: 'tokens',
      examples: [
        { words: ['The', 'weather', 'in'], cands: [{ w: ' Paris', p: 62 }, { w: ' London', p: 21 }, { w: ' Madrid', p: 9 }] }
      ],
      narration: 'Watch prediction happen, token by token. Given “The weather in”, the model ranks candidates for what comes next: “ Paris” at sixty-two percent, “ London” at twenty-one. Each candidate is one token — including the leading space, which is part of the token identity.'
    },
    {
      type: 'compare',
      cards: [
        { e: '🅰️', t: 'Characters', s: 'too granular — "meaning" spans many' },
        { e: '🔤', t: 'Tokens', s: 'right granularity — the model’s alphabet', win: true }
      ],
      narration: 'Why not characters? Because meaning lives at a bigger grain: the word “unbelievable” as nine characters tells the model nothing; as three tokens — un, believ, able — each piece carries meaning the network learned. Tokens are the compromise between character chaos and word rigidity.'
    },
    {
      type: 'list',
      items: [
        { e: '🧮', t: '~0.75 words/token', s: 'English ≈ 4 chars per token' },
        { e: '💸', t: 'Billing is per token', s: 'input + output, both count' },
        { e: '🚪', t: 'Limits are in tokens', s: 'context window size (reel 23)' },
        { e: '🇫🇷', t: 'Language matters', s: 'non-English often costs more' }
      ],
      narration: 'Why you care, four ways. Rough math: three-quarters of a word per token in English — so a thousand-word prompt is about thirteen hundred tokens. Billing counts input and output tokens separately. Model limits are denominated in tokens. And other languages tokenize worse: French or German text can cost half again more for the same meaning.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'Tokens counted. **Now the desk they all land on.**',
      next: 'Next · Reel 23: Context window — the model’s desk',
      narration: 'Tokens are the currency; the context window is the wallet size. Next reel: how much text fits on the model’s desk at once, and what happens — expensively — when you overfill it. Reel twenty-three, swipe up.'
    }
  ],

  code: {
    title: '🐍 Count tokens before you spend',
    body:
`# tiktoken: OpenAI's tokenizer, free and offline
import tiktoken

enc = tiktoken.get_encoding("o200k_base")   # GPT-4o family

def count(text: str) -> int:
    return len(enc.encode(text))

prompt = "Summarize the following contract in three bullet points. "
contract = "The tenant shall pay rent on the first of each month. " * 200

n_prompt = count(prompt)
n_input = count(contract)
print(f"prompt: {n_prompt} tokens, input: {n_input} tokens")

# Rule of thumb: budget = model limit - input - reserved output
LIMIT = 128_000
RESERVED_OUTPUT = 1_000
fits = (n_prompt + n_input + RESERVED_OUTPUT) <= LIMIT
print(f"fits in {LIMIT}: {fits}")   # True — but watch the bill`,
    annot: [
      '<b>tiktoken.get_encoding("o200k_base")</b> — the real tokenizer the GPT-4o models use; counts match billing.',
      '<b>len(enc.encode(text))</b> is the whole API — encode text, count the pieces.',
      '<b>Budget math</b>: input + output + margin must fit the context window — the check that prevents silent truncation.'
    ]
  },

  recap: [
    'Tokens ≠ words — **~0.75 words per token** in English',
    'Billing and limits are **denominated in tokens**',
    '<b>tiktoken</b> counts before you spend'
  ],

  quiz: {
    q: 'Your 800-word English support article is roughly how many tokens for a GPT-4o model?',
    opts: [
      'About 800 — one word, one token',
      'About 1,050 — words ÷ 0.75',
      'About 3,200 — four per word',
      'About 40 — five words per token'
    ],
    a: 1,
    why: 'English averages ~0.75 words per token (≈4 characters per token), so 800 words ≈ 800 / 0.75 ≈ 1,067 tokens — closest to 1,050. The 1:1 intuition is wrong in both directions: common short words merge with spaces, rare long words split into pieces.'
  },

  notes: `
# Tokens & tokenization

## What a tokenizer actually does
A tokenizer converts text to integers using a fixed vocabulary built by training (BPE — byte-pair encoding — for OpenAI models). The process:

1. Split text into bytes.
2. Greedily merge bytes into the longest known token, repeatedly.
3. The result: a list of integers — the only thing the model ever sees.

\`\`\`
"unbelievable" -> ["un", "believ", "able"]  -> [397, 19147, 1671]
\`\`\`

## Rules of thumb that survive production

| Reality | Rule |
| --- | --- |
| English prose | ~4 chars ≈ 1 token ≈ 0.75 words |
| Code | MORE tokens per word (indentation, symbols split) |
| JSON / structured text | verbose — braces and quotes are tokens too |
| CJK / emoji | often 1–3 tokens per character |
| Numbers | "173" can be 3 tokens; big numbers split badly |

## Where tokens bite you
- **Cost**: \`total = input_tokens × in-rate + output_tokens × out-rate\`. Output usually costs 2–5× input — long generations are the bill.
- **Limits**: context window is in tokens (reel 23); exceeding it errors or truncates.
- **Splitting artifacts**: \`"prompt injection"\` as two tokens vs three can behave differently; a leading space is a different token than a word-start.
- **Security**: filters count tokens, not words — naive blocklists miss split spellings.

## Counting in practice
- OpenAI models: \`tiktoken\` (offline, exact for the matched encoding).
- Anthropic: \`anthropic\` SDK’s \`.count_tokens()\`.
- Universal heuristic: \`len(text) / 4\` for English prose when exactness doesn’t matter.

> **Why “.NET devs get bitten” here:** we think in strings and characters. A 10,000-char SQL dump feels small; at ~4 chars/token it’s 2,500 tokens of your window and a measurable slice of your budget. Count before you send — the code panel shows the pattern.

## Gotchas
- Tokenizers are model-specific: \`o200k_base\` counts differ from older \`cl100k_base\` — small drift, real money at scale.
- \`max_tokens\` historically meant output budget; some APIs renamed it (\`max_completion_tokens\`). Check your SDK version.
- Streaming (reel 12) delivers output tokens as generated — billing accrues the same.

Next: reel 23 — the context window: the desk all these tokens land on.
`
});
