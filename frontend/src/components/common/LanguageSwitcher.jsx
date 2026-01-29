import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'vi' ? 'en' : 'vi';
        i18n.changeLanguage(newLang);
    };

    const isVi = i18n.language === 'vi';

    return (
        <button
            onClick={toggleLanguage}
            title={isVi ? "Switch to English" : "Chuyển sang Tiếng Việt"}
            className="group flex items-center space-x-2 bg-white/50 hover:bg-white px-3 py-1.5 rounded-xl border border-gray-100 hover:border-primary-200 transition-all duration-300 shadow-sm active:scale-95"
        >
            <span className="text-lg filter group-hover:drop-shadow-sm transition-all transform group-hover:scale-110">
                {isVi ? '🇻🇳' : '🇺🇸'}
            </span>
            <span className="text-[11px] font-black text-gray-500 group-hover:text-primary-600 uppercase tracking-widest">
                {isVi ? 'VN' : 'EN'}
            </span>
        </button>
    );
};

export default LanguageSwitcher;
