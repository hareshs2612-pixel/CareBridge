import React, { useState, useEffect } from 'react';
import { dataStore } from '../../services/dataStore';
import { 
  UserProfile, 
  PatientProfile, 
  MedicationReminder, 
  CareAppointment, 
  ReferralRecord, 
  PatientCheckIn 
} from '../../types';
import { Link } from 'react-router-dom';
import { 
  HeartHandshake, 
  Pill, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  BellRing, 
  Activity, 
  ArrowRight, 
  ChevronRight, 
  ShieldCheck, 
  Sparkles, 
  UserCheck, 
  Compass, 
  RefreshCw,
  PhoneCall
} from 'lucide-react';

export const CareContinuityPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(dataStore.getCurrentUser());
  const [patient, setPatient] = useState<PatientProfile | undefined>(dataStore.getPatientById(currentUser.uid));
  const [medications, setMedications] = useState<MedicationReminder[]>([]);
  const [appointments, setAppointments] = useState<CareAppointment[]>([]);
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [checkIns, setCheckIns] = useState<PatientCheckIn[]>([]);
  
  // Daily check-in state
  const [checkInStatus, setCheckInStatus] = useState<'better' | 'same' | 'worse'>('same');
  const [symptomNote, setSymptomNote] = useState('');
  const [checkInSubmitted, setCheckInSubmitted] = useState(false);
  const [latestCheckIn, setLatestCheckIn] = useState<PatientCheckIn | null>(null);

  const loadData = () => {
    const user = dataStore.getCurrentUser();
    setCurrentUser(user);
    const p = dataStore.getPatientById(user.uid);
    setPatient(p);
    if (p) {
      setMedications(dataStore.getMedicationReminders(p.id));
      setAppointments(dataStore.getAppointments(p.id));
      setReferrals(dataStore.getReferrals(p.id));
      const chks = dataStore.getCheckIns(p.id);
      setCheckIns(chks);
      if (chks.length > 0) {
        setLatestCheckIn(chks[0]);
      }
    }
  };

  useEffect(() => {
    loadData();
    return dataStore.subscribe(loadData);
  }, []);

  const handleMarkMedication = (id: string, status: 'taken' | 'due' | 'missed') => {
    dataStore.updateMedicationStatus(id, status);
  };

  const handleSubmitCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;
    const res = dataStore.submitCheckIn(patient.id, checkInStatus, symptomNote);
    setLatestCheckIn(res);
    setCheckInSubmitted(true);
  };

  if (!patient) {
    return (
      <div className="max-w-xl mx-auto my-12 p-6 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-slate-600 text-sm">Please switch to a patient persona to view care continuity.</p>
      </div>
    );
  }

  const takenCount = medications.filter(m => m.status === 'taken').length;
  const adherenceRate = medications.length > 0 ? Math.round((takenCount / medications.length) * 100) : 100;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Step 5, 6 & 7: Care Continuity & Follow-Up</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Care Continuity & Treatment Adherence
            </h1>
            <p className="text-xs sm:text-sm text-teal-100 max-w-2xl leading-relaxed">
              Care doesn't end when you leave the clinic. CareBridge coordinates your daily generic medicines, 
              scheduled visits with Dr. Anita Sharma, and proactive check-ins with your village ASHA worker Rekha Devi.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center p-4 bg-white/10 rounded-2xl border border-white/15 text-center min-w-[160px]">
            <span className="text-[11px] font-semibold text-teal-200 uppercase tracking-wider">Today's Adherence</span>
            <div className="text-3xl font-black text-white mt-0.5">{adherenceRate}%</div>
            <span className="text-[10px] text-teal-200/80 mt-0.5">{takenCount} of {medications.length} doses taken</span>
          </div>
        </div>
      </div>

      {/* Escalation Alert Banner if latest check-in was 'worse' */}
      {latestCheckIn && latestCheckIn.escalated && (
        <div className="bg-rose-50 border-2 border-rose-400 rounded-2xl p-5 shadow-md animate-in slide-in-from-top duration-300 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-rose-600 text-white rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-rose-950 text-sm sm:text-base">
                    Proactive Care Escalation Active
                  </h3>
                  <span className="text-[10px] bg-rose-200 text-rose-900 font-bold px-2 py-0.5 rounded-full uppercase">
                    High Priority
                  </span>
                </div>
                <p className="text-xs text-rose-800 mt-1">
                  You reported feeling <strong>WORSE</strong> on your latest daily check-in: <em>"{latestCheckIn.symptomNote || 'Dizziness/Unwell'}"</em>.
                </p>
                <div className="mt-2 text-xs bg-white/90 p-3 rounded-xl border border-rose-200 text-rose-900 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-rose-900">
                    <BellRing className="w-4 h-4 text-rose-600 animate-pulse" />
                    <span>Automatic Care Bridge Dispatch Actions:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px]">
                    <li>ASHA Worker <strong>Rekha Devi (+91 94150 55432)</strong> has been notified for a priority home check.</li>
                    <li>Primary Caregiver <strong>Suresh Kumar (Brother)</strong> received an automated missed-dose/escalation SMS alert.</li>
                    <li>Community Health Centre Rampur OPD was alerted with your Emergency Minimum Dataset.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 flex-shrink-0">
              <Link
                to="/emergency"
                className="bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition text-center shadow-sm"
              >
                Emergency SOS
              </Link>
              <a
                href="tel:108"
                className="bg-white border border-rose-300 text-rose-800 font-bold text-xs px-4 py-2 rounded-xl transition text-center hover:bg-rose-100"
              >
                Call 108 Ambulance
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Medications & Daily Check-in */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Medication Schedule */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Today's Prescribed Medications</h2>
                <p className="text-xs text-slate-500">Jan Aushadhi generic regimen prescribed by Dr. Anita Sharma</p>
              </div>
            </div>

            <span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>

          <div className="space-y-3">
            {medications.map((med) => {
              const isTaken = med.status === 'taken';
              const isMissed = med.status === 'missed';
              const isDue = med.status === 'due';

              return (
                <div
                  key={med.id}
                  className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isTaken
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : isMissed
                        ? 'border-rose-200 bg-rose-50/40'
                        : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{med.medicineName}</span>
                      <span className="text-[10px] bg-teal-100 text-teal-800 font-semibold px-1.5 py-0.5 rounded">
                        GENERIC
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span><strong>Dosage:</strong> {med.dosage}</span>
                      <span>• <strong>Timing:</strong> {med.scheduledTime} ({med.mealTiming.replace('_', ' ')})</span>
                      <span>• <strong>Period:</strong> {med.timeOfDay.toUpperCase()}</span>
                    </div>
                    {isTaken && med.takenAt && (
                      <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Confirmed taken at {med.takenAt}</span>
                      </div>
                    )}
                    {isMissed && (
                      <div className="text-[11px] text-rose-700 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Marked missed — Caregiver alert dispatched</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleMarkMedication(med.id, 'taken')}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1 shadow-2xs ${
                        isTaken
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {isTaken ? 'Taken' : 'Mark Taken'}
                    </button>
                    <button
                      onClick={() => handleMarkMedication(med.id, 'missed')}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${
                        isMissed
                          ? 'bg-rose-600 text-white'
                          : 'bg-white hover:bg-rose-50 text-rose-700 border border-rose-300'
                      }`}
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      Missed
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl text-xs text-teal-950 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Jan Aushadhi Generic Subsidy: </strong>
              <span>
                Both Metformin 500mg and Telmisartan 40mg are provided under the Pradhan Mantri Jan Aushadhi 
                scheme at Rampur Kendra for ₹12/strip (85% savings compared to branded alternatives).
              </span>
            </div>
          </div>
        </div>

        {/* Right Col: Daily Wellness Check-In */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Daily Health Check-In</h3>
              <p className="text-xs text-slate-500">Proactive status reporting for frontline care</p>
            </div>
          </div>

          <form onSubmit={handleSubmitCheckIn} className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
              How are you feeling today compared to yesterday?
            </label>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCheckInStatus('better')}
                className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                  checkInStatus === 'better'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <span className="text-lg">😊</span>
                <span className="text-xs">Better</span>
              </button>

              <button
                type="button"
                onClick={() => setCheckInStatus('same')}
                className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                  checkInStatus === 'same'
                    ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <span className="text-lg">😐</span>
                <span className="text-xs">Same</span>
              </button>

              <button
                type="button"
                onClick={() => setCheckInStatus('worse')}
                className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                  checkInStatus === 'worse'
                    ? 'border-rose-500 bg-rose-50 text-rose-900 font-bold ring-2 ring-rose-400'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <span className="text-lg">😟</span>
                <span className="text-xs">Worse</span>
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Any symptoms or notes to share?
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Mild headache after morning walk, took medicine on time..."
                value={symptomNote}
                onChange={(e) => setSymptomNote(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            {checkInStatus === 'worse' && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-900 space-y-1">
                <strong>Notice: </strong>
                Selecting "Worse" will immediately trigger an escalation notification to your ASHA worker Rekha Devi and family emergency contact.
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-sm"
            >
              Submit Today's Check-In
            </button>
          </form>

          {checkInSubmitted && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Check-in logged! Thank you for staying active in your care plan.</span>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Appointments & Consultations */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Upcoming Consultations & Care Appointments</h3>
              <p className="text-xs text-slate-500">Doctor follow-ups and frontline health visits</p>
            </div>
          </div>

          <Link
            to="/facilities"
            className="text-xs text-teal-700 hover:text-teal-800 font-bold flex items-center gap-1 self-start sm:self-center"
          >
            Find Facility
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {appointments.map((apt) => (
            <div key={apt.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{apt.doctorName}</span>
                <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  {apt.type.replace('_', ' ')}
                </span>
              </div>
              <div className="text-slate-600 space-y-0.5">
                <div><strong>Facility:</strong> {apt.facilityName}</div>
                <div><strong>Specialty:</strong> {apt.specialty}</div>
                <div><strong>Schedule:</strong> {apt.date} at {apt.time}</div>
                {apt.notes && <p className="text-slate-500 italic mt-1">{apt.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Referrals Pipeline Preview */}
      {referrals.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Active Digital Referrals</h3>
                <p className="text-xs text-slate-500">Track care handoffs across the rural referral network</p>
              </div>
            </div>

            <Link
              to="/navigator"
              className="text-xs text-teal-700 hover:text-teal-800 font-bold flex items-center gap-1"
            >
              Start New Triage
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {referrals.map((ref) => (
              <div key={ref.id} className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 text-xs space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">To: {ref.destinationFacilityName}</span>
                    <span className="text-slate-500 block text-[11px]">Specialty: {ref.specialtyNeeded}</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full self-start">
                    Status: {ref.status.toUpperCase().replace('_', ' ')}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-amber-200 text-slate-700">
                  <strong>Reason:</strong> {ref.reasonForReferral}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Referred by: {ref.referringProviderName}</span>
                  <span>Initiated: {new Date(ref.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
