import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Badge, Button, ButtonRow, IconButton, Input, Note, Select} from '../../ui';
import {useMutation} from '../../platform/useMutation';
import {keys} from '../../platform/resources';
import {saveOffers} from './api';
import style from './ServicesScreen.module.scss';

const KIND_OPTIONS = [
    {value: 'gift_card', title: 'Гифт-карта'},
    {value: 'subscription', title: 'Подписка'},
];

const FULFILLMENT_OPTIONS = [
    {value: 'code', title: 'Код со склада'},
    {value: 'manual', title: 'Менеджер'},
];

let draftSeq = 0;

const toRow = (offer) => ({
    localId: `saved-${offer.id}`,
    id: offer.id,
    groupName: offer.groupName || '',
    denomination: offer.denomination || '',
    regionName: offer.regionName || 'Россия',
    kind: offer.kind || 'gift_card',
    fulfillment: offer.fulfillment || 'code',
    price: String(offer.price ?? ''),
    oldPrice: offer.oldPrice === null || offer.oldPrice === undefined ? '' : String(offer.oldPrice),
    isHidden: Boolean(offer.isHidden),
    stock: offer.stock || null,
});

const emptyRow = () => {
    draftSeq += 1;

    return {
        localId: `draft-${draftSeq}`,
        id: null,
        groupName: '',
        denomination: '',
        regionName: 'Россия',
        kind: 'subscription',
        fulfillment: 'code',
        price: '',
        oldPrice: '',
        isHidden: false,
        stock: null,
    };
};

const serialize = (rows) => rows.map((row, index) => ({
    id: row.id || undefined,
    groupName: row.groupName.trim() || null,
    denomination: row.denomination.trim(),
    regionName: row.regionName.trim() || 'Россия',
    kind: row.kind,
    fulfillment: row.fulfillment,
    price: Number(String(row.price).replace(',', '.')),
    oldPrice: row.oldPrice === '' ? null : Number(String(row.oldPrice).replace(',', '.')),
    isHidden: row.isHidden,
    serialNumber: index,
}));

