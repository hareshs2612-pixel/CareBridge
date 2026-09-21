import React, { useState, useEffect } from 'react';
import { dataStore } from '../../services/dataStore';
import { 
  PatientProfile, 
  HealthRecord, 
  EmergencyAccessEvent, 
  UserProfile,
  MedicationReminder,
  CareAppointment,
  ReferralRecord,
  PatientCheckIn
} from '../../types';
import { ProvenanceBadge } from '../../components/common/ProvenanceBadge';
import { VitalsDisplay } from '../../components/common/VitalsDisplay';
import { MedicalTermExplainerModal } from '../../components/ai/MedicalTermExplainerModal';
import { Link } from 'react-router-dom';
import { 
  HeartHandshake, 
  ShieldAlert, 
  FileText, 
  UploadCloud, 
  KeyRound, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Stethoscope, 
  Pill, 
  Activity, 
  User, 
  Clock, 
  ChevronRight,
  Sparkles,
  Phone,
  Plus,
  X,
  Compass,
  BellRing,
  Calendar,
  ArrowRight
} from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(dataStore.getCurrentUser());
  const [patient, setPatient] = useState<PatientProfile | undefined>(dataStore.getPatientById(currentUser.uid));
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [emergencyEvents, setEmergencyEvents] = useState<EmergencyAccessEvent[]>([]);
  const [explainerOpen, setExplainerOpen] = useState(false);
  const [explainerTerm, setExplainerTerm] = useState('');
  
  // Care Continuity State
  const [medications, setMedications] = useState<MedicationReminder[]>([]);
  const [appointments, setAppointments] = useState<CareAppointment[]>([]);
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [checkIns, setCheckIns] = useState<PatientCheckIn[]>([]);

  // Allergy modal state
  const [addAllergyOpen, setAddAllergyOpen] = useState(false);
  const [newAllergen, setNewAllergen] = useState('');
  const [newSeverity, setNewSeverity] = useState<'mild' | 'moderate' | 'severe' | 'life_threatening'>('moderate');
  const [newReaction, setNewReaction] = useState('');

  // Condition modal state
  const [addConditionOpen, setAddConditionOpen] = useState(false);
  const [newConditionName, setNewConditionName] = useState('');
  const [newConditionStatus, setNewConditionStatus] = useState<'active' | 'managed' | 'resolved'>('active');
  const [newConditionNotes, setNewConditionNotes] = useState('');

  const loadData = () => {
    const user = dataStore.getCurrentUser();
    setCurrentUser(user);
    const p = dataStore.getPatientById(user.uid);
    setPatient(p);
    if (p) {
      setRecords(dataStore.getRecordsForPatient(p.id));
      setEmergencyEvents(dataStore.getEmergencyEvents(p.id));
      setMedications(dataStore.getMedicationReminders(p.id));
      setAppointments(dataStore.getAppointments(p.id));
      setReferrals(dataStore.getReferrals(p.id));
      setCheckIns(dataStore.getCheckIns(p.id));
    }
  };

  const handleQuickCheckIn = (status: 'better' | 'same' | 'worse') => {
    if (!patient) return;
    dataStore.submitCheckIn(
      patient.id, 
      status, 
      status === 'worse' ? 'Feeling dizzy and fatigued with high morning sugar' : 'Routine check-in'
    );
  };

  const handleMarkMedication = (id: string, status: 'taken' | 'due' | 'missed') => {
    dataStore.updateMedicationStatus(id, status);
  };

  const handleSaveAllergy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient || !newAllergen.trim()) return;

    const newAllergy = {
      id: `alg-${Date.now()}`,
      allergen: newAllergen.trim(),
      severity: newSeverity,
      reaction: newReaction.trim() || 'Unspecified allergic reaction',
      verified: false,
      source: 'patient_provided' as const
    };

    const updated = {
      ...patient,
      allergies: [newAllergy, ...patient.allergies],
      emergencyMinimumDataset: {
        ...patient.emergencyMinimumDataset,
        criticalAllergies: newSeverity === 'severe' || newSeverity === 'life_threatening'
          ? [...patient.emergencyMinimumDataset.criticalAllergies, `${newAllergy.allergen} (${newSeverity.toUpperCase()})`]
          : patient.emergencyMinimumDataset.criticalAllergies
      }
    };

    dataStore.updatePatient(updated);
    dataStore.addAuditLog({
      actorId: currentUser.uid,
      actorName: currentUser.fullName,
      actorRole: 'patient',
      action: 'CREATE_RECORD',
      resourceType: 'patient_profile',
      patientId: patient.id,
      details: `Self-reported allergy added: ${newAllergen} [Severity: ${newSeverity}]`
    });

    setAddAllergyOpen(false);
    setNewAllergen('');
    setNewReaction('');
  };

  const handleSaveCondition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient || !newConditionName.trim()) return;

    const newCond = {
      id: `cond-${Date.now()}`,
      name: newConditionName.trim(),
      status: newConditionStatus,
      source: 'patient_provided' as const,
      diagnosedYear: new Date().getFullYear().toString(),
      notes: newConditionNotes.trim()
    };

    const updated = {
      ...patient,
      chronicConditions: [newCond, ...patient.chronicConditions],
      emergencyMinimumDataset: {
        ...patient.emergencyMinimumDataset,
        criticalConditions: [...patient.emergencyMinimumDataset.criticalConditions, newCond.name]
      }
    };

    dataStore.updatePatient(updated);
    dataStore.addAuditLog({
      actorId: currentUser.uid,
      actorName: currentUser.fullName,
      actorRole: 'patient',
      action: 'CREATE_RECORD',
      resourceType: 'patient_profile',
      patientId: patient.id,
      details: `Self-reported chronic condition added: ${newCond.name} (${newCond.status})`
    });

    setAddConditionOpen(false);
    setNewConditionName('');
    setNewConditionNotes('');
  };

  useEffect(() => {
    loadData();
    return dataStore.subscribe(loadData);
  }, []);

  if (!patient) {
    return (
      <div className="max-w-xl mx-auto my-12 p-6 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
          <User className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-slate-900 text-base">You are currently viewing as {currentUser.fullName} ({currentUser.role.toUpperCase()})</h3>
          <p className="text-xs text-slate-500">
            To explore the Patient Experience, switch to a patient persona or continue to your designated portal.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => dataStore.setCurrentUser('pat-ramesh')}
            className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition shadow-sm"
          >
            Switch to Ramesh Kumar (Farmer)
          </button>
          <button
            onClick={() => dataStore.setCurrentUser('pat-sunita')}
            className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl text-xs transition"
          >
            Switch to Sunita Devi (Artisan)
          </button>
        </div>
      </div>
    );
  }

  const unacknowledgedEmergency = emergencyEvents.find(e => !e.acknowledgedByPatient);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* High-Priority Emergency Access Alert Banner */}
      {unacknowledgedEmergency && (
        <div className="bg-rose-50 border-2 border-rose-400 rounded-2xl p-4 sm:p-5 shadow-md animate-in slide-in-from-top duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-600 text-white rounded-xl">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-rose-950 text-sm sm:text-base">
                    Emergency Triage Access Notification
                  </h3>
                  <span className="text-[10px] bg-rose-200 text-rose-900 font-bold px-2 py-0.5 rounded-full">
                    Audited Event
                  </span>
                </div>
                <p className="text-xs text-rose-800 mt-1">
                  <strong>{unacknowledgedEmergency.requesterName}</strong> at <strong>{unacknowledgedEmergency.requesterFacility}</strong> triggered emergency override access on your record on{' '}
                  {new Date(unacknowledgedEmergency.accessedAt).toLocaleString('en-IN')}.
                </p>
                <div className="mt-2 text-xs bg-white/80 p-2.5 rounded-lg border border-rose-200 text-rose-900 space-y-1">
                  <div><strong>Clinical Reason:</strong> {unacknowledgedEmergency.clinicalReason}</div>
                  <div><strong>Information Granted:</strong> Emergency Minimum Dataset (Allergies & Critical Meds only)</div>
                  <div><strong>Badge Identifier:</strong> <span className="font-mono">{unacknowledgedEmergency.emergencyBadgeId}</span></div>
                </div>
              </div>
            </div>

            <button
              onClick={() => dataStore.acknowledgeEmergencyEvent(unacknowledgedEmergency.id)}
              className="bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-sm self-end sm:self-center"
            >
              Acknowledge & Confirm
            </button>
          </div>
        </div>
      )}

      {/* Patient Header Card */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 text-white rounded-2xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-600 border-2 border-teal-300 flex items-center justify-center text-white text-2xl font-black shadow-inner">
              {currentUser.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">{currentUser.fullName}</h1>
                <span className="bg-teal-500/30 text-teal-200 border border-teal-400/40 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                  Blood Group: {patient.bloodGroup}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-teal-100 mt-1">
                <span>DOB: {new Date(patient.dob).toLocaleDateString('en-IN')}</span>
                <span>• Gender: {patient.gender.toUpperCase()}</span>
                <span>• {patient.address.villageOrTown}, {patient.address.district}</span>
              </div>
              {currentUser.abhaId && (
                <div className="text-xs font-mono text-teal-200 mt-1.5 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 bg-teal-900/80 rounded text-[10px] text-teal-300 font-sans uppercase font-bold">ABHA ID</span>
                  <span>{currentUser.abhaId}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/patient/upload"
              className="bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm"
            >
              <UploadCloud className="w-4 h-4" />
              Upload Medical Report
            </Link>
            <Link
              to="/facilities"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition border border-white/20"
            >
              <MapPin className="w-4 h-4 text-teal-300" />
              Find Nearest PHC/CHC
            </Link>
          </div>
        </div>
      </div>

      {/* Guided Care Navigator & Quick SOS Strip */}
      <div className="bg-gradient-to-r from-teal-50 via-white to-amber-50 border border-teal-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-600 text-white rounded-xl shadow-xs">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800">CareBridge Navigation</span>
              <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.2 rounded-full">Safe Non-Diagnostic Triage</span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Not sure which clinic or facility to visit today?
            </h3>
            <p className="text-xs text-slate-600">
              Enter your symptoms to find the closest appropriate facility and generate a digital referral card.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
          <Link
            to="/emergency"
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl transition shadow-xs flex items-center gap-1.5"
          >
            <AlertTriangle className="w-4 h-4" />
            SOS Emergency
          </Link>
          <Link
            to="/navigator"
            className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-xs flex items-center gap-1.5"
          >
            <Compass className="w-4 h-4" />
            Launch Navigator
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Visible Proactive Escalation Alert if latest check-in is 'worse' */}
      {checkIns.length > 0 && checkIns[0].escalated && (
        <div className="bg-rose-50 border-2 border-rose-400 rounded-2xl p-4 sm:p-5 shadow-md animate-in slide-in-from-top duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-600 text-white rounded-xl flex-shrink-0">
                <BellRing className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-rose-950 text-sm">
                    ⚠️ Active Care Escalation Dispatched
                  </h4>
                  <span className="text-[10px] bg-rose-200 text-rose-900 font-bold px-2 py-0.5 rounded-full">
                    ASHA & Family Notified
                  </span>
                </div>
                <p className="text-xs text-rose-800 mt-1">
                  You reported feeling <strong>WORSE</strong> today. A priority home-visit notification has been 
                  dispatched to ASHA worker <strong>Rekha Devi (+91 94150 55432)</strong> and your brother Suresh Kumar.
                </p>
                <div className="mt-2 text-[11px] text-slate-700 bg-white/80 p-2.5 rounded-lg border border-rose-200">
                  <strong>Recommended:</strong> Rest, take prescribed medicines with food, and keep your phone nearby. If chest tightness occurs, call 108 immediately.
                </div>
              </div>
            </div>

            <Link
              to="/emergency"
              className="bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-xs flex-shrink-0 self-end sm:self-center"
            >
              Emergency Triage
            </Link>
          </div>
        </div>
      )}

      {/* Care Continuity: Medications & Daily Wellness Check-In */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Today's Medication Schedule */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
                <Pill className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Today's Prescribed Generic Medicines</h3>
                <p className="text-[11px] text-slate-500">Jan Aushadhi regimen prescribed by Dr. Anita Sharma</p>
              </div>
            </div>

            <Link
              to="/patient/continuity"
              className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              Full Care Plan
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {medications.map((med) => {
              const isTaken = med.status === 'taken';
              const isMissed = med.status === 'missed';

              return (
                <div
                  key={med.id}
                  className={`p-3 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                    isTaken
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : isMissed
                        ? 'border-rose-200 bg-rose-50/40'
                        : 'border-slate-200 bg-slate-50/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">{med.medicineName}</span>
                      <span className="text-[10px] bg-teal-100 text-teal-800 font-semibold px-1.5 py-0.2 rounded">
                        GENERIC
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>{med.dosage}</span>
                      <span>• {med.scheduledTime} ({med.mealTiming.replace('_', ' ')})</span>
                      <span>• {med.timeOfDay.toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleMarkMedication(med.id, 'taken')}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                        isTaken
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {isTaken ? 'Taken' : 'Mark Taken'}
                    </button>
                    <button
                      onClick={() => handleMarkMedication(med.id, 'missed')}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                        isMissed
                          ? 'bg-rose-600 text-white'
                          : 'bg-white hover:bg-rose-50 text-rose-700 border border-rose-300'
                      }`}
                    >
                      Missed
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Quick Daily Check-In & Next Appointment */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Daily Health Check-In</h3>
              <p className="text-[11px] text-slate-500">How are you feeling today?</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickCheckIn('better')}
              className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-0.5 ${
                checkIns.length > 0 && checkIns[0].status === 'better'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-300'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <span className="text-base">😊</span>
              <span className="text-[11px] font-semibold">Better</span>
            </button>

            <button
              onClick={() => handleQuickCheckIn('same')}
              className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-0.5 ${
                checkIns.length > 0 && checkIns[0].status === 'same'
                  ? 'border-blue-500 bg-blue-50 text-blue-950 font-bold ring-2 ring-blue-300'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <span className="text-base">😐</span>
              <span className="text-[11px] font-semibold">Same</span>
            </button>

            <button
              onClick={() => handleQuickCheckIn('worse')}
              className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-0.5 ${
                checkIns.length > 0 && checkIns[0].status === 'worse'
                  ? 'border-rose-500 bg-rose-50 text-rose-950 font-bold ring-2 ring-rose-400'
                  : 'border-slate-200 hover:border-rose-300 text-slate-700'
              }`}
              title="Clicking 'Worse' will trigger an immediate escalation alert to ASHA Rekha Devi"
            >
              <span className="text-base">😟</span>
              <span className="text-[11px] font-bold text-rose-700">Worse</span>
            </button>
          </div>

          {/* Next Scheduled Visit Card */}
          {appointments.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-[11px] uppercase tracking-wider text-teal-800">
                  Next Appointment:
                </span>
                <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-semibold">
                  {appointments[0].date}
                </span>
              </div>
              <div className="text-slate-800 font-bold">{appointments[0].doctorName}</div>
              <div className="text-slate-500 text-[11px]">{appointments[0].facilityName}</div>
            </div>
          )}
        </div>
      </div>

      {/* Grid: Health Profile Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Allergies Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Allergies & Reactions</h3>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                {patient.allergies.length}
              </span>
              <button
                onClick={() => setAddAllergyOpen(true)}
                className="p-1 text-rose-700 hover:bg-rose-100 rounded-lg transition"
                title="Add self-reported allergy"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {patient.allergies.map(alg => (
              <div key={alg.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{alg.allergen}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                    alg.severity === 'life_threatening' ? 'bg-rose-600 text-white' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {alg.severity.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] mt-1">Reaction: {alg.reaction}</p>
                <div className="mt-1 flex items-center justify-between">
                  <ProvenanceBadge source={alg.source} />
                  {alg.verified && (
                    <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      Doctor Confirmed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chronic Conditions Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Chronic Conditions</h3>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                {patient.chronicConditions.length}
              </span>
              <button
                onClick={() => setAddConditionOpen(true)}
                className="p-1 text-blue-700 hover:bg-blue-100 rounded-lg transition"
                title="Add self-reported chronic condition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {patient.chronicConditions.map(cond => (
              <div key={cond.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{cond.name}</span>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded uppercase">
                    {cond.status}
                  </span>
                </div>
                {cond.notes && <p className="text-slate-500 text-[11px] mt-1">{cond.notes}</p>}
                <div className="mt-1 flex items-center justify-between">
                  <ProvenanceBadge source={cond.source} />
                  {cond.diagnosedYear && (
                    <span className="text-[10px] text-slate-400">Since {cond.diagnosedYear}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Contacts & Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                <Phone className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Emergency Contacts</h3>
            </div>
          </div>

          <div className="space-y-2">
            {patient.emergencyContacts.map(ec => (
              <div key={ec.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{ec.name}</span>
                  <span className="text-[10px] text-purple-700 font-semibold bg-purple-50 px-1.5 py-0.5 rounded">
                    {ec.relation}
                  </span>
                </div>
                <div className="text-teal-700 font-mono font-bold mt-1 text-[11px]">
                  {ec.phone}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl text-xs space-y-1 text-teal-950">
            <div className="font-bold flex items-center gap-1 text-[11px] uppercase tracking-wider text-teal-800">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              Emergency Minimum Dataset:
            </div>
            <p className="text-[11px] text-slate-600">
              During emergency triage, doctors can only view blood group ({patient.bloodGroup}), penicillin allergy, and brother's contact. Full history remains protected.
            </p>
          </div>
        </div>
      </div>

      {/* Latest Vitals Measurement (Transparently handles missing device) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Current Physiological State
          </h2>
          <span className="text-xs text-slate-400">
            Last measured from verified clinic encounters
          </span>
        </div>
        <VitalsDisplay 
          vitals={records.find(r => r.vitals && !r.vitals.isUnavailable)?.vitals || {
            isDeviceRecorded: false,
            isUnavailable: true,
            source: 'unavailable'
          }}
        />
      </div>

      {/* Recent Longitudinal Records Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-sm text-slate-900">Recent Medical Records</h3>
          </div>
          <Link
            to="/patient/records"
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
          >
            View Complete Timeline ({records.length})
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {records.slice(0, 3).map(rec => (
            <div key={rec.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-xs">{rec.title}</span>
                  <ProvenanceBadge source={rec.source} />
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                  <span>{new Date(rec.recordDate).toLocaleDateString('en-IN')}</span>
                  {rec.facilityName && <span>• {rec.facilityName}</span>}
                  <span>• By: {rec.authorName}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setExplainerTerm(rec.title);
                    setExplainerOpen(true);
                  }}
                  className="text-[11px] text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition"
                >
                  <Sparkles className="w-3 h-3 text-teal-600" />
                  Explain terms
                </button>
                <Link
                  to="/patient/records"
                  className="text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 font-medium"
                >
                  Inspect
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Explainer Modal */}
      <MedicalTermExplainerModal
        isOpen={explainerOpen}
        onClose={() => setExplainerOpen(false)}
        initialTerm={explainerTerm}
      />

      {/* Add Allergy Modal */}
      {addAllergyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-xs">
            <div className="bg-rose-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-300" />
                <h3 className="font-bold text-sm">Add Self-Reported Allergy</h3>
              </div>
              <button 
                onClick={() => setAddAllergyOpen(false)}
                className="p-1 text-rose-200 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAllergy} className="p-5 space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Allergen Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Peanuts, Sulfa antibiotics, Dust..."
                  value={newAllergen}
                  onChange={(e) => setNewAllergen(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Severity Level</label>
                <select
                  value={newSeverity}
                  onChange={(e) => setNewSeverity(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white"
                >
                  <option value="mild">Mild (Skin redness / minor sneezing)</option>
                  <option value="moderate">Moderate (Hives, rash, facial swelling)</option>
                  <option value="severe">Severe (Breathing difficulty, severe vomiting)</option>
                  <option value="life_threatening">Life-Threatening (Acute Anaphylaxis)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Typical Reaction Symptoms</label>
                <input
                  type="text"
                  placeholder="e.g. Swelling around lips and throat, hives..."
                  value={newReaction}
                  onChange={(e) => setNewReaction(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900">
                <span className="font-bold">Provenance Notice: </span>
                This entry will be clearly badged as <strong>"Patient Self-Reported"</strong> until inspected and confirmed by your doctor.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddAllergyOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-sm"
                >
                  Save Allergy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Chronic Condition Modal */}
      {addConditionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-xs">
            <div className="bg-blue-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-300" />
                <h3 className="font-bold text-sm">Add Chronic Condition</h3>
              </div>
              <button 
                onClick={() => setAddConditionOpen(false)}
                className="p-1 text-blue-200 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCondition} className="p-5 space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Condition Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asthma, Thyroid disorder, Arthritis..."
                  value={newConditionName}
                  onChange={(e) => setNewConditionName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Current Status</label>
                <select
                  value={newConditionStatus}
                  onChange={(e) => setNewConditionStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="active">Active (Currently ongoing symptoms/treatment)</option>
                  <option value="managed">Managed (Under control with lifestyle/diet)</option>
                  <option value="resolved">Resolved (No longer active)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Additional Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Mild wheezing during winter cold..."
                  value={newConditionNotes}
                  onChange={(e) => setNewConditionNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddConditionOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm"
                >
                  Save Condition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
