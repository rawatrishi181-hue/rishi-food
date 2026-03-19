import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchService } from '../services/apiService';
import { useCart } from '../context/CartContext';
import { Search, ShoppingBag, Utensils, Star, Clock, MapPin, ChevronRight } from 'lucide-react';
import { FoodCard } from '../components/restaurant/FoodCard';
import toast from 'react-hot-toast';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [results, setResults] = useState({ restaurants: [], foods: [] });
  const [loading, setLoading] = useState(true);
  const { addItemToCart } = useCart();

  useEffect(() => {
    if (query) {
      fetchResults();
    }
  }, [query]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await searchService.global(query);
      setResults(response.data || { restaurants: [], foods: [] });
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (foodId) => {
    try {
      await addItemToCart(foodId, 1);
    } catch (error) {}
  };

  if (loading) return (
    <div className="flex justify-center items-center h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-fadeIn px-4">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-gray-800 italic tracking-tight mb-2">
          Search Results for "<span className="text-primary">{query}</span>"
        </h1>
        <p className="text-gray-500 font-medium italic">
          Found {results.restaurants.length} restaurants and {results.foods.length} dishes.
        </p>
      </div>

      {results.restaurants.length === 0 && results.foods.length === 0 ? (
        <div className="bg-white rounded-[40px] p-20 text-center shadow-xl border border-gray-50">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-12 h-12 text-gray-200" />
          </div>
          <h2 className="text-2xl font-black text-gray-800 italic mb-2">No results found</h2>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto italic">We couldn't find anything matching your search. Try different keywords!</p>
          <Link to="/">
            <button className="bg-primary text-white px-8 py-3 rounded-xl font-black italic tracking-tight shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
              Back to Home
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-16">
          {/* Restaurants Section */}
          {results.restaurants.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Utensils className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-black text-gray-800 italic">Matching Restaurants</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {results.restaurants.map((rest) => (
                  <Link 
                    key={rest._id} 
                    to={`/restaurant/${rest._id}`}
                    className="bg-white rounded-[32px] overflow-hidden shadow-xl border border-gray-50 group card-hover"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img src={rest.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={rest.name} />
                      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-2 py-1 rounded-xl flex items-center gap-1.5 text-xs font-black shadow-lg">
                        <Star className="w-3.5 h-3.5 text-green-600 fill-green-600" />
                        <span>{rest.rating || '4.2'}</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-black text-gray-800 group-hover:text-primary transition-colors italic">{rest.name}</h3>
                      <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1 mb-4">{rest.cuisine?.join(' • ')}</p>
                      <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {rest.deliveryTime} mins</div>
                        <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {rest.city}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Foods Section */}
          {results.foods.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-black text-gray-800 italic">Dishes Found</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {results.foods.map((food) => (
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
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
