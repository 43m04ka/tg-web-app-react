import {psIcon, russian, xboxIcon} from "./productDesktopIcons";

const toDataUri = (svg) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

const singlePlayerIcon = toDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="7.5" r="3.25" fill="#FFFFFF"/>
        <path d="M6.5 18.5C6.5 15.7 8.96 13.5 12 13.5C15.04 13.5 17.5 15.7 17.5 18.5" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
    </svg>
`);

const multiPlayerIcon = toDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="8.5" r="2.75" fill="#FFFFFF"/>
        <circle cx="15.5" cy="7.5" r="2.5" fill="#FFFFFF" opacity="0.72"/>
        <path d="M4.5 18.5C4.5 15.7 6.96 13.5 10 13.5C13.04 13.5 15.5 15.7 15.5 18.5" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
        <path d="M13.5 18.5C13.5 16.38 15.17 14.75 17.5 14.75C19.54 14.75 21 16.1 21 18" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity="0.72"/>
    </svg>
`);

const englishFlagIcon = toDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="4" width="20" height="16" rx="3" fill="#1F4AA8"/>
        <path d="M2.9 4L10.7 10.1H13.3L21.1 4H22V5.25L15.95 10.1H22V13.9H15.95L22 18.75V20H21.1L13.3 13.9H10.7L2.9 20H2V18.75L8.05 13.9H2V10.1H8.05L2 5.25V4H2.9Z" fill="#FFFFFF"/>
        <path d="M2 11.2H10.2V4H13.8V11.2H22V12.8H13.8V20H10.2V12.8H2V11.2Z" fill="#FFFFFF"/>
        <path d="M2 11.55H10.9V4H13.1V11.55H22V12.45H13.1V20H10.9V12.45H2V11.55Z" fill="#D91F26"/>
        <path d="M2 4.6L8.85 10.1H7.55L2 5.7V4.6ZM22 4.6V5.7L16.45 10.1H15.15L22 4.6ZM2 19.4V18.3L7.55 13.9H8.85L2 19.4ZM22 19.4L15.15 13.9H16.45L22 18.3V19.4Z" fill="#D91F26"/>
        <rect x="2" y="4" width="20" height="16" rx="3" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
    </svg>
