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
import { toast } from 'react-hot-toast';
import { formatPrice } from '../../utils/currency';
import { getNormalizedImageUrl } from '../../utils/url';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { isAuthenticated, user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const { addToCart: addToCartContext } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [error, setError] = useState('');
    const [adding, setAdding] = useState(false);
    const [buyingNow, setBuyingNow] = useState(false);

    useEffect(() => {
        setLoading(true);
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
                toast.success(t('product_detail.added_to_cart'));
                setQuantity(1);
            } else {
                setError(result.message);
                toast.error(result.message);
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to add to cart';
            setError(msg);
            toast.error(msg);
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
            const msg = error.response?.data?.message || 'Failed to proceed to checkout';
            setError(msg);
            toast.error(msg);
        } finally {
            setBuyingNow(false);
        }
    };

    const handleDeleteProduct = async () => {
        if (!window.confirm(t('admin.delete_confirm_product') || 'Are you sure you want to delete this product?')) return;
        try {
            await productsAPI.delete(id);
            toast.success(t('admin.product_deleted') || 'Product deleted successfully!');
            navigate('/products');
        } catch (error) {
            toast.error(t('admin.delete_failed_error') || 'Failed to delete product');
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
                        onError={(e) => { e.target.src = 'https://placehold.co/600x400?text=No+Image'; }}
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
                                <div className="inline-block px-4 py-2 bg-red-50 text-red-600 rounded-lg font-semibold border border-red-100 animate-pulse">
                                    🚫 {t('products.out_of_stock')}
                                </div>
                            )}
                        </div>

                        {error && <ErrorMessage message={error} />}

                        {isAdmin ? (
                            <div className="pt-6 space-y-5 animate-fade-in">
                                {/* Admin banner */}
                                <div className="relative p-[1px] rounded-2xl bg-linear-to-r from-primary-400 via-primary-500 to-primary-600 shadow-lg shadow-primary-500/10">
                                    <div className="bg-white/90 backdrop-blur-md rounded-2xl px-5 py-4 flex items-center gap-3">
                                        <span className="relative flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-600"></span>
                                        </span>
                                        <p className="text-primary-800 font-bold tracking-wide text-sm">
                                            {t('admin.management_mode')}
                                        </p>
                                    </div>
                                </div>

                                {/* Admin actions */}
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => navigate('/admin/products', { state: { editProductId: product._id } })}
                                        className="group relative overflow-hidden rounded-xl bg-linear-to-r from-primary-600 via-primary-500 to-primary-400 text-white font-bold py-3.5 px-6 shadow-lg shadow-primary-500/25 transition-all duration-300 hover:scale-[1.03] hover:shadow-primary-500/40 active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 skew-x-12" />
                                        <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        <span className="relative z-10">{t('admin.update')}</span>
                                    </button>

                                    <button
                                        onClick={handleDeleteProduct}
                                        className="group relative overflow-hidden rounded-xl bg-linear-to-r from-red-500 via-red-600 to-red-700 text-white font-bold py-3.5 px-6 shadow-lg shadow-red-500/25 transition-all duration-300 hover:scale-[1.03] hover:shadow-red-500/40 active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 skew-x-12" />
                                        <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        <span className="relative z-10">{t('admin.delete')}</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            product.stock > 0 && (
                                <div className="space-y-6 animate-fade-in pt-4">
                                    {/* Quantity Selection */}
                                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100 w-fit">
                                        <label className="text-sm font-bold text-gray-700 ml-2">
                                            {t('product_detail.quantity')}
                                        </label>
                                        <div className="flex items-center bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                                            <button
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                className="px-3 py-2 hover:bg-gray-50 text-gray-600 transition-colors"
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                min="1"
                                                max={product.stock}
                                                value={quantity}
                                                onChange={(e) => {
                                                    const val = Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1));
                                                    setQuantity(val);
                                                }}
                                                className="w-12 text-center font-bold text-gray-800 focus:outline-none"
                                            />
                                            <button
                                                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                                className="px-3 py-2 hover:bg-gray-50 text-gray-600 transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    {/* Purchase Actions */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={handleAddToCart}
                                            disabled={adding}
                                            className="group relative overflow-hidden rounded-xl bg-linear-to-r from-gray-800 via-gray-700 to-gray-600 text-white font-bold py-3.5 shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-gray-500/40 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            <span className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 skew-x-12" />
                                            <span className="relative z-10 flex items-center gap-2">
                                                🛒 {adding ? 'Adding...' : t('products.add_to_cart')}
                                            </span>
                                        </button>

                                        <button
                                            onClick={handleBuyNow}
                                            disabled={buyingNow}
                                            className="group relative overflow-hidden rounded-xl bg-linear-to-r from-primary-600 via-primary-500 to-primary-400 text-white font-bold py-3.5 shadow-xl transition-all duration-300 hover:scale-[1.05] hover:shadow-primary-500/50 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 skew-x-12" />
                                            <span className="relative z-10 flex items-center gap-2">
                                                ⚡ {buyingNow ? 'Processing...' : t('products.buy_now')}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            )
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
