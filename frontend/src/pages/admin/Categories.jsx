import { useState, useEffect } from 'react';
import { categoriesAPI } from '../../services/api';
import { useTranslation } from 'react-i18next';
import AdminSidebar from '../../components/admin/AdminSidebar';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newCategory, setNewCategory] = useState({
        name: '',
        description: ''
    });
    const { t } = useTranslation();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await categoriesAPI.getAll();
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            await categoriesAPI.create(newCategory);
            setShowAddForm(false);
            setNewCategory({ name: '', description: '' });
            fetchCategories();
        } catch (error) {
            alert(error.response?.data?.message || 'Error creating category');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('admin.delete_confirm_category') || 'Are you sure you want to delete this category?')) return;
        try {
            await categoriesAPI.delete(id);
            fetchCategories();
        } catch (error) {
            alert(error.response?.data?.message || 'Error deleting category');
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />

            <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                                {t('admin.category_management')}
                            </h1>
                            <p className="text-gray-500 mt-1">{t('admin.category_management_subtitle')}</p>
                        </div>
                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-primary-200 flex items-center space-x-2"
                        >
                            <span>{showAddForm ? t('admin.cancel') : t('admin.add_category')}</span>
                        </button>
                    </div>

                    {showAddForm && (
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8 animate-in slide-in-from-top duration-300">
                            <form onSubmit={handleAddCategory} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                            {t('admin.category_name')}
                                        </label>
                                        <input
                                            type="text"
                                            value={newCategory.name}
                                            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                            className="input-field"
                                            placeholder={t('admin.category_name_placeholder')}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                            {t('admin.description')}
                                        </label>
                                        <input
                                            type="text"
                                            value={newCategory.description}
                                            onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                                            className="input-field"
                                            placeholder={t('admin.category_desc_placeholder')}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary-200">
                                        {t('admin.create_category')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {categories.map((category) => (
                                <div key={category._id} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 relative group hover:shadow-xl transition-all duration-300">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-xl font-bold text-gray-900 truncate pr-8">{category.name}</h3>
                                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{category.description || t('admin.no_description')}</p>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(category._id)}
                                            className="text-gray-300 hover:text-red-500 transition-colors p-2 absolute top-4 right-4"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                                        <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded-full uppercase tracking-tighter">
                                            {t('admin.active')}
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-medium">
                                            {new Date(category.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && categories.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                            <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">{t('admin.no_categories')}</h3>
                            <p className="text-gray-500 mt-1">{t('admin.no_categories_hint')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Categories;
