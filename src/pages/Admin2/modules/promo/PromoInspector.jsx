import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
    Badge,
    Button,
    ButtonRow,
    Field,
    Input,
    Inspector,
    InspectorRows,
    InspectorSection,
    Note
} from '../../ui';
import {askConfirm} from '../../platform/notify';
import {keys} from '../../platform/resources';
import {useMutation} from '../../platform/useMutation';
import {useResource} from '../../platform/useResource';
import {createPromo, deletePromo, fetchPromoUsage, updatePromo} from './api';
import {
    dayTitle,
    isDirty,
    isExhausted,
    moneyTitle,
    normalizeCode,
    toDraft,
    toPayload,
    usageTitle,
    usesLeftTitle,
    validate
} from './promoModel';

export default function PromoInspector({promo, all, isNew, onClose}) {
    const [draft, setDraft] = useState(() => toDraft(promo));
    const [touched, setTouched] = useState(false);

    useEffect(() => {
        setDraft(toDraft(promo));
        setTouched(false);
    }, [promo, isNew]);

    const errors = useMemo(
        () => validate(draft, {existing: all, id: promo?.id ?? null}),
        [draft, all, promo]
    );

    const usage = useResource(
        keys.promoUsage(promo?.id ?? 0),
        () => fetchPromoUsage(promo.id),
        {enabled: !isNew}
    );

    const summary = usage.data?.summary || null;

    const hasErrors = Object.keys(errors).length > 0;
    const dirty = isNew || isDirty(draft, promo);

    const save = useMutation(
        (input) => (isNew ? createPromo(input) : updatePromo(promo.id, input)),
        {
            invalidates: [keys.promo],
            done: isNew ? 'Промокод заведён' : 'Промокод сохранён',
            onDone: onClose
        }
    );

    const remove = useMutation(() => deletePromo(promo.id), {
        invalidates: [keys.promo],
        done: 'Промокод удалён',
        onDone: onClose
    });

    const set = useCallback((field) => (event) => {
        const {value} = event.target;
        setDraft((prev) => ({...prev, [field]: value}));
    }, []);

    const submit = useCallback(() => {
        setTouched(true);
        if (hasErrors) return;

        save.run(toPayload(draft));
    }, [hasErrors, save, draft]);

    const askRemove = useCallback(async () => {
        const answer = await askConfirm({
            title: `Удалить промокод ${normalizeCode(promo.name)}?`,
            text: 'Покупатели, которые уже знают код, перестанут получать скидку.',
            consequence: 'Восстановить не получится — заводите заново.',
            confirmText: 'Удалить',
            tone: 'danger'
        });

        if (answer) remove.run();
    }, [promo, remove]);

    const showError = (field) => (touched ? errors[field] || '' : '');

    return (
        <Inspector
            open
            width="s"
            title={isNew ? 'Новый промокод' : normalizeCode(promo.name)}
            subtitle={isNew ? 'Код заработает сразу после сохранения' : `${draft.percent}% скидки`}
            badge={!isNew && isExhausted(promo)
                ? <Badge tone="warning">Исчерпан</Badge>
                : null}
            dirty={dirty}
            onClose={onClose}
            footer={(
                <ButtonRow>
                    <Button
                        variant="primary"
                        disabled={save.loading || (touched && hasErrors) || !dirty}
                        onClick={submit}
                    >
                        {save.loading ? 'Сохраняем…' : 'Сохранить'}
                    </Button>

                    <Button variant="ghost" onClick={onClose}>Отмена</Button>

                    {isNew ? null : (
                        <Button variant="danger" disabled={remove.loading} onClick={askRemove}>
                            Удалить
                        </Button>
                    )}
                </ButtonRow>
            )}
        >
            <InspectorSection title="Код">
                <Field
                    label="Что вводит покупатель"
                    hint="Латиница, цифры, дефис и подчёркивание. Регистр не важен — сохраним заглавными."
                    error={showError('name')}
                    required
                >
                    <Input
                        mono
                        value={draft.name}
                        invalid={Boolean(showError('name'))}
                        placeholder="SUMMER10"
                        onChange={set('name')}
                    />
                </Field>

                <Field
                    label="Скидка, %"
                    hint="Процент снимается со всей корзины и распределяется по позициям."
                    error={showError('percent')}
                    required
                >
                    <Input
                        type="number"
                        min="1"
                        max="100"
                        value={draft.percent}
                        invalid={Boolean(showError('percent'))}
                        onChange={set('percent')}
                    />
                </Field>
            </InspectorSection>

            <InspectorSection
                title="Сколько осталось"
                note="Это не лимит, а счётчик: каждое применение уменьшает его на единицу, а если счёт так и не выставился — возвращает обратно. Ноль означает, что код больше не сработает."
            >
                <Field
                    label="Осталось применений"
                    hint={isNew ? 'Поставьте столько, сколько покупок готовы отдать со скидкой.' : usesLeftTitle(promo)}
                    error={showError('totalNumberUses')}
                    required
                >
                    <Input
                        type="number"
                        min="0"
                        value={draft.totalNumberUses}
                        invalid={Boolean(showError('totalNumberUses'))}
                        onChange={set('totalNumberUses')}
                    />
                </Field>
            </InspectorSection>

            {isNew ? null : (
                <InspectorSection
                    title="Как пользовались"
                    note="Считается с того дня, как появился учёт применений. Более ранние покупки в статистику не попали."
                >
                    <InspectorRows
                        items={[
                            {label: 'Применений', value: usageTitle(summary)},
                            summary?.used ? {label: 'Отдано скидками', value: moneyTitle(summary.discount)} : null,
                            summary?.used ? {label: 'Выручка по коду', value: moneyTitle(summary.revenue)} : null,
                            summary?.used ? {label: 'Средняя скидка', value: moneyTitle(summary.averageDiscount)} : null,
                            summary?.used ? {label: 'Первое', value: dayTitle(summary.firstAt)} : null,
                            summary?.used ? {label: 'Последнее', value: dayTitle(summary.lastAt)} : null
                        ]}
                    />

                    {usage.error ? <Note tone="warning">Статистику получить не вышло</Note> : null}
                </InspectorSection>
            )}

            <InspectorSection title="Лимит на покупателя">
                <Note tone="warning">
                    Сервер это поле не проверяет: значение сохранится, но один и тот же покупатель
                    применит код столько раз, сколько осталось применений. Ограничение появится
                    вместе с учётом использований.
                </Note>

                <Field
                    label="Применений на покупателя"
                    hint="Пока справочно."
                    error={showError('personalNumberUses')}
                >
                    <Input
                        type="number"
                        min="0"
                        value={draft.personalNumberUses}
                        invalid={Boolean(showError('personalNumberUses'))}
                        onChange={set('personalNumberUses')}
                    />
                </Field>
            </InspectorSection>
        </Inspector>
    );
}
