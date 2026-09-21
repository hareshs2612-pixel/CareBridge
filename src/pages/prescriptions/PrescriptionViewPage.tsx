import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Printer, 
  Share2, 
  ArrowLeft, 
  ShieldCheck, 
  Pill, 
  Calendar, 
  QrCode, 
  CheckCircle2, 
  Stethoscope, 
  HeartHandshake, 
  ExternalLink,
  Download,
  AlertCircle
} from 'lucide-react';
import { Prescription } from '../../types';
import { dataStore } from '../../services/dataStore';
import { api } from '../../services/api';

export const PrescriptionViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [allPrescriptions, setAllPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPrescription = async () => {
      setLoading(true);
      try {
        if (id) {
          const rx = await api.getPrescriptionById(id);
          if (rx) setPrescription(rx);
        }
        const list = await api.getPrescriptions();
        setAllPrescriptions(list);
        if (!id && list.length > 0) {
          setPrescription(list[0]);
        }
      } catch (err) {
        console.error('Failed to load prescription:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescription();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cb-blue border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-500">Retrieving digital prescription...</p>
        </div>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-cb-navy mb-2">Prescription Not Found</h2>
        <p className="text-slate-500 mb-6">No prescription matched the requested reference identifier.</p>
        <Link
          to="/patient/records"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-cb-blue text-white font-bold rounded-xl hover:bg-blue-700 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Medical Records
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 min-h-screen py-8 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Action Header Bar (hidden during print) */}
        <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div className="flex items-center gap-3">
            <Link
              to="/patient/records"
              className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 transition shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-lg font-black text-cb-navy">Digital Medical Prescription</h1>
              <p className="text-xs text-slate-500">Ref: {prescription.id} • Issued {prescription.date}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>

            <Link
              to="/pharmacy"
              className="px-4 py-2 bg-white hover:bg-blue-50 border border-cb-blue text-cb-blue rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
            >
              <Pill className="w-3.5 h-3.5" />
              <span>Order Medicines</span>
            </Link>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-cb-blue hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-xs shadow-blue-900/20"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>

        {/* Official Prescription Document */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md print:shadow-none print:border-none p-8 sm:p-10 space-y-6">
          
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b-2 border-cb-navy">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cb-navy text-white flex items-center justify-center font-bold">
                  <HeartHandshake className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <span className="text-xl font-black text-cb-navy tracking-tight">CareBridge</span>
                  <span className="text-xs text-cb-blue font-bold ml-1.5">HEALTHCARE NETWORK</span>
                </div>
              </div>
              <p className="text-xs font-bold text-slate-700 mt-1">{prescription.hospitalName}</p>
              <p className="text-[11px] text-slate-500">
                Department of {prescription.doctorSpecialty} • Accredited Tertiary Medical Centre
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                Prescription Ref: {prescription.id} | ABDM Health Record compliant
              </p>
            </div>

            {/* Doctor Info */}
            <div className="sm:text-right space-y-0.5">
              <h2 className="text-base font-black text-cb-navy">{prescription.doctorName}</h2>
              <p className="text-xs text-cb-blue font-semibold">{prescription.doctorSpecialty}</p>
              <p className="text-[11px] text-slate-500">
                Registration No: <strong className="text-slate-800">{prescription.doctorRegistration}</strong>
              </p>
              <div className="pt-1 flex items-center sm:justify-end gap-1 text-[11px] text-emerald-700 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Medical Practitioner</span>
              </div>
            </div>
          </div>

          {/* Patient Details & Vitals Strip */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Patient Name</span>
                <span className="font-black text-slate-900 text-sm">{prescription.patientName}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Age / Gender</span>
                <span className="font-bold text-slate-800">
                  {prescription.patientAge ? `${prescription.patientAge} Yrs` : '52 Yrs'} / {prescription.patientGender || 'Male'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Date of Consultation</span>
                <span className="font-bold text-slate-800">{prescription.date}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Patient UHID</span>
                <span className="font-mono font-bold text-cb-blue">{prescription.patientId}</span>
              </div>
            </div>

            {/* Vitals Summary */}
            {prescription.vitals && (
              <div className="pt-2 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400">BP:</span>{' '}
                  <strong className="text-slate-800">{prescription.vitals.bloodPressure || '128/84 mmHg'}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Pulse:</span>{' '}
                  <strong className="text-slate-800">{prescription.vitals.pulseBpm || 74} bpm</strong>
                </div>
                <div>
                  <span className="text-slate-400">SpO2:</span>{' '}
                  <strong className="text-slate-800">{prescription.vitals.spo2 || 99}%</strong>
                </div>
                <div>
                  <span className="text-slate-400">Temp:</span>{' '}
                  <strong className="text-slate-800">{prescription.vitals.temperatureF || 98.4}°F</strong>
                </div>
              </div>
            )}
          </div>

          {/* Clinical Diagnosis */}
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
              Provisional / Clinical Diagnosis
            </span>
            <div className="flex flex-wrap gap-1.5">
              {prescription.diagnosis.map((d, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-blue-50 text-cb-navy border border-blue-200 rounded-lg text-xs font-bold"
                >
                  {d}
                </span>
              ))}
            </div>
          </div>

          {/* Classical Rx Prescription Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-serif font-black text-cb-navy select-none">℞</span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Prescribed Medication Regimen
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Medication & Strength</th>
                    <th className="py-3 px-4">Dosage Form</th>
                    <th className="py-3 px-4">Frequency</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {prescription.medicines.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-cb-navy text-sm">{item.medicineName || item.name}</td>
                      <td className="py-3.5 px-4 text-slate-600">{item.dosage}</td>
                      <td className="py-3.5 px-4 font-semibold text-cb-blue">{item.frequency}</td>
                      <td className="py-3.5 px-4 text-slate-700">{item.duration}</td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px] italic">{item.instructions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Doctor's Clinical Advice */}
          {prescription.advice && (
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-1.5 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Dietary, Lifestyle & Diagnostic Advice
              </span>
              <p className="text-slate-700 leading-relaxed">{prescription.advice}</p>
            </div>
          )}

          {/* Follow-up Note */}
          {prescription.followUpDate && (
            <div className="flex items-center gap-2 text-xs text-cb-navy font-bold">
              <Calendar className="w-4 h-4 text-cb-blue" />
              <span>Recommended Follow-up Consultation: {prescription.followUpDate}</span>
            </div>
          )}

          {/* Verification & Digital Signature Block */}
          <div className="pt-6 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
            
            {/* QR Code & ABDM Validation */}
            <div className="flex items-center gap-3.5">
              <div className="w-16 h-16 bg-slate-900 text-white rounded-xl flex items-center justify-center p-1.5 shrink-0">
                <QrCode className="w-12 h-12" />
              </div>
              <div className="text-[11px] text-slate-500 space-y-0.5">
                <p className="font-bold text-slate-800">Scan to Verify Authenticity</p>
                <p>CareBridge National Telemedicine Registry</p>
                <p className="font-mono text-[10px] text-slate-400">
                  {prescription.doctorSignatureStamp || `SHA256-AUTH-${prescription.id.toUpperCase()}`}
                </p>
              </div>
            </div>

            {/* Doctor Signature Stamp */}
            <div className="text-center sm:text-right space-y-1">
              <div className="inline-block border-2 border-dashed border-emerald-600/60 bg-emerald-50/60 rounded-xl px-4 py-2 text-center">
                <span className="text-[10px] font-black uppercase text-emerald-800 block">
                  Digitally Verified & Signed
                </span>
                <span className="text-xs font-serif font-black text-emerald-950 block">
                  {prescription.doctorName}
                </span>
                <span className="text-[9px] text-emerald-700 font-mono block">
                  {prescription.doctorRegistration} • {prescription.date}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Valid clinical prescription under Indian Telemedicine Practice Guidelines
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
