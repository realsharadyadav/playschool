# Changelog

## v2.0.0 — Motion upgrade + PWA (2026-10-03)

### Motion & visuals
- **GSAP scene transitions** — scenes now exit (fade + rise + soft blur) and enter (spring `back.out`) on every reel; instant-swap fallback if the CDN is unreachable
- **Living background** — canvas layer behind every reel: four accent-tinted blobs drifting slowly plus twinkling rising "pollen" dots; auto-tints per section (amber Python / green GenAI / teal Agentic), pauses off-screen, respects `prefers-reduced-motion`
- **Animated hook accent on all 74 reels** — hand-authored Lottie loop (pulsing core, expanding ripple, three orbiting dots) tinted per section via the reel's accent color

### PWA & publishing
- **Favicon set** — SVG favicon + 32×32 PNG fallback + 180×180 Apple touch icon
- **Social share card** — 1200×630 branded og:image + full Open Graph / Twitter Card meta
- **Web app manifest** — installable, standalone display, portrait, 192/512 + maskable icons
- **Service worker** — precaches the full shell (all 74 reels included) for full offline use, network-first navigations so updates always land, runtime caching of the GSAP/Lottie CDN
- **Deploy process simplified** — `?v=` cache-busting queries removed; `VERSION` in `sw.js` is the single release lever

### Tooling & docs
- `js/motion.js` — self-contained motion layer (`transition`, `attachBg`, `hookFX`) with graceful fallbacks
- `gen_assets.py` — regenerates favicon/share-card artwork
- `REEL_AUTHORING.md` §5 — deploy checklist for GitHub Pages + service worker releases

---

## v1.0.0 — Initial release

- 74-reel curriculum: Python for the .NET dev (r1–19), GenAI (r20–48), Agentic AI + MCP (r49–74)
- TikTok-style swipe feed with narration-driven scene timing, karaoke captions, recap + quiz per reel
- 11 scene renderers (bigtext, bridge, list, compare, tokens, vector, embednums, loop, chat, diagram, arch, diffapprove)
- Code sheet + full notes per reel, streaks, likes, progress — all local, zero build step
