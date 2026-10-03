/* PlaySchool service worker — precaches the app shell, serves cache-first
   with network fallback (and runtime-caches the GSAP/Lottie CDN files).     */
const VERSION = 'ps-shell-v1';

const SHELL = [
  './', 'index.html',
  'css/app.css',
  'js/state.js', 'js/narrator.js', 'js/scenes.js', 'js/data.js',
  'js/motion.js', 'js/player.js', 'js/feed.js', 'js/main.js',
  'assets/favicon.svg', 'assets/favicon-32.png', 'assets/apple-touch-icon.png',
  'assets/icon-192.png', 'assets/icon-512.png', 'assets/icon-maskable-512.png',
  'assets/site.webmanifest', 'assets/og-card.png'
];
for (let i = 1; i <= 74; i++) SHELL.push(`data/reels/r${i}.js`);

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const isCdn = url.hostname === 'cdn.jsdelivr.net';
  if (url.origin !== self.location.origin && !isCdn) return;   // let everything else pass through

  // same-origin files are cached under their query-less path (the ?v=NN cache-busting
  // query must not fragment the cache); CDN files cache under their full URL
  const key = url.origin === self.location.origin ? url.origin + url.pathname : req.url;

  // navigations: network-first so updates land, cache is the offline fallback
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(res => {
        if (res.ok) { const cl = res.clone(); caches.open(VERSION).then(c => c.put('index.html', cl)); }
        return res;
      }).catch(() => caches.match('index.html'))
    );
    return;
  }

  // assets: cache-first, then network (and cache the result for next time)
  e.respondWith(
    caches.match(key).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const cl = res.clone(); caches.open(VERSION).then(c => c.put(key, cl)); }
      return res;
    }))
  );
});
