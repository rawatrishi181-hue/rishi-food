import { createContext, useState, useContext, useEffect } from 'react';
import { cartService } from '../services/apiService';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart({ items: [], totalAmount: 0 });
    }
  }, [user]);

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

  const addItemToCart = async (foodId, quantity) => {
    try {
      setLoading(true);
      const response = await cartService.addItem({ foodId, quantity });
      setCart(response.data);
      toast.success('Item added to cart');
      return response.data;
    } catch (error) {
      toast.error(error || 'Failed to add item to cart');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateItemQuantity = async (foodId, quantity) => {
    try {
      setLoading(true);
      const response = await cartService.updateQuantity(foodId, { quantity });
      setCart(response.data);
      toast.success('Cart updated');
      return response.data;
    } catch (error) {
      toast.error(error || 'Failed to update quantity');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeItemFromCart = async (foodId) => {
    try {
      setLoading(true);
      const response = await cartService.removeItem(foodId);
      setCart(response.data);
      toast.success('Item removed from cart');
      return response.data;
    } catch (error) {
      toast.error(error || 'Failed to remove item');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      const response = await cartService.clear();
      setCart({ items: [], totalAmount: 0 });
      toast.success('Cart cleared');
      return response.data;
    } catch (error) {
      toast.error(error || 'Failed to clear cart');
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
