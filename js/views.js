/* RencanaMampu — tampilan. HTML dirender sebagai string, aksi ditangani app.js. */
(function () {
  const RM = (window.RM = window.RM || {});
  const F = RM.fmt;
  const S = RM.store;
  const V = (RM.views = {});

  const PATHS = {
    check: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m8.2 12.2 2.5 2.5 5-5.4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
    alert: '<path d="M12 4.5 21 20H3L12 4.5Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 10v4.2" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><circle cx="12" cy="17" r="1.05" fill="currentColor"/>',
    x: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m9 9 6 6M15 9l-6 6" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',
    arrowRight: '<path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    arrowLeft: '<path d="M20 12H5M11 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    chevron: '<path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    plus: '<path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',
    trash: '<path d="M4 7h16M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7m-8 0 .8 12a1 1 0 0 0 1 .9h6.4a1 1 0 0 0 1-.9L17 7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    clock: '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 7.5V12l3 1.8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    users: '<path d="M4 19.5c0-3 3.1-5.2 6.5-5.2s6.5 2.2 6.5 5.2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="10.5" cy="7.6" r="3.1" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M16.2 5.2a3 3 0 0 1 0 5.4M18 14.9c1.8.6 3 1.9 3 3.6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    chart: '<path d="M4 20V9m5.3 11V5m5.4 15v-7m5.3 7V8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    settings: '<circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.6 1.6M16.4 16.4 18 18M18 6l-1.6 1.6M7.6 16.4 6 18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    printer: '<path d="M7 9V4h10v5M7 18H5a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><rect x="7" y="14" width="10" height="6" rx="1" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="17" cy="12" r="0.9" fill="currentColor"/>',
    shield: '<path d="M12 3.5 20 6v6.2c0 4-3.3 7.3-8 8.8-4.7-1.5-8-4.8-8-8.8V6l8-2.5Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="m8.8 12 2.2 2.2 4.3-4.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    phone: '<rect x="7" y="2.8" width="10" height="18.4" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M11 18.5h2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    pill: '<path d="m8.2 15.8 7.6-7.6a3.4 3.4 0 1 1 4.8 4.8l-7.6 7.6a3.4 3.4 0 1 1-4.8-4.8Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="m10.5 10.5 3 3" stroke="currentColor" stroke-width="1.7"/>',
    droplet: '<path d="M12 3.5c3.2 4.1 5.6 6.7 5.6 9.7a5.6 5.6 0 1 1-11.2 0c0-3 2.4-5.6 5.6-9.7Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
    activity: '<path d="M3 12.5h4l2.2-5.5 3.4 10 2.4-6 1.6 3.5H21" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    bowl: '<path d="M4 11h16a8 8 0 0 1-16 0Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M9 7.5c0-1.4 1.3-1.8 1.3-3M13 7.5c0-1.6 1.4-2 1.4-3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    walk: '<circle cx="13" cy="4.8" r="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="m10 21 1.4-5 2.2-2 .8 4 2.6 1.4M8 13l2.2-3.4L13 8.5l2.4 2 2.6.6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8 3v4M16 3v4M3.5 10h17" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    box: '<path d="M4 8.2 12 4l8 4.2v7.6L12 20l-8-4.2V8.2Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="m4 8.2 8 4.3 8-4.3M12 12.5V20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
    wifi: '<path d="M3.5 9.2a13 13 0 0 1 17 0M6.5 12.4a8.5 8.5 0 0 1 11 0M9.3 15.5a4.2 4.2 0 0 1 5.4 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="19" r="1.1" fill="currentColor"/>',
    refresh: '<path d="M20 11.5A8 8 0 0 0 6.2 6.8L4 9M4 4.5V9h4.5M4 12.5a8 8 0 0 0 13.8 4.7L20 15m0 4.5V15h-4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    search: '<circle cx="10.8" cy="10.8" r="6.3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m15.5 15.5 4.2 4.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    info: '<circle cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 10.8v5.4" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><circle cx="12" cy="7.9" r="1.1" fill="currentColor"/>',
    edit: '<path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="m13.8 7.2 3 3" stroke="currentColor" stroke-width="1.7"/>',
    link: '<path d="M10 13.8a3.7 3.7 0 0 0 5.4.3l2.4-2.4a3.8 3.8 0 0 0-5.4-5.4l-1.4 1.4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M14 10.2a3.7 3.7 0 0 0-5.4-.3l-2.4 2.4a3.8 3.8 0 0 0 5.4 5.4l1.4-1.4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    lock: '<rect x="5" y="10.5" width="14" height="9.5" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    home: '<path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1v-9.5Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
    route: '<path d="M6.5 20c-1.7 0-3-1.3-3-3 0-2.4 3-6 3-6s3 3.6 3 6c0 1.7-1.3 3-3 3Z" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="6.5" cy="17" r="1" fill="currentColor"/><path d="M9.5 7.5h4.2a3.3 3.3 0 0 1 0 6.6H9.8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="m17 5.4 2.6 2.1-2.6 2.2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    wallet: '<rect x="3.5" y="6" width="17" height="13" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M3.5 10h17M16 14.5h1.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M6 6V4.8h11" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    skill: '<path d="M4 15.5 9 10l3 3 7-7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M15.5 6H20v4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 20h16" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    layers: '<path d="m12 3.5 8 4.2-8 4.2-8-4.2 8-4.2Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="m4.5 12 7.5 4 7.5-4M4.5 16l7.5 4 7.5-4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
    file: '<path d="M6 3.5h7l5 5V20a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 6 20V3.5Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M13 3.5V9h5M9 13h6M9 16.5h4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    copy: '<rect x="8" y="8" width="11" height="12" rx="1.6" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M16 5.5V4.6A1.6 1.6 0 0 0 14.4 3H5.6A1.6 1.6 0 0 0 4 4.6v10.8A1.6 1.6 0 0 0 5.6 17h1" fill="none" stroke="currentColor" stroke-width="1.7"/>',
    logout: '<path d="M14 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 8l-4 4 4 4M6 12h10" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>'
  };

  function e(v) {
    if (v === null || v === undefined) return '';
    return String(v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function icon(name, cls) {
    return '<svg class="od-icon ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (PATHS[name] || '') + '</svg>';
  }
  function levelPill(level, short) {
    const L = RM_CONFIG.level[level] || RM_CONFIG.level.sesuai;
    return '<span class="cell-pill cell-' + level + '">' + icon(L.icon) + (short ? (level === 'perhatian' ? 'Perhatian' : L.label) : L.label) + '</span>';
  }
  function kritikalBadge(k) {
    if (k === 'tinggi') return '<span class="badge badge-danger">' + icon('alert') + 'Kritis tinggi</span>';
    if (k === 'sedang') return '<span class="badge badge-warn">Kritis sedang</span>';
    return '<span class="badge badge-neutral">Kritis rendah</span>';
  }
  function jenisBadge(jenis) {
    return jenis === 'penyesuaian'
      ? '<span class="badge badge-info">Penyesuaian rencana</span>'
      : '<span class="badge badge-ok">Dukungan tambahan</span>';
  }
  function freshClass(status) {
    return ({ segar: 'fresh-ok', segera: 'fresh-soon', kedaluwarsa: 'fresh-stale', draf: 'fresh-soon', kosong: 'fresh-empty' })[status] || 'fresh-empty';
  }
  function pulangText(p) {
    const d = -F.selisihHari(p.pulang);
    if (d === 0) return 'Pulang hari ini';
    if (d === 1) return 'Pulang besok';
    if (d > 1) return 'Pulang ' + d + ' hari lagi';
    if (d === -1) return 'Pulang kemarin';
    return 'Pulang ' + Math.abs(d) + ' hari lalu';
  }
  function taskFrekuensi(t) {
    if (t.butuhTransport && !t.perHari) return t.perBulanKontrol + '× per bulan';
    if (!t.perHari) return t.perBulanKontrol ? t.perBulanKontrol + '× per bulan' : 'Sesuai kebutuhan';
    const days = Array.isArray(t.hari) && t.hari.length < 7
      ? t.hari.map(function (d) { return ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'][d]; }).join(', ')
      : 'setiap hari';
    return t.perHari + '× sehari · ' + days + ' · ' + F.menit(t.menit);
  }
  function statBlock(label, value, note, cls, suffix) {
    return '<div class="stat-block"><span class="stat-label">' + e(label) + '</span>' +
      '<span class="stat-value ' + (cls || '') + '">' + e(value) + (suffix ? '<small>' + e(suffix) + '</small>' : '') + '</span>' +
      (note ? '<span class="stat-note">' + e(note) + '</span>' : '') + '</div>';
  }
  function optionLabel(id, config) {
    const o = (config.katalog || []).find(function (x) { return x.id === id; });
    return o ? o.label : id;
  }
  function profileSummaryRows(p) {
    const t = p.transportasi || {};
    return [
      { k: 'Pendamping', v: p.pendamping && p.pendamping.length ? p.pendamping.map(function (c) { return c.hubungan + ' (' + c.jamPerHari + ' jam/hari)'; }).join(', ') : 'Belum ada' },
      { k: 'Transportasi', v: ({ motor: 'Motor', angkutan: 'Angkutan umum', mobil: 'Mobil', tidak: 'Tidak ada' })[t.moda] + (t.menitSekali ? ' · ' + t.menitSekali + ' mnt' : '') + (t.biayaSekali ? ' · ' + F.rupiah(t.biayaSekali) : '') },
      { k: 'Kemampuan biaya', v: $cap(p) },
      { k: 'Rumah', v: ['listrik', 'kulkas', 'air', 'ruang'].filter(function (k) { return p.rumah && p.rumah[k]; }).map(function (k) { return RM_CONFIG.detailRumah[k]; }).join(', ') || 'Belum lengkap' },
      { k: 'Digital', v: ['ponsel', 'wa', 'video'].filter(function (k) { return p.digital && p.digital[k]; }).map(function (k) { return RM_CONFIG.detailDigital[k]; }).join(', ') || 'Tidak ada' }
    ];
  }
  function $cap(p) {
    const kat = RM_CONFIG.kategoriBiaya[p.ekonomi && p.ekonomi.kategori];
    return (kat ? kat.label : '—') + ' · ' + F.rupiah(p.ekonomi && p.ekonomi.biayaBulanan);
  }

  /* =========================================================
     DAFTAR PASIEN
     ========================================================= */
  V.daftar = function () {
    const rows = S.state.pasien.map(function (p) { return S.hasil(p.id); }).sort(function (a, b) { return a.pasien.pulang.localeCompare(b.pasien.pulang); });
    const stats = S.stats();
    const filter = RM.ui.filter || 'semua';
    const q = (RM.ui.q || '').toLowerCase();
    const filtered = rows.filter(function (r) {
      if (q && !(r.pasien.kode + ' ' + r.pasien.diagnosis).toLowerCase().includes(q)) return false;
      if (filter === 'konflik') return r.ringkas.terbuka > 0;
      if (filter === 'belum') return !r.profile || (r.profile && r.profile.status === 'draf') || r.tasks.length === 0;
      if (filter === 'lama') return r.freshness.status === 'kedaluwarsa';
      return true;
    });
    const countFilter = function (id) {
      if (id === 'konflik') return rows.filter(function (r) { return r.ringkas.terbuka > 0; }).length;
      if (id === 'belum') return rows.filter(function (r) { return !r.profile || (r.profile && r.profile.status === 'draf') || r.tasks.length === 0; }).length;
      if (id === 'lama') return rows.filter(function (r) { return r.freshness.status === 'kedaluwarsa'; }).length;
      return rows.length;
    };

    return '<section class="page">' +
      '<div class="page-head"><div>' +
        '<p class="eyebrow">' + e(S.state.layanan) + ' · ' + rows.length + ' keluarga didampingi</p>' +
        '<h1>Pasien &amp; kesiapan pulang</h1>' +
        '<p class="lede">Petakan tuntutan tugas perawatan terhadap kapasitas keluarga sebelum pasien pulang. Fokus pada konflik yang benar-benar mengubah layanan.</p>' +
      '</div><div class="page-actions">' +
        '<a class="btn btn-secondary" href="#/dasbor">' + icon('chart') + 'Dasbor evaluasi</a>' +
      '</div></div>' +

      '<div class="stat-strip">' +
        statBlock('Konflik terbuka', String(stats.terbuka), 'Belum ada keputusan atau tidak terselesaikan', stats.terbuka ? 'is-danger' : 'is-ok') +
        statBlock('Perlu perhatian', String(stats.perhatian), 'Belum menjadi konflik, tetap perlu ditinjau', 'is-warn') +
        statBlock('Konflik terdeteksi', String(stats.findings), 'Dari ' + stats.denganProfil + ' profil kapasitas terisi', 'is-info') +
        statBlock('Data kedaluwarsa', String(rows.filter(function (r) { return r.freshness.status === 'kedaluwarsa'; }).length), 'Lebih dari ' + S.state.config.hariKedaluwarsaData + ' hari', 'is-warn') +
      '</div>' +

      '<div class="toolbar">' +
        '<div class="filter-row" role="group" aria-label="Filter daftar pasien">' +
          ['semua', 'konflik', 'belum', 'lama'].map(function (id) {
            const labels = { semua: 'Semua', konflik: 'Konflik terbuka', belum: 'Belum lengkap', lama: 'Data lama' };
            return '<button class="chip' + (filter === id ? ' is-active' : '') + '" data-action="filter" data-filter="' + id + '" aria-pressed="' + (filter === id) + '">' +
              labels[id] + ' <span class="count">' + countFilter(id) + '</span></button>';
          }).join('') +
        '</div>' +
        '<form class="search-form" data-form="cari" role="search">' +
          '<label class="sr-only" for="q">Cari kode atau diagnosis</label>' +
          '<input id="q" name="q" type="search" placeholder="Cari kode / diagnosis" value="' + e(RM.ui.q || '') + '" />' +
          '<button class="btn btn-secondary btn-sm" type="submit">' + icon('search') + 'Cari</button>' +
        '</form>' +
      '</div>' +

      '<div class="patient-list" role="list">' +
        (filtered.length ? filtered.map(function (r) {
          const p = r.pasien;
          const open = r.ringkas.terbuka;
          const perhatian = r.effective.filter(function (f) { return f.tingkat === 'perhatian'; }).length;
          let status = '';
          if (!r.profile) status = '<span class="badge badge-neutral">' + icon('info') + 'Belum ada profil</span>';
          else if (r.profile.status === 'draf') status = '<span class="badge badge-warn">' + icon('edit') + 'Draf profil</span>';
          if (open) status += '<span class="badge badge-danger">' + icon('x') + open + ' konflik terbuka</span>';
          if (perhatian) status += '<span class="badge badge-warn">' + icon('alert') + perhatian + ' perhatian</span>';
          if (r.profile && r.profile.status === 'final' && !open && !perhatian) status += '<span class="badge badge-ok">' + icon('check') + 'Sesuai kapasitas</span>';
          return '<a class="patient-row" role="listitem" href="#/pasien/' + p.id + '">' +
            '<div class="patient-id"><span class="code">' + e(p.kode) + '</span><span class="sub">' + p.usia + ' th · ' + e(p.ruang) + '</span></div>' +
            '<div class="patient-dx"><span class="dx">' + e(p.diagnosis) + '</span><span class="sub">' + e(pulangText(p)) + ' · ' + F.tanggal(p.pulang) + '</span></div>' +
            '<div class="patient-status">' + status + '</div>' +
            '<div class="patient-fresh"><span class="fresh ' + freshClass(r.freshness.status) + '">' + e(r.freshness.teks) + '</span></div>' +
            '<span class="row-arrow">' + icon('arrowRight') + '</span>' +
          '</a>';
        }).join('') : '<div class="empty-state"><div class="empty-icon">' + icon('search') + '</div><h2>Tidak ada pasien yang cocok</h2><p>Ubah filter atau kata pencarian. Semua data demo tetap tersimpan di peramban ini.</p><button class="btn btn-secondary" data-action="reset-filter">Tampilkan semua</button></div>') +
      '</div>' +

      '<p class="list-note">Kode pasien adalah pseudonim. Nama lengkap tidak ditampilkan di daftar. Data kapasitas lebih dari ' + S.state.config.hariKedaluwarsaData + ' hari ditandai agar diperbarui sebelum dipakai.</p>' +
    '</section>';
  };

  /* =========================================================
     DETAIL PASIEN
     ========================================================= */
  V.pasien = function (id) {
    const r = S.hasil(id);
    if (!r) return V.notFound('Pasien tidak ditemukan.');
    const p = r.pasien;
    const hasProfile = !!r.profile;
    const stale = r.freshness.status === 'kedaluwarsa';
    const sorted = RM.rules.sortFindings(r.effective, r.tasks);
    const open = r.ringkas.terbuka;
    const perhatian = r.effective.filter(function (f) { return f.tingkat === 'perhatian'; }).length;
    const dailyTasks = r.tasks.filter(function (t) { return t.perHari > 0; });
    const feedback = S.feedbackFor(id);

    const steps = [
      { label: 'Profil kapasitas', sub: hasProfile ? 'versi ' + r.profile.versi + ' · ' + F.usiaData(r.profile.diperbarui) : 'belum diisi', done: hasProfile && r.profile.status === 'final', href: '#/pasien/' + id + '/kapasitas' },
      { label: 'Tugas perawatan', sub: r.tasks.length ? r.tasks.length + ' tugas' : 'belum ada', done: r.tasks.length > 0, href: '#/pasien/' + id + '/tugas' },
      { label: 'Tinjauan klinisi', sub: r.decisions.length ? r.decisions.length + ' keputusan' : 'belum ditinjau', done: hasProfile && r.tasks.length > 0 && open === 0, href: '#/pasien/' + id + '/pemetaan' },
      { label: 'Tindak lanjut', sub: r.fu7 || r.fu30 ? 'hari 7' + (r.fu30 ? ' & 30' : '') + ' tercatat' : 'belum ada', done: !!(r.fu7 || r.fu30), href: '#/pasien/' + id + '/tindak-lanjut' }
    ];

    return '<section class="page">' +
      '<nav class="breadcrumb" aria-label="Remah roti"><a href="#/pasien">Pasien</a><span class="sep">/</span><span>' + e(p.kode) + '</span></nav>' +

      '<div class="detail-head">' +
        '<div class="detail-title-row">' +
          '<div><p class="eyebrow">' + e(p.ruang) + ' · ' + e(S.state.layanan) + '</p>' +
            '<h1>' + e(p.kode) + ' <span class="muted" style="font-weight:400">· ' + p.usia + ' tahun</span></h1>' +
            '<div class="detail-meta">' +
              '<span>' + icon('file') + e(p.diagnosis) + '</span>' +
              '<span>' + icon('calendar') + (F.selisihHari(p.pulang) > 0 ? 'Pulang ' : 'Rencana pulang ') + F.tanggal(p.pulang) + ' (' + e(pulangText(p)) + ')</span>' +
              '<span class="fresh ' + freshClass(r.freshness.status) + '">' + e(r.freshness.teks) + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="page-actions">' +
            '<a class="btn btn-secondary" href="#/pasien/' + id + '/kapasitas">' + icon('refresh') + (hasProfile ? 'Perbarui kapasitas' : 'Isi kapasitas') + '</a>' +
            '<a class="btn btn-primary" href="#/pasien/' + id + '/pemetaan">' + icon('layers') + 'Tinjau pemetaan</a>' +
          '</div>' +
        '</div>' +
        '<div class="progress-rail">' +
          steps.map(function (s, i) {
            return '<a class="progress-step ' + (s.done ? 'is-done' : '') + '" href="' + s.href + '">' +
              '<span class="step-dot">' + (s.done ? icon('check') : String(i + 1)) + '</span>' +
              '<span><span class="step-label">' + e(s.label) + '</span><span class="step-sub">' + e(s.sub) + '</span></span>' +
            '</a>';
          }).join('') +
        '</div>' +
      '</div>' +

      (stale ? '<div class="notice notice-warn">' + icon('alert') + '<div><strong>Data kapasitas berumur ' + r.freshness.hari + ' hari.</strong> Kapasitas keluarga bisa berubah setelah pulang. Perbarui sebelum keputusan dianggap final. <a href="#/pasien/' + id + '/kapasitas">Perbarui sekarang</a>.</div></div>' : '') +
      (!hasProfile ? '<div class="card"><div class="empty-state"><div class="empty-icon">' + icon('users') + '</div><h2>Mulai dari kapasitas keluarga</h2><p>Belum ada profil kapasitas. Isi bersama keluarga dalam ± 5 menit, boleh disimpan sebagian, lalu lanjutkan kapan saja.</p><a class="btn btn-primary" href="#/pasien/' + id + '/kapasitas">' + icon('arrowRight') + 'Mulai profil kapasitas</a></div></div>' : '') +

      '<div class="split">' +
        '<div class="stack-6">' +
          '<div class="stat-strip cols-3">' +
            statBlock('Konflik terbuka', String(open), open ? 'Perlu keputusan klinisi' : 'Tidak ada yang menggantung', open ? 'is-danger' : 'is-ok') +
            statBlock('Perlu perhatian', String(perhatian), 'Pantau, belum tentu konflik', perhatian ? 'is-warn' : 'is-ok') +
            statBlock('Tugas harian', String(dailyTasks.length), r.tasks.length + ' tugas total', 'is-info') +
          '</div>' +

          '<div class="card">' +
            '<div class="card-head"><div><h2>Konflik prioritas</h2><p>Diurutkan dari tingkat kritis tugas, lalu keparahan konflik.</p></div>' +
              (hasProfile && sorted.length ? '<a class="btn btn-ghost btn-sm" href="#/pasien/' + id + '/pemetaan">Semua konflik' + icon('arrowRight') + '</a>' : '') +
            '</div>' +
            (sorted.length ? '<div class="mini-list">' + sorted.slice(0, 3).map(function (f) {
              const dec = RM.rules.statusKeputusan(r.decisions, f.id);
              const status = !dec || dec.status === 'tidak_selesai'
                ? '<span class="badge badge-danger">' + icon('x') + 'Belum terselesaikan</span>'
                : dec.status === 'risiko'
                  ? '<span class="badge badge-warn">' + icon('alert') + 'Diterima dengan risiko</span>'
                  : '<span class="badge badge-info">' + icon('refresh') + 'Ditangani, masih dipantau</span>';
              return '<div class="mini-item">' + icon(f.tingkat === 'konflik' ? 'x' : 'alert') +
                '<div style="flex:1"><span class="t">' + e(f.judul) + '</span><span class="d">' + e(f.alasan) + '</span></div>' +
                '<div>' + status + '</div></div>';
            }).join('') + '</div>' : '<div class="empty-state" style="padding:24px"><p>' + (hasProfile ? (r.tasks.length ? 'Tidak ada konflik terdeteksi pada data saat ini.' : 'Tambahkan tugas perawatan untuk mulai memetakan.') : 'Profil kapasitas belum diisi.') + '</p></div>') +
          '</div>' +

          '<div class="card card-flat">' +
            '<div class="card-head"><div><h3>Tugas perawatan</h3><p>' + (r.tasks.length ? r.tasks.length + ' tugas · ' + F.rupiah(r.tasks.reduce(function (s, t) { return s + (t.biayaBulanan || 0); }, 0)) + ' perkiraan biaya/bulan' : 'Belum ada tugas') + '</p></div>' +
              '<a class="btn btn-secondary btn-sm" href="#/pasien/' + id + '/tugas">' + icon('edit') + 'Kelola tugas</a></div>' +
            (r.tasks.length ? '<ul class="task-list">' + r.tasks.map(function (t) {
              return '<li class="task-item"><div><span class="t-name">' + e(t.nama) + '</span><span class="t-meta">' + e(RM_CONFIG.kategori[t.kategori] || t.kategori) + ' · ' + e(taskFrekuensi(t)) + '</span>' +
                '<div class="t-badges">' + kritikalBadge(t.kritis) + '</div></div></li>';
            }).join('') + '</ul>' : '<p class="small muted">Tambahkan tugas dari templat agar pengisian cepat dan tidak mengetik dari nol.</p>') +
          '</div>' +
        '</div>' +

        '<div class="stack-4">' +
          '<div class="card summary-card">' +
            '<div class="card-head"><h2>Kapasitas keluarga</h2>' +
              (hasProfile ? '<a class="btn btn-ghost btn-sm" href="#/pasien/' + id + '/kapasitas">Ubah</a>' : '') +
            '</div>' +
            (hasProfile ? '<div class="kv-list">' + profileSummaryRows(r.profile).map(function (row) {
              return '<div class="kv-row"><span class="k">' + e(row.k) + '</span><span class="v">' + e(row.v) + '</span></div>';
            }).join('') + '</div>' +
              '<p class="small muted" style="margin-top:12px">Diisi ' + e(r.profile.diisiOleh) + ' · ' + F.tanggal(r.profile.diperbarui) + '. Consent tercatat untuk pemakaian perencanaan pulang.</p>'
            : '<p class="small muted">Belum ada data. Profil kapasitas adalah versi bertanggal — bisa diperbarui kapan saja.</p>') +
          '</div>' +

          '<div class="card">' +
            '<div class="card-head"><h3>Tindak lanjut</h3></div>' +
            '<div class="mini-list">' +
              '<div class="mini-item">' + icon('calendar') + '<div><span class="t">Hari ke-7</span><span class="d">' + (r.fu7 ? 'Skor beban ' + r.fu7.beban + '/5 · ' + (r.fu7.tugasDijalankan || []).length + ' tugas dijalankan' : 'Belum diisi') + '</span></div></div>' +
              '<div class="mini-item">' + icon('calendar') + '<div><span class="t">Hari ke-30</span><span class="d">' + (r.fu30 ? 'Skor beban ' + r.fu30.beban + '/5 · ' + (r.fu30.tugasDijalankan || []).length + ' tugas dijalankan' : 'Belum diisi') + '</span></div></div>' +
            '</div>' +
            '<a class="btn btn-secondary btn-sm btn-block" style="margin-top:12px" href="#/pasien/' + id + '/tindak-lanjut">Isi tindak lanjut</a>' +
          '</div>' +

          '<div class="card">' +
            '<div class="card-head"><h3>Umpan balik klinisi</h3></div>' +
            (feedback ? '<p class="small">Skor <strong>' + feedback.skor + '/5</strong> — ' + e(feedback.catatan || 'tanpa catatan') + '</p>'
              : '<p class="small muted">Satu pertanyaan singkat di akhir tinjauan: apakah pemetaan ini berguna atau hanya formulir tambahan?</p><a class="btn btn-ghost btn-sm" href="#/pasien/' + id + '/pemetaan#umpan-balik">Isi umpan balik</a>') +
          '</div>' +

          '<div class="card card-tint">' +
            '<h3 style="font-size:17px">Ringkasan untuk keluarga</h3>' +
            '<p class="small muted" style="margin:6px 0 12px">Bahasa sederhana, siap dicetak atau disimpan sebagai PDF.</p>' +
            '<div class="stack-2"><a class="btn btn-secondary btn-sm" href="#/pasien/' + id + '/ringkasan">' + icon('file') + 'Buka ringkasan</a>' +
            '<button class="btn btn-ghost btn-sm" data-action="copy-family-link" data-id="' + id + '">' + icon('link') + 'Buat tautan keluarga</button></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>';
  };

  /* =========================================================
     FORMULIR KAPASITAS
     ========================================================= */
  const STEPS = ['Persetujuan', 'Pendamping', 'Transportasi & biaya', 'Rumah & digital', 'Tinjau'];

  V.kapasitas = function (id, step) {
    const p = S.getPasien(id);
    if (!p) return V.notFound('Pasien tidak ditemukan.');
    const draft = RM.ui.draft || (RM.ui.draft = blankDraft(id));
    const current = Math.max(0, Math.min(4, step || 0));
    const errors = RM.ui.formErrors || [];
    const isLater = current > 0;

    return '<section class="page">' +
      '<nav class="breadcrumb"><a href="#/pasien">Pasien</a><span class="sep">/</span><a href="#/pasien/' + id + '">' + e(p.kode) + '</a><span class="sep">/</span><span>Profil kapasitas</span></nav>' +
      '<div class="page-head"><div><p class="eyebrow">± 5 menit · boleh disimpan sebagian</p><h1>Kapasitas keluarga</h1>' +
        '<p class="lede">Tanyakan dengan bahasa sehari-hari. Fokus pada apa yang benar-benar tersedia, bukan pada apa yang seharusnya tersedia.</p></div>' +
        '<div class="page-actions"><a class="btn btn-ghost" href="#/pasien/' + id + '">' + icon('arrowLeft') + 'Kembali ke pasien</a></div></div>' +

      '<form class="form-shell" data-form="kapasitas" data-id="' + id + '" novalidate>' +
        '<aside class="form-aside">' +
          '<div class="card" style="padding:16px"><p class="small muted" style="margin-bottom:10px">Langkah ' + (current + 1) + ' dari 5</p>' +
            '<div class="form-steps">' + STEPS.map(function (s, i) {
              return '<div class="form-step-item ' + (i === current ? 'is-active' : '') + ' ' + (i < current ? 'is-done' : '') + '">' +
                '<span class="num">' + (i < current ? icon('check') : i + 1) + '</span><span class="label">' + s + '</span></div>';
            }).join('') + '</div>' +
            '<p class="small muted" style="margin-top:14px">' + (draft.status === 'draf' ? 'Draf tersimpan. Anda bisa melanjutkan kapan saja.' : 'Data disimpan lokal di peramban ini pada prototipe.') + '</p>' +
          '</div>' +
          versiCard(id, draft) +
          '<div class="card" style="padding:16px"><div class="row" style="gap:8px;align-items:flex-start">' + icon('shield') +
            '<div><p class="small" style="font-weight:700">Data sensitif</p><p class="small muted">Hanya untuk perencanaan pulang. Jangan memasukkan nama lengkap atau nomor rekam medis di catatan bebas.</p></div></div></div>' +
        '</aside>' +

        '<div class="form-main">' +
          '<div class="card form-card">' +
            (errors.length ? '<div class="form-errors" role="alert"><span class="err-title">Periksa ' + errors.length + ' hal berikut:</span>' + errors.map(function (er) { return '<span class="field-error">' + e(er) + '</span>'; }).join('') + '</div>' : '') +
            stepContent(current, draft, p) +
          '</div>' +
          '<div class="form-actions">' +
            '<button type="button" class="btn btn-ghost" data-action="form-prev" data-step="' + current + '"' + (current === 0 ? ' disabled' : '') + '>' + icon('arrowLeft') + 'Kembali</button>' +
            '<div class="right">' +
              '<button type="button" class="btn btn-secondary" data-action="form-save-draft" data-id="' + id + '">Simpan &amp; lanjutkan nanti</button>' +
              (current < 4
                ? '<button type="button" class="btn btn-primary" data-action="form-next" data-step="' + current + '">Lanjut' + icon('arrowRight') + '</button>'
                : '<button type="button" class="btn btn-primary" data-action="form-save-final" data-id="' + id + '">' + icon('check') + 'Simpan profil final</button>') +
            '</div>' +
          '</div>' +
        '</div>' +
      '</form>' +
    '</section>';
  };

  function blankDraft(id) {
    const existing = S.profile(id);
    if (existing) {
      const d = JSON.parse(JSON.stringify(existing));
      d.diperbarui = F.today();
      return d;
    }
    return {
      pasienId: id, versi: 1, status: 'draf', diperbarui: F.today(), diisiOleh: 'Ns. Rina Kusuma', sumber: 'petugas',
      consent: { diberikan: false, oleh: '', pada: '', cakupan: 'Data kapasitas keluarga untuk perencanaan pulang; dapat dihapus atas permintaan.' },
      pendamping: [{ nama: '', hubungan: 'Istri', jamPerHari: 4, hari: [0, 1, 2, 3, 4, 5, 6], bekerja: false, jamKerja: [], keterbatasan: '', literasi: 'cukup', keterampilan: [] }],
      transportasi: { moda: 'motor', jarakKm: 5, menitSekali: 20, biayaSekali: 15000, bisaSendiri: false },
      ekonomi: { kategori: 'terbatas', biayaBulanan: 400000, jaminan: 'BPJS' },
      rumah: { listrik: true, kulkas: false, air: true, ruang: false },
      digital: { ponsel: true, wa: false, video: false },
      komunitas: { kader: false, puskesmas: '', tetangga: false },
      bebanAwal: 3
    };
  }

  function versiCard(id, draft) {
    const lama = ((S.state.riwayatProfil || {})[id] || []).slice(0, 2);
    if (!draft) return '';
    return '<div class="card" style="padding:16px"><p class="small" style="font-weight:700;margin-bottom:4px">Versi tersimpan</p>' +
      '<p class="small muted" style="margin-bottom:8px">Setiap perubahan menyimpan tanggal dan nama pengisi.</p>' +
      '<div class="mini-list">' +
        '<div class="mini-item"><div><span class="t">Versi ' + (draft.versi || 1) + (draft.status === 'draf' ? ' · draf' : ' · aktif') + '</span><span class="d">' + F.tanggal(draft.diperbarui) + ' · ' + e(draft.diisiOleh || 'Belum dicatat') + '</span></div></div>' +
        lama.map(function (v) {
          return '<div class="mini-item" style="opacity:.8"><div><span class="t">Versi ' + (v.versi || '—') + '</span><span class="d">' + F.tanggal(v.diperbarui) + ' · ' + e(v.diisiOleh || 'Belum dicatat') + '</span></div></div>';
        }).join('') +
      '</div></div>';
  }

  function stepContent(step, d, p) {
    if (step === 0) {
      return '<h2>Mulai dari persetujuan</h2>' +
        '<p class="form-intro">Kami akan mencatat siapa yang mengisi dan menyimpan persetujuan sebelum data kapasitas dimasukkan. Keluarga boleh berhenti kapan saja.</p>' +
        '<div class="form-section">' +
          '<div class="field-grid">' +
            '<div class="field"><label for="f-pengisi">Formulir diisi oleh <span class="required">*</span></label>' +
              '<select id="f-pengisi" name="sumber"><option value="petugas"' + (d.sumber === 'petugas' ? ' selected' : '') + '>Petugas, atas nama keluarga</option><option value="keluarga"' + (d.sumber === 'keluarga' ? ' selected' : '') + '>Pasien / keluarga langsung</option></select></div>' +
            '<div class="field"><label for="f-nama-pengisi">Nama pengisi <span class="required">*</span></label>' +
              '<input id="f-nama-pengisi" name="diisiOleh" type="text" value="' + e(d.diisiOleh) + '" autocomplete="off" /></div>' +
          '</div>' +
          '<div class="consent-box" style="margin-top:16px">' +
            '<label class="check" for="f-consent"><input type="checkbox" id="f-consent" name="consent"' + (d.consent && d.consent.diberikan ? ' checked' : '') + ' />' +
              '<span><span class="check-label">Keluarga setuju data kapasitas dipakai untuk perencanaan pulang</span>' +
              '<span class="check-help">Termasuk kebutuhan pendamping, transportasi, biaya, kondisi rumah, dan sarana digital. Data dapat diminta untuk dihapus. Persetujuan ini dicatat dengan tanggal.</span></span></label>' +
            '<div class="field" style="margin-top:12px"><label for="f-consent-oleh">Nama pemberi persetujuan</label>' +
              '<input id="f-consent-oleh" name="consentOleh" type="text" value="' + e((d.consent && d.consent.oleh) || '') + '" placeholder="Contoh: Ani (istri)" /></div>' +
          '</div>' +
          '<div class="notice notice-info" style="margin-top:16px">' + icon('info') + '<div><strong>Bukan penilaian kepatuhan.</strong> Pertanyaan tentang biaya dan waktu tidak dimaksudkan menilai keluarga. Yang dicari adalah titik benturan antara tuntutan tugas dan dukungan yang tersedia.</div></div>' +
        '</div>';
    }

    if (step === 1) {
      return '<h2>Siapa yang bisa membantu di rumah?</h2>' +
        '<p class="form-intro">Catat orang yang benar-benar bisa membantu, bukan yang secara teori tinggal serumah. Jam yang tersedia adalah jam nyata setelah pekerjaan dan urusan lain.</p>' +
        '<div class="form-section"><div class="stack-3" id="companion-list">' +
          (d.pendamping || []).map(function (c, i) { return companionForm(c, i); }).join('') +
        '</div>' +
        '<button type="button" class="btn btn-secondary btn-sm" style="margin-top:12px" data-action="add-companion">' + icon('plus') + 'Tambah pendamping</button>' +
        '<p class="help" style="margin-top:10px">Kosongkan daftar jika memang tidak ada pendamping tetap. Aplikasi akan menandai tugas yang membutuhkan pendamping.</p>' +
        '</div>';
    }

    if (step === 2) {
      const t = d.transportasi || {};
      const ek = d.ekonomi || {};
      return '<h2>Perjalanan dan biaya</h2>' +
        '<p class="form-intro">Perkiraan kasar sudah cukup. Untuk biaya, pilih kisaran kemampuan bulanan — bukan angka pasti pengeluaran keluarga.</p>' +
        '<div class="form-section"><div class="form-section-title">Transportasi ke fasilitas kesehatan</div>' +
          '<p class="form-section-help">Dihitung dari rumah ke fasilitas yang biasa dituju.</p>' +
          '<div class="field-grid three">' +
            '<div class="field"><label for="f-moda">Moda yang biasa dipakai</label><select id="f-moda" name="moda">' +
              [['motor', 'Motor'], ['angkutan', 'Angkutan umum'], ['mobil', 'Mobil'], ['tidak', 'Tidak ada']].map(function (o) {
                return '<option value="' + o[0] + '"' + (t.moda === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
              }).join('') + '</select></div>' +
            '<div class="field"><label for="f-jarak">Jarak (km)</label><input id="f-jarak" name="jarakKm" type="number" min="0" step="0.5" inputmode="decimal" value="' + e(t.jarakKm) + '" /></div>' +
            '<div class="field"><label for="f-waktu">Waktu sekali jalan (menit)</label><input id="f-waktu" name="menitSekali" type="number" min="0" step="5" inputmode="numeric" value="' + e(t.menitSekali) + '" /></div>' +
            '<div class="field"><label for="f-biaya-transport">Biaya sekali jalan (Rp)</label><input id="f-biaya-transport" name="biayaSekali" type="number" min="0" step="1000" inputmode="numeric" value="' + e(t.biayaSekali) + '" /></div>' +
            '<div class="field span-2" style="justify-content:flex-end"><label class="check" for="f-sendiri"><input type="checkbox" id="f-sendiri" name="bisaSendiri"' + (t.bisaSendiri ? ' checked' : '') + ' /><span><span class="check-label">Pasien bisa pergi sendiri</span><span class="check-help">Termasuk naik angkutan umum tanpa ditemani.</span></span></label></div>' +
          '</div>' +
        '</div>' +
        '<div class="form-section"><div class="form-section-title">Kemampuan biaya per bulan</div>' +
          '<p class="form-section-help">Pilih kategori, lalu sesuaikan perkiraan nominal bila perlu. Data ini dipakai untuk membandingkan total biaya tugas dan transport.</p>' +
          '<div class="field-grid three">' +
            '<div class="field"><label for="f-kategori-biaya">Kategori kemampuan</label><select id="f-kategori-biaya" name="kategoriBiaya">' +
              Object.keys(RM_CONFIG.kategoriBiaya).map(function (k) {
                return '<option value="' + k + '"' + (ek.kategori === k ? ' selected' : '') + '>' + RM_CONFIG.kategoriBiaya[k].label + ' — ' + F.rupiah(RM_CONFIG.kategoriBiaya[k].nominal) + '</option>';
              }).join('') + '</select></div>' +
            '<div class="field"><label for="f-biaya-bulan">Perkiraan kemampuan (Rp/bulan)</label><input id="f-biaya-bulan" name="biayaBulanan" type="number" min="0" step="50000" inputmode="numeric" value="' + e(ek.biayaBulanan) + '" /></div>' +
            '<div class="field"><label for="f-jaminan">Jaminan kesehatan</label><select id="f-jaminan" name="jaminan">' +
              ['BPJS', 'Asuransi swasta', 'Tidak ada', 'Lainnya'].map(function (j) { return '<option' + (ek.jaminan === j ? ' selected' : '') + '>' + j + '</option>'; }).join('') +
            '</select></div>' +
          '</div>' +
        '</div>';
    }

    if (step === 3) {
      const rm = d.rumah || {};
      const dg = d.digital || {};
      const km = d.komunitas || {};
      const beban = d.bebanAwal || 3;
      return '<h2>Rumah, sarana digital, dan dukungan sekitar</h2>' +
        '<p class="form-intro">Periksa apa yang benar-benar tersedia. Bila ragu, tanyakan cara keluarga menyimpan obat atau menghubungi petugas.</p>' +
        '<div class="form-section"><div class="form-section-title">Kondisi rumah</div>' +
          '<div class="check-grid">' + Object.keys(RM_CONFIG.detailRumah).map(function (k) {
            return '<label class="check" for="f-rumah-' + k + '"><input type="checkbox" id="f-rumah-' + k + '" name="rumah-' + k + '"' + (rm[k] ? ' checked' : '') + ' /><span class="check-label">' + RM_CONFIG.detailRumah[k] + '</span></label>';
          }).join('') + '</div>' +
        '</div>' +
        '<div class="form-section"><div class="form-section-title">Sarana digital</div>' +
          '<p class="form-section-help">Dipakai hanya bila tugas memang bergantung pada pengingat atau pemantauan jarak jauh.</p>' +
          '<div class="check-grid">' + Object.keys(RM_CONFIG.detailDigital).map(function (k) {
            return '<label class="check" for="f-digital-' + k + '"><input type="checkbox" id="f-digital-' + k + '" name="digital-' + k + '"' + (dg[k] ? ' checked' : '') + ' /><span class="check-label">' + RM_CONFIG.detailDigital[k] + '</span></label>';
          }).join('') + '</div>' +
        '</div>' +
        '<div class="form-section"><div class="form-section-title">Dukungan komunitas</div>' +
          '<div class="field-grid">' +
            '<div class="field"><label for="f-puskesmas">Puskesmas / fasilitas terdekat</label><input id="f-puskesmas" name="puskesmas" type="text" value="' + e(km.puskesmas) + '" placeholder="Nama fasilitas" /></div>' +
            '<div class="field" style="justify-content:flex-end"><div class="stack-2">' +
              '<label class="check" for="f-kader"><input type="checkbox" id="f-kader" name="kader"' + (km.kader ? ' checked' : '') + ' /><span class="check-label">Ada kader / perawat wilayah</span></label>' +
              '<label class="check" for="f-tetangga"><input type="checkbox" id="f-tetangga" name="tetangga"' + (km.tetangga ? ' checked' : '') + ' /><span class="check-label">Ada tetangga / keluarga lain yang bisa diminta bantuan</span></label>' +
            '</div></div>' +
          '</div>' +
        '</div>' +
        '<div class="form-section"><div class="form-section-title">Beban keluarga saat ini</div>' +
          '<p class="form-section-help">Penilaian awal sebelum rencana dijalankan, dipakai sebagai pembanding pada hari ke-7 dan ke-30.</p>' +
          '<div class="field"><label for="f-beban">Skor beban (1 = ringan, 5 = sangat berat)</label>' +
            '<div class="range-wrap"><input id="f-beban" name="bebanAwal" type="range" min="1" max="5" step="1" value="' + beban + '" data-range="beban" />' +
            '<span class="range-value" id="beban-value">' + beban + ' / 5</span></div></div>' +
        '</div>';
    }

    const lines = [];
    lines.push('<h2>Tinjau sebelum disimpan</h2>');
    lines.push('<p class="form-intro">Periksa ringkasan berikut bersama keluarga. Setelah disimpan, profil ini menjadi versi bertanggal dan bisa diperbarui lagi nanti.</p>');
    lines.push('<div class="form-section"><div class="form-section-title">Yang akan tercatat</div><div class="kv-list">');
    lines.push('<div class="kv-row"><span class="k">Diisi oleh</span><span class="v">' + e(d.diisiOleh) + ' · ' + (d.sumber === 'keluarga' ? 'keluarga langsung' : 'petugas atas nama keluarga') + '</span></div>');
    lines.push('<div class="kv-row"><span class="k">Persetujuan</span><span class="v">' + (d.consent && d.consent.diberikan ? 'Tercatat' + (d.consent.oleh ? ' · ' + e(d.consent.oleh) : '') : 'Belum dicentang') + '</span></div>');
    lines.push('<div class="kv-row"><span class="k">Pendamping</span><span class="v">' + ((d.pendamping || []).filter(function (c) { return c.nama; }).map(function (c) { return e(c.nama) + ' (' + c.jamPerHari + ' jam/hari)'; }).join(', ') || 'Belum diisi') + '</span></div>');
    lines.push('<div class="kv-row"><span class="k">Transportasi</span><span class="v">' + e(({ motor: 'Motor', angkutan: 'Angkutan umum', mobil: 'Mobil', tidak: 'Tidak ada' })[d.transportasi.moda]) + ' · ' + d.transportasi.menitSekali + ' mnt · ' + F.rupiah(d.transportasi.biayaSekali) + '</span></div>');
    lines.push('<div class="kv-row"><span class="k">Kemampuan biaya</span><span class="v">' + e($cap(d)) + '</span></div>');
    lines.push('<div class="kv-row"><span class="k">Rumah</span><span class="v">' + (['listrik', 'kulkas', 'air', 'ruang'].filter(function (k) { return d.rumah[k]; }).map(function (k) { return RM_CONFIG.detailRumah[k]; }).join(', ') || 'Belum ada yang tercatat') + '</span></div>');
    lines.push('<div class="kv-row"><span class="k">Digital</span><span class="v">' + (['ponsel', 'wa', 'video'].filter(function (k) { return d.digital[k]; }).map(function (k) { return RM_CONFIG.detailDigital[k]; }).join(', ') || 'Tidak ada') + '</span></div>');
    lines.push('<div class="kv-row"><span class="k">Skor beban awal</span><span class="v">' + (d.bebanAwal || 3) + ' / 5</span></div>');
    lines.push('</div></div>');
    lines.push('<div class="notice notice-ok">' + icon('shield') + '<div><strong>Data ini bukan penilaian keluarga.</strong> Temuan akan dipakai untuk mencari dukungan yang sesuai, bukan menyalahkan pendamping.</div></div>');
    return lines.join('');
  }

  function companionForm(c, i) {
    const hari = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    return '<div class="companion-card" data-companion="' + i + '">' +
      '<div class="companion-head"><span class="ttl">Pendamping ' + (i + 1) + '</span>' +
        (i > 0 ? '<button type="button" class="btn btn-ghost btn-sm" data-action="remove-companion" data-index="' + i + '">' + icon('trash') + 'Hapus</button>' : '') + '</div>' +
      '<div class="field-grid three">' +
        '<div class="field"><label for="c-' + i + '-nama">Nama panggilan</label><input id="c-' + i + '-nama" data-c="nama" type="text" value="' + e(c.nama) + '" placeholder="Contoh: Ani" /></div>' +
        '<div class="field"><label for="c-' + i + '-hub">Hubungan</label><select id="c-' + i + '-hub" data-c="hubungan">' +
          ['Istri', 'Suami', 'Anak', 'Orang tua', 'Saudara', 'Tetangga', 'Lainnya'].map(function (x) { return '<option' + (c.hubungan === x ? ' selected' : '') + '>' + x + '</option>'; }).join('') +
        '</select></div>' +
        '<div class="field"><label for="c-' + i + '-jam">Jam tersedia per hari</label><div class="suffix"><input id="c-' + i + '-jam" data-c="jamPerHari" type="number" min="0" max="24" step="0.5" value="' + e(c.jamPerHari) + '" /><span>jam</span></div></div>' +
      '</div>' +
      '<div class="field"><span class="field-label">Hari tersedia</span><div class="od-cluster" style="gap:6px">' +
        hari.map(function (h, di) {
          return '<label class="chip" style="min-height:36px;padding:4px 10px;cursor:pointer"><input type="checkbox" data-c="hari" value="' + di + '"' + ((c.hari || []).includes(di) ? ' checked' : '') + ' style="accent-color:#0E5C4A" /> ' + h + '</label>';
        }).join('') +
      '</div></div>' +
      '<div class="field-grid three">' +
        '<div class="field"><label class="check" for="c-' + i + '-kerja" style="min-height:46px"><input type="checkbox" id="c-' + i + '-kerja" data-c="bekerja"' + (c.bekerja ? ' checked' : '') + ' /><span class="check-label">Sedang bekerja</span></label></div>' +
        '<div class="field"><span class="field-label">Jam kerja (bila bekerja)</span><div class="od-cluster" style="gap:6px">' +
          ['pagi', 'siang', 'malam'].map(function (s) {
            return '<label class="chip" style="min-height:36px;padding:4px 10px;cursor:pointer"><input type="checkbox" data-c="jamKerja" value="' + s + '"' + ((c.jamKerja || []).includes(s) ? ' checked' : '') + ' style="accent-color:#0E5C4A" /> ' + RM_CONFIG.slot[s].label.split(' ')[0] + '</label>';
          }).join('') + '</div></div>' +
        '<div class="field"><label for="c-' + i + '-lit">Literasi baca-tulis</label><select id="c-' + i + '-lit" data-c="literasi">' +
          [['cukup', 'Cukup untuk instruksi tertulis'], ['terbatas', 'Terbatas / lebih nyaman lisan']].map(function (o) { return '<option value="' + o[0] + '"' + (c.literasi === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') +
        '</select></div>' +
      '</div>' +
      '<div class="field"><span class="field-label">Nyaman melakukan</span><div class="od-cluster" style="gap:6px">' +
        Object.keys(RM_CONFIG.kategori).filter(function (k) { return ['obat', 'suntik', 'luka', 'pemantauan', 'latihan'].includes(k); }).map(function (k) {
          return '<label class="chip" style="min-height:36px;padding:4px 10px;cursor:pointer"><input type="checkbox" data-c="keterampilan" value="' + k + '"' + ((c.keterampilan || []).includes(k) ? ' checked' : '') + ' style="accent-color:#0E5C4A" /> ' + RM_CONFIG.kategori[k] + '</label>';
        }).join('') + '</div></div>' +
      '<div class="field"><label for="c-' + i + '-batas">Keterbatasan sendiri (opsional)</label><input id="c-' + i + '-batas" data-c="keterbatasan" type="text" value="' + e(c.keterbatasan) + '" placeholder="Contoh: nyeri lutut, bekerja shift malam" /></div>' +
    '</div>';
  }

  /* =========================================================
     EDITOR TUGAS
     ========================================================= */
  V.tugas = function (id) {
    const p = S.getPasien(id);
    if (!p) return V.notFound('Pasien tidak ditemukan.');
    const tasks = S.tasks(id);
    const form = RM.ui.taskForm;
    const totalMenit = tasks.reduce(function (s, t) { return s + (t.perHari || 0) * (t.menit || 0); }, 0);
    const totalBiaya = tasks.reduce(function (s, t) { return s + (t.biayaBulanan || 0); }, 0);

    return '<section class="page">' +
      '<nav class="breadcrumb"><a href="#/pasien">Pasien</a><span class="sep">/</span><a href="#/pasien/' + id + '">' + e(p.kode) + '</a><span class="sep">/</span><span>Tugas perawatan</span></nav>' +
      '<div class="page-head"><div><p class="eyebrow">' + e(p.kode) + ' · rencana pulang ' + F.tanggal(p.pulang) + '</p><h1>Tugas perawatan</h1>' +
        '<p class="lede">Mulai dari templat, lalu sesuaikan. Verifikasi klinisi tetap diperlukan sebelum tugas dipakai dalam pemetaan.</p></div>' +
        '<div class="page-actions"><a class="btn btn-secondary" href="#/pasien/' + id + '">' + icon('arrowLeft') + 'Kembali</a>' +
        '<a class="btn btn-primary" href="#/pasien/' + id + '/pemetaan">' + icon('layers') + 'Tinjau pemetaan</a></div></div>' +

      '<div class="card">' +
        '<div class="card-head"><div><h2>Input cepat dari templat</h2><p>Ketuk templat untuk menambah tugas, lalu edit bila perlu.</p></div></div>' +
        '<div class="template-rail">' + RM.demo.templates.map(function (tpl) {
          return '<button type="button" class="template-btn" data-action="apply-template" data-id="' + id + '" data-template="' + e(tpl.id) + '"><span class="plus">+</span>' + e(tpl.label) + '</button>';
        }).join('') + '</div>' +
        '<div class="task-summary" style="margin-top:8px"><span><strong>' + tasks.length + '</strong> tugas</span><span><strong>' + F.menit(totalMenit) + '</strong> tuntutan per hari</span><span><strong>' + F.rupiah(totalBiaya) + '</strong> biaya bahan per bulan</span></div>' +
      '</div>' +

      '<div class="card">' +
        '<div class="card-head"><div><h2>Daftar tugas</h2><p>Kritis menurut klinisi. Tandai tugas yang boleh disederhanakan agar opsi penyesuaian relevan.</p></div>' +
          '<button type="button" class="btn btn-secondary btn-sm" data-action="task-new">' + icon('plus') + 'Tulis tugas manual</button></div>' +
        (form ? taskForm(id, form) : '') +
        (tasks.length ? '<div class="task-list" style="margin-top:' + (form ? '20px' : '0') + '">' + tasks.map(function (t) {
          return '<div class="task-item"><div><span class="t-name">' + e(t.nama) + '</span>' +
            '<span class="t-meta">' + e(RM_CONFIG.kategori[t.kategori]) + ' · ' + e(taskFrekuensi(t)) + (t.biayaBulanan ? ' · ' + F.rupiah(t.biayaBulanan) + '/bulan' : '') + '</span>' +
            '<div class="t-badges">' + kritikalBadge(t.kritis) +
              '<span class="badge badge-neutral">' + icon('skill') + RM_CONFIG.keterampilan[t.keterampilan] + '</span>' +
              (t.butuhPendamping ? '<span class="badge badge-neutral">' + icon('users') + 'Butuh pendamping</span>' : '') +
              (t.butuhTransport ? '<span class="badge badge-neutral">' + icon('route') + 'Butuh transport</span>' : '') +
              (t.butuhDigital ? '<span class="badge badge-neutral">' + icon('phone') + RM_CONFIG.detailDigital[t.butuhDigital] + '</span>' : '') +
              (t.bolehDisederhanakan ? '<span class="badge badge-info">Boleh disederhanakan</span>' : '') +
            '</div></div>' +
            '<div class="t-actions"><button type="button" class="icon-btn" data-action="task-edit" data-id="' + id + '" data-task="' + e(t.id) + '" aria-label="Edit ' + e(t.nama) + '">' + icon('edit') + '</button>' +
            '<button type="button" class="icon-btn" data-action="task-delete" data-id="' + id + '" data-task="' + e(t.id) + '" aria-label="Hapus ' + e(t.nama) + '">' + icon('trash') + '</button></div></div>';
        }).join('') + '</div>' : '<div class="empty-state"><div class="empty-icon">' + icon('pill') + '</div><h3>Belum ada tugas</h3><p>Gunakan templat di atas. Input cepat membuat pengisian satu pasien selesai jauh di bawah 15 menit.</p></div>') +
      '</div>' +
    '</section>';
  };

  function taskForm(id, form) {
    const t = form.data || {};
    const editing = !!form.taskId;
    const hari = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    return '<div class="task-form-panel" id="task-form-panel">' +
      '<h3>' + (editing ? 'Edit tugas' : 'Tugas baru') + '</h3>' +
      '<p class="small muted" style="margin-bottom:14px">Isi yang diketahui. Kosongkan biaya bila tidak ada biaya bahan langsung.</p>' +
      (form.error ? '<div class="notice notice-danger" style="margin-bottom:14px"><div class="small" style="font-weight:600">' + e(form.error) + '</div></div>' : '') +
      '<form data-form="task" data-id="' + id + '" data-task="' + (form.taskId || '') + '">' +
        '<div class="field-grid three">' +
          '<div class="field span-2"><label for="tf-nama">Nama tugas <span class="required">*</span></label><input id="tf-nama" name="nama" type="text" value="' + e(t.nama) + '" /></div>' +
          '<div class="field"><label for="tf-kategori">Kategori</label><select id="tf-kategori" name="kategori">' +
            Object.keys(RM_CONFIG.kategori).map(function (k) { return '<option value="' + k + '"' + (t.kategori === k ? ' selected' : '') + '>' + RM_CONFIG.kategori[k] + '</option>'; }).join('') +
          '</select></div>' +
          '<div class="field"><label for="tf-perhari">Frekuensi per hari</label><input id="tf-perhari" name="perHari" type="number" min="0" max="24" step="1" value="' + e(t.perHari) + '" /></div>' +
          '<div class="field"><label for="tf-menit">Menit per kali</label><input id="tf-menit" name="menit" type="number" min="0" step="5" value="' + e(t.menit) + '" /></div>' +
          '<div class="field"><label for="tf-slot">Waktu utama</label><select id="tf-slot" name="slot">' +
            Object.keys(RM_CONFIG.slot).map(function (s) { return '<option value="' + s + '"' + (t.slot === s ? ' selected' : '') + '>' + RM_CONFIG.slot[s].label + '</option>'; }).join('') +
          '</select></div>' +
          '<div class="field"><label for="tf-kontrol">Kontrol per bulan</label><input id="tf-kontrol" name="perBulanKontrol" type="number" min="0" max="12" step="1" value="' + e(t.perBulanKontrol) + '" /><span class="help">Isi bila tugas berupa kunjungan ke fasilitas.</span></div>' +
          '<div class="field"><label for="tf-keterampilan">Keterampilan dibutuhkan</label><select id="tf-keterampilan" name="keterampilan">' +
            Object.keys(RM_CONFIG.keterampilan).map(function (k) { return '<option value="' + k + '"' + (t.keterampilan === k ? ' selected' : '') + '>' + RM_CONFIG.keterampilan[k] + '</option>'; }).join('') +
          '</select></div>' +
          '<div class="field"><label for="tf-biaya">Perkiraan biaya bahan / bulan (Rp)</label><input id="tf-biaya" name="biayaBulanan" type="number" min="0" step="5000" value="' + e(t.biayaBulanan) + '" /></div>' +
          '<div class="field"><label for="tf-kritis">Tingkat kritis (menurut klinisi)</label><select id="tf-kritis" name="kritis">' +
            [['tinggi', 'Tinggi'], ['sedang', 'Sedang'], ['rendah', 'Rendah']].map(function (o) { return '<option value="' + o[0] + '"' + (t.kritis === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') +
          '</select></div>' +
        '</div>' +
        '<div class="field" style="margin-top:14px"><span class="field-label">Hari pelaksanaan</span><div class="od-cluster" style="gap:6px">' +
          hari.map(function (h, di) {
            return '<label class="chip" style="min-height:36px;padding:4px 10px;cursor:pointer"><input type="checkbox" name="hari" value="' + di + '"' + ((t.hari || []).includes(di) ? ' checked' : '') + ' style="accent-color:#0E5C4A" /> ' + h + '</label>';
          }).join('') + '</div></div>' +
        '<div class="check-grid" style="margin-top:14px">' +
          '<label class="check"><input type="checkbox" name="butuhPendamping"' + (t.butuhPendamping ? ' checked' : '') + ' /><span class="check-label">Butuh pendamping saat dilakukan</span></label>' +
          '<label class="check"><input type="checkbox" name="butuhTransport"' + (t.butuhTransport ? ' checked' : '') + ' /><span class="check-label">Butuh transportasi ke fasilitas</span></label>' +
          '<label class="check"><input type="checkbox" name="bolehDisederhanakan"' + (t.bolehDisederhanakan ? ' checked' : '') + ' /><span class="check-label">Boleh disederhanakan (klinisi)</span></label>' +
        '</div>' +
        '<div class="field-grid three" style="margin-top:14px">' +
          '<div class="field"><label for="tf-digital">Ketergantungan digital</label><select id="tf-digital" name="butuhDigital">' +
            '<option value="">Tidak ada</option>' +
            [['ponsel', 'Ponsel'], ['wa', 'WhatsApp'], ['video', 'Video call']].map(function (o) { return '<option value="' + o[0] + '"' + (t.butuhDigital === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') +
          '</select></div>' +
          '<div class="field span-2"><span class="field-label">Syarat rumah</span><div class="od-cluster" style="gap:6px">' +
            Object.keys(RM_CONFIG.detailRumah).map(function (k) {
              return '<label class="chip" style="min-height:36px;padding:4px 10px;cursor:pointer"><input type="checkbox" name="syaratRumah" value="' + k + '"' + ((t.syaratRumah || []).includes(k) ? ' checked' : '') + ' style="accent-color:#0E5C4A" /> ' + RM_CONFIG.detailRumah[k] + '</label>';
            }).join('') + '</div></div>' +
        '</div>' +
        '<div class="field" style="margin-top:14px"><label for="tf-catatan">Catatan (opsional)</label><input id="tf-catatan" name="catatan" type="text" value="' + e(t.catatan) + '" placeholder="Contoh: alat dari puskesmas" /></div>' +
        '<div class="form-actions" style="margin-top:16px"><button type="button" class="btn btn-ghost" data-action="task-cancel">Batal</button>' +
          '<button type="submit" class="btn btn-primary">' + icon('check') + (editing ? 'Simpan perubahan' : 'Tambah tugas') + '</button></div>' +
      '</form></div>';
  }

  /* =========================================================
     PEMETAAN & KEPUTUSAN
     ========================================================= */
  V.pemetaan = function (id) {
    const r = S.hasil(id);
    if (!r) return V.notFound('Pasien tidak ditemukan.');
    const p = r.pasien;
    const cfg = S.state.config;
    const findings = RM.rules.sortFindings(r.effective, r.tasks);
    const openFindings = findings.filter(function (f) {
      const d = RM.rules.statusKeputusan(r.decisions, f.id);
      return !d || d.status === 'tidak_selesai';
    });
    const baselineCount = r.baseline.filter(function (f) { return f.tingkat !== 'sesuai'; }).length;
    const baselineKonflik = r.baseline.filter(function (f) { return f.tingkat === 'konflik'; }).length;
    const baselinePerhatian = baselineCount - baselineKonflik;
    const effectiveCount = findings.length;
    const effectiveKonflik = findings.filter(function (f) { return f.tingkat === 'konflik'; }).length;
    const effectivePerhatian = effectiveCount - effectiveKonflik;
    const deltaKonflik = baselineKonflik - effectiveKonflik;
    const changed = r.decisions.some(function (d) { return d.status === 'sesuaikan' || d.status === 'dukungan'; });
    const canDecide = S.state.role === 'klinisi';
    const feedback = S.feedbackFor(id);

    return '<section class="page">' +
      '<nav class="breadcrumb"><a href="#/pasien">Pasien</a><span class="sep">/</span><a href="#/pasien/' + id + '">' + e(p.kode) + '</a><span class="sep">/</span><span>Pemetaan</span></nav>' +
      '<div class="page-head"><div><p class="eyebrow">' + e(p.kode) + ' · versi profil ' + (r.profile ? r.profile.versi : '—') + ' · ' + F.usiaData(r.profile && r.profile.diperbarui) + '</p>' +
        '<h1>Pemetaan beban &amp; dukungan</h1>' +
        '<p class="lede">Setiap sel membandingkan tuntutan tugas dengan kapasitas yang tercatat. Alasan konflik selalu bisa ditelusuri ke aturan dan angkanya.</p></div>' +
        '<div class="page-actions"><a class="btn btn-secondary" href="#/pasien/' + id + '/kapasitas">Perbarui data</a>' +
        '<a class="btn btn-secondary" href="#/pasien/' + id + '/ringkasan">' + icon('printer') + 'Ringkasan</a></div></div>' +

      (!r.profile ? '<div class="notice notice-warn">' + icon('alert') + '<div><strong>Profil kapasitas belum diisi.</strong> Pemetaan membutuhkan data kapasitas. <a href="#/pasien/' + id + '/kapasitas">Isi sekarang</a>.</div></div>' : '') +

      (changed ? '<div class="compare-strip">' +
        '<div class="compare-cell"><span class="lbl">Sebelum keputusan</span><span class="val">' + baselineCount + '</span><span class="sub">' + baselineKonflik + ' konflik · ' + baselinePerhatian + ' perhatian</span></div>' +
        '<div class="compare-cell"><span class="lbl">Setelah keputusan</span><span class="val">' + effectiveCount + '</span><span class="sub">' + effectiveKonflik + ' konflik · ' + effectivePerhatian + ' perhatian</span></div>' +
        '<div class="compare-cell"><span class="lbl">Konflik mereda</span><span class="val">' + (deltaKonflik > 0 ? '−' + deltaKonflik : (deltaKonflik < 0 ? '+' + Math.abs(deltaKonflik) : '0')) + '</span><span class="sub">perubahan tingkat keparahan setelah opsi disetujui</span></div>' +
      '</div>' : '') +

      (openFindings.length ? '<div class="notice notice-danger">' + icon('x') + '<div><strong>' + openFindings.length + ' temuan belum terselesaikan.</strong> Konflik ini dicatat apa adanya di ringkasan keluarga — tidak disembunyikan. Lihat daftar di bawah untuk keputusan atau alasan tertutupnya.</div></div>' : (r.profile ? '<div class="notice notice-ok">' + icon('check') + '<div><strong>Tidak ada konflik aktif.</strong> Rencana saat ini sesuai dengan kapasitas yang tercatat. Data kapasitas tetap perlu diperbarui bila keadaan berubah.</div></div>' : '')) +

      '<div class="grid-2">' +
        '<div class="card">' +
          '<div class="card-head"><div><h2>Matriks tugas × dimensi</h2><p>Warna selalu disertai ikon dan teks.</p></div></div>' +
          (r.tasks.length && r.profile ? '<div class="matrix-wrap"><table class="matrix"><caption class="sr-only">Matriks tingkat kesesuaian setiap tugas terhadap tujuh dimensi kapasitas</caption><thead><tr><th scope="col">Tugas</th>' +
            cfg.dimensi.map(function (d) { return '<th scope="col">' + e(d.short) + '</th>'; }).join('') + '</tr></thead><tbody>' +
            r.matrix.map(function (row) {
              return '<tr><th scope="row"><span class="task-name">' + e(row.task.nama) + '</span><span class="task-cat">' + e(RM_CONFIG.kategori[row.task.kategori]) + ' · ' + (row.task.kritis === 'tinggi' ? 'kritis tinggi' : 'kritis ' + row.task.kritis) + '</span></th>' +
                cfg.dimensi.map(function (d) {
                  return '<td>' + (row.byDim[d.id] === 'sesuai' ? levelPill('sesuai', true) : levelPill(row.byDim[d.id], true)) + '</td>';
                }).join('') + '</tr>';
            }).join('') + '</tbody></table></div>' +
            '<div class="legend" style="margin-top:12px"><span>Keterangan:</span>' + levelPill('sesuai') + levelPill('perhatian') + levelPill('konflik') + '</div>'
            : '<div class="empty-state" style="padding:28px"><p>' + (r.profile ? 'Tambahkan tugas untuk melihat matriks.' : 'Matriks muncul setelah profil kapasitas dan tugas terisi.') + '</p></div>') +
        '</div>' +

        '<div class="card">' +
          '<div class="card-head"><div><h3>Ringkasan</h3></div></div>' +
          '<div class="kv-list">' +
            '<div class="kv-row"><span class="k">Konflik aktif</span><span class="v ' + (r.ringkas.aktif ? 'is-danger' : '') + '">' + r.ringkas.aktif + '</span></div>' +
            '<div class="kv-row"><span class="k">Tuntas dengan perubahan</span><span class="v">' + r.ringkas.selesai + '</span></div>' +
            '<div class="kv-row"><span class="k">Masih berjalan (dipantau)</span><span class="v">' + (r.ringkas.sebagian || 0) + '</span></div>' +
            '<div class="kv-row"><span class="k">Diterima dengan risiko</span><span class="v">' + r.ringkas.risiko + '</span></div>' +
            '<div class="kv-row"><span class="k">Belum terselesaikan</span><span class="v ' + (r.ringkas.terbuka ? 'is-danger' : '') + '">' + r.ringkas.terbuka + '</span></div>' +
            '<div class="kv-row"><span class="k">Beban rumah tangga</span><span class="v">' + (r.profile ? (r.profile.bebanAwal || 3) + ' / 5 skor awal' : '—') + '</span></div>' +
          '</div>' +
          '<p class="small muted" style="margin-top:12px">Angka “sebelum vs sesudah” hanya berubah bila klinisi menyetujui opsi penyesuaian atau dukungan. Tidak ada perubahan otomatis.</p>' +
          '<div class="notice notice-info" style="margin-top:12px">' + icon('lock') + '<div class="small">' + (canDecide ? 'Anda masuk sebagai klinisi. Keputusan tercatat dengan nama dan tanggal.' : 'Hanya klinisi penanggung jawab yang dapat mencatat keputusan. Ganti peran di kanan atas untuk demo.') + '</div></div>' +
        '</div>' +
      '</div>' +

      '<div class="stack-4">' +
        '<div class="row-between"><h2 style="font-size:26px">Konflik &amp; keputusan</h2><span class="badge badge-neutral">' + findings.length + ' temuan aktif</span></div>' +
        (findings.length ? '<div class="conflict-list">' + findings.map(function (f, i) { return conflictCard(r, f, i, canDecide, cfg); }).join('') + '</div>'
          : '<div class="card"><div class="empty-state"><div class="empty-icon">' + icon('check') + '</div><h3>Tidak ada konflik yang perlu diputuskan</h3><p>' + (r.profile ? 'Semua tuntutan tugas sesuai kapasitas yang tercatat. Tinjau ulang bila kapasitas berubah.' : 'Lengkapi profil kapasitas dan tugas terlebih dahulu.') + '</p></div></div>') +
      '</div>' +

      '<div class="card" id="umpan-balik">' +
        '<div class="card-head"><div><h3>Umpan balik klinisi</h3><p>Satu pertanyaan di akhir tiap pasien. Dipakai untuk menilai apakah alat ini menambah nilai atau hanya formulir tambahan.</p></div></div>' +
        (feedback ? '<div class="decision-saved">' + icon('check') + '<div><strong>Skor ' + feedback.skor + '/5</strong><p class="note">' + e(feedback.catatan || 'Tanpa catatan.') + '</p><p class="by">' + F.tanggal(S.state.meta && feedback.pada ? feedback.pada : F.today()) + '</p></div></div>'
          : (canDecide ? '<form data-form="feedback" data-id="' + id + '" class="decision-form">' +
            '<div class="field"><span class="field-label">Apakah pemetaan ini berguna atau hanya formulir tambahan?</span>' +
            '<div class="scale-group" style="margin-top:6px">' + [1, 2, 3, 4, 5].map(function (n) {
              return '<label class="scale-option"><span class="n"><input type="radio" name="skor" value="' + n + '"' + (n === 4 ? ' checked' : '') + ' required />' + n + '</span><span class="l">' + ({ 1: 'Tidak berguna', 2: 'Sedikit', 3: 'Netral', 4: 'Berguna', 5: 'Sangat berguna' })[n] + '</span></label>';
            }).join('') + '</div></div>' +
            '<div class="field"><label for="fb-catatan">Catatan (opsional)</label><input id="fb-catatan" name="catatan" type="text" placeholder="Apa yang mengubah keputusan Anda?" /></div>' +
            '<div><button class="btn btn-secondary btn-sm" type="submit">Simpan umpan balik</button></div></form>'
            : '<p class="small muted">Umpan balik diisi oleh klinisi setelah tinjauan.</p>')) +
      '</div>' +
    '</section>';
  };

  function conflictCard(r, f, i, canDecide, cfg) {
    const dec = RM.rules.statusKeputusan(r.decisions, f.id);
    const editing = RM.ui.editDecision === f.id || !dec;
    const options = RM.rules.opsiUntuk(f, cfg);
    const kritis = RM.rules.kritisUntuk(f, r.tasks);
    const taskNames = f.taskIds.map(function (tid) {
      const t = r.tasks.find(function (x) { return x.id === tid; });
      return t ? t.nama : null;
    }).filter(Boolean);
    const open = !dec || dec.status === 'tidak_selesai';
    const formId = 'form-' + f.id.replace(/[^A-Za-z0-9]/g, '-');
    const optionsLocked = !canDecide || (dec && !editing);
    const statusLabels = { sesuaikan: 'Rencana disesuaikan', dukungan: 'Dukungan ditambah', risiko: 'Diterima dengan risiko', tidak_selesai: 'Tidak bisa diselesaikan' };
    const statusBadge = !dec ? '' : dec.status === 'risiko' ? '<span class="badge badge-warn">' + icon('alert') + statusLabels[dec.status] + '</span>' : dec.status === 'tidak_selesai' ? '<span class="badge badge-danger">' + icon('x') + statusLabels[dec.status] + '</span>' : '<span class="badge badge-ok">' + icon('check') + statusLabels[dec.status] + '</span>';

    return '<article class="conflict ' + (open ? 'is-open' : '') + '" id="f-' + e(f.id.replace(/[^A-Za-z0-9]/g, '-')) + '">' +
      '<div class="conflict-head"><span class="conflict-rank">' + (i + 1) + '</span>' +
        '<div class="conflict-title"><h3>' + e(f.judul) + '</h3><p class="task-line">' + (taskNames.length ? e(taskNames.join(' · ')) : 'Berlaku untuk keseluruhan rencana') + '</p></div>' +
        '<div class="conflict-badges">' + kritikalBadge(kritis) + levelPill(f.tingkat) + statusBadge + '</div></div>' +
      '<p class="conflict-reason">' + e(f.alasan) + '</p>' +
      '<details class="trace"><summary>Mengapa? Lihat angka &amp; aturan</summary>' +
        '<dl class="trace-grid">' + f.detail.map(function (d) { return '<div><dt>' + e(d.label) + '</dt><dd>' + e(d.value) + '</dd></div>'; }).join('') + '</dl>' +
        '<p class="trace-rule">' + e(f.aturan) + '</p></details>' +

      (options.length ? '<div><p class="field-label" style="margin-bottom:8px">Opsi yang relevan</p><div class="options-grid">' +
        options.map(function (o) {
          return '<label class="option-card"><input type="checkbox" name="opsi" value="' + e(o.id) + '" form="' + formId + '"' + (dec && (dec.opsi || []).includes(o.id) ? ' checked' : '') + (optionsLocked ? ' disabled' : '') + ' />' +
            '<span><span class="opt-label">' + e(o.label) + '</span><span class="opt-desc">' + e(o.deskripsi) + '</span><span class="opt-jenis">' + jenisBadge(o.jenis) + '</span></span></label>';
        }).join('') + '</div><p class="help" style="margin-top:8px">Opsi hanya berlaku bila klinisi menyimpan keputusan. Sistem tidak mengubah terapi.</p></div>'
        : '<p class="help">Belum ada opsi pada katalog untuk dimensi ini. Konflik dapat dicatat sebagai tidak terselesaikan.</p>') +

      '<div class="decision-box">' +
        (dec && !editing ? '<div class="decision-saved">' + icon(dec.status === 'tidak_selesai' ? 'alert' : 'check') + '<div style="flex:1"><strong>' + statusLabels[dec.status] + '</strong>' +
          (dec.opsi && dec.opsi.length ? '<p class="note">' + dec.opsi.map(function (oid) { return e(optionLabel(oid, cfg)); }).join(' · ') + '</p>' : '') +
          (dec.catatan ? '<p class="note">' + e(dec.catatan) + '</p>' : '') +
          '<p class="by">' + e(dec.oleh) + ' · ' + F.tanggal(dec.pada) + '</p></div>' +
          (canDecide ? '<button type="button" class="btn btn-ghost btn-sm" data-action="edit-decision" data-finding="' + e(f.id) + '">Ubah</button>' : '') + '</div>'
        : canDecide ? '<form class="decision-form" id="' + formId + '" data-form="keputusan" data-id="' + r.pasien.id + '" data-finding="' + e(f.id) + '" data-dimensi="' + e(f.dimensi) + '" data-tasks="' + e(f.taskIds.join(',')) + '">' +
          '<div class="field"><span class="field-label">Keputusan klinisi</span><div class="decision-types">' +
            [['sesuaikan', 'Rencana disesuaikan'], ['dukungan', 'Dukungan ditambah'], ['risiko', 'Diterima dengan risiko'], ['tidak_selesai', 'Tidak bisa diselesaikan']].map(function (st) {
              return '<label class="decision-type"><input type="radio" name="status" value="' + st[0] + '"' + (dec && dec.status === st[0] ? ' checked' : (!dec && st[0] === 'dukungan' ? ' checked' : '')) + ' />' + st[1] + '</label>';
            }).join('') + '</div></div>' +
          '<div class="field"><label for="note-' + e(f.id.replace(/[^A-Za-z0-9]/g, '-')) + '">Catatan keputusan <span class="help">(wajib untuk risiko / tidak terselesaikan)</span></label>' +
            '<textarea id="note-' + e(f.id.replace(/[^A-Za-z0-9]/g, '-')) + '" name="catatan" rows="2" placeholder="Contoh: kontrol digabung ke hari Kamis, keluarga sanggup mengantar.">' + e(dec && dec.catatan ? dec.catatan : '') + '</textarea></div>' +
          '<div class="row-between"><p class="small muted">Tercatat oleh ' + (S.state.role === 'klinisi' ? 'dr. Maya Puspita' : '—') + ' · ' + F.tanggal(F.today()) + '</p>' +
            '<button class="btn btn-primary btn-sm" type="submit">' + icon('check') + 'Simpan keputusan</button></div>' +
        '</form>'
        : '<div class="notice notice-info">' + icon('lock') + '<div>Keputusan klinisi hanya dapat dicatat oleh klinisi penanggung jawab. ' + (dec ? 'Keputusan sebelumnya tercatat oleh ' + e(dec.oleh) + '.' : 'Minta klinisi meninjau konflik ini sebelum ringkasan dicetak.') + '</div></div>') +
      '</div>' +
    '</article>';
  }

  /* =========================================================
     RINGKASAN KELUARGA / CETAK
     ========================================================= */
  function sheetBody(r, opts) {
    opts = opts || {};
    const p = r.pasien;
    const cfg = S.state.config;
    const decisions = r.decisions.filter(function (d) { return d.status === 'sesuaikan' || d.status === 'dukungan'; });
    const risks = r.decisions.filter(function (d) { return d.status === 'risiko'; });
    const open = r.effective.filter(function (f) {
      const d = RM.rules.statusKeputusan(r.decisions, f.id);
      return f.tingkat !== 'sesuai' && (!d || d.status === 'tidak_selesai');
    });
    const tasks = r.tasks;
    const limited = !!opts.limited;

    const supportItems = decisions.map(function (d) {
      return '<li><strong>' + e(d.opsi && d.opsi.length ? d.opsi.map(function (o) { return optionLabel(o, cfg); }).join(' + ') : 'Keputusan klinisi') + '</strong>' +
        (d.catatan ? ' — ' + e(d.catatan) : '') + '</li>';
    }).join('');
    const riskItems = risks.map(function (d) {
      return '<li><strong>Diterima dengan risiko:</strong> ' + e(d.catatan || 'Dicatat oleh klinisi.') + '</li>';
    }).join('');
    const openItems = open.map(function (f) {
      return '<li><strong>' + e(f.judul) + '</strong> — ' + e(f.alasan) + ' <em>Belum ada solusi yang disepakati; akan dibicarakan dengan tim.</em></li>';
    }).join('');

    return '<div class="sheet-brand">' +
        '<div><div class="name">RencanaMampu</div><div class="small muted">Rencana perawatan di rumah</div></div>' +
        '<div class="meta">' + e(S.state.layanan) + '<br />Dicetak ' + F.tanggal(F.today()) + '<br />Kode ' + e(p.kode) + '</div>' +
      '</div>' +
      '<div><h1>Rencana perawatan di rumah</h1>' +
        '<p style="margin-top:8px">Disusun bersama keluarga sebelum pulang. Bahasa dibuat sederhana agar bisa dibaca bersama.</p></div>' +
      '<dl class="sheet-meta-grid">' +
        '<div><dt>Pasien</dt><dd>' + e(p.kode) + ' · ' + p.usia + ' tahun</dd></div>' +
        '<div><dt>' + (F.selisihHari(p.pulang) > 0 ? 'Pulang' : 'Rencana pulang') + '</dt><dd>' + F.hariTanggal(p.pulang) + '</dd></div>' +
        '<div><dt>Profil kapasitas</dt><dd>versi ' + (r.profile ? r.profile.versi : '—') + ' · ' + F.tanggal(r.profile && r.profile.diperbarui) + '</dd></div>' +
      '</dl>' +

      '<section class="sheet-section"><h2>Yang perlu dilakukan di rumah</h2>' +
        (tasks.length ? '<div class="sheet-table-wrap"><table class="sheet-table"><thead><tr><th>Tugas</th><th>Berapa sering</th><th>Siapa yang membantu</th></tr></thead><tbody>' +
          tasks.map(function (t) {
            return '<tr><td><strong>' + e(t.nama) + '</strong></td><td>' + e(taskFrekuensi(t)) + '</td><td>' + (t.butuhPendamping ? 'Pendamping keluarga' : 'Pasien dapat mandiri') + (t.keterampilan === 'terlatih' ? ' — perlu yang sudah dilatih' : '') + '</td></tr>';
          }).join('') + '</tbody></table></div>'
          : '<p>Belum ada tugas yang dicatat.</p>') +
        '<p class="small muted" style="margin-top:8px">Jadwal rinci dan dosis obat tetap mengikuti instruksi tertulis dari fasilitas kesehatan.</p>' +
      '</section>' +

      '<section class="sheet-section"><h2>Dukungan yang sudah disepakati</h2>' +
        (supportItems || riskItems ? '<ul style="display:flex;flex-direction:column;gap:8px;list-style:disc;padding-left:20px">' + supportItems + riskItems + '</ul>'
          : '<p>Belum ada dukungan tambahan yang disepakati. Bila diperlukan, bicarakan dengan perawat atau dokter sebelum pulang.</p>') +
      '</section>' +

      '<section class="sheet-section"><h2>Yang masih perlu dibicarakan</h2>' +
        (openItems ? '<ul style="display:flex;flex-direction:column;gap:8px;list-style:disc;padding-left:20px">' + openItems + '</ul>' +
          '<p style="margin-top:8px">Bagian ini sengaja dicantumkan agar keluarga tahu apa yang belum beres. Silakan tanyakan saat kontrol atau hubungi fasilitas.</p>'
          : '<p>Semua temuan sudah dibicarakan dan diputuskan bersama klinisi.</p>') +
        (r.freshness.status === 'kedaluwarsa' ? '<p style="margin-top:8px"><strong>Catatan:</strong> data kapasitas keluarga sudah berumur ' + r.freshness.hari + ' hari. Keadaan bisa berubah — beri tahu petugas bila ada perubahan.</p>' : '') +
      '</section>' +

      '<section class="sheet-section"><h2>Bila rencana tidak berjalan</h2>' +
        '<p>Catat kendala yang muncul (waktu, transportasi, biaya, atau pendamping), lalu sampaikan saat kontrol, melalui petugas, atau ke ' + e((r.profile && r.profile.komunitas && r.profile.komunitas.puskesmas) || 'fasilitas kesehatan terdekat') + '.</p>' +
        '<p style="margin-top:6px"><strong>Jangan mengubah dosis atau jadwal obat sendiri.</strong> Perubahan rencana dilakukan oleh klinisi.</p>' +
      '</section>' +

      '<div class="sheet-sign"><div>Disusun oleh perencana pemulangan / klinisi</div><div>Diterima oleh pasien / keluarga</div></div>' +
      '<p class="family-note">Dokumen ini alat bantu perencanaan, bukan instruksi terapi. RencanaMampu tidak menyarankan dosis atau mengganti terapi. Data sosial-ekonomi bersifat sensitif; simpan hanya untuk keperluan perawatan. Prototipe ini memakai data fiktif.</p>' +
      (limited ? '<p class="family-note">Tautan keluarga ini hanya menampilkan ringkasan. Data kapasitas terperinci tidak dibuka lewat tautan.</p>' : '');
  }

  V.ringkasan = function (id) {
    const r = S.hasil(id);
    if (!r) return V.notFound('Pasien tidak ditemukan.');
    if (!r.profile) return V.notFound('Lengkapi profil kapasitas sebelum mencetak ringkasan.', '#/pasien/' + id);
    return '<section class="page">' +
      '<div class="page-head no-print"><div><p class="eyebrow">Ringkasan satu halaman</p><h1>Untuk keluarga</h1>' +
        '<p class="lede">Cetak atau simpan sebagai PDF melalui dialog cetak peramban. Isi mengikuti keputusan yang sudah tersimpan.</p></div>' +
        '<div class="page-actions"><a class="btn btn-secondary" href="#/pasien/' + id + '/pemetaan">' + icon('arrowLeft') + 'Kembali ke pemetaan</a>' +
        '<button class="btn btn-primary" data-action="print">' + icon('printer') + 'Cetak / Simpan PDF</button></div></div>' +
      '<article class="family-sheet print-area">' + sheetBody(r) + '</article>' +
    '</section>';
  };

  V.keluarga = function (token) {
    const res = S.familyByToken(token);
    if (!res.valid) {
      return '<section class="page"><div class="card"><div class="empty-state"><div class="empty-icon">' + icon('lock') + '</div><h2>Tautan tidak dapat dibuka</h2><p>' + e(res.reason) + ' Minta tautan baru kepada petugas perencana pemulangan.</p><a class="btn btn-secondary" href="#/pasien">Kembali</a></div></div></section>';
    }
    const r = S.hasil(res.link.pasienId);
    if (!r) return V.notFound('Data tidak ditemukan.');
    return '<section class="page"><div class="page-head no-print"><div><p class="eyebrow">Akses keluarga terbatas</p><h1>Ringkasan perawatan</h1>' +
      '<p class="lede">Tautan ini hanya menampilkan ringkasan. Berlaku sampai ' + F.tanggal(res.link.kedaluwarsa) + ' dan tidak membuka data kapasitas terperinci.</p></div>' +
      '<div class="page-actions"><button class="btn btn-primary" data-action="print">' + icon('printer') + 'Cetak / Simpan PDF</button></div></div>' +
      '<article class="family-sheet print-area">' + sheetBody(r, { limited: true }) + '</article></section>';
  };

  /* =========================================================
     TINDAK LANJUT
     ========================================================= */
  V.tindakLanjut = function (id) {
    const r = S.hasil(id);
    if (!r) return V.notFound('Pasien tidak ditemukan.');
    const p = r.pasien;
    const hari = RM.ui.followDay === 30 ? 30 : 7;
    const fu = hari === 7 ? r.fu7 : r.fu30;
    const baseline = r.profile ? r.profile.bebanAwal : null;
    const checked = fu ? (fu.tugasDijalankan || []) : [];

    return '<section class="page">' +
      '<nav class="breadcrumb"><a href="#/pasien">Pasien</a><span class="sep">/</span><a href="#/pasien/' + id + '">' + e(p.kode) + '</a><span class="sep">/</span><span>Tindak lanjut</span></nav>' +
      '<div class="page-head"><div><p class="eyebrow">' + e(p.kode) + ' · evaluasi pascapulang</p><h1>Tindak lanjut</h1>' +
        '<p class="lede">Bandingkan rencana dengan kenyataan di rumah. Isian ini tidak mengubah terapi; perubahan tetap diputuskan klinisi.</p></div>' +
        '<div class="page-actions"><a class="btn btn-secondary" href="#/pasien/' + id + '">' + icon('arrowLeft') + 'Kembali</a></div></div>' +

      '<div class="segmented" role="group" aria-label="Pilih hari tindak lanjut">' +
        [7, 30].map(function (d) {
          return '<button type="button" data-action="follow-day" data-day="' + d + '" aria-pressed="' + (hari === d) + '">Hari ke-' + d + '</button>';
        }).join('') + '</div>' +

      (fu ? '<div class="notice notice-ok">' + icon('check') + '<div><strong>Tercatat ' + F.tanggal(fu.tanggal) + '.</strong> Skor beban ' + fu.beban + '/5' + (baseline ? ' (awal ' + baseline + '/5)' : '') + ' · ' + (fu.tugasDijalankan || []).length + ' dari ' + fu.tugasTotal + ' tugas dijalankan' + (fu.rawatUlang ? ' · ada rawat ulang tak terencana' : '') + '. Anda dapat memperbarui isian di bawah.</div></div>' : '') +

      '<div class="card">' +
        '<div class="card-head"><div><h2>' + (fu ? 'Perbarui isian hari ke-' + hari : 'Isian hari ke-' + hari) + '</h2><p>' + (hari === 7 ? 'Seminggu setelah pulang.' : 'Sebulan setelah pulang.') + ' Jawab berdasarkan yang benar-benar terjadi.</p></div></div>' +
        '<form data-form="tindaklanjut" data-id="' + id + '" data-hari="' + hari + '" class="stack-4">' +
          '<div class="form-section"><div class="form-section-title">Tugas yang benar-benar dijalankan</div>' +
            '<p class="form-section-help">Centang tugas yang benar-benar berjalan minimal sebagian besar waktu. Jangan menilai keluarga — catat kenyataannya.</p>' +
            '<div class="stack-2">' + (r.tasks.length ? r.tasks.map(function (t) {
              return '<label class="followup-task"><input type="checkbox" name="tugas" value="' + e(t.id) + '"' + (checked.includes(t.id) ? ' checked' : '') + ' />' +
                '<span><strong>' + e(t.nama) + '</strong><span class="small muted" style="display:block">' + e(taskFrekuensi(t)) + '</span></span></label>';
            }).join('') : '<p class="small muted">Belum ada tugas yang tercatat.</p>') + '</div>' +
          '</div>' +
          '<div class="field"><label for="fu-kendala">Kendala nyata yang muncul</label>' +
            '<textarea id="fu-kendala" name="kendala" rows="3" placeholder="Contoh: transportasi sulit saat hujan; pendamping bekerja shift.">' + e(fu ? fu.kendala : '') + '</textarea></div>' +
          '<div class="field"><span class="field-label">Skor beban keluarga saat ini (1 ringan – 5 sangat berat)</span>' +
            '<div class="scale-group" style="margin-top:6px">' + [1, 2, 3, 4, 5].map(function (n) {
              return '<label class="scale-option"><span class="n"><input type="radio" name="beban" value="' + n + '" required' + ((fu ? fu.beban : (baseline || 3)) === n ? ' checked' : '') + ' />' + n + '</span><span class="l">' + ({ 1: 'Ringan', 2: 'Agak ringan', 3: 'Sedang', 4: 'Berat', 5: 'Sangat berat' })[n] + '</span></label>';
            }).join('') + '</div>' +
            (baseline ? '<span class="help">Pembanding skor awal: ' + baseline + '/5.</span>' : '') + '</div>' +
          '<div class="field"><span class="field-label">Apakah ada kunjungan / rawat ulang tak terencana?</span>' +
            '<div class="decision-types" style="margin-top:6px">' +
              '<label class="decision-type"><input type="radio" name="rawatUlang" value="tidak" required' + (fu && !fu.rawatUlang ? ' checked' : '') + ' />Tidak ada</label>' +
              '<label class="decision-type"><input type="radio" name="rawatUlang" value="ya" required' + (fu && fu.rawatUlang ? ' checked' : '') + ' />Ada</label>' +
            '</div></div>' +
          '<div class="field"><label for="fu-catatan">Catatan lain</label><input id="fu-catatan" name="catatan" type="text" value="' + e(fu ? fu.catatan : '') + '" placeholder="Opsional" /></div>' +
          '<div class="row-between"><p class="small muted">Diisi oleh ' + (S.state.role === 'klinisi' ? 'dr. Maya Puspita' : 'Ns. Rina Kusuma') + ' · ' + F.tanggal(F.today()) + '</p>' +
            '<button class="btn btn-primary" type="submit">' + icon('check') + 'Simpan tindak lanjut</button></div>' +
        '</form>' +
      '</div>' +

      '<div class="card card-tint"><div class="card-head"><div><h3>Riwayat</h3></div></div><div class="mini-list">' +
        [7, 30].map(function (d) {
          const rec = d === 7 ? r.fu7 : r.fu30;
          return '<div class="mini-item">' + icon(rec ? 'check' : 'clock') + '<div style="flex:1"><span class="t">Hari ke-' + d + '</span><span class="d">' + (rec ? F.tanggal(rec.tanggal) + ' · beban ' + rec.beban + '/5 · ' + (rec.tugasDijalankan || []).length + '/' + rec.tugasTotal + ' tugas' : 'Belum diisi') + '</span></div></div>';
        }).join('') + '</div></div>' +
    '</section>';
  };

  /* =========================================================
     DASBOR
     ========================================================= */
  V.dasbor = function () {
    const st = S.stats();
    const dims = RM_CONFIG.dimensi;
    const maxDim = Math.max.apply(null, Object.values(st.byDimensi).concat([1]));
    const rowsWithFu = st.rows.filter(function (r) { return r.profile && (r.fu7 || r.fu30); });
    const unresolved = st.rows.reduce(function (acc, r) {
      r.decisions.filter(function (d) { return d.status === 'tidak_selesai'; }).forEach(function (d) {
        acc.push({ pasien: r.pasien.kode, dimensi: d.dimensi, catatan: d.catatan });
      });
      return acc;
    }, []);
    const feedback = S.state.meta.umpanBalik;
    const profileTimes = Object.values(S.state.meta.durasiProfilMenit);
    const perPatient = st.rows.slice().sort(function (a, b) { return b.ringkas.terbuka - a.ringkas.terbuka; });

    return '<section class="page">' +
      '<div class="page-head"><div><p class="eyebrow">Evaluasi · ' + st.totalPasien + ' keluarga</p><h1>Dasbor layanan</h1>' +
        '<p class="lede">Angka di bawah menggambarkan data demo, bukan bukti efektivitas. Dengan 10 keluarga, gunakan untuk pembelajaran dan perbaikan alur.</p></div>' +
        '<div class="page-actions"><a class="btn btn-secondary" href="#/pasien">' + icon('users') + 'Daftar pasien</a></div></div>' +

      '<div class="grid-4">' +
        '<div class="card kpi-card"><span class="kpi-num">' + st.findings + '</span><span class="kpi-label">Konflik &amp; perhatian terdeteksi</span><span class="kpi-note">' + st.konflik + ' konflik · ' + st.perhatian + ' perhatian</span></div>' +
        '<div class="card kpi-card"><span class="kpi-num">' + st.persenPerubahan + '%</span><span class="kpi-label">Berujung perubahan layanan</span><span class="kpi-note">' + st.changed + ' keputusan penyesuaian / dukungan dari ' + st.findings + ' temuan terdeteksi</span></div>' +
        '<div class="card kpi-card"><span class="kpi-num">' + st.persenTidakSelesai + '%</span><span class="kpi-label">Tidak bisa diselesaikan</span><span class="kpi-note">' + st.terbuka + ' temuan terbuka, dicatat apa adanya</span></div>' +
        '<div class="card kpi-card"><span class="kpi-num">' + st.avgProfil + '<small style="font-size:14px"> mnt</small></span><span class="kpi-label">Rerata waktu isi profil</span><span class="kpi-note">Target: satu pasien selesai &lt; 15 menit · tinjauan ' + st.avgTinjau + ' mnt</span></div>' +
      '</div>' +

      '<div class="grid-2">' +
        '<div class="card">' +
          '<div class="card-head"><div><h2>Konflik per dimensi</h2><p>Total temuan aktif setelah keputusan yang tersimpan.</p></div></div>' +
          '<div class="bar-list">' + dims.map(function (d) {
            const n = st.byDimensi[d.id];
            return '<div class="bar-row"><span>' + e(d.label) + '</span><span class="bar-track"><span class="bar-fill' + (d.id === 'biaya' || d.id === 'transportasi' ? ' is-warn' : '') + '" style="width:' + (n / maxDim * 100) + '%"></span></span><span class="bar-num">' + n + '</span></div>';
          }).join('') + '</div>' +
          '<p class="small muted" style="margin-top:14px">Beban kumulatif dihitung terpisah sebagai peringatan, bukan konflik per tugas.</p>' +
        '</div>' +

        '<div class="card">' +
          '<div class="card-head"><div><h2>Beban keluarga sebelum vs sesudah</h2><p>Skor 1–5 dari keluarga. Pembanding awal diambil saat profil diisi.</p></div></div>' +
          (rowsWithFu.length ? '<div class="burden-grid">' + rowsWithFu.slice(0, 4).map(function (r) {
            const base = r.profile.bebanAwal || 3;
            const fu7 = r.fu7 ? r.fu7.beban : null;
            const fu30 = r.fu30 ? r.fu30.beban : null;
            return '<div class="burden-card"><span class="name">' + e(r.pasien.kode) + '</span>' +
              '<div class="scores">' +
                burdenCol('Awal', base) + burdenCol('Hari 7', fu7) + burdenCol('Hari 30', fu30) +
              '</div></div>';
          }).join('') + '</div>' : '<p class="small muted">Belum ada tindak lanjut yang terisi.</p>') +
          '<div class="kv-list" style="margin-top:14px"><div class="kv-row"><span class="k">Tugas dijalankan pada tindak lanjut</span><span class="v">' + st.fu.persen + '% <span class="small muted">(' + st.fu.dijalankan + '/' + st.fu.total + ')</span></span></div>' +
          '<div class="kv-row"><span class="k">Tindak lanjut tercatat</span><span class="v">' + st.fu.selesai + ' isian</span></div></div>' +
        '</div>' +
      '</div>' +

      '<div class="grid-2">' +
        '<div class="card">' +
          '<div class="card-head"><div><h2>Mengapa tidak terselesaikan</h2><p>Alasan dicatat manual oleh klinisi.</p></div></div>' +
          (unresolved.length ? '<div class="mini-list">' + unresolved.map(function (u) {
            return '<div class="mini-item">' + icon('alert') + '<div><span class="t">' + e(u.pasien) + ' · ' + e((RM_CONFIG.dimensi.find(function (d) { return d.id === u.dimensi; }) || {}).label || (u.dimensi === 'beban' ? 'Beban kumulatif' : u.dimensi)) + '</span><span class="d">' + e(u.catatan || 'Tanpa catatan alasan.') + '</span></div></div>';
          }).join('') + '</div>' : '<p class="small muted">Tidak ada konflik yang tercatat sebagai tidak terselesaikan.</p>') +
          '<p class="small muted" style="margin-top:12px">Konflik terbuka yang belum diputuskan: <strong>' + st.terbuka + '</strong>.</p>' +
        '</div>' +

        '<div class="card">' +
          '<div class="card-head"><div><h2>Umpan balik klinisi</h2><p>“Apakah ini berguna atau hanya formulir tambahan?”</p></div></div>' +
          '<div class="row" style="gap:16px;align-items:baseline"><span class="kpi-num">' + (st.avgFeedback || '—') + '<small style="font-size:13px">/5</small></span><span class="small muted">dari ' + st.feedbackCount + ' tinjauan</span></div>' +
          '<div class="mini-list" style="margin-top:10px">' + (feedback.length ? feedback.map(function (f) {
            return '<div class="mini-item">' + icon('info') + '<div><span class="t">' + e(f.pasienId) + ' · skor ' + f.skor + '/5</span><span class="d">' + e(f.catatan || 'Tanpa catatan.') + '</span></div></div>';
          }).join('') : '<p class="small muted">Belum ada umpan balik.</p>') + '</div>' +
          '<p class="small muted" style="margin-top:12px">Rerata waktu tinjauan klinisi: ' + st.avgTinjau + ' menit. Waktu pengisian profil tersimpan otomatis saat formulir disimpan.</p>' +
        '</div>' +
      '</div>' +

      '<div class="card">' +
        '<div class="card-head"><div><h2>Ringkasan per pasien</h2><p>Klik kode untuk membuka pemetaan.</p></div></div>' +
        '<div class="matrix-wrap"><table class="matrix"><thead><tr><th scope="col">Pasien</th><th scope="col">Tugas</th><th scope="col">Konflik aktif</th><th scope="col">Terbuka</th><th scope="col">Data</th><th scope="col">Tindak lanjut</th></tr></thead><tbody>' +
          perPatient.map(function (r) {
            return '<tr><th scope="row"><a href="#/pasien/' + r.pasien.id + '" style="text-decoration:none"><span class="task-name">' + e(r.pasien.kode) + '</span><span class="task-cat">' + e(pulangText(r.pasien)) + '</span></a></th>' +
              '<td>' + r.tasks.length + '</td><td>' + r.ringkas.aktif + '</td><td>' + r.ringkas.terbuka + '</td>' +
              '<td>' + (r.profile ? e(r.freshness.teks) : 'belum ada') + '</td>' +
              '<td>' + (r.fu7 || r.fu30 ? 'hari 7' + (r.fu30 ? ' & 30' : '') : '—') + '</td></tr>';
          }).join('') + '</tbody></table></div>' +
        '<p class="small muted" style="margin-top:12px">Rerata waktu isi profil dihitung dari ' + profileTimes.length + ' formulir yang tersimpan pada sesi demo ini.</p>' +
      '</div>' +
    '</section>';
  };

  function burdenCol(label, value) {
    const v = value || 0;
    return '<div class="burden-col"><span class="n">' + (value || '—') + '</span><span class="burden-bar"><span style="height:' + (v / 5 * 100) + '%"></span></span><span class="cap">' + label + '</span></div>';
  }

  /* =========================================================
     PENGATURAN
     ========================================================= */
  V.pengaturan = function () {
    const cfg = S.state.config;
    const canEdit = S.state.role === 'admin';
    const audits = S.state.audit.slice(0, 24);

    return '<section class="page">' +
      '<div class="page-head"><div><p class="eyebrow">Konfigurasi layanan</p><h1>Pengaturan</h1>' +
        '<p class="lede">Ambang dan katalog opsi berada di satu tempat agar bisa ditinjau bersama tim layanan. Perubahan berlaku untuk semua pemetaan.</p></div>' +
        '<div class="page-actions"><span class="badge badge-neutral">' + icon('lock') + (canEdit ? 'Anda dapat mengubah' : 'Hanya admin layanan') + '</span></div></div>' +

      (!canEdit ? '<div class="notice notice-info">' + icon('info') + '<div>Anda dapat melihat konfigurasi. Untuk mengubah ambang, masuk sebagai <strong>Admin layanan</strong> melalui menu peran di kanan atas (mode demo).</div></div>' : '') +

      '<div class="settings-grid">' +
        '<div class="stack-4">' +
          '<form class="card" data-form="pengaturan">' +
            '<div class="card-head"><div><h2>Ambang deteksi</h2><p>Nilai ini dipakai mesin aturan deterministik. Setiap konflik menampilkan nilai aktual dibandingkan ambang.</p></div></div>' +
            '<div class="field-grid">' +
              '<div class="field"><label for="set-layanan">Nama layanan</label><input id="set-layanan" name="layanan" type="text" value="' + e(cfg.layanan) + '"' + (canEdit ? '' : ' disabled') + ' /></div>' +
              '<div class="field"><label for="set-fresh">Batas usia data (hari)</label><input id="set-fresh" name="hariKedaluwarsaData" type="number" min="1" max="90" value="' + e(cfg.hariKedaluwarsaData) + '"' + (canEdit ? '' : ' disabled') + ' /></div>' +
            '</div>' +
            '<div class="form-section"><div class="form-section-title">Ambang per dimensi</div>' +
              Object.keys(cfg.ambang).map(function (key) {
                const meta = cfg.labelAmbang[key];
                if (!meta) return '';
                return '<div class="threshold-row"><div><div class="th-label">' + e(meta.label) + '</div><div class="th-help">' + e(meta.bantuan) + '</div></div>' +
                  '<div class="field"><label class="sr-only" for="amb-' + key + '">' + e(meta.label) + '</label><input id="amb-' + key + '" name="ambang-' + key + '" type="number" min="' + meta.min + '" max="' + meta.max + '" step="' + meta.step + '" value="' + e(cfg.ambang[key]) + '"' + (canEdit ? '' : ' disabled') + ' /></div>' +
                  '<span class="unit">' + e(meta.satuan) + '</span></div>';
              }).join('') +
            '</div>' +
            (canEdit ? '<div class="form-actions" style="margin-top:18px"><span class="small muted">Tersimpan lokal untuk demo.</span><button class="btn btn-primary" type="submit">' + icon('check') + 'Simpan pengaturan</button></div>' : '') +
          '</form>' +

          '<div class="card">' +
            '<div class="card-head"><div><h2>Katalog opsi</h2><p>Nonaktifkan opsi yang tidak tersedia di layanan Anda. Konflik tanpa opsi tetap dicatat jujur.</p></div></div>' +
            (cfg.katalog || []).map(function (o, i) {
              return '<div class="catalog-item"><div><div class="c-name">' + e(o.label) + '</div><div class="c-desc">' + e(o.deskripsi) + '</div>' +
                '<div class="c-badges">' + jenisBadge(o.jenis) + (o.dimensi || []).map(function (d) {
                  const dim = RM_CONFIG.dimensi.find(function (x) { return x.id === d; });
                  return '<span class="badge badge-neutral">' + e(dim ? dim.short : (d === 'beban' ? 'Beban' : d)) + '</span>';
                }).join('') + '</div></div>' +
                '<label class="switch"><input type="checkbox" data-action="toggle-opsi" data-opsi="' + e(o.id) + '"' + (o.aktif === false ? '' : ' checked') + (canEdit ? '' : ' disabled') + ' /><span>' + (o.aktif === false ? 'Nonaktif' : 'Aktif') + '</span></label></div>';
            }).join('') +
          '</div>' +
        '</div>' +

        '<div class="stack-4">' +
          '<div class="card card-tint">' +
            '<div class="card-head"><h3>Privasi &amp; persetujuan</h3></div>' +
            '<p class="small">Data kesehatan dan sosial-ekonomi termasuk data sensitif menurut UU PDP No. 27/2022. Prototipe ini menyimpan data di peramban, belum memiliki autentikasi server, enkripsi tersimpan, atau penghapusan terpusat.</p>' +
            '<ul class="stack-2 small" style="margin-top:10px;list-style:disc;padding-left:18px">' +
              '<li>Consent dicatat per profil kapasitas, dengan nama dan tanggal.</li>' +
              '<li>Setiap perubahan dan akses halaman pasien masuk log audit.</li>' +
              '<li>Tautan keluarga berkedaluwarsa dan hanya menampilkan ringkasan.</li>' +
              '<li>Data demo sepenuhnya fiktif.</li>' +
            '</ul>' +
            '<p class="small" style="margin-top:12px"><a href="docs/privasi.md">Baca catatan privasi &amp; kepatuhan</a> · <a href="docs/schema.sql">Skema data</a></p>' +
          '</div>' +

          '<div class="card">' +
            '<div class="card-head"><div><h3>Log audit</h3><p>' + S.state.audit.length + ' entri · disimpan lokal</p></div></div>' +
            '<div class="audit-wrap"><table class="audit-table"><thead><tr><th>Waktu</th><th>Aktor</th><th>Aksi</th><th>Target</th></tr></thead><tbody>' +
              audits.map(function (a) {
                return '<tr><td>' + e(a.pada.replace('T', ' ')) + '</td><td>' + e(a.aktor) + '<br /><span class="muted">' + e(a.peran) + '</span></td><td>' + e(a.aksi) + '</td><td>' + e(a.target) + '</td></tr>';
              }).join('') + '</tbody></table></div>' +
          '</div>' +

          '<div class="card">' +
            '<div class="card-head"><h3>Kontrol data demo</h3></div>' +
            '<p class="small muted">Mengatur ulang akan menghapus perubahan lokal dan memuat kembali 10 keluarga fiktif. Tindakan ini tidak dapat dibatalkan.</p>' +
            '<button class="btn btn-danger btn-sm" style="margin-top:12px" data-action="reset-demo"' + (canEdit ? '' : ' disabled') + '>' + icon('refresh') + 'Atur ulang data demo</button>' +
            '<p class="small muted" style="margin-top:10px">Penyimpanan: ' + (S.persisted ? 'localStorage aktif' : 'gagal — data hanya bertahan selama tab terbuka') + '.</p>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>';
  };

  V.notFound = function (message, href) {
    return '<section class="page"><div class="card"><div class="empty-state"><div class="empty-icon">' + icon('info') + '</div><h2>Tidak ditemukan</h2><p>' + e(message || 'Halaman tidak tersedia.') + '</p>' +
      '<a class="btn btn-secondary" href="' + (href || '#/pasien') + '">Kembali</a></div></div></section>';
  };

  RM.viewHelpers = { icon: icon, e: e, levelPill: levelPill, freshClass: freshClass };
})();
