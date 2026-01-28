import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="flex items-center bg-gray-100/50 p-1 rounded-xl border border-gray-200 shadow-inner">
            <button
                onClick={() => changeLanguage('vi')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all duration-300 ${i18n.language === 'vi'
                        ? 'bg-white shadow-sm text-primary-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
            >
                <span className="text-xl">🇻🇳</span>
                <span className="text-[10px] font-black uppercase tracking-widest">VN</span>
            </button>
            <button
                onClick={() => changeLanguage('en')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all duration-300 ${i18n.language.startsWith('en')
                        ? 'bg-white shadow-sm text-primary-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
            >
                <span className="text-xl">🇺🇸</span>
                <span className="text-[10px] font-black uppercase tracking-widest">EN</span>
            </button>
        </div>
    );
};

export default LanguageSwitcher;
