import { createContext, useState, useContext, useEffect } from 'react';
import { cartService } from '../services/apiService';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('guestCart');
    return savedCart ? JSON.parse(savedCart) : { items: [], totalAmount: 0 };
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user]);

  // Save guest cart to localStorage
  useEffect(() => {
    if (!user) {
      localStorage.setItem('guestCart', JSON.stringify(cart));
    }
  }, [cart, user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await cartService.get();
      setCart(response.data || { items: [], totalAmount: 0 });
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItemToCart = async (foodItem, quantity = 1) => {
    if (!user) {
      // Guest Mode: Local Cart Logic
      setCart(prevCart => {
        const existingItemIndex = prevCart.items.findIndex(item => item.foodId === foodItem._id);
        let newItems = [...prevCart.items];

        if (existingItemIndex > -1) {
          newItems[existingItemIndex].quantity += quantity;
        } else {
          newItems.push({
            foodId: foodItem._id,
            name: foodItem.name,
            price: foodItem.price,
            image: foodItem.image,
            quantity: quantity
          });
        }

        const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return { items: newItems, totalAmount: newTotal };
      });
      toast.success('Item added to guest cart');
      return;
    }

    try {
      setLoading(true);
      const response = await cartService.addItem({ foodId: foodItem._id, quantity });
      setCart(response.data);
      toast.success('Item added to cart');
      return response.data;
    } catch (error) {
      toast.error(error.message || 'Failed to add item to cart');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateItemQuantity = async (foodId, quantity) => {
    if (!user) {
      setCart(prevCart => {
        const newItems = prevCart.items.map(item => 
          item.foodId === foodId ? { ...item, quantity } : item
        );
        const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return { items: newItems, totalAmount: newTotal };
      });
      toast.success('Quantity updated');
      return;
    }

    try {
      setLoading(true);
      const response = await cartService.updateQuantity(foodId, { quantity });
      setCart(response.data);
      toast.success('Cart updated');
      return response.data;
    } catch (error) {
      toast.error(error.message || 'Failed to update quantity');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeItemFromCart = async (foodId) => {
    if (!user) {
      setCart(prevCart => {
        const newItems = prevCart.items.filter(item => item.foodId !== foodId);
        const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return { items: newItems, totalAmount: newTotal };
      });
      toast.success('Item removed');
      return;
    }

    try {
      setLoading(true);
      const response = await cartService.removeItem(foodId);
      setCart(response.data);
      toast.success('Item removed from cart');
      return response.data;
    } catch (error) {
      toast.error(error.message || 'Failed to remove item');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!user) {
      setCart({ items: [], totalAmount: 0 });
      localStorage.removeItem('guestCart');
      toast.success('Cart cleared');
      return;
    }

    try {
      setLoading(true);
      const response = await cartService.clear();
      setCart({ items: [], totalAmount: 0 });
      toast.success('Cart cleared');
      return response.data;
    } catch (error) {
      toast.error(error.message || 'Failed to clear cart');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      loading, 
      fetchCart, 
      addItemToCart, 
      updateItemQuantity, 
      removeItemFromCart, 
      clearCart,
      itemCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
