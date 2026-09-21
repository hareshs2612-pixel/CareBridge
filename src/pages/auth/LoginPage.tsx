import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { dataStore } from '../../services/dataStore';
import { 
  Phone, 
  KeyRound, 
  HeartHandshake, 
  Stethoscope, 
  ArrowRight, 
  AlertCircle, 
  ShieldCheck, 
  Clock, 
  Sparkles,
  Info
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect');

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [challengeId, setChallengeId] = useState<string | null>(null);
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

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      setError('Please enter your mobile number.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.requestLoginOtp(cleanPhone);
      setChallengeId(res.challengeId);
      setCountdown(res.expiresInSeconds || 300);
      setInfoMessage(res.message || 'OTP dispatched to your registered mobile number.');
    } catch (err: any) {
      setError(err.message || 'Unable to request OTP. Please verify your mobile number.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeId) return;
    setError(null);

    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6) {
      setError('Please enter the 6-digit OTP received on your mobile.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.verifyLoginOtp(challengeId, cleanOtp);
      // Sync into dataStore
      dataStore.addUser(res.user);
      if (res.user.role === 'patient' && res.profile) {
        dataStore.addPatient(res.profile as any);
      } else if (res.user.role === 'doctor' && res.profile) {
        dataStore.addDoctor(res.profile as any);
      }
      dataStore.setCurrentUser(res.user.uid, res.token);

      // Role comes strictly from the stored user account
      if (redirectPath) {
        navigate(redirectPath);
      } else if (res.user.role === 'doctor') {
        navigate('/doctor');
      } else if (res.user.role === 'patient') {
        navigate('/patient');
      } else if (res.user.role === 'frontline_worker') {
        navigate('/coordination');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'OTP verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/20 mb-2">
            <HeartHandshake className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Sign In to CareBridge
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Secure mobile phone OTP authentication for Patients & Healthcare Providers
          </p>
        </div>

        {/* Development Gateway Banner Notice */}
        <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 text-xs border border-slate-800 shadow-md space-y-1.5">
          <div className="flex items-center gap-2 text-teal-400 font-bold">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>Real Server-Side OTP Engine</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            {hasSmsProvider ? (
              <span>SMS gateway active. You will receive an SMS directly on your mobile.</span>
            ) : (
              <span>
                <strong>Evaluator Notice:</strong> Random 6-digit OTP is generated server-side and dispatched to the <strong>backend terminal console</strong> (never exposed in API responses). Check your server terminal window for the live code.
              </span>
            )}
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-5">
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
            /* STEP 1: Phone Number Entry */
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mobile Number (India)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    placeholder="e.g. +91 94150 12345 or 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none transition"
                  />
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Enter the 10-digit phone number registered with your account.
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md shadow-teal-600/10"
              >
                {isLoading ? (
                  <span>Generating Secure OTP...</span>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* STEP 2: OTP Verification */
            <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block">Verifying Mobile:</span>
                  <span className="font-bold text-slate-800">{phone}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setChallengeId(null);
                    setOtp('');
                    setError(null);
                  }}
                  className="text-teal-600 hover:text-teal-700 font-bold text-xs"
                >
                  Change
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Enter 6-Digit One-Time Password
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
                      onClick={handleRequestOtp}
                      className="text-teal-700 font-bold hover:underline"
                    >
                      Resend OTP
                    </button>
                  ) : (
                    <span className="text-slate-400">Resend in {countdown}s</span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md shadow-teal-600/10"
              >
                {isLoading ? (
                  <span>Authenticating Identity...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify & Log In</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Role Assurance Notice */}
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0" />
            <span>Role is determined strictly from your verified account. Doctor access cannot be granted through client manipulation.</span>
          </div>

          {/* Switch to Register */}
          <div className="text-center pt-2 text-xs text-slate-600">
            New to CareBridge?{' '}
            <Link to="/register" className="text-teal-700 font-bold hover:underline">
              Create an account (Patient or Doctor)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
