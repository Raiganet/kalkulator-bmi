/* KalkulatorOnline Stage 7 — monetization configuration
   SAFE DEFAULT: disabled. No third-party ad script is loaded until:
   1) enabled=true, 2) mode='adsense', 3) valid IDs are filled, and 4) user grants advertising consent. */
window.KO_MONETIZATION = Object.freeze({
  enabled: false,
  mode: 'house', // 'house' | 'adsense'
  label: 'Sponsor',
  houseAd: { title: '', description: '', url: '', cta: 'Lihat' },
  adsense: {
    client: '', // example: ca-pub-1234567890123456
    slots: { home: '', calculator: '' }
  }
});
