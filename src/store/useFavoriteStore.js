import {create} from 'zustand';
import {addFavorite, fetchFavoriteIds, removeFavorite} from '../shared/api/account';

const toIdSet = (result) => new Set((Array.isArray(result) ? result : []).map(Number));

export const useFavoriteStore = create((set, get) => ({
    ids: null,
    userId: null,

    reload: async (userId) => {
        if (!userId) return;

        try {
            set({ids: toIdSet(await fetchFavoriteIds(userId)), userId});
        } catch (error) {
            console.error('[favorite] reload:', error.message);
            set({ids: new Set(), userId});
        }
    },

    load: (userId) => {
        if (!userId || get().userId === userId) return Promise.resolve();
        return get().reload(userId);
    },

    setFavorite: async (userId, productId, isFavorite) => {
        if (!userId) return false;

        const current = get().ids;

        if (current) {
            const ids = new Set(current);
            if (isFavorite) ids.add(productId);
            else ids.delete(productId);
            set({ids});
        }

        try {
            await (isFavorite ? addFavorite(userId, productId) : removeFavorite(userId, productId));
            return true;
        } catch (error) {
            console.error('[favorite] save:', error.message);
            if (current) get().reload(userId);
            return false;
        }
    },

    toggle: (userId, productId) =>
        get().setFavorite(userId, productId, !get().ids?.has(productId))
}));

export const selectIsFavorite = (productId) => (state) => state.ids?.has(productId) ?? false;
