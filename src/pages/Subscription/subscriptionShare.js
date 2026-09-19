import {productLink, shareText} from '../Product/productView';

export const subscriptionShare = ({tier, period, region, isTg}) => {
    const product = period?.product || null;
    if (!product) return null;

    const productId = product.id ?? period?.id ?? null;
    if (productId === null) return null;

    const specs = [
        {label: 'Тариф', value: tier?.name},
        {label: 'Срок', value: period?.label},
        {label: 'Регион', value: region?.title}
    ].filter((row) => Boolean(row.value));

    const link = productLink(product, isTg);

    return {productId, link, text: shareText(product, specs, link)};
};
