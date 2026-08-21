import {request, safeRequestResult} from './client';

const bySerialNumber = (list) =>
    Array.isArray(list) ? [...list].sort((a, b) => a.serialNumber - b.serialNumber) : null;

export const fetchPages = (signal) =>
    safeRequestResult('/api/structure/allPages', {signal, retries: 2}).then(bySerialNumber);

export const fetchStartPages = (signal) =>
    safeRequestResult('/api/structure/allStartPages', {signal, retries: 2}).then(bySerialNumber);

export const fetchStructureBlocks = (signal) =>
    safeRequestResult('/api/structure/allStructureBlocks', {signal, retries: 2});

export const fetchMainPageProducts = (signal) =>
    safeRequestResult('/api/structure/mainPageProducts', {signal, retries: 2}).then(bySerialNumber);

export const fetchInfoBlocks = (signal) =>
    safeRequestResult('/api/structure/infoBlocks', {signal, retries: 2});

export const fetchCatalogs = (signal, {includeStatus = false} = {}) =>
    safeRequestResult('/api/catalog/allCatalogs', {
        signal,
        retries: 2,
        query: includeStatus ? {includeStatus: 'true'} : undefined
    });

const resolveChatId = async (user) => {
    if (user.platform !== 'web') return String(user.id);

    try {
        const response = await fetch('https://api.ipify.org?format=json');
        return String((await response.json()).ip);
    } catch (e) {
        return String(user.id);
    }
};

export const syncUser = async (user, signal) => {
    const payload = await request('/api/structure/syncUser', {
        method: 'POST',
        signal,
        retries: 2,
        body: {
            chatId: await resolveChatId(user),
            username: user.username || user.first_name || '',
            platform: user.platform || 'tg'
        }
    });

    return payload?.result ?? null;
};
