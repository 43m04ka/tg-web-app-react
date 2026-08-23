import {
    ChannelIcon,
    CommunityIcon,
    DocIcon,
    GuideIcon,
    HeartIcon,
    OrdersIcon,
    ShieldIcon,
    SupportIcon
} from './MoreIcons';

// Пункты и их адреса перенесены из старого бота (pages/MoreInfo). Там же был отбор
// по площадке: в VK-сообществе PlayStation незачем показывать ссылку на него же,
// а поддержка у каждой площадки своя.
export const MENU_GROUPS = [
    {
        key: 'account',
        items: [
            {
                key: 'favorites',
                name: 'Избранное',
                bots: ['vk-xbox', 'vk-ps', 'tg', 'web'],
                to: '/favorites',
                Icon: HeartIcon,
                color: '#ec4444'
            },
            {
                key: 'history',
                name: 'История заказов',
                bots: ['vk-xbox', 'vk-ps', 'tg', 'web'],
                to: '/history',
                Icon: OrdersIcon,
                color: '#0382c9'
            },
            {
                key: 'support-vk-ps',
                name: 'Поддержка магазина',
                bots: ['vk-ps'],
                url: 'https://vk.com/im/convo/-85243268?entrypoint=community_page&tab=all',
                Icon: SupportIcon,
                color: '#f43c4b'
            },
            {
                key: 'support-vk-xbox',
                name: 'Поддержка магазина',
                bots: ['vk-xbox'],
                url: 'https://vk.com/im/convo/-217049080?entrypoint=community_page&tab=all',
                Icon: SupportIcon,
                color: '#f43c4b'
            },
            {
                key: 'support-tg',
                name: 'Поддержка магазина',
                bots: ['tg', 'web'],
                url: 'https://t.me/gwstore_admin',
                Icon: SupportIcon,
                color: '#f43c4b'
            }
        ]
    },
    {
        key: 'channels',
        title: 'Наши каналы',
        items: [
            {
                key: 'vk-xbox',
                name: 'Сообщество Геймворд | Xbox',
                bots: ['tg', 'vk-ps', 'web'],
                url: 'https://vk.com/gwstore.xbox',
                Icon: CommunityIcon,
                color: '#0076fd'
            },
            {
                key: 'vk-ps',
                name: 'Сообщество Геймворд | PlayStation',
                bots: ['tg', 'vk-xbox', 'web'],
                url: 'https://vk.com/gwstore.playstation',
                Icon: CommunityIcon,
                color: '#0076fc'
            },
            {
                key: 'tg-xbox',
                name: 'Канал Геймворд | Xbox',
                bots: ['tg', 'web'],
                url: 'https://t.me/gwstore_xbox',
                Icon: ChannelIcon,
                color: '#28a6e7'
            },
            {
                key: 'tg-ps',
                name: 'Канал Геймворд | PlayStation',
                bots: ['tg', 'web'],
                url: 'https://t.me/gwstore_playstation',
                Icon: ChannelIcon,
                color: '#28a7e8'
            }
        ]
    },
    {
        key: 'docs',
        title: 'Справка',
        items: [
            {
                key: 'faq-ps',
                name: 'Инструкции для PlayStation',
                bots: ['vk-ps', 'vk-xbox', 'tg', 'web'],
                url: 'https://gwstore.su/faq_playstation',
                Icon: GuideIcon,
                color: '#3730a1'
            },
            {
                key: 'faq-xbox',
                name: 'Инструкции для Xbox',
                bots: ['vk-xbox', 'vk-ps', 'tg', 'web'],
                url: 'https://gwstore.su/faq_xbox',
                Icon: GuideIcon,
                color: '#18a24a'
            },
            {
                key: 'terms',
                name: 'Пользовательское соглашение',
                bots: ['vk-xbox', 'vk-ps', 'tg', 'web'],
                url: 'https://gwstore.su/privacy',
                Icon: DocIcon,
                color: '#f7953f'
            },
            {
                key: 'privacy',
                name: 'Политика конфиденциальности',
                bots: ['vk-xbox', 'vk-ps', 'tg', 'web'],
                url: 'https://gwstore.su/pk',
                Icon: ShieldIcon,
                color: '#fd7f3b'
            }
        ]
    }
];

export const menuForBot = (botType) => MENU_GROUPS
    .map((group) => ({...group, items: group.items.filter((item) => item.bots.includes(botType))}))
    .filter((group) => group.items.length > 0);
