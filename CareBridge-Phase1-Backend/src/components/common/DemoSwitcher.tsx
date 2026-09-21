import React, { useState, useEffect } from 'react';
import { dataStore } from '../../services/dataStore';
import { UserProfile } from '../../types';
import { Users, RotateCcw, ShieldAlert, Check, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DemoSwitcher: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(dataStore.getCurrentUser());
  const [isOpen, setIsOpen] = useState(false);
  const users = dataStore.getUsers();
  const navigate = useNavigate();

  useEffect(() => {
    return dataStore.subscribe(() => {
      setCurrentUser(dataStore.getCurrentUser());
    });
  }, []);

  const handleSwitch = (uid: string, role: string) => {
    dataStore.setCurrentUser(uid);
    setIsOpen(false);
    
    // Intelligently route to the designated dashboard for that persona
    if (role === 'patient') {
      navigate('/patient');
    } else if (role === 'doctor') {
      navigate('/doctor');
    } else if (role === 'frontline_worker') {
      navigate('/coordination');
    } else if (role === 'admin') {
      navigate('/admin');
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all demo patient records, clinical notes, and emergency events to clean initial state?')) {
      dataStore.resetToMockData();
      alert('Demo data restored successfully!');
      window.location.reload();
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'patient':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">PATIENT</span>;
      case 'doctor':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded">DOCTOR</span>;
      case 'frontline_worker':
        return <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-1.5 py-0.5 rounded">ASHA / ANM</span>;
      case 'admin':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-1.5 py-0.5 rounded">ADMIN</span>;
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition shadow-sm border border-slate-700"
        title="Switch between test personas for hackathon demonstration"
      >
        <Users className="w-3.5 h-3.5 text-teal-400" />
        <span className="hidden sm:inline text-slate-300">Active Persona:</span>
        <span className="font-semibold text-teal-300 max-w-[120px] truncate">{currentUser.fullName}</span>
        {getRoleBadge(currentUser.role)}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">SIH 2026 Demo Personas</span>
            </div>
            <button
              onClick={handleReset}
              className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded transition"
              title="Reset records to default demo state"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Data
            </button>
          </div>

          <div className="p-2 divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {users.map(u => {
              const isSelected = u.uid === currentUser.uid;
              let description = '';
              if (u.uid === 'pat-ramesh') description = 'Rural Farmer (Sitapur), T2DM & HTN, Penicillin allergy';
              if (u.uid === 'pat-sunita') description = 'Rural Artisan (Mohanpur), Pregnant (24 weeks ANC)';
              if (u.uid === 'doc-sharma') description = 'CHC Rampur Incharge (Has active consent from Ramesh)';
              if (u.uid === 'doc-verma') description = 'District Hospital Surgeon (Unconsented / Emergency Override)';
              if (u.uid === 'asha-rekha') description = 'ASHA Worker (Bilaspur), Proactive Alerts & Referral Coordination';
              if (u.uid === 'admin-sunil') description = 'Sitapur District Health Informatics Officer';

              return (
                <button
                  key={u.uid}
                  onClick={() => handleSwitch(u.uid, u.role)}
                  className={`w-full text-left p-2.5 rounded-lg transition flex items-start justify-between gap-2 ${
                    isSelected ? 'bg-teal-50 border border-teal-200' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-xs">{u.fullName}</span>
                      {getRoleBadge(u.role)}
                      {isSelected && <Check className="w-3.5 h-3.5 text-teal-600 ml-auto" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">{description}</p>
                    {u.abhaId && (
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                        ABHA ID: {u.abhaId}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span>Switching personas dynamically updates permissions & audit log.</span>
          </div>
        </div>
      )}
    </div>
  );
};
