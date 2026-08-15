import {useEffect, useState} from 'react';
import vkBridge from '@vkontakte/vk-bridge';
import {usePlatform} from './utils/usePlatform';
import {getTelegramObject} from './utils/isTg';

// Дефолтный гостевой пользователь
const DEFAULT_GUEST = {
    id: 5106439090,
    first_name: 'Гость',
    last_name: '',
    platform: 'web'
};

const vkState = {
    user: null,
    initialized: false,
    initPromise: null
};

export function usePlatformUser() {
    const { isVk, isTg } = usePlatform();

    const [user, setUser] = useState(() => {
        if (isTg) {
            const tg = getTelegramObject();
            if (tg.initDataUnsafe?.user) {
                return { ...tg.initDataUnsafe.user, platform: 'tg' };
            }
        }
        return { ...DEFAULT_GUEST, platform: isVk ? 'vk' : 'web' };
    });

    const [isLoaded, setIsLoaded] = useState(!isVk);

    useEffect(() => {
        if (isTg) {
            const tg = getTelegramObject();
            if (tg.initDataUnsafe?.user) {
                setUser({ ...tg.initDataUnsafe.user, platform: 'tg' });
            } else {
                setUser({ ...DEFAULT_GUEST, platform: 'tg' });
            }
            setIsLoaded(true);
            return;
        }

        if (isVk) {
            if (vkState.user) {
                setUser({ ...vkState.user, platform: 'vk' });
                setIsLoaded(true);
                return;
            }

            if (vkState.initPromise) {
                vkState.initPromise.then(vkUser => {
                    if (vkUser) setUser({ ...vkUser, platform: 'vk' });
                    setIsLoaded(true);
                });
                return;
            }

            vkState.initPromise = (async () => {
                try {
                    await vkBridge.send('VKWebAppInit').catch(() => {});
                    const vkUser = await vkBridge.send('VKWebAppGetUserInfo');
                    vkState.user = vkUser;
                    vkState.initialized = true;

                    setUser({
                        id: vkUser.id,
                        first_name: vkUser.first_name,
                        last_name: vkUser.last_name,
                        platform: 'vk'
                    });
                    return vkUser;
                } catch (e) {
                    console.error('[VK User Init Failed]:', e);
                    setUser({ ...DEFAULT_GUEST, platform: 'vk' });
                    return null;
                } finally {
                    setIsLoaded(true);
                    vkState.initPromise = null;
                }
            })();
        }
    }, [isVk, isTg]);

    return {
        user,
        isVkUserLoaded: isLoaded
    };
}