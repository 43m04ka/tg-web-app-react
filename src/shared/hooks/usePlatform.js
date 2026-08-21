import {useEffect, useState} from 'react';
import {getPlatformState, isSamePlatformState} from '../lib/platform';
import {ensureTelegram, subscribeTelegramSdk} from '../lib/telegram';

export function usePlatform() {
    const [state, setState] = useState(getPlatformState);

    useEffect(() => {
        const sync = () => setState((prev) => {
            const next = getPlatformState();
            return isSamePlatformState(prev, next) ? prev : next;
        });

        ensureTelegram().then(sync);
        return subscribeTelegramSdk(sync);
    }, []);

    return state;
}
