import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartAPI, ordersAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '../../utils/currency';

const Checkout = () => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            const response = await cartAPI.get();
            if (!response.data || response.data.items.length === 0) {
                navigate('/cart');
                return;
            }
            setCart(response.data);
        } catch (error) {
            setError('Failed to load cart');
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = () => {
        if (!cart || !cart.items) return 0;
        return cart.items.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0);
    };

    const handleCheckout = async () => {
        setProcessing(true);
        setError('');
        try {
            await ordersAPI.create();
            alert('Order placed successfully!');
            navigate('/orders');
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to place order');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

            {error && <ErrorMessage message={error} />}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Order Summary */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                    <div className="space-y-3">
                        {cart?.items.map((item) => (
                            <div key={item.product._id} className="flex justify-between text-sm">
                                <span>
                                    {item.product.name} x {item.quantity}
                                </span>
                                <span className="font-medium">
                                    {formatPrice(item.product.price * item.quantity, i18n.language)}
                                </span>
                            </div>
                        ))}
                        <div className="border-t pt-3 flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span className="text-primary-600">{formatPrice(calculateTotal(), i18n.language)}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Info */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
                    <p className="text-gray-600 mb-6">
                        This is a demo checkout. In a production environment, you would integrate
                        a payment gateway like Stripe or PayPal.
                    </p>
                    <button
                        onClick={handleCheckout}
                        disabled={processing}
                        className="btn-primary w-full"
                    >
                        {processing ? 'Processing...' : 'Place Order (Demo)'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
