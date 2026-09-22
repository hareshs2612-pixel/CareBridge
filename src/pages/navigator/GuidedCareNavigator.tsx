import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { dataStore } from '../../services/dataStore';
import { api } from '../../services/api';
import { 
  UserProfile, 
  TriageTier, 
  TriageAssessment, 
  HealthcareFacility 
} from '../../types';
import { 
  Compass, 
  AlertTriangle, 
  ShieldCheck, 
  Activity, 
  MapPin, 
  Clock, 
  ArrowRight, 
  RotateCcw, 
  PhoneCall, 
  Video,
  Calendar,
  Building2,
  CheckCircle2,
  HelpCircle,
  HeartPulse
} from 'lucide-react';

interface SymptomScenario {
  id: string;
  label: string;
  tier: TriageTier;
  symptoms: string[];
  category: string;
  flags: string[];
  guidance: string;
  facilityRecommendation: string;
}

const SYMPTOM_SCENARIOS: SymptomScenario[] = [
  {
    id: 'sc-1',
    label: 'Chest pain, left arm tightness, acute shortness of breath',
    tier: 'emergency',
    symptoms: ['Crushing chest pain', 'Left arm radiation', 'Shortness of breath', 'Cold sweats'],
    category: 'Cardiovascular Emergency',
    flags: ['chest_pain_severe', 'dyspnea_severe'],
    guidance: 'CRITICAL EMERGENCY: Do not attempt to travel alone or drive. Immediately dial Emergency Hotline 1066 or Ambulance 108. Maintain seated posture.',
    facilityRecommendation: 'CareBridge Apex Emergency Trauma Centre'
  },
  {
    id: 'sc-2',
    label: 'High fever (103°F) with confusion and severe abdominal cramping',
    tier: 'urgent',
    symptoms: ['Persistent high fever > 103°F', 'Severe abdominal pain', 'Repeated vomiting'],
    category: 'Acute Systemic / Abdominal',
    flags: ['high_fever', 'severe_abdominal_pain'],
    guidance: 'Urgent medical assessment needed within 2-4 hours. Proceed to the nearest hospital emergency OPD for intravenous hydration and blood work.',
    facilityRecommendation: 'CareBridge Apex Fast-Track OPD'
  },
  {
    id: 'sc-3',
    label: 'Elevated morning blood glucose (160+ mg/dL) & headache with BP 150/95',
    tier: 'priority_consultation',
    symptoms: ['Elevated blood glucose', 'Persistent morning headache', 'Hypertensive reading'],
    category: 'Chronic Metabolic Flare',
    flags: ['chronic_flare', 'hypertension_symptom'],
    guidance: 'Specialist physician review recommended within 24-48 hours. Continue prescribed maintenance dose and schedule an expedited OPD or assisted teleconsult.',
    facilityRecommendation: 'Community Health Centre (CHC) Rampur - Internal Medicine OPD'
  },
  {
    id: 'sc-4',
    label: 'Mild seasonal dry cough, nasal congestion & throat irritation (3 days)',
    tier: 'routine_consultation',
    symptoms: ['Dry cough', 'Nasal congestion', 'Sore throat'],
    category: 'Upper Respiratory Infection',
    flags: [],
    guidance: 'Routine outpatient consultation recommended within 3-7 days if unresolved. Maintain oral hydration and saline gargles.',
    facilityRecommendation: 'Primary Health Centre (PHC) Outpatient Clinic'
  },
  {
    id: 'sc-5',
    label: 'Minor muscle soreness after farm work / routine dietary queries',
    tier: 'low_priority',
    symptoms: ['Mild muscular ache', 'General fatigue'],
    category: 'Musculoskeletal / Wellness',
    flags: [],
    guidance: 'Self-care and supportive rest indicated. Consider over-the-counter paracetamol or topical balm from a Jan Aushadhi Kendra if discomfort persists.',
    facilityRecommendation: 'Sub-Centre Bilaspur & Community Pharmacy'
  }
];

