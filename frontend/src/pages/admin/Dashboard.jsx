import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { adminAPI } from '../../services/api';
import { formatVND } from '../../utils/url';
import AdminSidebar from '../../components/admin/AdminSidebar';
import StatsCard from '../../components/admin/StatsCard';
import Loading from '../../components/common/Loading';

const Dashboard = () => {
    const { t } = useTranslation();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await adminAPI.getStats();
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    // Order status translations
    const getStatusLabel = (status) => {
        const statusMap = {
            'pending': t('admin.status_pending'),
            'shipped': t('admin.status_shipped'),
            'completed': t('admin.status_completed'),
            'cancelled': t('admin.status_cancelled')
        };
        return statusMap[status] || status;
    };

    if (loading) return <div className="flex"><AdminSidebar /><Loading /></div>;

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="flex-1 p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('admin.dashboard')}</h1>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard
                        title={t('admin.total_revenue')}
                        value={formatVND(stats?.totalRevenue || 0)}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                        color="green"
                    />
                    <StatsCard
                        title={t('admin.total_orders')}
                        value={stats?.totalOrders || 0}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        }
                        color="blue"
                    />
                    <StatsCard
                        title={t('admin.total_products')}
                        value={stats?.totalProducts || 0}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        }
                        color="primary"
                    />
                    <StatsCard
                        title={t('admin.low_stock_items')}
                        value={stats?.lowStockProducts || 0}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        }
                        color="red"
                    />
                </div>

                {/* Orders by Status */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">{t('admin.orders_by_status')}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stats?.ordersByStatus?.map((item) => (
                            <div key={item._id} className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">{getStatusLabel(item._id)}</p>
                                <p className="text-2xl font-bold text-gray-900">{item.count}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
