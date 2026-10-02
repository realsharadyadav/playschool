/* Reel 72 — Build your first MCP server (Agentic · MCP) */
SS.registerReel({
  id: 'r72', num: 72, section: 'agentic', block: 'MCP',
  title: 'Build your first MCP server',
  hook: 'Thirty lines of FastMCP. **Your tools, now speakable by every agent.**',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE BUILD',
      title: 'An MCP server is **a decorated Python file.** Nothing more.',
      sub: '@mcp.tool() over functions. That\'s the whole shape.',
      narration: 'Time to demystify. An MCP server — the thing that makes your tools portable across Claude, ChatGPT, your LangGraph crews, and your hand-rolled loop — is, at its core, a Python file where functions get a decorator. The FastMCP library reads your function signature and docstring, generates the tool schema automatically, and speaks the protocol over stdio. You\'ve actually built one already: reel sixty-five\'s Excel server. This reel makes the pattern explicit with a from-scratch build.'
    },
    {
      type: 'arch',
      layers: [
        { e: '🐍', t: '@mcp.tool() functions', s: 'your logic + docstrings = schemas' },
        { e: '🧾', t: 'FastMCP', s: 'schema gen, protocol, stdio transport' },
        { e: '🔌', t: 'MCP protocol', s: 'JSON-RPC: list tools, call, resources' },
        { e: '🤖', t: 'Any MCP client', s: 'Claude Desktop, agents, your loop' }
      ],
      narration: 'The stack, four layers and barely any of it yours. Your functions sit on top — the docstring becomes the tool description, the type hints become the parameter schema, for free; reel fifty-three\'s design rules apply verbatim. FastMCP is the library doing schema generation and protocol speaking. The protocol itself is JSON-RPC messages: list-tools, call-tool, read-resource. And any MCP client — Claude Desktop, an agent framework, your own reel-fifty-four loop — connects at the bottom. You write Python; the world gets tools.'
    },
    {
      type: 'list',
      items: [
        { e: '✍️', t: 'Docstring → description', s: 'the "USE WHEN" formula lives here' },
        { e: '🏷️', t: 'Type hints → schema', s: 'str, int, Optional become JSON Schema' },
        { e: '📡', t: 'stdio transport', s: 'clients launch you as a subprocess' },
        { e: '🧪', t: 'Test with any client', s: 'Claude Desktop or the inspector' }
      ],
      narration: 'The four mechanics. Docstrings become descriptions — the routing formula from reel fifty-three, what-when-what-returns, written where FastMCP can find it. Type hints become parameter schemas — str, int, Optional all map to JSON Schema automatically; Pydantic models work too for complex arguments. Stdio is the default transport: the client launches your server as a subprocess and talks over standard in-out — no ports, no networking, no deployment. And testing needs zero new tools: point Claude Desktop at your server, or use the MCP inspector, and start calling.'
    },
    {
      type: 'compare',
      cards: [
        { e: '🔧', t: 'Framework-specific tools', s: 'LangChain tools, OpenAI functions — one client each' },
        { e: '🌐', t: 'MCP tools', s: 'write once, call from Claude, ChatGPT, CrewAI, your loop', win: true }
      ],
      narration: 'Why bother with the protocol. Framework-specific tools work brilliantly — inside their framework. The moment your Excel tools need to serve a Claude Desktop power user AND a LangGraph pipeline AND a quick script, you\'d be rewriting adapters forever. MCP amortizes that: one server, N clients, each discovering the same tool list with the same schemas. It\'s the reel-sixty-five insight generalized — build the hands once, let every brain borrow them.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'Server: built. **Now wire it to an agent client.**',
      next: 'Next · Reel 73: MCP + agents — client wiring',
      narration: 'Your first MCP server: thirty lines, one decorator, infinite clients. The natural next step is programmatic: wiring an MCP server into your OWN agent loop, so your reel-fifty-four brain borrows external hands. Client-side wiring — next reel. Swipe up.'
    }
  ],

  code: {
    title: '🐍 From-scratch MCP server — the complete pattern',
    body:
`from mcp.server.fastmcp import FastMCP

mcp = FastMCP("contoso-tools")

@mcp.tool()
def get_exchange_rate(base: str, quote: str = "EUR") -> str:
    """Get today's exchange rate. USE WHEN the user asks about
    currency conversion or mentions foreign amounts. RETURNS a
    rate string like '1 USD = 0.92 EUR'."""
    rates = {"USD": 0.92, "GBP": 1.17}
    rate = rates.get(base.upper(), 1.0)
    return f"1 {base.upper()} = {rate} {quote}"

@mcp.tool()
def list_regions() -> list[str]:
    """List available sales regions. USE WHEN a region filter is
    needed. RETURNS region codes like ['EU', 'NA', 'APAC']."""
    return ["EU", "NA", "APAC"]

@mcp.resource("config://regions")
def regions_resource() -> str:
    """Static config as a readable resource."""
    return "EU,NA,APAC"

if __name__ == "__main__":
    mcp.run()   # stdio: clients launch this file as a subprocess`,
    annot: [
      '<b>Docstring = the reel-53 description formula</b> — "USE WHEN… RETURNS…" is literally what client models read to route calls.',
      '<b>Signatures become JSON Schema</b> — base: str, quote: str = "EUR" → typed parameters with defaults, zero manual schema writing.',
      '<b>@mcp.resource for passive data</b> — config and reference data expose as readable URIs, keeping tool calls for ACTIONS (the read/write split, again).'
    ]
  },

  recap: [
      'MCP server = <b>decorated functions</b> + docstrings',
    'Schemas generate from <b>type hints and docstrings</b> — free',
    '<b>stdio transport</b>: subprocess in, protocol out, no networking'
  ],

  quiz: {
    q: 'In FastMCP, where does the tool description that the client model uses for routing come from?',
    opts: [
      'A separate YAML config file you maintain',
      'The function\'s docstring — FastMCP extracts it into the tool schema automatically',
      'The function name, capitalized',
      'A decorator argument required on every tool'
    ],
    a: 1,
    why: 'FastMCP (and MCP SDKs generally) derive the tool schema from introspection: the docstring becomes the description and type hints become the parameter schema. This is why the docstring formula matters so much (reel 53) — it IS the routing documentation, and it lives in the only place guaranteed to stay next to the code.'
  },

  notes: `
# Build your first MCP server

## The minimal server, dissected
\`\`\`
from mcp.server.fastmcp import FastMCP
mcp = FastMCP("name")

@mcp.tool()
def fn(arg: str, opt: int = 5) -> str:
    """Description: what + USE WHEN + RETURNS."""
    ...

if __name__ == "__main__":
    mcp.run()        # serves over stdio
\`\`\`
Three moving parts: the app object, decorated tools, the run call. That\'s genuinely it for a working server.

## What FastMCP derives automatically
| From | Becomes |
| --- | --- |
| Function name | tool name |
| Docstring | tool description (routing text!) |
| Parameter type hints | JSON Schema properties |
| Defaults | optional parameters |
| Return type | result typing (documented) |
| Pydantic model params | nested object schemas (reel 15 synergy) |

## Transports, practically
- **stdio** (default): client spawns \`python server.py\`; zero deployment, perfect for local tools and desktop clients. Use this until proven otherwise.
- **HTTP/SSE**: for remote servers serving many clients; adds auth and ops surface (reel 74 territory).
- Testing: the MCP inspector (\`npx @modelcontextprotocol/inspector\`) or Claude Desktop config pointing at your file.

## Design rules — carried from reel 53
- Chunky tools, verb names, the what/when/returns docstring formula.
- Read/write split; writes announce "REQUIRES APPROVAL" and your server enforces it (reel 65\'s token gate pattern).
- Errors as structured \`{"ok": false, "error": ..., "hint": ...}\` — clients\' models self-correct from hints.

## When NOT to write an MCP server
- One script, one tool, one user: a plain function (or reel 19\'s guarded SQL) is simpler.
- High-QPS service-to-service calls: MCP\'s discovery handshake per session has overhead; a plain REST API may fit better. MCP shines at AGENT-facing tool surfaces — which is exactly the capstone\'s use case.

> **.NET ↔ Python:** the official C# SDK exists, and the protocol is language-neutral — but the ecosystem gravity (FastMCP, examples, Claude Desktop conventions) is Python-side. Another vote for the reel-1 split: tools in Python, consumed everywhere.

Next: reel 73 — the client side: wiring MCP servers into your own agent loop.
`
});
