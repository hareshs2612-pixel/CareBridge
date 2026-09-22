// Provenance of clinical data points
export type DataProvenance = 
  | 'patient_provided'
  | 'doctor_verified'
  | 'uploaded_document'
  | 'device_data'
  | 'ai_extracted';

export type UserRole = 'patient' | 'doctor' | 'admin' | 'emergency_responder' | 'frontline_worker' | 'healthcare_worker';

export interface UserProfile {
  uid: string;
  id?: string;
  role: UserRole;
  fullName: string;
  name?: string;
  email: string;
  phone: string;
  abhaId?: string; // Simulated 14-digit Ayushman Bharat Health Account ID (e.g., 91-8724-1029-4412)
  avatarUrl?: string;
  createdAt: string;
}

export interface Address {
  villageOrTown: string;
  block: string;
  district: string;
  state: string;
  pincode: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  priority: number;
}

export interface ChronicCondition {
  id: string;
  name: string;
  diagnosedYear?: string;
  status: 'active' | 'managed' | 'resolved';
  source: DataProvenance;
  notes?: string;
}

export interface Allergy {
  id: string;
  allergen: string;
  severity: 'mild' | 'moderate' | 'severe' | 'life_threatening';
  reaction: string;
  verified: boolean;
  source: DataProvenance;
}

export interface EmergencyMinimumDataset {
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Unknown';
  criticalAllergies: string[];
  criticalConditions: string[];
  criticalMedications: string[];
  resuscitationPreference?: 'Full Code' | 'DNR' | 'Not Specified';
  emergencyContactsSummary: string[];
  emergencyNotes?: string;
}

export interface PatientProfile {
  id: string; // matches UserProfile.uid
  dob: string;
  gender: 'male' | 'female' | 'other';
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Unknown';
  occupation?: string;
  address: Address;
  emergencyContacts: EmergencyContact[];
  chronicConditions: ChronicCondition[];
  allergies: Allergy[];
  emergencyMinimumDataset: EmergencyMinimumDataset;
}

export interface DoctorProfile {
  id: string; // matches UserProfile.uid
  registrationNumber: string; // National Medical Commission (NMC) or State Medical Council Reg No.
  councilName: string;
  specialization: string;
  qualification: string;
  hospitalAffiliation: string; // e.g. Community Health Centre (CHC) Rampur
  verifiedByAdmin: boolean;
  contactNumber: string;
  experienceYears?: number;
}

export type RecordCategory = 
  | 'prescription'
  | 'lab_report'
  | 'discharge_summary'
  | 'diagnostic_report'
  | 'clinical_note'
  | 'patient_log';

export interface VitalsMeasurement {
  isDeviceRecorded: boolean;
  isUnavailable?: boolean;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  pulseBpm?: number;
  temperatureFahrenheit?: number;
  spo2Percentage?: number;
  respiratoryRate?: number;
  recordedAt?: string;
  source: 'device_sensor' | 'patient_manual' | 'doctor_measured' | 'unavailable';
  notes?: string;
}

export interface PrescriptionItem {
  id: string;
  medicineName: string;
  name?: string;
  medicineId?: string;
  genericName?: string;
  dosage: string;
  frequency: string; // e.g. 1-0-1 (after food)
  duration: string; // e.g. 7 days
  instructions: string;
}

export interface ExtractedLabParameter {
  parameter: string;
  value: string;
  unit?: string;
  referenceRange?: string;
  isAbnormal?: boolean;
}

export interface AIAnalysisResult {
  summary: string;
  keyObservations: string[];
  extractedParameters: ExtractedLabParameter[];
  patientFriendlyExplanation: string;
  modelUsed: string;
  generatedAt: string;
  doctorReviewed: boolean;
  doctorReviewNotes?: string;
}

export interface HealthRecord {
  id: string;
  patientId: string;
  title: string;
  category: RecordCategory;
  recordDate: string;
  createdAt: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  source: DataProvenance;
  facilityName?: string;
  
  // Doctor clinical encounter data
  clinicalSummary?: string;
  diagnosis?: string[];
  treatmentPlan?: string;
  prescriptions?: PrescriptionItem[];
  
  // Vitals measurements
  vitals?: VitalsMeasurement;
  
  // Attached files
  documentUrl?: string;
  documentType?: 'pdf' | 'image/jpeg' | 'image/png';
  documentFileName?: string;
  
  // AI structured data & summary
  aiAnalysis?: AIAnalysisResult;
  
  // Privacy & emergency isolation
  isSensitive: boolean; // Psychiatric, reproductive, or sensitive records locked from emergency triage
}

