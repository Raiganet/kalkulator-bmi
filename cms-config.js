/* KalkulatorOnline Stage 8 — Cloud CMS configuration.
   Copy Firebase Web App values here after setup. API keys are public identifiers;
   WRITE SECURITY MUST be enforced by Firestore Security Rules. */
window.KO_CMS_CONFIG = {
  enabled: false,
  firebase: {
    apiKey: '',
    projectId: '',
    documentPath: 'cms/site'
  },
  cacheTtlMs: 300000
};
