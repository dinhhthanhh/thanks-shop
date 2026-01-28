import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { productsAPI } from '../../services/api';
import ProductList from '../../components/products/ProductList';
import Loading from '../../components/common/Loading';
import SearchBar from '../../components/common/SearchBar';

const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                const response = await productsAPI.getAll({ limit: 8 });
                setFeaturedProducts(response.data.products);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedProducts();
    }, []);

    return (
        <div className="overflow-hidden">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white py-24 md:py-32">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                    <div className="absolute top-1/2 -right-24 w-80 h-80 bg-blue-400 rounded-full blur-3xl opacity-10 animate-pulse delay-700"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="text-center max-w-4xl mx-auto">
                        <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight animate-fade-in-up leading-tight">
                            {t('home.hero_title')}
                        </h1>
                        <p className="text-xl md:text-2xl mb-10 text-primary-100 font-light animate-fade-in-up delay-100">
                            {t('home.hero_subtitle')}
                        </p>

                        {/* Search Bar */}
                        <div className="mb-8 animate-fade-in-up delay-150">
                            <SearchBar />
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 animate-fade-in-up delay-200">
                            <Link to="/products" className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-primary-600 transition-all duration-200 bg-white font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white">
                                {t('home.shop_now')}
                                <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                            <a href="#featured" className="text-white font-semibold hover:text-primary-200 transition-colors border-b-2 border-transparent hover:border-primary-200 py-1">
                                {t('home.explore_more') || 'Explore more'}
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Featured Products */}
            <div id="featured" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="text-center mb-16">
                    <span className="text-primary-600 font-bold tracking-widest uppercase text-sm mb-4 block">Our Collection</span>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-primary">
                        {t('home.featured_products')}
                    </h2>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                        {t('home.featured_subtitle')}
                    </p>
                </div>

                {loading ? (
                    <Loading />
                ) : (
                    <div className="animate-fade-in">
                        <ProductList products={featuredProducts} />
                        <div className="text-center mt-20">
                            <Link to="/products" className="inline-flex items-center px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-primary-600 transform hover:-translate-y-1 transition-all duration-300 shadow-xl hover:shadow-primary-200">
                                {t('home.view_all')}
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* Categories Preview */}
            <div className="bg-gray-50/50 py-24 border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">{t('home.shop_by_category')}</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                        {['Detergent', 'Floor Cleaner', 'Surface Cleaner', 'Bathroom Cleaner', 'Kitchen Cleaner'].map((category, idx) => (
                            <Link
                                key={category}
                                to={`/products?category=${category}`}
                                className={`group relative bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 text-center border border-gray-100 overflow-hidden animate-fade-in delay-${idx * 100}`}
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-primary-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                                <h3 className="font-bold text-gray-800 group-hover:text-primary-600 transition-colors text-lg tracking-tight">{category}</h3>
                                <p className="text-xs text-gray-400 mt-2 uppercase tracking-widest font-semibold">Explore Items</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;

