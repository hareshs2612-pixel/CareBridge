import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  PhoneOff, 
  MessageSquare, 
  FileText, 
  Activity, 
  ShieldCheck, 
  Clock, 
  Settings, 
  Share2, 
  User, 
  AlertCircle,
  Send,
  CheckCircle2,
  Stethoscope,
  Plus,
  ArrowRight,
  Maximize2,
  Volume2
} from 'lucide-react';
import { dataStore } from '../../services/dataStore';
import { api } from '../../services/api';
import { Doctor, Appointment, Prescription, PrescriptionItem } from '../../types';

export const TeleconsultationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const appointmentId = searchParams.get('appointmentId');
  const doctorIdParam = searchParams.get('doctorId');

  const currentUser = dataStore.getCurrentUser();
  const isDoctorRole = currentUser?.role === 'doctor';

  // Call states
  const [inCall, setInCall] = useState<boolean>(false);
  const [micEnabled, setMicEnabled] = useState<boolean>(true);
  const [videoEnabled, setVideoEnabled] = useState<boolean>(true);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'chat' | 'records' | 'prescription'>('chat');

  // Doctor & Appointment state
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // In-call chat messages
  const [messages, setMessages] = useState<{ sender: string; text: string; time: string; isSelf: boolean }[]>([
    { sender: 'System', text: 'End-to-end encrypted consultation channel established (DTLS/SRTP 256-bit).', time: '10:00 AM', isSelf: false },
    { sender: 'Doctor', text: 'Hello! I can hear you clearly. How are your symptoms progressing today?', time: '10:01 AM', isSelf: false },
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Quick Prescription Draft state (for doctors)
  const [rxDiagnosis, setRxDiagnosis] = useState<string>('Essential Hypertension - Grade 1 review');
  const [rxMedicines, setRxMedicines] = useState<PrescriptionItem[]>([
    {
      id: 'med-01',
      medicineName: 'Telmisartan 40mg',
      name: 'Telmisartan 40mg',
      dosage: '1 tablet',
      frequency: 'Once daily (Morning after food)',
      duration: '30 days',
      instructions: 'Monitor BP once a week in the morning'
    }
  ]);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedFreq, setNewMedFreq] = useState('');
  const [newMedDuration, setNewMedDuration] = useState('');
  const [rxAdvice, setRxAdvice] = useState('Maintain low sodium diet (<2g/day). 30 minutes brisk walking daily. Return for review in 4 weeks.');
  const [issuedRxId, setIssuedRxId] = useState<string | null>(null);
  const [rxSuccessMsg, setRxSuccessMsg] = useState('');

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        const doctors = await api.getDoctors();
        const appointments = await api.getAppointments();

        let targetApt: Appointment | null = null;
        if (appointmentId) {
          targetApt = appointments.find(a => a.id === appointmentId) || null;
        } else {
          // Find first upcoming teleconsultation appointment
          targetApt = appointments.find(a => a.type === 'teleconsultation' && a.status === 'confirmed') || null;
        }

        if (targetApt) {
          setAppointment(targetApt);
          const doc = doctors.find(d => d.id === targetApt.doctorId);
          if (doc) setSelectedDoctor(doc);
        } else if (doctorIdParam) {
          const doc = doctors.find(d => d.id === doctorIdParam);
          if (doc) setSelectedDoctor(doc);
        } else {
          // Default to premier cardiologist
          setSelectedDoctor(doctors[0] || null);
        }
      } catch (err) {
        console.error('Failed to initialize teleconsult session:', err);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [appointmentId, doctorIdParam]);

  // Call timer
  useEffect(() => {
    let timer: any;
    if (inCall) {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [inCall]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [
      ...prev,
      { sender: currentUser?.fullName || 'You', text: chatInput, time: timeStr, isSelf: true }
    ]);
    setChatInput('');

    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleAddMedicine = () => {
    if (!newMedName.trim()) return;
    setRxMedicines(prev => [
      ...prev,
      {
        id: `med-custom-${Date.now()}`,
        medicineName: newMedName,
        name: newMedName,
        dosage: newMedDosage || '1 tablet',
        frequency: newMedFreq || 'Twice daily after meals',
        duration: newMedDuration || '15 days',
        instructions: 'Take with warm water'
      }
    ]);
    setNewMedName('');
    setNewMedDosage('');
    setNewMedFreq('');
    setNewMedDuration('');
  };

  const handleIssuePrescription = async () => {
    if (!selectedDoctor) return;
    const patientName = appointment?.patientName || currentUser?.fullName || 'Ramesh Kumar';
    const patientId = appointment?.patientId || currentUser?.uid || 'pat-ramesh';

    try {
      const rx = await api.createPrescription({
        patientId,
        patientName,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.fullName,
        doctorRegistration: selectedDoctor.registrationNumber,
        doctorSpecialty: selectedDoctor.specialty,
        hospitalName: selectedDoctor.hospitalAffiliation,
        date: new Date().toISOString().split('T')[0],
        diagnosis: [rxDiagnosis],
        vitals: {
          bloodPressure: '128/84 mmHg',
          pulseBpm: 74,
          spo2: 99,
          temperatureF: 98.4
        },
        medicines: rxMedicines,
        advice: rxAdvice,
        doctorSignatureStamp: `SHA256-${Date.now().toString(16).toUpperCase()}-MCI-${selectedDoctor.registrationNumber}`
      });

      setIssuedRxId(rx.id);
      setRxSuccessMsg('Official digital prescription issued and cryptographically signed.');
    } catch (err) {
      console.error('Error creating prescription:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-cb-blue border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-300">Setting up secure clinical teleconsultation session...</p>
        </div>
      </div>
    );
  }

  // Pre-call Waiting Room / Device Check View
  if (!inCall) {
    return (
      <div className="bg-slate-900 min-h-screen text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              Tele-Health Compliance: MoHFW & ABDM Certified
            </span>
            <h1 className="text-2xl sm:text-3xl font-black">
              CareBridge Secure Video Consultation Suite
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              You are entering an encrypted, high-definition virtual examination room with clinical document synchronization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Camera Preview Tile (7 cols) */}
            <div className="md:col-span-7 bg-slate-800/90 border border-slate-700 rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800">
                {videoEnabled ? (
                  <div className="text-center space-y-3">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cb-blue to-teal-500 mx-auto flex items-center justify-center text-3xl font-black text-white shadow-xl ring-4 ring-white/10">
                      {currentUser?.fullName ? currentUser.fullName.charAt(0) : 'P'}
                    </div>
                    <p className="text-xs text-slate-400 font-medium">
                      Camera Stream Active (720p 30fps)
                    </p>
                  </div>
                ) : (
                  <div className="text-center space-y-2 text-slate-500">
                    <VideoOff className="w-12 h-12 mx-auto" />
                    <p className="text-xs">Camera is disabled</p>
                  </div>
                )}

                {/* Live Mic Indicator */}
                <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-2 border border-slate-700">
                  <span className={`w-2 h-2 rounded-full ${micEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                  <span>{micEnabled ? 'Mic: Clear' : 'Mic: Muted'}</span>
                </div>

                <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] text-slate-300 border border-slate-700">
                  Latency: 18ms
                </div>
              </div>

              {/* Hardware Toggles */}
              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setMicEnabled(!micEnabled)}
                  className={`p-3.5 rounded-2xl transition font-semibold text-xs flex items-center gap-2 ${
                    micEnabled 
                      ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                      : 'bg-rose-600/30 border border-rose-500/50 text-rose-300'
                  }`}
                >
                  {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  <span>{micEnabled ? 'Mute' : 'Unmuted'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVideoEnabled(!videoEnabled)}
                  className={`p-3.5 rounded-2xl transition font-semibold text-xs flex items-center gap-2 ${
                    videoEnabled 
                      ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                      : 'bg-rose-600/30 border border-rose-500/50 text-rose-300'
                  }`}
                >
                  {videoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  <span>{videoEnabled ? 'Stop Video' : 'Start Video'}</span>
                </button>
              </div>
            </div>

            {/* Specialist & Appointment Summary (5 cols) */}
            <div className="md:col-span-5 bg-slate-800/60 border border-slate-700/80 rounded-3xl p-6 space-y-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Consultation Participant
              </h2>

              {selectedDoctor && (
                <div className="flex items-start gap-4">
                  <img
                    src={selectedDoctor.avatarUrl}
                    alt={selectedDoctor.fullName}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-cb-blue shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-white text-base">{selectedDoctor.fullName}</h3>
                    <p className="text-xs text-blue-300 font-medium">{selectedDoctor.specialty}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{selectedDoctor.hospitalAffiliation}</p>
                    <div className="flex items-center gap-1 text-[11px] text-emerald-400 mt-1 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Doctor Online & Ready
                    </div>
                  </div>
                </div>
              )}

              {appointment ? (
                <div className="bg-slate-900/60 rounded-2xl p-3.5 border border-slate-700/50 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-400">
                    <span>Reference:</span>
                    <span className="font-mono text-white font-bold">{appointment.bookingReference}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Scheduled Slot:</span>
                    <span className="text-white font-medium">{appointment.date} at {appointment.timeSlot}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Patient Name:</span>
                    <span className="text-white font-medium">{appointment.patientName}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900/60 rounded-2xl p-3.5 border border-slate-700/50 text-xs text-slate-400">
                  Direct live teleconsultation with {selectedDoctor?.fullName || 'Specialist'}.
                </div>
              )}

              <button
                type="button"
                onClick={() => setInCall(true)}
                className="w-full py-3.5 bg-gradient-to-r from-cb-blue to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-black rounded-2xl shadow-lg shadow-blue-500/20 text-sm flex items-center justify-center gap-2 transition transform active:scale-98"
              >
                <Video className="w-5 h-5" />
                <span>Join Teleconsultation Room</span>
              </button>

              <div className="text-center">
                <Link
                  to="/appointments"
                  className="text-xs text-slate-400 hover:text-white transition"
                >
                  ← Return to Appointments Dashboard
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // Active Video Call Interface
  return (
    <div className="bg-slate-950 min-h-screen text-white flex flex-col">
      
      {/* Top Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-cb-blue text-white flex items-center justify-center font-bold">
            <Stethoscope className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">
                {selectedDoctor ? selectedDoctor.fullName : 'Teleconsultation Session'}
              </h2>
              <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                LIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {selectedDoctor?.specialty} • {selectedDoctor?.hospitalAffiliation}
            </p>
          </div>
        </div>

        {/* Timer & Encryption Indicator */}
        <div className="flex items-center gap-4">
          <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTimer(callDuration)}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-xl border border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted HD</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Video Stage (left) & Interactive Panel (right) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4">
        
        {/* Left: Video Stage (8 cols) */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
          
          {/* Main Stage (Doctor's Feed) */}
          <div className="relative flex-1 bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 min-h-[420px] flex items-center justify-center shadow-2xl">
            {selectedDoctor ? (
              <div className="relative w-full h-full flex items-center justify-center p-8">
                {/* Simulated High-Res Video Feed */}
                <div className="text-center space-y-4 max-w-sm">
                  <div className="relative mx-auto w-32 h-32">
                    <img
                      src={selectedDoctor.avatarUrl}
                      alt={selectedDoctor.fullName}
                      className="w-full h-full rounded-3xl object-cover border-2 border-cb-blue shadow-2xl"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-xl shadow">
                      <Volume2 className="w-4 h-4 animate-bounce" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedDoctor.fullName}</h3>
                    <p className="text-xs text-blue-400">{selectedDoctor.title}</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Registration: {selectedDoctor.registrationNumber} ({selectedDoctor.councilName})
                    </p>
                  </div>

                  {/* Audio visualizer simulation */}
                  <div className="flex items-center justify-center gap-1 pt-2">
                    {[16, 24, 32, 20, 28, 36, 18, 26, 34, 22].map((height, i) => (
                      <span
                        key={i}
                        style={{ height: `${height}px` }}
                        className="w-1 bg-cb-blue/80 rounded-full animate-pulse"
                      />
                    ))}
                  </div>
                </div>

                {/* Doctor Overlay Badge */}
                <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{selectedDoctor.fullName}</span>
                </div>
              </div>
            ) : null}

            {/* Self Picture-in-Picture Tile */}
            <div className="absolute bottom-4 right-4 w-40 sm:w-48 aspect-video bg-slate-950/90 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-xl flex items-center justify-center">
              {videoEnabled ? (
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-cb-blue text-white flex items-center justify-center font-bold text-sm mx-auto mb-1">
                    {currentUser?.fullName ? currentUser.fullName.charAt(0) : 'You'}
                  </div>
                  <span className="text-[10px] text-slate-300">You (Self View)</span>
                </div>
              ) : (
                <div className="text-center text-slate-500">
                  <VideoOff className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-[10px]">Video Off</span>
                </div>
              )}
              <div className="absolute bottom-1.5 left-2 text-[9px] text-slate-400 font-mono">
                {micEnabled ? 'MIC ON' : 'MUTED'}
              </div>
            </div>
          </div>

          {/* Bottom Floating Call Controls */}
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMicEnabled(!micEnabled)}
                className={`p-3 rounded-xl transition ${
                  micEnabled ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-rose-600 text-white'
                }`}
                title={micEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
              >
                {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setVideoEnabled(!videoEnabled)}
                className={`p-3 rounded-xl transition ${
                  videoEnabled ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-rose-600 text-white'
                }`}
                title={videoEnabled ? 'Stop Video' : 'Start Video'}
              >
                {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
            </div>

            {/* End Call Button */}
            <button
              onClick={() => {
                setInCall(false);
                if (appointment?.id) {
                  api.updateAppointmentStatus(appointment.id, 'completed');
                }
              }}
              className="px-6 py-3 bg-cb-rose hover:bg-rose-700 text-white font-bold rounded-xl transition flex items-center gap-2 text-xs shadow-lg shadow-rose-900/30"
            >
              <PhoneOff className="w-4 h-4" />
              <span>End Consultation</span>
            </button>

            {/* Panel Tabs Toggle on Mobile */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('chat')}
                className={`p-3 rounded-xl transition ${activeTab === 'chat' ? 'bg-cb-blue text-white' : 'bg-slate-800 text-slate-300'}`}
                title="In-Call Chat"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTab('prescription')}
                className={`p-3 rounded-xl transition ${activeTab === 'prescription' ? 'bg-cb-blue text-white' : 'bg-slate-800 text-slate-300'}`}
                title="Prescription Desk"
              >
                <FileText className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Right: Interactive Consultation Workspace (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 rounded-3xl border border-slate-800 flex flex-col h-[580px] overflow-hidden shadow-xl">
          
          {/* Workspace Tabs */}
          <div className="flex items-center border-b border-slate-800 bg-slate-950/60 p-2 gap-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'chat' ? 'bg-cb-blue text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Live Chat</span>
            </button>

            <button
              onClick={() => setActiveTab('records')}
              className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'records' ? 'bg-cb-blue text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Vitals & EHR</span>
            </button>

            <button
              onClick={() => setActiveTab('prescription')}
              className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'prescription' ? 'bg-cb-blue text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Rx Pad</span>
            </button>
          </div>

          {/* TAB 1: In-Call Chat */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col justify-between p-4 overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${m.isSelf ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1">
                      <span>{m.sender}</span>
                      <span>•</span>
                      <span>{m.time}</span>
                    </div>
                    <div
                      className={`px-3.5 py-2 rounded-2xl max-w-[85%] leading-relaxed ${
                        m.isSelf
                          ? 'bg-cb-blue text-white rounded-tr-xs'
                          : m.sender === 'System'
                          ? 'bg-slate-800/80 text-emerald-400 border border-slate-700 text-[11px]'
                          : 'bg-slate-800 text-slate-200 rounded-tl-xs'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type message or clinical observation..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cb-blue placeholder-slate-500"
                />
                <button
                  type="submit"
                  className="p-2 bg-cb-blue hover:bg-blue-600 text-white rounded-xl transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: Vitals & EHR Patient Summary */}
          {activeTab === 'records' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Patient Vitals</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-slate-900 rounded-xl">
                    <span className="text-[10px] text-slate-500 block">Blood Pressure</span>
                    <span className="font-mono font-bold text-white">128/84 mmHg</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded-xl">
                    <span className="text-[10px] text-slate-500 block">Pulse Rate</span>
                    <span className="font-mono font-bold text-emerald-400">74 bpm</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded-xl">
                    <span className="text-[10px] text-slate-500 block">SpO2 Oxygen</span>
                    <span className="font-mono font-bold text-blue-400">99%</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded-xl">
                    <span className="text-[10px] text-slate-500 block">Body Temp</span>
                    <span className="font-mono font-bold text-white">98.4 °F</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Known Allergies</span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 bg-rose-950/80 text-rose-300 border border-rose-800/60 rounded-lg text-[11px] font-bold">
                    Penicillin (Severe anaphylaxis risk)
                  </span>
                  <span className="px-2.5 py-1 bg-slate-900 text-slate-300 rounded-lg text-[11px]">
                    Sulfa Drugs (Mild rash)
                  </span>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Past Diagnoses</span>
                <ul className="list-disc list-inside text-slate-300 space-y-1">
                  <li>Essential Hypertension (Diagnosed 2022)</li>
                  <li>Type-2 Diabetes Mellitus (HbA1c: 6.8%)</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: Digital Prescription Pad */}
          {activeTab === 'prescription' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
              {issuedRxId ? (
                <div className="bg-emerald-950/60 border border-emerald-500/50 rounded-2xl p-5 text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h4 className="font-bold text-white text-sm">Prescription Issued!</h4>
                  <p className="text-emerald-200 text-xs">{rxSuccessMsg}</p>
                  <Link
                    to={`/prescriptions/${issuedRxId}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition text-xs shadow-md"
                  >
                    <span>Open & Print Official Slip</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Clinical Diagnosis</label>
                    <input
                      type="text"
                      value={rxDiagnosis}
                      onChange={(e) => setRxDiagnosis(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cb-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Prescribed Medicines</label>
                    <div className="space-y-2">
                      {rxMedicines.map((item, idx) => (
                        <div key={idx} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-white block">{item.medicineName || item.name}</span>
                            <span className="text-[11px] text-slate-400">{item.dosage} • {item.frequency} • {item.duration}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setRxMedicines(rxMedicines.filter((_, i) => i !== idx))}
                            className="text-rose-400 hover:text-rose-300 text-xs px-2"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add Medicine Mini-Form */}
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Medicine name..."
                        value={newMedName}
                        onChange={(e) => setNewMedName(e.target.value)}
                        className="col-span-2 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="Dosage (e.g. 1 tab)"
                        value={newMedDosage}
                        onChange={(e) => setNewMedDosage(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="Frequency (e.g. 1-0-1)"
                        value={newMedFreq}
                        onChange={(e) => setNewMedFreq(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="Duration (e.g. 15 days)"
                        value={newMedDuration}
                        onChange={(e) => setNewMedDuration(e.target.value)}
                        className="col-span-2 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddMedicine}
                        className="col-span-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-300 font-bold rounded-lg text-xs flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add to Prescription
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Doctor's Clinical Advice</label>
                    <textarea
                      rows={2}
                      value={rxAdvice}
                      onChange={(e) => setRxAdvice(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-cb-blue"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleIssuePrescription}
                    className="w-full py-2.5 bg-cb-emerald hover:bg-emerald-600 text-white font-bold rounded-xl transition text-xs shadow-md shadow-emerald-900/40 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Issue Official Prescription (SHA256 Signed)</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
