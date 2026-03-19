import { useState, useEffect } from 'react';
import { restaurantService } from '../services/apiService';
import { AdminLayout } from '../components/admin/AdminLayout';
import { Button } from '../components/common/Button';
import { 
  Plus, Search, Edit2, Trash2, MapPin, 
  Star, Clock, Utensils, X, Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', description: '', address: '', city: '', 
    cuisine: '', deliveryTime: 30, image: '', rating: 4.5
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await restaurantService.getAll();
      setRestaurants(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch restaurants');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        cuisine: typeof formData.cuisine === 'string' ? formData.cuisine.split(',').map(c => c.trim()) : formData.cuisine
      };

      if (editingId) {
        await restaurantService.update(editingId, data);
        toast.success('Restaurant updated successfully');
      } else {
        await restaurantService.create(data);
        toast.success('Restaurant added successfully');
      }
      
      setShowAddModal(false);
      setEditingId(null);
      setFormData({ name: '', description: '', address: '', city: '', cuisine: '', deliveryTime: 30, image: '', rating: 4.5 });
      fetchRestaurants();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save restaurant');
    }
  };

  const handleEdit = (rest) => {
    setFormData({
      name: rest.name,
      description: rest.description,
      address: rest.address,
      city: rest.city,
      cuisine: rest.cuisine.join(', '),
      deliveryTime: rest.deliveryTime,
      image: rest.image,
      rating: rest.rating
    });
    setEditingId(rest._id);
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this restaurant?')) return;
    try {
      await restaurantService.delete(id);
      toast.success('Restaurant deleted successfully');
      fetchRestaurants();
    } catch (error) {
      toast.error('Failed to delete restaurant');
    }
  };

  const filteredRestaurants = restaurants.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-gray-800 italic tracking-tight mb-2">Manage <span className="text-primary">Restaurants</span></h1>
            <p className="text-gray-500 font-medium italic">Add, edit or remove restaurant partners.</p>
          </div>
          <Button onClick={() => { setEditingId(null); setFormData({ name: '', description: '', address: '', city: '', cuisine: '', deliveryTime: 30, image: '', rating: 4.5 }); setShowAddModal(true); }} className="gap-2 px-8 py-4 rounded-2xl shadow-xl shadow-primary/20">
            <Plus className="w-5 h-5" /> Add Restaurant
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by name..."
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
                <h2 className="text-2xl font-black text-gray-800 italic">{editingId ? 'Edit' : 'Add'} <span className="text-primary">Restaurant</span></h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 grid grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
                <div className="col-span-2">
                  <label className="block text-sm font-black text-gray-700 uppercase tracking-widest mb-2">Restaurant Name</label>
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
                    rows="3"
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary font-medium"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-black text-gray-700 uppercase tracking-widest mb-2">City</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary font-medium"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-gray-700 uppercase tracking-widest mb-2">Delivery Time (mins)</label>
                  <input 
                    required
                    type="number" 
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary font-medium"
                    value={formData.deliveryTime}
                    onChange={(e) => setFormData({...formData, deliveryTime: e.target.value})}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-black text-gray-700 uppercase tracking-widest mb-2">Cuisine (comma separated)</label>
                  <input 
                    required
                    type="text" 
                    placeholder="North Indian, Chinese, Italian"
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary font-medium"
                    value={formData.cuisine}
                    onChange={(e) => setFormData({...formData, cuisine: e.target.value})}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-black text-gray-700 uppercase tracking-widest mb-2">Address</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary font-medium"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
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

                <div className="col-span-2 flex gap-4 pt-4">
                  <Button type="submit" className="flex-grow py-5 rounded-2xl shadow-xl shadow-primary/20">
                    {editingId ? 'Update' : 'Save'} Restaurant
                  </Button>
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-8 py-5 bg-gray-100 text-gray-500 font-black uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Table/Grid */}
        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredRestaurants.map((rest) => (
              <div key={rest._id} className="bg-white p-6 rounded-[32px] border border-gray-50 shadow-xl flex items-center gap-8 group card-hover">
                <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-md flex-shrink-0">
                  <img src={rest.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=300&q=80'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={rest.name} />
                </div>
                
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-black text-gray-800 italic">{rest.name}</h3>
                    <div className="bg-green-50 text-green-600 px-2 py-0.5 rounded-lg font-black text-xs flex items-center gap-1">
                      {rest.rating || '4.2'} <Star className="w-3 h-3 fill-current" />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-400 font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {rest.city}</div>
                    <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> {rest.deliveryTime} mins</div>
                    <div className="flex items-center gap-1"><Utensils className="w-4 h-4" /> {rest.cuisine?.join(', ')}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => handleEdit(rest)} className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-primary/5 hover:text-primary transition-all">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(rest._id)} className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminRestaurants;
