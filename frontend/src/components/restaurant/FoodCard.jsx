import { Star, Plus, Leaf } from 'lucide-react';
import { Button } from '../common/Button';
import { cn } from '../../utils/cn';

export const FoodCard = ({ food, onAddToCart }) => {
  const imageUrl = food.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
  
  // Dummy rating if not present
  const rating = food.rating || (Math.random() * (5 - 3.5) + 3.5).toFixed(1);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden card-shadow card-hover border border-gray-100 dark:border-gray-700 flex flex-col h-full group">
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={food.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
          }}
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {food.isBestSeller && (
            <span className="bg-yellow-400 text-black text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">
              Bestseller
            </span>
          )}
          {food.discount > 0 && (
            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">
              {food.discount}% OFF
            </span>
          )}
        </div>

        {/* Veg/Non-veg Indicator */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-1 rounded-md shadow-sm">
          <div className={cn(
            "w-3 h-3 border-2 rounded-sm flex items-center justify-center",
            food.isVeg ? "border-green-600" : "border-red-600"
          )}>
            <div className={cn(
              "w-1.5 h-1.5 rounded-full",
              food.isVeg ? "bg-green-600" : "bg-red-600"
            )} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 line-clamp-1 group-hover:text-primary transition-colors">
            {food.name}
          </h3>
          <div className="flex items-center gap-1 bg-green-700 text-white px-1.5 py-0.5 rounded text-xs font-bold shrink-0">
            {rating} <Star className="w-3 h-3 fill-current" />
          </div>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-grow">
          {food.description || "Freshly prepared with the finest ingredients to satisfy your cravings."}
        </p>

        <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-50">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium line-through">
              ₹{Math.round(food.price * 1.2)}
            </span>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
              ₹{food.price}
            </span>
          </div>
          
          <Button 
            size="sm" 
            variant="outline" 
            className="rounded-xl font-bold border-gray-200 text-primary hover:bg-primary/5 hover:border-primary px-6"
            onClick={() => onAddToCart(food)}
          >
            ADD <Plus className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};
