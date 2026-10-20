/* RencanaMampu — mesin aturan deterministik.
   Fungsi murni: tidak menyentuh DOM, tidak menyimpan state, tidak memanggil jaringan.
   Setiap temuan membawa ruleId + nilai aktual vs ambang agar dapat ditelusuri. */
import { RM_CONFIG } from './config';
import type {
  CatalogOption, Companion, Computed, Config, Decision, Effects, Finding, Freshness, Level, MatrixRow, Pasien, Profile, Ringkas, Task, Transport
} from './types';

type FindingInput = Pick<Finding, 'ruleId' | 'dimensi' | 'judul' | 'alasan'> & Partial<Finding>;
export const MODA: Record<string, string> = { motor: 'Motor', angkutan: 'Angkutan umum', mobil: 'Mobil', tidak: 'Tidak ada' };

const CFG = (): Config => RM_CONFIG;

const HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

function num(v: unknown, fallback = 0): number {
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : fallback;
}
function clamp(n: number, min: number, max: number): number { return Math.min(max, Math.max(min, n)); }
function round(n: number, d = 0): number {
  const p = Math.pow(10, d);
  return Math.round(n * p) / p;
}
function rupiah(n: unknown): string {
  const v = Math.round(num(n));
  return 'Rp' + v.toLocaleString('id-ID');
}
function menit(total: unknown): string {
  const m = Math.max(0, Math.round(num(total)));
  const j = Math.floor(m / 60);
  const sisa = m % 60;
  if (j === 0) return sisa + ' mnt';
  if (sisa === 0) return j + ' jam';
  return j + ' jam ' + sisa + ' mnt';
}
function iso(date: Date | string | number): string {
  const d = date instanceof Date ? date : new Date(date);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}
