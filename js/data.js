/* RencanaMampu — data demo fiktif.
   Seluruh nama, kode, dan situasi adalah rekaan untuk pengujian prototipe.
   Tidak ada data pasien nyata di berkas ini. */
(function () {
  const RM = (window.RM = window.RM || {});
  const F = RM.fmt;
  const ALL = [0, 1, 2, 3, 4, 5, 6];
  const WEEK = [0, 1, 2, 3, 4];

  function task(pasienId, n, o) {
    return Object.assign({
      id: pasienId + '-t' + n,
      nama: 'Tugas',
      kategori: 'obat',
      perHari: 1,
      menit: 10,
      hari: ALL.slice(),
      slot: 'pagi',
      keterampilan: 'dasar',
      butuhPendamping: false,
      butuhTransport: false,
      perBulanKontrol: 0,
      biayaBulanan: 0,
      syaratRumah: [],
      butuhDigital: null,
      kritis: 'sedang',
      bolehDisederhanakan: true,
      catatan: ''
    }, o);
  }

  const TEMPLATES = [
    {
      id: 'tpl-insulin', label: 'Injeksi insulin', kategori: 'suntik',
      data: { nama: 'Injeksi insulin', kategori: 'suntik', perHari: 2, menit: 10, slot: 'pagi', keterampilan: 'terlatih', butuhPendamping: true, biayaBulanan: 250000, syaratRumah: ['kulkas'], kritis: 'tinggi', bolehDisederhanakan: false }
    },
    {
      id: 'tpl-obat', label: 'Obat rutin oral', kategori: 'obat',
      data: { nama: 'Obat rutin oral', kategori: 'obat', perHari: 2, menit: 5, slot: 'pagi', keterampilan: 'dasar', biayaBulanan: 120000, kritis: 'tinggi' }
    },
    {
      id: 'tpl-luka', label: 'Perawatan luka', kategori: 'luka',
      data: { nama: 'Perawatan luka kaki', kategori: 'luka', perHari: 1, menit: 20, slot: 'pagi', keterampilan: 'terlatih', butuhPendamping: true, biayaBulanan: 180000, syaratRumah: ['air'], kritis: 'tinggi' }
    },
    {
      id: 'tpl-gula', label: 'Cek gula darah', kategori: 'pemantauan',
      data: { nama: 'Cek gula darah mandiri', kategori: 'pemantauan', perHari: 2, menit: 5, keterampilan: 'dasar', biayaBulanan: 150000, kritis: 'sedang' }
    },
    {
      id: 'tpl-td', label: 'Ukur tekanan darah', kategori: 'pemantauan',
      data: { nama: 'Ukur tekanan darah', kategori: 'pemantauan', perHari: 2, menit: 5, keterampilan: 'dasar', biayaBulanan: 30000, kritis: 'sedang' }
    },
    {
      id: 'tpl-cairan', label: 'Catat cairan & berat', kategori: 'pemantauan',
      data: { nama: 'Catat cairan masuk dan berat badan', kategori: 'pemantauan', perHari: 1, menit: 10, keterampilan: 'dasar', butuhDigital: 'wa', kritis: 'tinggi' }
    },
    {
      id: 'tpl-kontrol', label: 'Kontrol ke fasilitas', kategori: 'kontrol',
      data: { nama: 'Kontrol luka ke fasilitas', kategori: 'kontrol', perHari: 0, menit: 60, perBulanKontrol: 4, butuhTransport: true, butuhPendamping: true, kritis: 'tinggi', bolehDisederhanakan: true }
    },
    {
      id: 'tpl-lab', label: 'Cek laboratorium', kategori: 'kontrol',
      data: { nama: 'Cek laboratorium rutin', kategori: 'kontrol', perHari: 0, menit: 60, perBulanKontrol: 1, butuhTransport: true, kritis: 'sedang' }
    },
    {
      id: 'tpl-diet', label: 'Diet khusus', kategori: 'diet',
      data: { nama: 'Diet rendah gula dan garam', kategori: 'diet', perHari: 1, menit: 15, keterampilan: 'dasar', kritis: 'sedang' }
    },
    {
      id: 'tpl-mobilisasi', label: 'Latihan mobilisasi', kategori: 'latihan',
      data: { nama: 'Latihan mobilisasi ringan', kategori: 'latihan', perHari: 2, menit: 15, slot: 'pagi', keterampilan: 'dasar', butuhPendamping: true, kritis: 'sedang' }
    },
    {
      id: 'tpl-ngt', label: 'Makan via selang (NGT)', kategori: 'alat',
      data: { nama: 'Pemberian makan via selang NGT', kategori: 'alat', perHari: 4, menit: 30, slot: 'pagi', keterampilan: 'terlatih', butuhPendamping: true, biayaBulanan: 300000, syaratRumah: ['air'], kritis: 'tinggi', bolehDisederhanakan: false }
    },
    {
      id: 'tpl-tele', label: 'Telekonsultasi', kategori: 'kontrol',
      data: { nama: 'Telekonsultasi dengan perawat', kategori: 'kontrol', perHari: 0, menit: 20, perBulanKontrol: 1, butuhDigital: 'video', kritis: 'rendah' }
    }
  ];

  function companion(nama, hubungan, jamPerHari, hari, bekerja, jamKerja, keterbatasan, literasi, keterampilan) {
    return {
      nama: nama, hubungan: hubungan, jamPerHari: jamPerHari, hari: hari.slice(),
      bekerja: !!bekerja, jamKerja: jamKerja || [],
      keterbatasan: keterbatasan || '', literasi: literasi || 'cukup',
      keterampilan: keterampilan || []
    };
  }

  function profile(pasienId, versi, diperbarui, o) {
    return Object.assign({
      id: pasienId + '-p' + versi,
      pasienId: pasienId,
      versi: versi,
      status: 'final',
      diperbarui: diperbarui,
      diisiOleh: 'Ns. Rina Kusuma',
      sumber: 'petugas',
      consent: {
        diberikan: true,
        oleh: 'Keluarga pasien',
        pada: diperbarui,
        cakupan: 'Data kapasitas keluarga untuk perencanaan pulang; dapat dihapus atas permintaan.'
      },
      pendamping: [],
      transportasi: { moda: 'motor', jarakKm: 8, menitSekali: 20, biayaSekali: 15000, bisaSendiri: false },
      ekonomi: { kategori: 'terbatas', biayaBulanan: 400000, jaminan: 'BPJS' },
      rumah: { listrik: true, kulkas: true, air: true, ruang: false },
      digital: { ponsel: true, wa: true, video: false },
      komunitas: { kader: false, puskesmas: 'Puskesmas Sukamaju', tetangga: false },
      bebanAwal: 3
    }, o);
  }

  function build() {
    const pasien = [
      { id: 'P01', kode: 'RM-014', usia: 58, diagnosis: 'DM tipe 2 + hipertensi + ulkus kaki', pulang: F.addDays(2), ruang: 'Melati 3' },
      { id: 'P02', kode: 'RM-021', usia: 67, diagnosis: 'Pasca stroke iskemik, hemiparesis kiri', pulang: F.addDays(-8), ruang: 'Melati 1 (pasca pulang)' },
      { id: 'P03', kode: 'RM-033', usia: 71, diagnosis: 'Gagal jantung kongestif NYHA III', pulang: F.addDays(1), ruang: 'Anggrek 2' },
      { id: 'P04', kode: 'RM-046', usia: 49, diagnosis: 'DM tipe 2 dengan ulkus neuropati', pulang: F.addDays(-32), ruang: 'Melati 3 (pasca pulang)' },
      { id: 'P05', kode: 'RM-052', usia: 62, diagnosis: 'Hipertensi + penyakit ginjal kronik', pulang: F.addDays(4), ruang: 'Anggrek 1' },
      { id: 'P06', kode: 'RM-063', usia: 35, diagnosis: 'Pasca operasi fraktur femur', pulang: F.addDays(6), ruang: 'Kenanga 2' },
      { id: 'P07', kode: 'RM-077', usia: 74, diagnosis: 'Pasca stroke + disfagia, NGT', pulang: F.addDays(2), ruang: 'Melati 1' },
      { id: 'P08', kode: 'RM-081', usia: 56, diagnosis: 'DM tipe 2 tidak terkontrol + hipertensi', pulang: F.addDays(7), ruang: 'Melati 4' },
      { id: 'P09', kode: 'RM-090', usia: 68, diagnosis: 'Gagal jantung + ulkus tungkai', pulang: F.addDays(3), ruang: 'Anggrek 2' },
      { id: 'P10', kode: 'RM-102', usia: 60, diagnosis: 'Pasca stroke, rencana pulang awal', pulang: F.addDays(8), ruang: 'Kenanga 1' }
    ];

    const profiles = {
      P01: profile('P01', 3, F.addDays(-2), {
        pendamping: [
          companion('Ani', 'Istri', 6, ALL, false, [], 'Nyeri lutut bila berdiri lama', 'cukup', ['obat']),
          companion('Rian', 'Anak', 2, [5, 6], true, ['pagi', 'siang'], '', 'cukup', [])
        ],
        transportasi: { moda: 'motor', jarakKm: 9, menitSekali: 25, biayaSekali: 18000, bisaSendiri: false },
        ekonomi: { kategori: 'terbatas', biayaBulanan: 400000, jaminan: 'BPJS' },
        rumah: { listrik: true, kulkas: false, air: true, ruang: false },
        digital: { ponsel: true, wa: true, video: false },
        komunitas: { kader: true, puskesmas: 'Puskesmas Sukamaju', tetangga: false },
        bebanAwal: 4
      }),
      P02: profile('P02', 2, F.addDays(-3), {
        pendamping: [
          companion('Sari', 'Anak', 3, WEEK, true, ['pagi', 'siang'], '', 'cukup', ['obat']),
          companion('Bambang', 'Suami', 2, [5, 6], false, [], 'Pendengaran terbatas', 'cukup', [])
        ],
        transportasi: { moda: 'angkutan', jarakKm: 14, menitSekali: 45, biayaSekali: 12000, bisaSendiri: false },
        ekonomi: { kategori: 'terbatas', biayaBulanan: 400000, jaminan: 'BPJS' },
        rumah: { listrik: true, kulkas: true, air: true, ruang: false },
        digital: { ponsel: true, wa: true, video: false },
        komunitas: { kader: false, puskesmas: 'Puskesmas Cempaka', tetangga: true },
        bebanAwal: 5
      }),
      P03: profile('P03', 1, F.addDays(-1), {
        pendamping: [
          companion('Joko', 'Tetangga', 1, ALL, false, [], 'Bukan anggota keluarga inti', 'terbatas', [])
        ],
        transportasi: { moda: 'tidak', jarakKm: 6, menitSekali: 30, biayaSekali: 0, bisaSendiri: false },
        ekonomi: { kategori: 'sangat_terbatas', biayaBulanan: 150000, jaminan: 'BPJS' },
        rumah: { listrik: true, kulkas: true, air: true, ruang: false },
        digital: { ponsel: true, wa: false, video: false },
        komunitas: { kader: true, puskesmas: 'Puskesmas Cempaka', tetangga: true },
        bebanAwal: 5
      }),
      P04: profile('P04', 4, F.addDays(-6), {
        pendamping: [
          companion('Dewi', 'Istri', 8, ALL, false, [], '', 'cukup', ['obat', 'luka', 'suntik']),
          companion('Yusuf', 'Anak', 4, [5, 6], true, ['pagi'], '', 'cukup', ['obat'])
        ],
        transportasi: { moda: 'mobil', jarakKm: 11, menitSekali: 20, biayaSekali: 25000, bisaSendiri: false },
        ekonomi: { kategori: 'cukup', biayaBulanan: 900000, jaminan: 'BPJS' },
        rumah: { listrik: true, kulkas: true, air: true, ruang: true },
        digital: { ponsel: true, wa: true, video: true },
        komunitas: { kader: true, puskesmas: 'Puskesmas Sukamaju', tetangga: true },
        bebanAwal: 2
      }),
      P05: profile('P05', 2, F.addDays(-22), {
        pendamping: [
          companion('Sutrisno', 'Suami', 5, ALL, false, [], '', 'cukup', [])
        ],
        transportasi: { moda: 'angkutan', jarakKm: 7, menitSekali: 30, biayaSekali: 10000, bisaSendiri: false },
        ekonomi: { kategori: 'terbatas', biayaBulanan: 400000, jaminan: 'BPJS' },
        rumah: { listrik: true, kulkas: false, air: true, ruang: false },
        digital: { ponsel: true, wa: true, video: false },
        komunitas: { kader: false, puskesmas: 'Puskesmas Cempaka', tetangga: false },
        bebanAwal: 3
      }),
      P06: profile('P06', 1, F.addDays(-4), {
        pendamping: [
          companion('Nadia', 'Istri', 6, ALL, false, [], '', 'cukup', ['obat', 'luka']),
          companion('Rudi', 'Adik', 4, WEEK, false, [], '', 'cukup', []),
          companion('Ibu Sri', 'Ibu', 8, ALL, false, [], 'Lansia, perlu dibantu', 'cukup', ['obat'])
        ],
        transportasi: { moda: 'mobil', jarakKm: 5, menitSekali: 15, biayaSekali: 20000, bisaSendiri: false },
        ekonomi: { kategori: 'cukup', biayaBulanan: 900000, jaminan: 'BPJS' },
        rumah: { listrik: true, kulkas: true, air: true, ruang: true },
        digital: { ponsel: true, wa: true, video: true },
        komunitas: { kader: true, puskesmas: 'Puskesmas Kenanga', tetangga: true },
        bebanAwal: 1
      }),
      P07: profile('P07', 2, F.addDays(-2), {
        pendamping: [
          companion('Putri', 'Anak', 4, WEEK, true, ['pagi', 'siang'], '', 'cukup', ['obat'])
        ],
        transportasi: { moda: 'motor', jarakKm: 12, menitSekali: 40, biayaSekali: 20000, bisaSendiri: false },
        ekonomi: { kategori: 'terbatas', biayaBulanan: 400000, jaminan: 'BPJS' },
        rumah: { listrik: true, kulkas: true, air: true, ruang: false },
        digital: { ponsel: true, wa: true, video: false },
        komunitas: { kader: false, puskesmas: 'Puskesmas Cempaka', tetangga: false },
        bebanAwal: 4
      }),
      P08: profile('P08', 1, F.addDays(-10), {
        pendamping: [
          companion('Rohayah', 'Istri', 3, ALL, false, [], '', 'terbatas', [])
        ],
        transportasi: { moda: 'tidak', jarakKm: 4, menitSekali: 50, biayaSekali: 0, bisaSendiri: false },
        ekonomi: { kategori: 'sangat_terbatas', biayaBulanan: 150000, jaminan: 'BPJS' },
        rumah: { listrik: true, kulkas: false, air: false, ruang: false },
        digital: { ponsel: false, wa: false, video: false },
        komunitas: { kader: false, puskesmas: 'Puskesmas Sukamaju', tetangga: false },
        bebanAwal: 5
      }),
      P09: profile('P09', 1, F.addDays(-5), {
        pendamping: [
          companion('Andi', 'Anak', 2, ALL, true, ['siang', 'malam'], '', 'cukup', ['obat']),
          companion('Wati', 'Tetangga', 1, ALL, false, [], '', 'cukup', [])
        ],
        transportasi: { moda: 'motor', jarakKm: 7, menitSekali: 20, biayaSekali: 15000, bisaSendiri: false },
        ekonomi: { kategori: 'terbatas', biayaBulanan: 400000, jaminan: 'BPJS' },
        rumah: { listrik: true, kulkas: true, air: true, ruang: true },
        digital: { ponsel: true, wa: true, video: true },
        komunitas: { kader: true, puskesmas: 'Puskesmas Cempaka', tetangga: true },
        bebanAwal: 3
      }),
      P10: null
    };

    const tasks = {
      P01: [
        task('P01', 1, { nama: 'Injeksi insulin', kategori: 'suntik', perHari: 2, menit: 10, slot: 'pagi', keterampilan: 'terlatih', butuhPendamping: true, biayaBulanan: 250000, syaratRumah: ['kulkas'], kritis: 'tinggi', bolehDisederhanakan: false }),
        task('P01', 2, { nama: 'Obat rutin oral', kategori: 'obat', perHari: 2, menit: 5, keterampilan: 'dasar', biayaBulanan: 120000, kritis: 'tinggi' }),
        task('P01', 3, { nama: 'Perawatan luka kaki', kategori: 'luka', perHari: 1, menit: 20, keterampilan: 'terlatih', butuhPendamping: true, biayaBulanan: 180000, syaratRumah: ['air'], kritis: 'tinggi' }),
        task('P01', 4, { nama: 'Cek gula darah mandiri', kategori: 'pemantauan', perHari: 2, menit: 5, keterampilan: 'dasar', biayaBulanan: 150000, kritis: 'sedang' }),
        task('P01', 5, { nama: 'Kontrol luka ke fasilitas', kategori: 'kontrol', perHari: 0, menit: 60, perBulanKontrol: 4, butuhTransport: true, butuhPendamping: true, kritis: 'tinggi' }),
        task('P01', 6, { nama: 'Diet rendah gula dan garam', kategori: 'diet', perHari: 1, menit: 15, keterampilan: 'dasar', kritis: 'sedang' })
      ],
      P02: [
        task('P02', 1, { nama: 'Obat rutin oral', kategori: 'obat', perHari: 3, menit: 5, keterampilan: 'dasar', biayaBulanan: 160000, kritis: 'tinggi' }),
        task('P02', 2, { nama: 'Latihan mobilisasi ringan', kategori: 'latihan', perHari: 2, menit: 20, slot: 'pagi', keterampilan: 'dasar', butuhPendamping: true, kritis: 'sedang' }),
        task('P02', 3, { nama: 'Kontrol poli saraf', kategori: 'kontrol', perHari: 0, menit: 60, perBulanKontrol: 4, butuhTransport: true, butuhPendamping: true, kritis: 'tinggi' }),
        task('P02', 4, { nama: 'Ukur tekanan darah', kategori: 'pemantauan', perHari: 2, menit: 5, keterampilan: 'dasar', biayaBulanan: 30000, kritis: 'sedang' }),
        task('P02', 5, { nama: 'Diet rendah garam', kategori: 'diet', perHari: 1, menit: 15, keterampilan: 'dasar', kritis: 'rendah' })
      ],
      P03: [
        task('P03', 1, { nama: 'Obat jantung rutin', kategori: 'obat', perHari: 2, menit: 5, keterampilan: 'dasar', biayaBulanan: 200000, kritis: 'tinggi', bolehDisederhanakan: false }),
        task('P03', 2, { nama: 'Catat cairan masuk dan berat badan', kategori: 'pemantauan', perHari: 1, menit: 10, keterampilan: 'dasar', butuhDigital: 'wa', kritis: 'tinggi' }),
        task('P03', 3, { nama: 'Kontrol poli jantung', kategori: 'kontrol', perHari: 0, menit: 60, perBulanKontrol: 2, butuhTransport: true, butuhPendamping: true, kritis: 'tinggi' }),
        task('P03', 4, { nama: 'Diet rendah garam', kategori: 'diet', perHari: 1, menit: 15, keterampilan: 'dasar', kritis: 'sedang' }),
        task('P03', 5, { nama: 'Ukur tekanan darah', kategori: 'pemantauan', perHari: 2, menit: 5, keterampilan: 'dasar', biayaBulanan: 30000, kritis: 'sedang' })
      ],
      P04: [
        task('P04', 1, { nama: 'Injeksi insulin', kategori: 'suntik', perHari: 2, menit: 10, slot: 'pagi', keterampilan: 'terlatih', butuhPendamping: true, biayaBulanan: 250000, syaratRumah: ['kulkas'], kritis: 'tinggi', bolehDisederhanakan: false }),
        task('P04', 2, { nama: 'Perawatan luka kaki', kategori: 'luka', perHari: 1, menit: 20, slot: 'pagi', keterampilan: 'terlatih', butuhPendamping: true, biayaBulanan: 180000, syaratRumah: ['air'], kritis: 'tinggi' }),
        task('P04', 3, { nama: 'Obat rutin oral', kategori: 'obat', perHari: 2, menit: 5, keterampilan: 'dasar', biayaBulanan: 120000, kritis: 'tinggi' }),
        task('P04', 4, { nama: 'Cek gula darah mandiri', kategori: 'pemantauan', perHari: 2, menit: 5, keterampilan: 'dasar', biayaBulanan: 150000, kritis: 'sedang' }),
        task('P04', 5, { nama: 'Ukur tekanan darah', kategori: 'pemantauan', perHari: 2, menit: 5, keterampilan: 'dasar', biayaBulanan: 30000, kritis: 'sedang' }),
        task('P04', 6, { nama: 'Diet rendah gula dan garam', kategori: 'diet', perHari: 1, menit: 15, keterampilan: 'dasar', kritis: 'sedang' }),
        task('P04', 7, { nama: 'Latihan mobilisasi ringan', kategori: 'latihan', perHari: 1, menit: 15, slot: 'pagi', keterampilan: 'dasar', butuhPendamping: true, kritis: 'rendah' }),
        task('P04', 8, { nama: 'Kontrol luka ke fasilitas', kategori: 'kontrol', perHari: 0, menit: 60, perBulanKontrol: 2, butuhTransport: true, butuhPendamping: true, kritis: 'tinggi' }),
        task('P04', 9, { nama: 'Latihan pernapasan', kategori: 'latihan', perHari: 1, menit: 10, keterampilan: 'dasar', kritis: 'rendah' })
      ],
      P05: [
        task('P05', 1, { nama: 'Obat hipertensi dan ginjal', kategori: 'obat', perHari: 2, menit: 5, keterampilan: 'dasar', biayaBulanan: 180000, kritis: 'tinggi' }),
        task('P05', 2, { nama: 'Ukur tekanan darah', kategori: 'pemantauan', perHari: 2, menit: 5, keterampilan: 'dasar', biayaBulanan: 30000, kritis: 'sedang' }),
        task('P05', 3, { nama: 'Diet rendah garam dan protein', kategori: 'diet', perHari: 1, menit: 15, keterampilan: 'dasar', kritis: 'sedang' }),
        task('P05', 4, { nama: 'Kontrol poli ginjal', kategori: 'kontrol', perHari: 0, menit: 60, perBulanKontrol: 2, butuhTransport: true, butuhPendamping: true, kritis: 'tinggi' }),
        task('P05', 5, { nama: 'Cek laboratorium rutin', kategori: 'kontrol', perHari: 0, menit: 60, perBulanKontrol: 1, butuhTransport: true, kritis: 'sedang' })
      ],
      P06: [
        task('P06', 1, { nama: 'Obat nyeri dan antibiotik oral', kategori: 'obat', perHari: 3, menit: 5, keterampilan: 'dasar', biayaBulanan: 210000, kritis: 'tinggi' }),
        task('P06', 2, { nama: 'Perawatan luka operasi', kategori: 'luka', perHari: 1, menit: 15, slot: 'pagi', keterampilan: 'terlatih', butuhPendamping: true, biayaBulanan: 140000, syaratRumah: ['air'], kritis: 'tinggi' }),
        task('P06', 3, { nama: 'Latihan mobilisasi ringan', kategori: 'latihan', perHari: 2, menit: 20, slot: 'pagi', keterampilan: 'dasar', butuhPendamping: true, kritis: 'sedang' }),
        task('P06', 4, { nama: 'Kontrol jahitan', kategori: 'kontrol', perHari: 0, menit: 60, perBulanKontrol: 2, butuhTransport: true, butuhPendamping: true, kritis: 'sedang' }),
        task('P06', 5, { nama: 'Diet tinggi protein', kategori: 'diet', perHari: 1, menit: 15, keterampilan: 'dasar', kritis: 'rendah' }),
        task('P06', 6, { nama: 'Ukur tekanan darah', kategori: 'pemantauan', perHari: 1, menit: 5, keterampilan: 'dasar', biayaBulanan: 30000, kritis: 'rendah' })
      ],
      P07: [
        task('P07', 1, { nama: 'Obat rutin oral', kategori: 'obat', perHari: 2, menit: 5, keterampilan: 'dasar', biayaBulanan: 120000, kritis: 'tinggi' }),
        task('P07', 2, { nama: 'Pemberian makan via selang NGT', kategori: 'alat', perHari: 4, menit: 30, slot: 'pagi', keterampilan: 'terlatih', butuhPendamping: true, biayaBulanan: 300000, syaratRumah: ['air'], kritis: 'tinggi', bolehDisederhanakan: false }),
        task('P07', 3, { nama: 'Latihan mobilisasi ringan', kategori: 'latihan', perHari: 2, menit: 15, slot: 'pagi', keterampilan: 'dasar', butuhPendamping: true, kritis: 'sedang' }),
        task('P07', 4, { nama: 'Kontrol poli saraf', kategori: 'kontrol', perHari: 0, menit: 60, perBulanKontrol: 3, butuhTransport: true, butuhPendamping: true, kritis: 'tinggi' }),
        task('P07', 5, { nama: 'Diet cair tinggi kalori', kategori: 'diet', perHari: 1, menit: 20, keterampilan: 'dasar', kritis: 'sedang' }),
        task('P07', 6, { nama: 'Ukur tekanan darah', kategori: 'pemantauan', perHari: 2, menit: 5, keterampilan: 'dasar', biayaBulanan: 30000, kritis: 'sedang' })
      ],
      P08: [
        task('P08', 1, { nama: 'Injeksi insulin', kategori: 'suntik', perHari: 2, menit: 10, slot: 'pagi', keterampilan: 'terlatih', butuhPendamping: true, biayaBulanan: 250000, syaratRumah: ['kulkas'], kritis: 'tinggi', bolehDisederhanakan: false }),
        task('P08', 2, { nama: 'Obat hipertensi oral', kategori: 'obat', perHari: 2, menit: 5, keterampilan: 'dasar', biayaBulanan: 120000, kritis: 'tinggi' }),
        task('P08', 3, { nama: 'Ukur tekanan darah', kategori: 'pemantauan', perHari: 2, menit: 5, keterampilan: 'dasar', biayaBulanan: 30000, kritis: 'sedang' }),
        task('P08', 4, { nama: 'Kirim catatan gula darah via WhatsApp', kategori: 'pemantauan', perHari: 1, menit: 5, keterampilan: 'dasar', butuhDigital: 'wa', kritis: 'sedang' }),
        task('P08', 5, { nama: 'Kontrol poli penyakit dalam', kategori: 'kontrol', perHari: 0, menit: 60, perBulanKontrol: 2, butuhTransport: true, butuhPendamping: true, kritis: 'tinggi' }),
        task('P08', 6, { nama: 'Diet rendah gula', kategori: 'diet', perHari: 1, menit: 15, keterampilan: 'dasar', kritis: 'sedang' })
      ],
      P09: [
        task('P09', 1, { nama: 'Obat jantung rutin', kategori: 'obat', perHari: 2, menit: 5, keterampilan: 'dasar', biayaBulanan: 200000, kritis: 'tinggi', bolehDisederhanakan: false }),
        task('P09', 2, { nama: 'Perawatan luka tungkai', kategori: 'luka', perHari: 1, menit: 20, slot: 'pagi', keterampilan: 'terlatih', butuhPendamping: true, biayaBulanan: 180000, syaratRumah: ['air'], kritis: 'tinggi' }),
        task('P09', 3, { nama: 'Catat berat badan harian', kategori: 'pemantauan', perHari: 1, menit: 10, keterampilan: 'dasar', butuhDigital: 'wa', kritis: 'sedang' }),
        task('P09', 4, { nama: 'Kontrol luka ke fasilitas', kategori: 'kontrol', perHari: 0, menit: 60, perBulanKontrol: 2, butuhTransport: true, butuhPendamping: true, kritis: 'tinggi' }),
        task('P09', 5, { nama: 'Diet rendah garam', kategori: 'diet', perHari: 1, menit: 15, keterampilan: 'dasar', kritis: 'sedang' })
      ],
      P10: []
    };

    const decisions = [
      {
        id: 'D-001', pasienId: 'P02', findingId: 'R4:transportasi:P02-t3', dimensi: 'transportasi',
        taskIds: ['P02-t3'], status: 'sesuaikan',
        opsi: ['gabung_jadwal'],
        catatan: 'Kontrol poli saraf dan pengambilan obat disatukan pada hari yang sama. Dievaluasi lagi setelah hari ke-7.',
        oleh: 'dr. Maya Puspita', peran: 'klinisi', pada: F.addDays(-1)
      },
      {
        id: 'D-002', pasienId: 'P01', findingId: 'R5:biaya:P01-t1+P01-t2+P01-t3+P01-t4', dimensi: 'biaya',
        taskIds: ['P01-t1', 'P01-t2', 'P01-t3', 'P01-t4'], status: 'tidak_selesai',
        opsi: [],
        catatan: 'Bantuan biaya di layanan ini belum tersedia. Akan dibicarakan dengan pekerja sosial minggu depan; keluarga belum bisa menutup selisih.',
        oleh: 'dr. Maya Puspita', peran: 'klinisi', pada: F.addDays(-1)
      },
      {
        id: 'D-003', pasienId: 'P04', findingId: 'R8:beban:P04-t1+P04-t2+P04-t3+P04-t4+P04-t5+P04-t6+P04-t7+P04-t9', dimensi: 'beban',
        taskIds: ['P04-t1', 'P04-t2', 'P04-t3', 'P04-t4', 'P04-t5', 'P04-t6', 'P04-t7', 'P04-t9'], status: 'risiko',
        opsi: [],
        catatan: 'Keluarga memilih menjalankan seluruh tugas dan akan mencoba pembagian jadwal sendiri. Risiko kelelahan pendamping dicatat; ditinjau hari ke-7.',
        oleh: 'dr. Maya Puspita', peran: 'klinisi', pada: F.addDays(-2)
      }
    ];

    const followUps = [
      {
        id: 'FU-P02-7', pasienId: 'P02', hari: 7, tanggal: F.addDays(-1), oleh: 'Ns. Rina Kusuma',
        tugasDijalankan: ['P02-t1', 'P02-t2', 'P02-t4', 'P02-t5'], tugasTotal: 5,
        kendala: 'Kontrol pertama berhasil digabung. Anak harus izin kerja untuk mengantar; latihan mobilisasi sering terlewat saat pendamping pulang larut.',
        beban: 3, rawatUlang: false, catatan: 'Perlu pengingat latihan pagi.'
      },
      {
        id: 'FU-P04-7', pasienId: 'P04', hari: 7, tanggal: F.addDays(-25), oleh: 'Ns. Rina Kusuma',
        tugasDijalankan: ['P04-t1', 'P04-t2', 'P04-t3', 'P04-t4', 'P04-t5', 'P04-t6', 'P04-t7'], tugasTotal: 8,
        kendala: 'Semua tugas berjalan, tetapi istri merasa lelah pada hari kontrol.',
        beban: 2, rawatUlang: false, catatan: ''
      },
      {
        id: 'FU-P04-30', pasienId: 'P04', hari: 30, tanggal: F.addDays(-2), oleh: 'Ns. Rina Kusuma',
        tugasDijalankan: ['P04-t1', 'P04-t2', 'P04-t3', 'P04-t4', 'P04-t5', 'P04-t6'],
        tugasTotal: 8, kendala: 'Dua tugas pemantauan jarang dicatat, luka sudah membaik.',
        beban: 2, rawatUlang: false, catatan: 'Rencana dipertahankan.'
      },
    ];

    const audit = [
      { id: 'A01', pada: F.addDays(-6) + 'T09:12', aktor: 'Ns. Rina Kusuma', peran: 'perencana', aksi: 'Membuat profil kapasitas', target: 'RM-046 · versi 4' },
      { id: 'A02', pada: F.addDays(-5) + 'T10:05', aktor: 'Ns. Rina Kusuma', peran: 'perencana', aksi: 'Memperbarui tugas perawatan', target: 'RM-046 · 8 tugas' },
      { id: 'A03', pada: F.addDays(-4) + 'T14:20', aktor: 'dr. Maya Puspita', peran: 'klinisi', aksi: 'Mencatat keputusan', target: 'RM-090 · transportasi' },
      { id: 'A04', pada: F.addDays(-3) + 'T08:40', aktor: 'Ns. Rina Kusuma', peran: 'perencana', aksi: 'Mengisi formulir tindak lanjut hari 7', target: 'RM-021' },
      { id: 'A05', pada: F.addDays(-2) + 'T11:15', aktor: 'dr. Maya Puspita', peran: 'klinisi', aksi: 'Menerima risiko beban kumulatif', target: 'RM-046' },
      { id: 'A06', pada: F.addDays(-2) + 'T15:02', aktor: 'Ns. Rina Kusuma', peran: 'perencana', aksi: 'Memperbarui profil kapasitas', target: 'RM-014 · versi 3' },
      { id: 'A07', pada: F.addDays(-1) + 'T09:30', aktor: 'dr. Maya Puspita', peran: 'klinisi', aksi: 'Menyesuaikan jadwal kontrol', target: 'RM-021' },
      { id: 'A08', pada: F.addDays(-1) + 'T13:45', aktor: 'Ns. Rina Kusuma', peran: 'perencana', aksi: 'Menyimpan draf profil kapasitas', target: 'RM-102' }
    ];

    const salinan = function (o) { return JSON.parse(JSON.stringify(o)); };
    const riwayatProfil = {
      P01: [
        Object.assign(salinan(profiles.P01), { id: 'P01-p2', versi: 2, diperbarui: F.addDays(-14), diisiOleh: 'Ns. Rina Kusuma' }),
        Object.assign(salinan(profiles.P01), { id: 'P01-p1', versi: 1, diperbarui: F.addDays(-30), diisiOleh: 'Ns. Rina Kusuma' })
      ],
      P04: [
        Object.assign(salinan(profiles.P04), { id: 'P04-p3', versi: 3, diperbarui: F.addDays(-16), diisiOleh: 'Ns. Rina Kusuma' }),
        Object.assign(salinan(profiles.P04), { id: 'P04-p2', versi: 2, diperbarui: F.addDays(-26), diisiOleh: 'Ns. Rina Kusuma' })
      ]
    };

    const meta = {
      durasiProfilMenit: { P01: 4.2, P02: 5.1, P03: 3.8, P04: 4.6, P05: 5.4, P06: 3.5, P07: 4.9, P08: 4.1, P09: 3.9 },
      durasiTinjauMenit: { P01: 6.5, P02: 7.2, P03: 5.8, P04: 8.1, P05: 4.9, P06: 4.2, P07: 6.8, P08: 7.5, P09: 5.5 },
      umpanBalik: [
        { pasienId: 'P04', skor: 5, catatan: 'Matriks membuat saya melihat beban istri yang tidak muncul di catatan medis.' },
        { pasienId: 'P06', skor: 4, catatan: 'Cepat karena banyak kasus memang sesuai.' },
        { pasienId: 'P01', skor: 3, catatan: 'Berguna, tetapi opsinya belum tersedia di layanan ini.' }
      ]
    };

    return {
      pasien: pasien,
      profiles: profiles,
      riwayatProfil: riwayatProfil,
      tasks: tasks,
      decisions: decisions,
      followUps: followUps,
      audit: audit,
      meta: meta,
      templates: TEMPLATES
    };
  }

  RM.demo = { build: build, templates: TEMPLATES };
})();
