/* Reel 48 — From notebook to real app (GenAI · Ship It) */
SS.registerReel({
  id: 'r48', num: 48, section: 'genai', block: 'Ship It',
  title: 'From notebook to real app',
  hook: 'The demo works. **Now the last 20% that takes 80% of the effort.**',

  scenes: [
    {
      type: 'bigtext', kicker: 'SHIP IT',
      title: 'Notebooks explore. **Production endures.**',
      sub: 'The GenAI section finale — the professional finish.',
      narration: 'Every reel so far taught a component — in honest, runnable code. But a pile of working components is not an application. The gap between “works on my machine in a notebook cell” and “runs at 3 a.m. for a thousand users” is the last twenty percent that takes eighty percent of the effort. This reel maps that gap: architecture, secrets, deployment, and the one discipline that ties it all together — observability.'
    },
    {
      type: 'arch',
      layers: [
        { e: '⚡', t: 'FastAPI service', s: 'the /chat and /ingest endpoints (reel 46)' },
        { e: '🧠', t: 'Core library', s: 'reel 10 — your packaged pipeline logic' },
        { e: '🗄️', t: 'Stores', s: 'Postgres/pgvector + parquet artifacts' },
        { e: '👁️', t: 'Observability', s: 'logs, traces, token meters, evals in CI' }
      ],
      narration: 'The target shape. A thin FastAPI service exposes the endpoints — streaming chat, ingestion triggers. ALL the logic lives in a packaged core library — reel ten’s pyproject, so the notebook code and the service share one source of truth. Stores are boring and battle-tested: Postgres with pgvector, parquet artifacts. And observability wraps everything: structured logs, traces across LLM calls, token metering, and your eval suites wired into CI from reels forty-one and forty-seven.'
    },
    {
      type: 'list',
      items: [
        { e: '🗝️', t: 'Secrets via env', s: 'reel 13 — never in the repo' },
        { e: '🐳', t: 'One container', s: 'uvicorn in, nothing else fancy' },
        { e: '📈', t: 'Token + cost meters', s: 'per endpoint, per user' },
        { e: '🧪', t: 'Evals as CI', s: 'reels 41/47 — the deploy gate' }
      ],
      narration: 'The four habits that separate shipped from demoed. Secrets come from the environment — reel thirteen’s dot-env discipline, no exceptions. One container: uvicorn serving your app, dependencies pinned; no microservice explosion for a single AI surface. Token and cost meters on every endpoint and user — your CFO will ask, and you’ll have the answer. And evals run in CI — they are the deploy gate, not an afterthought.'
    },
    {
      type: 'compare',
      cards: [
        { e: '📓', t: 'Notebook culture', s: 're-run cells, global state, works-today' },
        { e: '🏭', t: 'Service culture', s: 'stateless, versioned, tested, observed', win: true }
      ],
      narration: 'The culture shift. Notebooks optimize for exploration: re-run cells, inspect variables, iterate fast — perfect for learning, poisonous for production. Services optimize for endurance: stateless request handling, versioned code, automated tests, and dashboards that answer “is it healthy?” without a human in the loop. Same skills, different religion — and this course’s Python foundation exists precisely so you can make the jump.'
    },
    {
      type: 'bridge', kicker: 'SECTION COMPLETE',
      title: 'GenAI: shipped. **Next world: agents.**',
      next: 'Next · Reel 49: From chatbot to agent',
      narration: 'That closes the GenAI section — from what a model IS to an application in production, with evals standing guard. Everything so far answered questions. The final section builds systems that ACT: agents. The paradigm shift starts now. Reel forty-nine, swipe up.'
    }
  ],

  code: {
    title: '🐍 The app skeleton — notebook logic, service clothes',
    body:
`# app.py — the whole production surface around your library
from fastapi import FastAPI
from aihelpers import rag, memory        # reel 10's packaged core

app = FastAPI()
sessions = memory.SessionStore()         # Redis/Postgres-backed

@app.post("/ingest")
def ingest(folder: str):
    rag.ingest(folder)                     # reel 40's pipeline, imported
    return {"status": "ok"}

@app.post("/chat")
async def chat(session_id: str, msg: str):  # streaming per reel 46
    hist = sessions.load(session_id)
    reply = await rag.answer_streaming(hist, msg)
    sessions.save(session_id, hist, reply)
    return reply

# requirements pinned, secrets via env (reel 13), Dockerfile:
#   FROM python:3.12-slim
#   COPY . /app && RUN pip install /app
#   CMD ["uvicorn", "app:app", "--host", "0.0.0.0"]`,
    annot: [
      '<b>The service is a thin shell</b> — every hard decision (chunking, retrieval, memory) lives in the packaged library, tested and versioned separately.',
      '<b>SessionStore externalizes state</b> — containers come and go; memory survives in Redis/Postgres.',
      '<b>Two endpoints total</b> — resist the microservice gravity; one deployable artifact until scale forces the split.'
    ]
  },

  recap: [
    'Package the pipeline as a <b>library</b>; the service is a thin shell',
    '<b>One container, pinned deps, env secrets</b> — boring on purpose',
    '<b>Token meters + CI evals</b> — the CFO gate and the quality gate'
  ],

  quiz: {
    q: 'Why does “put the notebook code behind FastAPI” fail as a shipping strategy?',
    opts: [
      'FastAPI is too slow for LLM workloads',
      'Notebooks mix concerns: global state, cell ordering, untested paths — production needs packaged, versioned, tested library code with stateless serving',
      'LLM providers block requests from web frameworks',
      'Notebooks cannot import packages'
    ],
    a: 1,
    why: 'The failure isn’t the framework — it’s that notebook code is organized for exploration (global state, implicit cell order, print-driven debugging), not for endurance. Shipping means refactoring into a versioned library with tests (reel 10), stateless request handling, externalized sessions, and observability. The framework is the easy part; the discipline is the work.'
  },

  notes: `
# From notebook to real app

## The shipping checklist (stolen from every serious GenAI team)
- [ ] **Library first**: pipeline logic in a packaged module (reel 10), notebooks import it — never the reverse.
- [ ] **Secrets**: env-injected (reel 13); .env gitignored; per-environment values; spend limits set at the provider.
- [ ] **Dependencies**: pinned (\`requirements.txt\` / \`uv.lock\`); Dockerfile from slim base; reproducible builds.
- [ ] **State**: sessions, stores, and queues external (Postgres/Redis); app containers stateless.
- [ ] **Endpoints**: minimal (\`/chat\` streaming, \`/ingest\`); everything else is a library call.
- [ ] **Observability**: structured logs; traces across LLM/retrieval calls; per-request token + cost meters; dashboards.
- [ ] **Quality gates**: golden-set evals in CI (reels 41/47) blocking deploys; red-team sweep on prompt changes.
- [ ] **Ops runbook**: how to rotate keys, re-ingest, roll back a bad prompt version (prompts are artifacts — version them).

## Observability specifics for GenAI
- Log per call: model, input/output tokens, latency, TTFT, finish_reason, cost.
- Correlation IDs across retrieval → prompt → generation.
- Dashboards: tokens/hour, cost/day, abort rate, eval scores over time.
- Alerts: finish_reason=length spikes (truncation), refusal-rate anomalies, cost anomalies (reel 13’s five-figure-bill scenario).

## Deployment shapes
| Shape | When |
| --- | --- |
| Single container + managed Postgres | default (most teams, most apps) |
| + queue (Celery/RQ) for ingestion | docs are large, ingest is slow |
| + autoscaling replicas | QPS demands it — AFTER meters prove it |
| Separate embedding workers | bulk ingestion at scale |

Resist more infrastructure than your meters justify.

## Cost posture
- Per-user/tenant token metering from day one — retrofits are painful.
- Cache embeddings (32) and frequent Q&A pairs; stream with abort support (46).
- Set provider spend limits (13) AND alert thresholds BELOW them.

> **.NET ↔ Python:** this is the reel-1 split paying off — the ASP.NET app and this FastAPI service can share Postgres/pgvector and the golden-set suite while each team works in its native stack.

That completes GenAI. Next: the Agentic section — chatbots that act. Reel 49 opens it.
`
});
