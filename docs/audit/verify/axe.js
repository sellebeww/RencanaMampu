// axe-core WCAG 2.x A/AA pada semua route. node axe.js [port]
const { chromium } = require('playwright-core'); const fs = require('fs');
const axeSrc = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const PORT = process.argv[2] || 8765;
(async () => {
  const b = await chromium.launch({ channel: 'chrome' });
  const routes = ['#/pasien', '#/dasbor', '#/pengaturan', '#/tidak-ada', 'tests.html'];
  for (const id of ['P01', 'P02', 'P10']) for (const s of ['', '/kapasitas', '/tugas', '/pemetaan', '/ringkasan', '/tindak-lanjut']) routes.push('#/pasien/' + id + s);
  const agg = {};
  for (const w of [390, 1280]) for (const role of ['perencana', 'klinisi']) for (const r of routes) {
    const p = await b.newPage({ viewport: { width: w, height: 900 }, bypassCSP: true });
    await p.goto('http://127.0.0.1:' + PORT + '/index.html#/pasien'); await p.evaluate((role) => { localStorage.clear(); }, role);
    await p.reload(); await p.evaluate((role) => RM.store.setRole(role), role);
    await p.goto('http://127.0.0.1:' + PORT + '/' + (r.startsWith('#') ? 'index.html' + r : r)); await p.reload({ waitUntil: 'load' });
    await p.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
    await p.addScriptTag({ content: axeSrc });
    const res = await p.evaluate(() => axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'] }));
    res.violations.forEach(v => { const k = v.impact + ' ' + v.id; agg[k] = agg[k] || { help: v.help, n: 0, routes: new Set(), ex: [] };
      agg[k].n += v.nodes.length; agg[k].routes.add(w + ' ' + role + ' ' + r); v.nodes.slice(0, 2).forEach(n => { if (agg[k].ex.length < 4) agg[k].ex.push(n.target.join(' ') + ' :: ' + (n.failureSummary || '').split('\n').slice(1, 2).join('').slice(0, 140)); }); });
    await p.close();
  }
  for (const [k, v] of Object.entries(agg)) console.log(k, '|', v.help, '| nodes', v.n, '| routes', [...v.routes].join(', '), '\n   ' + v.ex.join('\n   '));
  if (!Object.keys(agg).length) console.log('axe: 0 pelanggaran');
  await b.close();
})();
