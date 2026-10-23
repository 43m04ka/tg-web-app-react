import {useCallback} from 'react';
import {usePlatform} from './usePlatform';
import {askVkMessages} from '../lib/vk';
import {paysInVkChat} from '../lib/paymentLink';

export function useVkMessages() {
    const {isVk} = usePlatform();

    return useCallback(() => (isVk ? askVkMessages({force: paysInVkChat()}) : Promise.resolve(undefined)), [isVk]);
}
