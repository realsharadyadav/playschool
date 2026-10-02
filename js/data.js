/* SwipeScript AI — curriculum map + reel registry (v2: 74 reels, .NET-dev crosswalk) */
(function () {
  const SS = window.SS;
  SS.reels = {};
  SS.registerReel = d => { SS.reels[d.id] = d; };

  SS.curriculum = {
    python: {
      label: 'Python', icon: '🐍', tagline: 'Python for the .NET developer — every concept mapped to something you already know.',
      reels: [
        { id: 'r1', num: 1, block: 'Python for GenAI', title: 'Why Python runs the AI world' },
        { id: 'r2', num: 2, block: 'Python for GenAI', title: 'Python for the .NET dev — the 10-minute crosswalk' },
        { id: 'r3', num: 3, block: 'Python for GenAI', title: 'Variables & f-strings' },
        { id: 'r4', num: 4, block: 'Python for GenAI', title: 'dicts & JSON — the language of LLM APIs' },
        { id: 'r5', num: 5, block: 'Python for GenAI', title: 'Lists & comprehensions' },
        { id: 'r6', num: 6, block: 'Python for GenAI', title: 'Functions — your first tool' },
        { id: 'r7', num: 7, block: 'Python for GenAI', title: '*args & **kwargs — how tool-call arguments arrive' },
        { id: 'r8', num: 8, block: 'Python for GenAI', title: 'Classes & dataclasses' },
        { id: 'r9', num: 9, block: 'Python for GenAI', title: 'Modules & imports — Python’s using statement' },
        { id: 'r10', num: 10, block: 'Python for GenAI', title: 'Build & share your own library' },
        { id: 'r11', num: 11, block: 'Python for GenAI', title: 'Calling APIs with httpx' },
        { id: 'r12', num: 12, block: 'Python for GenAI', title: 'async & streaming' },
        { id: 'r13', num: 13, block: 'Python for GenAI', title: '.env & API keys — secrets done right' },
        { id: 'r14', num: 14, block: 'Python for GenAI', title: 'Errors & retries — resilient AI calls' },
        { id: 'r15', num: 15, block: 'Python for GenAI', title: 'Pydantic — trusting LLM output' },
        { id: 'r16', num: 16, block: 'Python for GenAI', title: 'Connect to SQL Server from Python' },
        { id: 'r17', num: 17, block: 'Python for GenAI', title: 'SQLAlchemy & pandas — the EF Core + LINQ of Python' },
        { id: 'r18', num: 18, block: 'Python for GenAI', title: 'Parquet files in Python' },
        { id: 'r19', num: 19, block: 'Python for GenAI', title: 'Let the LLM write SQL — safely' }
      ]
    },
    genai: {
      label: 'GenAI', icon: '🧠', tagline: 'LLMs, tokens, embeddings, vector storage, RAG & chatbots.',
      reels: [
        { id: 'r20', num: 20, block: 'Core Concepts', title: 'What is GenAI? — intuition first' },
        { id: 'r21', num: 21, block: 'Core Concepts', title: 'How an LLM thinks' },
        { id: 'r22', num: 22, block: 'Core Concepts', title: 'Tokens & tokenization' },
        { id: 'r23', num: 23, block: 'Core Concepts', title: 'Context window — the model’s desk' },
        { id: 'r24', num: 24, block: 'Core Concepts', title: 'Temperature, top-p & max_tokens' },
        { id: 'r25', num: 25, block: 'Core Concepts', title: 'Prompt engineering 101 — roles' },
        { id: 'r26', num: 26, block: 'Core Concepts', title: 'Prompt patterns — few-shot & chain-of-thought' },
        { id: 'r27', num: 27, block: 'Core Concepts', title: 'Structured output & JSON mode' },
        { id: 'r28', num: 28, block: 'Core Concepts', title: 'Hallucination — why models invent facts' },
        { id: 'r29', num: 29, block: 'Embeddings', title: 'Embeddings explained' },
        { id: 'r30', num: 30, block: 'Embeddings', title: 'Types of embeddings — word, sentence, image, code…' },
        { id: 'r31', num: 31, block: 'Embeddings', title: 'Cosine similarity playground' },
        { id: 'r32', num: 32, block: 'Embeddings', title: 'Embedding models in practice' },
        { id: 'r33', num: 33, block: 'Embeddings', title: 'Where to store vectors — the full menu' },
        { id: 'r34', num: 34, block: 'Embeddings', title: 'Parquet + SQL — query your embeddings with DuckDB' },
        { id: 'r35', num: 35, block: 'Embeddings', title: 'Embeddings → search & RAG' },
        { id: 'r36', num: 36, block: 'RAG', title: 'RAG: the big picture' },
        { id: 'r37', num: 37, block: 'RAG', title: 'Chunking strategies' },
        { id: 'r38', num: 38, block: 'RAG', title: 'Vector databases compared — FAISS to Pinecone' },
        { id: 'r39', num: 39, block: 'RAG', title: 'Retrieval tricks — hybrid & reranking' },
        { id: 'r40', num: 40, block: 'RAG', title: 'Build your first RAG — from scratch' },
        { id: 'r41', num: 41, block: 'RAG', title: 'RAG failure modes & evaluation' },
        { id: 'r42', num: 42, block: 'RAG', title: 'Advanced RAG — HyDE & agentic RAG' },
        { id: 'r43', num: 43, block: 'ChatBots', title: 'Anatomy of a chatbot' },
        { id: 'r44', num: 44, block: 'ChatBots', title: 'Conversation memory' },
        { id: 'r45', num: 45, block: 'ChatBots', title: 'Summarization memory' },
        { id: 'r46', num: 46, block: 'ChatBots', title: 'Streaming chat UX' },
        { id: 'r47', num: 47, block: 'ChatBots', title: 'Chatbot evals' },
        { id: 'r48', num: 48, block: 'Ship It', title: 'From notebook to real app' }
      ]
    },
    agentic: {
      label: 'Agentic AI', icon: '🤖', tagline: 'Agents, tools, frameworks — and the Excel-MCP-SOP capstone.',
      reels: [
        { id: 'r49', num: 49, block: 'Agent Fundamentals', title: 'From chatbot to agent' },
        { id: 'r50', num: 50, block: 'Agent Fundamentals', title: 'What is an agent?' },
        { id: 'r51', num: 51, block: 'Agent Fundamentals', title: 'LLM as the brain' },
        { id: 'r52', num: 52, block: 'Agent Fundamentals', title: 'Tools — function calling deep dive' },
        { id: 'r53', num: 53, block: 'Agent Fundamentals', title: 'Designing good tools' },
        { id: 'r54', num: 54, block: 'Agent Fundamentals', title: 'ReAct — reasoning + acting' },
        { id: 'r55', num: 55, block: 'Agent Fundamentals', title: 'Planning & task decomposition' },
        { id: 'r56', num: 56, block: 'Agent Fundamentals', title: 'Reflection & self-correction' },
        { id: 'r57', num: 57, block: 'Agent Fundamentals', title: 'Agent memory' },
        { id: 'r58', num: 58, block: 'Agent Fundamentals', title: 'Multi-agent teams' },
        { id: 'r59', num: 59, block: 'Agent Fundamentals', title: 'Agent frameworks — LangGraph to CrewAI' },
        { id: 'r60', num: 60, block: 'Agent Fundamentals', title: 'Human-in-the-loop & guardrails' },
        { id: 'r61', num: 61, block: 'Agentic Use Cases', title: 'Use case: research agent' },
        { id: 'r62', num: 62, block: 'Agentic Use Cases', title: 'Use case: coding agent' },
        { id: 'r63', num: 63, block: 'Agentic Use Cases', title: 'Use case: support agent' },
        { id: 'r64', num: 64, block: 'Capstone: Excel Agent', title: 'SOPs × spreadsheets — the real problem' },
        { id: 'r65', num: 65, block: 'Capstone: Excel Agent', title: 'Build the Excel MCP server' },
        { id: 'r66', num: 66, block: 'Capstone: Excel Agent', title: 'The SOP-following agent — plan, validate, approve' },
        { id: 'r67', num: 67, block: 'Capstone: Excel Agent', title: 'End-to-end: multi-sheet reconciliation agent' },
        { id: 'r68', num: 68, block: 'MCP', title: 'The N×M problem' },
        { id: 'r69', num: 69, block: 'MCP', title: 'MCP: USB-C for AI' },
        { id: 'r70', num: 70, block: 'MCP', title: 'MCP architecture' },
        { id: 'r71', num: 71, block: 'MCP', title: 'Tools, resources & prompts' },
        { id: 'r72', num: 72, block: 'MCP', title: 'Build your first MCP server' },
        { id: 'r73', num: 73, block: 'MCP', title: 'MCP + agents — client wiring' },
        { id: 'r74', num: 74, block: 'MCP', title: 'Security, auth & ecosystem' }
      ]
    }
  };
  SS.totalReels = Object.values(SS.curriculum).reduce((n, s) => n + s.reels.length, 0);
})();
