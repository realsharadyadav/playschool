/* Reel 4 — dicts & JSON — the language of LLM APIs (Python · Python for GenAI) */
SS.registerReel({
  id: 'r4', num: 4, section: 'python', block: 'Python for GenAI',
  title: 'dicts & JSON — the language of LLM APIs',
  hook: 'Every LLM request and response **is a dict waiting to happen.**',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE DATA TYPE',
      title: 'The dict is Python’s anonymous object. **And AI’s wire format.**',
      sub: 'JSON in, dict out. Zero mapping code.',
      narration: 'Meet the workhorse. A dict is an unordered, key-to-value map — like a C-sharp dictionary, except it doubles as an anonymous object, a record, and a settings file. And here’s the kicker: LLM APIs speak JSON, and JSON maps one-to-one onto dicts.'
    },
    {
      type: 'diagram',
      nodes: [
        { e: '📨', t: 'Wire: JSON text', s: '{"role": "user"}' },
        { e: '🐍', t: 'json.loads', s: 'text → dict' },
        { e: '🖐️', t: 'd["role"]', s: 'bracket access' },
        { e: '📤', t: 'json.dumps', s: 'dict → text' }
      ],
      narration: 'Watch the round trip. The API sends JSON text. Json-dot-loads parses it into a dict. You read values with square brackets. Json-dot-dumps serializes your answer back to text. That loop is ninety percent of AI plumbing.'
    },
    {
      type: 'compare',
      cards: [
        { e: '🔷', t: 'C#: deserialize to classes', s: 'JsonSerializer + DTOs for every shape' },
        { e: '🐍', t: 'Python: dict, done', s: 'nested dicts, no classes needed', win: true }
      ],
      narration: 'In C-sharp you’d deserialize JSON into typed classes — DTOs, attributes, the works. Python skips that: the JSON becomes nested dicts and lists, and you index straight in. Fast to write. But — when the shape matters, you’ll want real types. Reel fifteen, Pydantic.'
    },
    {
      type: 'list',
      items: [
        { e: '📥', t: 'd["key"]', s: 'brackets; missing key = KeyError' },
        { e: '🛡️', t: 'd.get("key")', s: 'returns None, never explodes' },
        { e: '🚪', t: 'd.get(k, default)', s: 'supply your own fallback' },
        { e: '➕', t: 'd["new"] = 1', s: 'insert or overwrite, same syntax' }
      ],
      narration: 'Four moves. Square brackets read a value but throw on a missing key. Dot-get returns None instead — safe for optional API fields. Dot-get with a default gives you your own fallback. And assignment inserts or overwrites; same syntax either way.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'Maps mastered. **Now the ordered workhorse: lists.**',
      next: 'Next · Reel 5: Lists & comprehensions',
      narration: 'That’s the dict — the single most important structure in AI work. Next, its ordered cousin: lists, plus the comprehension syntax that makes them sing. Reel five, swipe up.'
    }
  ],

  code: {
    title: '🐍 JSON ↔ dict round trip',
    body:
`import json

# What the LLM API actually sends back (truncated, real shape)
raw = '{"id": "chat-42", "model": "gpt-4o", "usage": {"total_tokens": 183}}'

msg = json.loads(raw)              # JSON text -> dict
print(msg["model"])                # -> gpt-4o
print(msg["usage"]["total_tokens"])  # -> 183

# .get() survives missing keys — APIs love optional fields
cost = msg.get("cost", 0.0)        # -> 0.0, no KeyError

# Build the NEXT request as a dict, ship it as JSON
req = {"model": msg["model"], "stream": False}
req["messages"] = [{"role": "user", "content": "hi"}]
wire = json.dumps(req, indent=2)   # dict -> pretty JSON text
print(wire)`,
    annot: [
      '<b>json.loads / json.dumps</b> are the only two functions you need — text to dict, dict to text.',
      'Nested access is just <b>chains of brackets</b>: usage → total_tokens. No mapping classes anywhere.',
      '<b>.get(key, default)</b> is the defensive read — APIs add and drop optional fields constantly.'
    ]
  },

  recap: [
    'JSON text ↔ dict via <b>**json.loads / json.dumps**</b>',
    'Read with <b>d["k"]</b>, defensively with <b>d.get(k, default)</b>',
    'dicts are flexible — **typed models come in reel 15**'
  ],

  quiz: {
    q: 'resp = json.loads(text) gave you a dict, but "cost" may be absent. Which read never crashes?',
    opts: [
      'resp["cost"]',
      'resp.cost',
      'resp.get("cost", 0.0)',
      'json.dumps(resp, "cost")'
    ],
    a: 2,
    why: 'Bracket access throws KeyError on a missing key; Python has no .cost property access on dicts. .get("cost", 0.0) returns 0.0 when absent — the standard defensive pattern for APIs with optional fields.'
  },

  notes: `
# dicts & JSON — the language of LLM APIs

## What a dict is
A \`dict\` maps hashable keys (usually strings) to values. Think \`Dictionary<string, object>\`, except the literal syntax is gorgeous:

\`\`\`
msg = {"role": "user", "content": "hi", "tokens": 12}
\`\`\`

Keys are strings, values are anything — including other dicts and lists. JSON is a subset of Python literals, which is why the mapping is nearly free.

## The API round trip

| Direction | Function | Example |
| --- | --- | --- |
| JSON text → dict | \`json.loads(text)\` | parsing responses |
| dict → JSON text | \`json.dumps(d)\` | building requests |
| File → dict | \`json.load(f)\` | config files |
| dict → file | \`json.dump(d, f)\` | writing results |

## Access patterns

| Pattern | Behavior | Use when |
| --- | --- | --- |
| \`d["cost"]\` | \`KeyError\` if missing | key is guaranteed |
| \`d.get("cost")\` | \`None\` if missing | optional field |
| \`d.get("cost", 0.0)\` | your default if missing | optional with sensible fallback |
| \`d.setdefault("tags", [])\` | get, or set+return default | one-liner initialization |
| \`d.keys() / d.values() / d.items()\` | views for looping | iteration |

## Where dicts appear in AI work
- **Requests**: \`{"model": ..., "messages": [...], "temperature": ...}\`
- **Responses**: \`choices[0].message.content\` — a three-level dict dive
- **Tool calls**: arguments arrive as a JSON string → dict (reel 7)
- **RAG records**: \`{"id": ..., "embedding": [...], "text": ...}\`

> **.NET ↔ Python:** In C#, reading \`choices[0].message.content\` without types would be \`dynamic\` — slow and fragile. Python dicts are native and fast, but the same fragility applies: a renamed field becomes a runtime error. That trade-off is why reel 15 introduces Pydantic models for anything that crosses a trust boundary.

## Gotchas
- \`json.loads\` on \`None\` or an empty string raises — check before parsing.
- Dicts preserve insertion order (3.7+), but that's ordering, not sorting.
- \`copy = d\` aliases the same dict; use \`dict(d)\` or \`copy.deepcopy\` for real copies.

Next: reel 5 — lists and comprehensions, the other half of every JSON payload.
`
});
