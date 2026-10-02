/* Reel 65 — Build the Excel MCP server (Agentic · Capstone: Excel Agent) */
SS.registerReel({
  id: 'r65', num: 65, section: 'agentic', block: 'Capstone: Excel Agent',
  title: 'Build the Excel MCP server',
  hook: 'Agents need hands for spreadsheets. **Build them once, safely, with MCP.**',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE HANDS',
      title: 'A spreadsheet MCP server: **safe, structured hands for agents.**',
      sub: 'Read rows. Propose edits. Apply approved diffs. Audit everything.',
      narration: 'The capstone needs hands — and here\'s the professional way to build them: an MCP server exposing spreadsheet operations as tools. Why MCP and not ad-hoc functions: this server becomes REUSABLE across every agent and framework that speaks the protocol, and it centralizes the safety logic — reads are free, writes require an approved diff, everything logs. One server, many agents, one audit trail. This reel builds it with FastMCP and openpyxl.'
    },
    {
      type: 'arch',
      layers: [
        { e: '📋', t: 'Tool layer', s: 'list_sheets, read_rows, propose_edits, apply_diff' },
        { e: '🛡️', t: 'Policy layer', s: 'validate diffs, enforce approval tokens' },
        { e: '📊', t: 'Workbook layer', s: 'openpyxl — load, edit, save .xlsx' },
        { e: '🧾', t: 'Audit layer', s: 'append-only change log' }
      ],
      narration: 'The server, four layers. The tool layer exposes exactly four tools — list sheets, read rows, propose edits, apply diff — chunky and well-described (reel 53). The policy layer validates every proposed edit against the schema and checks the approval token before any write. The workbook layer is openpyxl doing the actual xlsx work. And the audit layer appends every change — who, what, when, which approval — to an immutable log. Reads flow down the left side freely; writes force a trip through policy.'
    },
    {
      type: 'list',
      items: [
        { e: '📖', t: 'read_rows', s: 'read-only, paginated, safe' },
        { e: '✏️', t: 'propose_edits', s: 'validate + stage, no writes' },
        { e: '✅', t: 'apply_diff', s: 'requires approval token' },
        { e: '🧾', t: 'get_audit_log', s: 'compliance-ready history' }
      ],
      narration: 'The four tools, and why just four. Read-rows: paginated reads — agents page through big sheets without loading megabytes into context. Propose-edits: validates and STAGES a diff — nothing touches the file; this is the agent\'s write-intent. Apply-diff: takes the staged diff PLUS an approval token — the human signature from reel sixty\'s gate. And get-audit-log: the compliance artifact. Four chunky tools, clean read/write split, every verb accounted for.'
    },
    {
      type: 'compare',
      cards: [
        { e: '😬', t: 'Direct file access', s: 'agent edits xlsx freely — unaudited, unreviewable' },
        { e: '🏛️', t: 'MCP tool server', s: 'reads free, writes gated, everything logged', win: true }
      ],
      narration: 'Why the tool server beats giving agents the file. Direct access makes the agent a silent editor — no staging, no review, no record; the first bad write is discovered in Monday\'s numbers. The MCP pattern inverts it: the agent can LOOK freely but can only PROPOSE writes; a human-approved token unlocks apply; the log captures everything. Same agent brain — governed hands. And because it\'s MCP, this server plugs into ANY framework — LangGraph, the OpenAI SDK, Claude Desktop, your own loop from reel fifty-four.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'Hands: built. **Now the brain that follows SOPs.**',
      next: 'Next · Reel 66: The SOP-following agent — plan, validate, approve',
      narration: 'The Excel MCP server is the capstone\'s hands — reusable, governed, auditable. Next: the brain. An agent that reads SOPs, scans sheets, plans edits as cited diffs, validates against the rules, and routes judgment calls to humans. Reel sixty-six, swipe up.'
    }
  ],

  code: {
    title: '🐍 Excel MCP server — the safe four tools',
    body:
`from mcp.server.fastmcp import FastMCP
from openpyxl import load_workbook
import json

mcp = FastMCP("excel-tools")
wb = load_workbook("Invoices.xlsx")
staged, audit = [], []

@mcp.tool()
def read_rows(sheet: str, start: int = 1, count: int = 50) -> str:
    ws = wb[sheet]
    rows = [[c.value for c in r]
            for r in ws.iter_rows(min_row=start, max_row=start + count - 1)]
    return json.dumps(rows, default=str)

@mcp.tool()
def propose_edits(diff_json: str) -> str:
    diff = SheetPlan.parse_raw(diff_json)      # Pydantic gate (reel 15)
    staged.clear(); staged.append(diff)
    return f"staged {len(diff.changes)} edits, awaiting approval"

@mcp.tool()
def apply_diff(approval_token: str) -> str:
    if not verify_token(approval_token, staged):   # human gate (reel 60)
        return "REJECTED: invalid/expired approval"
    ws = wb[staged[0].sheet]
    for ch in staged[0].changes:
        audit.append({"cell": ch.cell, "before": ch.before,
                      "after": ch.after, "rule": ch.rule_id})
        ws[ch.cell] = ch.after
    wb.save("Invoices.xlsx"); staged.clear()
    return f"applied {len(audit)} edits, logged"

@mcp.tool()
def get_audit_log() -> str:
    return json.dumps(audit)                   # compliance artifact

if __name__ == "__main__":
    mcp.run()`,
    annot: [
      '<b>SheetPlan.parse_raw gates every proposal</b> — rule citations and cell formats validated before staging; garbage never reaches the workbook.',
      '<b>verify_token(approval_token, staged)</b> — the token binds a SPECIFIC staged diff (hash it); approving one diff can\'t unlock another.',
      '<b>audit.append BEFORE ws[cell] =</b> — log the intent first; even a crash mid-apply leaves a complete record of intent.'
    ]
  },

  recap: [
    'Four chunky tools: <b>read, propose, apply, audit</b>',
    'Writes are <b>staged + token-gated</b> — never direct',
    'MCP makes the server <b>reusable across every framework</b>'
  ],

  quiz: {
    q: 'Why does apply_diff require an approval token that binds to the specific staged diff, rather than a generic "approved" flag?',
    opts: [
      'Tokens are required by the MCP protocol specification',
      'A generic flag could be replayed to apply a DIFFERENT (perhaps malicious or stale) staged diff than the one the human reviewed',
      'It makes the audit log entries longer',
      'openpyxl requires tokens for write operations'
    ],
    a: 1,
    why: 'Approval must mean "I approve THIS diff, now." A generic flag creates a confused-deputy hole: stage a new diff (or an attacker stages one), replay the flag, and unreviewed edits commit. Binding the token to a hash of the staged diff makes approvals non-transferable — the exact property a governance gate exists to provide.'
  },

  notes: `
# Build the Excel MCP server

## Why MCP here (and not plain functions)
- **Reuse**: one server serves LangGraph crews, the OpenAI Agents SDK, Claude Desktop, and your hand-rolled loop — write the safety logic ONCE (reel 69 covers MCP architecture in full).
- **Governance boundary**: safety lives in the server, not in every agent\'s prompt. Prompts can be jailbroken (reel 74); a token check in code cannot.
- **Audit centrality**: one append-only log for every agent, framework, and human tool that touches the workbook.

## Tool design (reel 53 applied)
\`\`\`
read_rows(sheet, start, count)   # paginate! agents shouldn't slurp 100K rows
propose_edits(diff_json)         # validated + staged; returns await-approval
apply_diff(approval_token)       # token-bound; applies + logs
get_audit_log()                  # the compliance artifact
\`\`\`
Descriptions (the routing algorithm) would say exactly when to call each — and state that writes REQUIRE the approval flow.

## Pagination — the context-saver
\`read_rows\` at 50 rows/request keeps agent desks clean (reel 23). For big sheets add \`find_rows(where_column, equals)\` so agents fetch matching rows instead of paging everything — one WHERE clause, 90% fewer tokens.

## Beyond the basics (upgrade path)
- **Multi-workbook**: \`open_workbook(path)\` with an allow-listed directory (reel 74\'s path-traversal defense).
- **Formulas preserved**: openpyxl keeps formulas as strings; document that compute happens on open in Excel — agents don\'t "see" computed values unless you evaluate (formulas library) or cache values.
- **Batch apply**: \`apply_diff\` per-sheet transactions with rollback file on exception.
- **Streaming reads** for xlsx that don\'t fit memory: openpyxl \`read_only=True\` mode.

## Testing the server
- Unit: every tool against fixture workbooks (golden before/after pairs — reel 41\'s mindset).
- Integration: an agent loop (reel 54) drives propose→approve→apply→audit end-to-end.
- Adversarial: propose diffs with bad cells, wrong types, unquoted rules — the Pydantic gate must reject (reel 47 red-team habits).

## Wiring into the agent (preview of 66–67)
The agent\'s write-intent flows: plan SheetPlan (typed contract) → propose_edits → human UI renders diff + citations → approval token → apply_diff → audit. The brain never saves files; the hands never think.

Next: reel 66 — the SOP-following brain: plan, validate, approve.
`
});
