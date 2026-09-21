import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Navbar } from './components/navigation/Navbar';
import { MobileNavigation } from './components/navigation/MobileNavigation';
import { LandingPage } from './pages/landing/LandingPage';
import { DoctorDiscoveryPage } from './pages/doctors/DoctorDiscoveryPage';
import { DoctorProfilePage } from './pages/doctors/DoctorProfilePage';
import { AppointmentBookingPage } from './pages/appointments/AppointmentBookingPage';
import { AppointmentDashboardPage } from './pages/appointments/AppointmentDashboardPage';
import { HospitalDetailPage } from './pages/facilities/HospitalDetailPage';
import { TeleconsultationPage } from './pages/teleconsultation/TeleconsultationPage';
import { PharmacyPage } from './pages/pharmacy/PharmacyPage';
import { PrescriptionViewPage } from './pages/prescriptions/PrescriptionViewPage';
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { MedicalRecordsPage } from './pages/patient/MedicalRecordsPage';
import { DocumentUploadPage } from './pages/patient/DocumentUploadPage';
import { DoctorConsentsPage } from './pages/patient/DoctorConsentsPage';
import { CareContinuityPage } from './pages/patient/CareContinuityPage';
import { GuidedCareNavigator } from './pages/navigator/GuidedCareNavigator';
import { CareCoordinationPage } from './pages/coordination/CareCoordinationPage';
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { AddClinicalNotePage } from './pages/doctor/AddClinicalNotePage';
import { EmergencyPortalPage } from './pages/emergency/EmergencyPortalPage';
import { FacilityFinderPage } from './pages/facilities/FacilityFinderPage';
import { AdminAuditPage } from './pages/admin/AdminAuditPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { 
  HeartHandshake, 
  ShieldCheck, 
  Phone, 
  Building2, 
  Stethoscope, 
  Calendar, 
  Video, 
  Pill, 
  Lock,
  Award
} from 'lucide-react';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 pb-16 sm:pb-0">
        <Navbar />

        <main className="flex-1">
          <Routes>
            {/* Corporate Public Discovery */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/doctors" element={<DoctorDiscoveryPage />} />
            <Route path="/doctors/:id" element={<DoctorProfilePage />} />
            <Route path="/appointments/book" element={<AppointmentBookingPage />} />
            <Route path="/facilities" element={<FacilityFinderPage />} />
            <Route path="/facilities/:id" element={<HospitalDetailPage />} />
            <Route path="/teleconsult" element={<TeleconsultationPage />} />
            <Route path="/pharmacy" element={<PharmacyPage />} />
            <Route path="/prescriptions" element={<PrescriptionViewPage />} />
            <Route path="/prescriptions/:id" element={<PrescriptionViewPage />} />
            <Route path="/navigator" element={<GuidedCareNavigator />} />
            <Route path="/emergency" element={<EmergencyPortalPage />} />
            
            {/* Appointments Management */}
            <Route path="/appointments" element={<AppointmentDashboardPage />} />

            {/* Patient Routes - Protected */}
            <Route path="/patient" element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            } />
            <Route path="/patient/records" element={
              <ProtectedRoute allowedRoles={['patient']}>
                <MedicalRecordsPage />
              </ProtectedRoute>
            } />
            <Route path="/patient/continuity" element={
              <ProtectedRoute allowedRoles={['patient']}>
                <CareContinuityPage />
              </ProtectedRoute>
            } />
            <Route path="/patient/upload" element={
              <ProtectedRoute allowedRoles={['patient']}>
                <DocumentUploadPage />
              </ProtectedRoute>
            } />
            <Route path="/patient/consents" element={
              <ProtectedRoute allowedRoles={['patient']}>
                <DoctorConsentsPage />
              </ProtectedRoute>
            } />

            {/* Coordination Routes */}
            <Route path="/coordination" element={
              <ProtectedRoute allowedRoles={['frontline_worker', 'doctor', 'patient']}>
                <CareCoordinationPage />
              </ProtectedRoute>
            } />

            {/* Doctor Routes - Protected */}
            <Route path="/doctor" element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/doctor/note" element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <AddClinicalNotePage />
              </ProtectedRoute>
            } />

            {/* Admin Audit */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminAuditPage />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global Corporate Footer */}
        <footer className="bg-cb-navy text-white pt-12 pb-8 border-t border-slate-800 text-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
              
              {/* Brand Col (2 cols) */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-cb-blue flex items-center justify-center text-white shadow-xs">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xl font-black tracking-tight text-white">CareBridge</span>
                    <span className="text-xs text-blue-300 font-bold block -mt-1 tracking-wider uppercase">
                      HEALTHCARE NETWORK
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 max-w-sm leading-relaxed">
                  CareBridge is an accredited quaternary healthcare ecosystem connecting patients to distinguished clinical specialists, advanced surgical facilities, 24x7 trauma care, and verified pharmacy delivery.
                </p>

                <div className="flex flex-wrap gap-2 text-[11px] text-slate-300">
                  <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> NABH Accredited
                  </span>
                  <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                    <Award className="w-3.5 h-3.5 text-amber-400" /> JCI Gold Quality
                  </span>
                  <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                    <Lock className="w-3.5 h-3.5 text-blue-400" /> ABDM M1-M3 Ready
                  </span>
                </div>
              </div>

              {/* Quick Pathways */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300">Clinical Services</h4>
                <ul className="space-y-2 text-slate-300 text-xs">
                  <li><Link to="/doctors" className="hover:text-white transition">Find Specialist Doctors</Link></li>
                  <li><Link to="/facilities" className="hover:text-white transition">Hospitals & Trauma Centers</Link></li>
                  <li><Link to="/teleconsult" className="hover:text-white transition">Online Video Consultations</Link></li>
                  <li><Link to="/pharmacy" className="hover:text-white transition">24x7 Medicine Delivery</Link></li>
                  <li><Link to="/prescriptions" className="hover:text-white transition">Digital Prescriptions</Link></li>
                  <li><Link to="/navigator" className="hover:text-white transition">Care Pathway Navigator</Link></li>
                </ul>
              </div>

              {/* Portals & Records */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300">Patient & Doctor</h4>
                <ul className="space-y-2 text-slate-300 text-xs">
                  <li><Link to="/appointments" className="hover:text-white transition">Manage Appointments</Link></li>
                  <li><Link to="/patient" className="hover:text-white transition">Patient Health Dashboard</Link></li>
                  <li><Link to="/patient/records" className="hover:text-white transition">Longitudinal Records (EHR)</Link></li>
                  <li><Link to="/doctor" className="hover:text-white transition">Physician Practice Portal</Link></li>
                  <li><Link to="/emergency" className="hover:text-white transition">Emergency Trauma Override</Link></li>
                  <li><Link to="/admin" className="hover:text-white transition">Security & Audit Logs</Link></li>
                </ul>
              </div>

              {/* 24x7 Emergency Contact Box */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300">24x7 Emergency Hotline</h4>
                <div className="bg-white/10 border border-white/15 rounded-2xl p-4 space-y-2.5">
                  <a
                    href="tel:1066"
                    className="flex items-center gap-2 text-lg font-black text-white hover:text-rose-300 transition"
                  >
                    <Phone className="w-5 h-5 text-rose-400 animate-pulse" />
                    <span>1066 (Toll-Free)</span>
                  </a>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    Dedicated Trauma Care, Critical Ambulance Dispatch, and Emergency Bed Coordination.
                  </p>
                  <div className="pt-1 text-[10px] text-slate-400 border-t border-white/10">
                    National Helpline: 112 • Ambulance: 108
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Disclaimer & Copyright */}
            <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
              <p>© {new Date().getFullYear()} CareBridge Healthcare Systems. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <span>Privacy & ABDM Security</span>
                <span>•</span>
                <span>Clinical Governance</span>
                <span>•</span>
                <span>Terms of Medical Service</span>
              </div>
            </div>
          </div>
        </footer>

        {/* Mobile Fixed Bottom Navigation */}
        <MobileNavigation />
      </div>
    </BrowserRouter>
  );
};

export default App;
