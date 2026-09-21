import { 
  UserProfile, 
  PatientProfile, 
  DoctorProfile, 
  HealthRecord, 
  AccessAuthorization, 
  EmergencyAccessEvent, 
  AuditLogEntry, 
  HealthcareFacility,
  MedicationReminder,
  CareAppointment,
  ReferralRecord,
  PatientCheckIn,
  GranularSharingConsent,
  DoctorSpecialty,
  Doctor,
  Hospital,
  Appointment,
  TeleconsultationSession,
  Medicine,
  Pharmacy,
  MedicineInventory,
  Prescription,
  NotificationItem,
  CityLocation
} from '../types';

export const INITIAL_USERS: UserProfile[] = [
  {
    uid: 'pat-ramesh',
    role: 'patient',
    fullName: 'Ramesh Kumar',
    email: 'ramesh.farmer@ruralcare.in',
    phone: '+91 94150 12345',
    abhaId: '91-8724-1029-4412',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2025-01-15T09:00:00Z',
  },
  {
    uid: 'pat-sunita',
    role: 'patient',
    fullName: 'Sunita Devi',
    email: 'sunita.devi@ruralcare.in',
    phone: '+91 94150 67890',
    abhaId: '91-6542-8819-3301',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    createdAt: '2025-02-10T11:30:00Z',
  },
  {
    uid: 'doc-sharma',
    role: 'doctor',
    fullName: 'Dr. Anita Sharma',
    email: 'anita.sharma@chc-rampur.gov.in',
    phone: '+91 98390 11223',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    createdAt: '2024-11-01T08:00:00Z',
  },
  {
    uid: 'doc-verma',
    role: 'doctor',
    fullName: 'Dr. Rajesh Verma',
    email: 'rajesh.verma@dist-hospital.gov.in',
    phone: '+91 98390 44556',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2024-10-15T10:00:00Z',
  },
  {
    uid: 'admin-sunil',
    role: 'admin',
    fullName: 'Sunil Mathur',
    email: 'admin.sitapur@nhm.gov.in',
    phone: '+91 94150 99887',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    createdAt: '2024-09-01T08:00:00Z',
  },
  {
    uid: 'asha-rekha',
    role: 'frontline_worker',
    fullName: 'Rekha Devi (ASHA)',
    email: 'rekha.devi@asha-sitapur.gov.in',
    phone: '+91 94150 55432',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    createdAt: '2024-08-10T09:00:00Z',
  }
];

export const INITIAL_PATIENTS: Record<string, PatientProfile> = {
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
      {
        id: 'ec-1',
        name: 'Suresh Kumar',
        relation: 'Brother',
        phone: '+91 98765 43210',
        priority: 1
      },
      {
        id: 'ec-2',
        name: 'Manoj Kumar',
        relation: 'Son',
        phone: '+91 98765 43211',
        priority: 2
      }
    ],
    chronicConditions: [
      {
        id: 'cond-1',
        name: 'Type 2 Diabetes Mellitus',
        diagnosedYear: '2021',
        status: 'managed',
        source: 'doctor_verified',
        notes: 'Monitored at CHC Rampur. Managed with generic Metformin.'
      },
      {
        id: 'cond-2',
        name: 'Essential Hypertension',
        diagnosedYear: '2022',
        status: 'active',
        source: 'doctor_verified',
        notes: 'Mildly elevated BP on last 2 visits. Telmisartan 40mg prescribed.'
      }
    ],
    allergies: [
      {
        id: 'alg-1',
        allergen: 'Penicillin (and Amoxicillin derivatives)',
        severity: 'life_threatening',
        reaction: 'Severe anaphylaxis, facial angioedema, acute dyspnea',
        verified: true,
        source: 'doctor_verified'
      },
      {
        id: 'alg-2',
        allergen: 'Dust / Pollen (Crop Harvest season)',
        severity: 'mild',
        reaction: 'Rhinitis, sneezing, watery eyes',
        verified: false,
        source: 'patient_provided'
      }
    ],
    emergencyMinimumDataset: {
      bloodGroup: 'B+',
      criticalAllergies: [
        'Penicillin / Amoxicillin (LIFE-THREATENING ANAPHYLAXIS)'
      ],
      criticalConditions: [
        'Type 2 Diabetes Mellitus',
        'Essential Hypertension'
      ],
      criticalMedications: [
        'Metformin 500mg (1-0-1)',
        'Telmisartan 40mg (1-0-0)'
      ],
      resuscitationPreference: 'Full Code',
      emergencyContactsSummary: [
        'Suresh Kumar (Brother): +91 98765 43210',
        'Manoj Kumar (Son): +91 98765 43211'
      ],
      emergencyNotes: 'Severe Penicillin anaphylaxis history. Patient speaks Hindi and Awadhi. No personal medical devices at home.'
    }
  },
  'pat-sunita': {
    id: 'pat-sunita',
    dob: '1991-04-20',
    gender: 'female',
    bloodGroup: 'O+',
    occupation: 'Rural Craftswoman / Artisan',
    address: {
      villageOrTown: 'Mohanpur Village',
      block: 'Rampur',
      district: 'Sitapur',
      state: 'Uttar Pradesh',
      pincode: '261202'
    },
    emergencyContacts: [
      {
        id: 'ec-3',
        name: 'Ram Prakash',
        relation: 'Husband',
        phone: '+91 98765 99881',
        priority: 1
      }
    ],
    chronicConditions: [
      {
        id: 'cond-3',
        name: 'Pregnancy - Second Trimester (24 Weeks)',
        diagnosedYear: '2025',
        status: 'active',
        source: 'doctor_verified',
        notes: 'Under Antenatal Care protocol at PHC Mohanpur'
      }
    ],
    allergies: [
      {
        id: 'alg-3',
        allergen: 'Sulfa Drugs',
        severity: 'moderate',
        reaction: 'Skin rash, pruritus',
        verified: true,
        source: 'doctor_verified'
      }
    ],
    emergencyMinimumDataset: {
      bloodGroup: 'O+',
      criticalAllergies: ['Sulfa Drugs (Moderate allergic dermatitis)'],
      criticalConditions: ['Second Trimester Antenatal Care (24 weeks)'],
      criticalMedications: ['Iron and Folic Acid (IFA) Tablets', 'Calcium Carbonate 500mg'],
      resuscitationPreference: 'Full Code',
      emergencyContactsSummary: ['Ram Prakash (Husband): +91 98765 99881'],
      emergencyNotes: 'High-risk screening: Hemoglobin 10.1 g/dL. Enrolled with local ASHA worker.'
    }
  }
};

export const INITIAL_DOCTORS: Record<string, DoctorProfile> = {
  'doc-sharma': {
    id: 'doc-sharma',
    registrationNumber: 'MCI/UP/2012/048821',
    councilName: 'Uttar Pradesh Medical Council',
    specialization: 'General Medicine & Rural Health',
    qualification: 'MBBS, MD (Medicine)',
    hospitalAffiliation: 'Community Health Centre (CHC) Rampur',
    verifiedByAdmin: true,
    contactNumber: '+91 98390 11223',
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
    contactNumber: '+91 98390 44556',
    experienceYears: 9
  }
};

