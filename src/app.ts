/* RencanaMampu — router dan interaksi.
   Semua aksi ditangani lewat delegasi peristiwa; tidak ada framework. */
import { demo } from './data';
import { RM_CONFIG } from './config';
import { fmt as F } from './rules';
import { store as S } from './store';
import { ui } from './ui';
import * as V from './views';
import type { AmbangMeta, DecisionStatus, Profile, Role, TaskInput } from './types';

interface Route { kind: string; key: string; section?: string; token?: string; pasienId?: string }

const ROLES: Role[] = ['perencana', 'klinisi', 'admin'];
const isRole = (v: unknown): v is Role => ROLES.includes(v as Role);

let toastTimer: ReturnType<typeof setTimeout> | undefined;
let enterTimer: ReturnType<typeof setTimeout> | undefined;

function clone<T>(v: T): T { return JSON.parse(JSON.stringify(v)); }

// Nilai teks dari FormData; kosong atau tidak ada → fallback.
function str(fd: FormData, name: string, fallback = ''): string {
  const v = fd.get(name);
  return typeof v === 'string' && v ? v : fallback;
}
function checked(root: ParentNode, name: string): boolean {
  return !!root.querySelector<HTMLInputElement>('[name="' + name + '"]')?.checked;
}
// Atribut data-* yang dibaca di sini selalu dirender oleh views.ts.
function data(el: { dataset: DOMStringMap }): Record<string, string> {
  return el.dataset as Record<string, string>;
}

function toast(message: string, isError?: boolean) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
  el.classList.toggle('is-error', !!isError);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { el.hidden = true; }, 4200);
}

