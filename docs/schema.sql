-- RencanaMampu — skema PostgreSQL (usulan untuk fase backend)
-- Prototipe HTML saat ini menyimpan data di localStorage. Berkas ini adalah
-- rancangan porting ke PostgreSQL/Supabase + Prisma; belum dijalankan di server.
--
-- Catatan kepatuhan: skema ini belum otomatis memenuhi UU PDP No. 27/2022 atau
-- Permenkes 24/2022. Autentikasi, otorisasi, enkripsi, retensi, dan penghapusan
-- wajib ditinjau bersama penanggung jawab perlindungan data fasilitas.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- layanan
create table layanan (
  id              uuid primary key default gen_random_uuid(),
  nama            text not null,
  freshness_hari  smallint not null default 14 check (freshness_hari between 1 and 90),
  ambang          jsonb not null default '{}'::jsonb,
  dibuat_pada     timestamptz not null default now(),
  dihapus_pada    timestamptz
);

-- ---------------------------------------------------------------- pengguna
-- Autentikasi sebaiknya ditangani penyedia identitas (Supabase Auth/SSO).
create table pengguna (
  id            uuid primary key default gen_random_uuid(),
  layanan_id    uuid references layanan(id),
  nama          text not null,
  email         text unique,
  peran         text not null check (peran in ('perencana', 'klinisi', 'admin')),
  aktif         boolean not null default true,
  dibuat_pada   timestamptz not null default now()
);

-- ---------------------------------------------------------------- pasien
-- Kode pasien adalah pseudonim. Nama lengkap dan nomor rekam medis tidak
-- disimpan di tabel ini; tautan ke rekam medis dilakukan di sistem terpisah.
create table pasien (
  id                uuid primary key default gen_random_uuid(),
  layanan_id        uuid not null references layanan(id),
  kode_pasien       text not null,
  usia              smallint check (usia between 0 and 120),
  diagnosis_ringkas text,
  tanggal_pulang    date,
  ruang             text,
  dibuat_oleh       uuid references pengguna(id),
  dibuat_pada       timestamptz not null default now(),
  dihapus_pada      timestamptz,
  unique (layanan_id, kode_pasien)
);
create index pasien_layanan_idx on pasien (layanan_id, tanggal_pulang) where dihapus_pada is null;

-- ---------------------------------------------------------------- persetujuan
create table persetujuan (
  id              uuid primary key default gen_random_uuid(),
  pasien_id       uuid not null references pasien(id) on delete cascade,
  diberikan_oleh  text not null,
  hubungan        text,
  cakupan         text not null,
  pada            timestamptz not null default now(),
  bukti           text,                 -- catatan cara consent diambil (lisan/tertulis)
  dicabut_pada    timestamptz
);
create index persetujuan_pasien_idx on persetujuan (pasien_id);

-- ---------------------------------------------------------------- profil kapasitas
-- Versi bertanggal. Profil lama tidak ditimpa; simpan versi baru.
create table profil_kapasitas (
  id              uuid primary key default gen_random_uuid(),
  pasien_id       uuid not null references pasien(id) on delete cascade,
  versi           integer not null,
  status          text not null check (status in ('draf', 'final')),
  persetujuan_id  uuid references persetujuan(id),
  diisi_oleh      text not null,
  sumber          text not null check (sumber in ('petugas', 'keluarga')),
  diperbarui_pada date not null default current_date,

  -- Rincian disimpan sebagai JSONB pada MVP; normalisasi bila kebutuhan laporan tumbuh.
  pendamping      jsonb not null default '[]'::jsonb,
  transportasi    jsonb not null default '{}'::jsonb,
  ekonomi         jsonb not null default '{}'::jsonb,
  rumah           jsonb not null default '{}'::jsonb,
  digital         jsonb not null default '{}'::jsonb,
  komunitas       jsonb not null default '{}'::jsonb,
  beban_awal      smallint check (beban_awal between 1 and 5),

  dibuat_pada     timestamptz not null default now(),
  unique (pasien_id, versi)
);
create index profil_pasien_idx on profil_kapasitas (pasien_id, versi desc);

-- ---------------------------------------------------------------- tugas perawatan
create table tugas_perawatan (
  id                  uuid primary key default gen_random_uuid(),
  pasien_id           uuid not null references pasien(id) on delete cascade,
  nama                text not null,
  kategori            text not null check (kategori in
                        ('obat','suntik','luka','pemantauan','diet','latihan','kontrol','alat')),
  frekuensi_per_hari  numeric(4,1) not null default 1 check (frekuensi_per_hari >= 0),
  menit_per_kali      smallint not null default 10 check (menit_per_kali >= 0),
  hari_aktif          smallint[] not null default '{0,1,2,3,4,5,6}',  -- 0 = Senin
  slot                text check (slot in ('pagi','siang','malam')),
  keterampilan       text not null default 'dasar' check (keterampilan in ('tidak','dasar','terlatih')),
  butuh_pendamping    boolean not null default false,
  butuh_transport     boolean not null default false,
  kontrol_per_bulan  numeric(4,1) not null default 0 check (kontrol_per_bulan >= 0),
  biaya_bulanan      numeric(12,0) not null default 0 check (biaya_bulanan >= 0),
  syarat_rumah        text[] not null default '{}',
  butuh_digital       text check (butuh_digital in ('ponsel','wa','video')),
  kritis              text not null default 'sedang' check (kritis in ('tinggi','sedang','rendah')),
  boleh_disederhanakan boolean not null default true,
  catatan             text,
  dibuat_oleh         uuid references pengguna(id),
  dibuat_pada         timestamptz not null default now(),
  dihapus_pada        timestamptz
);
create index tugas_pasien_idx on tugas_perawatan (pasien_id) where dihapus_pada is null;