export type AccessStatus = 'active' | 'pending' | 'revoked' | 'expired';
export type AccessScope = 'full_longitudinal' | 'summary_only' | 'recent_30_days';

export type ConsentCategory = 
  | 'diagnoses'
  | 'prescriptions'
  | 'lab_reports'
  | 'imaging'
  | 'clinical_notes'
  | 'uploaded_documents'
  | 'self_reported_symptoms';

export const ALL_CONSENT_CATEGORIES: ConsentCategory[] = [
  'diagnoses',
  'prescriptions',
  'lab_reports',
  'imaging',
  'clinical_notes',
  'uploaded_documents',
  'self_reported_symptoms'
];

export const CONSENT_CATEGORY_LABELS: Record<ConsentCategory, { label: string; desc: string }> = {
  diagnoses: { label: 'Diagnoses & Conditions', desc: 'Identified chronic and acute medical conditions' },
  prescriptions: { label: 'Prescriptions & Medicines', desc: 'Active and past medications, dosages, timings' },
  lab_reports: { label: 'Laboratory Reports', desc: 'Blood tests, pathology, and diagnostic panels' },
  imaging: { label: 'Medical Imaging & Radiology', desc: 'X-rays, ultrasounds, and diagnostic scans' },
  clinical_notes: { label: 'Doctor Clinical Notes', desc: 'Physician observations, examination records, OPD summaries' },
  uploaded_documents: { label: 'Attached Medical Documents', desc: 'Scanned discharge summaries and hospital reports' },
  self_reported_symptoms: { label: 'Self-Reported Health & Pain', desc: 'Daily symptoms, pain ratings, and wellness check-ins' }
};

export interface AccessAuthorization {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  doctorHospital: string;
  status: AccessStatus;
  scope: AccessScope;
  requestedCategories?: ConsentCategory[];
  approvedCategories?: ConsentCategory[];
  requestedAt: string;
  grantedAt?: string;
  expiresAt?: string;
  revokedAt?: string;
  revocationReason?: string;
}

export interface EmergencyAccessEvent {
  id: string;
  patientId: string;
  patientName: string;
  requesterId: string;
  requesterName: string;
  requesterRole: string;
  requesterFacility: string;
  emergencyBadgeId: string;
  clinicalReason: string;
  grantedScope: 'emergency_minimum_dataset';
  accessedAt: string;
  auditHash: string;
  acknowledgedByPatient: boolean;
}

export interface AccessRequest {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  doctorHospital: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  scope: AccessScope;
  requestedCategories: ConsentCategory[];
  approvedCategories?: ConsentCategory[];
  status: 'pending' | 'authorized' | 'denied' | 'expired';
  requestedAt: string;
  decidedAt?: string;
}

export interface StoredDocumentMetadata {
  id: string;
  patientId: string;
  patientName?: string;
  authorDoctorId: string;
  authorDoctorName: string;
  facilityName: string;
  title: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  category: 'lab_report' | 'prescription' | 'discharge_summary' | 'imaging' | 'clinical_document';
  description?: string;
  uploadedAt: string;
  downloadEndpoint: string;
}

export interface PatientSelfReport {
  id: string;
  patientId: string;
  date: string;
  overallStatus: 'better' | 'same' | 'worse';
  painScale: number; // 0 to 10 visual emoji scale
  symptoms: string[];
  wellnessScore?: number; // 0 to 100
  notes?: string;
  createdAt: string;
}

export interface PatientSecurityAlert {
  id: string;
  patientId: string;
  doctorId?: string;
  doctorName: string;
  doctorHospital?: string;
  attemptedAction: string;
  details: string;
  timestamp: string;
  notifiedVia: 'sms' | 'terminal_test_mode';
  acknowledged: boolean;
}

export type AuditAction = 
  | 'LOGIN'
  | 'LOGOUT'
  | 'VIEW_RECORD'
  | 'CREATE_RECORD'
  | 'UPLOAD_DOCUMENT'
  | 'DOCUMENT_DOWNLOADED'
  | 'GRANT_CONSENT'
  | 'REVOKE_CONSENT'
  | 'REQUEST_ACCESS'
  | 'APPROVE_ACCESS'
  | 'DENY_ACCESS'
  | 'REVOKE_ACCESS'
  | 'ACCOUNT_CREATED'
  | 'OTP_REQUESTED'
  | 'OTP_VERIFIED'
  | 'OTP_FAILED'
  | 'UNAUTHORIZED_ATTEMPT'
  | 'SECURITY_ALERT_TRIGGERED'
  | 'SELF_REPORT_SUBMITTED'
  | 'TRIGGER_EMERGENCY_ACCESS'
  | 'AI_SUMMARIZATION_REQUESTED'
  | 'AI_DOCTOR_VERIFIED'
  | 'EXPORT_RECORD';

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: AuditAction;
  resourceType: 'health_record' | 'patient_profile' | 'consent' | 'emergency_access';
  resourceId?: string;
  patientId?: string;
  timestamp: string;
  details: string;
}

