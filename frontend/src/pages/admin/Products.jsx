import { useState, useEffect } from 'react';
import { productsAPI, categoriesAPI } from '../../services/api';
import { getNormalizedImageUrl } from '../../utils/url';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Loading from '../../components/common/Loading';

const AdminProducts = () => {
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

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                productsAPI.getAll({ limit: 100 }),
                categoriesAPI.getAll()
            ]);
            setProducts(productsRes.data.products);
            setCategories(categoriesRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
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
            alert('Please enter a valid URL');
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
            alert('Failed to upload image');
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
                alert('Product updated successfully!');
            } else {
                await productsAPI.create(dataToSubmit);
                alert('Product created successfully!');
            }
            setShowModal(false);
            resetForm();
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Operation failed');
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
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await productsAPI.delete(id);
            alert('Product deleted successfully!');
            fetchData();
        } catch (error) {
            alert('Failed to delete product');
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
                    <h1 className="text-3xl font-bold text-gray-900">Products Management</h1>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="btn-primary"
                    >
                        Add Product
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
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
                                    <td className="px-6 py-4 whitespace-nowrap">${product.price.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={product.stock < 10 ? 'text-red-600 font-semibold' : ''}>
                                            {product.stock}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-900 mr-3">
                                            Edit
                                        </button>
                                        <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-900">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <h2 className="text-2xl font-bold mb-4">
                                {editingProduct ? 'Edit Product' : 'Add Product'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        required
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="input-field"
                                        rows="3"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        required
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="input-field"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>

                                    {/* Method Toggle */}
                                    <div className="flex space-x-6 mb-4 border-b border-gray-100">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (uploadMethod !== 'file') {
                                                    setUploadMethod('file');
                                                    setImageUrlInput('');
                                                    // Optional: clear if user confirms they want to switch mode
                                                    // setFormData(prev => ({ ...prev, images: [] }));
                                                }
                                            }}
                                            className={`pb-2 text-sm transition-all ${uploadMethod === 'file'
                                                ? 'border-b-2 border-primary-600 text-primary-600 font-semibold'
                                                : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                            Upload Files
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
                                            Paste Link
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
                                                    Add
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
                                            ? 'Select up to 10 image files to upload'
                                            : 'Paste a direct link to an image and click Add'}
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                                <div className="flex space-x-3 pt-4">
                                    <button type="submit" className="btn-primary flex-1" disabled={uploading}>
                                        {uploading ? 'Uploading...' : (editingProduct ? 'Update' : 'Create')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setShowModal(false); resetForm(); }}
                                        className="btn-secondary flex-1"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminProducts;
