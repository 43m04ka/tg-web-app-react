import {fetchRecommendations} from '../../shared/api/product';

const VISIBLE = 5;
const BUFFER = VISIBLE * 2;

const slots = new Map();

const slotFor = (pageId) => {
    if (!slots.has(pageId)) slots.set(pageId, {queue: [], seen: new Set(), request: null});

    return slots.get(pageId);
};

const refill = (slot, pageId) => {
    if (slot.request) return slot.request;
    if (slot.queue.length >= BUFFER) return Promise.resolve(slot.queue);

    slot.request = fetchRecommendations(pageId)
        .then((list) => {
            const incoming = (Array.isArray(list) ? list : []).filter((product) => product && product.id);

            let fresh = incoming.filter((product) => !slot.seen.has(product.id));

            if (fresh.length === 0 && incoming.length > 0) {
                slot.seen = new Set(slot.queue.map((product) => product.id));
                fresh = incoming.filter((product) => !slot.seen.has(product.id));
            }

            fresh.forEach((product) => slot.seen.add(product.id));
            slot.queue = [...slot.queue, ...fresh].slice(0, BUFFER * 2);
            slot.request = null;

            return slot.queue;
        })
        .catch(() => {
            slot.request = null;
            return slot.queue;
        });

    return slot.request;
};

export const warmRecommendations = (pageId) => {
    if (pageId === null || pageId === undefined) return;

    refill(slotFor(pageId), pageId);
};

export const peekRecommendations = (pageId) => {
    if (pageId === null || pageId === undefined) return [];

    return slotFor(pageId).queue.slice(0, VISIBLE);
};

export const takeRecommendations = async (pageId) => {
    if (pageId === null || pageId === undefined) return [];

    const slot = slotFor(pageId);

    if (slot.queue.length < VISIBLE) await refill(slot, pageId);

    const batch = slot.queue.splice(0, VISIBLE);

    refill(slot, pageId);

    return batch;
};
