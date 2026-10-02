/* Reel 18 — Parquet files in Python (Python · Python for GenAI) */
SS.registerReel({
  id: 'r18', num: 18, section: 'python', block: 'Python for GenAI',
  title: 'Parquet files in Python',
  hook: 'CSV is for humans. **AI datasets travel as parquet.**',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE FORMAT',
      title: 'CSV is a text file. **Parquet is a database page.**',
      sub: 'Columnar, typed, compressed — built for analytics.',
      narration: 'Here’s the format gap nobody warns you about. CSV is a text format: every row repeats its types, numbers parse on read, and half the file is commas. Parquet is columnar and binary: values stored by column, strongly typed, compressed by default. Same data, a tenth the size, ten times the read speed.'
    },
    {
      type: 'compare',
      cards: [
        { e: '📄', t: 'CSV', s: 'text, row-based, types re-parsed, 10× bigger' },
        { e: '🗜️', t: 'Parquet', s: 'binary, columnar, typed, compressed', win: true }
      ],
      narration: 'Side by side. CSV reads row by row, converting text to numbers every time — slow and lossy. Parquet stores each column together, so reading one column skips the rest entirely. That’s why a fifty-megabyte CSV becomes five megabytes, and why pipelines that took minutes take seconds.'
    },
    {
      type: 'list',
      items: [
        { e: '🐼', t: 'df.to_parquet()', s: 'pandas writes it in one call' },
        { e: '📥', t: 'pd.read_parquet()', s: 'back to a DataFrame' },
        { e: '🦆', t: 'DuckDB queries it', s: 'SQL over files (reel 34)' },
        { e: '🧬', t: 'Vectors live here', s: 'embeddings stored per column' }
      ],
      narration: 'The toolkit. Pandas writes parquet with one method, reads it back with one call — the round trip is free. DuckDB runs SQL directly over parquet files without loading them. And here’s the AI tie-in: embedding pipelines store vector columns in parquet all the time — you’ll build exactly that in reels thirty-three and thirty-four.'
    },
    {
      type: 'diagram',
      nodes: [
        { e: '📊', t: 'DataFrame', s: 'rows × typed columns' },
        { e: '🗜️', t: 'to_parquet', s: 'column chunks, compressed' },
        { e: '📁', t: 'data.parquet', s: 'one portable binary file' },
        { e: '🚀', t: 'read back', s: 'types intact, no parsing' }
      ],
      narration: 'The round trip. Your DataFrame — typed columns in memory — serializes into column chunks, each compressed with the codec that fits its data. One portable file comes out. Reading back restores the exact types: dates as dates, floats as floats, no parsing ambiguity, ever.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'Files mastered. **Time for the magic trick: SQL written by a model.**',
      next: 'Next · Reel 19: Let the LLM write SQL — safely',
      narration: 'Parquet closes the data-formats loop — one more tool and your Python foundation is complete. The finale: letting an LLM write SQL against your database, without dropping your Customers table. Reel nineteen, swipe up.'
    }
  ],

  code: {
    title: '🐍 Parquet round trip with pandas',
    body:
`import pandas as pd

df = pd.DataFrame({
    "id":        [1, 2, 3],
    "title":     ["refund policy", "pricing", "bug report"],
    "embedding": [[0.11, 0.98, 0.02], [0.45, 0.51, 0.74], [0.07, 0.19, 0.95]],
    "created":   pd.to_datetime(["2026-01-05", "2026-02-11", "2026-03-02"]),
})

df.to_parquet("tickets.parquet", index=False)   # typed + compressed

back = pd.read_parquet("tickets.parquet")
print(back.dtypes)          # datetime64, object/vector, int64 — preserved
print(back["embedding"][0]) # [0.11, 0.98, 0.02] — no string parsing

# Column pruning: read ONLY the columns you need
titles = pd.read_parquet("tickets.parquet", columns=["id", "title"])`,
    annot: [
      '<b>to_parquet / read_parquet</b> — the entire API; pyarrow does the heavy lifting (install: pip install pyarrow).',
      '<b>Types survive the round trip</b>: datetimes stay datetimes, vectors stay lists — CSV would flatten all of this to text.',
      '<b>columns=[...]</b> reads only some columns — the columnar superpower; huge files open instantly when you need two of forty columns.'
    ]
  },

  recap: [
    'Parquet = <b>columnar + typed + compressed</b> binary',
    '<b>df.to_parquet() / pd.read_parquet()</b> — one-call round trip',
    'Read <b>subset of columns</b> without loading the file'
  ],

  quiz: {
    q: 'You have a 40 GB parquet of ticket data and only need the "title" column. Why is parquet faster than CSV here?',
    opts: [
      'Parquet decompresses the whole file faster than CSV parses',
      'Column storage lets the reader fetch only the title column’s chunks',
      'CSV readers can only process whole lines, but parquet skips lines',
      'Parquet files are always smaller so the disk read dominates'
    ],
    a: 1,
    why: 'In a columnar file, each column is stored in its own chunks. The reader seeks to the title chunks and ignores the rest — I/O drops from 40 GB to maybe a few hundred MB. Row-based CSV forces a full-file scan because every line interleaves all columns.'
  },

  notes: `
# Parquet files in Python

## What parquet is
A binary, columnar storage format from the Hadoop world, now the default for data lakes, ML datasets, and — importantly for this course — **embedding stores**. A file holds row groups; each row group stores columns as typed, compressed chunks with statistics (min/max per chunk) that let readers skip data.

## CSV vs parquet, honestly

| | CSV | Parquet |
| --- | --- | --- |
| Encoding | text | binary, typed |
| Layout | row-based | column-based |
| Size | big (repeated syntax) | ~10× smaller (compression) |
| Schema | inferred (badly) on read | embedded, exact |
| Partial reads | no (scan everything) | yes (column pruning, row-group skipping) |
| Human readable | yes | no — that’s fine |

## The Python API
\`\`\`
import pandas as pd

df.to_parquet("out.parquet", index=False)   # needs: pip install pyarrow
df = pd.read_parquet("out.parquet")
df = pd.read_parquet("out.parquet", columns=["id", "title"])
\`\`\`
For files too big for memory, stop using pandas and query with **DuckDB** (reel 34): \`duckdb.sql("SELECT … FROM 'out.parquet'")\` — SQL over the file without loading it.

## Parquet in the AI pipeline
- **Embedding exports**: \`{"id", "text", "embedding": [floats]}\` rows — reels 33/34 build this.
- **Fine-tuning datasets**: OpenAI and Hugging Face accept parquet uploads.
- **Interchange**: polars, DuckDB, Spark, pandas all read the same file — no export-import drift.

> **.NET ↔ Python:** There’s no .NET-native parquet in the BCL; ParquetSharp and Parquet.Net exist, but the ecosystem gravity is Python-side. In mixed teams, the pragmatic split: .NET serves data, Python writes parquet, everyone reads parquet. Arrow (pyarrow) is also the in-memory format pandas uses, and it has a C# implementation (Apache.Arrow) for zero-copy interop.

## Gotchas
- \`ImportError\` on write — pandas needs the \`pyarrow\` (or fastparquet) engine installed.
- Nested/vector columns: lists of floats round-trip fine as \`object\` dtype; true tensor columns live better in Arrow.
- Don’t hand-edit parquet — it’s binary. View with \`parquet-tools\`, DuckDB, or pandas.
- Many small parquet files are an anti-pattern; consolidate into row-grouped files.

Next: reel 19 — the finale: LLM-written SQL, with guardrails.
`
});