export type FacilityType = 
  | 'Primary Health Centre (PHC)'
  | 'Community Health Centre (CHC)'
  | 'Sub-Centre'
  | 'District Hospital'
  | 'Jan Aushadhi Kendra (Pharmacy)'
  | 'Blood Bank / Trauma Centre';

export interface HealthcareFacility {
  id: string;
  name: string;
  type: FacilityType;
  district: string;
  state: string;
  address: string;
  distanceKm: number;
  contactNumber: string;
  ambulanceContact: string;
  has24x7Emergency: boolean;
  doctorsOnDuty: number;
  specialtyAvailable?: string[];
  estimatedWaitTime?: string; // e.g. "10-15 mins wait", "45 mins wait"
  supportedLanguages?: string[]; // e.g. ["Hindi", "Awadhi", "English"]
  affordabilityCue?: string; // e.g. "100% Free under Ayushman Bharat / NHM", "Generic Medicines at 80% discount"
  coordinates: {
    lat: number;
    lng: number;
  };
  services: string[];
}

export type TriageSeverity = 'emergency' | 'consult_soon' | 'self_care';

export interface LegacyTriageAssessment {
  id: string;
  patientId: string;
  symptoms: string[];
  userDescription?: string;
  severity: TriageSeverity;
  severityLabel: string;
  recommendedCareLevel: string;
  primaryAction: string;
  warningFlags: string[];
  selfCareGuidance?: string[];
  suggestedFacilityId?: string;
  suggestedFacilityName?: string;
  disclaimer: string;
  timestamp: string;
}

export interface ReferralRecord {
  id: string;
  patientId: string;
  patientName: string;
  patientAbhaId?: string;
  patientAge: number;
  patientGender: string;
  patientBloodGroup: string;
  referringProviderId: string;
  referringProviderName: string;
  referringRole: string;
  referringFacility: string;
  destinationFacilityId: string;
  destinationFacilityName: string;
  specialtyNeeded: string;
  urgency: 'routine' | 'urgent' | 'immediate_emergency';
  reasonForReferral: string;
  clinicalSummary: string;
  criticalAllergies: string[];
  status: 'initiated' | 'in_transit' | 'consulted' | 'closed';
  createdAt: string;
  consultedAt?: string;
}

export interface MedicationReminder {
  id: string;
  patientId: string;
  medicineName: string;
  genericName?: string;
  dosage: string;
  frequency?: string;
  timeOfDay: 'morning' | 'afternoon' | 'night';
  mealTiming: 'before_meal' | 'after_meal' | 'anytime';
  status: 'taken' | 'due' | 'missed';
  scheduledTime: string;
  date: string;
  takenAt?: string;
}

export interface PatientCheckIn {
  id: string;
  patientId: string;
  date: string;
  status: 'better' | 'same' | 'worse';
  symptomNote?: string;
  escalated: boolean;
  escalationMessage?: string;
  ashaNotified: boolean;
  timestamp: string;
}

export interface CareAppointment {
  id: string;
  patientId: string;
  doctorName: string;
  facilityName: string;
  specialty: string;
  date: string;
  time: string;
  type: 'in_person' | 'teleconsult' | 'home_visit';
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
}

export interface CategorySharingPermissions {
  clinicalNotes: boolean;
  diagnoses: boolean;
  prescriptions: boolean;
  labReports: boolean;
  vitals: boolean;
  sensitiveRecords: boolean;
}

export interface GranularSharingConsent {
  id: string;
  patientId: string;
  granteeRole: 'doctor' | 'frontline_worker' | 'caregiver';
  granteeId: string;
  granteeName: string;
  granteeAffiliation?: string;
  permissions: CategorySharingPermissions;
  updatedAt: string;
}

export type AppLanguage = 'en' | 'ta' | 'te' | 'bn' | 'hi' | 'kn' | 'ml';

// =============================================================================
// CORPORATE HEALTHCARE DOMAIN MODELS
// =============================================================================

export interface DoctorSpecialty {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  commonSymptoms: string[];
}

