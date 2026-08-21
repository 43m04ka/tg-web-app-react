import {useEffect, useState} from 'react';
import {getPlatformState, isSamePlatformState} from '../lib/platform';
import {ensureTelegram, subscribeTelegramReady} from '../lib/telegram';

const POLL_INTERVAL_MS = 500;
const MAX_POLLS = 12;

export function usePlatform() {
    const [state, setState] = useState(getPlatformState);

    useEffect(() => {
        const sync = () => setState((prev) => {
            const next = getPlatformState();
            return isSamePlatformState(prev, next) ? prev : next;
        });

        ensureTelegram().then(sync);
        const unsubscribe = subscribeTelegramReady(sync);

        let polls = 0;
        const intervalId = setInterval(() => {
            polls++;
            sync();
            if (polls >= MAX_POLLS) clearInterval(intervalId);
        }, POLL_INTERVAL_MS);

        return () => {
            unsubscribe();
            clearInterval(intervalId);
        };
    }, []);

    return state;
}
