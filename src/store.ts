/* RencanaMampu — penyimpanan lokal berversi.
   Prototipe menyimpan data di localStorage peramban; tidak ada server.
   Struktur ini sengaja menyerupai lapisan API agar mudah dipindahkan ke backend. */
import { RM_CONFIG } from './config';
import { demo } from './data';
import { fmt as F, rules } from './rules';
import type { Config, Decision, FamilyLink, FollowUp, Hasil, Profile, Role, State, Task } from './types';

const KEY = 'rencanamampu.state.v1';

function clone<T>(v: T): T { return JSON.parse(JSON.stringify(v)); }
function uid(prefix?: string): string {
  return (prefix || 'ID') + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

function seed(): State {
  const d = demo.build();
  const config = clone(RM_CONFIG);
  return {
    version: 1,
    createdAt: F.today(),
    layanan: config.layanan,
    role: 'perencana',
    pasien: d.pasien,
    profiles: d.profiles,
    riwayatProfil: d.riwayatProfil || {},
    tasks: d.tasks,
    decisions: d.decisions,
    followUps: d.followUps,
    audit: d.audit,
    meta: d.meta,
    config: config,
    familyLinks: {},
    counter: { decision: 4, audit: 9, profile: 20 }
  };
}

export const store = {
  // Diisi oleh init() sebelum dipakai.
  state: null as unknown as State,
  persisted: true,

  init: function () {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        this.state = JSON.parse(raw);
        this.state = this.migrate(this.state);
      }
    } catch (err) {
      this.persisted = false;
    }
    if (!this.state) this.state = seed();
    this.save();
    return this.state;
  },

  migrate: function (s: State): State {
    if (!s.config) s.config = clone(RM_CONFIG);
    if (!s.config.ambang) s.config.ambang = clone(RM_CONFIG.ambang);
    if (!s.familyLinks) s.familyLinks = {};
    if (!s.riwayatProfil) s.riwayatProfil = {};
    if (!s.counter) s.counter = { decision: s.decisions ? s.decisions.length + 1 : 1, audit: s.audit ? s.audit.length + 1 : 1, profile: 1 };
    return s;
  },

  save: function () {
    try {
      localStorage.setItem(KEY, JSON.stringify(this.state));
      this.persisted = true;
    } catch (err) {
      this.persisted = false;
    }
  },

  reset: function () {
    this.state = seed();
    this.save();
  },

  setRole: function (role: Role) {
    this.state.role = role;
    this.audit('Mengganti peran aktif', 'Peran: ' + role);
    this.save();
  },

  getPasien: function (id: string) {
    return this.state.pasien.find(function (p) { return p.id === id; }) || null;
  },
  // Kode pasien untuk log audit; id mentah bila pasien tidak ditemukan.
  kode: function (id: string): string {
    return this.getPasien(id)?.kode ?? id;
  },
  profile: function (id: string): Profile | null {
    return this.state.profiles[id] || null;
  },
  tasks: function (id: string): Task[] {
    return this.state.tasks[id] || [];
  },
  decisions: function (id: string): Decision[] {
    return this.state.decisions.filter(function (d) { return d.pasienId === id; });
  },
  followUps: function (id: string): FollowUp[] {
    return this.state.followUps.filter(function (f) { return f.pasienId === id; }).sort(function (a, b) { return a.hari - b.hari; });
  },

  hasil: function (id: string): Hasil | null {
    const p = this.getPasien(id);
    if (!p) return null;
    const profile = this.profile(id);
    const tasks = this.tasks(id);
    const decisions = this.decisions(id);
    const hasil = rules.compute(p, profile, tasks, decisions, this.state.config);
    const follow = this.followUps(id);
    const fu7 = follow.find(function (f) { return f.hari === 7; }) || null;
    const fu30 = follow.find(function (f) { return f.hari === 30; }) || null;
    return Object.assign({ pasien: p, profile: profile, tasks: tasks, decisions: decisions, followUps: follow, fu7: fu7, fu30: fu30 }, hasil);
  },

  saveProfile: function (pasienId: string, profile: Profile, opts?: { partial?: boolean; menit?: number; consentOleh?: string }): Profile {
    const partial = !!(opts && opts.partial);
    const prev = this.profile(pasienId);
    const next = clone(profile);
    next.pasienId = pasienId;
    next.diperbarui = F.today();
    next.status = partial ? 'draf' : 'final';
    if (!next.versi) next.versi = prev ? prev.versi : 1;
    if (!next.id) next.id = pasienId + '-p' + next.versi;
    if (prev && prev.status === 'final' && (partial || next.versi === prev.versi)) {
      next.versi = (prev.versi || 1) + 1;
      next.id = pasienId + '-p' + next.versi;
      if (!this.state.riwayatProfil[pasienId]) this.state.riwayatProfil[pasienId] = [];
      this.state.riwayatProfil[pasienId].unshift(clone(prev));
    }
    if (!partial && !next.consent) {
      next.consent = {
        diberikan: true, oleh: (opts && opts.consentOleh) || 'Keluarga pasien',
        pada: next.diperbarui, cakupan: 'Data kapasitas keluarga untuk perencanaan pulang; dapat dihapus atas permintaan.'
      };
    }
    this.state.profiles[pasienId] = next;
    this.audit(partial ? 'Menyimpan draf profil kapasitas' : 'Menyimpan profil kapasitas', this.kode(pasienId) + ' · versi ' + next.versi + (partial ? ' (draf)' : ' (final)'));
    this.recordDuration('profil', pasienId, opts && opts.menit);
    this.save();
    return next;
  },

  saveTasks: function (pasienId: string, tasks: Task[]) {
    this.state.tasks[pasienId] = clone(tasks);
    this.audit('Memperbarui tugas perawatan', this.kode(pasienId) + ' · ' + tasks.length + ' tugas');
    this.save();
  },

  saveDecision: function (pasienId: string, decision: Decision): Decision {
    decision.pasienId = pasienId;
    decision.pada = decision.pada || F.today();
    decision.oleh = decision.oleh || 'dr. Maya Puspita';
    decision.peran = decision.peran || 'klinisi';
    const idx = this.state.decisions.findIndex(function (d) {
      return d.pasienId === pasienId && d.findingId === decision.findingId;
    });
    if (idx >= 0) {
      decision.id = this.state.decisions[idx].id;
      this.state.decisions[idx] = clone(decision);
    } else {
      decision.id = uid('D');
      this.state.decisions.push(clone(decision));
    }
    this.audit('Mencatat keputusan klinisi', this.kode(pasienId) + ' · ' + decision.dimensi + ' · ' + decision.status);
    this.recordDuration('tinjau', pasienId, decision.menitTinjau);
    this.save();
    return decision;
  },

  saveFollowUp: function (pasienId: string, data: FollowUp): FollowUp {
    const idx = this.state.followUps.findIndex(function (f) { return f.pasienId === pasienId && f.hari === data.hari; });
    const rec = Object.assign({ id: 'FU-' + pasienId + '-' + data.hari, pasienId: pasienId, tanggal: F.today(), oleh: 'Ns. Rina Kusuma' }, data);
    if (idx >= 0) this.state.followUps[idx] = rec; else this.state.followUps.push(rec);
    this.audit('Menyimpan tindak lanjut hari ' + data.hari, this.kode(pasienId));
    this.save();
    return rec;
  },

  saveConfig: function (config: Config) {
    this.state.config = clone(config);
    this.state.layanan = config.layanan || this.state.layanan;
    this.audit('Mengubah ambang / katalog layanan', this.state.layanan);
    this.save();
  },

  recordDuration: function (kind: 'profil' | 'tinjau', pasienId: string, menit?: number | null) {
    if (!menit || menit <= 0) return;
    const key = kind === 'profil' ? 'durasiProfilMenit' : 'durasiTinjauMenit';
    const map = this.state.meta[key];
    const prev = map[pasienId];
    map[pasienId] = prev ? Math.round(((prev + menit) / 2) * 10) / 10 : Math.round(menit * 10) / 10;
  },

  addFeedback: function (pasienId: string, skor: number, catatan?: string) {
    this.state.meta.umpanBalik = this.state.meta.umpanBalik.filter(function (f) { return f.pasienId !== pasienId; });
    this.state.meta.umpanBalik.push({ pasienId: pasienId, skor: skor, catatan: catatan || '' });
    this.audit('Mengisi umpan balik klinisi', this.kode(pasienId) + ' · skor ' + skor + '/5');
    this.save();
  },

  feedbackFor: function (pasienId: string) {
    return this.state.meta.umpanBalik.find(function (f) { return f.pasienId === pasienId; }) || null;
  },

  createFamilyLink: function (pasienId: string) {
    const token = 'klg-' + this.kode(pasienId).toLowerCase().replace(/[^a-z0-9]/g, '') + '-' + Array.from(crypto.getRandomValues(new Uint32Array(2)), function (n) { return n.toString(36); }).join('');
    this.state.familyLinks[token] = { pasienId: pasienId, dibuat: F.today(), kedaluwarsa: F.addDays(3) };
    this.audit('Membuat tautan keluarga berkedaluwarsa', this.kode(pasienId) + ' · berlaku 3 hari');
    this.save();
    return { token: token, kedaluwarsa: this.state.familyLinks[token].kedaluwarsa };
  },

  familyByToken: function (token: string): { valid: true; link: FamilyLink } | { valid: false; reason: string } {
    const link = this.state.familyLinks[token];
    if (!link) return { valid: false, reason: 'Tautan tidak ditemukan.' };
    if ((F.selisihHari(link.kedaluwarsa) ?? 0) > 0) return { valid: false, reason: 'Tautan sudah kedaluwarsa.' };
    return { valid: true, link: link };
  },

  audit: function (aksi: string, target?: string) {
    const now = new Date();
    const pada = F.iso(now) + 'T' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    this.state.audit.unshift({
      id: uid('A'), pada: pada,
      aktor: this.state.role === 'klinisi' ? 'dr. Maya Puspita' : (this.state.role === 'admin' ? 'Admin Layanan' : 'Ns. Rina Kusuma'),
      peran: this.state.role, aksi: aksi, target: target || '—'
    });
    this.state.audit = this.state.audit.slice(0, 200);
  },

  stats: function () {
    const self = this;
    const rows = this.state.pasien.map(function (p) { return self.hasil(p.id); }).filter(function (r): r is Hasil { return r !== null; });
    const withProfile = rows.filter(function (r) { return !!r.profile; });
    let detected = 0, konflik = 0, perhatian = 0, terbuka = 0, risiko = 0, sebagian = 0, selesai = 0, changed = 0;
    const byDimensi: Record<string, number> = {};
    RM_CONFIG.dimensi.forEach(function (d) { byDimensi[d.id] = 0; });
    rows.forEach(function (r) {
      r.baseline.forEach(function (f) {
        if (f.tingkat === 'sesuai') return;
        detected++;
        if (f.tingkat === 'konflik') konflik++; else perhatian++;
        if (byDimensi[f.dimensi] !== undefined) byDimensi[f.dimensi]++;
      });
      terbuka += r.ringkas.terbuka;
      risiko += r.ringkas.risiko;
      sebagian += r.ringkas.sebagian || 0;
      selesai += r.ringkas.selesai;
      changed += r.decisions.filter(function (d) { return d.status === 'sesuaikan' || d.status === 'dukungan'; }).length;
    });
    const fu = this.state.followUps;
    const executed = fu.reduce(function (s, f) { return s + (f.tugasDijalankan || []).length; }, 0);
    const executedTotal = fu.reduce(function (s, f) { return s + (f.tugasTotal || 0); }, 0);
    const durasiProfil = Object.values(this.state.meta.durasiProfilMenit);
    const durasiTinjau = Object.values(this.state.meta.durasiTinjauMenit);
    const avg = function (arr: number[]) { return arr.length ? Math.round((arr.reduce(function (a, b) { return a + b; }, 0) / arr.length) * 10) / 10 : 0; };
    const feedback = this.state.meta.umpanBalik;
    return {
      totalPasien: rows.length,
      denganProfil: withProfile.length,
      konflik: konflik,
      perhatian: perhatian,
      terbuka: terbuka,
      risiko: risiko,
      sebagian: sebagian,
      selesai: selesai,
      changed: changed,
      findings: detected,
      persenPerubahan: detected ? Math.round((changed / detected) * 100) : 0,
      persenTidakSelesai: detected ? Math.round((terbuka / detected) * 100) : 0,
      byDimensi: byDimensi,
      fu: { selesai: fu.length, dijalankan: executed, total: executedTotal, persen: executedTotal ? Math.round((executed / executedTotal) * 100) : 0 },
      avgProfil: avg(durasiProfil),
      avgTinjau: avg(durasiTinjau),
      avgFeedback: feedback.length ? Math.round((feedback.reduce(function (a, b) { return a + b.skor; }, 0) / feedback.length) * 10) / 10 : 0,
      feedbackCount: feedback.length,
      rows: rows
    };
  }
};
