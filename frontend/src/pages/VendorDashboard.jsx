import { useState, useEffect } from 'react';
import { vendorService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, PlusCircle, ListChecks, MapPin, LogOut } from 'lucide-react';
import { AdminLayout } from '../components/admin/AdminLayout';
import toast from 'react-hot-toast';

const VendorDashboard = () => {
  const { user, logout } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendorData();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('commission_update', (data) => {
        toast.success(`Commission earned: ₹${data.commissionAmount} from order #${data.orderId.slice(-8)}`);
        fetchVendorData(); // Refresh data
      });

      return () => {
        socket.off('commission_update');
      };
    }
  }, [socket]);

  const fetchVendorData = async () => {
    try {
      setLoading(true);
      const [restaurantRes, ordersRes] = await Promise.all([
        vendorService.getMyRestaurant(),
        vendorService.getVendorOrders()
      ]);
      setRestaurant(restaurantRes.data);
      setOrders(ordersRes.data);
    } catch (error) {
      toast.error(error.message || 'Failed to load vendor data');
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" /></div>
    );
  }

  if (!user || user.role !== 'restaurant') {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold">Vendor access required</h2>
        <p className="mt-3 text-gray-500">Please login as restaurant vendor to access this page.</p>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black italic">Vendor Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome {user.name}. Managing <strong>{restaurant?.name || 'your restaurant'}</strong></p>
          </div>
          <div className="flex gap-3">
            <Link to="/vendor/menu" className="rounded-2xl bg-primary text-white px-5 py-3 font-bold">Manage Menu</Link>
            <button onClick={logout} className="rounded-2xl border border-red-200 text-red-600 px-5 py-3 font-bold">Logout</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 text-primary font-black mb-2"><ShoppingBag className="w-5 h-5" /> Orders</div>
            <div className="text-3xl font-black">{orders.length}</div>
            <p className="text-gray-500">Assigned orders</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 text-primary font-black mb-2"><MapPin className="w-5 h-5" /> Restaurant</div>
            <div className="text-3xl font-black">{restaurant?.name || '-'}</div>
            <p className="text-gray-500" title={restaurant?.address}>{restaurant?.address || 'No restaurant profile found'}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 text-primary font-black mb-2"><ListChecks className="w-5 h-5" /> Live Products</div>
            <div className="text-3xl font-black">-</div>
            <p className="text-gray-500">Use Manage Menu to view and add</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 text-green-600 font-black mb-2">💰 Commission</div>
            <div className="text-3xl font-black">₹{orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + (o.commissionAmount || 0), 0)}</div>
            <p className="text-gray-500">Earned from {orders.filter(o => o.status === 'delivered').length} delivered orders</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black">Latest Orders</h2>
            <span className="text-gray-500 text-sm">Updated now</span>
          </div>
          {orders.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No orders found yet.</div>
          ) : (
            <div className="grid gap-3">
              {orders.slice(0, 5).map((order) => (
                <div key={order._id} className="rounded-xl border border-gray-100 p-4 flex justify-between items-center">
                  <div>
                    <p className="font-bold">#{order._id.slice(-8)}</p>
                    <p className="text-sm text-gray-500">{order.userId?.name || 'Guest'} • ₹{order.totalAmount}</p>
                  </div>
                  <span className="text-xs font-black uppercase px-3 py-1 rounded-full text-white" style={{backgroundColor: order.status === 'pending' ? '#f59e0b' : order.status === 'accepted' ? '#22c55e' : order.status === 'preparing' ? '#2563eb' : order.status === 'out_for_delivery' ? '#f97316' : order.status === 'delivered' ? '#65a30d' : '#0ea5e9'}}>{order.status.replace('_',' ')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default VendorDashboard;
