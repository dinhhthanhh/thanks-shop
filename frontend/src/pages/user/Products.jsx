import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsAPI, categoriesAPI } from '../../services/api';
import ProductList from '../../components/products/ProductList';
import Loading from '../../components/common/Loading';
import { useTranslation } from 'react-i18next';

const Products = () => {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
        fetchCategories();

        // Listen for filter toggle from Navbar
        const handleToggleFilters = () => {
            setIsFilterOpen(prev => !prev);
        };
        window.addEventListener('toggle-filters', handleToggleFilters);
        return () => window.removeEventListener('toggle-filters', handleToggleFilters);
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [searchParams]);

    const fetchCategories = async () => {
        try {
            const response = await categoriesAPI.getAll();
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = {
                search: searchParams.get('search') || '',
                category: searchParams.get('category') || '',
                minPrice: searchParams.get('minPrice') || '',
                maxPrice: searchParams.get('maxPrice') || '',
            };
            const response = await productsAPI.getAll(params);
            setProducts(response.data.products);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = (e) => {
        e.preventDefault();
        const params = {};
        if (search) params.search = search;
        if (selectedCategory) params.category = selectedCategory;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        setSearchParams(params);
        setIsFilterOpen(false); // Close on mobile after apply
    };

    const handleReset = () => {
        setSearch('');
        setSelectedCategory('');
        setMinPrice('');
        setMaxPrice('');
        setSearchParams({});
        setIsFilterOpen(false); // Close on mobile after reset
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <h1 className="text-3xl font-bold text-gray-900">{t('products.title')}</h1>

                {/* Mobile Filter Toggle */}
                <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="lg:hidden flex items-center justify-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    {t('products.filters')}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Filters Sidebar */}
                <div className={`lg:block ${isFilterOpen ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto' : 'hidden'} lg:static lg:bg-transparent lg:p-0`}>
                    <div className="flex items-center justify-between lg:hidden mb-6">
                        <h2 className="text-xl font-bold">{t('products.filters')}</h2>
                        <button onClick={() => setIsFilterOpen(false)} className="p-2 text-gray-500">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-md lg:sticky lg:top-24 border border-gray-100">
                        <h2 className="text-lg font-semibold mb-6 hidden lg:block">{t('products.filters')}</h2>
                        <form onSubmit={handleFilter} className="space-y-6">
                            {/* Search */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">{t('search.placeholder')}</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder={t('products.search_placeholder')}
                                        className="input-field pl-10"
                                    />
                                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">{t('products.category')}</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="input-field cursor-pointer"
                                >
                                    <option value="">{t('products.all_categories')}</option>
                                    {categories.map((cat) => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Price Range */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">{t('products.price_range')}</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="number"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        placeholder={t('products.min')}
                                        className="input-field"
                                        min="0"
                                    />
                                    <input
                                        type="number"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        placeholder={t('products.max')}
                                        className="input-field"
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 space-y-3">
                                <button type="submit" className="btn-primary w-full py-3 rounded-xl">{t('products.apply_filters')}</button>
                                <button type="button" onClick={handleReset} className="btn-outline w-full py-3 rounded-xl">{t('products.reset')}</button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="lg:col-span-3">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loading />
                        </div>
                    ) : (
                        <div className="animate-fade-in">
                            <ProductList products={products} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Products;
