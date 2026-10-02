/* Reel 27 — Structured output & JSON mode (GenAI · Core Concepts) */
SS.registerReel({
  id: 'r27', num: 27, section: 'genai', block: 'Core Concepts',
  title: 'Structured output & JSON mode',
  hook: '“Just return JSON” works 95% of the time. **Production needs the other 5%.**',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE 5% PROBLEM',
      title: 'Parse failures are **the tax on unstructured output.**',
      sub: 'Prose wrappers, trailing commas, code fences — every pipeline hits them.',
      narration: 'Ask for JSON in a plain prompt and you’ll usually get it — until you don’t. A code fence appears. A comma dangles. The model appends “Let me know if you need anything else!” after the closing brace. Every one of those is a parse exception in production, at two a.m. Structured output is how you make the machine guarantee the shape.'
    },
    {
      type: 'diagram',
      nodes: [
        { e: '📜', t: 'JSON schema', s: 'your Pydantic model' },
        { e: '🤖', t: 'API constrains tokens', s: 'only schema-valid next tokens' },
        { e: '📦', t: 'valid JSON, always', s: 'guaranteed shape' },
        { e: '🐍', t: 'parse → object', s: 'Model.parse_obj', win: true }
      ],
      narration: 'How structured output actually works — and it’s clever. You send a JSON schema, the one your Pydantic model generates. The API then constrains generation at the TOKEN level: the model physically cannot emit a token that would break the schema. The result isn’t probably-valid JSON; it’s constrained to be.'
    },
    {
      type: 'compare',
      cards: [
        { e: '🙏', t: '“Return JSON only”', s: 'hope-based engineering' },
        { e: '🛡️', t: 'response_format=json_schema', s: 'grammar-constrained, enforced', win: true }
      ],
      narration: 'The two philosophies. Prompt-only JSON is a request; the model can still wander. Structured output is enforcement — response format set to the schema means the output is valid by construction, and you skip the entire class of “it wrapped it in markdown” bugs. Same model, radically different reliability.'
    },
    {
      type: 'list',
      items: [
        { e: '🧬', t: 'Pydantic → schema', s: 'model_json_schema() for free' },
        { e: '🥉', t: 'json_object mode', s: 'valid JSON, any shape' },
        { e: '🥇', t: 'json_schema mode', s: 'valid AND shaped — prefer this' },
        { e: '🧊', t: 'temperature 0', s: 'determinism pairs with structure' }
      ],
      narration: 'The levels. Pydantic generates your schema for free — reel fifteen’s models just plug in. The middle tier, JSON-object mode, guarantees valid JSON but any shape. The gold tier, JSON-schema mode, constrains to your exact fields — prefer it when available. And pair both with temperature zero.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'Formats enforced. **Now the failure you can’t enforce away.**',
      next: 'Next · Reel 28: Hallucination — why models invent facts',
      narration: 'Structure: solved at the grammar level. But a perfectly-shaped JSON can still contain a perfectly-shaped LIE. Next reel: hallucination — why models invent facts, and the three defenses that actually work. Reel twenty-eight, swipe up.'
    }
  ],

  code: {
    title: '🐍 Schema-constrained extraction with Pydantic',
    body:
`import httpx
from pydantic import BaseModel, Field

class Invoice(BaseModel):
    vendor: str = Field(min_length=1)
    amount: float = Field(ge=0)
    currency: str = "USD"
    is_paid: bool

schema = Invoice.model_json_schema()      # Pydantic -> JSON Schema, free

resp = httpx.post(
    "http://localhost:11434/v1/chat/completions",
    json={
        "model": "llama3.1",
        "messages": [{"role": "user",
                      "content": "Extract: Acme invoice, $1,250.00, paid."}],
        "temperature": 0.0,
        "response_format": {                     # grammar-level enforcement
            "type": "json_schema",
            "json_schema": {"name": "Invoice", "schema": schema},
        },
    },
    timeout=60,
)

text = resp.json()["choices"][0]["message"]["content"]
inv = Invoice.parse_raw(text)             # still validate — cheap insurance
print(inv.vendor, inv.amount, inv.is_paid)`,
    annot: [
      '<b>model_json_schema()</b> — the bridge between reel 15 and this one: your validation classes ARE the API contract.',
      '<b>response_format json_schema</b> — the API constrains tokens to the grammar; invalid JSON becomes physically un-emit-able, not unlikely.',
      '<b>parse_raw anyway</b> — belt and suspenders: constraints live in the provider’s stack; your Pydantic gate survives provider quirks and local models.'
    ]
  },

  recap: [
    '<b>json_schema mode</b>: valid AND shaped — gold tier',
    '<b>Pydantic → model_json_schema()</b> — your class is the contract',
    'Still <b>parse and validate</b> on your side — structure ≠ truth'
  ],

  quiz: {
    q: 'What makes API-level structured output (json_schema mode) more reliable than prompting “return JSON only”?',
    opts: [
      'It runs the model at temperature zero automatically',
      'Generation is constrained at the token level — schema-breaking tokens can’t be emitted',
      'It retries automatically until the output parses',
      'It uses a separate, more careful model'
    ],
    a: 1,
    why: 'Structured output applies a grammar constraint during sampling: candidate tokens that would violate the schema get zero probability. Invalid JSON becomes impossible rather than improbable — a fundamentally stronger guarantee than any instruction, which is why it kills the “prose wrapper / trailing garbage” failure class.'
  },

  notes: `
# Structured output & JSON mode

## The reliability ladder

| Level | Mechanism | Guarantee |
| --- | --- | --- |
| 0 | “Return JSON” in prompt | vibes |
| 1 | Few-shot JSON examples | format likely |
| 2 | \`json_object\` mode | valid JSON, any shape |
| 3 | \`json_schema\` mode | valid JSON, YOUR shape |

Climb as high as your provider allows. Level 3 is the default for extraction in production.

## Working the levels
- **Level 0–1** (fallbacks): extract the first \`{\` … last \`}\` and parse; on failure, retry once with a repair prompt (“your output had trailing text, return only the JSON object”).
- **Level 2**: \`response_format={"type": "json_object"}\` — pairs with “JSON in, JSON out” messaging requirements on some APIs.
- **Level 3**: pass \`{"type": "json_schema", "json_schema": {"name": ..., "schema": ...}}\`. Generate the schema from Pydantic (\`model_json_schema()\`) — single source of truth for prompt, API constraint, and your parser.

## Design tips for extraction schemas
- Make fields **required with defaults** rather than optional-everywhere — defaults absorb model uncertainty gracefully.
- Enums pin categorical outputs (\`"status": {"enum": ["open", "closed"]}\`) — better than free-text.
- Keep nesting shallow; deep schemas degrade constraint quality on some providers.
- \`additionalProperties: false\` (Pydantic: \`model_config = ConfigDict(extra="forbid")\`) catches field-name drift early.

## Limits — structure is not truth
A schema-constrained model will confidently produce \`{"amount": 125000.0}\` from an invoice that said 1,250.00. Structured output guarantees **shape**, not **accuracy**. Truth controls:
- cross-check numbers against the source text (re-ask: “quote the exact substring this came from”)
- retrieval grounding (reel 36) — restrict claims to provided context
- spot-check evals (reel 47)

> **.NET ↔ Python:** Same pattern in C#: define the record, serialize its \`JsonSchema\` (System.Text.Json has schema exporters), pass it as \`response_format\`. The token-constraint machinery lives server-side, so the guarantee is stack-independent.

Next: reel 28 — hallucination: the failure mode structure can’t fix.
`
});
