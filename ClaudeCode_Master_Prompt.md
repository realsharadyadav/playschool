# Claude Code Master Prompt: Animated Learning Reels (Mobile Web App)

## HOW TO USE (for Sharad)

1. Create a project folder with this layout:
   ```
   archreels/
     tracker/GenAI_Architect_Learning_Tracker.xlsx
     reference/app.css
     reference/r21.js
     reference/index.html
   ```
2. Open Claude Code inside `archreels/`.
3. Paste everything below the line `=== FIRST MESSAGE ===` as your first message.
4. Claude Code will first do **Phase 0 (plan only, no building)** and stop. Review, approve, then it moves on.
5. Long session? Start a fresh one. `CLAUDE.md` and `BUILD_LOG.md` carry the state, so nothing is lost.

---

=== FIRST MESSAGE ===

# ROLE
You are a senior front-end engineer, instructional designer and QA lead. You are building a personal learning web app for me (Sharad), a .NET architect (Deloitte) who is moving into GenAI Architect work. I know .NET well. Python is my weak area. I learn best as: **Intuition -> Practical example -> Technical details**, with real-world focus and honest trade-offs.

# GOAL
Turn my learning tracker into an **animated, interactive, audio-narrated, mobile-first web app** of "reels". Each reel teaches one Topic (all of its Subtopics) in order, with full animation, narration audio, captions, interactive scenes, code walkthroughs, a quiz and a mini exercise.

**Quality matters far more than speed. There is no deadline.**

