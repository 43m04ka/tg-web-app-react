import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Badge, Button, ButtonRow, EmptyState, ErrorState, IconButton, Input, Note, SearchInput, Select, SkeletonRows} from '../../ui';
import {useResource} from '../../platform/useResource';
import {useMutation} from '../../platform/useMutation';
import {keys} from '../../platform/resources';
import {askConfirm} from '../../platform/notify';
import {REGION_FLAGS} from '../../../AdminPanel/Elements/FlagPicker/flags';
import {createOffer, fetchSupplierBalance, fetchSupplierCatalog, saveMarkups, saveOffers} from './api';
import {parseSupplierItem, REGION_FLAG_NAMES} from './panyanItem';
import style from './ServicesScreen.module.scss';

const MARKUP_OPTIONS = [
    {value: '', title: 'нет'},
    {value: 'percent', title: '%'},
    {value: 'fixed', title: '₽'},
];

const ICONS = new Map(REGION_FLAGS.map((flag) => [flag.name, flag.icon]));

const rub = (value) => `${Math.round(Number(value) || 0).toLocaleString('ru-RU')} ₽`;

const toNumber = (value) => Number(String(value ?? '').replace(',', '.'));

export const salePrice = (base, markupType, markupValue) => {
    const price = Number(base);
    if (!Number.isFinite(price) || price <= 0) return null;

    const value = toNumber(markupValue) || 0;
    let result = price;

    if (markupType === 'percent') result = price * (1 + value / 100);
    else if (markupType === 'fixed') result = price + value;

    return Math.ceil(Number(result.toFixed(6)));
};

const markupProblem = ({markupType, markupValue}) => {
    if (!markupType) return '';
    const value = toNumber(markupValue);
    if (String(markupValue).trim() === '' || !Number.isFinite(value) || value < 0) return 'комиссия — число не меньше нуля';
    if (markupType === 'fixed' && !Number.isInteger(value)) return 'комиссия в рублях — целое число';
    if (markupType === 'percent' && value > 500) return 'комиссия не больше 500%';
    return '';
};

const storedMarkup = (offer) => ({
    markupType: offer.markupType || '',
    markupValue: offer.markupType && offer.markupValue !== null && offer.markupValue !== undefined
        ? String(offer.markupValue)
        : '',
});

const sameMarkup = (left, right) => left.markupType === right.markupType
    && (!left.markupType || toNumber(left.markupValue) === toNumber(right.markupValue));

const groupByRegion = (offers) => {
    const groups = new Map();
    offers.forEach((offer) => {
        const key = offer.regionName || '—';
        if (!groups.has(key)) groups.set(key, {name: key, flag: offer.regionFlag, items: []});
        groups.get(key).items.push(offer);
    });
    return [...groups.values()];
};

const balanceText = (balance) => {
    if (!balance) return '';
    const credit = Number(balance.credit_limit) || 0;
    return `Баланс PanYanStore ${rub(balance.balance)}${credit > 0 ? ` · кредит ${rub(credit)}` : ''}`;
};

export const offerFromItem = (item, brand, serialNumber) => {
    const parsed = parseSupplierItem(item);

    return {
        brandId: brand.id,
        kind: parsed.kind,
        groupName: parsed.groupName,
        regionName: parsed.regionName,
        regionFlag: parsed.regionFlag,
        regionIcon: ICONS.get(REGION_FLAG_NAMES[parsed.regionName] || parsed.regionName) || null,
        denomination: parsed.denomination,
        fulfillment: 'supplier',
        supplierItemId: item.itemId,
        price: Math.ceil(item.price),
        serialNumber,
        isHidden: false,
    };
};

function RegionFill({onApply}) {
    const [markup, setMarkup] = useState({markupType: 'percent', markupValue: ''});
    const problem = markupProblem(markup);

    return (
        <span className={style.supplierFill}>
            <Select
                options={MARKUP_OPTIONS}
                value={markup.markupType}
                onChange={(event) => setMarkup((current) => ({...current, markupType: event.target.value}))}
            />
            <Input
                value={markup.markupValue}
                inputMode="decimal"
                placeholder="0"
                disabled={!markup.markupType}
                onChange={(event) => setMarkup((current) => ({...current, markupValue: event.target.value}))}
            />
            <Button size="s" variant="ghost" disabled={Boolean(problem)} onClick={() => onApply(markup)}>
                Всем в регионе
            </Button>
        </span>
    );
}

