import { useTheme } from '../../context/ThemeContext';

const ThemeDecorator = () => {
    const { theme } = useTheme();

    if (theme === 'default') return null;

    const renderDecorations = () => {
        switch (theme) {
            case 'tet':
                return (
                    <>
                        <div className="absolute top-0 right-0 p-4 animate-bounce pointer-events-none z-10">
                            <span className="text-4xl">🧧</span>
                        </div>
                        <div className="absolute top-20 left-4 animate-pulse pointer-events-none z-10">
                            <span className="text-3xl">🌸</span>
                        </div>
                    </>
                );
            case 'christmas':
                return (
                    <>
                        <div className="absolute top-0 left-0 p-4 animate-pulse pointer-events-none z-10">
                            <span className="text-4xl">❄️</span>
                        </div>
                        <div className="absolute top-10 right-10 animate-fade-in pointer-events-none z-10">
                            <span className="text-5xl">🎄</span>
                        </div>
                    </>
                );
            case 'valentine':
                return (
                    <>
                        <div className="absolute top-10 left-1/4 animate-bounce pointer-events-none z-10">
                            <span className="text-3xl">💖</span>
                        </div>
                        <div className="absolute bottom-20 right-4 animate-pulse pointer-events-none z-10">
                            <span className="text-4xl">💝</span>
                        </div>
                    </>
                );
            case 'april-30':
                return (
                    <>
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 animate-fade-in pointer-events-none z-10">
                            <span className="text-4xl">🇻🇳</span>
                        </div>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none select-none z-[60]">
            {renderDecorations()}
        </div>
    );
};

export default ThemeDecorator;
