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
            className="group flex items-center space-x-1.5 bg-gray-50 hover:bg-white px-2 py-1 rounded-full border border-gray-100 hover:border-primary-200 transition-all duration-300 shadow-xs active:scale-95"
        >
            <span className="text-base filter group-hover:drop-shadow-sm transition-all">
                {isVi ? '🇻🇳' : '🇺🇸'}
            </span>
            <span className="text-[10px] font-bold text-gray-500 group-hover:text-primary-600 uppercase tracking-tighter">
                {isVi ? 'VN' : 'EN'}
            </span>
        </button>
    );
};

export default LanguageSwitcher;
