import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { dataStore } from '../../services/dataStore';
import { UserRole } from '../../types';
import { ShieldAlert, Lock, ArrowRight, Stethoscope, HeartHandshake } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const location = useLocation();
  const isLoggedIn = dataStore.isLoggedIn();
  const currentUser = dataStore.getCurrentUser();

  // If user is not logged in
  if (!isLoggedIn) {
    return (
      <div className="max-w-xl mx-auto my-12 px-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center space-y-5">
          <div className="w-16 h-16 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900">CareBridge Authentication Required</h2>
            <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
              You must be signed in with an authenticated CareBridge mobile account to access this healthcare dashboard.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1 text-left">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <ShieldAlert className="w-4 h-4 text-teal-600" />
              <span>Role-Based Healthcare Security</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Only verified Patients, authorized Doctors, and accredited frontline workers can view health records and clinical notes.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
              className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-sm"
            >
              Sign In with Mobile OTP <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-5 py-2.5 rounded-xl text-xs transition"
            >
              Register New User
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If role-based restriction applies and user's role is not allowed
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    const isPatient = currentUser.role === 'patient';
    const isDoctor = currentUser.role === 'doctor';

    return (
      <div className="max-w-xl mx-auto my-12 px-4">
        <div className="bg-white rounded-2xl border-2 border-rose-200 shadow-xl p-8 text-center space-y-5">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-rose-950">Access Restricted by Role</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              You are signed in as <strong>{currentUser.fullName} ({currentUser.role.toUpperCase()})</strong>.
              This area is restricted to: <strong>{allowedRoles.map(r => r.toUpperCase()).join(', ')}</strong>.
            </p>
          </div>

          <div className="p-4 bg-rose-50 rounded-xl text-left text-xs text-rose-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-rose-600" />
              Role Boundary Enforced
            </div>
            <p className="text-[11px] text-rose-800 leading-relaxed">
              {isPatient 
                ? 'Patients cannot access clinical encounter documentation or physician monitoring pages.'
                : isDoctor
                ? 'Doctors cannot directly administer patient permissions or private settings without explicit consent.'
                : 'Your current role does not possess permissions for this resource.'}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {isPatient && (
              <Link
                to="/patient"
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm"
              >
                <HeartHandshake className="w-4 h-4" /> Go to Patient Dashboard
              </Link>
            )}
            {isDoctor && (
              <Link
                to="/doctor"
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm"
              >
                <Stethoscope className="w-4 h-4" /> Go to Doctor Dashboard
              </Link>
            )}
            <Link
              to="/"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
