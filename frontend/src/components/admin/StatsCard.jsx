const StatsCard = ({ title, value, icon, color = 'primary' }) => {
    const colorClasses = {
        primary: 'bg-primary-100 text-primary-600',
        green: 'bg-green-100 text-green-600',
        blue: 'bg-blue-100 text-blue-600',
        yellow: 'bg-yellow-100 text-yellow-600',
        red: 'bg-red-100 text-red-600',
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
                <div className={`p-3 rounded-full ${colorClasses[color]}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
};

export default StatsCard;
