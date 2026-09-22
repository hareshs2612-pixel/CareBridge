import React, { useState, useEffect } from 'react';
import { dataStore } from '../../services/dataStore';
import { api } from '../../services/api';
import { 
  UserProfile, 
  PatientProfile, 
  CarePlan, 
  CarePlanTask,
  CarePlanStatus,
  MedicationReminder, 
  CareAppointment, 
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
  PhoneCall,
  Flame,
  Check,
  Stethoscope,
  Send
} from 'lucide-react';

export const CareContinuityPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(dataStore.getCurrentUser());
  const [patient, setPatient] = useState<PatientProfile | undefined>(dataStore.getPatientById(currentUser.uid));
  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
  const [selectedCarePlan, setSelectedCarePlan] = useState<CarePlan | null>(null);
  const [medications, setMedications] = useState<MedicationReminder[]>([]);
  const [appointments, setAppointments] = useState<CareAppointment[]>([]);
  const [checkIns, setCheckIns] = useState<PatientCheckIn[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Daily check-in state
  const [checkInStatus, setCheckInStatus] = useState<'better' | 'same' | 'worse'>('same');
  const [symptomNote, setSymptomNote] = useState('');
  const [checkInSubmitted, setCheckInSubmitted] = useState(false);
  const [latestCheckIn, setLatestCheckIn] = useState<PatientCheckIn | null>(null);

  // Escalation state
  const [escalating, setEscalating] = useState<boolean>(false);
  const [escalationReason, setEscalationReason] = useState<string>('');
  const [showEscalateModal, setShowEscalateModal] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const user = dataStore.getCurrentUser();
    setCurrentUser(user);
    const p = dataStore.getPatientById(user.uid);
    setPatient(p);

    try {
      const plans = await api.getCarePlans({ patientId: user.uid });
      setCarePlans(plans);
      if (plans.length > 0) {
        setSelectedCarePlan(plans[0]);
      }
    } catch (err) {
      console.error('Failed to load care plans:', err);
    }

    if (p) {
      setMedications(dataStore.getMedicationReminders(p.id));
      setAppointments(dataStore.getAppointments(p.id));
      const chks = dataStore.getCheckIns(p.id);
      setCheckIns(chks);
      if (chks.length > 0) {
        setLatestCheckIn(chks[0]);
      }
    }
    setLoading(false);
  };

  const handleToggleTask = async (carePlanId: string, task: CarePlanTask) => {
    try {
      const updated = await api.updateCarePlanTask(carePlanId, task.id, {
        completed: !task.completed
      });
      setCarePlans(carePlans.map(cp => cp.id === carePlanId ? updated : cp));
      setSelectedCarePlan(updated);
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const handleEscalateCarePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCarePlan || !escalationReason) return;
    setEscalating(true);
    try {
      const updated = await api.escalateCarePlan(selectedCarePlan.id, {
        reason: escalationReason,
        doctorId: selectedCarePlan.doctorId
      });
      setCarePlans(carePlans.map(cp => cp.id === selectedCarePlan.id ? updated : cp));
      setSelectedCarePlan(updated);
      setShowEscalateModal(false);
      setEscalationReason('');
    } catch (err) {
      console.error('Failed to escalate care plan:', err);
    } finally {
      setEscalating(false);
    }
  };

  const handleMarkMedication = (id: string, status: 'taken' | 'due' | 'missed') => {
    dataStore.updateMedicationStatus(id, status);
    if (patient) setMedications(dataStore.getMedicationReminders(patient.id));
  };

  const handleSubmitCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;
    const res = dataStore.submitCheckIn(patient.id, checkInStatus, symptomNote);
    setLatestCheckIn(res);
    setCheckInSubmitted(true);
  };

  const getStatusBadge = (status: CarePlanStatus) => {
    switch (status) {
      case 'on_track':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'due_soon':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'overdue':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'escalated':
        return 'bg-rose-600 text-white border-rose-600 animate-pulse';
      case 'completed':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'high':
      case 'critical':
        return 'bg-rose-100 text-rose-800';
      case 'moderate':
        return 'bg-amber-100 text-amber-800';
      case 'low':
      default:
        return 'bg-teal-100 text-teal-800';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold tracking-wide uppercase mb-3">
              <HeartHandshake className="w-3.5 h-3.5 text-teal-600" />
              Comprehensive Care Continuity
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Care Plans & High-Risk Follow-Up
            </h1>
            <p className="text-slate-600 mt-2 text-sm sm:text-base max-w-2xl">
              Proactive disease management for chronic conditions, post-discharge tracking, diagnostic reminders, and instant escalation to attending physicians.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/triage"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-xl border border-slate-200 transition-colors"
            >
              Assess Symptoms
            </Link>
            <Link
              to="/referrals"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
            >
              View Referrals
            </Link>
          </div>
        </div>

        {/* Active Care Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Care Plans & Task Checklist */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Active Care Plan Card */}
            {selectedCarePlan ? (
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${getRiskBadge(selectedCarePlan.riskTier)}`}>
                        {selectedCarePlan.riskTier} Risk
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(selectedCarePlan.status)}`}>
                        {selectedCarePlan.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mt-2">{selectedCarePlan.primaryCondition}</h2>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Attending Clinician: <strong>{selectedCarePlan.doctorName}</strong> • Review Target: {selectedCarePlan.targetReviewDate}
                    </div>
                  </div>

                  <button
                    onClick={() => setShowEscalateModal(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-colors whitespace-nowrap"
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Escalate to Clinician
                  </button>
                </div>

                {/* Tasks List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Care Protocol Tasks ({selectedCarePlan.tasks.filter(t => t.completed).length}/{selectedCarePlan.tasks.length} Completed)
                    </span>
                    <span className="text-[11px] text-slate-500">Tap checkbox to update</span>
                  </div>

                  <div className="space-y-2.5">
                    {selectedCarePlan.tasks.map(task => (
                      <div
                        key={task.id}
                        onClick={() => handleToggleTask(selectedCarePlan.id, task)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                          task.completed
                            ? 'bg-emerald-50/40 border-emerald-200 text-slate-700'
                            : 'bg-white border-slate-200 hover:border-teal-400 text-slate-900 shadow-xs'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                          task.completed ? 'bg-emerald-600 text-white' : 'border-2 border-slate-300'
                        }`}>
                          {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-semibold ${task.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                            {task.title}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{task.description}</p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                            <span className="font-medium text-slate-600">Due: {task.dueDate}</span>
                            <span>•</span>
                            <span className="capitalize">{task.type.replace(/_/g, ' ')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plan Notes */}
                {selectedCarePlan.notes && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                    <strong className="text-slate-800">Physician Directives: </strong>
                    <p className="leading-relaxed">{selectedCarePlan.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400 text-sm">
                No active care plan assigned.
              </div>
            )}

            {/* Prescribed Daily Medications Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Pill className="w-5 h-5 text-teal-600" />
                  <h3 className="text-base font-bold text-slate-900">Today's Prescribed Generic Regimen</h3>
                </div>
                <Link to="/pharmacy" className="text-xs font-semibold text-teal-600 hover:text-teal-700">
                  Pharmacy Inventory &rarr;
                </Link>
              </div>

              <div className="space-y-3">
                {medications.map(med => (
                  <div key={med.id} className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{med.medicineName}</div>
                      <div className="text-slate-500">{med.dosage} • {med.frequency || `${med.timeOfDay} (${med.mealTiming.replace('_', ' ')})`}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleMarkMedication(med.id, 'taken')}
                        className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                          med.status === 'taken'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {med.status === 'taken' ? '✓ Taken' : 'Mark Taken'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Daily Check-In & Contacts */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Daily Wellness Check-In */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Activity className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">Daily Health Check-In</h3>
              </div>

              {checkInSubmitted ? (
                <div className="bg-teal-50 p-4 rounded-xl border border-teal-200 text-xs text-teal-900 space-y-1 text-center">
                  <CheckCircle2 className="w-6 h-6 text-teal-600 mx-auto mb-1" />
                  <div className="font-bold">Today's Check-In Logged</div>
                  <p className="text-teal-700 text-[11px]">Recorded into your clinical timeline.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitCheckIn} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-2">How do you feel today?</label>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {(['better', 'same', 'worse'] as const).map(st => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setCheckInStatus(st)}
                          className={`py-2 rounded-xl font-bold uppercase tracking-wider text-[10px] transition-colors ${
                            checkInStatus === st
                              ? (st === 'worse' ? 'bg-rose-600 text-white' : 'bg-teal-600 text-white')
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Optional Symptoms / Notes</label>
                    <textarea
                      rows={2}
                      value={symptomNote}
                      onChange={(e) => setSymptomNote(e.target.value)}
                      placeholder="Any unusual tiredness, dizziness, or pain?"
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors"
                  >
                    Submit Daily Log
                  </button>
                </form>
              )}
            </div>

            {/* Emergency Hotline Assistance */}
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                <PhoneCall className="w-4 h-4 text-rose-600" />
                Emergency Escalation
              </div>
              <p className="text-xs text-rose-700 leading-relaxed">
                If acute chest tightness, breathlessness, or collapse occurs, do not wait for routine follow-up. Dial immediate ambulance dispatch:
              </p>
              <a
                href="tel:1066"
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <PhoneCall className="w-4 h-4" />
                Call 1066 (24x7 Trauma)
              </a>
            </div>

          </div>

        </div>
      </div>

      {/* Clinician Escalation Modal */}
      {showEscalateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Trigger Clinician Escalation
              </h3>
            </div>

            <form onSubmit={handleEscalateCarePlan} className="space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                This triggers a high-priority alert to <strong>Dr. Anita Sharma</strong> for patient <strong>{selectedCarePlan?.patientName}</strong>.
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Escalation Reason</label>
                <textarea
                  rows={3}
                  value={escalationReason}
                  onChange={(e) => setEscalationReason(e.target.value)}
                  placeholder="e.g. Blood pressure elevated at 165/105 for 2 days despite Telmisartan adherence. Patient reporting lightheadedness."
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEscalateModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={escalating || !escalationReason}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {escalating ? 'Escalating...' : 'Dispatch Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
