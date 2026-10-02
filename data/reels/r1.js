/* Reel 1 — Why Python runs the AI world (Python · Python for GenAI) */
SS.registerReel({
  id: 'r1', num: 1, section: 'python', block: 'Python for GenAI',
  title: 'Why Python runs the AI world',
  hook: 'C# runs your business logic. **Python runs the AI.** Here’s why.',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE LANDSCAPE',
      title: 'Your .NET stack ships the product. **But every LLM ships Python-first.**',
      sub: 'New models land with Python SDKs on day zero.',
      narration: 'Reality check: your billing, your APIs, your SQL Server — all .NET, and that stays. But every serious AI library, every model demo, every research paper ships Python first. Here’s why that happened.'
    },
    {
      type: 'compare',
      cards: [
        { e: '🔷', t: 'C#: built for big teams', s: 'static types, LINQ, million-line codebases' },
        { e: '🐍', t: 'Python: speed of thought', s: 'dynamic, readable, lives where AI lives', win: true }
      ],
      narration: 'C-sharp is engineered for million-line codebases — static types, LINQ, tooling for large teams. Python optimizes for something else: how fast a researcher goes from idea to experiment. AI is a research field, so Python won by default.'
    },
    {
      type: 'diagram',
      nodes: [
        { e: '🚀', t: 'Model drops', s: 'weights + tokenizer + paper' },
        { e: '🐍', t: 'Day zero: Python', s: 'pip install, notebook demo' },
        { e: '🕐', t: 'Weeks later: .NET', s: 'community SDK, if ever' },
        { e: '🧩', t: 'The fix: interop', s: 'Python at the AI edge' }
      ],
      narration: 'Watch a model release. Day zero brings weights, a tokenizer, and a Python notebook. The C-sharp SDK arrives weeks later — if it arrives at all. So you either wait, or you put a thin Python layer at the AI edge.'
    },
    {
      type: 'list',
      items: [
        { e: '📓', t: 'Notebooks', s: 'code + graphs + prose in one file' },
        { e: '🔗', t: 'Glue syntax', s: 'dicts and lists flex to any JSON' },
        { e: '⚡', t: 'C-speed kernels', s: 'NumPy, PyTorch do the real work' },
        { e: '👥', t: 'Community', s: 'an answer for every error message' }
      ],
      narration: 'Four reasons Python stuck. Notebooks mix code, output, and prose in one file — perfect for experiments. The syntax glues JSON together without ceremony. And the heavy lifting is C underneath: NumPy, PyTorch. Python is just the steering wheel.'
    },
    {
      type: 'bridge', kicker: 'THE MOVE',
      title: 'Keep .NET for the app. **Add Python where the AI lives.**',
      next: 'Next · Reel 2: The 10-minute crosswalk',
      narration: 'The move is not rewriting your stack. Keep dotnet for the app; add Python where the AI lives — embeddings, prompts, agents. Reel two is your ten-minute crosswalk from C-sharp to Python. Swipe up.'
    }
  ],

  code: {
    title: '🐍 Your first LLM call, Python-style',
    body:
`import json
import httpx

# Any OpenAI-compatible endpoint works: Ollama, vLLM, the real OpenAI API
resp = httpx.post(
    "http://localhost:11434/v1/chat/completions",
    json={
        "model": "llama3.1",
        "messages": [{"role": "user", "content": "Say hi in five words"}],
    },
    timeout=60,
)
msg = resp.json()["choices"][0]["message"]["content"]
print(msg)

# Python glues JSON without ceremony: the payload is just a dict
payload = {"model": "llama3.1", "stream": False}
payload["temperature"] = 0.2        # add a key any time — no class needed
payload["messages"] = [{"role": "user", "content": "hi"}]
print(json.dumps(payload, indent=2))`,
    annot: [
      '<b>httpx.post(json=…)</b> sends a dict straight as JSON — no serializers, no DTOs, no attributes.',
      'The response is a plain <b>nested dict</b>: choices, zero, message, content. No generated client classes.',
      'Adding <b>"temperature"</b> to the payload is one line — this flexibility is why AI tooling lives in Python.'
    ]
  },

  recap: [
    '**Python SDKs land day zero** for every new model',
    'Heavy lifting is C — **Python is the steering wheel**',
    'Add Python at the AI edge, **keep .NET for the app**'
  ],

  quiz: {
    q: 'A brand-new LLM just dropped. Where do you realistically find a working client library on day one?',
    opts: [
      'In the official .NET SDK, released the same day',
      'In the official Python SDK — and usually nowhere else',
      'Only as a compiled Windows DLL',
      'In SQL Server Machine Learning Services'
    ],
    a: 1,
    why: 'Model releases are Python-first: weights, tokenizer, and a notebook demo ship together. .NET SDKs, when they exist, arrive weeks later via the community. That asymmetry is exactly why a Python layer at the AI edge is the pragmatic move.'
  },

  notes: `
# Why Python runs the AI world

## The uncomfortable truth
The AI ecosystem does not care about your preferred stack. When a lab releases a model, the artifacts are: weights, a tokenizer, a paper, and a Python reference implementation. That's the whole product. Everything else — including every .NET client you've used — is a port that lags behind.

## Why Python won the research world
- **Notebooks**: a researcher mixes code, charts, and prose in one `.ipynb` file. The feedback loop from idea to graph is seconds, not a build cycle.
- **Glue syntax**: LLM APIs speak JSON. Python's dicts and lists are practically native JSON — no serializers, no DTOs, no attributes.
- **C underneath**: NumPy, PyTorch, and tokenizers are C/C++/Rust kernels. Python is the steering wheel on a C engine.
- **Community density**: every error message in every AI library has a Stack Overflow answer.

## What this means for a .NET team

| Layer | Best tool | Why |
| --- | --- | --- |
| Business logic, APIs, auth | C# / ASP.NET | Your existing strength |
| LLM calls, embeddings, agents | Python | SDK availability, ecosystem |
| Glue between the two | HTTP or message queue | Clean boundary, no shared state |

> **.NET ↔ Python:** Think of it like this — you wouldn't write your web frontend in T-SQL just because the data lives there. Same logic: don't force .NET to be an AI client library. Keep the boundary at HTTP/JSON and both sides stay simple. Reels 11 and 13 show the calling convention and the secrets handling for that boundary.

## The interop menu (when you need it)
- **HTTP boundary**: Python FastAPI microservice next to your ASP.NET app. Simplest, most robust.
- **Python.NET**: embed a Python runtime inside a .NET process. Works, but deployment gets spicy.
- **Azure Functions / containers**: run Python workers that your .NET orchestrator triggers.

## Common objections
- "Dynamic typing will burn us." — At the AI edge your surface is one JSON payload in, one out. Pydantic (reel 15) adds the validation you're missing.
- "We'd have to rewrite everything." — No. You add one thin Python layer; 95% of your system stays untouched.

Next: reel 2 gives you the full C-sharp-to-Python crosswalk in ten minutes.
`
});