export interface Doctor {
  id: string;
  uid: string;
  fullName: string;
  title: string; // e.g. "Senior Consultant - Interventional Cardiology"
  specialty: string;
  qualifications: string; // e.g. "MBBS, MD, DM (Cardiology), FACC"
  experienceYears: number;
  registrationNumber: string;
  councilName: string;
  hospitalAffiliation: string;
  hospitalId: string;
  avatarUrl: string;
  about: string;
  areasOfExpertise: string[];
  languages: string[];
  consultationFee: number; // in INR
  rating: number; // e.g. 4.9
  reviewCount: number;
  nextAvailableSlot: string; // e.g. "Today at 04:30 PM"
  consultationModes: ('in_person' | 'teleconsultation')[];
  availableDays: string[];
  availableSlots: string[];
}

export interface Hospital {
  id: string;
  name: string;
  type: string; // "Multi-Specialty Tertiary Hospital", "Super-Specialty Centre", "District Healthcare Hub"
  tagline: string;
  overview: string;
  imageUrl: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  distanceKm?: number;
  phone: string;
  emergencyContact: string;
  emergency24x7: boolean;
  icuBeds: number;
  openingHours: string;
  rating: number;
  reviewCount: number;
  departments: string[];
  services: string[];
  featuredDoctorIds: string[];
}

export type AppointmentType = 'in_person' | 'teleconsultation';
export type AppointmentStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'rescheduled' | 'no_show';
export type PaymentStatus = 'paid' | 'pay_at_hospital' | 'free';

export interface Appointment {
  id: string;
  bookingReference: string; // e.g. "CB-2026-89412"
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientAge?: number;
  patientGender?: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorAvatarUrl?: string;
  hospitalId: string;
  hospitalName: string;
  hospitalAddress?: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:30 AM"
  type: AppointmentType;
  status: AppointmentStatus;
  fee: number;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: string;
}

export interface TeleconsultationSession {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'waiting' | 'in_progress' | 'completed' | 'missed';
  roomUrl: string;
  meetingNotes?: string;
  prescriptionId?: string;
  joinedAt?: string;
  endedAt?: string;
}

export type InventoryStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface Medicine {
  id: string;
  brandName: string;
  genericName: string;
  composition: string;
  dosageForm: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Ointment' | 'Drops' | 'Inhaler';
  strength: string; // e.g. "500 mg"
  category: string; // "Cardiovascular", "Diabetic Care", "Pain & Analgesics", "Antibiotics", etc.
  manufacturer: string;
  price: number;
  prescriptionRequired: boolean;
  usageInstructions: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
  phone: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  distanceKm?: number;
  open24x7: boolean;
  openingHours: string;
  rating: number;
}

export interface MedicineInventory {
  id: string;
  pharmacyId: string;
  pharmacyName: string;
  pharmacyAddress: string;
  pharmacyPhone: string;
  distanceKm: number;
  medicineId: string;
  medicineName: string;
  genericName: string;
  dosageForm: string;
  status: InventoryStatus;
  quantity: number;
  unitPrice: number;
  lastUpdated: string;
}

