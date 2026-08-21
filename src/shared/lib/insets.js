import {getPlatformState} from './platform';
import {getWebApp, requestTelegramInsets, subscribeTelegramSdk, subscribeMockBackButton, getTelegramObject} from './telegram';
import {subscribeVkSafeArea} from './vk';

const TG_FULLSCREEN_MIN_TOP = 24;
const TG_FULLSCREEN_MIN_CHROME = 46;
const MOCK_BACK_BUTTON_INSET = 45;
const SETTLE_DELAYS = [0, 80, 250, 600, 1200, 2000, 3500];
const KEYBOARD_INPUT_TYPES = new Set(['text', 'search', 'email', 'tel', 'url', 'number', 'password']);

const isEditableTarget = (el) => {
    if (!el) return false;
    if (el.tagName === 'TEXTAREA') return true;
    if (el.tagName === 'INPUT') return KEYBOARD_INPUT_TYPES.has((el.type || 'text').toLowerCase());
    return !!el.isContentEditable;
};

let systemInsets = {top: 0, bottom: 0};

const measureSystemInsets = () => {
    const probe = document.createElement('div');
    probe.style.cssText =
        'position:absolute;top:0;left:0;visibility:hidden;pointer-events:none;' +
        'padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)';
    document.body.appendChild(probe);

    const computed = window.getComputedStyle(probe);
    systemInsets = {
        top: parseInt(computed.paddingTop, 10) || 0,
        bottom: parseInt(computed.paddingBottom, 10) || 0
    };

    document.body.removeChild(probe);
};

let state = {
    safeAreaInset: {top: 0, bottom: 0},
    contentSafeAreaInset: {top: 0, bottom: 0},
    isKeyboardOpen: false,
    width: 0,
    height: 0
};

const listeners = new Set();
let vkInsets = {top: 0, bottom: 0};
let isFieldFocused = false;
let baselineHeight = 0;

const isSame = (a, b) =>
    a.safeAreaInset.top === b.safeAreaInset.top &&
    a.safeAreaInset.bottom === b.safeAreaInset.bottom &&
    a.contentSafeAreaInset.top === b.contentSafeAreaInset.top &&
    a.contentSafeAreaInset.bottom === b.contentSafeAreaInset.bottom &&
    a.isKeyboardOpen === b.isKeyboardOpen &&
    a.width === b.width &&
    a.height === b.height;

const compute = () => {
    const {isVk, isTg, isWeb} = getPlatformState();
    const tg = getWebApp();
    const vv = window.visualViewport;

    const width = vv ? vv.width : window.innerWidth;
    const height = vv ? vv.height : window.innerHeight;

    let isKeyboardOpen;
    if (tg && typeof tg.viewportHeight === 'number' && typeof tg.viewportStableHeight === 'number') {
        isKeyboardOpen = tg.viewportHeight < tg.viewportStableHeight - 40;
    } else if (isFieldFocused) {
        isKeyboardOpen = vv ? baselineHeight - height > 80 : true;
    } else {
        isKeyboardOpen = false;
    }

    let top = systemInsets.top;
    let bottom = isKeyboardOpen ? 0 : systemInsets.bottom;
    let chromeTop = 0;

    if (isVk) {
        top = vkInsets.top || systemInsets.top;
        bottom = isKeyboardOpen ? 0 : vkInsets.bottom || systemInsets.bottom;
    } else if (tg) {
        top = tg.safeAreaInset?.top || systemInsets.top;
        bottom = isKeyboardOpen ? 0 : tg.safeAreaInset?.bottom || systemInsets.bottom;
        chromeTop = tg.contentSafeAreaInset?.top || 0;

        if (tg.isFullscreen === true) {
            top = Math.max(top, TG_FULLSCREEN_MIN_TOP);
            chromeTop = Math.max(chromeTop, TG_FULLSCREEN_MIN_CHROME);
        }
    }

    const mockTop =
        (isVk || isWeb) && getTelegramObject().BackButton?.isVisible ? MOCK_BACK_BUTTON_INSET : 0;

    return {
        safeAreaInset: {top: top + mockTop, bottom},
        contentSafeAreaInset: {top: top + chromeTop + mockTop, bottom},
        isKeyboardOpen,
        width,
        height
    };
};

const publish = () => {
    const next = compute();
    if (isSame(state, next)) return;

    state = next;

    const root = document.documentElement;
    root.style.setProperty('--safe-top', `${next.safeAreaInset.top}px`);
    root.style.setProperty('--safe-bottom', `${next.safeAreaInset.bottom}px`);
    root.style.setProperty('--content-safe-top', `${next.contentSafeAreaInset.top}px`);

    listeners.forEach((cb) => cb());
};

export const getInsets = () => state;

export const subscribeInsets = (cb) => {
    listeners.add(cb);
    return () => listeners.delete(cb);
};

const settle = () => {
    requestTelegramInsets();
    publish();
};

let settleTimers = [];

const scheduleSettle = () => {
    settleTimers.forEach(clearTimeout);
    settleTimers = SETTLE_DELAYS.map((delay) => window.setTimeout(settle, delay));
};

const remeasureAndPublish = () => {
    measureSystemInsets();
    publish();
};

let tgSubscribed = null;
const TG_EVENTS = ['viewportChanged', 'safeAreaChanged', 'contentSafeAreaChanged', 'fullscreenChanged'];

const syncTelegramSubscription = () => {
    const tg = getWebApp();
    if (tg === tgSubscribed) return;

    if (tgSubscribed) {
        TG_EVENTS.forEach((event) => tgSubscribed.offEvent?.(event, remeasureAndPublish));
    }

    tgSubscribed = tg;

    if (tg) {
        TG_EVENTS.forEach((event) => tg.onEvent?.(event, remeasureAndPublish));
        scheduleSettle();
    }
};

let isStarted = false;

export const startInsets = () => {
    if (isStarted || typeof window === 'undefined') return;
    isStarted = true;

    measureSystemInsets();
    isFieldFocused = isEditableTarget(document.activeElement);
    baselineHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;

    syncTelegramSubscription();
    subscribeTelegramSdk(syncTelegramSubscription);
    subscribeMockBackButton(publish);
    subscribeVkSafeArea((safeArea) => {
        vkInsets = safeArea;
        publish();
    });

    const onViewportChange = () => window.requestAnimationFrame(publish);

    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', onViewportChange);
        window.visualViewport.addEventListener('scroll', onViewportChange);
    } else {
        window.addEventListener('resize', onViewportChange);
    }

    let baselineTimer = null;

    document.addEventListener('focusin', (event) => {
        if (!isEditableTarget(event.target)) return;
        isFieldFocused = true;
        if (baselineTimer) clearTimeout(baselineTimer);
        publish();
    });

    document.addEventListener('focusout', (event) => {
        if (!isEditableTarget(event.target)) return;
        isFieldFocused = false;
        if (baselineTimer) clearTimeout(baselineTimer);
        baselineTimer = window.setTimeout(() => {
            if (isFieldFocused) return;
            baselineHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
            publish();
        }, 400);
        publish();
    });

    window.addEventListener('orientationchange', () => {
        window.setTimeout(() => {
            if (!isFieldFocused) {
                baselineHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
            }
            remeasureAndPublish();
        }, 400);
    });

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) scheduleSettle();
    });

    scheduleSettle();
};
