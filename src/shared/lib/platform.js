import vkBridge from '@vkontakte/vk-bridge';

export const PLATFORM = {
    TG: 'tg',
    VK: 'vk',
    WEB: 'web'
};

export const BOT_TYPE = {
    TG: 'tg',
    VK_XBOX: 'vk-xbox',
    VK_PS: 'vk-ps',
    WEB: 'web',
    TEST: 'test'
};

const TEST_STAND_HOST = /(^|\.)(workers\.dev|pages\.dev)$/;

const VK_XBOX_APP_ID = '54475556';
const VK_XBOX_GROUP_ID = 217049080;
const VK_PS_GROUP_ID = 85243268;

const hasTgInitParams = () => {
    if (window.location.hash.includes('tgWebApp')) return true;
    try {
        const raw = sessionStorage.getItem('__telegram__initParams');
        if (!raw) return false;
        return Object.keys(JSON.parse(raw) || {}).some((key) => key.startsWith('tgWebApp'));
    } catch (e) {
        return false;
    }
};

const TG_STICKY_KEY = '__app_platform_tg';

const readStickyTg = () => {
    try {
        return sessionStorage.getItem(TG_STICKY_KEY) === '1';
    } catch (e) {
        return false;
    }
};

let stickyTg = readStickyTg();

const detectTg = () => {
    const webApp = window.Telegram?.WebApp;
    if (webApp?.platform && webApp.platform !== 'unknown') return true;
    if (webApp?.initData) return true;
    if (window.TelegramWebviewProxy || window.TelegramWebviewProxyProto) return true;
    if (hasTgInitParams()) return true;

    const ua = navigator.userAgent || navigator.vendor || window.opera;
    return /Telegram/i.test(ua) || /TRS/i.test(ua);
};

export const isTg = () => {
    if (stickyTg) return true;
    if (!detectTg()) return false;

    stickyTg = true;
    try {
        sessionStorage.setItem(TG_STICKY_KEY, '1');
    } catch (e) {
    }

    return true;
};

export const isVk = () =>
    vkBridge.isWebView() || vkBridge.isIframe() || window.location.pathname.includes('vk.com');

export const isWeb = () => !isVk() && !isTg();

export const getVkGroupId = () => {
    const vkAppId = new URLSearchParams(window.location.search).get('vk_app_id');
    return String(vkAppId) === VK_XBOX_APP_ID ? VK_XBOX_GROUP_ID : VK_PS_GROUP_ID;
};

const vkBotType = () =>
    (getVkGroupId() === VK_XBOX_GROUP_ID ? BOT_TYPE.VK_XBOX : BOT_TYPE.VK_PS);

export const isTestStand = () => TEST_STAND_HOST.test(window.location.hostname);

const BOT_FALLBACK = {[BOT_TYPE.TEST]: BOT_TYPE.WEB};

export const fallbackBotType = (botType) => BOT_FALLBACK[botType] || null;

export const getBotType = () => {
    if (isTestStand()) return BOT_TYPE.TEST;
    if (isVk()) return vkBotType();
    if (isTg()) return BOT_TYPE.TG;
    return BOT_TYPE.WEB;
};

const stateOf = (platform, botType) => ({
    isVk: platform === PLATFORM.VK,
    isTg: platform === PLATFORM.TG,
    isWeb: platform === PLATFORM.WEB,
    platform,
    botType
});

const forcedState = (forced) => {
    if (forced === BOT_TYPE.TEST) return stateOf(PLATFORM.WEB, BOT_TYPE.TEST);
    if (forced === PLATFORM.VK) return stateOf(PLATFORM.VK, vkBotType());
    if (forced === PLATFORM.TG) return stateOf(PLATFORM.TG, BOT_TYPE.TG);
    if (forced === PLATFORM.WEB) return stateOf(PLATFORM.WEB, BOT_TYPE.WEB);
    return null;
};

export const getPlatformState = () => {
    const forced = forcedState(new URLSearchParams(window.location.search).get('platform'));
    if (forced) return forced;

    const vk = isVk();
    const tg = isTg();

    return stateOf(vk ? PLATFORM.VK : tg ? PLATFORM.TG : PLATFORM.WEB, getBotType());
};

export const isSamePlatformState = (a, b) =>
    a.isVk === b.isVk && a.isTg === b.isTg && a.botType === b.botType;
