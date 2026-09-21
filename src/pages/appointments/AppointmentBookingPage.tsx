import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { dataStore } from '../../services/dataStore';
import { api } from '../../services/api';
import { Appointment, Doctor } from '../../types';
import {
  Calendar,
  Clock,
  Building2,
  Video,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Printer
} from 'lucide-react';

export const AppointmentBookingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const doctorIdParam = searchParams.get('doctorId') || '';
  const dateParam = searchParams.get('date') || '';
  const timeSlotParam = searchParams.get('timeSlot') || '';
  const modeParam = (searchParams.get('mode') as any) || 'in_person';

  const doctors = dataStore.getCorporateDoctors();
  const currentUser = dataStore.getCurrentUser();

  // Wizard Steps: 1: Doctor & Mode, 2: Slot, 3: Patient Details, 4: Confirmed Slip
  const [currentStep, setCurrentStep] = useState<number>(doctorIdParam && dateParam && timeSlotParam ? 3 : doctorIdParam ? 2 : 1);

  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(doctorIdParam || (doctors[0]?.id || ''));
  const [selectedMode, setSelectedMode] = useState<'in_person' | 'teleconsultation'>(modeParam);
  const [selectedDate, setSelectedDate] = useState<string>(dateParam || (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })());
  const [selectedSlot, setSelectedSlot] = useState<string>(timeSlotParam || '10:30 AM');

  // Patient Info Form
  const [patientName, setPatientName] = useState(currentUser?.fullName || '');
  const [patientPhone, setPatientPhone] = useState(currentUser?.phone || '');
  const [patientAge, setPatientAge] = useState<number>(45);
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [symptomDescription, setSymptomDescription] = useState('');
  const [paymentMode, setPaymentMode] = useState<'pay_now' | 'pay_at_hospital'>('pay_now');

  // Status & Confirmation
  const [loading, setLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  const activeDoctor: Doctor | undefined = doctors.find(d => d.id === selectedDoctorId);

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

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDoctor) return;
    setLoading(true);
    setBookingError(null);

    const fee = selectedMode === 'in_person' ? activeDoctor.consultationFee : Math.round(activeDoctor.consultationFee * 0.85);

    try {
      const apt = await api.bookAppointment({
        patientId: currentUser?.uid || 'pat-guest',
        patientName: patientName.trim() || 'Patient',
        patientPhone: patientPhone.trim() || '+91 99999 99999',
        patientAge: Number(patientAge),
        patientGender,
        doctorId: activeDoctor.id,
        doctorName: activeDoctor.fullName,
        doctorSpecialty: activeDoctor.specialty,
        doctorAvatarUrl: activeDoctor.avatarUrl,
        hospitalId: activeDoctor.hospitalId,
        hospitalName: activeDoctor.hospitalAffiliation,
        hospitalAddress: activeDoctor.hospitalAffiliation + ', ' + activeDoctor.languages[0],
        date: selectedDate,
        timeSlot: selectedSlot,
        type: selectedMode,
        status: 'confirmed',
        fee,
        paymentStatus: paymentMode === 'pay_now' ? 'paid' : 'pay_at_hospital',
        notes: symptomDescription.trim() || undefined
      });

      setConfirmedAppointment(apt);
      setCurrentStep(4);
    } catch (err: any) {
      setBookingError(err?.data?.error || err.message || 'Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <Link to="/doctors" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-cb-blue transition">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Doctors</span>
          </Link>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            CareBridge OPD Reservation
          </div>
        </div>

        {/* Wizard Progress Indicator */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
            <div className={`py-2 rounded-xl transition ${currentStep >= 1 ? 'bg-cb-blue text-white' : 'bg-slate-100 text-slate-400'}`}>
              1. Doctor & Mode
            </div>
            <div className={`py-2 rounded-xl transition ${currentStep >= 2 ? 'bg-cb-blue text-white' : 'bg-slate-100 text-slate-400'}`}>
              2. Slot Time
            </div>
            <div className={`py-2 rounded-xl transition ${currentStep >= 3 ? 'bg-cb-blue text-white' : 'bg-slate-100 text-slate-400'}`}>
              3. Patient Info
            </div>
            <div className={`py-2 rounded-xl transition ${currentStep >= 4 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
              4. Confirmation
            </div>
          </div>
        </div>

        {/* STEP 1: Select Doctor & Mode */}
        {currentStep === 1 && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-card space-y-6">
            <div>
              <h2 className="text-xl font-bold text-cb-navy">Step 1: Choose Doctor & Mode</h2>
              <p className="text-xs text-slate-500 mt-1">Select the physician and whether you prefer an in-person hospital OPD visit or online video consultation.</p>
            </div>

            {/* Doctor Picker */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Select Doctor</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto">
                {doctors.map((doc) => {
                  const isSelected = doc.id === selectedDoctorId;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoctorId(doc.id)}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center gap-3 ${
                        isSelected
                          ? 'border-cb-blue bg-cb-blue/5 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img src={doc.avatarUrl} alt={doc.fullName} className="w-12 h-12 rounded-xl object-cover" />
                      <div className="flex-1 truncate">
                        <div className="font-bold text-sm text-cb-navy truncate">{doc.fullName}</div>
                        <div className="text-xs text-cb-blue truncate">{doc.specialty}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">₹{doc.consultationFee}</div>
                      </div>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-cb-blue shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mode Picker */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Consultation Mode</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedMode('in_person')}
                  className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                    selectedMode === 'in_person' ? 'border-cb-blue bg-cb-blue/5 font-bold shadow-xs' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-bold text-cb-navy">
                    <Building2 className="w-4 h-4 text-cb-blue" />
                    <span>In-Person Hospital Visit</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Consult directly at doctor's OPD clinic</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMode('teleconsultation')}
                  className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                    selectedMode === 'teleconsultation' ? 'border-purple-600 bg-purple-50 font-bold shadow-xs' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-bold text-purple-900">
                    <Video className="w-4 h-4 text-purple-600" />
                    <span>Video Teleconsultation</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">High-definition encrypted video from home</div>
                </button>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 rounded-xl bg-cb-blue hover:bg-cb-blue-hover text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Continue to Select Date & Slot</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Slot & Date Picker */}
        {currentStep === 2 && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-card space-y-6">
            <div>
              <h2 className="text-xl font-bold text-cb-navy">Step 2: Choose Date & Guaranteed Slot</h2>
              <p className="text-xs text-slate-500 mt-1">
                Consultation with <strong className="text-slate-700">{activeDoctor?.fullName}</strong> ({activeDoctor?.specialty})
              </p>
            </div>

            {/* Date Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Select Date</label>
              <div className="grid grid-cols-5 gap-2">
                {nextDates.map((d) => {
                  const isSelected = selectedDate === d.iso;
                  return (
                    <button
                      key={d.iso}
                      type="button"
                      onClick={() => setSelectedDate(d.iso)}
                      className={`p-3 rounded-2xl text-center border transition cursor-pointer ${
                        isSelected
                          ? 'border-cb-blue bg-cb-blue text-white shadow-xs font-bold'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="text-xs uppercase">{d.day}</div>
                      <div className="text-lg font-black">{d.dateNum}</div>
                      <div className="text-[10px]">{d.month}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slot Time Picker */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold uppercase tracking-wider text-slate-400">Available Time Slots</label>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Double-Booking Protected
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {(activeDoctor?.availableSlots || ['09:30 AM', '10:30 AM', '11:30 AM', '04:30 PM', '05:30 PM']).map((slot) => {
                  const isSelected = selectedSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-3 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-2 ${
                        isSelected
                          ? 'border-cb-blue bg-cb-blue/10 text-cb-blue shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{slot}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-6 py-3 rounded-xl bg-cb-blue hover:bg-cb-blue-hover text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Continue to Patient Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Patient Information & Review */}
        {currentStep === 3 && (
          <form onSubmit={handleConfirmBooking} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-card space-y-6">
            <div>
              <h2 className="text-xl font-bold text-cb-navy">Step 3: Patient Details & Payment Mode</h2>
              <p className="text-xs text-slate-500 mt-1">Please provide the attendee details for medical records and hospital OPD admission.</p>
            </div>

            {bookingError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-cb-rose text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold">Reservation Conflict / Error</div>
                  <div>{bookingError}</div>
                </div>
              </div>
            )}

            {/* Doctor & Slot Summary Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img src={activeDoctor?.avatarUrl} alt={activeDoctor?.fullName} className="w-12 h-12 rounded-xl object-cover" />
                <div>
                  <div className="font-bold text-sm text-cb-navy">{activeDoctor?.fullName}</div>
                  <div className="text-xs text-cb-blue">{activeDoctor?.specialty}</div>
                  <div className="text-[11px] text-slate-500">{activeDoctor?.hospitalAffiliation}</div>
                </div>
              </div>
              <div className="text-left sm:text-right text-xs">
                <div className="font-bold text-slate-800">{selectedDate} at {selectedSlot}</div>
                <div className="text-slate-500 mt-0.5">{selectedMode === 'in_person' ? 'In-Person OPD' : 'Video Consultation'}</div>
                <div className="font-black text-cb-navy text-sm mt-1">
                  Fee: ₹{selectedMode === 'in_person' ? activeDoctor?.consultationFee : Math.round((activeDoctor?.consultationFee || 800) * 0.85)}
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Patient Full Name *</label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-cb-blue"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="+91 94150 12345"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-cb-blue"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Age</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={patientAge}
                  onChange={(e) => setPatientAge(Number(e.target.value))}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-cb-blue"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Gender</label>
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-cb-blue cursor-pointer"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-600">Reason for Visit / Primary Symptoms (Optional)</label>
                <textarea
                  rows={2}
                  value={symptomDescription}
                  onChange={(e) => setSymptomDescription(e.target.value)}
                  placeholder="Brief description of current discomfort, duration, or follow-up goals..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-cb-blue resize-none"
                />
              </div>
            </div>

            {/* Payment Mode */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Payment Option</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMode('pay_now')}
                  className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                    paymentMode === 'pay_now' ? 'border-cb-blue bg-cb-blue/5 font-bold shadow-xs' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-cb-navy">
                    <CreditCard className="w-4 h-4 text-cb-blue" />
                    <span>Pay Online (UPI / Card)</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Instant digital confirmation slip</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMode('pay_at_hospital')}
                  className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                    paymentMode === 'pay_at_hospital' ? 'border-cb-blue bg-cb-blue/5 font-bold shadow-xs' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-cb-navy">
                    <Building2 className="w-4 h-4 text-cb-blue" />
                    <span>Pay at Hospital Desk</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Pay during check-in counter</div>
                </button>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3.5 rounded-2xl bg-cb-blue hover:bg-cb-blue-hover text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-cb-blue/20 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Confirming Slot...' : 'Confirm & Generate OPD Slip'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: Confirmation Slip */}
        {currentStep === 4 && confirmedAppointment && (
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-card space-y-6 animate-fade-in text-center">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs">
                Reservation Confirmed & Guaranteed
              </span>
              <h2 className="text-2xl font-black text-cb-navy font-heading mt-2">
                Booking Reference: {confirmedAppointment.bookingReference}
              </h2>
              <p className="text-xs text-slate-500">
                A confirmation SMS with token details has been dispatched to {confirmedAppointment.patientPhone}.
              </p>
            </div>

            {/* Printable Slip Card */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-left max-w-md mx-auto space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Consulting Doctor</div>
                  <div className="font-bold text-sm text-cb-navy">{confirmedAppointment.doctorName}</div>
                  <div className="text-xs text-cb-blue">{confirmedAppointment.doctorSpecialty}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Token Number</div>
                  <div className="text-lg font-black text-cb-blue">OPD-18</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Date</span>
                  <strong className="text-slate-800">{confirmedAppointment.date}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Time Slot</span>
                  <strong className="text-slate-800">{confirmedAppointment.timeSlot}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Mode</span>
                  <strong className="text-slate-800">{confirmedAppointment.type === 'in_person' ? 'In-Person OPD' : 'Video Consultation'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Hospital</span>
                  <strong className="text-slate-800 truncate block">{confirmedAppointment.hospitalName}</strong>
                </div>
              </div>

              {confirmedAppointment.type === 'teleconsultation' && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-xs text-purple-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-purple-600" />
                    <span>Teleconsultation Link Active</span>
                  </div>
                  <p className="text-[11px] text-purple-700">
                    You can join the private video room 10 minutes prior to your scheduled slot.
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-400" />
                <span>Print OPD Slip</span>
              </button>
              <Link
                to="/appointments"
                className="px-6 py-2.5 rounded-xl bg-cb-blue hover:bg-cb-blue-hover text-white text-xs font-bold transition shadow-xs"
              >
                View in My Appointments
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
