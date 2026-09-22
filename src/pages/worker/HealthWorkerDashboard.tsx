import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { dataStore } from '../../services/dataStore';
import { UserProfile, SyncQueueItem } from '../../types';
import { 
  Users, 
  UserPlus, 
  Compass, 
  Video, 
  GitPullRequest, 
  Pill, 
  FlaskConical, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Filter, 
  PhoneCall, 
  MapPin, 
  ShieldCheck, 
  RefreshCw,
  WifiOff,
  Wifi,
  ChevronRight,
  Stethoscope
} from 'lucide-react';

export const HealthWorkerDashboard: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(dataStore.getCurrentUser());
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // New patient registration modal state
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [gender, setGender] = useState<string>('female');
  const [dob, setDob] = useState<string>('1985-05-15');
  const [village, setVillage] = useState<string>('Rampur');
  const [district, setDistrict] = useState<string>('Sitapur');
  const [bloodPressure, setBloodPressure] = useState<string>('120/80');
  const [pulse, setPulse] = useState<string>('72');
  const [spo2, setSpo2] = useState<string>('98');
  const [temp, setTemp] = useState<string>('98.4');
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [regSuccessMessage, setRegSuccessMessage] = useState<string>('');

  useEffect(() => {
    loadPatients();
    setSyncQueue(dataStore.getSyncQueue());
    return dataStore.subscribe(() => {
      setSyncQueue(dataStore.getSyncQueue());
    });
  }, []);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const list = await api.getWorkerPatients();
      setPatients(list);
    } catch (err) {
      console.error('Failed to load community patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;
    setIsRegistering(true);
    try {
      const res = await api.registerWorkerPatient({
        fullName,
        phone,
        gender,
        dob,
        villageOrTown: village,
        district,
        initialVitals: {
          bloodPressure,
          pulseBpm: parseInt(pulse, 10) || undefined,
          spo2: parseInt(spo2, 10) || undefined,
          temperatureF: parseFloat(temp) || undefined
        }
      });
      setRegSuccessMessage(`Patient ${res.user.fullName} registered with ABHA: ${res.user.abhaId}`);
      setShowRegisterModal(false);
      loadPatients();
      setFullName('');
      setPhone('');
    } catch (err: any) {
      alert(err.message || 'Failed to register patient');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await dataStore.processSyncQueue();
      setSyncQueue(dataStore.getSyncQueue());
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredPatients = patients.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.fullName.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.address?.villageOrTown?.toLowerCase().includes(q) ||
      (p.chronicConditions || []).some((c: any) => c.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Worker Identity Banner */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-xl shadow-sm">
              <Stethoscope className="w-8 h-8" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-bold tracking-wide uppercase mb-1">
                Frontline Healthcare Worker Console
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {currentUser.fullName || 'Rekha Devi (ASHA / Frontline Worker)'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Sub-Centre Rampur & Community Outreach • Block Sitapur • ID: {currentUser.uid}
              </p>
            </div>
          </div>

          {/* Sync status button */}
          <div className="flex items-center gap-3">
            {syncQueue.length > 0 ? (
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                Sync {syncQueue.length} Pending Offline Drafts
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 text-slate-600 text-xs font-medium rounded-xl border border-slate-200">
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                All Community Records Synced
              </div>
            )}

            <button
              onClick={() => setShowRegisterModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Register Patient
            </button>
          </div>
        </div>

        {regSuccessMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl text-xs flex items-center justify-between">
            <span className="font-semibold">{regSuccessMessage}</span>
            <button onClick={() => setRegSuccessMessage('')} className="text-emerald-700 hover:text-emerald-900 font-bold">✕</button>
          </div>
        )}

        {/* Quick Action Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <button
            onClick={() => setShowRegisterModal(true)}
            className="p-4 bg-white hover:bg-teal-50/50 rounded-2xl border border-slate-200 hover:border-teal-400 text-left transition-all shadow-xs group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <UserPlus className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-900">Register Patient</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Generate ABHA ID</div>
          </button>

          <Link
            to="/triage"
            className="p-4 bg-white hover:bg-teal-50/50 rounded-2xl border border-slate-200 hover:border-teal-400 text-left transition-all shadow-xs group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-900">Assess Triage</div>
            <div className="text-[10px] text-slate-500 mt-0.5">5-Tier Severity</div>
          </Link>

          <Link
            to="/teleconsult"
            className="p-4 bg-white hover:bg-teal-50/50 rounded-2xl border border-slate-200 hover:border-teal-400 text-left transition-all shadow-xs group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Video className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-900">Teleconsult</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Assisted Video Call</div>
          </Link>

          <Link
            to="/referrals"
            className="p-4 bg-white hover:bg-teal-50/50 rounded-2xl border border-slate-200 hover:border-teal-400 text-left transition-all shadow-xs group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <GitPullRequest className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-900">Create Referral</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Closed-Loop Route</div>
          </Link>

          <Link
            to="/pharmacy"
            className="p-4 bg-white hover:bg-teal-50/50 rounded-2xl border border-slate-200 hover:border-teal-400 text-left transition-all shadow-xs group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Pill className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-900">Check Medicines</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Jan Aushadhi Stock</div>
          </Link>

          <Link
            to="/diagnostics"
            className="p-4 bg-white hover:bg-teal-50/50 rounded-2xl border border-slate-200 hover:border-teal-400 text-left transition-all shadow-xs group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-900">Diagnostics</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Lab Test Orders</div>
          </Link>
        </div>

        {/* Community Patients Roster Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Assigned Community Patients Roster</h2>
              <p className="text-xs text-slate-500 mt-0.5">Under surveillance for chronic diseases, maternal care, and follow-up compliance.</p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, phone, or condition..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Patient Demographics</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Chronic Conditions</th>
                  <th className="py-3 px-4">Active Care Plan</th>
                  <th className="py-3 px-4">Active Referral</th>
                  <th className="py-3 px-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">Loading community registry...</td>
                  </tr>
                ) : filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">No matching patient records found.</td>
                  </tr>
                ) : (
                  filteredPatients.map(pat => (
                    <tr key={pat.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{pat.fullName}</div>
                        <div className="text-[11px] text-slate-500">
                          {pat.phone} • {pat.gender}, {pat.dob ? `${new Date().getFullYear() - new Date(pat.dob).getFullYear()}y` : ''}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {pat.address?.villageOrTown || 'Sitapur'}
                      </td>
                      <td className="py-3.5 px-4">
                        {pat.chronicConditions && pat.chronicConditions.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {pat.chronicConditions.map((c: any) => (
                              <span key={c.id} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                                {c.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {pat.activeCarePlan ? (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            pat.activeCarePlan.status === 'on_track' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            pat.activeCarePlan.status === 'due_soon' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {pat.activeCarePlan.status.replace(/_/g, ' ')}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">None active</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {pat.activeReferral ? (
                          <div className="text-[11px]">
                            <span className="font-semibold text-teal-700 block">{pat.activeReferral.destinationFacilityName}</span>
                            <span className="text-slate-400 uppercase text-[9px] font-bold">{pat.activeReferral.status}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to="/triage"
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-semibold transition-colors"
                          >
                            Triage
                          </Link>
                          <Link
                            to="/teleconsult"
                            className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-[11px] font-semibold transition-colors"
                          >
                            Teleconsult
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Register Patient Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-teal-600" />
                Register Community Patient
              </h3>
            </div>

            <form onSubmit={handleRegisterPatient} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Meera Devi"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+919876543210"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Village / Town</label>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Initial Vitals Check */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-700 uppercase tracking-wide text-[10px]">Initial Vitals Intake</div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block">BP</label>
                    <input
                      type="text"
                      value={bloodPressure}
                      onChange={(e) => setBloodPressure(e.target.value)}
                      placeholder="120/80"
                      className="w-full p-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Pulse (bpm)</label>
                    <input
                      type="text"
                      value={pulse}
                      onChange={(e) => setPulse(e.target.value)}
                      placeholder="72"
                      className="w-full p-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">SpO2 (%)</label>
                    <input
                      type="text"
                      value={spo2}
                      onChange={(e) => setSpo2(e.target.value)}
                      placeholder="98"
                      className="w-full p-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRegistering}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm disabled:opacity-50"
                >
                  {isRegistering ? 'Registering...' : 'Register Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
