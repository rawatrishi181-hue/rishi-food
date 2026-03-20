import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { restaurantService, categoryService, foodService } from '../services/apiService';
import { Star, Clock, MapPin, Search, ChevronRight, Sparkles, ShoppingCart } from 'lucide-react';
import { FoodCard } from '../components/restaurant/FoodCard';
import { useCart } from '../context/CartContext';

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItemToCart } = useCart();
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'top-rated', 'fast', 'veg'
  const navigate = useNavigate();

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (activeFilter === 'top-rated') params.minRating = 4.5;
      if (activeFilter === 'fast') params.maxDeliveryTime = 30;
      if (activeFilter === 'veg') params.isVeg = true;

      const [restRes, catRes] = await Promise.all([
        restaurantService.getAll(params),

        
        categoryService.getAll(),
      ]);
      
      console.log('Home Data:', { restRes, catRes });
      
      const restaurantList = restRes?.data?.data || restRes?.data || restRes || [];
      const categoryList = catRes?.data || catRes || [];
      
      setRestaurants(restaurantList);
      setCategories(categoryList);

      // Fetch recommendations separately so it doesn't block the page if user is guest
      try {
        const recRes = await foodService.getRecommendations();
        const recList = recRes?.data || recRes || [];
        setRecommendations(recList);
      } catch (recErr) {
        console.log('Recommendations not loaded (user might be guest)');
      }
    } catch (err) {
      console.error('Home Fetch Error:', err);
      setError(err?.message || 'Something went wrong while loading data');
    } finally {
      setLoading(false);
    }
  };

  const filteredRestaurants = restaurants.filter(rest => 
    rest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rest.cuisine?.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) return (
    <div className="flex justify-center items-center h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  const handleAddToCart = async (foodId) => {
    try {
      await addItemToCart(foodId, 1);
    } catch (error) {}
  };

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] text-center px-4">
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchData}
            className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-primary-dark transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 sm:space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative h-[300px] sm:h-[400px] rounded-2xl sm:rounded-3xl overflow-hidden mb-8 sm:mb-12 shadow-2xl">
        <img 
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80" 
          className="w-full h-full object-cover"
          alt="Hero"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center px-6 sm:px-16 text-white">
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold mb-4 sm:mb-6 italic tracking-tight leading-tight">
            Craving for <br />
            <span className="text-primary-light">Delicious Food?</span>
          </h1>
          <p className="text-sm sm:text-lg md:text-xl opacity-90 mb-6 sm:mb-8 max-w-xl leading-relaxed hidden sm:block">
            Discover the best restaurants, cafes, and bars in your city with RishiFood. Freshness delivered to your doorstep.
          </p>
          <form onSubmit={handleHeroSearch} className="relative max-w-2xl group w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 sm:w-6 sm:h-6 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search food..."
              className="w-full pl-12 sm:pl-14 pr-24 sm:pr-32 py-3.5 sm:py-4 bg-white/95 backdrop-blur-sm border-none rounded-xl sm:rounded-2xl text-gray-800 shadow-xl focus:ring-4 focus:ring-primary/20 transition-all placeholder:text-gray-400 font-medium text-sm sm:text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-black italic tracking-tight hover:scale-105 transition-transform text-xs sm:text-sm"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* AI Recommendations Section */}
      {recommendations.length > 0 && (
        <section className="animate-fadeIn">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary animate-pulse" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-800 italic tracking-tight">AI For You</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {recommendations.map((food) => (
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

      {/* Categories Section */}
      <section className="animate-fadeIn">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 italic">Popular Cuisines</h2>
          <button className="text-primary font-semibold flex items-center gap-1 hover:gap-2 transition-all text-sm">
            See all <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex overflow-x-auto gap-6 sm:gap-10 pb-6 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {categories.map((cat) => (
            <Link 
              key={cat._id} 
              to={`/category/${cat.name.toLowerCase()}`}
              className="flex-shrink-0 flex flex-col items-center gap-3 sm:gap-4 group"
            >
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:shadow-primary/20 group-hover:scale-110 group-hover:border-primary/20 transition-all duration-500">
                <img 
                  src={cat.image || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80`} 
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm sm:text-base font-bold text-gray-700 group-hover:text-primary transition-colors">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Restaurants Section */}
      <section className="animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-8 sm:mb-10">
          <div className="flex items-center gap-3 sm:gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 italic">Top Restaurants</h2>
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
              {filteredRestaurants.length}
            </span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {[
              { id: 'all', label: 'All' },
              { id: 'top-rated', label: 'Ratings 4.5+' },
              { id: 'fast', label: 'Fast Delivery' }
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest border transition-all whitespace-nowrap ${
                  activeFilter === filter.id 
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                    : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        {filteredRestaurants.length === 0 ? (
          <div className="text-center py-12 sm:py-20 bg-white rounded-2xl sm:rounded-3xl border border-dashed border-gray-200">
            <Search className="w-10 h-10 sm:w-12 sm:h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium italic text-base sm:text-lg">No restaurants found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
            {filteredRestaurants.map((rest) => (
              <Link 
                key={rest._id} 
                to={`/restaurant/${rest._id}`}
                className="bg-white rounded-2xl sm:rounded-[24px] overflow-hidden card-shadow card-hover border border-gray-50 group flex flex-col"
              >
                <div className="relative h-48 sm:h-56 overflow-hidden">
                  <img 
                    src={rest.image || `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80`} 
                    alt={rest.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/95 backdrop-blur-md px-2 py-1 rounded-lg sm:rounded-xl flex items-center gap-1.5 text-xs sm:text-sm font-black shadow-lg">
                    <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 fill-green-600" />
                    <span className="text-gray-800">{rest.rating || '4.2'}</span>
                  </div>

                  {rest.deliveryTime && (
                    <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-black/60 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold text-white shadow-lg border border-white/10">
                      <Clock className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-primary-light" />
                      {rest.deliveryTime} MINS
                    </div>
                  )}
                </div>
                <div className="p-4 sm:p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-1.5 sm:mb-2">
                    <h3 className="text-lg sm:text-xl font-black text-gray-800 group-hover:text-primary transition-colors tracking-tight line-clamp-1">
                      {rest.name}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500 mb-3 sm:mb-4 line-clamp-1 italic">
                    {rest.cuisine?.join(' • ')}
                  </p>
                  <div className="mt-auto flex items-center gap-2 pt-3 sm:pt-4 border-t border-gray-50 text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary/60" />
                    {rest.city}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
