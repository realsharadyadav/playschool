/* Reel 3 — Variables & f-strings (Python · Python for GenAI) */
SS.registerReel({
  id: 'r3', num: 3, section: 'python', block: 'Python for GenAI',
  title: 'Variables & f-strings',
  hook: 'No types, no semicolons. **And string interpolation that beats C#.**',

  scenes: [
    {
      type: 'bigtext', kicker: 'BASICS',
      title: 'Variables just… exist. **Assignment is declaration.**',
      sub: 'name = "Ada" — that’s the whole line.',
      narration: 'The single most-typed line in Python is an assignment. No var, no string keyword, no semicolon. You write name equals Ada, and Python binds the name to the value. Type comes from the value, not from you.'
    },
    {
      type: 'compare',
      cards: [
        { e: '🔷', t: 'C#: $"...{x}..."', s: 'string interpolation, great but limited' },
        { e: '🐍', t: 'Python: f"...{x}..."', s: 'same idea — plus expressions inside', win: true }
      ],
      narration: 'You know dollar-quote interpolation in C-sharp. Python’s f-string is the same trick with an f in front — and the braces accept full expressions, not just variable names. Price times quantity, formatted to two decimals, right inside the string.'
    },
    {
      type: 'list',
      items: [
        { e: '💬', t: 'f = formatted', s: 'the f prefix turns on interpolation' },
        { e: '🧮', t: 'Braces run code', s: 'f"{total * 1.2:.2f}" is legal' },
        { e: '🎛️', t: 'Format specs', s: ':.2f, :>10, :, — printf-style power' },
        { e: '⚠️', t: 'Quotes matter', s: 'can’t reuse the same quote inside' }
      ],
      narration: 'Four rules. The f prefix means formatted. Braces can run any expression — method calls, math, lookups. After a colon you get format specs: point-two-f for decimals, right-arrow ten for padding. And mind your quotes: you cannot reuse the same quote character inside the string.'
    },
    {
      type: 'bigtext', kicker: 'WHY YOU CARE',
      title: 'You’ll build LLM prompts **with f-strings.**',
      sub: 'A prompt is just a string with your data dropped in.',
      narration: 'Why drill this? Because prompting is string building. System prompt, user question, retrieved context — you’ll glue them together with f-strings in every single AI script you write. This is not trivia; it is the tool.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'Strings handled. **Now the data type that runs the AI world.**',
      next: 'Next · Reel 4: dicts & JSON',
      narration: 'Strings down. Next is the structure every LLM API speaks: the dict. If f-strings are your glue, dicts are the walls, floors, and roof. Reel four, swipe up.'
    }
  ],

  code: {
    title: '🐍 Variables & f-strings in action',
    body:
`# Assignment is declaration — type rides with the value
model = "gpt-4o"          # str
max_tokens = 4096         # int
temperature = 0.7         # float
is_streaming = True       # bool — capital T!

# f-strings: interpolation + expressions + format specs
price, qty = 19.99, 3
print(f"Total: {price * qty:.2f}")        # -> Total: 59.97
print(f"{model:>10}")                     # right-align in 10 chars
print(f"{max_tokens:,}")                  # -> 4,096

# This is how you'll build prompts later (reel 25)
user_q = "refund policy"
prompt = f"You are a support bot. Answer: {user_q}"
print(prompt)`,
    annot: [
      '<b>Booleans are True / False</b> — capitalized, like C#’s true but with a bigger ego. None is the null.',
      'Inside f-string braces you can run <b>any expression</b>: math, method calls, lookups — then format it with a colon spec.',
      'The <b>:.2f</b>, <b>:,</b>, <b>:>10</b> specs come from printf-land — same mini-language C# borrowed for string.Format.'
    ]
  },

  recap: [
    'Assignment <b>is</b> declaration — `name = "Ada"` does it all',
    '**f-strings** interpolate and run expressions in braces',
    'Format specs: **:.2f** decimals, **:,** thousands, **:>10** align'
  ],

  quiz: {
    q: 'What does this print?  f"{2.5 * 2:.1f}"',
    opts: [
      '2.5 * 2',
      '5',
      '5.0',
      'SyntaxError'
    ],
    a: 2,
    why: 'The braces evaluate 2.5 * 2 → 5.0 (float math stays float), and :.1f formats it to one decimal → "5.0". Without the format spec you’d get "5.0" anyway from float repr; with :.0f you’d get "5".'
  },

  notes: `
# Variables & f-strings

## Variables: assignment is declaration
Python has no declaration keyword. The first assignment creates the variable; the value's type becomes the variable's type.

\`\`\`
model = "gpt-4o"     # str, forever (until you reassign)
count = 3            # int
count = "three"      # legal! Python lets you — your linter will not
\`\`\`

Reassignment to a different type is legal at runtime. The safety net is not the interpreter — it's your editor's type checker (Pyright/Pylance) and discipline at boundaries (reel 15, Pydantic).

## The basic types

| C# | Python | Literal example |
| --- | --- | --- |
| \`string\` | \`str\` | \`"ada"\` |
| \`int\` / \`long\` | \`int\` (unbounded) | \`42\` |
| \`double\` / \`decimal\` | \`float\` | \`0.7\` |
| \`bool\` | \`bool\` | \`True\` / \`False\` |
| \`null\` | \`NoneType\` | \`None\` |

> **.NET ↔ Python:** Python's \`float\` is a C \`double\` — there is no \`decimal\` type. For money math, use \`decimal.Decimal\` from the standard library, or keep money in cents as ints. This bites in pricing/cost calculations for AI APIs.

## f-strings: your #1 tool
Prefix a string with \`f\` and braces interpolate. Inside the braces: any expression. After a colon: a format spec.

| You want | You write |
| --- | --- |
| Two decimals | \`f"{total:.2f}"\` |
| Thousands separator | \`f"{n:,}"\` |
| Right-align, width 10 | \`f"{name:>10}"\` |
| Percent, 1 decimal | \`f"{p:.1%}"\` |
| Truncate float to int look | \`f"{x:.0f}"\` |

## Prompt building — why this matters
Every prompt you'll write is an f-string:

    prompt = f"Context: {context}\\n\\nQuestion: {user_q}\\nAnswer in {style}."

That's the entire pattern behind RAG (reel 40) and tool instructions (reel 52).

## Gotchas
- Quote collisions: \`f"she said "hi""\` is a syntax error — switch quote styles or escape.
- Braces in the string itself need doubling: \`f"{{literal}}"\`.
- f-strings can't contain backslashes inside the expression part (pre-3.12); compute first, then interpolate.

Next: reel 4 — dicts and JSON, the actual language of LLM APIs.
`
});
