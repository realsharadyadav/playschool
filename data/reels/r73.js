/* Reel 73 — MCP + agents — client wiring (Agentic · MCP) */
SS.registerReel({
  id: 'r73', num: 73, section: 'agentic', block: 'MCP',
  title: 'MCP + agents — client wiring',
  hook: 'Your agent, **their tools.** The client side of the protocol.',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE CLIENT SIDE',
      title: 'Clients DISCOVER tools. **Agents adopt them mid-loop.**',
      sub: 'Connect, list_tools, convert to schema, call — all at runtime.',
      narration: 'You\'ve seen the server; now the side your agent lives on. The client flow is four steps, all at RUNTIME: connect to the server — launch the stdio subprocess or open the HTTP stream; list its tools — the protocol hands back names, descriptions, and schemas; convert those into your LLM\'s tool schema format — the shapes from reel fifty-two; and route tool_calls back through the MCP connection. The magic word is DISCOVERY: an agent can adopt tools it was never explicitly programmed with, just by connecting.'
    },
    {
      type: 'diagram',
      nodes: [
        { e: '🔌', t: 'connect', s: 'stdio subprocess / HTTP' },
        { e: '📋', t: 'list_tools()', s: 'name + desc + schema each' },
        { e: '🔄', t: 'convert to LLM tools', s: 'OpenAI/Anthropic format' },
        { e: '📞', t: 'call_tool(name, args)', s: 'route model requests' }
      ],
      narration: 'The wiring, end to end. Connect: your client library spawns the server process — reel seventy-two\'s file — and shakes hands over stdio. List-tools: one protocol call returns every tool with its description and JSON schema — the discovery step. Convert: each entry maps directly onto the tools array your LLM API expects — reel fifty-two\'s format, generated from someone else\'s docstrings. And call-tool: when the model emits tool-calls, the client forwards name and arguments to the server and returns the result as the tool observation. Four arrows; your agent now has external hands.'
    },
    {
      type: 'chat',
      bubbles: [
        { who: 'you', text: 'connect: excel-tools (reel 65\'s server)' },
        { who: 'bot', text: '4 tools discovered: read_rows, propose_edits, apply_diff, get_audit_log', tool: 'list_tools' },
        { who: 'bot', text: 'tools injected into the loop — agent can reconcile now', tool: 'converted to schema' }
      ],
      narration: 'Adoption in practice. Your agent connects to the Excel MCP server from the capstone — and without a line of new code in the agent itself, it gains four governed spreadsheet tools with their safety gates intact. The approval flow, the audit log, the staged diffs: all server-side policy (reel sixty-five) travels with the tools. That\'s the architectural payoff: capabilities arrive WITH their governance attached, because both live in the server.'
    },
    {
      type: 'list',
      items: [
        { e: '🧩', t: 'Tool merging', s: 'local + MCP tools in one array' },
        { e: '🧠', t: 'Context budget', s: 'N tools × descriptions cost tokens' },
        { e: '⏱️', t: 'Timeouts per call', s: 'MCP calls can hang (reel 14)' },
        { e: '🧾', t: 'Results are observations', s: 'same ReAct loop as reel 54' }
      ],
      narration: 'The four client disciplines. Tool merging: an agent typically mixes LOCAL tools — fast, in-process — with MCP tools; both land in one tools array, indistinguishable to the model. Context budget: every tool\'s name and description rides the desk (reel twenty-three) — ten servers\' worth of tools can bury the actual task; curate what you connect. Timeouts: an MCP call is a network-ish hop; wrap call-tool with the reel-fourteen discipline. And results are observations — the ReAct loop doesn\'t change at all; MCP just widens where actions can land.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'Wiring: complete. **The final reel: trust.**',
      next: 'Next · Reel 74: Security, auth & ecosystem',
      narration: 'Your agent can now safely borrow hands from any MCP server on earth. Which raises the final question of the course — and the right one to end on: whose hands should it trust? Security, authentication, and the MCP ecosystem landscape. The finale, reel seventy-four. Swipe up.'
    }
  ],

  code: {
    title: '🐍 Client wiring — adopt a server in ~15 lines',
    body:
`import asyncio
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from openai import AsyncOpenAI

async def run(goal: str):
    # 1. connect: launch the server as a subprocess
    params = StdioServerParameters(
        command="python", args=["excel_server.py"])
    async with stdio_client(params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()

            # 2. discover tools -> 3. convert to LLM schema
            tools = await session.list_tools()
            llm_tools = [{"type": "function",
                          "function": {"name": t.name,
                                       "description": t.description,
                                       "parameters": t.inputSchema}}
                         for t in tools.tools]

            messages = [{"role": "user", "content": goal}]
            for _ in range(10):                       # the reel-54 loop
                resp = await client.chat.completions.create(
                    model="gpt-4o", messages=messages, tools=llm_tools)
                msg = resp.choices[0].message
                if not msg.tool_calls:
                    return msg.content                # FINAL
                messages.append(msg)
                for call in msg.tool_calls:           # 4. route to MCP
                    result = await session.call_tool(
                        call.function.name,
                        json.loads(call.function.arguments))
                    messages.append({
                        "role": "tool",
                        "tool_call_id": call.id,
                        "content": result.content[0].text})`,
    annot: [
      '<b>StdioServerParameters</b> — the client OWNS the server process; kill the client, the tool surface disappears (no orphan listeners).',
      '<b>t.inputSchema straight into llm_tools</b> — MCP schemas and OpenAI function schemas are the same JSON Schema dialect; conversion is repackaging, not translation.',
      '<b>session.call_tool per tool_call</b> — parallel tool_calls (reel 52) map to concurrent session calls; keep the same tool_call_id round-trip.'
    ]
  },

  recap: [
    'Client flow: <b>connect → list → convert → route</b>',
    'Tool DISCOVERY at runtime — agents adopt tools, not code',
    'Capabilities arrive with <b>their governance attached</b>'
  ],

  quiz: {
    q: 'An agent connects to three MCP servers and its task performance degrades — answers get less focused. Most likely cause?',
    opts: [
      'The MCP protocol is too slow for multi-server setups',
      'Forty tool descriptions consumed its context budget, diluting attention from the actual task (reel 23\'s desk)',
      'Servers conflict over tool names',
      'stdio transport serializes all calls'
    ],
    a: 1,
    why: 'Every connected tool\'s name + description is permanent context tax. Three chatty servers can add thousands of tokens of tool prose that bury the goal — the same lost-in-the-middle mechanism as reel 23. The fix is curation: connect only task-relevant servers/tools, or use a meta-tool that searches a tool catalog on demand (reel 58\'s catalog pattern).'
  },

  notes: `
# MCP + agents — client wiring

## The client lifecycle
\`\`\`
connect(server)                  # stdio spawn or HTTP session
tools = list_tools()             # discovery: name, description, schema
llm_tools = convert(tools)       # map to your provider's format
loop:
    resp = llm(messages, tools=llm_tools)
    if resp.tool_calls:
        for call in resp.tool_calls:
            result = call_tool(call.name, call.args)   # through MCP
            messages += tool_result(call.id, result)
    else: return resp.content
\`\`\`
Notice: the loop is reel 54\'s ReAct with native tool calling (52) — MCP replaces nothing; it EXTENDS where tools can live.

## Multi-server composition
- **Merge, don\'t nest**: one flat tools array from all servers; the model doesn\'t care about provenance.
- **Name collisions**: prefix per server (\`excel__read_rows\`) or reject duplicates at connect time.
- **Capability filtering**: fetch only the servers a task needs; connect lazily per phase (research phase → research servers).

## Production checklist for MCP clients
1. **Timeouts + retries on call_tool** (reel 14) — servers are external processes; they hang, crash, restart.
2. **Per-server budgets** — cap calls/minute per server; a loop gone wrong against a paid API-tool server is a bill.
3. **Tool-result size caps** — truncate or paginate; a read-everything tool result can swamp the desk.
4. **Graceful degradation** — server dies mid-run? Local tools keep working; note the outage in the trace and continue.
5. **Audit both sides** — client logs which server/tool/args ran (reel 60\'s log); servers log their own (reel 65).

## Framework reality
LangGraph, the OpenAI Agents SDK, CrewAI — all consume MCP natively now (load server configs, auto-convert tools). DIY (the panel) stays valuable exactly where it has all course: full control of the loop, the budget gates, and the audit trail — the reel-fifty-nine "frameworks are tenants" discipline applied to tool transport.

## The picture, complete
Server (72) + client wiring (73) + governance inside the server (65, 60) + evals on the loop (47) = the full architecture behind every "agent platform" demo you\'ve seen. You can now build the pieces AND explain the whole.

> **.NET ↔ Python:** the C# MCP SDK mirrors the client flow; the reel-1 split holds — Python owns the agent edge, .NET consumes the surfaces.

Next: reel 74 — the finale: security, auth, and the MCP ecosystem.
`
});
