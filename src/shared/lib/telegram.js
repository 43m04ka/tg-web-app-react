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

export const getWebApp = () => (isTg() ? window.Telegram?.WebApp || null : null);

export const getTelegramObject = () => getWebApp() || webAppMock;

export const clickMockBackButton = () => notifyMock('backButtonClicked');

export const subscribeMockBackButton = (cb) => {
    addMockListener('backButtonChange', cb);
    return () => removeMockListener('backButtonChange', cb);
};

const SDK_URL = '/telegram-web-app.js';
const READY_TIMEOUT_MS = 2500;

let sdkToken = typeof window !== 'undefined' && window.Telegram?.WebApp ? 1 : 0;
let readyPromise = null;
const sdkListeners = new Set();

export const getTelegramSdkToken = () => sdkToken;

export const subscribeTelegramSdk = (cb) => {
    sdkListeners.add(cb);
    return () => sdkListeners.delete(cb);
};

const markSdkLoaded = () => {
    if (sdkToken > 0) return;
    sdkToken = 1;
    sdkListeners.forEach((cb) => cb(sdkToken));
};

export const ensureTelegram = () => {
    if (sdkToken > 0) return Promise.resolve(getWebApp());

    if (!readyPromise) {
        const load = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = SDK_URL;
            script.onload = resolve;
            script.onerror = () => reject(new Error('Telegram SDK failed to load'));
            document.head.appendChild(script);
        });

        readyPromise = Promise.race([
            load.catch(() => null),
            new Promise((resolve) => setTimeout(resolve, READY_TIMEOUT_MS))
        ]).then(() => {
            markSdkLoaded();
            return getWebApp();
        });
    }

    return readyPromise;
};

export const requestTelegramInsets = () => {
    const webView = window.Telegram?.WebView;
    if (!getWebApp() || typeof webView?.postEvent !== 'function') return;

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
        const orientation = window.screen?.orientation;
        if (typeof orientation?.lock === 'function') {
            orientation.lock('portrait-primary').catch(() => {});
        }
    } catch (e) {
    }
};

const isLandscapeScreen = () => {
    const width = window.innerWidth || window.screen?.width || 0;
    const height = window.innerHeight || window.screen?.height || 0;
    if (!width || !height) return false;
    return width > height;
};

const supportsFullscreen = (tg) =>
    typeof tg.requestFullscreen === 'function'
    && (tg.isVersionAtLeast?.('8.0') ?? false)
    && !isLandscapeScreen();

let isViewportConfigured = false;

export const configureTelegramViewport = async () => {
    if (isViewportConfigured) return;
    isViewportConfigured = true;

    await ensureTelegram();

    const tg = getWebApp();
    if (!tg) return;

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
                const current = getWebApp();
                if (current && !current.isFullscreen) current.requestFullscreen();
            }, 400);
        });

        tg.requestFullscreen();
    } catch (e) {
        console.error('[telegram] viewport setup:', e);
    }
};

export const getStartParam = () => {
    const fromTg = getTelegramObject().initDataUnsafe?.start_param;
    if (typeof fromTg !== 'undefined' && fromTg !== null) return String(fromTg);
    return new URLSearchParams(window.location.search).get('startapp');
};
