import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Loading from '../../components/common/Loading';

const Revenue = () => {
    const [revenueData, setRevenueData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('month');

    useEffect(() => {
        fetchRevenue();
    }, [period]);

    const fetchRevenue = async () => {
        setLoading(true);
        try {
            const response = await adminAPI.getRevenue({ period });
            setRevenueData(response.data);
        } catch (error) {
            console.error('Error fetching revenue:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex"><AdminSidebar /><Loading /></div>;

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="flex-1 p-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Revenue Analytics</h1>
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="border rounded px-4 py-2"
                    >
                        <option value="day">Daily</option>
                        <option value="week">Weekly</option>
                        <option value="month">Monthly</option>
                    </select>
                </div>

                {/* Revenue Over Time */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h2 className="text-xl font-semibold mb-4">Revenue Over Time</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="px-4 py-2 text-left">Period</th>
                                    <th className="px-4 py-2 text-left">Orders</th>
                                    <th className="px-4 py-2 text-left">Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {revenueData?.revenueData?.map((item, index) => (
                                    <tr key={index} className="border-b">
                                        <td className="px-4 py-2">{item._id}</td>
                                        <td className="px-4 py-2">{item.orders}</td>
                                        <td className="px-4 py-2 font-semibold text-green-600">
                                            ${item.revenue.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Best Sellers */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Best Selling Products</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="px-4 py-2 text-left">Product</th>
                                    <th className="px-4 py-2 text-left">Quantity Sold</th>
                                    <th className="px-4 py-2 text-left">Total Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {revenueData?.bestSellers?.map((item) => (
                                    <tr key={item._id} className="border-b">
                                        <td className="px-4 py-2">{item.name}</td>
                                        <td className="px-4 py-2">{item.totalQuantity}</td>
                                        <td className="px-4 py-2 font-semibold text-green-600">
                                            ${item.totalRevenue.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Revenue;
