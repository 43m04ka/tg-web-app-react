import React, {useCallback, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useSessionStore} from '../../store/useSessionStore';
import {useStructureStore} from '../../store/useStructureStore';
import {useAppInsets} from '../../shared/hooks/useAppInsets';
import {hapticImpact} from '../../shared/lib/haptic';
import {getTelegramObject} from '../../shared/lib/telegram';
import {
    formatMoney,
    formatOrderDate,
    isSteamOrder,
    orderCoverLetter,
    orderTitle,
    statusOf
} from '../Account/orderStatus';
import {ChevronIcon, ExternalIcon} from './MoreIcons';
import {menuForBot} from './moreMenu';
import PromoCarousel from './PromoCarousel';
import {useProfileSummary} from './useProfileSummary';
import style from './More.module.scss';

const PREVIEW_LIMIT = 2;

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

export default function More() {
    const navigate = useNavigate();
    const {contentSafeAreaInset, safeAreaInset} = useAppInsets();

    const user = useSessionStore((state) => state.user);
    const botType = useSessionStore((state) => state.botType);
    const infoBlocks = useStructureStore((state) => state.infoBlocks);

    const {orders, favorites, isLoading} = useProfileSummary();

    const [photoFailed, setPhotoFailed] = useState(false);

    const name = greetingName(user);
    const avatar = user?.photoUrl || null;

    const groups = useMemo(() => menuForBot(botType), [botType]);

    const openLink = useCallback((url) => {
        if (!url) return;
        hapticImpact('light');

        const tg = getTelegramObject();
        if (typeof tg.openLink === 'function') tg.openLink(url);
        else window.open(url, '_blank', 'noopener');
    }, []);

    const press = useCallback((item) => {
        if (item.to) {
            hapticImpact('light');
            navigate(item.to);
            return;
        }

        openLink(item.url);
    }, [navigate, openLink]);

    const go = useCallback((to) => {
        hapticImpact('light');
        navigate(to);
    }, [navigate]);

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

    const renderList = (group) => (
        <div className={style.card}>
            {group.items.map((item) => (
                <button key={item.key} type="button" className={style.row} onClick={() => press(item)}>
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
    );

    const renderTiles = (group) => (
        <div className={style.tiles}>
            {group.items.map((item) => (
                <button key={item.key} type="button" className={style.tile} style={{'--tone': item.color}}
                        onClick={() => openLink(item.url)}>
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
    );

    const renderLinks = (group) => (
        <div className={style.legal}>
            {group.items.map((item) => (
                <button key={item.key} type="button" className={style.legalLink}
                        onClick={() => openLink(item.url)}>
                    {item.name}
                </button>
            ))}
        </div>
    );

    return (
        <div
            className={style.screen}
            style={{
                paddingTop: `calc(${contentSafeAreaInset.top}px + 14 * var(--u))`,
                paddingBottom: `calc(${safeAreaInset.bottom}px + 24 * var(--u))`
            }}
        >
            <header className={style.head}>
                <span className={style.avatar} aria-hidden="true">
                    {name.slice(0, 1).toUpperCase()}
                    {avatar && !photoFailed ? (
                        <img className={style.avatarPhoto} src={avatar} alt=""
                             onError={() => setPhotoFailed(true)}/>
                    ) : null}
                </span>

                <span className={style.headBody}>
                    <span className={style.hello}>Привет, {name} 👋</span>
                    <span className={style.helloNote}>Заказы, избранное и справка — здесь</span>
                </span>
            </header>

            <div className={style.stats}>
                {stats.map((stat) => (
                    <button key={stat.key} type="button" className={style.stat} onClick={() => go(stat.to)}>
                        {stat.value === null && isLoading ? (
                            <span className={`${style.statSkeleton} ${style.shimmer}`} aria-hidden="true"/>
                        ) : (
                            <span className={style.statValue}>{stat.value === null ? '—' : stat.value}</span>
                        )}
                        <span className={style.statLabel}>{stat.label}</span>
                    </button>
                ))}
            </div>

            {infoBlocks?.length ? (
                <section className={style.section}>
                    <h2 className={style.sectionTitle}>Акции</h2>
                    <PromoCarousel items={infoBlocks} onOpen={openLink}/>
                </section>
            ) : null}

            {groups.filter((group) => group.kind === 'list').map((group) => (
                <section key={group.key} className={style.section}>
                    {group.title ? <h2 className={style.sectionTitle}>{group.title}</h2> : null}
                    {renderList(group)}
                </section>
            ))}

            {recent?.length ? (
                <section className={style.section}>
                    <div className={style.sectionHead}>
                        <h2 className={style.sectionTitle}>Последние заказы</h2>
                        <button type="button" className={style.sectionAction} onClick={() => go('/history')}>
                            Все ›
                        </button>
                    </div>

                    <div className={style.card}>
                        {recent.map((order) => {
                            const status = statusOf(order);

                            return (
                                <button key={order.id} type="button" className={style.order}
                                        onClick={() => go('/history')}>
                                    <span className={`${style.orderCover} ${isSteamOrder(order) ? style.steamCover : ''}`}>
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
                </section>
            ) : null}

            {groups.filter((group) => group.kind === 'tiles').map((group) => (
                <section key={group.key} className={style.section}>
                    {group.title ? <h2 className={style.sectionTitle}>{group.title}</h2> : null}
                    {renderTiles(group)}
                </section>
            ))}

            {groups.filter((group) => group.kind === 'links').map((group) => (
                <section key={group.key} className={style.section}>
                    {renderLinks(group)}
                </section>
            ))}
        </div>
    );
}
