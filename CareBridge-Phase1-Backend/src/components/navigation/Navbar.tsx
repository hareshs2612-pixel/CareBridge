import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { dataStore } from '../../services/dataStore';
import { UserProfile, AppLanguage } from '../../types';
import { useTranslation, SUPPORTED_LANGUAGES } from '../../services/i18n';
import { DemoSwitcher } from '../common/DemoSwitcher';
import { 
  HeartHandshake, 
  FileText, 
  UploadCloud, 
  KeyRound, 
  MapPin, 
  AlertTriangle, 
  ShieldCheck, 
  Stethoscope, 
  Users, 
  Menu, 
  X,
  Building2,
  Compass,
  Pill,
  Globe,
  Wifi,
  WifiOff,
  Info
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(dataStore.getCurrentUser());
  const [isOffline, setIsOffline] = useState<boolean>(dataStore.isLowConnectivity());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { t, language, setLanguage, currentOption } = useTranslation();

  useEffect(() => {
    return dataStore.subscribe(() => {
      setCurrentUser(dataStore.getCurrentUser());
      setIsOffline(dataStore.isLowConnectivity());
    });
  }, []);

  const handleLanguageChange = (lang: AppLanguage) => {
    setLanguage(lang);
  };

  const handleToggleOffline = () => {
    dataStore.setLowConnectivity(!isOffline);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      {/* Emergency & Low-Bandwidth / Gov Info Banner */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-slate-200">Smart India Hackathon 2026 — SIH26133</span>
            <span className="hidden md:inline text-slate-400">| Rural Healthcare Access & Continuity</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Low-Connectivity / Offline Toggle Simulator */}
            <button
              onClick={handleToggleOffline}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                isOffline 
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40' 
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle simulated low-connectivity / offline mode with local storage cache"
            >
              {isOffline ? <WifiOff className="w-3 h-3 text-amber-400" /> : <Wifi className="w-3 h-3 text-slate-400" />}
              <span>{isOffline ? t('offline_mode') : t('online_mode')}</span>
            </button>

            {/* Language Selector: Exactly 7 languages ordered as requested */}
            <div className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700 text-xs shadow-xs">
              <Globe className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as AppLanguage)}
                className="bg-transparent text-teal-200 font-bold focus:outline-none cursor-pointer text-[11px]"
                aria-label="Select Interface Language"
              >
                {SUPPORTED_LANGUAGES.map((langOpt) => (
                  <option key={langOpt.code} value={langOpt.code} className="bg-slate-900 text-white py-1">
                    {langOpt.label}
                  </option>
                ))}
              </select>
            </div>

            <Link 
              to="/emergency" 
              className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold px-2.5 py-0.5 rounded text-[11px] transition shadow-sm animate-pulse"
            >
              <AlertTriangle className="w-3 h-3" />
              {t('nav_emergency_sos')}
            </Link>
          </div>
        </div>
      </div>

      {/* Regional Language & Fallback Notice Banner */}
      {language !== 'en' && (
        <div className="bg-teal-950 text-teal-200 text-[11px] px-4 py-1.5 border-b border-teal-800">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
              <span className="font-bold text-teal-300">{currentOption.label}:</span>
              <span>{t('judge_language_note')}</span>
            </div>
            <span className="text-[10px] text-teal-300/80 italic">
              {t('fallback_notice')}
            </span>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md group-hover:bg-teal-700 transition">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">CareBridge</span>
                <span className="text-xs bg-teal-100 text-teal-800 font-bold px-1.5 py-0.2 rounded">RURAL</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-none">
                Longitudinal Health Record & Emergency Access
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              to="/navigator"
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                isActive('/navigator') ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Compass className="w-4 h-4 text-teal-600" />
              Guided Triage
            </Link>

            {currentUser.role === 'patient' && (
              <>
                <Link
                  to="/patient"
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    isActive('/patient') ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <HeartHandshake className="w-4 h-4 text-teal-600" />
                  Health Overview
                </Link>

                <Link
                  to="/patient/records"
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    isActive('/patient/records') ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-4 h-4 text-teal-600" />
                  Longitudinal Records
                </Link>

                <Link
                  to="/patient/continuity"
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    isActive('/patient/continuity') ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Pill className="w-4 h-4 text-teal-600" />
                  Care Continuity
                </Link>

                <Link
                  to="/patient/upload"
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    isActive('/patient/upload') ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <UploadCloud className="w-4 h-4 text-teal-600" />
                  Upload Docs
                </Link>

                <Link
                  to="/patient/consents"
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    isActive('/patient/consents') ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <KeyRound className="w-4 h-4 text-teal-600" />
                  Permissions
                </Link>
              </>
            )}

            {currentUser.role === 'frontline_worker' && (
              <>
                <Link
                  to="/coordination"
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    isActive('/coordination') ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Users className="w-4 h-4 text-teal-600" />
                  ASHA Coordination
                </Link>
              </>
            )}

            {currentUser.role === 'doctor' && (
              <>
                <Link
                  to="/doctor"
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    isActive('/doctor') ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Users className="w-4 h-4 text-teal-600" />
                  Patients
                </Link>

                <Link
                  to="/doctor/note"
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    isActive('/doctor/note') ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  Clinical Note
                </Link>

                <Link
                  to="/coordination"
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    isActive('/coordination') ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Users className="w-4 h-4 text-teal-600" />
                  Care Coordination
                </Link>
              </>
            )}

            {currentUser.role === 'admin' && (
              <Link
                to="/admin"
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  isActive('/admin') ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                Audit Logs
              </Link>
            )}

            <Link
              to="/facilities"
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                isActive('/facilities') ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <MapPin className="w-4 h-4 text-teal-600" />
              Facility Map
            </Link>
          </nav>

          {/* Right Action: Demo Persona Switcher */}
          <div className="hidden sm:flex items-center gap-3">
            <DemoSwitcher />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <DemoSwitcher />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
          <Link
            to="/navigator"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-semibold text-teal-800 hover:bg-teal-50"
          >
            🧭 Guided Care Triage
          </Link>

          {currentUser.role === 'patient' && (
            <>
              <Link
                to="/patient"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Health Overview
              </Link>
              <Link
                to="/patient/continuity"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Care Continuity & Meds
              </Link>
              <Link
                to="/patient/records"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Longitudinal Records
              </Link>
              <Link
                to="/patient/upload"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Upload Documents
              </Link>
              <Link
                to="/patient/consents"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Permissions & Consents
              </Link>
            </>
          )}

          {currentUser.role === 'frontline_worker' && (
            <Link
              to="/coordination"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              ASHA Coordination Console
            </Link>
          )}

          {currentUser.role === 'doctor' && (
            <>
              <Link
                to="/doctor"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Authorized Patients
              </Link>
              <Link
                to="/doctor/note"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                New Clinical Encounter
              </Link>
              <Link
                to="/coordination"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Care Coordination
              </Link>
            </>
          )}

          {currentUser.role === 'admin' && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Audit Logs & Governance
            </Link>
          )}

          <Link
            to="/facilities"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Rural Healthcare Map
          </Link>
          <Link
            to="/emergency"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-bold text-rose-600 hover:bg-rose-50"
          >
            🚨 Emergency Triage Portal
          </Link>
        </div>
      )}
    </header>
  );
};
