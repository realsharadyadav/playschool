/* Reel 53 — Designing good tools (Agentic · Agent Fundamentals) */
SS.registerReel({
  id: 'r53', num: 53, section: 'agentic', block: 'Agent Fundamentals',
  title: 'Designing good tools',
  hook: 'Bad tools make smart models stupid. **Design is the multiplier.**',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE CRAFT',
      title: 'The model reads your tool like an API doc. **Write it like one.**',
      sub: 'Name, description, schema — the entire UI between model and code.',
      narration: 'A tool is an API whose only client is a language model — and that client reads the docs ONCE, in the prompt, and never asks clarifying questions. Everything the model knows about your tool lives in its name, its description, and its parameter schema. Vague docs make even a brilliant model fumble; precise docs make a mid model shine. Tool design IS prompt engineering, aimed at functions.'
    },
    {
      type: 'list',
      items: [
        { e: '📛', t: 'Verbs, specific', s: 'search_orders — not data_lookup' },
        { e: '🗒️', t: 'Description = when + what', s: '"Use when… Returns…"' },
        { e: '🧱', t: 'Few, chunky tools', s: '10 good tools > 40 thin ones' },
        { e: '🚫', t: 'No side effects hidden', s: 'reads vs writes, clearly named' }
      ],
      narration: 'The four design rules. Names: verb-first and specific — search-orders, not data-lookup; the model routes on names alone. Descriptions: state WHEN to use it and WHAT comes back — that sentence IS the routing algorithm. Granularity: few chunky tools beat many thin ones — forty tools overload the context and blur routing; ten well-shaped ones stay legible. And side effects: a tool that reads must look like a reader, a writer like a writer — never let a “get” mutate state.'
    },
    {
      type: 'compare',
      cards: [
        { e: '🌫️', t: '"Looks up data."', s: 'When? What data? What comes back?' },
        { e: '🎯', t: '"Searches orders by customer email. Use when the user asks about order status or history. Returns up to 20 orders with id, date, total, status."', win: true }
      ],
      narration: 'Feel the routing difference. The vague description gives the model nothing — it will call this tool late, early, or never. The precise one does three jobs: says what it does, says WHEN to reach for it, and previews the return shape — so the model can plan what to do with the result before calling. That triple — what, when, what-comes-back — is the description formula.'
    },
    {
      type: 'chat',
      bubbles: [
        { who: 'you', text: 'Design a tool: "refund an order"' },
        { who: 'bot', text: 'Name: create_refund. Args: order_id, amount_cents, reason.', tool: 'schema' },
        { who: 'bot', text: 'Amount in CENTS (int) — never floats for money. Reason from a fixed enum.', tool: 'constraints' },
        { who: 'bot', text: 'Writes need approval — flag it in the description.', tool: 'guardrail' }
      ],
      narration: 'A design review, live. Money as integer cents — never floats; float rounding is how refund bugs are born. Reason as an enum, not free text — enums validate, free text hallucinates. And the write gets flagged: dangerous tools announce their danger in the description so the agent loop can route them through approval — reel sixty’s human-in-the-loop. Tool design is where safety starts, not where it’s bolted on.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'Tools designed. **Now teach the brain to reason with them.**',
      next: 'Next · Reel 54: ReAct — reasoning + acting',
      narration: 'You can now design tools a model can route to reliably — the hands are built and labeled. Next: the reasoning style that ties perception to action most effectively — ReAct, the pattern that made agents work. Reel fifty-four, swipe up.'
    }
  ],

  code: {
    title: '🐍 A well-designed tool, annotated',
    body:
`from pydantic import BaseModel, Field

class SearchOrdersArgs(BaseModel):
    email: str = Field(description="Customer email, e.g. ana@contoso.com")
    status: str | None = Field(
        default=None,
        description="Filter: open|shipped|refunded. Omit for all.",
    )

# The description IS the routing algorithm — write all three parts:
SEARCH_ORDERS_DOC = {
    "name": "search_orders",
    "description": (
        "Search orders by customer email. "
        "USE WHEN the user asks about their orders, status, or history. "
        "RETURNS up to 20 orders: id, date, total_cents, status."
    ),
    "parameters": SearchOrdersArgs.model_json_schema(),
}

# A write tool — danger announced, approval required:
class CreateRefundArgs(BaseModel):
    order_id: str
    amount_cents: int = Field(ge=1)   # cents as int — never float money
    reason: str = Field(pattern="^(damaged|late|wrong_item)$")

CREATE_REFUND_DOC = {
    "name": "create_refund",
    "description": (
        "ISSUE A REFUND — writes money; requires human approval. "
        "USE ONLY after confirming the order via search_orders. "
        "RETURNS refund id or an error code."
    ),
    "parameters": CreateRefundArgs.model_json_schema(),
}  # see approval wiring in reel 60`,
    annot: [
      '<b>Field(description=...)</b> — parameter docs surface in the schema; the model reads them when choosing arguments.',
      '<b>"USE WHEN" + "RETURNS"</b> — the two phrases that turn a description into routing logic.',
      '<b>amount_cents as int ≥ 1</b> — money, enums, and lower bounds at the schema level catch model errors before they become financial ones.'
    ]
  },

  recap: [
    'Name: <b>verb-first, specific</b> — routing happens on names',
    'Description: <b>what + when + what-returns</b>',
    'Writes <b>announce danger</b> and route to approval'
  ],

  quiz: {
    q: 'Your agent has 45 tools and keeps calling the wrong ones. What’s the highest-leverage fix?',
    opts: [
      'Add more detailed parameter descriptions',
      'Consolidate to ~10 chunky, well-differentiated tools with clear when-to-use descriptions',
      'Raise temperature so it explores alternatives',
      'Switch to a bigger model'
    ],
    a: 1,
    why: 'Tool overload blurs routing: 45 thin tools share overlapping purposes, consume context, and give the model 45 near-identical choices. Consolidation into ~10 purpose-distinct tools with explicit "USE WHEN" descriptions is the proven fix — better routing, smaller context, cheaper calls. Bigger models help at the margin; tool shape fixes the mechanism.'
  },

  notes: `
# Designing good tools

## The description formula
\`\`\`
<what it does, one clause>.
USE WHEN <the situations that justify calling it>.
RETURNS <the shape/preview of the result>.
\`\`\`
The model routes on this text. Every ambiguity becomes a misrouting; every missing "when" becomes a late call.

## Granularity heuristics
- **Chunky over chatty**: prefer \`search_orders(email, status)\` over \`get_order\`+\`list_orders\`+\`filter_orders\` — each extra tool is context tax and routing risk.
- **But not kitchen sinks**: \`do_everything(action, payload)\` defeats routing entirely.
- Sweet spot for most agents: **5–15 tools**. Past ~20, consider a meta-tool (a "search the tool catalog" tool) or sub-agents (reel 58).

## Schema design for LLM callers

| Field type | Why |
| --- | --- |
| Enums for categories | constrains hallucination to valid values |
| Ints for money (cents) | float rounding is a financial bug |
| \`max_items\`, \`limit\` bounds | prevents "return everything" blowups |
| Required vs optional, explicit | fewer invented-null arguments |
| Field descriptions | argument-level docs the model actually reads |

## Read/write discipline
- Name it like it behaves: \`get_*\`, \`search_*\`, \`list_*\` read; \`create_*\`, \`update_*\`, \`delete_*\`, \`send_*\` write.
- Write tools: say "REQUIRES APPROVAL" in the description (reel 60 wires it), and design \`dry_run\` parameters where possible.
- Reads are idempotent and cacheable — the agent may call them repeatedly; make them cheap.

## Error design
Tool results are the model's only feedback. Design them:
\`\`\`
{"ok": true, "orders": [...]}
{"ok": false, "error": "customer_not_found", "hint": "check email spelling"}
\`\`\`
Machine-readable \`ok\` + a corrective \`hint\` turns failures into self-correction (reel 56), not dead ends.

> **.NET ↔ Python:** identical discipline — the description formula and schema constraints are language-neutral. Python's edge: docstring-driven auto-schemas and the MCP ecosystem (reel 72) generating tool listings from code.

Next: reel 54 — ReAct: the reasoning pattern that made agents reliable.
`
});
