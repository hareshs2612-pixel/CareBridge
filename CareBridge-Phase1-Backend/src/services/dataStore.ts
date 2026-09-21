import { 
  UserProfile, 
  PatientProfile, 
  DoctorProfile, 
  HealthRecord, 
  AccessAuthorization, 
  EmergencyAccessEvent, 
  AuditLogEntry, 
  HealthcareFacility,
  AccessScope,
  MedicationReminder,
  CareAppointment,
  ReferralRecord,
  PatientCheckIn,
  GranularSharingConsent,
  AppLanguage
} from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_PATIENTS, 
  INITIAL_DOCTORS, 
  INITIAL_RECORDS, 
  INITIAL_AUTHORIZATIONS, 
  INITIAL_EMERGENCY_EVENTS, 
  INITIAL_AUDIT_LOGS, 
  RURAL_HEALTHCARE_FACILITIES,
  INITIAL_MEDICATION_REMINDERS,
  INITIAL_APPOINTMENTS,
  INITIAL_REFERRALS,
  INITIAL_CHECK_INS,
  INITIAL_GRANULAR_CONSENTS
} from './mockData';

const STORAGE_KEYS = {
  USERS: 'sih_users_v1',
  PATIENTS: 'sih_patients_v1',
  DOCTORS: 'sih_doctors_v1',
  RECORDS: 'sih_records_v1',
  AUTHORIZATIONS: 'sih_authorizations_v1',
  EMERGENCY_EVENTS: 'sih_emergency_events_v1',
  AUDIT_LOGS: 'sih_audit_logs_v1',
  CURRENT_USER_ID: 'sih_current_user_id_v1',
  MEDICATION_REMINDERS: 'sih_medication_reminders_v1',
  APPOINTMENTS: 'sih_appointments_v1',
  REFERRALS: 'sih_referrals_v1',
  CHECK_INS: 'sih_check_ins_v1',
  GRANULAR_CONSENTS: 'sih_granular_consents_v1',
  APP_LANGUAGE: 'sih_app_language_v1',
  LOW_CONNECTIVITY: 'sih_low_connectivity_v1'
};

class DataStore {
  private listeners: Array<() => void> = [];

  constructor() {
    this.initStorage();
  }

