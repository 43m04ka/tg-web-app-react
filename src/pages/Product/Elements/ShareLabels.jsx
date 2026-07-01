import React, {useState} from 'react';
import style from "../Product.module.scss";
import {useTelegram} from "../../../hooks/useTelegram";
import {useServerUser} from "../../../hooks/useServerUser";

const EMPTY_STRING_VALUES = new Set([
    'null', 'none', 'undefined', 'n/a', 'na', '-', 'nan', 'infinity', '-infinity',
]);

const isMeaningfulValue = (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'number') return Number.isFinite(value);
    if (typeof value === 'boolean') return true;

    const trimmed = String(value).trim();
    if (!trimmed) return false;

    return !EMPTY_STRING_VALUES.has(trimmed.toLowerCase());
};

const formatPrice = (value) => {
    if (!isMeaningfulValue(value)) return '';

    const price = Number(value);
    return Number.isFinite(price) ? price.toLocaleString('ru-RU') : '';
};

const formatPromotionDate = (dateValue) => {
    if (!isMeaningfulValue(dateValue)) return null;

    const raw = String(dateValue).trim();
    const timestamp = Number(raw);

    if (Number.isFinite(timestamp)) {
        const date = new Date(timestamp);
        if (!Number.isNaN(date.getTime())) {
            return date.toLocaleDateString('ru-RU');
        }
    }

    return raw;
};

const getDiscountPercent = (price, oldPrice) => {
    if (!isMeaningfulValue(price) || !isMeaningfulValue(oldPrice)) {
        return null;
    }

    const current = Number(price);
    const previous = Number(oldPrice);

    if (!Number.isFinite(current) || !Number.isFinite(previous) || previous <= current) {
        return null;
    }

    return `-${Math.ceil((1 - current / previous) * 100)}%`;
};

const getPromotionSource = (productData) => {
    if (isMeaningfulValue(productData.oldPrice)) {
        return productData;
    }

    if (productData.similarCard && isMeaningfulValue(productData.similarCard.oldPrice)) {
        return productData.similarCard;
    }

    return null;
};

const ShareLabels = ({productData, parameters}) => {

    const { tg, user, isTg, safeAreaInset, contentSafeAreaInset } = useTelegram()
    const {prepareShareMessage} = useServerUser()
    const [copied, setCopied] = useState(false);

    const displayPrice = isMeaningfulValue(productData.similarCard?.price)
        ? productData.similarCard.price
        : productData.price;
    const formattedPrice = formatPrice(displayPrice);

    let textMessage = `${productData.name} — ${formattedPrice} ₽\n`;

    const promotionSource = getPromotionSource(productData);
    const percent = promotionSource
        ? getDiscountPercent(promotionSource.price, promotionSource.oldPrice)
        : null;
    const promotionDate = promotionSource
        ? formatPromotionDate(promotionSource.endDatePromotion)
        : null;

    if (percent && promotionDate) {
        textMessage += `*cкидка ${percent} действует до ${promotionDate} \n\n`;
    }

    parameters.forEach((parameter) => {
        const parameterValue = typeof parameter.key === 'function' ? parameter.key(productData) : productData[parameter.key];

        if (isMeaningfulValue(parameterValue)) {
            textMessage += `${parameter.label}: ${parameterValue}\n`;
        }
    });

    const productUrl = isTg
        ? `https://t.me/gwstore_bot/app?startapp=${productData.id}`
        : `${window.location.origin}?startapp=${productData.id}`;
    textMessage += `\nКупить можно в приложении Геймворд — ${productUrl}`

    return (<div>
        <div className={style['shareLabel']}
             onClick={async () => {
                 await prepareShareMessage((messageId) => {
                     tg.shareMessage(messageId)
                     window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('soft');
                 }, productData.id, user.id)
             }}>
            <div className={style['shareLabelShare']}/>
            <p>Поделиться карточкой</p>
        </div>
        <div className={style['shareLabel']}
             onClick={async () => {
                 try {
                     await navigator.clipboard.writeText(textMessage);
                     setCopied(true);
                     window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('soft');
                     setTimeout(() => setCopied(false), 2000);
                 } catch (err) {
                     console.error("Ошибка при копировании", err);
                 }
             }}>
            <div className={style['shareLabelCopy']}/>
            <p>Скопировать прямую ссылку</p>
        </div>
        {copied ? (<div style={{
            top: String(contentSafeAreaInset.top + safeAreaInset.top + 20) + 'px',
        }} className={style['copyNotify']}>
            <div className={style['shareLabelCopy']}/>
            <p>
                Ссылка скопирована в буфер обмена
            </p>
        </div>) : ''}
    </div>);
};

export default ShareLabels;
