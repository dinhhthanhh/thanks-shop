import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { productsAPI, cartAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import StarRating from '../../components/common/StarRating';
import ReviewSection from '../../components/products/ReviewSection';
import { formatPrice } from '../../utils/currency';
import { getNormalizedImageUrl } from '../../utils/url';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { isAuthenticated } = useAuth();
    const { addToCart: addToCartContext } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [error, setError] = useState('');
    const [adding, setAdding] = useState(false);
    const [buyingNow, setBuyingNow] = useState(false);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const response = await productsAPI.getById(id);
            setProduct(response.data);
        } catch (error) {
            console.error('Error fetching product:', error);
            setError(t('product_detail.not_found'));
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        setAdding(true);
        setError('');
        try {
            const result = await addToCartContext(product._id, quantity);
            if (result.success) {
                alert(t('product_detail.added_to_cart'));
                setQuantity(1);
            } else {
                setError(result.message);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to add to cart');
        } finally {
            setAdding(false);
        }
    };

    const handleBuyNow = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        setBuyingNow(true);
        setError('');
        try {
            // Add to cart first
            await cartAPI.add({ productId: product._id, quantity });
            // Navigate directly to checkout
            navigate('/checkout');
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to proceed to checkout');
            setBuyingNow(false);
        }
    };

    if (loading) return <Loading />;
    if (error && !product) return <div className="max-w-7xl mx-auto px-4 py-8"><ErrorMessage message={error} /></div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Product Image */}
                <div className="aspect-w-1 aspect-h-1">
                    <img
                        src={getNormalizedImageUrl(product.image || product.images?.[0])}
                        alt={product.name}
                        className="w-full h-96 object-cover rounded-lg shadow-md"
                    />
                </div>

                {/* Product Info */}
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

                        {/* Rating and Reviews */}
                        <div className="flex items-center gap-4 mb-2">
                            <div className="flex items-center gap-2">
                                <StarRating rating={product.averageRating || 0} readonly size="sm" />
                                <span className="text-sm text-gray-600">
                                    {product.averageRating ? product.averageRating.toFixed(1) : '0.0'}
                                </span>
                            </div>
                            <span className="text-sm text-gray-400">|</span>
                            <span className="text-sm text-gray-600">
                                {product.reviewCount || 0} {t('reviews.reviews_count')}
                            </span>
                            <span className="text-sm text-gray-400">|</span>
                            <span className="text-sm text-gray-600">
                                {product.soldCount || 0} {t('reviews.sold')}
                            </span>
                        </div>

                        <p className="text-sm text-gray-500">
                            {t('product_detail.category')}: {product.category?.name}
                        </p>
                    </div>

                    <div className="text-3xl font-bold text-primary-600">
                        {formatPrice(product.price, i18n.language)}
                    </div>

                    <div className="border-t border-b border-gray-200 py-4">
                        <p className="text-gray-700">{product.description}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-700">{t('product_detail.stock')}:</span>
                            {product.stock > 0 ? (
                                <span className="text-green-600 font-semibold">{product.stock} {t('product_detail.available')}</span>
                            ) : (
                                <span className="text-red-600 font-semibold">{t('products.out_of_stock')}</span>
                            )}
                        </div>

                        {error && <ErrorMessage message={error} />}

                        {product.stock > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('product_detail.quantity')}</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max={product.stock}
                                            value={quantity}
                                            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                            className="input-field w-24"
                                        />
                                    </div>
                                </div>
                                <div className="flex space-x-4">
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={adding}
                                        className="btn-secondary flex-1"
                                    >
                                        {adding ? 'Adding...' : t('products.add_to_cart')}
                                    </button>
                                    <button
                                        onClick={handleBuyNow}
                                        disabled={buyingNow}
                                        className="btn-primary flex-1"
                                    >
                                        {buyingNow ? 'Processing...' : t('products.buy_now')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <ReviewSection productId={id} />
        </div>
    );
};

export default ProductDetail;
