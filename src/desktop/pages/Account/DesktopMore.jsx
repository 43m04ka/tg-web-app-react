import React, {useCallback, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useSessionStore} from '../../../store/useSessionStore';
import {useStructureStore} from '../../../store/useStructureStore';
import {
    formatMoney,
    formatOrderDate,
    isSteamOrder,
    orderCoverLetter,
    orderTitle,
    statusOf
} from '../../../pages/Account/orderStatus';
import {menuForBot} from '../../../pages/More/moreMenu';
import {useProfileSummary} from '../../../pages/More/useProfileSummary';
import {ChevronIcon, ExternalIcon} from '../../../pages/More/MoreIcons';
import {useScrollMemory} from '../../shell/ScrollAreaContext';
import {Reveal} from '../../shell/useReveal';
import style from './DesktopMore.module.scss';

const PREVIEW_LIMIT = 4;

const greetingName = (user) => {
    const name = String(user?.first_name || user?.username || '').trim();
    return name || 'Гость';
};

const pluralOrders = (count) => {
    const tail = count % 10;
    const hundred = count % 100;
    if (tail === 1 && hundred !== 11) return 'Заказ';
    if (tail >= 2 && tail <= 4 && (hundred < 12 || hundred > 14)) return 'Заказа';
    return 'Заказов';
};