`);

export const getParameterValue = (parameter, productData) =>
    typeof parameter.key === 'function' ? parameter.key(productData) : productData[parameter.key];

export const getChoiceTitle = (value = '', parameter = '') => {
    if (value.includes('акк')) return 'Способ активации:';
    if (value.includes('месяц')) return 'Срок подписки:';
    if (parameter === 'name') return 'Вид подписки:';
    return 'Номинал пополнения:';
};

export const getInfoLabelArray = (productData) => {
    let year = null;
    const releaseDate = productData.releaseDate;

    if (releaseDate !== null) {
        const isSerialDate = (!Number.isNaN(Number(releaseDate)) && releaseDate.trim() !== '')
            || new Date(releaseDate).getFullYear() < 1980;

        if (isSerialDate) {
            const baseDate = new Date('1899-12-30T00:00:00.000Z');
            const parsedDate = new Date(new Date(releaseDate) * 86400000 + baseDate.getTime());
            if (parsedDate > new Date()) year = parsedDate.getFullYear();
        } else {
            year = new Date(releaseDate).getFullYear();
        }
    }

    return [year, productData.genre, productData.platform, productData.typeLabel].filter(Boolean);
};

export const getPriceData = (productData) => {
    const similar = productData.oldPrice === null && productData.similarCard;
    const source = similar ? productData.similarCard : productData;
    const oldPrice = source.oldPrice || null;
    const price = source.price || productData.price;
    const promoDate = source.endDatePromotion || null;
    let label = '';

    if (oldPrice) {
        label = `-${Math.ceil((1 - price / oldPrice) * 100)}%`;
    } else if (productData.releaseDate) {
        const isSerialDate = (!Number.isNaN(Number(productData.releaseDate)) && String(productData.releaseDate).trim())
            || new Date(productData.releaseDate).getFullYear() < 1980;
        if (isSerialDate) {
            const baseDate = new Date('1899-12-30T00:00:00.000Z');
            const parsedDate = new Date(new Date(productData.releaseDate) * 86400000 + baseDate.getTime());
            if (parsedDate > new Date()) label = parsedDate.toLocaleDateString('ru-RU');
        }
    }

    return {
        price,
        oldPrice,
        label,
        logoUrl: productData.logoUrl,
        imageUrl: productData.backgroundUrl || productData.image,
        promoDate: promoDate
            ? `до ${!Number.isNaN(Number(promoDate)) && String(promoDate).trim() ? new Date(Number(promoDate)).toLocaleDateString('ru-RU') : promoDate}`
            : '',
        isPreOrder: Boolean(label) && !label.includes('-'),
    };
};

export const shouldRenderLogo = (productData) =>
    Boolean(productData.logoUrl) && productData.backgroundUrl !== productData.logoUrl;

export const getSalePromotion = (productData) => {
    const value = productData.additionalParameter;
    if (!value) return null;
    if (value.includes('Save') && value.includes('ps-plus')) return {route: '/choice-catalog/ps_psplus', label: 'Дополнительная скидка с PS Plus'};
    if (value.includes('Extra')) return {route: '/choice-catalog/ps_psplus', label: 'Бесплатно с PS Plus Extra'};
    if (value.includes('Deluxe')) return {route: '/choice-catalog/ps_psplus', label: 'Бесплатно с PS Plus Deluxe'};
    if (value.includes('Included')) return {route: '/choice-catalog/ps_eaplay', label: 'Бесплатно с EA Play'};
    return null;
};

export const getBubbleItems = (productData) => {
    let bubbles = [];

    if (productData.platform) {
        bubbles = bubbles.concat(productData.platform.split(',').map((item) => ({
            label: item,
            icon: item.includes('PS') ? psIcon : xboxIcon,
            invert: true,
        })));
    }

    if (productData.numberPlayers) {
        bubbles.push({
            label: `${productData.numberPlayers}${productData.numberPlayers.includes('-') ? ' игрока' : ' игрок'}`,
            icon: productData.numberPlayers.includes('-') ? multiPlayerIcon : singlePlayerIcon,
            invert: false,
        });
    }

    if (productData.language) {
        if (productData.voice && (productData.language === 'На русском языке' || (productData.language.includes('Русский') && productData.voice.includes('Русский')))) {
            bubbles.push({label: 'Русский текст и озвучка', icon: russian, invert: false});
        } else if (productData.language === 'Русские субтитры (текст)' || productData.language.includes('Русский')) {
            bubbles.push({label: 'Русский текст', icon: russian, invert: false});
        } else {
            bubbles.push({label: 'На английском', icon: englishFlagIcon, invert: false});
        }
    }

    return bubbles;
};

export const getShareText = (productData, parameters, isTg = true) => {
    let text = `${productData.name} - ${(productData.similarCard?.price || productData.price).toLocaleString('ru-RU')} ₽\n`;
    const priceSource = productData.oldPrice === null && productData.similarCard ? productData.similarCard : productData;

    if (priceSource.oldPrice !== null && typeof priceSource.oldPrice !== 'undefined') {
        const percent = `-${Math.ceil((1 - priceSource.price / priceSource.oldPrice) * 100)}%`;
        if (priceSource.endDatePromotion) {
            const dateLabel = !Number.isNaN(Number(priceSource.endDatePromotion)) && String(priceSource.endDatePromotion).trim()
                ? new Date(Number(priceSource.endDatePromotion)).toLocaleDateString('ru-RU')
                : priceSource.endDatePromotion;
            text += `*cкидка ${percent} действует до ${dateLabel}\n\n`;
        }
    }

    parameters.forEach((parameter) => {
        const value = getParameterValue(parameter, productData);
        if (value !== null && value !== '' && value !== 'null') text += `${parameter.label}: ${value}\n`;
    });

    const productUrl = isTg
        ? `https://t.me/gwstore_bot/app?startapp=${productData.id}`
        : `${window.location.origin}?startapp=${productData.id}`;
    return `${text}\nКупить можно в приложении Геймворд - ${productUrl}`;
};
