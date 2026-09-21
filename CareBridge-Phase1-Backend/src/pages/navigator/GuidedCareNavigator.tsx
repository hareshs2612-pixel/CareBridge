import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { dataStore } from '../../services/dataStore';
import { 
  UserProfile, 
  PatientProfile, 
  TriageAssessment, 
  TriageSeverity, 
  ReferralRecord,
  HealthcareFacility 
} from '../../types';
import { 
  Compass, 
  AlertTriangle, 
  ShieldCheck, 
  Activity, 
  MapPin, 
  Clock, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  RotateCcw, 
  Sparkles, 
  HelpCircle, 
  PhoneCall, 
  Send,
  Building2,
  Share2
} from 'lucide-react';

const COMMON_SYMPTOM_PRESETS = [
  {
    id: 's-1',
    label: 'High morning blood sugar + fatigue',
    category: 'Chronic Metabolic',
    severity: 'consult_soon' as TriageSeverity,
    recommendedCareLevel: 'Community Health Centre (CHC) - General Physician OPD',
    primaryAction: 'Physician consultation within 24-48 hours. Review Metformin & Telmisartan adherence. Check fasting blood sugar.',
    suggestedFacilityId: 'fac-02',
    warningFlags: ['Fasting sugar persistently > 140 mg/dL', 'Morning dizziness or blurred vision'],
    selfCareGuidance: ['Avoid sweets and refined flours', 'Maintain regular hydration with boiled water', 'Do not double medicine doses without doctor instruction']
  },
  {
    id: 's-2',
    label: 'Chest pain, shortness of breath, sweating',
    category: 'Emergency Cardiovascular',
    severity: 'emergency' as TriageSeverity,
    recommendedCareLevel: 'Emergency Room / District Hospital Trauma Centre',
    primaryAction: 'Call 108 immediately. Do NOT drive or travel alone. Keep patient calm in resting position.',
    suggestedFacilityId: 'fac-04',
    warningFlags: ['Chest heaviness radiating to left arm/jaw', 'Cold sweats with acute breathlessness'],
    selfCareGuidance: ['Do not consume heavy foods or water', 'Keep emergency contacts alerted', 'Keep patient in semi-upright seated posture']
  },
  {
    id: 's-3',
    label: 'Mild seasonal dry cough & dust irritation',
    category: 'Frontline Primary',
    severity: 'self_care' as TriageSeverity,
    recommendedCareLevel: 'Health Sub-Centre Bilaspur or Home Care',
    primaryAction: 'Warm saline gargles, steam inhalation, and hydration. Visit Sub-Centre if symptoms persist past 5 days.',
    suggestedFacilityId: 'fac-03',
    warningFlags: ['Fever above 101°F', 'Blood-tinged phlegm or chest pain on coughing'],
    selfCareGuidance: ['Drink warm ginger/tulsi boiled water', 'Cover mouth with cloth during farm threshing', 'Rest indoors during midday dust']
  },
  {
    id: 's-4',
    label: 'Pregnancy 2nd trimester: Routine checkup & mild swelling',
    category: 'Maternal & Child Health',
    severity: 'consult_soon' as TriageSeverity,
    recommendedCareLevel: 'Primary Health Centre (PHC) - ANC Clinic',
    primaryAction: 'Scheduled antenatal checkup at PHC Mohanpur. Screen blood pressure, urine protein, and weight.',
    suggestedFacilityId: 'fac-01',
    warningFlags: ['Sudden severe facial swelling', 'Severe headache or blurred vision', 'Decreased fetal movements'],
    selfCareGuidance: ['Daily Iron & Folic Acid tablet after meals', 'Elevate feet when resting', 'Avoid heavy agricultural lifting']
  },
  {
    id: 's-5',
    label: 'Watery diarrhea (3+ times) & mild thirst',
    category: 'Acute Gastrointestinal',
    severity: 'consult_soon' as TriageSeverity,
    recommendedCareLevel: 'PHC or Sub-Centre Oral Rehydration Point',
    primaryAction: 'Start Oral Rehydration Solution (ORS) immediately after every loose motion. Zinc 20mg daily.',
    suggestedFacilityId: 'fac-01',
    warningFlags: ['Inability to retain liquids', 'High fever, dark urine, or extreme lethargy'],
    selfCareGuidance: ['1 ORS packet dissolved in exactly 1 Liter clean boiled water', 'Continue light boiled rice / dalia', 'Avoid unboiled well water']
  }
];

