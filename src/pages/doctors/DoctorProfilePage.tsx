import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { dataStore } from '../../services/dataStore';
import {
  Star,
  Building2,
  Calendar,
  Video,
  MapPin,
  Clock,
  ShieldCheck,
  Award,
  Globe2,
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  PhoneCall
} from 'lucide-react';

export const DoctorProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const doctor = dataStore.getCorporateDoctorById(id || '');

  // Booking widget state
  const [selectedMode, setSelectedMode] = useState<'in_person' | 'teleconsultation'>('in_person');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState<string>('10:30 AM');

  if (!doctor) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-card border border-slate-200 text-center max-w-md space-y-4">
          <h2 className="text-xl font-bold text-cb-navy">Doctor Not Found</h2>
          <p className="text-xs text-slate-500">The physician profile you requested could not be located.</p>
          <Link to="/doctors" className="inline-block px-4 py-2 rounded-xl bg-cb-blue text-white text-xs font-bold">
            Back to Directory
          </Link>
        </div>
      </div>
    );
  }

  // Generate next 5 dates
  const nextDates = Array.from({ length: 5 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return {
      iso: d.toISOString().split('T')[0],
      day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      dateNum: d.getDate(),
      month: d.toLocaleDateString('en-IN', { month: 'short' })
    };
  });

  const handleProceedToBooking = () => {
    navigate(`/appointments/book?doctorId=${doctor.id}&date=${selectedDate}&timeSlot=${encodeURIComponent(selectedSlot)}&mode=${selectedMode}`);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back Link */}
        <Link to="/doctors" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-cb-blue transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Doctor Directory</span>
        </Link>

        {/* Profile Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Doctor Biography & Experience */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Header Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card flex flex-col sm:flex-row gap-6 items-start">
              <div className="relative shrink-0">
                <img
                  src={doctor.avatarUrl}
                  alt={doctor.fullName}
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl object-cover object-top border-2 border-slate-100 shadow-sm"
                />
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white rounded-full p-1 shadow-xs" title="Verified NMC License">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-cb-navy font-heading">
                    {doctor.fullName}
                  </h1>
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{doctor.rating}</span>
                    <span className="text-slate-400 font-normal">({doctor.reviewCount} verified reviews)</span>
                  </span>
                </div>

                <p className="text-sm font-semibold text-cb-blue">{doctor.title}</p>
                <p className="text-xs text-slate-500">{doctor.qualifications}</p>

                <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-slate-400" />
                    <span>{doctor.experienceYears} Years Experience</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span className="font-medium text-slate-700">{doctor.hospitalAffiliation}</span>
                  </div>
                </div>

                <div className="pt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-mono">
                    Reg No: {doctor.registrationNumber} ({doctor.councilName})
                  </span>
                  <div className="flex items-center gap-1">
                    <Globe2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Languages: {doctor.languages.join(', ')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* About Narrative */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card space-y-4">
              <h3 className="text-base font-bold text-cb-navy">Clinical Overview & Philosophy</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {doctor.about}
              </p>

              <div className="pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Areas of Specialization & Clinical Focus
                </h4>
                <div className="flex flex-wrap gap-2">
                  {doctor.areasOfExpertise.map((exp, i) => (
                    <span key={i} className="flex items-center gap-1 px-3 py-1 rounded-xl bg-cb-blue/5 text-cb-blue text-xs font-semibold border border-cb-blue/15">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cb-blue" />
                      <span>{exp}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Hospital Affiliation Info */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-cb-navy">Primary Hospital Affiliation</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                  24x7 Emergency Centre
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-700">
                {doctor.hospitalAffiliation}
              </p>
              <p className="text-xs text-slate-500">
                State-of-the-art diagnostic imaging, cath lab facilities, intensive care, and inpatient surgical suites.
              </p>
              <Link
                to={`/facilities`}
                className="inline-flex items-center gap-1 text-xs font-bold text-cb-blue hover:underline pt-1"
              >
                <span>View Hospital Facilities & Bed Status</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Col: Interactive Slot Picker Widget */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-elevated space-y-5 sticky top-24">
              <div className="border-b border-slate-100 pb-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Book Guaranteed Consultation
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-2xl font-black text-cb-navy font-heading">
                    ₹{selectedMode === 'in_person' ? doctor.consultationFee : Math.round(doctor.consultationFee * 0.85)}
                  </span>
                  <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                    No Booking Fee
                  </span>
                </div>
              </div>

              {/* Mode Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Consultation Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMode('in_person')}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                      selectedMode === 'in_person'
                        ? 'border-cb-blue bg-cb-blue/5 text-cb-navy font-bold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <Building2 className="w-4 h-4 text-cb-blue" />
                      <span>In-Person OPD</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">At hospital clinic</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMode('teleconsultation')}
                    disabled={!doctor.consultationModes.includes('teleconsultation')}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer disabled:opacity-50 ${
                      selectedMode === 'teleconsultation'
                        ? 'border-purple-600 bg-purple-50/60 text-purple-900 font-bold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <Video className="w-4 h-4 text-purple-600" />
                      <span>Video Consult</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">From home</div>
                  </button>
                </div>
              </div>

              {/* Date Picker (5 Days) */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Select Date
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {nextDates.map((d) => {
                    const isSelected = selectedDate === d.iso;
                    return (
                      <button
                        key={d.iso}
                        type="button"
                        onClick={() => setSelectedDate(d.iso)}
                        className={`p-2 rounded-xl text-center border transition cursor-pointer ${
                          isSelected
                            ? 'border-cb-blue bg-cb-blue text-white shadow-xs font-bold'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="text-[10px] uppercase">{d.day}</div>
                        <div className="text-sm font-black">{d.dateNum}</div>
                        <div className="text-[9px]">{d.month}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slot Picker */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold uppercase tracking-wider text-slate-400">Select Time Slot</label>
                  <span className="text-emerald-600 text-[11px] font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Guaranteed Slot
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {doctor.availableSlots.map((slot) => {
                    const isSelected = selectedSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          isSelected
                            ? 'border-cb-blue bg-cb-blue/10 text-cb-blue shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Proceed CTA Button */}
              <button
                type="button"
                onClick={handleProceedToBooking}
                className="w-full py-3.5 rounded-2xl bg-cb-blue hover:bg-cb-blue-hover text-white text-sm font-bold flex items-center justify-center gap-2 transition shadow-md shadow-cb-blue/20 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Continue to Booking</span>
              </button>

              <p className="text-[11px] text-center text-slate-400">
                Guaranteed slot reservation • Free cancellation up to 2 hours prior
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
