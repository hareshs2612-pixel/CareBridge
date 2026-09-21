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
  GranularSharingConsent
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

