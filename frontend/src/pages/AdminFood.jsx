import { useState, useEffect } from 'react';
import api from '../services/api';
import { AdminLayout } from '../components/admin/AdminLayout';
import { Button } from '../components/common/Button';
import { 
  Plus, Search, Edit2, Trash2, Tag, 
  Utensils, X, Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminFood = () => {
  const [foods, setFoods] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', category: '', 
    restaurantId: '', image: '', isAvailable: true
  });

  useEffect(() => {
    fetchFoods();
    fetchRestaurants();
  }, []);

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const response = await api.get('/foods');
      setFoods(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch food items');
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const response = await api.get('/restaurants');
      setRestaurants(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch restaurants');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/foods/${editingId}`, formData);
        toast.success('Food item updated successfully');
      } else {
        await api.post('/foods', formData);
        toast.success('Food item added successfully');
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({ name: '', description: '', price: '', category: '', restaurantId: '', image: '', isAvailable: true });
      fetchFoods();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save food item');
    }
  };

  const handleEdit = (food) => {
    setFormData({
      name: food.name,
      description: food.description,
      price: food.price,
      category: food.category,
      restaurantId: food.restaurantId?._id || food.restaurantId,
      image: food.image,
      isAvailable: food.isAvailable ?? true
    });
    setEditingId(food._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this food item?')) return;
    try {
      await api.delete(`/foods/${id}`);
      toast.success('Food item deleted successfully');
      fetchFoods();
    } catch (error) {
      toast.error('Failed to delete food item');
    }
  };

  const filteredFoods = foods.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-gray-800 italic tracking-tight mb-2">Manage <span className="text-primary">Food Menu</span></h1>
            <p className="text-gray-500 font-medium italic">Update dish prices, availability and details.</p>
          </div>
          <Button onClick={() => { setEditingId(null); setFormData({ name: '', description: '', price: '', category: '', restaurantId: '', image: '', isAvailable: true }); setShowModal(true); }} className="gap-2 px-8 py-4 rounded-2xl shadow-xl shadow-primary/20">
            <Plus className="w-5 h-5" /> Add Food Item
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by dish name or category..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary shadow-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl animate-fadeIn">
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-2xl font-black text-gray-800 italic">{editingId ? 'Edit' : 'Add'} <span className="text-primary">Food Item</span></h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 grid grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
                <div className="col-span-2">
                  <label className="block text-sm font-black text-gray-700 uppercase tracking-widest mb-2">Dish Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary font-medium"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-black text-gray-700 uppercase tracking-widest mb-2">Description</label>
                  <textarea 
                    rows="2"
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary font-medium"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-black text-gray-700 uppercase tracking-widest mb-2">Price (₹)</label>
                  <input 
                    required
                    type="number" 
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary font-medium"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-gray-700 uppercase tracking-widest mb-2">Category</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary font-medium"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-black text-gray-700 uppercase tracking-widest mb-2">Restaurant</label>
                  <select 
                    required
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary font-medium appearance-none"
                    value={formData.restaurantId}
                    onChange={(e) => setFormData({...formData, restaurantId: e.target.value})}
                  >
                    <option value="">Select Restaurant</option>
                    {restaurants.map(r => (
                      <option key={r._id} value={r._id}>{r.name} - {r.city}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-black text-gray-700 uppercase tracking-widest mb-2">Image URL</label>
                  <input 
                    type="url" 
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary font-medium"
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                  />
                </div>

                <div className="col-span-2 flex items-center gap-3">
                  <input 
                    type="checkbox"
                    id="isAvailable"
                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
                  />
                  <label htmlFor="isAvailable" className="text-sm font-black text-gray-700 uppercase tracking-widest">In Stock / Available</label>
                </div>

                <div className="col-span-2 flex gap-4 pt-4">
                  <Button type="submit" className="flex-grow py-5 rounded-2xl shadow-xl shadow-primary/20">
                    {editingId ? 'Update' : 'Save'} Food Item
                  </Button>
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-8 py-5 bg-gray-100 text-gray-500 font-black uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredFoods.map((food) => (
              <div key={food._id} className="bg-white rounded-[32px] overflow-hidden border border-gray-50 shadow-xl flex flex-col group card-hover">
                <div className="h-48 overflow-hidden relative">
                  <img src={food.image || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={food.name} />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl font-black text-xs text-primary shadow-lg uppercase tracking-widest">
                    ₹{food.price}
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-black text-gray-800 italic tracking-tight">{food.name}</h3>
                    <span className="bg-gray-100 text-gray-400 px-2 py-0.5 rounded-lg font-bold text-[10px] uppercase tracking-widest">{food.category}</span>
                  </div>
                  <p className="text-xs text-primary font-black uppercase tracking-tighter mb-1">{food.restaurantId?.name || 'Restaurant'}</p>
                  <p className="text-sm text-gray-400 font-medium italic line-clamp-2 mb-6">{food.description}</p>
                  
                  <div className="mt-auto pt-6 border-t border-gray-50 flex gap-3">
                    <button onClick={() => handleEdit(food)} className="flex-grow py-3 bg-gray-50 text-gray-400 font-bold rounded-xl hover:bg-primary/5 hover:text-primary transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest">
                      <Edit2 className="w-4 h-4" /> Edit
                    </button>
                    <button onClick={() => handleDelete(food._id)} className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminFood;