-- ---------------------------------------------------------------- katalog opsi
create table opsi_katalog (
  id          text not null,          -- contoh: kunjungan_rumah
  layanan_id  uuid not null references layanan(id) on delete cascade,
  label       text not null,
  jenis       text not null check (jenis in ('penyesuaian','dukungan')),
  dimensi     text[] not null,
  deskripsi   text,
  efek        jsonb not null default '{}'::jsonb,
  aktif       boolean not null default true,
  primary key (layanan_id, id)
);

-- ---------------------------------------------------------------- konflik (snapshot)
-- Mesin aturan bersifat deterministik; tabel ini menyimpan snapshot saat tinjauan
-- agar keputusan tetap dapat diaudit walaupun profil berubah.
create table konflik_snapshot (
  id              uuid primary key default gen_random_uuid(),
  pasien_id       uuid not null references pasien(id) on delete cascade,
  profil_id       uuid references profil_kapasitas(id),
  finding_key     text not null,       -- id stabil: R4:transportasi:t1+t3
  rule_id         text not null,       -- R1..R8
  dimensi         text not null,
  tingkat         text not null check (tingkat in ('perhatian','konflik')),
  judul           text not null,
  alasan          text not null,
  detail          jsonb not null default '[]'::jsonb,
  tugas_ids       text[] not null default '{}',
  terdeteksi_pada timestamptz not null default now(),
  unique (pasien_id, finding_key, terdeteksi_pada)
);
create index konflik_pasien_idx on konflik_snapshot (pasien_id, terdeteksi_pada desc);

-- ---------------------------------------------------------------- keputusan klinisi
create table keputusan (
  id            uuid primary key default gen_random_uuid(),
  pasien_id     uuid not null references pasien(id) on delete cascade,
  finding_key   text not null,
  dimensi       text not null,
  tugas_ids     text[] not null default '{}',
  status        text not null check (status in ('sesuaikan','dukungan','risiko','tidak_selesai')),
  opsi_ids      text[] not null default '{}',
  catatan       text,
  oleh          uuid not null references pengguna(id),
  peran         text not null,          -- snapshot peran saat keputusan
  pada          timestamptz not null default now()
);
create index keputusan_pasien_idx on keputusan (pasien_id, finding_key);

-- ---------------------------------------------------------------- tindak lanjut
create table tindak_lanjut (
  id                uuid primary key default gen_random_uuid(),
  pasien_id         uuid not null references pasien(id) on delete cascade,
  hari              smallint not null check (hari in (7, 30)),
  tanggal           date not null default current_date,
  tugas_dijalankan  text[] not null default '{}',
  tugas_total       smallint not null default 0,
  kendala           text,
  beban             smallint not null check (beban between 1 and 5),
  rawat_ulang       boolean not null default false,
  catatan           text,
  oleh              uuid references pengguna(id),
  dibuat_pada       timestamptz not null default now(),
  unique (pasien_id, hari)
);

-- ---------------------------------------------------------------- tautan keluarga
create table tautan_keluarga (
  token_hash    text primary key,       -- simpan hash token, bukan token mentah
  pasien_id     uuid not null references pasien(id) on delete cascade,
  dibuat_pada   timestamptz not null default now(),
  kedaluwarsa   timestamptz not null,
  dicabut_pada  timestamptz,
  terakhir_akses timestamptz
);
create index tautan_pasien_idx on tautan_keluarga (pasien_id);

-- ---------------------------------------------------------------- umpan balik
create table umpan_balik (
  id          uuid primary key default gen_random_uuid(),
  pasien_id   uuid not null references pasien(id) on delete cascade,
  skor        smallint not null check (skor between 1 and 5),
  catatan     text,
  oleh        uuid references pengguna(id),
  pada        timestamptz not null default now(),
  unique (pasien_id, oleh)
);

-- ---------------------------------------------------------------- audit
-- Append-only. Jangan berikan hak update/delete ke aplikasi.
create table audit_log (
  id          bigserial primary key,
  pada        timestamptz not null default now(),
  aktor_id    uuid references pengguna(id),
  aktor_nama  text,
  peran       text,
  aksi        text not null,
  entitas     text,
  entitas_id  text,
  detail      jsonb not null default '{}'::jsonb,
  ip          inet,
  user_agent  text
);
create index audit_pasien_idx on audit_log (entitas, entitas_id, pada desc);
create index audit_pada_idx on audit_log (pada desc);

-- ---------------------------------------------------------------- panduan RLS (Supabase)
-- Aktifkan RLS pada semua tabel berisi data pasien, lalu batasi:
--   * perencana: select/insert/update pasien & profil dalam layanannya, tanpa akses lintas layanan.
--   * klinisi: select semua dalam layanan + insert keputusan.
--   * admin: kelola pengguna, ambang, katalog, dan audit; bukan membaca isi klinis tanpa dasar tugas.
--   * keluarga: TIDAK memakai role database. Akses hanya lewat endpoint token
--     berkedaluwarsa dengan respons terbatas (lihat docs/privasi.md).
--
-- Contoh:
-- alter table pasien enable row level security;
-- create policy pasien_layanan on pasien
--   using (layanan_id = (select layanan_id from pengguna where id = auth.uid()));
--
-- Enkripsi at-rest dan kolom sensitif (mis. pgcrypto) harus diputuskan bersama tim TI.
