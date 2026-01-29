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
        <nav className="glass-effect sticky top-0 z-50 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2 group">
                            <div className="relative">
                                <img src="/thanksshop-logo.svg" alt="Thanks-Shop" className="h-10 w-10 transform group-hover:rotate-12 transition-all duration-500 group-hover:drop-shadow-[0_0_15px_rgba(var(--primary-600-rgb,2,132,199),0.6)]" />
                                <div className="absolute inset-0 bg-primary-400/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <span className="text-xl font-black bg-linear-to-r from-primary-600 via-primary-500 to-primary-400 bg-clip-text text-transparent tracking-tighter italic">Thanks-Shop</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex md:items-center md:space-x-8">
                        <Link to="/" className="nav-link">
                            {t('navbar.home')}
                        </Link>
                        <Link to="/products" className="nav-link">
                            {t('navbar.products')}
                        </Link>

                        {user ? (
                            <div className="flex items-center space-x-6">
                                <Link to="/cart" className="relative group/cart nav-link">
                                    {t('navbar.cart')}
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1 -right-3 bg-primary-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center animate-bounce shadow-md">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>
                                <Link to="/orders" className="nav-link">
                                    {t('navbar.orders')}
                                </Link>
                                {isAdmin && (
                                    <>
                                        <Link to="/admin/dashboard" className="nav-link">
                                            {t('navbar.admin')}
                                        </Link>
                                        <Link to="/admin/chat" className="relative nav-link">
                                            {t('navbar.admin_chat') || 'Admin Chat'}
                                            {adminUnreadCount > 0 && (
                                                <span className="absolute -top-1 -right-3 bg-red-500 text-white text-[9px] font-bold rounded-full h-3.5 w-3.5 flex items-center justify-center animate-pulse shadow-sm">
                                                    {adminUnreadCount}
                                                </span>
                                            )}
                                        </Link>
                                    </>
                                )}

                                <div className="h-4 w-px bg-gray-200 mx-1"></div>

                                {!isAdmin && <NotificationBell />}

                                <div className="relative group">
                                    <button className="flex items-center space-x-2 text-sm font-semibold text-gray-700 hover:text-primary-600 transition-all bg-white/50 hover:bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-xs">
                                        <div className="w-6 h-6 bg-linear-to-br from-primary-500 to-primary-700 text-white rounded-full flex items-center justify-center text-[10px] shadow-sm">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span>{user.name}</span>
                                        <svg className="w-4 h-4 text-gray-400 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 border border-gray-100/50 scale-95 group-hover:scale-100 origin-top-right">
                                        <Link to="/profile" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors">
                                            <svg className="w-4 h-4 mr-3 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            {t('navbar.profile')}
                                        </Link>
                                        <div className="my-1 border-t border-gray-50"></div>
                                        <button onClick={handleLogout} className="flex items-center w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            {t('navbar.logout')}
                                        </button>
                                    </div>
                                </div>

                                <LanguageSwitcher />
                            </div>
                        ) : (
                            <div className="flex items-center space-x-6">
                                <Link to="/login" className="nav-link">
                                    {t('navbar.login')}
                                </Link>
                                <Link to="/register" className="btn-primary px-6! py-2! text-[11px]! uppercase! tracking-widest! shadow-primary-500/20">
                                    {t('navbar.register')}
                                </Link>
                                <div className="h-4 w-px bg-gray-200 mx-1"></div>
                                <LanguageSwitcher />
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center space-x-4">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="bg-white/50 backdrop-blur-sm p-2 rounded-xl text-gray-600 hover:text-primary-600 border border-gray-100 transition-all active:scale-95 shadow-sm"
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
                    <div className="md:hidden pb-6 pt-2 animate-fade-in-up">
                        <div className="space-y-1 bg-white/50 backdrop-blur-xl rounded-2xl p-2 border border-white/20 shadow-xl">
                            <Link to="/" className="block py-3 px-4 text-base font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-colors">
                                {t('navbar.home')}
                            </Link>
                            <Link to="/products" className="block py-3 px-4 text-base font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-colors">
                                {t('navbar.products')}
                            </Link>
                            {user ? (
                                <>
                                    <Link to="/cart" className="block py-3 px-4 text-base font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-colors">
                                        {t('navbar.cart')}
                                    </Link>
                                    <Link to="/orders" className="block py-3 px-4 text-base font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-colors">
                                        {t('navbar.orders')}
                                    </Link>
                                    {isAdmin && (
                                        <Link to="/admin/dashboard" className="block py-3 px-4 text-base font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-colors">
                                            {t('navbar.admin')}
                                        </Link>
                                    )}
                                    <div className="my-2 border-t border-gray-100"></div>
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <Link to="/profile" className="text-base font-medium text-gray-700 hover:text-primary-600 transition-colors">
                                            {t('navbar.profile')}
                                        </Link>
                                        <button onClick={handleLogout} className="text-base font-medium text-red-600 hover:text-red-700 transition-colors">
                                            {t('navbar.logout')}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="my-2 border-t border-gray-100"></div>
                                    <Link to="/login" className="block py-3 px-4 text-base font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-colors">
                                        {t('navbar.login')}
                                    </Link>
                                    <div className="px-4 pt-2">
                                        <Link to="/register" className="btn-primary block text-center rounded-xl">
                                            {t('navbar.register')}
                                        </Link>
                                    </div>
                                </>
                            )}
                            <div className="mt-4 px-4 py-2 border-t border-gray-100">
                                <LanguageSwitcher />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
