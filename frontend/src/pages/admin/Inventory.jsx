import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { adminAPI } from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout';
import Loading from '../../components/common/Loading';
import { getNormalizedImageUrl, formatVND } from '../../utils/url';

const Inventory = () => {
    const { t } = useTranslation();
    const [inventory, setInventory] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            const response = await adminAPI.getInventory();
            setInventory(response.data);
        } catch (error) {
            console.error('Error fetching inventory:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <AdminLayout><Loading /></AdminLayout>;

    return (
        <AdminLayout>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('admin.inventory_management')}</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-sm text-gray-600 mb-2">{t('admin.total_stock_units')}</h3>
                    <p className="text-3xl font-bold text-gray-900">{inventory?.totalStock || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-sm text-gray-600 mb-2">{t('admin.total_stock_value')}</h3>
                    <p className="text-3xl font-bold text-green-600">
                        {formatVND(inventory?.stockValue || 0)}
                    </p>
                </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.product')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.category')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.price')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.stock')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.value')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.status')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {inventory?.products?.map((product) => (
                            <tr key={product._id} className={product.stock < 10 ? 'bg-red-50' : ''}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <img src={getNormalizedImageUrl(product.image || product.images?.[0])} alt={product.name} className="w-10 h-10 rounded object-cover" />
                                        <span className="ml-3">{product.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">{product.category?.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{formatVND(product.price)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={product.stock < 10 ? 'text-red-600 font-bold' : 'font-semibold'}>
                                        {product.stock}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap font-semibold">
                                    {formatVND(product.price * product.stock)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {product.stock === 0 ? (
                                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                                            {t('admin.out_of_stock')}
                                        </span>
                                    ) : product.stock < 10 ? (
                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                                            {t('admin.low_stock')}
                                        </span>
                                    ) : (
                                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                            {t('admin.in_stock')}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
};

export default Inventory;
