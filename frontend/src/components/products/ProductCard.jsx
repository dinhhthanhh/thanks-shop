import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '../../utils/currency';
import { getImageURL } from '../../utils/url';

const ProductCard = ({ product }) => {
    const { i18n } = useTranslation();

    // Get first image or fallback to placeholder
    const imageUrl = getImageURL(product.images?.[0]);

    return (
        <Link to={`/products/${product._id}`} className="card group">
            <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
                <img
                    src={imageUrl}
                    alt={product.name}
                    className="h-48 w-full object-cover object-center group-hover:scale-105 transition-transform duration-200"
                />
            </div>
            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                    {product.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
                <div className="mt-3 flex items-center justify-between">
                    <p className="text-xl font-bold text-primary-600">
                        {formatPrice(product.price, i18n.language)}
                    </p>
                    {product.stock > 0 ? (
                        <span className="text-sm text-green-600 font-medium">In Stock</span>
                    ) : (
                        <span className="text-sm text-red-600 font-medium">Out of Stock</span>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
