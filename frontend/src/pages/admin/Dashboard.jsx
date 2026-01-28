import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar';
import StatsCard from '../../components/admin/StatsCard';
import Loading from '../../components/common/Loading';

const Dashboard = () => {
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

    if (loading) return <div className="flex"><AdminSidebar /><Loading /></div>;

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="flex-1 p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard
                        title="Total Revenue"
                        value={`$${stats?.totalRevenue?.toFixed(2) || '0.00'}`}
                        icon="💰"
                        color="green"
                    />
                    <StatsCard
                        title="Total Orders"
                        value={stats?.totalOrders || 0}
                        icon="🛒"
                        color="blue"
                    />
                    <StatsCard
                        title="Total Products"
                        value={stats?.totalProducts || 0}
                        icon="📦"
                        color="primary"
                    />
                    <StatsCard
                        title="Low Stock Items"
                        value={stats?.lowStockProducts || 0}
                        icon="⚠️"
                        color="red"
                    />
                </div>

                {/* Orders by Status */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Orders by Status</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stats?.ordersByStatus?.map((item) => (
                            <div key={item._id} className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1 capitalize">{item._id}</p>
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