export default function OffersMatrix({brand}) {
    const own = useMemo(
        () => (brand.offers || []).filter((offer) => !offer.fromCatalog),
        [brand.offers],
    );

    const fromCatalog = useMemo(
        () => (brand.offers || []).filter((offer) => offer.fromCatalog),
        [brand.offers],
    );

    const [rows, setRows] = useState(() => own.map(toRow));
    const [removed, setRemoved] = useState([]);

    useEffect(() => {
        setRows(own.map(toRow));
        setRemoved([]);
    }, [own]);

    const save = useMutation(saveOffers, {invalidates: [keys.services], done: 'Сетка предложений сохранена'});

    const set = useCallback((localId, field, value) => {
        setRows((current) => current.map((row) => (row.localId === localId ? {...row, [field]: value} : row)));
    }, []);

    const drop = useCallback((row) => {
        setRows((current) => current.filter((item) => item.localId !== row.localId));
        if (row.id) setRemoved((current) => [...current, row.id]);
    }, []);

    const problems = useMemo(() => {
        const list = [];

        rows.forEach((row) => {
            if (!row.denomination.trim()) list.push('У каждой строки должен быть номинал');
            const price = Number(String(row.price).replace(',', '.'));
            if (!Number.isFinite(price) || price <= 0) list.push(`Цена «${row.denomination || 'без номинала'}» должна быть больше нуля`);
        });

        return [...new Set(list)];
    }, [rows]);

    const dirty = useMemo(() => {
        if (removed.length) return true;
        if (rows.length !== own.length) return true;

        return JSON.stringify(serialize(rows)) !== JSON.stringify(serialize(own.map(toRow)));
    }, [rows, removed, own]);

    const onSave = useCallback(() => {
        if (problems.length) return;

        save.run({brandId: brand.id, offers: serialize(rows), deleteIds: removed});
    }, [save, brand.id, rows, removed, problems]);

    return (
        <div className={style.matrix}>
            <div className={style.matrixHead}>
                <span>Тариф</span>
                <span>Номинал</span>
                <span>Регион</span>
                <span>Тип</span>
                <span>Выдача</span>
                <span>Цена</span>
                <span>Старая</span>
                <span>Склад</span>
                <span/>
            </div>

            {rows.map((row) => (
                <div key={row.localId} className={style.matrixRow}>
                    <Input value={row.groupName} placeholder="—" onChange={(event) => set(row.localId, 'groupName', event.target.value)}/>
                    <Input value={row.denomination} placeholder="1 месяц" onChange={(event) => set(row.localId, 'denomination', event.target.value)}/>
                    <Input value={row.regionName} onChange={(event) => set(row.localId, 'regionName', event.target.value)}/>
                    <Select options={KIND_OPTIONS} value={row.kind} onChange={(event) => set(row.localId, 'kind', event.target.value)}/>
                    <Select options={FULFILLMENT_OPTIONS} value={row.fulfillment} onChange={(event) => set(row.localId, 'fulfillment', event.target.value)}/>
                    <Input value={row.price} inputMode="numeric" onChange={(event) => set(row.localId, 'price', event.target.value)}/>
                    <Input value={row.oldPrice} inputMode="numeric" onChange={(event) => set(row.localId, 'oldPrice', event.target.value)}/>

                    <span className={style.stockCell}>
                        {row.fulfillment === 'manual'
                            ? <span className={style.muted}>не нужен</span>
                            : row.stock
                                ? (
                                    <Badge tone={row.stock.available ? 'positive' : 'danger'}>
                                        {row.stock.available}
                                    </Badge>
                                )
                                : <span className={style.muted}>—</span>}
                    </span>

                    <IconButton label="Убрать строку" onClick={() => drop(row)}>×</IconButton>
                </div>
            ))}

            {!rows.length ? (
                <Note>Предложений нет. Добавьте строку — это «тариф × номинал» с ценой.</Note>
            ) : null}

            {problems.length ? (
                <Note tone="danger">{problems.join('. ')}</Note>
            ) : null}

            {removed.length ? (
                <Note tone="warning">
                    К удалению строк: {removed.length}. Если под них забронированы коды, сервер откажет и ничего не изменит.
                </Note>
            ) : null}

            <ButtonRow>
                <Button variant="secondary" onClick={() => setRows((current) => [...current, emptyRow()])}>
                    Добавить строку
                </Button>
                <Button
                    variant="primary"
                    disabled={!dirty || Boolean(problems.length)}
                    loading={save.loading}
                    onClick={onSave}
                >
                    Сохранить сетку
                </Button>
                <Button
                    variant="ghost"
                    disabled={!dirty}
                    onClick={() => {
                        setRows(own.map(toRow));
                        setRemoved([]);
                    }}
                >
                    Отменить правки
                </Button>
            </ButtonRow>

            <Note>
                Сетка сохраняется целиком одной транзакцией: создание, правка и удаление уходят вместе,
                и витрина не успевает побыть в наполовину изменённом виде.
            </Note>

            {fromCatalog.length ? (
                <div className={style.readonly}>
                    <span className={style.readonlyTitle}>Из связанных каталогов</span>
                    <ul className={style.readonlyList}>
                        {fromCatalog.map((offer) => (
                            <li key={offer.id}>
                                <span>{offer.groupName ? `${offer.groupName} · ` : ''}{offer.denomination}</span>
                                <span className={style.muted}>{offer.regionName} · {offer.price} ₽</span>
                            </li>
                        ))}
                    </ul>
                    <Note>
                        Эти предложения собираются из карточек каталога на чтении. Править их нужно в разделе «Товары».
                    </Note>
                </div>
            ) : null}
        </div>
    );
}
