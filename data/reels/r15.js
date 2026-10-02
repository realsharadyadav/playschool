/* Reel 15 — Pydantic — trusting LLM output (Python · Python for GenAI) */
SS.registerReel({
  id: 'r15', num: 15, section: 'python', block: 'Python for GenAI',
  title: 'Pydantic — trusting LLM output',
  hook: 'LLMs return JSON-shaped hope. **Pydantic turns it into truth.**',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE GAP',
      title: 'The model promises JSON. **It doesn’t promise THIS JSON.**',
      sub: 'Missing fields, wrong types, extra noise — every call.',
      narration: 'Ask a model for structured output and you’ll usually get valid JSON. Usually. Fields go missing, numbers arrive as strings, arrays become single objects when the model is lazy. Your dict doesn’t care — it explodes three lines later, in code far from the cause. You need a gate at the boundary.'
    },
    {
      type: 'diagram',
      nodes: [
        { e: '🤖', t: 'LLM output', s: 'a JSON string (mostly)' },
        { e: '🛡️', t: 'Model.parse_raw', s: 'validate or crash here' },
        { e: '🏗️', t: 'typed object', s: 'fields guaranteed' },
        { e: '⚙️', t: 'your code', s: 'no dict diving' }
      ],
      narration: 'The pipeline. The LLM emits a JSON string. Parse-raw runs it through your model definition: every field checked, types coerced, missing required fields rejected — right at the boundary. Your downstream code gets a real object with real attributes, and never touches a bracket again.'
    },
    {
      type: 'compare',
      cards: [
        { e: '🧨', t: 'raw dict', s: 'data["choices"][0]["price"] — KeyError roulette' },
        { e: '🏰', t: 'Pydantic model', s: 'quote.price — validated, typed, IDE-friendly', win: true }
      ],
      narration: 'Feel the difference. Raw dict access is bracket-roulette: rename one field upstream and the error surfaces far away. A Pydantic model gives you attribute access with autocomplete, and the validation already happened — bad payloads die at the gate with a readable error.'
    },
    {
      type: 'list',
      items: [
        { e: '📐', t: 'class + types', s: 'name: str, price: float — schema as code' },
        { e: '✂️', t: 'Field(...)', s: 'constraints: min_length, ge, le' },
        { e: '🧬', t: 'Nested models', s: 'items: list[LineItem]' },
        { e: '🩹', t: 'field_validator', s: 'custom rules beyond types' }
      ],
      narration: 'The toolkit. A class with typed fields is the schema — same idea as a C-sharp record, but the types do validation work. Field adds constraints: minimum length, greater-or-equal bounds. Models nest — a quote contains a list of line items. And when types aren’t enough, a field validator runs your own rule.'
    },
    {
      type: 'bridge', kicker: 'PAYOFF',
      title: 'Trust restored. **Now plug Python into your SQL Server.**',
      next: 'Next · Reel 16: Connect to SQL Server from Python',
      narration: 'Pydantic is the difference between hoping and knowing — and it becomes load-bearing in every framework reel ahead, from tool schemas to MCP. Next: pyodbc, connecting Python to the SQL Server your company already runs. Reel sixteen, swipe up.'
    }
  ],

  code: {
    title: '🐍 Validating LLM output with Pydantic',
    body:
`from pydantic import BaseModel, Field, ValidationError

class LineItem(BaseModel):
    name: str = Field(min_length=1)
    qty: int = Field(ge=1)
    price: float

class Quote(BaseModel):
    customer: str
    total: float = Field(ge=0)
    items: list[LineItem]            # nested model, list-typed

raw = '{"customer": "ACME", "total": 1299.0, "items": [' \
      '{"name": "Laptop", "qty": 2, "price": 649.5}]}'

quote = Quote.parse_raw(raw)         # validate or raise — at the gate
print(quote.customer)                # attribute access, not brackets
print(sum(i.qty * i.price for i in quote.items))

bad = '{"customer": "ACME", "total": -5, "items": []}'
try:
    Quote.parse_raw(bad)
except ValidationError as e:
    print("REJECTED:", e.errors()[0]["msg"])  # total must be >= 0`,
    annot: [
      '<b>Field(ge=0)</b> — constraints in the declaration; “ge” = greater-or-equal, like DataAnnotations’ [Range].',
      '<b>Nested models</b> (items: list[LineItem]) validate recursively — one parse call checks the whole tree.',
      '<b>ValidationError</b> is the contract: fail loud at the boundary, with field-level messages, instead of a KeyError deep in business logic.'
    ]
  },

  recap: [
    'Schema as class: <b>types + Field constraints</b>',
    '<b>parse_raw</b> validates at the boundary — bad JSON dies early',
    'Nested models give <b>typed, IDE-friendly</b> objects'
  ],

  quiz: {
    q: 'The LLM returns {"total": "1299.0"} with price as a STRING. Pydantic with total: float will…',
    opts: [
      'Reject it — strings are never floats',
      'Coerce "1299.0" to 1299.0 and accept',
      'Accept but leave it a string',
      'Crash with a TypeError inside your code'
    ],
    a: 1,
    why: 'Pydantic coerces compatible types: "1299.0" parses into a float. That coercion is exactly what you want for LLM output — models are sloppy about string-vs-number. Truly incompatible values ("abc") are rejected with a ValidationError.'
  },

  notes: `
# Pydantic — trusting LLM output

## Why this matters more in AI than anywhere else
Normal APIs honor schemas. LLMs *approximate* them — a field that was an int yesterday is a string today, a list of one becomes a single object, keys get renamed. Validation at the boundary converts “garbage in, confusion later” into “reject now, with a reason.”

## The model definition

| You declare | You get |
| --- | --- |
| \`name: str\` | must be a string (or coercible) |
| \`qty: int = Field(ge=1)\` | int, ≥ 1 |
| \`total: float = 0.0\` | optional with default |
| \`items: list[LineItem]\` | recursive validation |
| \`tags: list[str] = []\` | mutable default handled safely |

## The workflow
1. Get JSON text from the model (reels 27 covers asking for JSON reliably).
2. \`Model.parse_raw(text)\` → typed object, or \`ValidationError\` with field-level messages.
3. Work with attributes; \`model.dict()\` / \`model.json()\` serializes back.

## Validation beyond types
\`\`\`
from pydantic import field_validator

class Quote(BaseModel):
    currency: str

    @field_validator("currency")
    @classmethod
    def known_currency(cls, v):
        if v not in {"USD", "EUR", "GBP"}:
            raise ValueError("unsupported currency")
        return v
\`\`\`
Like \`IValidatableObject\` — for rules types can’t express.

> **.NET ↔ Python:** A Pydantic BaseModel ≈ a record class + DataAnnotations + a validating JSON deserializer, in one. \`Field(ge=0)\` ≈ \`[Range(0, double.MaxValue)]\`; \`parse_raw\` ≈ \`JsonSerializer.Deserialize\` that throws \`ValidationException\` instead of silently producing nulls. FastAPI (reel 48) generates entire API contracts from these classes.

## Where it pays off later
- **Tool calling**: schemas for function parameters (reel 52)
- **Structured output**: enforcing JSON mode responses (reel 27)
- **MCP servers**: tool input contracts (reel 72)
- **RAG records**: validating retrieved chunks (reel 37)

## Gotchas
- Coercion is convenient but can hide model sloppiness — log rejections and fix prompts.
- \`parse_raw\` on huge payloads is slower than dict access; validate once, then pass objects.
- Pydantic v2 is a rewrite — old \`.parse_obj()\` tutorials online may be v1.

Next: reel 16 — pyodbc: Python talking to your SQL Server.
`
});
