/* KalkulatorOnline Stage 8 GAS — CMS configuration.
   Setelah deploy Google Apps Script sebagai Web App, tempel URL /exec di bawah.
   Tidak ada password/admin secret yang boleh disimpan di file frontend ini. */
window.KO_CMS_CONFIG = {
  enabled: true,
  gas: {
    webAppUrl: 'https://script.google.com/macros/s/AKfycbxzIiHbwdRnBNnT234Knba1dDpTRoy_eVh7WjA9vHd0b_75EvT9cZEJ9Iv5m0KFUgJ-/exec'
  },
  cacheTtlMs: 300000
};
