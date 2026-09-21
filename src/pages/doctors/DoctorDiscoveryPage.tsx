import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { dataStore } from '../../services/dataStore';
import { Doctor, DoctorSpecialty } from '../../types';
import {
  Search,
  Filter,
  Star,
  Building2,
  Calendar,
  Video,
  MapPin,
  Clock,
  ShieldCheck,
  ChevronRight,
  SlidersHorizontal,
  X,
  UserCheck
} from 'lucide-react';

export const DoctorDiscoveryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSpecialty = searchParams.get('specialty') || 'all';
  const initialSearch = searchParams.get('search') || '';

  const [search, setSearch] = useState(initialSearch);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>(initialSpecialty);
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [maxFee, setMaxFee] = useState<number>(2000);
  const [sortBy, setSortBy] = useState<'rating' | 'experience' | 'fee_asc' | 'fee_desc'>('rating');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const specialties = dataStore.getSpecialties();
  const allDoctors = dataStore.getCorporateDoctors();

  const filteredDoctors = useMemo(() => {
    let list = allDoctors;

    if (selectedSpecialty !== 'all') {
      list = list.filter(d => d.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase()));
    }
    if (selectedMode !== 'all') {
      list = list.filter(d => d.consultationModes.includes(selectedMode as any));
    }
    if (maxFee < 2000) {
      list = list.filter(d => d.consultationFee <= maxFee);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(d =>
        d.fullName.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q) ||
        d.hospitalAffiliation.toLowerCase().includes(q) ||
        d.areasOfExpertise.some(exp => exp.toLowerCase().includes(q))
      );
    }

    // Sorting
    return [...list].sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'experience') return b.experienceYears - a.experienceYears;
      if (sortBy === 'fee_asc') return a.consultationFee - b.consultationFee;
      if (sortBy === 'fee_desc') return b.consultationFee - a.consultationFee;
      return 0;
    });
  }, [allDoctors, selectedSpecialty, selectedMode, maxFee, search, sortBy]);

  const handleClearFilters = () => {
    setSelectedSpecialty('all');
    setSelectedMode('all');
    setMaxFee(2000);
    setSearch('');
    setSearchParams({});
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Breadcrumb & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <Link to="/" className="hover:text-cb-blue transition">Home</Link>
              <span>/</span>
              <span className="text-slate-700 font-semibold">Doctor Directory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-cb-navy font-heading">
              Find Leading Specialists
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Verified clinicians across premier CareBridge hospitals and tertiary centers
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-xs"
            >
              <SlidersHorizontal className="w-4 h-4 text-cb-blue" />
              <span>Filters</span>
            </button>
            <div className="text-xs text-slate-500 font-medium">
              Showing <span className="font-bold text-cb-navy">{filteredDoctors.length}</span> physicians
            </div>
          </div>
        </div>

        {/* Main Grid: Filters Sidebar + Doctor Results */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <aside className={`lg:block ${mobileFilterOpen ? 'block' : 'hidden'} space-y-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs h-fit sticky top-24`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="font-bold text-sm text-cb-navy flex items-center gap-2">
                <Filter className="w-4 h-4 text-cb-blue" />
                <span>Filters</span>
              </div>
              <button
                onClick={handleClearFilters}
                className="text-xs font-semibold text-cb-blue hover:underline cursor-pointer"
              >
                Reset
              </button>
            </div>

            {/* Specialty Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Specialty
              </label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-700 focus:outline-none focus:border-cb-blue cursor-pointer"
              >
                <option value="all">All Specialties</option>
                {specialties.map((spec: DoctorSpecialty) => (
                  <option key={spec.id} value={spec.name}>{spec.name}</option>
                ))}
              </select>
            </div>

            {/* Mode Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Consultation Mode
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedMode('all')}
                  className={`py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                    selectedMode === 'all' ? 'bg-white text-cb-blue shadow-xs' : 'text-slate-500'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMode('in_person')}
                  className={`py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                    selectedMode === 'in_person' ? 'bg-white text-cb-blue shadow-xs' : 'text-slate-500'
                  }`}
                >
                  In-Person
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMode('teleconsultation')}
                  className={`py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                    selectedMode === 'teleconsultation' ? 'bg-white text-cb-blue shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Video
                </button>
              </div>
            </div>

            {/* Max Fee Filter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold uppercase tracking-wider text-slate-400">Max Fee</label>
                <span className="font-bold text-cb-navy">₹{maxFee}</span>
              </div>
              <input
                type="range"
                min="400"
                max="2000"
                step="100"
                value={maxFee}
                onChange={(e) => setMaxFee(Number(e.target.value))}
                className="w-full accent-cb-blue cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>₹400</span>
                <span>₹1,200</span>
                <span>₹2,000+</span>
              </div>
            </div>

            {/* Trust Assurance Card */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>NMC Verified Credentials</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cb-blue shrink-0" />
                <span>Guaranteed OPD Slot Times</span>
              </div>
            </div>
          </aside>

          {/* Results Column */}
          <div className="lg:col-span-3 space-y-4">
            {/* Search and Sort Toolbar */}
            <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search doctor, hospital, or expertise..."
                  className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cb-blue"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs">
                <span className="text-slate-400 font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="rating">Highest Rated</option>
                  <option value="experience">Most Experienced</option>
                  <option value="fee_asc">Fee: Low to High</option>
                  <option value="fee_desc">Fee: High to Low</option>
                </select>
              </div>
            </div>

            {/* Doctor Cards List */}
            {filteredDoctors.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                <UserCheck className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-base text-cb-navy">No doctors match your criteria</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try clearing some filters or searching for another specialty or location.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 rounded-xl bg-cb-blue text-white text-xs font-bold hover:bg-cb-blue-hover transition"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              filteredDoctors.map((doc: Doctor) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-card transition p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between"
                >
                  {/* Left: Avatar & Info */}
                  <div className="flex items-start gap-4">
                    <Link to={`/doctors/${doc.id}`} className="shrink-0 relative group">
                      <img
                        src={doc.avatarUrl}
                        alt={doc.fullName}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover object-top border border-slate-200 group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-white rounded-full p-0.5 shadow-xs" title="Verified NMC Physician">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                    </Link>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Link to={`/doctors/${doc.id}`} className="font-bold text-base sm:text-lg text-cb-navy hover:text-cb-blue transition">
                          {doc.fullName}
                        </Link>
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>{doc.rating}</span>
                          <span className="text-slate-400 font-normal">({doc.reviewCount})</span>
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-cb-blue">{doc.title}</p>
                      <p className="text-xs text-slate-500">{doc.qualifications} • {doc.experienceYears} Years Experience</p>

                      <div className="flex items-center gap-1.5 text-xs text-slate-600 pt-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{doc.hospitalAffiliation}</span>
                      </div>

                      {/* Expertise Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1.5">
                        {doc.areasOfExpertise.slice(0, 3).map((exp, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium">
                            {exp}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Fees, Next Slot & Book CTA */}
                  <div className="w-full sm:w-56 shrink-0 sm:border-l sm:border-slate-100 sm:pl-5 space-y-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex flex-col justify-between">
                    <div>
                      <div className="flex items-baseline justify-between sm:justify-start gap-1">
                        <span className="text-[11px] text-slate-400">Consultation:</span>
                        <span className="text-base font-black text-cb-navy">₹{doc.consultationFee}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-600" />
                        <span>Slot: <strong className="text-emerald-700">{doc.nextAvailableSlot}</strong></span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Link
                        to={`/appointments/book?doctorId=${doc.id}&mode=in_person`}
                        className="w-full py-2.5 rounded-xl bg-cb-blue hover:bg-cb-blue-hover text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Book In-Person Visit</span>
                      </Link>

                      {doc.consultationModes.includes('teleconsultation') && (
                        <Link
                          to={`/appointments/book?doctorId=${doc.id}&mode=teleconsultation`}
                          className="w-full py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center gap-1.5 transition border border-purple-200"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Video Consult</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
