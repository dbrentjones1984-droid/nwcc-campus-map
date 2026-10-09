/* NWCC Campus Map · PWA glue: service worker registration, install prompt, offline status, phone HUD collapse. */
(function () {
'use strict';
const $ = (id) => document.getElementById(id);
const toastEl = $('toast');
let toastTimer = 0;
function toast(msg, action, ms) {
  toastEl.innerHTML = '';
  toastEl.appendChild(document.createTextNode(msg));
  if (action) { const b = document.createElement('button'); b.textContent = action.label; b.onclick = () => { hideToast(); action.run(); }; toastEl.appendChild(b); }
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  if (ms !== 0) toastTimer = setTimeout(hideToast, ms || 4000);
}
function hideToast() { toastEl.classList.remove('show'); }
window.NWCC_PWA = { toast };

const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

// ---------- service worker ----------
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js', { scope: './' }).then(reg => {
      // A new version finished installing while an old one controls the page: offer a reload.
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing; if (!nw) return;
        nw.addEventListener('statechange', () => {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) {
            toast('A new version of the map is ready.', { label: 'Reload', run: () => nw.postMessage('skipWaiting') }, 0);
          } else if (nw.state === 'installed') {
            toast('Ready to work offline (satellite imagery still needs internet).', null, 3500);
          }
        });
      });
    }).catch(err => console.warn('Service worker registration failed', err));
    let reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (reloading) return; reloading = true; location.reload(); });
  });
} else if (location.protocol === 'http:' && !standalone) {
  console.info('Service worker needs https:// or localhost; the map still works but is not installable here.');
}

// ---------- install button ----------
const installBtn = $('installBtn');
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault(); deferredPrompt = e;
  if (!standalone) installBtn.classList.add('show');
});
installBtn.addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    try { await deferredPrompt.userChoice; } catch (_) { /* ignore */ }
    deferredPrompt = null; installBtn.classList.remove('show');
  } else if (isIOS) {
    toast('In Safari: tap Share (□↑), then “Add to Home Screen”.', null, 7000);
  }
});
window.addEventListener('appinstalled', () => { installBtn.classList.remove('show'); toast('NWCC Map installed. Open it from your home screen.'); });
// iOS has no install prompt event: show a one-time hint in Safari.
if (isIOS && !standalone) {
  installBtn.textContent = '⬇ Add NWCC Map to Home Screen';
  installBtn.classList.add('show');
}

// ---------- online / offline ----------
const dot = $('netdot');
function net() {
  const on = navigator.onLine;
  dot.classList.toggle('off', !on); dot.title = on ? 'Online' : 'Offline: campus map works, satellite imagery unavailable';
}
window.addEventListener('online', () => { net(); toast('Back online.', null, 2000); });
window.addEventListener('offline', () => { net(); toast('Offline: the campus map still works. Satellite imagery needs internet.', null, 4500); });
net();
const sat = $('tSat');
if (sat) sat.addEventListener('click', () => { if (!navigator.onLine && sat.classList.contains('on')) toast('Satellite imagery needs internet. Tap 🛰️ again for the offline street map.', null, 4500); });

// ---------- phone: collapsible HUD ----------
const hud = document.querySelector('.hud'), tgl = $('hudToggle');
function setCollapsed(c) { hud.classList.toggle('collapsed', c); tgl.setAttribute('aria-expanded', String(!c)); }
tgl.addEventListener('click', () => setCollapsed(!hud.classList.contains('collapsed')));
const P = new URLSearchParams(location.search);
if (window.innerWidth < 720 && P.get('hud') !== '1') setCollapsed(true);
// Picking a landmark or chip on a phone collapses the HUD again so the map and card have room.
document.getElementById('lm').addEventListener('click', e => { if (e.target.tagName === 'BUTTON' && window.innerWidth < 720) setCollapsed(true); });
// Dismiss the on-screen keyboard after choosing a search result.
document.getElementById('results').addEventListener('click', () => { const q = $('q'); if (window.innerWidth < 720) q.blur(); });
})();
