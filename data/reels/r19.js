/* Reel 19 — Let the LLM write SQL — safely (Python · Python for GenAI) */
SS.registerReel({
  id: 'r19', num: 19, section: 'python', block: 'Python for GenAI',
  title: 'Let the LLM write SQL — safely',
  hook: 'Text-to-SQL is real. **So is the DROP TABLE risk.** Guard it.',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE FINALE',
      title: 'Give the model your schema. **Get SQL back. Verify before it runs.**',
      sub: 'The pattern that closes the Python section.',
      narration: 'The finale of the Python section — and the first real GenAI pattern. You hand the model your table schemas, it writes the SQL, you run it. This is text-to-SQL, and it genuinely works. But a model can also hallucinate a delete statement. So the pattern has three rails: minimal schema, read-only enforcement, and execution on YOUR terms.'
    },
    {
      type: 'diagram',
      nodes: [
        { e: '🗄️', t: 'schema snapshot', s: 'tables + columns, no data' },
        { e: '🤖', t: 'LLM writes SQL', s: 'from the schema in the prompt' },
        { e: '🛡️', t: 'guardrails', s: 'SELECT-only, block-list' },
        { e: '▶️', t: 'execute', s: 'read replica, limited rows' }
      ],
      narration: 'The pipeline. First, a schema snapshot — table and column names, no sensitive rows — goes into the prompt. The model returns SQL. Guardrails check it: statement must start with select, no forbidden keywords like drop or truncate. Only then does it execute, against a read replica, row-limited.'
    },
    {
      type: 'compare',
      cards: [
        { e: '😱', t: 'exec(model_sql)', s: 'trust the model completely — no' },
        { e: '✅', t: 'validate → then execute', s: 'regex gate + read-only user + LIMIT', win: true }
      ],
      narration: 'The two philosophies. Blind execution trusts a probabilistic text generator with production data — what could go wrong, everything. The professional version treats the model as an intern who writes drafts: a validator checks the shape, a read-only database user caps the blast radius, and a limit clause caps the rows.'
    },
    {
      type: 'list',
      items: [
        { e: '📸', t: 'Schema, not data', s: 'names & types only in the prompt' },
        { e: '🔒', t: 'Read-only DB user', s: 'GRANT SELECT — enforced by SQL' },
        { e: '🚧', t: 'Keyword block-list', s: 'DROP, DELETE, UPDATE, ATTACH…' },
        { e: '📏', t: 'LIMIT always', s: 'append if the model didn’t' }
      ],
      narration: 'The four guardrails. Send the schema — names and types — never rows with customer data. Connect as a read-only user so even a perfect injection can’t write. Block-list the dangerous keywords before execution. And force a limit, because a runaway join on a big table is a denial-of-service all by itself.'
    },
    {
      type: 'bridge', kicker: 'SECTION COMPLETE',
      title: 'Python: done. **Next up — how the models themselves work.**',
      next: 'Next · Reel 20: What is GenAI? — intuition first',
      narration: 'That’s nineteen reels of Python for the dotnet developer — you can now call APIs, stream, retry, validate, query SQL Server, and even deputize an LLM to write your SQL. Next section: GenAI itself. What these models are, starting with pure intuition. Reel twenty, swipe up.'
    }
  ],

  code: {
    title: '🐍 Guarded text-to-SQL, end to end',
    body:
`import re
import httpx

SCHEMA = """
Orders(OrderId int, Customer nvarchar(100), Total money, Status nvarchar(20))
Customers(CustomerId int, Name nvarchar(100), Region nvarchar(50))
"""

SYSTEM = f"""You write SQL Server SQL for this schema:
{SCHEMA}
Rules: SELECT only. Always end with a LIMIT-style TOP 100."""

FORBIDDEN = re.compile(r"\b(drop|delete|update|insert|alter|truncate|exec|attach)\b", re.I)

def to_sql(question: str) -> str:
    resp = httpx.post(
        "http://localhost:11434/v1/chat/completions",
        json={"model": "llama3.1",
              "messages": [{"role": "system", "content": SYSTEM},
                           {"role": "user", "content": question}]},
        timeout=60,
    )
    return resp.json()["choices"][0]["message"]["content"].strip()

def guard(sql: str) -> str:
    if FORBIDDEN.search(sql):
        raise ValueError("unsafe statement rejected")
    if not re.match(r"^\s*select\b", re.I, sql):
        raise ValueError("only SELECT allowed")
    if "top " not in sql.lower():
        sql = sql.replace("select", "SELECT TOP 100", 1)
    return sql

sql = guard(to_sql("top customers by total spend"))
# run it via the read-only connection from reel 16/17 — as a SELECT-only user`,
    annot: [
      '<b>Schema in the system prompt</b>, data never — the model needs names and types, not your customers’ rows.',
      '<b>FORBIDDEN regex + SELECT-only check</b> — validation happens in YOUR code, before the DB ever sees the statement.',
      '<b>Force TOP 100</b> — a belt-and-suspenders row cap; the read-only DB user (reel 16) is the other belt.'
    ]
  },

  recap: [
    'Schema in the prompt — <b>data never</b>',
    '<b>SELECT-only + block-list</b> validation before execution',
    'Run as a <b>read-only DB user</b>, always row-limited'
  ],

  quiz: {
    q: 'Which guardrail actually protects you when the LLM outputs "DROP TABLE Orders" despite instructions?',
    opts: [
      'A strongly-worded system prompt',
      'The keyword block-list + SELECT-only validation in your code',
      'Using a cheaper model so failures cost less',
      'Asking the model to double-check its own SQL'
    ],
    a: 1,
    why: 'Prompts reduce bad output probability; they guarantee nothing — models are not deterministic. The enforcement layer is code: regex/AST validation rejecting anything that isn’t a SELECT, plus a read-only database user so even a bypass can’t write. Defense in depth, with the DB permissions as the last wall.'
  },

  notes: `
# Let the LLM write SQL — safely

## Why this pattern is worth the ceremony
Analysts wait days for a SQL query; a model writes a decent one in four seconds from a schema. Text-to-SQL is one of the highest-ROI GenAI deployments — IF the failure modes are contained. The failures are: hallucinated columns, destructive statements, and cartesian joins.

## The safe pipeline
1. **Schema snapshot**: \`SELECT table_name, column_name, data_type FROM INFORMATION_SCHEMA.COLUMNS\` — ship names and types only.
2. **Constrained prompt**: “SELECT only, TOP 100 always, schema: …”
3. **Validation gate** (your code):
   - Must match \`^\s*select\b\` (case-insensitive).
   - Must not match the forbidden-keyword regex.
   - Must contain a row cap; inject \`TOP 100\` if absent.
   - (Better than regex: parse with \`sqlparse\` and inspect the AST — but regex is the pragmatic v1.)
4. **Execution context**: read-only DB user, ideally a replica, with statement timeout set.

## Defense in depth

| Layer | Stops |
| --- | --- |
| System prompt rules | casual bad output |
| Keyword validation | obvious destructive SQL |
| Read-only DB user | everything that isn’t SELECT — even clever injection |
| TOP/limit + timeout | runaway resource usage |
| Replica | any lingering perf paranoia |

Prompts are probabilistic; permissions are deterministic. Bet on permissions.

## Making it better
- **Few-shot examples** in the prompt (reel 26): two example question→SQL pairs lift accuracy more than any instruction tweak.
- **Dialect discipline**: name the engine in the prompt (“T-SQL, SQL Server”) or it’ll write Postgres-isms.
- **Column-name verification**: reject SQL mentioning columns that don’t exist in the snapshot — catches hallucinations pre-execution.
- **Self-correction loop**: on a SQL error, feed the error back and retry once (reel 56’s reflection pattern).

> **.NET ↔ Python:** This reel composes everything from the last six: httpx (11), tenacity (14), Pydantic (15), pyodbc/SQLAlchemy (16/17). The same architecture ports to C# verbatim — the guardrail logic is plain regex and string work. What Python adds is the fast iteration loop.

## Where it goes next
Reel 52 generalizes “model writes code you validate” into tool calling; reel 66 turns this exact pattern into an SOP-following Excel agent with a human approval step.

That completes the Python section. Next: GenAI fundamentals — what a model even is. Reel 20.
`
});