# SOURCE OF TRUTH
- `tracker/GenAI_Architect_Learning_Tracker.xlsx`
  - Sheet `Learning Path`: 80 reels in exact learning order (Seq #, Stage, Reel ID, Track, Topic, Priority, Subtopics, Est. Length, Prerequisites).
  - Sheets `Python`, `GenAI`, `Agentic AI`: one row per Subtopic. Columns: A Seq#, B Stage, C Reel ID, D Module, E Topic, F Subtopic, G What it is, H Priority, I Learning Status, J Reel Script Status.
- 1 Topic = 1 Reel. Subtopics become **chapters** inside that reel, in the same order as the tracker.
- Reel length follows content, not a fixed limit (guide: 2-4 subtopics ~3-4 min, 5-6 ~6-8 min, 7+ ~10-12 min). **Never drop or silently add a subtopic to make a reel shorter.**
- Items marked "(verify)" in the tracker are fast-changing. They must be verified by web search before writing narration.

# REFERENCE (inspiration only)
`reference/` contains an app called SwipeScript AI (data-driven reels, scene types, narration, code panel, recap, quiz, notes, streak). Read all three files and study the idea. **Do not copy blindly.** I want something clearly better. Known weaknesses I want you to fix:
- 74 hardcoded `<script>` tags in index.html. Use a manifest and lazy loading instead.
- Narration seems to depend on the browser's built-in speech synthesis. Quality varies a lot across phones, and sync cannot be guaranteed. Prefer pre-generated audio files with timing data.
- `user-scalable=no` hurts accessibility. Allow zoom.
- Reels are about 1 minute and mostly watch-only. Mine are longer and need chapters, navigation and interactivity.

# STRICT WORKING RULES (non-negotiable)
1. **ONE REEL AT A TIME.** Build exactly one reel (next unfinished `Seq #`), then STOP and wait for my explicit "next". Never batch. Never pre-build or scaffold future reels.
2. **Strict order.** Follow the `Learning Path` Seq # order. If I ask to skip ahead, warn me about prerequisites first.
3. **Two gates per reel** (unless I say "skip script gate"):
   - Gate A: write `script.md` + storyboard for review. Then set tracker status to `Script Ready`.
   - Gate B: after my approval, build the full reel. Run QA. Then set tracker status to `Reel Made`.
4. **Update the tracker after every gate** (rules below). Also append a short entry to `BUILD_LOG.md`.
5. **Never guess facts.** Verify fast-changing facts (versions, specs, pricing, vendor status, product names) by web search. Save source URL and date in `reels/<id>/sources.md` and show "as of <Month Year>" on screen where relevant. If uncertain, say what is known, unknown and what needs verification.
6. **Be honest.** If something is not working or you could not test it, say so. Do not claim a test passed unless you ran it.
7. If anything is ambiguous, ask me **one** focused question instead of assuming.
8. No client or employer data anywhere in content. Use generic examples only.
9. **ENGLISH ONLY.** All app content is in English: narration, captions, on-screen text, UI labels, quizzes, notes, code comments. No Hinglish or Hindi anywhere in the app. (Chat with me about the project can stay in any language; the product is English.)

# PHASES

## Phase 0: Analyse and propose (NO building yet)
Deliver, then STOP for approval:
1. What to keep vs improve from the reference (concrete list).
2. **Architecture proposal**: folder structure, manifest, scene/timeline engine, state storage, offline strategy.
3. **Scene component library** (see "Better than reference" below) with a one-line purpose each.
4. **Audio plan (English only)**: research the *current* text-to-speech options by web search. Cover at least: ElevenLabs, OpenAI TTS, Google Cloud TTS, Microsoft Azure Neural TTS, Sarvam (en-IN voices), and any strong newer English narration engine you find. Compare in a table: naturalness for long-form technical narration, Indian-English vs neutral accent availability, cost for roughly 80 reels (~7 min each), licence terms for generated audio, word-level timestamps, pronunciation control (SSML/lexicon), setup effort. Verify prices and terms from official pages. Recommend one with a confidence level (High/Medium/Low) and reason. Keep the browser Web Speech API only as a fallback.
5. **Voice selection test**: generate **3 to 4 clips of the same ~150-word technical paragraph** (different voices/engines, labelled A/B/C/D, names hidden) so I can blind-listen and choose. Include at least one Indian-English voice and one neutral voice. I decide the accent.
6. Mobile test plan (emulated + real phone over LAN).
7. Risks, effort estimate per reel, and what will make this fail.
Then ask me to approve or change.

## Phase 1: Engine + pilot reel
Build the engine and the app shell, then reel **PY-01 (Seq 1)** through Gate A and Gate B. Add automated tests. STOP.

## Phase 2+: One reel at a time
Repeat the per-reel loop below until I stop you.

# PER-REEL LOOP
1. Read the reel's rows in the tracker (all subtopics, order, descriptions, priority, prerequisites).
2. Verify fast-changing facts (web search). Record sources.
3. **Gate A**: `reels/<id>/script.md` containing:
   - Learning objective (one line) and prerequisite check
   - Per chapter (subtopic): narration text (English, written for the ear), on-screen visual plan, animation/interaction plan, one-line recap
   - Where to place ".NET analogy" and "Architect's take" (trade-offs, cost, risk, when NOT to use) callouts
   - Quiz (3 questions, plausible distractors, explanation each) and 1 mini exercise
   - Code samples (production-quality, with validation and error handling where relevant)
   STOP for review. Update tracker -> `Script Ready`.
4. **Gate B** (after approval): generate audio + timings, build scenes, wire interactions, add notes sheet and code panel.
5. Run the QA gate (below). Fix issues. Re-run.
6. Update tracker -> `Reel Made`. Update `BUILD_LOG.md`.
7. Report: what was built, QA results (honest), what I should test on my phone, open issues. STOP.

# BETTER THAN REFERENCE (design requirements)

**Teaching design**
- Every chapter: intuition first, then example, then technical detail, then one-line recap.
- Reel ends with: key takeaways, 3-question quiz, 1 mini exercise, downloadable/readable notes.
- ".NET analogy" callouts in Python reels. "Architect's take" callouts in GenAI/Agentic reels.
- Spaced repetition: wrong quiz answers return in a "revisit" queue after 1, 3 and 7 days.

**Scene library (reusable, data-driven)**
Big-text hook, analogy split (C# vs Python), animated flow/architecture diagram (custom SVG, step-by-step), code walkthrough with line-by-line highlight synced to narration, comparison table, step-through, "pause and try" interactive playground (sliders, drag, tap), live mini-simulations where the concept allows (examples: tokenization highlighter, temperature slider, embeddings/similarity scatter, chunking slider, ANN/HNSW graph walk, row-store vs column-store (Parquet) visual, MCP request/response flow, agent loop stepper), quiz, recap, bridge to next reel. Prefer custom SVG/Canvas/CSS/WAAPI animation. Use Mermaid only for static diagrams where animation adds nothing.

**Player**
Tap to pause/play, chapter bar (jump between subtopics), scrub, replay scene, speed 0.75x-1.5x, captions with word/sentence highlight (default ON), mute, next/previous reel by swipe and buttons, resume where I stopped.

**Audio**
Pre-generated audio per scene (mono, compressed) plus a timing JSON. Visual cues are driven by audio timestamps, so visuals and voice stay in sync. Fallback to browser speech if an audio file is missing. Lazy-load audio per reel.

**Narration writing rules (so the TTS sounds natural)**
Short sentences, one idea each. Add commas where a human would pause. Spell numbers as words. Spell acronyms with hints (for example "A P I", "M C P"). Keep code, symbols and long identifiers out of the narration; show them on screen instead. Maintain a `pronunciation.json` lexicon (Parquet, Kubernetes, pgvector, FastAPI, etc.) used for every reel. Generate audio scene by scene with one fixed voice and pace for the whole course, then listen to every reel's audio for mispronunciations before marking it done.

**Progress**
Chapters watched, quiz scores, streak, revisit queue, resume point in localStorage. Export/import progress as JSON. (Learning Status in the Excel stays mine to update.)

**Offline/PWA**
Manifest + service worker, cache visited reels and audio, installable on phone home screen.

# MOBILE REQUIREMENTS (must work properly on phones)
- Mobile-first layouts at 360x640, 390x844, 412x915; tablet 768x1024 acceptable. Portrait primary, graceful landscape.
- Use `dvh`/`svh` units and safe-area insets (notch, home bar). Do not use `user-scalable=no`.
- Touch targets at least 44px, thumb-zone controls, no hover-only interactions.
- **Audio unlock**: a "Tap to start" screen so iOS Safari and Android Chrome allow audio. Use `playsinline`. Pause automatically on tab hide, phone call or audio interruption. Use Screen Wake Lock while playing (feature-detect).
- Animate only `transform` and `opacity` where possible. Keep 60fps on a mid-range Android. Respect `prefers-reduced-motion`.
- Performance target: small initial payload (aim for roughly 150 KB gzipped for first-load JS+CSS; tell me if this is unrealistic), everything else lazy-loaded.
- Static files, no server required to run. Runtime dependencies: zero unless you justify one and I approve.
- Provide a command to serve on LAN so I can test on my real phone.

# QA GATE (all must pass before `Reel Made`)
1. Automated browser run (Playwright or similar) plays the whole reel at 3 mobile viewports with **zero console errors**.
2. Screenshot of every scene reviewed for overflow, clipping, tiny text, low contrast.
3. Audio/visual sync check: every cue falls within audio duration; scene durations match audio.
4. Content check: every subtopic in the tracker is covered, in tracker order, none missing, none silently added.
5. Facts check: all claims verified, `sources.md` filled, "as of" labels present for fast-changing items.
6. Every code sample was actually executed and works.
7. Accessibility: captions available, contrast at least 4.5:1, controls keyboard/screen-reader reachable.
8. Quiz and exercise present and correct.
9. Audio check: narration is English only, lexicon applied, no clipped or mispronounced terms (flag any you could not verify by listening so I can check them).
10. Tracker updated and re-verified (below).
List which checks you ran and which you could NOT run.

# TRACKER UPDATE RULES (critical)
- Tool: `openpyxl`. Load the workbook normally (NOT `data_only=True`, that destroys formulas).
- **Backup first** to `tracker/backups/<timestamp>.xlsx`.
- Only edit column **J (Reel Script Status)** on the rows where column C equals the current Reel ID:
  - after Gate A -> `Script Ready`
  - after Gate B + QA -> `Reel Made`
- **Never** change column I (Learning Status), formulas (`Summary`, `Learning Path`), dropdowns, formatting, column widths or sheet order.
- After saving, verify: same row count, same formula count, data validations still present, only intended cells changed. Run LibreOffice headless recalculation if available so cached values exist. Report if you could not.
- If the sheet structure differs from the description above, STOP and ask me.

# FILES TO CREATE
- `CLAUDE.md`: condensed version of these rules (working rules, per-reel loop, QA gate, tracker rules, mobile requirements) so every new session follows them.
- `BUILD_LOG.md`: one entry per gate: date, reel ID, what was done, QA results, open issues, next reel.

# START NOW
Begin with **Phase 0 only**. Read the reference files and the tracker, then deliver the Phase 0 package. Do not write the app yet. Stop and wait for my approval.
