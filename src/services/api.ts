import { 
  UserProfile, 
  PatientProfile, 
  DoctorProfile, 
  HealthRecord, 
  AccessRequest, 
  AccessAuthorization, 
  AuditLogEntry,
  ConsentCategory,
  ALL_CONSENT_CATEGORIES,
  StoredDocumentMetadata,
  PatientSelfReport,
  PatientSecurityAlert,
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
  TriageAssessment,
  Referral,
  DiagnosticTest,
  DiagnosticOrder,
  CarePlan,
  FacilityOperationsMetrics
} from '../types';
import { dataStore } from './dataStore';

const API_BASE = '/api';
const TOKEN_KEY = 'carebridge_auth_token_v1';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data?.error || `Request failed with status ${res.status}`;
    const err = new Error(errorMsg) as Error & { status?: number; data?: any };
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data as T;
}

export const api = {
  // Auth
  async checkHealth() {
    return request<{ ok: boolean; hasSmsProvider: boolean; smsProviderName: string }>('/health');
  },

  async requestRegisterOtp(phone: string) {
    return request<{ success: boolean; challengeId: string; expiresInSeconds: number; message: string }>('/auth/register-otp', {
      method: 'POST',
      body: JSON.stringify({ phone })
    });
  },

  async verifyRegisterOtp(payload: {
    challengeId: string;
    otp: string;
    role: 'patient' | 'doctor';
    fullName: string;
    email?: string;
    // Patient details
    dob?: string;
    gender?: 'male' | 'female' | 'other';
    bloodGroup?: string;
    village?: string;
    district?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    // Doctor details
    registrationNumber?: string;
    specialization?: string;
    hospitalAffiliation?: string;
    qualification?: string;
  }) {
    const result = await request<{
      authenticated: boolean;
      token: string;
      user: UserProfile;
      profile: PatientProfile | DoctorProfile;
    }>('/auth/register-verify', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (result.token) {
      setAuthToken(result.token);
    }
    return result;
  },

  async requestLoginOtp(phone: string) {
    return request<{ success: boolean; challengeId: string; expiresInSeconds: number; message: string }>('/auth/login-otp', {
      method: 'POST',
      body: JSON.stringify({ phone })
    });
  },

  async verifyLoginOtp(challengeId: string, otp: string) {
    const result = await request<{
      authenticated: boolean;
      token: string;
      user: UserProfile;
      profile: PatientProfile | DoctorProfile | null;
    }>('/auth/login-verify', {
      method: 'POST',
      body: JSON.stringify({ challengeId, otp })
    });

    if (result.token) {
      setAuthToken(result.token);
    }
    return result;
  },

  async getMe() {
    return request<{ user: UserProfile; profile: PatientProfile | DoctorProfile | null }>('/auth/me');
  },

  async logout() {
    try {
      await request<{ ok: boolean }>('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      clearAuthToken();
    }
  },

  // Doctor Access Flow
  async searchPatient(query: string) {
    return request<{
      found: boolean;
      patient: {
        id: string;
        fullName: string;
        abhaId?: string;
        gender: string;
        bloodGroup: string;
        district: string;
        village: string;
      };
      hasAccess: boolean;
      activeAuthorizationId?: string;
      approvedCategories?: ConsentCategory[];
      requestStatus: 'none' | 'pending' | 'authorized' | 'denied';
      pendingRequestId?: string;
      message: string;
    }>(`/doctor/search-patient?q=${encodeURIComponent(query)}`);
  },

  async requestPatientAccess(patientId: string, scope: string = 'full_longitudinal', requestedCategories?: ConsentCategory[]) {
    return request<{
      success: boolean;
      requestId: string;
      status: 'pending';
      message: string;
    }>('/doctor/request-access', {
      method: 'POST',
      body: JSON.stringify({ 
        patientId, 
        scope,
        requestedCategories: requestedCategories || ALL_CONSENT_CATEGORIES
      })
    });
  },

  async getDoctorAccessRequests() {
    return request<{ requests: AccessRequest[] }>('/doctor/access-requests');
  },

  // Patient Authorization Flow
  async getPatientAccessRequests() {
    return request<{
      requests: AccessRequest[];
      activeAuthorizations: AccessAuthorization[];
    }>('/patient/access-requests');
  },

  async authorizeRequest(requestId: string, otp: string, approvedCategories?: ConsentCategory[]) {
    return request<{
      success: boolean;
      authorization: AccessAuthorization;
      message: string;
    }>('/patient/authorize-request', {
      method: 'POST',
      body: JSON.stringify({ 
        requestId, 
        otp, 
        approvedCategories: approvedCategories || ALL_CONSENT_CATEGORIES 
      })
    });
  },

  async denyRequest(requestId: string) {
    return request<{ success: boolean; message: string }>('/patient/deny-request', {
      method: 'POST',
      body: JSON.stringify({ requestId })
    });
  },

  async revokeAccess(authorizationId: string, reason?: string) {
    return request<{ success: boolean; message: string }>('/patient/revoke-access', {
      method: 'POST',
      body: JSON.stringify({ authorizationId, reason })
    });
  },

  // Protected Records (RBAC enforced on backend with category filtering)
  async getPatientRecords(patientId: string) {
    return request<{ 
      patientId: string; 
      records: HealthRecord[]; 
      count: number;
      approvedCategories?: ConsentCategory[];
    }>(`/patients/${patientId}/records`);
  },

  async addPatientRecord(patientId: string, recordData: Partial<HealthRecord>) {
    return request<{ success: boolean; record: HealthRecord }>(`/patients/${patientId}/records`, {
      method: 'POST',
      body: JSON.stringify(recordData)
    });
  },

  // Doctor Clinical Document Upload & Download
  async uploadDoctorDocument(payload: {
    patientId: string;
    title: string;
    category: string;
    fileName: string;
    mimeType: string;
    fileBase64: string;
    description?: string;
    facilityName?: string;
  }) {
    return request<{ success: boolean; document: StoredDocumentMetadata; message: string }>('/doctor/upload-document', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getPatientDocuments(patientId: string) {
    return request<{ documents: StoredDocumentMetadata[] }>(`/patients/${patientId}/documents`);
  },

  getDocumentDownloadUrl(documentId: string): string {
    const token = getAuthToken();
    return `${API_BASE}/documents/${documentId}/download${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  },

  // Patient Rural Health Self-Report / Check-In
  async submitSelfReport(payload: {
    overallStatus: 'better' | 'same' | 'worse';
    painScale: number;
    symptoms: string[];
    wellnessScore?: number;
    notes?: string;
  }) {
    return request<{ success: boolean; selfReport: PatientSelfReport; message: string }>('/patient/self-report', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getPatientSelfReports(patientId: string) {
    return request<{ selfReports: PatientSelfReport[] }>(`/patients/${patientId}/self-reports`);
  },

  // Patient Security Alerts
  async getSecurityAlerts() {
    return request<{ alerts: PatientSecurityAlert[] }>('/patient/security-alerts');
  },

  async acknowledgeSecurityAlert(alertId: string) {
    return request<{ success: boolean }>('/patient/security-alerts/ack', {
      method: 'POST',
      body: JSON.stringify({ alertId })
    });
  },

  // Demo Simulation for SIH Judges: simulate unauthorized snooping attempt
  async simulateUnauthorizedAttempt(patientId: string) {
    return request<{ blocked: boolean; alertTriggered: boolean; message: string }>('/doctor/simulate-unauthorized-access', {
      method: 'POST',
      body: JSON.stringify({ patientId })
    });
  },

  // Audit Logs
  async getAuditLogs() {
    return request<{ events: AuditLogEntry[] }>('/security/audit');
  },

  // ---------------------------------------------------------------------------
  // CORPORATE HEALTHCARE API ENDPOINTS (With Automatic DataStore Fallback)
  // ---------------------------------------------------------------------------

  async getSpecialties(): Promise<DoctorSpecialty[]> {
    try {
      const res = await request<{ specialties: DoctorSpecialty[] }>('/specialties');
      return res.specialties;
    } catch {
      return dataStore.getSpecialties();
    }
  },

  async getDoctors(params?: { specialty?: string; city?: string; mode?: string; maxFee?: number; search?: string }): Promise<Doctor[]> {
    try {
      const query = new URLSearchParams();
      if (params?.specialty) query.set('specialty', params.specialty);
      if (params?.city) query.set('city', params.city);
      if (params?.mode) query.set('mode', params.mode);
      if (params?.maxFee) query.set('maxFee', String(params.maxFee));
      if (params?.search) query.set('search', params.search);
      const queryString = query.toString() ? `?${query.toString()}` : '';
      const res = await request<{ doctors: Doctor[] }>(`/doctors${queryString}`);
      return res.doctors;
    } catch {
      return dataStore.getCorporateDoctors(params);
    }
  },

  async getDoctorById(id: string): Promise<Doctor | undefined> {
    try {
      const res = await request<{ doctor: Doctor }>(`/doctors/${id}`);
      return res.doctor;
    } catch {
      return dataStore.getCorporateDoctorById(id);
    }
  },

  async getHospitals(params?: { city?: string; emergencyOnly?: boolean; search?: string }): Promise<Hospital[]> {
    try {
      const query = new URLSearchParams();
      if (params?.city) query.set('city', params.city);
      if (params?.emergencyOnly) query.set('emergencyOnly', 'true');
      if (params?.search) query.set('search', params.search);
      const queryString = query.toString() ? `?${query.toString()}` : '';
      const res = await request<{ hospitals: Hospital[] }>(`/hospitals${queryString}`);
      return res.hospitals;
    } catch {
      return dataStore.getHospitals(params);
    }
  },

  async getHospitalById(id: string): Promise<Hospital | undefined> {
    try {
      const res = await request<{ hospital: Hospital }>(`/hospitals/${id}`);
      return res.hospital;
    } catch {
      return dataStore.getHospitalById(id);
    }
  },

  async getAppointments(params?: { patientId?: string; doctorId?: string; status?: string }): Promise<Appointment[]> {
    try {
      const query = new URLSearchParams();
      if (params?.patientId) query.set('patientId', params.patientId);
      if (params?.doctorId) query.set('doctorId', params.doctorId);
      if (params?.status) query.set('status', params.status);
      const queryString = query.toString() ? `?${query.toString()}` : '';
      const res = await request<{ appointments: Appointment[] }>(`/appointments${queryString}`);
      return res.appointments;
    } catch {
      return dataStore.getCorporateAppointments(params);
    }
  },

  async bookAppointment(appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'bookingReference'>): Promise<Appointment> {
    try {
      const res = await request<{ success: boolean; appointment: Appointment }>('/appointments', {
        method: 'POST',
        body: JSON.stringify(appointmentData)
      });
      // Also cache locally
      try { dataStore.bookCorporateAppointment(appointmentData); } catch {}
      return res.appointment;
    } catch (err: any) {
      if (err.status === 409) throw err;
      return dataStore.bookCorporateAppointment(appointmentData);
    }
  },

  async updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<{ success: boolean }> {
    try {
      await request<{ success: boolean }>(`/appointments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      dataStore.updateCorporateAppointmentStatus(id, status);
      return { success: true };
    } catch {
      dataStore.updateCorporateAppointmentStatus(id, status);
      return { success: true };
    }
  },

  async getMedicines(params?: { search?: string; category?: string }): Promise<Medicine[]> {
    try {
      const query = new URLSearchParams();
      if (params?.search) query.set('search', params.search);
      if (params?.category) query.set('category', params.category);
      const queryString = query.toString() ? `?${query.toString()}` : '';
      const res = await request<{ medicines: Medicine[] }>(`/medicines${queryString}`);
      return res.medicines;
    } catch {
      return dataStore.getMedicines(params);
    }
  },

  async getPharmacies(params?: { open24x7Only?: boolean }): Promise<Pharmacy[]> {
    try {
      const res = await request<{ pharmacies: Pharmacy[] }>('/pharmacies');
      return res.pharmacies;
    } catch {
      return dataStore.getPharmacies(params);
    }
  },

  async getInventoryForMedicine(medicineId: string): Promise<MedicineInventory[]> {
    try {
      const res = await request<{ inventory: MedicineInventory[] }>(`/medicines/${medicineId}/inventory`);
      return res.inventory;
    } catch {
      return dataStore.getInventoryForMedicine(medicineId);
    }
  },

  async getPrescriptions(patientId?: string): Promise<Prescription[]> {
    try {
      const query = patientId ? `?patientId=${patientId}` : '';
      const res = await request<{ prescriptions: Prescription[] }>(`/prescriptions${query}`);
      return res.prescriptions;
    } catch {
      return dataStore.getPrescriptions(patientId);
    }
  },

  async getPrescriptionById(id: string): Promise<Prescription | undefined> {
    try {
      const res = await request<{ prescription: Prescription }>(`/prescriptions/${id}`);
      return res.prescription;
    } catch {
      return dataStore.getPrescriptionById(id);
    }
  },

  async createPrescription(data: Omit<Prescription, 'id' | 'createdAt'>): Promise<Prescription> {
    try {
      const res = await request<{ success: boolean; prescription: Prescription }>('/prescriptions', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      try { dataStore.addPrescription(data); } catch {}
      return res.prescription;
    } catch {
      return dataStore.addPrescription(data);
    }
  },

  async getNotifications(userId?: string): Promise<NotificationItem[]> {
    try {
      const query = userId ? `?userId=${userId}` : '';
      const res = await request<{ notifications: NotificationItem[] }>(`/notifications${query}`);
      return res.notifications;
    } catch {
      return dataStore.getNotifications(userId);
    }
  },

  async markNotificationRead(id: string): Promise<void> {
    try {
      await request<{ success: boolean }>(`/notifications/${id}/read`, { method: 'POST' });
      dataStore.markNotificationRead(id);
    } catch {
      dataStore.markNotificationRead(id);
    }
  },

  // ----------------------------------------------------
  // Phase 2: Digital Triage
  // ----------------------------------------------------
  async submitTriage(data: {
    patientId?: string;
    patientName?: string;
    symptoms: string[];
    duration?: string;
    severityFlags?: string[];
    vitals?: { temperatureF?: number; pulseBpm?: number; spo2?: number; bloodPressure?: string };
    assessedByRole?: 'patient' | 'healthcare_worker' | 'doctor';
    assessedById?: string;
    nearestFacilityRecommended?: string;
  }): Promise<TriageAssessment> {
    const res = await request<{ success: boolean; assessment: TriageAssessment }>('/triage', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.assessment;
  },

  async getTriageAssessments(patientId?: string): Promise<TriageAssessment[]> {
    const query = patientId ? `?patientId=${patientId}` : '';
    const res = await request<{ success: boolean; assessments: TriageAssessment[] }>(`/triage${query}`);
    return res.assessments;
  },

  // ----------------------------------------------------
  // Phase 2: Closed-Loop Referral Management
  // ----------------------------------------------------
  async getReferrals(filters: { patientId?: string; doctorId?: string; facilityId?: string; status?: string } = {}): Promise<Referral[]> {
    const params = new URLSearchParams();
    if (filters.patientId) params.append('patientId', filters.patientId);
    if (filters.doctorId) params.append('doctorId', filters.doctorId);
    if (filters.facilityId) params.append('facilityId', filters.facilityId);
    if (filters.status) params.append('status', filters.status);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await request<{ success: boolean; referrals: Referral[] }>(`/referrals${query}`);
    return res.referrals;
  },

  async createReferral(data: Partial<Referral>): Promise<Referral> {
    const res = await request<{ success: boolean; referral: Referral }>('/referrals', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.referral;
  },

  async updateReferralStatus(referralId: string, data: {
    status: string;
    notes?: string;
    actorId?: string;
    actorName?: string;
    actorRole?: string;
    scheduledAppointmentId?: string;
    scheduledDate?: string;
    destinationDoctorId?: string;
    destinationDoctorName?: string;
    feedbackReport?: string;
  }): Promise<Referral> {
    const res = await request<{ success: boolean; referral: Referral }>(`/referrals/${referralId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    return res.referral;
  },

  // ----------------------------------------------------
  // Phase 2: Diagnostic Coordination
  // ----------------------------------------------------
  async getDiagnosticCatalog(): Promise<DiagnosticTest[]> {
    const res = await request<{ success: boolean; tests: DiagnosticTest[] }>('/diagnostics/catalog');
    return res.tests;
  },

  async getDiagnosticOrders(filters: { patientId?: string; doctorId?: string; facilityId?: string; status?: string } = {}): Promise<DiagnosticOrder[]> {
    const params = new URLSearchParams();
    if (filters.patientId) params.append('patientId', filters.patientId);
    if (filters.doctorId) params.append('doctorId', filters.doctorId);
    if (filters.facilityId) params.append('facilityId', filters.facilityId);
    if (filters.status) params.append('status', filters.status);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await request<{ success: boolean; orders: DiagnosticOrder[] }>(`/diagnostics/orders${query}`);
    return res.orders;
  },

  async createDiagnosticOrder(data: {
    patientId: string;
    patientName: string;
    patientPhone?: string;
    doctorId: string;
    doctorName: string;
    facilityId?: string;
    facilityName?: string;
    tests: DiagnosticTest[];
    clinicalIndication?: string;
  }): Promise<DiagnosticOrder> {
    const res = await request<{ success: boolean; order: DiagnosticOrder }>('/diagnostics/orders', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.order;
  },

  async scheduleDiagnosticOrder(orderId: string, data: { scheduledSlot: string; scheduledFacilityId?: string }): Promise<DiagnosticOrder> {
    const res = await request<{ success: boolean; order: DiagnosticOrder }>(`/diagnostics/orders/${orderId}/schedule`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.order;
  },

  async submitDiagnosticResult(orderId: string, data: {
    results: any[];
    reportSummary?: string;
    abnormalFlagCount?: number;
    criticalFlagCount?: number;
  }): Promise<DiagnosticOrder> {
    const res = await request<{ success: boolean; order: DiagnosticOrder }>(`/diagnostics/orders/${orderId}/result`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.order;
  },

  async reviewDiagnosticOrder(orderId: string, data: { reviewedByDoctorId: string; doctorReviewNotes: string }): Promise<DiagnosticOrder> {
    const res = await request<{ success: boolean; order: DiagnosticOrder }>(`/diagnostics/orders/${orderId}/review`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    return res.order;
  },

  // ----------------------------------------------------
  // Phase 2: Care Plans & High-Risk Follow-Up
  // ----------------------------------------------------
  async getCarePlans(filters: { patientId?: string; doctorId?: string; riskTier?: string; status?: string } = {}): Promise<CarePlan[]> {
    const params = new URLSearchParams();
    if (filters.patientId) params.append('patientId', filters.patientId);
    if (filters.doctorId) params.append('doctorId', filters.doctorId);
    if (filters.riskTier) params.append('riskTier', filters.riskTier);
    if (filters.status) params.append('status', filters.status);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await request<{ success: boolean; carePlans: CarePlan[] }>(`/care-plans${query}`);
    return res.carePlans;
  },

  async createCarePlan(data: Partial<CarePlan>): Promise<CarePlan> {
    const res = await request<{ success: boolean; carePlan: CarePlan }>('/care-plans', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.carePlan;
  },

  async updateCarePlanTask(carePlanId: string, taskId: string, data: { completed: boolean; notes?: string }): Promise<CarePlan> {
    const res = await request<{ success: boolean; carePlan: CarePlan }>(`/care-plans/${carePlanId}/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    return res.carePlan;
  },

  async escalateCarePlan(carePlanId: string, data: { reason: string; doctorId?: string }): Promise<CarePlan> {
    const res = await request<{ success: boolean; carePlan: CarePlan }>(`/care-plans/${carePlanId}/escalate`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.carePlan;
  },

  // ----------------------------------------------------
  // Phase 2: Frontline Healthcare Worker
  // ----------------------------------------------------
  async getWorkerPatients(): Promise<any[]> {
    const res = await request<{ success: boolean; patients: any[] }>('/worker/patients');
    return res.patients;
  },

  async registerWorkerPatient(data: {
    fullName: string;
    phone: string;
    gender?: string;
    dob?: string;
    bloodGroup?: string;
    villageOrTown?: string;
    district?: string;
    state?: string;
    pincode?: string;
    initialVitals?: any;
  }): Promise<{ user: UserProfile; patient: PatientProfile }> {
    const res = await request<{ success: boolean; user: UserProfile; patient: PatientProfile }>('/worker/patients', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return { user: res.user, patient: res.patient };
  },

  // ----------------------------------------------------
  // Phase 2: Facility Quality & Operations
  // ----------------------------------------------------
  async getFacilityOperations(facilityId: string): Promise<FacilityOperationsMetrics> {
    const res = await request<{ success: boolean; metrics: FacilityOperationsMetrics }>(`/facilities/${facilityId}/operations`);
    return res.metrics;
  },

  // ----------------------------------------------------
  // Phase 2: Interoperability / FHIR Export
  // ----------------------------------------------------
  async getFhirPatientBundle(patientId: string): Promise<any> {
    return request<any>(`/fhir/patients/${patientId}`);
  }
};

