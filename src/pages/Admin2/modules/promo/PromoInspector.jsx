import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
    Badge,
    Button,
    ButtonRow,
    Field,
    Grid,
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
            text: 'Код перестанет давать скидку.',
            consequence: 'Восстановить не получится.',
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
            subtitle={isNew ? 'Заработает сразу после сохранения' : `Скидка ${draft.percent}%`}
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
            <InspectorSection title="Код и скидка">
                <Grid columns={2}>
                    <Field label="Код" hint="Латиница и цифры" error={showError('name')} required>
                        <Input
                            mono
                            value={draft.name}
                            invalid={Boolean(showError('name'))}
                            placeholder="SUMMER10"
                            onChange={set('name')}
                        />
                    </Field>

                    <Field label="Скидка, %" hint="На всю корзину" error={showError('percent')} required>
                        <Input
                            type="number"
                            min="1"
                            max="100"
                            value={draft.percent}
                            invalid={Boolean(showError('percent'))}
                            onChange={set('percent')}
                        />
                    </Field>
                </Grid>
            </InspectorSection>

            <InspectorSection title="Лимиты">
                <Grid columns={2}>
                    <Field
                        label="Осталось применений"
                        hint="0 — код не работает"
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

                    <Field
                        label="На одного покупателя"
                        hint="0 — без ограничений"
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
                </Grid>
            </InspectorSection>

            {isNew ? null : (
                <InspectorSection title="Статистика">
                    <InspectorRows
                        items={[
                            {label: 'Применений', value: usageTitle(summary)},
                            summary?.used ? {label: 'Скидок на', value: moneyTitle(summary.discount)} : null,
                            summary?.used ? {label: 'Выручка', value: moneyTitle(summary.revenue)} : null,
                            summary?.used ? {label: 'Средняя скидка', value: moneyTitle(summary.averageDiscount)} : null,
                            summary?.used ? {label: 'Первое', value: dayTitle(summary.firstAt)} : null,
                            summary?.used ? {label: 'Последнее', value: dayTitle(summary.lastAt)} : null
                        ]}
                    />

                    {usage.error ? <Note tone="warning">Статистику получить не вышло</Note> : null}
                </InspectorSection>
            )}
        </Inspector>
    );
}
