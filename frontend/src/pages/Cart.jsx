import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, MapPin, ReceiptText, ShieldCheck, Ticket, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { orderService, couponService } from '../services/apiService';

const Cart = () => {
  const { cart, loading, updateItemQuantity, removeItemFromCart, clearCart, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [applying, setApplying] = useState(false);

  // Auto-remove deleted items from cart
  useEffect(() => {
    if (!cart.items || cart.items.length === 0) return;
    
    const deletedItems = cart.items.filter(item => {
      const foodRef = item.foodId || {};
      const foodId = typeof foodRef === 'object' ? foodRef._id : foodRef;
      return !foodId;
    });

    if (deletedItems.length > 0) {
      deletedItems.forEach(item => removeItemFromCart(item.foodId));
      toast.error(`${deletedItems.length} item(s) removed - no longer available`);
    }
  }, []);

  const handleUpdateQuantity = async (foodId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    try {
      await updateItemQuantity(foodId, newQty);
      // Reset coupon if quantity changes
      setAppliedCoupon(null);
    } catch (error) {
      // Error handled by context
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return toast.error('Please enter a coupon code');
    setApplying(true);
    try {
      const response = await couponService.apply(couponCode, cart.totalAmount);
      setAppliedCoupon(response.data);
      toast.success('Coupon applied successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid coupon code');
    } finally {
      setApplying(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error('Please Login to place your order');
      navigate('/login');
      return;
    }

    if (!user.address) {
      toast.error('Please update your delivery address in profile first');
      navigate('/profile');
      return;
    }

    try {
      const response = await orderService.create({
        address: user.address,
        paymentMethod: 'ONLINE' // Set to ONLINE if we want to show payment page
      });

      console.log('Order Creation Response:', response);

      const apiSuccess = response?.success || false;
      // Extract the order data correctly - response is { success, message, data }
      const orderData = response?.data; 

      if (apiSuccess && orderData) {
        toast.success('Order placed successfully!');
        await clearCart();
        
        // Handle both single order and array of orders
        const finalOrderId = Array.isArray(orderData) ? orderData[0]._id : orderData._id;
        
        if (finalOrderId) {
          console.log('Navigating to payment for order:', finalOrderId);
          navigate(`/payment/${finalOrderId}`);
        } else {
          console.error('No Order ID found in response:', orderData);
          navigate('/orders');
        }
        return;
      }

      toast.error(response?.message || 'Failed to place order, please try again');
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to place order';
      toast.error(errorMessage);
      console.error('Order placement error:', error);
    }
  };

  if (loading && cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-500 italic">Preparing your cart...</p>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 px-4 animate-fadeIn">
        <div className="bg-white p-12 rounded-[40px] shadow-xl border border-gray-50 flex flex-col items-center">
          <div className="w-40 h-40 bg-gray-50 rounded-full flex items-center justify-center mb-8">
            <ShoppingBag className="w-20 h-20 text-gray-200" />
          </div>
          <h2 className="text-3xl font-black text-gray-800 mb-4 italic">Your cart is empty</h2>
          <p className="text-gray-500 mb-10 max-w-sm leading-relaxed">
            Good food is always cooking! Go ahead, order some yummy items from the menu.
          </p>
          <Link to="/">
            <Button className="px-10 py-4 rounded-2xl shadow-lg shadow-primary/20 font-bold tracking-tight">
              Browse Restaurants
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Bill calculations
  const subtotal = cart.totalAmount;
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const deliveryFee = 40;
  const taxableAmount = subtotal - discount;
  const taxes = Math.round(taxableAmount * 0.05); // 5% GST
  const grandTotal = taxableAmount + deliveryFee + taxes;

  return (
    <div className="max-w-7xl mx-auto pb-20 px-4 sm:px-0 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-800 dark:text-gray-100 italic tracking-tight">My Food Cart</h1>
        <span className="w-fit bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
          {cart.items.length} Items
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Left Column: Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-[32px] shadow-xl border border-gray-50 dark:border-gray-700 overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-gray-50 dark:border-gray-700 flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center bg-gray-50/50 dark:bg-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm sm:text-base">Your Cart Items</h3>
                  <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-widest">{cart.items.length} items selected</p>
                </div>
              </div>
              <button 
                onClick={clearCart}
                className="w-fit text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider"
              >
                <Trash2 className="w-4 h-4" /> Clear Cart
              </button>
            </div>

            <div className="divide-y divide-gray-50 dark:divide-gray-700">
              {cart.items.map((item, idx) => {
                const foodRef = item.foodId || {};
                const foodId = typeof foodRef === 'object' ? foodRef._id : foodRef;
                const foodImage = typeof foodRef === 'object' ? foodRef.image : null;
                
                return (
                  <div key={foodId || idx} className="p-6 sm:p-8 flex items-center gap-4 sm:gap-6 group hover:bg-gray-50/30 dark:hover:bg-gray-700/30 transition-colors">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl overflow-hidden shadow-md flex-shrink-0">
                      <img 
                        src={foodImage || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80`} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        alt={item.name}
                      />
                    </div>
                    
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-start mb-1 gap-2">
                        <h4 className="font-bold text-sm sm:text-lg text-gray-800 dark:text-gray-100 group-hover:text-primary transition-colors truncate">{item.name}</h4>
                        <span className="font-black text-gray-900 dark:text-gray-100 text-sm sm:text-base shrink-0">₹{item.price * item.quantity}</span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mb-3 sm:mb-4">₹{item.price} per item</p>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg sm:rounded-xl p-0.5 sm:p-1 border border-gray-200 dark:border-gray-600 shadow-inner">
                          <button 
                            onClick={() => handleUpdateQuantity(foodId, item.quantity, -1)}
                            className="p-1 sm:p-1.5 hover:bg-white dark:hover:bg-gray-600 hover:text-primary rounded-md sm:rounded-lg transition-all text-gray-500 dark:text-gray-400"
                          >
                            <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <span className="w-8 sm:w-10 text-center font-black text-gray-800 dark:text-gray-100 text-xs sm:text-base">{item.quantity}</span>
                          <button 
                            onClick={() => handleUpdateQuantity(foodId, item.quantity, 1)}
                            className="p-1 sm:p-1.5 hover:bg-white dark:hover:bg-gray-600 hover:text-primary rounded-md sm:rounded-lg transition-all text-gray-500 dark:text-gray-400"
                          >
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => removeItemFromCart(foodId)}
                          className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors p-2 shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl sm:rounded-[32px] shadow-lg border border-gray-50 dark:border-gray-700 flex items-center gap-4 sm:gap-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-50 dark:bg-green-900/30 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm sm:text-base">100% Secure Checkout</h4>
              <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400 italic">Protected by our safe delivery guarantee.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Bill Details */}
        <div className="space-y-6">
          {/* Coupon Section */}
          <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl sm:rounded-[32px] shadow-xl border border-gray-50 dark:border-gray-700">
            <h3 className="font-bold text-base sm:text-lg mb-4 sm:mb-6 text-gray-800 dark:text-gray-100 flex items-center gap-2 italic">
              <Ticket className="w-5 h-5 text-primary" />
              Apply Coupon
            </h3>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Promo Code"
                className="flex-grow px-4 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary uppercase font-bold text-xs sm:text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={appliedCoupon}
              />
              {appliedCoupon ? (
                <button 
                  onClick={() => { setAppliedCoupon(null); setCouponCode(''); }}
                  className="p-2.5 sm:p-3 bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              ) : (
                <button 
                  onClick={handleApplyCoupon}
                  disabled={applying || !couponCode}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-900 dark:bg-primary text-white rounded-xl font-bold text-xs sm:text-sm hover:bg-black dark:hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  Apply
                </button>
              )}
            </div>
            
            {appliedCoupon && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/30 rounded-xl border border-green-100 dark:border-green-800 flex items-center justify-between animate-fadeIn">
                <span className="text-[10px] font-bold text-green-700 dark:text-green-400 uppercase tracking-widest">
                  Applied!
                </span>
                <span className="text-sm font-black text-green-700 dark:text-green-400">-₹{appliedCoupon.discount}</span>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl sm:rounded-[32px] shadow-2xl border border-gray-100 dark:border-gray-700 lg:sticky lg:top-24">
            <h3 className="font-black text-xl sm:text-2xl mb-6 sm:mb-8 text-gray-800 dark:text-gray-100 flex items-center gap-3 italic">
              <ReceiptText className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              Bill Details
            </h3>

            <div className="space-y-5">
              <div className="flex justify-between text-gray-600 dark:text-gray-400 font-medium">
                <span>Item Total</span>
                <span className="text-gray-900 dark:text-gray-100">₹{subtotal}</span>
              </div>
              
              {appliedCoupon && (
                <div className="flex justify-between text-green-600 dark:text-green-400 font-bold italic animate-fadeIn">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span>-₹{appliedCoupon.discount}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600 dark:text-gray-400 font-medium">
                <span className="flex items-center gap-2">
                  Delivery Fee <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-400 dark:text-gray-500">4 KM</span>
                </span>
                <span className="text-gray-900 dark:text-gray-100">₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400 font-medium pb-5 border-b border-dashed border-gray-200 dark:border-gray-700">
                <span>Govt Taxes (5% GST)</span>
                <span className="text-gray-900 dark:text-gray-100">₹{taxes}</span>
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-gray-900 dark:text-gray-100 italic tracking-tight">To Pay</span>
                  <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Inclusive of all taxes</span>
                </div>
                <span className="text-3xl font-black text-primary tracking-tighter">₹{grandTotal}</span>
              </div>

              <div className="pt-8 space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-2xl flex items-start gap-3 border border-gray-100 dark:border-gray-600">
                  <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest mb-1">Delivering to</span>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200 line-clamp-2 leading-snug">
                      {user.address || 'Please set your address in profile'}
                    </span>
                  </div>
                </div>

                <Button 
                  onClick={handlePlaceOrder}
                  className="w-full py-5 rounded-2xl shadow-xl shadow-primary/30 flex items-center justify-center gap-3 group transition-all hover:translate-y-[-2px]"
                >
                  <span className="font-black text-lg tracking-tight italic">Confirm Order</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <p className="text-[10px] text-center text-gray-400 dark:text-gray-500 font-medium uppercase tracking-widest pt-2">
                  By placing the order, you agree to our Terms of Service
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