export interface Prescription {
  id: string;
  appointmentId?: string;
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  doctorId: string;
  doctorName: string;
  doctorRegistration: string;
  doctorSpecialty: string;
  hospitalName: string;
  date: string;
  diagnosis: string[];
  vitals?: {
    bloodPressure?: string;
    pulseBpm?: number;
    spo2?: number;
    temperatureF?: number;
  };
  medicines: PrescriptionItem[];
  advice: string;
  followUpDate?: string;
  doctorSignatureStamp?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  category: 'appointment' | 'teleconsult' | 'prescription' | 'security' | 'system';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface CityLocation {
  id: string;
  name: string;
  state: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  isDefault?: boolean;
}

// ----------------------------------------------------
// CareBridge Phase 2: Complete Care Continuity Types
// ----------------------------------------------------

export type TriageTier = 
  | 'low_priority' 
  | 'routine_consultation' 
  | 'priority_consultation' 
  | 'urgent' 
  | 'emergency';

export interface TriageAssessment {
  id: string;
  patientId: string;
  patientName?: string;
  assessedAt: string;
  symptoms: string[];
  duration: string;
  severityFlags: string[];
  vitals?: {
    temperatureF?: number;
    pulseBpm?: number;
    spo2?: number;
    bloodPressure?: string;
  };
  tier: TriageTier;
  recommendedCarePath: string;
  clinicalGuidance: string;
  nearestFacilityRecommended?: string;
  teleconsultRecommended?: boolean;
  emergencyHotlineCalled?: boolean;
  followUpWindowHours: number;
  assessedByRole: 'patient' | 'healthcare_worker' | 'doctor';
  assessedById?: string;
  status: 'active' | 'resolved' | 'escalated';
}

export type ReferralStatus = 
  | 'DRAFT' 
  | 'SENT' 
  | 'RECEIVED' 
  | 'ACCEPTED' 
  | 'APPOINTMENT_SCHEDULED' 
  | 'COMPLETED' 
  | 'CLOSED' 
  | 'REJECTED' 
  | 'CANCELLED' 
  | 'EXPIRED';

export type ReferralPriority = 'routine' | 'priority' | 'urgent' | 'emergency';

export interface ReferralTimelineEvent {
  id: string;
  status: ReferralStatus;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  notes?: string;
}

export interface Referral {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientAge?: number;
  patientGender?: string;
  referringDoctorId: string;
  referringDoctorName: string;
  referringFacilityId: string;
  referringFacilityName: string;
  destinationFacilityId: string;
  destinationFacilityName: string;
  specialtyRequired: string;
  priority: ReferralPriority;
  clinicalReason: string;
  provisionalDiagnosis: string;
  attachedRecordIds: string[];
  status: ReferralStatus;
  timeline: ReferralTimelineEvent[];
  scheduledAppointmentId?: string;
  scheduledDate?: string;
  destinationDoctorId?: string;
  destinationDoctorName?: string;
  feedbackReport?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type DiagnosticOrderStatus = 
  | 'ORDERED' 
  | 'SCHEDULED' 
  | 'SAMPLE_COLLECTED' 
  | 'PROCESSING' 
  | 'RESULT_AVAILABLE' 
  | 'REVIEWED' 
  | 'CLOSED';

export interface DiagnosticTest {
  id: string;
  code: string;
  name: string;
  category: 'pathology' | 'radiology' | 'cardiology' | 'biochemistry';
  turnaroundHours: number;
  sampleType?: string;
  preparationInstructions?: string;
  costInr: number;
  isAvailable: boolean;
}

export interface DiagnosticParameterResult {
  parameterName: string;
  value: string;
  unit: string;
  referenceRange: string;
  isAbnormal: boolean;
  criticalFlag?: boolean;
}

export interface DiagnosticOrder {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  doctorId: string;
  doctorName: string;
  facilityId: string;
  facilityName: string;
  tests: DiagnosticTest[];
  clinicalIndication: string;
  status: DiagnosticOrderStatus;
  scheduledSlot?: string;
  scheduledFacilityId?: string;
  sampleCollectedAt?: string;
  results?: DiagnosticParameterResult[];
  reportSummary?: string;
  abnormalFlagCount: number;
  criticalFlagCount: number;
  doctorReviewNotes?: string;
  reviewedByDoctorId?: string;
  reviewedAt?: string;
  linkedRecordId?: string;
  createdAt: string;
  updatedAt: string;
  demoNotice?: string;
}

export type CarePlanStatus = 'on_track' | 'due_soon' | 'overdue' | 'escalated' | 'completed';

export interface CarePlanTask {
  id: string;
  title: string;
  description: string;
  type: 'medication_adherence' | 'diagnostic_test' | 'doctor_visit' | 'vitals_log' | 'lifestyle';
  dueDate: string;
  completed: boolean;
  completedAt?: string;
  notes?: string;
}

export interface CarePlan {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  primaryCondition: string;
  riskTier: 'low' | 'moderate' | 'high' | 'critical';
  status: CarePlanStatus;
  startDate: string;
  targetReviewDate: string;
  tasks: CarePlanTask[];
  medicationReviewStatus: 'current' | 'pending_refill' | 'adverse_event';
  diagnosticDue?: string;
  nextAppointmentDue?: string;
  lastClinicianContact?: string;
  escalationCount: number;
  escalationReason?: string;
  escalatedToDoctorId?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface FacilityOperationsMetrics {
  facilityId: string;
  facilityName: string;
  opdQueueCount: number;
  averageConsultationWaitMinutes: number;
  pendingReferralsCount: number;
  completedReferralsRatePercent: number;
  diagnosticTurnaroundAverageHours: number;
  pharmacyFulfillmentRatePercent: number;
  overdueFollowUpsCount: number;
  criticalCareBedsOccupied: number;
  criticalCareBedsTotal: number;
  lastUpdated: string;
  demoNotice: string;
}

export type SyncStatus = 'draft' | 'pending' | 'synced' | 'failed';

export interface SyncQueueItem {
  id: string;
  action: 'create_triage' | 'create_referral' | 'update_referral' | 'order_diagnostic' | 'update_care_task';
  payload: any;
  createdAt: string;
  retryCount: number;
  status: SyncStatus;
  error?: string;
}


