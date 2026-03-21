import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Phone, User, Mail, MapPin, Bike, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { deliveryPartnerService } from '../services/apiService';
import toast from 'react-hot-toast';

const PartnerRegister = () => {
  const [step, setStep] = useState(1); // 1: Details, 2: OTP
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    vehicleType: 'Bike'
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await deliveryPartnerService.sendOTP({ phone: formData.phone });
      toast.success('OTP sent successfully (123456)');
      setStep(2);
    } catch (error) {
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await deliveryPartnerService.verifyOTP({ ...formData, otp });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('partner', JSON.stringify(response.data.partner));
      toast.success('Registration successful!');
      navigate('/partner/dashboard');
    } catch (error) {
      toast.error(error.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-white rounded-[48px] shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Side: Info */}
        <div className="md:w-1/2 bg-primary p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          
          <div className="relative z-10 space-y-8">
            <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-md">
              <Bike className="w-8 h-8" />
            </div>
            <h2 className="text-4xl font-black italic leading-tight">Start Your Journey with Rishi Food</h2>
            <p className="text-white/80 font-medium text-lg">Join India's fastest growing food delivery network and start earning from today.</p>
            
            <div className="space-y-4">
              {[
                'Instant Earnings Withdrawal',
                'Flexible Work Shifts',
                'Accidental Insurance Cover',
                'Performance Bonuses'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  <span className="font-bold text-sm uppercase tracking-wide">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 pt-12 border-t border-white/20">
            <p className="text-white/60 text-sm font-bold uppercase tracking-widest">Secure Registration</p>
            <div className="flex items-center gap-2 mt-2">
              <ShieldCheck className="w-5 h-5" />
              <span className="font-medium">Bank-grade data encryption</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-1/2 p-12 relative">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="text-3xl font-black text-gray-800 italic">Register</h3>
                  <p className="text-gray-500 font-medium">Enter your details to get started.</p>
                </div>

                <form onSubmit={handleSendOTP} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                      <input 
                        required
                        type="text" 
                        placeholder="John Doe"
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                      <input 
                        required
                        type="email" 
                        placeholder="john@example.com"
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Phone</label>
                      <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <input 
                          required
                          type="tel" 
                          placeholder="7067263151"
                          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">City</label>
                      <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <input 
                          required
                          type="text" 
                          placeholder="Mumbai"
                          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
                          value={formData.city}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Vehicle Type</label>
                    <select 
                      className="w-full px-4 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold"
                      value={formData.vehicleType}
                      onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                    >
                      <option value="Bike">Motorbike</option>
                      <option value="Scooter">Scooter</option>
                      <option value="Cycle">Cycle</option>
                    </select>
                  </div>

                  <button 
                    disabled={loading}
                    type="submit"
                    className="w-full bg-primary text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    {loading ? 'Sending OTP...' : 'Continue'} <ArrowRight className="w-5 h-5" />
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <button onClick={() => setStep(1)} className="text-primary font-black text-xs uppercase tracking-widest mb-4 hover:underline">← Back to Details</button>
                  <h3 className="text-3xl font-black text-gray-800 italic">Verify Phone</h3>
                  <p className="text-gray-500 font-medium">Enter the 6-digit OTP sent to {formData.phone}</p>
                </div>

                <form onSubmit={handleVerifyOTP} className="space-y-8">
                  <div className="flex justify-between gap-2">
                    <input 
                      required
                      maxLength="6"
                      type="text" 
                      placeholder="Enter 6-digit OTP"
                      className="w-full px-6 py-5 text-center text-3xl font-black tracking-[1em] rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </div>

                  <button 
                    disabled={loading}
                    type="submit"
                    className="w-full bg-primary text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary-dark transition-all shadow-xl shadow-primary/20"
                  >
                    {loading ? 'Verifying...' : 'Complete Registration'}
                  </button>

                  <div className="text-center">
                    <p className="text-gray-400 font-medium">Didn't receive code?</p>
                    <button type="button" onClick={handleSendOTP} className="text-primary font-black text-xs uppercase tracking-widest hover:underline mt-1">Resend OTP</button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PartnerRegister;
