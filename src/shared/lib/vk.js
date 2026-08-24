import vkBridge from '@vkontakte/vk-bridge';
import {isVk} from './platform';

const state = {
    initPromise: null,
    userPromise: null,
    user: null
};

export const initVk = () => {
    if (!isVk()) return Promise.resolve(false);

    if (!state.initPromise) {
        state.initPromise = (async () => {
            try {
                await vkBridge.send('VKWebAppInit');
                await vkBridge
                    .send('VKWebAppSetViewSettings', {status_bar_style: 'light', action_bar_color: 'none'})
                    .catch(() => {});
                return true;
            } catch (error) {
                console.error('[vk] init failed:', error);
                state.initPromise = null;
                return false;
            }
        })();
    }

    return state.initPromise;
};

export const getVkUser = () => {
    if (state.user) return Promise.resolve(state.user);

    if (!state.userPromise) {
        state.userPromise = (async () => {
            try {
                await initVk();
                const vkUser = await vkBridge.send('VKWebAppGetUserInfo');
                state.user = {
                    id: vkUser.id,
                    first_name: vkUser.first_name,
                    last_name: vkUser.last_name,
                    photoUrl: vkUser.photo_200 || vkUser.photo_100 || null,
                    platform: 'vk'
                };
                return state.user;
            } catch (error) {
                console.error('[vk] getUserInfo failed:', error);
                return null;
            } finally {
                state.userPromise = null;
            }
        })();
    }

    return state.userPromise;
};

export const subscribeVkSafeArea = (onChange) => {
    const listener = (event) => {
        if (event.detail.type !== 'VKWebAppUpdateConfig') return;
        const safeArea = event.detail.data?.safe_area;
        if (safeArea) onChange({top: safeArea.top || 0, bottom: safeArea.bottom || 0});
    };

    vkBridge.subscribe(listener);
    return () => vkBridge.unsubscribe(listener);
};
