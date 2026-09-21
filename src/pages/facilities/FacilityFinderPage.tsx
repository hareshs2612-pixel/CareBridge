import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Search, 
  Phone, 
  AlertTriangle, 
  Clock, 
  Filter, 
  Navigation, 
  ShieldCheck, 
  Star, 
  BedDouble, 
  Ambulance, 
  Calendar,
  Layers,
  ChevronRight,
  HeartPulse
} from 'lucide-react';
import { Hospital } from '../../types';
import { dataStore } from '../../services/dataStore';
import { api } from '../../services/api';

export const FacilityFinderPage: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [viewMode, setViewMode] = useState<'cards' | 'map'>('cards');
  const [activeHospitalId, setActiveHospitalId] = useState<string>('');

  const cities = ['All', 'Bengaluru', 'Chennai', 'Mumbai', 'Delhi-NCR', 'Hyderabad', 'Kolkata', 'Pune', 'Coimbatore'];
  
  const departments = [
    'All',
    'Cardiology',
    'Neurology',
    'Oncology',
    'Orthopaedics',
    'Nephrology',
    'Gastroenterology',
    'Emergency & Trauma'
  ];

  const emergencyHelplines = [
    { name: 'CareBridge 24x7 Trauma Line', number: '1066', priority: true },
    { name: 'National Emergency Response', number: '112', priority: false },
    { name: 'Disaster Ambulance Service', number: '108', priority: false },
    { name: 'Mother & Child Careline', number: '102', priority: false },
  ];

  useEffect(() => {
    const loadHospitals = async () => {
      setLoading(true);
      try {
        const list = await api.getHospitals();
        setHospitals(list);
        if (list.length > 0) setActiveHospitalId(list[0].id);
      } catch (e) {
        console.error('Error loading hospitals:', e);
      } finally {
        setLoading(false);
      }
    };
    loadHospitals();
  }, []);

  // Filter hospitals based on search, city, emergency, and department
  const filteredHospitals = hospitals.filter(h => {
    const matchesCity = selectedCity === 'All' || h.district.toLowerCase() === selectedCity.toLowerCase() || h.state.toLowerCase() === selectedCity.toLowerCase();
    const matchesEmergency = !emergencyOnly || h.emergency24x7;
    const matchesSearch = !searchQuery || 
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      h.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.departments.some(d => d.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDept = selectedDept === 'All' || h.departments.some(d => d.toLowerCase().includes(selectedDept.toLowerCase()));
    return matchesCity && matchesEmergency && matchesSearch && matchesDept;
  });

  const activeHospital = hospitals.find(h => h.id === activeHospitalId) || filteredHospitals[0];

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cb-blue text-white flex items-center justify-center shadow-xs">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-cb-navy">
                  CareBridge Hospital & Trauma Center Directory
                </h1>
                <p className="text-xs text-slate-500">
                  Accredited tertiary and quaternary medical centres with 24x7 emergency response and high-acuity ICUs.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-1 flex items-center shadow-xs text-xs font-semibold">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  viewMode === 'cards' ? 'bg-cb-blue text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hospital Grid
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  viewMode === 'map' ? 'bg-cb-blue text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Network Map
              </button>
            </div>
          </div>
        </div>

        {/* Emergency Hotline Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {emergencyHelplines.map((line, idx) => (
            <a
              key={idx}
              href={`tel:${line.number}`}
              className={`p-3 rounded-2xl border transition group flex items-center justify-between shadow-xs ${
                line.priority 
                  ? 'bg-gradient-to-br from-rose-50 to-white border-rose-200 hover:border-rose-400' 
                  : 'bg-white border-slate-200 hover:border-blue-300'
              }`}
            >
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block truncate">{line.name}</span>
                <span className={`text-lg font-black ${line.priority ? 'text-cb-rose' : 'text-cb-navy'}`}>
                  {line.number}
                </span>
              </div>
              <div className={`p-2 rounded-xl transition ${
                line.priority 
                  ? 'bg-rose-100 text-rose-600 group-hover:bg-rose-600 group-hover:text-white' 
                  : 'bg-blue-50 text-cb-blue group-hover:bg-cb-blue group-hover:text-white'
              }`}>
                <Phone className="w-4 h-4" />
              </div>
            </a>
          ))}
        </div>

        {/* Filters & Universal Facility Search */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            
            {/* Search Input (5 cols) */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hospital by name, district, or specialty (e.g., Cardiology, Apollo)..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-cb-blue focus:outline-none placeholder-slate-400"
              />
            </div>

            {/* City Dropdown (3 cols) */}
            <div className="md:col-span-3">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 font-medium focus:ring-2 focus:ring-cb-blue focus:outline-none"
              >
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c === 'All' ? 'All Metropolitan Hubs' : c}
                  </option>
                ))}
              </select>
            </div>

            {/* Department Dropdown (2 cols) */}
            <div className="md:col-span-2">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 font-medium focus:ring-2 focus:ring-cb-blue focus:outline-none"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d === 'All' ? 'All Departments' : d}
                  </option>
                ))}
              </select>
            </div>

            {/* 24x7 Emergency Toggle (2 cols) */}
            <div className="md:col-span-2 flex items-center">
              <label className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-rose-200 bg-rose-50/60 rounded-xl text-xs font-bold text-rose-800 cursor-pointer hover:bg-rose-100 transition select-none">
                <input
                  type="checkbox"
                  checked={emergencyOnly}
                  onChange={(e) => setEmergencyOnly(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span className="truncate">24x7 Trauma Only</span>
              </label>
            </div>
          </div>

          {/* Quick Stats Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-4">
              <span>Showing <strong>{filteredHospitals.length}</strong> accredited centers</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> NABH / JCI Certified
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Clock className="w-3.5 h-3.5" /> Real-time ICU & Bed Availability Synced
            </div>
          </div>
        </div>

        {/* View Mode: Map / Visual Canvas */}
        {viewMode === 'map' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col h-[560px]">
              <div className="bg-cb-navy text-white px-4 py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-bold">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span>Interactive CareBridge Hospital Topology & Reach</span>
                </div>
                <span className="text-blue-200 font-mono text-[11px]">Multi-City Healthcare Grid</span>
              </div>

              <div className="flex-1 relative bg-slate-100 p-4 overflow-hidden flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full text-slate-300" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid-map" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid-map)" />
                  <path d="M 50 150 Q 250 200 450 150 T 800 250" fill="none" stroke="#cbd5e1" strokeWidth="6" />
                  <path d="M 300 40 L 350 480" fill="none" stroke="#cbd5e1" strokeWidth="8" />
                  <path d="M 120 400 Q 400 320 680 440" fill="none" stroke="#cbd5e1" strokeWidth="5" />
                </svg>

                {filteredHospitals.map((h, i) => {
                  const isSelected = h.id === activeHospitalId;
                  const positions = [
                    { top: '35%', left: '30%' },
                    { top: '60%', left: '42%' },
                    { top: '25%', left: '65%' },
                    { top: '70%', left: '72%' },
                    { top: '48%', left: '55%' },
                  ];
                  const pos = positions[i % positions.length];

                  return (
                    <div
                      key={h.id}
                      onClick={() => setActiveHospitalId(h.id)}
                      style={{ top: pos.top, left: pos.left }}
                      className="absolute z-20 -translate-x-1/2 -translate-y-1/2 text-center cursor-pointer group"
                    >
                      <div className={`w-9 h-9 rounded-2xl border-2 text-white flex items-center justify-center shadow-md transition transform group-hover:scale-125 ${
                        isSelected ? 'bg-cb-blue border-white ring-4 ring-blue-300 scale-110' : 'bg-cb-navy border-white'
                      }`}>
                        <Building2 className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded shadow-xs whitespace-nowrap mt-1 inline-block transition ${
                        isSelected ? 'bg-cb-blue text-white' : 'bg-white text-slate-800 border border-slate-200'
                      }`}>
                        {h.name.split(' ')[0]} ({h.icuBeds} ICU Beds)
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                <span>Click any hospital node on the map to inspect ICU and doctor stats</span>
                <span className="font-semibold text-cb-blue">{filteredHospitals.length} Centers Online</span>
              </div>
            </div>

            {/* Selected Hospital Preview Pane in Map Mode */}
            <div className="lg:col-span-5">
              {activeHospital ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <div className="relative rounded-xl overflow-hidden h-40">
                    <img
                      src={activeHospital.imageUrl}
                      alt={activeHospital.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-cb-navy/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-xs">
                      {activeHospital.type}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-cb-navy">{activeHospital.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{activeHospital.address}, {activeHospital.district}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[11px] text-slate-400 block font-medium">Critical Care</span>
                      <span className="font-black text-cb-navy">{activeHospital.icuBeds} ICU Beds</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[11px] text-slate-400 block font-medium">Patient Rating</span>
                      <span className="font-black text-amber-600 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        {activeHospital.rating} ({activeHospital.reviewCount})
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {activeHospital.departments.slice(0, 4).map((d, i) => (
                      <span key={i} className="text-[10px] font-semibold bg-blue-50 text-cb-blue px-2 py-0.5 rounded-md">
                        {d}
                      </span>
                    ))}
                    {activeHospital.departments.length > 4 && (
                      <span className="text-[10px] text-slate-400 py-0.5">+{activeHospital.departments.length - 4} more</span>
                    )}
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <Link
                      to={`/facilities/${activeHospital.id}`}
                      className="flex-1 py-2.5 px-4 bg-cb-blue hover:bg-blue-700 text-white font-bold text-xs text-center rounded-xl transition shadow-xs"
                    >
                      View Hospital & Doctors
                    </Link>
                    <a
                      href={`tel:${activeHospital.emergencyContact}`}
                      className="p-2.5 bg-rose-50 hover:bg-rose-100 text-cb-rose border border-rose-200 rounded-xl transition"
                      title="Call Emergency Trauma"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                  Select a facility pin to inspect details.
                </div>
              )}
            </div>
          </div>
        )}

        {/* View Mode: Cards Grid */}
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHospitals.map((hospital) => (
              <div
                key={hospital.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-cb-blue/40 shadow-xs hover:shadow-md transition duration-200 flex flex-col overflow-hidden group"
              >
                {/* Image Header with Badge Overlay */}
                <div className="relative h-44 w-full overflow-hidden">
                  <img
                    src={hospital.imageUrl}
                    alt={hospital.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                  
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    <span className="bg-cb-navy/90 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider backdrop-blur-xs">
                      {hospital.type}
                    </span>
                    {hospital.emergency24x7 && (
                      <span className="bg-cb-rose text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        24x7 Trauma
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <div className="flex items-center gap-1 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{hospital.rating}</span>
                      <span className="text-slate-300 text-[11px]">({hospital.reviewCount})</span>
                    </div>
                    <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-medium text-white">
                      {hospital.icuBeds} ICU Beds
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-black text-cb-navy text-base group-hover:text-cb-blue transition">
                      {hospital.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {hospital.tagline}
                    </p>

                    <div className="flex items-start gap-1.5 text-xs text-slate-600 mt-2.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{hospital.address}, {hospital.district}</span>
                    </div>

                    {/* Department Badges */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {hospital.departments.slice(0, 3).map((dept, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200"
                        >
                          {dept}
                        </span>
                      ))}
                      {hospital.departments.length > 3 && (
                        <span className="text-[10px] text-slate-400 font-medium py-0.5">
                          +{hospital.departments.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <a
                      href={`tel:${hospital.emergencyContact}`}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-cb-rose rounded-xl font-bold text-xs flex items-center gap-1.5 transition border border-rose-200"
                    >
                      <Ambulance className="w-3.5 h-3.5" />
                      <span>{hospital.emergencyContact}</span>
                    </a>

                    <Link
                      to={`/facilities/${hospital.id}`}
                      className="flex-1 py-2 px-3 bg-cb-blue hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition text-center shadow-xs flex items-center justify-center gap-1"
                    >
                      <span>Explore Hospital</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredHospitals.length === 0 && !loading && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-cb-navy text-base mb-1">No Hospitals Matched Your Filters</h3>
            <p className="text-xs text-slate-500 mb-4">
              Try broadening your search query, switching cities, or disabling the 24x7 emergency filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCity('All');
                setSelectedDept('All');
                setEmergencyOnly(false);
              }}
              className="px-4 py-2 bg-cb-blue text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition"
            >
              Clear All Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
