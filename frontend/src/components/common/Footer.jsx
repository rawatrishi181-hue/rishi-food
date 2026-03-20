import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Send, Apple, PlayCircle, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { Logo } from './Logo';
import { useState } from 'react';
import { commonService } from '../../services/apiService';
import toast from 'react-hot-toast';

export const Footer = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    
    setLoading(true);
    try {
      await commonService.subscribeNewsletter(email);
      toast.success('Subscribed successfully!');
      setEmail('');
    } catch (error) {
      toast.error(error || 'Subscription failed');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { name: 'Pizza', path: '/category/pizza' },
    { name: 'Burgers', path: '/category/burgers' },
    { name: 'Sushi', path: '/category/sushi' },
    { name: 'Desserts', path: '/category/desserts' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 sm:pt-16 pb-8 sm:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 mb-12 sm:mb-16">
          
          {/* Company Info */}
          <div className="space-y-6 text-center sm:text-left">
            <Link to="/" className="hover:opacity-90 transition-opacity inline-block sm:block">
              <Logo theme="light" size="xs" />
            </Link>
            <p className="text-sm leading-relaxed text-gray-400 font-medium italic max-w-xs mx-auto sm:mx-0">
              Experience the best food delivery in your city. Fresh ingredients, expert chefs, and lightning-fast delivery to your doorstep.
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 group">
                <Facebook className="w-5 h-5 group-hover:scale-110" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 group">
                <Instagram className="w-5 h-5 group-hover:scale-110" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 group">
                <Twitter className="w-5 h-5 group-hover:scale-110" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center sm:text-left hidden sm:block">
            <h4 className="text-white font-black text-lg mb-6 uppercase tracking-widest italic">Quick Links</h4>
            <ul className="space-y-4">
              <li><Link to="/" className="hover:text-primary transition-colors flex items-center justify-center sm:justify-start gap-2 font-medium text-sm">Home</Link></li>
              <li><Link to="/cart" className="hover:text-primary transition-colors flex items-center justify-center sm:justify-start gap-2 font-medium text-sm">My Cart</Link></li>
              <li><Link to="/orders" className="hover:text-primary transition-colors flex items-center justify-center sm:justify-start gap-2 font-medium text-sm">My Orders</Link></li>
              <li><Link to="/support" className="hover:text-primary transition-colors flex items-center justify-center sm:justify-start gap-2 font-medium text-sm">Help & Support</Link></li>
              <li><Link to="/profile" className="hover:text-primary transition-colors flex items-center justify-center sm:justify-start gap-2 font-medium text-sm">My Profile</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="text-center sm:text-left">
            <h4 className="text-white font-black text-lg mb-6 uppercase tracking-widest italic">Categories</h4>
            <ul className="space-y-4 font-medium text-sm">
              {categories.map((cat) => (
                <li key={cat.name}>
                  <Link to={cat.path} className="hover:text-primary transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-6 text-center sm:text-left">
            <h4 className="text-white font-black text-lg mb-6 uppercase tracking-widest italic">Contact Us</h4>
            <div className="space-y-4 text-sm font-medium">
              <a 
                href="https://www.google.com/maps/search/?api=1&query=123+Food+Street+Tasty+City" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center sm:justify-start gap-3 hover:text-primary transition-colors"
              >
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span>123 Food Street, Tasty City</span>
              </a>
              <a href="tel:+917067263151" className="flex items-center justify-center sm:justify-start gap-3 hover:text-primary transition-colors">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span>+91 70672 63151</span>
              </a>
              <a href="mailto:rawatrishi181@gmail.com" className="flex items-center justify-center sm:justify-start gap-3 hover:text-primary transition-colors">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span>rawatrishi181@gmail.com</span>
              </a>
            </div>
            
            <div className="pt-4 max-w-xs mx-auto sm:mx-0">
              <form onSubmit={handleSubscribe} className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your Email"
                  className="w-full bg-gray-800 border-none rounded-xl py-3 pl-4 pr-12 text-sm text-gray-200 focus:ring-2 focus:ring-primary placeholder:text-gray-500 font-medium"
                />
                <button 
                  type="submit"
                  disabled={loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary p-1.5 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* App Download Section */}
        <div className="border-y border-gray-800 py-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h5 className="text-white font-bold text-lg mb-1">Get the RishiFood App</h5>
            <p className="text-gray-500 text-sm font-medium italic">Available on iOS and Android</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer" className="bg-gray-800 text-white px-4 sm:px-6 py-2.5 rounded-xl flex items-center gap-3 hover:bg-gray-700 transition-all border border-gray-700">
              <Apple className="w-5 h-5 sm:w-6 sm:h-6" />
              <div className="text-left">
                <p className="text-[9px] sm:text-[10px] uppercase font-bold leading-none opacity-60">App Store</p>
                <p className="text-xs sm:text-sm font-black leading-none mt-1">Download</p>
              </div>
            </a>
            <a href="https://play.google.com" target="_blank" rel="noopener noreferrer" className="bg-gray-800 text-white px-4 sm:px-6 py-2.5 rounded-xl flex items-center gap-3 hover:bg-gray-700 transition-all border border-gray-700">
              <PlayCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              <div className="text-left">
                <p className="text-[9px] sm:text-[10px] uppercase font-bold leading-none opacity-60">Google Play</p>
                <p className="text-xs sm:text-sm font-black leading-none mt-1">Get it on</p>
              </div>
            </a>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-bold uppercase tracking-widest text-gray-500">
          <p>© 2026 RISHIFOOD. ALL RIGHTS RESERVED.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
