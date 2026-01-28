import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(localStorage.getItem('seasonal-theme') || 'default');

    useEffect(() => {
        localStorage.setItem('seasonal-theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const themes = {
        default: { name: 'Default', primary: '#0ea5e9' },
        tet: { name: 'Tet Holiday', primary: '#dc2626' },
        christmas: { name: 'Christmas', primary: '#16a34a' },
        valentine: { name: 'Valentine', primary: '#db2777' },
        'april-30': { name: 'Independence Day', primary: '#b91c1c' }
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, themes }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
