/* Reel 10 — Build & share your own library (Python · Python for GenAI) */
SS.registerReel({
  id: 'r10', num: 10, section: 'python', block: 'Python for GenAI',
  title: 'Build & share your own library',
  hook: 'Every AI team ends up with a shared toolkit. **Ship yours like a pro.**',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE PATTERN',
      title: 'Your helpers folder is a library. **Package it once, install it everywhere.**',
      sub: 'pyproject.toml replaces the whole csproj + NuGet pipeline.',
      narration: 'Real talk: within a month of AI work, you’ll have a folder of helpers — prompt builders, retry wrappers, token counters — copied between scripts. That folder is a library waiting to happen. And packaging a Python library is one file. Reel nine’s package, plus one config, equals pip-installable.'
    },
    {
      type: 'arch',
      layers: [
        { e: '📦', t: 'src/aihelpers/', s: 'the package: prompt.py, retry.py…' },
        { e: '🧾', t: 'pyproject.toml', s: 'name, version, dependencies' },
        { e: '⚙️', t: 'pip install -e .', s: 'editable install, live reload' },
        { e: '🚀', t: 'pip install aihelpers', s: 'from Git, a wheel, or PyPI' }
      ],
      narration: 'The stack, top to bottom. Your source folder holds the package. One pyproject dot toml declares the name, version, and dependencies. Pip install dash-e-dot puts it on your machine in editable mode — changes to the source are live instantly. And when it’s ready, anyone can pip install it straight from Git or a private index.'
    },
    {
      type: 'compare',
      cards: [
        { e: '🔷', t: 'C#: csproj + NuGet', s: 'project file, strong naming, feed setup' },
        { e: '🐍', t: 'Python: one TOML file', s: 'pyproject.toml — build backend included', win: true }
      ],
      narration: 'Compare the ceremony. A C-sharp library needs a csproj, version properties, and a NuGet feed before anyone can consume it. Python’s pyproject dot toml does all of that in about ten lines, and pip can install directly from a Git URL — no feed server required.'
    },
    {
      type: 'list',
      items: [
        { e: '📛', t: 'name + version', s: 'aihelpers, 0.1.0 — semver, like NuGet' },
        { e: '📚', t: 'dependencies', s: 'openai = ">= 1.0" — pip resolves them' },
        { e: '🔧', t: '[project.scripts]', s: 'expose a CLI command, like dotnet tool' },
        { e: '🏠', t: 'Private index', s: 'Azure DevOps feed or simple folder share' }
      ],
      narration: 'The four fields that matter. Name and version — semantic versioning, same discipline as NuGet. Dependencies — declare openai greater-than-or-equal one-dot-zero and pip resolves the tree. Scripts — expose a command line entry point, like a dotnet tool. And for company code, a private index or even a Git URL beats publishing to PyPI.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'You can ship code. **Now ship requests.**',
      next: 'Next · Reel 11: Calling APIs with httpx',
      narration: 'You’re now dangerous: modules, packages, and a shippable library. Time to use them — next is the library you’ll lean on hardest for AI work: httpx, the Python way to call any API. Reel eleven, swipe up.'
    }
  ],

  code: {
    title: '🐍 A minimal, real library setup',
    body:
`# pyproject.toml — the ENTIRE packaging config
[project]
name = "aihelpers"
version = "0.1.0"
dependencies = ["openai>=1.0", "tenacity>=8.0"]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

# src/aihelpers/prompt.py — one of your modules
def system_prompt(persona: str, task: str) -> list[dict]:
    return [
        {"role": "system", "content": f"You are {persona}."},
        {"role": "user", "content": task},
    ]

# Install it (editable = live-reload while you develop):
#   pip install -e .
# Then, anywhere:
#   from aihelpers.prompt import system_prompt`,
    annot: [
      '<b>pyproject.toml</b> replaces csproj + NuGet metadata — name, version, dependencies in one standard file.',
      '<b>pip install -e .</b> is the killer feature: an editable install links your source, so edits apply instantly across every script that imports it.',
      'Dependencies like <b>"openai>=1.0"</b> resolve transitively — pip’s equivalent of NuGet package resolution, minus the .nuspec dance.'
    ]
  },

  recap: [
    '<b>pyproject.toml</b> = csproj + NuGet metadata in one file',
    '<b>pip install -e .</b> → editable install, live-reload dev',
    'Install from <b>Git URL or private index</b> — no feed server needed'
  ],

  quiz: {
    q: 'Why does `pip install -e .` beat copying your helpers folder between projects?',
    opts: [
      'It compiles the code to run faster',
      'It installs a live link — edits to the source apply everywhere instantly',
      'It encrypts the package for private sharing',
      'It lets you import without writing any imports'
    ],
    a: 1,
    why: 'The -e flag is an editable install: pip puts the project on sys.path as a link to your source tree. Fix a bug in the library and every script that imports it sees the fix immediately — no copying, no version drift between copies.'
  },

  notes: `
# Build & share your own library

## Why you’ll do this within a month
AI scripts breed shared helpers fast: the retry wrapper for flaky LLM calls, the prompt builder, the token counter. Copy-pasting them into five scripts means five versions. A package ends that.

## The minimal layout
\`\`\`
aihelpers/
├── pyproject.toml          # the only config file
└── src/
    └── aihelpers/
        ├── __init__.py
        ├── prompt.py
        └── retry.py
\`\`\`
The \`src\` layout keeps the import name honest — tests can't accidentally import the folder instead of the installed package.

## pyproject.toml, field by field
- \`[project] name, version\` — identity. Semver, like NuGet.
- \`dependencies\` — pip resolves the full tree, including transitive deps.
- \`[build-system]\` — hatchling or setuptools builds the wheel. You rarely touch this block.
- \`[project.scripts]\` — \`aihelpers = "aihelpers.cli:main"\` exposes a shell command, the dotnet-tool equivalent.

## The distribution menu

| Audience | Mechanism |
| --- | --- |
| Just me, this machine | \`pip install -e .\` (editable) |
| My team | \`pip install git+https://.../aihelpers.git\` — no server needed |
| Company, controlled | Private index: Azure DevOps artifact feed, Nexus, or Artifactory |
| The world | \`twine upload\` to PyPI |

> **.NET ↔ Python:** \`pyproject.toml\` ≈ csproj + \`.nuspec\` combined. Editable install ≈ referencing a project instead of a package. There's no strong naming or signing ceremony — trust comes from the index (PyPI/feed), not the binary.

## Version discipline
Dependencies like \`openai>=1.0,<2\` — pin majors, let minors float. For AI libraries this matters: OpenAI SDK 1.0 rewrote the API surface. Pin your \`requirements.txt\` (or uv.lock) in apps; keep ranges in libraries.

## Gotchas
- Don't name the folder \`aihelpers\` at the repo root AND the package \`aihelpers\` — the src layout avoids this.
- Version must bump for teammates to get updates when installing from Git — pip caches.
- Add a \`README.md\`; PyPI renders it as the project page.

Next: reel 11 — httpx, the HTTP client you’ll use for every API that isn’t the OpenAI SDK.
`
});
