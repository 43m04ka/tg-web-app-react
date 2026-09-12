import React, {useCallback, useMemo} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {
    Badge,
    Button,
    Collection,
    Mono,
    Select,
    Workspace,
    useCollectionState
} from '../../ui';
import {usePageHeader} from '../../shell/pageHeader';
import {useResource} from '../../platform/useResource';
import {keys} from '../../platform/resources';
import {fetchPromoList} from './api';
import {isExhausted, normalizeCode, percentTitle, sortPromos, usesLeftTitle} from './promoModel';
import PromoInspector from './PromoInspector';
import style from './PromoScreen.module.scss';
import {pluralOf} from '../../../../shared/lib/plural';

const DEFAULTS = {search: '', state: ''};

const STATE_OPTIONS = [
    {value: '', title: 'Все коды'},
    {value: 'live', title: 'Работают'},
    {value: 'spent', title: 'Исчерпаны'}
];

const usesPerBuyer = (count) => `до ${count} ${pluralOf(Number(count), ['раза', 'раз', 'раз'])}`;

export default function PromoScreen() {
    usePageHeader('Промокоды');

    const navigate = useNavigate();
    const {id} = useParams();
    const {value, patch, withQuery} = useCollectionState(DEFAULTS);

    const list = useResource(keys.promo, fetchPromoList);

    const all = useMemo(() => sortPromos(list.data?.result), [list.data]);

    const rows = useMemo(() => {
        const needle = normalizeCode(value.search);

        return all
            .filter((promo) => (!needle || normalizeCode(promo.name).includes(needle)))
            .filter((promo) => {
                if (value.state === 'live') return !isExhausted(promo);
                if (value.state === 'spent') return isExhausted(promo);
                return true;
            });
    }, [all, value]);

    const columns = useMemo(() => ([
        {
            id: 'name',
            title: 'Код',
            width: 180,
            cell: (row) => <Mono>{normalizeCode(row.name)}</Mono>
        },
        {
            id: 'percent',
            title: 'Скидка',
            width: 96,
            cell: (row) => percentTitle(row)
        },
        {
            id: 'total',
            title: 'Осталось',
            width: 140,
            cell: (row) => (isExhausted(row)
                ? <Badge tone="warning">Исчерпан</Badge>
                : <span className={style.left}>{usesLeftTitle(row)}</span>)
        },
        {
            id: 'personal',
            title: 'На покупателя',
            width: 150,
            cell: (row) => (Number(row.personalNumberUses) > 0
                ? <span>{usesPerBuyer(row.personalNumberUses)}</span>
                : <span className={style.dash}>—</span>)
        }
    ]), []);

    const openPromo = useCallback((row) => navigate(withQuery(`/admin2/promo/${row.id}`)), [navigate, withQuery]);
    const closePromo = useCallback(() => navigate(withQuery('/admin2/promo')), [navigate, withQuery]);
    const startNew = useCallback(() => navigate(withQuery('/admin2/promo/new')), [navigate, withQuery]);

    const isNew = id === 'new';
    const active = isNew ? null : all.find((promo) => String(promo.id) === String(id)) || null;

    return (
        <Workspace>
            <Collection
                columns={columns}
                rows={rows}
                loading={list.isLoading}
                stale={list.isStale}
                error={list.error}
                onRetry={list.refresh}
                activeKey={active?.id ?? null}
                onOpen={openPromo}
                search={{
                    value: value.search,
                    onChange: (next) => patch({search: next}),
                    placeholder: 'Код промокода'
                }}
                filters={(
                    <Select
                        options={STATE_OPTIONS}
                        value={value.state}
                        onChange={(event) => patch({state: event.target.value})}
                    />
                )}
                actions={(
                    <>
                        <Button size="s" variant="primary" onClick={startNew}>Новый код</Button>
                        <Button size="s" variant="ghost" onClick={list.refresh}>Обновить</Button>
                    </>
                )}
                empty={{
                    title: value.search ? 'Такого кода нет' : 'Промокодов пока нет',
                    text: value.search
                        ? 'Проверьте написание или заведите новый код.'
                        : 'Заведите первый код — он заработает на витрине сразу после сохранения.'
                }}
            />

            {isNew || active ? (
                <PromoInspector
                    promo={active}
                    all={all}
                    isNew={isNew}
                    onClose={closePromo}
                />
            ) : null}
        </Workspace>
    );
}
