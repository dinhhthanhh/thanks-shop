import { useState } from 'react';
import { settingsAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/admin/AdminLayout';

const Settings = () => {
    const { theme, setTheme, themes } = useTheme();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleThemeChange = async (newTheme) => {
        setLoading(true);
        try {
            await settingsAPI.updateTheme(newTheme);
            setTheme(newTheme);
            setMessage(t('admin.settings_updated'));
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error updating theme:', error);
            setMessage(t('admin.operation_failed_error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <h1 className="text-3xl font-bold mb-8 text-gray-900">{t('admin.settings')}</h1>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 max-w-4xl">
                <h2 className="text-xl font-semibold mb-2">{t('admin.shop_settings')}</h2>
                <p className="text-gray-500 mb-8">{t('admin.category_management_subtitle')}</p>

                {message && (
                    <div className={`mb-6 p-4 rounded-xl ${message === t('admin.settings_updated') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {message}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(themes).map(([key, value]) => (
                        <button
                            key={key}
                            onClick={() => handleThemeChange(key)}
                            disabled={loading}
                            className={`relative group p-6 rounded-2xl border-2 transition-all duration-300 text-left ${theme === key
                                ? 'border-primary-600 bg-primary-50/30'
                                : 'border-gray-100 hover:border-primary-200 bg-white'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div
                                    className="w-8 h-8 rounded-full shadow-inner"
                                    style={{ backgroundColor: value.primary }}
                                ></div>
                                {theme === key && (
                                    <div className="bg-primary-600 text-white rounded-full p-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors uppercase tracking-wide text-sm">{value.name}</h3>
                            <p className="text-xs text-gray-400 mt-1">Active theme</p>

                            {key !== 'default' && (
                                <div className="mt-4 text-2xl opacity-50">
                                    {key === 'tet' && '🧧🌸'}
                                    {key === 'christmas' && '❄️🎄'}
                                    {key === 'valentine' && '💖💝'}
                                    {key === 'april-30' && '🇻🇳⭐'}
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
};

export default Settings;
