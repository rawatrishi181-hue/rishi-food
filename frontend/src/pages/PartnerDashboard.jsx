import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bike, 
  Wallet, 
  ShoppingBag, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ArrowRight,
  User as UserIcon,
  LogOut,
  Bell
} from 'lucide-react';
import { deliveryPartnerService } from '../services/apiService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const PartnerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available'); // 'available', 'active', 'completed'
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await deliveryPartnerService.getDashboard();
      setData(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard');
      if (error.response?.status === 401) navigate('/partner/register');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      await deliveryPartnerService.acceptOrder({ orderId });
      toast.success('Order accepted! Head to the restaurant.');
      fetchDashboardData();
      setActiveTab('active');
    } catch (error) {
      toast.error(error.message || 'Failed to accept order');
    }
  };

  const handleCompleteDelivery = async (orderId) => {
    try {
      await deliveryPartnerService.completeDelivery({ orderId });
      toast.success('Delivery completed! Earnings added.');
      fetchDashboardData();
      setActiveTab('completed');
    } catch (error) {
      toast.error(error.message || 'Failed to complete delivery');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('partner');
    navigate('/partner');
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  const { partner, availableOrders, activeOrders, completedOrders } = data;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-72 bg-white border-r border-gray-100 flex flex-col p-6 space-y-10">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white">
            <Bike className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black italic tracking-tight">Fleet<span className="text-primary">Hub</span></span>
        </div>

        <nav className="flex-grow space-y-2">
          {[
            { id: 'dashboard', icon: <TrendingUp className="w-5 h-5" />, label: 'Dashboard' },
            { id: 'orders', icon: <ShoppingBag className="w-5 h-5" />, label: 'My Deliveries' },
            { id: 'earnings', icon: <Wallet className="w-5 h-5" />, label: 'Earnings' },
            { id: 'profile', icon: <UserIcon className="w-5 h-5" />, label: 'Profile' },
          ].map((item) => (
            <button 
              key={item.id}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all ${
                item.id === 'dashboard' ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-gray-50'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-4 px-4 py-4 rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-grow p-6 md:p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-black text-gray-800 italic">Welcome back, {partner.name}!</h1>
            <p className="text-gray-500 font-medium italic">You are currently <span className="text-green-600 font-bold">Online</span></p>
          </div>
          <button className="relative p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
            <Bell className="w-6 h-6 text-gray-400" />
            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white" />
          </button>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[
            { label: 'Today\'s Earnings', value: `₹${partner.earnings.weekly}`, icon: <Wallet className="text-blue-600" />, bg: 'bg-blue-50' },
            { label: 'Total Deliveries', value: partner.totalDeliveries, icon: <CheckCircle2 className="text-green-600" />, bg: 'bg-green-50' },
            { label: 'Current Rating', value: partner.rating, icon: <Star className="text-yellow-600" fillCurrent={true} />, bg: 'bg-yellow-50' }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-50 flex items-center gap-6"
            >
              <div className={`${stat.bg} w-16 h-16 rounded-2xl flex items-center justify-center`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-gray-800">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Orders Section */}
        <div className="bg-white rounded-[40px] shadow-sm border border-gray-50 overflow-hidden">
          <div className="flex border-b border-gray-50">
            {[
              { id: 'available', label: 'Available Orders', count: availableOrders.length },
              { id: 'active', label: 'Active Tasks', count: activeOrders.length },
              { id: 'completed', label: 'History', count: completedOrders.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-6 font-black text-sm uppercase tracking-widest transition-all relative ${
                  activeTab === tab.id ? 'text-primary' : 'text-gray-400'
                }`}
              >
                {tab.label} ({tab.count})
                {activeTab === tab.id && (
                  <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />
                )}
              </button>
            ))}
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'available' && (
                <motion.div 
                  key="available"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {availableOrders.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                      <p className="text-gray-400 font-bold italic">No orders available right now.</p>
                    </div>
                  ) : (
                    availableOrders.map((order) => (
                      <div key={order._id} className="flex flex-col md:flex-row items-center justify-between p-6 rounded-[24px] bg-gray-50 border border-gray-100 gap-6">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden">
                            <img src={order.restaurantId?.image} className="w-full h-full object-cover" alt="Restaurant" />
                          </div>
                          <div>
                            <h4 className="font-black text-gray-800 italic">{order.restaurantId?.name}</h4>
                            <p className="text-gray-500 text-sm font-medium flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-primary" /> {order.restaurantId?.address}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-8">
                          <div className="text-right">
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Delivery Fee</p>
                            <p className="text-xl font-black text-primary italic">₹40</p>
                          </div>
                          <button 
                            onClick={() => handleAcceptOrder(order._id)}
                            className="bg-primary text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20"
                          >
                            Accept Order
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </motion.div>
              )}

              {activeTab === 'active' && (
                <motion.div 
                  key="active"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {activeOrders.map((order) => (
                    <div key={order._id} className="p-8 rounded-[32px] bg-primary text-white shadow-xl shadow-primary/20 space-y-8">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                          <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                            <Clock className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Ongoing Delivery</p>
                            <h4 className="text-xl font-black italic">Pick up from {order.restaurantId?.name}</h4>
                          </div>
                        </div>
                        <span className="bg-white text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">In Progress</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/10">
                        <div className="space-y-4">
                          <div className="flex gap-4">
                            <div className="w-1.5 h-full bg-white/20 rounded-full relative">
                              <div className="absolute top-0 w-full h-1/2 bg-white rounded-full" />
                            </div>
                            <div className="space-y-6">
                              <div>
                                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Pickup Address</p>
                                <p className="font-bold">{order.restaurantId?.address}</p>
                              </div>
                              <div>
                                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Delivery Address</p>
                                <p className="font-bold">{order.deliveryAddress?.street}, {order.deliveryAddress?.city}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col justify-end items-end gap-4">
                          <button 
                            onClick={() => handleCompleteDelivery(order._id)}
                            className="w-full md:w-auto bg-white text-primary px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-black/10 flex items-center justify-center gap-2"
                          >
                            Mark as Delivered <CheckCircle2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

const Star = ({ className, fillCurrent }) => (
  <svg className={className} viewBox="0 0 24 24" fill={fillCurrent ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

export default PartnerDashboard;
