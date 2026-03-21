import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { restaurantService, categoryService, foodService, bannerService } from '../services/apiService';
import { Star, Clock, MapPin, Search, ChevronRight, Sparkles, ShoppingCart, ChevronLeft } from 'lucide-react';
import { FoodCard } from '../components/restaurant/FoodCard';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [banners, setBanners] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [loading, setLoading] = useState(true);
  const { addItemToCart } = useCart();
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const navigate = useNavigate();

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeFilter, pagination.page]);

  useEffect(() => {
    if (banners.length > 1) {
      const timer = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [banners]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = { page: pagination.page, limit: 6 };
      if (activeFilter === 'top-rated') params.minRating = 4.5;
      if (activeFilter === 'fast') params.maxDeliveryTime = 30;
      if (activeFilter === 'veg') params.isVeg = true;

      const [restRes, catRes, banRes] = await Promise.all([
        restaurantService.getAll(params),
        categoryService.getAll(),
        bannerService.getAll(),
      ]);
      
      const restData = restRes?.data?.data ? restRes.data : restRes;
      setRestaurants(restData?.data || []);
      setPagination(prev => ({
        ...prev,
        totalPages: restData?.pagination?.totalPages || 1
      }));
      
      setCategories(catRes?.data || catRes || []);
      setBanners(banRes?.data || banRes || []);

      try {
        const recRes = await foodService.getRecommendations();
        setRecommendations(recRes?.data || recRes || []);
      } catch (recErr) {}
    } catch (err) {
      setError(err?.message || 'Something went wrong while loading data');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 800, behavior: 'smooth' });
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
    <div className="space-y-12 pb-20 overflow-hidden">
      {/* Hero Carousel Section */}
      <section className="relative h-[400px] sm:h-[500px] -mx-4 sm:mx-0">
        <AnimatePresence mode="wait">
          {banners.length > 0 ? (
            <motion.div
              key={currentBanner}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
            >
              <img
                src={banners[currentBanner].image}
                alt={banners[currentBanner].title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center px-8 sm:px-16">
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="max-w-2xl space-y-4 sm:space-y-6"
                >
                  <span className="bg-primary/20 text-primary-light backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-primary/30 inline-block">
                    {banners[currentBanner].tag || 'Special Offer'}
                  </span>
                  <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white leading-[1.1] italic tracking-tight">
                    {banners[currentBanner].title}
                  </h1>
                  <p className="text-gray-300 text-lg sm:text-xl font-medium max-w-lg leading-relaxed">
                    {banners[currentBanner].description}
                  </p>
                  <div className="pt-4">
                    <Link to={banners[currentBanner].link || '/'} className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary-dark transition-all inline-block shadow-xl shadow-primary/20">
                      Order Now
                    </Link>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-[#0f172a]"
            >
              <img
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1920&q=80"
                alt="Hero"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
                <motion.h1 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-5xl sm:text-7xl font-black text-white mb-6 italic tracking-tight"
                >
                  Delicious Food, <br />
                  <span className="text-primary">Delivered Fast.</span>
                </motion.h1>
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-gray-300 text-lg sm:text-xl max-w-2xl mb-10 font-medium"
                >
                  Search for your favorite restaurants or cuisines and get your meal delivered to your doorstep in minutes.
                </motion.p>
                <motion.form 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  onSubmit={handleHeroSearch} 
                  className="w-full max-w-2xl relative group"
                >
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    placeholder="Search for restaurants or food..."
                    className="w-full pl-14 pr-32 py-5 sm:py-6 rounded-[32px] bg-white text-gray-800 text-lg focus:ring-4 focus:ring-primary/20 outline-none shadow-2xl transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button className="absolute right-3 top-3 bottom-3 bg-primary text-white px-8 rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-primary-dark transition-all">
                    Search
                  </button>
                </motion.form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {banners.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentBanner(i)}
                className={`h-2 rounded-full transition-all duration-500 ${currentBanner === i ? 'w-10 bg-primary' : 'w-2 bg-white/50'}`}
              />
            ))}
          </div>
        )}
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

      {/* Categories Slider */}
      <section className="container mx-auto px-4 overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black text-gray-800 italic flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary fill-current" />
            Popular Categories
          </h2>
          <div className="flex gap-2">
            <button 
              className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
              onClick={() => {
                document.getElementById('categories-slider').scrollBy({ left: -200, behavior: 'smooth' });
              }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
              onClick={() => {
                document.getElementById('categories-slider').scrollBy({ left: 200, behavior: 'smooth' });
              }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div 
          id="categories-slider"
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-8 pt-4 px-2 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollBehavior: 'smooth' }}
        >
          {categories.map((category, index) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true, margin: "-50px" }}
              className="snap-start shrink-0"
            >
              <Link
                to={`/category/${category.name}`}
                className="group flex flex-col items-center gap-4 w-[100px] sm:w-[140px]"
              >
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[30px] sm:rounded-[40px] bg-white shadow-md border border-gray-50 flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:shadow-xl group-hover:shadow-primary/20 group-hover:-translate-y-2 relative">
                  <img
                    src={category.image || `https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80`}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="font-black text-gray-700 text-[10px] sm:text-xs uppercase tracking-widest group-hover:text-primary transition-colors text-center w-full truncate px-2">
                  {category.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Restaurants Section */}
      <section className="animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-8 sm:mb-10">
          <div className="flex items-center gap-3 sm:gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 italic">Top Restaurants</h2>
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
              {restaurants.length} Places
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
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10"
          >
            <AnimatePresence>
              {filteredRestaurants.map((rest, index) => (
                <motion.div
                  key={rest._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link 
                    to={`/restaurant/${rest._id}`}
                    className="bg-white rounded-2xl sm:rounded-[24px] overflow-hidden card-shadow card-hover border border-gray-50 group flex flex-col h-full"
                  >
                    <div className="relative h-48 sm:h-56 overflow-hidden">
                      <img 
                        src={rest.image || `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80`} 
                        alt={rest.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80';
                        }}
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
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12 pb-10">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-3 rounded-xl border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <div className="flex gap-2">
              {[...Array(pagination.totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`w-12 h-12 rounded-xl font-black transition-all ${
                    pagination.page === i + 1
                      ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110'
                      : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="p-3 rounded-xl border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