export const GuidedCareNavigator: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(dataStore.getCurrentUser());
  const [patient, setPatient] = useState<PatientProfile | undefined>(dataStore.getPatientById(currentUser.uid));
  const [facilities, setFacilities] = useState<HealthcareFacility[]>(dataStore.getFacilities());
  
  // Input state
  const [selectedPresetId, setSelectedPresetId] = useState<string>('s-1');
  const [customSymptomText, setCustomSymptomText] = useState<string>('');
  const [durationDays, setDurationDays] = useState<string>('2');
  const [hasRedFlags, setHasRedFlags] = useState<boolean>(false);
  
  // Triage assessment state
  const [assessment, setAssessment] = useState<TriageAssessment | null>(null);
  const [createdReferral, setCreatedReferral] = useState<ReferralRecord | null>(null);
  const [isReferralCreated, setIsReferralCreated] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    const user = dataStore.getCurrentUser();
    setCurrentUser(user);
    setPatient(dataStore.getPatientById(user.uid));
    setFacilities(dataStore.getFacilities());
  }, []);

  const handleRunTriage = () => {
    const preset = COMMON_SYMPTOM_PRESETS.find(p => p.id === selectedPresetId);
    let severity: TriageSeverity = preset ? preset.severity : 'consult_soon';
    
    // Safety rules override:
    const lowerText = customSymptomText.toLowerCase();
    if (
      hasRedFlags || 
      lowerText.includes('chest pain') || 
      lowerText.includes('cannot breathe') || 
      lowerText.includes('unconscious') ||
      lowerText.includes('choking') ||
      lowerText.includes('severe bleeding')
    ) {
      severity = 'emergency';
    }

    const matchedFacility = facilities.find(f => {
      if (severity === 'emergency') return f.type === 'District Hospital' || f.has24x7Emergency;
      if (severity === 'consult_soon') return f.id === preset?.suggestedFacilityId || f.type.includes('CHC') || f.type.includes('PHC');
      return f.type.includes('Sub-Centre') || f.id === 'fac-03';
    }) || facilities[0];

    let recommendedCareLevel = preset?.recommendedCareLevel || 'Public Healthcare Centre (PHC/CHC)';
    let primaryAction = preset?.primaryAction || 'Please consult the on-duty Medical Officer at your nearest Community Health Centre.';
    let warningFlags = preset?.warningFlags || ['Rapidly worsening pain', 'Fever with chills', 'Inability to eat or drink'];
    let selfCare = preset?.selfCareGuidance || ['Drink safe, boiled drinking water', 'Rest in a well-ventilated room'];

    if (severity === 'emergency') {
      recommendedCareLevel = 'Level 3 Emergency / District Hospital Trauma Facility';
      primaryAction = 'IMMEDIATE EMERGENCY: Dial 108 or proceed at once to Sitapur District Hospital. Alert family members.';
      warningFlags = ['Acute respiratory compromise', 'Cardiovascular distress', 'Sudden neurological symptoms'];
      selfCare = ['Do not walk unassisted', 'Loosen tight clothing', 'Prepare Emergency Minimum Dataset'];
    }

    const newAssessment: TriageAssessment = {
      id: `trg-${Date.now()}`,
      patientId: currentUser.uid,
      symptoms: [preset?.label || 'General symptom consultation', ...(customSymptomText ? [customSymptomText] : [])],
      userDescription: customSymptomText,
      severity,
      severityLabel: severity === 'emergency' 
        ? 'Urgent Emergency Care Needed' 
        : severity === 'consult_soon' 
          ? 'Doctor Consultation Recommended (Within 24-48h)' 
          : 'Sub-Centre / Safe Self-Care Guidance',
      recommendedCareLevel,
      primaryAction,
      warningFlags,
      selfCareGuidance: selfCare,
      suggestedFacilityId: matchedFacility.id,
      suggestedFacilityName: matchedFacility.name,
      disclaimer: 'CareBridge Decision Support: This is a safe non-diagnostic triage system designed to guide rural patients to the appropriate public healthcare facility. It does not replace clinical evaluation or official emergency services.',
      timestamp: new Date().toISOString()
    };

    setAssessment(newAssessment);
    setIsReferralCreated(false);
    setCreatedReferral(null);

    dataStore.addAuditLog({
      actorId: currentUser.uid,
      actorName: currentUser.fullName,
      actorRole: currentUser.role,
      action: 'AI_SUMMARIZATION_REQUESTED',
      resourceType: 'health_record',
      patientId: currentUser.uid,
      details: `Care Navigator Triage completed: ${newAssessment.severity.toUpperCase()} [Level: ${recommendedCareLevel}]`
    });
  };

  const handleGenerateReferralCard = () => {
    if (!assessment) return;
    const destFacility = facilities.find(f => f.id === assessment.suggestedFacilityId) || facilities[1];

    const newReferral: ReferralRecord = {
      id: `ref-${Date.now()}`,
      patientId: currentUser.uid,
      patientName: currentUser.fullName,
      patientAbhaId: currentUser.abhaId || '91-8724-1029-4412',
      patientAge: patient?.dob ? (new Date().getFullYear() - new Date(patient.dob).getFullYear()) : 52,
      patientGender: patient?.gender ? (patient.gender === 'male' ? 'Male' : 'Female') : 'Male',
      patientBloodGroup: patient?.bloodGroup || 'B+',
      referringProviderId: 'carebridge-triage',
      referringProviderName: 'CareBridge Guided Triage System',
      referringRole: 'Verified Triage Protocol',
      referringFacility: 'Frontline Self-Assessment / Sub-Centre Bilaspur',
      destinationFacilityId: destFacility.id,
      destinationFacilityName: destFacility.name,
      specialtyNeeded: assessment.severity === 'emergency' ? 'Emergency Medicine / Trauma' : 'General Medicine & Diabetology',
      urgency: assessment.severity === 'emergency' ? 'immediate_emergency' : assessment.severity === 'consult_soon' ? 'urgent' : 'routine',
      reasonForReferral: assessment.symptoms.join(', ') + (customSymptomText ? ` (${customSymptomText})` : ''),
      clinicalSummary: `Patient presenting with ${assessment.symptoms.join(', ')} for ${durationDays} days. Pre-existing conditions: ${patient?.chronicConditions.map(c => c.name).join(', ') || 'None reported'}.`,
      criticalAllergies: patient?.emergencyMinimumDataset.criticalAllergies || ['Penicillin (LIFE-THREATENING)'],
      status: 'initiated',
      createdAt: new Date().toISOString()
    };

    dataStore.createReferral(newReferral);
    setCreatedReferral(newReferral);
    setIsReferralCreated(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold">
            <Compass className="w-3.5 h-3.5" />
            <span>Step 1 & 2 of CareBridge Care Continuity</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Guided Care Navigator & Safe Triage
          </h1>
          <p className="text-sm text-teal-100 leading-relaxed">
            Not sure where to go? Describe your health need or symptoms below. CareBridge directs you to the 
            safest, closest public healthcare facility (Sub-Centre, PHC, CHC, or District Hospital) without long travel or unnecessary delays.
          </p>

          <div className="flex items-center gap-2 text-[11px] text-teal-300/90 pt-1">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Non-diagnostic decision support • Doctor retains clinical authority • Aligned with NHM protocols</span>
          </div>
        </div>
      </div>

      {/* Main Input Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">What symptoms or care need are you experiencing?</h2>
              <p className="text-xs text-slate-500">Select a common scenario or type your details</p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedPresetId('s-1');
              setCustomSymptomText('');
              setDurationDays('2');
              setHasRedFlags(false);
              setAssessment(null);
              setIsReferralCreated(false);
            }}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>

        {/* Quick Symptom Chips */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
            Common Rural Health Scenarios
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {COMMON_SYMPTOM_PRESETS.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedPresetId(preset.id)}
                  className={`text-left p-3 rounded-xl border transition flex items-start justify-between gap-2 ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50/80 text-teal-950 font-semibold shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="text-xs font-bold leading-tight">{preset.label}</div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-2">
                      <span className="font-mono uppercase">{preset.category}</span>
                    </div>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Text and Duration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Additional Details / Patient Voice
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Feeling lightheaded when standing up in the afternoon; blood sugar was 145 on home strip yesterday..."
              value={customSymptomText}
              onChange={(e) => setCustomSymptomText(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Duration of symptoms
            </label>
            <select
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="1">Less than 24 hours</option>
              <option value="2">1 to 2 days</option>
              <option value="5">3 to 5 days</option>
              <option value="7">1 to 2 weeks</option>
              <option value="30">More than a month</option>
            </select>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-rose-800 font-semibold p-2 bg-rose-50 border border-rose-200 rounded-lg">
                <input
                  type="checkbox"
                  checked={hasRedFlags}
                  onChange={(e) => setHasRedFlags(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span>Severe pain, fainting, or acute chest pressure</span>
              </label>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleRunTriage}
            className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
          >
            <Sparkles className="w-4 h-4" />
            Analyze & Recommend Care Level
          </button>
        </div>
      </div>

      {/* Triage Assessment Results */}
      {assessment && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className={`rounded-2xl border-2 p-6 shadow-md ${
            assessment.severity === 'emergency'
              ? 'bg-rose-50 border-rose-400 text-rose-950'
              : assessment.severity === 'consult_soon'
                ? 'bg-amber-50/70 border-amber-300 text-amber-950'
                : 'bg-teal-50/70 border-teal-300 text-teal-950'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/10 pb-4">
              <div className="flex items-start gap-3">
                <div className={`p-3 rounded-2xl text-white ${
                  assessment.severity === 'emergency' ? 'bg-rose-600' : assessment.severity === 'consult_soon' ? 'bg-amber-600' : 'bg-teal-600'
                }`}>
                  {assessment.severity === 'emergency' ? <AlertTriangle className="w-6 h-6" /> : <Activity className="w-6 h-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-white/80">
                      Triage Result: {assessment.severity.toUpperCase().replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {new Date(assessment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black mt-1">
                    {assessment.severityLabel}
                  </h2>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-semibold text-slate-500 block">Recommended Facility Tier</span>
                <span className="text-sm font-extrabold text-slate-900 block">{assessment.recommendedCareLevel}</span>
              </div>
            </div>

            {/* Primary Action Guidance */}
            <div className="mt-4 p-4 rounded-xl bg-white/90 border border-black/5 shadow-xs space-y-2">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ArrowRight className="w-4 h-4 text-teal-600" />
                Primary Care Action:
              </div>
              <p className="text-sm font-semibold text-slate-900 leading-snug">
                {assessment.primaryAction}
              </p>
            </div>

            {/* Grid of details: Warnings & Self Care */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 rounded-xl bg-white/80 border border-black/5 space-y-2">
                <div className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  Red Flag Warning Signs:
                </div>
                <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                  {assessment.warningFlags.map((flag, idx) => (
                    <li key={idx}>{flag}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-white/80 border border-black/5 space-y-2">
                <div className="text-xs font-bold text-teal-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  Safe Interim Guidance:
                </div>
                <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                  {assessment.selfCareGuidance?.map((g, idx) => (
                    <li key={idx}>{g}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-4 pt-3 border-t border-black/10 text-[11px] text-slate-600 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <span>{assessment.disclaimer}</span>
            </div>
          </div>

          {/* Action Step 3: Referral Card Generation */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-teal-600" />
                  Recommended Facility & Pre-filled Referral Card
                </h3>
                <p className="text-xs text-slate-500">
                  CareBridge connects your triage result with the appropriate public health facility.
                </p>
              </div>

              {!isReferralCreated ? (
                <button
                  onClick={handleGenerateReferralCard}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-sm"
                >
                  <FileText className="w-4 h-4" />
                  Generate Digital Referral Card
                </button>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4" />
                  Referral Card Active & Logged
                </span>
              )}
            </div>

            {/* Facility Cues Preview */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-slate-900 text-sm">
                  {assessment.suggestedFacilityName}
                </span>
                <div className="text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>Community Health Centre (CHC)</span>
                  <span>• Distance: ~4.2 km</span>
                  <span>• Wait time: 20-30 mins</span>
                  <span>• Languages: Hindi, Awadhi</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/facilities"
                  className="text-xs text-teal-700 hover:text-teal-800 font-bold flex items-center gap-1 border border-teal-200 bg-teal-50 px-3 py-1.5 rounded-lg"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  View on Map
                </Link>
              </div>
            </div>

            {/* Generated Referral Card Widget */}
            {isReferralCreated && createdReferral && (
              <div className="border-2 border-dashed border-teal-300 rounded-2xl p-5 bg-teal-50/40 space-y-4 animate-in zoom-in-95 duration-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-teal-200 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-teal-700">Digital Referral Pass</span>
                    <h4 className="text-base font-extrabold text-teal-950">Referral #{createdReferral.id.toUpperCase()}</h4>
                  </div>
                  <span className="text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full uppercase">
                    Status: {createdReferral.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px] block">Patient Name</span>
                    <strong className="text-slate-900">{createdReferral.patientName}</strong> ({createdReferral.patientAge}y, {createdReferral.patientGender})
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">ABHA ID</span>
                    <span className="font-mono text-slate-800 text-[11px]">{createdReferral.patientAbhaId}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Referred To</span>
                    <strong className="text-slate-900">{createdReferral.destinationFacilityName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Specialty Needed</span>
                    <span className="text-teal-800 font-bold">{createdReferral.specialtyNeeded}</span>
                  </div>
                </div>

                {/* Critical Allergy Tag */}
                <div className="p-3 bg-rose-100/80 border border-rose-300 rounded-xl text-xs text-rose-950 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <div>
                    <strong>CRITICAL ALLERGY ALERT FOR RECEIVING PHYSICIAN: </strong>
                    <span>{createdReferral.criticalAllergies.join(', ')}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                  <strong>Clinical Reason & Triage Summary:</strong>
                  <p className="text-slate-600">{createdReferral.reasonForReferral}</p>
                </div>

                {/* Quick actions: Grant Consent & Go to Continuity */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <p className="text-[11px] text-slate-500">
                    Shared with ASHA worker Rekha Devi and CHC Rampur OPD desk.
                  </p>
                  <div className="flex items-center gap-2">
                    <Link
                      to="/patient/consents"
                      className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs px-3.5 py-2 rounded-xl transition"
                    >
                      Configure Sharing Permissions
                    </Link>
                    <Link
                      to="/patient"
                      className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-sm flex items-center gap-1"
                    >
                      Return to Dashboard
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
