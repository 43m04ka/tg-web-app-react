import React, { useState, useEffect } from 'react';
import vkBridge from '@vkontakte/vk-bridge';

const isVk = vkBridge.isWebView() || vkBridge.isIframe() || window.location.pathname.includes('vk.com');
function isTelegramBrowser() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    return (
        /Telegram/i.test(ua) ||    
        /TRS/i.test(ua) ||               
        (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData)
    );
}
const isTg = isTelegramBrowser();

const mockListeners = {};
const notifyMock = (evt) => {
    if (mockListeners[evt]) mockListeners[evt].forEach(cb => cb());
};

const defaultTgMock = {
    close: () => {},
    expand: () => {},
    MainButton: { isVisible: false, hide: () => {}, show: () => {} },
    BackButton: { 
        isVisible: false,
        show: function() { this.isVisible = true; notifyMock('backButtonChange'); }, 
        hide: function() { this.isVisible = false; notifyMock('backButtonChange'); } 
    },
    onEvent: (evt, clb) => {
        if (!mockListeners[evt]) mockListeners[evt] = new Set();
        mockListeners[evt].add(clb);
    },
    offEvent: (evt, clb) => {
        if (mockListeners[evt]) mockListeners[evt].delete(clb);
    },
    initDataUnsafe: {},
    safeAreaInset: { top: 0, bottom: 0 },
    contentSafeAreaInset: { top: 0, bottom: 0 }
};

const tg = (isTg && window.Telegram?.WebApp) ? window.Telegram.WebApp : defaultTgMock;

export const clickMockBackButton = () => notifyMock('backButtonClicked');
export const useMockBackButton = () => {
    const [isVisible, setIsVisible] = useState(tg.BackButton?.isVisible || false);
    useEffect(() => {
        const updater = () => setIsVisible(tg.BackButton.isVisible);
        if (!mockListeners['backButtonChange']) mockListeners['backButtonChange'] = new Set();
        mockListeners['backButtonChange'].add(updater);
        updater();
        return () => {
            if (mockListeners['backButtonChange']) mockListeners['backButtonChange'].delete(updater);
        }
    }, []);
    return isVisible;
};

const vkState = {
    user: null,
    insets: { top: 0, bottom: 0 },
    groupId: null,
    initialized: false,
    initPromise: null,
    bridgeSubscribed: false,
    listeners: new Set()
};

export const getBotType = () => {
    if (isVk) {
        return String(vkState.groupId) === '217049080' ? 'vk-xbox' : 'vk-ps';
    }

    if (isTg) {
        return 'tg';
    }

    return 'web';
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
    console.log('[useTelegram] vkState updated:', {
        user: vkState.user,
        insets: vkState.insets,
        groupId: vkState.groupId,
        initialized: vkState.initialized
    });
    notify();
};

const initVk = async () => {
    if (!isVk || vkState.initialized) return;
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

        vkBridge.send('VKWebAppSetViewSettings', {
            status_bar_style: 'light',
            action_bar_color: 'none'
        }).catch(() => {});

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

        if (!initSuccess) {
            setTimeout(() => initVk(), 5000);
        }
    })();

    return vkState.initPromise;
};

if (isVk) {
    initVk();
}

export const getUser = () => {
    if (isVk) {
        if (!vkState.initialized && !vkState.initPromise) {
            initVk();
        }
        return vkState.user
            ? { id: vkState.user.id, first_name: vkState.user.first_name, last_name: vkState.user.last_name, platform: 'vk' }
            : { id: 5106439090, first_name: 'Гость', platform: 'vk' };
    }

    if (isTg) {
        return tg.initDataUnsafe?.user
            ? { ...tg.initDataUnsafe.user, platform: 'tg' }
            : { id: 5106439090, first_name: 'Гость', platform: 'tg' };
    }

    return { id: 5106439090, first_name: 'Гость', platform: 'web' };
};

export function useTelegram() {
    const [snapshot, setSnapshot] = useState({
        user: vkState.user,
        insets: vkState.insets,
        groupId: vkState.groupId
    });

    useEffect(() => {
        if (!isVk) return;

        const onChange = () => {
            setSnapshot({
                user: vkState.user,
                insets: vkState.insets,
                groupId: vkState.groupId
            });
        };

        vkState.listeners.add(onChange);
        initVk();

        return () => {
            vkState.listeners.delete(onChange);
        };
    }, []);

    const onClose = () => {
        if (isVk) {
            vkBridge.send('VKWebAppClose', { status: 'success' });
        } else {
            tg.close();
        }
    };

    const onToggleButton = () => {
        if (isVk) return;
        if (tg.MainButton.isVisible) {
            tg.MainButton.hide();
        } else {
            tg.MainButton.show();
        }
    };

    const expand = () => {
        if (isVk) return;
        tg.expand();
    };

    const user = isVk
        ? (snapshot.user
            ? { id: snapshot.user.id, first_name: snapshot.user.first_name, last_name: snapshot.user.last_name, platform: 'vk' }
            : { id: 5106439090, first_name: 'Гость', platform: 'vk' })
        : (isTg
            ? (tg.initDataUnsafe?.user ? { ...tg.initDataUnsafe.user, platform: 'tg' } : { id: 5106439090, first_name: 'Гость', platform: 'tg' })
            : { id: 5106439090, first_name: 'Гость', platform: 'web' });

    const isWebMode = !isVk && !isTg;
    const isMockBackButtonVisible = useMockBackButton();
    const mockTopInset = isMockBackButtonVisible && (isVk || isWebMode) ? 45 : 0;

    const safeAreaInset = isVk || isWebMode
        ? { top: (snapshot.insets?.top || 0) + mockTopInset, bottom: snapshot.insets?.bottom || 0 }
        : {
            top: tg.safeAreaInset?.top || 0,
            bottom: tg.safeAreaInset?.bottom || 0
        };

    const contentSafeAreaInset = isVk || isWebMode
        ? { top: snapshot.insets?.top || 0, bottom: snapshot.insets?.bottom || 0 }
        : {
            top: tg.contentSafeAreaInset?.top || 0,
            bottom: tg.contentSafeAreaInset?.bottom || 0
        };

    const botType = getBotType();

    return {
        onClose, onToggleButton, expand, tg,
        user,
        isVk,
        isVkUserLoaded: !isVk || !!snapshot.user,
        isTg,
        isWeb: !isVk && !isTg,
        botType,
        vkGroupId: snapshot.groupId,
        queryId: tg.initDataUnsafe?.query_id,
        safeAreaInset,
        contentSafeAreaInset
    };
}

//{id:5106439090, first_name:'tёma'},
