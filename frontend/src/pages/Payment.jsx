import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { paymentService, orderService } from '../services/apiService';
import toast from 'react-hot-toast';
import { 
  CreditCard, Smartphone, Truck, CheckCircle, XCircle, Loader, 
  ArrowLeft, ChevronRight, ShieldCheck, Landmark, Wallet, Plus
} from 'lucide-react';

const Payment = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // UPI, CARD, COD, NETBANKING
  const [selectedUpiApp, setSelectedUpiApp] = useState('GPay');
  const [selectedBank, setSelectedBank] = useState('HDFC');
  const [status, setStatus] = useState(null); // 'SUCCESS' | 'FAILED'

  useEffect(() => {
    if (!orderId || orderId === 'undefined') {
      toast.error('Invalid Order ID');
      navigate('/orders');
      return;
    }
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await orderService.getById(orderId);
      // Backend sendResponse usually wraps data in .data
      const orderData = response.data || response;
      if (!orderData) throw new Error('Order not found');
      setOrder(orderData);
    } catch (error) {
      console.error('Payment Page Error:', error);
      toast.error('Failed to fetch order details');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    try {
      // Professional delay simulation
      await new Promise(resolve => setTimeout(resolve, 2000));

      const response = await paymentService.create({
        orderId,
        amount: order.totalAmount,
        paymentMethod: paymentMethod === 'NETBANKING' ? 'CARD' : paymentMethod // Mapping to backend enum
      });

      const transaction = response.data?.data || response.data || response;
      setStatus(transaction.status);
      
      if (transaction.status === 'SUCCESS') {
        toast.success('Payment Successful!');
        setTimeout(() => navigate('/orders'), 3000);
      } else {
        toast.error('Payment Failed! Please try again.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Payment failed');
      setStatus('FAILED');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6">
        <div className="relative">
          <Loader className="w-16 h-16 text-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-primary/50" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-gray-800 dark:text-white">Securing your transaction...</p>
          <p className="text-gray-500 mt-2">Please do not refresh or close this page.</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <XCircle className="w-16 h-16 text-red-500" />
        <p className="text-xl font-bold text-gray-800 dark:text-white">Order not found</p>
        <button onClick={() => navigate('/orders')} className="text-primary font-bold underline">Go to My Orders</button>
      </div>
    );
  }

  if (status) {
    return (
      <div className="max-w-xl mx-auto mt-12 animate-fadeIn">
        <div className="bg-white dark:bg-gray-800 rounded-[32px] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className={`p-12 text-center ${status === 'SUCCESS' ? 'bg-green-50/50 dark:bg-green-900/10' : 'bg-red-50/50 dark:bg-red-900/10'}`}>
            {status === 'SUCCESS' ? (
              <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 scale-up">
                <CheckCircle className="w-14 h-14 text-green-500" />
              </div>
            ) : (
              <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6 scale-up">
                <XCircle className="w-14 h-14 text-red-500" />
              </div>
            )}
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 italic">
              {status === 'SUCCESS' ? 'Payment Successful!' : 'Payment Failed'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              {status === 'SUCCESS' 
                ? 'Your order has been confirmed and sent to the kitchen.' 
                : 'Something went wrong with the transaction. Your money is safe.'}
            </p>
          </div>

          <div className="p-8 space-y-6">
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-dashed border-gray-200 dark:border-gray-700">
              <div className="flex justify-between mb-2">
                <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Transaction ID</span>
                <span className="font-mono text-sm font-bold text-gray-800 dark:text-white">TXN{Date.now()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Amount Paid</span>
                <span className="text-xl font-black text-primary italic">₹{order.totalAmount}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => status === 'SUCCESS' ? navigate('/orders') : setStatus(null)}
                className="w-full py-4 bg-primary text-white rounded-2xl font-black italic tracking-tight hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 active:scale-95"
              >
                {status === 'SUCCESS' ? 'Track My Order' : 'Try Another Method'}
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full py-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fadeIn">
      <div className="flex items-center gap-4 mb-10">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:text-primary transition-all group"
        >
          <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-800 dark:text-white italic tracking-tight">Checkout</h1>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1">Order #{orderId.slice(-8).toUpperCase()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Payment Options (8 columns) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-[32px] shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="flex border-b border-gray-100 dark:border-gray-700">
              {[
                { id: 'UPI', icon: Smartphone, label: 'UPI' },
                { id: 'CARD', icon: CreditCard, label: 'Cards' },
                { id: 'NETBANKING', icon: Landmark, label: 'Banking' },
                { id: 'COD', icon: Truck, label: 'Cash' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setPaymentMethod(tab.id)}
                  className={`flex-1 py-6 flex flex-col items-center gap-2 transition-all relative ${
                    paymentMethod === tab.id 
                      ? 'text-primary bg-primary/5' 
                      : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <tab.icon className={`w-6 h-6 ${paymentMethod === tab.id ? 'animate-bounce' : ''}`} />
                  <span className="font-black text-xs uppercase tracking-widest">{tab.label}</span>
                  {paymentMethod === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full mx-4" />
                  )}
                </button>
              ))}
            </div>

            <div className="p-8 min-h-[300px]">
              {paymentMethod === 'UPI' && (
                <div className="space-y-6 animate-fadeIn">
                  <h3 className="font-black text-gray-800 dark:text-white italic">Select UPI App</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { id: 'GPay', name: 'Google Pay', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg' },
                      { id: 'PhonePe', name: 'PhonePe', logo: 'https://download.logo.wine/logo/PhonePe/PhonePe-Logo.wine.svg' },
                      { id: 'Paytm', name: 'Paytm', logo: 'https://download.logo.wine/logo/Paytm/Paytm-Logo.wine.svg' },
                      { id: 'AmazonPay', name: 'Amazon Pay', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Amazon_Pay_logo.svg' }
                    ].map((app) => (
                      <button
                        key={app.id}
                        onClick={() => setSelectedUpiApp(app.id)}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 h-32 justify-center ${
                          selectedUpiApp === app.id 
                            ? 'border-primary bg-primary/5 ring-4 ring-primary/10' 
                            : 'border-gray-100 dark:border-gray-700 hover:border-gray-200'
                        }`}
                      >
                        <div className="w-14 h-14 flex items-center justify-center p-1 bg-white dark:bg-gray-100 rounded-xl shadow-sm overflow-hidden">
                          <img 
                            src={app.logo} 
                            alt={app.name} 
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${app.id}&background=random&color=fff&bold=true`;
                            }}
                          />
                        </div>
                        <span className="font-bold text-[10px] uppercase tracking-wider text-gray-600 dark:text-gray-300">{app.name}</span>
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-400 font-bold">@</span>
                    </div>
                    <input 
                      type="text" 
                      placeholder="Enter UPI ID (e.g. user@okaxis)"
                      className="w-full pl-10 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary focus:bg-white transition-all font-bold"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'CARD' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex justify-between items-center">
                    <h3 className="font-black text-gray-800 dark:text-white italic">Card Details</h3>
                    <div className="flex gap-2">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4 opacity-60" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 opacity-60" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/Rupay-Logo.png" alt="RuPay" className="h-4 opacity-60" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Card Number"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary focus:bg-white transition-all font-bold tracking-[0.2em]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        placeholder="MM / YY"
                        className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary focus:bg-white transition-all font-bold"
                      />
                      <input 
                        type="password" 
                        placeholder="CVV"
                        className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary focus:bg-white transition-all font-bold"
                      />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Card Holder Name"
                      className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary focus:bg-white transition-all font-bold"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'NETBANKING' && (
                <div className="space-y-6 animate-fadeIn">
                  <h3 className="font-black text-gray-800 dark:text-white italic">Popular Banks</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      { id: 'HDFC', name: 'HDFC Bank', logo: 'https://www.vectorlogo.zone/logos/hdfcbank/hdfcbank-ar21.svg' },
                      { id: 'SBI', name: 'SBI', logo: 'https://www.vectorlogo.zone/logos/statebankofindia/statebankofindia-icon.svg' },
                      { id: 'ICICI', name: 'ICICI Bank', logo: 'https://www.vectorlogo.zone/logos/icicibank/icicibank-ar21.svg' },
                      { id: 'AXIS', name: 'Axis Bank', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Axis_Bank_logo.svg' },
                      { id: 'KOTAK', name: 'Kotak Bank', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Kotak_Mahindra_Bank_logo.svg/1200px-Kotak_Mahindra_Bank_logo.svg.png' },
                      { id: 'PNB', name: 'PNB', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Punjab_National_Bank_logo.svg' }
                    ].map((bank) => (
                      <button
                        key={bank.id}
                        onClick={() => setSelectedBank(bank.id)}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 h-24 justify-center ${
                          selectedBank === bank.id 
                            ? 'border-primary bg-primary/5 ring-4 ring-primary/10' 
                            : 'border-gray-100 dark:border-gray-700 hover:border-gray-200'
                        }`}
                      >
                        <div className="w-full h-10 flex items-center justify-center p-1 bg-white rounded-lg shadow-sm">
                          <img 
                            src={bank.logo} 
                            alt={bank.name} 
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${bank.id}&background=random&color=fff&bold=true`;
                            }}
                          />
                        </div>
                        <span className="font-bold text-[9px] uppercase tracking-tighter text-gray-500">{bank.name}</span>
                      </button>
                    ))}
                  </div>
                  <button className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-gray-400 font-bold hover:text-primary hover:border-primary transition-all flex items-center justify-center gap-2">
                    <Plus className="w-5 h-5" /> View All Other Banks
                  </button>
                </div>
              )}

              {paymentMethod === 'COD' && (
                <div className="flex flex-col items-center justify-center text-center space-y-6 py-10 animate-fadeIn">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                    <Truck className="w-12 h-12 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-800 dark:text-white italic">Cash On Delivery</h3>
                    <p className="text-gray-500 max-w-xs mx-auto mt-2">Pay the delivery partner in cash or via QR code at your doorstep.</p>
                  </div>
                  <div className="px-6 py-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl text-xs font-bold border border-amber-100 dark:border-amber-800">
                    ⚠️ Additional ₹10 handling fee may apply
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">Secure Payment</p>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">256-bit SSL Encryption</p>
                </div>
              </div>
              <button
                onClick={handlePayment}
                disabled={processing}
                className={`px-10 py-4 rounded-2xl font-black italic tracking-tight text-white shadow-2xl transition-all active:scale-95 flex items-center gap-3 ${
                  processing 
                    ? 'bg-primary/70 cursor-not-allowed' 
                    : 'bg-primary hover:bg-primary-dark shadow-primary/30'
                }`}
              >
                {processing ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Pay ₹{order.totalAmount}</span>
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Order Summary (4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-[32px] shadow-2xl border border-gray-100 dark:border-gray-700 p-8">
            <h3 className="text-xl font-black text-gray-800 dark:text-white mb-8 italic flex items-center gap-3">
              <Wallet className="w-6 h-6 text-primary" />
              Order Summary
            </h3>
            
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center group">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-primary transition-colors line-clamp-1">{item.name}</span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Qty: {item.quantity}</span>
                  </div>
                  <span className="font-black text-gray-900 dark:text-white italic">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-dashed border-gray-200 dark:border-gray-700 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Item Total</span>
                <span className="font-bold text-gray-800 dark:text-gray-200">₹{order.totalAmount - (order.deliveryFee || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Delivery Fee</span>
                <span className="font-bold text-gray-800 dark:text-gray-200">₹{order.deliveryFee || 0}</span>
              </div>
              <div className="flex justify-between items-center pt-4">
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-gray-900 dark:text-white italic tracking-tighter leading-none">To Pay</span>
                  <span className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">Inclusive of GST</span>
                </div>
                <span className="text-4xl font-black text-primary tracking-tighter italic">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/10 rounded-[32px] p-6 text-center">
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Rishi Food Guarantee</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium italic leading-relaxed">
              Your payment is processed securely. We never store your full card details or UPI PIN.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