export const INITIAL_RECORDS: HealthRecord[] = [
  {
    id: 'rec-001',
    patientId: 'pat-ramesh',
    title: 'Discharge Summary: Acute Gastroenteritis with Moderate Dehydration',
    category: 'discharge_summary',
    recordDate: '2024-05-18',
    createdAt: '2024-05-18T14:30:00Z',
    authorId: 'doc-verma',
    authorName: 'Dr. Rajesh Verma',
    authorRole: 'doctor',
    source: 'doctor_verified',
    facilityName: 'Sitapur District Hospital',
    clinicalSummary: 'Patient admitted with 3-day history of acute watery diarrhea and vomiting during summer heatwave. Treated with IV fluids (RL/DNS), oral rehydration solution, and zinc supplementation. Renal function monitored and normalized. Discharged stable.',
    diagnosis: ['Acute Viral Gastroenteritis', 'Moderate Dehydration (Resolved)'],
    treatmentPlan: 'ORS as needed, light boiled diet for 5 days, avoid unboiled well water.',
    prescriptions: [
      {
        id: 'p-1',
        medicineName: 'ORS Sachet',
        genericName: 'Oral Rehydration Salts IP',
        dosage: '1 packet in 1L boiled water',
        frequency: 'As needed',
        duration: '3 days',
        instructions: 'Drink frequently after each loose stool'
      },
      {
        id: 'p-2',
        medicineName: 'Zinc 20mg',
        genericName: 'Zinc Sulfate Monohydrate',
        dosage: '20 mg',
        frequency: '1-0-0',
        duration: '14 days',
        instructions: 'Take in the morning with water'
      }
    ],
    vitals: {
      isDeviceRecorded: false,
      isUnavailable: false,
      bloodPressureSystolic: 110,
      bloodPressureDiastolic: 72,
      pulseBpm: 84,
      temperatureFahrenheit: 98.6,
      spo2Percentage: 98,
      source: 'doctor_measured',
      notes: 'Measured by staff nurse with manual sphygmomanometer at discharge.'
    },
    isSensitive: false
  },
  {
    id: 'rec-002',
    patientId: 'pat-ramesh',
    title: 'Uploaded Lab Report: Routine Diabetic & Lipid Metabolic Panel',
    category: 'lab_report',
    recordDate: '2025-01-20',
    createdAt: '2025-01-21T10:00:00Z',
    authorId: 'pat-ramesh',
    authorName: 'Ramesh Kumar',
    authorRole: 'patient',
    source: 'uploaded_document',
    facilityName: 'Sitapur Diagnostics & Pathology Lab',
    documentFileName: 'LabReport_Ramesh_Jan2025.pdf',
    documentType: 'pdf',
    documentUrl: 'https://example.com/demo-docs/ramesh_lab_jan2025.pdf',
    aiAnalysis: {
      summary: 'Biochemical screening indicates moderate hyperglycemia (Fasting Blood Sugar 142 mg/dL, HbA1c 7.1%) consistent with partially controlled Type 2 Diabetes. Renal function (Creatinine 0.9 mg/dL) and liver markers remain within normal limits. Lipid panel shows borderline elevated Triglycerides (178 mg/dL).',
      keyObservations: [
        'Fasting Blood Glucose is elevated (142 mg/dL vs normal < 100 mg/dL)',
        'HbA1c of 7.1% suggests 3-month average glycemic level above optimal target',
        'Kidney filtration markers (Serum Creatinine 0.9 mg/dL) are preserved',
        'Mild hypertriglyceridemia noted'
      ],
      extractedParameters: [
        { parameter: 'Fasting Blood Glucose', value: '142', unit: 'mg/dL', referenceRange: '70 - 99', isAbnormal: true },
        { parameter: 'HbA1c (Glycated Hemoglobin)', value: '7.1', unit: '%', referenceRange: '< 5.7', isAbnormal: true },
        { parameter: 'Serum Creatinine', value: '0.9', unit: 'mg/dL', referenceRange: '0.7 - 1.2', isAbnormal: false },
        { parameter: 'Blood Urea Nitrogen', value: '16', unit: 'mg/dL', referenceRange: '7 - 20', isAbnormal: false },
        { parameter: 'Total Cholesterol', value: '194', unit: 'mg/dL', referenceRange: '< 200', isAbnormal: false },
        { parameter: 'Triglycerides', value: '178', unit: 'mg/dL', referenceRange: '< 150', isAbnormal: true }
      ],
      patientFriendlyExplanation: 'Your sugar test shows that your body has higher sugar than normal in the blood over the past few months. Your kidneys are working well and are healthy. Limiting sweet tea, fried potato snacks, and walking 30 minutes daily will help bring the sugar down.',
      modelUsed: 'gemini-2.0-flash (Verified Clinical Parser)',
      generatedAt: '2025-01-21T10:02:15Z',
      doctorReviewed: true,
      doctorReviewNotes: 'Reviewed by Dr. Anita Sharma on 2025-01-28. Lab values confirmed accurate.'
    },
    vitals: {
      isDeviceRecorded: false,
      isUnavailable: true,
      source: 'unavailable',
      notes: 'No physiological measurements attached to this pathology report.'
    },
    isSensitive: false
  },
  {
    id: 'rec-003',
    patientId: 'pat-ramesh',
    title: 'Clinical Encounter Note & Prescription: Diabetes & BP Review',
    category: 'prescription',
    recordDate: '2025-01-28',
    createdAt: '2025-01-28T11:45:00Z',
    authorId: 'doc-sharma',
    authorName: 'Dr. Anita Sharma',
    authorRole: 'doctor',
    source: 'doctor_verified',
    facilityName: 'Community Health Centre (CHC) Rampur',
    clinicalSummary: '52-year-old male with known Type 2 DM and HTN presenting for routine 6-month review. Patient asymptomatic, reports occasional morning fatigue. Reviewed external lab report dated 2025-01-20 showing HbA1c 7.1%. Blood pressure at clinic 138/86 mmHg. Re-emphasized strict adherence to morning medication.',
    diagnosis: [
      'Type 2 Diabetes Mellitus (HbA1c 7.1%)',
      'Essential Hypertension (Stage 1, Grade I)'
    ],
    treatmentPlan: 'Continue Metformin 500mg twice daily with meals. Add Telmisartan 40mg once daily in morning. Low-sodium diet, reduce jaggery/white sugar in tea. Review at CHC in 3 months with repeat fasting blood sugar.',
    prescriptions: [
      {
        id: 'p-3',
        medicineName: 'Metformin Hydrochloride IP',
        genericName: 'Metformin',
        dosage: '500 mg',
        frequency: '1-0-1 (with breakfast and dinner)',
        duration: '90 days',
        instructions: 'Take immediately after food to avoid stomach upset'
      },
      {
        id: 'p-4',
        medicineName: 'Telmisartan Tablets IP',
        genericName: 'Telmisartan',
        dosage: '40 mg',
        frequency: '1-0-0 (morning)',
        duration: '90 days',
        instructions: 'Take once every morning with water'
      }
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
    id: 'rec-004',
    patientId: 'pat-ramesh',
    title: 'Self-Reported Health Note: Mild Seasonal Cough & Farm Dust Exposure',
    category: 'patient_log',
    recordDate: '2025-02-15',
    createdAt: '2025-02-15T18:00:00Z',
    authorId: 'pat-ramesh',
    authorName: 'Ramesh Kumar',
    authorRole: 'patient',
    source: 'patient_provided',
    clinicalSummary: 'Experienced dry throat and mild coughing in the evening after wheat threshing in the field. Drank warm ginger water. No fever or chest pain noted.',
    vitals: {
      isDeviceRecorded: false,
      isUnavailable: true,
      source: 'unavailable',
      notes: 'Patient does not possess home thermometer or pulse oximeter.'
    },
    isSensitive: false
  }
];

export const INITIAL_AUTHORIZATIONS: AccessAuthorization[] = [
  {
    id: 'auth-001',
    patientId: 'pat-ramesh',
    doctorId: 'doc-sharma',
    doctorName: 'Dr. Anita Sharma',
    doctorSpecialization: 'General Medicine & Rural Health',
    doctorHospital: 'Community Health Centre (CHC) Rampur',
    status: 'active',
    scope: 'full_longitudinal',
    requestedAt: '2025-01-20T08:00:00Z',
    grantedAt: '2025-01-20T09:15:00Z'
  }
];

export const INITIAL_EMERGENCY_EVENTS: EmergencyAccessEvent[] = [
  {
    id: 'emg-001',
    patientId: 'pat-ramesh',
    patientName: 'Ramesh Kumar',
    requesterId: 'doc-verma',
    requesterName: 'Dr. Rajesh Verma',
    requesterRole: 'Emergency Surgeon',
    requesterFacility: 'Sitapur District Hospital & Trauma Centre',
    emergencyBadgeId: 'EMG-SIT-2024-889',
    clinicalReason: 'Acute bicycle collision road-traffic trauma. Patient confused, no family present at triage. Required immediate allergy screening before antibiotic administration.',
    grantedScope: 'emergency_minimum_dataset',
    accessedAt: '2024-11-12T22:14:05Z',
    auditHash: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    acknowledgedByPatient: true
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-001',
    actorId: 'doc-verma',
    actorName: 'Dr. Rajesh Verma',
    actorRole: 'doctor',
    action: 'TRIGGER_EMERGENCY_ACCESS',
    resourceType: 'emergency_access',
    resourceId: 'emg-001',
    patientId: 'pat-ramesh',
    timestamp: '2024-11-12T22:14:05Z',
    details: 'Emergency override activated for Ramesh Kumar. Badge: EMG-SIT-2024-889. Scope: Emergency Minimum Dataset only.'
  },
  {
    id: 'log-002',
    actorId: 'pat-ramesh',
    actorName: 'Ramesh Kumar',
    actorRole: 'patient',
    action: 'GRANT_CONSENT',
    resourceType: 'consent',
    resourceId: 'auth-001',
    patientId: 'pat-ramesh',
    timestamp: '2025-01-20T09:15:00Z',
    details: 'Patient granted full longitudinal medical record access to Dr. Anita Sharma (CHC Rampur).'
  },
  {
    id: 'log-003',
    actorId: 'pat-ramesh',
    actorName: 'Ramesh Kumar',
    actorRole: 'patient',
    action: 'UPLOAD_DOCUMENT',
    resourceType: 'health_record',
    resourceId: 'rec-002',
    patientId: 'pat-ramesh',
    timestamp: '2025-01-21T10:00:00Z',
    details: 'Uploaded PDF lab report: Sitapur Diagnostics Routine Metabolic Panel.'
  },
  {
    id: 'log-004',
    actorId: 'doc-sharma',
    actorName: 'Dr. Anita Sharma',
    actorRole: 'doctor',
    action: 'VIEW_RECORD',
    resourceType: 'health_record',
    resourceId: 'rec-002',
    patientId: 'pat-ramesh',
    timestamp: '2025-01-28T11:20:00Z',
    details: 'Authorized physician accessed longitudinal history and lab panel rec-002.'
  },
  {
    id: 'log-005',
    actorId: 'doc-sharma',
    actorName: 'Dr. Anita Sharma',
    actorRole: 'doctor',
    action: 'CREATE_RECORD',
    resourceType: 'health_record',
    resourceId: 'rec-003',
    patientId: 'pat-ramesh',
    timestamp: '2025-01-28T11:45:00Z',
    details: 'Recorded clinical encounter note and updated prescriptions (Metformin + Telmisartan).'
  }
];

export const RURAL_HEALTHCARE_FACILITIES: HealthcareFacility[] = [
  {
    id: 'fac-01',
    name: 'Primary Health Centre (PHC) Mohanpur',
    type: 'Primary Health Centre (PHC)',
    district: 'Sitapur',
    state: 'Uttar Pradesh',
    address: 'Main Village Road, Near Panchayat Bhawan, Mohanpur',
    distanceKm: 1.8,
    contactNumber: '+91 5862 241010',
    ambulanceContact: '108',
    has24x7Emergency: false,
    doctorsOnDuty: 1,
    estimatedWaitTime: '10-15 mins wait',
    supportedLanguages: ['Hindi', 'Awadhi'],
    affordabilityCue: '100% Free OPD & Generic Meds (NHM)',
    coordinates: { lat: 27.5750, lng: 80.6690 },
    services: ['OPD General Medicine', 'Maternal & Child Health', 'Immunization', 'Essential Drug Dispensing', 'Basic Blood Glucose Testing']
  },
  {
    id: 'fac-02',
    name: 'Community Health Centre (CHC) Rampur',
    type: 'Community Health Centre (CHC)',
    district: 'Sitapur',
    state: 'Uttar Pradesh',
    address: 'Block Headquarters Road, Near Tehsil Office, Rampur',
    distanceKm: 4.2,
    contactNumber: '+91 5862 255230',
    ambulanceContact: '108',
    has24x7Emergency: true,
    doctorsOnDuty: 3,
    estimatedWaitTime: '20-30 mins wait',
    supportedLanguages: ['Hindi', 'Awadhi', 'English'],
    affordabilityCue: 'Free OPD & Lab Screening (Ayushman Bharat / NHM)',
    coordinates: { lat: 27.5680, lng: 80.6830 },
    services: ['24x7 Emergency Triage', 'Inpatient Ward (30 Beds)', 'Obstetrics & Normal Delivery', 'X-Ray & Diagnostic Lab', 'Government Pharmacy', 'Dental Clinic']
  },
  {
    id: 'fac-03',
    name: 'Health Sub-Centre Bilaspur',
    type: 'Sub-Centre',
    district: 'Sitapur',
    state: 'Uttar Pradesh',
    address: 'Village Post Bilaspur, Block Rampur',
    distanceKm: 0.9,
    contactNumber: '+91 94150 77112',
    ambulanceContact: '102 / 108',
    has24x7Emergency: false,
    doctorsOnDuty: 0, // Staffed by ANM / Community Health Officer (CHO)
    estimatedWaitTime: '< 10 mins wait',
    supportedLanguages: ['Hindi', 'Awadhi'],
    affordabilityCue: 'Free Village Frontline Care (ASHA / ANM)',
    coordinates: { lat: 27.5810, lng: 80.6610 },
    services: ['First Aid', 'ASHA/ANM Triage', 'Antenatal Checkups', 'Oral Rehydration Point', 'Rapid Malaria & Sugar Test']
  },
  {
    id: 'fac-04',
    name: 'Sitapur District Hospital & Trauma Centre',
    type: 'District Hospital',
    district: 'Sitapur',
    state: 'Uttar Pradesh',
    address: 'Civil Lines, Near Collectorate, Sitapur',
    distanceKm: 18.5,
    contactNumber: '+91 5862 242200',
    ambulanceContact: '108 / 112',
    has24x7Emergency: true,
    doctorsOnDuty: 8,
    estimatedWaitTime: '45-60 mins wait',
    supportedLanguages: ['Hindi', 'English'],
    affordabilityCue: 'Ayushman PM-JAY Cashless Hospitalization',
    coordinates: { lat: 27.5600, lng: 80.6800 },
    services: ['Comprehensive Trauma Care', 'ICU & Critical Care', 'Advanced Surgery', 'Dialysis Unit', 'CT Scan & Ultrasound', '24x7 Blood Bank']
  },
  {
    id: 'fac-05',
    name: 'Pradhan Mantri Bhartiya Jan Aushadhi Kendra',
    type: 'Jan Aushadhi Kendra (Pharmacy)',
    district: 'Sitapur',
    state: 'Uttar Pradesh',
    address: 'Opposite CHC Rampur Main Gate',
    distanceKm: 4.1,
    contactNumber: '+91 5862 255299',
    ambulanceContact: '108',
    has24x7Emergency: false,
    doctorsOnDuty: 0,
    estimatedWaitTime: 'Quick counter (5 mins)',
    supportedLanguages: ['Hindi', 'Awadhi'],
    affordabilityCue: 'Quality Generics at 50% to 90% Less Cost',
    coordinates: { lat: 27.5675, lng: 80.6835 },
    services: ['Generic Medicines at 50-90% Discount', 'Sanitary Pads', 'Nutraceuticals', 'Free BP Check']
  },
  {
    id: 'fac-06',
    name: 'Red Cross District Blood Centre & Triage',
    type: 'Blood Bank / Trauma Centre',
    district: 'Sitapur',
    state: 'Uttar Pradesh',
    address: 'Red Cross Complex, Hospital Road, Sitapur',
    distanceKm: 18.2,
    contactNumber: '+91 5862 243311',
    ambulanceContact: '108',
    has24x7Emergency: true,
    doctorsOnDuty: 2,
    estimatedWaitTime: 'Immediate for critical trauma',
    supportedLanguages: ['Hindi', 'English'],
    affordabilityCue: 'Government Subsidized / Voluntary Donor Scheme',
    coordinates: { lat: 27.5585, lng: 80.6780 },
    services: ['Whole Blood & Component Separation (PRBC, FFP, Platelets)', 'Emergency Cross-Matching', '24x7 Donor Facility']
  }
];

export const INITIAL_MEDICATION_REMINDERS: MedicationReminder[] = [
  {
    id: 'med-rem-1',
    patientId: 'pat-ramesh',
    medicineName: 'Metformin Hydrochloride IP',
    genericName: 'Metformin',
    dosage: '500 mg',
    timeOfDay: 'morning',
    mealTiming: 'after_meal',
    status: 'taken',
    scheduledTime: '08:00 AM',
    date: new Date().toISOString().split('T')[0],
    takenAt: '08:15 AM'
  },
  {
    id: 'med-rem-2',
    patientId: 'pat-ramesh',
    medicineName: 'Telmisartan Tablets IP',
    genericName: 'Telmisartan',
    dosage: '40 mg',
    timeOfDay: 'morning',
    mealTiming: 'after_meal',
    status: 'taken',
    scheduledTime: '08:30 AM',
    date: new Date().toISOString().split('T')[0],
    takenAt: '08:35 AM'
  },
  {
    id: 'med-rem-3',
    patientId: 'pat-ramesh',
    medicineName: 'Metformin Hydrochloride IP',
    genericName: 'Metformin',
    dosage: '500 mg',
    timeOfDay: 'night',
    mealTiming: 'after_meal',
    status: 'due',
    scheduledTime: '08:30 PM',
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: 'med-rem-4',
    patientId: 'pat-sunita',
    medicineName: 'Iron and Folic Acid (IFA) Red Tablet',
    genericName: 'Ferrous Sulfate + Folic Acid',
    dosage: '100mg Iron + 500mcg FA',
    timeOfDay: 'afternoon',
    mealTiming: 'after_meal',
    status: 'taken',
    scheduledTime: '02:00 PM',
    date: new Date().toISOString().split('T')[0],
    takenAt: '02:10 PM'
  },
  {
    id: 'med-rem-5',
    patientId: 'pat-sunita',
    medicineName: 'Calcium Carbonate + Vitamin D3',
    genericName: 'Calcium 500mg',
    dosage: '500 mg',
    timeOfDay: 'night',
    mealTiming: 'after_meal',
    status: 'due',
    scheduledTime: '09:00 PM',
    date: new Date().toISOString().split('T')[0]
  }
];

export const INITIAL_APPOINTMENTS: CareAppointment[] = [
  {
    id: 'apt-01',
    patientId: 'pat-ramesh',
    doctorName: 'Dr. Anita Sharma',
    facilityName: 'Community Health Centre (CHC) Rampur',
    specialty: 'General Medicine & Diabetology',
    date: '2026-03-18',
    time: '10:30 AM',
    type: 'in_person',
    status: 'upcoming',
    notes: 'Quarterly review of glycemic control and blood pressure monitoring.'
  },
  {
    id: 'apt-02',
    patientId: 'pat-sunita',
    doctorName: 'Dr. Anita Sharma',
    facilityName: 'PHC Mohanpur',
    specialty: 'Antenatal Care (MCH)',
    date: '2026-03-22',
    time: '11:00 AM',
    type: 'in_person',
    status: 'upcoming',
    notes: 'Third trimester routine antenatal checkup with ASHA Rekha Devi.'
  }
];

export const INITIAL_REFERRALS: ReferralRecord[] = [
  {
    id: 'ref-01',
    patientId: 'pat-ramesh',
    patientName: 'Ramesh Kumar',
    patientAbhaId: '91-8724-1029-4412',
    patientAge: 52,
    patientGender: 'Male',
    patientBloodGroup: 'B+',
    referringProviderId: 'asha-rekha',
    referringProviderName: 'Rekha Devi (ASHA)',
    referringRole: 'Frontline Community Health Worker',
    referringFacility: 'Health Sub-Centre Bilaspur',
    destinationFacilityId: 'fac-02',
    destinationFacilityName: 'Community Health Centre (CHC) Rampur',
    specialtyNeeded: 'General Medicine / Diabetology',
    urgency: 'urgent',
    reasonForReferral: 'Persistent high morning glucose with fatigue; review antihypertensive dosage',
    clinicalSummary: 'Known T2DM (HbA1c 7.1%) and HTN. Patient reported morning dizziness during harvesting. Needs physician evaluation.',
    criticalAllergies: ['Penicillin / Amoxicillin (LIFE-THREATENING ANAPHYLAXIS)'],
    status: 'initiated',
    createdAt: '2026-03-12T09:30:00Z'
  }
];

export const INITIAL_CHECK_INS: PatientCheckIn[] = [
  {
    id: 'chk-01',
    patientId: 'pat-ramesh',
    date: '2026-03-11',
    status: 'same',
    symptomNote: 'Normal energy levels, morning tea without sugar',
    escalated: false,
    ashaNotified: false,
    timestamp: '2026-03-11T19:00:00Z'
  }
];

export const INITIAL_GRANULAR_CONSENTS: GranularSharingConsent[] = [
  {
    id: 'gcons-01',
    patientId: 'pat-ramesh',
    granteeRole: 'doctor',
    granteeId: 'doc-sharma',
    granteeName: 'Dr. Anita Sharma',
    granteeAffiliation: 'Community Health Centre (CHC) Rampur',
    permissions: {
      clinicalNotes: true,
      diagnoses: true,
      prescriptions: true,
      labReports: true,
      vitals: true,
      sensitiveRecords: false
    },
    updatedAt: '2026-01-20T09:15:00Z'
  },
  {
    id: 'gcons-02',
    patientId: 'pat-ramesh',
    granteeRole: 'frontline_worker',
    granteeId: 'asha-rekha',
    granteeName: 'Rekha Devi (ASHA)',
    granteeAffiliation: 'Bilaspur & Rampur Sub-Centre',
    permissions: {
      clinicalNotes: false,
      diagnoses: true,
      prescriptions: true,
      labReports: false,
      vitals: true,
      sensitiveRecords: false
    },
    updatedAt: '2026-01-25T11:00:00Z'
  },
  {
    id: 'gcons-03',
    patientId: 'pat-ramesh',
    granteeRole: 'caregiver',
    granteeId: 'ec-1',
    granteeName: 'Suresh Kumar (Brother)',
    granteeAffiliation: 'Primary Family Caregiver',
    permissions: {
      clinicalNotes: false,
      diagnoses: false,
      prescriptions: true,
      labReports: false,
      vitals: true,
      sensitiveRecords: false
    },
    updatedAt: '2026-02-01T14:30:00Z'
  }
];

export const POPULAR_CITIES: CityLocation[] = [
  { id: 'city-blr', name: 'Bengaluru', state: 'Karnataka', isDefault: true, coordinates: { lat: 12.9716, lng: 77.5946 } },
  { id: 'city-chn', name: 'Chennai', state: 'Tamil Nadu', coordinates: { lat: 13.0827, lng: 80.2707 } },
  { id: 'city-del', name: 'New Delhi', state: 'Delhi', coordinates: { lat: 28.6139, lng: 77.2090 } },
  { id: 'city-hyd', name: 'Hyderabad', state: 'Telangana', coordinates: { lat: 17.3850, lng: 78.4867 } },
  { id: 'city-mum', name: 'Mumbai', state: 'Maharashtra', coordinates: { lat: 19.0760, lng: 72.8777 } },
  { id: 'city-pun', name: 'Pune', state: 'Maharashtra', coordinates: { lat: 18.5204, lng: 73.8567 } },
  { id: 'city-lko', name: 'Lucknow', state: 'Uttar Pradesh', coordinates: { lat: 26.8467, lng: 80.9462 } },
  { id: 'city-kol', name: 'Kolkata', state: 'West Bengal', coordinates: { lat: 22.5726, lng: 88.3639 } }
];

export const CORPORATE_SPECIALTIES: DoctorSpecialty[] = [
  {
    id: 'spec-cardio',
    name: 'Cardiology',
    slug: 'cardiology',
    iconName: 'Heart',
    description: 'Comprehensive cardiovascular care, ECG, echo, hypertension, and coronary artery disease management.',
    commonSymptoms: ['Chest pain', 'Palpitations', 'Shortness of breath', 'High blood pressure', 'Dizziness']
  },
  {
    id: 'spec-neuro',
    name: 'Neurology & Neurosurgery',
    slug: 'neurology',
    iconName: 'Brain',
    description: 'Advanced neurological disorders, epilepsy, migraine, stroke rehabilitation, and spinal health.',
    commonSymptoms: ['Severe headaches', 'Numbness or tingling', 'Tremors', 'Seizures', 'Memory loss']
  },
  {
    id: 'spec-ortho',
    name: 'Orthopedics & Joint Care',
    slug: 'orthopedics',
    iconName: 'Activity',
    description: 'Robotic joint replacement, sports injury rehab, arthroscopy, and fracture management.',
    commonSymptoms: ['Knee pain', 'Backache', 'Joint stiffness', 'Fracture', 'Sports injury']
  },
  {
    id: 'spec-pedia',
    name: 'Pediatrics & Neonatology',
    slug: 'pediatrics',
    iconName: 'Baby',
    description: 'Child health, immunization schedules, newborn intensive care, and developmental tracking.',
    commonSymptoms: ['Childhood fever', 'Cough & cold', 'Delayed milestones', 'Growth concerns', 'Vaccination']
  },
  {
    id: 'spec-derma',
    name: 'Dermatology & Cosmetology',
    slug: 'dermatology',
    iconName: 'Sparkles',
    description: 'Clinical skin therapy, acne, eczema, psoriasis, and laser dermatological procedures.',
    commonSymptoms: ['Skin rash', 'Acne & scars', 'Hair loss', 'Skin pigmentation', 'Itching']
  },
  {
    id: 'spec-onco',
    name: 'Medical & Surgical Oncology',
    slug: 'oncology',
    iconName: 'Shield',
    description: 'Multi-disciplinary cancer therapy, precision chemotherapy, and oncological surgeries.',
    commonSymptoms: ['Unexplained weight loss', 'Persistent lump', 'Chronic fatigue', 'Abnormal bleeding']
  },
  {
    id: 'spec-gynae',
    name: 'Obstetrics & Gynecology',
    slug: 'gynecology',
    iconName: 'Users',
    description: 'Maternity care, high-risk pregnancy, women\'s wellness, and reproductive health.',
    commonSymptoms: ['Irregular periods', 'Pelvic pain', 'Pregnancy checkup', 'PCOS', 'Menopause symptoms']
  },
  {
    id: 'spec-gastro',
    name: 'Gastroenterology & Hepatology',
    slug: 'gastroenterology',
    iconName: 'Stethoscope',
    description: 'Digestive tract disorders, liver clinics, therapeutic endoscopy, and reflux management.',
    commonSymptoms: ['Acid reflux & heartburn', 'Stomach bloating', 'Jaundice', 'Constipation', 'Abdominal cramps']
  },
  {
    id: 'spec-pulmo',
    name: 'Pulmonology & Chest Medicine',
    slug: 'pulmonology',
    iconName: 'Wind',
    description: 'Asthma, chronic bronchitis, post-viral pulmonary recovery, and sleep apnea diagnostics.',
    commonSymptoms: ['Chronic cough', 'Wheezing', 'Breathlessness', 'Chest congestion', 'Snoring / sleep apnea']
  },
  {
    id: 'spec-genmed',
    name: 'Internal & General Medicine',
    slug: 'general-medicine',
    iconName: 'UserCheck',
    description: 'Primary medical care, diabetes, infectious diseases, preventive health checks, and wellness.',
    commonSymptoms: ['Fever & chills', 'Fatigue & weakness', 'Diabetes check', 'Hypertension', 'Body aches']
  }
];

export const CORPORATE_HOSPITALS: Hospital[] = [
  {
    id: 'hosp-01',
    name: 'CareBridge Apex Super-Specialty Hospital',
    type: 'Super-Specialty Tertiary Hospital',
    tagline: 'Centre of Excellence in Cardiac & Neuro Sciences',
    overview: 'CareBridge Apex Hospital is a premier 650-bed quaternary care hospital featuring state-of-the-art cath labs, robotic surgical suites, and dedicated 24x7 trauma & emergency wards.',
    imageUrl: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&auto=format&fit=crop&q=80',
    address: '42 Outer Ring Road, Bellandur',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    pincode: '560103',
    coordinates: { lat: 12.9298, lng: 77.6848 },
    distanceKm: 1.2,
    phone: '+91 80 4910 2000',
    emergencyContact: '1066 / +91 80 4910 2911',
    emergency24x7: true,
    icuBeds: 120,
    openingHours: '24 Hours / 7 Days',
    rating: 4.88,
    reviewCount: 1420,
    departments: ['Cardiology', 'Neurology', 'Orthopedics', 'Oncology', 'Emergency Care', 'Gastroenterology'],
    services: ['24x7 Emergency & Trauma', 'Robotic Knee Replacement', 'PET-CT & 3T MRI', 'NABH Accredited Blood Bank', 'Organ Transplant Suite'],
    featuredDoctorIds: ['doc-sharma', 'doc-patel']
  },
  {
    id: 'hosp-02',
    name: 'CareBridge Heart & Trauma Institute',
    type: 'Multi-Specialty Tertiary Hospital',
    tagline: 'Rapid Response Emergency & Cardiovascular Care',
    overview: 'Equipped with dedicated acute myocardial infarction rapid protocols, Level-1 trauma bays, and 85 high-dependency intensive care beds.',
    imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80',
    address: '112 Anna Salai, Teynampet',
    district: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600018',
    coordinates: { lat: 13.0418, lng: 80.2507 },
    distanceKm: 3.4,
    phone: '+91 44 2430 8000',
    emergencyContact: '1066 / +91 44 2430 8911',
    emergency24x7: true,
    icuBeds: 85,
    openingHours: '24 Hours / 7 Days',
    rating: 4.82,
    reviewCount: 980,
    departments: ['Cardiology', 'Trauma & Emergency', 'Pulmonology', 'Critical Care', 'Internal Medicine'],
    services: ['Primary Angioplasty 24x7', 'Stroke Rapid Response Bay', 'Extracorporeal Life Support (ECMO)', 'Digital Dialysis Unit'],
    featuredDoctorIds: ['doc-gupta']
  },
  {
    id: 'hosp-03',
    name: 'CareBridge Women & Children\'s Pavilion',
    type: 'Specialized Mother & Child Hospital',
    tagline: 'Compassionate Maternity, Neonatal & Pediatric Care',
    overview: 'Specialized 280-bed hospital dedicated to maternal fetal medicine, Level-III NICU care, adolescent health, and advanced pediatric surgical procedures.',
    imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80',
    address: '18 Institutional Area, Sheikh Sarai',
    district: 'South Delhi',
    state: 'Delhi',
    pincode: '110017',
    coordinates: { lat: 28.5355, lng: 77.2289 },
    distanceKm: 4.1,
    phone: '+91 11 4150 7000',
    emergencyContact: '1066 / +91 11 4150 7911',
    emergency24x7: true,
    icuBeds: 50,
    openingHours: '24 Hours / 7 Days',
    rating: 4.91,
    reviewCount: 860,
    departments: ['Pediatrics', 'Obstetrics & Gynecology', 'Neonatal ICU', 'Genetics & Fertility'],
    services: ['Level III Neonatal ICU', 'Laparoscopic Gynaecology', 'Fetal Medicine & 4D Ultrasound', 'Pediatric Emergency Unit'],
    featuredDoctorIds: ['doc-menon', 'doc-chatterjee']
  },
  {
    id: 'hosp-04',
    name: 'CareBridge Brain & Spine Institute',
    type: 'Super-Specialty Neuroscience Hospital',
    tagline: 'Precision Neuro-Interventions & Advanced Spine Surgery',
    overview: 'Comprehensive neuroscience facility featuring intra-operative neuro-monitoring, biplane neurovascular cath labs, and specialized stroke recovery therapy.',
    imageUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&auto=format&fit=crop&q=80',
    address: 'Road No. 2, Banjara Hills',
    district: 'Hyderabad',
    state: 'Telangana',
    pincode: '500034',
    coordinates: { lat: 17.4156, lng: 78.4350 },
    distanceKm: 2.7,
    phone: '+91 40 3350 4000',
    emergencyContact: '1066 / +91 40 3350 4911',
    emergency24x7: true,
    icuBeds: 70,
    openingHours: '24 Hours / 7 Days',
    rating: 4.86,
    reviewCount: 710,
    departments: ['Neurology', 'Neurosurgery', 'Spine Rehabilitation', 'Interventional Radiology'],
    services: ['24x7 Acute Stroke Thrombectomy', 'Minimally Invasive Spine Surgery', 'Epilepsy Monitoring Unit', 'Neuro-ICU Care'],
    featuredDoctorIds: ['doc-reddy']
  },
  {
    id: 'hosp-05',
    name: 'CareBridge Metro Multi-Specialty Hospital',
    type: 'Multi-Specialty Tertiary Hospital',
    tagline: 'Comprehensive Healthcare for the Metropolis',
    overview: 'A full-spectrum 520-bed tertiary facility serving Western India with world-class surgical oncology, orthopedic trauma, and digestive health institutes.',
    imageUrl: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&auto=format&fit=crop&q=80',
    address: 'Link Road, Andheri West',
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    pincode: '400053',
    coordinates: { lat: 19.1363, lng: 72.8277 },
    distanceKm: 5.0,
    phone: '+91 22 6620 9000',
    emergencyContact: '1066 / +91 22 6620 9911',
    emergency24x7: true,
    icuBeds: 95,
    openingHours: '24 Hours / 7 Days',
    rating: 4.79,
    reviewCount: 1150,
    departments: ['Orthopedics', 'Gastroenterology', 'Cardiology', 'Internal Medicine', 'Emergency Care', 'Surgical Oncology'],
    services: ['Computer-Navigated Joint Surgery', 'Endoscopic Ultrasound (EUS)', 'Multidisciplinary Tumor Board', 'Daycare Chemotherapy'],
    featuredDoctorIds: ['doc-verma', 'doc-kulkarni']
  }
];

export const CORPORATE_DOCTORS: Doctor[] = [
  {
    id: 'doc-sharma',
    uid: 'doc-sharma',
    fullName: 'Dr. Anita Sharma',
    title: 'Senior Consultant - Interventional Cardiology',
    specialty: 'Cardiology',
    qualifications: 'MBBS, MD (Internal Medicine), DM (Cardiology), FACC',
    experienceYears: 15,
    registrationNumber: 'MCI/UP/2012/048821',
    councilName: 'Uttar Pradesh Medical Council',
    hospitalAffiliation: 'CareBridge Apex Super-Specialty Hospital',
    hospitalId: 'hosp-01',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
    about: 'Dr. Anita Sharma is a renowned interventional cardiologist specializing in coronary artery disease, preventative cardiovascular risk assessment, and complex angioplasties.',
    areasOfExpertise: ['Coronary Angioplasty', 'Heart Failure Management', 'Preventive Cardiology', 'Echocardiography'],
    languages: ['English', 'Hindi', 'Kannada'],
    consultationFee: 800,
    rating: 4.92,
    reviewCount: 420,
    nextAvailableSlot: 'Today at 04:30 PM',
    consultationModes: ['in_person', 'teleconsultation'],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    availableSlots: ['09:30 AM', '10:30 AM', '11:30 AM', '04:30 PM', '05:30 PM', '06:30 PM']
  },
  {
    id: 'doc-verma',
    uid: 'doc-verma',
    fullName: 'Dr. Rajesh Verma',
    title: 'Chief Consultant - Orthopedic & Joint Reconstruction',
    specialty: 'Orthopedics & Joint Care',
    qualifications: 'MBBS, MS (Orthopedics), MCh (Joint Reconstruction, UK)',
    experienceYears: 18,
    registrationNumber: 'NMC/2016/091244',
    councilName: 'National Medical Commission (NMC)',
    hospitalAffiliation: 'CareBridge Metro Multi-Specialty Hospital',
    hospitalId: 'hosp-05',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
    about: 'Expert in primary and revision knee and hip arthroplasty, sports ligament reconstructions, and minimally invasive complex fracture fixation.',
    areasOfExpertise: ['Robotic Knee Replacement', 'Hip Arthroplasty', 'Arthroscopic Surgery', 'Complex Trauma'],
    languages: ['English', 'Hindi', 'Marathi'],
    consultationFee: 900,
    rating: 4.88,
    reviewCount: 380,
    nextAvailableSlot: 'Tomorrow at 10:00 AM',
    consultationModes: ['in_person', 'teleconsultation'],
    availableDays: ['Mon', 'Wed', 'Thu', 'Fri', 'Sat'],
    availableSlots: ['10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM']
  },
  {
    id: 'doc-menon',
    uid: 'doc-menon',
    fullName: 'Dr. Priya Menon',
    title: 'Lead Consultant - Pediatrics & Neonatology',
    specialty: 'Pediatrics & Neonatology',
    qualifications: 'MBBS, MD (Pediatrics), Fellowship in Neonatology (AIIMS)',
    experienceYears: 12,
    registrationNumber: 'KMC/2014/082190',
    councilName: 'Karnataka Medical Council',
    hospitalAffiliation: 'CareBridge Women & Children\'s Pavilion',
    hospitalId: 'hosp-03',
    avatarUrl: 'https://images.unsplash.com/photo-1594824813684-2fbf0beea853?w=400&auto=format&fit=crop&q=80',
    about: 'Compassionate pediatric care focusing on pediatric infections, immunization schedules, infant nutrition, and child developmental milestones.',
    areasOfExpertise: ['Newborn Care', 'Pediatric Asthma', 'Vaccination Protocols', 'Growth & Nutrition'],
    languages: ['English', 'Hindi', 'Malayalam'],
    consultationFee: 650,
    rating: 4.95,
    reviewCount: 540,
    nextAvailableSlot: 'Today at 05:15 PM',
    consultationModes: ['in_person', 'teleconsultation'],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    availableSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '04:00 PM', '05:15 PM']
  },
  {
    id: 'doc-reddy',
    uid: 'doc-reddy',
    fullName: 'Dr. Arvind Reddy',
    title: 'Senior Consultant - Neurologist & Stroke Lead',
    specialty: 'Neurology & Neurosurgery',
    qualifications: 'MBBS, MD (General Medicine), DM (Neurology)',
    experienceYears: 20,
    registrationNumber: 'APMC/2005/019942',
    councilName: 'Andhra Pradesh Medical Council',
    hospitalAffiliation: 'CareBridge Brain & Spine Institute',
    hospitalId: 'hosp-04',
    avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80',
    about: 'Specialized in acute stroke interventions, Parkinson\'s management, refractory epilepsy care, and clinical neurophysiology.',
    areasOfExpertise: ['Stroke Thrombolysis', 'Epilepsy Management', 'Movement Disorders', 'Neuropathy'],
    languages: ['English', 'Telugu', 'Hindi'],
    consultationFee: 1100,
    rating: 4.91,
    reviewCount: 295,
    nextAvailableSlot: 'Tomorrow at 11:30 AM',
    consultationModes: ['in_person', 'teleconsultation'],
    availableDays: ['Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    availableSlots: ['10:30 AM', '11:30 AM', '03:00 PM', '04:00 PM', '05:00 PM']
  },
  {
    id: 'doc-patel',
    uid: 'doc-patel',
    fullName: 'Dr. Meera Patel',
    title: 'Senior Consultant - Clinical & Aesthetic Dermatologist',
    specialty: 'Dermatology & Cosmetology',
    qualifications: 'MBBS, MD (Dermatology, Venereology & Leprosy)',
    experienceYears: 10,
    registrationNumber: 'GMMC/2015/063311',
    councilName: 'Gujarat Medical Council',
    hospitalAffiliation: 'CareBridge Apex Super-Specialty Hospital',
    hospitalId: 'hosp-01',
    avatarUrl: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&auto=format&fit=crop&q=80',
    about: 'Expertise in chronic dermatitis, psoriasis biologic therapy, acne scar management, and evidence-based clinical dermatology.',
    areasOfExpertise: ['Clinical Dermatology', 'Psoriasis Clinic', 'Eczema & Allergy', 'Hair Loss Therapies'],
    languages: ['English', 'Gujarati', 'Hindi'],
    consultationFee: 600,
    rating: 4.86,
    reviewCount: 320,
    nextAvailableSlot: 'Today at 06:00 PM',
    consultationModes: ['in_person', 'teleconsultation'],
    availableDays: ['Mon', 'Tue', 'Wed', 'Fri', 'Sat'],
    availableSlots: ['11:00 AM', '12:00 PM', '04:00 PM', '05:00 PM', '06:00 PM']
  },
  {
    id: 'doc-kulkarni',
    uid: 'doc-kulkarni',
    fullName: 'Dr. Vikram Kulkarni',
    title: 'Director - Surgical Oncology Services',
    specialty: 'Medical & Surgical Oncology',
    qualifications: 'MBBS, MS (General Surgery), MCh (Surgical Oncology, Tata Memorial)',
    experienceYears: 22,
    registrationNumber: 'MMC/2003/014490',
    councilName: 'Maharashtra Medical Council',
    hospitalAffiliation: 'CareBridge Metro Multi-Specialty Hospital',
    hospitalId: 'hosp-05',
    avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=80',
    about: 'Dedicated oncology surgeon specializing in gastrointestinal, breast, and thoracic oncological resections with organ preservation techniques.',
    areasOfExpertise: ['Breast Oncoplastic Surgery', 'GI Oncology', 'Thoracic Oncology', 'HIPEC Procedures'],
    languages: ['English', 'Marathi', 'Hindi'],
    consultationFee: 1500,
    rating: 4.93,
    reviewCount: 210,
    nextAvailableSlot: 'Thursday at 02:00 PM',
    consultationModes: ['in_person', 'teleconsultation'],
    availableDays: ['Mon', 'Tue', 'Thu', 'Fri'],
    availableSlots: ['02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM']
  },
  {
    id: 'doc-chatterjee',
    uid: 'doc-chatterjee',
    fullName: 'Dr. Sunita Chatterjee',
    title: 'Senior Consultant - Obstetrics & High-Risk Pregnancy',
    specialty: 'Obstetrics & Gynecology',
    qualifications: 'MBBS, MD (Obs & Gynae), FICOG',
    experienceYears: 16,
    registrationNumber: 'WBMC/2009/032210',
    councilName: 'West Bengal Medical Council',
    hospitalAffiliation: 'CareBridge Women & Children\'s Pavilion',
    hospitalId: 'hosp-03',
    avatarUrl: 'https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=400&auto=format&fit=crop&q=80',
    about: 'Specializes in high-risk pregnancy monitoring, minimally invasive laparoscopic gynecological surgery, PCOS management, and adolescent healthcare.',
    areasOfExpertise: ['High-Risk Pregnancy', 'Laparoscopic Hysterectomy', 'PCOS & Infertility', 'Antenatal Screening'],
    languages: ['English', 'Bengali', 'Hindi'],
    consultationFee: 850,
    rating: 4.89,
    reviewCount: 470,
    nextAvailableSlot: 'Tomorrow at 09:30 AM',
    consultationModes: ['in_person', 'teleconsultation'],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Sat'],
    availableSlots: ['09:30 AM', '10:30 AM', '11:30 AM', '03:30 PM', '04:30 PM']
  },
  {
    id: 'doc-gupta',
    uid: 'doc-gupta',
    fullName: 'Dr. Alok Gupta',
    title: 'Consultant Physician & Diabetologist',
    specialty: 'Internal & General Medicine',
    qualifications: 'MBBS, MD (General Medicine), PG Diploma in Diabetology',
    experienceYears: 14,
    registrationNumber: 'DMC/2011/055120',
    councilName: 'Delhi Medical Council',
    hospitalAffiliation: 'CareBridge Heart & Trauma Institute',
    hospitalId: 'hosp-02',
    avatarUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&auto=format&fit=crop&q=80',
    about: 'Expert physician addressing metabolic disorders, glycemic control in diabetic patients, hypertension titration, and acute seasonal febrile illnesses.',
    areasOfExpertise: ['Type 2 Diabetes', 'Hypertension Control', 'Geriatric Care', 'Infectious Diseases'],
    languages: ['English', 'Hindi', 'Tamil'],
    consultationFee: 500,
    rating: 4.81,
    reviewCount: 395,
    nextAvailableSlot: 'Today at 03:30 PM',
    consultationModes: ['in_person', 'teleconsultation'],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    availableSlots: ['09:00 AM', '10:00 AM', '02:30 PM', '03:30 PM', '04:30 PM']
  }
];

export const CORPORATE_MEDICINES: Medicine[] = [
  {
    id: 'med-01',
    brandName: 'Dolo 650',
    genericName: 'Paracetamol 650 mg',
    composition: 'Paracetamol IP 650mg',
    dosageForm: 'Tablet',
    strength: '650 mg',
    category: 'Pain & Analgesics',
    manufacturer: 'Micro Labs Ltd',
    price: 32.50,
    prescriptionRequired: false,
    usageInstructions: 'Take 1 tablet after meals every 6-8 hours as needed. Maximum 4 tablets in 24 hours.'
  },
  {
    id: 'med-02',
    brandName: 'Augmentin 625 Duo',
    genericName: 'Amoxicillin + Potassium Clavulanate',
    composition: 'Amoxicillin (500mg) + Clavulanic Acid (125mg)',
    dosageForm: 'Tablet',
    strength: '625 mg',
    category: 'Antibiotics',
    manufacturer: 'GlaxoSmithKline Pharmaceuticals Ltd',
    price: 204.00,
    prescriptionRequired: true,
    usageInstructions: 'Take 1 tablet twice daily with meals for 5-7 days or as prescribed.'
  },
  {
    id: 'med-03',
    brandName: 'Glycomet 500 SR',
    genericName: 'Metformin Hydrochloride (Sustained Release)',
    composition: 'Metformin Hydrochloride IP 500mg',
    dosageForm: 'Tablet',
    strength: '500 mg',
    category: 'Diabetic Care',
    manufacturer: 'USV Private Limited',
    price: 48.00,
    prescriptionRequired: true,
    usageInstructions: 'Take 1 tablet with evening meals to minimize gastrointestinal discomfort.'
  },
  {
    id: 'med-04',
    brandName: 'Telma 40',
    genericName: 'Telmisartan 40 mg',
    composition: 'Telmisartan IP 40mg',
    dosageForm: 'Tablet',
    strength: '40 mg',
    category: 'Cardiovascular',
    manufacturer: 'Glenmark Pharmaceuticals',
    price: 125.00,
    prescriptionRequired: true,
    usageInstructions: 'Take 1 tablet once daily in the morning with or without water.'
  },
  {
    id: 'med-05',
    brandName: 'Pan 40',
    genericName: 'Pantoprazole Sodium Gastro-resistant',
    composition: 'Pantoprazole Sodium IP 40mg',
    dosageForm: 'Tablet',
    strength: '40 mg',
    category: 'Gastrointestinal',
    manufacturer: 'Alkem Laboratories Ltd',
    price: 142.50,
    prescriptionRequired: false,
    usageInstructions: 'Take 1 tablet empty stomach in the morning 30 minutes before breakfast.'
  },
  {
    id: 'med-06',
    brandName: 'Atorva 20',
    genericName: 'Atorvastatin 20 mg',
    composition: 'Atorvastatin Calcium IP 20mg',
    dosageForm: 'Tablet',
    strength: '20 mg',
    category: 'Cardiovascular',
    manufacturer: 'Zydus Cadila',
    price: 185.00,
    prescriptionRequired: true,
    usageInstructions: 'Take 1 tablet daily at night before sleep.'
  },
  {
    id: 'med-07',
    brandName: 'Montair LC',
    genericName: 'Montelukast + Levocetirizine',
    composition: 'Montelukast Sodium (10mg) + Levocetirizine HCl (5mg)',
    dosageForm: 'Tablet',
    strength: '10 mg + 5 mg',
    category: 'Respiratory & Allergy',
    manufacturer: 'Cipla Ltd',
    price: 198.00,
    prescriptionRequired: true,
    usageInstructions: 'Take 1 tablet once daily at bedtime.'
  },
  {
    id: 'med-08',
    brandName: 'Budecort 200 Inhaler',
    genericName: 'Budesonide Inhalation Aerosol',
    composition: 'Budesonide IP 200 mcg per actuation',
    dosageForm: 'Inhaler',
    strength: '200 mcg',
    category: 'Respiratory & Allergy',
    manufacturer: 'Cipla Ltd',
    price: 345.00,
    prescriptionRequired: true,
    usageInstructions: 'Inhale 1-2 puffs twice daily through spacer; rinse mouth thoroughly after inhalation.'
  },
  {
    id: 'med-09',
    brandName: 'Volini Gel',
    genericName: 'Diclofenac Diethylamine + Methyl Salicylate',
    composition: 'Diclofenac Diethylamine 1.16% w/w',
    dosageForm: 'Ointment',
    strength: '30 g',
    category: 'Pain & Analgesics',
    manufacturer: 'Sun Pharmaceutical Industries Ltd',
    price: 110.00,
    prescriptionRequired: false,
    usageInstructions: 'Apply 3-4 times a day gently on the affected area. Wash hands after use.'
  },
  {
    id: 'med-10',
    brandName: 'Lantus Solostar Pen',
    genericName: 'Insulin Glargine',
    composition: 'Insulin Glargine 100 Units/ml',
    dosageForm: 'Injection',
    strength: '100 IU/ml',
    category: 'Diabetic Care',
    manufacturer: 'Sanofi India Ltd',
    price: 620.00,
    prescriptionRequired: true,
    usageInstructions: 'Inject subcutaneously once daily at the same time each day.'
  }
];

export const CORPORATE_PHARMACIES: Pharmacy[] = [
  {
    id: 'ph-01',
    name: 'CareBridge 24x7 In-Hospital Pharmacy',
    address: 'Ground Floor, CareBridge Apex Super-Specialty Hospital, Outer Ring Road',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    pincode: '560103',
    phone: '+91 80 4910 2150',
    coordinates: { lat: 12.9299, lng: 77.6849 },
    distanceKm: 0.2,
    open24x7: true,
    openingHours: '24 Hours / 7 Days',
    rating: 4.9
  },
  {
    id: 'ph-02',
    name: 'Apollo Pharmacy - Ring Road Junction',
    address: 'Shop 4, Outer Ring Road, Near EcoWorld',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    pincode: '560103',
    phone: '+91 80 2574 1120',
    coordinates: { lat: 12.9280, lng: 77.6810 },
    distanceKm: 0.9,
    open24x7: true,
    openingHours: '24 Hours / 7 Days',
    rating: 4.7
  },
  {
    id: 'ph-03',
    name: 'MedPlus Health Services - Bellandur Lake Rd',
    address: 'Plot 12, Bellandur Lake Road',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    pincode: '560103',
    phone: '+91 80 4122 8890',
    coordinates: { lat: 12.9320, lng: 77.6770 },
    distanceKm: 1.6,
    open24x7: false,
    openingHours: '07:30 AM - 11:30 PM',
    rating: 4.6
  },
  {
    id: 'ph-04',
    name: 'Wellness Forever Chemists & Superstore',
    address: 'Block A, Central Boulevard, Sarjapur Road',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    pincode: '560102',
    phone: '+91 80 6712 9900',
    coordinates: { lat: 12.9210, lng: 77.6720 },
    distanceKm: 2.8,
    open24x7: true,
    openingHours: '24 Hours / 7 Days',
    rating: 4.8
  }
];

export const CORPORATE_INVENTORY: MedicineInventory[] = [
  {
    id: 'inv-01',
    pharmacyId: 'ph-01',
    pharmacyName: 'CareBridge 24x7 In-Hospital Pharmacy',
    pharmacyAddress: 'Outer Ring Road, Bellandur, Bengaluru',
    pharmacyPhone: '+91 80 4910 2150',
    distanceKm: 0.2,
    medicineId: 'med-01',
    medicineName: 'Dolo 650',
    genericName: 'Paracetamol 650 mg',
    dosageForm: 'Tablet',
    status: 'IN_STOCK',
    quantity: 450,
    unitPrice: 32.50,
    lastUpdated: '2026-09-20T10:00:00Z'
  },
  {
    id: 'inv-02',
    pharmacyId: 'ph-02',
    pharmacyName: 'Apollo Pharmacy - Ring Road Junction',
    pharmacyAddress: 'Outer Ring Road, Near EcoWorld, Bengaluru',
    pharmacyPhone: '+91 80 2574 1120',
    distanceKm: 0.9,
    medicineId: 'med-01',
    medicineName: 'Dolo 650',
    genericName: 'Paracetamol 650 mg',
    dosageForm: 'Tablet',
    status: 'IN_STOCK',
    quantity: 120,
    unitPrice: 33.00,
    lastUpdated: '2026-09-20T09:30:00Z'
  },
  {
    id: 'inv-03',
    pharmacyId: 'ph-01',
    pharmacyName: 'CareBridge 24x7 In-Hospital Pharmacy',
    pharmacyAddress: 'Outer Ring Road, Bellandur, Bengaluru',
    pharmacyPhone: '+91 80 4910 2150',
    distanceKm: 0.2,
    medicineId: 'med-02',
    medicineName: 'Augmentin 625 Duo',
    genericName: 'Amoxicillin + Potassium Clavulanate',
    dosageForm: 'Tablet',
    status: 'IN_STOCK',
    quantity: 85,
    unitPrice: 204.00,
    lastUpdated: '2026-09-20T10:00:00Z'
  },
  {
    id: 'inv-04',
    pharmacyId: 'ph-02',
    pharmacyName: 'Apollo Pharmacy - Ring Road Junction',
    pharmacyAddress: 'Outer Ring Road, Near EcoWorld, Bengaluru',
    pharmacyPhone: '+91 80 2574 1120',
    distanceKm: 0.9,
    medicineId: 'med-02',
    medicineName: 'Augmentin 625 Duo',
    genericName: 'Amoxicillin + Potassium Clavulanate',
    dosageForm: 'Tablet',
    status: 'LOW_STOCK',
    quantity: 12,
    unitPrice: 208.00,
    lastUpdated: '2026-09-20T09:30:00Z'
  },
  {
    id: 'inv-05',
    pharmacyId: 'ph-03',
    pharmacyName: 'MedPlus Health Services - Bellandur Lake Rd',
    pharmacyAddress: 'Bellandur Lake Road, Bengaluru',
    pharmacyPhone: '+91 80 4122 8890',
    distanceKm: 1.6,
    medicineId: 'med-02',
    medicineName: 'Augmentin 625 Duo',
    genericName: 'Amoxicillin + Potassium Clavulanate',
    dosageForm: 'Tablet',
    status: 'OUT_OF_STOCK',
    quantity: 0,
    unitPrice: 204.00,
    lastUpdated: '2026-09-20T08:00:00Z'
  },
  {
    id: 'inv-06',
    pharmacyId: 'ph-01',
    pharmacyName: 'CareBridge 24x7 In-Hospital Pharmacy',
    pharmacyAddress: 'Outer Ring Road, Bellandur, Bengaluru',
    pharmacyPhone: '+91 80 4910 2150',
    distanceKm: 0.2,
    medicineId: 'med-03',
    medicineName: 'Glycomet 500 SR',
    genericName: 'Metformin Hydrochloride (Sustained Release)',
    dosageForm: 'Tablet',
    status: 'IN_STOCK',
    quantity: 210,
    unitPrice: 48.00,
    lastUpdated: '2026-09-20T10:00:00Z'
  },
  {
    id: 'inv-07',
    pharmacyId: 'ph-01',
    pharmacyName: 'CareBridge 24x7 In-Hospital Pharmacy',
    pharmacyAddress: 'Outer Ring Road, Bellandur, Bengaluru',
    pharmacyPhone: '+91 80 4910 2150',
    distanceKm: 0.2,
    medicineId: 'med-04',
    medicineName: 'Telma 40',
    genericName: 'Telmisartan 40 mg',
    dosageForm: 'Tablet',
    status: 'IN_STOCK',
    quantity: 140,
    unitPrice: 125.00,
    lastUpdated: '2026-09-20T10:00:00Z'
  },
  {
    id: 'inv-08',
    pharmacyId: 'ph-02',
    pharmacyName: 'Apollo Pharmacy - Ring Road Junction',
    pharmacyAddress: 'Outer Ring Road, Near EcoWorld, Bengaluru',
    pharmacyPhone: '+91 80 2574 1120',
    distanceKm: 0.9,
    medicineId: 'med-04',
    medicineName: 'Telma 40',
    genericName: 'Telmisartan 40 mg',
    dosageForm: 'Tablet',
    status: 'LOW_STOCK',
    quantity: 15,
    unitPrice: 127.00,
    lastUpdated: '2026-09-20T09:30:00Z'
  },
  {
    id: 'inv-09',
    pharmacyId: 'ph-01',
    pharmacyName: 'CareBridge 24x7 In-Hospital Pharmacy',
    pharmacyAddress: 'Outer Ring Road, Bellandur, Bengaluru',
    pharmacyPhone: '+91 80 4910 2150',
    distanceKm: 0.2,
    medicineId: 'med-08',
    medicineName: 'Budecort 200 Inhaler',
    genericName: 'Budesonide Inhalation Aerosol',
    dosageForm: 'Inhaler',
    status: 'IN_STOCK',
    quantity: 25,
    unitPrice: 345.00,
    lastUpdated: '2026-09-20T10:00:00Z'
  },
  {
    id: 'inv-10',
    pharmacyId: 'ph-01',
    pharmacyName: 'CareBridge 24x7 In-Hospital Pharmacy',
    pharmacyAddress: 'Outer Ring Road, Bellandur, Bengaluru',
    pharmacyPhone: '+91 80 4910 2150',
    distanceKm: 0.2,
    medicineId: 'med-10',
    medicineName: 'Lantus Solostar Pen',
    genericName: 'Insulin Glargine',
    dosageForm: 'Injection',
    status: 'LOW_STOCK',
    quantity: 8,
    unitPrice: 620.00,
    lastUpdated: '2026-09-20T10:00:00Z'
  }
];

export const CORPORATE_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-001',
    bookingReference: 'CB-2026-99412',
    patientId: 'pat-ramesh',
    patientName: 'Ramesh Kumar',
    patientPhone: '+91 94150 12345',
    doctorId: 'doc-sharma',
    doctorName: 'Dr. Anita Sharma',
    doctorSpecialty: 'Cardiology',
    doctorAvatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
    hospitalId: 'hosp-01',
    hospitalName: 'CareBridge Apex Super-Specialty Hospital',
    hospitalAddress: '42 Outer Ring Road, Bellandur, Bengaluru',
    date: '2026-09-24',
    timeSlot: '10:30 AM',
    type: 'in_person',
    status: 'confirmed',
    fee: 800,
    paymentStatus: 'paid',
    notes: 'Quarterly review for hypertension and glycemic monitoring. Token CB-14.',
    createdAt: '2026-09-20T08:00:00Z'
  },
  {
    id: 'apt-002',
    bookingReference: 'CB-2026-99384',
    patientId: 'pat-ramesh',
    patientName: 'Ramesh Kumar',
    patientPhone: '+91 94150 12345',
    doctorId: 'doc-verma',
    doctorName: 'Dr. Rajesh Verma',
    doctorSpecialty: 'Orthopedics & Joint Care',
    doctorAvatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
    hospitalId: 'hosp-05',
    hospitalName: 'CareBridge Metro Multi-Specialty Hospital',
    hospitalAddress: 'Link Road, Andheri West, Mumbai',
    date: '2026-09-22',
    timeSlot: '04:00 PM',
    type: 'teleconsultation',
    status: 'confirmed',
    fee: 700,
    paymentStatus: 'paid',
    notes: 'Bilateral knee stiffness evaluation. Teleconsultation video session.',
    createdAt: '2026-09-19T14:20:00Z'
  },
  {
    id: 'apt-003',
    bookingReference: 'CB-2026-98210',
    patientId: 'pat-sunita',
    patientName: 'Sunita Devi',
    patientPhone: '+91 94150 67890',
    doctorId: 'doc-chatterjee',
    doctorName: 'Dr. Sunita Chatterjee',
    doctorSpecialty: 'Obstetrics & Gynecology',
    doctorAvatarUrl: 'https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=400&auto=format&fit=crop&q=80',
    hospitalId: 'hosp-03',
    hospitalName: 'CareBridge Women & Children\'s Pavilion',
    hospitalAddress: '18 Institutional Area, Sheikh Sarai, New Delhi',
    date: '2026-09-23',
    timeSlot: '11:00 AM',
    type: 'in_person',
    status: 'confirmed',
    fee: 850,
    paymentStatus: 'paid',
    notes: 'Third trimester routine antenatal checkup. Token CB-08.',
    createdAt: '2026-09-18T10:00:00Z'
  }
];

