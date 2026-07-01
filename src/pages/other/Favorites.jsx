import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function formatDate(value) {
    if (!value || value === null) return null;
    const n = Number(value);
    if (!isNaN(n)) {
        const d = n > 1e10 ? new Date(n) : new Date(n * 86400000 + new Date('1899-12-30T00:00:00.000Z').getTime());
        return d && !isNaN(d.getTime()) ? d.toLocaleDateString('ru-RU') : null;
    }
    const d = new Date(value);
    return !isNaN(d.getTime()) ? d.toLocaleDateString('ru-RU') : String(value);
}
import { useTelegram } from '../../hooks/useTelegram';
import { useServerUser } from '../../hooks/useServerUser';
import useGlobalData from '../../hooks/useGlobalData';
import Recommendations from '../../shared/ui/Recommendations/Recommendations';
import DesktopFavorites from './DesktopFavorites/DesktopFavorites';
import style from './Favorites.module.scss';
import basketStyle from '../Basket/Basket.module.scss';

const Favorites = () => {
    const [isDesktop] = useState(() => window.innerWidth >= 768);

    if (isDesktop) return <DesktopFavorites />;

    return <MobileFavorites />;
};

/* ── Mobile version ──────────────────────────────────────── */
const MobileFavorites = () => {
    const { tg, user, safeAreaInset, contentSafeAreaInset } = useTelegram();
    const navigate = useNavigate();
    const { getFavoriteList, deleteCardToFavorite } = useServerUser();
    const { updatePreviewFavoriteData } = useGlobalData();
    const [cardList, setCardList] = useState(null);

    if (cardList === null) {
        getFavoriteList(setCardList, user.id).then();
    }

    useEffect(() => {
        tg.BackButton.show();
        const onBack = () => navigate(-1);
        tg.onEvent('backButtonClicked', onBack);
        return () => { tg.offEvent('backButtonClicked', onBack); };
    }, [navigate, tg]);

    const paddingTop = contentSafeAreaInset.top + safeAreaInset.top;
    const paddingBottom = contentSafeAreaInset.bottom + safeAreaInset.bottom;

    if (cardList === null) {
        return (
            <div className="plup-loader" style={{
                marginTop: `${window.innerHeight / 2 - 50}px`,
                marginLeft: `${window.innerWidth / 2 - 50}px`,
            }} />
        );
    }

    if (cardList.length === 0) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100vh',
                paddingTop: `${paddingTop}px`, paddingBottom: `${paddingBottom}px`, overflowY: 'scroll' }}>
                <div className={basketStyle.emptyBasket}>
                    <div />
                    <div>В избранном ничего нет</div>
                    <button className={basketStyle.button} style={{ background: '#454545' }}
                            onClick={() => navigate('/')}>
                        Перейти к покупкам
                    </button>
                </div>
                <Recommendations />
            </div>
        );
    }

    return (
        <div className={style.page} style={{ paddingTop: `${paddingTop}px` }}>
            <p className={style.title}>Избранное</p>
            <div className={style.list} style={{ paddingBottom: `${paddingBottom + 20}px` }}>
                {cardList.map(item => (
                    <MobileFavoriteCard
                        key={item.id}
                        item={item}
                        onDelete={async () => {
                            await deleteCardToFavorite(() => {
                                updatePreviewFavoriteData();
                                getFavoriteList(setCardList, user.id);
                            }, user.id, item.id);
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

/* ── Mobile card ─────────────────────────────────────────── */
const MobileFavoriteCard = ({ item, onDelete }) => {
    const platform = item.platform
        ? (item.choiceColumn ? `${item.choiceColumn} ${item.choiceRow}` : item.platform)
        : '';
    const hasDiscount = item.oldPrice !== null;
    const discountLabel = hasDiscount
        ? `−${Math.ceil((1 - item.price / item.oldPrice) * 100)}%`
        : '';
    const endDate = formatDate(item.endDatePromotion);

    return (
        <div className={style.card}>
            <Link to={'/card/' + item.id} style={{ display: 'contents' }}>
                <div className={style.imageWrap}>
                    <div className={style.image}
                         style={{ backgroundImage: `url(${item.image})` }} />
                    {discountLabel && <span className={style.badge}>{discountLabel}</span>}
                </div>
                <div className={style.info}>
                    <div className={style.name}>{item.name}</div>
                    {platform && <div className={style.platform}>{platform}</div>}
                    <div className={style.priceRow}>
                        {item.isSale ? (
                            <>
                                <span className={hasDiscount ? style.priceDiscount : style.price}>
                                    {item.price} ₽
                                </span>
                                {hasDiscount && (
                                    <span className={style.oldPrice}>{item.oldPrice} ₽</span>
                                )}
                            </>
                        ) : (
                            <span className={style.notForSale}>Нет в продаже</span>
                        )}
                    </div>
                    {endDate && (
                        <div style={{ fontSize: '2.5vw', color: 'rgba(255,215,0,0.8)', marginTop: '0.5vw',
                            fontFamily: "'SF PRO Display', sans-serif" }}>
                            Скидка {discountLabel} до {endDate}
                        </div>
                    )}
                </div>
            </Link>
            <button className={style.deleteBtn} onClick={onDelete}>
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
        </div>
    );
};

export default Favorites;
