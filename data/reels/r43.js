/* Reel 43 — Anatomy of a chatbot (GenAI · ChatBots) */
SS.registerReel({
  id: 'r43', num: 43, section: 'genai', block: 'ChatBots',
  title: 'Anatomy of a chatbot',
  hook: 'A chatbot is not the LLM. **It’s everything AROUND the LLM.**',

  scenes: [
    {
      type: 'arch',
      layers: [
        { e: '🖥️', t: 'Chat UI', s: 'messages, streaming, history display' },
        { e: '🧠', t: 'State manager', s: 'conversation memory (reel 44)' },
        { e: '🎯', t: 'Prompt composer', s: 'system + history + user msg' },
        { e: '📞', t: 'Model + tools', s: 'LLM API, retrieval, guardrails' }
      ],
      narration: 'A production chatbot, layered. The UI renders messages and streams tokens live. The state manager owns what the model remembers — the conversation history, or its compressed form. The prompt composer assembles the full desk on every turn: system prompt, history, the new message. And the model layer does generation — optionally calling retrieval and tools along the way. Notice which layer is the LLM: one of four.'
    },
    {
      type: 'bigtext', kicker: 'THE REFRAME',
      title: 'The model is **stateless.** All “conversation” is engineering.',
      sub: 'Every request: full history in, new tokens out.',
      narration: 'The reframe that makes chatbots buildable: the model has no memory. None. Every API call is a complete, self-contained desk — system prompt, full history, latest message. The chatbot’s entire job is deciding WHAT goes on that desk each turn: what to keep, what to compress, what to retrieve. The intelligence is rented; the memory architecture is yours.'
    },
    {
      type: 'diagram',
      nodes: [
        { e: '💬', t: 'user msg', s: '"and what about pricing?"' },
        { e: '📜', t: 'history', s: 'previous turns' },
        { e: '📄', t: 'system prompt', s: 'persona + policy' },
        { e: '📦', t: 'POST /chat', s: 'composed payload' }
      ],
      narration: 'One turn, step by step. The user sends “and what about pricing?” — meaningless without context. The state manager appends it to the running history, composes the payload — system prompt plus every prior turn plus this message — and posts. The model answers as if it remembers everything, because you re-sent everything. The illusion of memory is faithful bookkeeping.'
    },
    {
      type: 'list',
      items: [
        { e: '🧾', t: 'Message list', s: '[{role, content}, …] — the contract' },
        { e: '🔁', t: 'Round-trips', s: 'each turn resends history' },
        { e: '📏', t: 'Context budget', s: 'history eats the desk (reel 23)' },
        { e: '🧹', t: 'Memory strategies', s: 'next: reels 44–45' }
      ],
      narration: 'The mechanics. The message list — role and content pairs — is the entire API contract between your app and the model. Every turn resends it: the round trips compound cost and latency linearly with history length. The context budget means history can’t grow forever. And so the next two reels are the memory strategies: sliding windows and summarization — the difference between a chatbot that scales and one that chokes.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'Anatomy understood. **First organ: memory.**',
      next: 'Next · Reel 44: Conversation memory',
      narration: 'You now see the whole body: UI, state, composer, model. The first organ to study deeply is memory — how a stateless model holds a conversation across twenty turns without bankrupting your context window. Reel forty-four, swipe up.'
    }
  ],

  code: {
    title: '🐍 The chatbot core — every turn, honestly',
    body:
`import httpx

SYSTEM = "You are SupportBot for Contoso. Be brief, friendly, exact."

class ChatSession:
    """Owns the illusion of memory."""

    def __init__(self):
        self.history = []            # [{role, content}, ...]

    def _compose(self, user_msg: str) -> list[dict]:
        return [{"role": "system", "content": SYSTEM},
                *self.history,
                {"role": "user", "content": user_msg}]

    def send(self, user_msg: str) -> str:
        r = httpx.post("http://localhost:11434/v1/chat/completions",
                       json={"model": "llama3.1",
                             "messages": self._compose(user_msg),
                             "temperature": 0.3}, timeout=60)
        reply = r.json()["choices"][0]["message"]["content"]
        # memory = bookkeeping: append BOTH sides
        self.history.append({"role": "user", "content": user_msg})
        self.history.append({"role": "assistant", "content": reply})
        return reply

chat = ChatSession()
print(chat.send("hi, do you ship to Canada?"))
print(chat.send("and how long does that take?"))   # "that" = resolved via history`,
    annot: [
      '<b>self.history is the whole memory</b> — the model stays stateless; the session object owns continuity.',
      '<b>Append both sides after the call</b> — user message AND reply — or the next composition misses half the conversation.',
      '<b>"that" resolves through resending</b> — pronouns work because prior turns ride along on the desk (until the budget forces pruning — next reels).'
    ]
  },

  recap: [
    'Chatbot = <b>UI + state manager + composer + model</b>',
      'The model is stateless — <b>memory is bookkeeping</b>',
    'History resends every turn — <b>cost & context grow linearly</b>'
  ],

  quiz: {
    q: 'Why does a 40-turn conversation get slower AND more expensive with each message, even at a fixed model size?',
    opts: [
      'The model loads more parameters as context grows',
      'Each turn resends the entire history — more input tokens means more compute and cost per call',
      'The server stores state and charges rent on it',
      'Longer histories require higher temperature settings'
    ],
    a: 1,
    why: 'Statelessness means the full message list is retransmitted and reprocessed every call. Input tokens are billed and take compute to process, so turn N costs roughly N× the first turn. This linear growth is exactly why memory management (reels 44–45) is the first scaling problem every chatbot hits.'
  },

  notes: `
# Anatomy of a chatbot

## The four layers, concretely

| Layer | Owns | Failure mode when neglected |
| --- | --- | --- |
| UI | message list, streaming render, input state | users leave before answer completes (reel 46) |
| State manager | history, user/session identity, memory policy | context overflow, cross-talk between users, runaway cost |
| Prompt composer | system prompt, history selection, tool/RAG injection | inconsistent persona, stale grounding, prompt bloat |
| Model/tools | generation, retrieval calls, guardrails | hallucination (28), no escalation path |

## The message contract
\`\`\`
[
  {"role": "system",      "content": "..."},
  {"role": "user",        "content": "..."},
  {"role": "assistant",   "content": "..."},
  ...
]
\`\`\`
- Roles: \`system\` (setup), \`user\`, \`assistant\` — some APIs add \`tool\`.
- Alternation is conventional; the API accepts what you send — you could fabricate “assistant” turns (used in few-shot, reel 26).
- **Tool outputs** join as \`role: "tool"\` messages (reel 52’s function calling).

## Hidden responsibilities of the state manager
- **User isolation**: one \`ChatSession\` per user/thread — never share history across users.
- **Persistence**: \`history\` usually outlives a process; store in DB/Redis keyed by session-id.
- **Budgeting**: enforce a max history size BEFORE the composer — reels 44/45.
- **Injection points**: retrieval context and tool results enter the composer here, not in the UI.

## Cost curve, stated plainly
At ~1K input tokens per turn average, turn 30 resends ~30K tokens. With a 128K window you fit it — and pay for it every single turn. Chatbots are the use case where context economics (reel 23) stop being theory.

> **.NET ↔ Python:** \`ChatSession\` ≈ a scoped DI service in ASP.NET (one per connection/session); the composer is a plain function over a message list. The stack choice is UI/serving preference; the architecture is identical.

## Guardrails preview
Production bots add: input moderation, output filtering, rate limits, and an escape hatch to humans — reel 60’s guardrails and reel 63’s support-agent pattern both live on this skeleton.

Next: reel 44 — conversation memory: the sliding window and beyond.
`
});
