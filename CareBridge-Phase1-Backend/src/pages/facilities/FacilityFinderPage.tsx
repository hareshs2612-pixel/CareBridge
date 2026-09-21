import React, { useState } from 'react';
import { mapsService, DEFAULT_RURAL_LOCATION } from '../../services/mapsService';
import { HealthcareFacility, FacilityType } from '../../types';
import { 
  MapPin, 
  Search, 
  Phone, 
  AlertTriangle, 
  Building2, 
  Clock, 
  Filter, 
  Navigation, 
  HeartHandshake, 
  ShieldCheck,
  CheckCircle2,
  Ambulance
} from 'lucide-react';

export const FacilityFinderPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<FacilityType | 'ALL'>('ALL');
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('fac-02');

  const facilities = mapsService.getFacilities({
    type: selectedType,
    emergencyOnly,
    searchQuery
  });

  const helplines = mapsService.getEmergencyHelplines();
  const selectedFacility = facilities.find(f => f.id === selectedFacilityId) || facilities[0];

  const getPinColor = (type: FacilityType) => {
    switch (type) {
      case 'Community Health Centre (CHC)':
        return 'bg-teal-600 border-teal-200';
      case 'Primary Health Centre (PHC)':
        return 'bg-emerald-600 border-emerald-200';
      case 'Sub-Centre':
        return 'bg-blue-600 border-blue-200';
      case 'District Hospital':
        return 'bg-rose-600 border-rose-200';
      case 'Jan Aushadhi Kendra (Pharmacy)':
        return 'bg-amber-600 border-amber-200';
      case 'Blood Bank / Trauma Centre':
        return 'bg-red-700 border-red-200';
      default:
        return 'bg-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">Rural Healthcare Facility Locator</h1>
            <span className="text-xs bg-teal-100 text-teal-800 font-bold px-2.5 py-0.5 rounded-full">
              {facilities.length} Verified Facilities
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Grounded in rural public health infrastructure: Locating Sub-Centres, PHCs, CHCs, and generic Jan Aushadhi pharmacies.
          </p>
        </div>

        {/* Current Simulated Location */}
        <div className="bg-slate-100 p-2.5 rounded-xl text-xs flex items-center gap-2 text-slate-700">
          <Navigation className="w-4 h-4 text-teal-600" />
          <span>Origin: <strong>{DEFAULT_RURAL_LOCATION.label}</strong></span>
        </div>
      </div>

      {/* Emergency Hotline Ticker */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {helplines.map((line, idx) => (
          <a
            key={idx}
            href={`tel:${line.number}`}
            className="p-3 bg-white border border-slate-200 hover:border-rose-300 rounded-xl shadow-xs transition group flex items-center justify-between"
          >
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block truncate">{line.name}</span>
              <span className="text-lg font-black text-rose-600 group-hover:text-rose-700">{line.number}</span>
            </div>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg group-hover:bg-rose-100 transition">
              <Phone className="w-4 h-4" />
            </div>
          </a>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3 text-xs">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search facility by name, block, or available service (e.g. X-Ray, Blood Test)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white font-medium"
            >
              <option value="ALL">All Facility Tiers</option>
              <option value="Primary Health Centre (PHC)">Primary Health Centres (PHC)</option>
              <option value="Community Health Centre (CHC)">Community Health Centres (CHC)</option>
              <option value="Sub-Centre">Health Sub-Centres</option>
              <option value="District Hospital">District Hospitals & Trauma</option>
              <option value="Jan Aushadhi Kendra (Pharmacy)">Jan Aushadhi Kendras</option>
              <option value="Blood Bank / Trauma Centre">Blood Banks</option>
            </select>

            <label className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={emergencyOnly}
                onChange={(e) => setEmergencyOnly(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500"
              />
              <span className="font-bold text-rose-700 whitespace-nowrap">24x7 Emergency Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Map & Facility List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Map Canvas / Simulation (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-[520px]">
          <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-400" />
              <span className="font-bold">Google Maps Healthcare Discovery — Sitapur Rural Cluster</span>
            </div>
            <span className="text-[10px] text-teal-300 font-mono">Radius: 20 KM</span>
          </div>

          {/* Interactive Graphical Map View */}
          <div className="flex-1 relative bg-slate-100 p-4 overflow-hidden flex items-center justify-center">
            {/* Map Roads & Topography Simulation SVG */}
            <svg className="absolute inset-0 w-full h-full text-slate-300" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              {/* Village roads */}
              <path d="M 50 100 Q 200 150 350 120 T 700 200" fill="none" stroke="#cbd5e1" strokeWidth="6" />
              <path d="M 200 40 L 250 450" fill="none" stroke="#cbd5e1" strokeWidth="8" />
              <path d="M 100 380 Q 400 300 650 420" fill="none" stroke="#cbd5e1" strokeWidth="5" />
            </svg>

            {/* Current Patient Origin Pin */}
            <div className="absolute top-[42%] left-[46%] z-10 -translate-x-1/2 -translate-y-1/2 text-center group cursor-pointer">
              <div className="w-7 h-7 bg-teal-600 border-2 border-white rounded-full flex items-center justify-center shadow-lg text-white animate-bounce">
                <Navigation className="w-4 h-4" />
              </div>
              <span className="bg-slate-900 text-white font-black text-[10px] px-2 py-0.5 rounded shadow-sm whitespace-nowrap mt-1 inline-block">
                YOU (Rampur Village)
              </span>
            </div>

            {/* Facility Pins */}
            {facilities.map((fac) => {
              const isSelected = fac.id === selectedFacilityId;
              // Geographically anchored offsets relative to Rampur Village
              const getAnchor = (id: string) => {
                switch (id) {
                  case 'fac-01': return { top: '32%', left: '36%' }; // PHC Mohanpur (1.8km NW)
                  case 'fac-02': return { top: '54%', left: '68%' }; // CHC Rampur (4.2km SE)
                  case 'fac-03': return { top: '20%', left: '28%' }; // Sub-Centre Bilaspur (0.9km N)
                  case 'fac-04': return { top: '80%', left: '62%' }; // District Hospital (18.5km S)
                  case 'fac-05': return { top: '50%', left: '74%' }; // Jan Aushadhi (4.1km E)
                  case 'fac-06': return { top: '84%', left: '52%' }; // Blood Centre (18.2km S)
                  default: return { top: '50%', left: '50%' };
                }
              };
              const { top, left } = getAnchor(fac.id);

              return (
                <div
                  key={fac.id}
                  onClick={() => setSelectedFacilityId(fac.id)}
                  style={{ top, left }}
                  className="absolute z-20 -translate-x-1/2 -translate-y-1/2 text-center cursor-pointer group"
                >
                  <div className={`w-8 h-8 rounded-full border-2 text-white flex items-center justify-center shadow-md transition transform group-hover:scale-125 ${
                    getPinColor(fac.type)
                  } ${isSelected ? 'ring-4 ring-teal-400 scale-110' : ''}`}>
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap mt-1 inline-block transition ${
                    isSelected ? 'bg-teal-900 text-white font-black' : 'bg-white text-slate-800 border border-slate-200'
                  }`}>
                    {fac.name.split(' ')[0]} ({fac.distanceKm} km)
                  </span>
                </div>
              );
            })}
          </div>

          {/* Map Footer Note */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Grounded in Ayushman Bharat Rural Health Infrastructure</span>
            </div>
            <span className="text-[11px] text-slate-400">Distances computed via Haversine geolocation</span>
          </div>
        </div>

        {/* Right Col: Facility Detail & List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Selected Facility Card */}
          {selectedFacility && (
            <div className="bg-white rounded-2xl border-2 border-teal-500 p-5 shadow-sm space-y-3 text-xs">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                    {selectedFacility.type}
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-1">
                    {selectedFacility.name}
                  </h3>
                  <p className="text-slate-500 mt-0.5">{selectedFacility.address}</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-teal-700">{selectedFacility.distanceKm} km</span>
                  <span className="block text-[10px] text-slate-400">from your village</span>
                </div>
              </div>

              {/* Status Pills & Rural Readiness */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedFacility.has24x7Emergency ? (
                  <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    24x7 Emergency Triage Active
                  </span>
                ) : (
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px]">
                    Daytime Primary OPD (9 AM - 4 PM)
                  </span>
                )}
                <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                  {selectedFacility.doctorsOnDuty} Medical Officers on Duty
                </span>
                {selectedFacility.estimatedWaitTime && (
                  <span className="bg-blue-50 text-blue-800 border border-blue-200 font-semibold px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-blue-600" />
                    {selectedFacility.estimatedWaitTime}
                  </span>
                )}
              </div>

              {/* Languages & Affordability Cues */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                {selectedFacility.affordabilityCue && (
                  <div className="p-2 bg-emerald-50/70 border border-emerald-200 rounded-lg text-emerald-950 font-medium">
                    <strong>Scheme / Cost:</strong> {selectedFacility.affordabilityCue}
                  </div>
                )}
                {selectedFacility.supportedLanguages && (
                  <div className="p-2 bg-teal-50/70 border border-teal-200 rounded-lg text-teal-950 font-medium">
                    <strong>Dialects Spoken:</strong> {selectedFacility.supportedLanguages.join(', ')}
                  </div>
                )}
              </div>

              {/* Available Services */}
              <div>
                <span className="font-bold text-slate-800 block mb-1">Available Public Services:</span>
                <div className="flex flex-wrap gap-1">
                  {selectedFacility.services.map((srv, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                      • {srv}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                <a
                  href={`tel:${selectedFacility.contactNumber}`}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition text-xs"
                >
                  <Phone className="w-4 h-4" />
                  Call: {selectedFacility.contactNumber}
                </a>
                <a
                  href={`tel:${selectedFacility.ambulanceContact}`}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition text-xs"
                >
                  <Ambulance className="w-4 h-4" />
                  108 Ambulance
                </a>
              </div>
            </div>
          )}

          {/* Facility List */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Nearby Public Facilities ({facilities.length})
            </span>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {facilities.map((f) => {
                const isSelected = f.id === selectedFacilityId;

                return (
                  <div
                    key={f.id}
                    onClick={() => setSelectedFacilityId(f.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between gap-3 ${
                      isSelected 
                        ? 'bg-teal-50 border-teal-400 shadow-xs' 
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-slate-900">{f.name}</h4>
                      <p className="text-[11px] text-slate-500">{f.type}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-teal-800">{f.distanceKm} km</span>
                      {f.has24x7Emergency && (
                        <span className="block text-[10px] text-rose-600 font-bold">24x7</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