export const GuidedCareNavigator: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserProfile>(dataStore.getCurrentUser());
  const [facilities] = useState<HealthcareFacility[]>(dataStore.getFacilities());

  // Input states
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('sc-3');
  const [customSymptoms, setCustomSymptoms] = useState<string>('');
  const [duration, setDuration] = useState<string>('2-3 days');
  const [spo2, setSpo2] = useState<string>('');
  const [pulse, setPulse] = useState<string>('');
  const [temperature, setTemperature] = useState<string>('');
  const [bloodPressure, setBloodPressure] = useState<string>('');
  const [hasSeverePain, setHasSeverePain] = useState<boolean>(false);
  const [hasBreathingDifficulty, setHasBreathingDifficulty] = useState<boolean>(false);

  // Result state
  const [assessment, setAssessment] = useState<TriageAssessment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [syncNotice, setSyncNotice] = useState<string>('');

  useEffect(() => {
    return dataStore.subscribe(() => {
      setCurrentUser(dataStore.getCurrentUser());
    });
  }, []);

  const handleScenarioSelect = (scenario: SymptomScenario) => {
    setSelectedScenarioId(scenario.id);
    setCustomSymptoms(scenario.symptoms.join(', '));
    setHasBreathingDifficulty(scenario.flags.includes('dyspnea_severe'));
    setHasSeverePain(scenario.flags.includes('chest_pain_severe') || scenario.flags.includes('severe_abdominal_pain'));
  };

  const handleRunTriage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSyncNotice('');

    const activeScenario = SYMPTOM_SCENARIOS.find(s => s.id === selectedScenarioId);
    const symptomsList = customSymptoms
      ? customSymptoms.split(',').map(s => s.trim()).filter(Boolean)
      : (activeScenario ? activeScenario.symptoms : ['General health evaluation']);

    const severityFlags: string[] = [];
    if (hasBreathingDifficulty) severityFlags.push('dyspnea_severe');
    if (hasSeverePain) severityFlags.push('chest_pain_severe');

    const vitalsPayload: any = {};
    if (temperature) vitalsPayload.temperatureF = parseFloat(temperature);
    if (pulse) vitalsPayload.pulseBpm = parseInt(pulse, 10);
    if (spo2) vitalsPayload.spo2 = parseInt(spo2, 10);
    if (bloodPressure) vitalsPayload.bloodPressure = bloodPressure;

    const payload = {
      patientId: currentUser.uid || 'pat-ramesh',
      patientName: currentUser.fullName || 'Patient',
      symptoms: symptomsList,
      duration,
      severityFlags,
      vitals: vitalsPayload,
      assessedByRole: (currentUser.role === 'doctor' ? 'doctor' : (currentUser.role === 'healthcare_worker' ? 'healthcare_worker' : 'patient')) as any,
      assessedById: currentUser.uid,
      nearestFacilityRecommended: activeScenario?.facilityRecommendation || 'CareBridge Apex Hospital'
    };

    try {
      const res = await api.submitTriage(payload);
      setAssessment(res);
    } catch (err) {
      console.warn('[TRIAGE] API failed, queuing offline sync:', err);
      dataStore.addPendingSync({
        action: 'create_triage',
        payload
      });
      setSyncNotice('Assessment saved locally. Queued for server sync upon connection.');
      // Local evaluation fallback
      setAssessment({
        id: `tri_local_${Date.now()}`,
        patientId: payload.patientId,
        patientName: payload.patientName,
        assessedAt: new Date().toISOString(),
        symptoms: payload.symptoms,
        duration: payload.duration,
        severityFlags: payload.severityFlags,
        vitals: payload.vitals,
        tier: hasSeverePain || hasBreathingDifficulty ? 'emergency' : 'priority_consultation',
        recommendedCarePath: hasSeverePain || hasBreathingDifficulty ? 'Immediate Emergency Evaluation' : 'Priority Physician OPD',
        clinicalGuidance: 'Please consult an attending physician for direct examination.',
        followUpWindowHours: hasSeverePain ? 0 : 24,
        assessedByRole: payload.assessedByRole,
        status: 'active'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTierBadge = (tier: TriageTier) => {
    switch (tier) {
      case 'emergency':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-800',
          badge: 'bg-rose-600 text-white',
          title: 'TIER 5: EMERGENCY CARE',
          subtitle: 'Immediate Hospital Transfer / Dial 1066'
        };
      case 'urgent':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-900',
          badge: 'bg-amber-600 text-white',
          title: 'TIER 4: URGENT CARE',
          subtitle: 'Evaluation recommended within 2 to 4 Hours'
        };
      case 'priority_consultation':
        return {
          bg: 'bg-blue-50 border-blue-200 text-blue-900',
          badge: 'bg-blue-600 text-white',
          title: 'TIER 3: PRIORITY CONSULTATION',
          subtitle: 'Physician review within 24 to 48 Hours'
        };
      case 'routine_consultation':
        return {
          bg: 'bg-teal-50 border-teal-200 text-teal-900',
          badge: 'bg-teal-600 text-white',
          title: 'TIER 2: ROUTINE OUTPATIENT',
          subtitle: 'Clinic consultation within 3 to 7 Days'
        };
      case 'low_priority':
      default:
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
          badge: 'bg-emerald-600 text-white',
          title: 'TIER 1: LOW PRIORITY / SELF-CARE',
          subtitle: 'Home management & pharmacy supportive guidance'
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Banner */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold tracking-wide uppercase mb-3">
              <Compass className="w-3.5 h-3.5 text-teal-600" />
              CareBridge Clinical Decision Support
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              5-Tier Digital Triage & Guided Navigation
            </h1>
            <p className="text-slate-600 mt-2 text-sm sm:text-base max-w-2xl">
              Standardized clinical triage assessment. Identifies severity flags, directs to the appropriate facility level, and connects seamlessly to appointments or emergency hotlines.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <a
              href="tel:1066"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
            >
              <PhoneCall className="w-4 h-4" />
              Hotline 1066
            </a>
            <Link
              to="/facilities"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-xl border border-slate-200 transition-colors"
            >
              <Building2 className="w-4 h-4 text-slate-600" />
              Find Facility
            </Link>
          </div>
        </div>

        {/* Clinical Disclaimer */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-amber-900 text-xs sm:text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Clinical Protocol Notice: </span>
            This automated triage assistant utilizes evidence-based severity algorithms to recommend care levels. It is designed to assist care routing and does not replace in-person clinical diagnosis. For life-threatening emergencies, proceed to the nearest casualty unit immediately.
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Triage Assessment Form */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleRunTriage} className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                <span>Patient Assessment Intake</span>
                <span className="text-xs font-normal text-slate-500">Step 1 of 2</span>
              </h2>

              {/* Preset Scenarios Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Select Common Presentation (or type custom)
                </label>
                <div className="space-y-2">
                  {SYMPTOM_SCENARIOS.map(sc => (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => handleScenarioSelect(sc)}
                      className={`w-full text-left p-3 rounded-xl border text-sm transition-all flex items-start justify-between gap-3 ${
                        selectedScenarioId === sc.id
                          ? 'border-teal-500 bg-teal-50/50 shadow-sm font-medium text-slate-900 ring-1 ring-teal-500'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-slate-500">{sc.category}</div>
                        <div className="text-sm mt-0.5">{sc.label}</div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        sc.tier === 'emergency' ? 'bg-rose-100 text-rose-700' :
                        sc.tier === 'urgent' ? 'bg-amber-100 text-amber-700' :
                        sc.tier === 'priority_consultation' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {sc.tier.replace(/_/g, ' ')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Symptom Details */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Active Symptoms & Clinical Description
                </label>
                <textarea
                  rows={3}
                  value={customSymptoms}
                  onChange={(e) => setCustomSymptoms(e.target.value)}
                  placeholder="e.g. Sharp pain in chest, radiating to left shoulder, started 2 hours ago..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-slate-900 placeholder:text-slate-400"
                />
              </div>

              {/* Duration & Vitals */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Symptom Duration
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="Less than 2 hours">Less than 2 hours (Acute)</option>
                    <option value="2 to 12 hours">2 to 12 hours</option>
                    <option value="24 to 48 hours">24 to 48 hours</option>
                    <option value="3 to 7 days">3 to 7 days</option>
                    <option value="More than 1 week">More than 1 week (Chronic)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Blood Pressure (Sitting)
                  </label>
                  <input
                    type="text"
                    value={bloodPressure}
                    onChange={(e) => setBloodPressure(e.target.value)}
                    placeholder="e.g. 140/90 mmHg"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Optional Physiological Readings */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Pulse (bpm)</label>
                  <input
                    type="number"
                    value={pulse}
                    onChange={(e) => setPulse(e.target.value)}
                    placeholder="e.g. 78"
                    className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">SpO2 (%)</label>
                  <input
                    type="number"
                    value={spo2}
                    onChange={(e) => setSpo2(e.target.value)}
                    placeholder="e.g. 98"
                    className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Temp (°F)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    placeholder="e.g. 98.6"
                    className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Red Flag Checkboxes */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700">Immediate Clinical Flags</div>
                <label className="flex items-center gap-2.5 text-sm text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasBreathingDifficulty}
                    onChange={(e) => setHasBreathingDifficulty(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>Significant difficulty breathing or blue lips/fingertips</span>
                </label>
                <label className="flex items-center gap-2.5 text-sm text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasSeverePain}
                    onChange={(e) => setHasSeverePain(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>Severe crushing chest pain or acute unmanageable pain (8+/10)</span>
                </label>
              </div>

              <div className="pt-2 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setCustomSymptoms('');
                    setBloodPressure('');
                    setPulse('');
                    setSpo2('');
                    setTemperature('');
                    setHasBreathingDifficulty(false);
                    setHasSeverePain(false);
                    setAssessment(null);
                  }}
                  className="px-4 py-2.5 text-sm text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Form
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <HeartPulse className="w-4 h-4" />
                  {isSubmitting ? 'Evaluating Algorithm...' : 'Evaluate Clinical Triage'}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Triage Result & Care Pathway */}
          <div className="lg:col-span-5 space-y-6">
            {assessment ? (
              <div className={`rounded-2xl p-6 shadow-sm border ${getTierBadge(assessment.tier).bg} space-y-5 transition-all`}>
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getTierBadge(assessment.tier).badge}`}>
                    {assessment.tier.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Window: {assessment.followUpWindowHours === 0 ? 'Immediate' : `${assessment.followUpWindowHours}h`}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {getTierBadge(assessment.tier).title}
                  </h3>
                  <p className="text-sm font-medium mt-1 text-slate-700">
                    {getTierBadge(assessment.tier).subtitle}
                  </p>
                </div>

                {/* Recommended Path Box */}
                <div className="bg-white/90 p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-2">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recommended Pathway</div>
                  <div className="text-sm font-semibold text-slate-900">{assessment.recommendedCarePath}</div>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">{assessment.clinicalGuidance}</p>
                </div>

                {/* Nearest Recommended Facility */}
                {assessment.nearestFacilityRecommended && (
                  <div className="bg-white/90 p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Designated Facility</div>
                      <div className="text-sm font-semibold text-slate-900 mt-0.5">{assessment.nearestFacilityRecommended}</div>
                    </div>
                    <Link
                      to="/facilities"
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200 transition-colors"
                    >
                      View Map
                    </Link>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 space-y-2.5">
                  {assessment.tier === 'emergency' ? (
                    <a
                      href="tel:1066"
                      className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors"
                    >
                      <PhoneCall className="w-4 h-4" />
                      Dial Emergency Hotline 1066 Now
                    </a>
                  ) : (
                    <>
                      <Link
                        to="/appointments/book"
                        className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
                      >
                        <Calendar className="w-4 h-4" />
                        Book In-Person Appointment
                      </Link>
                      {assessment.teleconsultRecommended && (
                        <Link
                          to="/teleconsult"
                          className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm rounded-xl border border-slate-300 flex items-center justify-center gap-2 transition-colors"
                        >
                          <Video className="w-4 h-4 text-teal-600" />
                          Start Assisted Teleconsultation
                        </Link>
                      )}
                    </>
                  )}

                  <Link
                    to="/referrals"
                    className="w-full py-2 px-4 text-slate-600 hover:text-slate-900 text-xs font-medium text-center block transition-colors"
                  >
                    View Closed-Loop Referrals &rarr;
                  </Link>
                </div>

                {syncNotice && (
                  <div className="text-[11px] text-teal-700 bg-teal-50 p-2 rounded-lg border border-teal-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {syncNotice}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto border border-teal-100">
                  <Activity className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Awaiting Triage Assessment</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Select a clinical presentation or input patient symptoms, duration, and vitals on the left to evaluate severity.
                  </p>
                </div>
                <div className="border-t border-slate-100 pt-4 text-left space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">5 Clinical Tiers</div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>Tier 5: Emergency (Hotline 1066 / 0h)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>Tier 4: Urgent Care (2-4 hours)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span>Tier 3: Priority Consultation (24-48 hours)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                    <span>Tier 2: Routine Outpatient (3-7 days)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Tier 1: Low Priority / Self-Care</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Facility Delay Widget */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Central OPD Wait Status</span>
                <span className="text-[11px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-medium">Live Demo</span>
              </div>
              <div className="text-sm font-bold text-slate-900">CareBridge Apex Hospital</div>
              <div className="grid grid-cols-2 gap-3 pt-1 text-center">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="text-lg font-extrabold text-teal-700">18 min</div>
                  <div className="text-[10px] text-slate-500 uppercase font-medium">Avg OPD Wait</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="text-lg font-extrabold text-blue-700">28</div>
                  <div className="text-[10px] text-slate-500 uppercase font-medium">Current Queue</div>
                </div>
              </div>
              <Link
                to="/facility-operations"
                className="text-xs text-teal-600 hover:text-teal-700 font-semibold block text-center pt-1"
              >
                View Full Operational Dashboard &rarr;
              </Link>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
