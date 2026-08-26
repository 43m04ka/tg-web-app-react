const RS_STEP = 1000;

export const unitPrice = (item) => Math.round(Number(item?.similarCard?.price || item?.price || 0));

export const unitOldPrice = (item) => Math.round(Number(item?.similarCard?.oldPrice || item?.oldPrice || 0));

const isIndiaItem = (item) =>
    item.priceInOtherCurrency !== null
    && item.priceInOtherCurrency !== undefined
    && item.priceInOtherCurrency !== 0;

const buildPosition = (item) => {
    const price = unitPrice(item);

    return {
        productId: item.id,
        name: item.name,
        price,
        quantity: item.count,
        sum: price * item.count
    };
};

const sumOf = (positions) => positions.reduce((sum, position) => sum + position.sum, 0);

const catalogTotals = (items) => {
    const positions = items.map(buildPosition);

    return {itemsTotal: sumOf(positions), positions, calc: null};
};

const findRule = (rules, value) => rules.find((rule) => value > rule.min && value <= rule.max) || null;

const applyRule = (rule, rs) => (rule.type === 'FIXED' ? rule.value + rule.commission : rs * rule.value + rule.commission);

const indiaTotals = (items, rules) => {
    const indiaItems = items.filter(isIndiaItem);
    const rubPositions = items.filter((item) => !isIndiaItem(item)).map(buildPosition);
    const rubTotal = sumOf(rubPositions);

    if (indiaItems.length === 0) return {itemsTotal: rubTotal, positions: rubPositions, calc: null};
    if (!rules) return null;

    const rsTotal = indiaItems.reduce((sum, item) => sum + (item.priceInOtherCurrency * item.count || 0), 0);
    const rsRounded = Math.ceil(rsTotal / RS_STEP) * RS_STEP;
    const rule = findRule(rules, rsRounded);

    if (!rule) return null;

    const topupRub = Math.round(applyRule(rule, rsRounded));
    const leftoverRs = rsRounded - rsTotal;

    const topup = {
        productId: null,
        name: `Пополнение на ${rsRounded} RS`,
        price: topupRub,
        quantity: 1,
        sum: topupRub,
        priceRs: rsRounded
    };

    return {
        itemsTotal: topupRub + rubTotal,
        positions: [topup, ...rubPositions],
        calc: {
            mode: 'ps_india',
            rsTotal,
            rsRounded,
            rate: rule.value,
            commission: rule.commission,
            leftoverRs,
            topupRub
        }
    };
};

const applyDiscountToPositions = (positions, discount) => {
    if (!discount || discount <= 0) return positions;

    const total = sumOf(positions);
    if (total <= 0) return positions;

    let distributed = 0;

    return positions.map((position, index) => {
        const isLast = index === positions.length - 1;
        const positionDiscount = isLast
            ? discount - distributed
            : Math.round((position.sum / total) * discount);

        if (!isLast) distributed += positionDiscount;

        const quantity = position.quantity > 0 ? position.quantity : 1;
        const price = Math.max(0, Math.round((position.sum - positionDiscount) / quantity));

        return {...position, price, sum: price * quantity};
    });
};

export const buildQuote = ({items, pageType, promo, indiaRules}) => {
    if (!Array.isArray(items)) return null;

    const base = pageType === 'ps_india' ? indiaTotals(items, indiaRules) : catalogTotals(items);
    if (!base) return null;

    const percent = Number(promo?.percent) > 0 ? Number(promo.percent) : 0;

    const positions = percent
        ? applyDiscountToPositions(base.positions, Math.round(base.itemsTotal * (percent / 100)))
        : base.positions;

    const total = sumOf(positions);

    return {
        itemsTotal: base.itemsTotal,
        discount: base.itemsTotal - total,
        total,
        promo: percent ? {name: promo.name, percent} : null,
        positions,
        calc: base.calc
    };
};
