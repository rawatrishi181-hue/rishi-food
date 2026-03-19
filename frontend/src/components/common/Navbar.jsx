import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Bell, LogOut, Menu, Search, Package, X, LayoutDashboard, Bike, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Button } from './Button';
import { Logo } from './Logo';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center gap-4">
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link to="/" className="hover:opacity-90 transition-opacity">
              <Logo size="xs" />
            </Link>
          </div>

          {/* Middle: Search (Desktop) */}
          <div className="hidden md:block flex-1 max-w-xl mx-4">
            <form onSubmit={handleSearch} className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search for restaurants or food..."
                className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary font-medium transition-all text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 sm:gap-3">
            {/* Desktop Icons */}
            <div className="hidden sm:flex items-center gap-1 sm:gap-2">
              <Link to="/orders" className="p-2 text-gray-600 hover:text-primary transition-colors" title="My Orders">
                <Package className="w-5 h-5" />
              </Link>
              <Link to="/notifications" className="relative p-2 text-gray-600 hover:text-primary">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 bg-primary text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">0</span>
              </Link>
            </div>

            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-primary">
              <ShoppingCart className="w-6 h-6 sm:w-5 sm:h-5" />
              {itemCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-primary text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center border-2 border-white">
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link to="/profile" className="flex items-center gap-2 group p-1 sm:p-2 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                    <User className="w-4 h-4 text-primary group-hover:text-white" />
                  </div>
                  <span className="text-sm font-bold text-gray-700 hidden lg:block">{user.name}</span>
                </Link>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-gray-600 hover:text-primary transition-colors">
                  {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="hidden sm:flex text-sm font-bold" onClick={() => navigate('/login')}>Login</Button>
                <Button size="sm" className="text-sm font-bold h-9 px-4 rounded-xl" onClick={() => navigate('/register')}>Sign Up</Button>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-gray-600 hover:text-primary transition-colors">
                  {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search & Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-[500px] py-4 border-t border-gray-50' : 'max-h-0'}`}>
          <form onSubmit={handleSearch} className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search food..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Link to="/orders" className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl font-bold text-sm text-gray-700" onClick={() => setIsMenuOpen(false)}>
              <Package className="w-5 h-5 text-primary" /> Orders
            </Link>
            <Link to="/notifications" className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl font-bold text-sm text-gray-700" onClick={() => setIsMenuOpen(false)}>
              <Bell className="w-5 h-5 text-primary" /> Notifications
            </Link>
            <Link to="/profile" className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl font-bold text-sm text-gray-700" onClick={() => setIsMenuOpen(false)}>
              <User className="w-5 h-5 text-primary" /> Profile
            </Link>
            <Link to="/support" className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl font-bold text-sm text-gray-700" onClick={() => setIsMenuOpen(false)}>
              <HelpCircle className="w-5 h-5 text-primary" /> Help
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="flex items-center gap-3 p-3 bg-primary/10 rounded-xl font-bold text-sm text-primary col-span-2" onClick={() => setIsMenuOpen(false)}>
                <LayoutDashboard className="w-5 h-5" /> Admin Dashboard
              </Link>
            )}
          </div>

          {user && (
            <button onClick={logout} className="w-full flex items-center justify-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm transition-colors active:bg-red-100">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
