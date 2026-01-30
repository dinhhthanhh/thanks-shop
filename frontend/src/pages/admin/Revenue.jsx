import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { adminAPI } from '../../services/api';
import { formatVND } from '../../utils/url';
import AdminLayout from '../../components/admin/AdminLayout';
import Loading from '../../components/common/Loading';

const Revenue = () => {
    const { t } = useTranslation();
    const [revenueData, setRevenueData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('month');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchRevenue();
    }, [period, selectedMonth, selectedYear, selectedDate]);

    const fetchRevenue = async () => {
        setLoading(true);
        try {
            const params = { period };

            // Add specific date filters based on period
            if (period === 'day') {
                params.date = selectedDate;
            } else if (period === 'month') {
                params.month = selectedMonth;
                params.year = selectedYear;
            } else if (period === 'year') {
                params.year = selectedYear;
            }

            const response = await adminAPI.getRevenue(params);
            setRevenueData(response.data);
        } catch (error) {
            console.error('Error fetching revenue:', error);
        } finally {
            setLoading(false);
        }
    };

    // Generate year options (last 5 years)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    if (loading) return <AdminLayout><Loading /></AdminLayout>;

    return (
        <AdminLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('admin.revenue_analytics')}</h1>

                {/* Filters */}
                <div className="bg-white p-4 rounded-lg shadow-sm flex flex-wrap gap-4 items-end">
                    <div className="w-48">
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                            {t('admin.period')}
                        </label>
                        <select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="input-field"
                        >
                            <option value="day">{t('admin.daily')}</option>
                            <option value="month">{t('admin.monthly')}</option>
                            <option value="year">{t('admin.yearly')}</option>
                        </select>
                    </div>

                    {period === 'day' && (
                        <div className="w-48">
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                                {t('admin.select_date')}
                            </label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="input-field"
                            />
                        </div>
                    )}

                    {period === 'month' && (
                        <>
                            <div className="w-48">
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                                    {t('admin.month')}
                                </label>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                    className="input-field"
                                >
                                    <option value="1">{t('admin.january')}</option>
                                    <option value="2">{t('admin.february')}</option>
                                    <option value="3">{t('admin.march')}</option>
                                    <option value="4">{t('admin.april')}</option>
                                    <option value="5">{t('admin.may')}</option>
                                    <option value="6">{t('admin.june')}</option>
                                    <option value="7">{t('admin.july')}</option>
                                    <option value="8">{t('admin.august')}</option>
                                    <option value="9">{t('admin.september')}</option>
                                    <option value="10">{t('admin.october')}</option>
                                    <option value="11">{t('admin.november')}</option>
                                    <option value="12">{t('admin.december')}</option>
                                </select>
                            </div>
                            <div className="w-32">
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                                    {t('admin.year')}
                                </label>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                    className="input-field"
                                >
                                    {years.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}

                    {period === 'year' && (
                        <div className="w-32">
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                                {t('admin.year')}
                            </label>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                className="input-field"
                            >
                                {years.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* Revenue Over Time */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4">{t('admin.revenue_over_time')}</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="px-4 py-2 text-left">{t('admin.period')}</th>
                                <th className="px-4 py-2 text-left">{t('admin.orders')}</th>
                                <th className="px-4 py-2 text-left">{t('admin.revenue')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {revenueData?.revenueData?.map((item, index) => (
                                <tr key={index} className="border-b">
                                    <td className="px-4 py-2">{item._id}</td>
                                    <td className="px-4 py-2">{item.orders}</td>
                                    <td className="px-4 py-2 font-semibold text-green-600">
                                        {formatVND(item.revenue)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Best Sellers */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">{t('admin.best_selling_products')}</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="px-4 py-2 text-left">{t('admin.product')}</th>
                                <th className="px-4 py-2 text-left">{t('admin.quantity_sold')}</th>
                                <th className="px-4 py-2 text-left">{t('admin.total_revenue')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {revenueData?.bestSellers?.map((item) => (
                                <tr key={item._id} className="border-b">
                                    <td className="px-4 py-2">{item.name}</td>
                                    <td className="px-4 py-2">{item.totalQuantity}</td>
                                    <td className="px-4 py-2 font-semibold text-green-600">
                                        {formatVND(item.totalRevenue)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Revenue;
