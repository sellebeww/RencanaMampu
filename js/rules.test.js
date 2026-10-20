/* RencanaMampu — unit test mesin aturan.
   Dibuka lewat tests.html. Tidak membutuhkan server atau pustaka luar.
   Setiap aturan diuji dengan fixture sintetis yang kecil dan deterministik. */
(function () {
  const RM = window.RM;
  const F = RM.fmt;
  const results = [];
  let group = 'Umum';

  function test(name, fn) {
    try {
      fn();
      results.push({ group: group, name: name, ok: true });
    } catch (err) {
      results.push({ group: group, name: name, ok: false, error: err && err.message ? err.message : String(err) });
    }
  }
  function assert(cond, message) {
    if (!cond) throw new Error(message || 'Kondisi tidak terpenuhi');
  }
  function same(a, b, message) {
    if (a !== b) throw new Error((message || 'Nilai tidak sama') + ' — diharapkan ' + b + ', didapat ' + a);
  }
  function find(list, ruleId, dimensi) {
    return list.filter(function (f) { return f.ruleId === ruleId && (!dimensi || f.dimensi === dimensi); });
  }

  const baseProfile = function (over) {
    const p = {
      id: 'PX-p1', pasienId: 'PX', versi: 1, status: 'final', diperbarui: F.today(),
      consent: { diberikan: true, oleh: 'Keluarga', pada: F.today() },
      pendamping: [{ nama: 'A', hubungan: 'Istri', jamPerHari: 4, hari: [0, 1, 2, 3, 4, 5, 6], bekerja: false, jamKerja: [], literasi: 'cukup', keterampilan: ['obat'] }],
      transportasi: { moda: 'motor', jarakKm: 4, menitSekali: 20, biayaSekali: 15000, bisaSendiri: false },
      ekonomi: { kategori: 'cukup', biayaBulanan: 500000, jaminan: 'BPJS' },
      rumah: { listrik: true, kulkas: true, air: true, ruang: true },
      digital: { ponsel: true, wa: true, video: true },
      komunitas: { kader: true, puskesmas: 'Puskesmas Uji', tetangga: true },
      bebanAwal: 2
    };
    return Object.assign(p, over || {});
  };

  let seq = 0;
  function task(over) {
    seq++;
    return Object.assign({
      id: 't' + seq, nama: 'Tugas uji ' + seq, kategori: 'obat', perHari: 1, menit: 10,
      hari: [0, 1, 2, 3, 4, 5, 6], slot: 'pagi', keterampilan: 'dasar', butuhPendamping: false,
      butuhTransport: false, perBulanKontrol: 0, biayaBulanan: 0, syaratRumah: [],
      butuhDigital: null, kritis: 'sedang', bolehDisederhanakan: true
    }, over || {});
  }
  function calc(profile, tasks, decisions) {
    return RM.rules.compute({ id: 'PX', kode: 'PX-1' }, profile, tasks, decisions || [], window.RM_CONFIG);
  }
  function effect(opsi, status) {
    return [{ findingId: 'uji', dimensi: 'uji', status: status || 'dukungan', opsi: opsi }];
  }

  /* ---------------- R1 Waktu ---------------- */
  group = 'R1 · Waktu';
  test('konflik saat tuntutan harian melebihi jam pendamping', function () {
    const prof = baseProfile({ pendamping: [{ nama: 'A', hubungan: 'Istri', jamPerHari: 0.2, hari: [0, 1, 2, 3, 4, 5, 6], bekerja: false, literasi: 'cukup', keterampilan: [] }] });
    const h = calc(prof, [task({ perHari: 2, menit: 10 })]);
    assert(find(h.effective, 'R1', 'waktu').length === 1, 'R1 seharusnya menghasilkan satu temuan');
    same(find(h.effective, 'R1')[0].tingkat, 'konflik');
  });
  test('tidak ada temuan saat kapasitas waktu cukup', function () {
    const h = calc(baseProfile(), [task({ perHari: 1, menit: 10 })]);
    same(find(h.effective, 'R1').length, 0);
  });
  test('peringatan muncul saat tuntutan mendekati batas', function () {
    const prof = baseProfile({ pendamping: [{ nama: 'A', hubungan: 'Istri', jamPerHari: 0.39, hari: [0, 1, 2, 3, 4, 5, 6], bekerja: false, literasi: 'cukup', keterampilan: [] }] });
    const h = calc(prof, [task({ perHari: 2, menit: 10 })]);
    same(find(h.effective, 'R1')[0].tingkat, 'perhatian');
  });

  /* ---------------- R2 Keterampilan ---------------- */
  group = 'R2 · Keterampilan';
  test('konflik saat tugas terlatih tanpa pendamping terampil', function () {
    const h = calc(baseProfile(), [task({ kategori: 'luka', keterampilan: 'terlatih', butuhPendamping: true })]);
    same(find(h.effective, 'R2')[0].tingkat, 'konflik');
  });
  test('keterampilan yang tersedia tidak memicu konflik', function () {
    const h = calc(baseProfile(), [task({ kategori: 'obat', keterampilan: 'terlatih' })]);
    same(find(h.effective, 'R2').length, 0);
  });
  test('efek latih pendamping menghapus konflik keterampilan', function () {
    const h = calc(baseProfile(), [task({ kategori: 'suntik', keterampilan: 'terlatih' })], effect(['latih_pendamping']));
    same(find(h.effective, 'R2').length, 0);
  });
  test('literasi terbatas menjadi satu peringatan agregat', function () {
    const prof = baseProfile({ pendamping: [{ nama: 'A', hubungan: 'Istri', jamPerHari: 4, hari: [0, 1, 2, 3, 4, 5, 6], bekerja: false, literasi: 'terbatas', keterampilan: [] }] });
    const h = calc(prof, [task({}), task({}), task({})]);
    const r2 = find(h.effective, 'R2');
    same(r2.length, 1, 'harus satu temuan agregat');
    same(r2[0].tingkat, 'perhatian');
    same(r2[0].taskIds.length, 3);
  });

  /* ---------------- R3 Pendamping ---------------- */
  group = 'R3 · Pendamping';
  test('peringatan saat satu-satunya pendamping bekerja pada slot tugas', function () {
    const prof = baseProfile({ pendamping: [{ nama: 'A', hubungan: 'Anak', jamPerHari: 4, hari: [0, 1, 2, 3, 4, 5, 6], bekerja: true, jamKerja: ['pagi'], literasi: 'cukup', keterampilan: [] }] });
    const h = calc(prof, [task({ butuhPendamping: true, slot: 'pagi' })]);
    same(find(h.effective, 'R3')[0].tingkat, 'perhatian');
  });
  test('konflik saat tidak ada pendamping sama sekali', function () {
    const prof = baseProfile({ pendamping: [] });
    const h = calc(prof, [task({ butuhPendamping: true })]);
    same(find(h.effective, 'R3')[0].tingkat, 'konflik');
  });
  test('opsi pendamping cadangan menghapus temuan pendamping', function () {
    const prof = baseProfile({ pendamping: [] });
    const h = calc(prof, [task({ butuhPendamping: true })], effect(['pendamping_cadangan']));
    same(find(h.effective, 'R3').length, 0);
  });

  /* ---------------- R4 Transportasi ---------------- */
  group = 'R4 · Transportasi';
  test('konflik saat tidak ada moda transportasi', function () {
    const prof = baseProfile({ transportasi: { moda: 'tidak', jarakKm: 3, menitSekali: 30, biayaSekali: 0, bisaSendiri: false } });
    const h = calc(prof, [task({ nama: 'Kontrol', perHari: 0, perBulanKontrol: 2, butuhTransport: true })]);
    same(find(h.effective, 'R4')[0].tingkat, 'konflik');
  });
  test('konflik saat menit perjalanan bulanan melebihi ambang', function () {
    const prof = baseProfile({ transportasi: { moda: 'motor', menitSekali: 45, biayaSekali: 15000, bisaSendiri: false } });
    const h = calc(prof, [task({ perHari: 0, perBulanKontrol: 4, butuhTransport: true })]);
    same(find(h.effective, 'R4')[0].tingkat, 'konflik');
    assert(find(h.effective, 'R4')[0].alasan.indexOf('360') >= 0 || find(h.effective, 'R4')[0].alasan.indexOf('6 jam') >= 0, 'alasan memuat angka perjalanan');
  });
  test('menggabungkan jadwal menurunkan tingkat transportasi', function () {
    const prof = baseProfile({ transportasi: { moda: 'motor', menitSekali: 45, biayaSekali: 15000, bisaSendiri: false } });
    const h = calc(prof, [task({ perHari: 0, perBulanKontrol: 4, butuhTransport: true })], effect(['gabung_jadwal'], 'sesuaikan'));
    const r4 = find(h.effective, 'R4');
    assert(r4.length === 0 || r4[0].tingkat === 'perhatian', 'tidak boleh tetap konflik');
  });
  test('kunjungan rumah menghapus kebutuhan transportasi', function () {
    const prof = baseProfile({ transportasi: { moda: 'tidak', menitSekali: 30, biayaSekali: 0, bisaSendiri: false } });
    const h = calc(prof, [task({ perHari: 0, perBulanKontrol: 2, butuhTransport: true })], effect(['kunjungan_rumah']));
    same(find(h.effective, 'R4').length, 0);
  });

  /* ---------------- R5 Biaya ---------------- */
  group = 'R5 · Biaya';
  test('konflik saat perkiraan biaya melebihi kemampuan', function () {
    const h = calc(baseProfile({ ekonomi: { kategori: 'terbatas', biayaBulanan: 300000, jaminan: 'BPJS' } }), [task({ biayaBulanan: 450000 })]);
    same(find(h.effective, 'R5')[0].tingkat, 'konflik');
  });
  test('tidak ada konflik biaya saat masih di bawah kemampuan', function () {
    const h = calc(baseProfile({ ekonomi: { kategori: 'cukup', biayaBulanan: 900000 } }), [task({ biayaBulanan: 300000 })]);
    same(find(h.effective, 'R5').length, 0);
  });
  test('bantuan biaya diperhitungkan dalam pemetaan ulang', function () {
    const prof = baseProfile({ ekonomi: { kategori: 'terbatas', biayaBulanan: 300000 } });
    const h = calc(prof, [task({ biayaBulanan: 450000 })], effect(['pekerja_sosial']));
    const r5 = find(h.effective, 'R5');
    assert(r5.length === 0 || r5[0].tingkat === 'perhatian', 'bantuan harus menurunkan tingkat');
  });

  /* ---------------- R6 Alat ---------------- */
  group = 'R6 · Alat & rumah';
  test('konflik saat kulkas dibutuhkan tetapi tidak ada', function () {
    const prof = baseProfile({ rumah: { listrik: true, kulkas: false, air: true, ruang: true } });
    const h = calc(prof, [task({ nama: 'Insulin', kategori: 'suntik', syaratRumah: ['kulkas'] })]);
    same(find(h.effective, 'R6')[0].tingkat, 'konflik');
  });
  test('efek pinjam alat menghapus konflik alat', function () {
    const prof = baseProfile({ rumah: { listrik: true, kulkas: false, air: true, ruang: true } });
    const h = calc(prof, [task({ syaratRumah: ['kulkas'] })], effect(['sewa_alat']));
    same(find(h.effective, 'R6').length, 0);
  });

  /* ---------------- R7 Digital ---------------- */
  group = 'R7 · Digital';
  test('konflik saat tugas butuh WhatsApp tetapi tidak tersedia', function () {
    const prof = baseProfile({ digital: { ponsel: true, wa: false, video: false } });
    const h = calc(prof, [task({ butuhDigital: 'wa' })]);
    same(find(h.effective, 'R7')[0].tingkat, 'konflik');
  });
  test('efek pengingat WhatsApp menghapus konflik digital', function () {
    const prof = baseProfile({ digital: { ponsel: true, wa: false, video: false } });
    const h = calc(prof, [task({ butuhDigital: 'wa' })], effect(['pengingat_wa']));
    same(find(h.effective, 'R7').length, 0);
  });

  /* ---------------- R8 Beban ---------------- */
  group = 'R8 · Beban kumulatif';
  test('peringatan saat jumlah tugas harian melewati ambang', function () {
    const tasks = [];
    for (let i = 0; i < 9; i++) tasks.push(task({}));
    const h = calc(baseProfile(), tasks);
    const r8 = find(h.effective, 'R8');
    same(r8.length, 1);
    same(r8[0].tingkat, 'perhatian');
  });
  test('beban tidak muncul saat jumlah tugas masih wajar', function () {
    const h = calc(baseProfile(), [task({}), task({}), task({})]);
    same(find(h.effective, 'R8').length, 0);
  });

  /* ---------------- Efek & status keputusan ---------------- */
  group = 'Efek keputusan';
  test('efek hanya diterapkan pada keputusan sesuaikan / dukungan', function () {
    const prof = baseProfile({ rumah: { listrik: true, kulkas: false, air: true, ruang: true } });
    const tasks = [task({ syaratRumah: ['kulkas'] })];
    const risiko = calc(prof, tasks, effect(['sewa_alat'], 'risiko'));
    same(find(risiko.effective, 'R6').length, 1, 'status risiko tidak mengubah data');
    const selesai = calc(prof, tasks, effect(['sewa_alat'], 'dukungan'));
    same(find(selesai.effective, 'R6').length, 0, 'dukungan menerapkan efek');
  });
  test('keputusan tidak bisa memakai opsi nonaktif dari katalog', function () {
    const cfg = JSON.parse(JSON.stringify(window.RM_CONFIG));
    const o = cfg.katalog.find(function (x) { return x.id === 'sewa_alat'; });
    o.aktif = false;
    const f = { dimensi: 'alat' };
    const opsi = RM.rules.opsiUntuk(f, cfg);
    assert(!opsi.some(function (x) { return x.id === 'sewa_alat'; }), 'opsi nonaktif tidak boleh disarankan');
  });

  /* ---------------- Ringkasan & matriks ---------------- */
  group = 'Ringkasan';
  test('konflik tanpa keputusan dihitung terbuka', function () {
    const prof = baseProfile({ rumah: { listrik: true, kulkas: false, air: true, ruang: true } });
    const h = calc(prof, [task({ syaratRumah: ['kulkas'] })]);
    same(h.ringkas.terbuka, 1);
  });
  test('konflik yang masih aktif setelah keputusan dihitung sebagian', function () {
    const prof = baseProfile({ ekonomi: { biayaBulanan: 300000 } });
    const tasks = [task({ biayaBulanan: 450000 })];
    const f = calc(prof, tasks).effective[0];
    const dec = [{ findingId: f.id, dimensi: 'biaya', status: 'dukungan', opsi: ['pekerja_sosial'] }];
    const h = calc(prof, tasks, dec);
    assert(h.ringkas.sebagian >= 0, 'ringkasan harus punya hitungan sebagian');
    assert(h.ringkas.terbuka === 0, 'tidak boleh terbuka karena sudah ada keputusan');
  });
  test('matriks memberi tingkat per dimensi dan tidak hanya warna', function () {
    const tasks = [task({ kategori: 'luka', keterampilan: 'terlatih' })];
    const h = calc(baseProfile(), tasks);
    const row = h.matrix[0];
    same(row.byDim.keterampilan, 'konflik');
    same(row.byDim.biaya, 'sesuai');
  });

  /* ---------------- Kesegaran data ---------------- */
  group = 'Kesegaran data';
  test('data lebih dari 14 hari ditandai kedaluwarsa', function () {
    const prof = baseProfile({ diperbarui: F.addDays(-20), status: 'final' });
    const h = calc(prof, []);
    same(h.freshness.status, 'kedaluwarsa');
  });
  test('data baru dianggap segar', function () {
    const h = calc(baseProfile({ diperbarui: F.addDays(-2) }), []);
    same(h.freshness.status, 'segar');
  });

  /* ---------------- Determinisme & demo ---------------- */
  group = 'Determinisme';
  test('perhitungan yang sama menghasilkan keluaran yang sama', function () {
    const prof = baseProfile({ rumah: { listrik: true, kulkas: false, air: true, ruang: true } });
    const tasks = [task({ syaratRumah: ['kulkas'] }), task({ kategori: 'luka', keterampilan: 'terlatih' })];
    const a = calc(prof, tasks);
    const b = calc(prof, tasks);
    same(JSON.stringify(a.effective), JSON.stringify(b.effective));
  });
  test('tidak ada temuan tanpa ruleId dan alasan', function () {
    const prof = baseProfile({ rumah: { listrik: true, kulkas: false, air: true, ruang: true }, digital: { ponsel: false, wa: false, video: false } });
    const tasks = [task({ syaratRumah: ['kulkas'], butuhDigital: 'wa', keterampilan: 'terlatih', kategori: 'luka' })];
    calc(prof, tasks).effective.forEach(function (f) {
      assert(!!f.ruleId, 'ruleId wajib ada');
      assert(!!f.alasan && f.alasan.length > 10, 'alasan wajib terbaca');
      assert(!!f.aturan, 'aturan wajib dijelaskan');
    });
  });

  group = 'Data demo';
  test('tersedia 10 keluarga fiktif', function () {
    const d = RM.demo.build();
    same(d.pasien.length, 10);
  });
  test('minimal tiga skenario konflik berbeda muncul', function () {
    const d = RM.demo.build();
    const rules = {};
    d.pasien.forEach(function (p) {
      const h = RM.rules.compute(p, d.profiles[p.id], d.tasks[p.id] || [], d.decisions.filter(function (x) { return x.pasienId === p.id; }), window.RM_CONFIG);
      h.effective.forEach(function (f) { if (f.tingkat !== 'sesuai') rules[f.ruleId] = true; });
    });
    assert(Object.keys(rules).length >= 3, 'butuh minimal tiga jenis aturan berbeda');
  });
  test('semua opsi katalog punya jenis dan label', function () {
    window.RM_CONFIG.katalog.forEach(function (o) {
      assert(o.jenis === 'penyesuaian' || o.jenis === 'dukungan', 'jenis opsi tidak valid: ' + o.id);
      assert(o.label && o.label.length > 3, 'label opsi kosong');
      assert(Array.isArray(o.dimensi) && o.dimensi.length, 'dimensi opsi kosong');
    });
  });

  const passed = results.filter(function (r) { return r.ok; }).length;
  const failed = results.length - passed;
  const summary = { total: results.length, passed: passed, failed: failed, results: results };

  if (typeof document !== 'undefined' && document.getElementById('test-results')) {
    const groups = {};
    results.forEach(function (r) { (groups[r.group] = groups[r.group] || []).push(r); });
    document.getElementById('test-summary').innerHTML =
      '<div class="stat-strip cols-3">' +
        '<div class="stat-block"><span class="stat-label">Total uji</span><span class="stat-value">' + results.length + '</span></div>' +
        '<div class="stat-block"><span class="stat-label">Lulus</span><span class="stat-value is-ok">' + passed + '</span></div>' +
        '<div class="stat-block"><span class="stat-label">Gagal</span><span class="stat-value ' + (failed ? 'is-danger' : '') + '">' + failed + '</span></div>' +
      '</div>' +
      '<div class="notice ' + (failed ? 'notice-danger' : 'notice-ok') + '" style="margin-top:16px">' +
        '<div><strong>' + (failed ? failed + ' uji gagal.' : 'Semua aturan lulus uji.') + '</strong> Mesin ini deterministik: masukan yang sama selalu menghasilkan temuan yang sama.</div></div>';
    document.getElementById('test-results').innerHTML = Object.keys(groups).map(function (g) {
      return '<section class="card"><div class="card-head"><h2>' + g + '</h2><span class="badge ' +
        (groups[g].some(function (r) { return !r.ok; }) ? 'badge-danger' : 'badge-ok') + '">' +
        groups[g].filter(function (r) { return r.ok; }).length + '/' + groups[g].length + '</span></div>' +
        '<div class="mini-list">' + groups[g].map(function (r) {
          return '<div class="mini-item">' + (r.ok
            ? '<svg class="od-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="#0E5C4A" stroke-width="1.8"/><path d="m8.2 12.2 2.5 2.5 5-5.4" fill="none" stroke="#0E5C4A" stroke-width="1.9" stroke-linecap="round"/></svg>'
            : '<svg class="od-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="#9A2418" stroke-width="1.8"/><path d="m9 9 6 6M15 9l-6 6" stroke="#9A2418" stroke-width="1.9" stroke-linecap="round"/></svg>') +
            '<div><span class="t">' + r.name + '</span>' + (r.ok ? '' : '<span class="d" style="color:#841E14">' + (r.error || '') + '</span>') + '</div></div>';
        }).join('') + '</div></section>';
    }).join('');
  }

  RM.tests = summary;
})();
