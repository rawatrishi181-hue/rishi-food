import { useState } from 'react';
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

    try {
      if (!user.address) {
        toast.error('Please update your delivery address in profile first');
        navigate('/profile');
        return;
      }

      const response = await orderService.create({
        address: user.address,
        paymentMethod: 'COD' // Default for now
      });

      if (response.success) {
        toast.success('Order placed successfully!');
        await clearCart();
        navigate('/orders');
      }
    } catch (error) {
      toast.error(error || 'Failed to place order');
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
        <h1 className="text-3xl sm:text-4xl font-black text-gray-800 italic tracking-tight">My Food Cart</h1>
        <span className="w-fit bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
          {cart.items.length} Items
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Left Column: Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl sm:rounded-[32px] shadow-xl border border-gray-50 overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-gray-50 flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm sm:text-base">Your Cart Items</h3>
                  <p className="text-[10px] sm:text-xs text-gray-400 font-medium uppercase tracking-widest">{cart.items.length} items selected</p>
                </div>
              </div>
              <button 
                onClick={clearCart}
                className="w-fit text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider"
              >
                <Trash2 className="w-4 h-4" /> Clear Cart
              </button>
            </div>

            <div className="divide-y divide-gray-50">
              {cart.items.map((item) => (
                <div key={item.foodId._id || item.foodId} className="p-6 sm:p-8 flex items-center gap-4 sm:gap-6 group hover:bg-gray-50/30 transition-colors">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl overflow-hidden shadow-md flex-shrink-0">
                    <img 
                      src={item.foodId.image || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80`} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      alt={item.name}
                    />
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <h4 className="font-bold text-sm sm:text-lg text-gray-800 group-hover:text-primary transition-colors truncate">{item.name}</h4>
                      <span className="font-black text-gray-900 text-sm sm:text-base shrink-0">₹{item.price * item.quantity}</span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-widest mb-3 sm:mb-4">₹{item.price} per item</p>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center bg-gray-100 rounded-lg sm:rounded-xl p-0.5 sm:p-1 border border-gray-200 shadow-inner">
                        <button 
                          onClick={() => handleUpdateQuantity(item.foodId._id || item.foodId, item.quantity, -1)}
                          className="p-1 sm:p-1.5 hover:bg-white hover:text-primary rounded-md sm:rounded-lg transition-all text-gray-500"
                        >
                          <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        <span className="w-8 sm:w-10 text-center font-black text-gray-800 text-xs sm:text-base">{item.quantity}</span>
                        <button 
                          onClick={() => handleUpdateQuantity(item.foodId._id || item.foodId, item.quantity, 1)}
                          className="p-1 sm:p-1.5 hover:bg-white hover:text-primary rounded-md sm:rounded-lg transition-all text-gray-500"
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => removeItemFromCart(item.foodId._id || item.foodId)}
                        className="text-gray-300 hover:text-red-500 transition-colors p-2 shrink-0"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-[32px] shadow-lg border border-gray-50 flex items-center gap-4 sm:gap-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-50 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 text-sm sm:text-base">100% Secure Checkout</h4>
              <p className="text-[10px] sm:text-sm text-gray-500 italic">Protected by our safe delivery guarantee.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Bill Details */}
        <div className="space-y-6">
          {/* Coupon Section */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-[32px] shadow-xl border border-gray-50">
            <h3 className="font-bold text-base sm:text-lg mb-4 sm:mb-6 text-gray-800 flex items-center gap-2 italic">
              <Ticket className="w-5 h-5 text-primary" />
              Apply Coupon
            </h3>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Promo Code"
                className="flex-grow px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary uppercase font-bold text-xs sm:text-sm"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={appliedCoupon}
              />
              {appliedCoupon ? (
                <button 
                  onClick={() => { setAppliedCoupon(null); setCouponCode(''); }}
                  className="p-2.5 sm:p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              ) : (
                <button 
                  onClick={handleApplyCoupon}
                  disabled={applying || !couponCode}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-900 text-white rounded-xl font-bold text-xs sm:text-sm hover:bg-black transition-all disabled:opacity-50"
                >
                  Apply
                </button>
              )}
            </div>
            
            {appliedCoupon && (
              <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-100 flex items-center justify-between animate-fadeIn">
                <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest">
                  Applied!
                </span>
                <span className="text-sm font-black text-green-700">-₹{appliedCoupon.discount}</span>
              </div>
            )}
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-[32px] shadow-2xl border border-gray-100 lg:sticky lg:top-24">
            <h3 className="font-black text-xl sm:text-2xl mb-6 sm:mb-8 text-gray-800 flex items-center gap-3 italic">
              <ReceiptText className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              Bill Details
            </h3>

            <div className="space-y-5">
              <div className="flex justify-between text-gray-600 font-medium">
                <span>Item Total</span>
                <span className="text-gray-900">₹{subtotal}</span>
              </div>
              
              {appliedCoupon && (
                <div className="flex justify-between text-green-600 font-bold italic animate-fadeIn">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span>-₹{appliedCoupon.discount}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600 font-medium">
                <span className="flex items-center gap-2">
                  Delivery Fee <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-400">4 KM</span>
                </span>
                <span className="text-gray-900">₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between text-gray-600 font-medium pb-5 border-b border-dashed border-gray-200">
                <span>Govt Taxes (5% GST)</span>
                <span className="text-gray-900">₹{taxes}</span>
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-gray-900 italic tracking-tight">To Pay</span>
                  <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Inclusive of all taxes</span>
                </div>
                <span className="text-3xl font-black text-primary tracking-tighter">₹{grandTotal}</span>
              </div>

              <div className="pt-8 space-y-4">
                <div className="bg-gray-50 p-4 rounded-2xl flex items-start gap-3 border border-gray-100">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Delivering to</span>
                    <span className="text-sm font-bold text-gray-700 line-clamp-2 leading-snug">
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
                
                <p className="text-[10px] text-center text-gray-400 font-medium uppercase tracking-widest pt-2">
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
