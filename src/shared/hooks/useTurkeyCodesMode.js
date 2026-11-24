import {useCallback, useEffect, useState} from 'react';
import {request} from '../api/client';

const STORAGE_KEY = 'ps_turkey_fulfillment';
const CHANGE_EVENT = 'ps-turkey-fulfillment-change';

const DEFAULT_METHODS = {manager: true, codes: true};

let methodsCache = null;
let methodsPromise = null;

const loadMethods = () => {
    if (methodsCache) return Promise.resolve(methodsCache);
    if (!methodsPromise) {
        methodsPromise = request('/api/admin/settings/public', {retries: 1})
            .then((payload) => {
                const raw = payload?.settings?.ps_turkey_methods?.value;
                methodsCache = {
                    manager: !raw || raw.manager !== false,
                    codes: Boolean(raw && raw.codes === true)
                };
                return methodsCache;
            })
            .catch(() => DEFAULT_METHODS);
    }
    return methodsPromise;
};

const read = () => {
    try {
        return localStorage.getItem(STORAGE_KEY) === 'codes';
    } catch (e) {
        return false;
    }
};

export function useTurkeyCodesMode() {
    const [isCodes, setIsCodes] = useState(read);
    const [methods, setMethods] = useState(methodsCache || DEFAULT_METHODS);

    useEffect(() => {
        let alive = true;
        loadMethods().then((next) => {
            if (alive) setMethods(next);
        });
        return () => {
            alive = false;
        };
    }, []);

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

    const effectiveCodes = methods.codes ? (methods.manager ? isCodes : true) : false;

    return [effectiveCodes, setCodes, methods];
}
