/* Reel 69 — MCP: USB-C for AI (Agentic AI · MCP) */
SS.registerReel({
  id: 'r69', num: 69, section: 'agentic', block: 'MCP',
  title: 'MCP: USB-C for AI',
  hook: 'USB-C ended cable chaos. MCP ends **connector** chaos.',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE ANALOGY, THEN THE REALITY',
      title: 'MCP is **USB-C for AI** — but what does it standardize?',
      sub: 'Three things — and they’re all concrete.',
      narration: 'You have heard MCP called USB-C for AI. Cute analogy — but analogies do not ship software. So let’s get concrete. MCP, the Model Context Protocol, standardizes exactly three things.'
    },
    {
      type: 'list',
      items: [
        { e: '🔍', t: 'Discovery', s: 'ask any server: what do you offer?' },
        { e: '📋', t: 'Schema’d calls', s: 'tools with typed args, validated' },
        { e: '📚', t: 'Resources & prompts', s: 'data + templates, addressable' }
      ],
      narration: 'One — discovery. Any host can ask any server: what do you offer? Two — schema’d calls: tools advertise a name, a description, and a JSON Schema for arguments. Three — resources and prompts: data and templates, each with its own address.'
    },
    {
      type: 'diagram',
      nodes: [
        { e: '🖥️', t: 'Any host', s: 'Claude · VS Code · your agent' },
        { e: '🔌', t: 'MCP', s: 'one protocol, versioned' },
        { e: '🧰', t: 'Any server', s: 'Slack · Postgres · Excel (r65)' }
      ],
      linkLabel: 'JSON-RPC 2.0',
      narration: 'The shape is a single plug. Any host — Claude Desktop, VS Code, the agent you wrote in reel fifty — connects to any server over one protocol: JSON-RPC two-point-oh messages. Write once, plug anywhere.'
    },
    {
      type: 'bigtext', kicker: 'BEYOND THE ANALOGY',
      title: 'No magic. Just **versioned JSON-RPC messages**.',
      sub: 'initialize → list tools → call → read resource.',
      narration: 'Here is what is under the hood: no magic. A versioned handshake called initialize, then method calls — list tools, call a tool, read a resource — as plain JSON-RPC messages. You can read them in a log file.'
    },
    {
      type: 'list',
      items: [
        { e: '🚫', t: 'No custom auth glue', s: 'the server owns its credentials' },
        { e: '🚫', t: 'No schema translation', s: 'one format, every host' },
        { e: '✅', t: 'Composable skills', s: 'servers mix like NuGet packages' }
      ],
      narration: 'Here’s what you stop writing: no per-connector auth glue — the server owns its credentials. No schema translation. And servers compose — add the GitHub server to your Excel server from reel sixty-five, and the host sees one toolset.'
    },
    {
      type: 'bridge', kicker: 'COMING UP',
      title: 'Who’s who in MCP: **hosts, clients, servers** — and how they connect.',
      next: 'Swipe up · Reel 70: MCP architecture',
      narration: 'So who actually runs these pieces? Hosts, clients, servers — and the transports that connect them, standard input-output versus HTTP. That is the architecture reel — swipe up.'
    }
  ],

  code: {
    title: '🐍 Peek at the wire protocol',
    body:
`# MCP speaks JSON-RPC 2.0 — that's the whole trick
import json, uuid

req = {
    "jsonrpc": "2.0",
    "id": str(uuid.uuid4()),
    "method": "tools/list",   # discovery: "what can you do?"
}
print("->", json.dumps(req))

# The server replies with tools + a JSON Schema per tool:
resp = {
    "jsonrpc": "2.0",
    "id": req["id"],
    "result": {"tools": [{
        "name": "add_note",
        "description": "Append a note to the store",
        "inputSchema": {
            "type": "object",
            "properties": {"text": {"type": "string"}},
            "required": ["text"],
        },
    }]},
}
print("<-", json.dumps(resp)[:80], "…")`,
    annot: [
      '<b>tools/list</b> is discovery — the same method every MCP host calls, no matter what the server wraps.',
      'Each tool ships an <b>inputSchema</b> — plain JSON Schema, the exact format function calling already uses.',
      'One wire format for every vendor: this is what kills the N×M problem from reel 68.'
    ]
  },

  recap: [
    'MCP standardizes **discovery + schema’d calls + resources**',
    'Wire protocol: **JSON-RPC 2.0** — readable, versioned',
    'Servers **compose** into one toolset per host'
  ],

  quiz: {
    q: 'Which of these does MCP NOT standardize?',
    opts: [
      'How a host discovers what a server offers',
      'The exact business logic inside each tool',
      'How tool arguments are described (JSON Schema)',
      'How a client requests a resource by URI'
    ],
    a: 1,
    why: 'MCP standardizes the boundary — discovery, invocation, addressing — never the implementation. What add_note does internally is the server’s business; the protocol only describes how to discover and call it.'
  },

  notes: `
# MCP: USB-C for AI

## One-liner
MCP — the **Model Context Protocol** — is an open protocol that lets an AI host discover and call tools, read resources, and use prompt templates from any server, over one wire format.

## History in two sentences
Open-sourced by Anthropic in November 2024; through 2025 it was adopted across the industry — OpenAI's Agents SDK and ChatGPT, Microsoft's Copilot and VS Code, Google Gemini, JetBrains — and governance moved to the Linux Foundation's **Agentic AI Foundation** with multiple vendors co-stewarding. When your competitors all implement your protocol, you have won the standards game.

## What "USB-C for AI" actually means
USB-C didn't make cables faster; it made the *port* standard. MCP does that for the host↔tool boundary:

| Capability | Standardizes | Wire method |
|---|---|---|
| Session setup | version handshake, capability negotiation | \`initialize\` |
| Discovery | "what do you offer?" | \`tools/list\`, \`resources/list\`, \`prompts/list\` |
| Schema'd invocation | name + description + JSON Schema args | \`tools/call\` |
| Resource addressing | data exposed as URIs | \`resources/read\` |
| Prompt templates | reusable, parameterized prompts | \`prompts/get\` |
| Notifications | server pushes changes | \`notifications/tools/list_changed\` |

## The wire is boring on purpose
Everything is **JSON-RPC 2.0**: requests with an \`id\`, \`method\`, \`params\`; responses with \`result\` or \`error\`. Boring means debuggable — run a local server, pipe stdio through \`tee\`, and read every message. No protobuf, no codegen, no magic.

## Why this beats "just write a connector"
1. **Write once per side**: a server author never thinks about which hosts exist; a host author never thinks about which servers exist. That is the N+M payoff from reel 68.
2. **Dynamic capability**: hosts re-list tools at connect time — ship a new tool and every client sees it on restart, no client code change.
3. **Composable**: hosts merge toolsets from many servers into one namespace for the model. Excel server plus GitHub server equals one unified tool menu.

## What MCP deliberately does not do
It says nothing about models, prompting, memory, or evals — that is your job (reels 20–47). It also doesn't constrain *what* tools do; \`delete_everything\` is a perfectly valid MCP tool, which is exactly why reel 74 on security matters.

> **Where you’ve already seen it:** the Excel MCP server in the capstone (reel 65) is an MCP server. Reels 70–73 peel it open: architecture, the three primitives, building one, and wiring it into your own agent.
`
});
