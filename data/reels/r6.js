/* Reel 6 — Functions — your first tool (Python · Python for GenAI) */
SS.registerReel({
  id: 'r6', num: 6, section: 'python', block: 'Python for GenAI',
  title: 'Functions — your first tool',
  hook: 'In AI, a function isn’t just code. **It’s a tool the LLM can call.**',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE UNIT OF WORK',
      title: 'def a function, and it’s already **an LLM tool in waiting.**',
      sub: 'Name, docstring, parameters, return. That’s the whole spec.',
      narration: 'Here’s the reframe that matters: in agentic AI, a function is not just an organizational unit. It is a capability you can hand to a model. Define it well — name, docstring, typed-ish parameters — and you’re one registration call away from a tool the LLM can invoke.'
    },
    {
      type: 'diagram',
      nodes: [
        { e: '✍️', t: 'def + docstring', s: 'the contract, in prose' },
        { e: '📇', t: 'name & params', s: 'what the LLM sees' },
        { e: '↩️', t: 'return value', s: 'what the LLM gets back' },
        { e: '🤖', t: 'LLM calls it', s: 'function calling (reel 52)' }
      ],
      narration: 'The anatomy. Def plus a docstring is the contract — the docstring is literally what the model reads to decide when to call. The name and parameters form the signature. The return value goes back into the conversation. Reel fifty-two wires this to a real model.'
    },
    {
      type: 'compare',
      cards: [
        { e: '🔷', t: 'C# method', s: 'public static string Greet(string name) { }' },
        { e: '🐍', t: 'Python function', s: 'def greet(name: str) -> str:', win: true }
      ],
      narration: 'Side by side. No access modifiers, no static, no return type up front. Python puts the return type after an arrow — and those annotations are optional hints, not enforced. Def, name, parameters, colon, indented body. That is the whole syntax.'
    },
    {
      type: 'list',
      items: [
        { e: '🔢', t: 'Defaults', s: 'def f(limit=10) — C# optional params' },
        { e: '🚦', t: 'Keyword-only', s: 'def f(*, city) — force named args' },
        { e: '🧽', t: '*args / **kwargs', s: 'the sponges — reel 7 deep dive' },
        { e: '📦', t: 'Multiple returns', s: 'return a, b → a tuple' }
      ],
      narration: 'The parameter toolkit. Defaults mirror C-sharp optional parameters. A bare star forces everything after it to be named — self-documenting call sites. Star-args and double-star kwargs soak up extras; reel seven is all about them. And returning multiple values is just returning a tuple.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'Functions ready. **Now catch the arguments the LLM actually sends.**',
      next: 'Next · Reel 7: *args & **kwargs',
      narration: 'Functions, done — and you now own the basic unit of every agent. But when an LLM calls one, the arguments arrive in a strange shape: a JSON blob. Reel seven catches it with star-args and double-star kwargs. Swipe up.'
    }
  ],

  code: {
    title: '🐍 A function built to be a tool',
    body:
`def get_exchange_rate(base: str, quote: str = "EUR") -> float:
    """Return today's exchange rate for base -> quote.

    This docstring is what an LLM reads to decide when to call.
    """
    rates = {"USD": 0.92, "GBP": 1.17}
    return rates.get(base.upper(), 1.0)

# Defaults make parameters optional
print(get_exchange_rate("usd"))            # -> 0.92 (quote defaults)

# Everything after a bare * must be passed BY NAME
def search(query: str, *, limit: int = 5, min_score: float = 0.5):
    return f"searching {query!r}, top {limit}, score>={min_score}"

print(search("paris", limit=3))            # limit named — required style

# Multiple returns = one tuple, unpacked at the call site
def stats(xs):
    return min(xs), max(xs), sum(xs) / len(xs)

lo, hi, avg = stats([3, 7, 9])
print(f"min={lo} max={hi} avg={avg:.1f}")`,
    annot: [
      'The <b>docstring is the tool description</b> — function calling literally surfaces it to the model. Write it for the LLM, not just for humans.',
      '<b>Type hints (str, -> float)</b> are optional documentation — Python ignores them at runtime; linters and Pydantic (reel 15) use them.',
      '<b>Keyword-only params</b> after a bare * force callers to name limit= and min_score= — call sites read like documentation.'
    ]
  },

  recap: [
    'def + docstring + return = <b>an LLM tool in waiting</b>',
    'Defaults like C# optional params; <b>*</b> forces named args',
    'Docstrings are read by the model — <b>write them for the LLM</b>'
  ],

  quiz: {
    q: 'Why does a tool’s docstring matter when an LLM will call the function?',
    opts: [
      'It speeds up Python execution',
      'The model reads it to decide when and how to call the tool',
      'It replaces the need for parameters',
      'It is required by the compiler'
    ],
    a: 1,
    why: 'In function calling, the model chooses tools from their name + description, and the description is the docstring. A vague docstring means the model calls the tool at the wrong time or with wrong assumptions — the docstring is production documentation for the LLM.'
  },

  notes: `
# Functions — your first tool

## Syntax in one look
\`\`\`
def get_exchange_rate(base: str, quote: str = "EUR") -> float:
    """Return today's exchange rate for base -> quote."""
    ...
    return rate
\`\`\`
\`def\`, name, parameters in parens, colon, indented body. Type annotations after each parameter and after \`->\` are **hints** — ignored at runtime, consumed by editors, linters, and Pydantic (reel 15).

## Parameter toolkit

| Feature | Syntax | C# cousin |
| --- | --- | --- |
| Default value | \`def f(limit=10)\` | optional parameter |
| Keyword-only | \`def f(*, city)\` | named-argument-only style |
| Positional sponge | \`def f(*args)\` | \`params object[]\` |
| Named sponge | \`def f(**kwargs)\` | \`Dictionary<string,object>\` (reel 7) |
| Multiple returns | \`return a, b\` | \`(int, string)\` tuple |

## The docstring = the tool description
This is the AI angle most Python tutorials miss. When you register a function as an LLM tool, the framework sends the model:

\`\`\`
{"name": "get_exchange_rate",
 "description": "<your docstring>",
 "parameters": {...from annotations...}}
\`\`\`

So the docstring isn't a courtesy — it's the UI between your code and the model. Write what it does, when to use it, and what the parameters mean. Reels 52 and 72 build exactly this.

> **.NET ↔ Python:** C# methods live inside classes; Python functions are free-standing. Nesting, returning functions, and passing functions as arguments (\`sorted(xs, key=lambda...)\`) are all idiomatic — like \`Func<>\` everywhere, with less typing.

## Gotchas
- **Mutable default trap**: \`def f(items=[])\` shares one list across all calls. Use \`def f(items=None):\` then \`items = items or []\`.
- A function with no \`return\` returns \`None\` — C#'s \`void\` is a value here.
- Lambdas are expressions, one line only: \`lambda x: x["score"]\`. For real logic, use \`def\`.

Next: reel 7 — *args & **kwargs, the mechanism that catches tool-call arguments.
`
});
