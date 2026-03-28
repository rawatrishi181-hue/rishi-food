import { useState, useEffect } from 'react';
import { paymentService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Clock, Smartphone, CreditCard, Truck, ArrowLeft, Loader, Calendar, Hash } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const UserTransactions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id) {
      fetchUserTransactions();
    }
  }, [user?._id]);

  const fetchUserTransactions = async () => {
    setLoading(true);
    try {
      const response = await paymentService.getUserTransactions(user._id);
      // Corrected data access: response is { success, message, data }
      // where data is the transactions array
      setTransactions(response.data || []);
    } catch (error) {
      console.error('Fetch User Transactions Error:', error);
      toast.error('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold flex items-center">
            <CheckCircle className="mr-1 w-3 h-3" /> SUCCESS
          </span>
        );
      case 'FAILED':
        return (
          <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold flex items-center">
            <XCircle className="mr-1 w-3 h-3" /> FAILED
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 text-xs font-bold flex items-center">
            <Clock className="mr-1 w-3 h-3" /> PENDING
          </span>
        );
    }
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'UPI': return <Smartphone className="text-purple-500 w-5 h-5" />;
      case 'CARD': return <CreditCard className="text-blue-500 w-5 h-5" />;
      case 'COD': return <Truck className="text-amber-500 w-5 h-5" />;
      default: return null;
    }
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(dateString));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center space-x-4 mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-100 dark:border-gray-700 hover:text-primary transition-all"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Transaction History</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 italic">Track all your payments and their status</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
          <Loader className="w-12 h-12 text-primary animate-spin" />
          <p className="text-gray-500 animate-pulse font-medium">Loading history...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <CreditCard className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Transactions Yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs mx-auto">You haven't made any payments on Rishi Food yet. Your transactions will appear here.</p>
          <Link 
            to="/" 
            className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
          >
            Explore Food
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((txn) => (
            <div 
              key={txn._id} 
              className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner transition-colors ${
                    txn.status === 'SUCCESS' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
                  }`}>
                    {getMethodIcon(txn.paymentMethod)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-lg text-gray-900 dark:text-white">₹{txn.amount}</span>
                      <span className="text-gray-300 dark:text-gray-600">•</span>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{txn.paymentMethod}</span>
                    </div>
                    <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center"><Hash className="mr-1 w-3 h-3" /> {txn.transactionId}</span>
                      <span className="flex items-center"><Calendar className="mr-1 w-3 h-3" /> {formatDate(txn.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 border-t md:border-t-0 pt-3 md:pt-0">
                  {getStatusBadge(txn.status)}
                  <Link 
                    to={`/orders`}
                    className="text-xs font-bold text-primary hover:text-primary-dark underline underline-offset-4 decoration-2 transition-all"
                  >
                    View Order
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserTransactions;
