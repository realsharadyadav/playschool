/* Reel 70 — MCP architecture (Agentic AI · MCP) */
SS.registerReel({
  id: 'r70', num: 70, section: 'agentic', block: 'MCP',
  title: 'MCP architecture',
  hook: 'One server, many hosts. Three roles, two transports — the **map**.',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE ROLES',
      title: 'Three roles: **host**, **client**, **server**',
      sub: 'Every MCP deployment is these three, in order.',
      narration: 'MCP has exactly three roles, and keeping them straight saves you hours. The host is the app the user touches. The client lives inside the host. The server owns the tools, resources and prompts.'
    },
    {
      type: 'arch',
      layers: [
        { e: '🖥️', t: 'Host', s: 'Claude Desktop · VS Code · your agent app' },
        { e: '🔌', t: 'MCP client', s: 'one session per server, in-process' },
        { e: '⚙️', t: 'MCP server', s: 'exposes tools · resources · prompts' },
        { e: '🗄️', t: 'The world', s: 'files · APIs · databases · Excel (r65)' }
      ],
      narration: 'Top to bottom. The host — Claude Desktop, VS Code, your own agent — embeds one client per server it uses. Each client keeps a session to a server, and the server is what actually touches files, APIs, and databases.'
    },
    {
      type: 'compare',
      cards: [
        { e: '🖥️', t: 'stdio', s: 'server = local subprocess the host spawns; no ports, no network' },
        { e: '🌐', t: 'Streamable HTTP', s: 'remote URL, stateful sessions, OAuth — the 2025 spec', win: true }
      ],
      narration: 'Two transports. Standard input-output: the host spawns the server as a local subprocess — no ports, no network, perfect for dev tools. Streamable HTTP — the successor to the old HTTP-plus-SSE transport — for remote, shareable servers.'
    },
    {
      type: 'diagram',
      nodes: [
        { e: '⚙️', t: 'One server', s: 'e.g. Postgres MCP' },
        { e: '🖥️', t: 'Claude Desktop' },
        { e: '🧑‍💻', t: 'VS Code' },
        { e: '🤖', t: 'Your agent' }
      ],
      linkLabel: 'stdio / HTTP',
      narration: 'Flip it around and you see the payoff. One Postgres server, written once, serves Claude Desktop, VS Code, and your production agent — simultaneously, over the same protocol. That is the N-plus-M world from reel sixty-eight.'
    },
    {
      type: 'list',
      items: [
        { e: '🖥️', t: 'Host decides', s: 'which servers to launch, UI, consent' },
        { e: '🔌', t: 'Client negotiates', s: 'initialize handshake, capabilities' },
        { e: '⚙️', t: 'Server serves', s: 'tools, resources, prompts — nothing else' }
      ],
      narration: 'Responsibilities, one line each. The host decides which servers exist and asks your consent before risky calls. The client negotiates capabilities during initialize. The server just serves — it knows nothing about the host.'
    },
    {
      type: 'bridge', kicker: 'COMING UP',
      title: 'The server’s whole vocabulary: **tools, resources, prompts**.',
      next: 'Swipe up · Reel 71: Tools, resources & prompts',
      narration: 'One layer deeper now. Everything a server exposes is one of exactly three primitives — tools, resources, or prompts. They sound similar; they are not. Next reel is the deep dive.'
    }
  ],

  code: {
    title: '🐍 A client session, end to end',
    body:
`# The host side: spawn a server, open a session, discover tools
import asyncio
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def main():
    server = StdioServerParameters(command="python",
                                   args=["notes_server.py"])
    async with stdio_client(server) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()          # handshake + caps
            tools = await session.list_tools()  # discovery (reel 69)
            for t in tools.tools:
                print(f"{t.name}: {t.description}")

asyncio.run(main())`,
    annot: [
      '<b>One ClientSession per server</b> — a host with five servers runs five sessions.',
      '<b>initialize()</b> is mandatory: version handshake and capability negotiation before anything else.',
      'This is discovery in action — the same <b>tools/list</b> call Claude Desktop makes on startup.'
    ]
  },

  recap: [
    'Roles: **host → client → server**',
    'stdio local · **Streamable HTTP** remote',
    'One server serves **many hosts**'
  ],

  quiz: {
    q: 'In MCP, the client is…',
    opts: [
      'A separate service you deploy next to the server',
      'In-process code inside the host — one session per server',
      'A browser extension that renders tool calls',
      'A load balancer between hosts and servers'
    ],
    a: 1,
    why: 'MCP clients are lightweight in-process objects the host creates — one per connected server, each holding exactly one session. There’s no separate client service to deploy or scale.'
  },

  notes: `
# MCP architecture

## The three roles
Every MCP deployment is the same sandwich:

1. **Host** — the application the user touches: Claude Desktop, VS Code, your agent service. It owns UX, consent prompts, and the server lifecycle.
2. **Client** — a lightweight, in-process object the host creates: **one client per server, one session per client**. It speaks the protocol so the host doesn't have to.
3. **Server** — a program exposing tools, resources and prompts over a transport. It owns credentials to the systems it wraps and knows nothing about its hosts.

> **The rule that trips people — the 1:1 rule:** a host using five servers runs five clients and five sessions. A server may serve many hosts — one Postgres MCP server can back Claude Desktop, your IDE and your production agent simultaneously.

## What the client actually does
- sends \`initialize\` and stores the negotiated protocol version,
- routes \`tools/list\`, \`tools/call\`, \`resources/read\` … and matches responses to requests by JSON-RPC \`id\`,
- surfaces server \`notifications\` (e.g. tool list changed) to the host,
- on teardown, closes the transport — stdio servers exit when their pipe closes.

## Transports
|  | stdio | Streamable HTTP |
|---|---|---|
| Server location | local subprocess | remote URL |
| Who starts it | host spawns \`command + args\` | already running |
| Network | none (pipes) | HTTP, stateful sessions |
| Auth | inherits host process env | OAuth 2.1, per-user tokens |
| Best for | dev tools, personal servers | team & shared services |

The original spec (2024) shipped an HTTP+SSE transport; the 2025 spec replaced it with **Streamable HTTP** — a single endpoint that streams responses when needed and supports resumability. If you see SSE in older tutorials, that's the legacy transport; new servers should target Streamable HTTP.

## The session lifecycle
1. Host starts (or connects to) the server.
2. Client sends \`initialize\` — protocol version, client capabilities; server replies with its own.
3. Client sends \`initialized\`; the session is live.
4. Normal operation: \`tools/list\`, \`tools/call\`, \`resources/read\`, …
5. Teardown: client closes; stdio servers exit with the pipe, HTTP sessions time out.

## Putting the Excel server in this picture
The Excel MCP server from reel 65 is a stdio server: the SOP agent spawns it, one session, and calls like \`read_range\` cross the pipe as JSON-RPC. Swap Claude Desktop in as the host and literally nothing about the server changes — that is the point.

## Failure modes to expect
- **Zombie stdio servers**: if the host crashes without closing the client, spawned servers may linger — always use the context managers.
- **Version mismatch**: \`initialize\` negotiates; a too-old server fails the handshake. Fail loud, fail early.
- **Session state on HTTP**: servers may keep per-session state; reconnecting can reset tool caches (invalidate, don't assume).
`
});
