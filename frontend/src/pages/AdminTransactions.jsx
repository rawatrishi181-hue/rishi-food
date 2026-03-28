import { useState, useEffect } from 'react';
import { adminService } from '../services/apiService';
import toast from 'react-hot-toast';
import { Search, Filter, Download, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, CreditCard, Smartphone, Truck, RefreshCw } from 'lucide-react';

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [page, status]);

  const fetchTransactions = async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    setLoading(true);
    try {
      const response = await adminService.getTransactions({
        page,
        limit: 10,
        search,
        status
      });
      // Corrected data access: response is { success, message, data }
      // where data is { transactions, pagination }
      setTransactions(response.data.transactions || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      console.error('Fetch Transactions Error:', error);
      toast.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold flex items-center w-fit">
            <CheckCircle className="mr-1 w-3 h-3" /> SUCCESS
          </span>
        );
      case 'FAILED':
        return (
          <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold flex items-center w-fit">
            <XCircle className="mr-1 w-3 h-3" /> FAILED
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 text-xs font-bold flex items-center w-fit">
            <Clock className="mr-1 w-3 h-3" /> PENDING
          </span>
        );
    }
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'UPI': return <Smartphone className="text-purple-500 w-4 h-4" />;
      case 'CARD': return <CreditCard className="text-blue-500 w-4 h-4" />;
      case 'COD': return <Truck className="text-amber-500 w-4 h-4" />;
      default: return null;
    }
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(new Date(dateString));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Transaction Logs</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 italic">Monitor all payment activity across Rishi Food</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchTransactions(true)}
            disabled={isRefreshing}
            className={`p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button className="flex items-center px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20">
            <Download className="mr-2 w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 grid grid-cols-1 md:grid-cols-4 gap-4">
        <form onSubmit={handleSearch} className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search Transaction ID or User..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-900 dark:text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-900 dark:text-white appearance-none"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>
        <button
          onClick={handleSearch}
          className="bg-gray-900 dark:bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-all font-semibold"
        >
          Apply Filters
        </button>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Order Details</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading && !isRefreshing ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="7" className="px-6 py-4 h-16 bg-gray-50/50 dark:bg-gray-800/50"></td>
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500 italic">No transactions found matching your criteria.</td>
                </tr>
              ) : (
                transactions.map((txn) => (
                  <tr key={txn._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-all">
                    <td className="px-6 py-4 font-mono text-sm text-gray-900 dark:text-white">#{txn.transactionId}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 dark:text-white">{txn.userId?.name || 'Unknown User'}</span>
                        <span className="text-xs text-gray-500 italic">{txn.userId?.email || 'No Email'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Order #{txn.orderId?._id?.slice(-6).toUpperCase()}</span>
                        <span className="text-xs text-primary">{txn.orderId?.status || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">₹{txn.amount}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getMethodIcon(txn.paymentMethod)}
                        <span className="text-sm font-medium">{txn.paymentMethod}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(txn.status)}</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-500">
                      {formatDate(txn.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Showing <span className="font-bold">{((page - 1) * 10) + 1}</span> to <span className="font-bold">{Math.min(page * 10, pagination.total)}</span> of <span className="font-bold">{pagination.total}</span> transactions
            </span>
            <div className="flex space-x-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className={`p-2 rounded-lg border border-gray-200 dark:border-gray-700 transition-all ${page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 shadow-sm'}`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                disabled={page === pagination.pages}
                onClick={() => setPage(p => p + 1)}
                className={`p-2 rounded-lg border border-gray-200 dark:border-gray-700 transition-all ${page === pagination.pages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 shadow-sm'}`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTransactions;
