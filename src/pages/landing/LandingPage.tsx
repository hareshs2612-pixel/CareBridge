import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { dataStore } from '../../services/dataStore';
import { Doctor, Hospital, DoctorSpecialty } from '../../types';
import {
  Search,
  MapPin,
  Calendar,
  Video,
  Building2,
  Pill,
  PhoneCall,
  Star,
  ShieldCheck,
  Award,
  Clock,
  ArrowRight,
  ChevronRight,
  Heart,
  Brain,
  Activity,
  Baby,
  Sparkles,
  Shield,
  Users,
  Stethoscope,
  Wind,
  UserCheck,
  CheckCircle2
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMode, setSelectedMode] = useState<'all' | 'in_person' | 'teleconsultation'>('all');
  const selectedCity = dataStore.getSelectedCity();

  const specialties = dataStore.getSpecialties();
  const doctors = dataStore.getCorporateDoctors().slice(0, 4);
  const hospitals = dataStore.getHospitals().slice(0, 3);
  const medicines = dataStore.getMedicines().slice(0, 4);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/doctors?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/doctors');
    }
  };

  // Helper to map specialty icon name to lucide component
  const renderSpecialtyIcon = (iconName: string) => {
    switch (iconName) {
      case 'Heart': return <Heart className="w-6 h-6 text-rose-500" />;
      case 'Brain': return <Brain className="w-6 h-6 text-indigo-500" />;
      case 'Activity': return <Activity className="w-6 h-6 text-emerald-500" />;
      case 'Baby': return <Baby className="w-6 h-6 text-amber-500" />;
      case 'Sparkles': return <Sparkles className="w-6 h-6 text-purple-500" />;
      case 'Shield': return <Shield className="w-6 h-6 text-blue-500" />;
      case 'Users': return <Users className="w-6 h-6 text-pink-500" />;
      case 'Stethoscope': return <Stethoscope className="w-6 h-6 text-teal-500" />;
      case 'Wind': return <Wind className="w-6 h-6 text-sky-500" />;
      case 'UserCheck': return <UserCheck className="w-6 h-6 text-cb-blue" />;
      default: return <Stethoscope className="w-6 h-6 text-cb-blue" />;
    }
  };

  return (
    <div className="space-y-16 pb-20">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-cb-navy via-slate-900 to-cb-navy text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        {/* Subtle geometric grid background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-6xl mx-auto space-y-8 relative z-10 text-center">
          {/* Quality Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 px-4 py-1.5 rounded-full text-xs text-blue-200 font-semibold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-cb-emerald animate-pulse" />
            <span>NABH & JCI Accredited Hospital Network Across India</span>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight font-heading">
              World-Class Healthcare, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-300 to-teal-300">
                Connected to You.
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Book consultations with top medical specialists in person or via high-definition video, find accredited tertiary hospitals, and track your lifelong clinical health records.
            </p>
          </div>

          {/* Universal Search Container */}
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-elevated p-2 sm:p-3 text-slate-800 text-left border border-slate-100">
            {/* Mode Tabs */}
            <div className="flex items-center gap-1 sm:gap-2 px-2 pb-2 border-b border-slate-100 text-xs font-semibold">
              <button
                onClick={() => setSelectedMode('all')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  selectedMode === 'all'
                    ? 'bg-cb-blue text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All Care
              </button>
              <button
                onClick={() => setSelectedMode('in_person')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  selectedMode === 'in_person'
                    ? 'bg-cb-blue text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                In-Person Visit
              </button>
              <button
                onClick={() => setSelectedMode('teleconsultation')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                  selectedMode === 'teleconsultation'
                    ? 'bg-cb-blue text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                Video Consult
              </button>
            </div>

            {/* Input Row */}
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <div className="flex-1 flex items-center gap-2.5 px-3 py-2 w-full">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search doctors, specialties, treatments or hospitals..."
                  className="w-full text-sm bg-transparent placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              {/* City Pill */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 border-l border-slate-200 text-xs font-semibold text-slate-600 shrink-0">
                <MapPin className="w-3.5 h-3.5 text-cb-blue" />
                <span>{selectedCity}</span>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cb-blue hover:bg-cb-blue-hover text-white text-sm font-bold transition shadow-sm cursor-pointer shrink-0"
              >
                Find Care
              </button>
            </form>
          </div>

          {/* Trust Metrics Strip */}
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-black text-white">500+</div>
              <div className="text-xs text-slate-300">Verified Specialists</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-black text-white">25+</div>
              <div className="text-xs text-slate-300">NABH Accredited Hospitals</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-black text-white">100k+</div>
              <div className="text-xs text-slate-300">Safe Consultations</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-black text-white">24/7</div>
              <div className="text-xs text-slate-300">Emergency & Ambulance</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Core Pathways Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Find Doctor */}
          <Link
            to="/doctors"
            className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover border border-slate-100 hover:border-cb-blue/30 transition group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-cb-blue flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-cb-navy group-hover:text-cb-blue transition">
              Find Doctors
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Browse qualified specialists by clinical experience, patient reviews, and hospital affiliation.
            </p>
            <div className="flex items-center gap-1 text-xs font-bold text-cb-blue mt-4">
              <span>View Directory</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* Card 2: Book In-Person Appointment */}
          <Link
            to="/appointments/book"
            className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover border border-slate-100 hover:border-emerald-500/30 transition group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-cb-navy group-hover:text-emerald-600 transition">
              Book Appointment
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Reserve guaranteed hospital OPD slots with double-booking protection and instant confirmation.
            </p>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 mt-4">
              <span>Book In 4 Steps</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* Card 3: Video Teleconsultation */}
          <Link
            to="/teleconsult"
            className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover border border-slate-100 hover:border-purple-500/30 transition group"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-cb-navy group-hover:text-purple-600 transition">
              Teleconsultation
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Consult doctors via secure video room with digital prescription issuance and follow-up care.
            </p>
            <div className="flex items-center gap-1 text-xs font-bold text-purple-600 mt-4">
              <span>Start Video Consult</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* Card 4: Hospitals & Emergency */}
          <Link
            to="/facilities"
            className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover border border-slate-100 hover:border-rose-500/30 transition group"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-cb-navy group-hover:text-rose-600 transition">
              Hospitals & 24x7 Trauma
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Locate quaternary hospitals, bed status, ICU infrastructure, and dedicated emergency helplines.
            </p>
            <div className="flex items-center gap-1 text-xs font-bold text-rose-600 mt-4">
              <span>Find Hospitals</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>
        </div>
      </section>

      {/* 3. Clinical Specialties Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-cb-blue mb-1">
              Centres of Excellence
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-cb-navy font-heading">
              Consult by Medical Specialty
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Covering comprehensive tertiary and super-specialty departments
            </p>
          </div>
          <Link
            to="/doctors"
            className="text-xs sm:text-sm font-bold text-cb-blue hover:text-cb-blue-hover flex items-center gap-1"
          >
            <span>View all specialties</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
          {specialties.map((spec: DoctorSpecialty) => (
            <Link
              key={spec.id}
              to={`/doctors?specialty=${encodeURIComponent(spec.name)}`}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs hover:shadow-card hover:border-cb-blue/30 transition text-left group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mb-3 group-hover:bg-blue-50 transition">
                  {renderSpecialtyIcon(spec.iconName)}
                </div>
                <h4 className="text-sm font-bold text-cb-navy group-hover:text-cb-blue transition">
                  {spec.name}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {spec.description}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span>Find Doctors</span>
                <ChevronRight className="w-3.5 h-3.5 text-cb-blue group-hover:translate-x-1 transition" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Top Verified Specialists */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-cb-blue mb-1">
              Top Ranked Physicians
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-cb-navy font-heading">
              Featured Specialists Today
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Renowned doctors with verified credentials and exceptional patient outcomes
            </p>
          </div>
          <Link
            to="/doctors"
            className="text-xs sm:text-sm font-bold text-cb-blue hover:text-cb-blue-hover flex items-center gap-1"
          >
            <span>Explore all doctors</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {doctors.map((doctor: Doctor) => (
            <div
              key={doctor.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-card-hover overflow-hidden transition flex flex-col justify-between"
            >
              <div>
                {/* Doctor Photo */}
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <img
                    src={doctor.avatarUrl}
                    alt={doctor.fullName}
                    className="w-full h-full object-cover object-top hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-cb-navy flex items-center gap-1 shadow-xs">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>{doctor.rating}</span>
                    <span className="text-slate-400 font-normal">({doctor.reviewCount})</span>
                  </div>
                  <div className="absolute top-3 right-3 bg-cb-blue text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {doctor.experienceYears} Yrs Exp
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2">
                  <div>
                    <h3 className="font-bold text-base text-cb-navy truncate">{doctor.fullName}</h3>
                    <p className="text-xs text-cb-blue font-semibold">{doctor.specialty}</p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{doctor.qualifications}</p>
                  </div>

                  <div className="text-[11px] text-slate-500 truncate flex items-center gap-1.5 pt-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{doctor.hospitalAffiliation}</span>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Consultation Fee</span>
                      <span className="font-bold text-cb-navy">₹{doctor.consultationFee}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] block">Next Available</span>
                      <span className="font-semibold text-emerald-600 text-[11px]">{doctor.nextAvailableSlot}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="p-4 pt-0">
                <Link
                  to={`/appointments/book?doctorId=${doctor.id}`}
                  className="w-full py-2.5 rounded-xl bg-cb-blue hover:bg-cb-blue-hover text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Consultation</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Hospital Network Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-cb-navy to-slate-950 rounded-3xl p-6 sm:p-10 text-white shadow-elevated">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-300 mb-1">
                Hospital Network
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-heading">
                Accredited Tertiary Hospitals
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Comprehensive inpatient facilities equipped with 24x7 trauma, ICUs, and cath labs
              </p>
            </div>
            <Link
              to="/facilities"
              className="text-xs sm:text-sm font-bold text-blue-300 hover:text-white flex items-center gap-1"
            >
              <span>View all hospitals</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {hospitals.map((hospital: Hospital) => (
              <div
                key={hospital.id}
                className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 overflow-hidden flex flex-col justify-between hover:bg-white/15 transition"
              >
                <div>
                  <div className="h-40 overflow-hidden relative">
                    <img
                      src={hospital.imageUrl}
                      alt={hospital.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-cb-rose text-white text-[10px] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      24x7 Emergency
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="font-bold text-base text-white">{hospital.name}</h3>
                      <p className="text-xs text-blue-200 mt-0.5">{hospital.type}</p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{hospital.address}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="bg-white/5 p-2 rounded-lg">
                        <span className="text-slate-400 block">ICU Beds</span>
                        <span className="font-bold text-white">{hospital.icuBeds} Beds</span>
                      </div>
                      <div className="bg-white/5 p-2 rounded-lg">
                        <span className="text-slate-400 block">Emergency</span>
                        <span className="font-bold text-rose-300 truncate">{hospital.emergencyContact.split('/')[0]}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Link
                    to={`/facilities?selected=${hospital.id}`}
                    className="w-full py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <span>View Hospital Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Pharmacy Stock Live Check Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Pill className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-cb-navy">Live Pharmacy Inventory Check</h3>
                <p className="text-xs text-slate-500">Real-time stock indicators at nearby licensed hospital pharmacies</p>
              </div>
            </div>
            <Link
              to="/pharmacy"
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
            >
              <span>Open Pharmacy Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {medicines.map((med) => (
              <div key={med.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-cb-navy">{med.brandName}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600">
                    IN STOCK
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 truncate">{med.genericName}</div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="font-bold text-cb-navy">₹{med.price.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-400">{med.dosageForm}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Corporate Trust & Compliance */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-slate-200 pt-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center sm:text-left">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-cb-blue flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-cb-navy">ABHA & DPDP Compliant</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Cryptographically verified patient consent. Only authorized clinicians can view your longitudinal records.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-cb-navy">Clinical Governance</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Physicians vetted through National Medical Commission (NMC) and State Medical Councils.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-cb-navy">24x7 Emergency Integration</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Direct connectivity to trauma wards, critical care bed queues, and GPS-enabled ambulance fleets.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
