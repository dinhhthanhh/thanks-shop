import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import ErrorMessage from '../../components/common/ErrorMessage';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError(t('auth.passwords_not_match'));
            return;
        }

        if (password.length < 6) {
            setError(t('auth.password_too_short'));
            return;
        }

        setLoading(true);
        const result = await register(name, email, password);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900">{t('auth.create_account_title')}</h2>
                    <p className="mt-2 text-sm text-gray-600">{t('auth.join_us')}</p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-md">
                    {error && <ErrorMessage message={error} />}

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
                            placeholder={t('auth.full_name_placeholder')}
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
                            placeholder={t('auth.email_placeholder')}
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            {t('auth.password_label')}
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field mt-1"
                            placeholder={t('auth.password_placeholder')}
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                            {t('auth.confirm_password_label')}
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="input-field mt-1"
                            placeholder={t('auth.confirm_password_placeholder')}
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full">
                        {loading ? t('auth.creating_account') : t('auth.create_account_button')}
                    </button>

                    <p className="text-center text-sm text-gray-600">
                        {t('auth.have_account')}{' '}
                        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                            {t('auth.sign_in_link')}
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;
