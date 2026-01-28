import { Link, useLocation } from 'react-router-dom';

const AdminSidebar = () => {
    const location = useLocation();

    const menuItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/admin/products', label: 'Products', icon: '📦' },
        { path: '/admin/orders', label: 'Orders', icon: '🛒' },
        { path: '/admin/inventory', label: 'Inventory', icon: '📋' },
        { path: '/admin/revenue', label: 'Revenue', icon: '💰' },
    ];

    return (
        <div className="bg-gray-800 text-white w-64 min-h-screen p-4">
            <div className="mb-8">
                <h2 className="text-2xl font-bold">Admin Panel</h2>
            </div>
            <nav className="space-y-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === item.path
                                ? 'bg-primary-600 text-white'
                                : 'text-gray-300 hover:bg-gray-700'
                            }`}
                    >
                        <span className="text-xl">{item.icon}</span>
                        <span>{item.label}</span>
                    </Link>
                ))}
                <Link
                    to="/"
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
                >
                    <span className="text-xl">🏠</span>
                    <span>Back to Store</span>
                </Link>
            </nav>
        </div>
    );
};

export default AdminSidebar;
