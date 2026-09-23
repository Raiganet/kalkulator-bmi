/**
 * KalkulatorOnline CMS — Google Apps Script backend
 * Stage 8 GAS Edition
 *
 * Penyimpanan:
 * - Konten CMS: Google Spreadsheet
 * - Kredensial/hash/config: Script Properties
 * - Session admin: Script Cache (maks. 6 jam)
 */

const KO = Object.freeze({
  CMS_SHEET: 'CMS_Content',
  LOG_SHEET: 'CMS_Audit',
  CONTENT_KEY: 'site',
  SESSION_PREFIX: 'cms_session_',
  LOGIN_PREFIX: 'cms_login_',
  SESSION_SECONDS: 14400, // 4 jam
  MAX_PAYLOAD_CHARS: 450000,
  SCHEMA_VERSION: 1
});

function doGet(e) {
  const action = String((e && e.parameter && e.parameter.action) || 'content').toLowerCase();
  try {
    if (action === 'content') return json_(getPublicContent_());
    if (action === 'health') return json_({ ok: true, service: 'KalkulatorOnline CMS GAS', time: new Date().toISOString() });
    return json_({ ok: false, error: 'UNKNOWN_ACTION' });
  } catch (err) {
    return json_({ ok: false, error: safeError_(err) });
  }
}

function doPost(e) {
  let action = '';
  try {
    const p = (e && e.parameter) || {};
    action = String(p.action || '').toLowerCase();
    if (action === 'login') return json_(login_(p));
    if (action === 'logout') return json_(logout_(p));
    if (action === 'load') return json_(loadAdmin_(p));
    if (action === 'publish') return json_(publish_(p));
    return json_({ ok: false, error: 'UNKNOWN_ACTION' });
  } catch (err) {
    audit_('', action || 'error', false, safeError_(err));
    return json_({ ok: false, error: safeError_(err) });
  }
}

/**
 * SETUP SEKALI SAJA
 * 1. Project Settings -> Script Properties, buat sementara:
 *    ADMIN_EMAIL_SETUP = email admin
 *    ADMIN_PASSWORD_SETUP = password kuat
 * 2. Jalankan setupCms() dari editor Apps Script.
 * 3. Function akan membuat Spreadsheet, hash password, lalu MENGHAPUS password plaintext.
 */
function setupCms() {
  const props = PropertiesService.getScriptProperties();
  const email = normalizeEmail_(props.getProperty('ADMIN_EMAIL_SETUP'));
  const password = String(props.getProperty('ADMIN_PASSWORD_SETUP') || '');
  if (!email || password.length < 10) {
    throw new Error('Isi ADMIN_EMAIL_SETUP dan ADMIN_PASSWORD_SETUP (minimal 10 karakter) di Script Properties terlebih dahulu.');
  }

  let spreadsheetId = props.getProperty('SPREADSHEET_ID');
  let ss;
  if (spreadsheetId) {
    ss = SpreadsheetApp.openById(spreadsheetId);
  } else {
    ss = SpreadsheetApp.create('KalkulatorOnline CMS Data');
    spreadsheetId = ss.getId();
    props.setProperty('SPREADSHEET_ID', spreadsheetId);
  }
  ensureSheets_(ss);

  const salt = randomToken_();
  props.setProperties({
    ADMIN_EMAIL: email,
    ADMIN_SALT: salt,
    ADMIN_PASSWORD_HASH: hashPassword_(password, salt),
    AUTH_VERSION: randomToken_()
  }, false);
  props.deleteProperty('ADMIN_EMAIL_SETUP');
  props.deleteProperty('ADMIN_PASSWORD_SETUP');

  Logger.log('SETUP SELESAI');
  Logger.log('Spreadsheet: ' + ss.getUrl());
  Logger.log('Admin: ' + email);
  Logger.log('Selanjutnya Deploy > New deployment > Web app > Execute as Me > Who has access: Anyone.');
  return { spreadsheetUrl: ss.getUrl(), adminEmail: email };
}

