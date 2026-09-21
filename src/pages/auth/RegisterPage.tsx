import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { dataStore } from '../../services/dataStore';
import { 
  User, 
  Phone, 
  KeyRound, 
  HeartHandshake, 
  Stethoscope, 
  ArrowRight, 
  AlertCircle, 
  ShieldCheck, 
  Building2, 
  MapPin, 
  Clock, 
  Sparkles,
  CheckCircle2,
  Info
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  // Step 1: Details, Step 2: OTP Verification
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Patient Fields
  const [dob, setDob] = useState('1990-01-01');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [village, setVillage] = useState('Sitapur Rural');
  const [district, setDistrict] = useState('Sitapur');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');

  // Doctor Fields
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [specialization, setSpecialization] = useState('General Medicine & Rural Health');
  const [hospitalAffiliation, setHospitalAffiliation] = useState('Community Health Centre (CHC) Rampur');
  const [qualification, setQualification] = useState('MBBS, MD');
  const [experienceYears, setExperienceYears] = useState(5);

  // OTP State
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [hasSmsProvider, setHasSmsProvider] = useState<boolean>(false);

  useEffect(() => {
    api.checkHealth()
      .then(res => setHasSmsProvider(res.hasSmsProvider))
      .catch(() => setHasSmsProvider(false));
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter your 10-digit Indian mobile number.');
      return;
    }

    if (role === 'doctor' && !registrationNumber.trim()) {
      setError('Please enter your NMC or State Medical Council registration number.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.requestRegisterOtp(phone.trim());
      setChallengeId(res.challengeId);
      setCountdown(res.expiresInSeconds || 300);
      setInfoMessage(res.message || 'OTP dispatched to your mobile number.');
    } catch (err: any) {
      setError(err.message || 'Unable to request registration OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeId) return;
    setError(null);

    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6) {
      setError('Please enter the 6-digit OTP sent to your phone.');
      return;
    }

    setIsLoading(true);
    try {
      const payload: any = {
        challengeId,
        otp: cleanOtp,
        role,
        fullName: fullName.trim(),
        email: email.trim() || undefined
      };

      if (role === 'patient') {
        payload.dob = dob;
        payload.gender = gender;
        payload.bloodGroup = bloodGroup;
        payload.village = village;
        payload.district = district;
        payload.emergencyContactName = emergencyContactName;
        payload.emergencyContactPhone = emergencyContactPhone;
      } else {
        payload.registrationNumber = registrationNumber.trim();
        payload.specialization = specialization;
        payload.hospitalAffiliation = hospitalAffiliation;
        payload.qualification = qualification;
        payload.experienceYears = Number(experienceYears);
      }

      const res = await api.verifyRegisterOtp(payload);

      // Sync into frontend dataStore
      dataStore.addUser(res.user);
      if (res.user.role === 'patient' && res.profile) {
        dataStore.addPatient(res.profile as any);
      } else if (res.user.role === 'doctor' && res.profile) {
        dataStore.addDoctor(res.profile as any);
      }
      dataStore.setCurrentUser(res.user.uid, res.token);

      // Navigate to respective dashboard
      if (res.user.role === 'doctor') {
        navigate('/doctor');
      } else {
        navigate('/patient');
      }
    } catch (err: any) {
      setError(err.message || 'Registration verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/20 mb-1">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Register New Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Join the CareBridge healthcare continuity network as a Patient or Licensed Healthcare Provider
          </p>
        </div>

        {/* Real OTP Gateway Notice */}
        <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 text-xs border border-slate-800 shadow-md space-y-1.5">
          <div className="flex items-center gap-2 text-teal-400 font-bold">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>Secure Server-Side Mobile Verification</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            {hasSmsProvider ? (
              <span>SMS gateway is active. You will receive an SMS directly on your mobile phone.</span>
            ) : (
              <span>
                <strong>Evaluation Mode:</strong> A random 6-digit OTP will be generated server-side and printed to your <strong>backend terminal console</strong> (it is never returned in API responses). Check the terminal to complete registration.
              </span>
            )}
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          {infoMessage && (
            <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-800 flex items-start gap-2.5 animate-in fade-in">
              <Info className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{infoMessage}</div>
            </div>
          )}

          {!challengeId ? (
            /* STEP 1: Details & Role Selection */
            <form onSubmit={handleSendOtp} className="space-y-6">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select User Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('patient')}
                    className={`p-4 rounded-xl border text-left transition flex items-start gap-3 ${
                      role === 'patient'
                        ? 'border-teal-600 bg-teal-50/70 ring-2 ring-teal-600'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${role === 'patient' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <HeartHandshake className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-black text-xs sm:text-sm text-slate-900 block">Patient</span>
                      <span className="text-[11px] text-slate-500 leading-snug block mt-0.5">
                        Manage health records, appointments, and doctor permissions.
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('doctor')}
                    className={`p-4 rounded-xl border text-left transition flex items-start gap-3 ${
                      role === 'doctor'
                        ? 'border-teal-600 bg-teal-50/70 ring-2 ring-teal-600'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${role === 'doctor' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-black text-xs sm:text-sm text-slate-900 block">Doctor / Clinician</span>
                      <span className="text-[11px] text-slate-500 leading-snug block mt-0.5">
                        Review authorized records, write notes, and prescribe meds.
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Common Account Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={role === 'doctor' ? 'Dr. Vikram Sethi' : 'e.g. Suresh Patel'}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mobile Number (India) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98123 45678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Patient-Specific Fields */}
              {role === 'patient' && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                  <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block">
                    Patient Profile Details
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Gender</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as any)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:outline-none"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Blood Group</label>
                      <select
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:outline-none"
                      >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Village / Town</label>
                      <input
                        type="text"
                        value={village}
                        onChange={(e) => setVillage(e.target.value)}
                        placeholder="e.g. Rampur Village"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">District</label>
                      <input
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder="e.g. Sitapur"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Emergency Contact Name</label>
                      <input
                        type="text"
                        value={emergencyContactName}
                        onChange={(e) => setEmergencyContactName(e.target.value)}
                        placeholder="e.g. Brother / Spouse"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Emergency Contact Phone</label>
                      <input
                        type="tel"
                        value={emergencyContactPhone}
                        onChange={(e) => setEmergencyContactPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Doctor-Specific Fields */}
              {role === 'doctor' && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                  <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block">
                    Medical Practitioner Credentials
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        NMC / State Registration Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={registrationNumber}
                        onChange={(e) => setRegistrationNumber(e.target.value)}
                        placeholder="e.g. NMC/2020/081294"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white font-mono focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Qualification
                      </label>
                      <input
                        type="text"
                        value={qualification}
                        onChange={(e) => setQualification(e.target.value)}
                        placeholder="e.g. MBBS, MD (Medicine)"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Specialization
                      </label>
                      <input
                        type="text"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        placeholder="e.g. Cardiology, General Medicine"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Hospital / Health Facility Affiliation
                      </label>
                      <input
                        type="text"
                        value={hospitalAffiliation}
                        onChange={(e) => setHospitalAffiliation(e.target.value)}
                        placeholder="e.g. CHC Rampur / District Hospital"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md shadow-teal-600/10"
              >
                {isLoading ? (
                  <span>Generating Real OTP...</span>
                ) : (
                  <>
                    <span>Proceed to Mobile OTP Verification</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* STEP 2: Enter Real OTP */
            <form onSubmit={handleCompleteRegistration} className="space-y-5 animate-in fade-in">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Creating Account:</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                    {role.toUpperCase()}
                  </span>
                </div>
                <div className="font-bold text-slate-900 text-sm">{fullName}</div>
                <div className="text-xs text-slate-600 font-mono">{phone}</div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Enter 6-Digit Verification Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    required
                    autoFocus
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-center text-lg font-mono font-bold tracking-widest focus:ring-2 focus:ring-teal-600 focus:outline-none transition"
                  />
                </div>
                {!hasSmsProvider && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-snug">
                    <div className="font-bold flex items-center gap-1.5 text-amber-800 mb-1">
                      <span>🖥️ Terminal Log Delivery (No SMS Gateway Configured)</span>
                    </div>
                    <p className="text-[11px] text-amber-800/90">
                      Since external SMS keys are not configured in <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono text-[10px]">.env</code>, your real OTP was logged to the <strong>backend terminal window</strong> (<code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono text-[10px]">node server/index.mjs</code>). Check your terminal console to read the 6-digit code.
                    </p>
                  </div>
                )}
                <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Expires in: <strong className="text-slate-700">{Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}</strong>
                  </span>
                  {countdown <= 0 ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-teal-700 font-bold hover:underline"
                    >
                      Resend OTP
                    </button>
                  ) : (
                    <span className="text-slate-400">Resend in {countdown}s</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setChallengeId(null);
                    setOtp('');
                    setError(null);
                  }}
                  className="w-1/3 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-50"
                >
                  Edit Details
                </button>
                <button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="w-2/3 py-3 px-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md shadow-teal-600/10"
                >
                  {isLoading ? (
                    <span>Validating & Creating Account...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Complete Registration</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Switch to Login */}
          <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-700 font-bold hover:underline">
              Sign In with Mobile OTP
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
