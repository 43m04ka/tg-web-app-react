import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
    Badge,
    Button,
    Field,
    Input,
    Inspector,
    InspectorRows,
    InspectorSection,
    Money,
    Mono,
    Note,
    Textarea,
    Toggle,
} from '../../ui';
import {useResource} from '../../platform/useResource';
import {useMutation} from '../../platform/useMutation';
import {keys} from '../../platform/resources';
import {askConfirm} from '../../platform/notify';
import {deleteCard, fetchProduct, updateCard} from './api';
import style from './ProductInspector.module.scss';

const TABS = [
    {id: 'main', title: 'Основное'},
    {id: 'prices', title: 'Цены'},
    {id: 'media', title: 'Медиа'},
    {id: 'links', title: 'Связи'},
    {id: 'service', title: 'Служебное'},
];

const EDITABLE = [
    'name', 'type', 'typeLabel', 'platform', 'regionActivate', 'genre', 'language', 'description',
    'price', 'oldPrice', 'endDatePromotion',
    'image', 'logoUrl', 'backgroundUrl', 'fourToThreeBannerUrl', 'portraitBannerUrl', 'videoUrl',
    'onSale', 'isHidden',
];

const NUMERIC = new Set(['price', 'oldPrice']);

const toDraft = (card) => {
    const draft = {};

    EDITABLE.forEach((field) => {
        const raw = card?.[field];
        if (typeof raw === 'boolean') draft[field] = raw;
        else draft[field] = raw === null || raw === undefined ? '' : String(raw);
    });

    return draft;
};

const offerLabel = (offer) => {
    if (offer.priceRub === null || offer.priceRub === undefined) return offer.tier || offer.branding;
    const head = offer.tier || offer.branding;
    return `${head} — ${offer.priceRub} ₽${offer.discountText ? ` (${offer.discountText})` : ''}`;
};

function MediaPreview({label, value, onChange}) {
    return (
        <div className={style.media}>
            <Field label={label}>
                <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder="Ссылка"/>
            </Field>
            {value ? <img className={style.thumb} src={value} alt="" loading="lazy"/> : null}
        </div>
    );
}

