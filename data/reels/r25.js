/* Reel 25 — Prompt engineering 101 — roles (GenAI · Core Concepts) */
SS.registerReel({
  id: 'r25', num: 25, section: 'genai', block: 'Core Concepts',
  title: 'Prompt engineering 101 — roles',
  hook: 'One line at the top changes everything: **“You are a …”**',

  scenes: [
    {
      type: 'bigtext', kicker: 'TECHNIQUE #1',
      title: 'The system prompt is **the model’s job description.**',
      sub: 'Role, goal, constraints — set before the conversation starts.',
      narration: 'The single highest-leverage line in all of prompting is the role. “You are a senior database reviewer.” That sentence re-anchors vocabulary, depth, tone, and caution — instantly. The system prompt is not a greeting; it is the model’s job description, and it rides along invisibly with every single turn.'
    },
    {
      type: 'chat',
      bubbles: [
        { who: 'bot', text: 'You are a senior SQL Server DBA reviewing slow queries. Be terse. Flag risks first.', tool: 'system prompt' },
        { who: 'you', text: 'Why is this query slow? SELECT * FROM Orders WHERE YEAR(Created)=2025' },
        { who: 'bot', text: 'SARGable violation: YEAR() kills the index. Use Created >= 2025-01-01. Also: SELECT * — name columns.' }
      ],
      narration: 'See the shape. The system bubble sets role, expertise, and output style before you say a word. Then your question lands in a context that’s already primed: a DBA answers differently than a general assistant — terser, sharper, more paranoid about indexes.'
    },
    {
      type: 'list',
      items: [
        { e: '👤', t: 'Role', s: '“You are a senior X” — anchors expertise' },
        { e: '🎯', t: 'Goal', s: 'what a GOOD answer accomplishes' },
        { e: '🚫', t: 'Constraints', s: 'length, format, things to refuse' },
        { e: '🗣️', t: 'Voice', s: 'terse, casual, no-fluff instructions' }
      ],
      narration: 'The four-part system prompt. Role: who the model is — expertise level changes answer depth more than any other knob. Goal: what a good answer accomplishes. Constraints: format, length, what to avoid. Voice: how it should sound. Two to four sentences total; the system prompt is a spec, not an essay.'
    },
    {
      type: 'compare',
      cards: [
        { e: '🌫️', t: '“Answer questions about SQL.”', s: 'generic — generic answers' },
        { e: '🎯', t: '“You are a senior DBA. Terse. Flag index risks first. No introductory paragraphs.”', s: 'specific — shaped answers', win: true }
      ],
      narration: 'Contrast. The vague prompt gets you Wikipedia-with-extra-steps. The specific one gets answers shaped like a colleague’s — because you’ve specified the colleague. Notice the system prompt is doing the work that would otherwise take three rounds of corrections.'
    },
    {
      type: 'bridge', kicker: 'UP NEXT',
      title: 'Roles set the who. **Next: patterns that set the how.**',
      next: 'Next · Reel 26: Prompt patterns — few-shot & chain-of-thought',
      narration: 'Roles are the foundation — job description before the interview. Next reel: the two patterns that make output reliable and reasoning visible: few-shot examples and chain-of-thought. Reel twenty-six, swipe up.'
    }
  ],

  code: {
    title: '🐍 The system-prompt pattern, in code',
    body:
`import httpx

SYSTEM = """You are a senior SQL Server DBA reviewing queries.
Goals: catch performance killers, name the fix.
Style: terse. No introductions, no summaries.
Rules: never suggest SELECT *; always mention index impact."""

def ask(user_msg: str) -> str:
    resp = httpx.post(
        "http://localhost:11434/v1/chat/completions",
        json={
            "model": "llama3.1",
            "messages": [
                {"role": "system", "content": SYSTEM},   # the job description
                {"role": "user", "content": user_msg},
            ],
            "temperature": 0.2,
        },
        timeout=60,
    )
    return resp.json()["choices"][0]["message"]["content"]

print(ask("SELECT * FROM Orders WHERE YEAR(Created) = 2025"))`,
    annot: [
      '<b>role / goals / style / rules</b> — the four-part skeleton; memorize it and fill per use case.',
      'The system message is sent <b>every call</b> (reel 23) — it costs tokens, so keep it tight; verbosity here is literally money.',
      '<b>temperature 0.2</b> pairs with a strong system prompt: the role supplies variety, the temperature supplies discipline.'
    ]
  },

  recap: [
    'System prompt = <b>job description</b>: role, goal, constraints, voice',
    'Specificity beats length — <b>name the expert, not the topic</b>',
    'It’s billed every call — <b>keep it tight</b>'
  ],

  quiz: {
    q: 'Two prompts, same question. Which system prompt produces more consistent, expert-level answers?',
    opts: [
      '"You are a helpful assistant."',
      '"You are a senior SQL Server DBA. Terse. Flag index risks first. No intro paragraphs."',
      '"Please try your best to answer well."',
      '"SYSTEM: be good at SQL."'
    ],
    a: 1,
    why: 'The specific role plus explicit style rules and constraints primes vocabulary, depth, and format before the first user message. Generic politeness adds nothing the model doesn’t already assume — specificity is the entire mechanism.'
  },

  notes: `
# Prompt engineering 101 — roles

## Why roles work
LLMs are trained on text where style and expertise correlate with content. “You are a senior DBA” activates the statistical neighborhood of DBA writing: precise, index-aware, terse. You’re not programming behavior; you’re selecting a region of the model’s knowledge-space. That’s why role beats topic every time.

## The four-part skeleton
\`\`\`
You are a [role with seniority + domain].            # identity
Your goal: [what a good answer accomplishes].        # direction
Style: [terse / casual / structured].                # voice
Rules: [format, length, hard refusals].              # rails
\`\`\`

Fill all four in 2–4 sentences. If it’s longer than ~150 words, you’re writing an essay, not a spec.

## Roles in the broader course
- **RAG (reel 36)**: “Answer ONLY from the provided context; say ‘I don’t know’ otherwise.”
- **Chatbots (reel 43)**: role + safety rails + escalation policy.
- **Agents (reel 50)**: the agent’s persona usually lives in the system prompt; tool instructions join in reel 52.
- **Structured output (reel 27)**: role (“you are a JSON emitter”) + schema.

## Advanced role moves
- **Two-role contrast**: “First as a skeptic, then as an advocate” — cheap self-ensemble.
- **Audience pinning**: “Explain to a CFO” vs “explain to a kernel developer” — same facts, different grain.
- **Negative space**: what the role is NOT often matters as much as what it is (“not a tutorial writer; no step numbering”).

> **.NET ↔ Python:** Think of the system prompt as the constructor argument of a strategy class — it configures behavior once, and every method call (user message) inherits it. Refactoring a prompt is like refactoring a class interface: change the spec, not every call site.

## Gotchas
- Conflicting instructions: “be terse” + “explain thoroughly” — the model averages them into mush. Pick one.
- Role escalation arms race (“you are the WORLD’S FOREMOST EXPERT”) adds little past genuine specificity.
- The system prompt can’t override model-level safety training — don’t architect around that.

Next: reel 26 — few-shot examples and chain-of-thought: the reliability patterns.
`
});
