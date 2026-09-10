import {useCallback, useEffect, useState} from 'react';

const STORAGE_KEY = 'admin2.theme';

const read = () => {
    try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        return saved === 'light' || saved === 'dark' ? saved : 'dark';
    } catch {
        return 'dark';
    }
};

export const useTheme = () => {
    const [theme, setTheme] = useState(read);

    useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEY, theme);
        } catch {
            void 0;
        }
    }, [theme]);

    const toggle = useCallback(() => {
        setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
    }, []);

    return {theme, setTheme, toggle};
};
