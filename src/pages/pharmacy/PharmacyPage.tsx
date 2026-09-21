import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  Search, 
  MapPin, 
  Phone, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Truck, 
  FileText, 
  Building2, 
  Filter, 
  ChevronRight,
  ShoppingBag,
  ExternalLink,
  Sparkles,
  Info
} from 'lucide-react';
import { Medicine, Pharmacy, MedicineInventory } from '../../types';
import { dataStore } from '../../services/dataStore';
import { api } from '../../services/api';

export const PharmacyPage: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [inventoryList, setInventoryList] = useState<MedicineInventory[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDosage, setSelectedDosage] = useState('All');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [loading, setLoading] = useState(true);

  // Reservation modal state
  const [reserveModalOpen, setReserveModalOpen] = useState(false);
  const [selectedPharmacyForReserve, setSelectedPharmacyForReserve] = useState<MedicineInventory | null>(null);
  const [reserveSuccess, setReserveSuccess] = useState(false);
  const [reserveQuantity, setReserveQuantity] = useState(1);
  const [patientName, setPatientName] = useState('Ramesh Kumar');
  const [patientPhone, setPatientPhone] = useState('+91 98765 43210');

  const categories = [
    'All',
    'Cardiovascular',
    'Diabetic Care',
    'Pain & Analgesics',
    'Antibiotics',
    'Respiratory',
    'Gastrointestinal',
    'Vitamins & Supplements'
  ];

  const dosageForms = ['All', 'Tablet', 'Capsule', 'Syrup', 'Inhaler', 'Injection', 'Ointment'];

  useEffect(() => {
    const loadPharmacyData = async () => {
      setLoading(true);
      try {
        const meds = await api.getMedicines();
        const pharms = await api.getPharmacies();
        setMedicines(meds);
        setPharmacies(pharms);

        if (meds.length > 0) {
          setSelectedMedicine(meds[0]);
          const inv = await api.getInventoryForMedicine(meds[0].id);
          setInventoryList(inv);
        }
      } catch (err) {
        console.error('Error loading pharmacy inventory:', err);
      } finally {
        setLoading(false);
      }
    };
    loadPharmacyData();
  }, []);

  const handleSelectMedicine = async (med: Medicine) => {
    setSelectedMedicine(med);
    try {
      const inv = await api.getInventoryForMedicine(med.id);
      setInventoryList(inv);
    } catch (err) {
      console.error('Error fetching inventory for medicine:', err);
    }
  };

  const handleOpenReserve = (inv: MedicineInventory) => {
    setSelectedPharmacyForReserve(inv);
    setReserveSuccess(false);
    setReserveModalOpen(true);
  };

  const handleConfirmReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPharmacyForReserve || !selectedMedicine) return;

    // Trigger local notification
    dataStore.addNotification({
      userId: 'pat-ramesh',
      title: `Medicine Reserved: ${selectedMedicine.brandName}`,
      message: `${reserveQuantity} unit(s) reserved at ${selectedPharmacyForReserve.pharmacyName}. Pickup code: CB-RX-${Math.floor(1000 + Math.random() * 9000)}`,
      category: 'prescription',
      read: false,
      actionUrl: '/pharmacy'
    });

    setReserveSuccess(true);
    setTimeout(() => {
      setReserveModalOpen(false);
      setReserveSuccess(false);
    }, 2500);
  };

  // Filter medicines
  const filteredMedicines = medicines.filter(m => {
    const matchesSearch = !searchQuery || 
      m.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.composition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || m.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesDosage = selectedDosage === 'All' || m.dosageForm === selectedDosage;
    return matchesSearch && matchesCategory && matchesDosage;
  });

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cb-blue text-white flex items-center justify-center shadow-xs">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-cb-navy">
                  CareBridge Pharmacy Network & Medicine Inventory
                </h1>
                <p className="text-xs text-slate-500">
                  Search authentic prescription drugs, check live stock across partner pharmacies, and order home delivery.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              100% Genuine Barcode Verified
            </span>
            <span className="bg-blue-50 border border-blue-200 text-cb-blue text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <Truck className="w-4 h-4" />
              Express 2-Hr Delivery Active
            </span>
          </div>
        </div>

        {/* Universal Search & Category Strip */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            
            {/* Search Input (6 cols) */}
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search medicine brand or generic molecule (e.g., Telmisartan, Metformin, Paracetamol)..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-cb-blue focus:outline-none placeholder-slate-400"
              />
            </div>

            {/* Category Dropdown (3 cols) */}
            <div className="md:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 font-medium focus:ring-2 focus:ring-cb-blue focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c === 'All' ? 'All Therapeutic Categories' : c}</option>
                ))}
              </select>
            </div>

            {/* Dosage Dropdown (3 cols) */}
            <div className="md:col-span-3">
              <select
                value={selectedDosage}
                onChange={(e) => setSelectedDosage(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 font-medium focus:ring-2 focus:ring-cb-blue focus:outline-none"
              >
                {dosageForms.map((d) => (
                  <option key={d} value={d}>{d === 'All' ? 'All Dosage Forms' : d}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Quick Filter Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-slate-400 text-[11px] font-bold shrink-0">Popular:</span>
            {categories.slice(1, 6).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat 
                    ? 'bg-cb-blue text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Master-Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Medicines Catalog (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
              <span>Showing <strong>{filteredMedicines.length}</strong> formulation(s)</span>
              <span>Click a formulation to inspect local pharmacy availability</span>
            </div>

            <div className="space-y-3">
              {filteredMedicines.map((med) => {
                const isSelected = selectedMedicine?.id === med.id;
                return (
                  <div
                    key={med.id}
                    onClick={() => handleSelectMedicine(med)}
                    className={`p-4 rounded-2xl border transition duration-150 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs ${
                      isSelected 
                        ? 'bg-blue-50/50 border-cb-blue ring-2 ring-blue-100 shadow-md' 
                        : 'bg-white border-slate-200 hover:border-cb-blue/40'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-cb-blue text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Pill className="w-5 h-5" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-cb-navy text-sm">{med.brandName}</h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {med.dosageForm} • {med.strength}
                          </span>
                          {med.prescriptionRequired ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-cb-rose border border-rose-200">
                              Rx Required
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-cb-emerald border border-emerald-200">
                              OTC
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-500 font-medium">
                          Generic: {med.genericName} ({med.composition})
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Mfg: {med.manufacturer} • Cat: {med.category}
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                      <span className="text-base font-black text-cb-navy">₹{med.price.toFixed(2)}</span>
                      <span className="text-[10px] text-slate-400">MRP per strip / unit</span>
                      <button
                        type="button"
                        className={`mt-1.5 px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                          isSelected ? 'bg-cb-blue text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <span>Check Stock</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredMedicines.length === 0 && !loading && (
                <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-xs text-slate-500">
                  <Pill className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-700 text-sm">No formulations found</p>
                  <p className="mt-1">Try checking your spelling or selecting "All Therapeutic Categories".</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Pharmacy Stock Panel (5 cols) */}
          <div className="lg:col-span-5 sticky top-20 space-y-4">
            {selectedMedicine ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
                
                {/* Selected Medicine Info Banner */}
                <div className="pb-4 border-b border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cb-blue bg-blue-50 px-2.5 py-0.5 rounded-full">
                      Selected Drug Formulation
                    </span>
                    <span className="text-lg font-black text-cb-navy">₹{selectedMedicine.price.toFixed(2)}</span>
                  </div>

                  <h2 className="text-lg font-black text-cb-navy">
                    {selectedMedicine.brandName} {selectedMedicine.strength}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Active Molecule: <strong className="text-slate-800">{selectedMedicine.genericName}</strong>
                  </p>
                  
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 flex items-start gap-2">
                    <Info className="w-4 h-4 text-cb-blue shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-slate-800">Usage Direction:</span>
                      <span>{selectedMedicine.usageInstructions}</span>
                    </div>
                  </div>
                </div>

                {/* Live Stock in Nearby Pharmacies */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-cb-navy text-xs flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-cb-blue" />
                      <span>Live Stock Across Partner Pharmacies</span>
                    </h3>
                    <span className="text-[11px] text-slate-400 font-mono">Synced Real-Time</span>
                  </div>

                  <div className="space-y-3">
                    {inventoryList.map((inv) => {
                      const isAvailable = inv.status === 'IN_STOCK';
                      const isLow = inv.status === 'LOW_STOCK';

                      return (
                        <div
                          key={inv.id}
                          className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition space-y-2.5 text-xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-bold text-slate-900">{inv.pharmacyName}</h4>
                              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {inv.pharmacyAddress} ({inv.distanceKm} km away)
                              </p>
                            </div>

                            {/* Stock Badge */}
                            <div>
                              {isAvailable && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                  In Stock ({inv.quantity})
                                </span>
                              )}
                              {isLow && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                                  Low Stock ({inv.quantity})
                                </span>
                              )}
                              {!isAvailable && !isLow && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                  Out of Stock
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                            <a
                              href={`tel:${inv.pharmacyPhone}`}
                              className="text-[11px] font-semibold text-slate-600 hover:text-cb-blue flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{inv.pharmacyPhone}</span>
                            </a>

                            <button
                              type="button"
                              disabled={!isAvailable && !isLow}
                              onClick={() => handleOpenReserve(inv)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                                isAvailable || isLow
                                  ? 'bg-cb-blue hover:bg-blue-700 text-white shadow-xs'
                                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              }`}
                            >
                              <ShoppingBag className="w-3 h-3" />
                              <span>Reserve / Order</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {inventoryList.length === 0 && (
                      <div className="text-center py-6 text-slate-400 text-xs">
                        No pharmacy stock entries mapped for this item.
                      </div>
                    )}
                  </div>
                </div>

                {/* Delivery Assurance */}
                <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 text-xs text-cb-blue space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Truck className="w-4 h-4" />
                    <span>Doorstep Express Delivery Guarantee</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Prescriptions placed before 08:00 PM are dispatched within 2 hours with cold-chain temperature monitoring.
                  </p>
                </div>

              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                Select a formulation on the left to inspect nearby pharmacy stock.
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Reservation / Order Modal */}
      {reserveModalOpen && selectedPharmacyForReserve && selectedMedicine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cb-blue">
                  Confirm Medicine Reservation
                </span>
                <h3 className="text-base font-black text-cb-navy">
                  {selectedMedicine.brandName} ({selectedMedicine.strength})
                </h3>
              </div>
              <button
                onClick={() => setReserveModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {reserveSuccess ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="text-base font-black text-cb-navy">Medicine Reserved Successfully!</h4>
                <p className="text-xs text-slate-600">
                  Your reservation for <strong>{reserveQuantity} unit(s)</strong> at <strong>{selectedPharmacyForReserve.pharmacyName}</strong> has been confirmed.
                </p>
                <p className="text-[11px] text-slate-400">
                  A pickup SMS and confirmation notification have been sent.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmReservation} className="space-y-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-slate-600">
                  <div className="flex justify-between">
                    <span className="font-medium">Dispensing Pharmacy:</span>
                    <span className="font-bold text-slate-800">{selectedPharmacyForReserve.pharmacyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Pharmacy Contact:</span>
                    <span className="text-slate-800">{selectedPharmacyForReserve.pharmacyPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Estimated Total:</span>
                    <span className="font-black text-cb-navy">
                      ₹{(selectedMedicine.price * reserveQuantity).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Quantity (Units / Strips)</label>
                  <input
                    type="number"
                    min={1}
                    max={selectedPharmacyForReserve.quantity || 10}
                    value={reserveQuantity}
                    onChange={(e) => setReserveQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cb-blue focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Patient Full Name</label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cb-blue focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Contact Mobile Number</label>
                  <input
                    type="tel"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cb-blue focus:outline-none"
                    required
                  />
                </div>

                {selectedMedicine.prescriptionRequired && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Prescription Required:</strong> Please show your physical doctor's prescription or CareBridge digital Rx at the time of pickup or delivery handover.
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setReserveModalOpen(false)}
                    className="flex-1 py-2.5 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-cb-blue hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-md shadow-blue-900/20"
                  >
                    Confirm Reservation
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
