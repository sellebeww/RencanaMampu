// axe-core + cek konsol/overflow untuk profil.html pada beberapa lebar, dengan dan tanpa reduced motion.
const { chromium } = require('playwright-core'); const fs = require('fs');
const axeSrc = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
(async () => {
  const b = await chromium.launch({ channel: 'chrome' }); let bad = 0;
  for (const w of [320, 390, 768, 1024, 1366]) for (const rm of ['no-preference', 'reduce']) {
    const p = await b.newPage({ viewport: { width: w, height: 900 }, bypassCSP: true, reducedMotion: rm });
    const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
    await p.goto('http://127.0.0.1:8765/profil.html');
    await p.evaluate(() => document.querySelectorAll('[data-reveal]').forEach(e => e.classList.add('is-in')));
    await p.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
    // menu ponsel bisa dibuka/ditutup
    if (w < 960) { await p.click('#pf-menu'); const open = await p.$eval('#pf-nav', n => getComputedStyle(n).visibility); await p.keyboard.press('Escape'); const closed = await p.$eval('#pf-menu', m => m.getAttribute('aria-expanded')); if (open !== 'visible' || closed !== 'false') { bad++; console.log(w, 'menu gagal', open, closed); } }
    await p.addScriptTag({ content: axeSrc });
    const res = await p.evaluate(() => axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'] }));
    const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    const h1 = await p.$$eval('h1', a => a.length);
    res.violations.forEach(v => { bad++; console.log(w, rm, v.id, v.nodes.length, v.nodes.slice(0, 2).map(n => n.target.join(' ') + ' ' + (n.failureSummary || '').split('\n')[1]).join(' | ')); });
    if (ov > 0 || errs.length || h1 !== 1) { bad++; console.log(w, rm, 'overflow', ov, 'h1', h1, errs); }
    await p.close();
  }
  console.log(bad ? 'profil: ' + bad + ' masalah' : 'profil: 0 pelanggaran, 0 overflow, 0 error');
  await b.close();
})();
