import {useCallback} from 'react';
import {usePlatform} from './usePlatform';
import {askVkMessages} from '../lib/vk';

export function useVkMessages() {
    const {isVk} = usePlatform();

    return useCallback(() => (isVk ? askVkMessages() : Promise.resolve(undefined)), [isVk]);
}
