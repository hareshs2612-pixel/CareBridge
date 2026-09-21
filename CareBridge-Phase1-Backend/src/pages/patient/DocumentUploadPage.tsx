import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataStore } from '../../services/dataStore';
import { geminiService } from '../../services/geminiService';
import { HealthRecord, AIAnalysisResult, RecordCategory } from '../../types';
import { 
  UploadCloud, 
  FileText, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Building2, 
  Calendar, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const DocumentUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = dataStore.getCurrentUser();
  const patient = dataStore.getPatientById(currentUser.uid);

  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<RecordCategory>('lab_report');
  const [title, setTitle] = useState('');
  const [facilityName, setFacilityName] = useState('');
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);
  const [simulatedOcrText, setSimulatedOcrText] = useState(
    'Sitapur Pathology Diagnostics. Patient: Ramesh Kumar. Age 52. Fasting Blood Glucose: 138 mg/dL (Normal 70-99). Post-prandial Glucose: 182 mg/dL. HbA1c: 7.0%. Serum Creatinine: 0.88 mg/dL. Blood Urea: 18 mg/dL. Impression: Mild hyperglycemic profile.'
  );

  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isSensitive, setIsSensitive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    }
  };

  const handleRunAIExtraction = async () => {
    setAnalyzing(true);
    try {
      const fileName = file ? file.name : 'Scanned_Lab_Report.pdf';
      const result = await geminiService.extractReportData(fileName, simulatedOcrText);
      setAiAnalysis(result);
    } catch (err) {
      alert('Error running AI parameter extraction');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;

    const newRecord: HealthRecord = {
      id: `rec-${Date.now()}`,
      patientId: patient.id,
      title: title.trim() || 'Uploaded Medical Record',
      category,
      recordDate,
      createdAt: new Date().toISOString(),
      authorId: currentUser.uid,
      authorName: currentUser.fullName,
      authorRole: 'patient',
      source: 'uploaded_document',
      facilityName: facilityName.trim() || 'External Diagnostic Centre',
      clinicalSummary: simulatedOcrText,
      documentFileName: file ? file.name : 'Scanned_Report_Sitapur.pdf',
      documentType: file?.type?.includes('pdf') ? 'pdf' : 'image/jpeg',
      documentUrl: 'https://example.com/demo-docs/scanned_report.pdf',
      aiAnalysis: aiAnalysis || undefined,
      vitals: {
        isDeviceRecorded: false,
        isUnavailable: true,
        source: 'unavailable',
        notes: 'Document upload: No physiological hardware sensors attached'
      },
      isSensitive
    };

    dataStore.addRecord(newRecord);
    alert('Document securely archived and added to your longitudinal health record!');
    navigate('/patient/records');
  };

  if (!patient) {
    return (
      <div className="max-w-xl mx-auto my-12 p-6 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base">You are currently viewing as {currentUser.fullName} ({currentUser.role.toUpperCase()})</h3>
        <p className="text-xs text-slate-500">
          Switch to a patient persona to upload and archive personal medical documents.
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">Upload Existing Medical Document</h1>
        <p className="text-xs text-slate-500 mt-1">
          Digitize past physical paper slips, hospital discharge summaries, or pathology reports for your longitudinal record.
        </p>
      </div>

      {/* Provenance Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Medical Integrity Guardrail: </span>
          Uploaded documents are tagged as <strong>"Uploaded Document"</strong> and are <strong>NOT</strong> treated as automatically verified clinical facts until inspected and confirmed by your authorized physician.
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Drag & Drop Upload Zone */}
        <div className="bg-white border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-2xl p-6 sm:p-8 text-center transition bg-slate-50/50">
          <input
            type="file"
            id="file-upload"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
          />
          <label htmlFor="file-upload" className="cursor-pointer block space-y-3">
            <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs border border-teal-100">
              <UploadCloud className="w-7 h-7" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 block">
                {file ? file.name : 'Click to select or drag & drop medical document'}
              </span>
              <span className="text-xs text-slate-500">
                Supports PDF, JPG, or PNG (Prescriptions, Blood Tests, X-Ray reports)
              </span>
            </div>
          </label>
        </div>

        {/* Metadata Inputs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
            Document Details & Facility
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Document Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sitapur Blood Glucose & Lipid Panel"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Document Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white"
              >
                <option value="lab_report">Pathology / Lab Report</option>
                <option value="prescription">Paper Prescription Slip</option>
                <option value="discharge_summary">Hospital Discharge Summary</option>
                <option value="diagnostic_report">Radiology / Diagnostic Scan</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Healthcare Facility / Diagnostic Lab</label>
              <input
                type="text"
                value={facilityName}
                onChange={(e) => setFacilityName(e.target.value)}
                placeholder="e.g. Sitapur Pathology Centre or CHC Rampur"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Date of Test / Prescription</label>
              <input
                type="date"
                value={recordDate}
                onChange={(e) => setRecordDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Document Text / OCR Ingestion Preview:
            </label>
            <textarea
              rows={3}
              value={simulatedOcrText}
              onChange={(e) => setSimulatedOcrText(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none font-mono text-[11px]"
            />
          </div>

          {/* Sensitive Flag */}
          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isSensitive}
                onChange={(e) => setIsSensitive(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
              />
              <span className="font-semibold text-slate-700">
                Mark as Sensitive Medical Record (Restricts this document from Emergency Triage view)
              </span>
            </label>
          </div>
        </div>

        {/* AI Background Assistant Button */}
        <div className="bg-gradient-to-r from-indigo-50 to-teal-50 border border-indigo-200 rounded-2xl p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-600 text-white rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Gemini Lab Parameter Extraction</h4>
                <p className="text-xs text-slate-500">
                  Automatically extracts values (Glucose, HbA1c, Creatinine) and creates a plain-language explanation.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRunAIExtraction}
              disabled={analyzing}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm self-start sm:self-center"
            >
              {analyzing ? 'Extracting via Gemini...' : 'Run AI Extraction'}
            </button>
          </div>

          {/* AI Extraction Results Display */}
          {aiAnalysis && (
            <div className="bg-white rounded-xl border border-indigo-100 p-4 space-y-3 mt-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-indigo-950 uppercase tracking-wider">
                  Extracted Lab Values ({aiAnalysis.modelUsed}):
                </span>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
                  Unverified AI Extraction
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {aiAnalysis.extractedParameters.map((param, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="block text-[10px] text-slate-500 truncate">{param.parameter}</span>
                    <span className="text-xs font-bold text-slate-900">{param.value} {param.unit}</span>
                    {param.referenceRange && (
                      <span className="block text-[9px] text-slate-400">Ref: {param.referenceRange}</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-3 bg-teal-50 border border-teal-100 rounded-lg text-xs">
                <span className="font-bold text-teal-950 block mb-1">Patient-Friendly Explanation:</span>
                <p className="text-slate-700">{aiAnalysis.patientFriendlyExplanation}</p>
              </div>
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/patient/records')}
            className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition shadow-sm flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            Archive to Longitudinal Record
          </button>
        </div>
      </form>
    </div>
  );
};
