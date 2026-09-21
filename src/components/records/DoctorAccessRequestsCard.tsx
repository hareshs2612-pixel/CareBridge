import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { dataStore } from '../../services/dataStore';
import { AccessRequest, AccessAuthorization } from '../../types';
import { 
  Stethoscope, 
  Building2, 
  Clock, 
  KeyRound, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ShieldCheck, 
  Send,
  RotateCcw,
  Sparkles,
  Lock,
  UserX
} from 'lucide-react';

interface DoctorAccessRequestsCardProps {
  onUpdated?: () => void;
}

export const DoctorAccessRequestsCard: React.FC<DoctorAccessRequestsCardProps> = ({ onUpdated }) => {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [activeAuthorizations, setActiveAuthorizations] = useState<AccessAuthorization[]>([]);
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({});
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);
  const [errorMap, setErrorMap] = useState<Record<string, string>>({});
  const [successMap, setSuccessMap] = useState<Record<string, string>>({});
  const [refreshing, setRefreshing] = useState(false);

  const loadRequests = async () => {
    try {
      const res = await api.getPatientAccessRequests();
      setRequests(res.requests);
      setActiveAuthorizations(res.activeAuthorizations);
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    loadRequests();
    const interval = setInterval(loadRequests, 8000); // auto-poll every 8s for live demo
    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (requestId: string, value: string) => {
    const clean = value.replace(/\D/g, '').slice(0, 6);
    setOtpInputs(prev => ({ ...prev, [requestId]: clean }));
    setErrorMap(prev => ({ ...prev, [requestId]: '' }));
  };

  const handleApprove = async (requestId: string) => {
    const otp = otpInputs[requestId] || '';
    if (otp.length !== 6) {
      setErrorMap(prev => ({ ...prev, [requestId]: 'Please enter the 6-digit OTP sent to your phone.' }));
      return;
    }

    setLoadingActionId(requestId);
    setErrorMap(prev => ({ ...prev, [requestId]: '' }));
    setSuccessMap(prev => ({ ...prev, [requestId]: '' }));

    try {
      const res = await api.authorizeRequest(requestId, otp);
      setSuccessMap(prev => ({ ...prev, [requestId]: res.message }));
      await loadRequests();
      dataStore.grantDoctorAccess(res.authorization.patientId, res.authorization.doctorId, res.authorization.scope);
      if (onUpdated) onUpdated();
    } catch (err: any) {
      setErrorMap(prev => ({ ...prev, [requestId]: err.message || 'OTP verification failed. Please check the code.' }));
    } finally {
      setLoadingActionId(null);
    }
  };

  const handleDeny = async (requestId: string) => {
    if (!window.confirm('Are you sure you want to deny this doctor access to your medical records?')) {
      return;
    }

    setLoadingActionId(requestId);
    setErrorMap(prev => ({ ...prev, [requestId]: '' }));

    try {
      const res = await api.denyRequest(requestId);
      setSuccessMap(prev => ({ ...prev, [requestId]: res.message }));
      await loadRequests();
      if (onUpdated) onUpdated();
    } catch (err: any) {
      setErrorMap(prev => ({ ...prev, [requestId]: err.message || 'Failed to deny request.' }));
    } finally {
      setLoadingActionId(null);
    }
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setTimeout(() => setRefreshing(false), 400);
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const decidedRequests = requests.filter(r => r.status !== 'pending');

  if (requests.length === 0 && activeAuthorizations.length === 0) {
    return null; // nothing to display
  }

  return (
    <div className="space-y-4">
      {/* Pending Requests Alert Block */}
      {pendingRequests.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-2 border-amber-400/80 rounded-2xl p-5 shadow-sm space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-amber-900">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
              <h3 className="font-black text-sm uppercase tracking-wide">
                Incoming Doctor Authorization Requests ({pendingRequests.length})
              </h3>
            </div>
            <button
              onClick={handleManualRefresh}
              className="text-xs font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1"
              title="Refresh requests"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          <p className="text-xs text-amber-900/90 leading-relaxed">
            The following physicians have requested access to your medical history. Enter the real 6-digit OTP sent to your registered mobile number to authorize them.
          </p>

          <div className="space-y-4 pt-1">
            {pendingRequests.map(req => {
              const otpVal = otpInputs[req.id] || '';
              const isActionLoading = loadingActionId === req.id;
              const err = errorMap[req.id];
              const succ = successMap[req.id];

              return (
                <div
                  key={req.id}
                  className="bg-white rounded-xl border border-amber-200 p-4 sm:p-5 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 flex-shrink-0 mt-0.5">
                        <Stethoscope className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-sm text-slate-900">Dr. {req.doctorName}</h4>
                          <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                            OTP Verification Required
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{req.doctorSpecialization}</p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3" />
                          {req.doctorHospital}
                        </p>
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-slate-400">
                      <div>Requested on:</div>
                      <strong className="text-slate-600">{new Date(req.requestedAt).toLocaleDateString('en-IN')} {new Date(req.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                    </div>
                  </div>

                  {/* Disclosure Statement */}
                  <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                      <span>Information Shared Upon Approval:</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Longitudinal health history, past diagnoses, Jan Aushadhi prescriptions, diagnostic lab reports, and vitals.
                    </p>
                  </div>

                  {/* Feedback Messages */}
                  {err && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                      <span className="font-medium">{err}</span>
                    </div>
                  )}

                  {succ && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="font-medium">{succ}</span>
                    </div>
                  )}

                  {/* Real OTP Input Form */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="Enter 6-Digit Mobile OTP"
                        value={otpVal}
                        onChange={(e) => handleOtpChange(req.id, e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono tracking-widest focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApprove(req.id)}
                      disabled={isActionLoading || otpVal.length !== 6}
                      className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Grant Access</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeny(req.id)}
                      disabled={isActionLoading}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition border border-slate-200"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Deny</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Access Requests History Table (if any decided requests exist) */}
      {decidedRequests.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
              Recent Access Request Decisions
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              Total Requests: {requests.length}
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {decidedRequests.slice(0, 5).map(req => (
              <div key={req.id} className="py-2.5 flex items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-slate-900">{req.doctorName}</span>
                  <span className="text-slate-400 text-[11px] block">{req.doctorHospital}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    req.status === 'authorized'
                      ? 'bg-emerald-100 text-emerald-800'
                      : req.status === 'denied'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {req.status}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {req.decidedAt ? new Date(req.decidedAt).toLocaleDateString('en-IN') : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
