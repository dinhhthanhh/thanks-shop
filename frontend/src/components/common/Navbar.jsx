import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import NotificationBell from '../notifications/NotificationBell';
import { chatAPI } from '../../services/api';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BASE_URL = API_URL.replace('/api', '');

const Navbar = () => {
    const { user, logout, isAdmin } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { t } = useTranslation();
    const [adminUnreadCount, setAdminUnreadCount] = useState(0);
    const socketRef = useRef(null);
    const profileRef = useRef(null);

    // Helper to get full avatar URL
    const getAvatarUrl = (avatar) => {
        if (!avatar) return null;
        if (avatar.startsWith('http')) return avatar;
        return `${BASE_URL}${avatar}`;
    };

    // Filter button only on products page
    const isProductsPage = location.pathname === '/products';

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Auto-close menus on route change
    useEffect(() => {
        setMobileMenuOpen(false);
        setProfileOpen(false);
    }, [location.pathname]);

    // Handle clicks outside dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchUnreadCount = useCallback(async () => {
        if (!isAdmin) return;
        try {
            const response = await chatAPI.getUnreadCount();
            setAdminUnreadCount(response.data.unreadCount);
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    }, [isAdmin]);

    useEffect(() => {
        if (!isAdmin) return;

        fetchUnreadCount();
        const socket = io(SOCKET_URL, { transports: ['websocket'] });
        socketRef.current = socket;

        socket.on('connect', () => {
            socket.emit('join_room', 'admin_room');
        });

        socket.on('new_admin_message', fetchUnreadCount);

        return () => {
            socket.off('new_admin_message');
            socket.disconnect();
        };
    }, [isAdmin]);

    const handleLogout = useCallback(() => {
        logout();
        navigate('/login');
    }, [logout, navigate]);

    const handleSearch = useCallback((e) => {
        if (e) e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    }, [searchQuery, navigate]);

    // Live Debounced Search (Nâng cao)
    useEffect(() => {
        if (!searchQuery.trim()) return;

        const timer = setTimeout(() => {
            // Only auto-search if on products page
            if (location.pathname === '/products') {
                navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`, { replace: true });
            }
        }, 600); // 600ms debounce

        return () => clearTimeout(timer);
    }, [searchQuery, location.pathname, navigate]);

    const toggleFilter = useCallback(() => {
        window.dispatchEvent(new CustomEvent('toggle-filters'));
    }, []);

    return (
        <nav className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-3' : 'bg-white py-4'} border-b border-gray-200`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between gap-3 sm:gap-4 lg:gap-6">

                    {/* Logo */}
                    <div className="shrink-0">
                        <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
                            <div className="relative shrink-0">
                                <img
                                    src="/thanksshop-logo.svg"
                                    alt="Thanks-Shop"
                                    className="h-9 w-9 sm:h-11 sm:w-11 transform group-hover:rotate-12 transition-all duration-500"
                                />
                                <div className="absolute inset-0 bg-linear-to-br from-primary-400 to-primary-600 blur-xl rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
                            </div>
                            <span className="text-base sm:text-xl font-bold bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent tracking-tight whitespace-nowrap">
                                Thanks-Shop
                            </span>
                        </Link>
                    </div>


                    {/* Navigation & Actions - Fixed Width */}
                    <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0">

                        {/* Desktop Navigation Links */}
                        <div className="hidden lg:flex items-center gap-1">
                            <Link
                                to="/"
                                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                <span className="whitespace-nowrap">{t('navbar.home')}</span>
                            </Link>
                            <Link
                                to="/products"
                                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                <span className="whitespace-nowrap">{t('navbar.products')}</span>
                            </Link>
                            {user && !isAdmin && (
                                <Link
                                    to="/orders"
                                    className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    <span className="whitespace-nowrap">{t('navbar.orders')}</span>
                                </Link>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="h-8 w-px bg-linear-to-b from-transparent via-gray-300 to-transparent hidden lg:block"></div>

                        {/* Cart Icon */}
                        {user && !isAdmin && (
                            <Link
                                to="/cart"
                                aria-label={t('navbar.cart') || 'Cart'}
                                className="relative flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200 group"
                            >
                                <div className="relative">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    {cartCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-linear-to-br from-red-500 to-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg animate-pulse">
                                            {cartCount}
                                        </span>
                                    )}
                                </div>
                                <span className="hidden xl:block text-sm font-semibold whitespace-nowrap">{t('navbar.cart') || 'Giỏ hàng'}</span>
                            </Link>
                        )}


                        {/* User Profile or Login */}
                        {user ? (
                            <div className="flex items-center gap-2">
                                {!isAdmin && <NotificationBell />}
                                <div className="relative" ref={profileRef}>
                                    <button
                                        onClick={() => setProfileOpen(!profileOpen)}
                                        aria-expanded={profileOpen}
                                        aria-haspopup="true"
                                        aria-label="User profile"
                                        className="flex items-center gap-2 px-2 py-2 bg-linear-to-r from-gray-50 to-gray-100 hover:from-white hover:to-gray-50 rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
                                    >
                                        <div className="w-9 h-9 bg-linear-to-br from-primary-500 to-primary-700 text-white rounded-full flex items-center justify-center text-base shadow-md font-bold overflow-hidden shrink-0">
                                            {user.avatar ? (
                                                <img src={getAvatarUrl(user.avatar)} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                (user.name?.charAt(0) || 'U').toUpperCase()
                                            )}
                                        </div>
                                        <span className="hidden md:inline text-sm font-semibold text-gray-800 pr-2 max-w-[120px] truncate">
                                            {user.name}
                                        </span>
                                    </button>

                                    {/* Dropdown Menu */}
                                    <div className={`absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl py-2 transition-all duration-300 border border-gray-100 origin-top-right z-50 ${profileOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'}`}>
                                        {isAdmin && (
                                            <>
                                                <Link
                                                    to="/admin/dashboard"
                                                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                    </svg>
                                                    {t('navbar.admin')}
                                                </Link>
                                                <Link
                                                    to="/admin/chat"
                                                    className="flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                                        </svg>
                                                        <span>{t('navbar.admin_chat') || 'Admin Chat'}</span>
                                                    </div>
                                                    {adminUnreadCount > 0 && (
                                                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                                            {adminUnreadCount}
                                                        </span>
                                                    )}
                                                </Link>
                                                <div className="my-1 border-t border-gray-100"></div>
                                            </>
                                        )}
                                        <Link
                                            to="/profile"
                                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            {t('navbar.profile')}
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors rounded-b-2xl"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            {t('navbar.logout')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="px-5 py-2 bg-linear-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 whitespace-nowrap"
                            >
                                {t('navbar.login')}
                            </Link>
                        )}

                        {/* Language Switcher */}
                        <div className="hidden sm:block">
                            <LanguageSwitcher />
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle mobile menu"
                            aria-expanded={mobileMenuOpen}
                            className="md:hidden p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200"
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
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-linear-to-b from-white to-gray-50 border-t border-gray-200 shadow-xl">
                    <div className="p-4 space-y-4">

                        {/* Mobile Navigation Links */}
                        <div className="space-y-2">
                            <Link
                                to="/"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3 p-3 text-sm font-semibold text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                {t('navbar.home')}
                            </Link>
                            <Link
                                to="/products"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3 p-3 text-sm font-semibold text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                {t('navbar.products')}
                            </Link>
                            {user ? (
                                <>
                                    {!isAdmin && (
                                        <Link
                                            to="/orders"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center gap-3 p-3 text-sm font-semibold text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                            {t('navbar.orders')}
                                        </Link>
                                    )}
                                    <div className="pt-2 mt-2 border-t border-gray-200">
                                        <Link
                                            to="/profile"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center gap-3 p-3 text-sm font-semibold text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            {t('navbar.profile')}
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 w-full text-left p-3 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            {t('navbar.logout')}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <Link
                                    to="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block text-center px-5 py-3 bg-linear-to-r from-primary-600 to-primary-700 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all mt-4"
                                >
                                    {t('navbar.login')}
                                </Link>
                            )}
                        </div>

                        {/* Language Switcher */}
                        <div className="pt-4 flex justify-center border-t border-gray-200">
                            <LanguageSwitcher />
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