function parseRoute(): Route {
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
  const app = document.getElementById('app')!;
  let html = '';
  try {
    if (r.kind === 'daftar') html = V.daftar();
    else if (r.kind === 'dasbor') html = V.dasbor();
    else if (r.kind === 'pengaturan') html = V.pengaturan();
    else if (r.kind === 'keluarga') html = V.keluarga(r.token ?? '');
    else if (r.pasienId) {
      if (!S.getPasien(r.pasienId)) html = V.notFound('Pasien tidak ditemukan.');
      else if (r.kind === 'pasien') html = V.pasien(r.pasienId);
      else if (r.kind === 'kapasitas') html = V.kapasitas(r.pasienId, ui.formStep);
      else if (r.kind === 'tugas') html = V.tugas(r.pasienId);
      else if (r.kind === 'pemetaan') html = V.pemetaan(r.pasienId);
      else if (r.kind === 'ringkasan') html = V.ringkasan(r.pasienId);
      else if (r.kind === 'tindak-lanjut') html = V.tindakLanjut(r.pasienId);
      else html = V.notFound('Halaman tidak tersedia.');
    } else html = V.notFound('Halaman tidak tersedia.');
  } catch (err) {
    html = '<section class="page"><div class="card"><div class="empty-state"><div class="empty-icon">!</div><h1>Terjadi kesalahan tampilan</h1><p>' +
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
  if (ui.scrollTask) {
    const panel = document.getElementById('task-form-panel');
    if (panel) panel.scrollIntoView({ block: 'center' });
    ui.scrollTask = false;
  }
}

function go() {
  const r = parseRoute();
  const isNew = r.key !== ui.lastKey;
  if (isNew) {
    ui.lastKey = r.key;
    if (r.pasienId && r.kind !== 'keluarga') {
      const p = S.getPasien(r.pasienId);
      if (p) S.audit('Membuka data pasien', p.kode + ' · ' + r.kind);
    }
    if (r.kind === 'kapasitas' && ui.draftId !== r.pasienId) {
      const existing = S.profile(r.pasienId ?? '');
      ui.draft = existing ? clone(existing) : null;
      ui.draftId = r.pasienId ?? null;
      ui.formStep = 0;
      ui.formErrors = [];
    }
    if (r.kind === 'kapasitas') {
      ui.formStart = Date.now();
    }
    if (r.kind === 'keluarga') {
      S.audit('Membuka ringkasan keluarga', 'tautan terbatas · ' + String(r.token || '').slice(0, 10) + '…');
    }
    if (r.kind === 'pemetaan') {
      ui.reviewStart = Date.now();
      ui.editDecision = null;
    }
    if (r.kind === 'tugas') {
      ui.taskForm = null;
    }
    if (r.kind !== 'kapasitas' && r.kind !== 'pasien') {
      ui.formErrors = [];
    }
    render();
    window.scrollTo({ top: 0, behavior: 'auto' });
    enterRoute();
  } else {
    render();
  }
}

// Gerak masuk hanya saat pindah halaman; render ulang di halaman yang sama (filter, simpan) tidak berkedip.
function enterRoute() {
  const app = document.getElementById('app')!;
  app.classList.add('route-enter');
  clearTimeout(enterTimer);
  enterTimer = setTimeout(function () { app.classList.remove('route-enter'); }, 1200);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // aria-busy: pembaca layar menunda pengumuman live region selama angka berjalan.
  app.setAttribute('aria-busy', 'true');
  setTimeout(function () { app.removeAttribute('aria-busy'); }, 800);
  app.querySelectorAll<HTMLElement>('.stat-value, .kpi-num').forEach(function (el) {
    const node = el.firstChild;
    const m = node && node.nodeType === 3 ? /^(\d+(?:\.\d+)?)(.*)$/.exec(node.textContent || '') : null;
    if (!node || !m) return;
    const end = Number(m[1]);
    const dec = (m[1].split('.')[1] || '').length;
    const t0 = performance.now();
    const step = function (now: number) {
      const k = Math.min(1, (now - t0) / 700);
      node.textContent = (end * (1 - Math.pow(1 - k, 3))).toFixed(dec) + m[2];
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

function setNav(section?: string) {
  document.querySelectorAll<HTMLElement>('[data-nav]').forEach(function (a) {
    if (a.dataset.nav === section) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}

function setTitle(r: Route) {
  const titles: Record<string, string> = {
    daftar: 'Pasien', dasbor: 'Dasbor', pengaturan: 'Pengaturan',
    kapasitas: 'Profil kapasitas', tugas: 'Tugas perawatan', pemetaan: 'Pemetaan',
    ringkasan: 'Ringkasan keluarga', 'tindak-lanjut': 'Tindak lanjut', keluarga: 'Ringkasan keluarga'
  };
  const p = r.pasienId ? S.getPasien(r.pasienId) : null;
  document.title = (p ? p.kode + ' · ' : '') + (titles[r.kind] || 'RencanaMampu') + ' — RencanaMampu';
}

function syncRole() {
  const sel = document.getElementById('role-select') as HTMLSelectElement | null;
  if (sel && sel.value !== S.state.role) sel.value = S.state.role;
}

/* ---------------- kapasitas ---------------- */
function defaultTask(): TaskInput {
  return {
    nama: '', kategori: 'obat', perHari: 1, menit: 10, hari: [0, 1, 2, 3, 4, 5, 6], slot: 'pagi',
    keterampilan: 'dasar', butuhPendamping: false, butuhTransport: false, perBulanKontrol: 0,
    biayaBulanan: 0, syaratRumah: [], butuhDigital: '', kritis: 'sedang', bolehDisederhanakan: true, catatan: ''
  };
}

function readCapacity(form: HTMLFormElement): Profile {
  // views.kapasitas() selalu membuat draf sebelum formulir dirender.
  const d: Profile = ui.draft ?? ({} as Profile);
  const fd = new FormData(form);
  if (form.querySelector('[name="consent"]')) {
    d.sumber = str(fd, 'sumber', 'petugas');
    d.diisiOleh = str(fd, 'diisiOleh').trim();
    d.consent = {
      diberikan: checked(form, 'consent'),
      oleh: str(fd, 'consentOleh').trim(),
      pada: d.consent && d.consent.diberikan ? (d.consent.pada || F.today()) : F.today(),
      cakupan: (d.consent && d.consent.cakupan) || 'Data kapasitas keluarga untuk perencanaan pulang; dapat dihapus atas permintaan.'
    };
  }
  const rows = form.querySelectorAll('[data-companion]');
  if (rows.length) {
    d.pendamping = Array.from(rows).map(function (row) {
      // <select> juga punya .value; tipe HTMLInputElement cukup untuk yang dibaca di sini.
      const get = function (k: string) { return row.querySelector<HTMLInputElement>('[data-c="' + k + '"]'); };
      const vals = function (k: string) {
        return Array.from(row.querySelectorAll<HTMLInputElement>('[data-c="' + k + '"]:checked'), function (x) { return x.value; });
      };
      return {
        nama: get('nama')?.value.trim() ?? '',
        hubungan: get('hubungan')?.value ?? 'Lainnya',
        jamPerHari: Number(get('jamPerHari')?.value) || 0,
        hari: vals('hari').map(Number),
        bekerja: !!get('bekerja')?.checked,
        jamKerja: vals('jamKerja'),
        keterbatasan: get('keterbatasan')?.value.trim() ?? '',
        literasi: get('literasi')?.value ?? 'cukup',
        keterampilan: vals('keterampilan')
      };
    }).filter(function (c) { return c.nama || c.jamPerHari > 0 || c.keterampilan.length; });
  }
  if (form.querySelector('[name="moda"]')) {
    d.transportasi = {
      moda: str(fd, 'moda', 'tidak'),
      jarakKm: Number(fd.get('jarakKm')) || 0,
      menitSekali: Number(fd.get('menitSekali')) || 0,
      biayaSekali: Number(fd.get('biayaSekali')) || 0,
      bisaSendiri: checked(form, 'bisaSendiri')
    };
    d.ekonomi = {
      kategori: str(fd, 'kategoriBiaya', 'terbatas'),
      biayaBulanan: Number(fd.get('biayaBulanan')) || 0,
      jaminan: str(fd, 'jaminan', 'BPJS')
    };
  }
  if (form.querySelector('[name="rumah-listrik"]')) {
    d.rumah = {
      listrik: checked(form, 'rumah-listrik'),
      kulkas: checked(form, 'rumah-kulkas'),
      air: checked(form, 'rumah-air'),
      ruang: checked(form, 'rumah-ruang')
    };
    d.digital = {
      ponsel: checked(form, 'digital-ponsel'),
      wa: checked(form, 'digital-wa'),
      video: checked(form, 'digital-video')
    };
    d.komunitas = {
      kader: checked(form, 'kader'),
      puskesmas: str(fd, 'puskesmas').trim(),
      tetangga: checked(form, 'tetangga')
    };
    d.bebanAwal = Number(fd.get('bebanAwal')) || 3;
  }
  return d;
}

function validateCapacity(d: Profile, step: number): string[] {
  const errs: string[] = [];
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

function handleCapacity(action: string, btn: { dataset: DOMStringMap }, form: HTMLFormElement) {
  const id = data(form).id;
  let d: Profile;
  try {
    d = readCapacity(form);
    ui.draft = d;
  } catch (err) {
    toast('Tidak dapat membaca isian. Coba lagi.', true);
    return;
  }
  ui.formErrors = [];
  if (action === 'form-prev') {
    ui.formStep = Math.max(0, Number(data(btn).step) - 1);
    render();
    return;
  }
  if (action === 'form-next') {
    const errs = validateCapacity(d, ui.formStep);
    if (errs.length) { showFormErrors(errs); return; }
    ui.formStep = Math.min(4, Number(data(btn).step) + 1);
    render();
    window.scrollTo({ top: 0, behavior: 'auto' });
    return;
  }
  const isDraft = action === 'form-save-draft';
  const errs = validateCapacity(d, ui.formStep);
  if (isDraft) {
    const consentErr = validateCapacity(d, 0);
    if (consentErr.length) { showFormErrors(consentErr); return; }
  } else if (errs.length) {
    showFormErrors(errs); return;
  }
  const menit = ui.formStart ? Math.round(((Date.now() - ui.formStart) / 60000) * 10) / 10 : 0;
  S.saveProfile(id, d, { partial: isDraft, menit: menit, consentOleh: d.consent && d.consent.oleh });
  ui.draft = null;
  ui.draftId = null;
  ui.formStep = 0;
  ui.formStart = null;
  toast(isDraft ? 'Draf kapasitas tersimpan. Bisa dilanjutkan kapan saja.' : 'Profil kapasitas tersimpan sebagai versi baru.');
  location.hash = isDraft ? '#/pasien/' + id : '#/pasien/' + id + '/pemetaan';
}

/* ---------------- tugas ---------------- */
function collectTask(form: HTMLFormElement): TaskInput {
  const fd = new FormData(form);
  const t = {
    nama: str(fd, 'nama').trim(),
    kategori: str(fd, 'kategori', 'obat'),
    perHari: Number(fd.get('perHari')) || 0,
    menit: Number(fd.get('menit')) || 0,
    slot: str(fd, 'slot', 'pagi'),
    hari: fd.getAll('hari').map(Number),
    keterampilan: str(fd, 'keterampilan', 'dasar'),
    butuhPendamping: checked(form, 'butuhPendamping'),
    butuhTransport: checked(form, 'butuhTransport'),
    perBulanKontrol: Number(fd.get('perBulanKontrol')) || 0,
    biayaBulanan: Number(fd.get('biayaBulanan')) || 0,
    syaratRumah: fd.getAll('syaratRumah').map(String),
    butuhDigital: str(fd, 'butuhDigital') || null,
    kritis: str(fd, 'kritis', 'sedang'),
    bolehDisederhanakan: checked(form, 'bolehDisederhanakan'),
    catatan: str(fd, 'catatan').trim()
  };
  return t;
}

function handleTaskSubmit(form: HTMLFormElement) {
  const id = data(form).id;
  const taskId = data(form).task;
  const t = collectTask(form);
  const tf = ui.taskForm;
  if (!tf) return;
  if (!t.nama) { tf.error = 'Nama tugas wajib diisi.'; ui.scrollTask = true; render(); return; }
  if (t.perHari > 0 && t.menit <= 0) { tf.error = 'Isi menit per kali untuk tugas harian.'; ui.scrollTask = true; render(); return; }
  if (t.perHari === 0 && t.perBulanKontrol === 0) { tf.error = 'Isi frekuensi harian atau jumlah kontrol per bulan.'; ui.scrollTask = true; render(); return; }
  const tasks = S.tasks(id).slice();
  if (taskId) {
    const idx = tasks.findIndex(function (x) { return x.id === taskId; });
    if (idx >= 0) tasks[idx] = Object.assign({ id: taskId }, t);
  } else {
    tasks.push(Object.assign({ id: id + '-t' + Date.now().toString(36) }, t));
  }
  S.saveTasks(id, tasks);
  ui.taskForm = null;
  toast(taskId ? 'Tugas diperbarui.' : 'Tugas ditambahkan. Pemetaan dihitung ulang saat dibuka.');
  render();
}

// Ringkasan error ber-role=alert sudah diumumkan; fokuskan agar Tab berlanjut dari situ, bukan dari awal halaman.
function showFormErrors(errs: string[]) {
  ui.formErrors = errs;
  render();
  const box = document.querySelector<HTMLElement>('.form-errors');
  if (box) box.focus(); else toast(errs[0], true);
}

/* ---------------- keputusan ---------------- */
function handleDecision(form: HTMLFormElement) {
  const id = data(form).id;
  const findingId = data(form).finding;
  const fd = new FormData(form);
  const status = str(fd, 'status') as DecisionStatus | '';
  const opsi = fd.getAll('opsi').map(String);
  const catatan = str(fd, 'catatan').trim();
  // Arahkan fokus ke kolom yang bermasalah agar pengguna keyboard/pembaca layar tidak tersesat.
  const focusOn = function (sel: string) { const el = document.querySelector<HTMLElement>(sel); if (el) el.focus(); };
  if (!status) { focusOn('#' + CSS.escape(form.id) + ' [name=status]'); toast('Pilih jenis keputusan terlebih dahulu.', true); return; }
  if ((status === 'sesuaikan' || status === 'dukungan') && !opsi.length) {
    focusOn('[name=opsi][form="' + CSS.escape(form.id) + '"]');
    toast('Pilih minimal satu opsi penyesuaian atau dukungan.', true); return;
  }
  if ((status === 'risiko' || status === 'tidak_selesai') && catatan.length < 4) {
    focusOn('#' + CSS.escape(form.id) + ' [name=catatan]');
    toast('Catatan alasan wajib diisi untuk keputusan ini.', true); return;
  }
  const menit = ui.reviewStart ? Math.round(((Date.now() - ui.reviewStart) / 60000) * 10) / 10 : 0;
  S.saveDecision(id, {
    findingId: findingId,
    dimensi: data(form).dimensi,
    taskIds: (data(form).tasks || '').split(',').filter(Boolean),
    status: status,
    opsi: opsi,
    catatan: catatan,
    menitTinjau: menit > 0 ? menit : null
  });
  ui.editDecision = null;
  toast('Keputusan tersimpan. Pemetaan dihitung ulang.');
  render();
}

/* ---------------- tindak lanjut ---------------- */
function handleFollowUp(form: HTMLFormElement) {
  const id = data(form).id;
  const hari = Number(data(form).hari);
  const fd = new FormData(form);
  const beban = Number(fd.get('beban'));
  const rawat = fd.get('rawatUlang');
  if (!beban) { toast('Pilih skor beban keluarga.', true); return; }
  if (!rawat) { toast('Pilih status rawat ulang.', true); return; }
  S.saveFollowUp(id, {
    hari: hari,
    tugasDijalankan: fd.getAll('tugas').map(String),
    tugasTotal: S.tasks(id).length,
    kendala: str(fd, 'kendala').trim(),
    beban: beban,
    rawatUlang: rawat === 'ya',
    catatan: str(fd, 'catatan').trim()
  });
  toast('Tindak lanjut hari ke-' + hari + ' tersimpan.');
  render();
}

/* ---------------- pengaturan ---------------- */
function handleSettings(form: HTMLFormElement) {
  const fd = new FormData(form);
  const cfg = clone(S.state.config);
  cfg.layanan = str(fd, 'layanan', cfg.layanan).trim() || cfg.layanan;
  const fresh = Number(fd.get('hariKedaluwarsaData'));
  if (fresh >= 1 && fresh <= 90) cfg.hariKedaluwarsaData = fresh;
  Object.keys(cfg.ambang).forEach(function (key) {
    const meta: Partial<AmbangMeta> = cfg.labelAmbang[key] || {};
    const val = Number(fd.get('ambang-' + key));
    if (Number.isFinite(val)) cfg.ambang[key] = Math.min(meta.max || 9999, Math.max(meta.min || 0, val));
  });
  S.saveConfig(cfg);
  toast('Pengaturan layanan disimpan.');
  render();
}

/* ---------------- tautan keluarga ---------------- */
function copyFamilyLink(id: string) {
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
function onClick(ev: MouseEvent) {
  const btn = (ev.target as Element).closest<HTMLElement>('[data-action]');
  if (!btn) return;
  const ds = data(btn);
  const action = ds.action;
  // Tombol formulir kapasitas selalu berada di dalam <form data-form>.
  const form = btn.closest<HTMLFormElement>('form[data-form]')!;

  if (action === 'filter') {
    ui.filter = ds.filter;
    render();
    return;
  }
  if (action === 'reset-filter') {
    ui.filter = 'semua';
    ui.q = '';
    render();
    return;
  }
  if (action === 'print') { window.print(); return; }
  if (action === 'reload') { location.reload(); return; }
  if (action === 'copy-family-link') { copyFamilyLink(ds.id); return; }
  if (action === 'edit-decision') { ui.editDecision = ds.finding; render(); return; }

  if (action === 'add-companion') {
    const d = readCapacity(form);
    d.pendamping = d.pendamping || [];
    d.pendamping.push({ nama: '', hubungan: 'Anak', jamPerHari: 2, hari: [0, 1, 2, 3, 4, 5, 6], bekerja: false, jamKerja: [], keterbatasan: '', literasi: 'cukup', keterampilan: [] });
    ui.draft = d;
    render();
    return;
  }
  if (action === 'remove-companion') {
    const d = readCapacity(form);
    d.pendamping.splice(Number(ds.index), 1);
    ui.draft = d;
    render();
    return;
  }
  if (action === 'form-prev' || action === 'form-next' || action === 'form-save-draft' || action === 'form-save-final') {
    handleCapacity(action, btn, form);
    return;
  }
  if (action === 'apply-template') {
    const id = ds.id;
    const tpl = demo.templates.find(function (t) { return t.id === ds.template; });
    if (!tpl) return;
    const tasks = S.tasks(id).slice();
    tasks.push(Object.assign(defaultTask(), clone(tpl.data), { id: id + '-t' + Date.now().toString(36), catatan: '' }));
    S.saveTasks(id, tasks);
    toast('“' + tpl.label + '” ditambahkan. Sesuaikan bila perlu.');
    render();
    return;
  }
  if (action === 'task-new') {
    ui.taskForm = { mode: 'new', data: defaultTask(), error: '' };
    ui.scrollTask = true;
    render();
    return;
  }
  if (action === 'task-edit') {
    const t = S.tasks(ds.id).find(function (x) { return x.id === ds.task; });
    if (!t) return;
    ui.taskForm = { mode: 'edit', taskId: t.id, data: clone(t), error: '' };
    ui.scrollTask = true;
    render();
    return;
  }
  if (action === 'task-delete') {
    if (!window.confirm('Hapus tugas ini? Pemetaan akan dihitung ulang.')) return;
    const id = ds.id;
    S.saveTasks(id, S.tasks(id).filter(function (x) { return x.id !== ds.task; }));
    ui.taskForm = null;
    toast('Tugas dihapus.');
    render();
    return;
  }
  if (action === 'task-cancel') {
    ui.taskForm = null;
    render();
    return;
  }
  if (action === 'follow-day') {
    ui.followDay = Number(ds.day);
    render();
    return;
  }
  if (action === 'reset-demo') {
    if (!window.confirm('Atur ulang semua data demo? Perubahan lokal akan hilang.')) return;
    S.reset();
    ui.lastKey = null;
    ui.draft = null;
    ui.draftId = null;
    location.hash = '#/pasien';
    go();
    toast('Data demo dimuat ulang.');
    return;
  }
}

function onSubmit(ev: SubmitEvent) {
  const form = (ev.target as Element).closest<HTMLFormElement>('form[data-form]');
  if (!form) return;
  ev.preventDefault();
  const kind = data(form).form;
  if (kind === 'cari') {
    ui.q = str(new FormData(form), 'q').trim();
    render();
    return;
  }
  if (kind === 'kapasitas') {
    const action = ui.formStep >= 4 ? 'form-save-final' : 'form-next';
    handleCapacity(action, { dataset: { step: String(ui.formStep) } }, form);
    return;
  }
  if (kind === 'task') { handleTaskSubmit(form); return; }
  if (kind === 'keputusan') { handleDecision(form); return; }
  if (kind === 'tindaklanjut') { handleFollowUp(form); return; }
  if (kind === 'pengaturan') { handleSettings(form); return; }
  if (kind === 'feedback') {
    const id = data(form).id;
    const fd = new FormData(form);
    const skor = Number(fd.get('skor'));
    if (!skor) { toast('Pilih skor terlebih dahulu.', true); return; }
    S.addFeedback(id, skor, str(fd, 'catatan').trim());
    toast('Umpan balik tersimpan. Terima kasih.');
    render();
    return;
  }
}

function onChange(ev: Event) {
  const t = ev.target as HTMLInputElement;
  if (t.id === 'role-select') {
    if (isRole(t.value)) S.setRole(t.value);
    ui.lastKey = null;
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
    const kat = RM_CONFIG.kategoriBiaya[t.value];
    const input = document.getElementById('f-biaya-bulan') as HTMLInputElement | null;
    if (kat && input) input.value = String(kat.nominal);
    return;
  }
}

function onInput(ev: Event) {
  const t = ev.target as HTMLInputElement;
  if (t.dataset && t.dataset.range === 'beban') {
    const out = document.getElementById('beban-value');
    if (out) out.textContent = t.value + ' / 5';
  }
  // Kotak cari dikosongkan (ketik hapus / tombol ✕): tampilkan lagi semua tanpa perlu menekan Cari.
  if (t.id === 'q' && !t.value && ui.q) {
    ui.q = '';
    render();
    document.getElementById('q')?.focus();
  }
}

function init() {
  // Buka tanpa hash (alamat polos) = pertama kali masuk: tampilkan company profile. Semua tautan ke aplikasi membawa hash.
  if (!location.hash && !location.search) { location.replace('profil.html'); return; }
  S.init();
  // Kait debug untuk skrip verifikasi docs/audit/verify/*.js (bukan API aplikasi).
  window.RM = { store: S, ui };
  // Tautan dari profil (profil.html?peran=klinisi) memilih peran demo; nilai lain diabaikan.
  const peran = new URLSearchParams(location.search).get('peran');
  if (isRole(peran)) {
    if (peran !== S.state.role) S.setRole(peran);
    try { history.replaceState(null, '', location.pathname + location.hash); } catch (err) { /* URL tetap berisi ?peran, tidak berbahaya */ }
  }
  const role = document.getElementById('role-select') as HTMLSelectElement | null;
  if (role) role.value = S.state.role;
  // ?peran= tanpa hash (tautan lama) tetap masuk ke daftar pasien.
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
