import React from 'react';
import { VitalsMeasurement } from '../../types';
import { Heart, Thermometer, Wind, AlertCircle, CheckCircle2 } from 'lucide-react';

interface VitalsDisplayProps {
  vitals?: VitalsMeasurement;
  onEnterManually?: () => void;
  allowManualPrompt?: boolean;
}

export const VitalsDisplay: React.FC<VitalsDisplayProps> = ({ 
  vitals, 
  onEnterManually,
  allowManualPrompt = true
}) => {
  if (!vitals || vitals.isUnavailable || vitals.source === 'unavailable') {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-600">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-slate-200 rounded-lg text-slate-500 mt-0.5">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800 text-sm">Physiological Vitals: Unavailable</span>
              <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                No Device Data
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Rural patients are not assumed to possess BP monitors, pulse oximeters, or digital thermometers at home.
            </p>
            {allowManualPrompt && onEnterManually && (
              <button 
                onClick={onEnterManually}
                className="mt-2 text-xs font-semibold text-teal-700 hover:text-teal-800 underline flex items-center gap-1"
              >
                + Enter vitals manually if measured by an ASHA worker or local clinic
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const isDoctorMeasured = vitals.source === 'doctor_measured';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Clinical Vitals</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            isDoctorMeasured ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }`}>
            {isDoctorMeasured ? 'Clinical Grade (Clinic Exam)' : 'Self/ASHA Manual Entry'}
          </span>
        </div>
        {vitals.recordedAt && (
          <span className="text-xs text-slate-400">
            {new Date(vitals.recordedAt).toLocaleDateString('en-IN')}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Blood Pressure */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            <span>Blood Pressure</span>
          </div>
          <div className="text-base font-bold text-slate-900">
            {vitals.bloodPressureSystolic && vitals.bloodPressureDiastolic
              ? `${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic}`
              : '—'}
            <span className="text-xs font-normal text-slate-500 ml-1">mmHg</span>
          </div>
        </div>

        {/* Pulse */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <ActivityIcon className="w-3.5 h-3.5 text-red-500" />
            <span>Heart Rate</span>
          </div>
          <div className="text-base font-bold text-slate-900">
            {vitals.pulseBpm || '—'}
            <span className="text-xs font-normal text-slate-500 ml-1">bpm</span>
          </div>
        </div>

        {/* SpO2 */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Wind className="w-3.5 h-3.5 text-teal-500" />
            <span>SpO2 (Oxygen)</span>
          </div>
          <div className="text-base font-bold text-slate-900">
            {vitals.spo2Percentage ? `${vitals.spo2Percentage}%` : '—'}
          </div>
        </div>

        {/* Temperature */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Thermometer className="w-3.5 h-3.5 text-amber-500" />
            <span>Temperature</span>
          </div>
          <div className="text-base font-bold text-slate-900">
            {vitals.temperatureFahrenheit ? `${vitals.temperatureFahrenheit}°F` : '—'}
          </div>
        </div>
      </div>

      {vitals.notes && (
        <p className="text-xs text-slate-500 mt-2.5 italic">
          Note: {vitals.notes}
        </p>
      )}
    </div>
  );
};

const ActivityIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);
