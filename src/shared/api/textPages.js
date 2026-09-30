import {request} from './client';

export const fetchTextPages = async ({section, tag, limit, offset} = {}, signal) => {
    const payload = await request('/api/structure/textPages', {
        signal,
        query: {section, tag: tag || undefined, limit, offset}
    });

    return {
        items: Array.isArray(payload?.result) ? payload.result : [],
        total: Number(payload?.total) || 0
    };
};

export const fetchTextPage = async (slug, signal) => {
    const payload = await request(`/api/structure/textPages/${encodeURIComponent(slug)}`, {signal});

    return payload?.result ?? null;
};
