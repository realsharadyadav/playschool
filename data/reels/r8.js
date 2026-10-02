/* Reel 8 — Classes & dataclasses (Python · Python for GenAI) */
SS.registerReel({
  id: 'r8', num: 8, section: 'python', block: 'Python for GenAI',
  title: 'Classes & dataclasses',
  hook: 'A three-line Python class that **replaces forty lines of C#**.',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE PROMISE',
      title: 'You already know OOP. Python just **deleted the ceremony**.',
      sub: 'No interfaces file, no getters, no boilerplate.',
      narration: 'Good news — you already know object-oriented programming. Python didn’t reinvent it; it just deleted the ceremony. No interfaces file, no getters, no boilerplate. Watch a whole model fit in five lines.'
    },
    {
      type: 'compare',
      cards: [
        { e: '🟣', t: 'C# data class', s: 'ctor, backing fields, Equals, GetHashCode…' },
        { e: '🐍', t: '@dataclass — 5 lines', s: 'init, repr, eq generated for free', win: true }
      ],
      narration: 'Side by side. Left: a C-sharp data class — constructor, private fields, properties, equality, maybe two hundred lines. Right: the same thing as a Python dataclass — five lines, and equality comes free.'
    },
    {
      type: 'diagram',
      nodes: [
        { e: '🧾', t: 'raw JSON', s: 'straight from the model' },
        { e: '🏗️', t: '@dataclass', s: 'fields get a type + shape' },
        { e: '🛡️', t: '__post_init__', s: 'validate on construction' },
        { e: '✅', t: 'typed object', s: 'safe to pass around' }
      ],
      narration: 'Here’s the pipeline for trusting model output — pre-Pydantic, we’ll get there in reel fifteen. Raw JSON from the model. A dataclass gives it shape. Post-init validates. Only then is it safe to use.'
    },
    {
      type: 'list',
      items: [
        { e: '🎀', t: '@dataclass', s: 'decorator writes init, repr, eq' },
        { e: '📐', t: 'Typed fields', s: 'name: type = default' },
        { e: '🛡️', t: '__post_init__', s: 'validate like a C# ctor' },
        { e: '🧊', t: 'frozen=True', s: 'immutable ≈ init-only record' }
      ],
      narration: 'Four moves. One: decorate with dataclass. Two: declare fields with types and defaults — the decorator writes the constructor. Three: override post-init to validate, like throwing in a C-sharp constructor. Four: freeze it if it shouldn’t change.'
    },
    {
      type: 'bigtext', kicker: 'THE PAYOFF',
      title: '@dataclass ≈ C# **record**',
      sub: 'repr, eq, init — generated, not written.',
      narration: 'The payoff: a dataclass is basically a C-sharp record. You get a constructor, a readable printout, and value equality — generated, not written. Less code means fewer places for LLM output to slip through.'
    },
    {
      type: 'bridge', kicker: 'COMING UP',
      title: 'Your classes are piling up in one file. **Modules** are the unit in Python.',
      next: 'Next · Reel 9: Modules & imports',
      narration: 'Your classes are piling up in one file — that won’t scale. Next: modules and imports, Python’s answer to namespaces and using statements. Swipe up.'
    }
  ],

  code: {
    title: '🐍 A typed model for LLM output',
    body:
`from dataclasses import dataclass, field
import json

@dataclass
class Movie:
    title: str
    year: int
    rating: float = 0.0
    genres: list[str] = field(default_factory=list)

    def __post_init__(self):          # runs right after generated __init__
        if not 1888 <= self.year <= 2100:
            raise ValueError(f"year out of range: {self.year}")
        if not 0.0 <= self.rating <= 10.0:
            raise ValueError(f"rating must be 0-10, got {self.rating}")

raw = '{"title": "Dune", "year": 2021, "rating": 8.0, "genres": ["Sci-Fi"]}'
data = json.loads(raw)                 # dict straight from the LLM

movie = Movie(**data)                  # splat the dict into fields (reel 7)
print(movie)                           # Movie(title='Dune', year=2021, ...)
print(movie == Movie(**data))          # True — value equality for free`,
    annot: [
      '<b>@dataclass</b> generates <b>__init__, __repr__, __eq__</b> — the Python cousin of a C# record.',
      '<b>__post_init__</b> runs after the generated __init__ — raise here and construction fails, like a throwing constructor.',
      '<b>field(default_factory=list)</b> — a fresh list per instance. A plain <b>= []</b> would be shared by every object. Classic foot-gun.'
    ]
  },

  recap: [
    '@dataclass writes **init, repr & eq** for free',
    '__post_init__ = constructor-time **validation**',
    'dict → object via **Movie(**data)** splat'
  ],

  quiz: {
    q: 'What does __post_init__ give you in a @dataclass?',
    opts: [
      'It replaces the generated __init__ entirely',
      'A hook that runs right after the generated __init__ — for validation',
      'Automatic JSON serialization to dicts',
      'Runtime enforcement of the declared field types'
    ],
    a: 1,
    why: '@dataclass generates __init__, which then calls __post_init__ if it exists — that’s your constructor-style validation hook. Types are NOT enforced at runtime (that’s Pydantic, reel 15), and serialization is asdict(), never automatic.'
  },

  notes: `
# Classes & dataclasses

## The minimal class
A Python class with no ceremony:

\`class Movie:\` with an \`__init__(self, title, year)\` that assigns \`self.title = title\`. Two things to unlearn from C#: \`__init__\` is not the constructor — the object already exists when it runs — and \`self\` is a real parameter, Python’s explicit \`this\`.

## @dataclass — the record you were promised
Add \`@dataclass\` and declare fields with types; Python generates \`__init__\`, \`__repr__\` (readable printout), and \`__eq__\` (value equality). Defaults live on the field: \`rating: float = 0.0\`. Field order matters: defaults must come after non-defaults, same as C# optional parameters.

## The mutable-default foot-gun
Never this: \`genres: list[str] = []\` — ONE list shared by every instance. Instead:

\`genres: list[str] = field(default_factory=list)\`

\`default_factory\` is a callable invoked per instance — the same shape as a factory lambda in C#.

## __post_init__ — your validation hook
The generated \`__init__\` calls \`__post_init__\` if you define it. Raise \`ValueError\` there and construction fails — exactly like throwing inside a C# constructor. Perfect for guarding LLM output before it spreads through your system.

Critical: dataclasses do **not** type-check. \`Movie(title=123, year="soon")\` constructs happily — annotations are hints, not runtime rules. That gap is precisely why Pydantic exists (reel 15).

## Immutability & serialization
- \`frozen=True\` — immutable after creation and hashable (dict-key safe); assignment raises. ≈ init-only record.
- \`dataclasses.replace(m, year=2022)\` — copy-with-changes, the \`with\` expression of records.
- \`asdict(movie)\` — plain dict for \`json.dumps\`, handy for logging tool results.
- \`slots=True\` (3.10+) — real memory win when you create thousands (agent transcripts, token batches).

## With LLMs in the loop
Dataclasses are the poor man’s structured output: parse the model’s JSON, splat it into a dataclass (reel 7’s \`**kwargs\`), validate in \`__post_init__\`. Pydantic upgrades this same pattern with parsing, coercion, and strict validation — a swap, not a rewrite.

## C# ↔ Python mapping

| C# | Python dataclass |
| --- | --- |
| \`record Movie(string Title, int Year)\` | \`@dataclass class Movie: title: str; year: int\` |
| Primary constructor | generated \`__init__\` |
| \`with\` expression / init-only | \`dataclasses.replace(m, year=2022)\` / \`frozen=True\` |
| \`ToString()\` override | generated \`__repr__\` |
| \`Equals\` / \`GetHashCode\` | generated \`__eq__\` |

> **.NET ↔ Python:** think \`@dataclass\` ≈ C# \`record\` with positional parameters; \`__post_init__\` ≈ constructor validation; \`frozen=True\` ≈ init-only properties. The big difference: Python never enforces declared types at runtime.
`
});
