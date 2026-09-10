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

const DEFAULTS = {search: '', state: ''};

const STATE_OPTIONS = [
    {value: '', title: 'Все коды'},
    {value: 'live', title: 'Работают'},
    {value: 'spent', title: 'Исчерпаны'}
];

export default function PromoScreen() {
    usePageHeader('Промокоды');

    const navigate = useNavigate();
    const {id} = useParams();
    const {value, patch} = useCollectionState(DEFAULTS);

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
            align: 'right',
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
                ? <span className={style.muted}>{row.personalNumberUses} — не проверяется</span>
                : <span className={style.dash}>—</span>)
        }
    ]), []);

    const openPromo = useCallback((row) => navigate(`/admin2/promo/${row.id}`), [navigate]);
    const closePromo = useCallback(() => navigate('/admin2/promo'), [navigate]);
    const startNew = useCallback(() => navigate('/admin2/promo/new'), [navigate]);

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
                footNote={
                    'Столбец «Осталось» — счётчик применений, а не лимит: он убывает при каждой '
                    + 'покупке и возвращается, если счёт так и не выставился.'
                }
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
