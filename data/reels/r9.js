/* Reel 9 — Modules & imports — Python’s using statement (Python · Python for GenAI) */
SS.registerReel({
  id: 'r9', num: 9, section: 'python', block: 'Python for GenAI',
  title: 'Modules & imports — Python’s using statement',
  hook: 'One file = one module. **That’s the whole packaging model.**',

  scenes: [
    {
      type: 'bigtext', kicker: 'ORGANIZATION',
      title: 'Every .py file is a module. **Every folder is a package.**',
      sub: 'No namespaces.cs, no csproj ceremony.',
      narration: 'Python’s module system is almost embarrassingly simple. Every dot-py file is a module you can import. Put files in a folder with an init dot py, and the folder is a package. There is no separate project file declaring what exists — the filesystem is the truth.'
    },
    {
      type: 'compare',
      cards: [
        { e: '🔷', t: 'C#: namespaces + csproj', s: 'using + declared project structure' },
        { e: '🐍', t: 'Python: import the file', s: 'import config → config.py', win: true }
      ],
      narration: 'In C-sharp you declare namespaces in project files and then import them. In Python, if config dot py sits next to your script, import config just works. The module name is the file name. It’s using-statement-meets-file-system.'
    },
    {
      type: 'list',
      items: [
        { e: '📥', t: 'import json', s: 'whole module: json.loads(...)' },
        { e: '✂️', t: 'from json import loads', s: 'one name, no prefix' },
        { e: '⭐', t: 'import httpx as hx', s: 'alias for long names' },
        { e: '🌶️', t: 'from x import *', s: 'wildcard — don’t, in real code' }
      ],
      narration: 'Four import shapes. Import the whole module and prefix with its name. From-import pulls one name directly. The as-keyword aliases long package names. And star-import dumps everything into your namespace — fine in a notebook, rude in production, because names silently collide.'
    },
    {
      type: 'diagram',
      nodes: [
        { e: '🐍', t: 'agent.py', s: 'your script' },
        { e: '📦', t: 'tools/', s: 'weather.py · time.py' },
        { e: '🧾', t: '__init__.py', s: 'makes it a package' },
        { e: '🔗', t: 'import tools.weather', s: 'dotted access' }
      ],
      narration: 'Now the package layout. Your script sits next to a tools folder containing weather dot py and time dot py. Drop an init dot py in the folder — even empty — and it becomes a package. Now import tools dot weather gives you dotted access, exactly like namespaces.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'Importing is free. **Publishing is a superpower.**',
      next: 'Next · Reel 10: Build & share your own library',
      narration: 'Importing solved. Next level: turning your modules into an installable package you can pip-install anywhere — including the private library every AI team ends up building. Reel ten, swipe up.'
    }
  ],

  code: {
    title: '🐍 Module layout a real project uses',
    body:
`# --- config.py (one file = one module) ---
MODEL = "gpt-4o"
TEMPERATURE = 0.2

# --- tools/weather.py ---
def get_weather(city: str) -> str:
    return f"{city}: 21 degrees"

# --- tools/__init__.py ---
# Empty file. Its existence turns the folder into a package.

# --- agent.py ---
import json                          # whole module
from config import MODEL             # one name, no prefix
from tools.weather import get_weather

print(MODEL)                         # -> gpt-4o
print(get_weather("Paris"))          # -> Paris: 21 degrees
print(json.dumps({"ok": True}))      # prefixed: module.name`,
    annot: [
      '<b>config.py is a module</b> — import it and its top-level names (MODEL, TEMPERATURE) are attributes: config.MODEL.',
      '<b>__init__.py</b> is the package marker; from it you can also re-export names with from .weather import get_weather.',
      '<b>Dotted imports</b> (tools.weather) mirror namespaces — the folder is the namespace.'
    ]
  },

  recap: [
    'One .py file = <b>one module</b>; import by file name',
    'Folder + <b>__init__.py</b> = a package',
    'import module / from module import name / <b>as</b> alias'
  ],

  quiz: {
    q: 'You have tools/helpers.py next to your script. How do you call a function named slugify inside it?',
    opts: [
      'import helpers; helpers.slugify("A B")',
      'using helpers; slugify("A B")',
      'include helpers.slugify',
      'new helpers().slugify("A B")'
    ],
    a: 0,
    why: 'import helpers loads the module; you call through the module name: helpers.slugify(...). There is no using directive — "using" is C#. (Or: from tools.helpers import slugify, since helpers sits in the tools package.)'
  },

  notes: `
# Modules & imports — Python’s using statement

## The model
- **Module** = one \`.py\` file. Its top-level names (functions, classes, constants) become attributes.
- **Package** = a folder with an \`__init__.py\`. Subfolders become subpackages.
- No project file, no assembly, no namespace declarations. The directory tree *is* the structure.

## Import forms

| Form | Effect | When |
| --- | --- | --- |
| \`import json\` | Binds \`json\`; call \`json.loads\` | Default — namespaces stay explicit |
| \`import httpx as hx\` | Alias | Long names (pandas as pd, numpy as np) |
| \`from json import loads\` | \`loads\` unqualified | One or two heavily-used names |
| \`from tools import weather\` | Submodule of a package | Structured projects |
| \`from .weather import x\` | Relative import | Inside packages (reel 10) |
| \`from x import *\` | Dumps all public names | Notebooks only — collisions lurk |

## What actually happens on import
The module’s code runs **once**, top to bottom, the first time it’s imported; the resulting module object is cached in \`sys.modules\`. Side effects at import time — opening files, hitting the network — run at import. Keep module top-levels pure: constants, class/function definitions, logging setup.

> **.NET ↔ Python:** \`import\` ≈ \`using\` + assembly load in one step, but with no separate declaration step — the file must simply exist on \`sys.path\`. \`from config import MODEL\` ≈ \`using static\` for one symbol. Circular imports are Python’s version of circular project references: fix by importing inside functions, or restructuring — exactly like you’d break a dependency cycle in C#.

## sys.path — where Python looks
Import order: the script’s directory, then \`PYTHONPATH\`, then site-packages (where pip installs). This is why \`pip install openai\` makes \`import openai\` work from anywhere.

## Gotchas
- Naming a file \`json.py\` shadows the stdlib \`json\` — a classic self-inflicted bug.
- Circular imports (\`a.py\` imports \`b.py\` which imports \`a.py\`) fail at runtime; import inside the function that needs it as a band-aid.
- \`if __name__ == "__main__":\` guards code that should only run when the file is executed directly, not imported — the \`Main\` method of a Python file.

Next: reel 10 — turn this folder into a pip-installable library you can share.
`
});
