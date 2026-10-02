/* Reel 17 — SQLAlchemy & pandas — the EF Core + LINQ of Python (Python · Python for GenAI) */
SS.registerReel({
  id: 'r17', num: 17, section: 'python', block: 'Python for GenAI',
  title: 'SQLAlchemy & pandas — the EF Core + LINQ of Python',
  hook: 'Stop string-mangling SQL. **Query like it’s LINQ, analyze like it’s Excel-on-steroids.**',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE UPGRADE',
      title: 'Raw SQL was reel 16. **This is how Python actually talks to data.**',
      sub: 'SQLAlchemy for structure. pandas for answers.',
      narration: 'Reel sixteen gave you raw SQL — necessary, but stringy. Real Python data work runs on two libraries: SQLAlchemy, which gives you EF-Core-style models and LINQ-ish queries, and pandas, which turns result sets into in-memory tables you can slice, group, and aggregate without a single SQL string.'
    },
    {
      type: 'compare',
      cards: [
        { e: '🔷', t: 'C#: EF Core + LINQ', s: 'DbContext, IQueryable, .Where().GroupBy()' },
        { e: '🐍', t: 'Python: SQLAlchemy + pandas', s: 'engine, select(), df.groupby()', win: true }
      ],
      narration: 'The mapping you already know. An engine is your connection string made smart. A table definition is your DbSet. Select-with-where is LINQ before it becomes SQL. And a pandas DataFrame is what you’d get if a List of DTOs and a PivotTable had a very capable child.'
    },
    {
      type: 'diagram',
      nodes: [
        { e: '🗄️', t: 'SQL Server', s: 'orders, customers' },
        { e: '🔧', t: 'SQLAlchemy engine', s: 'connection pooling' },
        { e: '📊', t: 'pandas DataFrame', s: 'rows × columns in memory' },
        { e: '📈', t: 'groupby → answer', s: 'aggregations, no SQL' }
      ],
      narration: 'The flow. SQL Server holds the data. SQLAlchemy’s engine manages the connection and hands SQL to the server. Pandas read-sql pulls a result straight into a DataFrame — a table in memory. From there, group-by and aggregate answer your question, and the SQL you wrote is just one select star.'
    },
    {
      type: 'list',
      items: [
        { e: '🔍', t: 'select().where(...)', s: 'queries compile to SQL' },
        { e: '🏗️', t: 'Table("orders", meta, …)', s: 'schema reflected or declared' },
        { e: '🧮', t: 'df.groupby("Region")', s: 'SQL GROUP BY, in memory' },
        { e: '🔗', t: 'df.merge(other)', s: 'SQL JOIN, in memory' }
      ],
      narration: 'The four moves you’ll repeat. Select with where builds SQL from Python expressions — no strings. Table declarations let you reflect an existing schema. Groupby is group-by with method syntax. And merge is a join between two frames — you can pull two tables and join them in memory, fast, without writing any SQL yourself.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'Tables conquered. **Now the file format built for big data.**',
      next: 'Next · Reel 18: Parquet files in Python',
      narration: 'You now query like it’s LINQ and analyze like a spreadsheet wizard. Next: parquet — the columnar file format that AI datasets actually travel in, and the surprising one-liner that reads it. Reel eighteen, swipe up.'
    }
  ],

  code: {
    title: '🐍 SQLAlchemy query → pandas answer',
    body:
`import pandas as pd
from sqlalchemy import create_engine, text

# One engine = pooling + dialect handling (ODBC under the hood)
engine = create_engine(
    "mssql+pyodbc://@sql01/Orders?driver=ODBC+Driver+18&trusted_connection=yes"
)

# Pull a table slice straight into a DataFrame
df = pd.read_sql(
    text("SELECT Region, Product, Qty, UnitPrice FROM Sales WHERE Year = 2025"),
    engine,
)

# From here it's pandas — no more SQL
revenue = df.assign(Amount=df.Qty * df.UnitPrice)
by_region = (
    revenue.groupby("Region", as_index=False)["Amount"]
    .sum()
    .sort_values("Amount", ascending=False)
)
print(by_region.head())

engine.dispose()  # release the pool`,
    annot: [
      '<b>create_engine("mssql+pyodbc://…")</b> — SQLAlchemy picks the dialect and driver; the URL encodes what a connection string did in reel 16.',
      '<b>pd.read_sql(..., engine)</b> is the bridge: SQL result set → DataFrame in one call, dtypes inferred per column.',
      '<b>assign + groupby + sort_values</b> — LINQ-style chains over an in-memory table; nothing hits the database after the read.'
    ]
  },

  recap: [
    '<b>SQLAlchemy engine</b> = connection string + pooling + dialects',
    '<b>pd.read_sql</b> → DataFrame: the SQL-to-pandas bridge',
    '<b>groupby / merge / assign</b> = GROUP BY / JOIN / computed column'
  ],

  quiz: {
    q: 'You need total revenue per region from a 2M-row Sales table. Most efficient shape with these tools?',
    opts: [
      'Read all rows into pandas, then groupby',
      'GROUP BY in SQL (or SQLAlchemy select), pull only the aggregated rows',
      'Read in chunks and merge the chunks, then groupby',
      'Export to CSV first, then load with pandas'
    ],
    a: 1,
    why: 'Aggregate where the data lives: the database reduces 2M rows to a handful of region totals over the wire. Pulling raw rows into pandas ships 2M rows across the network to compute a 10-line answer — right tool, wrong place. (For transformations SQL can’t do, then pull the slice.)'
  },

  notes: `
# SQLAlchemy & pandas — the EF Core + LINQ of Python

## SQLAlchemy Core, in one look
\`\`\`
from sqlalchemy import create_engine, text

engine = create_engine("mssql+pyodbc://@server/DB?driver=ODBC+Driver+18")
with engine.connect() as conn:
    rows = conn.execute(text("SELECT … WHERE Status = :s"), {"s": "Open"})
\`\`\`
- The engine **pools connections** — reuse it; never one engine per query.
- \`text()\` makes SQL explicit; \`:name\` parameters keep you injection-safe.
- The full ORM layer (declarative models, sessions, migrations) mirrors EF Core even closer — worth learning, but for AI glue, Core + pandas is the sweet spot.

## pandas in one look
A DataFrame is a table: labeled columns, typed, in memory.

| You want | You write |
| --- | --- |
| Filter rows | \`df[df.Region == "EU"]\` |
| Computed column | \`df.assign(Amount=df.Qty * df.Price)\` |
| Group + aggregate | \`df.groupby("Region").Amount.sum()\` |
| Join two frames | \`df.merge(other, on="Id")\` |
| Top N | \`df.nlargest(10, "Amount")\` |
| Missing values | \`df.fillna(0)\`, \`df.dropna()\` |

## The mental split
- **SQLAlchemy** = structure and transport (what EF Core + SqlConnection do).
- **pandas** = in-memory analysis (what LINQ-to-objects + a PivotTable do).
- Move aggregation to the database when the table is huge; move it to pandas when the SQL gets gnarly or you need stats/reshaping (reel 34 does this with DuckDB).

> **.NET ↔ Python:** \`create_engine\` ≈ \`DbContext\` options; \`pd.read_sql\` ≈ \`context.Customers.FromSqlRaw\` returning a materialized list; \`groupby\` ≈ \`GroupBy\` + aggregates; \`merge\` ≈ \`Join\`. pandas is eager (no IQueryable laziness) — chains execute as you type them.

## Gotchas
- DataFrames are **memory-resident** — a 20M-row table won’t fit. Filter in SQL first; or use DuckDB (reel 34) which queries parquet/SQL without loading everything.
- \`df.Qty\` attribute access breaks when a column name has spaces — use \`df["Qty"]\`.
- pandas index silently aligns on joins — \`reset_index(drop=True)\` after merges saves confusion.
- SQLAlchemy 2.x syntax (\`text()\`, \`engine.connect()\`) differs from old tutorials; mind the version.

Next: reel 18 — parquet, the columnar format behind every AI dataset.
`
});
