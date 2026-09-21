import React, { useState, useEffect } from 'react';
import { dataStore } from '../../services/dataStore';
import { geminiService } from '../../services/geminiService';
import { 
  UserProfile, 
  DoctorProfile, 
  PatientProfile, 
  HealthRecord 
} from '../../types';
import { AISummaryCard } from '../../components/ai/AISummaryCard';
import { LongitudinalTimeline } from '../../components/records/LongitudinalTimeline';
import { VitalsDisplay } from '../../components/common/VitalsDisplay';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Stethoscope, 
  Users, 
  Search, 
  ShieldAlert, 
  FileText, 
  PlusCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Lock, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserProfile>(dataStore.getCurrentUser());
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | undefined>(dataStore.getDoctorById(currentUser.uid));
  const [authorizedPatientIds, setAuthorizedPatientIds] = useState<string[]>([]);
  const [allPatients, setAllPatients] = useState<Record<string, PatientProfile>>(dataStore.getPatients());
  const [users, setUsers] = useState<UserProfile[]>(dataStore.getUsers());
  
  // Selected Patient for detailed review
  const [selectedPatientId, setSelectedPatientId] = useState<string>('pat-ramesh');
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [aiSummary, setAiSummary] = useState<any | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = () => {
    const user = dataStore.getCurrentUser();
    setCurrentUser(user);
    const doc = dataStore.getDoctorById(user.uid);
    setDoctorProfile(doc);
    const authed = dataStore.getAuthorizedPatientsForDoctor(user.uid);
    setAuthorizedPatientIds(authed);
    setAllPatients(dataStore.getPatients());
    setUsers(dataStore.getUsers());

    // Fetch records if patient is authorized
    if (selectedPatientId) {
      setRecords(dataStore.getRecordsForPatient(selectedPatientId));
    }
  };

  useEffect(() => {
    loadData();
    return dataStore.subscribe(loadData);
  }, [selectedPatientId]);

  // Trigger AI summarization when selected patient changes
  useEffect(() => {
    const activePatient = allPatients[selectedPatientId];
    const isAuthed = dataStore.hasDoctorAccess(selectedPatientId, currentUser.uid);

    if (activePatient && isAuthed) {
      setLoadingSummary(true);
      const patientRecords = dataStore.getRecordsForPatient(selectedPatientId);
      geminiService.summarizeLongitudinalHistory(activePatient, patientRecords)
        .then(summary => setAiSummary(summary))
        .catch(err => console.error(err))
        .finally(() => setLoadingSummary(false));
    } else {
      setAiSummary(null);
    }
  }, [selectedPatientId, currentUser.uid]);

  const activePatient = allPatients[selectedPatientId];
  const activePatientUser = users.find(u => u.uid === selectedPatientId);
  const hasLegitimateAccess = dataStore.hasDoctorAccess(selectedPatientId, currentUser.uid);

  // Patients that can be selected
  const availablePatients = users.filter(u => u.role === 'patient');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Role Notice when non-doctor explores doctor portal */}
      {currentUser.role !== 'doctor' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <span className="font-bold">Active Persona Notice: </span>
              You are currently logged in as <strong>{currentUser.fullName} ({currentUser.role.toUpperCase()})</strong>.
              Switch to a doctor persona to experience authorized clinical encounter review and prescription workflows.
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => dataStore.setCurrentUser('doc-sharma')}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition shadow-sm"
            >
              Switch to Dr. Anita Sharma
            </button>
            <button
              onClick={() => dataStore.setCurrentUser('doc-verma')}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition"
            >
              Dr. Rajesh Verma
            </button>
          </div>
        </div>
      )}

      {/* Doctor Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center text-white text-xl font-bold shadow-inner">
              <Stethoscope className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black">{currentUser.fullName}</h1>
                <span className="bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  {doctorProfile?.specialization || 'Clinical Physician'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300 mt-1">
                <span>Facility: <strong>{doctorProfile?.hospitalAffiliation || 'Public Health Centre'}</strong></span>
                <span>• NMC/State Reg: <strong className="font-mono">{doctorProfile?.registrationNumber}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/doctor/note"
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              New Clinical Encounter
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Patient Selector Sidebar + Longitudinal Chart Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Patient Roster (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-600" />
                Patient Selection
              </h3>
              <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                {authorizedPatientIds.length} Authorized
              </span>
            </div>

            {/* Notice explaining Authorization Rule */}
            <p className="text-[11px] text-slate-500 leading-snug">
              Select a patient to inspect their longitudinal record. Only patients who have authorized you will allow record access.
            </p>

            <div className="space-y-2 pt-1">
              {availablePatients.map(pat => {
                const isSelected = pat.uid === selectedPatientId;
                const isAuthed = authorizedPatientIds.includes(pat.uid);

                return (
                  <button
                    key={pat.uid}
                    onClick={() => setSelectedPatientId(pat.uid)}
                    className={`w-full text-left p-3 rounded-xl transition border flex items-start justify-between gap-2 ${
                      isSelected 
                        ? 'bg-teal-50 border-teal-300 ring-1 ring-teal-500' 
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{pat.fullName}</span>
                        {isAuthed ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                            Authorized
                          </span>
                        ) : (
                          <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5" />
                            No Consent
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
                        ABHA: {pat.abhaId || 'N/A'}
                      </span>
                    </div>

                    <ArrowRight className={`w-4 h-4 mt-1 transition ${isSelected ? 'text-teal-600' : 'text-slate-300'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Patient Longitudinal Detail View (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* If No Access: Display Explicit Security 403 Barrier */}
          {!hasLegitimateAccess ? (
            <div className="bg-white rounded-2xl border-2 border-rose-200 p-8 shadow-sm text-center space-y-4 animate-in fade-in">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-8 h-8" />
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-lg font-black text-rose-950">
                  Access Restricted — Active Patient Consent Required
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>{currentUser.fullName}</strong> does not hold an active patient authorization from{' '}
                  <strong>{activePatientUser?.fullName || 'this patient'}</strong>.
                </p>
                <div className="p-3 bg-rose-50 rounded-xl text-left text-xs text-rose-900 space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    SIH26133 Strict Access Boundary:
                  </div>
                  <p className="text-[11px] text-rose-800">
                    Nearby doctors are strictly prevented from browsing non-consenting patient records. Records are only accessible if the patient grants consent, or in a certified life-threatening emergency.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to={`/emergency?patientId=${selectedPatientId}`}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Trigger Emergency Triage Override Protocol
                </Link>
                <button
                  onClick={() => {
                    // Quick switch demo to Dr. Anita Sharma who holds consent
                    dataStore.setCurrentUser('doc-sharma');
                  }}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-800 underline"
                >
                  (Or switch to Dr. Anita Sharma who holds active consent)
                </button>
              </div>
            </div>
          ) : (
            /* Legitimate Authorized Physician View */
            <div className="space-y-5 animate-in fade-in">
              {/* Patient Banner */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black text-slate-900">{activePatientUser?.fullName}</h2>
                      <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        Authorized Care Relationship
                      </span>
                      <span className="text-xs bg-teal-50 text-teal-800 font-bold px-2 py-0.5 rounded-full">
                        Blood: {activePatient?.bloodGroup}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 text-xs text-slate-500 mt-1">
                      <span>DOB: {activePatient?.dob}</span>
                      <span>• Gender: {activePatient?.gender.toUpperCase()}</span>
                      <span>• Residence: {activePatient?.address.villageOrTown}, {activePatient?.address.district}</span>
                    </div>
                  </div>

                  <Link
                    to="/doctor/note"
                    className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm self-start sm:self-center"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Write Encounter Note
                  </Link>
                </div>

                {/* Critical Allergies Alert */}
                {activePatient && activePatient.allergies.length > 0 && (
                  <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-900">
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold uppercase tracking-wide">Critical Allergy Warning: </span>
                      {activePatient.allergies.map(a => `${a.allergen} (${a.severity.replace('_', ' ')})`).join(', ')}
                    </div>
                  </div>
                )}
              </div>

              {/* Gemini Longitudinal Clinical Synthesis Card */}
              {loadingSummary ? (
                <div className="bg-indigo-50/50 border border-indigo-200 rounded-2xl p-6 text-center text-xs text-indigo-900">
                  <Sparkles className="w-6 h-6 text-indigo-600 animate-spin mx-auto mb-2" />
                  <span>Synthesizing multi-encounter records with Gemini Clinical Parser...</span>
                </div>
              ) : aiSummary ? (
                <AISummaryCard
                  summary={aiSummary}
                  onVerify={(notes) => {
                    dataStore.addAuditLog({
                      actorId: currentUser.uid,
                      actorName: currentUser.fullName,
                      actorRole: 'doctor',
                      action: 'AI_DOCTOR_VERIFIED',
                      resourceType: 'health_record',
                      patientId: selectedPatientId,
                      details: `Physician clinically validated Gemini longitudinal summary. Notes: ${notes || 'Verified'}`
                    });
                    alert('Clinical review recorded and logged to immutable audit trail!');
                  }}
                />
              ) : null}

              {/* Vitals Display */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Latest Physiological Measurements
                </span>
                <VitalsDisplay
                  vitals={records.find(r => r.vitals && !r.vitals.isUnavailable)?.vitals || {
                    isDeviceRecorded: false,
                    isUnavailable: true,
                    source: 'unavailable'
                  }}
                  allowManualPrompt={false}
                />
              </div>

              {/* Complete Longitudinal Timeline */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-teal-600" />
                    Longitudinal Encounter Timeline ({records.length} Records)
                  </h3>
                </div>
                <LongitudinalTimeline records={records} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