export const CORPORATE_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'rx-9901',
    appointmentId: 'apt-001',
    patientId: 'pat-ramesh',
    patientName: 'Ramesh Kumar',
    patientAge: 52,
    patientGender: 'Male',
    doctorId: 'doc-sharma',
    doctorName: 'Dr. Anita Sharma',
    doctorRegistration: 'MCI/UP/2012/048821',
    doctorSpecialty: 'Cardiology',
    hospitalName: 'CareBridge Apex Super-Specialty Hospital',
    date: '2026-08-15',
    diagnosis: ['Primary Essential Hypertension (Stage 1)', 'Type 2 Diabetes Mellitus (Managed)'],
    vitals: {
      bloodPressure: '128/82 mmHg',
      pulseBpm: 72,
      spo2: 98,
      temperatureF: 98.4
    },
    medicines: [
      {
        id: 'rx-m1',
        medicineName: 'Telma 40 (Telmisartan 40mg)',
        dosage: '1 Tablet',
        frequency: 'Once Daily (Morning)',
        duration: '90 Days',
        instructions: 'Take in the morning after breakfast with water.'
      },
      {
        id: 'rx-m2',
        medicineName: 'Glycomet 500 SR (Metformin 500mg)',
        dosage: '1 Tablet',
        frequency: 'Twice Daily (Morning & Night)',
        duration: '90 Days',
        instructions: 'Take immediately with meals.'
      }
    ],
    advice: 'Restrict dietary sodium to under 3g/day. 30 minutes of brisk morning walking. Monitor fasting glucose weekly.',
    followUpDate: '2026-11-15',
    doctorSignatureStamp: 'SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    createdAt: '2026-08-15T11:45:00Z'
  }
];

