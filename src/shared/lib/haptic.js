import vkBridge from '@vkontakte/vk-bridge';
import {isVk} from './platform';
import {getWebApp} from './telegram';

const vkTaptic = (event, params) => {
    if (!isVk()) return;

    try {
        vkBridge.send(event, params).catch(() => {});
    } catch (e) {
    }
};

const telegramHaptic = () => getWebApp()?.HapticFeedback || null;

export const hapticImpact = (style = 'light') => {
    const haptic = telegramHaptic();

    if (typeof haptic?.impactOccurred === 'function') {
        try {
            haptic.impactOccurred(style);
            return;
        } catch (e) {
        }
    }

    vkTaptic('VKWebAppTapticImpactOccurred', {style});
};

export const hapticNotification = (type = 'success') => {
    const haptic = telegramHaptic();

    if (typeof haptic?.notificationOccurred === 'function') {
        try {
            haptic.notificationOccurred(type);
            return;
        } catch (e) {
        }
    }

    vkTaptic('VKWebAppTapticNotificationOccurred', {type});
};

export const hapticSelection = () => {
    const haptic = telegramHaptic();

    if (typeof haptic?.selectionChanged === 'function') {
        try {
            haptic.selectionChanged();
            return;
        } catch (e) {
        }
    }

    vkTaptic('VKWebAppTapticSelectionChanged', {});
};
