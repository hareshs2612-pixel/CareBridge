import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { dataStore } from '../../services/dataStore';
import { api } from '../../services/api';
import { Appointment, AppointmentStatus } from '../../types';
import {
  Calendar,
  Clock,
  Building2,
  Video,
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  Search,
  Printer
} from 'lucide-react';

export const AppointmentDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = dataStore.getCurrentUser();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedTab, setSelectedTab] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [cancelModalApt, setCancelModalApt] = useState<Appointment | null>(null);
  const [rescheduleModalApt, setRescheduleModalApt] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState('11:00 AM');
  const [loading, setLoading] = useState(false);

  const loadAppointments = () => {
    const list = dataStore.getCorporateAppointments();
    setAppointments(list);
  };

  useEffect(() => {
    loadAppointments();
    return dataStore.subscribe(loadAppointments);
  }, []);

  const filteredAppointments = appointments.filter((apt) => {
    if (selectedTab === 'upcoming') return apt.status === 'confirmed' || apt.status === 'pending';
    if (selectedTab === 'completed') return apt.status === 'completed';
    if (selectedTab === 'cancelled') return apt.status === 'cancelled';
    return true;
  });

  const handleCancelAppointment = async () => {
    if (!cancelModalApt) return;
    setLoading(true);
    try {
      await api.updateAppointmentStatus(cancelModalApt.id, 'cancelled');
      setCancelModalApt(null);
    } catch {}
    setLoading(false);
  };

  const handleRescheduleAppointment = async () => {
    if (!rescheduleModalApt || !newDate) return;
    setLoading(true);
    try {
      // Cancel old, book new
      await api.updateAppointmentStatus(rescheduleModalApt.id, 'cancelled');
      await api.bookAppointment({
        ...rescheduleModalApt,
        date: newDate,
        timeSlot: newSlot,
        status: 'confirmed'
      });
      setRescheduleModalApt(null);
    } catch {}
    setLoading(false);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-cb-navy font-heading">
              My Appointments & Consultations
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Manage your upcoming hospital OPD visits, join video sessions, and view digital prescriptions
            </p>
          </div>

          <Link
            to="/appointments/book"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-cb-blue hover:bg-cb-blue-hover text-white text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Book New Appointment</span>
          </Link>
        </div>

        {/* Tabs Filter Bar */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2 text-xs font-bold">
          <button
            onClick={() => setSelectedTab('all')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer ${
              selectedTab === 'all' ? 'bg-cb-blue text-white shadow-xs' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            All Bookings ({appointments.length})
          </button>
          <button
            onClick={() => setSelectedTab('upcoming')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer ${
              selectedTab === 'upcoming' ? 'bg-cb-blue text-white shadow-xs' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            Upcoming ({appointments.filter(a => a.status === 'confirmed' || a.status === 'pending').length})
          </button>
          <button
            onClick={() => setSelectedTab('completed')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer ${
              selectedTab === 'completed' ? 'bg-cb-blue text-white shadow-xs' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            Completed ({appointments.filter(a => a.status === 'completed').length})
          </button>
          <button
            onClick={() => setSelectedTab('cancelled')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer ${
              selectedTab === 'cancelled' ? 'bg-cb-blue text-white shadow-xs' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            Cancelled ({appointments.filter(a => a.status === 'cancelled').length})
          </button>
        </div>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-base text-cb-navy">No {selectedTab !== 'all' ? selectedTab : ''} appointments found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You do not have any appointments under this view. Explore available doctors to schedule a consultation.
            </p>
            <Link
              to="/doctors"
              className="inline-block px-5 py-2.5 rounded-xl bg-cb-blue text-white text-xs font-bold hover:bg-cb-blue-hover transition"
            >
              Browse Doctor Directory
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((apt) => {
              const isUpcoming = apt.status === 'confirmed' || apt.status === 'pending';
              const isTeleconsult = apt.type === 'teleconsultation';

              return (
                <div
                  key={apt.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-card transition p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between"
                >
                  {/* Left Column: Doctor & Patient Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <img
                      src={apt.doctorAvatarUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150'}
                      alt={apt.doctorName}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-base text-cb-navy">{apt.doctorName}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          apt.status === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : apt.status === 'completed'
                            ? 'bg-blue-50 text-cb-blue border border-blue-200'
                            : 'bg-rose-50 text-cb-rose border border-rose-200'
                        }`}>
                          {apt.status}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          Ref: {apt.bookingReference}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-cb-blue">{apt.doctorSpecialty}</p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate">{apt.hospitalName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-medium text-slate-700">
                          <span>Patient: {apt.patientName}</span>
                        </div>
                      </div>

                      {apt.notes && (
                        <p className="text-[11px] text-slate-500 italic pt-1">
                          "{apt.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Middle Column: Date & Slot Details */}
                  <div className="md:border-l md:border-r md:border-slate-100 md:px-6 space-y-2 text-xs shrink-0 w-full md:w-56">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-cb-blue" />
                      <span className="font-bold text-slate-800">{apt.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span className="font-semibold text-emerald-700">{apt.timeSlot}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      {isTeleconsult ? <Video className="w-4 h-4 text-purple-600" /> : <Building2 className="w-4 h-4 text-slate-400" />}
                      <span>{isTeleconsult ? 'Video Teleconsult' : 'In-Person OPD'}</span>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-48 shrink-0">
                    {/* If upcoming and teleconsult -> Join Call */}
                    {isUpcoming && isTeleconsult && (
                      <Link
                        to={`/teleconsult?appointmentId=${apt.id}`}
                        className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Video Room</span>
                      </Link>
                    )}

                    {/* Reschedule Button */}
                    {isUpcoming && (
                      <button
                        onClick={() => {
                          setRescheduleModalApt(apt);
                          setNewDate(apt.date);
                          setNewSlot(apt.timeSlot);
                        }}
                        className="w-full py-2 rounded-xl border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                        <span>Reschedule</span>
                      </button>
                    )}

                    {/* Cancel Button */}
                    {isUpcoming && (
                      <button
                        onClick={() => setCancelModalApt(apt)}
                        className="w-full py-1.5 rounded-xl text-xs font-semibold text-cb-rose hover:bg-rose-50 transition cursor-pointer"
                      >
                        Cancel Slot
                      </button>
                    )}

                    {/* Prescription Link if completed */}
                    {apt.status === 'completed' && (
                      <Link
                        to={`/patient/records`}
                        className="w-full py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-cb-blue text-xs font-bold flex items-center justify-center gap-1.5 transition"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Prescription</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        {cancelModalApt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-elevated space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-cb-rose flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-cb-navy">Cancel Appointment?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you wish to cancel your scheduled appointment with <strong>{cancelModalApt.doctorName}</strong> on <strong>{cancelModalApt.date} at {cancelModalApt.timeSlot}</strong>?
              </p>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setCancelModalApt(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Keep Appointment
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleCancelAppointment}
                  className="px-5 py-2 rounded-xl bg-cb-rose hover:bg-red-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reschedule Modal */}
        {rescheduleModalApt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-elevated space-y-4">
              <h3 className="font-bold text-base text-cb-navy">Reschedule Consultation Slot</h3>
              <p className="text-xs text-slate-500">
                Select a new date and time for your consultation with <strong>{rescheduleModalApt.doctorName}</strong>.
              </p>

              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">New Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-cb-blue"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Time Slot</label>
                  <select
                    value={newSlot}
                    onChange={(e) => setNewSlot(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-cb-blue cursor-pointer"
                  >
                    <option value="09:30 AM">09:30 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="04:00 PM">04:00 PM</option>
                    <option value="05:00 PM">05:00 PM</option>
                    <option value="06:00 PM">06:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setRescheduleModalApt(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={loading || !newDate}
                  onClick={handleRescheduleAppointment}
                  className="px-5 py-2 rounded-xl bg-cb-blue hover:bg-cb-blue-hover text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Rescheduling...' : 'Confirm Reschedule'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
