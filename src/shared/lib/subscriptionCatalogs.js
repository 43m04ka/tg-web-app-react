const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const tiersOf = (offers) => {
    const byKey = new Map();

    offers.forEach((offer) => {
        const key = offer.groupName || '';
        const tier = byKey.get(key);

        if (tier) tier.offers.push(offer);
        else byKey.set(key, {key, name: offer.groupName || 'Подписка', offers: [offer]});
    });

    return [...byKey.values()].map((tier) => {
        const cheapest = tier.offers.reduce(
            (low, offer) => (!low || offer.price < low.price ? offer : low),
            null
        );

        return {
            ...tier,
            image: cheapest?.image || tier.offers.find((offer) => offer.image)?.image || null,
            price: cheapest?.price ?? null
        };
    });
};

const subscriptionGroups = (brands) => {
    const groups = new Map();

    (brands || []).forEach((brand) => {
        (brand.offers || []).forEach((offer) => {
            if (offer.kind !== 'subscription' || offer.productId === null || offer.productId === undefined) return;

            const catalogId = toNumber(offer.catalogId);
            const key = catalogId === null ? `${brand.id}:${offer.regionName || ''}` : `catalog:${catalogId}`;
            const group = groups.get(key);

            if (group) group.offers.push(offer);
            else groups.set(key, {catalogId, brand, regionName: offer.regionName || null, offers: [offer]});
        });
    });

    return groups;
};

const withTiers = (group) => (group ? {...group, tiers: tiersOf(group.offers)} : null);

export const catalogEntry = (brands, catalogId) => {
    const id = toNumber(catalogId);
    if (id === null) return null;

    for (const group of subscriptionGroups(brands).values()) {
        if (group.catalogId === id) return withTiers(group);
    }

    return null;
};

export const productEntry = (brands, productId) => {
    const id = toNumber(productId);
    if (id === null) return null;

    for (const group of subscriptionGroups(brands).values()) {
        const offer = group.offers.find((item) => toNumber(item.productId) === id);
        if (offer) return {...withTiers(group), offer};
    }

    return null;
};

export const subscriptionTarget = (entry, tierKey) => ({
    brandId: entry.brand.id,
    kind: 'subscription',
    regionName: entry.regionName,
    groupName: tierKey ?? entry.offer?.groupName ?? null,
    offerId: entry.offer?.id ?? null,
    single: true
});
