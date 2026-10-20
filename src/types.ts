/* RencanaMampu — tipe domain. Bentuknya mengikuti data yang tersimpan di localStorage
   (lihat store.ts) dan usulan skema docs/schema.sql. */

export type Level = 'sesuai' | 'perhatian' | 'konflik';
export type Role = 'perencana' | 'klinisi' | 'admin';
export type DecisionStatus = 'sesuaikan' | 'dukungan' | 'risiko' | 'tidak_selesai';

/* ---------- Konfigurasi ---------- */
export interface Dimension { id: string; label: string; short: string; icon: string }

export interface OptionEffect {
  hapusTransport?: boolean;
  jamTambahPerHari?: number;
  kunjunganFaktor?: number;
  latihPendamping?: boolean;
  biayaBantuan?: number;
  transportBantuan?: boolean;
  bebanFaktor?: number;
  pendampingTambah?: number;
  digitalTambah?: string[];
  alatTambah?: string[];
}

export interface CatalogOption {
  id: string;
  label: string;
  jenis: 'penyesuaian' | 'dukungan';
  dimensi: string[];
  deskripsi: string;
  efek: OptionEffect;
  aktif?: boolean;
}

export interface AmbangMeta { label: string; satuan: string; min: number; max: number; step: number; bantuan: string }

export interface Config {
  versi: string;
  layanan: string;
  hariKedaluwarsaData: number;
  ambang: Record<string, number>;
  labelAmbang: Record<string, AmbangMeta>;
  dimensi: Dimension[];
  level: Record<Level, { rank: number; label: string; icon: string }>;
  kategori: Record<string, string>;
  slot: Record<string, { label: string; from: number; to: number }>;
  kategoriBiaya: Record<string, { label: string; nominal: number }>;
  keterampilan: Record<string, string>;
  detailRumah: Record<string, string>;
  detailDigital: Record<string, string>;
  katalog: CatalogOption[];
}

/* ---------- Data pasien & keluarga ---------- */
export interface Pasien { id: string; kode: string; usia: number; diagnosis: string; pulang: string; ruang: string }

export interface Companion {
  nama: string;
  hubungan: string;
  jamPerHari: number;
  hari: number[];
  bekerja: boolean;
  jamKerja: string[];
  keterbatasan: string;
  literasi: string;
  keterampilan: string[];
}

export interface Consent { diberikan: boolean; oleh: string; pada: string; cakupan?: string }

export interface Profile {
  id?: string;
  pasienId: string;
  versi: number;
  status: 'draf' | 'final';
  diperbarui: string;
  diisiOleh: string;
  sumber: string;
  consent: Consent;
  pendamping: Companion[];
  transportasi: { moda: string; jarakKm: number; menitSekali: number; biayaSekali: number; bisaSendiri: boolean };
  ekonomi: { kategori: string; biayaBulanan: number; jaminan: string };
  rumah: Record<string, boolean>;
  digital: Record<string, boolean>;
  komunitas: { kader: boolean; puskesmas: string; tetangga: boolean };
  bebanAwal: number;
}

export interface TaskInput {
  nama: string;
  kategori: string;
  perHari: number;
  menit: number;
  hari?: number[];
  slot: string;
  keterampilan: string;
  butuhPendamping: boolean;
  butuhTransport: boolean;
  perBulanKontrol: number;
  biayaBulanan: number;
  syaratRumah: string[];
  butuhDigital: string | null;
  kritis: string;
  bolehDisederhanakan: boolean;
  catatan: string;
  dihapus?: boolean;
}
export interface Task extends TaskInput { id: string }

export interface Template { id: string; label: string; kategori: string; data: Partial<TaskInput> }

export interface Decision {
  id?: string;
  pasienId?: string;
  findingId: string;
  dimensi: string;
  taskIds: string[];
  status: DecisionStatus;
  opsi: string[];
  catatan: string;
  pada?: string;
  oleh?: string;
  peran?: string;
  menitTinjau?: number | null;
}

export interface FollowUp {
  id?: string;
  pasienId?: string;
  tanggal?: string;
  oleh?: string;
  hari: number;
  tugasDijalankan: string[];
  tugasTotal: number;
  kendala: string;
  beban: number;
  rawatUlang: boolean;
  catatan: string;
}

export interface AuditEntry { id: string; pada: string; aktor: string; peran: string; aksi: string; target: string }
export interface Feedback { pasienId: string; skor: number; catatan: string; pada?: string }
export interface FamilyLink { pasienId: string; dibuat: string; kedaluwarsa: string }

export interface Meta {
  durasiProfilMenit: Record<string, number>;
  durasiTinjauMenit: Record<string, number>;
  umpanBalik: Feedback[];
}

export interface State {
  version: number;
  createdAt: string;
  layanan: string;
  role: Role;
  pasien: Pasien[];
  profiles: Record<string, Profile | null>;
  riwayatProfil: Record<string, Profile[]>;
  tasks: Record<string, Task[]>;
  decisions: Decision[];
  followUps: FollowUp[];
  audit: AuditEntry[];
  meta: Meta;
  config: Config;
  familyLinks: Record<string, FamilyLink>;
  counter: { decision: number; audit: number; profile: number };
}

/* ---------- Hasil mesin aturan ---------- */
export interface Finding {
  id: string;
  ruleId: string;
  dimensi: string;
  tingkat: Level;
  judul: string;
  alasan: string;
  taskIds: string[];
  pasienLevel: boolean;
  detail: { label: string; value: string }[];
  aturan: string;
}

export interface Effects {
  biayaBantuan: number;
  jamTambahPerHari: number;
  pendampingTambah: number;
  latihPendamping: boolean;
  hapusTransport: boolean;
  transportBantuan: boolean;
  kunjunganFaktor: number;
  bebanFaktor: number;
  alatTambah: string[];
  digitalTambah: string[];
}

export interface Transport {
  kontrol: Task[];
  baseTrips: number;
  trips: number;
  menit: number;
  biaya: number;
  menitSekali: number;
  biayaSekali: number;
  moda: string;
}

export interface Freshness { status: 'kosong' | 'draf' | 'kedaluwarsa' | 'segera' | 'segar'; hari: number | null; teks: string }
export interface Ringkas { aktif: number; terbuka: number; risiko: number; sebagian: number; selesai: number }
export interface MatrixRow { task: Task; byDim: Record<string, Level> }

export interface Computed {
  baseline: Finding[];
  effective: Finding[];
  effects: Effects;
  freshness: Freshness;
  matrix: MatrixRow[];
  ringkas: Ringkas;
  ringkasAwal: Ringkas;
  transport: Transport | null;
}

export interface Hasil extends Computed {
  pasien: Pasien;
  profile: Profile | null;
  tasks: Task[];
  decisions: Decision[];
  followUps: FollowUp[];
  fu7: FollowUp | null;
  fu30: FollowUp | null;
}

/* ---------- UI ---------- */
export interface TaskForm { mode: 'new' | 'edit'; taskId?: string; data: TaskInput; error: string }

export interface UiState {
  filter: string;
  q: string;
  formStep: number;
  draft: Profile | null;
  draftId: string | null;
  formErrors: string[];
  formStart: number | null;
  taskForm: TaskForm | null;
  editDecision: string | null;
  followDay: number;
  reviewStart: number | null;
  lastKey: string | null;
  scrollTask: boolean;
}

/* ---------- Uji ---------- */
export interface TestResult { group: string; name: string; ok: boolean; error?: string }
export interface TestSummary { total: number; passed: number; failed: number; results: TestResult[] }
