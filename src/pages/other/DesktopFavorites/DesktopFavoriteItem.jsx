import React from 'react';
import { useNavigate } from 'react-router-dom';
import style from './DesktopFavoriteItem.module.scss';

/** OLE Automation date (days since 1899-12-30) → localized string */
function oleToDate(value) {
    const days = Number(value);
    if (isNaN(days)) return null;
    const ms = days * 24 * 60 * 60 * 1000;
    const oleEpoch = new Date('1899-12-30T00:00:00.000Z').getTime();
    return new Date(ms + oleEpoch);
}

/** Convert any date value (OLE number, Unix ms, ISO string) to 'ru-RU' string */
function formatDate(value) {
    if (!value || value === null) return null;
    const n = Number(value);
    if (!isNaN(n)) {
        // Large values (~13 digits) are Unix timestamps in ms
        const d = n > 1e10 ? new Date(n) : oleToDate(n);
        return d && !isNaN(d.getTime()) ? d.toLocaleDateString('ru-RU') : null;
    }
    // ISO / free-text date string (same as Product.jsx else-branch)
    const d = new Date(value);
    return !isNaN(d.getTime()) ? d.toLocaleDateString('ru-RU') : String(value);
}

const DesktopFavoriteItem = ({ item, onDelete }) => {
    const navigate = useNavigate();

    const platform = item.platform
        ? (item.choiceColumn ? `${item.choiceColumn} ${item.choiceRow}` : item.platform)
        : '';

    const hasDiscount = item.oldPrice !== null;
    const discountLabel = hasDiscount
        ? `−${Math.ceil((1 - item.price / item.oldPrice) * 100)}%`
        : '';
    const isPreorder = !hasDiscount && item.releaseDate !== null;
    const endDate = formatDate(item.endDatePromotion);

    return (
        <div className={style.card}>
            <div className={style.imageWrap} onClick={() => navigate('/card/' + item.id)}>
                <div className={style.image} style={{ backgroundImage: `url(${item.image})` }} />
                {discountLabel && <span className={style.badge}>{discountLabel}</span>}
                {isPreorder && <span className={style.badgeBlue}>Предзаказ</span>}
            </div>

            <div className={style.info}>
                <div className={style.name} onClick={() => navigate('/card/' + item.id)}>
                    {item.name}
                </div>
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
                    <div className={style.promo}>
                        Скидка {discountLabel} · до {endDate}
                    </div>
                )}
            </div>

            <button className={style.deleteBtn} onClick={onDelete} title="Удалить из избранного">
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
        </div>
    );
};

export default DesktopFavoriteItem;
