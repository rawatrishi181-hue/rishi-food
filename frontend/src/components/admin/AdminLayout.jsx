import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingBag, Utensils, Users, 
  Ticket, HelpCircle, Bike, LogOut, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../common/Logo';

export const AdminLayout = ({ children }) => {
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', icon: <LayoutDashboard />, label: 'Dashboard', path: '/admin' },
    { id: 'orders', icon: <ShoppingBag />, label: 'Orders', path: '/orders' }, // Reusing main orders for now
    { id: 'restaurants', icon: <Utensils />, label: 'Restaurants', path: '/admin/restaurants' },
    { id: 'food', icon: <Utensils />, label: 'Food Menu', path: '/admin/food' },
    { id: 'riders', icon: <Bike />, label: 'Delivery Partners', path: '/delivery-partners' },
    { id: 'coupons', icon: <Ticket />, label: 'Coupons', path: '/admin/coupons' },
    { id: 'support', icon: <HelpCircle />, label: 'Support Tickets', path: '/admin/support' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-100 flex flex-col sticky top-0 h-screen">
        <div className="p-8">
          <Logo size="sm" />
          <div className="mt-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/5 px-2 py-1 rounded">Admin Portal</span>
          </div>
        </div>

        <nav className="flex-grow px-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center justify-between px-6 py-4 rounded-2xl font-black italic tracking-tight transition-all group ${
                location.pathname === item.path 
                  ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105' 
                  : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={location.pathname === item.path ? 'text-white' : 'text-gray-300 group-hover:text-primary transition-colors'}>
                  {item.icon}
                </span>
                {item.label}
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${location.pathname === item.path ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
            </Link>
          ))}
        </nav>

        <div className="p-6 mt-auto">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black italic tracking-tight text-red-400 hover:bg-red-50 hover:text-red-500 transition-all"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-grow overflow-y-auto">
        {children}
      </main>
    </div>
  );
};