export default function ProductInspector({id, onClose}) {
    const [tab, setTab] = useState('main');
    const [draft, setDraft] = useState(null);

    const card = useResource(keys.product(id), () => fetchProduct(id));
    const data = card.data;

    useEffect(() => {
        setDraft(data ? toDraft(data) : null);
    }, [data]);

    const changed = useMemo(() => {
        if (!draft || !data) return {};

        const base = toDraft(data);
        const patch = {};

        EDITABLE.forEach((field) => {
            if (draft[field] === base[field]) return;

            if (NUMERIC.has(field)) {
                const parsed = Number(String(draft[field]).replace(',', '.'));
                patch[field] = draft[field] === '' ? null : (Number.isFinite(parsed) ? parsed : base[field]);
                return;
            }

            patch[field] = typeof draft[field] === 'boolean' ? draft[field] : (draft[field] === '' ? null : draft[field]);
        });

        return patch;
    }, [draft, data]);

    const dirty = Object.keys(changed).length > 0;

    const save = useMutation(updateCard, {
        invalidates: [keys.products],
        done: 'Карточка сохранена',
    });

    const remove = useMutation(deleteCard, {
        invalidates: [keys.products],
        done: 'Товар удалён',
        onDone: onClose,
    });

    const set = useCallback((field, value) => {
        setDraft((current) => ({...current, [field]: value}));
    }, []);

    const onSave = useCallback(() => {
        if (!dirty) return;
        save.run({cardId: id, updateData: changed});
    }, [dirty, save, id, changed]);

    const onRemove = useCallback(async () => {
        const answer = await askConfirm({
            title: `Удалить «${data?.name || id}»?`,
            text: 'Карточка исчезнет из каталога и с витрины.',
            consequence: 'Действие необратимо, вернуть можно только повторным парсом.',
            confirmText: 'Удалить',
            tone: 'danger',
        });

        if (answer) remove.run(id);
    }, [data, id, remove]);

    const offers = Array.isArray(data?.subscriptionOffers) ? data.subscriptionOffers : [];

    return (
        <Inspector
            title={data?.name || `Товар #${id}`}
            subtitle={data ? `#${data.id} · ${data.platform || 'площадка не указана'}` : ''}
            badge={data ? (data.onSale ? <Badge tone="positive">в продаже</Badge> : <Badge tone="warning">снят</Badge>) : null}
            tabs={TABS}
            tab={tab}
            onTab={setTab}
            onClose={onClose}
            dirty={dirty}
            loading={card.isLoading}
            error={card.error}
            onRetry={card.refresh}
            width="l"
            footer={(
                <>
                    <Button variant="primary" onClick={onSave} disabled={!dirty} loading={save.loading}>
                        Сохранить
                    </Button>
                    <Button variant="ghost" onClick={() => setDraft(toDraft(data))} disabled={!dirty}>
                        Отменить правки
                    </Button>
                    <span className={style.spacer}/>
                    <Button variant="danger" onClick={onRemove} loading={remove.loading}>Удалить</Button>
                </>
            )}
        >
            {!draft ? null : tab === 'main' ? (
                <>
                    <InspectorSection title="Карточка">
                        <Field label="Название">
                            <Input value={draft.name} onChange={(event) => set('name', event.target.value)}/>
                        </Field>
                        <div className={style.pair}>
                            <Field label="Тип">
                                <Input value={draft.type} onChange={(event) => set('type', event.target.value)}/>
                            </Field>
                            <Field label="Подпись типа">
                                <Input value={draft.typeLabel} onChange={(event) => set('typeLabel', event.target.value)}/>
                            </Field>
                        </div>
                        <div className={style.pair}>
                            <Field label="Площадка">
                                <Input value={draft.platform} onChange={(event) => set('platform', event.target.value)}/>
                            </Field>
                            <Field label="Регион активации">
                                <Input value={draft.regionActivate} onChange={(event) => set('regionActivate', event.target.value)}/>
                            </Field>
                        </div>
                        <div className={style.pair}>
                            <Field label="Жанр">
                                <Input value={draft.genre} onChange={(event) => set('genre', event.target.value)}/>
                            </Field>
                            <Field label="Язык">
                                <Input value={draft.language} onChange={(event) => set('language', event.target.value)}/>
                            </Field>
                        </div>
                        <Field label="Описание">
                            <Textarea rows={6} value={draft.description} onChange={(event) => set('description', event.target.value)}/>
                        </Field>
                    </InspectorSection>

                    <InspectorSection title="Состояние">
                        <div className={style.switches}>
                            <Toggle checked={draft.onSale === true} onChange={(next) => set('onSale', next)} label="В продаже"/>
                            <Toggle checked={draft.isHidden === true} onChange={(next) => set('isHidden', next)} label="Скрыт из каталога"/>
                        </div>
                    </InspectorSection>
                </>
            ) : tab === 'prices' ? (
                <>
                    <InspectorSection title="Цены" note="Сервер отдаёт рубли уже пересчитанными — на клиенте цены не пересчитываются.">
                        <div className={style.pair}>
                            <Field label="Цена, ₽">
                                <Input value={draft.price} onChange={(event) => set('price', event.target.value)} inputMode="decimal"/>
                            </Field>
                            <Field label="Старая цена, ₽">
                                <Input value={draft.oldPrice} onChange={(event) => set('oldPrice', event.target.value)} inputMode="decimal"/>
                            </Field>
                        </div>
                        <Field label="Окончание акции" hint="Строка от источника, например 2026-01-31">
                            <Input value={draft.endDatePromotion} onChange={(event) => set('endDatePromotion', event.target.value)}/>
                        </Field>
                    </InspectorSection>

                    <InspectorSection title="Цена источника">
                        <InspectorRows items={[
                            {label: 'В валюте источника', value: data?.priceInOtherCurrency ?? '—'},
                            {label: 'Старая в валюте', value: data?.oldPriceInOtherCurrency ?? '—'},
                        ]}/>
                    </InspectorSection>

                    <InspectorSection
                        title="Подписки"
                        note="Справочные цены для подписчиков. Продаём по цене выше — по ним продавать нельзя."
                    >
                        {offers.length ? (
                            <ul className={style.offers}>
                                {offers.map((offer, index) => (
                                    <li key={`${offer.branding}-${index}`} className={style.offer}>
                                        <span className={style.offerName}>{offerLabel(offer)}</span>
                                        <span className={style.offerNote}>
                                            {offer.branding}
                                            {offer.endTime ? ` · до ${new Date(offer.endTime).toLocaleDateString('ru-RU')}` : ''}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <Note>Подписочных предложений у карточки нет.</Note>
                        )}
                    </InspectorSection>
                </>
            ) : tab === 'media' ? (
                <InspectorSection title="Изображения и видео">
                    <MediaPreview label="Обложка" value={draft.image} onChange={(next) => set('image', next)}/>
                    <MediaPreview label="Логотип" value={draft.logoUrl} onChange={(next) => set('logoUrl', next)}/>
                    <MediaPreview label="Фон" value={draft.backgroundUrl} onChange={(next) => set('backgroundUrl', next)}/>
                    <MediaPreview label="Баннер 4:3" value={draft.fourToThreeBannerUrl} onChange={(next) => set('fourToThreeBannerUrl', next)}/>
                    <MediaPreview label="Вертикальный баннер" value={draft.portraitBannerUrl} onChange={(next) => set('portraitBannerUrl', next)}/>
                    <Field label="Видео">
                        <Input value={draft.videoUrl} onChange={(event) => set('videoUrl', event.target.value)}/>
                    </Field>
                </InspectorSection>
            ) : tab === 'links' ? (
                <>
                    <InspectorSection title="Похожие" note="Связи считает сервер задачей «Пересчитать ассоциации».">
                        {Array.isArray(data?.similarCard) && data.similarCard.length ? (
                            <ul className={style.links}>
                                {data.similarCard.map((item, index) => (
                                    <li key={index}>{item?.name || item?.serviceId || String(item)}</li>
                                ))}
                            </ul>
                        ) : <Note>Похожих карточек не найдено.</Note>}
                    </InspectorSection>

                    <InspectorSection title="Дополнения">
                        {Array.isArray(data?.conceptAddOns) && data.conceptAddOns.length ? (
                            <ul className={style.links}>
                                {data.conceptAddOns.map((item, index) => (
                                    <li key={index}>{item?.name || String(item)}</li>
                                ))}
                            </ul>
                        ) : <Note>Дополнений нет.</Note>}
                    </InspectorSection>

                    <InspectorSection title="Издания">
                        {Array.isArray(data?.conceptProducts) && data.conceptProducts.length ? (
                            <ul className={style.links}>
                                {data.conceptProducts.map((item, index) => (
                                    <li key={index}>{item?.name || String(item)}</li>
                                ))}
                            </ul>
                        ) : <Note>Других изданий нет.</Note>}
                    </InspectorSection>
                </>
            ) : (
                <InspectorSection title="Служебное">
                    <InspectorRows items={[
                        {label: 'Идентификатор', value: <Mono>{data?.id}</Mono>},
                        {label: 'serviceId', value: <Mono>{data?.serviceId || '—'}</Mono>},
                        {label: 'Каталог', value: <Mono>{data?.catalogId ?? '—'}</Mono>},
                        {label: 'Порядок', value: data?.serialNumber ?? '—'},
                        {label: 'Цена в базе', value: <Money value={data?.price}/>},
                        {
                            label: 'Источник',
                            value: data?.linkToOriginal
                                ? <a className={style.link} href={data.linkToOriginal} target="_blank" rel="noreferrer">Открыть страницу</a>
                                : '—',
                        },
                    ]}/>
                </InspectorSection>
            )}
        </Inspector>
    );
}
