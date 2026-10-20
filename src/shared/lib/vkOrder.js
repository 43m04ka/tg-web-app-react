import {getVkGroupId} from './platform';

export const withVkGroup = (payload, groupOf = getVkGroupId) => {
    if (payload?.platform !== 'vk' || payload.vkGroupId) return payload;

    return {...payload, vkGroupId: groupOf()};
};
