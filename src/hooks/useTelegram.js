import {useEffect, useState} from 'react';
import vkBridge from '@vkontakte/vk-bridge';
import {isTg as isTelegramBrowser, getTelegramObject as getTg} from './utils/isTg';

const checkIsVk = () => vkBridge.isWebView() || vkBridge.isIframe() || window.location.pathname.includes('vk.com');

const vkState = {
    user: null,
    insets: { top: 0, bottom: 0 },
    groupId: null,
    initialized: false,
    initPromise: null,
    bridgeSubscribed: false,
    listeners: new Set()
};

const getVkGroupId = () => {
    const params = new URLSearchParams(window.location.search);
    const vkAppId = params.get('vk_app_id');
    return String(vkAppId) === '54475556' ? 217049080 : 85243268;
};

const notify = () => {
    vkState.listeners.forEach((listener) => listener());
};

const updateVkState = (partial) => {
    Object.assign(vkState, partial);
    notify();
};

const initVk = async () => {
    if (!checkIsVk() || vkState.initialized) return;
    if (vkState.initPromise) return vkState.initPromise;

    vkState.initPromise = (async () => {
        let initSuccess = false;
        updateVkState({ groupId: getVkGroupId() });

        if (!vkState.bridgeSubscribed) {
            vkBridge.subscribe((e) => {
                if (e.detail.type === 'VKWebAppUpdateConfig') {
                    const data = e.detail.data;
                    if (data?.safe_area) {
                        updateVkState({
                            insets: {
                                top: data.safe_area.top || 0,
                                bottom: data.safe_area.bottom || 0
                            }
                        });
                    }
                }
            });
            vkState.bridgeSubscribed = true;
        }

        vkBridge.send('VKWebAppSetViewSettings', { status_bar_style: 'light', action_bar_color: 'none' }).catch(() => {});

        try {
            await vkBridge.send('VKWebAppInit').catch(() => {});
            const user = await vkBridge.send('VKWebAppGetUserInfo');
            updateVkState({ user });
            initSuccess = true;
        } catch (e) {
            console.error('[useTelegram] VK init failed:', e);
        }

        vkState.initialized = initSuccess;
        vkState.initPromise = null;

        if (!initSuccess) setTimeout(() => initVk(), 5000);
    })();

    return vkState.initPromise;
};

if (checkIsVk()) initVk();

export const getUser = () => {
    if (checkIsVk()) {
        if (!vkState.initialized && !vkState.initPromise) initVk();
        return vkState.user
            ? { id: vkState.user.id, first_name: vkState.user.first_name, last_name: vkState.user.last_name, platform: 'vk' }
            : { id: 5106439090, first_name: 'Гость', platform: 'vk' };
    }

    if (isTelegramBrowser()) {
        const currentTg = getTg();
        return currentTg.initDataUnsafe?.user
            ? { ...currentTg.initDataUnsafe.user, platform: 'tg' }
            : { id: 5106439090, first_name: 'Гость', platform: 'tg' };
    }

    return { id: 5106439090, first_name: 'Гость', platform: 'web' };
};

export function useTelegram() {
    const [platformState, setPlatformState] = useState({
        isVkActive: checkIsVk(),
        isTgActive: isTelegramBrowser()
    });

    const [snapshot, setSnapshot] = useState({
        insets: vkState.insets,
        groupId: vkState.groupId
    });

    // Регулярная проверка платформы каждые 2 секунды
    useEffect(() => {
        const checkPlatforms = () => {
            const currentVk = checkIsVk();
            const currentTg = isTelegramBrowser();
            
            setPlatformState(prev => {
                if (prev.isVkActive !== currentVk || prev.isTgActive !== currentTg) {
                    return { isVkActive: currentVk, isTgActive: currentTg };
                }
                return prev;
            });
        };

        const interval = setInterval(checkPlatforms, 2000);
        return () => clearInterval(interval);
    }, []);

    const { isVkActive, isTgActive } = platformState;
    const currentTg = getTg();

    useEffect(() => {
        if (isTgActive && window.Telegram?.WebApp) {
            try { window.Telegram.WebApp.expand(); } catch (e) {}
        }

        if (isVkActive) {
            const onChange = () => {
                setSnapshot({
                    insets: vkState.insets,
                    groupId: vkState.groupId
                });
            };
            vkState.listeners.add(onChange);
            initVk();

            return () => {
                vkState.listeners.delete(onChange);
            };
        }
    }, [isVkActive, isTgActive]);

    const isWebMode = !isVkActive && !isTgActive;

    const contentSafeAreaInset = isVkActive || isWebMode
        ? { top: snapshot.insets?.top || 0, bottom: snapshot.insets?.bottom || 0 }
        : { top: currentTg.contentSafeAreaInset?.top || 0, bottom: currentTg.contentSafeAreaInset?.bottom || 0 };

    return {
        tg: currentTg,
        vkGroupId: snapshot.groupId,
        contentSafeAreaInset
    };
}