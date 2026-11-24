import {useCallback, useEffect, useState} from 'react';

const STORAGE_KEY = 'ps_turkey_fulfillment';
const CHANGE_EVENT = 'ps-turkey-fulfillment-change';

const read = () => {
    try {
        return localStorage.getItem(STORAGE_KEY) === 'codes';
    } catch (e) {
        return false;
    }
};

export function useTurkeyCodesMode() {
    const [isCodes, setIsCodes] = useState(read);

    useEffect(() => {
        const sync = () => setIsCodes(read());
        window.addEventListener(CHANGE_EVENT, sync);
        window.addEventListener('storage', sync);
        return () => {
            window.removeEventListener(CHANGE_EVENT, sync);
            window.removeEventListener('storage', sync);
        };
    }, []);

    const setCodes = useCallback((next) => {
        try {
            localStorage.setItem(STORAGE_KEY, next ? 'codes' : 'manager');
        } catch (e) {
        }
        setIsCodes(next);
        window.dispatchEvent(new Event(CHANGE_EVENT));
    }, []);

    return [isCodes, setCodes];
}
