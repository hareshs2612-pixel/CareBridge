-- =============================================================================
-- CAREBRIDGE PRODUCTION HEALTHCARE DATABASE SCHEMA (POSTGRESQL / SUPABASE)
-- =============================================================================
-- Supports enterprise multi-specialty clinical workflows, doctor discovery,
-- appointments, teleconsultations, medicine inventory, prescriptions, and PHR.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Core Users & Profiles
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uid TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'admin', 'facility_manager')),
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  patient_uid TEXT UNIQUE NOT NULL,
  dob DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  blood_group TEXT,
  abha_id TEXT UNIQUE,
  emergency_contacts JSONB DEFAULT '[]'::jsonb,
  chronic_conditions JSONB DEFAULT '[]'::jsonb,
  allergies JSONB DEFAULT '[]'::jsonb,
  emergency_minimum_dataset JSONB DEFAULT '{}'::jsonb,
  address JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Medical Specialties
CREATE TABLE IF NOT EXISTS public.doctor_specialties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon_name TEXT,
  common_symptoms TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Hospitals & Healthcare Facilities
CREATE TABLE IF NOT EXISTS public.hospitals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- e.g. "Tertiary Multi-Specialty Hospital"
  tagline TEXT,
  overview TEXT,
  image_url TEXT,
  address TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  phone TEXT NOT NULL,
  emergency_contact TEXT NOT NULL,
  emergency_24x7 BOOLEAN NOT NULL DEFAULT TRUE,
  icu_beds INT NOT NULL DEFAULT 0,
  opening_hours TEXT NOT NULL DEFAULT '24 Hours / 7 Days',
  rating NUMERIC(3, 2) DEFAULT 4.8,
  review_count INT DEFAULT 0,
  departments TEXT[] DEFAULT '{}',
  services TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hospital_departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  head_of_department TEXT,
  bed_count INT DEFAULT 0,
  description TEXT
);

-- 4. Doctors & Clinical Credentials
CREATE TABLE IF NOT EXISTS public.doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  doctor_uid TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  title TEXT NOT NULL,
  specialty TEXT NOT NULL,
  qualifications TEXT NOT NULL,
  experience_years INT NOT NULL DEFAULT 0,
  registration_number TEXT NOT NULL,
  council_name TEXT NOT NULL,
  primary_hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL,
  primary_hospital_name TEXT NOT NULL,
  avatar_url TEXT,
  about TEXT,
  areas_of_expertise TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  consultation_fee INT NOT NULL DEFAULT 500,
  rating NUMERIC(3, 2) DEFAULT 4.9,
  review_count INT DEFAULT 0,
  consultation_modes TEXT[] DEFAULT '{in_person,teleconsultation}',
  verified_by_admin BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.doctor_hospital_affiliations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'Visiting Consultant',
  consulting_days TEXT[] DEFAULT '{}',
  consulting_hours TEXT DEFAULT '10:00 AM - 01:00 PM',
  UNIQUE (doctor_id, hospital_id)
);

CREATE TABLE IF NOT EXISTS public.doctor_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL, -- e.g. "Monday", "Tuesday"
  slot_start_time TIME NOT NULL,
  slot_end_time TIME NOT NULL,
  slot_duration_minutes INT DEFAULT 15,
  consultation_type TEXT NOT NULL CHECK (consultation_type IN ('in_person', 'teleconsultation', 'both')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 5. Appointments & Teleconsultations
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_reference TEXT UNIQUE NOT NULL, -- e.g. "CB-2026-89412"
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  patient_phone TEXT NOT NULL,
  patient_age INT,
  patient_gender TEXT,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  doctor_name TEXT NOT NULL,
  doctor_specialty TEXT NOT NULL,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL,
  hospital_name TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  appointment_type TEXT NOT NULL CHECK (appointment_type IN ('in_person', 'teleconsultation')),
  status TEXT NOT NULL CHECK (status IN ('confirmed', 'pending', 'completed', 'cancelled', 'rescheduled', 'no_show')) DEFAULT 'confirmed',
  fee INT NOT NULL DEFAULT 500,
  payment_status TEXT NOT NULL CHECK (payment_status IN ('paid', 'pay_at_hospital', 'free')) DEFAULT 'pay_at_hospital',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Prevent double booking on the same doctor at the same slot and date:
  UNIQUE (doctor_id, appointment_date, time_slot)
);

