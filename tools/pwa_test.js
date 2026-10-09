// Headless check: SW + manifest + installability + offline reload + phone screenshots.
// NODE_PATH=/tmp/p3test/node_modules node tools/pwa_test.js http://localhost:8310/
const puppeteer = require('puppeteer-core');
const BASE = process.argv[2] || 'http://localhost:8310/';
const OUT = process.argv[3] || '.';
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function ready(p) {
  await p.waitForFunction(() => !document.getElementById('loading'), { timeout: 90000 }).catch(() => console.log('loading timeout'));
  await sleep(1500);
  await p.evaluate(() => new Promise(r => { const m = NWCC_APP.map; if (m.loaded() && m.areTilesLoaded()) r(); else { m.once('idle', r); setTimeout(r, 15000); } }));
  await sleep(800);
}
(async () => {
  const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new',
    args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--hide-scrollbars'] });
  const p = await b.newPage();
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text()); });
  const failed = []; p.on('requestfailed', r => failed.push(r.url()));
  await p.emulate({ viewport: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36' });
  await p.goto(BASE, { waitUntil: 'load' });
  await ready(p);
  const sw = await p.evaluate(async () => { const r = await navigator.serviceWorker.ready; return { scope: r.scope, state: r.active && r.active.state }; });
  console.log('SW', JSON.stringify(sw));
  await p.reload({ waitUntil: 'load' }); await ready(p);  // now controlled
  const cdp = await p.target().createCDPSession();
  const man = await cdp.send('Page.getAppManifest');
  console.log('manifest errors', JSON.stringify(man.errors), 'parsed', !!(man.parsed || man.data));
  try { console.log('installability errors', JSON.stringify((await cdp.send('Page.getInstallabilityErrors')).installabilityErrors)); } catch (e) { console.log('installability n/a', e.message); }
  const cached = await p.evaluate(async () => { const out = {}; for (const k of await caches.keys()) out[k] = (await (await caches.open(k)).keys()).length; return out; });
  console.log('caches', JSON.stringify(cached), 'controlled', await p.evaluate(() => !!navigator.serviceWorker.controller));
  await p.screenshot({ path: OUT + '/shot_phone_home.png' });
  // select a landmark (card on phone)
  await p.evaluate(() => NWCC_APP.select('20', false)); await sleep(1500); await ready(p);
  await p.screenshot({ path: OUT + '/shot_phone_card.png' });
  // offline reload with deep link
  await p.setOfflineMode(true);
  failed.length = 0;
  await p.goto(BASE + '?q=library#b=40', { waitUntil: 'load' });
  await ready(p);
  const st = await p.evaluate(() => ({ title: document.title, three: !document.getElementById('loading'), card: document.getElementById('card').classList.contains('show'),
    cardTitle: (document.querySelector('#card h2') || {}).textContent, results: document.querySelectorAll('#results li').length, online: navigator.onLine,
    labels: !!NWCC_APP.map.getLayer('building-labels') }));
  console.log('OFFLINE', JSON.stringify(st), 'failed requests:', failed.length, failed.slice(0, 5));
  await p.screenshot({ path: OUT + '/shot_phone_offline.png' });
  await p.setOfflineMode(false);
  // self test (raycast picking of landmarks)
  await p.goto(BASE + '?selftest=1', { waitUntil: 'load' }); await ready(p); await sleep(4000);
  console.log('selftest', (await p.$eval('#selftest', e => e.textContent)).slice(0, 600));
  console.log('page errors/warnings:', errs.filter(e => !/WebGL|GPU stall|swiftshader/i.test(e)).slice(0, 10));
  await b.close();
})();
