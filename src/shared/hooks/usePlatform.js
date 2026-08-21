import {useEffect, useState} from 'react';
import {getPlatformState, isSamePlatformState} from '../lib/platform';

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 10;

export function usePlatform() {
    const [state, setState] = useState(getPlatformState);

    useEffect(() => {
        let polls = 0;

        const intervalId = setInterval(() => {
            polls++;
            setState((prev) => {
                const next = getPlatformState();
                return isSamePlatformState(prev, next) ? prev : next;
            });
            if (polls >= MAX_POLLS) clearInterval(intervalId);
        }, POLL_INTERVAL_MS);

        return () => clearInterval(intervalId);
    }, []);

    return state;
}
