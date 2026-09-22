/* KalkulatorOnline Stage 8 — default CMS content.
   This file is the safe bundled fallback used when cloud CMS is unavailable/offline. */
(function(){
  'use strict';
  window.KO_CMS_DEFAULTS = Object.freeze({
    schemaVersion: 1,
    site: {
      announcement: { enabled: false, text: '', url: '', cta: 'Lihat info' },
      footerTagline: 'Kumpulan kalkulator gratis untuk kesehatan, keuangan, kehamilan, dan kebutuhan sehari-hari. Cepat, ringan, dan ramah perangkat mobile.',
      footerStage: 'Stage 8 • CMS-ready'
    },
    home: {
      eyebrow: 'Gratis • Akurat • Tanpa daftar',
      title: 'Semua kalkulator yang Anda butuhkan,',
      titleAccent: 'dalam satu tempat.',
      description: 'Hitung kebutuhan kesehatan, keuangan, kehamilan, dan utilitas dengan cepat — gratis, tanpa login, dan nyaman di semua perangkat.',
      searchPlaceholder: 'Coba ketik: kalori, cicilan, kehamilan…',
      discoveryTitle: 'Jelajahi Kalkulator',
      featuredLabel: 'Kalkulator unggulan',
      highlights: [
        { enabled: true, label: 'PANDUAN', title: 'Cara Menghitung BMI', description: 'Pelajari rumus, kategori, dan cara membaca hasil BMI.', url: 'cara-menghitung-bmi.html', icon: 'book-open' },
        { enabled: true, label: 'PILIHAN CEPAT', title: 'Kalkulator Populer', description: 'Temukan kalkulator pilihan dan ranking lokal di perangkatmu.', url: 'kalkulator-populer.html', icon: 'sparkles' },
        { enabled: true, label: 'PRIVASI', title: 'Statistik Saya', description: 'Lihat pola penggunaan yang tersimpan hanya di browser perangkat ini.', url: 'statistik.html', icon: 'chart-no-axes-column-increasing' }
      ]
    },
    popular: {
      curated: ['index.html','kalkulator-kalori.html','kalkulator-cicilan.html','kalkulator-kehamilan.html','kalkulator-persen.html','kalkulator-umur.html']
    },
    ppn: {
      defaultRate: 11,
      subtitle: 'Hitung Pajak Pertambahan Nilai sesuai tarif yang dipilih',
      intro: 'PPN (Pajak Pertambahan Nilai) adalah pajak konsumsi yang dikenakan atas barang dan jasa. Pilih tarif yang sesuai dengan transaksi dan ketentuan yang berlaku.',
      rates: [
        { value: 11, label: '11%' },
        { value: 12, label: '12%' }
      ]
    },
    sponsor: {
      enabled: false,
      label: 'Sponsor',
      title: '',
      description: '',
      url: '',
      cta: 'Lihat'
    },
    faqOverrides: {},
    contextLinks: {}
  });
})();
