import { useState, useEffect } from 'react';
import { deliveryPartnerService } from '../services/apiService';
import { Button } from '../components/common/Button';
import { User, Phone, Mail, Bike, Search, Plus, Star, MapPin, MoreVertical, ShieldCheck, X } from 'lucide-react';
import toast from 'react-hot-toast';

import { AdminLayout } from '../components/admin/AdminLayout';

const DeliveryPartnerDashboard = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPartner, setNewPartner] = useState({
    name: '', email: '', phone: '', vehicleType: 'Bike', licenseNumber: '', image: ''
  });

  useEffect(() => {
    fetchPartners();
  }, [statusFilter]);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const response = await deliveryPartnerService.getAll({ status: statusFilter });
      setPartners(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to fetch partners');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Offline' : 'Active';
    try {
      await deliveryPartnerService.update(id, { status: nextStatus });
      toast.success(`Partner is now ${nextStatus}`);
      fetchPartners();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleAddPartner = async (e) => {
    e.preventDefault();
    try {
      await deliveryPartnerService.create(newPartner);
      toast.success('New delivery partner added!');
      setShowAddModal(false);
      setNewPartner({ name: '', email: '', phone: '', vehicleType: 'Bike', licenseNumber: '', image: '' });
      fetchPartners();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add partner');
    }
  };

  const filteredPartners = partners.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <AdminLayout><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="p-8 max-w-7xl mx-auto pb-20 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-gray-800 italic tracking-tight mb-2">Delivery <span className="text-primary">Partners</span></h1>
            <p className="text-gray-500 font-medium italic">Manage and track your delivery fleet efficiently.</p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="gap-2 px-8 py-4 rounded-2xl shadow-xl shadow-primary/20">
            <Plus className="w-5 h-5" /> Add New Partner
          </Button>
        </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search partners by name..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium text-gray-700 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="bg-white border border-gray-100 rounded-2xl px-6 py-3 font-bold text-gray-700 shadow-sm focus:ring-2 focus:ring-primary outline-none"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Offline">Offline</option>
          <option value="Busy">Busy</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
      ) : filteredPartners.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200 shadow-sm">
          <Bike className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-bold italic text-xl">No delivery partners found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredPartners.map((partner) => (
            <div key={partner._id} className="bg-white rounded-[32px] p-6 shadow-xl border border-gray-50 card-hover group relative">
              <button className="absolute top-6 right-6 text-gray-300 hover:text-primary transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    <img 
                      src={partner.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${partner.name}`} 
                      className="w-full h-full object-cover"
                      alt={partner.name}
                    />
                  </div>
                  <div className={`absolute bottom-1 right-1 w-6 h-6 border-4 border-white rounded-full ${
                    partner.status === 'Active' ? 'bg-green-500' : 
                    partner.status === 'Busy' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`} />
                </div>
                <h3 className="text-xl font-black text-gray-800 tracking-tight">{partner.name}</h3>
                <div className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                  <Bike className="w-3.5 h-3.5" /> {partner.vehicleType}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 font-medium italic">Deliveries</span>
                  <span className="font-black text-gray-800">{partner.totalDeliveries || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 font-medium italic">Rating</span>
                  <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-lg font-black text-xs">
                    {partner.rating} <Star className="w-3 h-3 fill-current" />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-50 flex flex-col gap-3">
                <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                  <Phone className="w-4 h-4 text-primary" /> {partner.phone}
                </div>
                <Button 
                  variant={partner.status === 'Active' ? 'outline' : 'primary'}
                  size="sm"
                  className="w-full rounded-xl font-bold uppercase tracking-widest text-[10px] py-3"
                  onClick={() => handleToggleStatus(partner._id, partner.status)}
                  disabled={partner.status === 'Busy'}
                >
                  {partner.status === 'Active' ? 'Go Offline' : 'Go Online'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-xl p-10 shadow-2xl relative animate-fadeIn">
            <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 text-gray-400 hover:text-red-500 transition-colors">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-3xl font-black text-gray-800 mb-8 italic flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-primary" />
              Register Partner
            </h2>
            <form onSubmit={handleAddPartner} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                  <input required className="w-full px-5 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary font-medium" 
                    value={newPartner.name} onChange={(e) => setNewPartner({...newPartner, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Email</label>
                  <input type="email" required className="w-full px-5 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary font-medium" 
                    value={newPartner.email} onChange={(e) => setNewPartner({...newPartner, email: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Phone</label>
                  <input required className="w-full px-5 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary font-medium" 
                    value={newPartner.phone} onChange={(e) => setNewPartner({...newPartner, phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Vehicle Type</label>
                  <select className="w-full px-5 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold" 
                    value={newPartner.vehicleType} onChange={(e) => setNewPartner({...newPartner, vehicleType: e.target.value})}>
                    <option>Bike</option>
                    <option>Scooter</option>
                    <option>Cycle</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">License Number</label>
                <input required className="w-full px-5 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary font-medium" 
                  value={newPartner.licenseNumber} onChange={(e) => setNewPartner({...newPartner, licenseNumber: e.target.value})} />
              </div>
              <Button type="submit" className="w-full py-5 rounded-2xl shadow-xl shadow-primary/20 font-black italic text-lg tracking-tight mt-4">
                Verify & Add Partner
              </Button>
            </form>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  );
};

export default DeliveryPartnerDashboard;
