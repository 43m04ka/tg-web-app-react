import {apiFetch} from './client';

const call = async (path, {method = 'POST', body, signal} = {}) => {
    const response = await apiFetch(path, {
        method,
        headers: {'Content-Type': 'application/json'},
        body: body === undefined ? undefined : JSON.stringify(body),
        signal
    });

    const data = await response.json().catch(() => ({}));

    return {...data, ok: response.ok, httpStatus: response.status};
};

export const openSession = (signal) => call('/api/auth/session', {signal});

export const signInTelegram = (initData, signal) => call('/api/auth/telegram', {body: {initData}, signal});

export const signInVk = (launch, signal) => call('/api/auth/vk', {body: {launch}, signal});

export const fetchMe = (signal) => call(`/api/auth/me?time=${Date.now()}`, {method: 'GET', signal});

export const startEmailLogin = (email) => call('/api/auth/email/start', {body: {email}});

export const verifyEmailLogin = (email, code) => call('/api/auth/email/verify', {body: {email, code}});

export const confirmEmailLink = (token) => call('/api/auth/email/link', {body: {token}});

export const startTelegramLink = () => call('/api/auth/telegram/link');

export const fetchTelegramLinkStatus = (nonce, signal) =>
    call(`/api/auth/telegram/link/status?nonce=${encodeURIComponent(nonce)}&time=${Date.now()}`, {method: 'GET', signal});

export const logout = (everywhere = false) => call('/api/auth/logout', {body: {everywhere}});
