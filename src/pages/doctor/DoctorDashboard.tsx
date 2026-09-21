import React, { useState, useEffect } from 'react';
import { dataStore } from '../../services/dataStore';
import { geminiService } from '../../services/geminiService';
import { api } from '../../services/api';
import { 
  UserProfile, 
  DoctorProfile, 
  PatientProfile, 
  HealthRecord,
  AccessRequest,
  Appointment
} from '../../types';
import { AISummaryCard } from '../../components/ai/AISummaryCard';
import { LongitudinalTimeline } from '../../components/records/LongitudinalTimeline';
import { VitalsDisplay } from '../../components/common/VitalsDisplay';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Stethoscope, 
  Users, 
  Search, 
  ShieldAlert, 
  FileText, 
  PlusCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Lock, 
  Sparkles,
  ArrowRight,
  Send,
  RotateCcw,
  Check,
  Building2,
  Phone,
  Video,
  Calendar,
  Pill,
  ExternalLink
} from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserProfile>(dataStore.getCurrentUser());
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | undefined>(dataStore.getDoctorById(currentUser.uid));
  const [authorizedPatientIds, setAuthorizedPatientIds] = useState<string[]>([]);
  const [allPatients, setAllPatients] = useState<Record<string, PatientProfile>>(dataStore.getPatients());
  const [users, setUsers] = useState<UserProfile[]>(dataStore.getUsers());
  
  // Dashboard active view: 'records' | 'appointments'
  const [dashboardTab, setDashboardTab] = useState<'records' | 'appointments'>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Selected Patient for detailed review
  const [selectedPatientId, setSelectedPatientId] = useState<string>('pat-ramesh');
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [aiSummary, setAiSummary] = useState<any | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Backend Access Control State
  const [hasBackendAccess, setHasBackendAccess] = useState<boolean>(false);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);

  // Search & Access Request State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    found: boolean;
    patient: {
      id: string;
      fullName: string;
      abhaId?: string;
      gender: string;
      bloodGroup: string;
      district: string;
      village: string;
    };
    hasAccess: boolean;
    activeAuthorizationId?: string;
    requestStatus: 'none' | 'pending' | 'authorized' | 'denied';
    pendingRequestId?: string;
    message: string;
  } | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isRequestingAccess, setIsRequestingAccess] = useState(false);
  const [requestSuccessMessage, setRequestSuccessMessage] = useState<string | null>(null);

  const loadData = async () => {
    const user = dataStore.getCurrentUser();
    setCurrentUser(user);
    const doc = dataStore.getDoctorById(user.uid);
    setDoctorProfile(doc);
    const authed = dataStore.getAuthorizedPatientsForDoctor(user.uid);
    setAuthorizedPatientIds(authed);
    setAllPatients(dataStore.getPatients());
    setUsers(dataStore.getUsers());

    // Load doctor appointments
    try {
      const aptList = await api.getAppointments();
      setAppointments(aptList);
    } catch {
      setAppointments(dataStore.getCorporateAppointments());
    }

    // Load doctor access requests from backend
    try {
      const res = await api.getDoctorAccessRequests();
      setAccessRequests(res.requests);
    } catch {
      // ignore
    }

    // Verify Backend Access Control & Load Records
    if (selectedPatientId) {
      await verifyAndLoadPatientRecords(selectedPatientId, user.uid);
    }
  };

  const verifyAndLoadPatientRecords = async (patientId: string, doctorId: string) => {
    try {
      const res = await api.getPatientRecords(patientId);
      setRecords(res.records);
      setHasBackendAccess(true);
      setBackendError(null);
      
      if (!dataStore.hasDoctorAccess(patientId, doctorId)) {
        dataStore.grantDoctorAccess(patientId, doctorId, 'full_longitudinal');
      }
    } catch (err: any) {
      if (err.status === 403) {
        setHasBackendAccess(false);
        setBackendError(err.message || 'Access restricted. Active patient authorization required.');
        setRecords([]);
      } else {
        const localAuthed = dataStore.hasDoctorAccess(patientId, doctorId);
        setHasBackendAccess(localAuthed);
        if (localAuthed) {
          setRecords(dataStore.getRecordsForPatient(patientId));
          setBackendError(null);
        } else {
          setBackendError('Access restricted — Active patient authorization required.');
          setRecords([]);
        }
      }
    }
  };

  useEffect(() => {
    loadData();
    return dataStore.subscribe(() => {
      const user = dataStore.getCurrentUser();
      setCurrentUser(user);
      setDoctorProfile(dataStore.getDoctorById(user.uid));
      setAuthorizedPatientIds(dataStore.getAuthorizedPatientsForDoctor(user.uid));
      setAllPatients(dataStore.getPatients());
      setUsers(dataStore.getUsers());
      setAppointments(dataStore.getCorporateAppointments());
    });
  }, [selectedPatientId]);

  useEffect(() => {
    const activePatient = allPatients[selectedPatientId];
    if (activePatient && hasBackendAccess && records.length > 0) {
      setLoadingSummary(true);
      geminiService.summarizeLongitudinalHistory(activePatient, records)
        .then(summary => setAiSummary(summary))
        .catch(err => console.error(err))
        .finally(() => setLoadingSummary(false));
    } else {
      setAiSummary(null);
    }
  }, [selectedPatientId, hasBackendAccess, records]);

  const handleSearchPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    setSearchResult(null);
    setRequestSuccessMessage(null);

    const q = searchQuery.trim();
    if (!q) return;

    setIsSearching(true);
    try {
      const res = await api.searchPatient(q);
      setSearchResult(res);
    } catch (err: any) {
      setSearchError(err.message || 'Patient not found. Check the identifier.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleRequestAccess = async (patientId: string) => {
    setIsRequestingAccess(true);
    setRequestSuccessMessage(null);
    setSearchError(null);

    try {
      const res = await api.requestPatientAccess(patientId, 'full_longitudinal');
      setRequestSuccessMessage(res.message);
      
      if (searchResult && searchResult.patient.id === patientId) {
        setSearchResult({
          ...searchResult,
          requestStatus: 'pending',
          message: 'Access pending — waiting for patient authorization via OTP.'
        });
      }

      const reqList = await api.getDoctorAccessRequests();
      setAccessRequests(reqList.requests);
    } catch (err: any) {
      setSearchError(err.message || 'Failed to submit access request.');
    } finally {
      setIsRequestingAccess(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: any) => {
    await api.updateAppointmentStatus(id, status);
    loadData();
  };

  const activePatient = allPatients[selectedPatientId];
  const activePatientUser = users.find(u => u.uid === selectedPatientId);

  const currentPatientPendingRequest = accessRequests.find(
    r => r.patientId === selectedPatientId && r.doctorId === currentUser.uid && r.status === 'pending'
  );

  const availablePatients = users.filter(u => u.role === 'patient');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Clinician Practice Header */}
      <div className="bg-cb-navy text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-cb-blue flex items-center justify-center text-white text-2xl font-bold shadow-inner">
              <Stethoscope className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black">{currentUser.fullName}</h1>
                <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  {doctorProfile?.specialization || 'Senior Consultant'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300 mt-1">
                <span>Hospital: <strong>{doctorProfile?.hospitalAffiliation || 'CareBridge Quaternary Medical Centre'}</strong></span>
                <span>• Council Reg: <strong className="font-mono text-blue-200">{doctorProfile?.registrationNumber || 'NMC-78901'}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/doctor/note"
              className="bg-cb-blue hover:bg-blue-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Clinical Note & Rx</span>
            </Link>

            <Link
              to="/teleconsult"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs"
            >
              <Video className="w-4 h-4" />
              <span>Teleconsultation Room</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-1.5 flex items-center gap-2 shadow-xs text-xs font-semibold">
        <button
          onClick={() => setDashboardTab('appointments')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            dashboardTab === 'appointments'
              ? 'bg-cb-blue text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Today's OPD & Video Queue ({appointments.length})</span>
        </button>

        <button
          onClick={() => setDashboardTab('records')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            dashboardTab === 'records'
              ? 'bg-cb-blue text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Patient EHR Charts & Longitudinal Review</span>
        </button>
      </div>

      {/* TAB 1: OPD & Teleconsultation Queue */}
      {dashboardTab === 'appointments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-medium">
            <span>Showing confirmed outpatient consultations and tele-health sessions</span>
            <span className="text-cb-blue font-bold">Total: {appointments.length} Consultations</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {appointments.map((apt) => {
              const isVideo = apt.type === 'teleconsultation';
              const isDone = apt.status === 'completed';
              const isCancelled = apt.status === 'cancelled';

              return (
                <div
                  key={apt.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-cb-blue/40 p-5 shadow-xs flex flex-col justify-between space-y-4 transition"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        isVideo ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-blue-50 text-cb-blue border border-blue-200'
                      }`}>
                        {isVideo ? <Video className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                        {isVideo ? 'Tele-Health Video' : 'In-Person Hospital OPD'}
                      </span>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isDone ? 'bg-slate-100 text-slate-600' :
                        isCancelled ? 'bg-rose-50 text-rose-700' :
                        'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}>
                        {apt.status.toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-black text-cb-navy text-base">{apt.patientName}</h3>
                      <p className="text-xs text-slate-500 font-mono">Ref: {apt.bookingReference}</p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1 text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Date & Slot:</span>
                        <span className="font-bold text-slate-800">{apt.date} at {apt.timeSlot}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Contact Phone:</span>
                        <span className="text-slate-800">{apt.patientPhone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Consultation Fee:</span>
                        <span className="font-bold text-cb-navy">₹{apt.fee}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col gap-2 text-xs">
                    {isVideo && !isDone && !isCancelled && (
                      <Link
                        to={`/teleconsult?appointmentId=${apt.id}`}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-center transition flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Launch Video Room</span>
                      </Link>
                    )}

                    {!isDone && !isCancelled && (
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/doctor/note?patientId=${apt.patientId}`}
                          className="flex-1 py-2 bg-cb-blue hover:bg-blue-700 text-white font-bold rounded-xl text-center transition flex items-center justify-center gap-1"
                        >
                          <Pill className="w-3.5 h-3.5" />
                          <span>Write Rx</span>
                        </Link>

                        <button
                          onClick={() => handleUpdateStatus(apt.id, 'completed')}
                          className="px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition"
                          title="Mark Consultation Completed"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setSelectedPatientId(apt.patientId);
                        setDashboardTab('records');
                      }}
                      className="text-cb-blue hover:underline text-center text-[11px] font-bold py-1"
                    >
                      View Longitudinal Patient Chart →
                    </button>
                  </div>
                </div>
              );
            })}

            {appointments.length === 0 && (
              <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="font-bold text-slate-800 text-sm">No Appointments Scheduled</p>
                <p className="mt-1">All outpatient appointments booked by patients will appear in this clinical queue.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Longitudinal Records & Consent Guard */}
      {dashboardTab === 'records' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column (4 cols): Search & Patient Access Management */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Find Patient Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-cb-navy flex items-center gap-2">
                  <Search className="w-4 h-4 text-cb-blue" />
                  Find Patient
                </h3>
                <span className="text-[10px] bg-blue-50 text-cb-blue font-bold px-2 py-0.5 rounded-full">
                  ABDM Lookup
                </span>
              </div>

              <p className="text-[11px] text-slate-500 leading-snug">
                Search by <strong>Patient ID</strong>, <strong>ABHA ID</strong>, or <strong>Mobile Number</strong>.
              </p>

              <form onSubmit={handleSearchPatient} className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter ABHA ID, Patient ID, or Phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-3 pr-9 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-cb-blue focus:outline-none transition"
                  />
                  <button
                    type="submit"
                    disabled={isSearching || !searchQuery.trim()}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-cb-blue hover:bg-blue-700 text-white rounded-lg disabled:opacity-40 transition"
                    title="Search patient"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

              {searchError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0 mt-0.5" />
                  <span className="leading-tight">{searchError}</span>
                </div>
              )}

              {requestSuccessMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="leading-tight">{requestSuccessMessage}</span>
                </div>
              )}

              {searchResult && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{searchResult.patient.fullName}</h4>
                      <span className="text-[10px] text-slate-500 block font-mono">
                        ABHA: {searchResult.patient.abhaId || searchResult.patient.id}
                      </span>
                    </div>

                    {searchResult.hasAccess ? (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        Authorized
                      </span>
                    ) : (
                      <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" /> Unconsented
                      </span>
                    )}
                  </div>

                  {searchResult.hasAccess ? (
                    <button
                      onClick={() => setSelectedPatientId(searchResult.patient.id)}
                      className="w-full py-2 bg-cb-blue hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <span>View Patient Record</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRequestAccess(searchResult.patient.id)}
                      disabled={isRequestingAccess}
                      className="w-full py-2.5 bg-cb-blue hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Request Patient Access (Sends Real OTP)</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Patient Roster List */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-cb-navy flex items-center gap-2">
                  <Users className="w-4 h-4 text-cb-blue" />
                  Active Patient Roster
                </h3>
                <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                  {authorizedPatientIds.length} Authorized
                </span>
              </div>

              <div className="space-y-2 pt-1">
                {availablePatients.map(pat => {
                  const isSelected = pat.uid === selectedPatientId;
                  const isAuthed = authorizedPatientIds.includes(pat.uid);

                  return (
                    <button
                      key={pat.uid}
                      onClick={() => setSelectedPatientId(pat.uid)}
                      className={`w-full text-left p-3 rounded-xl transition border flex items-start justify-between gap-2 ${
                        isSelected 
                          ? 'bg-blue-50 border-cb-blue ring-1 ring-cb-blue' 
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">{pat.fullName}</span>
                          {isAuthed ? (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                              Authorized
                            </span>
                          ) : (
                            <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                              <Lock className="w-2.5 h-2.5" /> Unconsented
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
                          ID: {pat.uid} {pat.abhaId ? `| ABHA: ${pat.abhaId}` : ''}
                        </span>
                      </div>

                      <ArrowRight className={`w-4 h-4 mt-1 transition ${isSelected ? 'text-cb-blue' : 'text-slate-300'}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column (8 cols): Longitudinal Medical Record & Access Guard */}
          <div className="lg:col-span-8 space-y-5">
            
            {!hasBackendAccess ? (
              <div className="bg-white rounded-2xl border-2 border-rose-200 p-8 shadow-xs text-center space-y-5 animate-in fade-in">
                <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                  <Lock className="w-8 h-8" />
                </div>

                <div className="max-w-md mx-auto space-y-2">
                  <h3 className="text-lg font-black text-rose-950">
                    Access Restricted — Active Patient Authorization Required
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong>{currentUser.fullName}</strong> does not hold active patient authorization to inspect the longitudinal record of{' '}
                    <strong>{activePatientUser?.fullName || 'this patient'}</strong>.
                  </p>
                  
                  <div className="p-3.5 bg-rose-50 rounded-xl text-left text-xs text-rose-900 space-y-1.5 border border-rose-200">
                    <div className="font-bold flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      Backend Access Control Enforced:
                    </div>
                    <p className="text-[11px] text-rose-800 leading-relaxed">
                      API calls to retrieve medical records are blocked on the server unless an authorized relationship exists. The patient must explicitly authorize the doctor via OTP verification.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => handleRequestAccess(selectedPatientId)}
                    disabled={isRequestingAccess}
                    className="bg-cb-blue hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 transition shadow-xs"
                  >
                    <Send className="w-4 h-4" />
                    <span>Request Patient Access (Sends Real OTP)</span>
                  </button>

                  <Link
                    to={`/emergency?patientId=${selectedPatientId}`}
                    className="bg-cb-rose hover:bg-rose-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Emergency Triage Override
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-5 animate-in fade-in">
                
                {/* Patient Banner */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-black text-cb-navy">{activePatientUser?.fullName}</h2>
                        <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" /> Access Granted
                        </span>
                        <span className="text-xs bg-blue-50 text-cb-blue font-bold px-2 py-0.5 rounded-full">
                          Blood: {activePatient?.bloodGroup}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 text-xs text-slate-500 mt-1">
                        <span>DOB: {activePatient?.dob}</span>
                        <span>• Gender: {activePatient?.gender.toUpperCase()}</span>
                        <span>• Location: {activePatient?.address.villageOrTown}, {activePatient?.address.district}</span>
                      </div>
                    </div>

                    <Link
                      to="/doctor/note"
                      className="bg-cb-blue hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs self-start sm:self-center"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Write Encounter Note
                    </Link>
                  </div>

                  {/* Critical Allergies Alert */}
                  {activePatient && activePatient.allergies.length > 0 && (
                    <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-900">
                      <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold uppercase tracking-wide">Critical Allergy Warning: </span>
                        {activePatient.allergies.map(a => `${a.allergen} (${a.severity.replace('_', ' ')})`).join(', ')}
                      </div>
                    </div>
                  )}
                </div>

                {/* Gemini Longitudinal Clinical Synthesis Card */}
                {loadingSummary ? (
                  <div className="bg-indigo-50/50 border border-indigo-200 rounded-2xl p-6 text-center text-xs text-indigo-900">
                    <Sparkles className="w-6 h-6 text-indigo-600 animate-spin mx-auto mb-2" />
                    <span>Synthesizing multi-encounter records with Gemini Clinical Parser...</span>
                  </div>
                ) : aiSummary ? (
                  <AISummaryCard
                    summary={aiSummary}
                    onVerify={(notes) => {
                      dataStore.addAuditLog({
                        actorId: currentUser.uid,
                        actorName: currentUser.fullName,
                        actorRole: 'doctor',
                        action: 'AI_DOCTOR_VERIFIED',
                        resourceType: 'health_record',
                        patientId: selectedPatientId,
                        details: `Physician clinically validated Gemini longitudinal summary. Notes: ${notes || 'Verified'}`
                      });
                      alert('Clinical review recorded and logged to immutable audit trail!');
                    }}
                  />
                ) : null}

                {/* Physiological Vitals Display */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Latest Physiological Measurements
                  </span>
                  <VitalsDisplay
                    vitals={records.find(r => r.vitals && !r.vitals.isUnavailable)?.vitals || {
                      isDeviceRecorded: false,
                      isUnavailable: true,
                      source: 'unavailable'
                    }}
                    allowManualPrompt={false}
                  />
                </div>

                {/* Longitudinal Encounter Timeline */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-cb-blue" />
                      Longitudinal Encounter Timeline ({records.length} Records)
                    </h3>
                  </div>
                  <LongitudinalTimeline records={records} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
