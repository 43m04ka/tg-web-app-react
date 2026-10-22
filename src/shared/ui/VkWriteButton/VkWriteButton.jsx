import React from 'react';
import {isVk} from '../../lib/platform';
import {getVkMessagesAllowed, vkCommunityChatUrl} from '../../lib/vk';

export default function VkWriteButton({className}) {
    if (!isVk() || getVkMessagesAllowed() !== false) return null;

    return (
        <button type="button" className={className} onClick={() => window.open(vkCommunityChatUrl(), '_blank')}>
            Написать в сообщество
        </button>
    );
}
