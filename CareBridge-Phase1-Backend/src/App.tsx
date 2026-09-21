import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/navigation/Navbar';
import { LandingPage } from './pages/landing/LandingPage';
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
import { HeartHandshake, ShieldCheck } from 'lucide-react';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
        <Navbar />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/navigator" element={<GuidedCareNavigator />} />
            <Route path="/patient" element={<PatientDashboard />} />
            <Route path="/patient/records" element={<MedicalRecordsPage />} />
            <Route path="/patient/continuity" element={<CareContinuityPage />} />
            <Route path="/patient/upload" element={<DocumentUploadPage />} />
            <Route path="/patient/consents" element={<DoctorConsentsPage />} />
            <Route path="/coordination" element={<CareCoordinationPage />} />
            <Route path="/doctor" element={<DoctorDashboard />} />
            <Route path="/doctor/note" element={<AddClinicalNotePage />} />
            <Route path="/emergency" element={<EmergencyPortalPage />} />
            <Route path="/facilities" element={<FacilityFinderPage />} />
            <Route path="/admin" element={<AdminAuditPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <footer className="bg-white border-t border-slate-200 py-6 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-800">CareBridge</span>
              <span className="text-teal-700 font-semibold">• Connected Care. Anywhere.</span>
              <span>— SIH26133</span>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <span>National Health Mission Aligned</span>
              <span>•</span>
              <span>Doctor-Centered Clinical Authority</span>
              <span>•</span>
              <span>Audited Emergency Access</span>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;
