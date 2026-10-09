// Manifest screenshots + preview frames. NODE_PATH=/tmp/p3test/node_modules node tools/shots.js http://localhost:8310/
const puppeteer = require('puppeteer-core');
const BASE = process.argv[2] || 'http://localhost:8310/';
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function ready(p) {
  await p.waitForFunction(() => !document.getElementById('loading'), { timeout: 90000 }).catch(() => console.log('loading timeout'));
  await sleep(1500);
  await p.evaluate(() => new Promise(r => { const m = NWCC_APP.map; if (m.loaded() && m.areTilesLoaded()) r(); else { m.once('idle', r); setTimeout(r, 20000); } }));
  await sleep(1000);
}
const PHONE = { viewport: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36' };
const jobs = [
  ['screenshots/phone.png', '', PHONE, null],
  ['/tmp/pv_card.png', '#b=54', PHONE, null],
  ['/tmp/pv_sat.png', '?sat=1&hud=1', PHONE, null],
  ['screenshots/wide.png', '#b=20', { viewport: { width: 1600, height: 1000, deviceScaleFactor: 1 } }, null],
];
(async () => {
  const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new',
    args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--hide-scrollbars'] });
  for (const [out, q, dev] of jobs) {
    const p = await b.newPage(); p.on('pageerror', e => console.log('ERR', String(e)));
    if (dev.userAgent) await p.emulate(dev); else await p.setViewport(dev.viewport);
    await p.goto(BASE + q, { waitUntil: 'load' }); await ready(p);
    await p.addStyleTag({ content: '#installBtn,#toast{display:none!important}' });
    await sleep(300); await p.screenshot({ path: out }); console.log('saved', out); await p.close();
  }
  await b.close();
})();
