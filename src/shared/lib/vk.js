import vkBridge from '@vkontakte/vk-bridge';
import {getVkGroupId, getVkLaunchParams, isVk} from './platform';

const INIT_TIMEOUT_MS = 1500;
const USER_TIMEOUT_MS = 3000;

const state = {
    initPromise: null,
    userPromise: null,
    user: null
};

const withTimeout = (promise, ms) => Promise.race([
    promise,
    new Promise((resolve, reject) => setTimeout(() => reject(new Error(`timeout ${ms}ms`)), ms))
]);

const canTalkToVk = () => isVk() && vkBridge.isEmbedded();

export const initVk = () => {
    if (!canTalkToVk()) return Promise.resolve(false);

    if (!state.initPromise) {
        state.initPromise = (async () => {
            try {
                await withTimeout(vkBridge.send('VKWebAppInit'), INIT_TIMEOUT_MS);
            } catch (error) {
                console.error('[vk] init:', error?.message || error);
            }

            vkBridge
                .send('VKWebAppSetViewSettings', {status_bar_style: 'light', action_bar_color: 'none'})
                .catch(() => {});

            return true;
        })();
    }

    return state.initPromise;
};

const launchUser = () => {
    const id = Number(getVkLaunchParams()?.vk_user_id);
    if (!Number.isInteger(id) || id <= 0) return null;

    return {id, first_name: '', last_name: '', photoUrl: null, platform: 'vk'};
};

export const getVkUser = () => {
    if (state.user) return Promise.resolve(state.user);

    if (!canTalkToVk()) return Promise.resolve(launchUser());

    if (!state.userPromise) {
        state.userPromise = (async () => {
            try {
                await initVk();
                const vkUser = await withTimeout(vkBridge.send('VKWebAppGetUserInfo'), USER_TIMEOUT_MS);
                state.user = {
                    id: vkUser.id,
                    first_name: vkUser.first_name,
                    last_name: vkUser.last_name,
                    photoUrl: vkUser.photo_200 || vkUser.photo_100 || null,
                    platform: 'vk'
                };
                return state.user;
            } catch (error) {
                console.error('[vk] getUserInfo:', error?.message || error);
                return launchUser();
            } finally {
                state.userPromise = null;
            }
        })();
    }

    return state.userPromise;
};

const MESSAGES_KEY = '__vk_messages_asked';

const messagesState = {allowed: null};

export const getVkMessagesAllowed = () => messagesState.allowed;

const rememberMessages = (key, allowed) => {
    messagesState.allowed = allowed;

    try {
        sessionStorage.setItem(key, allowed ? '1' : '0');
    } catch (error) {
    }

    return allowed;
};

export const askVkMessages = async () => {
    if (!isVk()) return undefined;

    const groupId = getVkGroupId();
    const key = `${MESSAGES_KEY}:${groupId}`;

    if (!canTalkToVk()) {
        messagesState.allowed = false;
        return false;
    }

    try {
        const saved = sessionStorage.getItem(key);
        if (saved === '1' || saved === '0') return rememberMessages(key, saved === '1');
    } catch (error) {
    }

    try {
        await initVk();
        const result = await vkBridge.send('VKWebAppAllowMessagesFromGroup', {group_id: groupId});
        return rememberMessages(key, Boolean(result?.result));
    } catch (error) {
        return rememberMessages(key, false);
    }
};

export const VK_MESSAGES_NOTE = 'При оформлении ВК попросит разрешить сообщения от сообщества — так придёт уведомление о заказе.';

export const vkCommunityChatUrl = () => `https://vk.com/im/convo/-${getVkGroupId()}?entrypoint=community_page&tab=all`;

export const subscribeVkSafeArea = (onChange) => {
    const listener = (event) => {
        if (event.detail.type !== 'VKWebAppUpdateConfig') return;
        const safeArea = event.detail.data?.safe_area;
        if (safeArea) onChange({top: safeArea.top || 0, bottom: safeArea.bottom || 0});
    };

    vkBridge.subscribe(listener);
    return () => vkBridge.unsubscribe(listener);
};
