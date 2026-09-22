import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { dataStore } from '../../services/dataStore';
import { Referral, ReferralStatus, ReferralPriority, UserProfile } from '../../types';
import { 
  GitPullRequest, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Calendar, 
  User, 
  Building2, 
  Search, 
  Filter, 
  Plus, 
  FileText, 
  ChevronRight, 
  Send, 
  Check, 
  X,
  Stethoscope
} from 'lucide-react';

export const ReferralManagementPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(dataStore.getCurrentUser());
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // New Referral Form state
  const [patientId, setPatientId] = useState<string>('pat-ramesh');
  const [patientName, setPatientName] = useState<string>('Ramesh Kumar');
  const [patientPhone, setPatientPhone] = useState<string>('+919415012345');
  const [specialtyRequired, setSpecialtyRequired] = useState<string>('Cardiology & Preventative Nephrology');
  const [destinationFacilityId, setDestinationFacilityId] = useState<string>('hosp-apex');
  const [destinationFacilityName, setDestinationFacilityName] = useState<string>('CareBridge Apex Hospital & Heart Centre');
  const [priority, setPriority] = useState<ReferralPriority>('priority');
  const [clinicalReason, setClinicalReason] = useState<string>('');
  const [provisionalDiagnosis, setProvisionalDiagnosis] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Status transition state
  const [feedbackNotes, setFeedbackNotes] = useState<string>('');
  const [schedulingDate, setSchedulingDate] = useState<string>('2026-09-28');

  useEffect(() => {
    loadReferrals();
  }, []);

  const loadReferrals = async () => {
    setLoading(true);
    try {
      const list = await api.getReferrals();
      setReferrals(list);
    } catch (err) {
      console.error('Failed to load referrals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicalReason) return;
    setSubmitting(true);
    try {
      const created = await api.createReferral({
        patientId,
        patientName,
        patientPhone,
        referringDoctorId: currentUser.role === 'doctor' ? currentUser.uid : 'doc-sharma',
        referringDoctorName: currentUser.role === 'doctor' ? currentUser.fullName : 'Dr. Anita Sharma',
        referringFacilityId: 'hosp-chc-rampur',
        referringFacilityName: 'Community Health Centre (CHC) Rampur',
        destinationFacilityId,
        destinationFacilityName,
        specialtyRequired,
        priority,
        clinicalReason,
        provisionalDiagnosis: provisionalDiagnosis || 'Clinical escalation'
      });
      setReferrals([created, ...referrals]);
      setShowCreateModal(false);
      setClinicalReason('');
      setProvisionalDiagnosis('');
    } catch (err) {
      console.error('Failed to create referral:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (referralId: string, nextStatus: ReferralStatus) => {
    try {
      const updated = await api.updateReferralStatus(referralId, {
        status: nextStatus,
        notes: feedbackNotes || `Transitioned to ${nextStatus}`,
        actorId: currentUser.uid,
        actorName: currentUser.fullName,
        actorRole: currentUser.role,
        scheduledDate: nextStatus === 'APPOINTMENT_SCHEDULED' ? schedulingDate : undefined,
        feedbackReport: nextStatus === 'COMPLETED' ? feedbackNotes : undefined
      });
      setReferrals(referrals.map(r => r.id === referralId ? updated : r));
      setSelectedReferral(updated);
      setFeedbackNotes('');
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const getStatusBadge = (status: ReferralStatus) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'SENT':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'RECEIVED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'ACCEPTED':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'APPOINTMENT_SCHEDULED':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CLOSED':
        return 'bg-slate-800 text-white border-slate-700';
      case 'REJECTED':
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getPriorityBadge = (p: ReferralPriority) => {
    switch (p) {
      case 'emergency':
        return 'bg-rose-600 text-white';
      case 'urgent':
        return 'bg-amber-500 text-white';
      case 'priority':
        return 'bg-blue-500 text-white';
      case 'routine':
      default:
        return 'bg-slate-200 text-slate-800';
    }
  };

  const filteredReferrals = referrals.filter(r => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.patientName.toLowerCase().includes(q) ||
        r.specialtyRequired.toLowerCase().includes(q) ||
        r.destinationFacilityName.toLowerCase().includes(q) ||
        r.referringFacilityName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold tracking-wide uppercase mb-3">
              <GitPullRequest className="w-3.5 h-3.5 text-teal-600" />
              CareBridge Clinical Coordination
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Closed-Loop Referral Management
            </h1>
            <p className="text-slate-600 mt-2 text-sm sm:text-base max-w-2xl">
              End-to-end clinical accountability. Tracks patient transition from primary health centre intake to quaternary hospital consultation and counter-referral sign-off.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Initiate Clinical Referral
          </button>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by patient, hospital, or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'SENT', 'ACCEPTED', 'APPOINTMENT_SCHEDULED', 'COMPLETED', 'CLOSED'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {st.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Referrals List & Detail Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* List Column */}
          <div className="lg:col-span-7 space-y-4">
            {loading ? (
              <div className="bg-white rounded-2xl p-12 text-center text-slate-400 text-sm border border-slate-200">
                Loading active referral records...
              </div>
            ) : filteredReferrals.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
                <GitPullRequest className="w-10 h-10 text-slate-300 mx-auto" />
                <div className="text-base font-bold text-slate-700">No Referrals Found</div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No referral cases match your search or filter. You can initiate a new referral using the button above.
                </p>
              </div>
            ) : (
              filteredReferrals.map(referral => (
                <div
                  key={referral.id}
                  onClick={() => setSelectedReferral(referral)}
                  className={`bg-white rounded-2xl p-5 shadow-sm border cursor-pointer transition-all hover:border-teal-400 ${
                    selectedReferral?.id === referral.id
                      ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-md'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-slate-900">{referral.patientName}</span>
                        {referral.patientAge && (
                          <span className="text-xs text-slate-500 font-medium">({referral.patientAge}y, {referral.patientGender})</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">Ref ID: {referral.id}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getPriorityBadge(referral.priority)}`}>
                        {referral.priority}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadge(referral.status)}`}>
                        {referral.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Transfer Route */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mt-3 flex items-center justify-between text-xs text-slate-700 gap-2">
                    <div className="truncate">
                      <span className="font-semibold block text-slate-900 truncate">{referral.referringFacilityName}</span>
                      <span className="text-slate-500 truncate">{referral.referringDoctorName}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <div className="truncate text-right">
                      <span className="font-semibold block text-slate-900 truncate">{referral.destinationFacilityName}</span>
                      <span className="text-teal-700 font-medium truncate">{referral.specialtyRequired}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mt-3 italic">
                    "{referral.clinicalReason}"
                  </p>

                  <div className="border-t border-slate-100 pt-3 mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Initiated: {new Date(referral.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-teal-600 font-semibold flex items-center gap-1">
                      View Lifecycle <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Detail & Lifecycle Timeline Column */}
          <div className="lg:col-span-5 space-y-6">
            {selectedReferral ? (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6 sticky top-24">
                <div className="border-b border-slate-100 pb-4">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadge(selectedReferral.status)}`}>
                      {selectedReferral.status.replace(/_/g, ' ')}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getPriorityBadge(selectedReferral.priority)}`}>
                      {selectedReferral.priority} Priority
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mt-2">{selectedReferral.patientName}</h2>
                  <div className="text-xs text-slate-500">Phone: {selectedReferral.patientPhone}</div>
                </div>

                {/* Clinical Notes */}
                <div className="space-y-2 text-xs">
                  <div className="font-bold text-slate-700 uppercase tracking-wider">Clinical Indication & Diagnosis</div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-800 leading-relaxed">
                    <span className="font-semibold block mb-1">Provisional Diagnosis: {selectedReferral.provisionalDiagnosis}</span>
                    {selectedReferral.clinicalReason}
                  </div>
                </div>

                {/* Closed Loop Timeline */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Audit Timeline & Sign-offs</div>
                  <div className="space-y-2.5 pl-2 border-l-2 border-teal-500">
                    {selectedReferral.timeline.map((evt, idx) => (
                      <div key={idx} className="relative pl-3 text-xs">
                        <div className="w-2 h-2 rounded-full bg-teal-600 absolute -left-[17px] top-1" />
                        <div className="flex items-center justify-between text-slate-900 font-semibold">
                          <span>{evt.status.replace(/_/g, ' ')}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">{evt.actorName} ({evt.actorRole})</div>
                        {evt.notes && <div className="text-[11px] text-slate-600 mt-0.5 italic">{evt.notes}</div>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Action Controls */}
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Update Closed-Loop Status</div>
                  
                  {selectedReferral.status === 'SENT' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedReferral.id, 'ACCEPTED')}
                      className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Accept Referral at Destination Hospital
                    </button>
                  )}

                  {selectedReferral.status === 'ACCEPTED' && (
                    <div className="space-y-2">
                      <label className="block text-[11px] font-medium text-slate-600">Select OPD Consultation Date</label>
                      <input
                        type="date"
                        value={schedulingDate}
                        onChange={(e) => setSchedulingDate(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                      />
                      <button
                        onClick={() => handleUpdateStatus(selectedReferral.id, 'APPOINTMENT_SCHEDULED')}
                        className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <Calendar className="w-4 h-4" />
                        Schedule OPD Specialist Slot
                      </button>
                    </div>
                  )}

                  {selectedReferral.status === 'APPOINTMENT_SCHEDULED' && (
                    <div className="space-y-2">
                      <label className="block text-[11px] font-medium text-slate-600">Specialist Feedback / Counter-Referral Note</label>
                      <textarea
                        rows={2}
                        value={feedbackNotes}
                        onChange={(e) => setFeedbackNotes(e.target.value)}
                        placeholder="Enter clinical findings, medication adjustments, and follow-up guidance..."
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                      />
                      <button
                        onClick={() => handleUpdateStatus(selectedReferral.id, 'COMPLETED')}
                        className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Complete Consultation & Send Counter-Report
                      </button>
                    </div>
                  )}

                  {selectedReferral.status === 'COMPLETED' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedReferral.id, 'CLOSED')}
                      className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Sign-off and Close Referral Loop
                    </button>
                  )}

                  {selectedReferral.status === 'CLOSED' && (
                    <div className="bg-slate-100 p-3 rounded-xl text-center text-xs text-slate-600 font-medium">
                      ✓ Closed-Loop Referral Successfully Completed & Archived
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400 text-sm space-y-2">
                <Stethoscope className="w-8 h-8 mx-auto text-slate-300" />
                <div className="font-semibold text-slate-600">Select a referral</div>
                <div className="text-xs">Click any referral case on the left to inspect its full timeline, audit sign-offs, and advance its status.</div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Initiate Referral Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Initiate Closed-Loop Referral</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReferral} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Patient Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Patient Phone</label>
                  <input
                    type="text"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Referral Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as ReferralPriority)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="routine">Routine</option>
                    <option value="priority">Priority (24-48h)</option>
                    <option value="urgent">Urgent (Same day)</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Destination Facility</label>
                <select
                  value={destinationFacilityId}
                  onChange={(e) => {
                    setDestinationFacilityId(e.target.value);
                    setDestinationFacilityName(
                      e.target.value === 'hosp-apex' ? 'CareBridge Apex Hospital & Heart Centre' :
                      (e.target.value === 'hosp-dist-sitapur' ? 'District Hospital Sitapur' : 'Community Health Centre Rampur')
                    );
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                >
                  <option value="hosp-apex">CareBridge Apex Hospital & Heart Centre (Quaternary)</option>
                  <option value="hosp-dist-sitapur">District Hospital Sitapur (Secondary)</option>
                  <option value="hosp-chc-rampur">Community Health Centre (CHC) Rampur</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Specialty Required</label>
                <input
                  type="text"
                  value={specialtyRequired}
                  onChange={(e) => setSpecialtyRequired(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Reason for Referral</label>
                <textarea
                  rows={3}
                  value={clinicalReason}
                  onChange={(e) => setClinicalReason(e.target.value)}
                  placeholder="Detail symptoms, findings, and why specialist care is indicated..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'Dispatching...' : 'Dispatch Referral'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