/** Ganti password admin tanpa menyimpan plaintext permanen. */
function rotateAdminPassword() {
  const props = PropertiesService.getScriptProperties();
  const password = String(props.getProperty('ADMIN_PASSWORD_SETUP') || '');
  if (password.length < 10) throw new Error('Isi ADMIN_PASSWORD_SETUP minimal 10 karakter.');
  const salt = randomToken_();
  props.setProperties({ ADMIN_SALT: salt, ADMIN_PASSWORD_HASH: hashPassword_(password, salt), AUTH_VERSION: randomToken_() }, false);
  props.deleteProperty('ADMIN_PASSWORD_SETUP');
  Logger.log('Password admin berhasil diperbarui.');
}

function getPublicContent_() {
  const row = readContentRow_();
  if (!row) return { ok: true, found: false, schemaVersion: KO.SCHEMA_VERSION };
  return {
    ok: true,
    found: true,
    schemaVersion: Number(row.schemaVersion) || KO.SCHEMA_VERSION,
    updatedAt: row.updatedAt || '',
    payload: row.payload
  };
}

function login_(p) {
  const email = normalizeEmail_(p.email);
  const password = String(p.password || '');
  if (!email || !password) return { ok: false, error: 'EMAIL_PASSWORD_REQUIRED' };

  const cache = CacheService.getScriptCache();
  const rateKey = KO.LOGIN_PREFIX + digestShort_(email);
  const attempts = Number(cache.get(rateKey) || 0);
  if (attempts >= 8) return { ok: false, error: 'TOO_MANY_ATTEMPTS', retryAfter: 900 };

  const props = PropertiesService.getScriptProperties();
  const expectedEmail = normalizeEmail_(props.getProperty('ADMIN_EMAIL'));
  const salt = props.getProperty('ADMIN_SALT') || '';
  const expectedHash = props.getProperty('ADMIN_PASSWORD_HASH') || '';
  const candidateHash = hashPassword_(password, salt);

  if (!expectedEmail || !expectedHash || email !== expectedEmail || !constantTimeEqual_(candidateHash, expectedHash)) {
    cache.put(rateKey, String(attempts + 1), 900);
    Utilities.sleep(250 + Math.min(attempts, 5) * 100);
    audit_(email, 'login', false, 'INVALID_CREDENTIALS');
    return { ok: false, error: 'INVALID_CREDENTIALS' };
  }

  cache.remove(rateKey);
  const token = randomToken_() + randomToken_();
  const expiresAt = Date.now() + KO.SESSION_SECONDS * 1000;
  const authVersion = props.getProperty('AUTH_VERSION') || '';
  cache.put(KO.SESSION_PREFIX + token, JSON.stringify({ email, expiresAt, authVersion }), KO.SESSION_SECONDS);
  audit_(email, 'login', true, '');
  return { ok: true, token, email, expiresAt };
}

function logout_(p) {
  const token = String(p.token || '');
  const session = session_(token);
  if (token) CacheService.getScriptCache().remove(KO.SESSION_PREFIX + token);
  if (session) audit_(session.email, 'logout', true, '');
  return { ok: true };
}

function loadAdmin_(p) {
  const session = requireSession_(p.token);
  const data = getPublicContent_();
  audit_(session.email, 'load', true, data.found ? '' : 'EMPTY');
  return data;
}

function publish_(p) {
  const session = requireSession_(p.token);
  const raw = String(p.payload || '');
  if (!raw) throw new Error('PAYLOAD_REQUIRED');
  if (raw.length > KO.MAX_PAYLOAD_CHARS) throw new Error('PAYLOAD_TOO_LARGE');

  let parsed;
  try { parsed = JSON.parse(raw); } catch (e) { throw new Error('INVALID_JSON'); }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('INVALID_PAYLOAD');

  const payload = JSON.stringify(parsed);
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) throw new Error('SERVER_BUSY');
  try {
    const ss = spreadsheet_();
    const sheet = ss.getSheetByName(KO.CMS_SHEET);
    const now = new Date();
    const updatedAt = now.toISOString();
    const row = findContentRow_(sheet, KO.CONTENT_KEY);
    const values = [KO.CONTENT_KEY, payload, updatedAt, session.email, KO.SCHEMA_VERSION];
    if (row > 0) sheet.getRange(row, 1, 1, values.length).setValues([values]);
    else sheet.appendRow(values);
    SpreadsheetApp.flush();
    audit_(session.email, 'publish', true, 'bytes=' + payload.length);
    return { ok: true, updatedAt, schemaVersion: KO.SCHEMA_VERSION };
  } finally {
    lock.releaseLock();
  }
}

