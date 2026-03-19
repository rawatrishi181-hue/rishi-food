import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SocketProvider } from './context/SocketContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RestaurantDetails from './pages/RestaurantDetails';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import CategoryFoods from './pages/CategoryFoods';
import DeliveryPartnerDashboard from './pages/DeliveryPartnerDashboard';
import Orders from './pages/Orders';
import AdminDashboard from './pages/AdminDashboard';
import Support from './pages/Support';
import AdminSupport from './pages/AdminSupport';
import AdminRestaurants from './pages/AdminRestaurants';
import AdminFood from './pages/AdminFood';
import Notifications from './pages/Notifications';
import SearchResults from './pages/SearchResults';
import NotFound from './pages/NotFound';

// Placeholders for remaining pages
const Admin = () => <div className="p-8"><h1 className="text-2xl font-bold italic text-primary">Admin Dashboard (Coming Soon)</h1></div>;

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center animate-pulse text-primary font-bold">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;

  return children;
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <CartProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-gray-50 flex flex-col">
              <Navbar />
              <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/restaurant/:id" element={<RestaurantDetails />} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                  <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                  <Route path="/search" element={<SearchResults />} />
                  <Route path="/category/:name" element={<CategoryFoods />} />
                  <Route path="/delivery-partners" element={<ProtectedRoute adminOnly><DeliveryPartnerDashboard /></ProtectedRoute>} />
                  <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
                  <Route path="/admin/restaurants" element={<ProtectedRoute adminOnly><AdminRestaurants /></ProtectedRoute>} />
                  <Route path="/admin/food" element={<ProtectedRoute adminOnly><AdminFood /></ProtectedRoute>} />
                  <Route path="/admin/support" element={<ProtectedRoute adminOnly><AdminSupport /></ProtectedRoute>} />
                  <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                  <Route path="/support" element={<Support />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
              <Toaster position="top-right" />
            </div>
          </BrowserRouter>
        </CartProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
