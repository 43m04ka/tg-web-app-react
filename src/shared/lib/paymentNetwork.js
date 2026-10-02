import {DIRECT_API_URL, IS_TUNNEL_HOST, setDirectApi} from '../config/env';

const CHECK_TIMEOUT_MS = 5000;
const IDLE_POLL_MS = 20000;
const PAYMENT_POLL_MS = 3000;

const CIS = new Set(['AM', 'AZ', 'BY', 'KZ', 'KG', 'MD', 'TJ', 'UZ']);

export const NET = {
    CHECKING: 'checking',
    RU: 'ru',
    FOREIGN: 'foreign'
};

let state = IS_TUNNEL_HOST ? NET.CHECKING : NET.RU;
let country = null;
let inFlight = null;
let timerId = 0;
let paymentWatchers = 0;
let isStarted = false;

const listeners = new Set();

const snapshot = () => ({state, country});

const notify = () => listeners.forEach((listener) => listener(snapshot()));

const apply = ({isRu, code}) => {
    const next = isRu ? NET.RU : NET.FOREIGN;
    const nextCountry = code || null;
    if (next === state && nextCountry === country) return;

    if (next !== state) setDirectApi(next === NET.RU);

    state = next;
    country = nextCountry;
    notify();
};

export const checkNetwork = async () => {
    const controller = new AbortController();
    const abortId = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);

    try {
        const response = await fetch(`${DIRECT_API_URL}/api/net/where?time=${Date.now()}`, {
            signal: controller.signal,
            cache: 'no-store'
        });
        if (!response.ok) return {isRu: false, code: null};

        const data = await response.json();
        return {isRu: data?.ru === true, code: typeof data?.country === 'string' ? data.country : null};
    } catch {
        return {isRu: false, code: null};
    } finally {
        clearTimeout(abortId);
    }
};

export const refreshNetwork = () => {
    if (!IS_TUNNEL_HOST) return Promise.resolve(state);

    if (!inFlight) {
        inFlight = checkNetwork()
            .then((result) => {
                apply(result);
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

export const getNetwork = () => snapshot();

export const isVpnSuspected = ({state: current, country: code}) =>
    IS_TUNNEL_HOST && current === NET.FOREIGN && !CIS.has(code);

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

    apply({isRu: false, code: null});
    refreshNetwork();
};

export const preparePaymentNetwork = async () => {
    if (IS_TUNNEL_HOST) await refreshNetwork();
};
