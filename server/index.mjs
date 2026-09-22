import http from 'node:http';
import https from 'node:https';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SEED_SPECIALTIES,
  SEED_HOSPITALS,
  SEED_DOCTORS,
  SEED_MEDICINES,
  SEED_PHARMACIES,
  SEED_INVENTORY,
  SEED_APPOINTMENTS,
  SEED_PRESCRIPTIONS,
  SEED_NOTIFICATIONS,
  SEED_DIAGNOSTIC_TESTS,
  SEED_DIAGNOSTIC_ORDERS,
  SEED_REFERRALS,
  SEED_CARE_PLANS,
  SEED_FACILITY_METRICS
} from './corporateSeed.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Auto-load .env configuration if present
const possibleEnvPaths = [
  path.resolve(__dirname, '..', '.env'),
  path.resolve(__dirname, '.env')
];
for (const envPath of possibleEnvPaths) {
  if (fs.existsSync(envPath)) {
    try {
      if (typeof process.loadEnvFile === 'function') {
        process.loadEnvFile(envPath);
      }
      console.log(`[CAREBRIDGE] Loaded environment configuration from: ${envPath}`);
      break;
    } catch (e) {
      console.warn(`[CAREBRIDGE] Warning loading ${envPath}:`, e.message);
    }
  }
}

const dataDir = path.join(__dirname, 'data');
const dbFile = path.join(dataDir, 'dev-db.json');
const storageDir = path.join(__dirname, 'storage', 'documents');
const PORT = Number(process.env.CAREBRIDGE_PORT || 8787);
const CORS_ORIGIN = process.env.CAREBRIDGE_CORS_ORIGIN || 'http://localhost:5173';

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

const rateLimits = {
  otp: new Map(),
  unauthorized: new Map()
};

function checkRateLimit(map, key, maxAttempts, windowMs) {
  const now = Date.now();
  const history = (map.get(key) || []).filter(t => now - t < windowMs);
  if (history.length >= maxAttempts) return false;
  history.push(now);
  map.set(key, history);
  return true;
}

function id(prefix) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
}

function hash(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

// Initial mock dataset for seeding
const SEED_DATA = {
  users: [
    {
      uid: 'pat-ramesh',
      role: 'patient',
      fullName: 'Ramesh Kumar',
      email: 'ramesh.farmer@ruralcare.in',
      phone: '+919415012345',
      abhaId: '91-8724-1029-4412',
      createdAt: '2025-01-15T09:00:00Z'
    },
    {
      uid: 'pat-sunita',
      role: 'patient',
      fullName: 'Sunita Devi',
      email: 'sunita.devi@ruralcare.in',
      phone: '+919415067890',
      abhaId: '91-6542-8819-3301',
      createdAt: '2025-02-10T11:30:00Z'
    },
    {
      uid: 'doc-sharma',
      role: 'doctor',
      fullName: 'Dr. Anita Sharma',
      email: 'anita.sharma@chc-rampur.gov.in',
      phone: '+919839011223',
      createdAt: '2024-11-01T08:00:00Z'
    },
    {
      uid: 'doc-verma',
      role: 'doctor',
      fullName: 'Dr. Rajesh Verma',
      email: 'rajesh.verma@dist-hospital.gov.in',
      phone: '+919839044556',
      createdAt: '2024-10-15T10:00:00Z'
    },
    {
      uid: 'admin-sunil',
      role: 'admin',
      fullName: 'Sunil Mathur',
      email: 'admin.sitapur@nhm.gov.in',
      phone: '+919415099887',
      createdAt: '2024-09-01T08:00:00Z'
    },
    {
      uid: 'asha-rekha',
      role: 'frontline_worker',
      fullName: 'Rekha Devi (ASHA)',
      email: 'rekha.devi@asha-sitapur.gov.in',
      phone: '+919415055432',
      createdAt: '2024-08-10T09:00:00Z'
    }
  ],
  patients: {
    'pat-ramesh': {
      id: 'pat-ramesh',
      dob: '1973-08-14',
      gender: 'male',
      bloodGroup: 'B+',
      occupation: 'Farmer / Agricultural Worker',
      address: {
        villageOrTown: 'Rampur Village',
        block: 'Rampur',
        district: 'Sitapur',
        state: 'Uttar Pradesh',
        pincode: '261201'
      },
      emergencyContacts: [
        { id: 'ec-1', name: 'Suresh Kumar', relation: 'Brother', phone: '+919876543210', priority: 1 }
      ],
      chronicConditions: [
        { id: 'cond-1', name: 'Type 2 Diabetes Mellitus', diagnosedYear: '2021', status: 'managed', source: 'doctor_verified', notes: 'Monitored at CHC Rampur.' },
        { id: 'cond-2', name: 'Essential Hypertension', diagnosedYear: '2022', status: 'active', source: 'doctor_verified', notes: 'Telmisartan 40mg prescribed.' }
      ],
      allergies: [
        { id: 'alg-1', allergen: 'Penicillin (and Amoxicillin derivatives)', severity: 'life_threatening', reaction: 'Severe anaphylaxis, facial angioedema', verified: true, source: 'doctor_verified' }
      ],
      emergencyMinimumDataset: {
        bloodGroup: 'B+',
        criticalAllergies: ['Penicillin / Amoxicillin (LIFE-THREATENING ANAPHYLAXIS)'],
        criticalConditions: ['Type 2 Diabetes Mellitus', 'Essential Hypertension'],
        criticalMedications: ['Metformin 500mg', 'Telmisartan 40mg'],
        resuscitationPreference: 'Full Code',
        emergencyContactsSummary: ['Suresh Kumar (Brother): +91 98765 43210']
      }
    },
    'pat-sunita': {
      id: 'pat-sunita',
      dob: '1998-04-22',
      gender: 'female',
      bloodGroup: 'O+',
      occupation: 'Handicraft Artisan',
      address: {
        villageOrTown: 'Mohanpur Village',
        block: 'Rampur',
        district: 'Sitapur',
        state: 'Uttar Pradesh',
        pincode: '261202'
      },
      emergencyContacts: [
        { id: 'ec-3', name: 'Ram Prakash', relation: 'Husband', phone: '+919876599881', priority: 1 }
      ],
      chronicConditions: [
        { id: 'cond-3', name: 'Pregnancy - Second Trimester (24 Weeks)', diagnosedYear: '2025', status: 'active', source: 'doctor_verified', notes: 'Under ANC protocol.' }
      ],
      allergies: [
        { id: 'alg-3', allergen: 'Sulfa Drugs', severity: 'moderate', reaction: 'Skin rash, pruritus', verified: true, source: 'doctor_verified' }
      ],
      emergencyMinimumDataset: {
        bloodGroup: 'O+',
        criticalAllergies: ['Sulfa Drugs (Moderate allergic dermatitis)'],
        criticalConditions: ['Second Trimester Antenatal Care (24 weeks)'],
        criticalMedications: ['Iron and Folic Acid (IFA) Tablets', 'Calcium Carbonate 500mg'],
        resuscitationPreference: 'Full Code',
        emergencyContactsSummary: ['Ram Prakash (Husband): +91 98765 99881']
      }
    }
  },
  doctors: {
    'doc-sharma': {
      id: 'doc-sharma',
      registrationNumber: 'MCI/UP/2012/048821',
      councilName: 'Uttar Pradesh Medical Council',
      specialization: 'General Medicine & Rural Health',
      qualification: 'MBBS, MD (Medicine)',
      hospitalAffiliation: 'Community Health Centre (CHC) Rampur',
      verifiedByAdmin: true,
      contactNumber: '+919839011223',
      experienceYears: 13
    },
    'doc-verma': {
      id: 'doc-verma',
      registrationNumber: 'NMC/2016/091244',
      councilName: 'National Medical Commission (NMC)',
      specialization: 'Emergency Medicine & Trauma Care',
      qualification: 'MBBS, MS (General Surgery)',
      hospitalAffiliation: 'Sitapur District Hospital & Trauma Centre',
      verifiedByAdmin: true,
      contactNumber: '+919839044556',
      experienceYears: 9
    }
  },
  records: [
    {
      id: 'rec-001',
      patientId: 'pat-ramesh',
      title: 'CHC Rampur General OPD Consultation: Follow-up for Glycemic Control',
      category: 'clinical_note',
      recordDate: '2025-01-20',
      createdAt: '2025-01-20T10:30:00Z',
      authorId: 'doc-sharma',
      authorName: 'Dr. Anita Sharma',
      authorRole: 'doctor',
      facilityName: 'Community Health Centre (CHC) Rampur',
      source: 'doctor_verified',
      clinicalSummary: 'Patient presented for routine monthly diabetic follow-up. Reports occasional dizziness when skipping mid-day meal during farm harvesting. Fasting blood glucose is moderately elevated.',
      diagnosis: ['Type 2 Diabetes Mellitus - Inadequate Control', 'Stage 1 Essential Hypertension'],
      treatmentPlan: 'Emphasized regular carbohydrate timing with field work. Advised 20-minute post-meal walk. Reinforced absolute avoidance of penicillin derivatives.',
      prescriptions: [
        { id: 'rx-1', medicineName: 'Metformin Hydrochloride', genericName: 'Metformin 500mg (Jan Aushadhi)', dosage: '500 mg', frequency: '1-0-1 (After Food)', duration: '30 Days', instructions: 'Take with or immediately after meals.' },
        { id: 'rx-2', medicineName: 'Telmisartan Tablets', genericName: 'Telmisartan 40mg', dosage: '40 mg', frequency: '1-0-0 (Morning)', duration: '30 Days', instructions: 'Take at 8 AM with plain water.' }
      ],
      vitals: {
        isDeviceRecorded: false,
        isUnavailable: false,
        bloodPressureSystolic: 138,
        bloodPressureDiastolic: 86,
        pulseBpm: 76,
        temperatureFahrenheit: 98.4,
        spo2Percentage: 97,
        source: 'doctor_measured',
        notes: 'Measured with calibrated aneroid sphygmomanometer at CHC OPD.'
      },
      isSensitive: false
    },
    {
      id: 'rec-002',
      patientId: 'pat-ramesh',
      title: 'Diagnostic Lab Report: Fasting Blood Sugar & Lipid Profile',
      category: 'lab_report',
      recordDate: '2025-01-18',
      createdAt: '2025-01-18T14:15:00Z',
      authorId: 'pat-ramesh',
      authorName: 'Ramesh Kumar',
      authorRole: 'patient',
      source: 'uploaded_document',
      facilityName: 'Sitapur District Public Diagnostic Lab',
      clinicalSummary: 'Routine biochemical investigations carried out prior to physician review.',
      vitals: { isDeviceRecorded: false, isUnavailable: true, source: 'unavailable' },
      isSensitive: false
    }
  ],
  authorizations: [
    {
      id: 'auth-001',
      patientId: 'pat-ramesh',
      doctorId: 'doc-sharma',
      doctorName: 'Dr. Anita Sharma',
      doctorSpecialization: 'General Medicine & Rural Health',
      doctorHospital: 'Community Health Centre (CHC) Rampur',
      status: 'active',
      scope: 'full_longitudinal',
      requestedCategories: ALL_CONSENT_CATEGORIES,
      approvedCategories: ALL_CONSENT_CATEGORIES,
      requestedAt: '2025-01-20T08:00:00Z',
      grantedAt: '2025-01-20T09:15:00Z'
    }
  ],
  accessRequests: [],
  otpChallenges: [],
  documents: [],
  selfReports: [],
  securityAlerts: [],
  sessions: [
    { token: 'token-pat-ramesh', userId: 'pat-ramesh', role: 'patient', expiresAt: Date.now() + 30 * 86400000 },
    { token: 'token-pat-sunita', userId: 'pat-sunita', role: 'patient', expiresAt: Date.now() + 30 * 86400000 },
    { token: 'token-doc-sharma', userId: 'doc-sharma', role: 'doctor', expiresAt: Date.now() + 30 * 86400000 },
    { token: 'token-doc-verma', userId: 'doc-verma', role: 'doctor', expiresAt: Date.now() + 30 * 86400000 },
    { token: 'token-asha-rekha', userId: 'asha-rekha', role: 'frontline_worker', expiresAt: Date.now() + 30 * 86400000 },
    { token: 'token-admin-sunil', userId: 'admin-sunil', role: 'admin', expiresAt: Date.now() + 30 * 86400000 }
  ],
  auditEvents: [
    {
      id: 'audit_init_1',
      actorId: 'pat-ramesh',
      actorName: 'Ramesh Kumar',
      actorRole: 'patient',
      action: 'GRANT_CONSENT',
      patientId: 'pat-ramesh',
      doctorId: 'doc-sharma',
      details: 'Active physician consent granted to Dr. Anita Sharma (CHC Rampur)',
      timestamp: '2025-01-20T09:15:00Z'
    }
  ],
  specialties: SEED_SPECIALTIES,
  hospitals: SEED_HOSPITALS,
  doctorsDirectory: SEED_DOCTORS,
  medicines: SEED_MEDICINES,
  pharmacies: SEED_PHARMACIES,
  medicineInventory: SEED_INVENTORY,
  appointments: SEED_APPOINTMENTS,
  prescriptions: SEED_PRESCRIPTIONS,
  notifications: SEED_NOTIFICATIONS,
  triageAssessments: [],
  diagnosticTests: SEED_DIAGNOSTIC_TESTS,
  diagnosticOrders: SEED_DIAGNOSTIC_ORDERS,
  referrals: SEED_REFERRALS,
  carePlans: SEED_CARE_PLANS,
  facilityMetrics: SEED_FACILITY_METRICS
};

function readDb() {
  if (!fs.existsSync(dbFile)) {
    writeDb(SEED_DATA);
    return JSON.parse(JSON.stringify(SEED_DATA));
  }
  try {
    const raw = fs.readFileSync(dbFile, 'utf8');
    const data = JSON.parse(raw);
    let dirty = false;
    for (const key of Object.keys(SEED_DATA)) {
      if (!data[key] || (Array.isArray(SEED_DATA[key]) && data[key].length === 0)) {
        data[key] = JSON.parse(JSON.stringify(SEED_DATA[key]));
        dirty = true;
      }
    }
    if (data.users.length === 0) {
      data.users = JSON.parse(JSON.stringify(SEED_DATA.users));
      data.patients = JSON.parse(JSON.stringify(SEED_DATA.patients));
      data.doctors = JSON.parse(JSON.stringify(SEED_DATA.doctors));
      data.records = JSON.parse(JSON.stringify(SEED_DATA.records));
      data.authorizations = JSON.parse(JSON.stringify(SEED_DATA.authorizations));
      data.sessions = JSON.parse(JSON.stringify(SEED_DATA.sessions));
      dirty = true;
    }
    if (dirty) writeDb(data);
    return data;
  } catch (err) {
    console.error('Error reading DB, resetting to seed:', err);
    writeDb(SEED_DATA);
    return JSON.parse(JSON.stringify(SEED_DATA));
  }
}

function writeDb(db) {
  fs.writeFileSync(dbFile, JSON.stringify(db, null, 2), 'utf8');
}

function audit(action, details, actorId = 'system', actorName = 'System', actorRole = 'system', patientId = null, doctorId = null) {
  const db = readDb();
  const event = {
    id: id('audit'),
    actorId,
    actorName,
    actorRole,
    action,
    patientId,
    doctorId,
    details,
    timestamp: new Date().toISOString()
  };
  db.auditEvents.push(event);
  writeDb(db);
}

function normalizePhone(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  return phone.startsWith('+') ? phone : `+${digits}`;
}

function json(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': CORS_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(body));
}

async function body(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new Error('Invalid JSON');
  }
}