export const CORPORATE_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-01',
    userId: 'pat-ramesh',
    title: 'Upcoming Cardiology Appointment',
    message: 'Your in-person consultation with Dr. Anita Sharma is scheduled for Sep 24, 10:30 AM at CareBridge Apex Hospital. Token: CB-14.',
    category: 'appointment',
    read: false,
    actionUrl: '/appointments',
    createdAt: '2026-09-20T08:05:00Z'
  },
  {
    id: 'notif-02',
    userId: 'pat-ramesh',
    title: 'Teleconsultation Video Link Active',
    message: 'Your video room link with Dr. Rajesh Verma is ready. Consultation starts tomorrow at 04:00 PM.',
    category: 'teleconsult',
    read: false,
    actionUrl: '/teleconsult/CB-ROOM-99384',
    createdAt: '2026-09-19T14:22:00Z'
  },
  {
    id: 'notif-03',
    userId: 'pat-ramesh',
    title: 'Digital Prescription Available',
    message: 'Dr. Anita Sharma has issued your updated 90-day maintenance prescription. View or print anytime.',
    category: 'prescription',
    read: true,
    actionUrl: '/prescriptions/rx-9901',
    createdAt: '2026-08-15T11:45:00Z'
  },
  {
    id: 'notif-04',
    userId: 'pat-ramesh',
    title: 'Security Alert: Access Verified',
    message: 'Clinical record access was securely authenticated by Dr. Anita Sharma during your OPD encounter.',
    category: 'security',
    read: true,
    actionUrl: '/patient/consents',
    createdAt: '2026-08-15T11:30:00Z'
  }
];



