/* Reel 49 — From chatbot to agent (Agentic AI · Agent Fundamentals) */
SS.registerReel({
  id: 'r49', num: 49, section: 'agentic', block: 'Agent Fundamentals',
  title: 'From chatbot to agent',
  hook: 'Your chatbot code is **one loop away** from being an agent.',

  scenes: [
    {
      type: 'bigtext', kicker: 'THE UPGRADE',
      title: 'Remember your **chatbot**? Let\u2019s make it *act*.',
      sub: 'Reel 43 answered. This reel does.',
      narration: 'Remember reel 43? We built a chatbot — you talk, it replies, done. Useful… but passive. Today we turn that same code into something that goes and gets the job done.'
    },
    {
      type: 'compare',
      cards: [
        { e: '💬', t: 'Chatbot (r43)', s: 'You ask → it answers once → waits for you again.' },
        { e: '🤖', t: 'Agent', s: 'You give a goal → it acts with tools, checks results, finishes.', win: true }
      ],
      narration: 'Side by side: the chatbot takes your message, answers once, and waits. The agent takes your goal, plans, calls tools, checks the results — and keeps going until the job is actually finished.'
    },
    {
      type: 'diagram', cycle: true, linkLabel: 'feed result back',
      nodes: [
        { e: '🎯', t: 'Goal', s: 'the outcome, not the steps' },
        { e: '🛠️', t: 'Tools', s: 'functions you register' },
        { e: '🔁', t: 'Loop', s: 'call → result → repeat' }
      ],
      narration: 'Here is the honest truth: the model does not change. Same API, same weights. What changes is the code around it — you add three things. A goal, a toolbelt, and a loop that feeds results back.'
    },
    {
      type: 'chat',
      bubbles: [
        { who: 'you', text: 'Refund order 1234' },
        { who: 'bot', text: 'You\u2019d start by opening the refund policy page, then contact support with your order number and reason…', },
        { who: 'bot', text: 'Looking up order 1234…', tool: 'lookup_order(1234)' },
        { who: 'bot', text: 'Order found — issuing refund now.', tool: 'refund_order(1234)' },
        { who: 'bot', text: 'Refund confirmed. ₹4,200 back in 3–5 days. ✅' }
      ],
      narration: 'Same request both times: “refund order twelve thirty-four”. The chatbot explains the refund policy. The agent looks the order up, issues the refund, and confirms the money is on its way.'
    },
    {
      type: 'list',
      items: [
        { e: '🎯', t: 'Message → goal', s: 'state the outcome you want' },
        { e: '🧰', t: 'Register tools', s: 'pass tools=[...] to the API' },
        { e: '🔁', t: 'Wrap in a loop', s: 'repeat until the model stops' }
      ],
      narration: 'Your chatbot code gets three upgrades. One: the user message becomes a goal. Two: you register tools with the model. Three: you wrap the API call in a while loop that runs until the job is done.'
    },
    {
      type: 'bridge', kicker: 'COMING UP',
      title: 'That loop has a name — and three **ingredients** you can diagram.',
      next: 'Next · Reel 50: What is an agent?',
      narration: 'That loop is the heart of every agent you will ever build. Next reel, we name its parts — goals, tools, and the sense-think-act cycle. Swipe up: what is an agent?'
    }
  ],

  code: {
    title: '🐍 Chatbot → agent: the actual diff',
    body:
`import json, openai

tools = [{"type": "function", "function": {
    "name": "refund_order",
    "description": "Refund an order by id",
    "parameters": {"type": "object",
                   "properties": {"order_id": {"type": "integer"}},
                   "required": ["order_id"]}}}]

def refund_order(order_id: int) -> str:   # YOUR code — the model never runs it
    return f"order {order_id} refunded"   # call your API / DB here

messages = [{"role": "user", "content": "Refund order 1234"}]
while True:                               # the upgrade: a LOOP
    r = openai.chat.completions.create(
        model="gpt-4o-mini", messages=messages, tools=tools)
    msg = r.choices[0].message
    messages.append(msg)
    if not msg.tool_calls:                # model asked for nothing → done
        print(msg.content)
        break
    call = msg.tool_calls[0]
    args = json.loads(call.function.arguments)
    result = globals()[call.function.name](**args)   # execute locally
    messages.append({"role": "tool", "tool_call_id": call.id,
                     "content": result})`,
    annot: [
      'The <b>while loop</b> is the entire upgrade — the model, endpoint and call stay identical to your chatbot.',
      'msg.tool_calls is a <b>request</b>; globals()[name](**args) executes in YOUR process (deep dive in reel 52).',
      'The loop ends when the model stops asking for tools — in production, also cap the turns (reel 14).'
    ]
  },

  recap: [
    'Chatbot answers once · agent **loops** till done',
    'Same model, same API — new **while loop**',
    'Tools turn replies into **actions**'
  ],

  quiz: {
    q: 'You upgrade your reel-43 chatbot into an agent. What actually changes?',
    opts: [
      'You swap in a bigger model',
      'You add tools and a loop around the same chat call',
      'You switch from JSON to XML payloads',
      'You add a vector database'
    ],
    a: 1,
    why: 'An agent is chat code plus a tool registry and an outer loop that feeds tool results back until the goal is met. The model call itself is identical — reel 50 names these three parts.'
  },

  notes: `
# From chatbot to agent

## The starting point: your chatbot (reel 43)
The chatbot from reel 43 is a straight line: build a message list, call \`chat.completions.create\`, print the reply, stop. One turn, one answer. Everything the user wants done *outside* the conversation is left to the user.

## The three additions
| Change | Chatbot | Agent |
|---|---|---|
| Input | a question | a **goal** (the outcome) |
| API call | \`messages=\` only | \`messages=\` **+ \`tools=[...]\`** |
| Control flow | one call | a **loop** until done |

1. **Goal** — phrased as an outcome ("refund order 1234"), not a question.
2. **Tools** — plain Python functions described to the model as name + description + JSON Schema.
3. **Loop** — call the model, execute any \`tool_calls\` it requests, append the results as \`role: "tool"\` messages, and call again.

## What actually changes in code
> **The model is identical.** Same weights, same endpoint, same price per token. Every difference lives in *your* code — the loop, the tool registry, the termination check. You are not upgrading the brain; you are building the body around it.

- The model signals "I'm done" by returning **no** \`tool_calls\` — that's your loop-exit condition.
- \`tool_calls\` are requests, not actions. Your process validates the arguments and executes (r52 goes deep; r53 makes it safe).

## Gotchas
- **Termination**: a confused model can ask for tools forever. Cap turns (e.g. \`range(10)\`) — same lesson as retries in reel 14.
- **Cost**: the message list grows every iteration, so each pass costs more than the last. Watch token usage in production.
- **Trust**: tool arguments are model output — validate them before they touch a database (r15, r19).

## What's next
- Reel 50 — the anatomy: goal, tools, and the sense-think-act loop, named.
- Reel 52 — how \`tools=[...]\` and \`tool_calls\` actually work under the hood.
`
});
