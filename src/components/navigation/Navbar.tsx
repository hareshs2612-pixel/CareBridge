import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { dataStore } from '../../services/dataStore';
import { api } from '../../services/api';
import { UserProfile, NotificationItem } from '../../types';
import { LocationModal } from './LocationModal';
import {
  MapPin,
  PhoneCall,
  Bell,
  CheckCheck,
  ChevronDown,
  User,
  Calendar,
  FileText,
  Shield,
  Stethoscope,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  ExternalLink,
  Wifi,
  WifiOff,
  Pill,
  Hospital as HospitalIcon,
  Video
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(dataStore.getCurrentUser());
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(dataStore.isLoggedIn());
  const [selectedCity, setSelectedCity] = useState<string>(dataStore.getSelectedCity());
  const [isOffline, setIsOffline] = useState<boolean>(dataStore.isLowConnectivity());
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const update = () => {
      const user = dataStore.getCurrentUser();
      setCurrentUser(user);
      setIsLoggedIn(dataStore.isLoggedIn());
      setSelectedCity(dataStore.getSelectedCity());
      setIsOffline(dataStore.isLowConnectivity());
      setNotifications(dataStore.getNotifications(user?.uid));
    };
    update();
    return dataStore.subscribe(update);
  }, []);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadNotifications = notifications.filter(n => !n.read);

  const handleSelectCity = (city: string) => {
    setSelectedCity(city);
    dataStore.setSelectedCity(city);
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {}
    dataStore.logout();
    setShowUserMenu(false);
    navigate('/login');
  };

  const handleMarkAllNotificationsRead = () => {
    notifications.forEach(n => {
      if (!n.read) dataStore.markNotificationRead(n.id);
    });
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navLinks = [
    { to: '/doctors', label: 'Find Doctors' },
    { to: '/appointments/book', label: 'Book Appointment' },
    { to: '/facilities', label: 'Hospitals & Clinics' },
    { to: '/teleconsult', label: 'Teleconsultation' },
    { to: '/pharmacy', label: 'Pharmacy & Stock' },
    { to: '/patient/records', label: 'Health Records' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white shadow-xs border-b border-slate-200">
      {/* 1. Top Emergency & Utility Strip */}
      <div className="bg-cb-navy text-slate-300 text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Emergency 24x7 Hotline */}
          <div className="flex items-center gap-3">
            <a
              href="tel:1066"
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cb-rose/20 text-red-300 font-bold border border-cb-rose/40 hover:bg-cb-rose/30 transition text-[11px]"
            >
              <PhoneCall className="w-3 h-3 text-cb-rose animate-pulse" />
              <span>24x7 Emergency: 1066</span>
            </a>
            <span className="hidden lg:inline text-slate-400 text-[11px]">
              Multi-Specialty Healthcare Network & Rapid Ambulance Response
            </span>
          </div>

          {/* Location & Utilities */}
          <div className="flex items-center gap-3">
            {/* City Selector */}
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-white/10 text-white hover:bg-white/15 transition cursor-pointer font-medium text-[11px]"
              title="Select current city for hospital & doctor discovery"
            >
              <MapPin className="w-3.5 h-3.5 text-cb-blue-light" />
              <span>{selectedCity}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Simulated Offline Toggle */}
            <button
              onClick={() => dataStore.setLowConnectivity(!isOffline)}
              className={`hidden sm:flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                isOffline
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                  : 'bg-white/5 text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle simulated offline local cache mode"
            >
              {isOffline ? <WifiOff className="w-3 h-3 text-amber-400" /> : <Wifi className="w-3 h-3" />}
              <span>{isOffline ? 'Offline Cache' : 'Online Sync'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Brand & Navigation Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Brand Logo & Tagline */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cb-navy to-cb-blue flex items-center justify-center text-white shadow-md shadow-cb-navy/20 group-hover:scale-105 transition">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-currentColor stroke-2 stroke-linecap-round stroke-linejoin-round">
              <path d="M12 4v16m-8-8h16" />
              <path d="M4 19c4-4 12-4 16 0" />
            </svg>
          </div>
          <div>
            <div className="text-xl font-black tracking-tight text-cb-navy font-heading flex items-center gap-1.5">
              CareBridge
              <span className="w-2 h-2 rounded-full bg-cb-emerald"></span>
            </div>
            <p className="text-[10px] tracking-wider uppercase font-bold text-slate-400 -mt-1">
              Healthcare, connected to you
            </p>
          </div>
        </Link>

        {/* Desktop Primary Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${
                  active
                    ? 'bg-cb-blue/10 text-cb-blue'
                    : 'text-slate-600 hover:text-cb-navy hover:bg-slate-100'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Utility: Notifications + Auth */}
        <div className="flex items-center gap-2.5">
          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-cb-navy hover:bg-slate-100 transition cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-cb-rose text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadNotifications.length}
                </span>
              )}
            </button>

            {/* Notification Menu */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-elevated border border-slate-100 py-3 z-50 animate-fade-in">
                <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                  <div className="font-bold text-sm text-cb-navy flex items-center gap-2">
                    Notifications
                    {unreadNotifications.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-cb-blue/10 text-cb-blue text-xs font-semibold">
                        {unreadNotifications.length} new
                      </span>
                    )}
                  </div>
                  {unreadNotifications.length > 0 && (
                    <button
                      onClick={handleMarkAllNotificationsRead}
                      className="text-xs text-cb-blue hover:underline flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No notifications right now
                    </div>
                  ) : (
                    notifications.slice(0, 6).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          if (!n.read) dataStore.markNotificationRead(n.id);
                          if (n.actionUrl) {
                            setShowNotifications(false);
                            navigate(n.actionUrl);
                          }
                        }}
                        className={`p-3.5 text-xs hover:bg-slate-50 transition cursor-pointer ${
                          !n.read ? 'bg-cb-blue/5' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-bold text-slate-800">{n.title}</div>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {new Date(n.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-1 line-clamp-2 leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Auth State */}
          {isLoggedIn && currentUser ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition cursor-pointer"
              >
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                  alt={currentUser.fullName}
                  className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                />
                <div className="hidden md:block text-left">
                  <div className="text-xs font-bold text-cb-navy truncate max-w-[120px]">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">
                    {currentUser.role === 'doctor' ? 'Physician' : currentUser.role === 'admin' ? 'Administrator' : 'Patient'}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-elevated border border-slate-100 py-2 z-50 animate-fade-in">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="font-bold text-sm text-cb-navy">{currentUser.fullName}</div>
                    <div className="text-xs text-slate-500 truncate">{currentUser.email || currentUser.phone}</div>
                    {currentUser.abhaId && (
                      <div className="mt-1.5 inline-block px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-mono text-slate-600">
                        ABHA: {currentUser.abhaId}
                      </div>
                    )}
                  </div>

                  <div className="py-1">
                    {currentUser.role === 'patient' && (
                      <>
                        <Link
                          to="/appointments"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-cb-blue transition"
                        >
                          <Calendar className="w-4 h-4 text-slate-400" />
                          My Appointments
                        </Link>
                        <Link
                          to="/patient/records"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-cb-blue transition"
                        >
                          <FileText className="w-4 h-4 text-slate-400" />
                          Health Records & Rx
                        </Link>
                        <Link
                          to="/patient/consents"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-cb-blue transition"
                        >
                          <Shield className="w-4 h-4 text-slate-400" />
                          Consent Management
                        </Link>
                      </>
                    )}

                    {currentUser.role === 'doctor' && (
                      <>
                        <Link
                          to="/doctor"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-cb-blue transition"
                        >
                          <Stethoscope className="w-4 h-4 text-slate-400" />
                          Physician Practice Portal
                        </Link>
                        <Link
                          to="/doctor/note"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-cb-blue transition"
                        >
                          <FileText className="w-4 h-4 text-slate-400" />
                          Issue Clinical Note / Rx
                        </Link>
                      </>
                    )}

                    {currentUser.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-cb-blue transition"
                      >
                        <Shield className="w-4 h-4 text-slate-400" />
                        Security Audit Logs
                      </Link>
                    )}

                    <div className="my-1 border-t border-slate-100" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-cb-rose hover:bg-red-50 transition cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-cb-rose" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 rounded-xl bg-cb-blue text-white text-xs font-bold hover:bg-cb-blue-hover shadow-sm transition"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-cb-navy hover:bg-slate-100 transition"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 3. Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-1 animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-xl text-sm font-medium transition ${
                isActive(link.to)
                  ? 'bg-cb-blue/10 text-cb-blue font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-100">
            <a
              href="tel:1066"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-cb-rose/10 text-cb-rose font-bold text-xs"
            >
              <PhoneCall className="w-4 h-4" />
              Emergency Helpline: 1066
            </a>
          </div>
        </div>
      )}

      {/* Location Selector Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentCity={selectedCity}
        onSelectCity={handleSelectCity}
      />
    </header>
  );
};
