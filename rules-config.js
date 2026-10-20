/* RencanaMampu — konfigurasi tunggal mesin aturan.
   Ubah ambang di sini atau lewat halaman Pengaturan (tersimpan lokal).
   Semua keputusan bersifat deterministik: tidak ada model AI di jalur ini. */
(function () {
  const RM = (window.RM = window.RM || {});

  const DIMENSIONS = [
    { id: 'waktu', label: 'Waktu', short: 'Waktu', icon: 'clock' },
    { id: 'keterampilan', label: 'Keterampilan', short: 'Terampil', icon: 'skill' },
    { id: 'pendamping', label: 'Pendamping', short: 'Damping', icon: 'users' },
    { id: 'transportasi', label: 'Transportasi', short: 'Transport', icon: 'route' },
    { id: 'biaya', label: 'Biaya', short: 'Biaya', icon: 'wallet' },
    { id: 'alat', label: 'Alat & rumah', short: 'Alat', icon: 'home' },
    { id: 'digital', label: 'Digital', short: 'Digital', icon: 'phone' }
  ];

  const LEVELS = {
    sesuai: { rank: 0, label: 'Sesuai', icon: 'check' },
    perhatian: { rank: 1, label: 'Perlu perhatian', icon: 'alert' },
    konflik: { rank: 2, label: 'Konflik', icon: 'x' }
  };

  const KATEGORI = {
    obat: 'Obat', suntik: 'Suntik / insulin', luka: 'Perawatan luka', pemantauan: 'Pemantauan',
    diet: 'Diet', latihan: 'Latihan / mobilisasi', kontrol: 'Kontrol / jadwal', alat: 'Alat'
  };

  const SLOTS = {
    pagi: { label: 'Pagi (06–12)', from: 6, to: 12 },
    siang: { label: 'Siang (12–18)', from: 12, to: 18 },
    malam: { label: 'Malam (18–22)', from: 18, to: 22 }
  };

  const KATEGORI_BIAYA = {
    sangat_terbatas: { label: 'Sangat terbatas', nominal: 150000 },
    terbatas: { label: 'Terbatas', nominal: 400000 },
    cukup: { label: 'Cukup', nominal: 900000 },
    lebih: { label: 'Lebih dari cukup', nominal: 2000000 }
  };

  const KETERAMPILAN = { tidak: 'Tidak ada', dasar: 'Dasar', terlatih: 'Terlatih' };

  const DETAIL_RUMAH = {
    listrik: 'Listrik stabil', kulkas: 'Kulkas', air: 'Air bersih', ruang: 'Ruang untuk alat'
  };

  const DETAIL_DIGITAL = { ponsel: 'Ponsel', wa: 'WhatsApp', video: 'Video call' };

  const KATALOG = [
    {
      id: 'kunjungan_rumah', label: 'Kunjungan rumah perawat / kader', jenis: 'dukungan',
      dimensi: ['transportasi', 'waktu', 'keterampilan'],
      deskripsi: 'Tenaga kesehatan atau kader datang ke rumah untuk tugas yang sulit dijangkau.',
      efek: { hapusTransport: true, jamTambahPerHari: 1 }
    },
    {
      id: 'telekonsultasi', label: 'Kontrol via telekonsultasi', jenis: 'penyesuaian',
      dimensi: ['transportasi', 'digital'],
      deskripsi: 'Sebagian kontrol diganti percakapan jarak jauh; klinisi memutuskan kelayakannya.',
      efek: { kunjunganFaktor: 0.5 }
    },
    {
      id: 'latih_pendamping', label: 'Latih pendamping sebelum pulang (teach-back)', jenis: 'dukungan',
      dimensi: ['keterampilan', 'pendamping'],
      deskripsi: 'Pendamping berlatih dan mendemonstrasikan ulang keterampilan sebelum pasien pulang.',
      efek: { latihPendamping: true, jamTambahPerHari: 0.5 }
    },
    {
      id: 'gabung_jadwal', label: 'Gabungkan jadwal kontrol ke satu hari', jenis: 'penyesuaian',
      dimensi: ['transportasi', 'waktu'],
      deskripsi: 'Beberapa kontrol disatukan agar jumlah perjalanan berkurang.',
      efek: { kunjunganFaktor: 0.5 }
    },
    {
      id: 'pekerja_sosial', label: 'Rujuk ke pekerja sosial / bantuan transportasi', jenis: 'dukungan',
      dimensi: ['biaya', 'transportasi'],
      deskripsi: 'Membuka bantuan biaya atau transportasi yang tersedia di layanan.',
      efek: { biayaBantuan: 300000, transportBantuan: true }
    },
    {
      id: 'sederhanakan_jadwal', label: 'Sederhanakan jadwal (oleh klinisi)', jenis: 'penyesuaian',
      dimensi: ['waktu', 'beban'],
      deskripsi: 'Klinisi meninjau ulang frekuensi tugas yang boleh disederhanakan. Bukan perubahan terapi otomatis.',
      efek: { bebanFaktor: 0.75 }
    },
    {
      id: 'pendamping_cadangan', label: 'Pendamping cadangan', jenis: 'dukungan',
      dimensi: ['pendamping', 'waktu'],
      deskripsi: 'Satu anggota keluarga atau tetangga bersedia menjadi cadangan pada jam tertentu.',
      efek: { jamTambahPerHari: 2, pendampingTambah: 1 }
    },
    {
      id: 'pengingat_wa', label: 'Pengingat WhatsApp', jenis: 'dukungan',
      dimensi: ['digital', 'waktu'],
      deskripsi: 'Pengingat sederhana untuk jadwal obat atau kontrol.',
      efek: { digitalTambah: ['wa'], bebanFaktor: 0.95 }
    },
    {
      id: 'sewa_alat', label: 'Pinjam / sewa alat penunjang', jenis: 'dukungan',
      dimensi: ['alat'],
      deskripsi: 'Menyediakan alat atau syarat rumah yang belum ada.',
      efek: { alatTambah: ['kulkas', 'ruang'] }
    },
    {
      id: 'rujuk_puskesmas', label: 'Rujuk tugas rutin ke puskesmas terdekat', jenis: 'dukungan',
      dimensi: ['transportasi', 'waktu', 'keterampilan'],
      deskripsi: 'Sebagian tugas rutin dikerjakan di fasilitas terdekat, bukan di rumah.',
      efek: { hapusTransport: true, kunjunganFaktor: 1 }
    }
  ];

  window.RM_CONFIG = {
    versi: '1.0.0',
    layanan: 'Bangsal Penyakit Dalam',
    hariKedaluwarsaData: 14,
    ambang: {
      jamTugasHarian: 3,
      menitPerjalananBulanan: 240,
      jumlahTugasHarian: 7,
      proporsiBiayaWaspada: 0.85,
      proporsiWaktuWaspada: 0.85
    },
    labelAmbang: {
      jamTugasHarian: { label: 'Batas jam tugas per hari', satuan: 'jam', min: 1, max: 12, step: 0.5,
        bantuan: 'Dipakai untuk membandingkan tuntutan tugas dengan jam pendamping yang tersedia.' },
      menitPerjalananBulanan: { label: 'Batas menit perjalanan per bulan', satuan: 'menit', min: 30, max: 1200, step: 30,
        bantuan: 'Total pulang-pergi kontrol yang masih dianggap wajar untuk satu keluarga.' },
      jumlahTugasHarian: { label: 'Batas jumlah tugas harian', satuan: 'tugas', min: 3, max: 20, step: 1,
        bantuan: 'Beban kumulatif: banyak tugas kecil tetap melelahkan meski masing-masing lolos.' },
      proporsiBiayaWaspada: { label: 'Ambang waspada biaya', satuan: '× kemampuan', min: 0.5, max: 1, step: 0.05,
        bantuan: 'Peringatan muncul sebelum biaya melampaui kemampuan bulanan.' },
      proporsiWaktuWaspada: { label: 'Ambang waspada waktu', satuan: '× ketersediaan', min: 0.5, max: 1, step: 0.05,
        bantuan: 'Peringatan muncul sebelum tuntutan waktu melampaui ketersediaan.' }
    },
    dimensi: DIMENSIONS,
    level: LEVELS,
    kategori: KATEGORI,
    slot: SLOTS,
    kategoriBiaya: KATEGORI_BIAYA,
    keterampilan: KETERAMPILAN,
    detailRumah: DETAIL_RUMAH,
    detailDigital: DETAIL_DIGITAL,
    katalog: KATALOG
  };
})();
