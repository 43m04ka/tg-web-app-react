import {useSyncExternalStore} from 'react';
import {getPlatformState, isSamePlatformState} from '../lib/platform';
import {ensureTelegram, subscribeTelegramSdk} from '../lib/telegram';

const RECHECK_STEPS_MS = [0, 30, 80, 160, 320, 600, 1000, 1600, 2400];

const SETTLE_TIMEOUT_MS = 700;

const withSettled = (value, isSettled) => ({...value, isSettled: isSettled || !value.isWeb});

let settleReached = false;
let state = withSettled(getPlatformState(), settleReached);
const listeners = new Set();

const emit = () => listeners.forEach((listener) => listener());

const sync = () => {
    const next = withSettled(getPlatformState(), settleReached);
    if (isSamePlatformState(state, next) && state.isSettled === next.isSettled) return;

    state = next;
    emit();
};

const startWatching = () => {
    setTimeout(() => {
        settleReached = true;
        sync();
    }, SETTLE_TIMEOUT_MS);

    RECHECK_STEPS_MS.forEach((delay) => setTimeout(sync, delay));
    ensureTelegram().then(sync);
    subscribeTelegramSdk(sync);
    window.addEventListener('pageshow', sync);
};

if (typeof window !== 'undefined') startWatching();

const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

const getSnapshot = () => state;

export function usePlatform() {
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
