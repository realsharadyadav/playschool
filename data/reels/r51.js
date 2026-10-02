/* Reel 51 — LLM as the brain (Agentic · Agent Fundamentals) */
SS.registerReel({
  id: 'r51', num: 51, section: 'agentic', block: 'Agent Fundamentals',
  title: 'LLM as the brain',
  hook: 'The LLM is a brain in a jar. **Agents give it hands, eyes, and a to-do list.**',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE METAPHOR',
      title: 'A brilliant brain **that can only talk.** Until you wire it up.',
      sub: 'Reasoning ✓ Memory ✗ Senses ✗ Hands ✗ — agents supply the rest.',
      narration: 'Here’s the mental model for the whole agentic section. The LLM is a brain in a jar: astonishing at reasoning and language, but it can only emit text. It can’t see your database, can’t run your code, can’t remember anything between calls. An agent is what happens when you wire that brain to eyes — data sources — hands — tools — and a notebook — memory. Same brain, new body.'
    },
    {
      type: 'arch',
      layers: [
        { e: '👀', t: 'Perception', s: 'tools that observe: search, read, query' },
        { e: '🧠', t: 'Cognition', s: 'the LLM: decide what to do next' },
        { e: '✋', t: 'Action', s: 'tools that change: write, send, execute' },
        { e: '📓', t: 'Memory', s: 'short-term context + long-term store' }
      ],
      narration: 'The agent loop, anatomized. Perception: the brain asks questions and tools answer — what’s in this file, what does the database say. Cognition: the LLM reads everything and DECIDES the next move. Action: it calls a tool that changes the world — writes a file, sends an email. And memory: short-term, everything in the current context, plus long-term, the store it can search. Four layers on endless loop until the task is done.'
    },
    {
      type: 'list',
      items: [
        { e: '🎯', t: 'Goal in the prompt', s: '"reconcile these two sheets"' },
        { e: '🔁', t: 'Perceive → think → act', s: 'the loop, every cycle' },
        { e: '🧾', t: 'Observations return', s: 'results join the context' },
        { e: '✅', t: 'Done or stuck', s: 'answer, or escalate to human' }
      ],
      narration: 'One cycle, narrated. The goal lives in the prompt: reconcile these two sheets. Cycle one: the brain perceives — reads sheet A — thinks — I need sheet B too — acts — calls the read tool. The observation returns and joins the context. Cycle two builds on cycle one. The loop runs until the brain declares the goal met and answers — or gets stuck and escalates to a human. That loop is the entire paradigm.'
    },
    {
      type: 'compare',
      cards: [
        { e: '💬', t: 'LLM alone', s: 'reasons about the world it saw in training' },
        { e: '🤖', t: 'LLM + tools + loop', s: 'reasons about YOUR world, then changes it', win: true }
      ],
      narration: 'Why the wiring matters. The brain alone can only reason about the world as of its training data — frozen, generic, hallucination-prone. Wire it to tools and a loop and it reasons about YOUR live data, verifies claims by looking them up, and acts on your systems. Reel twenty-eight’s hallucination problem doesn’t disappear — but now the brain can CHECK its work before speaking.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'Anatomy set. **First wiring job: the hands — tool calling.**',
      next: 'Next · Reel 52: Tools — function calling deep dive',
      narration: 'The brain has a body plan: perceive, think, act, remember. The highest-leverage wiring is the hands — tool calling, the mechanism that lets a model request a function execution with structured arguments. That’s the next reel — the technical heart of the whole section. Swipe up.'
    }
  ],

  code: {
    title: '🐍 The agent loop, unframeworked',
    body:
`import json

TOOLS = {
    "get_weather": lambda city: f"{city}: 21C, clear",
    "get_time":    lambda city: f"{city}: 14:32",
}

SYSTEM = """You are an agent. Decide the next action.
Reply with EXACTLY one JSON object:
{"action": "tool", "name": "...", "args": {...}}
or {"action": "final", "answer": "..."}"""

def run_agent(user_goal: str, max_steps: int = 6) -> str:
    messages = [{"role": "system", "content": SYSTEM},
                {"role": "user", "content": user_goal}]
    for _ in range(max_steps):
        reply = llm(messages, temp=0.0)          # the brain decides
        decision = json.loads(reply)
        if decision["action"] == "final":
            return decision["answer"]
        result = TOOLS[decision["name"]](**decision["args"])   # hands act
        messages.append({"role": "assistant", "content": reply})
        messages.append({"role": "user",
                         "content": f"TOOL RESULT: {result}"}) # eyes observe
    return "Agent stopped: step limit reached."`,
    annot: [
      '<b>The loop is ~15 lines</b> — everything else in this section is hardening: better schemas (52), reasoning traces (54), memory (57), frameworks (59).',
      '<b>Tool results come back as user-role messages</b> — the simplest protocol; production systems use a dedicated tool role (reel 73).',
      '<b>max_steps is non-negotiable</b> — an unbounded loop on a confused brain is an infinite bill (reel 60).'
    ]
  },

  recap: [
    'Agent = LLM brain + <b>perceive → think → act</b> loop',
    'Tools are <b>eyes and hands</b>; memory is the notebook',
    'The loop must be <b>bounded</b> — always a max-steps'
  ],

  quiz: {
    q: 'An agent keeps answering "I don’t have access to live data" even though a search tool is registered. Most likely cause?',
    opts: [
      'The tool is too slow, so the model ignores it',
      'The system prompt never tells the brain the tool exists or when to use it',
      'Tools only work with async models',
      'The context window is too small to hold tool results'
    ],
    a: 1,
    why: 'The brain only uses what it knows about: the tool must be described in its context — name, purpose, parameters — plus instructions on when to reach for it. A registered-but-undescribed tool is furniture the model can’t see. Tool schemas in the prompt/system message are the wiring, not the function itself.'
  },

  notes: `
# LLM as the brain

## The agent equation
\`\`\`
AGENT = LLM (cognition)
      + TOOLS (perception + action)
      + LOOP (perceive → think → act)
      + MEMORY (context + store)
      + BOUNDARIES (step caps, approvals — reel 60)
\`\`\`
Remove any term and you get something narrower: no tools = a chatbot; no loop = single-shot function calling; no boundaries = a liability.

## Cognition: what the brain actually does per cycle
1. Reads the goal, the conversation, recent observations.
2. Decides ONE next step (tool call or final answer).
3. Emits that decision as structured output (JSON or native tool-call).

The intelligence is in step 2; everything else is plumbing you already know — reels 4/7 for dicts and kwargs, 27 for structured output, 14 for retries.

## Perception vs action tools
- **Read-only** (search, query, read file): safe to call freely; cache results.
- **Write/act** (send email, update DB, modify file): irreversible; these earn guardrails — confirmation steps, dry-run modes, allow-lists (reels 60, 66).

Design the split deliberately; your safety posture hangs on it.

## Memory, two speeds
- **In-context (working memory)**: the message list — cap it (reel 44–45 patterns apply verbatim to agents).
- **Long-term**: the agent writes notes to a store and retrieves them later (reel 57) — the notebook it can reread.

## The economics of the loop
Every cycle = 1+ LLM calls with a growing context. A 20-step agent run can dwarf a chatbot turn. Step caps, cheap models for perception, and aggressive summarization of old observations (reel 45) are how agent budgets stay sane.

> **.NET ↔ Python:** the loop skeleton ports trivially; the ecosystem difference is that Python owns the tool-calling plumbing (SDKs, MCP — reel 72). The architecture, though, is yours to implement in any language.

Next: reel 52 — tools and function calling: the mechanism, deep.
`
});
