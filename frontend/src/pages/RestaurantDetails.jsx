import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { restaurantService } from '../services/apiService';
import { useCart } from '../context/CartContext';
import { Star, Clock, MapPin, ShoppingCart, Search, Info } from 'lucide-react';
import { Button } from '../components/common/Button';
import { FoodCard } from '../components/restaurant/FoodCard';
import { reviewService } from '../services/apiService';
import toast from 'react-hot-toast';

const RestaurantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { addItemToCart } = useCart();
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [restRes, menuRes, reviewRes] = await Promise.all([
        restaurantService.getById(id),
        restaurantService.getMenu(id),
        reviewService.getByRestaurant(id)
      ]);
      
      console.log('Restaurant Details Data:', { restRes, menuRes, reviewRes });
      
      setRestaurant(restRes?.data || restRes);
      setMenu(menuRes?.data || menuRes || []);
      setReviews(reviewRes?.data || reviewRes || []);
    } catch (error) {
      toast.error('Failed to load restaurant details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    try {
      await reviewService.create({ ...newReview, restaurantId: id });
      toast.success('Review added!');
      setNewReview({ rating: 5, comment: '' });
      const reviewRes = await reviewService.getByRestaurant(id);
      setReviews(reviewRes.data || reviewRes || []);
    } catch (error) {
      toast.error(error?.message || 'Failed to add review');
    }
  };

  const handleAddToCart = async (foodId) => {
    try {
      await addItemToCart(foodId, 1);
    } catch (error) {
      // Error handled by CartContext
    }
  };

  const filteredMenu = menu.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="flex justify-center items-center h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  if (!restaurant) return (
    <div className="text-center py-20">
      <Info className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-800">Restaurant not found</h2>
      <p className="text-gray-500 mt-2">The restaurant you are looking for does not exist or has been removed.</p>
    </div>
  );

  return (
    <div className="pb-20 animate-fadeIn">
      {/* Hero Header */}
      <div className="relative h-60 sm:h-72 md:h-96 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl mb-8 sm:mb-12 mx-0 sm:mx-0">
        <img 
          src={restaurant.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'} 
          className="w-full h-full object-cover"
          alt={restaurant.name}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?auto=format&fit=crop&w=1200&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-4 sm:p-6 md:p-12 text-white">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
            {restaurant.cuisine?.map((c, i) => (
              <span key={i} className="bg-white/20 backdrop-blur-md px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium uppercase tracking-wider">
                {c}
              </span>
            ))}
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold mb-2 sm:mb-4 italic tracking-tight">{restaurant.name}</h1>
          <div className="flex flex-wrap items-center gap-4 sm:gap-8 text-xs sm:text-sm md:text-base opacity-90">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary-light" />
              <span className="line-clamp-1">{restaurant.city}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="bg-green-600 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded flex items-center gap-1 font-bold">
                {restaurant.rating || '4.2'} <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
              </div>
              <span className="hidden sm:inline text-gray-300">|</span>
              <span className="font-medium hidden sm:inline">500+ Ratings</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
              <span>{restaurant.deliveryTime || 30}m</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 sm:gap-12">
        {/* Main Content */}
        <div className="flex-grow space-y-6 sm:space-y-8">
          {/* Menu Header & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 border-b pb-4 sm:pb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 italic">Menu</h2>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input 
                type="text" 
                placeholder="Search dishes..."
                className="w-full pl-9 pr-4 py-2 sm:pl-10 sm:py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Food Grid */}
          {filteredMenu.length === 0 ? (
            <div className="text-center py-12 sm:py-20 bg-white rounded-2xl border border-dashed border-gray-200">
              <ShoppingCart className="w-10 h-10 sm:w-12 sm:h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 font-medium italic text-sm sm:text-base">No dishes found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
              {filteredMenu.map((food) => (
                <FoodCard 
                  key={food._id} 
                  food={{
                    ...food,
                    isVeg: food.category?.toLowerCase() !== 'non-veg',
                    isBestSeller: Math.random() > 0.7,
                    discount: Math.random() > 0.8 ? 20 : 0
                  }} 
                  onAddToCart={handleAddToCart} 
                />
              ))}
            </div>
          )}

          {/* Reviews Section */}
          <div className="pt-10 sm:pt-16 border-t border-gray-100">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-800 mb-6 sm:mb-10 italic">Reviews</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
              {/* Add Review Form */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-[32px] shadow-xl border border-gray-50 h-fit">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-primary fill-current" /> Write a Review
                </h3>
                <form onSubmit={handleAddReview} className="space-y-4">
                  <div className="flex gap-1.5 sm:gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className={`p-1 sm:p-2 transition-all ${newReview.rating >= star ? 'text-primary' : 'text-gray-200'}`}
                      >
                        <Star className={`w-6 h-6 sm:w-8 sm:h-8 ${newReview.rating >= star ? 'fill-current' : ''}`} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    required
                    className="w-full p-3 sm:p-4 bg-gray-50 border-none rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-primary font-medium resize-none text-sm sm:text-base"
                    rows="4"
                    placeholder="Share your experience..."
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  />
                  <Button type="submit" className="w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base">Post Review</Button>
                </form>
              </div>

              {/* Reviews List */}
              <div className="space-y-4 sm:space-y-6">
                {reviews.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-2xl sm:rounded-[32px] border border-dashed border-gray-200">
                    <p className="text-gray-400 font-bold italic text-sm sm:text-base">No reviews yet. Be the first!</p>
                  </div>
                ) : (
                  reviews.map((review) => (
                    <div key={review._id} className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-50 shadow-sm">
                      <div className="flex justify-between items-start mb-3 sm:mb-4">
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black uppercase tracking-widest text-[10px] sm:text-xs">
                            {review.userName?.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800 text-sm sm:text-base">{review.userName}</h4>
                            <p className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="bg-green-50 text-green-600 px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-lg font-black text-[10px] sm:text-xs flex items-center gap-1">
                          {review.rating} <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500 font-medium italic leading-relaxed">"{review.comment}"</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Floating Sidebar Container */}
        <div className="lg:w-80 xl:w-96 shrink-0">
          <div className="sticky top-24 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
              
              <h3 className="font-bold text-xl mb-6 text-gray-800 flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                Restaurant Details
              </h3>
              
              <div className="space-y-5 text-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-gray-400 font-medium uppercase text-[10px] tracking-widest">Cuisines</span>
                  <span className="font-semibold text-gray-700 text-base">{restaurant.cuisine?.join(' • ')}</span>
                </div>
                
                <div className="flex flex-col gap-1">
                  <span className="text-gray-400 font-medium uppercase text-[10px] tracking-widest">Contact Info</span>
                  <span className="font-semibold text-gray-700 text-base">{restaurant.phone || '+91 98765 43210'}</span>
                </div>

                <div className="pt-6 border-t border-gray-50 mt-6">
                  <div className="bg-primary/5 p-4 rounded-2xl mb-6">
                    <p className="text-xs text-primary-dark font-medium leading-relaxed italic">
                      "Enjoy premium quality food from {restaurant.name} delivered fresh to your doorstep within {restaurant.deliveryTime || 30} minutes."
                    </p>
                  </div>
                  
                  <Button 
                    className="w-full py-4 rounded-2xl gap-3 shadow-lg shadow-primary/20 group" 
                    variant="primary"
                    onClick={() => navigate('/cart')}
                  >
                    <ShoppingCart className="w-5 h-5 group-hover:animate-bounce" />
                    <span className="font-bold tracking-tight">Checkout Now</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetails;
