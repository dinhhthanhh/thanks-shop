import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { productsAPI, categoriesAPI } from '../../services/api';
import { getNormalizedImageUrl, formatVND } from '../../utils/url';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Loading from '../../components/common/Loading';

const AdminProducts = () => {
    const { t } = useTranslation();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        images: [],
        stock: ''
    });
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [imageUrlInput, setImageUrlInput] = useState('');
    const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'url'
    const [displayPrice, setDisplayPrice] = useState('');

    // Helper to format price with dots
    const formatPriceInput = (value) => {
        if (!value) return '';
        // Remove non-numeric characters
        const numericValue = value.toString().replace(/\D/g, '');
        // Format with dots as thousands separator
        return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    // Helper to get raw numeric value
    const unformatPriceInput = (formattedValue) => {
        if (!formattedValue) return '';
        return formattedValue.replace(/\./g, '');
    };

    // Update display price when formData.price changes (e.g., when editing or quick add)
    useEffect(() => {
        setDisplayPrice(formatPriceInput(formData.price));
    }, [formData.price]);

    const handlePriceChange = (e) => {
        const rawValue = unformatPriceInput(e.target.value);
        if (rawValue === '' || /^\d+$/.test(rawValue)) {
            setFormData({ ...formData, price: rawValue });
        }
    };

    // Search and Filter States
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [stockFilter, setStockFilter] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, categoryFilter, stockFilter]);

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, [debouncedSearch, categoryFilter, stockFilter, page]);

    // Handle direct edit from ProductDetail page
    useEffect(() => {
        const checkDirectEdit = async () => {
            if (location.state?.editProductId && categories.length > 0) {
                const productId = location.state.editProductId;
                try {
                    const response = await productsAPI.getById(productId);
                    if (response.data) {
                        handleEdit(response.data);
                        // Clear the state so it doesn't reopen on refresh
                        navigate(location.pathname, { replace: true, state: {} });
                    }
                } catch (error) {
                    console.error('Error fetching product for direct edit:', error);
                }
            }
        };

        if (!loading && categories.length > 0) {
            checkDirectEdit();
        }
    }, [location.state, categories, loading]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = {
                limit: 15,
                page: page,
                search: debouncedSearch,
                category: categoryFilter,
                stockStatus: stockFilter
            };
            const [productsRes, categoriesRes] = await Promise.all([
                productsAPI.getAll(params),
                categoriesAPI.getAll()
            ]);
            setProducts(productsRes.data.products);
            setTotalPages(productsRes.data.totalPages || 1);
            setTotalItems(productsRes.data.total || 0);
            setCategories(categoriesRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setSearch('');
        setCategoryFilter('');
        setStockFilter('');
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImageFiles(files);

        // Create preview URLs
        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(previews);
    };

    const removeImage = (index) => {
        const newImages = formData.images.filter((_, i) => i !== index);
        setFormData({ ...formData, images: newImages });
    };

    const handleAddImageUrl = () => {
        if (!imageUrlInput.trim()) return;

        // Basic URL validation
        try {
            new URL(imageUrlInput);
        } catch (e) {
            alert(t('admin.invalid_url_error') || 'Please enter a valid URL');
            return;
        }

        setFormData({
            ...formData,
            images: [...formData.images, imageUrlInput.trim()]
        });
        setImageUrlInput('');
    };

    const uploadImages = async () => {
        if (imageFiles.length === 0) return formData.images;

        setUploading(true);
        const formDataUpload = new FormData();
        imageFiles.forEach(file => {
            formDataUpload.append('images', file);
        });

        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${API_URL}/products/upload-images`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataUpload
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            // Prepend new images so they show up as primary in the list
            return [...data.images, ...formData.images];
        } catch (error) {
            console.error('Error uploading image:', error);
            alert(t('admin.upload_failed_error') || 'Failed to upload image');
            return formData.images;
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const uploadedImages = await uploadImages();
            const dataToSubmit = { ...formData, images: uploadedImages };

            if (editingProduct) {
                await productsAPI.update(editingProduct._id, dataToSubmit);
                alert(t('admin.product_updated'));
            } else {
                await productsAPI.create(dataToSubmit);
                alert(t('admin.product_created'));
            }
            setShowModal(false);
            resetForm();
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || t('admin.operation_failed_error') || 'Operation failed');
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category._id,
            images: product.images || [],
            stock: product.stock
        });

        // Detect upload method based on existing images
        const firstImage = product.images?.[0] || '';
        if (firstImage.startsWith('http')) {
            setUploadMethod('url');
        } else {
            setUploadMethod('file');
        }

        setImageFiles([]);
        setImagePreviews([]);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm(t('admin.delete_confirm_product'))) return;
        try {
            await productsAPI.delete(id);
            alert(t('admin.product_deleted') || 'Product deleted successfully!');
            fetchData();
        } catch (error) {
            alert(t('admin.delete_failed_error') || 'Failed to delete product');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            category: '',
            images: [],
            stock: ''
        });
        setImageFiles([]);
        setImagePreviews([]);
        setImageUrlInput('');
        setUploadMethod('file');
        setEditingProduct(null);
    };

    if (loading) return <div className="flex"><AdminSidebar /><Loading /></div>;

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="flex-1 p-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">{t('admin.products_management')}</h1>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="btn-primary"
                    >
                        {t('admin.add_product')}
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{t('admin.search')}</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={t('admin.search_products')}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="input-field pl-12"
                            />
                        </div>
                    </div>

                    <div className="w-48">
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{t('admin.category')}</label>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="input-field"
                        >
                            <option value="">{t('admin.all_categories')}</option>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="w-48">
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{t('admin.stock_status')}</label>
                        <select
                            value={stockFilter}
                            onChange={(e) => setStockFilter(e.target.value)}
                            className="input-field"
                        >
                            <option value="">{t('admin.all_statuses')}</option>
                            <option value="available">{t('admin.in_stock')}</option>
                            <option value="low">{t('admin.low_stock')}</option>
                            <option value="out">{t('admin.out_of_stock')}</option>
                        </select>
                    </div>

                    {(search || categoryFilter || stockFilter) && (
                        <button
                            onClick={clearFilters}
                            className="mb-1 text-sm text-red-600 hover:text-red-800 font-medium pb-2 px-2"
                        >
                            {t('admin.clear_filters')}
                        </button>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.product')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.category')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.price')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.stock')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.map((product) => (
                                <tr key={product._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img src={getNormalizedImageUrl(product.image || product.images?.[0])} alt={product.name} className="w-10 h-10 rounded object-cover" />
                                            <span className="ml-3">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{product.category?.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{formatVND(product.price)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={product.stock < 10 ? 'text-red-600 font-semibold' : ''}>
                                            {product.stock}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-900 mr-3">
                                            {t('admin.edit')}
                                        </button>
                                        <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-900">
                                            {t('admin.delete')}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-between items-center bg-white px-6 py-4 border-t rounded-b-lg shadow-md mt-4">
                        <div className="text-sm text-gray-500">
                            {t('admin.showing')} <span className="font-medium">{(page - 1) * 15 + 1}</span> - <span className="font-medium">{Math.min(page * 15, totalItems)}</span> {t('admin.of')} <span className="font-medium">{totalItems}</span> {t('admin.results')}
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${page === 1
                                    ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100 shadow-sm'
                                    }`}
                            >
                                {t('admin.previous')}
                            </button>
                            <div className="flex items-center space-x-1">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setPage(i + 1)}
                                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${page === i + 1
                                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100 border'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${page === totalPages
                                    ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100 shadow-sm'
                                    }`}
                            >
                                {t('admin.next')}
                            </button>
                        </div>
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden">
                            {/* Modal Header */}
                            <div className="p-6 border-b shrink-0">
                                <h2 className="text-2xl font-bold">
                                    {editingProduct ? t('admin.edit_product') : t('admin.add_product')}
                                </h2>
                            </div>

                            {/* Modal Body - Scrollable */}
                            <div className="p-6 overflow-y-auto flex-1">
                                <form id="productForm" onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.name')}</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.description')}</label>
                                        <textarea
                                            required
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="input-field"
                                            rows="3"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.price')}</label>
                                        <div className="flex space-x-2">
                                            <div className="relative flex-1">
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    required
                                                    value={displayPrice}
                                                    onChange={handlePriceChange}
                                                    className="input-field pr-10 w-full"
                                                    placeholder="0"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                                                    đ
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const currentPrice = formData.price.toString();
                                                    setFormData({ ...formData, price: currentPrice + '000' });
                                                }}
                                                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-semibold border transition-colors shrink-0"
                                            >
                                                {t('admin.quick_add_000')}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.category')}</label>
                                        <select
                                            required
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="input-field"
                                        >
                                            <option value="">{t('admin.select_category')}</option>
                                            {categories.map((cat) => (
                                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.product_images')}</label>

                                        {/* Method Toggle */}
                                        <div className="flex space-x-6 mb-4 border-b border-gray-100">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (uploadMethod !== 'file') {
                                                        setUploadMethod('file');
                                                        setImageUrlInput('');
                                                    }
                                                }}
                                                className={`pb-2 text-sm transition-all ${uploadMethod === 'file'
                                                    ? 'border-b-2 border-primary-600 text-primary-600 font-semibold'
                                                    : 'text-gray-400 hover:text-gray-600'}`}
                                            >
                                                {t('admin.upload_files')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (uploadMethod !== 'url') {
                                                        setUploadMethod('url');
                                                        setImageFiles([]);
                                                        setImagePreviews([]);
                                                    }
                                                }}
                                                className={`pb-2 text-sm transition-all ${uploadMethod === 'url'
                                                    ? 'border-b-2 border-primary-600 text-primary-600 font-semibold'
                                                    : 'text-gray-400 hover:text-gray-600'}`}
                                            >
                                                {t('admin.paste_link')}
                                            </button>
                                        </div>

                                        {/* Conditional Inputs */}
                                        {uploadMethod === 'url' ? (
                                            <div className="space-y-2 animate-in fade-in duration-300">
                                                <div className="flex space-x-2">
                                                    <input
                                                        type="text"
                                                        placeholder="https://example.com/image.jpg"
                                                        value={imageUrlInput}
                                                        onChange={(e) => setImageUrlInput(e.target.value)}
                                                        className="input-field flex-1"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleAddImageUrl}
                                                        className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 text-sm font-semibold border border-primary-100 transition-colors"
                                                    >
                                                        {t('admin.add')}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="animate-in fade-in duration-300">
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="block w-full text-sm text-gray-500
                                                        file:mr-4 file:py-2 file:px-4
                                                        file:rounded-full file:border-0
                                                        file:text-sm file:font-semibold
                                                        file:bg-primary-50 file:text-primary-700
                                                        hover:file:bg-primary-100
                                                        cursor-pointer border rounded-lg p-1"
                                                />
                                            </div>
                                        )}

                                        <p className="text-[10px] text-gray-400 mt-2">
                                            {uploadMethod === 'file'
                                                ? t('admin.upload_limit_hint')
                                                : t('admin.paste_url_hint')}
                                        </p>

                                        {/* Image Previews */}
                                        <div className="mt-4 grid grid-cols-4 gap-3">
                                            {/* Existing images from formData */}
                                            {formData.images.map((img, index) => (
                                                <div key={`existing-${index}`} className="relative group">
                                                    <img
                                                        src={getNormalizedImageUrl(img)}
                                                        alt={`Product ${index + 1}`}
                                                        className="w-full h-20 object-cover rounded border"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                            {/* New image previews */}
                                            {imagePreviews.map((preview, index) => (
                                                <div key={`preview-${index}`} className="relative group">
                                                    <img
                                                        src={preview}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-20 object-cover rounded border border-blue-300"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newFiles = imageFiles.filter((_, i) => i !== index);
                                                            const newPreviews = imagePreviews.filter((_, i) => i !== index);
                                                            setImageFiles(newFiles);
                                                            setImagePreviews(newPreviews);
                                                        }}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.stock')}</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.stock}
                                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                            className="input-field"
                                        />
                                    </div>
                                </form>
                            </div>

                            {/* Modal Footer - Fixed */}
                            <div className="p-6 border-t bg-gray-50 flex space-x-3 shrink-0">
                                <button
                                    type="submit"
                                    form="productForm"
                                    className="btn-primary flex-1"
                                    disabled={uploading}
                                >
                                    {uploading ? t('admin.uploading') : (editingProduct ? t('admin.update') : t('admin.create'))}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); resetForm(); }}
                                    className="btn-secondary flex-1"
                                >
                                    {t('admin.cancel')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminProducts;
