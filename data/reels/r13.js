/* Reel 13 — .env & API keys — secrets done right (Python · Python for GenAI) */
SS.registerReel({
  id: 'r13', num: 13, section: 'python', block: 'Python for GenAI',
  title: '.env & API keys — secrets done right',
  hook: 'One leaked API key = **a five-figure cloud bill.** Avoid that.',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE STAKES',
      title: 'Your code will be in a repo. **Your keys must not be.**',
      sub: 'Secrets live in the environment, never in source.',
      narration: 'AI keys are money. Anyone who has your OpenAI key spends your budget, and leaked keys get scraped from GitHub within minutes. The rule is absolute: secrets live in the environment, code reads them from there, and the file holding them never gets committed.'
    },
    {
      type: 'diagram',
      nodes: [
        { e: '📄', t: '.env', s: 'real secrets, git-ignored' },
        { e: '🧾', t: '.env.example', s: 'names only, committed' },
        { e: '🐍', t: 'os.environ', s: 'where Python reads' },
        { e: '🚫', t: '.gitignore', s: 'the seatbelt' }
      ],
      narration: 'The layout. A dot-env file holds the real secrets on your machine — and it is git-ignored, always. A dot-env-dot-example file, committed to the repo, documents the variable names with placeholders. Your code reads the environment through os dot environ, never the file directly at runtime.'
    },
    {
      type: 'compare',
      cards: [
        { e: '😱', t: 'api_key = "sk-abc…"', s: 'hardcoded — ends up on GitHub' },
        { e: '✅', t: 'api_key = os.environ["OPENAI_API_KEY"]', s: 'injected from outside', win: true }
      ],
      narration: 'The wrong way and the right way. Hardcoding the key means it ships in every copy of the source — and someone will commit it. Reading os dot environ injects it from outside the code, so the same script runs in dev, in CI, and in production, each with its own secrets.'
    },
    {
      type: 'list',
      items: [
        { e: '📁', t: '.gitignore: .env', s: 'block it before the first commit' },
        { e: '🧪', t: '.env.example', s: 'committed template with blanks' },
        { e: '📚', t: 'python-dotenv', s: 'loads .env in dev, auto' },
        { e: '🏭', t: 'CI/CD secrets', s: 'GitHub Actions, Azure Key Vault' }
      ],
      narration: 'Four habits. Gitignore the dot-env file — before the first commit, ever. Commit an example file showing which variables exist. The python-dotenv library loads the dot-env file into the environment in dev. And in production, CI pipelines and secret stores like Azure Key Vault inject the real values.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'Keys secured. **Now survive the failures they’ll still cause.**',
      next: 'Next · Reel 14: Errors & retries',
      narration: 'Secrets handled — you won’t be the person who leaks a key. Next: the other production reality — APIs fail, time out, and rate-limit. Errors and retries, done properly with a library called tenacity. Reel fourteen, swipe up.'
    }
  ],

  code: {
    title: '🐍 Secrets from .env, the professional way',
    body:
`# .env  (real values — this file is GIT-IGNORED)
OPENAI_API_KEY=sk-real-key-here
MODEL=gpt-4o

# .env.example  (committed template — same names, no values)
OPENAI_API_KEY=
MODEL=gpt-4o

# app.py
import os
from dotenv import load_dotenv

load_dotenv()  # dev convenience: .env -> os.environ (no-op in production)

api_key = os.environ["OPENAI_API_KEY"]   # KeyError if missing — loud, early
model = os.getenv("MODEL", "gpt-4o")     # .get with a default

# Never print it, never log it:
print(f"Loaded model={model}, key={'***' + api_key[-4:]}")`,
    annot: [
      '<b>load_dotenv()</b> fills os.environ from .env in dev; in production (Docker, CI) real env vars win and .env simply isn’t there.',
      '<b>os.environ["X"]</b> fails loudly on a missing secret; <b>os.getenv("X", default)</b> is the lenient read.',
      'Logging <b>the last 4 characters</b> is the debug-friendly way to confirm a key is loaded without leaking it.'
    ]
  },

  recap: [
    'Secrets in <b>.env</b>, git-ignored — always',
    'Commit <b>.env.example</b> as the variable contract',
    'Code reads <b>os.environ</b>; python-dotenv loads .env in dev'
  ],

  quiz: {
    q: 'A teammate clones the repo and the app crashes with KeyError: OPENAI_API_KEY. What’s the intended fix?',
    opts: [
      'Paste the real key into the source code and push',
      'Copy .env.example to .env and fill in real values locally',
      'Delete the .gitignore entry so .env is shared',
      'Hardcode a fallback key with os.getenv(key, "sk-…")'
    ],
    a: 1,
    why: '.env.example is the onboarding contract: it documents which variables exist without containing secrets. The teammate copies it to .env (git-ignored) and fills in their own values — secrets stay out of the repo, the app finds them in the environment.'
  },

  notes: `
# .env & API keys — secrets done right

## The rule
**Code is public, secrets are private.** Anything committed to a repo should be assumable-public — keys included. Leaked AI keys are found by bots scanning GitHub within minutes and used to burn through your quota.

## The .env pattern

| File | Committed? | Contents |
| --- | --- | --- |
| \`.env\` | **Never** (gitignored) | \`OPENAI_API_KEY=sk-real…\` |
| \`.env.example\` | Yes | Same keys, empty/placeholder values |
| \`app.py\` | Yes | Reads \`os.environ\`, knows no values |

\`\`\`
# .gitignore
.env
\`\`\`

## Reading config
- \`os.environ["X"]\` — required secret; crashes early if missing (good).
- \`os.getenv("X", "default")\` — optional with a fallback.
- \`load_dotenv()\` from \`python-dotenv\` — dev convenience that copies .env into the environment. In production, inject real env vars instead; the call becomes a harmless no-op.

## Where secrets live per environment

| Environment | Mechanism |
| --- | --- |
| Your laptop | \`.env\` + python-dotenv |
| GitHub Actions | Encrypted repo/environment secrets → \${{ secrets.X }} |
| Azure | Key Vault + managed identity (no key strings at all) |
| Docker | \`-e OPENAI_API_KEY=...\` at run time, never baked into the image |

## Cost guardrails (do this today)
- Set **spending limits** at the provider (OpenAI, Azure) — a hard ceiling beats monitoring.
- Scoped keys where offered: separate keys per app, so a leak is contained and revocable.
- Rotate keys the moment one appears in any repo — even a private one — and check usage dashboards for spikes.

> **.NET ↔ Python:** \`Environment.GetEnvironmentVariable("X")\` ≈ \`os.environ["X"]\`. Same discipline as user-secrets in ASP.NET: the .env file ≈ \`secrets.json\`, python-dotenv ≈ the user-secrets tooling, and Key Vault integration works from both stacks.

## Gotchas
- \`git add -f .env\` — the force-flag bypass; it happens under deadline pressure.
- Jupyter notebooks: cell outputs capture printed values — a print of a key persists in the .ipynb JSON.
- .env in a Docker image layer is readable by anyone with image access; pass env vars at \`docker run\`.

Next: reel 14 — errors and retries, because even with perfect keys, the network will fail you.
`
});