function spreadsheet_() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('SERVER_NOT_CONFIGURED');
  const ss = SpreadsheetApp.openById(id);
  ensureSheets_(ss);
  return ss;
}

function ensureSheets_(ss) {
  let cms = ss.getSheetByName(KO.CMS_SHEET);
  if (!cms) cms = ss.insertSheet(KO.CMS_SHEET);
  if (cms.getLastRow() === 0) cms.appendRow(['key', 'payload', 'updatedAt', 'updatedBy', 'schemaVersion']);
  cms.setFrozenRows(1);

  let log = ss.getSheetByName(KO.LOG_SHEET);
  if (!log) log = ss.insertSheet(KO.LOG_SHEET);
  if (log.getLastRow() === 0) log.appendRow(['timestamp', 'email', 'action', 'success', 'detail']);
  log.setFrozenRows(1);
}

function readContentRow_() {
  const ss = spreadsheet_();
  const sheet = ss.getSheetByName(KO.CMS_SHEET);
  const row = findContentRow_(sheet, KO.CONTENT_KEY);
  if (row < 1) return null;
  const v = sheet.getRange(row, 1, 1, 5).getValues()[0];
  if (!v[1]) return null;
  return { key: v[0], payload: String(v[1]), updatedAt: String(v[2] || ''), updatedBy: String(v[3] || ''), schemaVersion: Number(v[4]) || 1 };
}

function findContentRow_(sheet, key) {
  const last = sheet.getLastRow();
  if (last < 2) return -1;
  const finder = sheet.getRange(2, 1, last - 1, 1).createTextFinder(String(key)).matchEntireCell(true).findNext();
  return finder ? finder.getRow() : -1;
}

function session_(token) {
  if (!token) return null;
  try {
    const raw = CacheService.getScriptCache().get(KO.SESSION_PREFIX + String(token));
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s || Number(s.expiresAt) <= Date.now()) return null;
    const currentVersion = PropertiesService.getScriptProperties().getProperty('AUTH_VERSION') || '';
    if (String(s.authVersion || '') !== currentVersion) return null;
    return s;
  } catch (e) { return null; }
}

function requireSession_(token) {
  const s = session_(String(token || ''));
  if (!s) throw new Error('UNAUTHORIZED');
  return s;
}

function audit_(email, action, success, detail) {
  try {
    const ss = spreadsheet_();
    const sheet = ss.getSheetByName(KO.LOG_SHEET);
    sheet.appendRow([new Date(), String(email || ''), String(action || ''), !!success, String(detail || '').slice(0, 300)]);
  } catch (e) {}
}

function normalizeEmail_(v) { return String(v || '').trim().toLowerCase(); }
function hashPassword_(password, salt) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(salt) + '\n' + String(password), Utilities.Charset.UTF_8);
  return bytes.map(b => ('0' + ((b < 0 ? b + 256 : b).toString(16))).slice(-2)).join('');
}
function digestShort_(value) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(value), Utilities.Charset.UTF_8);
  return bytes.slice(0, 10).map(b => ('0' + ((b < 0 ? b + 256 : b).toString(16))).slice(-2)).join('');
}
function constantTimeEqual_(a, b) {
  a = String(a || ''); b = String(b || '');
  if (a.length !== b.length) return false;
  let diff = 0; for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
function randomToken_() { return Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, ''); }
function safeError_(err) {
  const msg = String(err && err.message ? err.message : err || 'SERVER_ERROR').replace(/[\r\n]/g, ' ').slice(0, 160);
  const allowed = ['UNAUTHORIZED','INVALID_JSON','INVALID_PAYLOAD','PAYLOAD_REQUIRED','PAYLOAD_TOO_LARGE','SERVER_BUSY','SERVER_NOT_CONFIGURED'];
  return allowed.includes(msg) ? msg : 'SERVER_ERROR';
}
function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
