import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
    Button,
    ButtonRow,
    Field,
    Input,
    Inspector,
    InspectorSection,
    Note,
    Select,
    Toggle
} from '../../ui';
import {askConfirm} from '../../platform/notify';
import {keys} from '../../platform/resources';
import {useMutation} from '../../platform/useMutation';
import {createBanner, deleteBanner, searchBannerSources, updateBanner} from './api';
import {
    BANNER_DEVICES,
    BANNER_SLOTS,
    BANNER_TYPES,
    GRADIENT_PRESETS,
    IMAGE_FITS,
    bannerProblem,
    bannerTitle,
    toDraft,
    toPayload
} from './bannerModel';
import style from './StorefrontScreen.module.scss';

const SEARCH_DELAY = 350;

export default function BannerInspector({banner, pages, count, pageId = null, slot = 'main', onClose}) {
    const isNew = !banner;

    const [draft, setDraft] = useState(() => (isNew
        ? {...toDraft(null), serialNumber: count, pageId, slot}
        : toDraft(banner)));

    const [query, setQuery] = useState('');
    const [found, setFound] = useState([]);

    useEffect(() => {
        if (draft.type !== 'product' || query.trim().length < 2) {
            setFound([]);
            return undefined;
        }

        const timerId = setTimeout(() => {
            searchBannerSources(query.trim())
                .then((payload) => setFound(payload?.result || []))
                .catch(() => setFound([]));
        }, SEARCH_DELAY);

        return () => clearTimeout(timerId);
    }, [query, draft.type]);

    const dirty = useMemo(() => {
        if (isNew) return true;

        const base = toDraft(banner);
        return Object.keys(base).some((field) => String(base[field]) !== String(draft[field]));
    }, [draft, banner, isNew]);

    const problem = bannerProblem(draft);

    const save = useMutation(
        (input) => (isNew ? createBanner(input) : updateBanner(banner.id, input)),
        {
            invalidates: [keys.banners, keys.structure],
            done: isNew ? 'Баннер добавлен' : 'Баннер сохранён',
            onDone: onClose
        }
    );

    const remove = useMutation(() => deleteBanner(banner.id), {
        invalidates: [keys.banners, keys.structure],
        done: 'Баннер убран',
        onDone: onClose
    });

    const set = useCallback((field) => (event) => {
        const {value} = event.target;
        setDraft((prev) => ({...prev, [field]: value}));
    }, []);

    const pickProduct = useCallback((product) => {
        setDraft((prev) => ({...prev, productId: String(product.id)}));
        setQuery('');
        setFound([]);
    }, []);

    const askRemove = useCallback(async () => {
        const answer = await askConfirm({
            title: 'Убрать баннер из карусели?',
            text: bannerTitle(banner),
            confirmText: 'Убрать',
            tone: 'danger'
        });

        if (answer) remove.run();
    }, [banner, remove]);

    const scopeOptions = useMemo(() => ([
        {value: '', title: 'Все витрины'},
        ...(pages || []).map((page) => ({value: String(page.id), title: page.name || `Витрина №${page.id}`}))
    ]), [pages]);

    const isProduct = draft.type === 'product';
    const live = isProduct ? (banner?.data || {}) : null;

    return (
        <Inspector
            open
            width="s"
            title={isNew ? 'Новый баннер' : bannerTitle(banner)}
            subtitle={isProduct ? 'Товар' : 'Произвольный'}
            dirty={dirty}
            onClose={onClose}
            footer={(
                <ButtonRow>
                    <Button
                        variant="primary"
                        disabled={save.loading || Boolean(problem) || !dirty}
                        onClick={() => save.run(toPayload(draft))}
                    >
                        {save.loading ? 'Сохраняем…' : 'Сохранить'}
                    </Button>

                    <Button variant="ghost" onClick={onClose}>Отмена</Button>

                    {isNew ? null : (
                        <Button variant="danger" disabled={remove.loading} onClick={askRemove}>Убрать</Button>
                    )}
                </ButtonRow>
            )}
        >
            <InspectorSection title="Что показываем">
                <Field label="Вид баннера">
                    <Select options={BANNER_TYPES} value={draft.type} onChange={set('type')}/>
                </Field>

                <Field label="Где показывать" hint="«Все витрины» — баннер попадёт на каждую площадку">
                    <Select
                        options={scopeOptions}
                        value={draft.pageId === null ? '' : String(draft.pageId)}
                        onChange={(event) => setDraft((prev) => ({
                            ...prev,
                            pageId: event.target.value === '' ? null : Number(event.target.value)
                        }))}
                    />
                </Field>

                <Field label="Версия сайта" hint="Например, широкая картинка для мобильной и квадратная для ПК — двумя баннерами">
                    <Select options={BANNER_DEVICES} value={draft.device} onChange={set('device')}/>
                </Field>

                <Field label="Место на главной ПК" hint="Малые баннеры листаются справа в квадратной карусели. Картинка нужна квадратная: по умолчанию берём обложку товара">
                    <Select options={BANNER_SLOTS} value={draft.slot} onChange={set('slot')}/>
                </Field>

                <Toggle
                    checked={draft.shade}
                    label="Затемнение под текстом"
                    onChange={(value) => setDraft((prev) => ({...prev, shade: value}))}
                />

                <Toggle
                    checked={draft.isHidden}
                    label="Скрыть из карусели"
                    onChange={(value) => setDraft((prev) => ({...prev, isHidden: value}))}
                />
            </InspectorSection>

            {isProduct ? (
                <InspectorSection
                    title="Товар"
                    note="Цена, картинка и срок акции берутся из карточки на лету — после парсинга баннер пересохранять не нужно."
                >
                    <Field label="ID товара" required>
                        <Input mono value={draft.productId} onChange={set('productId')}/>
                    </Field>

                    <Field label="Найти по названию" hint="От двух знаков">
                        <Input value={query} placeholder="Grand Theft Auto" onChange={(event) => setQuery(event.target.value)}/>
                    </Field>

                    {found.length > 0 ? (
                        <div className={style.found}>
                            {found.map((product) => (
                                <button
                                    key={product.id}
                                    type="button"
                                    className={style.foundItem}
                                    onClick={() => pickProduct(product)}
                                >
                                    <span
                                        className={style.foundArt}
                                        style={product.image ? {backgroundImage: `url(${product.image})`} : undefined}
                                    />
                                    <span className={style.foundBody}>
                                        <span className={style.foundName}>{product.name}</span>
                                        <span className={style.foundMeta}>
                                            №{product.id}
                                            {product.hasBanner ? ' · есть баннер 4:3' : ' · только обложка'}
                                        </span>
                                    </span>
                                </button>
                            ))}
                        </div>
                    ) : null}

                    {live?.title ? (
                        <Note tone="neutral">
                            Сейчас в карусели: «{live.title}»
                            {live.price ? `, ${Number(live.price).toLocaleString('ru-RU')} ₽` : ''}.
                        </Note>
                    ) : null}
                </InspectorSection>
            ) : null}

            <InspectorSection
                title="Подписи"
                note={isProduct
                    ? 'Пустой заголовок означает «брать из товара». Заполненный замораживает своё значение.'
                    : ''}
            >
                <Field label="Заголовок" required={!isProduct}>
                    <Input
                        value={draft.title}
                        placeholder={isProduct ? 'из карточки товара' : 'Играй сегодня — плати долями'}
                        onChange={set('title')}
                    />
                </Field>

                <Field label="Надпись сверху">
                    <Input value={draft.subtitle} placeholder="Предзаказ" onChange={set('subtitle')}/>
                </Field>

                <Field label="Пояснение">
                    <Input value={draft.note} placeholder="4 платежа без процентов" onChange={set('note')}/>
                </Field>

                <Field label="Ссылка" hint={isProduct ? 'Пусто — откроется карточка товара' : 'Куда ведёт баннер'}>
                    <Input value={draft.url} onChange={set('url')}/>
                </Field>
            </InspectorSection>

            {draft.slot === 'main' ? (
                <InspectorSection
                    title="Кнопки"
                    note={isProduct
                        ? 'До двух кнопок на большом баннере. Пустая ссылка открывает карточку товара.'
                        : 'До двух кнопок на большом баннере. Без кнопок кликается весь баннер.'}
                >
                    <Field label="Кнопка 1 — текст">
                        <Input value={draft.button1Label} placeholder="Купить" onChange={set('button1Label')}/>
                    </Field>

                    <Field label="Кнопка 1 — ссылка" hint="https://… или /catalog/…">
                        <Input value={draft.button1Url} onChange={set('button1Url')}/>
                    </Field>

                    <Field label="Кнопка 2 — текст">
                        <Input value={draft.button2Label} placeholder="Подробнее об акции" onChange={set('button2Label')}/>
                    </Field>

                    <Field label="Кнопка 2 — ссылка">
                        <Input value={draft.button2Url} onChange={set('button2Url')}/>
                    </Field>
                </InspectorSection>
            ) : null}

            <InspectorSection title="Картинка">
                <Field
                    label="Адрес картинки"
                    hint={isProduct ? 'Пусто — берём из товара' : 'Пусто — рисуем градиент'}
                >
                    <Input value={draft.image} onChange={set('image')}/>
                </Field>

                {draft.image.trim() ? (
                    <Field label="Как кадрировать">
                        <Select options={IMAGE_FITS} value={draft.imageFit} onChange={set('imageFit')}/>
                    </Field>
                ) : null}

                {!isProduct && !draft.image.trim() ? (
                    <Field label="Градиент">
                        <div className={style.gradients}>
                            {GRADIENT_PRESETS.map((preset) => (
                                <button
                                    key={preset}
                                    type="button"
                                    className={`${style.gradient} ${draft.gradient === preset ? style.gradientOn : ''}`}
                                    style={{background: preset}}
                                    onClick={() => setDraft((prev) => ({...prev, gradient: preset}))}
                                />
                            ))}
                        </div>
                    </Field>
                ) : null}
            </InspectorSection>

            {isProduct ? null : (
                <InspectorSection title="Цена" note="Только для показа: баннер ничего не продаёт сам.">
                    <Field label="Цена">
                        <Input type="number" value={draft.price} onChange={set('price')}/>
                    </Field>

                    <Field label="Старая цена">
                        <Input type="number" value={draft.oldPrice} onChange={set('oldPrice')}/>
                    </Field>

                    <Field label="Акция до" hint="Формат 2026-11-19">
                        <Input mono value={draft.promoEndDate} onChange={set('promoEndDate')}/>
                    </Field>
                </InspectorSection>
            )}

            {problem ? <Note tone="danger">{problem}</Note> : null}
        </Inspector>
    );
}
