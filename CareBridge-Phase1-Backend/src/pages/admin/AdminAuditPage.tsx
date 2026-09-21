import React, { useState, useEffect } from 'react';
import { dataStore } from '../../services/dataStore';
import { AuditLogEntry, UserProfile } from '../../types';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Users, 
  FileText, 
  KeyRound, 
  Clock, 
  Filter, 
  CheckCircle2, 
  Lock,
  RotateCcw
} from 'lucide-react';

export const AdminAuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const [users, setUsers] = useState<UserProfile[]>([]);

  const loadData = () => {
    setLogs(dataStore.getAuditLogs());
    setUsers(dataStore.getUsers());
  };

  useEffect(() => {
    loadData();
    return dataStore.subscribe(loadData);
  }, []);

  const filteredLogs = logs.filter(l => {
    if (filterAction === 'ALL') return true;
    return l.action === filterAction;
  });

  const emergencyLogs = logs.filter(l => l.action === 'TRIGGER_EMERGENCY_ACCESS');
  const consentLogs = logs.filter(l => l.action.includes('CONSENT'));

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'TRIGGER_EMERGENCY_ACCESS':
        return <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded">EMERGENCY OVERRIDE</span>;
      case 'GRANT_CONSENT':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">CONSENT GRANTED</span>;
      case 'REVOKE_CONSENT':
        return <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded">CONSENT REVOKED</span>;
      case 'LOGIN':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">AUTH SESSION</span>;
      case 'UPLOAD_DOCUMENT':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded">DOC UPLOAD</span>;
      case 'CREATE_RECORD':
        return <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded">CLINICAL NOTE</span>;
      case 'AI_DOCTOR_VERIFIED':
        return <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded">AI VERIFIED</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">{action}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">Platform Governance & Immutable Audit Logs</h1>
            <span className="text-xs bg-purple-100 text-purple-800 font-bold px-2.5 py-0.5 rounded-full">
              System Admin
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tracking data access events, consent state transitions, and emergency triage overrides across rural districts.
          </p>
        </div>

        <button
          onClick={() => {
            dataStore.resetToMockData();
            alert('Default test dataset restored!');
          }}
          className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition self-start sm:self-center"
        >
          <RotateCcw className="w-3.5 h-3.5 text-teal-400" />
          Reset Demo State
        </button>
      </div>

      {/* Admin Privacy Wall Notice */}
      <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 text-xs flex items-start gap-3">
        <Lock className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white">Administrator Privacy Shield: </span>
          In strict compliance with healthcare confidentiality principles, administrators have visibility into <strong>access metadata, authentication logs, and consent events</strong>, but are <strong>cryptographically restricted from inspecting patient diagnoses, test values, or clinical encounter notes</strong>.
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block">Registered Personas</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{users.length}</span>
          <span className="text-[10px] text-teal-600 font-semibold">Patients, Doctors, Responders</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block">Audited Event Log Entries</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{logs.length}</span>
          <span className="text-[10px] text-slate-400 font-semibold">Tamper-evident logs</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block">Emergency Overrides</span>
          <span className="text-2xl font-black text-rose-600 mt-1 block">{emergencyLogs.length}</span>
          <span className="text-[10px] text-rose-700 font-semibold">Triage events recorded</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block">Active Consent Grants</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">{consentLogs.length}</span>
          <span className="text-[10px] text-emerald-700 font-semibold">Patient-governed links</span>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="font-bold text-slate-800">Filter Audit Stream:</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[
              { label: 'All Events', val: 'ALL' },
              { label: 'Emergency Overrides', val: 'TRIGGER_EMERGENCY_ACCESS' },
              { label: 'Consent Changes', val: 'GRANT_CONSENT' },
              { label: 'Document Uploads', val: 'UPLOAD_DOCUMENT' },
              { label: 'Logins / Sessions', val: 'LOGIN' },
            ].map(f => (
              <button
                key={f.val}
                onClick={() => setFilterAction(f.val)}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  filterAction === f.val 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Audit Stream Table */}
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Action Type</th>
                <th className="p-3">Actor / Initiator</th>
                <th className="p-3">Role</th>
                <th className="p-3">Event Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/70">
                  <td className="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('en-IN')}
                  </td>
                  <td className="p-3">
                    {getActionBadge(log.action)}
                  </td>
                  <td className="p-3 font-bold text-slate-900">
                    {log.actorName}
                  </td>
                  <td className="p-3 uppercase text-[10px] font-semibold text-slate-500">
                    {log.actorRole}
                  </td>
                  <td className="p-3 text-slate-600 max-w-md truncate">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
