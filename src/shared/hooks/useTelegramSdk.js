import {useEffect, useState} from 'react';
import {ensureTelegram, getTelegramSdkToken, subscribeTelegramSdk} from '../lib/telegram';

export function useTelegramSdk() {
    const [token, setToken] = useState(getTelegramSdkToken);

    useEffect(() => {
        ensureTelegram();
        return subscribeTelegramSdk(setToken);
    }, []);

    return token;
}
