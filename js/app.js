/* RencanaMampu — router dan interaksi.
   Semua aksi ditangani lewat delegasi peristiwa; tidak ada framework. */
(function () {
  const RM = window.RM;
  const S = RM.store;
  const F = RM.fmt;
  const V = RM.views;

  let toastTimer = null;

  function clone(v) { return JSON.parse(JSON.stringify(v)); }

  function toast(message, isError) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = message;
    el.hidden = false;
    el.classList.toggle('is-error', !!isError);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 4200);
  }

  function parseRoute() {
    const raw = location.hash.replace(/^#\/?/, '');
    const seg = raw.split('/').filter(Boolean);
    if (!seg.length || seg[0] === 'pasien' && seg.length === 1) return { kind: 'daftar', section: 'pasien', key: 'daftar' };
    if (seg[0] === 'dasbor') return { kind: 'dasbor', section: 'dasbor', key: 'dasbor' };
    if (seg[0] === 'pengaturan') return { kind: 'pengaturan', section: 'pengaturan', key: 'pengaturan' };
    if (seg[0] === 'keluarga' && seg[1]) return { kind: 'keluarga', token: decodeURIComponent(seg[1]), key: 'keluarga:' + seg[1] };
    if (seg[0] === 'pasien' && seg[1]) {
      const id = decodeURIComponent(seg[1]);
      const sub = seg[2] || '';
      return { kind: sub || 'pasien', pasienId: id, section: 'pasien', key: 'pasien:' + id + ':' + sub };
    }
    return { kind: 'unknown', key: 'unknown' };
  }

  function render() {
    const r = parseRoute();
    const app = document.getElementById('app');
    let html = '';
    try {
      if (r.kind === 'daftar') html = V.daftar();
      else if (r.kind === 'dasbor') html = V.dasbor();
      else if (r.kind === 'pengaturan') html = V.pengaturan();
      else if (r.kind === 'keluarga') html = V.keluarga(r.token);
      else if (r.pasienId) {
        if (!S.getPasien(r.pasienId)) html = V.notFound('Pasien tidak ditemukan.');
        else if (r.kind === 'pasien') html = V.pasien(r.pasienId);
        else if (r.kind === 'kapasitas') html = V.kapasitas(r.pasienId, RM.ui.formStep);
        else if (r.kind === 'tugas') html = V.tugas(r.pasienId);
        else if (r.kind === 'pemetaan') html = V.pemetaan(r.pasienId);
        else if (r.kind === 'ringkasan') html = V.ringkasan(r.pasienId);
        else if (r.kind === 'tindak-lanjut') html = V.tindakLanjut(r.pasienId);
        else html = V.notFound('Halaman tidak tersedia.');
      } else html = V.notFound('Halaman tidak tersedia.');
    } catch (err) {
      html = '<section class="page"><div class="card"><div class="empty-state"><div class="empty-icon">!</div><h2>Terjadi kesalahan tampilan</h2><p>' +
        'Muat ulang halaman. Data yang sudah tersimpan tetap aman di peramban ini.</p><button class="btn btn-secondary" data-action="reload">Muat ulang</button></div></div></section>';
      if (window.console) console.error(err);
    }
    app.innerHTML = html;
    document.body.classList.toggle('family-mode', r.kind === 'keluarga');
    setNav(r.section);
    setTitle(r);
    syncRole();
    const chip = document.getElementById('service-chip');
    if (chip) chip.textContent = S.state.layanan;
    if (RM.ui.scrollTask) {
      const panel = document.getElementById('task-form-panel');
      if (panel) panel.scrollIntoView({ block: 'center' });
      RM.ui.scrollTask = false;
    }
  }

  function go() {
    const r = parseRoute();
    const isNew = r.key !== RM.ui.lastKey;
    if (isNew) {
      RM.ui.lastKey = r.key;
      if (r.pasienId && r.kind !== 'keluarga') {
        const p = S.getPasien(r.pasienId);
        if (p) S.audit('Membuka data pasien', p.kode + ' · ' + r.kind);
      }
      if (r.kind === 'kapasitas' && RM.ui.draftId !== r.pasienId) {
        const existing = S.profile(r.pasienId);
        RM.ui.draft = existing ? clone(existing) : null;
        RM.ui.draftId = r.pasienId;
        RM.ui.formStep = 0;
        RM.ui.formErrors = [];
      }
      if (r.kind === 'kapasitas') {
        RM.ui.formStart = Date.now();
      }
      if (r.kind === 'keluarga') {
        S.audit('Membuka ringkasan keluarga', 'tautan terbatas · ' + (r.token || ''));
      }
      if (r.kind === 'pemetaan') {
        RM.ui.reviewStart = Date.now();
        RM.ui.editDecision = null;
      }
      if (r.kind === 'tugas') {
        RM.ui.taskForm = null;
      }
      if (r.kind !== 'kapasitas' && r.kind !== 'pasien') {
        RM.ui.formErrors = [];
      }
      render();
      window.scrollTo({ top: 0, behavior: 'auto' });
    } else {
      render();
    }
  }

  function setNav(section) {
    document.querySelectorAll('[data-nav]').forEach(function (a) {
      if (a.dataset.nav === section) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  function setTitle(r) {
    const titles = {
      daftar: 'Pasien', dasbor: 'Dasbor', pengaturan: 'Pengaturan',
      kapasitas: 'Profil kapasitas', tugas: 'Tugas perawatan', pemetaan: 'Pemetaan',
      ringkasan: 'Ringkasan keluarga', 'tindak-lanjut': 'Tindak lanjut', keluarga: 'Ringkasan keluarga'
    };
    const p = r.pasienId ? S.getPasien(r.pasienId) : null;
    document.title = (p ? p.kode + ' · ' : '') + (titles[r.kind] || 'RencanaMampu') + ' — RencanaMampu';
  }

  function syncRole() {
    const sel = document.getElementById('role-select');
    if (sel && sel.value !== S.state.role) sel.value = S.state.role;
  }

  /* ---------------- kapasitas ---------------- */
  function defaultTask() {
    return {
      nama: '', kategori: 'obat', perHari: 1, menit: 10, hari: [0, 1, 2, 3, 4, 5, 6], slot: 'pagi',
      keterampilan: 'dasar', butuhPendamping: false, butuhTransport: false, perBulanKontrol: 0,
      biayaBulanan: 0, syaratRumah: [], butuhDigital: '', kritis: 'sedang', bolehDisederhanakan: true, catatan: ''
    };
  }

  function readCapacity(form) {
    const d = RM.ui.draft || {};
    const fd = new FormData(form);
    if (form.querySelector('[name="consent"]')) {
      d.sumber = fd.get('sumber') || 'petugas';
      d.diisiOleh = String(fd.get('diisiOleh') || '').trim();
      d.consent = {
        diberikan: !!form.querySelector('[name="consent"]').checked,
        oleh: String(fd.get('consentOleh') || '').trim(),
        pada: d.consent && d.consent.diberikan ? (d.consent.pada || F.today()) : F.today(),
        cakupan: (d.consent && d.consent.cakupan) || 'Data kapasitas keluarga untuk perencanaan pulang; dapat dihapus atas permintaan.'
      };
    }
    const rows = form.querySelectorAll('[data-companion]');
    if (rows.length) {
      d.pendamping = Array.from(rows).map(function (row) {
        const get = function (k) { return row.querySelector('[data-c="' + k + '"]'); };
        const vals = function (k) {
          return Array.from(row.querySelectorAll('[data-c="' + k + '"]:checked')).map(function (x) {
            return k === 'hari' ? Number(x.value) : x.value;
          });
        };
        return {
          nama: get('nama') ? get('nama').value.trim() : '',
          hubungan: get('hubungan') ? get('hubungan').value : 'Lainnya',
          jamPerHari: Number((get('jamPerHari') || {}).value) || 0,
          hari: vals('hari'),
          bekerja: !!(get('bekerja') && get('bekerja').checked),
          jamKerja: vals('jamKerja'),
          keterbatasan: get('keterbatasan') ? get('keterbatasan').value.trim() : '',
          literasi: get('literasi') ? get('literasi').value : 'cukup',
          keterampilan: vals('keterampilan')
        };
      }).filter(function (c) { return c.nama || c.jamPerHari > 0 || c.keterampilan.length; });
    }
    if (form.querySelector('[name="moda"]')) {
      d.transportasi = {
        moda: fd.get('moda') || 'tidak',
        jarakKm: Number(fd.get('jarakKm')) || 0,
        menitSekali: Number(fd.get('menitSekali')) || 0,
        biayaSekali: Number(fd.get('biayaSekali')) || 0,
        bisaSendiri: !!form.querySelector('[name="bisaSendiri"]').checked
      };
      d.ekonomi = {
        kategori: fd.get('kategoriBiaya') || 'terbatas',
        biayaBulanan: Number(fd.get('biayaBulanan')) || 0,
        jaminan: fd.get('jaminan') || 'BPJS'
      };
    }
    if (form.querySelector('[name="rumah-listrik"]')) {
      d.rumah = {
        listrik: !!form.querySelector('[name="rumah-listrik"]').checked,
        kulkas: !!form.querySelector('[name="rumah-kulkas"]').checked,
        air: !!form.querySelector('[name="rumah-air"]').checked,
        ruang: !!form.querySelector('[name="rumah-ruang"]').checked
      };
      d.digital = {
        ponsel: !!form.querySelector('[name="digital-ponsel"]').checked,
        wa: !!form.querySelector('[name="digital-wa"]').checked,
        video: !!form.querySelector('[name="digital-video"]').checked
      };
      d.komunitas = {
        kader: !!form.querySelector('[name="kader"]').checked,
        puskesmas: String(fd.get('puskesmas') || '').trim(),
        tetangga: !!form.querySelector('[name="tetangga"]').checked
      };
      d.bebanAwal = Number(fd.get('bebanAwal')) || 3;
    }
    return d;
  }

  function validateCapacity(d, step) {
    const errs = [];
    if (step === 0) {
      if (!d.diisiOleh) errs.push('Nama pengisi wajib diisi.');
      if (!(d.consent && d.consent.diberikan)) errs.push('Persetujuan keluarga perlu dicentang sebelum data disimpan.');
    }
    if (step === 1) {
      (d.pendamping || []).forEach(function (c) {
        if (c.jamPerHari < 0 || c.jamPerHari > 24) errs.push('Jam pendamping harus antara 0 dan 24 jam.');
      });
    }
    if (step === 2) {
      if (!(d.transportasi && d.transportasi.menitSekali > 0)) errs.push('Waktu tempuh sekali jalan perlu lebih dari 0 menit.');
      if (!(d.ekonomi && d.ekonomi.biayaBulanan > 0)) errs.push('Perkiraan kemampuan biaya per bulan perlu diisi.');
    }
    return errs;
  }

  function handleCapacity(action, btn, form) {
    const id = form.dataset.id;
    let d;
    try {
      d = readCapacity(form);
      RM.ui.draft = d;
    } catch (err) {
      toast('Tidak dapat membaca isian. Coba lagi.', true);
      return;
    }
    RM.ui.formErrors = [];
    if (action === 'form-prev') {
      RM.ui.formStep = Math.max(0, Number(btn.dataset.step) - 1);
      render();
      return;
    }
    if (action === 'form-next') {
      const errs = validateCapacity(d, RM.ui.formStep);
      if (errs.length) { RM.ui.formErrors = errs; render(); toast(errs[0], true); return; }
      RM.ui.formStep = Math.min(4, Number(btn.dataset.step) + 1);
      render();
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }
    const isDraft = action === 'form-save-draft';
    const errs = validateCapacity(d, RM.ui.formStep);
    if (isDraft) {
      const consentErr = validateCapacity(d, 0);
      if (consentErr.length) { RM.ui.formErrors = consentErr; render(); toast(consentErr[0], true); return; }
    } else if (errs.length) {
      RM.ui.formErrors = errs; render(); toast(errs[0], true); return;
    }
    const menit = RM.ui.formStart ? Math.round(((Date.now() - RM.ui.formStart) / 60000) * 10) / 10 : 0;
    S.saveProfile(id, d, { partial: isDraft, menit: menit, consentOleh: d.consent && d.consent.oleh });
    RM.ui.draft = null;
    RM.ui.draftId = null;
    RM.ui.formStep = 0;
    RM.ui.formStart = null;
    toast(isDraft ? 'Draf kapasitas tersimpan. Bisa dilanjutkan kapan saja.' : 'Profil kapasitas tersimpan sebagai versi baru.');
    location.hash = isDraft ? '#/pasien/' + id : '#/pasien/' + id + '/pemetaan';
  }

  /* ---------------- tugas ---------------- */
  function collectTask(form) {
    const fd = new FormData(form);
    const t = {
      nama: String(fd.get('nama') || '').trim(),
      kategori: fd.get('kategori') || 'obat',
      perHari: Number(fd.get('perHari')) || 0,
      menit: Number(fd.get('menit')) || 0,
      slot: fd.get('slot') || 'pagi',
      hari: fd.getAll('hari').map(Number),
      keterampilan: fd.get('keterampilan') || 'dasar',
      butuhPendamping: !!form.querySelector('[name="butuhPendamping"]').checked,
      butuhTransport: !!form.querySelector('[name="butuhTransport"]').checked,
      perBulanKontrol: Number(fd.get('perBulanKontrol')) || 0,
      biayaBulanan: Number(fd.get('biayaBulanan')) || 0,
      syaratRumah: fd.getAll('syaratRumah'),
      butuhDigital: fd.get('butuhDigital') || null,
      kritis: fd.get('kritis') || 'sedang',
      bolehDisederhanakan: !!form.querySelector('[name="bolehDisederhanakan"]').checked,
      catatan: String(fd.get('catatan') || '').trim()
    };
    return t;
  }

  function handleTaskSubmit(form) {
    const id = form.dataset.id;
    const taskId = form.dataset.task;
    const t = collectTask(form);
    if (!t.nama) { RM.ui.taskForm.error = 'Nama tugas wajib diisi.'; RM.ui.scrollTask = true; render(); return; }
    if (t.perHari > 0 && t.menit <= 0) { RM.ui.taskForm.error = 'Isi menit per kali untuk tugas harian.'; RM.ui.scrollTask = true; render(); return; }
    if (t.perHari === 0 && t.perBulanKontrol === 0) { RM.ui.taskForm.error = 'Isi frekuensi harian atau jumlah kontrol per bulan.'; RM.ui.scrollTask = true; render(); return; }
    const tasks = S.tasks(id).slice();
    if (taskId) {
      const idx = tasks.findIndex(function (x) { return x.id === taskId; });
      if (idx >= 0) tasks[idx] = Object.assign({ id: taskId }, t);
    } else {
      tasks.push(Object.assign({ id: id + '-t' + Date.now().toString(36) }, t));
    }
    S.saveTasks(id, tasks);
    RM.ui.taskForm = null;
    toast(taskId ? 'Tugas diperbarui.' : 'Tugas ditambahkan. Pemetaan dihitung ulang saat dibuka.');
    render();
  }

  /* ---------------- keputusan ---------------- */
  function handleDecision(form) {
    const id = form.dataset.id;
    const findingId = form.dataset.finding;
    const fd = new FormData(form);
    const status = fd.get('status');
    const opsi = fd.getAll('opsi');
    const catatan = String(fd.get('catatan') || '').trim();
    if (!status) { toast('Pilih jenis keputusan terlebih dahulu.', true); return; }
    if ((status === 'sesuaikan' || status === 'dukungan') && !opsi.length) {
      toast('Pilih minimal satu opsi penyesuaian atau dukungan.', true); return;
    }
    if ((status === 'risiko' || status === 'tidak_selesai') && catatan.length < 4) {
      toast('Catatan alasan wajib diisi untuk keputusan ini.', true); return;
    }
    const menit = RM.ui.reviewStart ? Math.round(((Date.now() - RM.ui.reviewStart) / 60000) * 10) / 10 : 0;
    S.saveDecision(id, {
      findingId: findingId,
      dimensi: form.dataset.dimensi,
      taskIds: (form.dataset.tasks || '').split(',').filter(Boolean),
      status: status,
      opsi: opsi,
      catatan: catatan,
      menitTinjau: menit > 0 ? menit : null
    });
    RM.ui.editDecision = null;
    toast('Keputusan tersimpan. Pemetaan dihitung ulang.');
    render();
  }

  /* ---------------- tindak lanjut ---------------- */
  function handleFollowUp(form) {
    const id = form.dataset.id;
    const hari = Number(form.dataset.hari);
    const fd = new FormData(form);
    const beban = Number(fd.get('beban'));
    const rawat = fd.get('rawatUlang');
    if (!beban) { toast('Pilih skor beban keluarga.', true); return; }
    if (!rawat) { toast('Pilih status rawat ulang.', true); return; }
    S.saveFollowUp(id, {
      hari: hari,
      tugasDijalankan: fd.getAll('tugas'),
      tugasTotal: S.tasks(id).length,
      kendala: String(fd.get('kendala') || '').trim(),
      beban: beban,
      rawatUlang: rawat === 'ya',
      catatan: String(fd.get('catatan') || '').trim()
    });
    toast('Tindak lanjut hari ke-' + hari + ' tersimpan.');
    render();
  }

  /* ---------------- pengaturan ---------------- */
  function handleSettings(form) {
    const fd = new FormData(form);
    const cfg = clone(S.state.config);
    cfg.layanan = String(fd.get('layanan') || cfg.layanan).trim() || cfg.layanan;
    const fresh = Number(fd.get('hariKedaluwarsaData'));
    if (fresh >= 1 && fresh <= 90) cfg.hariKedaluwarsaData = fresh;
    Object.keys(cfg.ambang).forEach(function (key) {
      const meta = cfg.labelAmbang[key] || {};
      const val = Number(fd.get('ambang-' + key));
      if (Number.isFinite(val)) cfg.ambang[key] = Math.min(meta.max || 9999, Math.max(meta.min || 0, val));
    });
    S.saveConfig(cfg);
    toast('Pengaturan layanan disimpan.');
    render();
  }

  /* ---------------- tautan keluarga ---------------- */
  function copyFamilyLink(id) {
    const link = S.createFamilyLink(id);
    const url = location.href.split('#')[0] + '#/keluarga/' + link.token;
    const done = function () {
      toast('Tautan keluarga dibuat dan disalin. Berlaku sampai ' + F.tanggal(link.kedaluwarsa) + '.');
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(done).catch(function () {
        window.prompt('Salin tautan keluarga (berlaku sampai ' + F.tanggal(link.kedaluwarsa) + '):', url);
        render();
      });
    } else {
      window.prompt('Salin tautan keluarga (berlaku sampai ' + F.tanggal(link.kedaluwarsa) + '):', url);
      render();
    }
  }

  /* ---------------- event delegation ---------------- */
  function onClick(ev) {
    const btn = ev.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const form = btn.closest('form[data-form]');

    if (action === 'filter') {
      RM.ui.filter = btn.dataset.filter;
      render();
      return;
    }
    if (action === 'reset-filter') {
      RM.ui.filter = 'semua';
      RM.ui.q = '';
      render();
      return;
    }
    if (action === 'print') { window.print(); return; }
    if (action === 'reload') { location.reload(); return; }
    if (action === 'copy-family-link') { copyFamilyLink(btn.dataset.id); return; }
    if (action === 'edit-decision') { RM.ui.editDecision = btn.dataset.finding; render(); return; }

    if (action === 'add-companion') {
      const d = readCapacity(form);
      d.pendamping = d.pendamping || [];
      d.pendamping.push({ nama: '', hubungan: 'Anak', jamPerHari: 2, hari: [0, 1, 2, 3, 4, 5, 6], bekerja: false, jamKerja: [], keterbatasan: '', literasi: 'cukup', keterampilan: [] });
      RM.ui.draft = d;
      render();
      return;
    }
    if (action === 'remove-companion') {
      const d = readCapacity(form);
      d.pendamping.splice(Number(btn.dataset.index), 1);
      RM.ui.draft = d;
      render();
      return;
    }
    if (action === 'form-prev' || action === 'form-next' || action === 'form-save-draft' || action === 'form-save-final') {
      handleCapacity(action, btn, form);
      return;
    }
    if (action === 'apply-template') {
      const id = btn.dataset.id;
      const tpl = RM.demo.templates.find(function (t) { return t.id === btn.dataset.template; });
      if (!tpl) return;
      const tasks = S.tasks(id).slice();
      tasks.push(Object.assign(defaultTask(), clone(tpl.data), { id: id + '-t' + Date.now().toString(36), catatan: '' }));
      S.saveTasks(id, tasks);
      toast('“' + tpl.label + '” ditambahkan. Sesuaikan bila perlu.');
      render();
      return;
    }
    if (action === 'task-new') {
      RM.ui.taskForm = { mode: 'new', data: defaultTask(), error: '' };
      RM.ui.scrollTask = true;
      render();
      return;
    }
    if (action === 'task-edit') {
      const t = S.tasks(btn.dataset.id).find(function (x) { return x.id === btn.dataset.task; });
      if (!t) return;
      RM.ui.taskForm = { mode: 'edit', taskId: t.id, data: clone(t), error: '' };
      RM.ui.scrollTask = true;
      render();
      return;
    }
    if (action === 'task-delete') {
      if (!window.confirm('Hapus tugas ini? Pemetaan akan dihitung ulang.')) return;
      const id = btn.dataset.id;
      S.saveTasks(id, S.tasks(id).filter(function (x) { return x.id !== btn.dataset.task; }));
      RM.ui.taskForm = null;
      toast('Tugas dihapus.');
      render();
      return;
    }
    if (action === 'task-cancel') {
      RM.ui.taskForm = null;
      render();
      return;
    }
    if (action === 'follow-day') {
      RM.ui.followDay = Number(btn.dataset.day);
      render();
      return;
    }
    if (action === 'reset-demo') {
      if (!window.confirm('Atur ulang semua data demo? Perubahan lokal akan hilang.')) return;
      S.reset();
      RM.ui.lastKey = null;
      RM.ui.draft = null;
      RM.ui.draftId = null;
      location.hash = '#/pasien';
      go();
      toast('Data demo dimuat ulang.');
      return;
    }
  }

  function onSubmit(ev) {
    const form = ev.target.closest('form[data-form]');
    if (!form) return;
    ev.preventDefault();
    const kind = form.dataset.form;
    if (kind === 'cari') {
      RM.ui.q = String(new FormData(form).get('q') || '').trim();
      render();
      return;
    }
    if (kind === 'kapasitas') {
      const action = RM.ui.formStep >= 4 ? 'form-save-final' : 'form-next';
      handleCapacity(action, { dataset: { step: String(RM.ui.formStep) } }, form);
      return;
    }
    if (kind === 'task') { handleTaskSubmit(form); return; }
    if (kind === 'keputusan') { handleDecision(form); return; }
    if (kind === 'tindaklanjut') { handleFollowUp(form); return; }
    if (kind === 'pengaturan') { handleSettings(form); return; }
    if (kind === 'feedback') {
      const id = form.dataset.id;
      const fd = new FormData(form);
      const skor = Number(fd.get('skor'));
      if (!skor) { toast('Pilih skor terlebih dahulu.', true); return; }
      S.addFeedback(id, skor, String(fd.get('catatan') || '').trim());
      toast('Umpan balik tersimpan. Terima kasih.');
      render();
      return;
    }
  }

  function onChange(ev) {
    const t = ev.target;
    if (t.id === 'role-select') {
      S.setRole(t.value);
      RM.ui.lastKey = null;
      render();
      return;
    }
    if (t.dataset && t.dataset.action === 'toggle-opsi') {
      if (S.state.role !== 'admin') { toast('Hanya admin layanan yang dapat mengubah katalog.', true); render(); return; }
      const o = S.state.config.katalog.find(function (x) { return x.id === t.dataset.opsi; });
      if (!o) return;
      o.aktif = t.checked;
      S.saveConfig(S.state.config);
      toast(t.checked ? 'Opsi diaktifkan.' : 'Opsi dinonaktifkan. Konflik terkait tetap dicatat.');
      render();
      return;
    }
    if (t.id === 'f-kategori-biaya') {
      const kat = window.RM_CONFIG.kategoriBiaya[t.value];
      const input = document.getElementById('f-biaya-bulan');
      if (kat && input) input.value = kat.nominal;
      return;
    }
  }

  function onInput(ev) {
    if (ev.target.dataset && ev.target.dataset.range === 'beban') {
      const out = document.getElementById('beban-value');
      if (out) out.textContent = ev.target.value + ' / 5';
    }
  }

  function init() {
    S.init();
    RM.ui = {
      filter: 'semua', q: '', formStep: 0, draft: null, draftId: null, formErrors: [],
      formStart: null, taskForm: null, editDecision: null, followDay: 7,
      reviewStart: null, lastKey: null, scrollTask: false
    };
    const role = document.getElementById('role-select');
    if (role) role.value = S.state.role;
    if (!location.hash) {
      try { history.replaceState(null, '', '#/pasien'); } catch (err) { location.hash = '#/pasien'; }
    }
    const skip = document.querySelector('.skip-link');
    if (skip) skip.addEventListener('click', function (ev) {
      ev.preventDefault();
      const main = document.getElementById('main');
      if (main) main.focus();
    });
    document.addEventListener('click', onClick);
    document.addEventListener('submit', onSubmit);
    document.addEventListener('change', onChange);
    document.addEventListener('input', onInput);
    window.addEventListener('hashchange', go);
    go();
    if (!S.persisted) toast('Penyimpanan lokal tidak tersedia. Data hanya bertahan selama tab terbuka.', true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
