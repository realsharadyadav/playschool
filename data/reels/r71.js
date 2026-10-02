/* Reel 71 — Tools, resources & prompts (Agentic AI · MCP) */
SS.registerReel({
  id: 'r71', num: 71, section: 'agentic', block: 'MCP',
  title: 'Tools, resources & prompts',
  hook: 'Three primitives, three different **bosses**. Here’s how to tell them apart.',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE VOCABULARY',
      title: '**Tools**, **resources**, **prompts** — a server’s whole vocabulary',
      sub: 'They look similar on a slide. They are not.',
      narration: 'Everything a server can offer is one of three primitives. They look similar on a slide — name, description, schema. But who chooses them is completely different, and that changes how you design each one.'
    },
    {
      type: 'list',
      items: [
        { e: '🛠️', t: 'Tools', s: 'the MODEL picks & calls them' },
        { e: '📄', t: 'Resources', s: 'the APP attaches context' },
        { e: '💬', t: 'Prompts', s: 'the USER selects a template' }
      ],
      narration: 'Rule of thumb. Tools: the model decides when to call them — that is function calling from reel fifty-two. Resources: the application attaches them as context, like a file path. Prompts: the user picks a template from a menu.'
    },
    {
      type: 'chat',
      bubbles: [
        { who: 'you', text: 'What did I note about the Q3 budget?' },
        { who: 'bot', text: 'Checking your notes…', tool: 'list_notes(tag="budget")' },
        { who: 'bot', text: 'One note: “Q3 budget cut 12% — see email.”' }
      ],
      narration: 'Watch a tool at work. “What did I note about the Q3 budget?” The model picks list_notes, fills tag with “budget” — the host validates it against the JSON Schema — and the server runs it.'
    },
    {
      type: 'bigtext', kicker: 'PRIMITIVE 2',
      title: 'Resources are **addressable data**: notes://recent',
      sub: 'URIs the app can attach before the model ever speaks.',
      narration: 'Primitive two: resources. Think data with a URI — notes colon slash slash recent, postgres colon slash slash tables. The host attaches them to context; the model reads but never executes. No side effects.'
    },
    {
      type: 'list',
      items: [
        { e: '🔍', t: 'list_tools()', s: 'what can the model call?' },
        { e: '📚', t: 'list_resources()', s: 'what context exists?' },
        { e: '💬', t: 'list_prompts()', s: 'what templates ship?' },
        { e: '🧩', t: 'get_prompt()', s: 'render one with arguments' }
      ],
      narration: 'None of this is hard-coded in the host. At connect time the client asks: list tools, list resources, list prompts. Ship a new tool and it appears the moment the server restarts — no client update, no redeploy of your agent.'
    },
    {
      type: 'bridge', kicker: 'COMING UP',
      title: 'Enough theory — **build** the notes server, live.',
      next: 'Swipe up · Reel 72: Build your first MCP server',
      narration: 'Theory done. Next reel we write the whole thing — a notes server, two tools, one file — and plug it straight into Claude Desktop with five lines of JSON. Bring a terminal.'
    }
  ],

  code: {
    title: '🐍 All three primitives, one file',
    body:
`# The three primitives side by side (FastMCP)
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("notes")
NOTES: list[str] = []

@mcp.tool()                    # 1. TOOL — the MODEL decides to call it
def add_note(text: str) -> str:
    """Append a note. LLMs read this docstring!"""
    NOTES.append(text)
    return f"saved ({len(NOTES)} total)"

@mcp.resource("notes://all")   # 2. RESOURCE — the APP attaches it
def all_notes() -> str:
    return "\\n".join(NOTES)

@mcp.prompt()                  # 3. PROMPT — the USER picks it
def summarize() -> str:
    return "Summarize my notes as crisp bullet points."

if __name__ == "__main__":
    mcp.run()                  # serves stdio by default`,
    annot: [
      'The <b>docstring + type hints</b> become the tool description and JSON Schema — documentation is the API contract.',
      '<b>Resource URIs</b> are your own scheme — the app, not the model, decides which ones to attach.',
      'A <b>prompt</b> is just a function returning a string — a parameterized system prompt, nothing more.'
    ]
  },

  recap: [
    'Model calls **tools**; app attaches **resources**',
    'Prompts = **user-picked templates**',
    'Discovery: **list_tools / list_resources / list_prompts**'
  ],

  quiz: {
    q: 'Who decides which MCP resource gets attached to a conversation?',
    opts: [
      'The model, at call time',
      'The host application',
      'The MCP server itself',
      'The end user, every single time'
    ],
    a: 1,
    why: 'Resources are application-controlled: the host (or the user via the host’s UI) attaches them as context. The model consumes them read-only; only tools are model-invoked — that distinction is the whole primitive.'
  },

  notes: `
# Tools, resources & prompts

## The one rule that keeps them straight
**Who chooses the primitive is the primitive.**

|  | Tools 🛠️ | Resources 📄 | Prompts 💬 |
|---|---|---|---|
| Chosen by | the **model** | the **host app** | the **user** |
| Nature | callable functions | readable data | prompt templates |
| Addressing | name | URI (\`notes://recent\`) | name + arguments |
| Side effects | yes — that's the point | none, read-only | none |
| SDK decorator | \`@mcp.tool()\` | \`@mcp.resource(uri)\` | \`@mcp.prompt()\` |

If the model needs to *decide*, it's a tool. If context should just *be there*, it's a resource. If a human picks a starting point, it's a prompt.

## Tools in depth
A tool is a function with a \`name\` (snake_case by convention), a \`description\` the model reads to decide, and an \`inputSchema\` — JSON Schema generated for you from type hints and defaults. At runtime the host validates the model's arguments against that schema *before* \`tools/call\` executes — the same validation story as Pydantic in reel 15. Design them like the tools in reel 53: narrow, honest descriptions, typed args.

## Resources in depth
Resources expose data as **URIs under a custom scheme** — \`notes://recent\`, \`postgres://schema\`, \`file:///src/app.py\`. The host (or its user, via a resource picker) attaches them to context, and the model reads them through \`resources/read\`. Good fits: the current file, a database schema, today's tickets. No side effects, ever.

## Prompts in depth
A prompt is a function returning a string or message list — a parameterized template the *user* invokes, like a slash command: \`/summarize-notes\`, \`/write-pr-description\`. Arguments are filled in and validated by the server. Handy for encoding your team's best prompt patterns (reel 26) as first-class, discoverable UI entries.

## Discovery — nothing is hard-coded
At connect time the client calls \`list_tools()\`, \`list_resources()\`, \`list_prompts()\` (wire methods \`tools/list\`, \`resources/list\`, \`prompts/list\`). Consequences:
- ship a new tool → hosts see it on next connect, no redeploy of the agent,
- the model only sees tools for servers the host actually connected — least privilege by construction,
- the description text a server returns is *untrusted input* — reel 74 covers tool poisoning.

## FastMCP magic, demystified
\`@mcp.tool()\` inspects your signature and docstring: annotations → JSON Schema types, defaults → optional fields, docstring → description. It is Pydantic under the hood — which is why docstring quality directly controls tool-call quality. Write them like XML doc comments on a public API: the consumer is a very literal reader.

## Design checklist
- Tool = verb, one job, schema'd args, honest description.
- Resource = noun, read-only, stable URI.
- Prompt = workflow, user-invoked, arguments documented.
`
});
