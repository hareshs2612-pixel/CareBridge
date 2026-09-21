import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { dataStore } from '../../services/dataStore';
import { PatientProfile, EmergencyAccessEvent, UserProfile } from '../../types';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Search, 
  Heart, 
  Phone, 
  UserCheck, 
  Clock, 
  CheckCircle2, 
  Lock, 
  FileText,
  Building2,
  ShieldCheck
} from 'lucide-react';

export const EmergencyPortalPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedPatientId = searchParams.get('patientId') || '';

  const [searchQuery, setSearchQuery] = useState(preselectedPatientId || 'pat-ramesh');
  const [targetPatient, setTargetPatient] = useState<PatientProfile | undefined>(undefined);
  const [targetUser, setTargetUser] = useState<UserProfile | undefined>(undefined);

  // Emergency override form state
  const currentUser = dataStore.getCurrentUser();
  const [clinicalReason, setClinicalReason] = useState(
    'Acute trauma triage / uncommunicative patient following road accident'
  );
  const [facilityName, setFacilityName] = useState(
    'Sitapur District Hospital & Trauma Centre'
  );
  const [emergencyBadgeId, setEmergencyBadgeId] = useState('EMG-TRIAGE-2026-904');
  const [overrideGranted, setOverrideGranted] = useState(false);
  const [accessEvent, setAccessEvent] = useState<EmergencyAccessEvent | null>(null);

  useEffect(() => {
    if (searchQuery) {
      const users = dataStore.getUsers();
      const q = searchQuery.toLowerCase().trim();
      const matchedUser = users.find(u => 
        u.uid === searchQuery || 
        (u.abhaId && u.abhaId.toLowerCase().includes(q)) ||
        u.fullName.toLowerCase().includes(q) ||
        u.phone.includes(q)
      );
      
      if (matchedUser && matchedUser.role === 'patient') {
        const p = dataStore.getPatientById(matchedUser.uid);
        setTargetPatient(p);
        setTargetUser(matchedUser);
      } else {
        const p = dataStore.getPatientById(searchQuery);
        const u = dataStore.getUserById(searchQuery);
        setTargetPatient(p);
        setTargetUser(u);
      }
      setOverrideGranted(false);
      setAccessEvent(null);
    }
  }, [searchQuery]);

  const handleTriggerEmergencyAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPatient || !clinicalReason.trim() || !emergencyBadgeId.trim()) return;

    const event = dataStore.triggerEmergencyAccess({
      patientId: targetPatient.id,
      requesterId: currentUser.uid,
      requesterName: currentUser.fullName,
      requesterRole: currentUser.role,
      requesterFacility: facilityName.trim(),
      emergencyBadgeId: emergencyBadgeId.trim(),
      clinicalReason: clinicalReason.trim()
    });

    setAccessEvent(event);
    setOverrideGranted(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* High-Alert Emergency Banner */}
      <div className="bg-rose-950 text-white rounded-2xl p-6 shadow-xl border-2 border-rose-600 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-600 text-white rounded-xl animate-pulse">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Emergency Triage Access Protocol
              </h1>
              <span className="bg-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Audited Override Gate
              </span>
            </div>
            <p className="text-xs text-rose-200 mt-1">
              Provides strictly the <strong>Emergency Minimum Dataset</strong> during acute trauma, coma, or life-threatening resuscitation.
            </p>
          </div>
        </div>

        {/* Legal / Prototype Disclaimer Notice */}
        <div className="p-3 bg-rose-900/80 rounded-xl text-xs text-rose-100 flex items-start gap-2 border border-rose-800">
          <ShieldAlert className="w-4 h-4 text-rose-300 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white">Controlled Access Safeguard: </span>
            This protocol logs <strong>WHO, WHEN, WHY, and WHAT LEVEL</strong> to an immutable audit record. Non-emergency historical notes and sensitive documents remain strictly locked.
          </div>
        </div>
      </div>

      {/* Patient Search & Selection */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 text-xs">
        <label className="block font-bold text-slate-800 text-sm">
          Identify Patient by Name, ABHA ID (14-digit), or Phone:
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Enter Patient Name, ABHA ID (e.g. 91-8724-1029-4412), or Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-600 focus:outline-none font-medium text-xs"
          />
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-slate-400 text-[11px]">Quick Select:</span>
            <button
              type="button"
              onClick={() => setSearchQuery('pat-ramesh')}
              className={`px-3 py-1.5 rounded-lg font-bold transition text-xs ${
                searchQuery === 'pat-ramesh' ? 'bg-rose-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Ramesh Kumar (Farmer)
            </button>
            <button
              type="button"
              onClick={() => setSearchQuery('pat-sunita')}
              className={`px-3 py-1.5 rounded-lg font-bold transition text-xs ${
                searchQuery === 'pat-sunita' ? 'bg-rose-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Sunita Devi (Pregnant)
            </button>
          </div>
        </div>
      </div>

      {targetPatient && targetUser && (
        <div className="space-y-5">
          {/* Step 1: Emergency Justification Form (If not yet triggered) */}
          {!overrideGranted ? (
            <div className="bg-white rounded-2xl border-2 border-slate-300 p-6 shadow-sm space-y-4 text-xs">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-base font-black text-slate-900">
                  Step 1: Clinical Justification & Identification Check
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Target: <strong>{targetUser.fullName}</strong> (DOB: {targetPatient.dob})
                </p>
              </div>

              <form onSubmit={handleTriggerEmergencyAccess} className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Clinical Justification (Reason for Emergency Override) *
                  </label>
                  <input
                    type="text"
                    required
                    value={clinicalReason}
                    onChange={(e) => setClinicalReason(e.target.value)}
                    placeholder="e.g. Unconscious road accident victim with suspected internal injury"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-600 focus:outline-none font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Attending Healthcare Facility *
                    </label>
                    <input
                      type="text"
                      required
                      value={facilityName}
                      onChange={(e) => setFacilityName(e.target.value)}
                      placeholder="e.g. CHC Rampur or District Hospital Sitapur"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Responder / Attending Badge ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={emergencyBadgeId}
                      onChange={(e) => setEmergencyBadgeId(e.target.value)}
                      placeholder="e.g. EMG-TRIAGE-2026-904"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-600 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    Audit Trail Notice:
                  </div>
                  <p>
                    Triggering this override will permanently record your identity (<strong>{currentUser.fullName}</strong>), facility, and timestamp. The patient will receive a high-priority alert upon their next login.
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="bg-rose-600 hover:bg-rose-700 text-white font-black text-xs px-6 py-3 rounded-xl transition shadow-md flex items-center gap-2"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Verify Clinical Reason & Unlock Minimum Dataset
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Step 2: Emergency Minimum Dataset Unlocked */
            <div className="space-y-5 animate-in fade-in">
              {/* Access Audit Header */}
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 shadow-sm text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-600 text-white rounded-xl">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">Emergency Override Active: Minimum Dataset Granted</div>
                    <div className="text-[11px] text-emerald-800">
                      Logged by <strong>{accessEvent?.requesterName}</strong> ({accessEvent?.requesterFacility}) on{' '}
                      {new Date(accessEvent?.accessedAt || '').toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <span className="font-mono text-[10px] bg-emerald-200 text-emerald-900 px-2 py-1 rounded-md self-start sm:self-center">
                  AUDIT ID: {accessEvent?.auditHash.slice(0, 18)}...
                </span>
              </div>

              {/* Patient Core Identity Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900">{targetUser.fullName}</h2>
                    <span className="bg-rose-600 text-white text-xs font-black px-3 py-1 rounded-full">
                      BLOOD GROUP: {targetPatient.bloodGroup}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 text-xs text-slate-500 mt-1">
                    <span>DOB: {targetPatient.dob}</span>
                    <span>• Gender: {targetPatient.gender.toUpperCase()}</span>
                    <span>• Village: {targetPatient.address.villageOrTown}, {targetPatient.address.district}</span>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <span className="font-bold text-slate-700 block">Resuscitation Preference:</span>
                  <span className="text-emerald-700 font-black text-sm">
                    {targetPatient.emergencyMinimumDataset.resuscitationPreference || 'Full Code'}
                  </span>
                </div>
              </div>

              {/* Critical Minimum Dataset Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Life-Threatening Allergies */}
                <div className="bg-white rounded-2xl border-2 border-rose-300 p-5 shadow-sm space-y-2">
                  <div className="flex items-center gap-2 text-rose-700 font-black text-xs uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Critical Life-Threatening Allergies</span>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {targetPatient.emergencyMinimumDataset.criticalAllergies.map((alg, idx) => (
                      <div key={idx} className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-950">
                        ⚠️ {alg}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Active Critical Medications */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
                  <div className="flex items-center gap-2 text-teal-700 font-black text-xs uppercase tracking-wider">
                    <Heart className="w-4 h-4" />
                    <span>Active Medications (Adverse Interaction Screen)</span>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {targetPatient.emergencyMinimumDataset.criticalMedications.map((med, idx) => (
                      <div key={idx} className="p-2.5 bg-teal-50 border border-teal-100 rounded-xl text-xs font-semibold text-teal-950">
                        • {med}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Critical Conditions */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
                  <div className="flex items-center gap-2 text-blue-700 font-black text-xs uppercase tracking-wider">
                    <Heart className="w-4 h-4" />
                    <span>Existing Major Chronic Conditions</span>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {targetPatient.emergencyMinimumDataset.criticalConditions.map((cond, idx) => (
                      <div key={idx} className="p-2.5 bg-blue-50 border border-blue-100 rounded-xl text-xs font-semibold text-blue-950">
                        • {cond}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Emergency Contacts */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
                  <div className="flex items-center gap-2 text-purple-700 font-black text-xs uppercase tracking-wider">
                    <Phone className="w-4 h-4" />
                    <span>Emergency Contacts</span>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {targetPatient.emergencyMinimumDataset.emergencyContactsSummary.map((contact, idx) => (
                      <div key={idx} className="p-2.5 bg-purple-50 border border-purple-100 rounded-xl text-xs font-bold text-purple-950 flex items-center justify-between">
                        <span>{contact}</span>
                        <a 
                          href={`tel:${contact.split(': ')[1] || '108'}`} 
                          className="bg-purple-600 text-white px-2 py-1 rounded text-[10px] hover:bg-purple-700"
                        >
                          Call
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Privacy Lock Banner */}
              <div className="bg-slate-100 border border-slate-300 rounded-2xl p-4 text-xs text-slate-600 flex items-start gap-3">
                <Lock className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800">Restricted Privacy Boundary Enforced: </span>
                  Past non-emergency clinical notes, diagnostic imaging attachments, and psychiatric records remain locked. If continued care is needed, the patient or legal guardian must grant an official longitudinal consent authorization.
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
