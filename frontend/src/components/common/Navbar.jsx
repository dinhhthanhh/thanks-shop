import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import NotificationBell from '../notifications/NotificationBell';
import { chatAPI } from '../../services/api';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

const Navbar = () => {
    const { user, logout, isAdmin } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { t } = useTranslation();
    const [adminUnreadCount, setAdminUnreadCount] = useState(0);
    const socketRef = useRef(null);

    // Fetch actual unread count for admin
    const fetchUnreadCount = async () => {
        if (!isAdmin) return;
        try {
            const response = await chatAPI.getUnreadCount();
            setAdminUnreadCount(response.data.unreadCount);
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    };

    useEffect(() => {
        if (isAdmin) {
            fetchUnreadCount(); // Initial fetch

            socketRef.current = io(SOCKET_URL);
            socketRef.current.on('connect', () => {
                socketRef.current.emit('join_room', 'admin_room');
            });
            socketRef.current.on('new_admin_message', () => {
                fetchUnreadCount(); // Refresh count on new message
            });
            return () => {
                if (socketRef.current) socketRef.current.disconnect();
            };
        }
    }, [isAdmin]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2 group">
                            <div className="relative">
                                <img src="/thanksshop-logo.svg" alt="Thanks-Shop" className="h-10 w-10 transform group-hover:rotate-12 transition-transform duration-300" />
                                <div className="absolute inset-0 bg-primary-400/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <span className="text-xl font-bold bg-linear-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">Thanks-Shop</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex md:items-center md:space-x-8">
                        <Link to="/" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors uppercase tracking-wider">
                            {t('navbar.home')}
                        </Link>
                        <Link to="/products" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors uppercase tracking-wider">
                            {t('navbar.products')}
                        </Link>

                        {user ? (
                            <div className="flex items-center space-x-6">
                                <Link to="/cart" className="relative text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors uppercase tracking-wider">
                                    {t('navbar.cart')}
                                    {cartCount > 0 && (
                                        <span className="absolute -top-2 -right-4 bg-primary-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>
                                <Link to="/orders" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors uppercase tracking-wider">
                                    {t('navbar.orders')}
                                </Link>
                                {isAdmin && (
                                    <>
                                        <Link to="/admin/dashboard" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors uppercase tracking-wider">
                                            {t('navbar.admin')}
                                        </Link>
                                        <Link to="/admin/chat" className="relative text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors uppercase tracking-wider">
                                            {t('navbar.admin_chat') || 'Admin Chat'}
                                            {adminUnreadCount > 0 && (
                                                <span className="absolute -top-2 -right-4 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                                                    {adminUnreadCount}
                                                </span>
                                            )}
                                        </Link>
                                    </>
                                )}

                                <div className="h-6 w-px bg-gray-100 mx-1"></div>
                                <LanguageSwitcher />

                                {!isAdmin && <NotificationBell />}

                                <div className="relative group">
                                    <button className="flex items-center space-x-2 text-sm font-semibold text-gray-700 hover:text-primary-600 transition-colors bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                        <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-[10px]">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span>{user.name}</span>
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-50">
                                        <Link to="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            {t('navbar.profile')}
                                        </Link>
                                        <div className="my-1 border-t border-gray-50"></div>
                                        <button onClick={handleLogout} className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            {t('navbar.logout')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors uppercase tracking-wider">
                                    {t('navbar.login')}
                                </Link>
                                <div className="h-6 w-px bg-gray-100 mx-1"></div>
                                <LanguageSwitcher />
                                <Link to="/register" className="btn-primary px-5! py-2! text-xs! uppercase! tracking-widest!">
                                    {t('navbar.register')}
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center space-x-4">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="bg-gray-50 p-2 rounded-lg text-gray-600 hover:text-primary-600 border border-gray-100"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {mobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden pb-6 pt-2 animate-fade-in">
                        <div className="space-y-1">
                            <div className="px-4 py-2">
                                <LanguageSwitcher />
                            </div>
                            <Link to="/" className="block py-3 px-4 text-base font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors">
                                {t('navbar.home')}
                            </Link>
                            <Link to="/products" className="block py-3 px-4 text-base font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors">
                                {t('navbar.products')}
                            </Link>
                            {user ? (
                                <>
                                    <Link to="/cart" className="block py-3 px-4 text-base font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors">
                                        {t('navbar.cart')}
                                    </Link>
                                    <Link to="/orders" className="block py-3 px-4 text-base font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors">
                                        {t('navbar.orders')}
                                    </Link>
                                    {isAdmin && (
                                        <Link to="/admin/dashboard" className="block py-3 px-4 text-base font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors">
                                            {t('navbar.admin')}
                                        </Link>
                                    )}
                                    <div className="my-2 border-t border-gray-100"></div>
                                    <Link to="/profile" className="block py-3 px-4 text-base font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors">
                                        {t('navbar.profile')}
                                    </Link>
                                    <button onClick={handleLogout} className="block w-full text-left py-3 px-4 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                        {t('navbar.logout')}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="my-2 border-t border-gray-100"></div>
                                    <Link to="/login" className="block py-3 px-4 text-base font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors">
                                        {t('navbar.login')}
                                    </Link>
                                    <div className="px-4 pt-2">
                                        <Link to="/register" className="btn-primary block text-center">
                                            {t('navbar.register')}
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
