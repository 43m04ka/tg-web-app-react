import {useEffect, useState} from 'react';
import {http} from './http';
import {dropCache} from './cache';
import {toast} from './notify';
import {clearSession, getSession, saveSession, setReconfirmHandler, setUnauthorizedHandler, subscribeSession} from './token';

const describeDevice = () => {
    const agent = navigator.userAgent || '';

    if (agent.includes('Firefox')) return 'Firefox';
    if (agent.includes('Edg/')) return 'Edge';
    if (agent.includes('YaBrowser')) return 'Яндекс.Браузер';
    if (agent.includes('Chrome')) return 'Chrome';
    if (agent.includes('Safari')) return 'Safari';

    return 'Браузер';
};

setUnauthorizedHandler(() => {
    const had = Boolean(getSession());

    dropCache();
    clearSession();

    if (had) toast({tone: 'warning', title: 'Сессия закончилась', text: 'Войдите заново — вы вернётесь на этот же экран'});
});

setReconfirmHandler(() => {
    const current = getSession();

    if (!current || current.reconfirm) return;

    saveSession({...current, reconfirm: true});
});

export const useSession = () => {
    const [session, setSession] = useState(getSession());

    useEffect(() => subscribeSession(setSession), []);

    return session;
};

const pickedRecipient = (payload) => (payload && payload.answer === 'PICK_RECIPIENT'
    ? {status: 'pick', admins: Array.isArray(payload.admins) ? payload.admins : []}
    : null);

export const signIn = async ({login, password, recipient}) => {
    const payload = await http('/authentication', {method: 'POST', body: {login, password, recipient}});

    if (payload && payload.token) {
        saveSession({
            token: payload.token,
            login,
            device: describeDevice(),
            startedAt: Date.now(),
        });

        return {status: 'signed'};
    }

    const pick = pickedRecipient(payload);
    if (pick) return pick;

    if (payload && payload.answer === 'CODE_SENT' && payload.ticket) {
        return {
            status: 'confirmation',
            ticket: payload.ticket,
            expiresAt: payload.expiresAt || null,
            attempts: payload.attempts || null
        };
    }

    return {status: 'failed'};
};

export const confirmSignIn = async ({ticket, code, login}) => {
    const payload = await http('/authentication/confirm', {method: 'POST', body: {ticket, code}});

    if (!payload || !payload.token) return {status: 'failed'};

    saveSession({
        token: payload.token,
        login,
        device: describeDevice(),
        startedAt: Date.now(),
    });

    return {status: 'signed'};
};

export const startReconfirm = async ({recipient} = {}) => {
    const payload = await http('/authentication/reconfirm', {method: 'POST', body: {recipient}});

    if (payload && payload.answer === 'OK') {
        finishReconfirmLocally();
        return {status: 'signed'};
    }

    const pick = pickedRecipient(payload);
    if (pick) return pick;

    if (payload && payload.answer === 'CODE_SENT' && payload.ticket) {
        return {status: 'confirmation', ticket: payload.ticket, attempts: payload.attempts || null};
    }

    return {status: 'failed'};
};

const finishReconfirmLocally = () => {
    const current = getSession();
    if (!current) return;

    const rest = {...current};
    delete rest.reconfirm;

    dropCache();
    saveSession(rest);
};

export const confirmReconfirm = async ({ticket, code}) => {
    const payload = await http('/authentication/reconfirm/confirm', {method: 'POST', body: {ticket, code}});

    if (!payload || payload.answer !== 'OK') return {status: 'failed'};

    finishReconfirmLocally();
    return {status: 'signed'};
};

export const signOut = () => {
    dropCache();
    clearSession();
};
