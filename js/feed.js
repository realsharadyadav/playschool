/* SwipeScript AI — feed builder: reels, teasers, scroll-snap, gestures, nav */
(function () {
  const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const PHASE = { python: 'Coming soon', genai: 'Coming soon', agentic: 'Coming soon' };

  function segsRow(order, currentId) {
    const segs = h('div', 'segs');
    order.forEach(item => {
      const seg = h('div', 'seg');
      if (item.id === currentId) seg.classList.add('cur');
      if (SS.state.isCompleted(item.id)) seg.classList.add('done');
      seg.appendChild(h('b'));
      segs.appendChild(seg);
    });
    return segs;
  }

  function buildReel(item, data, meta, order) {
    const el = h('section', 'reel');
    el.dataset.section = data.section;
    const segRow = segsRow(order, item.id);
    const curSeg = [...segRow.children].find(s => s.classList.contains('cur'));
    el.appendChild(h('div', 'reel-bg'));
    el.appendChild(h('div', 'reel-inner',
      `<div class="segs">${segRow.innerHTML}</div>` +
      `<div class="stage"></div>` +
      `<div class="capzone">` +
      `<span class="cap-chip cap-progress">${meta.icon} ${meta.label} · ${data.block} · Reel ${data.num}/${meta.reels.length} · ✅ ${SS.state.completedCount(meta.reels.map(r => r.id))}/${meta.reels.length}</span>` +
      `<div class="cap-title">${data.title}</div>` +
      `<div class="cap-text"></div>` +
      `<div class="cap-hint"><span class="arr">↑</span> swipe next · tap ⏯ · 2× tap ❤ · ← swipe code</div>` +
      `</div>` +
      `<div class="rail">` +
      `<button class="rail-btn rail-like"><span class="ic">❤️</span><span class="lb">0</span></button>` +
      `<button class="rail-btn rail-code"><span class="ic">&lt;/&gt;</span><span class="lb">code</span></button>` +
      `<button class="rail-btn rail-notes"><span class="ic">📄</span><span class="lb">notes</span></button>` +
      `<button class="rail-btn rail-mute"><span class="ic">🔊</span><span class="lb">sound</span></button>` +
      `</div>`));
    const player = new SS.ReelPlayer(el, data, { segEl: [...el.querySelectorAll('.seg')].find(s => s.classList.contains('cur')) });
    // rail buttons must not reach the reel's tap layer
    const rail = el.querySelector('.rail');
    rail.addEventListener('pointerdown', e => e.stopPropagation());
    rail.addEventListener('click', e => e.stopPropagation());
    rail.querySelector('.rail-like').addEventListener('click', e => { const r = e.target.closest('.rail-btn').getBoundingClientRect(); player.like(r.left + r.width / 2, r.top + r.height / 2); });
    rail.querySelector('.rail-code').addEventListener('click', () => SS.ui.openCode(data));
    rail.querySelector('.rail-notes').addEventListener('click', () => SS.ui.openNotes(data));
    rail.querySelector('.rail-mute').addEventListener('click', () => {
      SS.narrator.setMuted(!SS.narrator.muted);
      document.dispatchEvent(new CustomEvent('ss:mute'));
      SS.ui.toast(SS.narrator.muted ? '🔇 Narration muted' : '🔊 Narration on');
    });
    player.hookEl.addEventListener('pointerdown', e => e.stopPropagation());
    attachGestures(el, player);
    return { el, player, id: data.id, data, meta };
  }

  function buildTeaser(item, meta, order, isFirst, liveCount) {
    const el = h('section', 'teaser');
    el.dataset.section = Object.keys(SS.curriculum).find(k => SS.curriculum[k] === meta) || 'genai';
    const idx = meta.reels.indexOf(item);
    const next3 = meta.reels.slice(idx + 1, idx + 4).map(r => `<div>Reel ${r.num} · ${r.title}</div>`).join('');
    el.appendChild(h('div', 'reel-bg'));
    el.appendChild(h('div', 'teaser-card',
      `<span class="soon">🔒 ${PHASE[el.dataset.section] || 'Coming soon'}</span>` +
      `<h3>Reel ${item.num} · ${item.title}</h3>` +
      (isFirst ? `<p>${meta.tagline}</p>` +
        `<div class="mini-list">${next3 || '<div>You’ve seen everything live here 🎉</div>'}</div>` : '') +
      `<div class="count">${liveCount} / ${meta.reels.length} reels live in ${meta.label}</div>`));
    return { el, teaser: true };
  }

  function buildWelcome(meta, liveCount) {
    const el = h('section', 'teaser welcome');
    el.dataset.section = 'genai';
    el.appendChild(h('div', 'reel-bg'));
    el.appendChild(h('div', 'teaser-card',
      `<span class="soon">👋 Welcome</span>` +
      `<h3>PlaySchool</h3>` +
      `<p>Complete GenAI &amp; Agentic AI — in 60-second reels you <b>watch</b>, not read.</p>` +
      `<div class="mini-list">` +
      `<div>🎬 Every reel: animation + voiceover</div>` +
      `<div>👆 Swipe up · tap to pause · 2× tap = ❤</div>` +
      `<div>📄 Full notes &amp; 🐍 code in every reel</div>` +
      `<div>⚡ Recap + quiz so it actually sticks</div>` +
      `</div>` +
      `<div class="count">${liveCount} reels live — the complete curriculum</div>`));
    return { el, teaser: true };
  }

  function attachGestures(el, player) {
    let down = null, lpTimer = null, lastTap = 0, swipeFired = false;
    el.addEventListener('pointerdown', e => {
      down = { x: e.clientX, y: e.clientY, t: performance.now(), long: false };
      swipeFired = false;
      lpTimer = setTimeout(() => { if (down) { down.long = true; player.pressStart(); } }, 500);
    });
    el.addEventListener('pointermove', e => {
      if (!down) return;
      const dx = e.clientX - down.x, dy = e.clientY - down.y;
      if ((Math.abs(dx) > 12 || Math.abs(dy) > 12) && lpTimer) { clearTimeout(lpTimer); lpTimer = null; }
      if (!swipeFired && dx < -70 && Math.abs(dx) > Math.abs(dy) * 1.6) { swipeFired = true; SS.ui.openCode(player.data); }
    });
    const up = e => {
      if (!down) return;
      if (lpTimer) { clearTimeout(lpTimer); lpTimer = null; }
      if (down.long) { player.pressEnd(); down = null; return; }
      const dt = performance.now() - down.t;
      const dist = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      down = null;
      if (swipeFired || dist >= 14 || dt >= 400) return;
      const now = performance.now();
      if (now - lastTap < 300) { lastTap = 0; player.like(e.clientX, e.clientY); }
      else {
        lastTap = now;
        setTimeout(() => { if (lastTap) { lastTap = 0; player.tap(); } }, 280);
      }
    };
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', () => { down = null; if (lpTimer) clearTimeout(lpTimer); player.pressEnd(); });
  }

  const built = {};   // section -> {feed, items}
  let activeSection = 'genai';

  function setActive(section) {
    activeSection = section;
    SS.state.setLastSection(section);
    Object.entries(built).forEach(([k, b]) => b.feed.classList.toggle('active', k === section));
    document.querySelectorAll('#tabbar .tab').forEach(t => t.classList.toggle('active', t.dataset.section === section));
    positionFeed(section);
  }

  /* resume each section at the last-viewed reel (saved), else first uncompleted */
  function positionFeed(key) {
    const b = built[key];
    if (!b || b._pos) return;
    b._pos = true;
    const saved = SS.state.getLastReel(key);
    let idx = saved ? b.items.findIndex(it => it.id === saved) : -1;
    if (idx < 0) idx = b.items.findIndex(it => it.player && !SS.state.isCompleted(it.id));
    if (idx > 0) b.feed.scrollTop = idx * b.feed.clientHeight;
  }

  function refreshProgress() {
    Object.entries(built).forEach(([k, b]) => {
      const total = SS.curriculum[k].reels.length;
      const done = SS.curriculum[k].reels.filter(r => SS.state.isCompleted(r.id)).length;
      const tab = document.querySelector(`#tabbar .tab[data-section="${k}"] .tp b`);
      if (tab) tab.style.width = (done / total * 100) + '%';
      b.items.forEach(it => {
        if (it.player) {
          const doneNow = SS.state.isCompleted(it.id);
          const seg = it.el.querySelector('.seg.cur');
          if (seg) seg.classList.toggle('done', doneNow);
          if (it.data && it.meta) {
            const chip = it.el.querySelector('.cap-progress');
            if (chip) chip.textContent =
              `${it.meta.icon} ${it.meta.label} · ${it.data.block} · ` +
              `Reel ${it.data.num}/${it.meta.reels.length} · ✅ ${done}/${total}`;
          }
        }
      });
    });
  }

  SS.feed = {
    init() {
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
      const feedsEl = document.getElementById('feeds');
      Object.entries(SS.curriculum).forEach(([key, meta]) => {
        const live = meta.reels.filter(r => SS.reels[r.id]);
        const rest = meta.reels.filter(r => !SS.reels[r.id]);
        const order = [...live, ...rest];
        const feed = h('div', 'feed'); feed.dataset.section = key;
        const items = [];
        if (key === 'genai') items.push(buildWelcome(meta, live.length));
        order.forEach(item => {
          if (SS.reels[item.id]) items.push(buildReel(item, SS.reels[item.id], meta, order));
          else items.push(buildTeaser(item, meta, order, rest.indexOf(item) === 0, live.length));
        });
        items.forEach(it => feed.appendChild(it.el));
        feedsEl.appendChild(feed);
        built[key] = { feed, items };

        // activate the reel most in view
        const io = new IntersectionObserver(entries => {
          entries.forEach(en => {
            if (en.isIntersecting && en.intersectionRatio >= 0.6) {
              const prev = feed._active, next = en.target;
              if (prev === next) return;
              feed._active = next;
              const activeItem = items.find(it => it.el === next);
              if (activeItem && activeItem.id) SS.state.setLastReel(key, activeItem.id);
              items.forEach(it => {
                if (it.el === prev && it.player) it.player.stop();
                if (it.el === next && it.player) it.player.start();
              });
            }
          });
        }, { threshold: [0.6] });
        items.forEach(it => io.observe(it.el));
      });

      document.querySelectorAll('#tabbar .tab').forEach(tab =>
        tab.addEventListener('click', () => setActive(tab.dataset.section)));

      document.addEventListener('keydown', e => {
        const feed = built[activeSection].feed;
        if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); feed.scrollBy({ top: feed.clientHeight }); }
        else if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); feed.scrollBy({ top: -feed.clientHeight }); }
        else if (e.key === ' ') { e.preventDefault(); this.activePlayer() && this.activePlayer().tap(); }
        else if (e.key === 'm') { SS.narrator.setMuted(!SS.narrator.muted); document.dispatchEvent(new CustomEvent('ss:mute')); }
      });

      document.addEventListener('ss:mute', () => Object.values(built).forEach(b =>
        b.items.forEach(it => it.player && it.player._syncRail())));
      document.addEventListener('ss:complete', () => refreshProgress());

      setActive(SS.state.getLastSection());
      refreshProgress();
    },
    activePlayer() {
      const b = built[activeSection];
      if (!b || !b.feed._active) return null;
      const found = b.items.find(it => it.el === b.feed._active);
      return found && found.player ? found.player : null;
    },
    kickActive() { const p = this.activePlayer(); if (p) p.kick(); },
    setActive, refreshProgress
  };
})();
