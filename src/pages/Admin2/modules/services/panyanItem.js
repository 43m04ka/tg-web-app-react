const FLAG = /\p{Regional_Indicator}{2}|🌐/u;
const FLAGS = /\p{Regional_Indicator}|🌐/gu;

const plural = (count, forms) => {
    const tail = Math.abs(count) % 100;
    const last = tail % 10;
    if (tail > 10 && tail < 20) return forms[2];
    if (last > 1 && last < 5) return forms[1];
    if (last === 1) return forms[0];
    return forms[2];
};

const months = (count) => `${count} ${plural(count, ['месяц', 'месяца', 'месяцев'])}`;

const clean = (text) => String(text || '').replace(FLAGS, '').replace(/\s+/g, ' ').trim();

const flagOf = (text) => (String(text || '').match(FLAG) || [null])[0];

const SUBSCRIPTION_REGIONS = {'🇪🇺': 'Европа', '🇺🇸': 'США'};

const amountOf = (text) => {
    const value = String(text || '').replace(/(\d),(?=\d{3}\b)/g, '$1').trim();

    const dollars = value.match(/^\$\s?(\d+(?:\.\d+)?)/);
    if (dollars) return {denomination: `${dollars[1]} USD`, amount: Number(dollars[1])};

    const codeFirst = value.match(/^([A-Z]{3})\s+(\d+(?:\.\d+)?)/);
    if (codeFirst) return {denomination: `${codeFirst[2]} ${codeFirst[1]}`, amount: Number(codeFirst[2])};

    const gameTime = value.match(/^World of Warcraft.*?(\d+)\s*Days/i);
    if (gameTime) {
        const days = Number(gameTime[1]);
        return {denomination: `WoW: ${days} ${plural(days, ['день', 'дня', 'дней'])}`, amount: days};
    }

    const amountFirst = value.match(/^(\d+(?:\.\d+)?)\s+([A-Za-z]+)/);
    if (amountFirst) return {denomination: `${amountFirst[1]} ${amountFirst[2]}`, amount: Number(amountFirst[1])};

    return {denomination: value, amount: Number.MAX_SAFE_INTEGER};
};

const monthsOf = (text) => Number((String(text).match(/(\d+)\s*months?/i) || [])[1]) || 0;

export const parseSupplierItem = (item) => {
    const parts = String(item?.name || '').split('|').map((part) => part.trim()).filter(Boolean);
    const head = parts[0] || '';
    const regionPart = parts.length >= 3 ? parts[1] : head;
    const tail = parts.length >= 3 ? parts.slice(2).join(' ') : (parts[1] || head);

    if (/^XBOX - Коды подписок/i.test(item?.category || '')) {
        const flag = flagOf(head);
        const count = monthsOf(tail);

        if (/^Game Pass/i.test(head)) {
            return {
                kind: 'subscription',
                groupName: (tail.match(/Game Pass ([A-Za-z]+):/) || [])[1] || 'Game Pass',
                regionName: SUBSCRIPTION_REGIONS[flag] || clean(head),
                regionFlag: flag,
                denomination: months(count),
                amount: count,
            };
        }

        const [groupName, ...rest] = clean(head).split(' ');

        return {
            kind: 'subscription',
            groupName,
            regionName: rest.join(' ') || clean(head),
            regionFlag: flag,
            denomination: months(count),
            amount: count,
        };
    }

    if (/^Switch Online/i.test(head)) {
        const count = monthsOf(tail);

        return {
            kind: 'subscription',
            groupName: /family/i.test(tail) ? 'Switch Online Family' : 'Switch Online',
            regionName: clean(regionPart),
            regionFlag: flagOf(regionPart),
            denomination: months(count),
            amount: count,
        };
    }

    const flag = flagOf(regionPart);

    return {
        kind: 'gift_card',
        groupName: null,
        regionName: flag ? clean(regionPart) : 'Весь мир',
        regionFlag: flag || '🌐',
        ...amountOf(tail),
    };
};

export const REGION_FLAG_NAMES = {'Европа': 'Евросоюз', 'Весь мир': 'Глобальный'};
