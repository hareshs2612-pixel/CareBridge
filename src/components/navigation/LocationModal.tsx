import React, { useState } from 'react';
import { MapPin, Navigation, Search, X, Check } from 'lucide-react';
import { dataStore } from '../../services/dataStore';
import { CityLocation } from '../../types';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCity: string;
  onSelectCity: (city: string) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  currentCity,
  onSelectCity
}) => {
  const [search, setSearch] = useState('');
  const [detecting, setDetecting] = useState(false);
  const cities = dataStore.getPopularCities();

  if (!isOpen) return null;

  const filteredCities = cities.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.state.toLowerCase().includes(search.toLowerCase())
  );

  const handleDetectGPS = () => {
    setDetecting(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // Approximate to closest popular city by latitude
          const userLat = pos.coords.latitude;
          let closest = cities[0];
          let minDiff = Math.abs(cities[0].coordinates.lat - userLat);
          for (const c of cities) {
            const diff = Math.abs(c.coordinates.lat - userLat);
            if (diff < minDiff) {
              minDiff = diff;
              closest = c;
            }
          }
          setDetecting(false);
          onSelectCity(closest.name);
          onClose();
        },
        () => {
          setDetecting(false);
          // Fallback to Bengaluru default
          onSelectCity('Bengaluru');
          onClose();
        },
        { timeout: 5000 }
      );
    } else {
      setDetecting(false);
      onSelectCity('Bengaluru');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-elevated border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-cb-navy">Select Your City</h3>
            <p className="text-xs text-slate-500 mt-0.5">Find nearby CareBridge hospitals, clinics and pharmacies</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GPS Button */}
        <div className="p-5 border-b border-slate-100">
          <button
            onClick={handleDetectGPS}
            disabled={detecting}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-cb-blue/30 bg-cb-blue/5 text-cb-blue font-semibold text-sm hover:bg-cb-blue/10 transition disabled:opacity-50 cursor-pointer"
          >
            <Navigation className={`w-4 h-4 ${detecting ? 'animate-spin' : ''}`} />
            <span>{detecting ? 'Detecting your coordinates...' : 'Use Current Location (GPS)'}</span>
          </button>

          {/* Search Box */}
          <div className="relative mt-3">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cities or states..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cb-blue/20 focus:border-cb-blue transition"
            />
          </div>
        </div>

        {/* Popular Cities Grid */}
        <div className="p-5 max-h-72 overflow-y-auto">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Popular Healthcare Hubs
          </div>
          <div className="grid grid-cols-2 gap-2">
            {filteredCities.map((city: CityLocation) => {
              const isSelected = city.name.toLowerCase() === currentCity.toLowerCase();
              return (
                <button
                  key={city.id}
                  onClick={() => {
                    onSelectCity(city.name);
                    onClose();
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl text-left border transition cursor-pointer ${
                    isSelected
                      ? 'border-cb-blue bg-cb-blue/5 text-cb-navy font-semibold shadow-xs'
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className={`w-4 h-4 shrink-0 ${isSelected ? 'text-cb-blue' : 'text-slate-400'}`} />
                    <div className="truncate">
                      <div className="text-sm truncate">{city.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{city.state}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-cb-blue shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>

          {filteredCities.length === 0 && (
            <div className="text-center py-6 text-sm text-slate-500">
              No cities match "{search}". Try searching another name.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
