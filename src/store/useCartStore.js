import {create} from 'zustand';
import {
    addBasketProduct,
    deleteBasketProduct,
    fetchBasket,
    updateBasketCount
} from '../shared/api/basket';

const toList = (result) => (Array.isArray(result) ? result : []);

export const useCartStore = create((set, get) => ({
    items: null,
    userId: null,
    revision: 0,

    reload: async (userId) => {
        if (!userId) return;

        try {
            const items = toList(await fetchBasket(userId));
            set((state) => ({items, userId, revision: state.revision + 1}));
        } catch (error) {
            console.error('[cart] reload:', error.message);
            set((state) => ({items: [], userId, revision: state.revision + 1}));
        }
    },

    load: (userId) => {
        if (!userId || get().userId === userId) return Promise.resolve();
        return get().reload(userId);
    },

    add: async (userId, product) => {
        if (!userId || !product) return;

        const items = get().items || [];
        if (items.some((item) => item.id === product.id)) return;

        set({items: [{...product, count: 1}, ...items]});

        try {
            await addBasketProduct(userId, product.id);
            set((state) => ({revision: state.revision + 1}));
        } catch (error) {
            console.error('[cart] add:', error.message);
            get().reload(userId);
        }
    },

    setCount: async (userId, productId, count) => {
        if (!userId) return;

        const items = get().items || [];

        if (count < 1) {
            set({items: items.filter((item) => item.id !== productId)});

            try {
                await deleteBasketProduct(userId, productId);
                set((state) => ({revision: state.revision + 1}));
            } catch (error) {
                console.error('[cart] delete:', error.message);
                get().reload(userId);
            }
            return;
        }

        set({items: items.map((item) => (item.id === productId ? {...item, count} : item))});

        try {
            await updateBasketCount(userId, productId, count);
            set((state) => ({revision: state.revision + 1}));
        } catch (error) {
            console.error('[cart] count:', error.message);
            get().reload(userId);
        }
    },

    clearLocal: () => set((state) => ({items: [], revision: state.revision + 1}))
}));

export const selectCartCount = (productId) => (state) =>
    state.items?.find((item) => item.id === productId)?.count ?? 0;

export const selectCartSize = (state) => state.items?.length ?? 0;
