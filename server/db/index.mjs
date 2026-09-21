import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const dataDir = path.join(rootDir, 'data');
const dbFile = path.join(dataDir, 'dev-db.json');
export const storageDir = path.join(rootDir, 'storage', 'documents');

// Ensure directories exist
fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(storageDir, { recursive: true });

export const ALL_CONSENT_CATEGORIES = [
  'diagnoses',
  'prescriptions',
  'lab_reports',
  'imaging',
  'clinical_notes',
  'uploaded_documents',
  'self_reported_symptoms'
];

export function id(prefix) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
}

export function hash(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

/**
 * Database Abstraction Layer
 * Deployment-neutral repository interface currently backed by dev-db.json.
 * Can be swapped for PostgreSQL pool (pg) or Maharashtra Government Health Cloud in production.
 */
class DatabaseAdapter {
  constructor() {
    this.ensureDb();
  }

  ensureDb() {
    if (!fs.existsSync(dbFile)) {
      return;
    }
    const db = this.read();
    let dirty = false;
    const collections = [
      'users', 'records', 'accessRequests', 'authorizations', 
      'otpChallenges', 'sessions', 'auditEvents', 'documents', 
      'selfReports', 'securityAlerts'
    ];
    for (const col of collections) {
      if (!db[col]) {
        db[col] = [];
        dirty = true;
      }
    }
    if (!db.patients) { db.patients = {}; dirty = true; }
    if (!db.doctors) { db.doctors = {}; dirty = true; }
    if (dirty) this.write(db);
  }

  read() {
    try {
      const raw = fs.readFileSync(dbFile, 'utf8');
      return JSON.parse(raw);
    } catch (e) {
      console.error('[DB ADAPTER] Read error, resetting:', e);
      return {};
    }
  }

  write(data) {
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2), 'utf8');
  }

  // Users & Profiles
  findUserById(uid) {
    const db = this.read();
    return db.users?.find(u => u.uid === uid) || null;
  }

  findUserByPhone(phone) {
    const db = this.read();
    return db.users?.find(u => u.phone === phone) || null;
  }

  getPatientProfile(patientId) {
    const db = this.read();
    return db.patients?.[patientId] || null;
  }

  getDoctorProfile(doctorId) {
    const db = this.read();
    return db.doctors?.[doctorId] || null;
  }

  // Authorizations & Consents
  getActiveAuthorization(patientId, doctorId) {
    const db = this.read();
    return db.authorizations?.find(
      a => a.patientId === patientId && a.doctorId === doctorId && a.status === 'active'
    ) || null;
  }

  // Documents
  getDocuments(patientId) {
    const db = this.read();
    return (db.documents || [])
      .filter(d => d.patientId === patientId)
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }

  getDocumentById(docId) {
    const db = this.read();
    return (db.documents || []).find(d => d.id === docId) || null;
  }

  addDocument(docMeta) {
    const db = this.read();
    db.documents = db.documents || [];
    db.documents.push(docMeta);
    this.write(db);
    return docMeta;
  }

  // Self Reports
  getSelfReports(patientId) {
    const db = this.read();
    return (db.selfReports || [])
      .filter(r => r.patientId === patientId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  addSelfReport(report) {
    const db = this.read();
    db.selfReports = db.selfReports || [];
    db.selfReports.push(report);
    this.write(db);
    return report;
  }

  // Security Alerts
  getSecurityAlerts(patientId) {
    const db = this.read();
    return (db.securityAlerts || [])
      .filter(a => a.patientId === patientId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  addSecurityAlert(alert) {
    const db = this.read();
    db.securityAlerts = db.securityAlerts || [];
    db.securityAlerts.push(alert);
    this.write(db);
    return alert;
  }

  ackSecurityAlert(alertId, patientId) {
    const db = this.read();
    const alert = (db.securityAlerts || []).find(a => a.id === alertId && a.patientId === patientId);
    if (alert) {
      alert.acknowledged = true;
      this.write(db);
      return true;
    }
    return false;
  }
}

export const dbAdapter = new DatabaseAdapter();