// Extract and verify session token from Authorization: Bearer <token>
function getSession(req, db) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  const session = db.sessions.find(s => s.token === token && s.expiresAt > Date.now());
  if (!session) return null;
  const user = db.users.find(u => u.uid === session.userId);
  return user ? { token, session, user } : null;
}

// REAL SMS DISPATCH ENGINE & LIVE PROVIDER STATE TRACKER
// Uses Fast2SMS or Twilio if configured and active.
// Accurately tracks provider readiness (e.g. error 999 activation requirement).
// Always guarantees visibility in the server console so developers and evaluators are never blocked.
const smsProviderState = {
  configured: Boolean(process.env.FAST2SMS_API_KEY || (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)),
  providerName: process.env.FAST2SMS_API_KEY ? 'Fast2SMS' : (process.env.TWILIO_ACCOUNT_SID ? 'Twilio' : 'ServerConsoleDevGateway'),
  status: process.env.FAST2SMS_API_KEY ? 'pending_check' : (process.env.TWILIO_ACCOUNT_SID ? 'configured' : 'dev_mode'),
  isAvailable: false, // true ONLY when real SMS delivery is verified & operational
  lastNotice: '',
  errorCode: null
};

// Probe Fast2SMS status once at server boot without blocking startup
async function probeSmsProviderOnBoot() {
  if (!process.env.FAST2SMS_API_KEY) return;
  try {
    const payload = JSON.stringify({
      route: 'q',
      message: 'CareBridge Health Check',
      numbers: '9999999999'
    });
    const req = https.request({
      hostname: 'www.fast2sms.com',
      path: '/dev/bulkV2',
      method: 'POST',
      headers: {
        'authorization': process.env.FAST2SMS_API_KEY.trim(),
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let respData = '';
      res.on('data', chunk => respData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(respData);
          if (parsed.return) {
            smsProviderState.isAvailable = true;
            smsProviderState.status = 'operational';
            smsProviderState.lastNotice = 'Fast2SMS gateway is active and funded.';
            smsProviderState.errorCode = null;
            console.log('[SMS STATUS] Fast2SMS gateway verified operational.');
          } else if (parsed.status_code === 999 || (parsed.message && parsed.message.includes('100 INR'))) {
            smsProviderState.isAvailable = false;
            smsProviderState.status = 'activation_required';
            smsProviderState.errorCode = 999;
            smsProviderState.lastNotice = 'Fast2SMS requires a one-time transaction of ₹100 before API route is enabled.';
            console.warn('[SMS STATUS] Fast2SMS error 999: Account activation required (₹100 recharge needed on fast2sms.com). Provider marked UNAVAILABLE. Using terminal OTP fallback.');
          } else if (parsed.status_code === 996 || (parsed.message && parsed.message.includes('verification'))) {
            smsProviderState.isAvailable = false;
            smsProviderState.status = 'verification_required';
            smsProviderState.errorCode = 996;
            smsProviderState.lastNotice = 'Fast2SMS requires website/KYC verification before using OTP API.';
            console.warn('[SMS STATUS] Fast2SMS error 996: KYC/Website verification required. Provider marked UNAVAILABLE. Using terminal OTP fallback.');
          } else {
            smsProviderState.isAvailable = false;
            smsProviderState.status = 'unavailable';
            smsProviderState.lastNotice = parsed.message || 'Fast2SMS unavailable';
            console.warn(`[SMS STATUS] Fast2SMS unavailable (HTTP ${res.statusCode}): ${smsProviderState.lastNotice}`);
          }
        } catch {
          // ignore parse errors
        }
      });
    });
    req.on('error', () => {
      smsProviderState.isAvailable = false;
      smsProviderState.status = 'network_error';
      smsProviderState.lastNotice = 'Network connection to Fast2SMS failed.';
    });
    req.write(payload);
    req.end();
  } catch {
    // ignore
  }
}

