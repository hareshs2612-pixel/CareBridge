import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataStore } from '../../services/dataStore';
import { HealthRecord, PrescriptionItem } from '../../types';
import { 
  Stethoscope, 
  Plus, 
  Trash2, 
  Pill, 
  Activity, 
  Heart, 
  ShieldCheck, 
  Building2,
  AlertCircle
} from 'lucide-react';

export const AddClinicalNotePage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = dataStore.getCurrentUser();
  const doctor = dataStore.getDoctorById(currentUser.uid);
  const authedPatients = dataStore.getAuthorizedPatientsForDoctor(currentUser.uid);
  const allUsers = dataStore.getUsers();

  const [patientId, setPatientId] = useState(authedPatients[0] || 'pat-ramesh');
  const [title, setTitle] = useState('Routine Clinical Review & Prescription');
  const [clinicalSummary, setClinicalSummary] = useState('');
  const [diagnosisInput, setDiagnosisInput] = useState('Type 2 Diabetes Mellitus (Stable)');
  const [treatmentPlan, setTreatmentPlan] = useState('');

  // Vitals
  const [bpSystolic, setBpSystolic] = useState('130');
  const [bpDiastolic, setBpDiastolic] = useState('84');
  const [pulse, setPulse] = useState('74');
  const [temp, setTemp] = useState('98.4');
  const [spo2, setSpo2] = useState('98');

  // Prescriptions
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([
    {
      id: 'p-1',
      medicineName: 'Metformin Hydrochloride IP',
      genericName: 'Metformin',
      dosage: '500 mg',
      frequency: '1-0-1 (twice daily with meals)',
      duration: '90 days',
      instructions: 'Take immediately after food'
    }
  ]);

  const addPrescriptionRow = () => {
    setPrescriptions([
      ...prescriptions,
      {
        id: `p-${Date.now()}`,
        medicineName: '',
        genericName: '',
        dosage: '',
        frequency: '1-0-1',
        duration: '30 days',
        instructions: 'Take with water'
      }
    ]);
  };

  const updatePrescription = (index: number, field: keyof PrescriptionItem, value: string) => {
    const updated = [...prescriptions];
    (updated[index] as any)[field] = value;
    setPrescriptions(updated);
  };

  const removePrescription = (index: number) => {
    setPrescriptions(prescriptions.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      alert('Please select an authorized patient.');
      return;
    }

    const newRecord: HealthRecord = {
      id: `rec-${Date.now()}`,
      patientId,
      title: title.trim(),
      category: 'clinical_note',
      recordDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      authorId: currentUser.uid,
      authorName: currentUser.fullName,
      authorRole: 'doctor',
      source: 'doctor_verified',
      facilityName: doctor?.hospitalAffiliation || 'Public Health Centre',
      clinicalSummary: clinicalSummary.trim(),
      diagnosis: diagnosisInput.split(',').map(d => d.trim()).filter(Boolean),
      treatmentPlan: treatmentPlan.trim(),
      prescriptions: prescriptions.filter(p => p.medicineName.trim() !== ''),
      vitals: {
        isDeviceRecorded: false,
        isUnavailable: false,
        bloodPressureSystolic: Number(bpSystolic) || undefined,
        bloodPressureDiastolic: Number(bpDiastolic) || undefined,
        pulseBpm: Number(pulse) || undefined,
        temperatureFahrenheit: Number(temp) || undefined,
        spo2Percentage: Number(spo2) || undefined,
        source: 'doctor_measured',
        recordedAt: new Date().toISOString(),
        notes: `Recorded at ${doctor?.hospitalAffiliation || 'OPD'} during clinical encounter.`
      },
      isSensitive: false
    };

    dataStore.addRecord(newRecord);
    alert('Clinical Encounter Note & Prescription officially verified and archived!');
    navigate('/doctor');
  };

  const patientUsers = allUsers.filter(u => u.role === 'patient');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
        <div className="p-3 bg-teal-600 text-white rounded-2xl shadow-sm">
          <Stethoscope className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">New Clinical Encounter Note</h1>
          <p className="text-xs text-slate-500">
            Recorded as <strong>Doctor Verified</strong> in the patient's permanent longitudinal health record.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 text-xs">
        {/* Patient & Facility Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Patient *</label>
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white font-medium"
              >
                {patientUsers.map(pat => {
                  const isAuthed = authedPatients.includes(pat.uid);
                  return (
                    <option key={pat.uid} value={pat.uid}>
                      {pat.fullName} {isAuthed ? '(Authorized)' : '(No Consent)'}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Encounter Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 6-Month Diabetes & Hypertension Review"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Clinical Observations & Diagnosis */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
            Clinical Findings & Confirmed Diagnoses
          </h3>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Confirmed Diagnoses (Comma separated) *
            </label>
            <input
              type="text"
              required
              value={diagnosisInput}
              onChange={(e) => setDiagnosisInput(e.target.value)}
              placeholder="e.g. Type 2 Diabetes Mellitus, Essential Hypertension Stage 1"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Subjective & Objective Clinical Examination Notes:
            </label>
            <textarea
              rows={4}
              value={clinicalSummary}
              onChange={(e) => setClinicalSummary(e.target.value)}
              placeholder="Patient asymptomatic, reports compliant medication intake. Heart sounds normal, chest clear, no pedal edema..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Dietary / Lifestyle Advice & Follow-Up Schedule:
            </label>
            <input
              type="text"
              value={treatmentPlan}
              onChange={(e) => setTreatmentPlan(e.target.value)}
              placeholder="e.g. Low sodium intake, brisk walking 30 mins, review in 3 months with fasting blood sugar"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Clinic Vitals Recorded */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-600" />
            <h3 className="font-bold text-sm text-slate-900">Clinic Vitals (Examined in OPD)</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div>
              <span className="text-[10px] text-slate-500 font-bold block mb-1">BP Systolic</span>
              <input
                type="number"
                value={bpSystolic}
                onChange={(e) => setBpSystolic(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold block mb-1">BP Diastolic</span>
              <input
                type="number"
                value={bpDiastolic}
                onChange={(e) => setBpDiastolic(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold block mb-1">Pulse (bpm)</span>
              <input
                type="number"
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold block mb-1">Temp (°F)</span>
              <input
                type="number"
                step="0.1"
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold block mb-1">SpO2 (%)</span>
              <input
                type="number"
                value={spo2}
                onChange={(e) => setSpo2(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>
        </div>

        {/* Prescriptions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Pill className="w-4 h-4 text-teal-600" />
              <h3 className="font-bold text-sm text-slate-900">Prescribed Generic Medicines</h3>
            </div>
            <button
              type="button"
              onClick={addPrescriptionRow}
              className="text-xs text-teal-700 hover:text-teal-800 font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Medicine Row
            </button>
          </div>

          <div className="space-y-3">
            {prescriptions.map((rx, idx) => (
              <div key={rx.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="sm:col-span-2">
                    <span className="text-[10px] text-slate-500 block mb-0.5">Medicine Name *</span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Telmisartan 40mg"
                      value={rx.medicineName}
                      onChange={(e) => updatePrescription(idx, 'medicineName', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5">Dosage</span>
                    <input
                      type="text"
                      placeholder="e.g. 40 mg"
                      value={rx.dosage}
                      onChange={(e) => updatePrescription(idx, 'dosage', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5">Frequency</span>
                    <input
                      type="text"
                      placeholder="e.g. 1-0-0 morning"
                      value={rx.frequency}
                      onChange={(e) => updatePrescription(idx, 'frequency', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Instructions (e.g. After breakfast with warm water)"
                      value={rx.instructions}
                      onChange={(e) => updatePrescription(idx, 'instructions', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-600"
                    />
                  </div>
                  {prescriptions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePrescription(idx)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                      title="Remove medicine"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/doctor')}
            className="px-5 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-2.5 rounded-xl transition shadow-sm flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            Sign & Archive Clinical Note
          </button>
        </div>
      </form>
    </div>
  );
};
