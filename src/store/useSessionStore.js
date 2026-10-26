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
    account: null,
    login: null,
    syncFailed: false,
    syncToken: 0,
    pageId: null,

    setPageId: (pageId) => set({pageId}),
    setUser: (user) => set({user}),
    setInternalUserId: (internalUserId) => set({internalUserId, syncFailed: false}),
    setAccount: (account) => set(account ? {account, internalUserId: account.id, syncFailed: false} : {account: null}),
    openLogin: (reason = 'order') => set({login: {reason}}),
    closeLogin: () => set({login: null}),
    setSyncFailed: () => set({syncFailed: true}),
    resync: () => set((state) => (state.internalUserId
        ? state
        : {syncToken: state.syncToken + 1, syncFailed: false})),
    setPlatform: (next) => set({
        platform: next.platform,
        botType: next.botType,
        isVk: next.isVk,
        isTg: next.isTg,
        isWeb: next.isWeb
    })
}));

export const selectUserId = (state) => state.internalUserId;

export const selectIsGuest = (state) => state.account?.kind !== 'user';
