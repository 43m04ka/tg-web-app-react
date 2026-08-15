import {isVk} from './isVk';
import {isTg} from './isTg';
import {isWeb} from './isWeb';

const getVkGroupId = () => {
    const params = new URLSearchParams(window.location.search);
    const vkAppId = params.get('vk_app_id');
    return String(vkAppId) === '54475556' ? 217049080 : 85243268;
};

export const getBotType = () => {
    if (isVk()) return String(getVkGroupId()) === '217049080' ? 'vk-xbox' : 'vk-ps';
    if (isTg()) return 'tg';
    return 'web';
};

// Функция быстрого получения текущего среза данных
export const getPlatformState = () => {
    const params = new URLSearchParams(window.location.search);
    const forcedPlatform = params.get('platform');
    
    // Принудительный выбор платформы через URL параметр
    if (forcedPlatform === 'vk') {
        return {
            isVk: true,
            isTg: false,
            isWeb: false,
            botType: String(getVkGroupId()) === '217049080' ? 'vk-xbox' : 'vk-ps'
        };
    }
    
    if (forcedPlatform === 'tg') {
        return {
            isVk: false,
            isTg: true,
            isWeb: false,
            botType: 'tg'
        };
    }
    
    if (forcedPlatform === 'web') {
        return {
            isVk: false,
            isTg: false,
            isWeb: true,
            botType: 'web'
        };
    }
    
    // Стандартное определение платформы
    return {
        isVk: isVk(),
        isTg: isTg(),
        isWeb: isWeb(),
        botType: getBotType()
    };
};