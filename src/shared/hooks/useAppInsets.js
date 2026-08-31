import {useSyncExternalStore} from 'react';
import {getInsets, subscribeInsets} from '../lib/insets';

export function useAppInsets() {
    return useSyncExternalStore(subscribeInsets, getInsets, getInsets);
}
