import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Button, ButtonRow, IconButton, Input, Mono, Note, Select, SkeletonRows} from '../../ui';
import {useResource} from '../../platform/useResource';
import {useMutation} from '../../platform/useMutation';
import {keys} from '../../platform/resources';
import {fetchLinkableCatalogs, updateBrand} from './api';
import style from './ServicesScreen.module.scss';

const KIND_OPTIONS = [
    {value: 'subscription', title: 'Подписка'},
    {value: 'gift_card', title: 'Гифт-карта'},
];

const toRows = (brand) => (Array.isArray(brand.catalogLinks) ? brand.catalogLinks : []).map((link) => ({
    catalogId: String(link.catalogId),
    kind: link.kind || 'subscription',
    regionName: link.regionName || '',
    regionFlag: link.regionFlag || '',
}));

export default function CatalogLinks({brand}) {
    const catalogs = useResource(keys.serviceCatalogs, fetchLinkableCatalogs);
    const [rows, setRows] = useState(() => toRows(brand));

    useEffect(() => {
        setRows(toRows(brand));
    }, [brand]);

    const save = useMutation(updateBrand, {invalidates: [keys.services], done: 'Связи сохранены'});

    const options = useMemo(() => ([
        {value: '', title: 'Каталог не выбран'},
        ...((catalogs.data?.result || []).map((catalog) => ({
            value: String(catalog.id),
            title: `${catalog.path} · ${catalog.productCount} карточек${catalog.pageName ? ` · ${catalog.pageName}` : ''}`,
        }))),
    ]), [catalogs.data]);

    const infoById = useMemo(() => {
        const map = new Map();
        (catalogs.data?.result || []).forEach((catalog) => map.set(String(catalog.id), catalog));
        return map;
    }, [catalogs.data]);

    const set = useCallback((index, field, value) => {
        setRows((current) => current.map((row, position) => (position === index ? {...row, [field]: value} : row)));
    }, []);

    const duplicated = useMemo(() => {
        const seen = new Set();
        return rows.some((row) => {
            if (!row.catalogId) return false;
            if (seen.has(row.catalogId)) return true;
            seen.add(row.catalogId);
            return false;
        });
    }, [rows]);

    const dirty = useMemo(
        () => JSON.stringify(rows) !== JSON.stringify(toRows(brand)),
        [rows, brand],
    );

    const onSave = useCallback(() => {
        const catalogLinks = rows
            .filter((row) => row.catalogId)
            .map((row) => ({
                catalogId: Number(row.catalogId),
                kind: row.kind,
                regionName: row.regionName.trim() || null,
                regionFlag: row.regionFlag.trim() || null,
            }));

        save.run({brandId: brand.id, updateData: {catalogLinks}});
    }, [save, brand.id, rows]);

    if (catalogs.isLoading) return <SkeletonRows count={5}/>;

    return (
        <div className={style.form}>
            <Note>
                Связь превращает карточки каталога в предложения бренда прямо на чтении: цена правится в товаре
                и сразу видна на витрине. У каждой связи свой регион — так один бренд продаёт Турцию и Индию.
            </Note>

            {rows.map((row, index) => {
                const info = infoById.get(row.catalogId);

                return (
                    <div key={index} className={style.linkRow}>
                        <Select
                            options={options}
                            value={row.catalogId}
                            onChange={(event) => set(index, 'catalogId', event.target.value)}
                        />
                        <Select
                            options={KIND_OPTIONS}
                            value={row.kind}
                            onChange={(event) => set(index, 'kind', event.target.value)}
                        />
                        <Input
                            value={row.regionName}
                            placeholder="Регион"
                            onChange={(event) => set(index, 'regionName', event.target.value)}
                        />
                        <Input
                            value={row.regionFlag}
                            placeholder="🇹🇷"
                            onChange={(event) => set(index, 'regionFlag', event.target.value)}
                        />
                        <span className={style.linkNote}>
                            {info ? <Mono muted>{info.productCount} в продаже</Mono> : null}
                        </span>
                        <IconButton
                            label="Убрать связь"
                            onClick={() => setRows((current) => current.filter((item, position) => position !== index))}
                        >
                            ×
                        </IconButton>
                    </div>
                );
            })}

            {!rows.length ? <Note>Связей нет — бренд продаёт только собственные предложения.</Note> : null}

            {duplicated ? (
                <Note tone="warning">Один каталог можно привязать к бренду только один раз — лишние связи сервер отбросит.</Note>
            ) : null}

            <ButtonRow>
                <Button
                    variant="secondary"
                    onClick={() => setRows((current) => [...current, {catalogId: '', kind: 'subscription', regionName: '', regionFlag: ''}])}
                >
                    Добавить связь
                </Button>
                <Button variant="primary" disabled={!dirty} loading={save.loading} onClick={onSave}>Сохранить</Button>
                <Button variant="ghost" disabled={!dirty} onClick={() => setRows(toRows(brand))}>Отменить правки</Button>
            </ButtonRow>
        </div>
    );
}
