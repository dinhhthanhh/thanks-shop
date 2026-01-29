import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t } = useTranslation();

    return (
        <footer className="bg-premium-dark text-white mt-auto overflow-hidden relative">
            {/* Decorative background light */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <Link to="/" className="flex items-center space-x-2 group w-fit">
                            <img src="/thanksshop-logo.svg" alt="Thanks-Shop" className="h-10 w-10 brightness-110" />
                            <span className="text-2xl font-black tracking-tighter italic bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">Thanks-Shop</span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                            {t('footer.about_text')}
                        </p>
                        <div className="flex items-center space-x-4">
                            {['facebook', 'instagram', 'twitter', 'youtube'].map((platform) => (
                                <a key={platform} href="#" className="w-10 h-10 rounded-xl bg-gray-800/50 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all duration-300 transform hover:-translate-y-1 border border-gray-700/50">
                                    <span className="sr-only">{platform}</span>
                                    {/* Using generic SVG icons for mockup purposes */}
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                                    </svg>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="grid grid-cols-2 gap-8 lg:col-span-2">
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-primary-400">{t('footer.quick_links')}</h3>
                            <ul className="space-y-4 text-sm font-medium">
                                <li>
                                    <Link to="/products" className="text-gray-400 hover:text-white transition-colors flex items-center group">
                                        <span className="w-0 group-hover:w-2 h-0.5 bg-primary-500 mr-0 group-hover:mr-2 transition-all"></span>
                                        {t('navbar.products')}
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/cart" className="text-gray-400 hover:text-white transition-colors flex items-center group">
                                        <span className="w-0 group-hover:w-2 h-0.5 bg-primary-500 mr-0 group-hover:mr-2 transition-all"></span>
                                        {t('navbar.cart')}
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/orders" className="text-gray-400 hover:text-white transition-colors flex items-center group">
                                        <span className="w-0 group-hover:w-2 h-0.5 bg-primary-500 mr-0 group-hover:mr-2 transition-all"></span>
                                        {t('navbar.orders')}
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/profile" className="text-gray-400 hover:text-white transition-colors flex items-center group">
                                        <span className="w-0 group-hover:w-2 h-0.5 bg-primary-500 mr-0 group-hover:mr-2 transition-all"></span>
                                        {t('navbar.profile')}
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-primary-400">{t('footer.contact_us')}</h3>
                            <ul className="space-y-4 text-sm text-gray-400">
                                <li className="flex items-start space-x-3">
                                    <svg className="w-5 h-5 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span>dinhhthanhhlove@gmail.com</span>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <svg className="w-5 h-5 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <span>+84 911 083 919</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Stay Updated */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-primary-400">Stay Updated</h3>
                        <p className="text-gray-400 text-sm">Join our newsletter for the latest products and offers.</p>
                        <form className="relative group">
                            <input
                                type="email"
                                placeholder="Email address"
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-white placeholder:text-gray-600"
                            />
                            <button className="absolute right-2 top-2 bottom-2 bg-primary-600 hover:bg-primary-700 px-4 rounded-lg text-white transition-all shadow-lg active:scale-95">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800/50 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <p className="text-gray-500 text-xs text-center font-medium">
                        &copy; {new Date().getFullYear()} <span className="text-gray-300">Thanks-Shop</span>. {t('footer.all_rights')}
                    </p>
                    <div className="flex items-center space-x-6">
                        <div className="flex space-x-2">
                            {['Visa', 'MasterCard', 'PayPal'].map(p => (
                                <div key={p} className="h-6 w-10 bg-gray-800/80 rounded border border-gray-700/50 flex items-center justify-center text-[8px] text-gray-500 font-bold uppercase">{p}</div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
