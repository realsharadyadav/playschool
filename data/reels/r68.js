/* Reel 68 — The N×M problem (Agentic AI · MCP) */
SS.registerReel({
  id: 'r68', num: 68, section: 'agentic', block: 'MCP',
  title: 'The N×M problem',
  hook: 'Every AI app × every tool = **integration hell**. There’s a standard now.',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE PROBLEM',
      title: 'N apps × M tools = **N×M integrations**',
      sub: 'And every single one is bespoke glue code.',
      narration: 'Say you build three AI apps — a chatbot, an IDE assistant, an agent. And you want them to reach five tools. That is not five integrations. It is fifteen — each one hand-written, hand-maintained.'
    },
    {
      type: 'diagram',
      nodes: [
        { e: '🧠', t: 'N LLM apps', s: 'chatbot · IDE · agent' },
        { e: '🧩', t: 'N × M adapters', s: 'every pair, bespoke' },
        { e: '🧰', t: 'M tools', s: 'Slack · Jira · GitHub…' }
      ],
      linkLabel: 'hand-written glue',
      narration: 'Every app talks to every tool through its own adapter — different auth, different schema format, different quirks. Change one side, and the glue breaks. Now multiply that by every pair.'
    },
    {
      type: 'chat',
      bubbles: [
        { who: 'you', text: 'OpenAI changed the function-call format.' },
        { who: 'bot', text: 'Patching the adapters…', tool: '9 adapters · tests pending' },
        { who: 'you', text: 'Slack moved to granular scopes too.' },
        { who: 'bot', text: 'That’s 6 more. Q3 estimate: 3 weeks.', tool: 'scope drift × schema drift' }
      ],
      narration: 'Then reality hits. OpenAI tweaks its function-calling format — you patch nine adapters. Slack changes its scopes — six more. Your roadmap quietly becomes adapter maintenance.'
    },
    {
      type: 'list',
      items: [
        { e: '🔀', t: 'Schema drift', s: 'every vendor shapes tool JSON differently' },
        { e: '🔑', t: 'Auth sprawl', s: 'OAuth, tokens, keys — per connector' },
        { e: '🧪', t: 'Test matrix', s: 'every pair needs its own tests' },
        { e: '🐢', t: 'Slow shipping', s: 'new tool? N adapters to write first' }
      ],
      narration: 'The pain has names. Schema drift — every vendor serializes tools differently. Auth sprawl. A test matrix that never shrinks. And every new tool means N new adapters before anyone can use it.'
    },
    {
      type: 'bigtext', kicker: 'THE INSIGHT',
      title: 'You don’t need N×M adapters. You need a **standard port**.',
      sub: 'One protocol every app and every tool can speak.',
      narration: 'Here’s the insight that fixes it. You do not need N times M adapters. You need one standard port — like USB-C — that every app and every tool can speak. That protocol is MCP.'
    },
    {
      type: 'bridge', kicker: 'COMING UP',
      title: 'MCP — the **USB-C for AI**. What it actually standardizes.',
      next: 'Swipe up · Reel 69: MCP: USB-C for AI',
      narration: 'It’s called the Model Context Protocol — MCP. Next reel: what it actually standardizes, beyond the catchy analogy. Spoiler — it is concrete, and it is boring. Boring is good.'
    }
  ],

  code: {
    title: '🐍 Counting the explosion',
    body:
`# Without a protocol: every app × every tool = bespoke glue
from dataclasses import dataclass

@dataclass
class App:                  # an LLM host: chatbot, IDE, agent…
    name: str
    schema_format: str      # "openai.tools" | "anthropic.tools" | …

@dataclass
class Tool:                 # a capability: Slack, Jira, GitHub…
    name: str
    api: str

APPS  = [App("assistant", "openai.tools"),
         App("ide", "anthropic.tools"),
         App("agent", "gemini.function_declarations")]
TOOLS = [Tool("slack", "web-api"),
         Tool("jira", "rest/v3"),
         Tool("github", "rest")]

adapters = {(a.name, t.name): f"{t.api} -> {a.schema_format}"
            for a in APPS for t in TOOLS}   # every PAIR, bespoke
print(len(adapters), "adapters to build & babysit")   # 9`,
    annot: [
      'Each <b>(app, tool) pair</b> is its own adapter — the N×M explosion, literally counted here.',
      'The killer is schema shape: OpenAI, Anthropic and Gemini all format tool JSON differently.',
      'MCP collapses this to <b>N + M</b> — one client per app, one server per tool.'
    ]
  },

  recap: [
    'N apps × M tools = **N×M adapters**',
    'Schema & auth drift make glue **rot fast**',
    'One standard port beats a **cable per pair**'
  ],

  quiz: {
    q: 'Why does the N×M problem get worse over time?',
    opts: [
      'Each vendor keeps its tool schema stable forever',
      'Both sides keep changing — schemas, auth, APIs — so glue rots',
      'LLMs refuse to call tools built for other vendors',
      'Adapters compile to different CPU architectures'
    ],
    a: 1,
    why: 'Maintenance compounds: every time a vendor revises its function-calling schema or an API changes auth, every adapter for that pair needs a patch. A standard protocol absorbs that churn in one place instead of N×M.'
  },

  notes: `
# The N×M problem

## The math nobody budgets for
Your org builds N LLM-powered apps: a support chatbot, an IDE assistant, a reporting agent. The business wants those apps to reach M tools: Slack, Jira, GitHub, SQL Server, email. Without a protocol, every (app, tool) pair needs its own adapter — auth handling, schema translation, error mapping, tests. That is **N×M pieces of glue**.

|  | Chatbot | IDE assistant | Agent |
|---|---|---|---|
| Slack | adapter | adapter | adapter |
| Jira | adapter | adapter | adapter |
| SQL Server | adapter | adapter | adapter |

Three apps × three tools = nine adapters. Now watch what happens when the CFO asks for a fourth tool.

## Why each adapter is genuinely bespoke
- **Schema formats differ**: OpenAI wants a \`tools\` array with \`parameters\` (JSON Schema); Anthropic emits \`tool_use\` content blocks; Gemini speaks \`functionDeclarations\`. Same function, three serializations.
- **Auth differs**: OAuth user-consent flows vs. personal access tokens vs. connection strings — each connector re-implements them.
- **Semantics differ**: pagination, rate limits, retries — the resilient-HTTP patterns from reels 11 and 14 get re-implemented N times, badly.

## The drift multiplier
Adapters rot. Vendors revise function-calling formats; SaaS APIs add scopes and deprecate endpoints. Every upstream change forces M patches (one per app) or N patches (one per tool), and your roadmap quietly becomes integration maintenance. You have seen this movie: it is point-to-point ESB spaghetti from the 2000s, rerun with LLMs.

## Prior art — and why it fell short
- **Plugins** (ChatGPT-style): one host, closed ecosystem — doesn't help your own apps.
- **iPaaS** (Zapier-style): human-triggered workflows, not model-chosen tool calls.
- **Framework toolkits** (LangChain integrations): lock you to one framework; the N×M count just moves, it doesn't shrink.

## The fix, previewed
MCP collapses N×M into **N + M**: each app implements one client, each tool ships one server, and the protocol between them is fixed and versioned. Reels 69–70 cover what it standardizes and how it's architected.

> **.NET note:** same logic as \`HttpClient\` + a shared API contract replacing per-service generated proxies — one typed client factory beats fifteen bespoke service references.
`
});
