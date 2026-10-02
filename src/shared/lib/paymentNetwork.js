import {DIRECT_API_URL, IS_TUNNEL_HOST, setDirectApi} from '../config/env';

const CHECK_TIMEOUT_MS = 5000;
const IDLE_POLL_MS = 20000;
const PAYMENT_POLL_MS = 3000;

export const NET = {
    CHECKING: 'checking',
    RU: 'ru',
    FOREIGN: 'foreign'
};

export const VPN_BLOCKED = {
    ok: false,
    httpStatus: 0,
    error: 'Чтобы перейти к оплате, отключите VPN'
};

let state = IS_TUNNEL_HOST ? NET.CHECKING : NET.RU;
let seenForeign = false;
let inFlight = null;
let timerId = 0;
let paymentWatchers = 0;
let isStarted = false;

const listeners = new Set();

const notify = () => listeners.forEach((listener) => listener(state));

const setState = (next) => {
    if (next === NET.FOREIGN) seenForeign = true;
    if (next === state) return;

    state = next;
    setDirectApi(next === NET.RU);
    notify();
};

export const checkRussianNetwork = async () => {
    const controller = new AbortController();
    const abortId = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);

    try {
        const response = await fetch(`${DIRECT_API_URL}/api/net/where?time=${Date.now()}`, {
            signal: controller.signal,
            cache: 'no-store'
        });
        if (!response.ok) return false;

        const data = await response.json();
        return data?.ru === true;
    } catch {
        return false;
    } finally {
        clearTimeout(abortId);
    }
};

export const refreshNetwork = () => {
    if (!IS_TUNNEL_HOST) return Promise.resolve(state);

    if (!inFlight) {
        inFlight = checkRussianNetwork()
            .then((isRu) => {
                setState(isRu ? NET.RU : NET.FOREIGN);
                return state;
            })
            .finally(() => {
                inFlight = null;
            });
    }

    return inFlight;
};

const schedule = () => {
    clearTimeout(timerId);
    if (!isStarted) return;

    timerId = setTimeout(() => {
        refreshNetwork().finally(schedule);
    }, paymentWatchers > 0 ? PAYMENT_POLL_MS : IDLE_POLL_MS);
};

export const startNetworkWatch = () => {
    if (!IS_TUNNEL_HOST || isStarted) return;
    isStarted = true;

    refreshNetwork().finally(schedule);

    window.addEventListener('online', () => refreshNetwork());
    window.addEventListener('focus', () => refreshNetwork());
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) refreshNetwork();
    });
};

export const getNetworkState = () => state;

export const wasForeignSeen = () => seenForeign;

export const subscribeNetwork = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

export const watchPaymentNetwork = () => {
    if (!IS_TUNNEL_HOST) return () => undefined;

    paymentWatchers += 1;
    refreshNetwork().finally(schedule);

    return () => {
        paymentWatchers = Math.max(0, paymentWatchers - 1);
        schedule();
    };
};

export const reportDirectFailure = () => {
    if (!IS_TUNNEL_HOST || state !== NET.RU) return;

    setState(NET.FOREIGN);
    refreshNetwork();
};

export const ensurePaymentNetwork = async () => {
    if (!IS_TUNNEL_HOST) return true;

    return (await refreshNetwork()) === NET.RU;
};
