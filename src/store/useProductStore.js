import {create} from 'zustand';
import {useSessionStore} from './useSessionStore';

const FRESH_MS = 5 * 60 * 1000;
const LIMIT = 60;

const byPrice = (a, b) => Number(a.price) - Number(b.price);

const isUsable = (item) => Boolean(item && item.id);

const entryOf = (product, isFull) => ({product, isFull, savedAt: Date.now()});

const prune = (entries) => {
    const ids = Object.keys(entries);
    if (ids.length <= LIMIT) return entries;

    const kept = ids
        .sort((a, b) => entries[b].savedAt - entries[a].savedAt)
        .slice(0, LIMIT);

    return kept.reduce((next, id) => {
        next[id] = entries[id];
        return next;
    }, {});
};

const SHELF_FRESH_MS = 10 * 60 * 1000;

export const useProductStore = create((set, get) => ({
    entries: {},
    shelves: {},
    pageId: null,

    recallShelf: (pageId) => {
        const shelf = get().shelves[pageId];
        if (!shelf) return null;
        return Date.now() - shelf.savedAt < SHELF_FRESH_MS ? shelf.items : null;
    },

    rememberShelf: (pageId, items) => set((state) => ({
        shelves: {...state.shelves, [pageId]: {items, savedAt: Date.now()}}
    })),

    isFresh: (productId) => {
        const entry = get().entries[productId];
        return Boolean(entry?.isFull && Date.now() - entry.savedAt < FRESH_MS);
    },

    remember: (product, isFull) => {
        if (!isUsable(product)) return;

        set((state) => {
            const entries = {...state.entries};

            entries[product.id] = entryOf(product, isFull);

            const family = [product, ...(product.conceptProducts || [])]
                .filter(isUsable)
                .filter((item, index, all) => all.findIndex((other) => other.id === item.id) === index)
                .sort(byPrice);

            if (family.length > 1) {
                family.forEach((member) => {
                    if (member.id === product.id) return;

                    const known = entries[member.id];
                    if (known?.isFull) return;

                    entries[member.id] = entryOf({
                        ...member,
                        conceptProducts: family.filter((other) => other.id !== member.id)
                    }, false);
                });
            }

            (product.conceptAddOns || []).filter(isUsable).forEach((addon) => {
                if (entries[addon.id]) return;
                entries[addon.id] = entryOf(addon, false);
            });

            return {entries: prune(entries)};
        });
    },

    rememberPreview: (product) => {
        if (!isUsable(product) || get().entries[product.id]) return;
        set((state) => ({entries: prune({...state.entries, [product.id]: entryOf(product, false)})}));
    },

    forget: (productId) => set((state) => {
        if (!state.entries[productId]) return state;

        const entries = {...state.entries};
        delete entries[productId];
        return {entries};
    }),

    clear: () => set({entries: {}, shelves: {}})
}));

useProductStore.setState({pageId: useSessionStore.getState().pageId});

useSessionStore.subscribe((state) => {
    const {pageId} = useProductStore.getState();
    if (state.pageId === pageId) return;

    useProductStore.setState({entries: {}, shelves: {}, pageId: state.pageId});
});

export const selectProductEntry = (productId) => (state) => state.entries[productId] || null;