CREATE TABLE IF NOT EXISTS public.teleconsultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID UNIQUE NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('waiting', 'in_progress', 'completed', 'missed')) DEFAULT 'waiting',
  room_url TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TEXT NOT NULL,
  meeting_notes TEXT,
  prescription_id UUID,
  joined_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Medicines, Pharmacies & Live Inventory
CREATE TABLE IF NOT EXISTS public.medicines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_name TEXT NOT NULL,
  generic_name TEXT NOT NULL,
  composition TEXT NOT NULL,
  dosage_form TEXT NOT NULL CHECK (dosage_form IN ('Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Drops', 'Inhaler')),
  strength TEXT NOT NULL,
  category TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  price NUMERIC(8, 2) NOT NULL,
  prescription_required BOOLEAN NOT NULL DEFAULT TRUE,
  usage_instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pharmacies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  phone TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  open_24x7 BOOLEAN NOT NULL DEFAULT FALSE,
  opening_hours TEXT NOT NULL DEFAULT '08:00 AM - 10:00 PM',
  rating NUMERIC(3, 2) DEFAULT 4.7,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.medicine_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pharmacy_id UUID NOT NULL REFERENCES public.pharmacies(id) ON DELETE CASCADE,
  medicine_id UUID NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK')) DEFAULT 'IN_STOCK',
  quantity INT NOT NULL DEFAULT 0,
  unit_price NUMERIC(8, 2) NOT NULL,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (pharmacy_id, medicine_id)
);

-- 7. Prescriptions & Items
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  doctor_name TEXT NOT NULL,
  doctor_registration TEXT NOT NULL,
  doctor_specialty TEXT NOT NULL,
  hospital_name TEXT NOT NULL,
  prescription_date DATE NOT NULL DEFAULT CURRENT_DATE,
  diagnosis TEXT[] DEFAULT '{}',
  vitals JSONB DEFAULT '{}'::jsonb,
  advice TEXT,
  follow_up_date DATE,
  doctor_signature_stamp TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.prescription_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prescription_id UUID NOT NULL REFERENCES public.prescriptions(id) ON DELETE CASCADE,
  medicine_name TEXT NOT NULL,
  generic_name TEXT,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration TEXT NOT NULL,
  instructions TEXT
);

-- 8. Personal Health Records & Documents
CREATE TABLE IF NOT EXISTS public.medical_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('clinical_note', 'lab_report', 'prescription', 'discharge_summary', 'radiology', 'patient_log')),
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL,
  facility_name TEXT,
  source TEXT NOT NULL,
  clinical_summary TEXT,
  diagnosis TEXT[] DEFAULT '{}',
  treatment_plan TEXT,
  is_sensitive BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.medical_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  record_id UUID REFERENCES public.medical_records(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INT NOT NULL,
  storage_path TEXT NOT NULL,
  sha256_hash TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Patient Health Self-Reports ("How are you feeling today?")
CREATE TABLE IF NOT EXISTS public.patient_self_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  overall_status TEXT NOT NULL CHECK (overall_status IN ('better', 'same', 'worse')),
  pain_scale INT NOT NULL CHECK (pain_scale BETWEEN 0 AND 10),
  symptoms TEXT[] DEFAULT '{}',
  wellness_score INT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Notifications & Security Audit
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('appointment', 'teleconsult', 'prescription', 'security', 'system')),
  read BOOLEAN NOT NULL DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  patient_id TEXT,
  doctor_id TEXT,
  details TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- INDEXES FOR FAST COMMON QUERIES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON public.doctors(specialty);
CREATE INDEX IF NOT EXISTS idx_doctors_hospital ON public.doctors(primary_hospital_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON public.appointments(patient_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON public.appointments(doctor_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_medicine_name ON public.medicines(brand_name, generic_name);
CREATE INDEX IF NOT EXISTS idx_inventory_pharmacy ON public.medicine_inventory(pharmacy_id, status);
CREATE INDEX IF NOT EXISTS idx_records_patient ON public.medical_records(patient_id, record_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, read);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teleconsultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Patients can view and manage their own profiles:
CREATE POLICY patient_self_access ON public.patients
  FOR ALL USING (auth.uid() = user_id);

-- Appointments access for patient or attending doctor:
CREATE POLICY appointment_participant_access ON public.appointments
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM public.patients WHERE id = patient_id
      UNION
      SELECT user_id FROM public.doctors WHERE id = doctor_id
    )
  );

-- Medical records access strictly controlled:
CREATE POLICY medical_records_patient_access ON public.medical_records
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM public.patients WHERE id = patient_id)
  );
