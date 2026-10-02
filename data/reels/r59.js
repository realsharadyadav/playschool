/* Reel 59 — Agent frameworks — LangGraph to CrewAI (Agentic · Agent Fundamentals) */
SS.registerReel({
  id: 'r59', num: 59, section: 'agentic', block: 'Agent Fundamentals',
  title: 'Agent frameworks — LangGraph to CrewAI',
  hook: 'Frameworks sell you graphs. **Your code needs seams.** Choose accordingly.',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE LANDSCAPE',
      title: 'Same skeletons, **different promises.**',
      sub: 'LangGraph · CrewAI · AutoGen · OpenAI Agents SDK — and hand-rolled.',
      narration: 'The framework landscape looks crowded; the anatomy is the same one you know — loop, tools, memory, planning. What frameworks actually sell is ORCHESTRATION plumbing: state machines for the loop, persistence for long runs, pre-built team topologies. The honest tour: what each gives you, what each costs, and the decision rule that keeps you out of framework jail.'
    },
    {
      type: 'compare',
      cards: [
        { e: '🕸️', t: 'LangGraph', s: 'agents as state-machine graphs — control + persistence' },
        { e: '🎭', t: 'CrewAI', s: 'agents as role-playing crews — fast to demo', win: true }
      ],
      narration: 'The two poles. LangGraph models an agent as an explicit GRAPH: nodes are steps, edges are transitions, state is a typed dictionary that flows through. Maximum control — loops, branching, human-interrupts, checkpointing — at the price of graph boilerplate. CrewAI models agents as ROLE-PERSONA CREWS: give a YAML-ish definition of agents and tasks, and the framework runs the handoffs. Fastest to a working demo; the magic hides the seams you’ll later need to open. AutoGen (Microsoft) sits between: conversational agents that talk to each other. And the OpenAI Agents SDK is the thin, provider-native layer: handoffs and guardrails with minimal abstraction.'
    },
    {
      type: 'list',
      items: [
        { e: '🧩', t: 'Orchestration', s: 'loops, routing, teams — their core value' },
        { e: '💾', t: 'Persistence', s: 'checkpoint/resume long runs' },
        { e: '🔌', t: 'Ecosystem', s: 'pre-built tool catalogs, observability' },
        { e: '🧱', t: 'Lock-in', s: 'their abstractions leak into YOUR design' }
      ],
      narration: 'What you’re actually buying. Orchestration: the loop-and-route machinery — graphs, crews, handoffs — real value once agents grow past a while-loop. Persistence: checkpointing that survives crashes and pauses for human approval — genuinely hard to hand-roll well. Ecosystem: tool catalogs, tracing integrations, community recipes. And the cost: lock-in — framework types creep into your business logic, and migrating means re-reading your own system through their vocabulary. The antidote is the discipline of reel ten: keep YOUR logic in YOUR library; frameworks wrap, they don\'t own.'
    },
    {
      type: 'arch',
      layers: [
        { e: '🧠', t: 'Your core library', s: 'tools, prompts, memory, policies — pure Python' },
        { e: '🕸️', t: 'Framework layer', s: 'LangGraph/CrewAI: orchestration only' },
        { e: '👁️', t: 'Observability', s: 'traces, budgets, eval hooks' },
        { e: '🚪', t: 'Exit strategy', s: 'swap the middle layer, core untouched' }
      ],
      narration: 'The adoption architecture. Your core library — tools, prompts, memory, business rules — stays framework-free and unit-tested, exactly like reel forty-eight\'s shipping discipline. The framework occupies ONE thin layer: routing, checkpointing, team wiring. Observability sits above, watching everything. And the exit strategy is structural, not hopeful: because the core never imported the framework, swapping LangGraph for CrewAI — or for a hand-rolled loop — is a layer rewrite, not a system rewrite. Frameworks are tenants, not owners.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'Frameworks: tamed. **One missing piece: the humans.**',
      next: 'Next · Reel 60: Human-in-the-loop & guardrails',
      narration: 'You can now pick — or skip — the orchestration layer on merit, with your core intact either way. The last fundamental isn\'t a model skill: it\'s governance. When agents act on the real world, humans must approve the irreversible — and guardrails must catch the rest. Reel sixty, swipe up.'
    }
  ],

  code: {
    title: '🐍 LangGraph, twenty lines — the shape of it',
    body:
`from langgraph.graph import StateGraph, END
from typing import TypedDict

class AgentState(TypedDict):
    goal: str
    messages: list
    approved: bool          # human gate (reel 60)

def retrieve(state: AgentState):
    return {"messages": state["messages"] + [do_retrieval(state["goal"])]}

def propose(state: AgentState):
    return {"messages": state["messages"] + [draft_action(state)]}

def needs_approval(state: AgentState) -> str:
    return "human" if is_write_action(state) else "act"

def human_gate(state: AgentState):
    pause_until_user_approves(state)         # checkpoint/resume built-in
    return state

g = StateGraph(AgentState)
g.add_node("retrieve", retrieve)
g.add_node("propose", propose)
g.add_node("human", human_gate)
g.set_entry_point("retrieve")
g.add_edge("retrieve", "propose")
g.add_conditional_edges("propose", needs_approval,
                        {"human": "human", "act": END})
app = g.compile()                            # your core fns, graph-routed`,
    annot: [
      '<b>Nodes are YOUR functions</b> — retrieve/propose call your library; the framework only routes state between them.',
      '<b>Conditional edges = routing logic</b> — needs_approval is a plain Python function; the graph just calls it.',
      '<b>human_gate checkpoints the run</b> — LangGraph\'s killer feature: pause mid-graph, persist, resume after approval, for free.'
    ]
  },

  recap: [
    'LangGraph = <b>control</b> (graphs); CrewAI = <b>speed</b> (crews)',
    'Buy <b>orchestration + persistence</b>, not a worldview',
    '<b>Core library stays framework-free</b> — frameworks are tenants'
  ],

  quiz: {
    q: 'Your agent needs: tool calling, a 3-step loop, an approval pause, and Postgres state. LangGraph or hand-rolled — and what decides it?',
    opts: [
      'LangGraph — always, frameworks are production-standard',
      'Hand-rolled — frameworks are demo toys',
      'LangGraph if the checkpoint/resume + conditional-routing plumbing outweighs its vocabulary leaking into your code; hand-rolled if the loop is genuinely simple and you want zero abstraction tax',
      'CrewAI — it\'s the fastest either way'
    ],
    a: 2,
    why: 'The decision is architectural, not religious. LangGraph earns its keep when you need durable checkpoint/resume (approval gates, long-running flows), conditional routing, and team topologies — plumbing that\'s tedious and easy to get wrong. A fixed 3-step loop with an approval flag is honestly ~40 lines hand-rolled (reel 51/54), with zero lock-in. Choose per-workflow, not per-company.'
  },

  notes: `
# Agent frameworks — LangGraph to CrewAI

## The honest map (mid-2020s)

| Framework | Model | Strengths | Watch out for |
| --- | --- | --- | --- |
| LangGraph | explicit state graphs | control, checkpointing, HITL, streaming | boilerplate; graph-shaped thinking infects design |
| CrewAI | role/task crews | fastest demo-to-working; readable YAML crews | abstraction hides handoff contracts; role-theater drift |
| AutoGen | conversational agents | research-grade patterns (Microsoft) | chat-log handoffs (the 58 anti-pattern) if unmanaged |
| OpenAI Agents SDK | thin agent layer | minimal abstraction, provider-native | young; OpenAI-centric |
| Hand-rolled | your loops (51/54/58) | zero lock-in, full legibility | you own persistence, retries, tracing |

## Decision criteria, in order
1. **Do you need durable pause/resume?** (approvals, days-long runs) → strongly consider LangGraph; hand-rolling checkpointing well is genuinely hard.
2. **Is the topology static?** Fixed pipeline → hand-rolled is fine. Dynamic routing/multi-team → graph pays off.
3. **Team skill and review load** — frameworks add vocabulary everyone must learn; your hand-rolled loop is readable by any Python dev (reel 2 graduate).
4. **Ecosystem needs** — pre-built connectors/tracing can be the whole argument for a framework.

## The tenant rule (how to not get burned)
- Business logic, tool implementations, prompts, memory: **your library, zero framework imports** (reel 10/48).
- Framework code imports YOUR library, never the reverse.
- Evals (47) run against your library’s seams — framework swaps don’t invalidate them.

## Migration reality check
Framework migrations hurt exactly as much as your core leaked into framework types. With the tenant rule, swapping LangGraph → hand-rolled = rewrite one orchestration module. Without it, it’s archaeology.

## What I’d tell a .NET team
The same analysis holds: Semantic Kernel and AutoGen mirror these trade-offs. But the Python agent ecosystem (and MCP — reel 72) currently runs ahead on tooling. Pragmatic split unchanged since reel 1: orchestrate in Python behind an HTTP seam; your ASP.NET app consumes.

Next: reel 60 — human-in-the-loop and guardrails: governance for agents that act.
`
});
