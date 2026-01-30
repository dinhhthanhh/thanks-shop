import { useState, useEffect } from 'react';
import { couponAPI } from '../../services/api';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/admin/AdminLayout';
import Loading from '../../components/common/Loading';

const Coupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newCoupon, setNewCoupon] = useState({
        code: '',
        discountType: 'percentage',
        value: 10,
        minPurchase: 0,
        expiryDate: '',
        usageLimit: ''
    });
    const { t } = useTranslation();

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const response = await couponAPI.getAll();
            setCoupons(response.data);
        } catch (error) {
            console.error('Error fetching coupons:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCoupon = async (e) => {
        e.preventDefault();
        try {
            await couponAPI.create(newCoupon);
            setShowAddForm(false);
            setNewCoupon({
                code: '',
                discountType: 'percentage',
                value: 10,
                minPurchase: 0,
                expiryDate: '',
                usageLimit: ''
            });
            fetchCoupons();
        } catch (error) {
            alert(error.response?.data?.message || t('admin.operation_failed_error'));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('admin.delete_confirm_coupon'))) return;
        try {
            await couponAPI.delete(id);
            fetchCoupons();
        } catch (error) {
            console.error('Error deleting coupon:', error);
        }
    };

    if (loading) return <AdminLayout><Loading /></AdminLayout>;

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">{t('admin.coupon_management')}</h1>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="btn-primary"
                >
                    {showAddForm ? t('admin.cancel') : t('admin.add_coupon')}
                </button>
            </div>

            {showAddForm && (
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8 animate-in slide-in-from-top duration-300">
                    <form onSubmit={handleAddCoupon} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">{t('admin.coupon_code')}</label>
                            <input
                                type="text"
                                value={newCoupon.code}
                                onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                                className="input-field uppercase"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">{t('admin.discount_type')}</label>
                            <select
                                value={newCoupon.discountType}
                                onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                                className="input-field"
                            >
                                <option value="percentage">{t('admin.percentage')}</option>
                                <option value="fixed">{t('admin.fixed_amount')}</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">{t('admin.discount_value')}</label>
                            <input
                                type="number"
                                value={newCoupon.value}
                                onChange={(e) => setNewCoupon({ ...newCoupon, value: e.target.value })}
                                className="input-field"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">{t('admin.min_purchase')}</label>
                            <input
                                type="number"
                                value={newCoupon.minPurchase}
                                onChange={(e) => setNewCoupon({ ...newCoupon, minPurchase: e.target.value })}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">{t('admin.expiry_date')}</label>
                            <input
                                type="date"
                                value={newCoupon.expiryDate}
                                onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                                className="input-field"
                                required
                            />
                        </div>
                        <div className="md:col-span-2 lg:col-span-1 flex items-end">
                            <button type="submit" className="btn-primary w-full py-3.5 mt-2">{t('admin.create_coupon')}</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coupons.map((coupon) => (
                    <div key={coupon._id} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 relative group hover:shadow-xl transition-all duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-black text-primary-600 tracking-tighter">{coupon.code}</h3>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                                    {coupon.discountType === 'percentage' ? t('admin.percentage') : t('admin.fixed_amount')}
                                </p>
                            </div>
                            <button
                                onClick={() => handleDelete(coupon._id)}
                                className="text-gray-300 hover:text-red-500 transition-colors p-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">{t('admin.discount_value')}:</span>
                                <span className="font-bold text-gray-900">{coupon.discountType === 'percentage' ? `${coupon.value}%` : `${coupon.value}đ`}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">{t('admin.min_purchase')}:</span>
                                <span className="font-bold text-gray-900">{coupon.minPurchase}đ</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">{t('admin.expiry_date')}:</span>
                                <span className="font-bold text-gray-900">{new Date(coupon.expiryDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">{t('admin.usage')}:</span>
                                <span className="font-medium text-primary-500 bg-primary-50 px-2 py-0.5 rounded-full text-[10px] uppercase">{coupon.usageCount} / {coupon.usageLimit || '∞'}</span>
                            </div>
                        </div>
                        <div className={`mt-4 pt-4 border-t border-gray-50 flex items-center ${new Date(coupon.expiryDate) < new Date() ? 'text-red-500 font-bold' : 'text-green-500'}`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${new Date(coupon.expiryDate) < new Date() ? 'bg-red-500' : 'bg-green-500'}`}></div>
                            <span className="text-[10px] uppercase font-bold tracking-widest">
                                {new Date(coupon.expiryDate) < new Date() ? t('admin.expired_status') : t('admin.active_status')}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {!loading && coupons.length === 0 && (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">{t('admin.no_coupons')}</h3>
                </div>
            )}
        </AdminLayout>
    );
};

export default Coupons;
