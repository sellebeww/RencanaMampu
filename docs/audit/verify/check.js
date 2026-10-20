// Verifikasi RencanaMampu: unit test, render semua route, konsol, overflow, a11y dasar, XSS.
// Pakai: node check.js <baseURL> <out.json>
const { chromium } = require('playwright-core');
const fs = require('fs');
const BASE = process.argv[2] || 'http://127.0.0.1:8765/';
const OUT = process.argv[3] || 'result.json';
const PAYLOAD = '"\'><img src=x onerror="window.__xss=(window.__xss||0)+1">';
const FREE_TEXT = new Set(['nama', 'catatan', 'kendala', 'keterbatasan', 'layanan', 'diagnosis', 'ruang',
  'kode', 'oleh', 'label', 'catatanKlinisi', 'deskripsi', 'instruksi', 'aksi', 'target', 'aktor', 'cakupan', 'rawatUlangAlasan', 'alasan']);

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const report = { tests: null, routes: [], xss: null, issues: [] };
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text()); });
  page.on('requestfailed', (r) => errs.push('requestfailed: ' + r.url() + ' ' + (r.failure() || {}).errorText));
  page.on('response', (r) => { if (r.status() >= 400) errs.push('http ' + r.status() + ': ' + r.url()); });

  await page.goto(BASE + 'tests.html');
  report.tests = await page.evaluate(() => ({ total: RM.tests.total, passed: RM.tests.passed, failed: RM.tests.failed,
    failures: RM.tests.results.filter((r) => !r.ok).map((r) => r.name + ': ' + r.error) }));

  await page.goto(BASE + 'index.html');
  await page.evaluate(() => { localStorage.clear(); });
  await page.reload();
  const ids = await page.evaluate(() => RM.store.state.pasien.map((p) => p.id));
  const token = await page.evaluate(() => RM.store.createFamilyLink('P01').token);
  const routes = ['#/pasien', '#/dasbor', '#/pengaturan', '#/keluarga/' + token, '#/keluarga/tidak-ada', '#/tidak-ada', '#/pasien/P99'];
  ids.forEach((id) => ['', '/kapasitas', '/tugas', '/pemetaan', '/ringkasan', '/tindak-lanjut'].forEach((s) => routes.push('#/pasien/' + id + s)));

  const audit = () => {
    const doc = document.documentElement;
    const out = { overflowX: doc.scrollWidth > window.innerWidth + 1, h1: document.querySelectorAll('h1').length, problems: [] };
    document.querySelectorAll('img:not([alt])').forEach(() => out.problems.push('img tanpa alt'));
    document.querySelectorAll('button, a[href], [role=button]').forEach((b) => {
      const name = (b.getAttribute('aria-label') || b.textContent || b.getAttribute('title') || '').trim();
      if (!name && b.offsetParent !== null) out.problems.push('kontrol tanpa nama: ' + b.outerHTML.slice(0, 80));
    });
    document.querySelectorAll('input, select, textarea').forEach((i) => {
      if (i.type === 'hidden' || i.offsetParent === null) return;
      const labelled = i.labels && i.labels.length || i.getAttribute('aria-label') || i.getAttribute('aria-labelledby') || i.title;
      if (!labelled) out.problems.push('input tanpa label: ' + i.outerHTML.slice(0, 90));
    });
    const seen = {};
    document.querySelectorAll('[id]').forEach((n) => { if (seen[n.id]) out.problems.push('id ganda: ' + n.id); seen[n.id] = 1; });
    document.querySelectorAll('a[href="#"]').forEach(() => out.problems.push('href="#"'));
    out.textSample = document.getElementById('app').innerText.slice(0, 60).replace(/\s+/g, ' ');
    return out;
  };

  for (const width of [360, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    for (const r of routes) {
      errs.length = 0;
      await page.goto(BASE + 'index.html' + r);
      await page.waitForTimeout(60);
      const a = await page.evaluate(audit);
      report.routes.push(Object.assign({ route: r, width, errors: errs.slice() }, a));
    }
  }

  // XSS: suntik payload ke semua field teks bebas lalu render semua route.
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(BASE + 'index.html#/pasien');
  await page.evaluate(({ PAYLOAD, FREE }) => {
    const free = new Set(FREE);
    const walk = (o) => {
      if (Array.isArray(o)) return o.forEach(walk);
      if (o && typeof o === 'object') Object.keys(o).forEach((k) => {
        if (typeof o[k] === 'string' && free.has(k)) o[k] = o[k] + PAYLOAD;
        else walk(o[k]);
      });
    };
    const s = RM.store.state;
    walk(s);
    s.tasks.P01 = (s.tasks.P01 || []).concat([{ id: 'T-x' + PAYLOAD, nama: 'X' + PAYLOAD, kategori: 'obat', perHari: 1, menit: 5, hari: [0], slot: 'pagi' }]);
    s.followUps.push({ id: 'FU-x', pasienId: 'P01', hari: 7, tanggal: '2026-10-01', kendala: PAYLOAD, tugasDijalankan: [], tugasTotal: 1, beban: 3 });
    RM.store.save();
  }, { PAYLOAD, FREE: [...FREE_TEXT] });
  const xssHits = [];
  for (const r of routes.concat(['#/keluarga/' + encodeURIComponent(PAYLOAD)])) {
    await page.goto(BASE + 'index.html' + r);
    await page.waitForTimeout(40);
    const hit = await page.evaluate(() => ({ fired: window.__xss || 0, imgs: document.querySelectorAll('#app img[onerror], #app img[src="x"]').length }));
    if (hit.fired || hit.imgs) xssHits.push({ route: r, ...hit });
  }
  report.xss = { routesChecked: routes.length + 1, hits: xssHits };
  await browser.close();
  fs.writeFileSync(OUT, JSON.stringify(report, null, 2));
  const routeErr = report.routes.filter((r) => r.errors.length);
  const overflow = report.routes.filter((r) => r.overflowX).map((r) => r.width + ' ' + r.route);
  const probs = {};
  report.routes.forEach((r) => r.problems.forEach((p) => { probs[p] = (probs[p] || 0) + 1; }));
  const h1 = report.routes.filter((r) => r.h1 !== 1).map((r) => r.route + ' h1=' + r.h1);
  console.log(JSON.stringify({ tests: report.tests, routes: report.routes.length,
    routesWithErrors: routeErr.map((r) => ({ route: r.width + ' ' + r.route, errors: r.errors })).slice(0, 15),
    overflow, h1NotOne: [...new Set(h1)], a11yProblems: probs, xss: report.xss }, null, 2));
})().catch((e) => { console.error(e); process.exit(1); });
