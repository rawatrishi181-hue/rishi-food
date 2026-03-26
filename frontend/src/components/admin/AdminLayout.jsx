import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingBag, Utensils, Users, 
  Ticket, HelpCircle, Bike, LogOut, ChevronRight, Menu, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../common/Logo';

export const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', icon: <LayoutDashboard />, label: 'Dashboard', path: '/admin' },
    { id: 'orders', icon: <ShoppingBag />, label: 'Orders', path: '/admin/orders' },
    { id: 'restaurants', icon: <Utensils />, label: 'Restaurants', path: '/admin/restaurants' },
    { id: 'vendors', icon: <Users />, label: 'Vendors', path: '/admin/vendors' },
    { id: 'food', icon: <Utensils />, label: 'Food Menu', path: '/admin/food' },
    { id: 'riders', icon: <Bike />, label: 'Delivery Partners', path: '/delivery-partners' },
    { id: 'coupons', icon: <Ticket />, label: 'Coupons', path: '/admin/coupons' },
    { id: 'support', icon: <HelpCircle />, label: 'Support Tickets', path: '/admin/support' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Mobile topbar */}
      <div className="w-full md:hidden bg-white border-b border-slate-100 p-3 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen((prev) => !prev)} className="p-2 rounded-lg border border-slate-200">
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Logo size="xs" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Admin</span>
          </div>
          <button onClick={logout} className="text-sm font-bold text-red-500">Logout</button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-white border-r border-slate-200 shadow-lg shadow-slate-100 flex flex-col transition-transform duration-300 md:static md:translate-x-0 md:h-screen md:shadow-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="px-8 py-6 border-b border-slate-100">
          <Logo size="sm" />
          <div className="mt-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">Admin Portal</span>
          </div>
        </div>

        <nav className="flex-grow px-4 py-5 space-y-2">
          {menuItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`group flex items-center justify-between pr-4 pl-3 py-3 rounded-xl border-l-4 transition duration-200 ${
                  active 
                    ? 'bg-primary/15 text-primary border-primary shadow-sm' 
                    : 'text-slate-600 border-transparent hover:bg-slate-100 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`${active ? 'text-primary' : 'text-slate-400 group-hover:text-primary'} transition-colors`}>
                    {item.icon}
                  </span>
                  <span className="text-sm font-semibold tracking-wide">{item.label}</span>
                </div>
                <ChevronRight className={`w-4 h-4 text-slate-400 ${active ? 'text-primary' : 'group-hover:text-primary'}`} />
              </Link>
            );
          })}
        </nav>

        <div className="p-6 mt-auto border-t border-slate-100">
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-grow overflow-y-auto bg-slate-50">
        {children}
      </main>
    </div>
  );
};
