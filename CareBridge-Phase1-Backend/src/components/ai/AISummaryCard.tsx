import React, { useState } from 'react';
import { Sparkles, ShieldCheck, AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

interface AISummaryProps {
  summary: {
    executiveSummary: string;
    chronicConditionsTrajectory: string[];
    medicationsSummary: string[];
    criticalAllergies: string[];
    unresolvedConcerns: string[];
    disclaimer: string;
  };
  onVerify?: (notes: string) => void;
  isVerified?: boolean;
}

export const AISummaryCard: React.FC<AISummaryProps> = ({ 
  summary, 
  onVerify,
  isVerified = false 
}) => {
  const [verified, setVerified] = useState(isVerified);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [expanded, setExpanded] = useState(true);

  const handleVerify = () => {
    setVerified(true);
    if (onVerify) {
      onVerify(doctorNotes);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50/70 via-white to-teal-50/50 border border-indigo-200 rounded-2xl p-5 shadow-sm">
      {/* Header with Safety Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-indigo-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Gemini Clinical Longitudinal Synthesis</h3>
              <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                AI Assistant
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Synthesized from past clinical encounters, pathology reports, and discharge summaries.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {verified ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Doctor Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
              <AlertCircle className="w-3.5 h-3.5" />
              Pending Doctor Review
            </span>
          )}

          <button 
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
            aria-label="Toggle AI Summary details"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Safety Mandatory Disclaimer */}
      <div className="my-3 p-2.5 bg-amber-50/90 border border-amber-200 rounded-lg flex items-start gap-2 text-xs text-amber-900">
        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Clinical Safety Notice: </span>
          {summary.disclaimer} The treating physician remains the ultimate clinical decision-maker.
        </div>
      </div>

      {expanded && (
        <div className="space-y-4 text-xs text-slate-700">
          {/* Executive Synthesis */}
          <div>
            <span className="font-bold text-slate-900 block mb-1">Executive Clinical Brief</span>
            <p className="leading-relaxed bg-white/80 p-3 rounded-xl border border-slate-200 text-slate-800 text-xs">
              {summary.executiveSummary}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Chronic Conditions Trajectory */}
            <div className="bg-white/80 p-3 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block mb-2 text-xs">Chronic Conditions Trajectory</span>
              <ul className="space-y-1.5">
                {summary.chronicConditionsTrajectory.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Active Medications & Known Allergies */}
            <div className="bg-white/80 p-3 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1 text-xs">Active Regimens & Allergies</span>
              <div className="mb-2">
                <span className="text-[11px] font-bold text-rose-700 uppercase">Critical Allergies:</span>
                <p className="text-rose-900 font-medium">{summary.criticalAllergies.join(', ') || 'None recorded'}</p>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-700 uppercase">Active Prescriptions:</span>
                <ul className="space-y-1 mt-1">
                  {summary.medicationsSummary.map((med, idx) => (
                    <li key={idx} className="text-slate-700 text-xs">• {med}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Unresolved / Key Follow-up Concerns */}
          <div className="bg-white/80 p-3 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1 text-xs">Clinical Follow-up & Vulnerability Indicators</span>
            <ul className="space-y-1">
              {summary.unresolvedConcerns.map((concern, idx) => (
                <li key={idx} className="flex items-start gap-2 text-slate-700">
                  <span className="text-amber-500 font-bold">⚠️</span>
                  <span>{concern}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Doctor Verification Action */}
          {!verified && onVerify && (
            <div className="pt-3 border-t border-indigo-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <input
                type="text"
                placeholder="Optional physician review comments..."
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                className="text-xs px-3 py-1.5 border border-slate-300 rounded-lg flex-1 focus:ring-1 focus:ring-teal-600"
              />
              <button
                onClick={handleVerify}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" />
                Clinically Verify Summary
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
