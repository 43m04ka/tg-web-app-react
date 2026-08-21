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

export const configureTelegramViewport = () => {
    const tg = getTelegramObject();
    try {
        tg.disableVerticalSwipes?.();
        tg.lockOrientation?.();
        tg.isClosingConfirmationEnabled = true;
        if (window.innerWidth / window.innerHeight < 1) tg.requestFullscreen?.();
        tg.expand?.();
        tg.ready?.();
    } catch (e) {
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
