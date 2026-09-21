import React, { useState } from 'react';
import { HealthRecord, RecordCategory } from '../../types';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import { VitalsDisplay } from '../common/VitalsDisplay';
import { 
  FileText, 
  Pill, 
  Activity, 
  FileUp, 
  Calendar, 
  Building2, 
  UserCheck, 
  ChevronDown, 
  ChevronUp, 
  Lock, 
  Sparkles,
  ExternalLink,
  HelpCircle
} from 'lucide-react';

interface LongitudinalTimelineProps {
  records: HealthRecord[];
  onOpenExplainer?: (term: string) => void;
  showSensitiveWarning?: boolean;
}

export const LongitudinalTimeline: React.FC<LongitudinalTimelineProps> = ({
  records,
  onOpenExplainer,
  showSensitiveWarning = true
}) => {
  const [selectedCategory, setSelectedCategory] = useState<RecordCategory | 'ALL'>('ALL');
  const [expandedRecordIds, setExpandedRecordIds] = useState<Set<string>>(new Set([records[0]?.id]));

  const toggleExpand = (id: string) => {
    setExpandedRecordIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredRecords = records.filter(r => {
    if (selectedCategory === 'ALL') return true;
    return r.category === selectedCategory;
  });

  const getCategoryIcon = (cat: RecordCategory) => {
    switch (cat) {
      case 'prescription':
        return <Pill className="w-4 h-4 text-teal-600" />;
      case 'lab_report':
        return <Activity className="w-4 h-4 text-blue-600" />;
      case 'discharge_summary':
        return <FileText className="w-4 h-4 text-purple-600" />;
      case 'clinical_note':
        return <UserCheck className="w-4 h-4 text-emerald-600" />;
      case 'patient_log':
        return <FileUp className="w-4 h-4 text-amber-600" />;
      default:
        return <FileText className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
            selectedCategory === 'ALL'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All Timeline Records ({records.length})
        </button>
        <button
          onClick={() => setSelectedCategory('prescription')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
            selectedCategory === 'prescription'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Prescriptions
        </button>
        <button
          onClick={() => setSelectedCategory('lab_report')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
            selectedCategory === 'lab_report'
              ? 'bg-blue-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Lab Reports
        </button>
        <button
          onClick={() => setSelectedCategory('discharge_summary')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
            selectedCategory === 'discharge_summary'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Discharge Summaries
        </button>
        <button
          onClick={() => setSelectedCategory('patient_log')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
            selectedCategory === 'patient_log'
              ? 'bg-amber-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Patient Self-Notes
        </button>
      </div>

      {/* Chronological Record Feed */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="font-semibold text-sm">No records found for this category.</p>
          <p className="text-xs text-slate-400 mt-1">Upload a past document or enter manual health history.</p>
        </div>
      ) : (
        <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-6">
          {filteredRecords.map((record) => {
            const isExpanded = expandedRecordIds.has(record.id);

            return (
              <div key={record.id} className="relative group">
                {/* Timeline node dot */}
                <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-white bg-teal-600 shadow-sm"></div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden">
                  {/* Card Header */}
                  <div 
                    onClick={() => toggleExpand(record.id)}
                    className="p-4 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 hover:bg-slate-100/50 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="p-1 bg-white border border-slate-200 rounded-md shadow-xs">
                          {getCategoryIcon(record.category)}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          {record.title}
                        </h4>
                        {record.isSensitive && (
                          <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 font-bold px-1.5 py-0.2 rounded flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Sensitive Record (Emergency Restricted)
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {new Date(record.recordDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                        {record.facilityName && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {record.facilityName}
                          </span>
                        )}
                        <span>• Recorded by: <strong className="text-slate-700">{record.authorName}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <ProvenanceBadge source={record.source} />
                      <button className="p-1 text-slate-400 hover:text-slate-600">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="p-4 border-t border-slate-100 space-y-4 text-xs">
                      {/* Clinical Summary */}
                      {record.clinicalSummary && (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                              Clinical Summary / Notes:
                            </span>
                            {onOpenExplainer && (
                              <button
                                onClick={() => onOpenExplainer(record.clinicalSummary!)}
                                className="text-[11px] text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1 underline"
                              >
                                <Sparkles className="w-3 h-3 text-teal-600" />
                                Explain terms in plain Hindi/English
                              </button>
                            )}
                          </div>
                          <p className="text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                            {record.clinicalSummary}
                          </p>
                        </div>
                      )}

                      {/* Doctor Diagnosis */}
                      {record.diagnosis && record.diagnosis.length > 0 && (
                        <div>
                          <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                            Doctor Confirmed Diagnoses:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {record.diagnosis.map((diag, idx) => (
                              <span 
                                key={idx}
                                className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                {diag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Prescriptions Table */}
                      {record.prescriptions && record.prescriptions.length > 0 && (
                        <div>
                          <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1.5">
                            Prescribed Medications:
                          </span>
                          <div className="overflow-x-auto border border-slate-200 rounded-xl">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-100 text-slate-600 text-[11px] uppercase">
                                <tr>
                                  <th className="p-2.5">Medicine Name</th>
                                  <th className="p-2.5">Dosage</th>
                                  <th className="p-2.5">Frequency</th>
                                  <th className="p-2.5">Duration</th>
                                  <th className="p-2.5">Instructions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-slate-800">
                                {record.prescriptions.map((p) => (
                                  <tr key={p.id} className="hover:bg-slate-50/70">
                                    <td className="p-2.5 font-bold text-teal-900">
                                      {p.medicineName}
                                      {p.genericName && (
                                        <span className="block text-[10px] text-slate-400 font-normal">
                                          ({p.genericName})
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-2.5 font-medium">{p.dosage}</td>
                                    <td className="p-2.5 bg-slate-50/50">{p.frequency}</td>
                                    <td className="p-2.5">{p.duration}</td>
                                    <td className="p-2.5 text-slate-600">{p.instructions}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Vitals Measurement Card */}
                      {record.vitals && (
                        <div>
                          <VitalsDisplay vitals={record.vitals} />
                        </div>
                      )}

                      {/* AI Lab Extraction & Observations */}
                      {record.aiAnalysis && (
                        <div className="bg-indigo-50/50 border border-indigo-200 rounded-xl p-3.5 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-indigo-900 font-bold text-xs">
                              <Sparkles className="w-4 h-4 text-indigo-600" />
                              <span>AI Extracted Lab Parameters ({record.aiAnalysis.modelUsed})</span>
                            </div>
                            <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
                              Requires Doctor Verification
                            </span>
                          </div>

                          {record.aiAnalysis.extractedParameters.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {record.aiAnalysis.extractedParameters.map((param, idx) => (
                                <div 
                                  key={idx} 
                                  className={`p-2 rounded-lg border ${
                                    param.isAbnormal 
                                      ? 'bg-rose-50 border-rose-200 text-rose-900' 
                                      : 'bg-white border-slate-200 text-slate-800'
                                  }`}
                                >
                                  <span className="block text-[10px] font-semibold text-slate-500 truncate">
                                    {param.parameter}
                                  </span>
                                  <span className="text-xs font-extrabold">
                                    {param.value} {param.unit}
                                  </span>
                                  {param.referenceRange && (
                                    <span className="block text-[9px] text-slate-400">
                                      Ref: {param.referenceRange}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {record.aiAnalysis.patientFriendlyExplanation && (
                            <div className="p-2.5 bg-white rounded-lg border border-indigo-100 text-xs text-slate-700">
                              <span className="font-bold text-indigo-950 block mb-1">
                                Patient-Friendly Summary:
                              </span>
                              <p>{record.aiAnalysis.patientFriendlyExplanation}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Uploaded Document Link */}
                      {record.documentFileName && (
                        <div className="flex items-center justify-between p-3 bg-blue-50/50 border border-blue-200 rounded-xl">
                          <div className="flex items-center gap-2">
                            <FileUp className="w-4 h-4 text-blue-600" />
                            <span className="font-semibold text-blue-950">{record.documentFileName}</span>
                          </div>
                          <span className="text-xs font-semibold text-blue-700 flex items-center gap-1 cursor-pointer hover:underline">
                            <ExternalLink className="w-3.5 h-3.5" />
                            View Attached File
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
