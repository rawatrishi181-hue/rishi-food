import { useState, useEffect } from 'react';
import { adminService } from '../services/apiService';
import { AdminLayout } from '../components/admin/AdminLayout';
import { Search, FileText, Download } from 'lucide-react';
import { Button } from '../components/common/Button';
import toast from 'react-hot-toast';

const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await adminService.getOrdersReport(params.toString());
      const data = response?.data?.data || response?.data || response;
      setOrders(data?.orders || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const downloadCSV = () => {
    const csvRows = [];
    const headers = ['Order ID', 'User', 'Restaurant', 'Total Amount', 'Status', 'Created At'];
    csvRows.push(headers.join(','));

    orders.forEach((o) => {
      const row = [
        `"${o._id}"`,
        `"${o.userId?.name || 'N/A'}"`,
        `"${o.restaurantId?.name || 'N/A'}"`,
        o.totalAmount,
        o.status,
        formatDate(o.createdAt)
      ];
      csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'admin-orders-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-black text-gray-800 italic tracking-tight">Admin <span className="text-primary">Orders</span></h1>
            <p className="text-gray-500 font-medium italic">Filter and manage all orders with date ranges and status.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={downloadCSV} className="gap-2 px-4 py-3"><Download className="w-4 h-4" /> Export CSV</Button>
          </div>
        </div>

        <form onSubmit={handleSearch} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-8 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-xs text-gray-500 uppercase font-black tracking-widest mb-1">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
              <option value="">All</option>
              <option value="placed">Placed</option>
              <option value="accepted">Accepted</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 uppercase font-black tracking-widest mb-1">Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
          </div>

          <div>
            <label className="block text-xs text-gray-500 uppercase font-black tracking-widest mb-1">End Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
          </div>

          <div className="md:col-span-2 flex gap-2">
            <Button variant="secondary" onClick={() => { setStatus(''); setStartDate(''); setEndDate(''); fetchOrders(); }} className="w-full">Reset</Button>
            <Button type="submit" className="w-full gap-2"><Search className="w-4 h-4" /> Search</Button>
          </div>
        </form>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-x-auto">
          {loading ? (
            <div className="p-16 text-center text-gray-500">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="p-16 text-center text-gray-500">No orders match current filters.</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="p-4 text-left font-black uppercase tracking-widest">Order ID</th>
                  <th className="p-4 text-left font-black uppercase tracking-widest">User</th>
                  <th className="p-4 text-left font-black uppercase tracking-widest">Restaurant</th>
                  <th className="p-4 text-left font-black uppercase tracking-widest">Amount</th>
                  <th className="p-4 text-left font-black uppercase tracking-widest">Status</th>
                  <th className="p-4 text-left font-black uppercase tracking-widest">Created</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-mono text-xs">{order._id}</td>
                    <td className="p-4">{order.userId?.name || 'Guest'}</td>
                    <td className="p-4">{order.restaurantId?.name || '-'}</td>
                    <td className="p-4">₹{order.totalAmount}</td>
                    <td className="p-4 font-black uppercase text-xs">{order.status.replace('_', ' ')}</td>
                    <td className="p-4">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
