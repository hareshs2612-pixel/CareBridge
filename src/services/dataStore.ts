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
  AppLanguage,
  DoctorSpecialty,
  Doctor,
  Hospital,
  Appointment,
  AppointmentStatus,
  Medicine,
  Pharmacy,
  MedicineInventory,
  Prescription,
  NotificationItem,
  CityLocation
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
  INITIAL_GRANULAR_CONSENTS,
  CORPORATE_SPECIALTIES,
  CORPORATE_HOSPITALS,
  CORPORATE_DOCTORS,
  CORPORATE_MEDICINES,
  CORPORATE_PHARMACIES,
  CORPORATE_INVENTORY,
  CORPORATE_APPOINTMENTS,
  CORPORATE_PRESCRIPTIONS,
  CORPORATE_NOTIFICATIONS,
  POPULAR_CITIES
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
  LOW_CONNECTIVITY: 'sih_low_connectivity_v1',
  SPECIALTIES: 'cb_specialties_v1',
  HOSPITALS: 'cb_hospitals_v1',
  DOCTORS_CORP: 'cb_doctors_corp_v1',
  MEDICINES: 'cb_medicines_v1',
  PHARMACIES: 'cb_pharmacies_v1',
  INVENTORY: 'cb_inventory_v1',
  CORPORATE_APPOINTMENTS: 'cb_corporate_appointments_v1',
  PRESCRIPTIONS: 'cb_prescriptions_v1',
  NOTIFICATIONS: 'cb_notifications_v1',
  SELECTED_CITY: 'cb_selected_city_v1'
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
    if (!localStorage.getItem(STORAGE_KEYS.SPECIALTIES)) {
      localStorage.setItem(STORAGE_KEYS.SPECIALTIES, JSON.stringify(CORPORATE_SPECIALTIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.HOSPITALS)) {
      localStorage.setItem(STORAGE_KEYS.HOSPITALS, JSON.stringify(CORPORATE_HOSPITALS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DOCTORS_CORP)) {
      localStorage.setItem(STORAGE_KEYS.DOCTORS_CORP, JSON.stringify(CORPORATE_DOCTORS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MEDICINES)) {
      localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(CORPORATE_MEDICINES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PHARMACIES)) {
      localStorage.setItem(STORAGE_KEYS.PHARMACIES, JSON.stringify(CORPORATE_PHARMACIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.INVENTORY)) {
      localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(CORPORATE_INVENTORY));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CORPORATE_APPOINTMENTS)) {
      localStorage.setItem(STORAGE_KEYS.CORPORATE_APPOINTMENTS, JSON.stringify(CORPORATE_APPOINTMENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRESCRIPTIONS)) {
      localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(CORPORATE_PRESCRIPTIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(CORPORATE_NOTIFICATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SELECTED_CITY)) {
      localStorage.setItem(STORAGE_KEYS.SELECTED_CITY, 'Bengaluru');
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

  public isLoggedIn(): boolean {
    return Boolean(localStorage.getItem('carebridge_auth_token_v1'));
  }

  public setCurrentUser(uid: string, token?: string) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, uid);
    if (token) {
      localStorage.setItem('carebridge_auth_token_v1', token);
    } else {
      // For demo personas, automatically set matching demo backend token
      localStorage.setItem('carebridge_auth_token_v1', `token-${uid}`);
    }

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

  public logout() {
    localStorage.removeItem('carebridge_auth_token_v1');
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    this.notify();
  }

  public getUsers(): UserProfile[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : INITIAL_USERS;
  }

  public getUserById(uid: string): UserProfile | undefined {
    return this.getUsers().find(u => u.uid === uid);
  }

  public addUser(user: UserProfile) {
    const users = this.getUsers();
    const existingIdx = users.findIndex(u => u.uid === user.uid || u.phone === user.phone);
    if (existingIdx >= 0) {
      users[existingIdx] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.notify();
  }

  public addPatient(profile: PatientProfile) {
    const patients = this.getPatients();
    patients[profile.id] = profile;
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
    this.notify();
  }

  public addDoctor(profile: DoctorProfile) {
    const docs = this.getDoctors();
    docs[profile.id] = profile;
    localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(docs));
    this.notify();
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

  // Corporate Specialties & Cities
  public getSpecialties(): DoctorSpecialty[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SPECIALTIES);
    return raw ? JSON.parse(raw) : CORPORATE_SPECIALTIES;
  }

  public getPopularCities(): CityLocation[] {
    return POPULAR_CITIES;
  }

  public getSelectedCity(): string {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_CITY) || 'Bengaluru';
  }

  public setSelectedCity(city: string) {
    localStorage.setItem(STORAGE_KEYS.SELECTED_CITY, city);
    this.notify();
  }

  // Corporate Doctors
  public getCorporateDoctors(filter?: { specialty?: string; city?: string; mode?: string; maxFee?: number; search?: string }): Doctor[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DOCTORS_CORP);
    let docs: Doctor[] = raw ? JSON.parse(raw) : CORPORATE_DOCTORS;

    if (filter?.specialty) {
      const s = filter.specialty.toLowerCase();
      docs = docs.filter(d => d.specialty.toLowerCase().includes(s));
    }
    if (filter?.mode && filter.mode !== 'all') {
      docs = docs.filter(d => d.consultationModes.includes(filter.mode as any));
    }
    if (filter?.maxFee) {
      docs = docs.filter(d => d.consultationFee <= filter.maxFee!);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      docs = docs.filter(d => 
        d.fullName.toLowerCase().includes(q) || 
        d.specialty.toLowerCase().includes(q) ||
        d.hospitalAffiliation.toLowerCase().includes(q) ||
        d.areasOfExpertise.some(exp => exp.toLowerCase().includes(q))
      );
    }
    return docs;
  }

  public getCorporateDoctorById(id: string): Doctor | undefined {
    return this.getCorporateDoctors().find(d => d.id === id || d.uid === id);
  }

  // Corporate Hospitals
  public getHospitals(filter?: { city?: string; emergencyOnly?: boolean; search?: string }): Hospital[] {
    const raw = localStorage.getItem(STORAGE_KEYS.HOSPITALS);
    let list: Hospital[] = raw ? JSON.parse(raw) : CORPORATE_HOSPITALS;

    if (filter?.emergencyOnly) {
      list = list.filter(h => h.emergency24x7);
    }
    if (filter?.city) {
      const c = filter.city.toLowerCase();
      list = list.filter(h => h.address.toLowerCase().includes(c) || h.state.toLowerCase().includes(c) || h.district.toLowerCase().includes(c));
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(h => 
        h.name.toLowerCase().includes(q) || 
        h.address.toLowerCase().includes(q) ||
        h.departments.some(dep => dep.toLowerCase().includes(q))
      );
    }
    return list;
  }

  public getHospitalById(id: string): Hospital | undefined {
    return this.getHospitals().find(h => h.id === id);
  }

  // Corporate Appointments & Double-Booking Prevention
  public getCorporateAppointments(filter?: { patientId?: string; doctorId?: string; status?: string }): Appointment[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CORPORATE_APPOINTMENTS);
    let list: Appointment[] = raw ? JSON.parse(raw) : CORPORATE_APPOINTMENTS;

    if (filter?.patientId) {
      list = list.filter(a => a.patientId === filter.patientId);
    }
    if (filter?.doctorId) {
      list = list.filter(a => a.doctorId === filter.doctorId);
    }
    if (filter?.status && filter.status !== 'all') {
      list = list.filter(a => a.status === filter.status);
    }
    return list;
  }

  public bookCorporateAppointment(data: Omit<Appointment, 'id' | 'createdAt' | 'bookingReference'>): Appointment {
    const all = this.getCorporateAppointments();

    // Double-booking check: prevent conflicting slot for same doctor, date & time
    const clash = all.find(a => 
      a.doctorId === data.doctorId && 
      a.date === data.date && 
      a.timeSlot === data.timeSlot &&
      a.status !== 'cancelled'
    );
    if (clash) {
      throw new Error(`Doctor slot at ${data.timeSlot} on ${data.date} is already reserved. Please select another time slot.`);
    }

    const refNum = `CB-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const newApt: Appointment = {
      ...data,
      id: `apt-${Date.now()}`,
      bookingReference: refNum,
      createdAt: new Date().toISOString()
    };

    all.unshift(newApt);
    localStorage.setItem(STORAGE_KEYS.CORPORATE_APPOINTMENTS, JSON.stringify(all));

    // Also push a real-time notification
    this.addNotification({
      userId: newApt.patientId,
      title: `Appointment Confirmed with ${newApt.doctorName}`,
      message: `Your appointment is confirmed for ${newApt.date} at ${newApt.timeSlot}. Reference: ${refNum}`,
      category: newApt.type === 'teleconsultation' ? 'teleconsult' : 'appointment',
      read: false,
      actionUrl: '/appointments'
    });

    this.notify();
    return newApt;
  }

  public updateCorporateAppointmentStatus(id: string, status: AppointmentStatus) {
    const all = this.getCorporateAppointments();
    const apt = all.find(a => a.id === id);
    if (apt) {
      apt.status = status;
      localStorage.setItem(STORAGE_KEYS.CORPORATE_APPOINTMENTS, JSON.stringify(all));
      this.notify();
    }
  }

  // Medicines & Pharmacies
  public getMedicines(filter?: { search?: string; category?: string }): Medicine[] {
    const raw = localStorage.getItem(STORAGE_KEYS.MEDICINES);
    let list: Medicine[] = raw ? JSON.parse(raw) : CORPORATE_MEDICINES;

    if (filter?.category && filter.category !== 'all') {
      list = list.filter(m => m.category.toLowerCase() === filter.category!.toLowerCase());
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(m => 
        m.brandName.toLowerCase().includes(q) || 
        m.genericName.toLowerCase().includes(q) ||
        m.composition.toLowerCase().includes(q)
      );
    }
    return list;
  }

  public getMedicineById(id: string): Medicine | undefined {
    return this.getMedicines().find(m => m.id === id);
  }

  public getPharmacies(filter?: { open24x7Only?: boolean }): Pharmacy[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PHARMACIES);
    let list: Pharmacy[] = raw ? JSON.parse(raw) : CORPORATE_PHARMACIES;
    if (filter?.open24x7Only) {
      list = list.filter(p => p.open24x7);
    }
    return list;
  }

  public getInventoryForMedicine(medicineId: string): MedicineInventory[] {
    const raw = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    const list: MedicineInventory[] = raw ? JSON.parse(raw) : CORPORATE_INVENTORY;
    return list.filter(inv => inv.medicineId === medicineId);
  }

  // Prescriptions
  public getPrescriptions(patientId?: string): Prescription[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PRESCRIPTIONS);
    let list: Prescription[] = raw ? JSON.parse(raw) : CORPORATE_PRESCRIPTIONS;
    if (patientId) {
      list = list.filter(p => p.patientId === patientId);
    }
    return list;
  }

  public getPrescriptionById(id: string): Prescription | undefined {
    return this.getPrescriptions().find(p => p.id === id);
  }

  public addPrescription(prescription: Omit<Prescription, 'id' | 'createdAt'>): Prescription {
    const all = this.getPrescriptions();
    const newRx: Prescription = {
      ...prescription,
      id: `rx-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    all.unshift(newRx);
    localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(all));

    this.addNotification({
      userId: newRx.patientId,
      title: `Digital Prescription Issued by ${newRx.doctorName}`,
      message: `Your prescription for ${newRx.diagnosis.join(', ')} is now available in your health records.`,
      category: 'prescription',
      read: false,
      actionUrl: `/prescriptions/${newRx.id}`
    });

    this.notify();
    return newRx;
  }

  // Notifications
  public getNotifications(userId?: string): NotificationItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    let list: NotificationItem[] = raw ? JSON.parse(raw) : CORPORATE_NOTIFICATIONS;
    if (userId) {
      list = list.filter(n => n.userId === userId);
    }
    return list;
  }

  public addNotification(item: Omit<NotificationItem, 'id' | 'createdAt'>): NotificationItem {
    const all = this.getNotifications();
    const newItem: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    all.unshift(newItem);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all));
    this.notify();
    return newItem;
  }

  public markNotificationRead(id: string) {
    const all = this.getNotifications();
    const n = all.find(item => item.id === id);
    if (n) {
      n.read = true;
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all));
      this.notify();
    }
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
    localStorage.setItem(STORAGE_KEYS.SPECIALTIES, JSON.stringify(CORPORATE_SPECIALTIES));
    localStorage.setItem(STORAGE_KEYS.HOSPITALS, JSON.stringify(CORPORATE_HOSPITALS));
    localStorage.setItem(STORAGE_KEYS.DOCTORS_CORP, JSON.stringify(CORPORATE_DOCTORS));
    localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(CORPORATE_MEDICINES));
    localStorage.setItem(STORAGE_KEYS.PHARMACIES, JSON.stringify(CORPORATE_PHARMACIES));
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(CORPORATE_INVENTORY));
    localStorage.setItem(STORAGE_KEYS.CORPORATE_APPOINTMENTS, JSON.stringify(CORPORATE_APPOINTMENTS));
    localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(CORPORATE_PRESCRIPTIONS));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(CORPORATE_NOTIFICATIONS));
    localStorage.setItem(STORAGE_KEYS.SELECTED_CITY, 'Bengaluru');
    this.notify();
  }
}

export const dataStore = new DataStore();
