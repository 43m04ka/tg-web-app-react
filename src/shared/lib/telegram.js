import {isTg} from './platform';

const mockListeners = {};

const notifyMock = (event) => {
    if (mockListeners[event]) mockListeners[event].forEach((cb) => cb());
};

const addMockListener = (event, cb) => {
    if (!mockListeners[event]) mockListeners[event] = new Set();
    mockListeners[event].add(cb);
};

const removeMockListener = (event, cb) => {
    if (mockListeners[event]) mockListeners[event].delete(cb);
};

const webAppMock = {
    showAlert: (message) => window.alert(message),
    BackButton: {
        isVisible: false,
        show() {
            this.isVisible = true;
            notifyMock('backButtonChange');
        },
        hide() {
            this.isVisible = false;
            notifyMock('backButtonChange');
        }
    },
    onEvent: addMockListener,
    offEvent: removeMockListener,
    initDataUnsafe: {},
    safeAreaInset: {top: 0, bottom: 0},
    contentSafeAreaInset: {top: 0, bottom: 0}
};

export const getTelegramObject = () => {
    const webApp = window.Telegram?.WebApp;
    return isTg() && webApp ? webApp : webAppMock;
};

export const clickMockBackButton = () => notifyMock('backButtonClicked');

export const subscribeMockBackButton = (cb) => {
    addMockListener('backButtonChange', cb);
    return () => removeMockListener('backButtonChange', cb);
};

const LOCAL_SDK_URL = '/telegram-web-app.js';
const REMOTE_SDK_URL = 'https://telegram.org/js/telegram-web-app.js';
const READY_TIMEOUT_MS = 2500;

let sdkToken = typeof window !== 'undefined' && window.Telegram?.WebApp ? 1 : 0;
let readyPromise = null;
const sdkListeners = new Set();

const bumpSdkToken = () => {
    sdkToken += 1;
    sdkListeners.forEach((cb) => cb(sdkToken));
};

export const getTelegramSdkToken = () => sdkToken;

export const isTelegramReady = () => sdkToken > 0;

export const subscribeTelegramSdk = (cb) => {
    sdkListeners.add(cb);
    return () => sdkListeners.delete(cb);
};

const loadScript = (src) =>
    new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => resolve(window.Telegram);
        script.onerror = () => reject(new Error(`Script failed to load: ${src}`));
        document.head.appendChild(script);
    });

export const ensureTelegram = () => {
    if (sdkToken > 0) return Promise.resolve(window.Telegram?.WebApp || null);

    if (!readyPromise) {
        readyPromise = Promise.race([
            loadScript(LOCAL_SDK_URL).catch(() => null),
            new Promise((resolve) => setTimeout(resolve, READY_TIMEOUT_MS))
        ]).then(() => {
            if (sdkToken === 0) bumpSdkToken();
            return window.Telegram?.WebApp || null;
        });
    }

    return readyPromise;
};

export const requestTelegramInsets = () => {
    if (!isTg()) return;

    const webView = window.Telegram?.WebView;
    if (typeof webView?.postEvent !== 'function') return;

    try {
        webView.postEvent('web_app_request_viewport');
        webView.postEvent('web_app_request_safe_area');
        webView.postEvent('web_app_request_content_safe_area');
    } catch (e) {
        console.error('[telegram] inset request:', e);
    }
};

const lockScreenOrientation = () => {
    try {
        const lock = window.screen?.orientation?.lock;
        if (typeof lock === 'function') {
            lock.call(window.screen.orientation, 'portrait-primary').catch(() => {});
        }
    } catch (e) {
    }
};

const supportsFullscreen = (tg) =>
    typeof tg.requestFullscreen === 'function' && (tg.isVersionAtLeast?.('8.0') ?? false);

const applyViewportSettings = () => {
    if (!isTg() || !window.Telegram?.WebApp) return;

    const tg = window.Telegram.WebApp;

    try {
        tg.ready?.();
        tg.expand?.();
        tg.disableVerticalSwipes?.();
        tg.lockOrientation?.();
        tg.isClosingConfirmationEnabled = true;

        lockScreenOrientation();
        requestTelegramInsets();

        if (!supportsFullscreen(tg) || tg.isFullscreen) return;

        tg.onEvent?.('fullscreenFailed', (payload) => {
            if (payload?.error === 'ALREADY_FULLSCREEN') return;
            setTimeout(() => {
                if (!window.Telegram?.WebApp?.isFullscreen) window.Telegram?.WebApp?.requestFullscreen();
            }, 400);
        });

        tg.requestFullscreen();
    } catch (e) {
        console.error('[telegram] viewport setup:', e);
    }
};

let isRefreshScheduled = false;

const refreshTelegramSdk = () => {
    if (isRefreshScheduled || !isTg()) return;
    isRefreshScheduled = true;

    loadScript(REMOTE_SDK_URL)
        .then(() => {
            bumpSdkToken();
            applyViewportSettings();
        })
        .catch(() => {});
};

let isViewportConfigured = false;

export const configureTelegramViewport = async () => {
    if (isViewportConfigured) return;
    isViewportConfigured = true;

    await ensureTelegram();
    applyViewportSettings();

    if (document.readyState === 'complete') {
        refreshTelegramSdk();
    } else {
        window.addEventListener('load', refreshTelegramSdk, {once: true});
    }
};

export const getStartParam = () => {
    const fromTg = getTelegramObject().initDataUnsafe?.start_param;
    if (typeof fromTg !== 'undefined' && fromTg !== null) return String(fromTg);
    return new URLSearchParams(window.location.search).get('startapp');
};
