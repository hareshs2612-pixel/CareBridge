import React, { useState } from 'react';
import { geminiService } from '../../services/geminiService';
import { Sparkles, X, HelpCircle, BookOpen, AlertCircle } from 'lucide-react';

interface MedicalTermExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTerm?: string;
}

export const MedicalTermExplainerModal: React.FC<MedicalTermExplainerModalProps> = ({
  isOpen,
  onClose,
  initialTerm = ''
}) => {
  const [term, setTerm] = useState(initialTerm);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const quickTerms = [
    'Hypertension',
    'Type 2 Diabetes',
    'HbA1c',
    'Anaphylaxis',
    'Creatinine',
    'Triage'
  ];

  const handleExplain = async (targetTerm: string) => {
    if (!targetTerm.trim()) return;
    setLoading(true);
    setTerm(targetTerm);
    try {
      const result = await geminiService.explainMedicalTerminology(targetTerm);
      setExplanation(result);
    } catch {
      setExplanation('Could not load simple explanation. Please consult your local health worker or doctor.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-600 rounded-xl">
              <Sparkles className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Patient Plain-Language Explainer</h3>
              <p className="text-xs text-teal-100">Simple explanation of difficult hospital terms</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-teal-100 hover:text-white rounded-lg hover:bg-teal-600/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Enter medical word or medicine name:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleExplain(term)}
                placeholder="e.g. Hypertension, Creatinine, Anaphylaxis..."
                className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
              <button
                onClick={() => handleExplain(term)}
                disabled={loading || !term.trim()}
                className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
              >
                {loading ? 'Explaining...' : 'Explain'}
              </button>
            </div>
          </div>

          {/* Quick Clickable Suggestions */}
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              Common Terms in Your Records:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickTerms.map((t) => (
                <button
                  key={t}
                  onClick={() => handleExplain(t)}
                  className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 border border-slate-200 rounded-lg text-slate-700 transition"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Explanation Output */}
          {explanation && (
            <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-teal-900 font-bold text-xs">
                <BookOpen className="w-4 h-4 text-teal-600" />
                <span>Simple Explanation:</span>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                {explanation}
              </p>
            </div>
          )}

          {/* Safety Disclaimer */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-[11px] text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Educational Notice: </span>
              This feature explains medical words in everyday language. It does not provide medical advice or diagnose health conditions. Always follow your doctor's instructions.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
