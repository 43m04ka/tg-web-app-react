import {DIRECT_API_URL, IS_TUNNEL_HOST, switchToDirectApi} from '../config/env';

const CHECK_TIMEOUT_MS = 5000;

export const VPN_BLOCKED = {
    ok: false,
    httpStatus: 0,
    error: 'Чтобы перейти к оплате, отключите VPN'
};

let direct = false;
let gate = null;

// Спрашиваем российский сервер напрямую: под VPN он либо недоступен, либо видит
// зарубежный адрес. Ответил «RU» — касса примет оплату
export const checkRussianNetwork = async () => {
    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);

    try {
        const response = await fetch(`${DIRECT_API_URL}/api/net/where?time=${Date.now()}`, {signal: controller.signal});
        if (!response.ok) return false;

        const data = await response.json();
        return data?.ru === true;
    } catch {
        return false;
    } finally {
        clearTimeout(timerId);
    }
};

export const subscribePaymentGate = (listener) => {
    gate = listener;

    return () => {
        if (gate === listener) gate = null;
    };
};

const goDirect = () => {
    direct = true;
    switchToDirectApi();
    return true;
};

/**
 * Вызывается перед созданием оплаты. Вне gwstorebot.ru ничего не проверяет.
 * Под VPN показывает окно и ждёт, пока покупатель его отключит или откажется
 */
export const ensurePaymentNetwork = async () => {
    if (!IS_TUNNEL_HOST || direct) return true;
    if (await checkRussianNetwork()) return goDirect();
    if (!gate) return true;

    const confirmed = await new Promise((resolve) => gate({check: checkRussianNetwork, resolve}));

    return confirmed ? goDirect() : false;
};
