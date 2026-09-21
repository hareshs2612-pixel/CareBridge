import React, { useState, useEffect } from 'react';
import { dataStore } from '../../services/dataStore';
import { api } from '../../services/api';
import { DoctorAccessRequestsCard } from '../../components/records/DoctorAccessRequestsCard';
import { 
  AccessAuthorization, 
  UserProfile, 
  DoctorProfile, 
  GranularSharingConsent, 
  CategorySharingPermissions 
} from '../../types';
import { 
  KeyRound, 
  ShieldCheck, 
  ShieldAlert, 
  UserCheck, 
  UserX, 
  Plus, 
  Building2, 
  Clock, 
  AlertCircle,
  Stethoscope,
  Users,
  Check,
  Lock,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';

export const DoctorConsentsPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(dataStore.getCurrentUser());
  const [authorizations, setAuthorizations] = useState<AccessAuthorization[]>([]);
  const [granularConsents, setGranularConsents] = useState<GranularSharingConsent[]>([]);
  const [doctors, setDoctors] = useState<Record<string, DoctorProfile>>(dataStore.getDoctors());
  const [users, setUsers] = useState<UserProfile[]>(dataStore.getUsers());
  const [selectedDoctorId, setSelectedDoctorId] = useState('doc-verma');
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);

  const loadData = () => {
    const user = dataStore.getCurrentUser();
    setCurrentUser(user);
    setAuthorizations(dataStore.getAuthorizationsForPatient(user.uid));
    setGranularConsents(dataStore.getGranularConsents(user.uid));
    setDoctors(dataStore.getDoctors());
    setUsers(dataStore.getUsers());
  };

  useEffect(() => {
    loadData();
    return dataStore.subscribe(loadData);
  }, []);

  const handleGrantAccess = (e: React.FormEvent) => {
    e.preventDefault();
    dataStore.grantDoctorAccess(currentUser.uid, selectedDoctorId, 'full_longitudinal');
    setIsGrantModalOpen(false);
  };

  const handleRevoke = async (authId: string, doctorName: string) => {
    if (window.confirm(`Revoke medical record access for ${doctorName}? They will no longer be able to inspect your history or notes.`)) {
      try {
        await api.revokeAccess(authId, 'Patient revoked clinical record access.');
      } catch {
        // ignore
      }
      dataStore.revokeDoctorAccess(authId, 'Patient revoked clinical record access.');
      loadData();
    }
  };

  const handleTogglePermission = (consentId: string, key: keyof CategorySharingPermissions) => {
    const target = granularConsents.find(c => c.id === consentId);
    if (!target) return;

    const updated: GranularSharingConsent = {
      ...target,
      permissions: {
        ...target.permissions,
        [key]: !target.permissions[key]
      }
    };

    dataStore.updateGranularConsent(updated);
  };

  const activeConsents = authorizations.filter(a => a.status === 'active');
  const pastConsents = authorizations.filter(a => a.status !== 'active');

  const doctorUsers = users.filter(u => u.role === 'doctor');

  if (currentUser.role !== 'patient') {
    return (
      <div className="max-w-xl mx-auto my-12 p-6 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-cb-navy text-base">You are currently logged in as {currentUser.fullName} ({currentUser.role.toUpperCase()})</h3>
        <p className="text-xs text-slate-500">
          Physician consent authorizations require an active patient profile.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => dataStore.setCurrentUser('pat-ramesh')}
            className="bg-cb-blue hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-xs"
          >
            Switch to Patient Account (Ramesh Kumar)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">Doctor Access & Consent Control</h1>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              {activeConsents.length} Active Authorizations
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            You hold total sovereignty over your health records. Only doctors you explicitly approve can view your history.
          </p>
        </div>

        <button
          onClick={() => setIsGrantModalOpen(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          Authorize New Doctor
        </button>
      </div>

      {/* Core Security Differentiator Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Patient Privacy & Least-Privilege Protection</span>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed">
          In our platform, <strong>arbitrary or nearby doctors CANNOT browse your medical records</strong> simply because they operate in the same district. A physician can only access your longitudinal chart if:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
          <div className="flex items-start gap-2 bg-white/5 p-2.5 rounded-lg">
            <span className="text-teal-400 font-bold">1.</span>
            <span>You provide explicit authorization (shown below).</span>
          </div>
          <div className="flex items-start gap-2 bg-white/5 p-2.5 rounded-lg">
            <span className="text-rose-400 font-bold">2.</span>
            <span>Emergency triage override is triggered with full audit logging.</span>
          </div>
        </div>
      </div>

      {/* Incoming Doctor Access Requests with Real OTP Verification */}
      <DoctorAccessRequestsCard onUpdated={loadData} />

      {/* Granular Role-Based Category Sharing Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Granular Role-Based Category Sharing Matrix</h2>
              <p className="text-xs text-slate-500">Fine-grained control over what doctors, ASHA workers, and family caregivers can see</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
            Self-Determined Consent
          </span>
        </div>

        <div className="space-y-4">
          {granularConsents.map((consent) => {
            const isDoctor = consent.granteeRole === 'doctor';
            const isAsha = consent.granteeRole === 'frontline_worker';
            const isCaregiver = consent.granteeRole === 'caregiver';

            return (
              <div
                key={consent.id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                      isDoctor ? 'bg-blue-100 text-blue-800' : isAsha ? 'bg-teal-100 text-teal-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {isDoctor ? 'MD' : isAsha ? 'ASHA' : 'FAM'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm">{consent.granteeName}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.2 rounded-full bg-white border border-slate-200 text-slate-700">
                          {consent.granteeRole.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{consent.granteeAffiliation}</p>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    Updated {new Date(consent.updatedAt).toLocaleDateString('en-IN')}
                  </span>
                </div>

                {/* Permission Toggles Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
                  {/* Prescriptions */}
                  <button
                    type="button"
                    onClick={() => handleTogglePermission(consent.id, 'prescriptions')}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 ${
                      consent.permissions.prescriptions
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-950 font-semibold'
                        : 'border-slate-200 bg-white text-slate-400'
                    }`}
                  >
                    <span className="text-[11px] block">Prescriptions</span>
                    <div className="flex items-center justify-between">
                      {consent.permissions.prescriptions ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                      <span className="text-[10px] uppercase font-bold">{consent.permissions.prescriptions ? 'SHARED' : 'HIDDEN'}</span>
                    </div>
                  </button>

                  {/* Vitals */}
                  <button
                    type="button"
                    onClick={() => handleTogglePermission(consent.id, 'vitals')}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 ${
                      consent.permissions.vitals
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-950 font-semibold'
                        : 'border-slate-200 bg-white text-slate-400'
                    }`}
                  >
                    <span className="text-[11px] block">Physiological Vitals</span>
                    <div className="flex items-center justify-between">
                      {consent.permissions.vitals ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                      <span className="text-[10px] uppercase font-bold">{consent.permissions.vitals ? 'SHARED' : 'HIDDEN'}</span>
                    </div>
                  </button>

                  {/* Diagnoses */}
                  <button
                    type="button"
                    onClick={() => handleTogglePermission(consent.id, 'diagnoses')}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 ${
                      consent.permissions.diagnoses
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-950 font-semibold'
                        : 'border-slate-200 bg-white text-slate-400'
                    }`}
                  >
                    <span className="text-[11px] block">Diagnoses & Conditions</span>
                    <div className="flex items-center justify-between">
                      {consent.permissions.diagnoses ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                      <span className="text-[10px] uppercase font-bold">{consent.permissions.diagnoses ? 'SHARED' : 'HIDDEN'}</span>
                    </div>
                  </button>

                  {/* Lab Reports */}
                  <button
                    type="button"
                    onClick={() => handleTogglePermission(consent.id, 'labReports')}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 ${
                      consent.permissions.labReports
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-950 font-semibold'
                        : 'border-slate-200 bg-white text-slate-400'
                    }`}
                  >
                    <span className="text-[11px] block">Lab & Diagnostics</span>
                    <div className="flex items-center justify-between">
                      {consent.permissions.labReports ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                      <span className="text-[10px] uppercase font-bold">{consent.permissions.labReports ? 'SHARED' : 'HIDDEN'}</span>
                    </div>
                  </button>

                  {/* Clinical Notes */}
                  <button
                    type="button"
                    onClick={() => handleTogglePermission(consent.id, 'clinicalNotes')}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 ${
                      consent.permissions.clinicalNotes
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-950 font-semibold'
                        : 'border-slate-200 bg-white text-slate-400'
                    }`}
                  >
                    <span className="text-[11px] block">Clinical Notes</span>
                    <div className="flex items-center justify-between">
                      {consent.permissions.clinicalNotes ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                      <span className="text-[10px] uppercase font-bold">{consent.permissions.clinicalNotes ? 'SHARED' : 'HIDDEN'}</span>
                    </div>
                  </button>

                  {/* Sensitive Records */}
                  <button
                    type="button"
                    onClick={() => handleTogglePermission(consent.id, 'sensitiveRecords')}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 ${
                      consent.permissions.sensitiveRecords
                        ? 'border-rose-300 bg-rose-50 text-rose-950 font-semibold'
                        : 'border-slate-200 bg-white text-slate-400'
                    }`}
                  >
                    <span className="text-[11px] block">Sensitive Records</span>
                    <div className="flex items-center justify-between">
                      {consent.permissions.sensitiveRecords ? <Lock className="w-3.5 h-3.5 text-rose-600" /> : <Lock className="w-3.5 h-3.5 text-slate-400" />}
                      <span className="text-[10px] uppercase font-bold">{consent.permissions.sensitiveRecords ? 'UNLOCKED' : 'LOCKED'}</span>
                    </div>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Authorizations */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-slate-900">Active Authorized Physicians</h3>

        {activeConsents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
            <KeyRound className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-sm">No active doctor authorizations.</p>
            <p className="text-xs text-slate-400 mt-1">Authorize your Primary Health Centre doctor to allow them to review your reports.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeConsents.map((auth) => {
              const doc = doctors[auth.doctorId];

              return (
                <div 
                  key={auth.id} 
                  className="bg-white rounded-2xl border border-teal-200 p-5 shadow-sm space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
                        <Stethoscope className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{auth.doctorName}</h4>
                        <p className="text-xs text-slate-500">{auth.doctorSpecialization}</p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3" />
                          {auth.doctorHospital}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">
                      ACTIVE ACCESS
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                    <div className="flex items-center justify-between">
                      <span>Scope:</span>
                      <strong className="text-slate-700 uppercase">{auth.scope.replace('_', ' ')}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Granted On:</span>
                      <span>{auth.grantedAt ? new Date(auth.grantedAt).toLocaleDateString('en-IN') : '—'}</span>
                    </div>
                    {doc && (
                      <div className="flex items-center justify-between">
                        <span>Medical Reg No:</span>
                        <span className="font-mono text-slate-600">{doc.registrationNumber}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex items-center justify-end">
                    <button
                      onClick={() => handleRevoke(auth.id, auth.doctorName)}
                      className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 hover:underline"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      Revoke Access Immediately
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Revoked / Past Permissions */}
      {pastConsents.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <h3 className="font-bold text-sm text-slate-700">Revoked / Expired Permissions History</h3>
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 text-xs">
            {pastConsents.map((auth) => (
              <div key={auth.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{auth.doctorName}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold uppercase">
                      {auth.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{auth.doctorHospital}</p>
                  {auth.revocationReason && (
                    <p className="text-[11px] text-rose-700 italic mt-0.5">Reason: {auth.revocationReason}</p>
                  )}
                </div>

                <div className="text-[11px] text-slate-400">
                  Revoked: {auth.revokedAt ? new Date(auth.revokedAt).toLocaleDateString('en-IN') : '—'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Authorize Modal */}
      {isGrantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-xs">
            <div className="bg-slate-900 text-white p-4">
              <h3 className="font-bold text-sm">Grant Physician Consent</h3>
              <p className="text-xs text-slate-400">Choose a doctor to authorize access to your medical chart.</p>
            </div>

            <form onSubmit={handleGrantAccess} className="p-5 space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Physician:</label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white text-xs"
                >
                  {doctorUsers.map(docUser => {
                    const docProfile = doctors[docUser.uid];
                    return (
                      <option key={docUser.uid} value={docUser.uid}>
                        {docUser.fullName} — {docProfile?.specialization || 'Doctor'} ({docProfile?.hospitalAffiliation})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl space-y-1 text-teal-900">
                <span className="font-bold block">Access Scope Granted:</span>
                <p className="text-slate-600">
                  Full Longitudinal Medical History (Chronological timeline, uploaded lab reports, past prescriptions).
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGrantModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm"
                >
                  Confirm & Grant Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
