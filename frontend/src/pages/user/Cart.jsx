import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '../../utils/currency';
import { getNormalizedImageUrl } from '../../utils/url';

const Cart = () => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            const response = await cartAPI.get();
            setCart(response.data);
        } catch (error) {
            console.error('Error fetching cart:', error);
            setError('Failed to load cart');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateQuantity = async (productId, newQuantity) => {
        if (newQuantity < 1) return;
        try {
            const response = await cartAPI.update({ productId, quantity: newQuantity });
            setCart(response.data);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update quantity');
        }
    };

    const handleRemove = async (productId) => {
        if (!confirm('Remove this item from cart?')) return;
        try {
            const response = await cartAPI.remove(productId);
            setCart(response.data);
        } catch (error) {
            alert('Failed to remove item');
        }
    };

    const calculateTotal = () => {
        if (!cart || !cart.items) return 0;
        return cart.items.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0);
    };

    if (loading) return <Loading />;
    if (error) return <div className="max-w-7xl mx-auto px-4 py-8"><ErrorMessage message={error} /></div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

            {!cart || cart.items.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
                    <Link to="/products" className="btn-primary">
                        Continue Shopping
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cart.items.map((item) => (
                            <div key={item.product._id} className="bg-white p-4 rounded-lg shadow-md flex gap-4">
                                <img
                                    src={getNormalizedImageUrl(item.product.image || item.product.images?.[0])}
                                    alt={item.product.name}
                                    className="w-24 h-24 object-cover rounded"
                                />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                                    <p className="text-primary-600 font-bold">{formatPrice(item.product.price, i18n.language)}</p>
                                    <div className="mt-2 flex items-center space-x-2">
                                        <button
                                            onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                                            className="px-2 py-1 border rounded hover:bg-gray-100"
                                        >
                                            -
                                        </button>
                                        <span className="px-4">{item.quantity}</span>
                                        <button
                                            onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                                            className="px-2 py-1 border rounded hover:bg-gray-100"
                                        >
                                            +
                                        </button>
                                        <button
                                            onClick={() => handleRemove(item.product._id)}
                                            className="ml-4 text-red-600 hover:text-red-700"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900">
                                        {formatPrice(item.product.price * item.quantity, i18n.language)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Cart Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-lg shadow-md sticky top-20">
                            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(calculateTotal(), i18n.language)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Shipping</span>
                                    <span>Free</span>
                                </div>
                                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span className="text-primary-600">{formatPrice(calculateTotal(), i18n.language)}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/checkout')}
                                className="btn-primary w-full"
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
