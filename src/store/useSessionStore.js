import {create} from 'zustand';
import {getPlatformState} from '../shared/lib/platform';

const platform = getPlatformState();

export const useSessionStore = create((set) => ({
    platform: platform.platform,
    botType: platform.botType,
    isVk: platform.isVk,
    isTg: platform.isTg,
    isWeb: platform.isWeb,

    user: null,
    internalUserId: null,
    isSynced: false,
    pageId: null,

    setPageId: (pageId) => set({pageId}),
    setUser: (user) => set({user}),
    setInternalUserId: (internalUserId) => set({internalUserId, isSynced: true}),
    setPlatform: (next) => set({
        platform: next.platform,
        botType: next.botType,
        isVk: next.isVk,
        isTg: next.isTg,
        isWeb: next.isWeb
    })
}));

export const selectUserId = (state) => state.internalUserId || state.user?.id || null;