  private initStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PATIENTS)) {
      localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(INITIAL_PATIENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DOCTORS)) {
      localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(INITIAL_DOCTORS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RECORDS)) {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(INITIAL_RECORDS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUTHORIZATIONS)) {
      localStorage.setItem(STORAGE_KEYS.AUTHORIZATIONS, JSON.stringify(INITIAL_AUTHORIZATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EMERGENCY_EVENTS)) {
      localStorage.setItem(STORAGE_KEYS.EMERGENCY_EVENTS, JSON.stringify(INITIAL_EMERGENCY_EVENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID)) {
      // Default to Ramesh Kumar (Patient) for initial onboarding demonstration
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, 'pat-ramesh');
    }
    if (!localStorage.getItem(STORAGE_KEYS.MEDICATION_REMINDERS)) {
      localStorage.setItem(STORAGE_KEYS.MEDICATION_REMINDERS, JSON.stringify(INITIAL_MEDICATION_REMINDERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(INITIAL_APPOINTMENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REFERRALS)) {
      localStorage.setItem(STORAGE_KEYS.REFERRALS, JSON.stringify(INITIAL_REFERRALS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CHECK_INS)) {
      localStorage.setItem(STORAGE_KEYS.CHECK_INS, JSON.stringify(INITIAL_CHECK_INS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.GRANULAR_CONSENTS)) {
      localStorage.setItem(STORAGE_KEYS.GRANULAR_CONSENTS, JSON.stringify(INITIAL_GRANULAR_CONSENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.APP_LANGUAGE)) {
      localStorage.setItem(STORAGE_KEYS.APP_LANGUAGE, 'en');
    }
    if (!localStorage.getItem(STORAGE_KEYS.LOW_CONNECTIVITY)) {
      localStorage.setItem(STORAGE_KEYS.LOW_CONNECTIVITY, 'false');
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  // User Authentication & Session
  public getCurrentUser(): UserProfile {
    const uid = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || 'pat-ramesh';
    const users = this.getUsers();
    return users.find(u => u.uid === uid) || users[0];
  }

  public setCurrentUser(uid: string) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, uid);
    this.addAuditLog({
      actorId: uid,
      actorName: this.getUserById(uid)?.fullName || 'User',
      actorRole: this.getUserById(uid)?.role || 'patient',
      action: 'LOGIN',
      resourceType: 'patient_profile',
      details: `User session switched to ${this.getUserById(uid)?.fullName} (${this.getUserById(uid)?.role})`
    });
    this.notify();
  }

  public getUsers(): UserProfile[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : INITIAL_USERS;
  }

  public getUserById(uid: string): UserProfile | undefined {
    return this.getUsers().find(u => u.uid === uid);
  }

  // Patients
  public getPatients(): Record<string, PatientProfile> {
    const raw = localStorage.getItem(STORAGE_KEYS.PATIENTS);
    return raw ? JSON.parse(raw) : INITIAL_PATIENTS;
  }

  public getPatientById(id: string): PatientProfile | undefined {
    const patients = this.getPatients();
    return patients[id];
  }

  public updatePatient(profile: PatientProfile) {
    const patients = this.getPatients();
    patients[profile.id] = profile;
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
    this.notify();
  }

  // Doctors
  public getDoctors(): Record<string, DoctorProfile> {
    const raw = localStorage.getItem(STORAGE_KEYS.DOCTORS);
    return raw ? JSON.parse(raw) : INITIAL_DOCTORS;
  }

  public getDoctorById(id: string): DoctorProfile | undefined {
    const docs = this.getDoctors();
    return docs[id];
  }

  // Health Records
  public getRecords(): HealthRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
    return raw ? JSON.parse(raw) : INITIAL_RECORDS;
  }

  public getRecordsForPatient(patientId: string): HealthRecord[] {
    const all = this.getRecords();
    return all
      .filter(r => r.patientId === patientId)
      .sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime());
  }

  public getRecordById(id: string): HealthRecord | undefined {
    return this.getRecords().find(r => r.id === id);
  }

  public addRecord(record: HealthRecord) {
    const records = this.getRecords();
    records.unshift(record);
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    
    this.addAuditLog({
      actorId: record.authorId,
      actorName: record.authorName,
      actorRole: record.authorRole,
      action: record.source === 'uploaded_document' ? 'UPLOAD_DOCUMENT' : 'CREATE_RECORD',
      resourceType: 'health_record',
      resourceId: record.id,
      patientId: record.patientId,
      details: `${record.category.toUpperCase()}: ${record.title} [Source: ${record.source}]`
    });

    this.notify();
  }

  public updateRecord(record: HealthRecord) {
    const records = this.getRecords().map(r => r.id === record.id ? record : r);
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    this.notify();
  }

  // Consents & Authorizations
  public getAuthorizations(): AccessAuthorization[] {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTHORIZATIONS);
    return raw ? JSON.parse(raw) : INITIAL_AUTHORIZATIONS;
  }

  public getAuthorizationsForPatient(patientId: string): AccessAuthorization[] {
    return this.getAuthorizations().filter(a => a.patientId === patientId);
  }

  public getAuthorizedPatientsForDoctor(doctorId: string): string[] {
    return this.getAuthorizations()
      .filter(a => a.doctorId === doctorId && a.status === 'active')
      .map(a => a.patientId);
  }

  public hasDoctorAccess(patientId: string, doctorId: string): boolean {
    return this.getAuthorizations().some(
      a => a.patientId === patientId && a.doctorId === doctorId && a.status === 'active'
    );
  }

  public grantDoctorAccess(patientId: string, doctorId: string, scope: AccessScope = 'full_longitudinal') {
    const authorizations = this.getAuthorizations();
    const docProfile = this.getDoctorById(doctorId);
    const docUser = this.getUserById(doctorId);
    const patientUser = this.getUserById(patientId);

    const existingIndex = authorizations.findIndex(
      a => a.patientId === patientId && a.doctorId === doctorId
    );

    const newAuth: AccessAuthorization = {
      id: `auth-${Date.now()}`,
      patientId,
      doctorId,
      doctorName: docUser?.fullName || 'Physician',
      doctorSpecialization: docProfile?.specialization || 'Medical Officer',
      doctorHospital: docProfile?.hospitalAffiliation || 'Public Health Centre',
      status: 'active',
      scope,
      requestedAt: new Date().toISOString(),
      grantedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      authorizations[existingIndex] = newAuth;
    } else {
      authorizations.unshift(newAuth);
    }

    localStorage.setItem(STORAGE_KEYS.AUTHORIZATIONS, JSON.stringify(authorizations));

    this.addAuditLog({
      actorId: patientId,
      actorName: patientUser?.fullName || 'Patient',
      actorRole: 'patient',
      action: 'GRANT_CONSENT',
      resourceType: 'consent',
      resourceId: newAuth.id,
      patientId,
      details: `Granted ${scope} medical record access to ${newAuth.doctorName} (${newAuth.doctorHospital})`
    });

    this.notify();
  }

  public revokeDoctorAccess(authorizationId: string, reason: string = 'Revoked by patient request') {
    const authorizations = this.getAuthorizations();
    const target = authorizations.find(a => a.id === authorizationId);
    if (!target) return;

    target.status = 'revoked';
    target.revokedAt = new Date().toISOString();
    target.revocationReason = reason;

    localStorage.setItem(STORAGE_KEYS.AUTHORIZATIONS, JSON.stringify(authorizations));

    this.addAuditLog({
      actorId: target.patientId,
      actorName: this.getUserById(target.patientId)?.fullName || 'Patient',
      actorRole: 'patient',
      action: 'REVOKE_CONSENT',
      resourceType: 'consent',
      resourceId: target.id,
      patientId: target.patientId,
      details: `Revoked access for ${target.doctorName}. Reason: ${reason}`
    });

    this.notify();
  }

  // Controlled Emergency Access
  public triggerEmergencyAccess(params: {
    patientId: string;
    requesterId: string;
    requesterName: string;
    requesterRole: string;
    requesterFacility: string;
    emergencyBadgeId: string;
    clinicalReason: string;
  }): EmergencyAccessEvent {
    const patientUser = this.getUserById(params.patientId);
    const events: EmergencyAccessEvent[] = this.getEmergencyEvents();

    const newEvent: EmergencyAccessEvent = {
      id: `emg-${Date.now()}`,
      patientId: params.patientId,
      patientName: patientUser?.fullName || 'Patient',
      requesterId: params.requesterId,
      requesterName: params.requesterName,
      requesterRole: params.requesterRole,
      requesterFacility: params.requesterFacility,
      emergencyBadgeId: params.emergencyBadgeId,
      clinicalReason: params.clinicalReason,
      grantedScope: 'emergency_minimum_dataset',
      accessedAt: new Date().toISOString(),
      auditHash: `sha256:${Math.random().toString(36).substring(2)}${Date.now()}`,
      acknowledgedByPatient: false
    };

    events.unshift(newEvent);
    localStorage.setItem(STORAGE_KEYS.EMERGENCY_EVENTS, JSON.stringify(events));

    this.addAuditLog({
      actorId: params.requesterId,
      actorName: params.requesterName,
      actorRole: 'doctor',
      action: 'TRIGGER_EMERGENCY_ACCESS',
      resourceType: 'emergency_access',
      resourceId: newEvent.id,
      patientId: params.patientId,
      details: `EMERGENCY OVERRIDE ACTIVATED! Facility: ${params.requesterFacility} | Badge: ${params.emergencyBadgeId} | Reason: ${params.clinicalReason} | Scope: Emergency Minimum Dataset`
    });

    this.notify();
    return newEvent;
  }

  public getEmergencyEvents(patientId?: string): EmergencyAccessEvent[] {
    const raw = localStorage.getItem(STORAGE_KEYS.EMERGENCY_EVENTS);
    const all: EmergencyAccessEvent[] = raw ? JSON.parse(raw) : INITIAL_EMERGENCY_EVENTS;
    if (patientId) {
      return all.filter(e => e.patientId === patientId);
    }
    return all;
  }

  public acknowledgeEmergencyEvent(eventId: string) {
    const events = this.getEmergencyEvents();
    const target = events.find(e => e.id === eventId);
    if (target) {
      target.acknowledgedByPatient = true;
      localStorage.setItem(STORAGE_KEYS.EMERGENCY_EVENTS, JSON.stringify(events));
      this.notify();
    }
  }

  // Audit Logs
  public getAuditLogs(patientId?: string): AuditLogEntry[] {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    const all: AuditLogEntry[] = raw ? JSON.parse(raw) : INITIAL_AUDIT_LOGS;
    if (patientId) {
      return all.filter(l => l.patientId === patientId || !l.patientId);
    }
    return all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) {
    const logs = this.getAuditLogs();
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString()
    };
    logs.unshift(newEntry);
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 200))); // keep last 200 logs
  }

  // Facilities
  public getFacilities(): HealthcareFacility[] {
    return RURAL_HEALTHCARE_FACILITIES;
  }

  // Medication Reminders
  public getMedicationReminders(patientId?: string): MedicationReminder[] {
    const raw = localStorage.getItem(STORAGE_KEYS.MEDICATION_REMINDERS);
    const all: MedicationReminder[] = raw ? JSON.parse(raw) : INITIAL_MEDICATION_REMINDERS;
    if (patientId) {
      return all.filter(m => m.patientId === patientId);
    }
    return all;
  }

  public updateMedicationStatus(id: string, status: 'taken' | 'due' | 'missed') {
    const all = this.getMedicationReminders();
    const target = all.find(m => m.id === id);
    if (!target) return;

    target.status = status;
    if (status === 'taken') {
      const now = new Date();
      target.takenAt = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    localStorage.setItem(STORAGE_KEYS.MEDICATION_REMINDERS, JSON.stringify(all));

    this.addAuditLog({
      actorId: target.patientId,
      actorName: this.getUserById(target.patientId)?.fullName || 'Patient',
      actorRole: 'patient',
      action: 'CREATE_RECORD',
      resourceType: 'health_record',
      patientId: target.patientId,
      details: `Medication check-off: ${target.medicineName} marked as ${status.toUpperCase()}`
    });

    this.notify();
  }

  // Appointments
  public getAppointments(patientId?: string): CareAppointment[] {
    const raw = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    const all: CareAppointment[] = raw ? JSON.parse(raw) : INITIAL_APPOINTMENTS;
    if (patientId) {
      return all.filter(a => a.patientId === patientId);
    }
    return all;
  }

  public addAppointment(appointment: CareAppointment) {
    const all = this.getAppointments();
    all.unshift(appointment);
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(all));

    this.addAuditLog({
      actorId: appointment.patientId,
      actorName: this.getUserById(appointment.patientId)?.fullName || 'Patient',
      actorRole: 'patient',
      action: 'CREATE_RECORD',
      resourceType: 'health_record',
      patientId: appointment.patientId,
      details: `Scheduled consultation: ${appointment.doctorName} at ${appointment.facilityName} (${appointment.date} ${appointment.time})`
    });

    this.notify();
  }

  public updateAppointmentStatus(id: string, status: 'upcoming' | 'completed' | 'cancelled') {
    const all = this.getAppointments();
    const target = all.find(a => a.id === id);
    if (!target) return;

    target.status = status;
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(all));
    this.notify();
  }

  // Referrals
  public getReferrals(patientId?: string): ReferralRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.REFERRALS);
    const all: ReferralRecord[] = raw ? JSON.parse(raw) : INITIAL_REFERRALS;
    if (patientId) {
      return all.filter(r => r.patientId === patientId);
    }
    return all;
  }

  public createReferral(referral: ReferralRecord) {
    const all = this.getReferrals();
    all.unshift(referral);
    localStorage.setItem(STORAGE_KEYS.REFERRALS, JSON.stringify(all));

    this.addAuditLog({
      actorId: referral.referringProviderId,
      actorName: referral.referringProviderName,
      actorRole: 'frontline_worker',
      action: 'CREATE_RECORD',
      resourceType: 'health_record',
      patientId: referral.patientId,
      details: `Digital Referral Card Issued: ${referral.patientName} referred to ${referral.destinationFacilityName} (${referral.specialtyNeeded})`
    });

    this.notify();
  }

  public updateReferralStatus(id: string, status: 'initiated' | 'in_transit' | 'consulted' | 'closed') {
    const all = this.getReferrals();
    const target = all.find(r => r.id === id);
    if (!target) return;

    target.status = status;
    if (status === 'consulted') {
      target.consultedAt = new Date().toISOString();
    }
    localStorage.setItem(STORAGE_KEYS.REFERRALS, JSON.stringify(all));

    this.addAuditLog({
      actorId: 'doc-sharma',
      actorName: 'Dr. Anita Sharma',
      actorRole: 'doctor',
      action: 'VIEW_RECORD',
      resourceType: 'health_record',
      patientId: target.patientId,
      details: `Referral pipeline updated: ${target.patientName} marked as ${status.toUpperCase()} at ${target.destinationFacilityName}`
    });

    this.notify();
  }

  // Patient Daily Check-ins
  public getCheckIns(patientId?: string): PatientCheckIn[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CHECK_INS);
    const all: PatientCheckIn[] = raw ? JSON.parse(raw) : INITIAL_CHECK_INS;
    if (patientId) {
      return all.filter(c => c.patientId === patientId);
    }
    return all;
  }

  public submitCheckIn(patientId: string, status: 'better' | 'same' | 'worse', symptomNote?: string): PatientCheckIn {
    const all = this.getCheckIns();
    const patientUser = this.getUserById(patientId);
    const isWorse = status === 'worse';

    const checkIn: PatientCheckIn = {
      id: `chk-${Date.now()}`,
      patientId,
      date: new Date().toISOString().split('T')[0],
      status,
      symptomNote,
      escalated: isWorse,
      escalationMessage: isWorse 
        ? 'High priority alert dispatched to ASHA Worker (Rekha Devi) & primary family caregiver (Suresh Kumar). CareBridge advises immediate tele-triage or CHC visit.'
        : undefined,
      ashaNotified: isWorse,
      timestamp: new Date().toISOString()
    };

    all.unshift(checkIn);
    localStorage.setItem(STORAGE_KEYS.CHECK_INS, JSON.stringify(all));

    this.addAuditLog({
      actorId: patientId,
      actorName: patientUser?.fullName || 'Patient',
      actorRole: 'patient',
      action: 'CREATE_RECORD',
      resourceType: 'health_record',
      patientId,
      details: isWorse
        ? `⚠️ CRITICAL ESCALATION: Patient reported WORSE condition ("${symptomNote || 'Unspecified pain/discomfort'}"). Instant dispatch to ASHA Rekha Devi & family.`
        : `Daily wellness check-in logged: Condition reported as ${status.toUpperCase()}`
    });

    this.notify();
    return checkIn;
  }

  // Granular Sharing Consents
  public getGranularConsents(patientId?: string): GranularSharingConsent[] {
    const raw = localStorage.getItem(STORAGE_KEYS.GRANULAR_CONSENTS);
    const all: GranularSharingConsent[] = raw ? JSON.parse(raw) : INITIAL_GRANULAR_CONSENTS;
    if (patientId) {
      return all.filter(c => c.patientId === patientId);
    }
    return all;
  }

  public updateGranularConsent(consent: GranularSharingConsent) {
    const all = this.getGranularConsents();
    const idx = all.findIndex(c => c.id === consent.id);
    if (idx >= 0) {
      all[idx] = { ...consent, updatedAt: new Date().toISOString() };
    } else {
      all.push(consent);
    }

    localStorage.setItem(STORAGE_KEYS.GRANULAR_CONSENTS, JSON.stringify(all));

    this.addAuditLog({
      actorId: consent.patientId,
      actorName: this.getUserById(consent.patientId)?.fullName || 'Patient',
      actorRole: 'patient',
      action: 'GRANT_CONSENT',
      resourceType: 'consent',
      patientId: consent.patientId,
      details: `Granular consent matrix updated for ${consent.granteeName} (${consent.granteeRole}). Vitals: ${consent.permissions.vitals}, Rx: ${consent.permissions.prescriptions}, Notes: ${consent.permissions.clinicalNotes}`
    });

    this.notify();
  }

  // App Language
  public getAppLanguage(): AppLanguage {
    return (localStorage.getItem(STORAGE_KEYS.APP_LANGUAGE) as AppLanguage) || 'en';
  }

  public setAppLanguage(lang: AppLanguage) {
    localStorage.setItem(STORAGE_KEYS.APP_LANGUAGE, lang);
    this.notify();
  }

  // Connectivity Mode (Low-bandwidth / Offline demo simulator)
  public isLowConnectivity(): boolean {
    return localStorage.getItem(STORAGE_KEYS.LOW_CONNECTIVITY) === 'true';
  }

  public setLowConnectivity(enabled: boolean) {
    localStorage.setItem(STORAGE_KEYS.LOW_CONNECTIVITY, enabled ? 'true' : 'false');
    this.notify();
  }

  // Reset to initial mock dataset
  public resetToMockData() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(INITIAL_PATIENTS));
    localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(INITIAL_DOCTORS));
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(INITIAL_RECORDS));
    localStorage.setItem(STORAGE_KEYS.AUTHORIZATIONS, JSON.stringify(INITIAL_AUTHORIZATIONS));
    localStorage.setItem(STORAGE_KEYS.EMERGENCY_EVENTS, JSON.stringify(INITIAL_EMERGENCY_EVENTS));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, 'pat-ramesh');
    localStorage.setItem(STORAGE_KEYS.MEDICATION_REMINDERS, JSON.stringify(INITIAL_MEDICATION_REMINDERS));
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(INITIAL_APPOINTMENTS));
    localStorage.setItem(STORAGE_KEYS.REFERRALS, JSON.stringify(INITIAL_REFERRALS));
    localStorage.setItem(STORAGE_KEYS.CHECK_INS, JSON.stringify(INITIAL_CHECK_INS));
    localStorage.setItem(STORAGE_KEYS.GRANULAR_CONSENTS, JSON.stringify(INITIAL_GRANULAR_CONSENTS));
    localStorage.setItem(STORAGE_KEYS.APP_LANGUAGE, 'en');
    localStorage.setItem(STORAGE_KEYS.LOW_CONNECTIVITY, 'false');
    this.notify();
  }
}

export const dataStore = new DataStore();
