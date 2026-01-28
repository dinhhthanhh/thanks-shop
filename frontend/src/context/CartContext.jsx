import { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartCount, setCartCount] = useState(0);
    const [cart, setCart] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        } else {
            setCartCount(0);
            setCart(null);
        }
    }, [isAuthenticated]);

    const fetchCart = async () => {
        try {
            const response = await cartAPI.get();
            setCart(response.data);
            updateCartCount(response.data);
        } catch (error) {
            console.error('Error fetching cart:', error);
        }
    };

    const updateCartCount = (cartData) => {
        if (cartData && cartData.items) {
            const count = cartData.items.reduce((total, item) => total + item.quantity, 0);
            setCartCount(count);
        } else {
            setCartCount(0);
        }
    };

    const addToCart = async (productId, quantity = 1, options = {}) => {
        setIsLoading(true);
        try {
            const response = await cartAPI.add({ productId, quantity });
            setCart(response.data);
            updateCartCount(response.data);

            // Trigger animation if callback provided
            if (options.onSuccess) {
                options.onSuccess();
            }

            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Failed to add to cart' };
        } finally {
            setIsLoading(false);
        }
    };

    const updateCartItem = async (productId, quantity) => {
        try {
            const response = await cartAPI.update({ productId, quantity });
            setCart(response.data);
            updateCartCount(response.data);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message };
        }
    };

    const removeFromCart = async (productId) => {
        try {
            const response = await cartAPI.remove(productId);
            setCart(response.data);
            updateCartCount(response.data);
            return { success: true };
        } catch (error) {
            return { success: false };
        }
    };

    const clearCart = async () => {
        try {
            await cartAPI.clear();
            setCart(null);
            setCartCount(0);
            return { success: true };
        } catch (error) {
            return { success: false };
        }
    };

    const value = {
        cart,
        cartCount,
        isLoading,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        fetchCart
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
