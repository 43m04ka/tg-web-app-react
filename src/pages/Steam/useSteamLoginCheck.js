import {useEffect, useState} from 'react';
import {checkSteamLogin} from '../../shared/api/steam';
import {isLoginValid} from './steamModel';

const DEBOUNCE_MS = 600;

const cache = new Map();

export const LOGIN_CHECK = {
    IDLE: 'idle',
    CHECKING: 'checking',
    OK: 'ok',
    NOT_FOUND: 'not_found',
    UNKNOWN: 'unknown'
};

const keyOf = (login, platform) => `${platform || ''}:${String(login || '').trim().toLowerCase()}`;

export function useSteamLoginCheck(login, platform) {
    const value = String(login || '').trim();
    const isValid = isLoginValid(value);
    const key = keyOf(value, platform);

    const [result, setResult] = useState(() => ({key, status: cache.get(key) || LOGIN_CHECK.IDLE}));

    useEffect(() => {
        if (!isValid) {
            setResult({key, status: LOGIN_CHECK.IDLE});
            return undefined;
        }

        const known = cache.get(key);
        if (known) {
            setResult({key, status: known});
            return undefined;
        }

        setResult({key, status: LOGIN_CHECK.CHECKING});

        const controller = new AbortController();

        const timerId = setTimeout(() => {
            checkSteamLogin(value, platform, controller.signal)
                .then((status) => {
                    if (controller.signal.aborted) return;

                    const next = status === LOGIN_CHECK.OK || status === LOGIN_CHECK.NOT_FOUND
                        ? status
                        : LOGIN_CHECK.UNKNOWN;

                    if (next !== LOGIN_CHECK.UNKNOWN) cache.set(key, next);
                    setResult({key, status: next});
                })
                .catch(() => {
                    if (!controller.signal.aborted) setResult({key, status: LOGIN_CHECK.UNKNOWN});
                });
        }, DEBOUNCE_MS);

        return () => {
            controller.abort();
            clearTimeout(timerId);
        };
    }, [key, value, platform, isValid]);

    if (!isValid) return LOGIN_CHECK.IDLE;
    return result.key === key ? result.status : LOGIN_CHECK.CHECKING;
}
