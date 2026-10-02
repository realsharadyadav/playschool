/* Reel 5 — Lists & comprehensions (Python · Python for GenAI) */
SS.registerReel({
  id: 'r5', num: 5, section: 'python', block: 'Python for GenAI',
  title: 'Lists & comprehensions',
  hook: 'Python’s list makes **Where + Select + ToList** look bloated.',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE WORKHORSE',
      title: 'One type for arrays, lists, and queues: **list.**',
      sub: 'Ordered, growable, mixed-type. The default everywhere.',
      narration: 'Python has one sequence you’ll use constantly: the list. It replaces array, list, and queue from C-sharp — ordered, growable, and happy to mix types. Square brackets to create, append to grow, index to read. That’s ninety percent of it.'
    },
    {
      type: 'list',
      items: [
        { e: '🔢', t: 'nums = [1, 2, 3]', s: 'create, index, slice: nums[1:]' },
        { e: '➕', t: 'append / extend / +', s: 'grow one item or many' },
        { e: '🗂️', t: 'len / in / sorted', s: 'count, membership, sorting' },
        { e: '🧩', t: 'Mixed types OK', s: '[1, "two", 3.0] is legal' }
      ],
      narration: 'The core operations. Create with brackets, slice with a colon — nums one-colon returns everything after index zero. Append grows by one, extend by many, and plus concatenates. Len counts, the in-keyword checks membership, sorted returns a new sorted copy.'
    },
    {
      type: 'compare',
      cards: [
        { e: '🔷', t: 'C#: three LINQ calls', s: 'Where(n => n > 0).Select(n => n*2).ToList()' },
        { e: '🐍', t: 'Python: one comprehension', s: '[n * 2 for n in nums if n > 0]', win: true }
      ],
      narration: 'Now the killer feature. Filtering and mapping in C-sharp takes a Where, a Select, and a ToList. The comprehension does all three in one bracketed line: n times two, for n in nums, if n greater than zero. Read it left to right; it reads like the spec.'
    },
    {
      type: 'chat',
      bubbles: [
        { who: 'you', text: 'Extract all file names from this JSON' },
        { who: 'bot', text: 'files = [f["name"] for f in resp["files"]]' },
        { who: 'bot', text: 'Done — 12 names, one line.' }
      ],
      narration: 'This is not a toy. An LLM returns a JSON blob with a files array, and you need the names. One comprehension: f bracket-name, for f in response bracket-files. You will write this line, or its twin, in nearly every AI script.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'Data nailed down. **Time to make it do things.**',
      next: 'Next · Reel 6: Functions — your first tool',
      narration: 'Lists and comprehensions: done. Next, the thing that makes Python executable — functions. And here’s the twist: a function is already a tool an LLM can call. Reel six, swipe up.'
    }
  ],

  code: {
    title: '🐍 Lists & comprehensions in real use',
    body:
`# The AI-flavored version: what you'll actually write daily
resp = {
    "choices": [
        {"text": "Paris", "score": 0.91},
        {"text": "Lyon",  "score": 0.04},
        {"text": "Nice",  "score": 0.03},
    ]
}

# Comprehension = Select over a nested structure
cities = [c["text"] for c in resp["choices"]]

# Comprehension = Where + Select
confident = [c["text"] for c in resp["choices"] if c["score"] > 0.5]

# sorted with a key function — no IComparer ceremony
top = sorted(resp["choices"], key=lambda c: c["score"], reverse=True)

print(cities)     # ['Paris', 'Lyon', 'Nice']
print(confident)  # ['Paris']
print(top[0]["text"], top[0]["score"])`,
    annot: [
      'Comprehensions read as <b>[expression for item in source if condition]</b> — Select, From, Where in one line.',
      '<b>sorted(..., key=...)</b> takes any function — the lambda replaces a whole IComparer class.',
      'Slicing (<b>[1:]</b>, <b>[:-1]</b>, <b>[::2]</b>) covers Substring/Take/Skip without method chains.'
    ]
  },

  recap: [
    'One <b>list</b> type: ordered, growable, mixed-type',
    'Comprehension = <b>Where + Select + ToList</b> in one line',
    '<b>sorted(key=...)</b> replaces IComparer ceremony'
  ],

  quiz: {
    q: 'nums = [3, -1, 4, -2]. What is [n * n for n in nums if n > 0]?',
    opts: [
      '[9, 1, 16, 4]',
      '[9, 16]',
      '[9, -1, 16, -2]',
      '[3, 4]'
    ],
    a: 1,
    why: 'The if filter keeps only positives (3, 4), and n * n maps them to squares (9, 16). Comprehensions filter first, then map — same order as Where(...).Select(...) in LINQ.'
  },

  notes: `
# Lists & comprehensions

## The list
\`nums = [1, 2, 3]\` creates an ordered, mutable sequence. No \`new\`, no type argument, no capacity.

| You want | You write |
| --- | --- |
| Last element | \`nums[-1]\` (negative indexes count from the end) |
| First two | \`nums[:2]\` |
| Everything but the first | \`nums[1:]\` |
| Every second item | \`nums[::2]\` |
| Membership | \`if x in nums\` |
| Sort in place / new copy | \`nums.sort()\` / \`sorted(nums)\` |

> **.NET ↔ Python:** A Python list is \`List<object>\` with nicer syntax. Mixed types are legal: \`[1, "two", None]\`. Great for gluing JSON; risky for domain logic. When everything must be the same shape, that's a signal to model it (reel 8).

## Comprehensions — the syntax you'll type most

| LINQ | Comprehension |
| --- | --- |
| \`xs.Select(x => x.Name)\` | \`[x["name"] for x in xs]\` |
| \`xs.Where(x => x.Score > .5)\` | \`[x for x in xs if x["score"] > .5]\` |
| \`Where + Select\` | \`[x["name"] for x in xs if x["score"] > .5]\` |
| \`ToDictionary(k, v)\` | \`{x["id"]: x for x in xs}\` |
| Nested: flatten | \`[c for r in rows for c in r]\` |

## The AI script pattern
An LLM response is dicts and lists. The extraction dance:

\`\`\`
chunks  = [m["content"] for m in resp["choices"]]
scores  = [m["score"] for m in matches if m["score"] > 0.7]
best    = max(matches, key=lambda m: m["score"])
\`\`\`

## Performance honesty
- Comprehensions are fast — faster than an explicit for-loop with append.
- For huge datasets or vector math, lists are the wrong tool: NumPy arrays (C-speed, reel 18 territory) or pandas (reel 17) do it in bulk.
- \`list + list\` copies both into a new list — fine small, wasteful big.

## Gotchas
- \`copy = nums\` aliases! Use \`nums[:]\` or \`list(nums)\` for a shallow copy.
- Sorting dicts? \`sorted(xs, key=lambda x: x["score"])\` — the lambda is the comparer.
- Default empty list argument \`def f(items=[])\` is shared across calls — use \`items=None\` (reel 6).

Next: reel 6 — functions, and why a Python function is already an LLM-callable tool.
`
});