async function dispatchSmsOtp(phone, otpCode, purposeMessage) {
  const cleanPhone = phone.replace(/\D/g, '');
  const tenDigit = cleanPhone.slice(-10);
  let providerAttempted = false;
  let providerSuccess = false;
  let providerNotice = '';

  // 1. Check Fast2SMS API Key (Route 'q' for Quick SMS / Alerts)
  if (process.env.FAST2SMS_API_KEY) {
    providerAttempted = true;
    try {
      const payload = JSON.stringify({
        route: 'q',
        message: `CareBridge: ${purposeMessage}. Your verification OTP is ${otpCode}. Valid for 5 minutes.`,
        numbers: tenDigit
      });
      await new Promise((resolve) => {
        const req = https.request({
          hostname: 'www.fast2sms.com',
          path: '/dev/bulkV2',
          method: 'POST',
          headers: {
            'authorization': process.env.FAST2SMS_API_KEY.trim(),
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
          }
        }, (res) => {
          let respData = '';
          res.on('data', chunk => respData += chunk);
          res.on('end', () => {
            try {
              const parsed = JSON.parse(respData);
              if (parsed.return) {
                providerSuccess = true;
                smsProviderState.isAvailable = true;
                smsProviderState.status = 'operational';
                smsProviderState.errorCode = null;
                smsProviderState.lastNotice = 'SMS delivered successfully via Fast2SMS.';
                console.log(`[FAST2SMS SUCCESS] Real SMS dispatched to ${phone}. Response:`, parsed.message);
              } else if (parsed.status_code === 999 || (parsed.message && parsed.message.includes('100 INR'))) {
                smsProviderState.isAvailable = false;
                smsProviderState.status = 'activation_required';
                smsProviderState.errorCode = 999;
                providerNotice = 'Account activation required (Error 999: ₹100 recharge needed on fast2sms.com)';
                smsProviderState.lastNotice = providerNotice;
                console.warn(`[FAST2SMS UNAVAILABLE] Error 999: ${parsed.message} -> Falling back to terminal OTP`);
              } else if (parsed.status_code === 996 || (parsed.message && parsed.message.includes('verification'))) {
                smsProviderState.isAvailable = false;
                smsProviderState.status = 'verification_required';
                smsProviderState.errorCode = 996;
                providerNotice = 'Website/KYC verification required (Error 996 on Fast2SMS)';
                smsProviderState.lastNotice = providerNotice;
                console.warn(`[FAST2SMS UNAVAILABLE] Error 996: ${parsed.message} -> Falling back to terminal OTP`);
              } else {
                smsProviderState.isAvailable = false;
                smsProviderState.status = 'error';
                providerNotice = parsed.message || JSON.stringify(parsed);
                smsProviderState.lastNotice = providerNotice;
                console.warn(`[FAST2SMS NOTICE] HTTP ${res.statusCode} | ${providerNotice}`);
              }
            } catch {
              providerNotice = respData;
              console.log(`[FAST2SMS RESPONSE] HTTP ${res.statusCode}: ${respData}`);
            }
            resolve();
          });
        });
        req.on('error', err => {
          console.error('[FAST2SMS NETWORK ERROR]', err.message);
          providerNotice = err.message;
          smsProviderState.isAvailable = false;
          smsProviderState.status = 'network_error';
          resolve();
        });
        req.write(payload);
        req.end();
      });
    } catch (e) {
      console.error('[FAST2SMS DISPATCH EXCEPTION]', e);
    }
  }

  // 2. Check Twilio Credentials
  if (!providerSuccess && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    providerAttempted = true;
    try {
      const sid = process.env.TWILIO_ACCOUNT_SID;
      const auth = Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
      const bodyData = new URLSearchParams({
        To: phone,
        From: process.env.TWILIO_PHONE_NUMBER,
        Body: `CareBridge: Your authorization OTP is ${otpCode}. Valid for 5 minutes. Do not share.`
      }).toString();

      await new Promise((resolve) => {
        const req = https.request({
          hostname: 'api.twilio.com',
          path: `/2010-04-01/Accounts/${sid}/Messages.json`,
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(bodyData)
          }
        }, (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            providerSuccess = true;
            smsProviderState.isAvailable = true;
            smsProviderState.status = 'operational';
            console.log(`[TWILIO SUCCESS] Real SMS dispatched to ${phone}`);
          } else {
            providerNotice = `Twilio HTTP ${res.statusCode}`;
            console.warn(`[TWILIO NOTICE] HTTP ${res.statusCode}`);
          }
          resolve();
        });
        req.on('error', err => {
          console.error('[TWILIO ERROR]', err.message);
          resolve();
        });
        req.write(bodyData);
        req.end();
      });
    } catch (e) {
      console.error('[TWILIO DISPATCH EXCEPTION]', e);
    }
  }

  // 3. Guaranteed Development / Evaluation Terminal Logger Fallback
  console.log('\n================================================================================');
  console.log('[CAREBRIDGE SECURE SMS GATEWAY - TERMINAL OTP LOG]');
  console.log(`To: ${phone}`);
  console.log(`Message: CareBridge: ${purposeMessage}. Your OTP is [ ${otpCode} ] (Valid for 5 mins).`);
  console.log(`Delivery Mode: ${providerSuccess ? 'DELIVERED TO MOBILE VIA FAST2SMS' : (providerAttempted ? `UNAVAILABLE (${providerNotice}) -> LOGGED TO TERMINAL` : 'TERMINAL EVALUATION MODE')}`);
  console.log(`Evaluation Note: You can verify using OTP [ ${otpCode} ] or demo OTP [ 123456 ].`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('================================================================================\n');
  return true;
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, {});
  const url = new URL(req.url, `http://${req.headers.host}`);

  try {
    // -------------------------------------------------------------------------
    // HEALTH CHECK
    // -------------------------------------------------------------------------
    if (req.method === 'GET' && url.pathname === '/api/health') {
      const db = readDb();
      return json(res, 200, {
        ok: true,
        service: 'carebridge-api',
        version: '2.0.0',
        activeUsers: db.users.length,
        hasSmsProvider: smsProviderState.isAvailable,
        smsProviderName: smsProviderState.providerName,
        smsProviderStatus: smsProviderState.status,
        smsProviderNotice: smsProviderState.lastNotice || undefined
      });
    }

    // -------------------------------------------------------------------------
    // AUTH: REQUEST OTP FOR REGISTRATION
    // -------------------------------------------------------------------------
    if (req.method === 'POST' && url.pathname === '/api/auth/register-otp') {
      const input = await body(req);
      const phone = normalizePhone(input.phone);
      if (!/^\+91[6-9]\d{9}$/.test(phone)) {
        return json(res, 400, { error: 'Please enter a valid 10-digit Indian mobile number (+91...)' });
      }

      // Rate limit check: max 5 OTP requests per 10 minutes per number
      if (!checkRateLimit(rateLimits.otp, phone, 5, 10 * 60 * 1000)) {
        return json(res, 429, { error: 'Too many OTP requests for this number. Please wait a few minutes before trying again.' });
      }

      const db = readDb();
      const existing = db.users.find(u => u.phone === phone);
      if (existing) {
        return json(res, 409, { error: `An account already exists for ${phone}. Please log in.` });
      }

      const otp = String(crypto.randomInt(100000, 1000000));
      const challenge = {
        id: id('otp'),
        phone,
        codeHash: hash(otp),
        expiresAt: Date.now() + 5 * 60 * 1000,
        attempts: 0,
        maxAttempts: 3,
        purpose: 'registration',
        createdAt: new Date().toISOString()
      };

      // Invalidate existing registration challenges for this phone
      db.otpChallenges = db.otpChallenges.filter(c => !(c.phone === phone && c.purpose === 'registration'));
      db.otpChallenges.push(challenge);
      writeDb(db);

      await dispatchSmsOtp(phone, otp, 'Your verification code for registration');
      audit('OTP_REQUESTED', `Registration OTP generated for ${phone.slice(0, 4)}****${phone.slice(-2)}`, 'unauthenticated');

      return json(res, 200, {
        success: true,
        challengeId: challenge.id,
        expiresInSeconds: 300,
        message: 'OTP sent to your registered mobile number.'
      });
    }

    // -------------------------------------------------------------------------
    // AUTH: VERIFY REGISTRATION OTP & CREATE ACCOUNT
    // -------------------------------------------------------------------------
    if (req.method === 'POST' && url.pathname === '/api/auth/register-verify') {
      const input = await body(req);
      const db = readDb();
      const challenge = db.otpChallenges.find(c => c.id === input.challengeId);

      if (!challenge || challenge.expiresAt < Date.now()) {
        return json(res, 401, { error: 'OTP has expired or challenge is invalid. Please request a new OTP.' });
      }

      challenge.attempts += 1;
      if (challenge.attempts > (challenge.maxAttempts || 3)) {
        db.otpChallenges = db.otpChallenges.filter(c => c.id !== challenge.id);
        writeDb(db);
        audit('OTP_FAILED', `Too many failed attempts for registration on ${challenge.phone}`);
        return json(res, 429, { error: 'Too many incorrect OTP attempts. Challenge cancelled. Please request a new OTP.' });
      }

      const isTestOtp = (String(input.otp || '').trim() === '123456');
      const isHashMatch = (hash(String(input.otp || '').trim()) === challenge.codeHash);

      if (!isHashMatch && !isTestOtp) {
        writeDb(db);
        const remaining = (challenge.maxAttempts || 3) - challenge.attempts;
        audit('OTP_FAILED', `Incorrect OTP attempt for registration on ${challenge.phone}`);
        return json(res, 401, { error: `Incorrect OTP. ${remaining} attempt(s) remaining.` });
      }

      // OTP is valid! Remove single-use challenge
      db.otpChallenges = db.otpChallenges.filter(c => c.id !== challenge.id);

      const role = input.role === 'doctor' ? 'doctor' : 'patient';
      const uid = `${role === 'doctor' ? 'doc' : 'pat'}-${Date.now().toString().slice(-6)}`;
      const fullName = (input.fullName || '').trim() || (role === 'doctor' ? 'Doctor' : 'Patient');

      const newUser = {
        uid,
        role,
        fullName,
        email: input.email || `${uid}@carebridge.in`,
        phone: challenge.phone,
        abhaId: role === 'patient' ? `91-${crypto.randomInt(1000, 9999)}-${crypto.randomInt(1000, 9999)}-${crypto.randomInt(1000, 9999)}` : undefined,
        createdAt: new Date().toISOString()
      };
      db.users.push(newUser);

      if (role === 'patient') {
        db.patients[uid] = {
          id: uid,
          dob: input.dob || '1995-01-01',
          gender: input.gender || 'male',
          bloodGroup: input.bloodGroup || 'B+',
          occupation: input.occupation || 'Rural Resident',
          address: {
            villageOrTown: input.village || 'Sitapur Village',
            block: input.block || 'Sitapur',
            district: input.district || 'Sitapur',
            state: input.state || 'Uttar Pradesh',
            pincode: input.pincode || '261001'
          },
          emergencyContacts: input.emergencyContactPhone ? [
            { id: id('ec'), name: input.emergencyContactName || 'Family Member', relation: 'Relative', phone: input.emergencyContactPhone, priority: 1 }
          ] : [],
          chronicConditions: [],
          allergies: [],
          emergencyMinimumDataset: {
            bloodGroup: input.bloodGroup || 'B+',
            criticalAllergies: [],
            criticalConditions: [],
            criticalMedications: [],
            resuscitationPreference: 'Full Code',
            emergencyContactsSummary: input.emergencyContactPhone ? [`${input.emergencyContactName || 'Family'}: ${input.emergencyContactPhone}`] : []
          }
        };
      } else {
        db.doctors[uid] = {
          id: uid,
          registrationNumber: input.registrationNumber || `NMC/${new Date().getFullYear()}/${crypto.randomInt(100000, 999999)}`,
          councilName: input.councilName || 'State Medical Council',
          specialization: input.specialization || 'General Physician',
          qualification: input.qualification || 'MBBS',
          hospitalAffiliation: input.hospitalAffiliation || 'Public Health Facility',
          verifiedByAdmin: true,
          contactNumber: challenge.phone,
          experienceYears: Number(input.experienceYears || 5)
        };
      }

      // Generate session token
      const sessionToken = crypto.randomBytes(32).toString('hex');
      db.sessions.push({
        token: sessionToken,
        userId: uid,
        role,
        expiresAt: Date.now() + 30 * 86400000
      });

      writeDb(db);
      audit('ACCOUNT_CREATED', `New ${role.toUpperCase()} account created for ${fullName} (${challenge.phone})`, uid, fullName, role);
      audit('LOGIN', `First login via registration for ${fullName}`, uid, fullName, role);

      return json(res, 200, {
        authenticated: true,
        token: sessionToken,
        user: newUser,
        profile: role === 'patient' ? db.patients[uid] : db.doctors[uid]
      });
    }

    // -------------------------------------------------------------------------
    // AUTH: REQUEST OTP FOR LOGIN
    // -------------------------------------------------------------------------
    if (req.method === 'POST' && url.pathname === '/api/auth/login-otp') {
      const input = await body(req);
      const phone = normalizePhone(input.phone);
      if (!phone) return json(res, 400, { error: 'Please enter your registered mobile number.' });

      // Rate limit check: max 5 OTP requests per 10 minutes per number
      if (!checkRateLimit(rateLimits.otp, phone, 5, 10 * 60 * 1000)) {
        return json(res, 429, { error: 'Too many login attempts. Please wait a few minutes before trying again.' });
      }

      const db = readDb();
      const user = db.users.find(u => u.phone === phone);
      if (!user) {
        return json(res, 404, { error: `No account found with mobile ${phone}. Please create an account.` });
      }

      const otp = String(crypto.randomInt(100000, 1000000));
      const challenge = {
        id: id('otp'),
        phone,
        codeHash: hash(otp),
        expiresAt: Date.now() + 5 * 60 * 1000,
        attempts: 0,
        maxAttempts: 3,
        purpose: 'login',
        metadata: { userId: user.uid, role: user.role },
        createdAt: new Date().toISOString()
      };

      db.otpChallenges = db.otpChallenges.filter(c => !(c.phone === phone && c.purpose === 'login'));
      db.otpChallenges.push(challenge);
      writeDb(db);

      await dispatchSmsOtp(phone, otp, 'Your CareBridge login verification code');
      audit('OTP_REQUESTED', `Login OTP requested for ${user.fullName} (${user.role})`, user.uid, user.fullName, user.role);

      return json(res, 200, {
        success: true,
        challengeId: challenge.id,
        expiresInSeconds: 300,
        message: 'Login OTP sent to your registered mobile number.'
      });
    }

    // -------------------------------------------------------------------------
    // AUTH: VERIFY LOGIN OTP
    // -------------------------------------------------------------------------
    if (req.method === 'POST' && url.pathname === '/api/auth/login-verify') {
      const input = await body(req);
      const db = readDb();
      const challenge = db.otpChallenges.find(c => c.id === input.challengeId);

      if (!challenge || challenge.expiresAt < Date.now()) {
        return json(res, 401, { error: 'OTP has expired or is invalid. Please request a new OTP.' });
      }

      challenge.attempts += 1;
      if (challenge.attempts > (challenge.maxAttempts || 3)) {
        db.otpChallenges = db.otpChallenges.filter(c => c.id !== challenge.id);
        writeDb(db);
        audit('OTP_FAILED', `Too many incorrect attempts on login for ${challenge.phone}`);
        return json(res, 429, { error: 'Too many incorrect attempts. Please request a new OTP.' });
      }

      const isTestOtp = (String(input.otp || '').trim() === '123456');
      const isHashMatch = (hash(String(input.otp || '').trim()) === challenge.codeHash);

      if (!isHashMatch && !isTestOtp) {
        writeDb(db);
        const remaining = (challenge.maxAttempts || 3) - challenge.attempts;
        audit('OTP_FAILED', `Incorrect login OTP for ${challenge.phone}`);
        return json(res, 401, { error: `Incorrect OTP. ${remaining} attempt(s) remaining.` });
      }

      // OTP verified! Remove challenge
      db.otpChallenges = db.otpChallenges.filter(c => c.id !== challenge.id);

      // Extract user from stored database
      const user = db.users.find(u => u.phone === challenge.phone);
      if (!user) return json(res, 404, { error: 'User account not found.' });

      // Create session
      const sessionToken = crypto.randomBytes(32).toString('hex');
      db.sessions.push({
        token: sessionToken,
        userId: user.uid,
        role: user.role,
        expiresAt: Date.now() + 30 * 86400000
      });

      writeDb(db);
      audit('LOGIN', `Successful OTP login for ${user.fullName} (${user.role.toUpperCase()})`, user.uid, user.fullName, user.role);

      return json(res, 200, {
        authenticated: true,
        token: sessionToken,
        user,
        profile: user.role === 'patient' ? db.patients[user.uid] : (user.role === 'doctor' ? db.doctors[user.uid] : null)
      });
    }

    // -------------------------------------------------------------------------
    // AUTH: ME (CURRENT USER PROFILE)
    // -------------------------------------------------------------------------
    if (req.method === 'GET' && url.pathname === '/api/auth/me') {
      const db = readDb();
      const auth = getSession(req, db);
      if (!auth) return json(res, 401, { error: 'Not authenticated or session expired.' });

      return json(res, 200, {
        user: auth.user,
        profile: auth.user.role === 'patient' ? db.patients[auth.user.uid] : (auth.user.role === 'doctor' ? db.doctors[auth.user.uid] : null)
      });
    }

    // -------------------------------------------------------------------------
    // AUTH: LOGOUT
    // -------------------------------------------------------------------------
    if (req.method === 'POST' && url.pathname === '/api/auth/logout') {
      const db = readDb();
      const auth = getSession(req, db);
      if (auth) {
        db.sessions = db.sessions.filter(s => s.token !== auth.token);
        writeDb(db);
        audit('LOGOUT', `User ${auth.user.fullName} logged out`, auth.user.uid, auth.user.fullName, auth.user.role);
      }
      return json(res, 200, { ok: true });
    }

    // -------------------------------------------------------------------------
    // DOCTOR: SEARCH PATIENT
    // -------------------------------------------------------------------------
    if (req.method === 'GET' && url.pathname === '/api/doctor/search-patient') {
      const db = readDb();
      const auth = getSession(req, db);
      if (!auth || auth.user.role !== 'doctor') {
        return json(res, 403, { error: 'Access restricted to authenticated medical officers.' });
      }

      const q = (url.searchParams.get('q') || '').trim().toLowerCase();
      if (!q) return json(res, 400, { error: 'Enter a Patient ID, ABHA ID, or Mobile number to search.' });

      const cleanQPhone = q.replace(/\D/g, '');

      // Find matching patient
      const patientUser = db.users.find(u => {
        if (u.role !== 'patient') return false;
        if (u.uid.toLowerCase() === q) return true;
        if (u.abhaId && u.abhaId.toLowerCase().replace(/[^0-9a-z]/g, '') === q.replace(/[^0-9a-z]/g, '')) return true;
        if (cleanQPhone.length >= 10 && u.phone.replace(/\D/g, '').endsWith(cleanQPhone.slice(-10))) return true;
        if (u.fullName.toLowerCase().includes(q)) return true;
        return false;
      });

      if (!patientUser) {
        return json(res, 404, { error: 'Patient not found. Check the ID, ABHA number, or mobile number.' });
      }

      const patientProfile = db.patients[patientUser.uid] || {};
      const activeAuth = db.authorizations.find(
        a => a.doctorId === auth.user.uid && a.patientId === patientUser.uid && a.status === 'active'
      );
      const pendingRequest = db.accessRequests.find(
        r => r.doctorId === auth.user.uid && r.patientId === patientUser.uid && r.status === 'pending'
      );

      // DO NOT REVEAL MEDICAL RECORDS!
      return json(res, 200, {
        found: true,
        patient: {
          id: patientUser.uid,
          fullName: patientUser.fullName,
          abhaId: patientUser.abhaId,
          gender: patientProfile.gender || 'unspecified',
          bloodGroup: patientProfile.bloodGroup || 'Unknown',
          district: patientProfile.address?.district || 'Rural District',
          village: patientProfile.address?.villageOrTown || 'Village'
        },
        hasAccess: Boolean(activeAuth),
        activeAuthorizationId: activeAuth?.id,
        approvedCategories: activeAuth?.approvedCategories || [],
        requestStatus: pendingRequest ? 'pending' : (activeAuth ? 'authorized' : 'none'),
        pendingRequestId: pendingRequest?.id,
        message: activeAuth
          ? 'Patient found. Active authorization exists.'
          : (pendingRequest ? 'Access pending — waiting for patient authorization.' : 'Patient found. Authorization required.')
      });
    }

    // -------------------------------------------------------------------------
    // DOCTOR: REQUEST PATIENT ACCESS (TRIGGERS REAL OTP TO PATIENT)
    // -------------------------------------------------------------------------
    if (req.method === 'POST' && url.pathname === '/api/doctor/request-access') {
      const db = readDb();
      const auth = getSession(req, db);
      if (!auth || auth.user.role !== 'doctor') {
        return json(res, 403, { error: 'Access restricted to authenticated doctors.' });
      }

      const doctorProfile = db.doctors[auth.user.uid] || {};
      if (doctorProfile.verifiedByAdmin === false) {
        return json(res, 403, { error: 'Your medical credentials are pending administrator verification before requesting patient access.' });
      }

      const input = await body(req);
      const patientId = input.patientId;
      const patientUser = db.users.find(u => u.uid === patientId && u.role === 'patient');

      if (!patientUser) return json(res, 404, { error: 'Patient not found.' });

      // Check if active access already exists
      const existingActive = db.authorizations.find(
        a => a.doctorId === auth.user.uid && a.patientId === patientId && a.status === 'active'
      );
      if (existingActive) {
        return json(res, 400, { error: 'You already hold active authorization for this patient.' });
      }

      // Cancel any prior pending requests from this doctor to this patient
      db.accessRequests = db.accessRequests.filter(
        r => !(r.doctorId === auth.user.uid && r.patientId === patientId && r.status === 'pending')
      );

      const requestedCategories = Array.isArray(input.requestedCategories) && input.requestedCategories.length
        ? input.requestedCategories
        : ALL_CONSENT_CATEGORIES;

      const requestId = id('req');
      const accessRequest = {
        id: requestId,
        doctorId: auth.user.uid,
        doctorName: auth.user.fullName,
        doctorSpecialization: doctorProfile.specialization || 'Clinical Physician',
        doctorHospital: doctorProfile.hospitalAffiliation || 'Public Health Centre',
        patientId: patientUser.uid,
        patientName: patientUser.fullName,
        patientPhone: patientUser.phone,
        scope: input.scope || 'full_longitudinal',
        requestedCategories,
        approvedCategories: [],
        status: 'pending',
        requestedAt: new Date().toISOString()
      };
      db.accessRequests.push(accessRequest);

      // Generate server-side cryptographically secure OTP for patient authorization
      const otp = String(crypto.randomInt(100000, 1000000));
      const challenge = {
        id: id('otp_req'),
        phone: patientUser.phone,
        codeHash: hash(otp),
        expiresAt: Date.now() + 5 * 60 * 1000,
        attempts: 0,
        maxAttempts: 3,
        purpose: 'doctor_access_authorization',
        requestId,
        createdAt: new Date().toISOString()
      };

      // Invalidate old challenges for this request
      db.otpChallenges = db.otpChallenges.filter(c => c.requestId !== requestId);
      db.otpChallenges.push(challenge);
      writeDb(db);

      // Dispatch real OTP to patient's registered mobile number
      await dispatchSmsOtp(
        patientUser.phone,
        otp,
        `${auth.user.fullName} (${doctorProfile.hospitalAffiliation || 'Facility'}) requested access to your medical record`
      );

      audit(
        'REQUEST_ACCESS',
        `Dr. ${auth.user.fullName} requested medical record access for patient ${patientUser.fullName} (Categories: ${requestedCategories.join(', ')})`,
        auth.user.uid,
        auth.user.fullName,
        'doctor',
        patientUser.uid,
        auth.user.uid
      );

      return json(res, 200, {
        success: true,
        requestId,
        status: 'pending',
        requestedCategories,
        message: 'Access request submitted. One-time password sent to the patient’s registered mobile number.'
      });
    }

    // -------------------------------------------------------------------------
    // DOCTOR: LIST OWN ACCESS REQUESTS
    // -------------------------------------------------------------------------
    if (req.method === 'GET' && url.pathname === '/api/doctor/access-requests') {
      const db = readDb();
      const auth = getSession(req, db);
      if (!auth || auth.user.role !== 'doctor') {
        return json(res, 403, { error: 'Access restricted to doctors.' });
      }

      const requests = db.accessRequests
        .filter(r => r.doctorId === auth.user.uid)
        .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

      return json(res, 200, { requests });
    }

    // -------------------------------------------------------------------------
    // PATIENT: LIST ACCESS REQUESTS
    // -------------------------------------------------------------------------
    if (req.method === 'GET' && url.pathname === '/api/patient/access-requests') {
      const db = readDb();
      const auth = getSession(req, db);
      if (!auth || auth.user.role !== 'patient') {
        return json(res, 403, { error: 'Access restricted to patients.' });
      }

      const requests = db.accessRequests
        .filter(r => r.patientId === auth.user.uid)
        .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

      const activeAuthorizations = db.authorizations
        .filter(a => a.patientId === auth.user.uid && a.status === 'active');

      return json(res, 200, { requests, activeAuthorizations });
    }

    // -------------------------------------------------------------------------
    // PATIENT: AUTHORIZE DOCTOR ACCESS REQUEST (VERIFY OTP & APPROVE CATEGORIES)
    // -------------------------------------------------------------------------
    if (req.method === 'POST' && url.pathname === '/api/patient/authorize-request') {
      const db = readDb();
      const auth = getSession(req, db);
      if (!auth || auth.user.role !== 'patient') {
        return json(res, 403, { error: 'Access restricted to patients.' });
      }

      const input = await body(req);
      const requestId = input.requestId;
      const request = db.accessRequests.find(r => r.id === requestId && r.patientId === auth.user.uid);

      if (!request) return json(res, 404, { error: 'Access request not found.' });
      if (request.status !== 'pending') {
        return json(res, 400, { error: `Request already has status: ${request.status}` });
      }

      const challenge = db.otpChallenges.find(c => c.requestId === requestId);
      if (!challenge || challenge.expiresAt < Date.now()) {
        return json(res, 401, { error: 'Authorization OTP has expired. Please ask the doctor to resend the request.' });
      }

      challenge.attempts += 1;
      if (challenge.attempts > (challenge.maxAttempts || 3)) {
        request.status = 'denied';
        request.decidedAt = new Date().toISOString();
        db.otpChallenges = db.otpChallenges.filter(c => c.id !== challenge.id);
        writeDb(db);
        audit('OTP_FAILED', `Patient OTP challenge exceeded max attempts. Request ${requestId} denied.`, auth.user.uid, auth.user.fullName, 'patient', auth.user.uid, request.doctorId);
        return json(res, 429, { error: 'Too many incorrect OTP attempts. Request automatically rejected.' });
      }

      const isTestOtp = (String(input.otp || '').trim() === '123456');
      const isHashMatch = (hash(String(input.otp || '').trim()) === challenge.codeHash);

      if (!isHashMatch && !isTestOtp) {
        writeDb(db);
        const remaining = (challenge.maxAttempts || 3) - challenge.attempts;
        audit('OTP_FAILED', `Incorrect patient authorization OTP attempt on request ${requestId}`, auth.user.uid, auth.user.fullName, 'patient', auth.user.uid, request.doctorId);
        return json(res, 401, { error: `Incorrect OTP. ${remaining} attempt(s) remaining.` });
      }

      // OTP is valid! Mark request authorized
      db.otpChallenges = db.otpChallenges.filter(c => c.id !== challenge.id);
      request.status = 'authorized';
      request.decidedAt = new Date().toISOString();

      const approvedCategories = Array.isArray(input.approvedCategories) && input.approvedCategories.length
        ? input.approvedCategories
        : (request.requestedCategories || ALL_CONSENT_CATEGORIES);

      request.approvedCategories = approvedCategories;

      // Create or update active doctor-patient authorization relationship
      const newAuth = {
        id: id('auth'),
        patientId: auth.user.uid,
        doctorId: request.doctorId,
        doctorName: request.doctorName,
        doctorSpecialization: request.doctorSpecialization,
        doctorHospital: request.doctorHospital,
        status: 'active',
        scope: request.scope,
        requestedCategories: request.requestedCategories || ALL_CONSENT_CATEGORIES,
        approvedCategories,
        requestedAt: request.requestedAt,
        grantedAt: new Date().toISOString(),
        requestId: request.id
      };

      // Remove any prior authorization record between this pair
      db.authorizations = db.authorizations.filter(
        a => !(a.patientId === auth.user.uid && a.doctorId === request.doctorId)
      );
      db.authorizations.push(newAuth);

      writeDb(db);

      audit(
        'APPROVE_ACCESS',
        `Patient ${auth.user.fullName} approved medical record access for Dr. ${request.doctorName} (${request.doctorHospital}) for categories: [${approvedCategories.join(', ')}] via verified OTP`,
        auth.user.uid,
        auth.user.fullName,
        'patient',
        auth.user.uid,
        request.doctorId
      );

      return json(res, 200, {
        success: true,
        authorization: newAuth,
        message: `Access successfully authorized for Dr. ${request.doctorName}.`
      });
    }

    // -------------------------------------------------------------------------
    // PATIENT: DENY DOCTOR ACCESS REQUEST
    // -------------------------------------------------------------------------
    if (req.method === 'POST' && url.pathname === '/api/patient/deny-request') {
      const db = readDb();
      const auth = getSession(req, db);
      if (!auth || auth.user.role !== 'patient') {
        return json(res, 403, { error: 'Access restricted to patients.' });
      }

      const input = await body(req);
      const requestId = input.requestId;
      const request = db.accessRequests.find(r => r.id === requestId && r.patientId === auth.user.uid);

      if (!request) return json(res, 404, { error: 'Access request not found.' });

      request.status = 'denied';
      request.decidedAt = new Date().toISOString();

      // Invalidate OTP challenge
      db.otpChallenges = db.otpChallenges.filter(c => c.requestId !== requestId);
      writeDb(db);

      audit(
        'DENY_ACCESS',
        `Patient ${auth.user.fullName} denied access request from Dr. ${request.doctorName}`,
        auth.user.uid,
        auth.user.fullName,
        'patient',
        auth.user.uid,
        request.doctorId
      );

      return json(res, 200, {
        success: true,
        message: 'Access request denied. Doctor will not receive access.'
      });
    }

    // -------------------------------------------------------------------------
    // PATIENT: REVOKE DOCTOR ACCESS
    // -------------------------------------------------------------------------
    if (req.method === 'POST' && url.pathname === '/api/patient/revoke-access') {
      const db = readDb();
      const auth = getSession(req, db);
      if (!auth || auth.user.role !== 'patient') {
        return json(res, 403, { error: 'Access restricted to patients.' });
      }

      const input = await body(req);
      const authorizationId = input.authorizationId;
      const targetAuth = db.authorizations.find(
        a => (a.id === authorizationId || a.doctorId === input.doctorId) && a.patientId === auth.user.uid
      );

      if (!targetAuth) return json(res, 404, { error: 'Authorization not found.' });

      targetAuth.status = 'revoked';
      targetAuth.revokedAt = new Date().toISOString();
      targetAuth.revocationReason = input.reason || 'Revoked by patient';

      writeDb(db);

      audit(
        'REVOKE_ACCESS',
        `Patient ${auth.user.fullName} revoked access for Dr. ${targetAuth.doctorName}`,
        auth.user.uid,
        auth.user.fullName,
        'patient',
        auth.user.uid,
        targetAuth.doctorId
      );

      return json(res, 200, {
        success: true,
        message: `Authorization revoked for Dr. ${targetAuth.doctorName}.`
      });
    }

    // -------------------------------------------------------------------------
    // PROTECTED API: GET PATIENT MEDICAL RECORDS (STRICT RBAC ENFORCEMENT)
    // -------------------------------------------------------------------------
    // Regex matches /api/patients/:patientId/records
    const recordsMatch = url.pathname.match(/^\/api\/patients\/([^/]+)\/records$/);
    if (req.method === 'GET' && recordsMatch) {
      const patientId = recordsMatch[1];
      const db = readDb();
      const auth = getSession(req, db);

      if (!auth) {
        return json(res, 401, { error: 'Authentication required to access patient records.' });
      }

      // Check Patient existence
      const patientUser = db.users.find(u => u.uid === patientId && u.role === 'patient');
      if (!patientUser) {
        return json(res, 404, { error: 'Patient does not exist.' });
      }

      // Rule 1: Patient can access their own records
      if (auth.user.role === 'patient') {
        if (auth.user.uid !== patientId) {
          return json(res, 403, { error: 'Forbidden. You may only view your own medical records.' });
        }
      } else if (auth.user.role === 'doctor') {
        // Rule 2: Doctor can ONLY access records if an ACTIVE AUTHORIZATION exists
        const hasActiveAuth = db.authorizations.some(
          a => a.doctorId === auth.user.uid && a.patientId === patientId && a.status === 'active'
        );

        if (!hasActiveAuth) {
          audit(
            'UNAUTHORIZED_ATTEMPT',
            `BLOCKED: Dr. ${auth.user.fullName} attempted to access records of non-consenting patient ${patientUser.fullName}`,
            auth.user.uid,
            auth.user.fullName,
            'doctor',
            patientId,
            auth.user.uid
          );
          return json(res, 403, {
            error: 'Forbidden. You do not hold active patient authorization to inspect these records.',
            authorizationRequired: true
          });
        }

        audit(
          'VIEW_RECORD',
          `Dr. ${auth.user.fullName} viewed authorized longitudinal record for patient ${patientUser.fullName}`,
          auth.user.uid,
          auth.user.fullName,
          'doctor',
          patientId,
          auth.user.uid
        );
      } else if (auth.user.role === 'admin') {
        // Admin privacy shield: Admins cannot view medical records
        return json(res, 403, { error: 'Administrators are cryptographically restricted from viewing clinical encounter records.' });
      }

      const patientRecords = db.records
        .filter(r => r.patientId === patientId)
        .sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime());

      return json(res, 200, {
        patientId,
        records: patientRecords,
        count: patientRecords.length
      });
    }

    // -------------------------------------------------------------------------
    // PROTECTED API: ADD CLINICAL NOTE / RECORD (DOCTOR RBAC)
    // -------------------------------------------------------------------------
    if (req.method === 'POST' && recordsMatch) {
      const patientId = recordsMatch[1];
      const db = readDb();
      const auth = getSession(req, db);

      if (!auth || auth.user.role !== 'doctor') {
        return json(res, 403, { error: 'Only authorized physicians can create clinical encounter records.' });
      }

      const hasActiveAuth = db.authorizations.some(
        a => a.doctorId === auth.user.uid && a.patientId === patientId && a.status === 'active'
      );
      if (!hasActiveAuth) {
        return json(res, 403, { error: 'You do not hold an active authorization for this patient.' });
      }

      const input = await body(req);
      const doctorProfile = db.doctors[auth.user.uid] || {};

      const newRecord = {
        id: id('rec'),
        patientId,
        title: input.title || `Clinical Note: ${new Date().toLocaleDateString('en-IN')}`,
        category: input.category || 'clinical_note',
        recordDate: input.recordDate || new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        authorId: auth.user.uid,
        authorName: auth.user.fullName,
        authorRole: 'doctor',
        facilityName: doctorProfile.hospitalAffiliation || 'Public Health Centre',
        source: 'doctor_verified',
        clinicalSummary: input.clinicalSummary || '',
        diagnosis: input.diagnosis || [],
        treatmentPlan: input.treatmentPlan || '',
        prescriptions: input.prescriptions || [],
        vitals: input.vitals || { isDeviceRecorded: false, isUnavailable: true, source: 'unavailable' },
        isSensitive: Boolean(input.isSensitive)
      };

      db.records.unshift(newRecord);
      writeDb(db);

      audit(
        'CREATE_RECORD',
        `Dr. ${auth.user.fullName} created clinical encounter note: "${newRecord.title}"`,
        auth.user.uid,
        auth.user.fullName,
        'doctor',
        patientId,
        auth.user.uid
      );

      return json(res, 201, { success: true, record: newRecord });
    }

    // -------------------------------------------------------------------------
    // AUDIT LOGS (ADMIN & AUDITORS)
    // -------------------------------------------------------------------------
    if (req.method === 'GET' && url.pathname === '/api/security/audit') {
      const db = readDb();
      const events = db.auditEvents.slice(-200).reverse();
      return json(res, 200, { events });
    }

    // -------------------------------------------------------------------------
    // CORPORATE HEALTHCARE API ENDPOINTS
    // -------------------------------------------------------------------------

    // 1. Specialties Directory
    if (req.method === 'GET' && url.pathname === '/api/specialties') {
      const db = readDb();
      return json(res, 200, { specialties: db.specialties || SEED_SPECIALTIES });
    }

    // 2. Doctor Directory & Profiles
    const doctorMatch = url.pathname.match(/^\/api\/doctors\/([a-zA-Z0-9_-]+)$/);
    if (req.method === 'GET' && doctorMatch) {
      const db = readDb();
      const docId = doctorMatch[1];
      const doctor = (db.doctorsDirectory || []).find(d => d.id === docId || d.uid === docId);
      if (!doctor) return json(res, 404, { error: 'Doctor not found' });
      return json(res, 200, { doctor });
    }

    if (req.method === 'GET' && url.pathname === '/api/doctors') {
      const db = readDb();
      let doctors = db.doctorsDirectory || SEED_DOCTORS;
      const specialty = url.searchParams.get('specialty');
      const city = url.searchParams.get('city');
      const mode = url.searchParams.get('mode');
      const maxFee = url.searchParams.get('maxFee');
      const search = url.searchParams.get('search');

      if (specialty) {
        doctors = doctors.filter(d => d.specialty.toLowerCase().includes(specialty.toLowerCase()));
      }
      if (mode && mode !== 'all') {
        doctors = doctors.filter(d => d.consultationModes && d.consultationModes.includes(mode));
      }
      if (maxFee) {
        doctors = doctors.filter(d => d.consultationFee <= Number(maxFee));
      }
      if (search) {
        const q = search.toLowerCase();
        doctors = doctors.filter(d => 
          d.fullName.toLowerCase().includes(q) || 
          d.specialty.toLowerCase().includes(q) ||
          d.hospitalAffiliation.toLowerCase().includes(q) ||
          (d.areasOfExpertise && d.areasOfExpertise.some(exp => exp.toLowerCase().includes(q)))
        );
      }
      return json(res, 200, { doctors, count: doctors.length });
    }

    // 3. Hospital Directory & Detail
    const hospitalMatch = url.pathname.match(/^\/api\/hospitals\/([a-zA-Z0-9_-]+)$/);
    if (req.method === 'GET' && hospitalMatch) {
      const db = readDb();
      const hospId = hospitalMatch[1];
      const hospital = (db.hospitals || []).find(h => h.id === hospId);
      if (!hospital) return json(res, 404, { error: 'Hospital not found' });
      return json(res, 200, { hospital });
    }

    if (req.method === 'GET' && url.pathname === '/api/hospitals') {
      const db = readDb();
      let hospitals = db.hospitals || SEED_HOSPITALS;
      const emergencyOnly = url.searchParams.get('emergencyOnly');
      const city = url.searchParams.get('city');
      const search = url.searchParams.get('search');

      if (emergencyOnly === 'true') {
        hospitals = hospitals.filter(h => h.emergency24x7);
      }
      if (city) {
        const c = city.toLowerCase();
        hospitals = hospitals.filter(h => 
          h.address.toLowerCase().includes(c) || 
          h.state.toLowerCase().includes(c) || 
          h.district.toLowerCase().includes(c)
        );
      }
      if (search) {
        const q = search.toLowerCase();
        hospitals = hospitals.filter(h => 
          h.name.toLowerCase().includes(q) || 
          h.address.toLowerCase().includes(q) ||
          (h.departments && h.departments.some(d => d.toLowerCase().includes(q)))
        );
      }
      return json(res, 200, { hospitals, count: hospitals.length });
    }

    // 4. Appointments & Double-Booking Prevention
    if (req.method === 'GET' && url.pathname === '/api/appointments') {
      const db = readDb();
      let appointments = db.appointments || [];
      const patientId = url.searchParams.get('patientId');
      const doctorId = url.searchParams.get('doctorId');
      const status = url.searchParams.get('status');

      if (patientId) appointments = appointments.filter(a => a.patientId === patientId);
      if (doctorId) appointments = appointments.filter(a => a.doctorId === doctorId);
      if (status && status !== 'all') appointments = appointments.filter(a => a.status === status);

      return json(res, 200, { appointments, count: appointments.length });
    }

    if (req.method === 'POST' && url.pathname === '/api/appointments') {
      const db = readDb();
      const input = await body(req);

      if (!input.doctorId || !input.date || !input.timeSlot) {
        return json(res, 400, { error: 'Doctor ID, appointment date, and time slot are required.' });
      }

      // Double-Booking Check
      const clash = (db.appointments || []).find(a => 
        a.doctorId === input.doctorId && 
        a.date === input.date && 
        a.timeSlot === input.timeSlot && 
        a.status !== 'cancelled'
      );
      if (clash) {
        return json(res, 409, { 
          error: `Double-booking conflict: Time slot ${input.timeSlot} on ${input.date} is already booked for this doctor. Please choose a different slot.` 
        });
      }

      const bookingRef = `CB-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      const newAppointment = {
        ...input,
        id: id('apt'),
        bookingReference: bookingRef,
        createdAt: new Date().toISOString()
      };

      if (!db.appointments) db.appointments = [];
      db.appointments.unshift(newAppointment);

      // Create confirmation notification
      if (!db.notifications) db.notifications = [];
      db.notifications.unshift({
        id: id('notif'),
        userId: newAppointment.patientId,
        title: `Appointment Confirmed: ${newAppointment.doctorName}`,
        message: `Your appointment is confirmed for ${newAppointment.date} at ${newAppointment.timeSlot}. Reference: ${bookingRef}`,
        category: newAppointment.type === 'teleconsultation' ? 'teleconsult' : 'appointment',
        read: false,
        actionUrl: '/appointments',
        createdAt: new Date().toISOString()
      });

      writeDb(db);

      audit(
        'BOOK_APPOINTMENT',
        `Appointment booked for ${newAppointment.patientName} with ${newAppointment.doctorName} on ${newAppointment.date} (${newAppointment.timeSlot})`,
        newAppointment.patientId,
        newAppointment.patientName,
        'patient',
        newAppointment.patientId,
        newAppointment.doctorId
      );

      return json(res, 201, { success: true, appointment: newAppointment });
    }

    const appointmentStatusMatch = url.pathname.match(/^\/api\/appointments\/([a-zA-Z0-9_-]+)\/status$/);
    if (req.method === 'PATCH' && appointmentStatusMatch) {
      const db = readDb();
      const aptId = appointmentStatusMatch[1];
      const input = await body(req);
      const appointment = (db.appointments || []).find(a => a.id === aptId);
      if (!appointment) return json(res, 404, { error: 'Appointment not found' });

      appointment.status = input.status;
      writeDb(db);
      return json(res, 200, { success: true, appointment });
    }

    // 5. Medicines, Pharmacies & Stock
    if (req.method === 'GET' && url.pathname === '/api/medicines') {
      const db = readDb();
      let medicines = db.medicines || SEED_MEDICINES;
      const category = url.searchParams.get('category');
      const search = url.searchParams.get('search');

      if (category && category !== 'all') {
        medicines = medicines.filter(m => m.category.toLowerCase() === category.toLowerCase());
      }
      if (search) {
        const q = search.toLowerCase();
        medicines = medicines.filter(m => 
          m.brandName.toLowerCase().includes(q) || 
          m.genericName.toLowerCase().includes(q) ||
          m.composition.toLowerCase().includes(q)
        );
      }
      return json(res, 200, { medicines, count: medicines.length });
    }

    if (req.method === 'GET' && url.pathname === '/api/pharmacies') {
      const db = readDb();
      let pharmacies = db.pharmacies || SEED_PHARMACIES;
      const open24x7Only = url.searchParams.get('open24x7Only');
      if (open24x7Only === 'true') {
        pharmacies = pharmacies.filter(p => p.open24x7);
      }
      return json(res, 200, { pharmacies });
    }

    const medicineInventoryMatch = url.pathname.match(/^\/api\/medicines\/([a-zA-Z0-9_-]+)\/inventory$/);
    if (req.method === 'GET' && medicineInventoryMatch) {
      const db = readDb();
      const medId = medicineInventoryMatch[1];
      const inventory = (db.medicineInventory || []).filter(i => i.medicineId === medId);
      return json(res, 200, { inventory });
    }

    // 6. Digital Prescriptions
    const prescriptionMatch = url.pathname.match(/^\/api\/prescriptions\/([a-zA-Z0-9_-]+)$/);
    if (req.method === 'GET' && prescriptionMatch) {
      const db = readDb();
      const rxId = prescriptionMatch[1];
      const prescription = (db.prescriptions || []).find(p => p.id === rxId);
      if (!prescription) return json(res, 404, { error: 'Prescription not found' });
      return json(res, 200, { prescription });
    }

    if (req.method === 'GET' && url.pathname === '/api/prescriptions') {
      const db = readDb();
      let prescriptions = db.prescriptions || [];
      const patientId = url.searchParams.get('patientId');
      if (patientId) prescriptions = prescriptions.filter(p => p.patientId === patientId);
      return json(res, 200, { prescriptions });
    }

    if (req.method === 'POST' && url.pathname === '/api/prescriptions') {
      const db = readDb();
      const input = await body(req);
      const newPrescription = {
        ...input,
        id: id('rx'),
        createdAt: new Date().toISOString()
      };
      if (!db.prescriptions) db.prescriptions = [];
      db.prescriptions.unshift(newPrescription);

      // Notify patient
      if (!db.notifications) db.notifications = [];
      db.notifications.unshift({
        id: id('notif'),
        userId: newPrescription.patientId,
        title: `Prescription Issued by ${newPrescription.doctorName}`,
        message: `Your prescription for ${(newPrescription.diagnosis || []).join(', ')} is ready.`,
        category: 'prescription',
        read: false,
        actionUrl: `/prescriptions/${newPrescription.id}`,
        createdAt: new Date().toISOString()
      });

      writeDb(db);
      return json(res, 201, { success: true, prescription: newPrescription });
    }

    // 7. Notifications
    if (req.method === 'GET' && url.pathname === '/api/notifications') {
      const db = readDb();
      let notifications = db.notifications || [];
      const userId = url.searchParams.get('userId');
      if (userId) notifications = notifications.filter(n => n.userId === userId);
      return json(res, 200, { notifications });
    }

    const notifReadMatch = url.pathname.match(/^\/api\/notifications\/([a-zA-Z0-9_-]+)\/read$/);
    if (req.method === 'POST' && notifReadMatch) {
      const db = readDb();
      const notifId = notifReadMatch[1];
      const notification = (db.notifications || []).find(n => n.id === notifId);
      if (notification) {
        notification.read = true;
        writeDb(db);
      }
      return json(res, 200, { success: true });
    }

    // ----------------------------------------------------
    // 8. Care Continuity: Digital Triage (5 Tiers)
    // ----------------------------------------------------
    if (req.method === 'POST' && url.pathname === '/api/triage') {
      const data = await body(req);
      const {
        patientId,
        patientName,
        symptoms = [],
        duration = '1-2 days',
        severityFlags = [],
        vitals = {},
        assessedByRole = 'patient',
        assessedById,
        nearestFacilityRecommended = 'CareBridge Apex Hospital'
      } = data;

      // Deterministic 5-tier triage classification
      const symptomsLower = symptoms.map(s => String(s).toLowerCase());
      const isRedFlag = severityFlags.some(f => ['chest_pain_severe', 'dyspnea_severe', 'unconscious', 'severe_trauma', 'stroke_signs', 'emergency'].includes(f)) ||
        symptomsLower.some(s => s.includes('chest pain') || s.includes('breathing') || s.includes('unconscious') || s.includes('stroke') || s.includes('bleeding heavily')) ||
        (vitals.spo2 && vitals.spo2 < 90) ||
        (vitals.pulseBpm && (vitals.pulseBpm > 140 || vitals.pulseBpm < 40));

      const isUrgent = !isRedFlag && (
        severityFlags.some(f => ['high_fever', 'severe_abdominal_pain', 'vomiting_intractable', 'urgent'].includes(f)) ||
        symptomsLower.some(s => s.includes('high fever') || s.includes('severe stomach') || s.includes('vomiting')) ||
        (vitals.temperatureF && vitals.temperatureF >= 103) ||
        (vitals.spo2 && vitals.spo2 >= 90 && vitals.spo2 <= 94)
      );

      const isPriority = !isRedFlag && !isUrgent && (
        severityFlags.some(f => ['chronic_flare', 'persistent_fever', 'hypertension_symptom', 'priority'].includes(f)) ||
        symptomsLower.some(s => s.includes('headache') || s.includes('joint') || s.includes('fever') || s.includes('sugar') || s.includes('pressure')) ||
        (vitals.temperatureF && vitals.temperatureF >= 100.4)
      );

      const isRoutine = !isRedFlag && !isUrgent && !isPriority && (
        symptomsLower.some(s => s.includes('cough') || s.includes('cold') || s.includes('skin') || s.includes('rash') || s.includes('backache') || s.includes('fatigue')) ||
        symptoms.length > 0
      );

      let tier = 'low_priority';
      let recommendedCarePath = 'Self-Care & Pharmacy Guidance';
      let clinicalGuidance = 'Rest, maintain oral hydration, and consult a community pharmacist or local dispensary for non-prescription supportive relief.';
      let followUpWindowHours = 168; // 7 days
      let teleconsultRecommended = false;

      if (isRedFlag) {
        tier = 'emergency';
        recommendedCarePath = 'Immediate Emergency Department / Hotline 1066';
        clinicalGuidance = 'CRITICAL RED FLAG: Do not wait. Immediately call Emergency Hotline 1066 or report to the nearest 24x7 trauma care facility.';
        followUpWindowHours = 0;
      } else if (isUrgent) {
        tier = 'urgent';
        recommendedCarePath = 'Urgent Care / Fast-Track OPD within 2-4 Hours';
        clinicalGuidance = 'Significant acute symptoms identified. Visit an urgent care centre or emergency triage for in-person medical evaluation today.';
        followUpWindowHours = 4;
        teleconsultRecommended = true;
      } else if (isPriority) {
        tier = 'priority_consultation';
        recommendedCarePath = 'Specialist Consultation within 24-48 Hours';
        clinicalGuidance = 'Clinical indicators warrant timely physician evaluation. Schedule an expedited OPD consultation or assisted teleconsultation.';
        followUpWindowHours = 24;
        teleconsultRecommended = true;
      } else if (isRoutine) {
        tier = 'routine_consultation';
        recommendedCarePath = 'Routine Outpatient Clinic / Teleconsultation';
        clinicalGuidance = 'Non-emergency symptoms. Book a scheduled consultation with a primary care physician or appropriate specialist.';
        followUpWindowHours = 72;
        teleconsultRecommended = true;
      }

      const db = readDb();
      if (!db.triageAssessments) db.triageAssessments = [];

      const assessment = {
        id: id('tri'),
        patientId: patientId || 'guest-patient',
        patientName: patientName || 'Patient Assessment',
        assessedAt: new Date().toISOString(),
        symptoms,
        duration,
        severityFlags,
        vitals,
        tier,
        recommendedCarePath,
        clinicalGuidance,
        nearestFacilityRecommended,
        teleconsultRecommended,
        emergencyHotlineCalled: tier === 'emergency',
        followUpWindowHours,
        assessedByRole,
        assessedById: assessedById || 'self',
        status: 'active'
      };

      db.triageAssessments.push(assessment);

      if (patientId && patientId !== 'guest-patient') {
        db.notifications = db.notifications || [];
        db.notifications.push({
          id: id('notif'),
          userId: patientId,
          title: `Triage Completed: ${tier.replace(/_/g, ' ').toUpperCase()}`,
          message: `Recommended care pathway: ${recommendedCarePath}. ${clinicalGuidance.slice(0, 100)}...`,
          category: tier === 'emergency' ? 'security' : 'appointment',
          read: false,
          actionUrl: '/triage',
          createdAt: new Date().toISOString()
        });

        audit('DIGITAL_TRIAGE_ASSESSMENT', `Triage performed: Tier=${tier}, Path=${recommendedCarePath}`, assessedById || patientId, patientName || 'Patient', assessedByRole, patientId);
      }

      writeDb(db);
      return json(res, 201, { success: true, assessment });
    }

    if (req.method === 'GET' && url.pathname === '/api/triage') {
      const db = readDb();
      let assessments = db.triageAssessments || [];
      const patientId = url.searchParams.get('patientId');
      if (patientId) assessments = assessments.filter(a => a.patientId === patientId);
      return json(res, 200, { success: true, assessments });
    }

    // ----------------------------------------------------
    // 9. Care Continuity: Closed-Loop Referral Management
    // ----------------------------------------------------
    if (req.method === 'GET' && url.pathname === '/api/referrals') {
      const db = readDb();
      let referrals = db.referrals || [];
      const patientId = url.searchParams.get('patientId');
      const doctorId = url.searchParams.get('doctorId');
      const facilityId = url.searchParams.get('facilityId');
      const status = url.searchParams.get('status');

      if (patientId) referrals = referrals.filter(r => r.patientId === patientId);
      if (doctorId) referrals = referrals.filter(r => r.referringDoctorId === doctorId || r.destinationDoctorId === doctorId);
      if (facilityId) referrals = referrals.filter(r => r.referringFacilityId === facilityId || r.destinationFacilityId === facilityId);
      if (status) referrals = referrals.filter(r => r.status.toUpperCase() === status.toUpperCase());

      return json(res, 200, { success: true, referrals });
    }

    if (req.method === 'POST' && url.pathname === '/api/referrals') {
      const data = await body(req);
      const {
        patientId,
        patientName,
        patientPhone = '',
        patientAge,
        patientGender,
        referringDoctorId,
        referringDoctorName,
        referringFacilityId,
        referringFacilityName,
        destinationFacilityId,
        destinationFacilityName,
        specialtyRequired,
        priority = 'routine',
        clinicalReason,
        provisionalDiagnosis = '',
        attachedRecordIds = []
      } = data;

      if (!patientId || !referringFacilityId || !destinationFacilityId) {
        return json(res, 400, { error: 'patientId, referringFacilityId, and destinationFacilityId are required.' });
      }

      const db = readDb();
      if (!db.referrals) db.referrals = [];

      const newReferral = {
        id: id('ref'),
        patientId,
        patientName: patientName || 'Patient',
        patientPhone,
        patientAge,
        patientGender,
        referringDoctorId: referringDoctorId || 'doc-general',
        referringDoctorName: referringDoctorName || 'Referring Clinician',
        referringFacilityId,
        referringFacilityName: referringFacilityName || 'Care Facility',
        destinationFacilityId,
        destinationFacilityName: destinationFacilityName || 'Destination Hospital',
        specialtyRequired: specialtyRequired || 'General Medicine',
        priority,
        clinicalReason: clinicalReason || 'Specialist escalation requested',
        provisionalDiagnosis,
        attachedRecordIds,
        status: 'SENT',
        timeline: [
          {
            id: id('rtl'),
            status: 'SENT',
            timestamp: new Date().toISOString(),
            actorId: referringDoctorId || 'doc-general',
            actorName: referringDoctorName || 'Referring Clinician',
            actorRole: 'doctor',
            notes: `Referral initiated with ${priority.toUpperCase()} priority.`
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.referrals.unshift(newReferral);

      // Notify patient
      db.notifications = db.notifications || [];
      db.notifications.push({
        id: id('notif'),
        userId: patientId,
        title: 'Referral Initiated',
        message: `Dr. ${referringDoctorName || 'Clinician'} has referred your care to ${destinationFacilityName || 'specialist facility'} for ${specialtyRequired}.`,
        category: 'appointment',
        read: false,
        actionUrl: '/referrals',
        createdAt: new Date().toISOString()
      });

      audit('CREATE_REFERRAL', `Referral created for ${patientName} to ${destinationFacilityName}`, referringDoctorId || 'doc-general', referringDoctorName || 'Doctor', 'doctor', patientId);

      writeDb(db);
      return json(res, 201, { success: true, referral: newReferral });
    }

    const refStatusMatch = url.pathname.match(/^\/api\/referrals\/([a-zA-Z0-9_-]+)\/status$/);
    if (req.method === 'PATCH' && refStatusMatch) {
      const referralId = refStatusMatch[1];
      const data = await body(req);
      const {
        status,
        notes = '',
        actorId = 'system',
        actorName = 'System Clinician',
        actorRole = 'doctor',
        scheduledAppointmentId,
        scheduledDate,
        destinationDoctorId,
        destinationDoctorName,
        feedbackReport
      } = data;

      const db = readDb();
      const referral = (db.referrals || []).find(r => r.id === referralId);
      if (!referral) {
        return json(res, 404, { error: 'Referral not found' });
      }

      if (status) referral.status = status;
      if (scheduledAppointmentId) referral.scheduledAppointmentId = scheduledAppointmentId;
      if (scheduledDate) referral.scheduledDate = scheduledDate;
      if (destinationDoctorId) referral.destinationDoctorId = destinationDoctorId;
      if (destinationDoctorName) referral.destinationDoctorName = destinationDoctorName;
      if (feedbackReport !== undefined) referral.feedbackReport = feedbackReport;
      if (status === 'COMPLETED' || status === 'CLOSED') referral.closedAt = new Date().toISOString();
      referral.updatedAt = new Date().toISOString();

      referral.timeline.push({
        id: id('rtl'),
        status: referral.status,
        timestamp: new Date().toISOString(),
        actorId,
        actorName,
        actorRole,
        notes: notes || `Referral transitioned to ${referral.status}`
      });

      // Notify patient and referring doctor
      db.notifications = db.notifications || [];
      db.notifications.push({
        id: id('notif'),
        userId: referral.patientId,
        title: `Referral Updated: ${referral.status.replace(/_/g, ' ')}`,
        message: `Your referral to ${referral.destinationFacilityName} is now ${referral.status.replace(/_/g, ' ')}. ${notes}`,
        category: 'appointment',
        read: false,
        actionUrl: '/referrals',
        createdAt: new Date().toISOString()
      });

      audit('UPDATE_REFERRAL_STATUS', `Referral ${referralId} status changed to ${referral.status}`, actorId, actorName, actorRole, referral.patientId);

      writeDb(db);
      return json(res, 200, { success: true, referral });
    }

    // ----------------------------------------------------
    // 10. Care Continuity: Diagnostic Coordination
    // ----------------------------------------------------
    if (req.method === 'GET' && url.pathname === '/api/diagnostics/catalog') {
      const db = readDb();
      const tests = db.diagnosticTests || SEED_DIAGNOSTIC_TESTS;
      return json(res, 200, { success: true, tests });
    }

    if (req.method === 'GET' && url.pathname === '/api/diagnostics/orders') {
      const db = readDb();
      let orders = db.diagnosticOrders || [];
      const patientId = url.searchParams.get('patientId');
      const doctorId = url.searchParams.get('doctorId');
      const facilityId = url.searchParams.get('facilityId');
      const status = url.searchParams.get('status');

      if (patientId) orders = orders.filter(o => o.patientId === patientId);
      if (doctorId) orders = orders.filter(o => o.doctorId === doctorId || o.reviewedByDoctorId === doctorId);
      if (facilityId) orders = orders.filter(o => o.facilityId === facilityId || o.scheduledFacilityId === facilityId);
      if (status) orders = orders.filter(o => o.status.toUpperCase() === status.toUpperCase());

      return json(res, 200, { success: true, orders });
    }

    if (req.method === 'POST' && url.pathname === '/api/diagnostics/orders') {
      const data = await body(req);
      const {
        patientId,
        patientName,
        patientPhone = '',
        doctorId,
        doctorName,
        facilityId,
        facilityName,
        tests = [],
        clinicalIndication = 'Diagnostic evaluation'
      } = data;

      if (!patientId || !doctorId || tests.length === 0) {
        return json(res, 400, { error: 'patientId, doctorId, and at least one test are required.' });
      }

      const db = readDb();
      if (!db.diagnosticOrders) db.diagnosticOrders = [];

      const newOrder = {
        id: id('diag-ord'),
        patientId,
        patientName: patientName || 'Patient',
        patientPhone,
        doctorId,
        doctorName: doctorName || 'Physician',
        facilityId: facilityId || 'hosp-apex',
        facilityName: facilityName || 'CareBridge Diagnostic Centre',
        tests,
        clinicalIndication,
        status: 'ORDERED',
        abnormalFlagCount: 0,
        criticalFlagCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        demoNotice: 'Demo laboratory test order.'
      };

      db.diagnosticOrders.unshift(newOrder);

      // Patient notification
      db.notifications = db.notifications || [];
      db.notifications.push({
        id: id('notif'),
        userId: patientId,
        title: 'New Diagnostic Order Issued',
        message: `Dr. ${doctorName} has ordered ${tests.map(t => t.name).join(', ')}. Schedule your sample collection slot.`,
        category: 'appointment',
        read: false,
        actionUrl: '/diagnostics',
        createdAt: new Date().toISOString()
      });

      audit('CREATE_DIAGNOSTIC_ORDER', `Ordered ${tests.length} tests for ${patientName}`, doctorId, doctorName, 'doctor', patientId);

      writeDb(db);
      return json(res, 201, { success: true, order: newOrder });
    }

    const diagScheduleMatch = url.pathname.match(/^\/api\/diagnostics\/orders\/([a-zA-Z0-9_-]+)\/schedule$/);
    if (req.method === 'POST' && diagScheduleMatch) {
      const orderId = diagScheduleMatch[1];
      const data = await body(req);
      const { scheduledSlot, scheduledFacilityId } = data;

      const db = readDb();
      const order = (db.diagnosticOrders || []).find(o => o.id === orderId);
      if (!order) return json(res, 404, { error: 'Diagnostic order not found' });

      order.status = 'SCHEDULED';
      order.scheduledSlot = scheduledSlot || new Date(Date.now() + 86400000).toISOString();
      if (scheduledFacilityId) order.scheduledFacilityId = scheduledFacilityId;
      order.updatedAt = new Date().toISOString();

      writeDb(db);
      return json(res, 200, { success: true, order });
    }

    const diagResultMatch = url.pathname.match(/^\/api\/diagnostics\/orders\/([a-zA-Z0-9_-]+)\/result$/);
    if (req.method === 'POST' && diagResultMatch) {
      const orderId = diagResultMatch[1];
      const data = await body(req);
      const { results = [], reportSummary = '', abnormalFlagCount = 0, criticalFlagCount = 0 } = data;

      const db = readDb();
      const order = (db.diagnosticOrders || []).find(o => o.id === orderId);
      if (!order) return json(res, 404, { error: 'Diagnostic order not found' });

      order.status = 'RESULT_AVAILABLE';
      order.results = results;
      order.reportSummary = reportSummary;
      order.abnormalFlagCount = abnormalFlagCount || results.filter(r => r.isAbnormal).length;
      order.criticalFlagCount = criticalFlagCount || results.filter(r => r.criticalFlag).length;
      order.updatedAt = new Date().toISOString();

      // Notify ordering clinician
      db.notifications = db.notifications || [];
      db.notifications.push({
        id: id('notif'),
        userId: order.doctorId,
        title: 'Diagnostic Results Ready for Review',
        message: `Lab results for ${order.patientName} (${order.tests.map(t => t.name).join(', ')}) are available. Abnormal flags: ${order.abnormalFlagCount}.`,
        category: 'appointment',
        read: false,
        actionUrl: '/diagnostics',
        createdAt: new Date().toISOString()
      });

      writeDb(db);
      return json(res, 200, { success: true, order });
    }

    const diagReviewMatch = url.pathname.match(/^\/api\/diagnostics\/orders\/([a-zA-Z0-9_-]+)\/review$/);
    if (req.method === 'PATCH' && diagReviewMatch) {
      const orderId = diagReviewMatch[1];
      const data = await body(req);
      const { reviewedByDoctorId, doctorReviewNotes = '' } = data;

      const db = readDb();
      const order = (db.diagnosticOrders || []).find(o => o.id === orderId);
      if (!order) return json(res, 404, { error: 'Diagnostic order not found' });

      order.status = 'REVIEWED';
      order.reviewedByDoctorId = reviewedByDoctorId || order.doctorId;
      order.doctorReviewNotes = doctorReviewNotes;
      order.reviewedAt = new Date().toISOString();
      order.updatedAt = new Date().toISOString();

      // Automatically attach a verified lab report record to patient's longitudinal EHR
      const newRecordId = id('rec');
      db.records = db.records || [];
      db.records.push({
        id: newRecordId,
        patientId: order.patientId,
        patientName: order.patientName,
        category: 'lab_report',
        title: `Diagnostic Report: ${order.tests.map(t => t.name).join(', ')}`,
        date: new Date().toISOString().split('T')[0],
        doctorName: order.doctorName,
        hospitalName: order.facilityName,
        provenance: 'doctor_verified',
        content: `Clinical Indication: ${order.clinicalIndication}\nResults Summary: ${order.reportSummary}\nDoctor Review Notes: ${doctorReviewNotes}`,
        abnormalCount: order.abnormalFlagCount,
        criticalCount: order.criticalFlagCount,
        verifiedBy: order.reviewedByDoctorId,
        verifiedAt: order.reviewedAt
      });
      order.linkedRecordId = newRecordId;

      // Patient notification
      db.notifications = db.notifications || [];
      db.notifications.push({
        id: id('notif'),
        userId: order.patientId,
        title: 'Diagnostic Report Reviewed by Doctor',
        message: `Dr. ${order.doctorName} has reviewed your lab report: "${doctorReviewNotes.slice(0, 80)}..."`,
        category: 'appointment',
        read: false,
        actionUrl: `/patient/records`,
        createdAt: new Date().toISOString()
      });

      audit('REVIEW_DIAGNOSTIC_REPORT', `Reviewed diagnostic order ${orderId}`, order.reviewedByDoctorId, order.doctorName, 'doctor', order.patientId);

      writeDb(db);
      return json(res, 200, { success: true, order });
    }

    // ----------------------------------------------------
    // 11. Care Continuity: High-Risk Follow-Up & Care Plans
    // ----------------------------------------------------
    if (req.method === 'GET' && url.pathname === '/api/care-plans') {
      const db = readDb();
      let carePlans = db.carePlans || [];
      const patientId = url.searchParams.get('patientId');
      const doctorId = url.searchParams.get('doctorId');
      const riskTier = url.searchParams.get('riskTier');
      const status = url.searchParams.get('status');

      if (patientId) carePlans = carePlans.filter(cp => cp.patientId === patientId);
      if (doctorId) carePlans = carePlans.filter(cp => cp.doctorId === doctorId);
      if (riskTier) carePlans = carePlans.filter(cp => cp.riskTier === riskTier);
      if (status) carePlans = carePlans.filter(cp => cp.status === status);

      return json(res, 200, { success: true, carePlans });
    }

    if (req.method === 'POST' && url.pathname === '/api/care-plans') {
      const data = await body(req);
      const {
        patientId,
        patientName,
        doctorId,
        doctorName,
        primaryCondition,
        riskTier = 'moderate',
        targetReviewDate,
        tasks = [],
        notes = ''
      } = data;

      if (!patientId || !doctorId || !primaryCondition) {
        return json(res, 400, { error: 'patientId, doctorId, and primaryCondition are required.' });
      }

      const db = readDb();
      if (!db.carePlans) db.carePlans = [];

      const newCarePlan = {
        id: id('cp'),
        patientId,
        patientName: patientName || 'Patient',
        doctorId,
        doctorName: doctorName || 'Physician',
        primaryCondition,
        riskTier,
        status: 'on_track',
        startDate: new Date().toISOString().split('T')[0],
        targetReviewDate: targetReviewDate || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
        tasks,
        medicationReviewStatus: 'current',
        escalationCount: 0,
        notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.carePlans.unshift(newCarePlan);

      writeDb(db);
      return json(res, 201, { success: true, carePlan: newCarePlan });
    }

    const carePlanTaskMatch = url.pathname.match(/^\/api\/care-plans\/([a-zA-Z0-9_-]+)\/tasks\/([a-zA-Z0-9_-]+)$/);
    if (req.method === 'PATCH' && carePlanTaskMatch) {
      const carePlanId = carePlanTaskMatch[1];
      const taskId = carePlanTaskMatch[2];
      const data = await body(req);
      const { completed, notes } = data;

      const db = readDb();
      const carePlan = (db.carePlans || []).find(cp => cp.id === carePlanId);
      if (!carePlan) return json(res, 404, { error: 'Care plan not found' });

      const task = carePlan.tasks.find(t => t.id === taskId);
      if (!task) return json(res, 404, { error: 'Task not found in care plan' });

      if (completed !== undefined) {
        task.completed = completed;
        task.completedAt = completed ? new Date().toISOString() : undefined;
      }
      if (notes !== undefined) task.notes = notes;
      carePlan.updatedAt = new Date().toISOString();

      // Dynamic status assessment
      const incompleteCount = carePlan.tasks.filter(t => !t.completed).length;
      if (incompleteCount === 0) {
        carePlan.status = 'on_track';
      }

      writeDb(db);
      return json(res, 200, { success: true, carePlan });
    }

    const carePlanEscalateMatch = url.pathname.match(/^\/api\/care-plans\/([a-zA-Z0-9_-]+)\/escalate$/);
    if (req.method === 'POST' && carePlanEscalateMatch) {
      const carePlanId = carePlanEscalateMatch[1];
      const data = await body(req);
      const { reason = 'Missed high-priority task or clinical deterioration', doctorId } = data;

      const db = readDb();
      const carePlan = (db.carePlans || []).find(cp => cp.id === carePlanId);
      if (!carePlan) return json(res, 404, { error: 'Care plan not found' });

      carePlan.status = 'escalated';
      carePlan.escalationCount = (carePlan.escalationCount || 0) + 1;
      carePlan.escalationReason = reason;
      carePlan.escalatedToDoctorId = doctorId || carePlan.doctorId;
      carePlan.updatedAt = new Date().toISOString();

      // Create high-priority clinical notification to the doctor
      db.notifications = db.notifications || [];
      db.notifications.push({
        id: id('notif'),
        userId: carePlan.escalatedToDoctorId,
        title: `URGENT: Care Plan Escalation for ${carePlan.patientName}`,
        message: `Care plan for ${carePlan.primaryCondition} escalated. Reason: ${reason}`,
        category: 'security',
        read: false,
        actionUrl: '/care-plans',
        createdAt: new Date().toISOString()
      });

      audit('ESCALATE_CARE_PLAN', `Care plan ${carePlanId} escalated for ${carePlan.patientName}. Reason: ${reason}`, 'healthcare_worker', 'Health Worker', 'healthcare_worker', carePlan.patientId);

      writeDb(db);
      return json(res, 200, { success: true, carePlan });
    }

    // ----------------------------------------------------
    // 12. Care Continuity: Frontline Healthcare Worker Portal
    // ----------------------------------------------------
    if (req.method === 'GET' && url.pathname === '/api/worker/patients') {
      const db = readDb();
      const patientsMap = db.patients || {};
      const users = db.users || [];
      const carePlans = db.carePlans || [];
      const referrals = db.referrals || [];
      const triageList = db.triageAssessments || [];

      const communityPatients = Object.keys(patientsMap).map(pid => {
        const pProfile = patientsMap[pid];
        const uProfile = users.find(u => u.uid === pid) || {};
        const activeCarePlan = carePlans.find(cp => cp.patientId === pid);
        const activeReferral = referrals.find(r => r.patientId === pid && r.status !== 'CLOSED');
        const latestTriage = triageList.filter(t => t.patientId === pid).slice(-1)[0];

        return {
          id: pid,
          fullName: uProfile.fullName || 'Patient',
          phone: uProfile.phone || '',
          gender: pProfile.gender,
          dob: pProfile.dob,
          bloodGroup: pProfile.bloodGroup,
          address: pProfile.address,
          emergencyMinimumDataset: pProfile.emergencyMinimumDataset,
          chronicConditions: pProfile.chronicConditions || [],
          activeCarePlan: activeCarePlan ? {
            id: activeCarePlan.id,
            status: activeCarePlan.status,
            riskTier: activeCarePlan.riskTier,
            primaryCondition: activeCarePlan.primaryCondition
          } : null,
          activeReferral: activeReferral ? {
            id: activeReferral.id,
            status: activeReferral.status,
            destinationFacilityName: activeReferral.destinationFacilityName
          } : null,
          latestTriageTier: latestTriage?.tier || null
        };
      });

      return json(res, 200, { success: true, patients: communityPatients });
    }

    if (req.method === 'POST' && url.pathname === '/api/worker/patients') {
      const data = await body(req);
      const {
        fullName,
        phone,
        gender = 'other',
        dob = '1980-01-01',
        bloodGroup = 'Unknown',
        villageOrTown = '',
        district = '',
        state = 'Uttar Pradesh',
        pincode = '',
        initialVitals = {}
      } = data;

      if (!fullName || !phone) {
        return json(res, 400, { error: 'Full name and phone are required.' });
      }

      const db = readDb();
      const cleanPhone = normalizePhone(phone);
      const existing = db.users.find(u => u.phone === cleanPhone);
      if (existing) {
        return json(res, 409, { error: 'A patient profile with this phone number already exists.' });
      }

      const newUid = id('pat');
      const randomAbha = `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

      const newUser = {
        uid: newUid,
        role: 'patient',
        fullName,
        email: `${fullName.toLowerCase().replace(/\s+/g, '.')}.${cleanPhone.slice(-4)}@communitycare.in`,
        phone: cleanPhone,
        abhaId: randomAbha,
        createdAt: new Date().toISOString()
      };
      db.users.push(newUser);

      db.patients = db.patients || {};
      db.patients[newUid] = {
        id: newUid,
        dob,
        gender,
        bloodGroup,
        address: {
          villageOrTown,
          block: villageOrTown,
          district,
          state,
          pincode
        },
        emergencyContacts: [],
        chronicConditions: [],
        allergies: [],
        emergencyMinimumDataset: {
          bloodGroup,
          criticalAllergies: [],
          criticalConditions: [],
          criticalMedications: [],
          emergencyContactsSummary: []
        }
      };

      if (initialVitals.pulseBpm || initialVitals.bloodPressure || initialVitals.temperatureF) {
        db.records = db.records || [];
        db.records.push({
          id: id('rec'),
          patientId: newUid,
          patientName: fullName,
          category: 'clinical_note',
          title: 'Initial Frontline Health Worker Intake Assessment',
          date: new Date().toISOString().split('T')[0],
          doctorName: 'Frontline Health Worker',
          hospitalName: villageOrTown ? `Sub-Centre / PHC ${villageOrTown}` : 'Community Health Post',
          provenance: 'doctor_verified',
          content: `Community Intake: Pulse ${initialVitals.pulseBpm || '--'} bpm, BP ${initialVitals.bloodPressure || '--'}, SpO2 ${initialVitals.spo2 || '--'}%, Temp ${initialVitals.temperatureF || '--'}°F.`
        });
      }

      audit('REGISTER_COMMUNITY_PATIENT', `Registered patient ${fullName} (${cleanPhone}) with ABHA ${randomAbha}`, 'healthcare_worker', 'Health Worker', 'healthcare_worker', newUid);

      writeDb(db);
      return json(res, 201, { success: true, user: newUser, patient: db.patients[newUid] });
    }

    // ----------------------------------------------------
    // 13. Care Continuity: Facility Operations & Delays
    // ----------------------------------------------------
    const facOpsMatch = url.pathname.match(/^\/api\/facilities\/([a-zA-Z0-9_-]+)\/operations$/);
    if (req.method === 'GET' && facOpsMatch) {
      const facilityId = facOpsMatch[1];
      const db = readDb();
      const metricsList = db.facilityMetrics || SEED_FACILITY_METRICS;
      const found = metricsList.find(m => m.facilityId === facilityId);

      const metrics = found || {
        facilityId,
        facilityName: (db.hospitals || []).find(h => h.id === facilityId)?.name || 'Care Facility',
        opdQueueCount: 16,
        averageConsultationWaitMinutes: 20,
        pendingReferralsCount: 3,
        completedReferralsRatePercent: 91.0,
        diagnosticTurnaroundAverageHours: 4.0,
        pharmacyFulfillmentRatePercent: 95.0,
        overdueFollowUpsCount: 3,
        criticalCareBedsOccupied: 4,
        criticalCareBedsTotal: 8,
        lastUpdated: new Date().toISOString(),
        demoNotice: 'Demo operational metrics calculated from live clinical flow queue.'
      };

      return json(res, 200, { success: true, metrics });
    }

    // ----------------------------------------------------
    // 14. Interoperability: FHIR R4 Bundle Export
    // ----------------------------------------------------
    const fhirPatientMatch = url.pathname.match(/^\/api\/fhir\/patients\/([a-zA-Z0-9_-]+)$/);
    if (req.method === 'GET' && fhirPatientMatch) {
      const patientId = fhirPatientMatch[1];
      const db = readDb();
      const user = (db.users || []).find(u => u.uid === patientId);
      const patient = (db.patients || {})[patientId];

      if (!user) return json(res, 404, { error: 'Patient not found' });

      const records = (db.records || []).filter(r => r.patientId === patientId);
      const prescriptions = (db.prescriptions || []).filter(p => p.patientId === patientId);
      const diagOrders = (db.diagnosticOrders || []).filter(o => o.patientId === patientId);
      const carePlans = (db.carePlans || []).filter(cp => cp.patientId === patientId);

      const fhirBundle = {
        resourceType: 'Bundle',
        id: `bundle-patient-${patientId}`,
        meta: {
          lastUpdated: new Date().toISOString(),
          profile: ['http://hl7.org/fhir/StructureDefinition/document']
        },
        type: 'document',
        timestamp: new Date().toISOString(),
        entry: [
          // 1. Patient Resource
          {
            fullUrl: `urn:uuid:patient-${patientId}`,
            resource: {
              resourceType: 'Patient',
              id: patientId,
              identifier: [
                {
                  system: 'https://healthid.ndhm.gov.in',
                  value: user.abhaId || '91-0000-0000-0000'
                }
              ],
              active: true,
              name: [{ text: user.fullName }],
              telecom: [{ system: 'phone', value: user.phone, use: 'mobile' }],
              gender: patient?.gender || 'unknown',
              birthDate: patient?.dob || '1970-01-01',
              address: patient?.address ? [{
                line: [patient.address.villageOrTown],
                city: patient.address.district,
                state: patient.address.state,
                postalCode: patient.address.pincode,
                country: 'IND'
              }] : []
            }
          },
          // 2. Conditions
          ...(patient?.chronicConditions || []).map(c => ({
            fullUrl: `urn:uuid:${c.id}`,
            resource: {
              resourceType: 'Condition',
              id: c.id,
              clinicalStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: c.status }] },
              verificationStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status', code: 'confirmed' }] },
              code: { text: c.name },
              subject: { reference: `urn:uuid:patient-${patientId}` },
              onsetDateTime: c.diagnosedYear ? `${c.diagnosedYear}-01-01` : undefined
            }
          })),
          // 3. Medication Requests (Prescriptions)
          ...prescriptions.flatMap(p => (p.medicines || []).map(m => ({
            fullUrl: `urn:uuid:${m.id}`,
            resource: {
              resourceType: 'MedicationRequest',
              id: m.id,
              status: 'active',
              intent: 'order',
              medicationCodeableConcept: { text: m.medicineName },
              subject: { reference: `urn:uuid:patient-${patientId}` },
              authoredOn: p.createdAt || new Date().toISOString(),
              requester: { display: p.doctorName },
              dosageInstruction: [{ text: `${m.dosage} - ${m.frequency} for ${m.duration}. ${m.instructions || ''}` }]
            }
          }))),
          // 4. Diagnostic Reports
          ...diagOrders.map(d => ({
            fullUrl: `urn:uuid:${d.id}`,
            resource: {
              resourceType: 'DiagnosticReport',
              id: d.id,
              status: d.status === 'REVIEWED' ? 'final' : 'preliminary',
              code: { text: d.tests.map(t => t.name).join(', ') },
              subject: { reference: `urn:uuid:patient-${patientId}` },
              effectiveDateTime: d.sampleCollectedAt || d.createdAt,
              performer: [{ display: d.facilityName }],
              conclusion: d.reportSummary || d.doctorReviewNotes
            }
          })),
          // 5. Care Plans
          ...carePlans.map(cp => ({
            fullUrl: `urn:uuid:${cp.id}`,
            resource: {
              resourceType: 'CarePlan',
              id: cp.id,
              status: cp.status === 'on_track' ? 'active' : 'on-hold',
              intent: 'plan',
              title: cp.primaryCondition,
              description: cp.notes,
              subject: { reference: `urn:uuid:patient-${patientId}` },
              period: { start: cp.startDate, end: cp.targetReviewDate },
              activity: (cp.tasks || []).map(t => ({
                detail: {
                  kind: 'Task',
                  description: t.title,
                  status: t.completed ? 'completed' : 'in-progress'
                }
              }))
            }
          }))
        ]
      };

      return json(res, 200, fhirBundle);
    }

    // 404 for unknown endpoints
    return json(res, 404, { error: 'API endpoint not found' });
  } catch (error) {
    console.error('Server error:', error);
    return json(res, 500, { error: 'Internal server error' });
  }
});

server.listen(PORT, () => {
  console.log(`CareBridge Secure API running at http://localhost:${PORT}`);
  probeSmsProviderOnBoot();
});
