const cache = new Map();

const byPrice = (a, b) => Number(a.price) - Number(b.price);

export const recallProduct = (productId) => cache.get(productId) || null;

export const rememberProduct = (product) => {
    if (!product?.id) return;

    const family = [product, ...(product.conceptProducts || [])]
        .filter((item) => item && item.id)
        .filter((item, index, all) => all.findIndex((other) => other.id === item.id) === index)
        .sort(byPrice);

    cache.set(product.id, product);

    if (family.length < 2) return;

    family.forEach((member) => {
        if (member.id === product.id) return;

        cache.set(member.id, {
            ...member,
            ...(cache.get(member.id) || {}),
            conceptProducts: family.filter((other) => other.id !== member.id)
        });
    });

    (product.conceptAddOns || []).forEach((addon) => {
        if (addon?.id && !cache.has(addon.id)) cache.set(addon.id, addon);
    });
};
