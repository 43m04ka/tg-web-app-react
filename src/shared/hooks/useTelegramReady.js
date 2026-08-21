import {useEffect, useState} from 'react';
import {ensureTelegram, isTelegramReady, subscribeTelegramReady} from '../lib/telegram';

export function useTelegramReady() {
    const [ready, setReady] = useState(isTelegramReady);

    useEffect(() => {
        if (ready) return;

        ensureTelegram();
        return subscribeTelegramReady(() => setReady(true));
    }, [ready]);

    return ready;
}
