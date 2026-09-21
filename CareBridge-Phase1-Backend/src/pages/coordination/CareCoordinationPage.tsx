import React, { useState, useEffect } from 'react';
import { dataStore } from '../../services/dataStore';
import { 
  UserProfile, 
  PatientProfile, 
  ReferralRecord, 
  PatientCheckIn, 
  MedicationReminder 
} from '../../types';
import { Link } from 'react-router-dom';
import { 
  Users, 
  BellRing, 
  AlertTriangle, 
  Compass, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles, 
  Activity, 
  MapPin, 
  FileText,
  UserCheck,
  Stethoscope,
  HeartHandshake
} from 'lucide-react';

export const CareCoordinationPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(dataStore.getCurrentUser());
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [checkIns, setCheckIns] = useState<PatientCheckIn[]>([]);
  const [patients, setPatients] = useState<Record<string, PatientProfile>>(dataStore.getPatients());

  const loadData = () => {
    const u = dataStore.getCurrentUser();
    setCurrentUser(u);
    setReferrals(dataStore.getReferrals());
    setCheckIns(dataStore.getCheckIns());
    setPatients(dataStore.getPatients());
  };

  useEffect(() => {
    loadData();
    return dataStore.subscribe(loadData);
  }, []);

  const handleUpdateReferral = (id: string, status: 'initiated' | 'in_transit' | 'consulted' | 'closed') => {
    dataStore.updateReferralStatus(id, status);
  };

  const escalatedCheckIns = checkIns.filter(c => c.escalated);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold">
              <Users className="w-3.5 h-3.5" />
              <span>Frontline Health Mobilizer & Doctor Collaboration Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Community Health Coordination
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time monitoring console for ASHA workers, ANMs, and Medical Officers. Bridges rural community 
              needs directly to tertiary and secondary care providers through closed-loop referrals and proactive alerts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] text-slate-300 uppercase block font-semibold">Actionable Alerts</span>
              <span className="text-2xl font-black text-rose-400">{escalatedCheckIns.length}</span>
            </div>
            <div className="p-3 bg-white/10 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] text-slate-300 uppercase block font-semibold">Active Referrals</span>
              <span className="text-2xl font-black text-amber-400">{referrals.filter(r => r.status !== 'closed').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Escalation Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <BellRing className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Proactive Patient Escalations & Early Warnings</h2>
              <p className="text-xs text-slate-500">Triggered by patient-reported "Worse" check-ins or missed doses</p>
            </div>
          </div>
          <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
            {escalatedCheckIns.length} Pending Actions
          </span>
        </div>

        {escalatedCheckIns.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs">
            No active escalations. All monitored patients report stable or improved condition.
          </div>
        ) : (
          <div className="space-y-3">
            {escalatedCheckIns.map((chk) => {
              const patientUser = dataStore.getUserById(chk.patientId);
              const patientProf = patients[chk.patientId];

              return (
                <div key={chk.id} className="p-4 rounded-xl border border-rose-300 bg-rose-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">{patientUser?.fullName || 'Patient'}</span>
                      <span className="text-[10px] font-bold bg-rose-600 text-white px-2 py-0.5 rounded-full uppercase">
                        CONDITION: WORSE
                      </span>
                      <span className="text-xs font-mono text-slate-500">{new Date(chk.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs text-rose-950 font-medium">
                      Reported Note: <em>"{chk.symptomNote || 'Patient indicated deteriorating condition.'}"</em>
                    </p>
                    <div className="text-[11px] text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                      <span><strong>Village:</strong> {patientProf?.address.villageOrTown}, Sitapur</span>
                      <span>• <strong>Blood Group:</strong> {patientProf?.bloodGroup}</span>
                      <span>• <strong>Critical Allergies:</strong> {patientProf?.emergencyMinimumDataset.criticalAllergies.join(', ') || 'None'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <a
                      href={`tel:${patientUser?.phone || '+919415012345'}`}
                      className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1 transition"
                    >
                      <Phone className="w-3.5 h-3.5 text-teal-600" />
                      Call Patient
                    </a>
                    <Link
                      to={`/patient`}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-xs"
                    >
                      View Patient Record
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Referral Tracking Pipeline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Digital Referral Pipeline & Facility Handoffs</h2>
              <p className="text-xs text-slate-500">Track patients moving from Sub-Centres $\to$ PHC $\to$ CHC $\to$ District Hospital</p>
            </div>
          </div>

          <Link
            to="/navigator"
            className="text-xs text-teal-700 hover:text-teal-800 font-bold flex items-center gap-1"
          >
            Create New Referral
          </Link>
        </div>

        <div className="space-y-4">
          {referrals.map((ref) => (
            <div key={ref.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">{ref.patientName}</span>
                    <span className="text-xs font-mono text-slate-500">ABHA: {ref.patientAbhaId}</span>
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    <strong>From:</strong> {ref.referringFacility} ➔ <strong>To:</strong> {ref.destinationFacilityName} ({ref.specialtyNeeded})
                  </div>
                </div>

                {/* Status Badges & Pipeline Stage Buttons */}
                <div className="flex items-center gap-1.5 self-start sm:self-center">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    ref.status === 'consulted'
                      ? 'bg-emerald-100 text-emerald-800'
                      : ref.status === 'in_transit'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                  }`}>
                    {ref.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1">
                <div><strong>Referral Reason:</strong> {ref.reasonForReferral}</div>
                <div><strong>Clinical Summary:</strong> {ref.clinicalSummary}</div>
                {ref.criticalAllergies.length > 0 && (
                  <div className="text-rose-700 font-bold">
                    ⚠️ Receiving Facility Warning: {ref.criticalAllergies.join(', ')}
                  </div>
                )}
              </div>

              {/* Status advancement bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                <span className="text-[11px] text-slate-400">
                  Created on {new Date(ref.createdAt).toLocaleDateString('en-IN')} by {ref.referringProviderName}
                </span>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-500 font-medium">Update Status:</span>
                  <button
                    onClick={() => handleUpdateReferral(ref.id, 'in_transit')}
                    disabled={ref.status === 'in_transit'}
                    className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold rounded-lg disabled:opacity-50"
                  >
                    In Transit
                  </button>
                  <button
                    onClick={() => handleUpdateReferral(ref.id, 'consulted')}
                    disabled={ref.status === 'consulted'}
                    className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-bold rounded-lg disabled:opacity-50"
                  >
                    Consulted
                  </button>
                  <button
                    onClick={() => handleUpdateReferral(ref.id, 'closed')}
                    disabled={ref.status === 'closed'}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-600 text-[11px] font-medium rounded-lg disabled:opacity-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monitored Rural Patient Roster */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Active High-Risk Community Roster</h2>
              <p className="text-xs text-slate-500">Patients under continuous frontline follow-up in Sitapur Block</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {Object.values(patients).map((pat) => {
            const user = dataStore.getUserById(pat.id);
            return (
              <div key={pat.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-slate-900 text-sm">{user?.fullName}</span>
                    <span className="text-slate-500 block text-[11px]">
                      {pat.address.villageOrTown}, Block {pat.address.block}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full">
                    {pat.bloodGroup}
                  </span>
                </div>

                <div className="text-slate-600 space-y-0.5">
                  <div><strong>Conditions:</strong> {pat.chronicConditions.map(c => c.name).join(', ')}</div>
                  <div><strong>Key Allergy:</strong> {pat.allergies.map(a => a.allergen).join(', ')}</div>
                  <div><strong>Primary Caregiver:</strong> {pat.emergencyContacts[0]?.name} ({pat.emergencyContacts[0]?.phone})</div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200/60">
                  <a
                    href={`tel:${user?.phone}`}
                    className="p-1.5 text-slate-600 hover:text-teal-700 border border-slate-200 rounded-lg bg-white"
                    title="Call patient"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => dataStore.setCurrentUser(pat.id)}
                    className="text-xs font-bold text-teal-700 hover:text-teal-800 px-2.5 py-1 bg-white border border-teal-200 rounded-lg transition"
                  >
                    Open Health Dashboard
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
