import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Star, 
  Clock, 
  Ambulance, 
  CheckCircle2, 
  Calendar, 
  Video, 
  ArrowLeft,
  Share2,
  Navigation,
  Activity,
  Award,
  Users,
  BedDouble,
  Microscope,
  Stethoscope,
  HeartPulse,
  Brain,
  Bone
} from 'lucide-react';
import { Hospital, Doctor } from '../../types';
import { dataStore } from '../../services/dataStore';
import { api } from '../../services/api';

export const HospitalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchHospitalData = async () => {
      setLoading(true);
      if (!id) return;
      try {
        const h = await api.getHospitalById(id);
        if (h) {
          setHospital(h);
          const allDocs = await api.getDoctors();
          const affiliated = allDocs.filter(d => d.hospitalId === h.id || h.featuredDoctorIds?.includes(d.id));
          setDoctors(affiliated);
        }
      } catch (err) {
        console.error('Failed to load hospital details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHospitalData();
  }, [id]);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getDepartmentIcon = (dept: string) => {
    const lower = dept.toLowerCase();
    if (lower.includes('cardio')) return HeartPulse;
    if (lower.includes('neuro')) return Brain;
    if (lower.includes('ortho')) return Bone;
    if (lower.includes('oncol') || lower.includes('cancer')) return Microscope;
    return Stethoscope;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cb-blue border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-500">Loading hospital facilities...</p>
        </div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-cb-navy mb-2">Hospital Not Found</h2>
        <p className="text-slate-500 mb-6">The requested healthcare facility could not be located in our network.</p>
        <Link
          to="/facilities"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-cb-blue text-white font-bold rounded-xl hover:bg-blue-700 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Hospital Network
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Link to="/facilities" className="hover:text-cb-blue flex items-center gap-1 font-medium">
              <ArrowLeft className="w-3.5 h-3.5" /> Facilities
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold truncate max-w-[240px] sm:max-w-none">
              {hospital.name}
            </span>
          </div>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? 'Link Copied!' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Hospital Hero Banner */}
      <div className="relative bg-cb-navy text-white overflow-hidden">
        {/* Background photo with gradient overlays */}
        <div className="absolute inset-0 z-0">
          <img
            src={hospital.imageUrl}
            alt={hospital.name}
            className="w-full h-full object-cover opacity-25 filter blur-xs"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-cb-navy via-cb-navy/95 to-cb-navy/80" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="bg-cb-blue/30 text-blue-300 border border-blue-400/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {hospital.type}
                </span>
                {hospital.emergency24x7 && (
                  <span className="bg-cb-rose text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    24x7 Emergency & Trauma Active
                  </span>
                )}
                <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  NABH & JCI Accredited
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                  {hospital.name}
                </h1>
                <p className="text-blue-200 text-sm sm:text-base font-medium mt-1">
                  {hospital.tagline}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>{hospital.address}, {hospital.district}, {hospital.state} - {hospital.pincode}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                  <span className="font-bold text-white text-sm">{hospital.rating}</span>
                  <span>({hospital.reviewCount} verified patient reviews)</span>
                </div>
              </div>
            </div>

            {/* Quick Action Box */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 lg:min-w-[320px] flex flex-col gap-3 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs text-slate-300">Trauma & Emergency Hotline:</span>
                <span className="text-xs font-bold text-rose-300 bg-rose-950/50 px-2 py-0.5 rounded">24 Hours</span>
              </div>
              <a
                href={`tel:${hospital.emergencyContact}`}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-cb-rose hover:bg-rose-700 text-white font-bold rounded-xl transition shadow-md shadow-rose-900/30 text-sm"
              >
                <Ambulance className="w-4 h-4" />
                <span>Call Emergency: {hospital.emergencyContact}</span>
              </a>

              <a
                href={`tel:${hospital.phone}`}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl transition text-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>OPD Reception: {hospital.phone}</span>
              </a>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.coordinates.lat},${hospital.coordinates.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-white/10 hover:bg-white/15 text-blue-200 font-medium rounded-xl transition text-xs"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Get GPS Directions</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-cb-blue flex items-center justify-center">
                <BedDouble className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Critical Care Capacity</p>
                <p className="text-base font-black text-cb-navy">{hospital.icuBeds} ICU Beds</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Accreditation Level</p>
                <p className="text-base font-black text-cb-navy">NABH & JCI Gold</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Clinical Specialties</p>
                <p className="text-base font-black text-cb-navy">{hospital.departments.length} Super Departments</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Outpatient Timings</p>
                <p className="text-base font-black text-cb-navy">{hospital.openingHours}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left / Center Column (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Overview Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h2 className="text-lg font-black text-cb-navy mb-3 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-cb-blue" />
                Hospital Overview & Clinical Excellence
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {hospital.overview}
              </p>

              <div className="mt-6 pt-6 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Centers of Clinical Excellence & Departments
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {hospital.departments.map((dept, idx) => {
                    const DeptIcon = getDepartmentIcon(dept);
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-cb-blue/40 bg-slate-50/50 hover:bg-blue-50/40 transition group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-cb-blue flex items-center justify-center group-hover:bg-cb-blue group-hover:text-white transition">
                          <DeptIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-800 block group-hover:text-cb-blue transition">
                            {dept}
                          </span>
                          <span className="text-[11px] text-slate-500">24x7 Specialist On-Call</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Diagnostic & Specialized Infrastructure */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h2 className="text-lg font-black text-cb-navy mb-4 flex items-center gap-2">
                <Microscope className="w-5 h-5 text-cb-blue" />
                Specialized Diagnostic & Care Services
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {hospital.services.map((srv, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-cb-emerald shrink-0 mt-0.5" />
                    <span className="font-semibold text-slate-700">{srv}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Affiliated Specialists Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <div>
                  <h2 className="text-lg font-black text-cb-navy flex items-center gap-2">
                    <Users className="w-5 h-5 text-cb-blue" />
                    Specialist Consultants at this Hospital
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Verified senior clinicians and department heads practicing at {hospital.name}
                  </p>
                </div>
                <Link
                  to={`/doctors?hospitalId=${hospital.id}`}
                  className="text-xs font-bold text-cb-blue hover:underline"
                >
                  View All Specialists →
                </Link>
              </div>

              {doctors.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No direct doctor profiles mapped currently. Contact OPD reception for slot availability.
                </div>
              ) : (
                <div className="space-y-4">
                  {doctors.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 rounded-xl border border-slate-200 hover:border-cb-blue/30 hover:shadow-sm transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <img
                          src={doc.avatarUrl}
                          alt={doc.fullName}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-sm">{doc.fullName}</h3>
                            <span className="bg-blue-50 text-cb-blue text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {doc.specialty}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">{doc.qualifications}</p>
                          <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
                            <span>{doc.experienceYears} Years Exp.</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-amber-600 font-bold">
                              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                              {doc.rating} ({doc.reviewCount})
                            </span>
                            <span>•</span>
                            <span className="text-cb-navy font-bold">₹{doc.consultationFee}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          to={`/doctors/${doc.id}`}
                          className="px-3.5 py-2 text-xs font-bold border border-slate-300 hover:border-cb-blue text-slate-700 hover:text-cb-blue rounded-xl transition"
                        >
                          Profile
                        </Link>
                        <Link
                          to={`/appointments/book?doctorId=${doc.id}&hospitalId=${hospital.id}`}
                          className="px-4 py-2 text-xs font-bold bg-cb-blue hover:bg-blue-700 text-white rounded-xl shadow-xs transition flex items-center gap-1.5"
                        >
                          <Calendar className="w-3.5 h-3.5" /> Book OPD
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Cashless Insurance & TPA Desk */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center gap-2 text-cb-navy font-bold text-sm mb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Cashless TPA & Insurance Desk</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">
                Our 24x7 TPA Helpdesk facilitates seamless cashless hospitalization with all major health insurance providers and government schemes.
              </p>
              <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold text-slate-700">
                {['Star Health', 'HDFC ERGO', 'ICICI Lombard', 'Max Bupa', 'Bajaj Allianz', 'Care Health', 'CGHS', 'ECHS', 'Ayushman PM-JAY'].map((ins, i) => (
                  <span key={i} className="px-2 py-1 bg-slate-100 rounded-md border border-slate-200">
                    {ins}
                  </span>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-center justify-between">
                <span>TPA Counter: Ground Floor, Block A</span>
                <span className="font-bold text-cb-blue">Extn: 401</span>
              </div>
            </div>

            {/* Emergency Admission Process */}
            <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-5 text-xs text-rose-900 space-y-3">
              <div className="flex items-center gap-2 font-bold text-rose-950 text-sm">
                <Ambulance className="w-4 h-4 text-cb-rose" />
                <span>Emergency Admission Protocol</span>
              </div>
              <ol className="list-decimal list-inside space-y-2 text-rose-800 leading-relaxed">
                <li>Immediate arrival at Emergency Bay (Gate 2) without prior paperwork.</li>
                <li>Zero-delay primary resuscitation & triage by emergency physician.</li>
                <li>Instant diagnostic activation (CT / Biplane Angio / ICU bed allocation).</li>
                <li>Kin can complete registration and insurance cashless formalities post-stabilization.</li>
              </ol>
              <div className="pt-2">
                <a
                  href={`tel:${hospital.emergencyContact}`}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-cb-rose text-white font-bold rounded-lg hover:bg-rose-700 transition"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Emergency: {hospital.emergencyContact}
                </a>
              </div>
            </div>

            {/* Location & Visiting Hours */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs text-xs space-y-3">
              <h3 className="font-bold text-cb-navy text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-cb-blue" />
                Visiting Hours & Patient Policy
              </h3>
              <div className="space-y-2 text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="font-medium">General Inpatient Wards:</span>
                  <span className="font-bold text-slate-800">04:30 PM - 07:00 PM</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="font-medium">Intensive Care Units (ICU):</span>
                  <span className="font-bold text-slate-800">11:00 AM - 12:00 PM</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="font-medium">Visitor Pass Limit:</span>
                  <span className="font-bold text-slate-800">1 Attendant per Patient</span>
                </div>
              </div>
            </div>

            {/* Corporate Accreditations */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
              <Award className="w-6 h-6 text-amber-500 mx-auto mb-1.5" />
              <p className="text-xs font-bold text-slate-800">National & Global Benchmarks</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Complies with Ministry of Health & Family Welfare guidelines and Joint Commission International (JCI) quality standards.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
