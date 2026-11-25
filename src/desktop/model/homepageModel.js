import {isSubscription} from '../../pages/Main/catalogSections';
import {isPurchasable, promotionEnd} from '../../pages/Product/productView';
import {heroItem, mergeOffers} from './storefrontModel';

const GTA_VI = /\b(?:gta|grand\s+theft\s+auto)\s*(?:vi|6)\b/i;
const PS_PLUS = /(?:playstation|ps)\s*plus|psplus/i;
const GAME_PASS = /game\s*pass|gamepass|\bgpu\b/i;
const isVisible = (product) => product && !product.isHidden && isPurchasable(product);
const isGame = (product) => isVisible(product) && !isSubscription(product)
    && (!product.type || /^(GAME|FULL_GAME)$/i.test(product.type))
    && !/gift\s*card|подарочн|пополнен|баланс|валюта|shark\s*card/i.test(product.name || '');

export const mixPopular = (offers) => {
    const groups = ['ps', 'ps_india', 'xbox'].map((type) =>
        (offers || []).filter((offer) => offer.origins[0]?.type === type));
    const others = (offers || []).filter((offer) => !['ps', 'ps_india', 'xbox'].includes(offer.origins[0]?.type));
    const result = [];
    for (let index = 0; index < Math.max(0, ...groups.map((group) => group.length)); index += 1) {
        groups.forEach((group) => { if (group[index]) result.push(group[index]); });
    }
    return [...result, ...others];
};

export const buildHomePopular = ({shelves, popularProducts, products, originOf, botType, pageIds}) => {
    const shelfProducts = (shelves || []).filter((shelf) => /популяр|popular/i.test(shelf.title))
        .flatMap((shelf) => shelf.offers.flatMap((offer) => offer.origins.length
            ? offer.origins.map((origin) => origin.product || offer.product) : [offer.product]));
    const configured = (popularProducts || []).filter((item) => !item.platform || item.platform === botType)
        .map((item) => item.product || item);
    const unique = new Map();
    const preferred = [...shelfProducts, ...configured].filter(isGame);
    [...preferred, ...(products || []).filter(isGame)].forEach((product) => {
        const origin = originOf(product);
        if (origin && (!pageIds || pageIds.includes(origin.pageId)) && !unique.has(product.id)) unique.set(product.id, product);
    });
    return {key: 'home:popular', title: 'Популярное', pages: [],
        offers: mixPopular(mergeOffers([...unique.values()], originOf))};
};

export const buildHomeSubscriptions = ({products, catalogs, originOf}) => {
    const selected = (products || []).filter((product) => isVisible(product) && isSubscription(product)
        && (PS_PLUS.test(product.name) || GAME_PASS.test(product.name)));
    const groups = new Map();
    selected.forEach((product) => {
        const origin = originOf(product);
        const catalog = (catalogs || []).find((item) => item.id === product.catalogId);
        if (!origin || !catalog) return;
        const isPs = PS_PLUS.test(product.name);
        const key = isPs ? 'psplus' : 'gamepass';
        if (!groups.has(key)) groups.set(key, {key, title: isPs ? 'PlayStation Plus' : 'Xbox Game Pass',
            order: isPs ? 0 : 1, pages: [], products: []});
        if (!groups.get(key).pages.some((entry) => entry.path === catalog.path)) {
            groups.get(key).pages.push({pageId: origin.pageId, path: catalog.path});
        }
        groups.get(key).products.push(product);
    });
    return [...groups.values()].sort((a, b) => a.order - b.order)
        .map(({products: items, ...shelf}) => ({...shelf, offers: mergeOffers(items, originOf)}));
};

export const homePreorder = ({banners, products, originOf, originByPage}) => {
    const productById = new Map((products || []).map((product) => [String(product.id), product]));
    const banner = (banners || []).find((item) => !item.isHidden
        && GTA_VI.test([item.data?.title, item.data?.override?.title, productById.get(String(item.data?.productId))?.name].join(' '))
        && (item.data?.productId ? !productById.has(String(item.data.productId)) || isVisible(productById.get(String(item.data.productId))) : item.data?.url));
    if (banner) return heroItem(banner, {originOf, productById, originByPage});
    const product = (products || []).find((item) => isGame(item) && GTA_VI.test(item.name));
    if (!product || !originOf(product)) return null;
    return {id: `gta:${product.id}`, title: product.name, subtitle: 'GTA VI', note: '',
        image: product.image, cover: product.image, productId: product.id, product,
        origin: originOf(product), price: product.price, oldPrice: product.oldPrice,
        buttons: [], slot: 'main', shade: true};
};

export const currentHomeHero = (hero, now = Date.now()) => (hero || []).filter((item) => {
    if (GTA_VI.test(item.title)) return false;
    if (item.product && !isVisible(item.product)) return false;
    const end = promotionEnd({endDatePromotion: item.promoEndDate});
    return !end || end > now;
});
