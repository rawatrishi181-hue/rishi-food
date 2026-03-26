import { useState, useEffect } from 'react';
import { vendorService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { AdminLayout } from '../components/admin/AdminLayout';
import toast from 'react-hot-toast';

const VendorMenu = () => {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productData, setProductData] = useState({ name: '', price: '', description: '', category: '', image: '' });

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const restRes = await vendorService.getMyRestaurant();
      setRestaurant(restRes.data);
      if (restRes.data?._id) {
        const menuRes = await vendorService.getMenu(restRes.data._id);
        setProducts(menuRes.data);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (!restaurant?._id) {
      toast.error('Restaurant profile missing');
      return;
    }

    if (!productData.name || !productData.price || !productData.category) {
      toast.error('Please fill name, price and category');
      return;
    }

    try {
      await vendorService.addProduct({
        ...productData,
        restaurantId: restaurant._id,
        price: Number(productData.price),
        isAvailable: true
      });
      toast.success('Product added successfully');
      setProductData({ name: '', price: '', description: '', category: '', image: '' });
      fetchMenu();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Add product failed');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" /></div>;
  }

  if (!user || user.role !== 'restaurant') {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold">Vendor access required</h2>
        <p className="mt-3 text-gray-500">Please login as restaurant vendor to access this page.</p>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 sm:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-black">My Menu</h1>
          <p className="text-gray-500">{restaurant?.name || 'Restaurant'} | {restaurant?.city}</p>
        </div>

        <form onSubmit={handleAddProduct} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Name', key: 'name', type: 'text' },
            { label: 'Category', key: 'category', type: 'text' },
            { label: 'Price', key: 'price', type: 'number' },
            { label: 'Image URL', key: 'image', type: 'text' }
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-bold text-gray-700 mb-1">{field.label}</label>
              <input
                value={productData[field.key]}
                onChange={(e) => setProductData({ ...productData, [field.key]: e.target.value })}
                type={field.type}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          ))}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
            <textarea
              value={productData.description}
              onChange={(e) => setProductData({ ...productData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" className="px-6 py-3 bg-primary text-white font-black rounded-xl">Add Product</button>
          </div>
        </form>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {products.length === 0 ? (
            <div className="text-gray-500">No products found. Add your first product.</div>
          ) : (
            products.map((product) => (
              <div key={product._id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <img src={product.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&q=60'} alt={product.name} className="h-40 w-full object-cover rounded-xl mb-3" />
                <h3 className="text-lg font-black text-gray-800">{product.name}</h3>
                <p className="text-gray-500">{product.category}</p>
                <p className="text-primary font-bold text-xl mt-2">₹{product.price}</p>
                <p className="text-gray-500 text-sm mt-2 min-h-[28px]">{product.description || 'No description'}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default VendorMenu;
