import {useCallback, useEffect, useState} from 'react';

const STORAGE_KEY = 'admin-theme';

const getInitialTheme = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

const useAdminTheme = () => {
    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    }, []);

    return {theme, toggleTheme};
};

export default useAdminTheme;
