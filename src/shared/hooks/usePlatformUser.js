import {useEffect, useState} from 'react';
import {usePlatform} from './usePlatform';
import {useTelegramSdk} from './useTelegramSdk';
import {getVkUser} from '../lib/vk';
import {GUEST_USER} from '../config/env';

const guest = (platform) => ({...GUEST_USER, platform, photoUrl: null, isGuest: true});

const fromInitDataString = () => {
    const raw = window.Telegram?.WebApp?.initData;
    if (!raw) return null;

    try {
        const encoded = new URLSearchParams(raw).get('user');
        return encoded ? JSON.parse(encoded) : null;
    } catch (e) {
        return null;
    }
};

const telegramUser = () => {
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user || fromInitDataString();
    if (!tgUser?.id) return null;

    return {
        id: tgUser.id,
        first_name: tgUser.first_name || '',
        last_name: tgUser.last_name || '',
        username: tgUser.username || '',
        photoUrl: tgUser.photo_url || null,
        platform: 'tg'
    };
};

const sameUser = (a, b) =>
    a?.id === b?.id
    && a?.platform === b?.platform
    && a?.username === b?.username
    && a?.first_name === b?.first_name
    && a?.photoUrl === b?.photoUrl;

const keepIfSame = (prev, next) => (sameUser(prev, next) ? prev : next);

export function usePlatformUser() {
    const {isVk, platform} = usePlatform();
    const sdkToken = useTelegramSdk();

    const [user, setUser] = useState(() => telegramUser() || guest(platform));
    const [isReady, setIsReady] = useState(!isVk);

    useEffect(() => {
        let cancelled = false;

        const fromTelegram = telegramUser();
        if (fromTelegram) {
            setUser((prev) => keepIfSame(prev, fromTelegram));
            setIsReady(true);
            return undefined;
        }

        if (!isVk) {
            setUser((prev) => keepIfSame(prev, guest(platform)));
            setIsReady(true);
            return undefined;
        }

        getVkUser().then((vkUser) => {
            if (cancelled) return;
            setUser((prev) => keepIfSame(prev, vkUser || guest('vk')));
            setIsReady(true);
        });

        return () => {
            cancelled = true;
        };
    }, [isVk, platform, sdkToken]);

    return {user, isUserReady: isReady};
}
