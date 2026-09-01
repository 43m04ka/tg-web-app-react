import {useEffect, useState} from 'react';
import {http} from './http';
import {dropCache} from './cache';
import {toast} from './notify';
import {clearSession, getSession, saveSession, setUnauthorizedHandler, subscribeSession} from './token';

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

export const useSession = () => {
    const [session, setSession] = useState(getSession());

    useEffect(() => subscribeSession(setSession), []);

    return session;
};

export const signIn = async ({login, password}) => {
    const payload = await http('/authentication', {method: 'POST', body: {login, password}});

    if (payload && payload.token) {
        saveSession({
            token: payload.token,
            login,
            device: describeDevice(),
            startedAt: Date.now(),
        });

        return {status: 'signed'};
    }

    if (payload && payload.confirmation) {
        return {status: 'confirmation', ticket: payload.confirmation};
    }

    return {status: 'failed'};
};

export const confirmSignIn = async ({ticket, code, login}) => {
    const payload = await http('/auth/confirm', {method: 'POST', body: {ticket, code}});

    if (!payload || !payload.token) return {status: 'failed'};

    saveSession({
        token: payload.token,
        login,
        device: describeDevice(),
        startedAt: Date.now(),
    });

    return {status: 'signed'};
};

export const signOut = () => {
    dropCache();
    clearSession();
};
