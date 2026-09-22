import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { dataStore } from '../../services/dataStore';
import { FacilityOperationsMetrics, Hospital } from '../../types';
import { 
  Building2, 
  Clock, 
  Users, 
  GitPullRequest, 
  FlaskConical, 
  Pill, 
  Bed, 
  AlertTriangle, 
  Activity, 
  CheckCircle2, 
  Info,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

export const FacilityOperationsPage: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('hosp-apex');
  const [metrics, setMetrics] = useState<FacilityOperationsMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadHospitals();
  }, []);

  useEffect(() => {
    if (selectedFacilityId) {
      loadMetrics(selectedFacilityId);
    }
  }, [selectedFacilityId]);

  const loadHospitals = async () => {
    try {
      const list = await api.getHospitals();
      setHospitals(list);
    } catch (err) {
      console.error('Failed to load hospitals:', err);
    }
  };

  const loadMetrics = async (facId: string) => {
    setLoading(true);
    try {
      const data = await api.getFacilityOperations(facId);
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load operations metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold tracking-wide uppercase mb-3">
              <Activity className="w-3.5 h-3.5 text-teal-600" />
              Clinical Quality & Delay Analytics
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Hospital Operations & Quality Dashboard
            </h1>
            <p className="text-slate-600 mt-2 text-sm sm:text-base max-w-2xl">
              Answers the central administrative and clinical question: <em>"Where is patient care experiencing bottlenecks or delays?"</em> Monitors real-time OPD queues, diagnostic turnaround, referral closures, and pharmacy fulfillment.
            </p>
          </div>

          {/* Facility Selector */}
          <div className="w-full md:w-72">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Select Monitored Facility
            </label>
            <select
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="hosp-apex">CareBridge Apex Hospital (Quaternary)</option>
              <option value="hosp-chc-rampur">Community Health Centre (CHC) Rampur</option>
              <option value="hosp-dist-sitapur">District Hospital Sitapur (Secondary)</option>
            </select>
          </div>
        </div>

        {/* Synthetic Demo Disclaimer */}
        <div className="bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3 text-slate-600 text-xs">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-teal-600 flex-shrink-0" />
            <span>
              <strong>Operational Data Transparency: </strong> Operational wait-times, turnaround hours, and bed occupancy indices are synthetic operational telemetry generated for clinical flow demonstration.
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700 whitespace-nowrap">
            DEMO METRICS
          </span>
        </div>

        {/* Metrics Grid */}
        {loading || !metrics ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 text-sm border border-slate-200">
            Calculating live facility queue dynamics...
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* OPD Queue */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">OPD Wait Time</span>
                  <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-slate-900">{metrics.averageConsultationWaitMinutes} <span className="text-sm font-normal text-slate-500">mins</span></div>
                <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                  <span className="font-semibold text-slate-700">{metrics.opdQueueCount} patients</span> currently waiting in OPD
                </div>
              </div>

              {/* Referrals Closure */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Referral Completion</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <GitPullRequest className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-blue-600">{metrics.completedReferralsRatePercent}%</div>
                <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                  <span className="font-semibold text-slate-700">{metrics.pendingReferralsCount} referrals</span> in transit / triage intake
                </div>
              </div>

              {/* Diagnostic Turnaround */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lab Turnaround</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <FlaskConical className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-purple-600">{metrics.diagnosticTurnaroundAverageHours} <span className="text-sm font-normal text-slate-500">hrs</span></div>
                <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                  Average time from collection to signed report
                </div>
              </div>

              {/* Pharmacy Fulfillment */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Drug Availability</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Pill className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-emerald-600">{metrics.pharmacyFulfillmentRatePercent}%</div>
                <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                  Jan Aushadhi essential regimen in stock
                </div>
              </div>

            </div>

            {/* Delay Diagnostics & Bed Status */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Delay Analysis Table */}
              <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
                <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                  <span>Care Delay Root-Cause Analysis</span>
                  <span className="text-xs font-medium text-slate-500">Live Clinical Flow</span>
                </h2>

                <div className="space-y-4 text-xs">
                  {/* Item 1 */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between gap-4">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">OPD Consultation Queue Delay</div>
                      <p className="text-slate-600 mt-0.5 leading-relaxed">
                        Average wait time is {metrics.averageConsultationWaitMinutes} minutes. Peak morning arrivals (09:00 - 11:30 AM) cause temporary bottlenecking in General Medicine.
                      </p>
                      <div className="text-teal-700 font-semibold mt-1">Recommended intervention: Assisted teleconsult triage routing.</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 whitespace-nowrap">
                      MANAGED
                    </span>
                  </div>

                  {/* Item 2 */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between gap-4">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">Closed-Loop Referral Turnaround</div>
                      <p className="text-slate-600 mt-0.5 leading-relaxed">
                        {metrics.pendingReferralsCount} inbound referrals pending specialist slot confirmation. Average scheduling latency: 4.8 hours.
                      </p>
                      <div className="text-blue-700 font-semibold mt-1">Recommended intervention: Auto-slot reservation for priority cardiac cases.</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 whitespace-nowrap">
                      ON TRACK
                    </span>
                  </div>

                  {/* Item 3 */}
                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex items-start justify-between gap-4">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">Overdue High-Risk Follow-Ups</div>
                      <p className="text-slate-600 mt-0.5 leading-relaxed">
                        {metrics.overdueFollowUpsCount} diabetic and hypertensive care plan tasks past deadline. Frontline ASHA home visits alerted.
                      </p>
                      <div className="text-amber-800 font-semibold mt-1">Recommended intervention: ASHA worker dispatch for home blood pressure check.</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 whitespace-nowrap">
                      ATTENTION
                    </span>
                  </div>
                </div>
              </div>

              {/* Critical Care Bed Occupancy */}
              <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
                <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                  <span>Critical Care & Emergency Beds</span>
                  <span className="text-xs font-medium text-slate-500">24x7 Trauma</span>
                </h2>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                    <Bed className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-slate-900">
                      {metrics.criticalCareBedsOccupied} / {metrics.criticalCareBedsTotal}
                    </div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-1">
                      ICU / Trauma Beds Occupied
                    </div>
                  </div>

                  <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden mt-3">
                    <div 
                      className="bg-rose-600 h-full rounded-full transition-all"
                      style={{ width: `${(metrics.criticalCareBedsOccupied / metrics.criticalCareBedsTotal) * 100}%` }}
                    />
                  </div>

                  <div className="text-xs text-slate-600 pt-1">
                    <strong>{metrics.criticalCareBedsTotal - metrics.criticalCareBedsOccupied} critical care beds</strong> currently available for emergency trauma intake.
                  </div>
                </div>

                <div className="text-xs text-slate-500 space-y-2 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between">
                    <span>Emergency Hotline</span>
                    <strong className="text-rose-600">1066 (Active)</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Ambulance Response Time</span>
                    <strong className="text-slate-800">11.4 mins avg</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Telemetry Status</span>
                    <strong className="text-emerald-700 font-semibold">Continuous Sync</strong>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
