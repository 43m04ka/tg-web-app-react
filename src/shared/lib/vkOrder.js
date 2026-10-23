import {getVkGroupId, isVkApp} from './platform';

export const withVkGroup = (payload, groupOf = getVkGroupId, appOf = isVkApp) => {
    if (payload?.platform !== 'vk') return payload;

    return {...payload, vkGroupId: payload.vkGroupId || groupOf(), vkClient: appOf() ? 'app' : 'web'};
};