function today(): string { return iso(new Date()); }
function addDays(n: number, from?: string): string {
  const d = from ? new Date(from + 'T00:00:00') : new Date();
  d.setDate(d.getDate() + n);
  return iso(d);
}
function tanggal(isoStr?: string | null, opts?: Intl.DateTimeFormatOptions): string {
  if (!isoStr) return '—';
  const d = new Date(isoStr + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('id-ID', Object.assign({ day: 'numeric', month: 'short', year: 'numeric' }, opts || {}));
}
function hariTanggal(isoStr?: string | null): string {
  if (!isoStr) return '—';
  const d = new Date(isoStr + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
}
function selisihHari(isoStr?: string | null, base?: string): number | null {
  if (!isoStr) return null;
  const a = new Date(isoStr + 'T00:00:00');
  const b = new Date((base || today()) + 'T00:00:00');
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}
function usiaData(isoStr?: string | null): string {
  const d = selisihHari(isoStr);
  if (d === null) return 'belum ada';
  if (d <= 0) return 'hari ini';
  if (d === 1) return '1 hari lalu';
  return d + ' hari lalu';
}

const emptyEffects = (): Effects => ({
  biayaBantuan: 0,
  jamTambahPerHari: 0,
  pendampingTambah: 0,
  latihPendamping: false,
  hapusTransport: false,
  transportBantuan: false,
  kunjunganFaktor: 1,
  bebanFaktor: 1,
  alatTambah: [],
  digitalTambah: []
});

function effectsFromDecisions(decisions: Decision[] | null | undefined, katalog: CatalogOption[] | undefined): Effects {
  const eff = emptyEffects();
  const list = Array.isArray(decisions) ? decisions : [];
  list.forEach(function (d) {
    if (d.status !== 'sesuaikan' && d.status !== 'dukungan') return;
    (d.opsi || []).forEach(function (id) {
      const opsi = (katalog || []).find(function (o) { return o.id === id; });
      if (!opsi || !opsi.efek) return;
      const e = opsi.efek;
      if (num(e.biayaBantuan)) eff.biayaBantuan += num(e.biayaBantuan);
      if (num(e.jamTambahPerHari)) eff.jamTambahPerHari += num(e.jamTambahPerHari);
      if (num(e.pendampingTambah)) eff.pendampingTambah += num(e.pendampingTambah);
      if (e.latihPendamping) eff.latihPendamping = true;
      if (e.hapusTransport) eff.hapusTransport = true;
      if (e.transportBantuan) eff.transportBantuan = true;
      if (num(e.kunjunganFaktor, 1) !== 1) eff.kunjunganFaktor *= num(e.kunjunganFaktor, 1);
      if (num(e.bebanFaktor, 1) !== 1) eff.bebanFaktor *= num(e.bebanFaktor, 1);
      (e.alatTambah || []).forEach(function (k) { if (!eff.alatTambah.includes(k)) eff.alatTambah.push(k); });
      (e.digitalTambah || []).forEach(function (k) { if (!eff.digitalTambah.includes(k)) eff.digitalTambah.push(k); });
    });
  });
  eff.bebanFaktor = clamp(eff.bebanFaktor, 0.3, 1);
  eff.kunjunganFaktor = clamp(eff.kunjunganFaktor, 0, 2);
  return eff;
}

function finding(o: FindingInput): Finding {
  return Object.assign({
    id: o.ruleId + ':' + o.dimensi + ':' + (o.taskIds && o.taskIds.length ? o.taskIds.slice().sort().join('+') : 'pasien'),
    tingkat: 'konflik' as Level,
    taskIds: [] as string[],
    pasienLevel: false,
    detail: [] as Finding['detail'],
    aturan: ''
  }, o);
}

function companions(profile: Profile | null | undefined): Companion[] {
  return (profile && Array.isArray(profile.pendamping)) ? profile.pendamping : [];
}

function hitungTransport(profile: Profile | null, tasks: Task[], eff: Effects): Transport {
  const kontrol = tasks.filter(function (t) { return t.butuhTransport && num(t.perBulanKontrol) > 0; });
  const baseTrips = kontrol.reduce(function (s, t) { return s + num(t.perBulanKontrol); }, 0);
  const trips = eff.hapusTransport ? 0 : baseTrips * eff.kunjunganFaktor;
  const tr: Partial<Profile['transportasi']> = (profile && profile.transportasi) || {};
  const menitSekali = num(tr.menitSekali);
  const biayaSekali = num(tr.biayaSekali);
  return {
    kontrol: kontrol,
    baseTrips: baseTrips,
    trips: Math.round(trips * 10) / 10,
    menit: Math.round(trips * 2 * menitSekali),
    biaya: Math.round(trips * 2 * biayaSekali * (eff.transportBantuan ? 0.5 : 1)),
    menitSekali: menitSekali,
    biayaSekali: biayaSekali,
    moda: tr.moda || 'tidak'
  };
}

function derive(input: { profile: Profile | null; tasks?: Task[]; effects?: Effects; config?: Config }): Finding[] {
  const profile = input.profile;
  const tasks = (input.tasks || []).filter(function (t) { return !t.dihapus; });
  const eff = input.effects || emptyEffects();
  const cfg = input.config || CFG();
  const amb = cfg.ambang || {};
  const out: Finding[] = [];
  if (!profile) return out;

  const pendamping = companions(profile);
  const skills: string[] = [];
  pendamping.forEach(function (p) { (p.keterampilan || []).forEach(function (k) { if (!skills.includes(k)) skills.push(k); }); });
  const transport = hitungTransport(profile, tasks, eff);

  /* R1 — Waktu: tuntutan harian vs jam pendamping pada hari itu */
  let worst: { d: number; demand: number; avail: number; ratio: number; tasks: Task[] } | null = null;
  for (let d = 0; d < 7; d++) {
    const dayTasks = tasks.filter(function (t) {
      return num(t.perHari) > 0 && (!Array.isArray(t.hari) || t.hari.includes(d));
    });
    if (!dayTasks.length) continue;
    const demand = Math.round(dayTasks.reduce(function (s, t) { return s + num(t.perHari) * num(t.menit); }, 0) * eff.bebanFaktor);
    const availJam = pendamping.filter(function (p) { return !Array.isArray(p.hari) || p.hari.includes(d); })
      .reduce(function (s, p) { return s + num(p.jamPerHari); }, 0) + num(eff.jamTambahPerHari);
    const avail = Math.round(availJam * 60);
    const ratio = avail > 0 ? demand / avail : (demand > 0 ? 99 : 0);
    if (!worst || ratio > worst.ratio) worst = { d: d, demand: demand, avail: avail, ratio: ratio, tasks: dayTasks };
  }
  if (worst && worst.demand > 0) {
    const capHarian = num(amb.jamTugasHarian, 3) * 60;
    const level = worst.ratio > 1 ? 'konflik' : (worst.ratio >= num(amb.proporsiWaktuWaspada, 0.85) || worst.demand > capHarian ? 'perhatian' : null);
    if (level) {
      const selisih = worst.demand - worst.avail;
      out.push(finding({
        ruleId: 'R1', dimensi: 'waktu', tingkat: level,
        judul: 'Waktu pendamping tidak cukup pada hari tersibuk',
        alasan: 'Pada hari ' + HARI[worst.d] + ', tugas membutuhkan ' + menit(worst.demand) +
          ', sedangkan pendamping tersedia ' + menit(worst.avail) + '.' +
          (selisih > 0 ? ' Kekurangan ' + menit(selisih) + '.' : ' Sudah mendekati batas.'),
        taskIds: worst.tasks.map(function (t) { return t.id; }),
        detail: [
          { label: 'Hari tersibuk', value: HARI[worst.d] },
          { label: 'Tuntutan tugas', value: menit(worst.demand) },
          { label: 'Pendamping tersedia', value: menit(worst.avail) },
          { label: 'Ambang', value: menit(num(amb.jamTugasHarian, 3) * 60) + ' acuan; perbandingan memakai ketersediaan nyata' }
        ],
        aturan: 'R1 · Waktu — total tuntutan tugas harian dibandingkan jam pendamping yang tersedia pada hari itu.'
      }));
    }
  }

  /* R2 — Keterampilan */
  tasks.forEach(function (t) {
    if (t.keterampilan === 'terlatih') {
      if (eff.latihPendamping) return;
      if (!skills.includes(t.kategori)) {
        out.push(finding({
          ruleId: 'R2', dimensi: 'keterampilan', tingkat: 'konflik', taskIds: [t.id],
          judul: 'Tidak ada pendamping terlatih untuk ' + (cfg.kategori[t.kategori] || t.kategori).toLowerCase(),
          alasan: 'Tugas "' + t.nama + '" membutuhkan keterampilan terlatih, tetapi tidak ada anggota keluarga yang tercatat nyaman atau terlatih untuk ' +
            (cfg.kategori[t.kategori] || t.kategori).toLowerCase() + '.',
          detail: [
            { label: 'Kebutuhan', value: 'Terlatih — ' + (cfg.kategori[t.kategori] || t.kategori) },
            { label: 'Keterampilan keluarga', value: skills.length ? skills.map(function (s) { return cfg.kategori[s] || s; }).join(', ') : 'belum ada' },
            { label: 'Ambang', value: 'Minimal satu pendamping terlatih' }
          ],
          aturan: 'R2 · Keterampilan — tugas berlabel "terlatih" harus punya pendamping dengan keterampilan sejenis.'
        }));
      }
    }
  });
  const literasiCukup = pendamping.some(function (p) { return p.literasi === 'cukup'; });
  const tugasDasar = tasks.filter(function (t) { return t.keterampilan === 'dasar'; });
  if (!literasiCukup && pendamping.length > 0 && !skills.length && tugasDasar.length) {
    out.push(finding({
      ruleId: 'R2', dimensi: 'keterampilan', tingkat: 'perhatian',
      taskIds: tugasDasar.map(function (t) { return t.id; }),
      judul: 'Literasi pendamping perlu diperiksa',
      alasan: 'Ada ' + tugasDasar.length + ' tugas dengan instruksi dasar, tetapi belum ada pendamping dengan literasi baca-tulis yang memadai.',
      detail: [
        { label: 'Kebutuhan', value: 'Keterampilan dasar' },
        { label: 'Jumlah tugas terdampak', value: String(tugasDasar.length) },
        { label: 'Ambang', value: 'Satu pendamping dengan literasi cukup' }
      ],
      aturan: 'R2 · Keterampilan — tugas dasar memerlukan minimal satu pendamping dengan literasi cukup.'
    }));
  }

  /* R3 — Pendamping pada jam tugas */
  tasks.forEach(function (t) {
    if (!t.butuhPendamping) return;
    const slot = t.slot || 'pagi';
    const tersedia = pendamping.filter(function (p) { return num(p.jamPerHari) > 0; });
    const sibuk = tersedia.filter(function (p) {
      return p.bekerja && String(p.jamKerja || '').includes(slot);
    });
    const siap = tersedia.length - sibuk.length + num(eff.pendampingTambah);
    if (siap > 0) return;
    const level = sibuk.length > 0 ? 'perhatian' : 'konflik';
    const alasan = tersedia.length === 0
      ? 'Tugas "' + t.nama + '" membutuhkan pendamping, tetapi belum ada anggota keluarga yang tercatat.'
      : 'Tugas "' + t.nama + '" dijadwalkan pada ' + (cfg.slot[slot] ? cfg.slot[slot].label : slot) +
        ', saat satu-satunya pendamping sedang bekerja. Perlu kesepakatan jam atau pendamping cadangan.';
    out.push(finding({
      ruleId: 'R3', dimensi: 'pendamping', tingkat: level, taskIds: [t.id],
      judul: 'Pendamping tidak tersedia pada jam tugas',
      alasan: alasan,
      detail: [
        { label: 'Slot tugas', value: cfg.slot[slot] ? cfg.slot[slot].label : slot },
        { label: 'Pendamping siap', value: String(Math.max(0, siap)) },
        { label: 'Sedang bekerja', value: String(sibuk.length) }
      ],
      aturan: 'R3 · Pendamping — tugas yang butuh pendamping dibandingkan ketersediaan orang pada slot jamnya.'
    }));
  });

  /* R4 — Transportasi */
  if (transport.baseTrips > 0) {
    const ambangMenit = num(amb.menitPerjalananBulanan, 240);
    const bisaSendiri = !!(profile.transportasi && profile.transportasi.bisaSendiri);
    const adaPendamping = pendamping.length > 0;
    let level: Level | null = null;
    let sebab = '';
    if (transport.moda === 'tidak' && !eff.transportBantuan && !eff.hapusTransport) {
      level = 'konflik';
      sebab = 'Keluarga tidak memiliki moda transportasi, sementara ada ' + transport.baseTrips + ' perjalanan kontrol per bulan.';
    } else if (transport.menit > ambangMenit) {
      level = 'konflik';
      sebab = 'Perjalanan kontrol memakan ' + menit(transport.menit) + ' per bulan, melebihi ambang ' + menit(ambangMenit) + '.';
    } else if (transport.menit > ambangMenit * 0.7) {
      level = 'perhatian';
      sebab = 'Perjalanan kontrol memakan ' + menit(transport.menit) + ' per bulan, mendekati ambang ' + menit(ambangMenit) + '.';
    } else if (!bisaSendiri && !adaPendamping) {
      level = 'konflik';
      sebab = 'Pasien tidak bisa pergi sendiri dan belum ada pendamping yang bisa mengantar.';
    }
    if (level) {
      out.push(finding({
        ruleId: 'R4', dimensi: 'transportasi', tingkat: level,
        taskIds: transport.kontrol.map(function (t) { return t.id; }),
        judul: 'Perjalanan kontrol membebani keluarga',
        alasan: sebab,
        detail: [
          { label: 'Perjalanan / bulan', value: String(transport.trips) + ' kali' },
          { label: 'Waktu pulang-pergi', value: menit(transport.menit) + ' / bulan' },
          { label: 'Biaya transport', value: rupiah(transport.biaya) + ' / bulan' },
          { label: 'Moda', value: MODA[transport.moda] || transport.moda },
          { label: 'Ambang', value: menit(ambangMenit) + ' / bulan' }
        ],
        aturan: 'R4 · Transportasi — frekuensi kontrol × waktu tempuh dibandingkan ambang layanan; moda yang tidak tersedia langsung menjadi konflik.'
      }));
    }
  }

  /* R5 — Biaya */
  const biayaTugas = tasks.reduce(function (s, t) { return s + num(t.biayaBulanan); }, 0);
  const totalBiaya = Math.max(0, biayaTugas + transport.biaya - num(eff.biayaBantuan));
  const kemampuan = num(profile.ekonomi && profile.ekonomi.biayaBulanan);
  if (kemampuan > 0 && totalBiaya > 0) {
    const rasio = totalBiaya / kemampuan;
    const level = rasio > 1 ? 'konflik' : (rasio >= num(amb.proporsiBiayaWaspada, 0.85) ? 'perhatian' : null);
    if (level) {
      const penyumbang = tasks.filter(function (t) { return num(t.biayaBulanan) > 0; })
        .sort(function (a, b) { return num(b.biayaBulanan) - num(a.biayaBulanan); }).slice(0, 3);
      out.push(finding({
        ruleId: 'R5', dimensi: 'biaya', tingkat: level,
        taskIds: tasks.filter(function (t) { return num(t.biayaBulanan) > 0; }).map(function (t) { return t.id; }),
        judul: 'Perkiraan biaya bulanan melebihi kemampuan',
        alasan: 'Perkiraan biaya ' + rupiah(totalBiaya) + ' per bulan, sedangkan kemampuan keluarga ' + rupiah(kemampuan) + ' per bulan' +
          (totalBiaya > kemampuan ? ' (selisih ' + rupiah(totalBiaya - kemampuan) + ').' : ' — sudah mendekati batas.'),
        detail: [
          { label: 'Biaya tugas', value: rupiah(biayaTugas) },
          { label: 'Biaya transport', value: rupiah(transport.biaya) },
          { label: 'Bantuan diperhitungkan', value: rupiah(eff.biayaBantuan) },
          { label: 'Kemampuan keluarga', value: rupiah(kemampuan) },
          { label: 'Penyumbang terbesar', value: penyumbang.map(function (t) { return t.nama; }).join(', ') || '—' }
        ],
        aturan: 'R5 · Biaya — total perkiraan biaya tugas dan transport per bulan dibandingkan kategori kemampuan keluarga.'
      }));
    }
  }

  /* R6 — Alat & rumah */
  tasks.forEach(function (t) {
    (t.syaratRumah || []).forEach(function (key) {
      if (profile.rumah && profile.rumah[key]) return;
      if (eff.alatTambah.includes(key)) return;
      const label = cfg.detailRumah[key] || key;
      out.push(finding({
        ruleId: 'R6', dimensi: 'alat', tingkat: 'konflik', taskIds: [t.id],
        judul: label + ' belum tersedia di rumah',
        alasan: 'Tugas "' + t.nama + '" membutuhkan ' + label.toLowerCase() + ', tetapi belum tersedia menurut profil kapasitas.',
        detail: [
          { label: 'Kebutuhan tugas', value: label },
          { label: 'Kondisi rumah', value: 'tidak tercatat tersedia' },
          { label: 'Ambang', value: 'Semua syarat rumah wajib tersedia' }
        ],
        aturan: 'R6 · Alat & rumah — setiap syarat alat/rumah pada tugas harus tersedia di rumah.'
      }));
    });
  });

  /* R7 — Digital */
  tasks.forEach(function (t) {
    if (!t.butuhDigital) return;
    if (profile.digital && profile.digital[t.butuhDigital]) return;
    if (eff.digitalTambah.includes(t.butuhDigital)) return;
    const label = cfg.detailDigital[t.butuhDigital] || t.butuhDigital;
    out.push(finding({
      ruleId: 'R7', dimensi: 'digital', tingkat: 'konflik', taskIds: [t.id],
      judul: 'Sarana digital belum memadai',
      alasan: 'Tugas "' + t.nama + '" bergantung pada ' + label + ', tetapi sarana itu belum tersedia.',
      detail: [
        { label: 'Kebutuhan', value: label },
        { label: 'Kondisi', value: 'belum tersedia' },
        { label: 'Ambang', value: 'Sarana digital yang dipakai tugas harus tersedia' }
      ],
      aturan: 'R7 · Digital — tugas pemantauan/telekonsultasi memerlukan ponsel, WhatsApp, atau video call yang tersedia.'
    }));
  });

  /* R8 — Beban kumulatif */
  const harian = tasks.filter(function (t) { return num(t.perHari) > 0; });
  const batasTugas = num(amb.jumlahTugasHarian, 7);
  if (harian.length > batasTugas) {
    out.push(finding({
      ruleId: 'R8', dimensi: 'beban', tingkat: 'perhatian',
      taskIds: harian.map(function (t) { return t.id; }),
      judul: 'Beban kumulatif tinggi meski tiap tugas lolos',
      alasan: 'Ada ' + harian.length + ' tugas harian, melebihi ambang ' + batasTugas + ' tugas. Banyak tugas kecil tetap menguras waktu dan perhatian keluarga.',
      detail: [
        { label: 'Jumlah tugas harian', value: String(harian.length) },
        { label: 'Ambang layanan', value: batasTugas + ' tugas' }
      ],
      aturan: 'R8 · Beban kumulatif — jumlah tugas harian dibandingkan ambang layanan.'
    }));
  }

  return out;
}

function buildMatrix(tasks: Task[], findings: Finding[]): MatrixRow[] {
  return tasks.filter(function (t) { return !t.dihapus; }).map(function (t) {
    const byDim: Record<string, Level> = {};
    CFG().dimensi.forEach(function (dim) {
      let level: Level = 'sesuai';
      findings.forEach(function (f) {
        if (f.dimensi !== dim.id) return;
        if (!f.taskIds.includes(t.id)) return;
        const rank = CFG().level[f.tingkat] ? CFG().level[f.tingkat].rank : 0;
        if (rank > (CFG().level[level] ? CFG().level[level].rank : 0)) level = f.tingkat;
      });
      byDim[dim.id] = level;
    });
    return { task: t, byDim: byDim };
  });
}

function tingkatTertinggi(findings: Finding[]): Level {
  let level: Level = 'sesuai';
  findings.forEach(function (f) {
    if (CFG().level[f.tingkat].rank > CFG().level[level].rank) level = f.tingkat;
  });
  return level;
}

function hitung(findings: Finding[]) {
  const hasil: { total: number; konflik: number; perhatian: number; byDimensi: Record<string, Record<Level, number>> } = { total: 0, konflik: 0, perhatian: 0, byDimensi: {} };
  CFG().dimensi.forEach(function (d) { hasil.byDimensi[d.id] = { sesuai: 0, perhatian: 0, konflik: 0 }; });
  findings.forEach(function (f) {
    if (f.tingkat === 'sesuai') return;
    hasil.total++;
    if (f.tingkat === 'konflik') hasil.konflik++; else hasil.perhatian++;
    const bucket = hasil.byDimensi[f.dimensi];
    if (bucket) bucket[f.tingkat]++;
  });
  return hasil;
}

function kritisUntuk(f: Finding, tasks: Task[]): string {
  if (f.pasienLevel) return 'sedang';
  const di = tasks.filter(function (t) { return f.taskIds.includes(t.id); });
  if (di.some(function (t) { return t.kritis === 'tinggi'; })) return 'tinggi';
  if (di.some(function (t) { return t.kritis === 'sedang'; })) return 'sedang';
  return 'rendah';
}

function sortFindings(findings: Finding[], tasks: Task[]): Finding[] {
  const rankKritis: Record<string, number> = { tinggi: 3, sedang: 2, rendah: 1 };
  return findings.filter(function (f) { return f.tingkat !== 'sesuai'; }).slice().sort(function (a, b) {
    const ka = rankKritis[kritisUntuk(a, tasks)] || 0;
    const kb = rankKritis[kritisUntuk(b, tasks)] || 0;
    if (ka !== kb) return kb - ka;
    const la = CFG().level[a.tingkat].rank;
    const lb = CFG().level[b.tingkat].rank;
    if (la !== lb) return lb - la;
    return String(a.judul).localeCompare(String(b.judul), 'id');
  });
}

function statusKeputusan(decisions: Decision[] | null | undefined, findingId: string): Decision | null {
  const d = (decisions || []).find(function (x) { return x.findingId === findingId; });
  return d || null;
}

function ringkasKonflik(findings: Finding[], decisions: Decision[] | null | undefined): Ringkas {
  const aktif = findings.filter(function (f) { return f.tingkat !== 'sesuai'; });
  const ids = aktif.map(function (f) { return f.id; });
  let terbuka = 0, risiko = 0, sebagian = 0;
  aktif.forEach(function (f) {
    const d = statusKeputusan(decisions, f.id);
    if (!d) terbuka++;
    else if (d.status === 'tidak_selesai') terbuka++;
    else if (d.status === 'risiko') risiko++;
    else sebagian++;
  });
  const selesai = (decisions || []).filter(function (d) {
    return (d.status === 'sesuaikan' || d.status === 'dukungan') && !ids.includes(d.findingId);
  }).length;
  return { aktif: aktif.length, terbuka: terbuka, risiko: risiko, sebagian: sebagian, selesai: selesai };
}

function freshness(profile: Profile | null, config?: Config): Freshness {
  const cfg = config || CFG();
  if (!profile || !profile.diperbarui) return { status: 'kosong', hari: null, teks: 'Profil kapasitas belum diisi' };
  const hari = selisihHari(profile.diperbarui) ?? 0;
  const batas = num(cfg.hariKedaluwarsaData, 14);
  if (profile.status === 'draf') {
    return { status: 'draf', hari: hari, teks: 'Draf belum selesai' };
  }
  if (hari > batas) return { status: 'kedaluwarsa', hari: hari, teks: 'Data ' + hari + ' hari — perlu diperbarui' };
  if (hari > batas - 3) return { status: 'segera', hari: hari, teks: 'Data ' + hari + ' hari — segera diperbarui' };
  return { status: 'segar', hari: hari, teks: 'Diperbarui ' + usiaData(profile.diperbarui) };
}

function compute(_pasien: Pasien, profile: Profile | null, tasks: Task[], decisions: Decision[], config?: Config): Computed {
  const cfg = config || CFG();
  const eff = effectsFromDecisions(decisions, cfg.katalog);
  const baseline = profile ? derive({ profile: profile, tasks: tasks, config: cfg, effects: emptyEffects() }) : [];
  const effective = profile ? derive({ profile: profile, tasks: tasks, config: cfg, effects: eff }) : [];
  return {
    baseline: baseline,
    effective: effective,
    effects: eff,
    freshness: freshness(profile, cfg),
    matrix: buildMatrix(tasks, effective),
    ringkas: ringkasKonflik(effective, decisions),
    ringkasAwal: ringkasKonflik(baseline, decisions),
    transport: profile ? hitungTransport(profile, tasks, eff) : null
  };
}

function opsiUntuk(finding: Finding, config?: Config): CatalogOption[] {
  const cfg = config || CFG();
  return (cfg.katalog || []).filter(function (o) {
    if (o.aktif === false) return false;
    return (o.dimensi || []).includes(finding.dimensi);
  });
}

export const rules = {
  compute: compute,
  derive: derive,
  buildMatrix: buildMatrix,
  effectsFromDecisions: effectsFromDecisions,
  emptyEffects: emptyEffects,
  sortFindings: sortFindings,
  kritisUntuk: kritisUntuk,
  ringkasKonflik: ringkasKonflik,
  statusKeputusan: statusKeputusan,
  freshness: freshness,
  opsiUntuk: opsiUntuk,
  hitung: hitung,
  tingkatTertinggi: tingkatTertinggi,
  HARI: HARI
};

export const fmt = {
  num: num, clamp: clamp, round: round, rupiah: rupiah, menit: menit,
  iso: iso, today: today, addDays: addDays, tanggal: tanggal, hariTanggal: hariTanggal,
  selisihHari: selisihHari, usiaData: usiaData
};
