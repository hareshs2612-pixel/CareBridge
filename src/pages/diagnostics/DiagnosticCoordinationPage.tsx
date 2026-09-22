import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { dataStore } from '../../services/dataStore';
import { DiagnosticTest, DiagnosticOrder, DiagnosticOrderStatus, UserProfile } from '../../types';
import { 
  FlaskConical, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  FileText, 
  Search, 
  Plus, 
  Stethoscope, 
  ChevronRight, 
  Filter, 
  Info,
  Check,
  X
} from 'lucide-react';

export const DiagnosticCoordinationPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(dataStore.getCurrentUser());
  const [tests, setTests] = useState<DiagnosticTest[]>([]);
  const [orders, setOrders] = useState<DiagnosticOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'orders' | 'catalog'>('orders');
  const [selectedOrder, setSelectedOrder] = useState<DiagnosticOrder | null>(null);

  // New Order Form state
  const [showOrderModal, setShowOrderModal] = useState<boolean>(false);
  const [patientId, setPatientId] = useState<string>('pat-ramesh');
  const [patientName, setPatientName] = useState<string>('Ramesh Kumar');
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>(['test-fbg', 'test-hba1c']);
  const [clinicalIndication, setClinicalIndication] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Doctor review state
  const [doctorReviewNotes, setDoctorReviewNotes] = useState<string>('');
  const [isReviewing, setIsReviewing] = useState<boolean>(false);

  // Schedule slot state
  const [slotDate, setSlotDate] = useState<string>('2026-09-24T08:30');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [testList, orderList] = await Promise.all([
        api.getDiagnosticCatalog(),
        api.getDiagnosticOrders()
      ]);
      setTests(testList);
      setOrders(orderList);
      if (orderList.length > 0) {
        setSelectedOrder(orderList[0]);
      }
    } catch (err) {
      console.error('Failed to load diagnostics data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTestIds.length === 0) return;
    setIsSubmitting(true);
    try {
      const testsToOrder = tests.filter(t => selectedTestIds.includes(t.id));
      const created = await api.createDiagnosticOrder({
        patientId,
        patientName,
        doctorId: currentUser.role === 'doctor' ? currentUser.uid : 'doc-sharma',
        doctorName: currentUser.role === 'doctor' ? currentUser.fullName : 'Dr. Anita Sharma',
        facilityId: 'hosp-apex',
        facilityName: 'CareBridge Apex Hospital & Heart Centre',
        tests: testsToOrder,
        clinicalIndication: clinicalIndication || 'Routine quarterly surveillance'
      });
      setOrders([created, ...orders]);
      setSelectedOrder(created);
      setShowOrderModal(false);
      setClinicalIndication('');
    } catch (err) {
      console.error('Failed to create diagnostic order:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScheduleOrder = async (orderId: string) => {
    try {
      const updated = await api.scheduleDiagnosticOrder(orderId, {
        scheduledSlot: new Date(slotDate).toISOString(),
        scheduledFacilityId: 'hosp-apex'
      });
      setOrders(orders.map(o => o.id === orderId ? updated : o));
      setSelectedOrder(updated);
    } catch (err) {
      console.error('Failed to schedule slot:', err);
    }
  };

  const handleReviewOrder = async (orderId: string) => {
    if (!doctorReviewNotes) return;
    setIsReviewing(true);
    try {
      const updated = await api.reviewDiagnosticOrder(orderId, {
        reviewedByDoctorId: currentUser.role === 'doctor' ? currentUser.uid : 'doc-sharma',
        doctorReviewNotes
      });
      setOrders(orders.map(o => o.id === orderId ? updated : o));
      setSelectedOrder(updated);
      setDoctorReviewNotes('');
    } catch (err) {
      console.error('Failed to review order:', err);
    } finally {
      setIsReviewing(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
    return true;
  });

  const getStatusBadge = (status: DiagnosticOrderStatus) => {
    switch (status) {
      case 'ORDERED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'SCHEDULED':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'SAMPLE_COLLECTED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'RESULT_AVAILABLE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold animate-pulse';
      case 'REVIEWED':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'CLOSED':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Banner */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold tracking-wide uppercase mb-3">
              <FlaskConical className="w-3.5 h-3.5 text-teal-600" />
              Integrated Pathology & Imaging
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Diagnostic Coordination & Lab Tracker
            </h1>
            <p className="text-slate-600 mt-2 text-sm sm:text-base max-w-2xl">
              Order laboratory and radiological investigations, track turnaround milestones, highlight abnormal biomarkers, and capture electronic doctor sign-offs directly into the longitudinal health record.
            </p>
          </div>
          <button
            onClick={() => setShowOrderModal(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Order Diagnostic Panel
          </button>
        </div>

        {/* Synthetic Demo Disclaimer */}
        <div className="bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3 text-slate-600 text-xs">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-teal-600 flex-shrink-0" />
            <span>
              <strong>Demo Lab Coordination: </strong> Test catalogs, specimen turnaround timelines, and report summaries are synthetic demonstration benchmarks for SIH 26133 evaluation.
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700 whitespace-nowrap">
            DEMO DATA
          </span>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-4 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-2 px-2 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'orders'
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Diagnostic Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`pb-2 px-2 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'catalog'
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Test Catalog ({tests.length})
          </button>
        </div>

        {activeTab === 'orders' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Orders List */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {['ALL', 'ORDERED', 'SCHEDULED', 'RESULT_AVAILABLE', 'REVIEWED'].map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                      statusFilter === st ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600'
                    }`}
                  >
                    {st.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>

              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400 text-sm">
                  No diagnostic orders found.
                </div>
              ) : (
                filteredOrders.map(order => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`bg-white rounded-2xl p-5 shadow-sm border cursor-pointer transition-all hover:border-teal-400 ${
                      selectedOrder?.id === order.id
                        ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-md'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="text-base font-bold text-slate-900">{order.patientName}</span>
                        <div className="text-xs text-slate-500">Order ID: {order.id}</div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadge(order.status)}`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="text-xs font-medium text-slate-700 mt-2">
                      <strong>Tests: </strong> {order.tests.map(t => t.name).join(', ')}
                    </div>

                    <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 mt-3 text-xs text-slate-600 flex items-center justify-between">
                      <span>Ordered by: <strong>{order.doctorName}</strong></span>
                      <span>Facility: <strong>{order.facilityName}</strong></span>
                    </div>

                    {order.abnormalFlagCount > 0 && (
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {order.abnormalFlagCount} Abnormal Parameter Marker(s) Identified
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Order Detail / Results Viewer */}
            <div className="lg:col-span-6 space-y-6">
              {selectedOrder ? (
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6 sticky top-24">
                  <div className="border-b border-slate-100 pb-4">
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(selectedOrder.status)}`}>
                        {selectedOrder.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-slate-400">
                        Placed: {new Date(selectedOrder.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mt-2">{selectedOrder.patientName}</h2>
                    <p className="text-xs text-slate-500 mt-1">Indication: {selectedOrder.clinicalIndication}</p>
                  </div>

                  {/* Actions for scheduling if newly ORDERED */}
                  {selectedOrder.status === 'ORDERED' && (
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 space-y-3">
                      <div className="text-xs font-bold text-purple-900 uppercase">Book Specimen Collection Slot</div>
                      <input
                        type="datetime-local"
                        value={slotDate}
                        onChange={(e) => setSlotDate(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-purple-300 bg-white"
                      />
                      <button
                        onClick={() => handleScheduleOrder(selectedOrder.id)}
                        className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        Confirm Collection Slot
                      </button>
                    </div>
                  )}

                  {/* Lab Results Table */}
                  {selectedOrder.results && selectedOrder.results.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Laboratory Parameter Findings</span>
                        <span className="text-[10px] text-slate-500 font-medium">Standard Reference Range</span>
                      </div>

                      <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                        {selectedOrder.results.map((res, i) => (
                          <div key={i} className={`p-3 flex items-center justify-between gap-2 ${res.isAbnormal ? 'bg-amber-50/60' : 'bg-white'}`}>
                            <div className="flex-1">
                              <div className="font-semibold text-slate-900">{res.parameterName}</div>
                              <div className="text-[11px] text-slate-500">Ref: {res.referenceRange}</div>
                            </div>
                            <div className="text-right">
                              <span className={`text-sm font-bold ${res.isAbnormal ? 'text-amber-700' : 'text-slate-800'}`}>
                                {res.value} <span className="text-xs font-normal text-slate-500">{res.unit}</span>
                              </span>
                              {res.isAbnormal && (
                                <span className="block text-[10px] font-bold text-rose-600 uppercase">ABNORMAL</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {selectedOrder.reportSummary && (
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700">
                          <strong>Pathologist Summary: </strong>
                          {selectedOrder.reportSummary}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center text-xs text-slate-500 space-y-1">
                      <Clock className="w-6 h-6 text-slate-400 mx-auto" />
                      <div>Laboratory specimen is currently processing.</div>
                      <div>Expected turnaround: ~4 hours.</div>
                    </div>
                  )}

                  {/* Doctor Review Sign-Off */}
                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Attending Doctor Electronic Sign-Off</div>
                    
                    {selectedOrder.status === 'REVIEWED' ? (
                      <div className="bg-teal-50 p-4 rounded-xl border border-teal-200 space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-teal-800">
                          <CheckCircle2 className="w-4 h-4 text-teal-600" />
                          Electronically Reviewed & Signed
                        </div>
                        <p className="text-teal-900 mt-1 italic">"{selectedOrder.doctorReviewNotes}"</p>
                        <div className="text-[10px] text-teal-700 pt-1">
                          Attached to Longitudinal Health Record on {selectedOrder.reviewedAt ? new Date(selectedOrder.reviewedAt).toLocaleString() : 'N/A'}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        <textarea
                          rows={2}
                          value={doctorReviewNotes}
                          onChange={(e) => setDoctorReviewNotes(e.target.value)}
                          placeholder="Enter clinical assessment, diagnostic impressions, and treatment adjustments..."
                          className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500"
                        />
                        <button
                          onClick={() => handleReviewOrder(selectedOrder.id)}
                          disabled={isReviewing || !doctorReviewNotes}
                          className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Check className="w-4 h-4" />
                          {isReviewing ? 'Signing...' : 'Sign-Off Report & Attach to Patient Record'}
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              ) : null}
            </div>

          </div>
        ) : (
          /* Catalog View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map(test => (
              <div key={test.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {test.category}
                  </span>
                  <span className="text-sm font-extrabold text-teal-700">₹{test.costInr}</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{test.name}</h3>
                  <div className="text-xs text-slate-400 mt-0.5">LOINC: {test.code}</div>
                </div>
                <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div><strong>Specimen: </strong> {test.sampleType || 'Not specified'}</div>
                  <div><strong>Turnaround: </strong> {test.turnaroundHours} Hours</div>
                  {test.preparationInstructions && (
                    <div className="text-slate-500 italic mt-1">{test.preparationInstructions}</div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedTestIds([test.id]);
                    setShowOrderModal(true);
                  }}
                  className="w-full py-2 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-800 text-xs font-semibold rounded-xl border border-slate-200 transition-colors"
                >
                  Order This Test
                </button>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Order Diagnostic Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Order Diagnostic Panel</h3>
              <button onClick={() => setShowOrderModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Patient Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Select Tests to Order</label>
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1.5 divide-y divide-slate-100">
                  {tests.map(t => (
                    <label key={t.id} className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer pt-1.5">
                      <input
                        type="checkbox"
                        checked={selectedTestIds.includes(t.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTestIds([...selectedTestIds, t.id]);
                          } else {
                            setSelectedTestIds(selectedTestIds.filter(id => id !== t.id));
                          }
                        }}
                        className="rounded text-teal-600"
                      />
                      <span className="flex-1">{t.name}</span>
                      <span className="text-slate-400">₹{t.costInr}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Indication</label>
                <textarea
                  rows={2}
                  value={clinicalIndication}
                  onChange={(e) => setClinicalIndication(e.target.value)}
                  placeholder="Reason for ordering diagnostic testing..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || selectedTestIds.length === 0}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-2"
                >
                  <FlaskConical className="w-4 h-4" />
                  {isSubmitting ? 'Ordering...' : 'Place Diagnostic Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
