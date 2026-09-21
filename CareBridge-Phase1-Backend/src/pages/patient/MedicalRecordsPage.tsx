import React, { useState, useEffect } from 'react';
import { dataStore } from '../../services/dataStore';
import { HealthRecord, PatientProfile, UserProfile } from '../../types';
import { LongitudinalTimeline } from '../../components/records/LongitudinalTimeline';
import { MedicalTermExplainerModal } from '../../components/ai/MedicalTermExplainerModal';
import { PlusCircle, FileText, X, AlertCircle } from 'lucide-react';

export const MedicalRecordsPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(dataStore.getCurrentUser());
  const [patient, setPatient] = useState<PatientProfile | undefined>(dataStore.getPatientById(currentUser.uid));
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [explainerOpen, setExplainerOpen] = useState(false);
  const [explainerTerm, setExplainerTerm] = useState('');

  // Manual entry form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'patient_log' | 'prescription' | 'lab_report'>('patient_log');
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [bpSystolic, setBpSystolic] = useState('');
  const [bpDiastolic, setBpDiastolic] = useState('');
  const [pulse, setPulse] = useState('');
  const [hasVitals, setHasVitals] = useState(false);

  const loadData = () => {
    const user = dataStore.getCurrentUser();
    setCurrentUser(user);
    const p = dataStore.getPatientById(user.uid);
    setPatient(p);
    if (p) {
      setRecords(dataStore.getRecordsForPatient(p.id));
    }
  };

  useEffect(() => {
    loadData();
    return dataStore.subscribe(loadData);
  }, []);

  const handleAddManualRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient || !title.trim()) return;

    const newRecord: HealthRecord = {
      id: `rec-${Date.now()}`,
      patientId: patient.id,
      title: title.trim(),
      category,
      recordDate,
      createdAt: new Date().toISOString(),
      authorId: currentUser.uid,
      authorName: currentUser.fullName,
      authorRole: 'patient',
      source: 'patient_provided',
      clinicalSummary: notes.trim(),
      vitals: hasVitals && bpSystolic ? {
        isDeviceRecorded: false,
        isUnavailable: false,
        bloodPressureSystolic: Number(bpSystolic),
        bloodPressureDiastolic: Number(bpDiastolic) || undefined,
        pulseBpm: Number(pulse) || undefined,
        source: 'patient_manual',
        notes: 'Manually logged by patient / family member'
      } : {
        isDeviceRecorded: false,
        isUnavailable: true,
        source: 'unavailable',
        notes: 'No physiological vitals equipment available at rural residence'
      },
      isSensitive: false
    };

    dataStore.addRecord(newRecord);
    setIsModalOpen(false);
    setTitle('');
    setNotes('');
    setBpSystolic('');
    setBpDiastolic('');
    setPulse('');
    setHasVitals(false);
  };

  if (!patient) {
    return (
      <div className="max-w-xl mx-auto my-12 p-6 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base">You are currently viewing as {currentUser.fullName} ({currentUser.role.toUpperCase()})</h3>
        <p className="text-xs text-slate-500">
          Switch to a patient persona to view and manage longitudinal records.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => dataStore.setCurrentUser('pat-ramesh')}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-sm"
          >
            Switch to Ramesh Kumar (Farmer)
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
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">Longitudinal Medical History</h1>
            <span className="text-xs bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
              {records.length} Entries
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Permanent chronological health timeline. Every entry explicitly states its origin and doctor verification status.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm self-start sm:self-center"
        >
          <PlusCircle className="w-4 h-4" />
          Log Manual Health Note
        </button>
      </div>

      {/* Notice on provenance & safety */}
      <div className="bg-slate-100/70 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-800">Longitudinal Record Integrity: </span>
          Only authorized physicians can write official prescriptions and diagnoses. Patient self-logs and uploaded records are clearly distinguished with badge tags so treating doctors know the exact origin.
        </div>
      </div>

      {/* Timeline Component */}
      <LongitudinalTimeline 
        records={records} 
        onOpenExplainer={(term) => {
          setExplainerTerm(term);
          setExplainerOpen(true);
        }}
      />

      {/* Manual Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-sm">Add Manual Health Note / Symptom</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddManualRecord} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Title / Subject *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Mild headache after working in sun, Village clinic check"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white"
                  >
                    <option value="patient_log">Patient Symptom Note</option>
                    <option value="prescription">Past Paper Slip / Prescription</option>
                    <option value="lab_report">External Lab Slip</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={recordDate}
                    onChange={(e) => setRecordDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Observations</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe your symptoms, how long they lasted, or any home remedies taken..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              {/* Optional Vitals Toggle */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasVitals}
                    onChange={(e) => setHasVitals(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                  />
                  <span className="font-bold text-slate-800">
                    I got my BP or pulse measured by an ASHA worker / local clinic
                  </span>
                </label>

                {hasVitals && (
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-0.5">BP Systolic</span>
                      <input
                        type="number"
                        placeholder="120"
                        value={bpSystolic}
                        onChange={(e) => setBpSystolic(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-0.5">BP Diastolic</span>
                      <input
                        type="number"
                        placeholder="80"
                        value={bpDiastolic}
                        onChange={(e) => setBpDiastolic(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-0.5">Pulse (bpm)</span>
                      <input
                        type="number"
                        placeholder="75"
                        value={pulse}
                        onChange={(e) => setPulse(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Explainer Modal */}
      <MedicalTermExplainerModal
        isOpen={explainerOpen}
        onClose={() => setExplainerOpen(false)}
        initialTerm={explainerTerm}
      />
    </div>
  );
};
