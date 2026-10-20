import {useEffect} from 'react';
import {usePlatform} from './usePlatform';
import {askVkMessages} from '../lib/vk';

export function useVkMessages() {
    const {isVk} = usePlatform();

    useEffect(() => {
        if (isVk) askVkMessages();
    }, [isVk]);
}
