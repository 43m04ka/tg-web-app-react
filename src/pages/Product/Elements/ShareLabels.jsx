import React, {useState} from 'react';
import style from "../Product.module.scss";
import {useTelegram} from "../../../hooks/useTelegram";
import {useServerUser} from "../../../hooks/useServerUser";

const EMPTY_STRING_VALUES = new Set(['null', 'none', 'undefined', 'n/a', 'na', '-']);

const isMeaningfulValue = (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'number') return Number.isFinite(value);
    if (typeof value === 'boolean') return true;

    const trimmed = String(value).trim();
    if (!trimmed) return false;

    return !EMPTY_STRING_VALUES.has(trimmed.toLowerCase());
};

const formatPromotionDate = (dateValue) => {
    if (!isMeaningfulValue(dateValue)) return null;

    const raw = String(dateValue).trim();
    const timestamp = Number(raw);

    if (!Number.isNaN(timestamp) && raw !== '') {
        const date = new Date(timestamp);
        if (!Number.isNaN(date.getTime())) {
            return date.toLocaleDateString('ru-RU');
        }
    }

    return raw;
};

const getDiscountPercent = (price, oldPrice) => {
    const current = Number(price);
    const previous = Number(oldPrice);

    if (!Number.isFinite(current) || !Number.isFinite(previous) || previous <= current) {
        return null;
    }

    return `-${Math.ceil((1 - current / previous) * 100)}%`;
};

const ShareLabels = ({productData, parameters}) => {

    const { tg, user, isTg, safeAreaInset, contentSafeAreaInset } = useTelegram()
    const {prepareShareMessage} = useServerUser()
    const [copied, setCopied] = useState(false);

    const price = Number(productData.price);
    const formattedPrice = Number.isFinite(price) ? price.toLocaleString('ru-RU') : String(productData.price ?? '').trim();

    let textMessage = `${productData.name} — ${formattedPrice} ₽\n`;

    const percent = getDiscountPercent(productData.price, productData.oldPrice);
    const promotionDate = formatPromotionDate(productData.endDatePromotion);

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
