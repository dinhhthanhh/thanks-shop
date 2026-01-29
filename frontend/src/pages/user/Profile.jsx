import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ErrorMessage from '../../components/common/ErrorMessage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BASE_URL = API_URL.replace('/api', '');

const Profile = () => {
    const { user, updateUser } = useAuth();
    const { t } = useTranslation();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [avatar, setAvatar] = useState(user?.avatar || '');
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar ? (user.avatar.startsWith('http') ? user.avatar : `${BASE_URL}${user.avatar}`) : null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result);
        };
        reader.readAsDataURL(file);

        // Upload
        const formData = new FormData();
        formData.append('avatar', file);

        setUploading(true);
        setError('');
        try {
            const response = await authAPI.uploadAvatar(formData);
            setAvatar(response.data.avatar);
            setSuccess(t('profile.avatar_update_success') || 'Ảnh đại diện đã được cập nhật!');

            // Update user context immediately
            updateUser({ ...user, avatar: response.data.avatar });
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to upload avatar');
        } finally {
            setUploading(false);
        }
    };

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
            const data = { name, email, avatar };
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

                {/* Avatar Upload Section */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-input').click()}>
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary-50 shadow-lg relative bg-gray-100 flex items-center justify-center">
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                            ) : (
                                <span className="text-3xl font-bold text-gray-400">{user?.name?.charAt(0).toUpperCase()}</span>
                            )}
                            {uploading && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>
                        <div className="absolute bottom-0 right-0 bg-primary-600 text-white p-1.5 rounded-full shadow-lg border-2 border-white transform translate-x-1 translate-y-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <input
                            id="avatar-input"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            disabled={uploading}
                        />
                    </div>
                    <p className="mt-2 text-xs text-gray-500 font-medium">Nhấn để thay đổi ảnh đại diện</p>
                </div>

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