export default function SupplierPanel({brand}) {
    const offers = useMemo(
        () => (brand.offers || []).filter((offer) => offer.fulfillment === 'supplier'),
        [brand.offers],
    );

    const catalog = useResource(keys.serviceSupplierCatalog, fetchSupplierCatalog);
    const balance = useResource(keys.serviceSupplierBalance, fetchSupplierBalance);

    const items = useMemo(() => catalog.data?.result?.items || [], [catalog.data]);
    const itemById = useMemo(() => new Map(items.map((item) => [Number(item.itemId), item])), [items]);

    const [drafts, setDrafts] = useState({});
    const [query, setQuery] = useState('');

    useEffect(() => {
        setDrafts({});
    }, [offers]);

    const markupOf = useCallback((offer) => drafts[offer.id] || storedMarkup(offer), [drafts]);

    const setMarkup = useCallback((offer, patch) => {
        setDrafts((current) => ({...current, [offer.id]: {...(current[offer.id] || storedMarkup(offer)), ...patch}}));
    }, []);

    const fillRegion = useCallback((region, markup) => {
        setDrafts((current) => {
            const next = {...current};
            region.items.forEach((offer) => { next[offer.id] = {...markup}; });
            return next;
        });
    }, []);

    const changed = useMemo(
        () => offers.filter((offer) => drafts[offer.id] && !sameMarkup(drafts[offer.id], storedMarkup(offer))),
        [offers, drafts],
    );

    const problems = useMemo(
        () => changed
            .map((offer) => ({offer, text: markupProblem(drafts[offer.id])}))
            .filter((entry) => entry.text),
        [changed, drafts],
    );

    const withoutMarkup = offers.filter((offer) => !markupOf(offer).markupType || !toNumber(markupOf(offer).markupValue)).length;

    const save = useMutation(saveMarkups, {invalidates: [keys.services], done: 'Комиссии сохранены'});
    const add = useMutation(createOffer, {invalidates: [keys.services], done: 'Позиция добавлена'});
    const remove = useMutation(saveOffers, {invalidates: [keys.services], done: 'Позиция удалена'});

    const onSave = useCallback(() => {
        if (!changed.length || problems.length) return;

        save.run(changed.map((offer) => ({
            offerId: offer.id,
            markupType: drafts[offer.id].markupType || null,
            markupValue: drafts[offer.id].markupType ? toNumber(drafts[offer.id].markupValue) : null,
        })));
    }, [save, changed, problems, drafts]);

    const linked = useMemo(() => new Set(offers.map((offer) => Number(offer.supplierItemId))), [offers]);

    const matches = useMemo(() => {
        const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
        if (!words.length) return [];

        return items
            .filter((item) => !linked.has(Number(item.itemId)))
            .filter((item) => {
                const text = `${item.itemId} ${item.category} ${item.name}`.toLowerCase();
                return words.every((word) => text.includes(word));
            })
            .slice(0, 8);
    }, [items, linked, query]);

    const onAdd = useCallback((item) => {
        const serial = (brand.offers || []).reduce((max, offer) => Math.max(max, Number(offer.serialNumber) || 0), 0) + 1;
        add.run(offerFromItem(item, brand, serial));
    }, [add, brand]);

    const onRemove = useCallback(async (offer) => {
        const answer = await askConfirm({
            title: 'Убрать позицию с витрины?',
            text: `${offer.groupName ? `${offer.groupName} · ` : ''}${offer.denomination} · ${offer.regionName}`,
            consequence: 'Номинал удалится. Товар у PanYanStore останется, его можно добавить снова.',
            confirmText: 'Удалить',
            tone: 'danger',
        });

        if (answer) remove.run({brandId: brand.id, offers: [], deleteIds: [offer.id]});
    }, [remove, brand.id]);

    const regions = useMemo(() => groupByRegion(offers), [offers]);

    return (
        <div className={style.matrix}>
            <div className={style.supplierTop}>
                {balance.data?.result ? <Badge tone="info">{balanceText(balance.data.result)}</Badge> : null}
                {balance.error ? <Badge tone="danger">{balance.error.message || 'Баланс недоступен'}</Badge> : null}
                {withoutMarkup ? <Badge tone="warning">{`без комиссии: ${withoutMarkup}`}</Badge> : null}
            </div>

            <Note>
                Код покупается у PanYanStore сразу после оплаты. Цена покупателю — цена поставщика плюс комиссия,
                округляется вверх до рубля и пересчитывается сама, когда поставщик меняет цену.
            </Note>

            <SearchInput value={query} onChange={setQuery} placeholder="Добавить из каталога PanYanStore: «Польша 50»"/>

            {catalog.error ? <ErrorState error={catalog.error} onRetry={catalog.refresh}/> : null}

            {matches.length ? (
                <ul className={style.readonlyList}>
                    {matches.map((item) => (
                        <li key={item.itemId}>
                            <span>{item.name}</span>
                            <span className={style.supplierPickRight}>
                                <span className={style.muted}>{rub(item.price)} · {item.inStock} шт.</span>
                                <Button size="s" variant="secondary" loading={add.loading} onClick={() => onAdd(item)}>
                                    Добавить
                                </Button>
                            </span>
                        </li>
                    ))}
                </ul>
            ) : null}

            {catalog.isLoading && !offers.length ? <SkeletonRows count={4}/> : null}

            {!offers.length ? (
                <EmptyState
                    title="Позиций PanYanStore нет"
                    text="Найдите товар в каталоге поставщика строкой поиска выше и добавьте его."
                />
            ) : (
                <>
                    <div className={`${style.supplierRow} ${style.matrixHead}`}>
                        <span>Позиция</span>
                        <span>Поставщик</span>
                        <span>Остаток</span>
                        <span>Комиссия</span>
                        <span/>
                        <span>Цена</span>
                        <span/>
                    </div>

                    {regions.map((region) => (
                        <div key={region.name} className={style.supplierRegion}>
                            <div className={style.supplierRegionHead}>
                                <span>{region.flag || ''} {region.name}</span>
                                <span className={style.muted}>{region.items.length}</span>
                                <RegionFill onApply={(markup) => fillRegion(region, markup)}/>
                            </div>

                            {region.items.map((offer) => {
                                const item = itemById.get(Number(offer.supplierItemId)) || offer.supplier || null;
                                const markup = markupOf(offer);
                                const price = item ? salePrice(item.price, markup.markupType, markup.markupValue) : null;
                                const invalid = Boolean(markupProblem(markup));

                                return (
                                    <div key={offer.id} className={style.supplierRow}>
                                        <span className={style.supplierName}>
                                            {offer.groupName ? `${offer.groupName} · ` : ''}{offer.denomination}
                                            <span className={style.muted}> №{offer.supplierItemId}</span>
                                            {offer.isHidden ? <Badge tone="neutral">скрыт</Badge> : null}
                                        </span>
                                        <span>{item ? rub(item.price) : <Badge tone="danger">нет в каталоге</Badge>}</span>
                                        <span>
                                            {item ? (
                                                <Badge tone={item.inStock > 0 ? 'positive' : 'danger'}>{item.inStock}</Badge>
                                            ) : <span className={style.muted}>—</span>}
                                        </span>
                                        <Select
                                            options={MARKUP_OPTIONS}
                                            value={markup.markupType}
                                            onChange={(event) => setMarkup(offer, {markupType: event.target.value})}
                                        />
                                        <Input
                                            value={markup.markupValue}
                                            inputMode="decimal"
                                            placeholder="0"
                                            invalid={invalid}
                                            disabled={!markup.markupType}
                                            onChange={(event) => setMarkup(offer, {markupValue: event.target.value})}
                                        />
                                        <strong>{price ? rub(price) : '—'}</strong>
                                        <IconButton label="Удалить позицию" onClick={() => onRemove(offer)}>×</IconButton>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </>
            )}

            {problems.length ? (
                <Note tone="danger">
                    {problems.slice(0, 3).map(({offer, text}) => `${offer.denomination} (${offer.regionName}): ${text}`).join('. ')}
                </Note>
            ) : null}

            <ButtonRow>
                <Button
                    variant="primary"
                    disabled={!changed.length || Boolean(problems.length)}
                    loading={save.loading}
                    onClick={onSave}
                >
                    {changed.length ? `Сохранить комиссии (${changed.length})` : 'Сохранить комиссии'}
                </Button>
                <Button variant="ghost" disabled={!changed.length} onClick={() => setDrafts({})}>
                    Отменить правки
                </Button>
            </ButtonRow>
        </div>
    );
}
