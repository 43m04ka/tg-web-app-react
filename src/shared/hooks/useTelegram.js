import {usePlatform} from './usePlatform';
import {useAppInsets} from './useAppInsets';
import {getTelegramObject} from '../lib/telegram';
import {getVkGroupId} from '../lib/platform';

export function useTelegram() {
    const {isVk} = usePlatform();
    const {contentSafeAreaInset, safeAreaInset, isKeyboardOpen} = useAppInsets();

    return {
        tg: getTelegramObject(),
        vkGroupId: isVk ? getVkGroupId() : null,
        contentSafeAreaInset,
        safeAreaInset,
        isKeyboardOpen
    };
}
