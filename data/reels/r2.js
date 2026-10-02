/* Reel 2 — Python for the .NET dev — the 10-minute crosswalk (Python · Python for GenAI) */
SS.registerReel({
  id: 'r2', num: 2, section: 'python', block: 'Python for GenAI',
  title: 'Python for the .NET dev — the 10-minute crosswalk',
  hook: 'You already know 80% of Python. **It’s your C# knowledge in disguise.**',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE CROSSWALK',
      title: 'Same concepts. **Half the ceremony.**',
      sub: 'Ten minutes of translation, then you’re productive.',
      narration: 'Here’s the good news: Python is not a new world. Variables, loops, classes, exceptions, LINQ-style transforms — you know all of it. What changes is the spelling. This reel is your crosswalk: C-sharp on the left, Python on the right.'
    },
    {
      type: 'compare',
      cards: [
        { e: '🔷', t: 'C#: declare to use', s: 'string name = "Ada"; var, types up front' },
        { e: '🐍', t: 'Python: just assign', s: 'name = "Ada" — type rides along', win: true }
      ],
      narration: 'First shock: no type declarations. In C-sharp you say string name equals Ada. In Python you say name equals Ada. The type still exists — Python just figures it out at runtime and complains loudly if you break the deal.'
    },
    {
      type: 'list',
      items: [
        { e: '🔁', t: 'Indentation IS the braces', s: 'no curly brackets — blocks by spacing' },
        { e: '🚫', t: 'No semicolons', s: 'one statement per line, that’s it' },
        { e: '📝', t: 'len() not .Length', s: 'functions, not properties, for basics' },
        { e: '🧵', t: 'Strings by quotes', s: "'single' or \"double\" — your choice" }
      ],
      narration: 'Four culture shocks. Indentation is not style — it is the syntax, it replaces the curly brackets. No semicolons. Length is a function, len, not a property. And strings work with single or double quotes, your choice, as long as you match them.'
    },
    {
      type: 'compare',
      cards: [
        { e: '🔷', t: 'C#: collection tricks', s: 'LINQ: Where, Select, FirstOrDefault' },
        { e: '🐍', t: 'Python: comprehensions', s: '[x*2 for x in nums if x > 0]', win: true }
      ],
      narration: 'If you love LINQ, meet comprehensions. Where and Select collapse into one bracketed expression: x times two for x in nums if x greater than zero. Once it clicks — and it will — you’ll miss it in C-sharp.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'Crosswalk done. **Now the four types you’ll use daily.**',
      next: 'Next · Reel 3: Variables & f-strings',
      narration: 'That’s the crosswalk. Same brain, new spelling. Next three reels drill the four shapes you’ll touch daily: variables and strings, dicts and JSON, then lists and comprehensions. Swipe up.'
    }
  ],

  code: {
    title: '🐍 C# → Python, side by side in one file',
    body:
`# The same program in both languages, Python edition.
# Each C# line is the comment; the Python line is the translation.

# var total = 0;   var names = new List<string>();
total = 0
names = []

# names.Add("ada"); names.Add("grace");
names.append("ada")
names.append("grace")

# foreach (var n in names) total += n.Length;
for n in names:
    total += len(n)

# var longNames = names.Where(n => n.Length > 3).ToList();
long_names = [n for n in names if len(n) > 3]

# Console.WriteLine($"Total: {total}, Long: {long_names.Count}");
print(f"Total: {total}, Long: {len(long_names)}")`,
    annot: [
      'Python blocks are <b>indented</b> — the for-loop body is just the deeper lines. No braces, no semicolons.',
      '<b>append</b> is Add, <b>len()</b> is Count or Length, <b>print()</b> is Console.WriteLine. Small vocab, used constantly.',
      'The <b>list comprehension</b> on line 16 replaces Where plus Select plus ToList in one readable expression.'
    ]
  },

  recap: [
    '**Indentation is syntax** — it replaces the curly braces',
    '**len(), print(), append()** — your new daily vocabulary',
    'Comprehensions = **Where + Select in one expression**'
  ],

  quiz: {
    q: 'In Python, what defines a code block (like the body of a for loop)?',
    opts: [
      'Curly brackets { } around the statements',
      'Consistent indentation of the lines',
      'begin/end keywords like Pascal',
      'Semicolons at the end of each line'
    ],
    a: 1,
    why: 'Python uses indentation as syntax. The indented lines under for n in names: form the loop body. It looks like style, but the interpreter enforces it — inconsistent indentation is a syntax error, not a warning.'
  },

  notes: `
# Python for the .NET dev — the 10-minute crosswalk

## The mental model
Python is C-sharp with the ceremony removed — mostly. You keep: variables, control flow, classes, exceptions, generics-thinking. You lose: type declarations, braces, semicolons, properties for everything.

## Syntax crosswalk

| C# | Python | Note |
| --- | --- | --- |
| \`string name = "Ada";\` | \`name = "Ada"\` | Type is inferred, still enforced at runtime |
| \`if (x > 0) { … }\` | \`if x > 0:\` | No parentheses needed, colon required |
| \`for (var i = 0; i < 10; i++)\` | \`for i in range(10):\` | You loop over collections, not counters |
| \`names.Add(x)\` | \`names.append(x)\` | Lists are the default, like List<object> |
| \`list.Count\` / \`arr.Length\` | \`len(list)\` | A function, not a property |
| \`Console.WriteLine($"...")\` | \`print(f"...")\` | f-strings interpolate with braces |
| \`x == null\` | \`x is None\` | None, not null; use \`is\` |

## LINQ → comprehensions

| LINQ | Comprehension |
| --- | --- |
| \`nums.Where(n => n > 0)\` | \`[n for n in nums if n > 0]\` |
| \`nums.Select(n => n * 2)\` | \`[n * 2 for n in nums]\` |
| \`Where(...).Select(...)\` | \`[n * 2 for n in nums if n > 0]\` |
| \`dict.ToDictionary(k => k, v => v*2)\` | \`{k: v * 2 for k, v in pairs}\` |

> **.NET ↔ Python:** A Python list is closer to \`List<object>\` than \`List<string>\` — it happily holds mixed types. That's a feature for gluing JSON, a hazard for business logic. When you need discipline, reach for dataclasses (reel 8) and Pydantic (reel 15), not type declarations everywhere.

## Things that will trip you (once each)
- **Off-by-one is gone**: \`range(10)\` is 0–9, and slices like \`s[1:4]\` exclude the end. Same as C# actually — the syntax just looks suspicious.
- **Strings are immutable** in both languages; \`s.ToUpper()\` becomes \`s.upper()\`.
- **Everything is an object** — \`len\` works on strings, lists, dicts, and tuples.

Reel 3 starts the drill: variables and f-strings, the two things you’ll type a thousand times a day.
`
});
