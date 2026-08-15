export const isTg = () => {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const hasTgObject = !!(window.Telegram?.WebApp?.initData);
    return /Telegram/i.test(ua) || /TRS/i.test(ua) || hasTgObject;
};

// Единый на всё приложение мок Telegram.WebApp для VK/веба.
// Раньше моков было два — этот и свой собственный в useTelegram.js — и у каждого был
// свой объект BackButton: компоненты дёргали show/hide у мока из useTelegram, а
// useAppInsets читал isVisible у мока отсюда. Поэтому isVisible здесь не менялся
// никогда, и отступ в 45px под моковую кнопку «назад» не применялся в принципе.
const mockListeners = {};

const notifyMock = (evt) => {
    if (mockListeners[evt]) mockListeners[evt].forEach((cb) => cb());
};

const addMockListener = (evt, cb) => {
    if (!mockListeners[evt]) mockListeners[evt] = new Set();
    mockListeners[evt].add(cb);
};

const removeMockListener = (evt, cb) => {
    if (mockListeners[evt]) mockListeners[evt].delete(cb);
};

const defaultTgMock = {
    showAlert: (message) => alert(message),
    BackButton: {
        isVisible: false,
        show: function () {
            this.isVisible = true;
            notifyMock('backButtonChange');
        },
        hide: function () {
            this.isVisible = false;
            notifyMock('backButtonChange');
        }
    },
    onEvent: addMockListener,
    offEvent: removeMockListener,
    initDataUnsafe: {},
    safeAreaInset: { top: 0, bottom: 0 },
    contentSafeAreaInset: { top: 0, bottom: 0 }
};

export const getTelegramObject = () => {
    const globalTg = window.Telegram?.WebApp;
    return (isTg() && globalTg) ? globalTg : defaultTgMock;
};

// Нажатие на нашу собственную кнопку «назад» в VK/вебе — прокидываем его тем же
// событием, которое слушают компоненты через tg.onEvent('backButtonClicked', ...)
export const clickMockBackButton = () => notifyMock('backButtonClicked');

export const subscribeMockBackButton = (cb) => {
    addMockListener('backButtonChange', cb);
    return () => removeMockListener('backButtonChange', cb);
};
