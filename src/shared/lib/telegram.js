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

const supportsFullscreen = (tg) =>
    typeof tg.requestFullscreen === 'function' && (tg.isVersionAtLeast?.('8.0') ?? false);

let isViewportConfigured = false;

export const configureTelegramViewport = async () => {
    if (isViewportConfigured) return;
    isViewportConfigured = true;

    await ensureTelegram();

    if (!isTg() || !window.Telegram?.WebApp) return;

    const tg = window.Telegram.WebApp;

    try {
        tg.ready?.();
        tg.expand?.();
        tg.disableVerticalSwipes?.();
        tg.lockOrientation?.();
        tg.isClosingConfirmationEnabled = true;

        if (!supportsFullscreen(tg)) return;

        const requestFullscreen = () => {
            if (tg.isFullscreen) return;
            try {
                tg.requestFullscreen();
            } catch (e) {
                console.error('[telegram] fullscreen:', e);
            }
        };

        tg.onEvent?.('fullscreenFailed', (payload) => {
            if (payload?.error === 'ALREADY_FULLSCREEN') return;
            setTimeout(requestFullscreen, 400);
        });

        requestFullscreen();
    } catch (e) {
        console.error('[telegram] viewport setup:', e);
    }
};

export const getStartParam = () => {
    const fromTg = getTelegramObject().initDataUnsafe?.start_param;
    if (typeof fromTg !== 'undefined' && fromTg !== null) return String(fromTg);
    return new URLSearchParams(window.location.search).get('startapp');
};

export const loadTelegramScript = () => {
    if (window.Telegram?.WebApp) return Promise.resolve(window.Telegram);

    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = '/telegram-web-app.js';
        script.onload = () => resolve(window.Telegram);
        script.onerror = () => reject(new Error('Telegram WebApp script failed to load'));
        document.head.appendChild(script);
    });
};

const READY_TIMEOUT_MS = 2500;

let isReady = typeof window !== 'undefined' && !!window.Telegram?.WebApp;
let readyPromise = null;
const readyListeners = new Set();

const markReady = () => {
    if (isReady) return;
    isReady = true;
    readyListeners.forEach((cb) => cb());
    readyListeners.clear();
};

export const isTelegramReady = () => isReady;

export const subscribeTelegramReady = (cb) => {
    if (isReady) {
        cb();
        return () => {};
    }

    readyListeners.add(cb);
    return () => readyListeners.delete(cb);
};

export const ensureTelegram = () => {
    if (isReady) return Promise.resolve(window.Telegram?.WebApp || null);

    if (!readyPromise) {
        readyPromise = Promise.race([
            loadTelegramScript().catch(() => null),
            new Promise((resolve) => setTimeout(resolve, READY_TIMEOUT_MS))
        ]).then(() => {
            markReady();
            return window.Telegram?.WebApp || null;
        });
    }

    return readyPromise;
};
