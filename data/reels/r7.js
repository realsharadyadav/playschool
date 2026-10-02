/* Reel 7 — *args & **kwargs — how tool-call arguments arrive (Python · Python for GenAI) */
SS.registerReel({
  id: 'r7', num: 7, section: 'python', block: 'Python for GenAI',
  title: '*args & **kwargs — how tool-call arguments arrive',
  hook: 'The LLM just called your tool — **here’s how the arguments arrive**.',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE PROBLEM',
      title: 'The LLM called your tool — **but where do the arguments land?**',
      sub: 'A JSON string goes in. Clean named parameters come out.',
      narration: 'Here’s the thing — when an LLM calls your tool, it doesn’t pass neat C-sharp parameters. It emits a name and a JSON blob of arguments. Today you’ll catch that blob with star-args and double-star kwargs.'
    },
    {
      type: 'diagram',
      nodes: [
        { e: '📞', t: 'LLM emits', s: 'name + JSON string' },
        { e: '🧾', t: 'json.loads', s: 'arguments → dict' },
        { e: '🎯', t: '**kwargs', s: 'dict splatted in' },
        { e: '⚙️', t: 'your function', s: 'city="Paris"' }
      ],
      narration: 'Watch the pipeline. The model emits get-weather plus a JSON string. Python parses it into a dict. Double-star splats that dict into your named parameters. Your function never sees the wire format.'
    },
    {
      type: 'compare',
      cards: [
        { e: '🟣', t: 'C#: params object[]', s: 'extra positionals boxed into one array' },
        { e: '🐍', t: 'Python: *args / **kwargs', s: 'tuple + dict — idiomatic everywhere', win: true }
      ],
      narration: 'If you know C-sharp’s params object array, star-args is the same trick — extra positionals packed into one tuple. Double-star kwargs is its named cousin: a catch-all dictionary. Python uses both everywhere.'
    },
    {
      type: 'chat',
      bubbles: [
        { who: 'you', text: 'Weather in Paris?' },
        { who: 'bot', text: 'get_weather', tool: '{"city": "Paris", "units": "celsius"}' },
        { who: 'bot', text: 'Paris: 21 degrees, clear skies' }
      ],
      narration: 'Real conversation. You ask for the weather in Paris. The model doesn’t answer — it requests a tool call: get-weather, city Paris, units celsius. Your job: execute it and return the result.'
    },
    {
      type: 'list',
      items: [
        { e: '📦', t: '*args → tuple', s: 'positional catch-all ≈ params object[]' },
        { e: '🏷️', t: '**kwargs → dict', s: 'named catch-all, key → value' },
        { e: '🧨', t: '** also explodes', s: 'fn(**dict) splats back out' },
        { e: '🚦', t: 'Dispatcher', s: 'TOOLS[name](**args), no if-chains' }
      ],
      narration: 'Four shapes. Star-args scoops positionals into a tuple — like params object array. Double-star kwargs scoops names into a dict. Double-star also explodes a dict back into arguments. A dispatcher routes any call to the right handler.'
    },
    {
      type: 'bridge', kicker: 'COMING UP',
      title: 'This dispatcher is the seed of **every agent framework**. But tools need structure first.',
      next: 'Next · Reel 8: Classes & dataclasses',
      narration: 'This dispatcher is the seed of every agent framework you’ll meet in reel fifty-two. But first, your tools need structure — classes and dataclasses are next. Swipe up.'
    }
  ],

  code: {
    title: '🐍 Tool-call dispatcher with **kwargs',
    body:
`import json

# An OpenAI-style tool call arrives as a name + JSON-string arguments
def get_weather(city, units="celsius"):
    return f"{city}: 21 degrees {units}"

def get_time(city):
    return f"{city}: 14:32 local time"

TOOLS = {"get_weather": get_weather, "get_time": get_time}

def handle_tool(call):
    """Route one LLM tool call to the right function."""
    fn = TOOLS[call["name"]]              # lookup by tool name
    args = json.loads(call["arguments"])  # JSON string -> dict
    return fn(**args)                     # dict -> named parameters

raw = {"name": "get_weather",
       "arguments": '{"city": "Paris", "units": "celsius"}'}
print(handle_tool(raw))                   # -> Paris: 21 degrees celsius`,
    annot: [
      '<b>tool_call.arguments is a JSON string</b>, not a dict — <b>json.loads</b> is always step one.',
      '<b>**args</b> splats a dict into named parameters — the mirror image of collecting **kwargs.',
      '<b>TOOLS = {...}</b> is a dispatch table — like Dictionary&lt;string, Func&lt;...&gt;&gt;, no if-chains.'
    ]
  },

  recap: [
    '**`*args`** = positional catch-all (≈ params object[])',
    '**`**kwargs`** = named catch-all as a dict',
    'json.loads, then **fn(**args)** runs the tool'
  ],

  quiz: {
    q: 'An OpenAI tool call arrives as name="get_weather" plus arguments=\'{"city":"Paris"}\'. Inside your handler, the arguments are…',
    opts: [
      'Already a Python dict — pass them straight through',
      'A JSON string your code must json.loads into a dict',
      'A ready-made dataclass instance',
      'Keyword-only function parameters'
    ],
    a: 1,
    why: 'tool_call.arguments is a JSON string on the wire. json.loads turns it into a dict, and fn(**args) splats that dict into named parameters — the exact bridge this reel is about.'
  },

  notes: `
# *args & **kwargs — how tool-call arguments arrive

## The wire format nobody shows you
When an LLM decides to call a tool, the API hands you a structure with two fields:
- \`name\` — which tool: \`"get_weather"\`
- \`arguments\` — a **JSON string**: \`'{"city": "Paris", "units": "celsius"}'\`

Not a dictionary. A string. Your first job is always \`json.loads\`.

## \`*args\` — the positional sponge
\`def f(*args)\` collects every extra positional argument into a \`tuple\`. Same mechanism as C#’s \`params object[]\`, except it’s idiomatic everywhere in Python rather than a corner-case feature.

## \`**kwargs\` — the named sponge
\`def f(**kwargs)\` collects every extra **named** argument into a \`dict\`. And the operator works in both directions:
- In a **definition**: \`def f(**kwargs)\` — collect names into a dict.
- In a **call**: \`f(**some_dict)\` — splat. Every key becomes a parameter name.

That double use is the trick behind one-line tool dispatch: \`TOOLS[name](**json.loads(arguments))\`.

## Why this is the agentic building block
The OpenAI SDK, LangGraph, and MCP servers (reels 52 and 72) all perform some version of this dispatch. Understand \`**kwargs\` and you understand half of function calling.

## Signature rules worth memorizing
Parameter order is fixed: \`def f(a, *args, **kwargs)\` — normal params first, then \`*args\`, then \`**kwargs\`. You can also force keyword-only parameters with a bare star: \`def f(a, *, city)\` — everything after the \`*\` must be passed by name. That’s a great way to write self-documenting tool signatures.

## C# ↔ Python parameter mapping

| C# | Python | What you get |
| --- | --- | --- |
| \`void F(params object[] a)\` | \`def f(*a)\` | \`tuple\` of extra positionals |
| Named args into \`Dictionary<string, object>\` | \`def f(**kw)\` | \`dict\` of name → value |
| \`F(city: "Paris")\` at the call site | \`f(city="Paris")\` | Bound named parameter |
| No native splat operator | \`f(**cfg)\` | Dict exploded into parameters |

> **.NET ↔ Python:** \`*args\` ≈ \`params object[]\`; \`**kwargs\` ≈ collecting named arguments into a \`Dictionary<string, object>\`. C# has no built-in splat — \`f(**cfg)\` is the Python move you’d hand-roll with reflection or explicit named arguments in C#.

## Gotchas that bite in production
- \`arguments\` is a JSON **string**, not a dict — \`json.loads\` first, always.
- Duplicate names: \`f(city="A", **{"city": "B"})\` raises \`TypeError\`. Merge dicts explicitly before splatting.
- Mutable default: \`def f(items=[])\` shares ONE list across calls — use \`items=None\` and create the list inside.
- A \`**kwargs\` in the middle of a signature kills readability; keep the canonical order.

Reel 8 turns these raw dicts into typed objects; reel 15 replaces the manual parsing with Pydantic.
`
});
