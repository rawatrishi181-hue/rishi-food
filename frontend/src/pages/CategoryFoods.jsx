import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ChevronRight, LayoutGrid } from 'lucide-react';
import { FoodCard } from '../components/restaurant/FoodCard';
import toast from 'react-hot-toast';
import api from '../services/api';

const CategoryFoods = () => {
  const { name } = useParams();
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addItemToCart } = useCart();

  useEffect(() => {
    fetchCategoryFoods();
  }, [name]);

  const fetchCategoryFoods = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/foods?category=${name}`);
      console.log('Category Foods Data:', response);
      
      const items = response?.data || response || [];
      setFoods(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error('Error fetching category foods:', err);
      const errorMessage = err?.message || 'Failed to load dishes for this category';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (foodId) => {
    try {
      await addItemToCart(foodId, 1);
    } catch (error) {
      // Handled by context
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      <p className="mt-4 text-gray-500 italic font-medium">Finding the best {name} for you...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
      <div className="bg-red-50 p-8 rounded-[40px] border border-red-100 max-w-md">
        <h2 className="text-2xl font-black text-red-600 mb-2 italic">Connection Error</h2>
        <p className="text-gray-600 mb-6">{error.toString()}</p>
        <button 
          onClick={fetchCategoryFoods}
          className="bg-primary text-white px-8 py-3 rounded-xl font-black italic tracking-tight shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-fadeIn">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-800">Category</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-primary">{name}</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-5xl font-black text-gray-800 italic tracking-tight mb-2">
            Best <span className="text-primary">{name}</span> Dishes
          </h1>
          <p className="text-gray-500 font-medium italic">
            Handpicked {name} options from top-rated restaurants in your city.
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-primary" />
          <span className="font-bold text-gray-700">{foods.length} Options Available</span>
        </div>
      </div>

      {foods.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ChevronRight className="w-10 h-10 text-gray-200" />
          </div>
          <h3 className="text-2xl font-black text-gray-800 mb-2 italic">No dishes found</h3>
          <p className="text-gray-500 font-medium">We couldn't find any dishes in this category right now.</p>
          <Link to="/" className="inline-block mt-8 text-primary font-black uppercase tracking-widest text-xs hover:underline underline-offset-8">
            Back to Home
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {foods.map((food) => (
            <FoodCard 
              key={food._id} 
              food={{
                ...food,
                isVeg: food.category?.toLowerCase() !== 'non-veg'
              }} 
              onAddToCart={handleAddToCart} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryFoods;
