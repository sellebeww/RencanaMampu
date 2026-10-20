// Bandingkan geometri + style terhitung semua elemen: baseline (8766) vs saat ini (8765).
const { chromium } = require('playwright-core');
const BASEPORT = process.env.BASEPORT || 8766;
(async () => {
  const b = await chromium.launch({ channel: 'chrome' });
  const routes = ['#/pasien', '#/dasbor', '#/pengaturan', '#/keluarga/x', '#/tidak-ada'];
  for (let i = 1; i <= 10; i++) for (const s of ['', '/kapasitas', '/tugas', '/pemetaan', '/ringkasan', '/tindak-lanjut']) routes.push('#/pasien/P' + String(i).padStart(2, '0') + s);
  let diffs = 0;
  for (const w of [360, 768, 1280, 1920]) for (const r of routes) {
    const snaps = [];
    for (const port of [BASEPORT, 8765]) {
      const p = await b.newPage({ viewport: { width: w, height: 900 } });
      await p.route(/fonts\.(googleapis|gstatic)\.com/, x => x.abort());
      await p.goto('http://127.0.0.1:' + port + '/index.html'); await p.evaluate(() => localStorage.clear());
      await p.goto('http://127.0.0.1:' + port + '/index.html' + r); await p.reload({ waitUntil: 'load' }); await p.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' }); await p.evaluate(() => document.getAnimations().forEach(a => a.finish())); await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(120);
      snaps.push(await p.evaluate(() => [...document.body.querySelectorAll('*')].filter(e => !e.closest('script')).map(e => {
        const b = e.getBoundingClientRect(); const c = getComputedStyle(e);
        return e.tagName + '|' + [b.x, b.y + scrollY, b.width, b.height].map(Math.round).join(',') + '|' + c.color + c.backgroundColor + c.fontSize + c.fontWeight + c.display + c.borderColor + c.boxShadow;
      })));
      await p.close();
    }
    const [a, c] = snaps;
    const n = a.length !== c.length ? 'jumlah elemen ' + a.length + ' vs ' + c.length : a.filter((x, i) => x !== c[i]).length;
    if (n) { diffs++; console.log(w, r, n, (a.find((x, i) => x !== c[i]) || '') + '  =>  ' + (c.find((x, i) => x !== a[i]) || '')); }
  }
  console.log('route x lebar diperiksa:', routes.length * 4, '; berbeda:', diffs);
  await b.close();
})();
