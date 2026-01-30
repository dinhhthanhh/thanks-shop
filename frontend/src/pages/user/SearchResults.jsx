import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { productsAPI } from '../../services/api';
import ProductCard from '../../components/products/ProductCard';
import Loading from '../../components/common/Loading';

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();

    useEffect(() => {
        if (query) {
            searchProducts();
        }
    }, [query]);

    const searchProducts = async () => {
        setLoading(true);
        try {
            const response = await productsAPI.search(query);
            setProducts(response.data);
        } catch (error) {
            console.error('Search error:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {t('search.results_for')}: "{query}"
                </h1>
                <p className="text-gray-600">
                    {products.length} {t('search.products_found')}
                </p>
            </div>

            {products.length === 0 ? (
                <div className="text-center py-16">
                    <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('search.no_results')}</h3>
                    <p className="text-gray-600 mb-6">{t('search.try_different')}</p>
                    <Link to="/products" className="btn-primary">
                        {t('search.browse_all')}
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchResults;
