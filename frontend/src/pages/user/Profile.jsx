import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ErrorMessage from '../../components/common/ErrorMessage';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const { t } = useTranslation();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password && password !== confirmPassword) {
            setError(t('auth.passwords_not_match'));
            return;
        }

        if (password && password.length < 6) {
            setError(t('auth.password_too_short'));
            return;
        }

        setLoading(true);
        try {
            const data = { name, email };
            if (password) data.password = password;

            const response = await authAPI.updateProfile(data);
            const { token, ...userData } = response.data;

            updateUser(userData);
            setSuccess(t('profile.update_success'));
            setPassword('');
            setConfirmPassword('');
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('profile.title')}</h1>

            <div className="bg-white p-8 rounded-lg shadow-md">
                {error && <ErrorMessage message={error} />}
                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            {t('auth.full_name_label')}
                        </label>
                        <input
                            id="name"
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input-field mt-1"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            {t('auth.email_label')}
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field mt-1"
                        />
                    </div>

                    <div className="border-t pt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('profile.change_password')}</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            {t('profile.leave_blank')}
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    {t('profile.new_password_label')}
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field mt-1"
                                    placeholder={t('profile.new_password_placeholder')}
                                />
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                    {t('profile.confirm_new_password_label')}
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="input-field mt-1"
                                    placeholder={t('profile.confirm_new_password_placeholder')}
                                />
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full">
                        {loading ? t('profile.updating') : t('profile.update_button')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
