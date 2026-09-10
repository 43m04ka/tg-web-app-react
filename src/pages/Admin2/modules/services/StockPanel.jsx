import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Badge, Button, ButtonRow, EmptyState, ErrorState, IconButton, Mono, Note, Select, SkeletonRows, Textarea} from '../../ui';
import {useResource} from '../../platform/useResource';
import {useMutation} from '../../platform/useMutation';
import {keys} from '../../platform/resources';
import {askConfirm, toast} from '../../platform/notify';
import {addCodes, deleteCode, fetchCodes} from './api';
import style from './ServicesScreen.module.scss';

const STATUS_OPTIONS = [
    {value: 'all', title: 'Все коды'},
    {value: 'available', title: 'Свободные'},
    {value: 'reserved', title: 'Забронированные'},
    {value: 'sold', title: 'Проданные'},
];

const STATUS_TONES = {
    available: 'positive',
    reserved: 'warning',
    sold: 'neutral',
};

const STATUS_TITLES = {
    available: 'свободен',
    reserved: 'забронирован',
    sold: 'продан',
};

export default function StockPanel({brand}) {
    const stocked = useMemo(
        () => (brand.offers || []).filter((offer) => !offer.fromCatalog && offer.fulfillment === 'code'),
        [brand.offers],
    );

    const [offerId, setOfferId] = useState(() => (stocked[0] ? String(stocked[0].id) : ''));
    const [status, setStatus] = useState('all');
    const [text, setText] = useState('');

    useEffect(() => {
        if (stocked.some((offer) => String(offer.id) === offerId)) return;
        setOfferId(stocked[0] ? String(stocked[0].id) : '');
    }, [stocked, offerId]);

    const codes = useResource(
        keys.serviceCodes(offerId, status),
        () => fetchCodes({offerId, status}),
        {enabled: Boolean(offerId)},
    );

    const upload = useMutation(addCodes, {
        invalidates: [keys.services],
        onDone: (result) => {
            setText('');
            toast({
                tone: 'positive',
                title: `Добавлено кодов: ${result?.added ?? 0}`,
                text: result?.skipped ? `Пропущено дублей: ${result.skipped}` : '',
            });
        },
    });

    const remove = useMutation(deleteCode, {invalidates: [keys.services], done: 'Код удалён'});

    const onUpload = useCallback(() => {
        if (!offerId || !text.trim()) return;
        upload.run({offerId: Number(offerId), codes: text});
    }, [upload, offerId, text]);

    const onRemove = useCallback(async (code) => {
        const answer = await askConfirm({
            title: 'Удалить код со склада?',
            text: code.code,
            consequence: 'Удалить можно только свободный код: забронированный ждёт оплаты, проданный уже у покупателя.',
            confirmText: 'Удалить',
            tone: 'danger',
        });

        if (answer) {
            const result = await remove.run(code.id);
            if (result.ok) codes.refresh();
        }
    }, [remove, codes]);

    if (!stocked.length) {
        return (
            <EmptyState
                title="Складу здесь нечего хранить"
                text="Склад нужен предложениям с выдачей «Код со склада». Заведите такое предложение во вкладке «Предложения»."
            />
        );
    }

    const list = codes.data?.result || [];

    return (
        <div className={style.form}>
            <div className={style.stockHead}>
                <Select
                    options={stocked.map((offer) => ({
                        value: String(offer.id),
                        title: `${offer.groupName ? `${offer.groupName} · ` : ''}${offer.denomination} · ${offer.regionName}`,
                    }))}
                    value={offerId}
                    onChange={(event) => setOfferId(event.target.value)}
                />
                <Select options={STATUS_OPTIONS} value={status} onChange={(event) => setStatus(event.target.value)}/>
                <Button size="s" variant="ghost" onClick={codes.refresh}>Обновить</Button>
            </div>

            {codes.error ? <ErrorState error={codes.error} onRetry={codes.refresh}/> : null}

            {codes.isLoading ? <SkeletonRows count={6}/> : null}

            {!codes.isLoading && !codes.error ? (
                list.length ? (
                    <ul className={style.codes}>
                        {list.map((code) => (
                            <li key={code.id} className={style.code}>
                                <Mono>{code.code}</Mono>
                                <span className={style.codeStatus}>
                                    <Badge tone={STATUS_TONES[code.status] || 'neutral'}>
                                        {STATUS_TITLES[code.status] || code.status}
                                    </Badge>
                                </span>
                                {code.orderId ? <span className={style.muted}>заказ #{code.orderId}</span> : <span/>}
                                {code.status === 'available' ? (
                                    <IconButton label="Удалить код" onClick={() => onRemove(code)}>×</IconButton>
                                ) : <span/>}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <EmptyState
                        title="Склад пуст"
                        text="Вставьте коды построчно в поле ниже — дубли отсеются сами."
                    />
                )
            ) : null}

            <Textarea
                rows={6}
                value={text}
                placeholder={'XXXX-XXXX-XXXX\nYYYY-YYYY-YYYY'}
                onChange={(event) => setText(event.target.value)}
            />

            <ButtonRow>
                <Button
                    variant="primary"
                    disabled={!text.trim()}
                    loading={upload.loading}
                    onClick={onUpload}
                >
                    Добавить коды
                </Button>
                <span className={style.muted}>
                    {text.trim() ? `Строк: ${text.split(/[\r\n]+/).filter((line) => line.trim()).length}` : ''}
                </span>
            </ButtonRow>

            <Note>
                Остаток — это число свободных кодов, а не поле в базе. Код бронируется в момент создания заказа,
                а не после оплаты: иначе двое успевают купить последний.
                Сервер отдаёт не больше 500 строк за раз.
            </Note>
        </div>
    );
}