export default function DesktopMore() {
    const navigate = useNavigate();

    const user = useSessionStore((state) => state.user);
    const botType = useSessionStore((state) => state.botType);
    const infoBlocks = useStructureStore((state) => state.infoBlocks);

    const {orders, favorites, isLoading} = useProfileSummary();

    const [photoFailed, setPhotoFailed] = useState(false);

    const name = greetingName(user);
    const avatar = user?.photoUrl || null;

    const groups = useMemo(() => menuForBot(botType), [botType]);

    useScrollMemory('more', {ready: !isLoading});

    const openLink = useCallback((url) => {
        if (!url) return;
        window.open(url, '_blank', 'noopener');
    }, []);

    const press = useCallback((item) => {
        if (item.to) {
            navigate(item.to);
            return;
        }

        openLink(item.url);
    }, [navigate, openLink]);

    const stats = useMemo(() => [
        {
            key: 'orders',
            value: orders ? orders.length : null,
            label: orders ? pluralOrders(orders.length) : 'Заказы',
            to: '/history'
        },
        {
            key: 'favorites',
            value: favorites ? favorites.length : null,
            label: 'В избранном',
            to: '/favorites'
        }
    ], [orders, favorites]);

    const recent = orders ? orders.slice(0, PREVIEW_LIMIT) : null;

    const lists = groups.filter((group) => group.kind === 'list');
    const tiles = groups.filter((group) => group.kind === 'tiles');
    const links = groups.filter((group) => group.kind === 'links');

    return (
        <div className={style.screen}>
            <header className={style.head}>
                <span className={style.avatar} aria-hidden="true">
                    {name.slice(0, 1).toUpperCase()}
                    {avatar && !photoFailed ? (
                        <img
                            className={style.avatarPhoto}
                            src={avatar}
                            alt=""
                            onError={() => setPhotoFailed(true)}
                        />
                    ) : null}
                </span>

                <span className={style.headBody}>
                    <h1 className={style.hello}>Привет, {name}</h1>
                    <span className={style.helloNote}>Заказы, избранное и справка — здесь</span>
                </span>

                <div className={style.stats}>
                    {stats.map((stat, index) => (
                        <button
                            key={stat.key}
                            type="button"
                            className={style.stat}
                            style={{'--i': index}}
                            onClick={() => navigate(stat.to)}
                        >
                            {stat.value === null && isLoading ? (
                                <span className={style.statSkeleton} aria-hidden="true"/>
                            ) : (
                                <span className={style.statValue}>{stat.value === null ? '—' : stat.value}</span>
                            )}
                            <span className={style.statLabel}>{stat.label}</span>
                        </button>
                    ))}
                </div>
            </header>

            <div className={style.body}>
                <div className={style.column}>
                    {lists.map((group) => (
                        <Reveal as="section" key={group.key} className={style.section}>
                            {group.title ? <h2 className={style.sectionTitle}>{group.title}</h2> : null}

                            <div className={style.card}>
                                {group.items.map((item, index) => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        className={style.row}
                                        style={{'--i': index}}
                                        onClick={() => press(item)}
                                    >
                                        <span className={style.rowIcon} style={{'--tone': item.color}}>
                                            <item.Icon/>
                                        </span>
                                        <span className={style.rowLabel}>{item.name}</span>
                                        {item.to
                                            ? <ChevronIcon className={style.rowChevron}/>
                                            : <ExternalIcon className={style.rowExternal}/>}
                                    </button>
                                ))}
                            </div>
                        </Reveal>
                    ))}

                    {tiles.map((group) => (
                        <Reveal as="section" key={group.key} className={style.section}>
                            {group.title ? <h2 className={style.sectionTitle}>{group.title}</h2> : null}

                            <div className={style.tiles}>
                                {group.items.map((item, index) => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        className={style.tile}
                                        style={{'--tone': item.color, '--i': index}}
                                        onClick={() => openLink(item.url)}
                                    >
                                        <span className={style.tileIcon}>
                                            <item.Icon/>
                                        </span>
                                        <span className={style.tileBody}>
                                            <span className={style.tileName}>{item.name}</span>
                                            {item.note ? <span className={style.tileNote}>{item.note}</span> : null}
                                        </span>
                                        <ExternalIcon className={style.tileArrow}/>
                                    </button>
                                ))}
                            </div>
                        </Reveal>
                    ))}
                </div>

                <div className={style.column}>
                    {recent?.length ? (
                        <Reveal as="section" className={style.section}>
                            <div className={style.sectionHead}>
                                <h2 className={style.sectionTitle}>Последние заказы</h2>
                                <button
                                    type="button"
                                    className={style.sectionAction}
                                    onClick={() => navigate('/history')}
                                >
                                    Все
                                    <span className={style.sectionArrow} aria-hidden="true">→</span>
                                </button>
                            </div>

                            <div className={style.card}>
                                {recent.map((order, index) => {
                                    const status = statusOf(order);

                                    return (
                                        <button
                                            key={order.id}
                                            type="button"
                                            className={style.order}
                                            style={{'--i': index}}
                                            onClick={() => navigate('/history')}
                                        >
                                            <span
                                                className={isSteamOrder(order)
                                                    ? `${style.orderCover} ${style.steamCover}`
                                                    : style.orderCover}
                                            >
                                                {orderCoverLetter(order)}
                                            </span>

                                            <span className={style.orderBody}>
                                                <span className={style.orderTitle}>{orderTitle(order)}</span>
                                                <span className={style.orderMeta}>
                                                    {[formatOrderDate(order.createdAt), formatMoney(order.total)]
                                                        .filter(Boolean)
                                                        .join(' · ')}
                                                </span>
                                            </span>

                                            <span className={`${style.orderStatus} ${style[status.tone]}`}>
                                                {status.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </Reveal>
                    ) : null}

                    {infoBlocks?.length ? (
                        <Reveal as="section" className={style.section}>
                            <h2 className={style.sectionTitle}>Акции</h2>

                            <div className={style.promos}>
                                {infoBlocks.map((block, index) => (
                                    <button
                                        key={block.id ?? index}
                                        type="button"
                                        className={style.promo}
                                        style={{'--i': index}}
                                        disabled={!block.path}
                                        onClick={() => openLink(block.path)}
                                    >
                                        <span className={style.promoHead}>
                                            <span className={style.promoTitle}>{block.name}</span>
                                            {block.path ? (
                                                <ExternalIcon className={style.promoArrow}/>
                                            ) : null}
                                        </span>

                                        {block.body ? (
                                            <span className={style.promoBody}>{block.body}</span>
                                        ) : null}
                                    </button>
                                ))}
                            </div>
                        </Reveal>
                    ) : null}

                    {links.map((group) => (
                        <section key={group.key} className={style.section}>
                            <div className={style.legal}>
                                {group.items.map((item) => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        className={style.legalLink}
                                        onClick={() => openLink(item.url)}
                                    >
                                        {item.name}
                                    </button>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );
}
