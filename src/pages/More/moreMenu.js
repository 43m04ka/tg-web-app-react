import {
    ChannelIcon,
    CommunityIcon,
    GuideIcon,
    HeartIcon,
    OrdersIcon,
    SupportIcon
} from './MoreIcons';
import {fallbackBotType} from '../../shared/lib/platform';

export const MENU_GROUPS = [
    {
        key: 'main',
        kind: 'list',
        items: [
            {
                key: 'favorites',
                name: 'Избранное',
                bots: ['vk-xbox', 'vk-ps', 'tg', 'web'],
                to: '/favorites',
                Icon: HeartIcon,
                color: '#ff5a5a'
            },
            {
                key: 'history',
                name: 'Мои заказы',
                bots: ['vk-xbox', 'vk-ps', 'tg', 'web'],
                to: '/history',
                Icon: OrdersIcon,
                color: 'var(--accent)'
            },
            {
                key: 'support-vk-ps',
                name: 'Поддержка',
                bots: ['vk-ps'],
                url: 'https://vk.com/im/convo/-85243268?entrypoint=community_page&tab=all',
                Icon: SupportIcon,
                color: '#5aa8ff'
            },
            {
                key: 'support-vk-xbox',
                name: 'Поддержка',
                bots: ['vk-xbox'],
                url: 'https://vk.com/im/convo/-217049080?entrypoint=community_page&tab=all',
                Icon: SupportIcon,
                color: '#5aa8ff'
            },
            {
                key: 'support-tg',
                name: 'Поддержка',
                bots: ['tg', 'web'],
                url: 'https://t.me/gwstore_admin',
                Icon: SupportIcon,
                color: '#5aa8ff'
            },
            {
                key: 'faq-ps',
                name: 'Инструкции для PS4 / PS5',
                bots: ['vk-ps', 'vk-xbox', 'tg', 'web'],
                url: 'https://gwstore.su/faq_playstation',
                Icon: GuideIcon,
                color: '#4f8dfd'
            },
            {
                key: 'faq-xbox',
                name: 'Инструкции для Xbox',
                bots: ['vk-xbox', 'vk-ps', 'tg', 'web'],
                url: 'https://gwstore.su/faq_xbox',
                Icon: GuideIcon,
                color: '#2fbf5e'
            }
        ]
    },
    {
        key: 'channels',
        kind: 'tiles',
        title: 'Наши каналы',
        items: [
            {
                key: 'tg-ps',
                name: 'Скидки и новости PlayStation',
                note: 'Telegram',
                bots: ['tg', 'web'],
                url: 'https://t.me/gwstore_playstation',
                Icon: ChannelIcon,
                color: '#3d7dff'
            },
            {
                key: 'tg-xbox',
                name: 'Скидки и новости Xbox',
                note: 'Telegram',
                bots: ['tg', 'web'],
                url: 'https://t.me/gwstore_xbox',
                Icon: ChannelIcon,
                color: '#2fbf5e'
            },
            {
                key: 'vk-ps',
                name: 'Сообщество Геймворд | PlayStation',
                note: 'ВКонтакте',
                bots: ['tg', 'vk-xbox', 'web'],
                url: 'https://vk.com/gwstore.playstation',
                Icon: CommunityIcon,
                color: '#3d7dff'
            },
            {
                key: 'vk-xbox',
                name: 'Сообщество Геймворд | Xbox',
                note: 'ВКонтакте',
                bots: ['tg', 'vk-ps', 'web'],
                url: 'https://vk.com/gwstore.xbox',
                Icon: CommunityIcon,
                color: '#2fbf5e'
            }
        ]
    },
    {
        key: 'legal',
        kind: 'links',
        items: [
            {
                key: 'terms',
                name: 'Пользовательское соглашение',
                bots: ['vk-xbox', 'vk-ps', 'tg', 'web'],
                url: 'https://gwstore.su/privacy'
            },
            {
                key: 'privacy',
                name: 'Политика конфиденциальности',
                bots: ['vk-xbox', 'vk-ps', 'tg', 'web'],
                url: 'https://gwstore.su/pk'
            }
        ]
    }
];

const menuBot = (botType) => fallbackBotType(botType) || botType;

export const menuForBot = (botType) => {
    const bot = menuBot(botType);

    return MENU_GROUPS
        .map((group) => ({...group, items: group.items.filter((item) => item.bots.includes(bot))}))
        .filter((group) => group.items.length > 0);
};

export const supportUrlForBot = (botType) => MENU_GROUPS
    .flatMap((group) => group.items)
    .find((item) => item.key.startsWith('support-') && item.bots.includes(menuBot(botType)))?.url || null;
