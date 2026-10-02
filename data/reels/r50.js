/* Reel 39 — What is an agent? (Agentic AI · Fundamentals) */
SS.registerReel({
  id: 'r50', num: 50, section: 'agentic', block: 'Agent Fundamentals',
  title: 'What is an agent?',
  hook: 'A chatbot **talks**. An agent **DOES**.',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE LEAP',
      title: 'A chatbot **answers**. An agent **acts**.',
      sub: 'One gets you a reply. The other gets you a result.',
      narration: 'Here’s the leap from GenAI to Agentic AI. A chatbot waits for your question… and answers it. An agent is different — you hand it a goal, and it goes off and gets it done.'
    },
    {
      type: 'compare',
      cards: [
        { e: '💬', t: 'Chatbot', s: 'You ask → it replies. Then it waits for you again.' },
        { e: '🤖', t: 'Agent', s: 'You give a goal → it plans, uses tools, checks results, finishes.', win: true }
      ],
      narration: 'A chatbot: you ask, it replies — then it waits. An agent: you give it a goal — it plans the steps, uses tools, checks the results, and comes back when the job is done.'
    },
    {
      type: 'loop',
      chips: ['🔍 search_flights()', '🏨 check_hotels()', '⭐ read_reviews()', '🧮 total_price()'],
      narration: 'An agent runs a loop. It observes the world… thinks about the next move… takes an action with a tool… sees the result… and thinks again. Sense. Think. Act. Repeat — until the goal is done.'
    },
    {
      type: 'chat',
      bubbles: [
        { who: 'you', text: 'Plan my Tokyo trip under ₹80,000' },
        { who: 'bot', text: 'On it — breaking this into steps…', tool: 'search_flights("DEL → TYO")' },
        { who: 'bot', text: 'Found 6 flights. Checking hotels near Shinjuku…', tool: 'check_hotels(budget ₹3.5k/night)' },
        { who: 'bot', text: 'Done ✅ 3 options under budget — full plan + booking links 👇' }
      ],
      narration: 'Watch it happen. “Plan my Tokyo trip under eighty thousand.” The agent breaks the goal into steps, calls tools — flights, hotels, reviews — checks each result, adjusts… and hands you a finished plan.'
    },
    {
      type: 'list',
      items: [
        { e: '🎯', t: 'A goal', s: 'the outcome you want — not the steps' },
        { e: '🛠️', t: 'Tools', s: 'functions it can call — search, code, email…' },
        { e: '🔁', t: 'A loop', s: 'observe → think → act, until done' }
      ],
      narration: 'Three ingredients make an agent: a goal to pursue, tools that let it act on the world, and the loop that ties them together. The LLM you already met? It’s the brain inside the loop — deciding what to do at every step.'
    },
    {
      type: 'bridge', kicker: 'COMING UP',
      title: 'But where do all those **tools** come from?',
      next: 'Coming · From chatbot to agent → Tools → MCP',
      narration: 'One question though — where do all those tools come from? Somebody has to build them, wire them in, keep them safe. There’s a whole protocol for that now. It’s called MCP — and it’s coming up.'
    }
  ],

  code: {
    title: '🐍 The agent loop, in 8 lines',
    body:
`# The agent loop (simplified)
while not goal.done():
    obs = observe(state)                     # 👁 sense
    thought, action = llm.decide(goal, obs)  # 🧠 think
    if action:
        result = tools[action.name](**action.args)  # 🛠 act
        state.add(result)
return goal.answer(state)`,
    annot: [
      'The LLM only <b>decides</b> — it never touches the world directly.',
      'Tools are plain functions with a name, a description & typed arguments.',
      'The loop runs until the goal is done — or a human says stop (Reel 49).'
    ]
  },

  recap: [
    'Chatbot replies · an agent **accomplishes**',
    'Loop: **observe → think → act → repeat**',
    'Ingredients: goal + tools + LLM brain'
  ],

  quiz: {
    q: 'What makes an agent different from a chatbot?',
    opts: [
      'It runs on a bigger model',
      'It pursues a goal across many steps using tools',
      'It replies with longer messages',
      'It never makes mistakes'
    ],
    a: 1,
    why: 'The defining trait is the goal-driven loop: keep observing, thinking and acting with tools until the task is complete. A chatbot just answers one message at a time.'
  },

  notes: `
# What is an agent?

## Definition
An **agent** is a system that pursues a goal by looping: **observe → think → act**, using tools, until the goal is complete — instead of answering a single prompt and stopping.

## The loop
1. **Observe** — gather state: tool results, user messages, files, web pages.
2. **Think** — the LLM decides the next action (this is where ReAct, planning and reflection patterns live — reels 43–45).
3. **Act** — call a tool: search, run code, send email, book a flight.
4. **Repeat** with the new result, until done.

## The three ingredients
| Ingredient | Role |
|---|---|
| 🎯 Goal | What "done" means |
| 🛠️ Tools | How it can affect the world (functions with names, docs, schemas) |
| 🧠 LLM | The brain choosing actions inside the loop |

## Autonomy is a dial, not a switch
- **Level 0**: human runs each step manually (a plain chatbot).
- **Level 1**: agent proposes actions, human approves (human-in-the-loop, reel 49).
- **Level 2**: agent acts freely inside guardrails; escalates on risk.
- **Level 3**: fully autonomous multi-step missions (research agents, coding agents — reels 50–52).

## Why this matters
A chatbot's quality ceiling is "a good answer". An agent's ceiling is "a finished task" — which is why every major AI lab is racing here.

## Coming up
- Tools & function calling in depth → reel 41
- Where tools come from → **MCP** (reels 53–59)
`
});
