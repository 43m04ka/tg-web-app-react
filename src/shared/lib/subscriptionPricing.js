export const isPsPlus = (product) => product?.type === 'SUBSCRIPTION'
    && /^(?:PlayStation|PS)\s*Plus\b/i.test(String(product.name || '').trim());

export const hasSubscriptionDiscount = (product) => {
    if (!isPsPlus(product)) return false;
    const price = Number(product.subscriptionDiscountPrice ?? product.price);
    const regular = Number(product.subscriptionRegularPrice ?? product.oldPrice);
    return Number.isFinite(price) && price > 0 && Number.isFinite(regular) && regular > price;
};

export const applySubscriptionPricing = (product, noActiveSubscription) => {
    if (!isPsPlus(product)) return product;
    const discounted = hasSubscriptionDiscount(product);
    const price = Number(product.subscriptionDiscountPrice ?? product.price);
    const regular = Number(product.subscriptionRegularPrice ?? product.oldPrice);

    return {
        ...product,
        noActiveSubscription,
        ...(discounted ? {
            subscriptionDiscountPrice: price,
            subscriptionRegularPrice: regular,
            price: noActiveSubscription ? price : regular,
            oldPrice: noActiveSubscription ? regular : null,
            similarCard: null
        } : {})
    };
};
