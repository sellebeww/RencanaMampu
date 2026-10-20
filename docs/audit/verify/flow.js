// Uji alur interaktif inti lewat klik/submit nyata. node flow.js <base>
const { chromium } = require('playwright-core');
const BASE = process.argv[2] || 'http://127.0.0.1:8765/';
(async () => {
  const b = await chromium.launch({ channel: 'chrome' });
  const ctx = await b.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await ctx.newPage(); const errs = []; const res = {};
  page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const toast = () => page.evaluate(() => { const t = document.getElementById('toast'); return t.hidden ? '' : t.textContent; });
  const nav = async h => { await page.evaluate(h => { location.hash = h; }, h); await page.waitForTimeout(80); };
  await page.goto(BASE + 'index.html'); await page.evaluate(() => localStorage.clear()); await page.reload();
  // 1. Tambah tugas dari templat lalu simpan
  await nav('#/pasien/P01/tugas');
  const before = await page.evaluate(() => RM.store.tasks('P01').length);
  await page.click('[data-action="apply-template"][data-template="tpl-td"]');
  await page.waitForTimeout(80);
  res.tambahTugas = (await page.evaluate(() => RM.store.tasks('P01').length)) === before + 1;
  // 2. Hapus tugas terakhir
  page.once('dialog', d => d.accept());
  const lastId = await page.evaluate(() => RM.store.tasks('P01').slice(-1)[0].id);
  await page.click('[data-action="task-delete"][data-task="' + lastId + '"]');
  await page.waitForTimeout(80);
  res.hapusTugas = (await page.evaluate(() => RM.store.tasks('P01').length)) === before;
  // 3. Keputusan klinisi
  await page.selectOption('#role-select', 'klinisi');
  await nav('#/pasien/P01/pemetaan');
  const decBefore = await page.evaluate(() => RM.store.state.decisions.length);
  const form = await page.$('form[data-form="keputusan"]');
  if (form) {
    await page.evaluate(() => { const f = document.querySelector('form[data-form="keputusan"]'); const r = f.querySelector('input[name="status"][value="risiko"]') || document.querySelector('input[name="status"][value="risiko"][form="' + f.id + '"]'); if (r) r.checked = true; const c = f.querySelector('textarea') || document.querySelector('textarea[form="' + f.id + '"]'); if (c) c.value = 'Uji otomatis'; });
    await page.evaluate(() => document.querySelector('form[data-form="keputusan"]').requestSubmit());
    await page.waitForTimeout(80);
  }
  res.keputusan = (await page.evaluate(() => RM.store.state.decisions.length)) > decBefore || (await toast());
  // 4. Tautan keluarga
  await nav('#/pasien/P01');
  const btn = await page.$('[data-action="copy-family-link"]');
  if (btn) { await btn.click(); await page.waitForTimeout(150); }
  const links = await page.evaluate(() => Object.keys(RM.store.state.familyLinks));
  res.tautanKeluarga = links.length === 1 && /^klg-rm014-[0-9a-z]{2,}[0-9a-z]+$/.test(links[0]) ? links[0].replace(/-[0-9a-z]+$/, '-…') : links;
  if (links[0]) { await nav('#/keluarga/' + links[0]); res.bukaTautan = await page.evaluate(() => !!document.querySelector('.family-sheet')); }
  res.auditTokenTersamar = await page.evaluate(() => RM.store.state.audit.filter(a => a.aksi === 'Membuka ringkasan keluarga').map(a => a.target)[0]);
  // 5. Tindak lanjut
  await nav('#/pasien/P01/tindak-lanjut');
  const fuBefore = await page.evaluate(() => RM.store.state.followUps.length);
  const fuf = await page.$('form[data-form="tindaklanjut"]');
  if (fuf) { await page.evaluate(() => document.querySelector('form[data-form="tindaklanjut"]').requestSubmit()); await page.waitForTimeout(80); }
  res.tindakLanjut = (await page.evaluate(() => RM.store.state.followUps.length)) >= fuBefore && (await toast());
  // 6. Pengaturan admin
  await page.selectOption('#role-select', 'admin');
  await nav('#/pengaturan');
  await page.evaluate(() => document.querySelector('form[data-form="pengaturan"]').requestSubmit()); await page.waitForTimeout(80);
  res.pengaturan = await toast();
  // 7. Formulir kapasitas P10 (tanpa profil): telusuri langkah
  await page.selectOption('#role-select', 'perencana');
  await nav('#/pasien/P10/kapasitas');
  let steps = 0;
  for (let i = 0; i < 6; i++) { const n = await page.$('[data-action="form-next"]'); if (!n) break; await n.click(); await page.waitForTimeout(60); steps++; }
  res.formLangkah = steps + ' klik lanjut; error ditampilkan=' + await page.evaluate(() => document.querySelectorAll('.field-error, .error-summary, [aria-invalid="true"]').length);
  res.errors = errs;
  console.log(JSON.stringify(res, null, 1));
  await b.close();
})();
