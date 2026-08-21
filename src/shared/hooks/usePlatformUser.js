import {useEffect, useState} from 'react';
import {usePlatform} from './usePlatform';
import {getTelegramObject} from '../lib/telegram';
import {getVkUser} from '../lib/vk';
import {GUEST_USER} from '../config/env';

const guest = (platform) => ({...GUEST_USER, platform});

const resolveTelegramUser = () => {
    const tgUser = getTelegramObject().initDataUnsafe?.user;
    return tgUser ? {...tgUser, platform: 'tg'} : guest('tg');
};

export function usePlatformUser() {
    const {isVk, isTg, platform} = usePlatform();

    const [user, setUser] = useState(() => (isTg ? resolveTelegramUser() : guest(platform)));
    const [isReady, setIsReady] = useState(!isVk);

    useEffect(() => {
        let cancelled = false;

        if (isTg) {
            setUser(resolveTelegramUser());
            setIsReady(true);
            return;
        }

        if (!isVk) {
            setUser(guest('web'));
            setIsReady(true);
            return;
        }

        getVkUser().then((vkUser) => {
            if (cancelled) return;
            setUser(vkUser || guest('vk'));
            setIsReady(true);
        });

        return () => {
            cancelled = true;
        };
    }, [isVk, isTg]);

    return {user, isUserReady: isReady};
}
