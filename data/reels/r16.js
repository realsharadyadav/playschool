/* Reel 16 — Connect to SQL Server from Python (Python · Python for GenAI) */
SS.registerReel({
  id: 'r16', num: 16, section: 'python', block: 'Python for GenAI',
  title: 'Connect to SQL Server from Python',
  hook: 'Your data lives in SQL Server. **Python can touch it — safely.**',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE BRIDGE',
      title: 'pyodbc: Python ↔ SQL Server **over ODBC.**',
      sub: 'The same driver stack .NET uses under SqlClient.',
      narration: 'Your company’s data is in SQL Server, and that’s not changing. Good news: Python connects through ODBC — the same driver family that powers database connectivity everywhere, including under the hood of plenty of dotnet deployments. The library is pyodbc, and the connection string will look eerily familiar.'
    },
    {
      type: 'diagram',
      nodes: [
        { e: '🐍', t: 'pyodbc', s: 'the Python library' },
        { e: '🔌', t: 'ODBC Driver 18', s: 'Microsoft’s driver' },
        { e: '🗄️', t: 'SQL Server', s: 'your database' },
        { e: '📦', t: 'rows → dicts', s: 'columns by name' }
      ],
      narration: 'The chain. Pyodbc is the thin Python layer. It speaks to Microsoft’s ODBC Driver eighteen — install it once, system-wide. The driver talks TDS to SQL Server itself. And pyodbc hands rows back as tuples with named columns, so result access reads like object properties.'
    },
    {
      type: 'compare',
      cards: [
        { e: '😬', t: 'f-string SQL', s: 'f"WHERE id = {uid}" — injection bait' },
        { e: '🛡️', t: 'parameterized', s: 'cursor.execute(sql, uid) — safe', win: true }
      ],
      narration: 'The one rule above all: never build SQL with f-strings or string concatenation. That’s the oldest injection hole in the book. Parameterized queries — question-mark placeholders, values passed separately — let the driver escape everything. Same rule as SqlParameter in dotnet; same disasters when ignored.'
    },
    {
      type: 'list',
      items: [
        { e: '🔗', t: 'Driver={ODBC Driver 18}', s: 'Server=…;Database=…' },
        { e: '🔐', t: 'Trusted_Connection=yes', s: 'Windows auth, no passwords' },
        { e: '📖', t: 'cursor.execute → fetchall', s: 'SELECT rows as tuples' },
        { e: '🏷️', t: 'row.colname access', s: 'columns by name, not index' }
      ],
      narration: 'The essentials. The connection string names the ODBC driver, server, and database. Trusted connection equals yes uses Windows authentication — no passwords in code, exactly like integrated security in dotnet. Execute then fetch-all for selects. And rows support column-name access, so no brittle index positions.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'Raw SQL works. **Now meet the ORM you’ll actually live in.**',
      next: 'Next · Reel 17: SQLAlchemy & pandas',
      narration: 'You can now read and write your SQL Server from Python — the raw way. For real work you’ll want SQLAlchemy and pandas: the EF Core and LINQ of the Python world. That’s reel seventeen. Swipe up.'
    }
  ],

  code: {
    title: '🐍 pyodbc — read & write SQL Server safely',
    body:
`import pyodbc

# Same ingredients as a .NET connection string
conn = pyodbc.connect(
    "Driver={ODBC Driver 18};"
    "Server=sql01.contoso.local;"
    "Database=Orders;"
    "Trusted_Connection=yes;"
    "Encrypt=yes;TrustServerCertificate=no;"
)

cur = conn.cursor()

# SELECT with a PARAMETER — never f-string the values in
cur.execute("SELECT OrderId, Customer, Total FROM Orders WHERE Status = ?", "Open")
for row in cur.fetchall():
    print(row.Customer, row.Total)     # access columns by NAME

# INSERT, also parameterized — the driver escapes everything
cur.execute(
    "INSERT INTO AuditLog (Action, At) VALUES (?, SYSUTCDATETIME())",
    "python-sync",
)
conn.commit()                          # writes need an explicit commit

cur.close()
conn.close()`,
    annot: [
      '<b>Trusted_Connection=yes</b> = Windows integrated auth — no passwords in connection strings, the "Integrated Security=true" of ODBC.',
      '<b>Parameter placeholders (?)</b> with values passed separately — the driver handles escaping; this is SqlParameter, not string.Format.',
      '<b>conn.commit()</b> — pyodbc does not autocommit; forgetting this silently rolls back your writes.'
    ]
  },

  recap: [
    '<b>pyodbc + ODBC Driver 18</b> = Python’s SqlClient',
    '<b>Trusted_Connection=yes</b> — Windows auth, no passwords',
    'Always <b>parameterized queries</b>; don’t forget commit()'
  ],

  quiz: {
    q: 'Why is cursor.execute("... WHERE Id = ?", user_id) safe while f"... WHERE Id = {user_id}" is not?',
    opts: [
      'The ? version runs faster on the server',
      'The driver treats the value as data, not SQL text — no injection possible',
      'f-strings are disabled for SQL by Python itself',
      'The ? version encrypts the query on the wire'
    ],
    a: 1,
    why: 'With a parameter placeholder, user input is sent as a separate data value; the database never parses it as SQL. An f-string bakes the input into the SQL text itself — a crafted user_id becomes executable SQL. Parameterization is the fix, exactly like SqlParameter in ADO.NET.'
  },

  notes: `
# Connect to SQL Server from Python

## Setup
1. Install the driver once (system level): **Microsoft ODBC Driver 18 for SQL Server** — available for Windows, macOS, and Linux.
2. \`pip install pyodbc\`.
3. Connect with a connection string whose vocabulary you already know from dotnet.

| .NET connection string | pyodbc equivalent |
| --- | --- |
| \`Data Source=sql01\` | \`Server=sql01\` |
| \`Initial Catalog=Orders\` | \`Database=Orders\` |
| \`Integrated Security=true\` | \`Trusted_Connection=yes\` |
| \`Encrypt=true\` | \`Encrypt=yes\` |
| \`User Id=…;Password=…\` | \`Uid=…;Pwd=…\` |

## Reading data

\`\`\`
cur.execute("SELECT Id, Name FROM Customers WHERE Region = ?", "EU")
rows = cur.fetchall()          # list of Row objects
for r in rows:
    print(r.Name)              # column access by name
\`\`\`
Also: \`fetchone()\` for one row, \`fetchmany(n)\` for batches, \`cur.description\` for column metadata.

## Writing data
- pyodbc defaults to **manual commit** — call \`conn.commit()\` or your writes vanish. (\`autocommit=True\` on connect for DDL.)
- Batch inserts: \`cur.fast_executemany = True\` before \`executemany(sql, rows)\` — dramatically faster for bulk loads.

> **.NET ↔ Python:** pyodbc ≈ raw ADO.NET/SqlClient — explicit connection, cursor, execute, fetch. There’s no ORM here; that’s reel 17 (SQLAlchemy ≈ EF Core) and pandas ≈ LINQ-to-DataTable with superpowers. In async code (reel 12), wrap pyodbc calls in \`asyncio.to_thread(...)\` — the driver itself is blocking.

## When the driver is a wall
ODBC works, but two modern alternatives: \`pymssql\` (pure-TDS, simpler in containers) and Microsoft’s own \`mssql-python\` (ODBC-based, official). For pandas-scale analytics, reel 17’s \`read_sql\` wraps all of this.

## Gotchas
- \`No module named 'pyodbc'\` after pip — usually a Python/driver architecture mismatch (64-bit both).
- \`SSL Provider error\` — Driver 18 defaults to Encrypt=yes; add the TrustServerCertificate setting consciously, not reflexively.
- DateTime2 vs DateTime parameters sometimes need explicit binding — \`CAST(? AS datetime2)\` is the pragmatic escape hatch.
- Forgetting \`conn.close()\` leaks cursors; use \`with pyodbc.connect(...) as conn:\` — it commits on clean exit, rolls back on exceptions.

Next: reel 17 — SQLAlchemy & pandas, where SQL stops being string-mangling.
`
});
