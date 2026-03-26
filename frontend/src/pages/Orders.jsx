import { useState, useEffect } from 'react';
import { orderService } from '../services/apiService';
import { Button } from '../components/common/Button';
import { ShoppingBag, Clock, MapPin, ChevronRight, Package, CheckCircle2, Truck, XCircle, AlertCircle, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('order_status_update', (data) => {
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === data.orderId ? { ...order, status: data.status } : order
          )
        );
        toast.success(`Order ${data.status.replace(/_/g, ' ')}!`);
      });

      return () => socket.off('order_status_update');
    }
  }, [socket]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getMyOrders();
      setOrders(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await orderService.cancel(orderId);
      toast.success('Order cancelled successfully');
      fetchOrders();
    } catch (error) {
      toast.error(error || 'Failed to cancel order');
    }
  };

  const getStatusDetails = (status) => {
    const statuses = {
      placed: { icon: <Package className="w-5 h-5" />, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Order Placed' },
      accepted: { icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-indigo-500', bg: 'bg-indigo-50', label: 'Accepted' },
      preparing: { icon: <Clock className="w-5 h-5" />, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Preparing' },
      ready: { icon: <Package className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-50', label: 'Ready' },
      out_for_delivery: { icon: <Truck className="w-5 h-5" />, color: 'text-orange-500', bg: 'bg-orange-50', label: 'Out for Delivery' },
      delivered: { icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-100', label: 'Delivered' },
      cancelled: { icon: <XCircle className="w-5 h-5" />, color: 'text-red-500', bg: 'bg-red-50', label: 'Cancelled' },
    };
    return statuses[status] || statuses.placed;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-500 italic">Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 px-4 animate-fadeIn">
        <div className="bg-white p-12 rounded-[40px] shadow-xl border border-gray-50 flex flex-col items-center">
          <div className="w-40 h-40 bg-gray-50 rounded-full flex items-center justify-center mb-8">
            <ShoppingBag className="w-20 h-20 text-gray-200" />
          </div>
          <h2 className="text-3xl font-black text-gray-800 mb-4 italic">No orders yet</h2>
          <p className="text-gray-500 mb-10 max-w-sm leading-relaxed">
            You haven't placed any orders yet. Explore our menu and order some delicious food!
          </p>
          <Link to="/">
            <Button className="px-10 py-4 rounded-2xl shadow-lg shadow-primary/20 font-bold tracking-tight">
              Order Now
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-fadeIn px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-800 dark:text-gray-100 italic tracking-tight">My Orders</h1>
        <span className="w-fit bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
          {orders.length} Total
        </span>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {orders.map((order) => {
          const statusInfo = getStatusDetails(order.status);
          return (
            <div key={order._id} className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-[32px] shadow-xl border border-gray-50 dark:border-gray-700 overflow-hidden group">
              {/* Order Header */}
              <div className="p-5 sm:p-8 border-b border-gray-50 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/30 dark:bg-gray-700/30">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl overflow-hidden shadow-md shrink-0">
                    <img 
                      src={order.restaurantId?.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=300&q=80'} 
                      className="w-full h-full object-cover"
                      alt={order.restaurantId?.name}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-gray-800 dark:text-gray-100 tracking-tight group-hover:text-primary transition-colors line-clamp-1">
                      {order.restaurantId?.name || 'Restaurant'}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1 mt-0.5 sm:mt-1">
                      <Clock className="w-3 h-3" /> {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                
                <div className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-wider ${statusInfo.bg} ${statusInfo.color} border border-current/10 shrink-0`}>
                  {statusInfo.icon}
                  {statusInfo.label}
                </div>
              </div>

              {/* Order Items */}
              <div className="p-5 sm:p-8">
                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-[10px] font-black text-gray-500 dark:text-gray-400 shrink-0">{item.quantity}x</span>
                        <span className="font-bold text-gray-700 dark:text-gray-300 text-sm sm:text-base truncate">{item.name}</span>
                      </div>
                      <span className="font-black text-gray-900 dark:text-gray-100 text-sm sm:text-base shrink-0">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-5 sm:pt-6 border-t border-dashed border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary/60 shrink-0" />
                    <span className="line-clamp-1">{order.address}</span>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full md:w-auto">
                    <div className="flex flex-col sm:text-right">
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest">Total Amount</span>
                      <span className="text-xl sm:text-2xl font-black text-primary tracking-tighter">₹{order.totalAmount}</span>
                    </div>
                    
                    {order.status === 'placed' && (
                      <button 
                        onClick={() => handleCancelOrder(order._id)}
                        className="bg-red-50 text-red-500 px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-100"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
