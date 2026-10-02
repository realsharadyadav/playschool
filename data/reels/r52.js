/* Reel 52 — Tools — function calling deep dive (Agentic · Agent Fundamentals) */
SS.registerReel({
  id: 'r52', num: 52, section: 'agentic', block: 'Agent Fundamentals',
  title: 'Tools — function calling deep dive',
  hook: 'The model asks. **Your code executes.** The contract that makes agents real.',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE MECHANISM',
      title: 'Function calling: the model **emits a request**, your code runs it.',
      sub: 'No code execution inside the model. Ever. The API is a wire format.',
      narration: 'The single most misunderstood mechanism in agents — clarified once and for all. The model does NOT execute code. It cannot. What it does: given a list of tool SCHEMAS in the prompt, it can emit a structured REQUEST — call this function, with these arguments — as part of its output. Your code receives that request, validates it, executes the real function, and feeds the result back. The model proposes; your runtime disposes.'
    },
    {
      type: 'chat',
      bubbles: [
        { who: 'bot', text: 'get_weather', tool: '{"city": "Paris", "units": "celsius"}' },
        { who: 'bot', text: 'TOOL RESULT: Paris: 21C, clear', tool: 'observation' },
        { who: 'bot', text: 'It’s 21 degrees and clear in Paris.' }
      ],
      narration: 'The wire protocol, one exchange. The model’s turn contains a tool-call block — function name, JSON arguments — instead of prose. Your runtime runs get-weather with Paris and celsius, and appends the result as a tool message. On the next turn the model finally speaks prose, armed with real data. Two model calls, one tool execution, one truthful answer.'
    },
    {
      type: 'list',
      items: [
        { e: '📜', t: 'Schema in prompt', s: 'name, description, JSON schema' },
        { e: '📤', t: 'finish_reason: tool_calls', s: 'the request signal' },
        { e: '✅', t: 'Validate arguments', s: 'Pydantic before execution (reel 15)' },
        { e: '🛡️', t: 'Authorize', s: 'read vs write, allow-lists (reel 60)' }
      ],
      narration: 'The four stages, professionally done. One: the schema — function name, description, parameter types — goes into the API call, and the description is what the model reads to choose WHEN to call. Two: the response carries finish-reason tool-calls, signaling a request instead of an answer. Three: validate arguments with Pydantic BEFORE execution — never trust a probabilistic generator with a live function. Four: authorize — is this tool allowed for this user, this session, this argument?'
    },
    {
      type: 'compare',
      cards: [
        { e: '⚡', t: 'Native tool calling', s: 'API-level: schemas, structured requests, tool role' },
        { e: '🧵', t: 'DIY JSON protocol', s: 'prompt a JSON reply, parse it yourself' }
      ],
      narration: 'Two implementations, one idea. Native tool calling — supported by OpenAI, Anthropic, Ollama — bakes the mechanism into the API: schema parameters, structured tool-call output, a dedicated tool role for results. DIY — from reel fifty-one’s loop — prompts for JSON and parses it yourself; more control, more failure modes. Native everywhere it’s available; DIY when the model or provider doesn’t support it, or when you need exotic routing.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'Mechanism mastered. **Now design tools worth calling.**',
      next: 'Next · Reel 53: Designing good tools',
      narration: 'You now own the full contract: schema, request, validation, execution, observation. But a mechanism is only as good as its tools — and tool DESIGN is a craft of its own: naming, granularity, error contracts. That’s the next reel. Swipe up.'
    }
  ],

  code: {
    title: '🐍 Function calling, end to end, safely',
    body:
`import json
import httpx
from pydantic import BaseModel, Field

class GetWeather(BaseModel):
    city: str = Field(min_length=1)
    units: str = "celsius"

def get_weather(city: str, units: str = "celsius") -> str:
    return f"{city}: 21 degrees {units}"

TOOLS = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Get current weather for a city.",
        "parameters": GetWeather.model_json_schema(),   # reel 27's bridge
    },
}]

resp = httpx.post(
    "http://localhost:11434/v1/chat/completions",
    json={"model": "llama3.1",
          "messages": [{"role": "user", "content": "Weather in Paris?"}],
          "tools": TOOLS, "temperature": 0.0},
    timeout=60,
)
msg = resp.json()["choices"][0]["message"]

if msg.get("tool_calls"):                            # the request
    call = msg["tool_calls"][0]["function"]
    args = GetWeather(**json.loads(call["arguments"]))  # VALIDATE first
    result = get_weather(**args.model_dump())           # then execute
    print("TOOL RESULT:", result)`,
    annot: [
      '<b>GetWeather.model_json_schema()</b> — the reel-27 bridge again: your validation class generates the API contract.',
      '<b>GetWeather(**json.loads(...))</b> — validate BEFORE execute; bad arguments die here, never inside your live function.',
      '<b>temperature 0.0</b> — tool-call selection is routing logic; entropy here is misrouting, not creativity.'
    ]
  },

  recap: [
    'Model <b>requests</b>; your runtime <b>validates, authorizes, executes</b>',
    'Native API support: <b>schemas in, tool_calls out, tool role back</b>',
    '<b>Pydantic before execution</b> — every time, no exceptions'
  ],

  quiz: {
    q: 'The model emits get_weather with arguments {"city": 123}. What should your runtime do?',
    opts: [
      'Call the function anyway — Python will coerce it',
      'Reject via Pydantic validation and return the validation error as the tool result for the model to fix',
      'Silently replace 123 with a default city',
      'Crash the agent loop and alert on-call'
    ],
    a: 1,
    why: 'The model is a probabilistic argument generator; bad types WILL occur. Pydantic catches city=123 as invalid before execution (no live call with garbage), and feeding the validation error back as the tool observation lets the model self-correct on the next step — graceful degradation instead of a crash or, worse, a coerced wrong call.'
  },

  notes: `
# Tools — function calling deep dive

## The wire format (OpenAI-style, now near-universal)
Request:
\`\`\`
"tools": [{"type": "function",
           "function": {"name": "get_weather",
                        "description": "...",
                        "parameters": { /* JSON Schema */ }}}]
\`\`\`
Response (when calling):
\`\`\`
"message": {
  "role": "assistant",
  "tool_calls": [{"id": "call_1",
                  "function": {"name": "get_weather",
                               "arguments": "{\"city\": \"Paris\"}"}}]
}
"finish_reason": "tool_calls"
\`\`\`
Result message:
\`\`\`
{"role": "tool", "tool_call_id": "call_1", "content": "Paris: 21C"}
\`\`\`

## The execution contract (do these in order, every time)
1. **Parse** \`arguments\` (JSON string → dict — reel 4).
2. **Validate** against the schema — Pydantic (reel 15).
3. **Authorize** — user/session allowed? read or write? rate limits (reel 60).
4. **Execute** — with your own timeout/retry policy (reel 14).
5. **Report** — return result or a CLEAN error string as the tool observation.

Errors are observations too: “city must be a string; you sent 123” lets the model recover; a stack trace teaches it nothing.

## Parallel tool calls
Modern APIs return MULTIPLE tool_calls per turn. Run them concurrently (reel 12’s gather), return one tool message per call-id. Disable parallelism for write-tools whose order matters.

## Common failure modes

| Symptom | Cause | Fix |
| --- | --- | --- |
| Model never calls tools | descriptions vague/absent | write when-to-use into the description (reel 53) |
| Wrong tool chosen | overlapping tool purposes | consolidate/ disambiguate names |
| Argument schema errors | schema too loose/tight | required fields, enums, Field constraints |
| Model hallucinates tool results | tool result omitted from context | verify tool_call_id round-trips |
| Infinite call loops | no progress signal | cap steps; include attempt counts in context |

> **.NET ↔ Python:** native function calling exists in the OpenAI/Anthropic .NET SDKs — same wire format. The Python advantage is the surrounding tooling (auto-schema from docstrings, MCP servers — reel 72); the contract is identical either way.

Next: reel 53 — designing good tools: the difference between a callable and a usable API.
`
});
