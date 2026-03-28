import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/apiService';
import { Button } from '../components/common/Button';
import { User, Mail, Phone, MapPin, Save, UserCircle, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    profileImage: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        profileImage: user.profileImage || ''
      });
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authService.updateProfile(user._id, formData);
      setUser(response.data);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-fadeIn px-4 sm:px-0">
      <div className="flex items-center gap-4 mb-8 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-800 dark:text-gray-100 italic tracking-tight">My Profile</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
        {/* Profile Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl sm:rounded-[32px] shadow-xl border border-gray-50 dark:border-gray-700 flex flex-col items-center text-center">
            <div className="relative group cursor-pointer" onClick={() => document.getElementById('profileImageInput').click()}>
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-primary/10 rounded-full flex items-center justify-center mb-4 sm:mb-6 border-4 border-white shadow-lg overflow-hidden transition-all duration-300 group-hover:opacity-80">
                {formData.profileImage ? (
                  <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle className="w-16 h-16 sm:w-20 sm:h-20 text-primary" />
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full mb-4 sm:mb-6 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs font-bold">Change Photo</span>
              </div>
              <input 
                type="file" 
                id="profileImageInput" 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageChange} 
              />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">{user.name}</h3>
            <p className="text-[10px] sm:text-sm text-gray-400 dark:text-gray-500 font-medium uppercase tracking-widest mt-1">{user.role}</p>
            
            <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-50 dark:border-gray-700 w-full space-y-3 sm:space-y-4">
              <div className="flex items-center justify-center sm:justify-start gap-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span>{user.phone || 'No phone set'}</span>
              </div>
            </div>

            <div className="mt-8 w-full">
              <Link 
                to="/profile/transactions"
                className="flex items-center justify-center gap-3 w-full py-4 bg-gray-50 dark:bg-gray-700 hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary transition-all rounded-2xl border border-gray-100 dark:border-gray-600 group"
              >
                <CreditCard className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                <span className="font-bold text-sm tracking-tight italic">Transaction History</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Update Form */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-800 p-6 sm:p-10 rounded-2xl sm:rounded-[40px] shadow-2xl border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl sm:text-2xl font-black text-gray-800 dark:text-gray-100 mb-6 sm:mb-8 italic flex items-center gap-3">
              <Save className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              Edit Account Info
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 sm:w-5 sm:h-5" />
                    <input 
                      type="text"
                      className="w-full pl-11 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 border border-gray-100 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-gray-700 transition-all font-medium text-gray-700 text-sm"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 sm:w-5 sm:h-5" />
                    <input 
                      type="email"
                      className="w-full pl-11 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 border border-gray-100 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-gray-700 transition-all font-medium text-gray-700 disabled:opacity-50 text-sm"
                      value={formData.email}
                      disabled
                    />
                  </div>
                </div>
              </div>

              <div>
                  <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 sm:w-5 sm:h-5" />
                  <input 
                    type="tel"
                    className="w-full pl-11 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 border border-gray-100 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-gray-700 transition-all font-medium text-gray-700 text-sm"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Delivery Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 text-gray-400 dark:text-gray-500 w-4 h-4 sm:w-5 sm:h-5" />
                  <textarea 
                    className="w-full pl-11 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 border border-gray-100 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-gray-700 transition-all font-medium text-gray-700 min-h-[100px] text-sm"
                    placeholder="Enter your complete address for faster delivery"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
                <p className="mt-2 text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-500 font-medium italic">
                  * Providing an accurate address helps our riders reach you faster.
                </p>
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  loading={loading}
                  className="w-full sm:w-auto px-10 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl shadow-xl shadow-primary/20 font-bold tracking-tight text-sm sm:text-base"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
