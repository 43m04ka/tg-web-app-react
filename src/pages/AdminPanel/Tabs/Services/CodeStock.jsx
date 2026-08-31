import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Group, Row} from '../../Elements/FormLayout/FormLayout';
import useData from '../../useData';
import {useFeedback} from '../../Elements/Feedback/Feedback';
import {useServer} from './useServer';
import {countCodeLines} from './serviceModel';
import s from './Services.module.scss';

const STATUS_LABEL = {
    available: 'Свободен',
    reserved: 'Бронь',
    sold: 'Продан',
};

const STATUS_TONE = {
    available: 'stockFree',
    reserved: 'stockHeld',
    sold: 'stockSold',
};

const FILTERS = [
    {key: 'all', name: 'Все'},
    {key: 'available', name: 'Свободные'},
    {key: 'reserved', name: 'Бронь'},
    {key: 'sold', name: 'Проданные'},
];

const CodeStock = ({offerId, onChanged}) => {
    const {authenticationData} = useData();
    const server = useServer();
    const serverRef = useRef(server);
    serverRef.current = server;

    const {showToast, confirm} = useFeedback();

    const [codes, setCodes] = useState(null);
    const [filter, setFilter] = useState('all');
    const [draft, setDraft] = useState('');
    const [busy, setBusy] = useState(false);

    const load = useCallback(async () => {
        try {
            const result = await serverRef.current.getCodes(offerId, 'all');
            setCodes(result);
        } catch (error) {
            showToast(error.message || 'Не удалось загрузить склад кодов', 'error');
            setCodes([]);
        }
    }, [offerId, showToast]);

    useEffect(() => { load(); }, [load]);

    const visible = useMemo(() => {
        const list = codes || [];
        return filter === 'all' ? list : list.filter((item) => item.status === filter);
    }, [codes, filter]);

    const totals = useMemo(() => (codes || []).reduce((sum, item) => ({
        ...sum,
        [item.status]: (sum[item.status] || 0) + 1,
    }), {available: 0, reserved: 0, sold: 0}), [codes]);

    const pending = countCodeLines(draft);

    const handleAdd = async () => {
        if (!pending) {
            showToast('Вставьте коды — по одному в строке', 'error');
            return;
        }

        setBusy(true);
        try {
            const result = await serverRef.current.addCodes(authenticationData, offerId, draft);
            const added = result?.added ?? 0;
            const skipped = result?.skipped ?? 0;

            showToast(
                skipped > 0
                    ? `Добавлено ${added}, пропущено дублей: ${skipped}`
                    : `Добавлено кодов: ${added}`,
                added > 0 ? 'success' : 'info'
            );

            setDraft('');
            await load();
            onChanged?.();
        } catch (error) {
            showToast(error.message || 'Не удалось добавить коды', 'error');
        } finally {
            setBusy(false);
        }
    };

    const handleDelete = async (item) => {
        const agreed = await confirm({
            title: 'Удалить код?',
            text: `${item.code} исчезнет со склада. Действие необратимо.`,
            confirmLabel: 'Удалить',
            danger: true,
        });
        if (!agreed) return;

        setBusy(true);
        try {
            await serverRef.current.deleteCode(authenticationData, item.id);
            showToast('Код удалён', 'success');
            await load();
            onChanged?.();
        } catch (error) {
            showToast(error.message || 'Не удалось удалить код', 'error');
        } finally {
            setBusy(false);
        }
    };

    return (
        <Group title="Склад кодов">
            <Row label="Пополнить склад" top wide
                 hint="По одному коду в строке. Дубли и уже лежащие на складе пропускаются">
                <div className={s['stockAdd']}>
                    <textarea className={s['stockArea']}
                              rows={5}
                              placeholder={'XXXX-YYYY-ZZZZ\nAAAA-BBBB-CCCC'}
                              value={draft}
                              onChange={(event) => setDraft(event.target.value)}/>

                    <div className={s['stockAddBar']}>
                        <span className={s['formStatus']}>
                            {pending ? `Готово к загрузке: ${pending}` : 'Пусто'}
                        </span>
                        <button type="button" className={`${s['btn']} ${s['btnPrimary']}`}
                                disabled={busy || !pending} onClick={handleAdd}>
                            {busy ? 'Загрузка…' : 'Добавить'}
                        </button>
                    </div>
                </div>
            </Row>

            <Row label="На складе" top wide
                 hint="Свободный код уходит покупателю сразу после оплаты. Бронь — код держится за неоплаченным заказом и вернётся на склад сам. Удалить можно только свободный">
                <div className={s['stockList']}>
                    <div className={s['stockFilters']}>
                        {FILTERS.map((option) => {
                            const count = option.key === 'all'
                                ? (codes || []).length
                                : totals[option.key] || 0;

                            return (
                                <button key={option.key} type="button"
                                        className={`${s['chip']} ${filter === option.key ? s['chipActive'] : ''}`}
                                        onClick={() => setFilter(option.key)}>
                                    {option.name}
                                    <span className={s['chipCount']}>{count}</span>
                                </button>
                            );
                        })}
                        <button type="button" className={s['btn']} onClick={load}>Обновить</button>
                    </div>

                    <div className={s['stockRows']}>
                        {codes === null ? (
                            <p className={s['formNote']}>Загрузка…</p>
                        ) : visible.length === 0 ? (
                            <p className={s['formNote']}>
                                {filter === 'all'
                                    ? 'Склад пуст — пока кодов нет, покупатель видит «Нет в наличии». Вставьте их в поле выше'
                                    : 'В этом статусе кодов нет'}
                            </p>
                        ) : visible.map((item) => (
                            <div key={item.id} className={s['stockRow']}>
                                <span className={s['stockCode']}>{item.code}</span>

                                <span className={`${s['badge']} ${s[STATUS_TONE[item.status]]}`}>
                                    {STATUS_LABEL[item.status] || item.status}
                                </span>

                                <span className={s['stockOrder']}>
                                    {item.orderId ? `Заказ №${item.orderId}` : ''}
                                </span>

                                {item.status === 'available' ? (
                                    <button type="button" className={s['stockRemove']}
                                            disabled={busy}
                                            aria-label={`Удалить код ${item.code}`}
                                            onClick={() => handleDelete(item)}>
                                        ✕
                                    </button>
                                ) : <span className={s['stockRemove']}/>}
                            </div>
                        ))}
                    </div>
                </div>
            </Row>
        </Group>
    );
};

export default CodeStock;
