import { useState, useEffect } from 'react';
import { adminService } from '../services/apiService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  TrendingUp, Users, ShoppingBag, DollarSign, 
  CheckCircle, XCircle, Clock, Search, Bell, User, Utensils
} from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminLayout } from '../components/admin/AdminLayout';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    activeOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0
  });
  const [salesData, setSalesData] = useState([]);
  const [distributionData, setDistributionData] = useState([]);
  const [revenueTrendData, setRevenueTrendData] = useState([]);
  const [topFoods, setTopFoods] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, salesRes, distRes, ordersRes] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getSalesData(),
        adminService.getOrdersDistribution(),
        adminService.getRecentOrders()
      ]);

      console.log('Dashboard Data:', { statsRes, salesRes, distRes, ordersRes });

      if (statsRes && statsRes.data) {
        const d = statsRes.data;
        setStats({
          activeOrders: d.activeOrders || 0,
          completedOrders: d.completedOrders || 0,
          cancelledOrders: d.cancelledOrders || 0,
          totalRevenue: d.totalRevenue || 0,
          totalUsers: d.totalUsers || 0
        });
      }

      if (salesRes && salesRes.data) {
        setSalesData(salesRes.data);
      }

      if (distRes && distRes.data) {
        setDistributionData(distRes.data.map(item => ({
          name: item._id || 'Unknown',
          value: item.count || 0
        })));
      }

      if (ordersRes && ordersRes.data) {
        setRecentOrders(ordersRes.data);
      }

      const topFoodsRes = await adminService.getTopFoods();
      if (topFoodsRes && topFoodsRes.data) {
        setTopFoods(topFoodsRes.data || []);
      }

      const revenueRes = await adminService.getRevenueTrend();
      if (revenueRes && revenueRes.data) {
        setRevenueTrendData(revenueRes.data.map(item => ({
          month: `${item._id.month}/${item._id.year}`,
          totalRevenue: item.totalRevenue,
          orderCount: item.orderCount
        })));
      }

    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#e81d2d', '#2d2d2d', '#ffc107', '#4caf50'];

  if (loading) return (
    <div className="flex justify-center items-center h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="p-4 sm:p-8 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-800 italic tracking-tight">Admin Dashboard</h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] sm:text-xs mt-1">Real-time Business Overview</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchDashboardData} className="p-3 bg-white border border-gray-100 rounded-2xl shadow-lg hover:bg-gray-50 transition-all group">
              <Search className={`w-5 h-5 text-gray-400 group-hover:text-primary ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className="bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20">
              <span className="text-primary font-black italic text-sm">LIVE UPDATES</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-10 sm:mb-12">
          <StatCard title="Active Orders" value={stats.activeOrders} icon={<Clock className="w-6 h-6 text-blue-500" />} color="blue" />
          <StatCard title="Total Users" value={stats.totalUsers} icon={<Users className="w-6 h-6 text-purple-500" />} color="purple" />
          <StatCard title="Completed" value={stats.completedOrders} icon={<CheckCircle className="w-6 h-6 text-green-500" />} color="green" />
          <StatCard title="Cancelled" value={stats.cancelledOrders} icon={<XCircle className="w-6 h-6 text-red-500" />} color="red" />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 mb-12">
          <div className="xl:col-span-2 bg-white p-6 sm:p-8 rounded-2xl sm:rounded-[40px] shadow-2xl border border-gray-100">
            <h3 className="text-xl font-black text-gray-800 mb-8 italic flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-primary" />
              Sales Performance
            </h3>
            <div className="h-[300px] sm:h-[400px] w-full">
              {salesData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500 font-bold">Koi sales data nahi mila (pichle 30 din mein)</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                    <Legend verticalAlign="top" height={36} />
                    <Line type="monotone" dataKey="sales" name="Orders" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#FF3008" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-[40px] shadow-2xl border border-gray-100">
            <h3 className="text-xl font-black text-gray-800 mb-8 italic flex items-center gap-3">
              <ShoppingBag className="w-6 h-6 text-primary" />
              Order Types
            </h3>
            <div className="h-[300px] sm:h-[350px] w-full">
              {distributionData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500 font-bold">Koi order type data nahi mila</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={distributionData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={8} dataKey="value">
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: 600, fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-[40px] shadow-2xl border border-gray-100">
            <h3 className="text-xl font-black text-gray-800 mb-8 italic flex items-center gap-3">
              <DollarSign className="w-6 h-6 text-primary" />
              Monthly Revenue
            </h3>
            <div className="h-[300px] sm:h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                  <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                  <Legend />
                  <Bar dataKey="totalRevenue" name="Revenue" fill="#14b8a6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="orderCount" name="Orders" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Foods Chart */}
        <div className="mb-12">
          <h3 className="text-xl font-black text-gray-800 mb-6 italic flex items-center gap-3">
            <Utensils className="w-6 h-6 text-primary" />
            Top Foods Chart (Popularity)
          </h3>
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
            {topFoods.length === 0 ? (
              <div className="h-60 flex items-center justify-center text-gray-500 font-bold">No top food data available</div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topFoods.map((food, index) => ({ name: food.name || `Item ${index+1}`, totalSold: food.totalSold || 0 }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="totalSold" fill="#2563eb" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Top Food Cards */}
        <div className="mb-12">
          <h3 className="text-xl font-black text-gray-800 mb-6 italic flex items-center gap-3">
            <Utensils className="w-6 h-6 text-primary" />
            Top Selling Foods
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(topFoods.length ? topFoods : [{ _id:'none', name:'No Data', totalSold: 0, totalRevenue: 0 }]).map((item, idx) => (
               <div key={item._id || idx} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-lg hover:shadow-2xl transition-all">
                 <h4 className="text-lg font-black text-gray-800 mb-2 truncate">{item.name || 'No food name'}</h4>
                 <p className="text-xs text-gray-500 mb-4">Sold: <span className="font-black">{item.totalSold ?? 0}</span></p>
                 <p className="text-gray-600">Revenue: <span className="font-black">₹{item.totalRevenue ?? 0}</span></p>
                 <div className="mt-4 py-2 px-3 bg-gray-50 text-xs font-black uppercase tracking-widest rounded-full text-primary">Rank {idx + 1}</div>
               </div>
            ))}
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-[40px] shadow-2xl border border-gray-100 mb-12 overflow-hidden">
          <h3 className="text-xl font-black text-gray-800 mb-8 italic flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-primary" />
            Recent Orders
          </h3>
          <div className="overflow-x-auto -mx-6 sm:mx-0">
            <div className="inline-block min-w-full align-middle px-6 sm:px-0">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                    <th className="pb-4 pr-4">Order ID</th>
                    <th className="pb-4 pr-4">Customer</th>
                    <th className="pb-4 pr-4 hidden sm:table-cell">Restaurant</th>
                    <th className="pb-4 pr-4">Amount</th>
                    <th className="pb-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="group hover:bg-gray-50/50 transition-colors text-sm sm:text-base">
                      <td className="py-4 pr-4 text-[10px] sm:text-xs font-bold text-gray-400">#{order._id.slice(-6).toUpperCase()}</td>
                      <td className="py-4 pr-4 font-bold text-gray-700 truncate max-w-[100px] sm:max-w-none">{order.userId?.name || 'Guest'}</td>
                      <td className="py-4 pr-4 font-medium text-gray-500 italic hidden sm:table-cell">{order.restaurantId?.name}</td>
                      <td className="py-4 pr-4 font-black text-gray-800">₹{order.totalAmount}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-tighter whitespace-nowrap ${
                          order.status === 'delivered' ? 'bg-green-50 text-green-600' :
                          order.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    primary: 'bg-primary/5 text-primary border-primary/10'
  };

  return (
    <div className="bg-white p-8 rounded-[32px] shadow-xl border border-gray-50 card-hover flex flex-col items-center text-center group">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border transition-transform group-hover:rotate-12 ${colorMap[color]}`}>
        {icon}
      </div>
      <p className="text-xs text-gray-400 font-black uppercase tracking-widest mb-2">{title}</p>
      <h4 className="text-3xl font-black text-gray-800 tracking-tighter">{value}</h4>
    </div>
  );
};

export default AdminDashboard;
