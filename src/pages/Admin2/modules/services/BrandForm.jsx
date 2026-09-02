import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Button, ButtonRow, Field, Input, Note, Toggle} from '../../ui';
import {useMutation} from '../../platform/useMutation';
import {keys} from '../../platform/resources';
import {askConfirm, toastFail} from '../../platform/notify';
import {deleteBrand, updateBrand} from './api';
import {ICON_SIZE, shrinkImage} from './icon';
import style from './ServicesScreen.module.scss';

const FIELDS = ['name', 'glyph', 'accent', 'activationNote', 'deliveryNote', 'groupLabel', 'serialNumber', 'icon'];

const toDraft = (brand) => ({
    name: brand.name || '',
    glyph: brand.glyph || '',
    accent: brand.accent || '',
    activationNote: brand.activationNote || '',
    deliveryNote: brand.deliveryNote || '',
    groupLabel: brand.groupLabel || '',
    serialNumber: String(brand.serialNumber ?? 0),
    icon: brand.icon || '',
    isHidden: Boolean(brand.isHidden),
});

export default function BrandForm({brand}) {
    const navigate = useNavigate();
    const [draft, setDraft] = useState(() => toDraft(brand));

    useEffect(() => {
        setDraft(toDraft(brand));
    }, [brand]);

    const save = useMutation(updateBrand, {invalidates: [keys.services], done: 'Бренд сохранён'});
    const remove = useMutation(deleteBrand, {
        invalidates: [keys.services],
        done: 'Бренд удалён',
        onDone: () => navigate('/admin2/services'),
    });

    const dirty = useMemo(() => {
        const base = toDraft(brand);
        return FIELDS.some((field) => base[field] !== draft[field]) || base.isHidden !== draft.isHidden;
    }, [brand, draft]);

    const set = useCallback((field, value) => setDraft((current) => ({...current, [field]: value})), []);

    const onIcon = useCallback(async (file) => {
        if (!file) return;

        try {
            const dataUrl = await shrinkImage(file);
            set('icon', dataUrl);
        } catch (error) {
            toastFail('Иконка не загрузилась', error.message);
        }
    }, [set]);

    const onSave = useCallback(() => {
        save.run({
            brandId: brand.id,
            updateData: {
                name: draft.name.trim(),
                glyph: draft.glyph.trim() || '🎁',
                accent: draft.accent.trim() || null,
                activationNote: draft.activationNote.trim() || null,
                deliveryNote: draft.deliveryNote.trim() || null,
                groupLabel: draft.groupLabel.trim() || null,
                serialNumber: Number(draft.serialNumber) || 0,
                icon: draft.icon || null,
                isHidden: draft.isHidden,
            },
        });
    }, [save, brand.id, draft]);

    const onRemove = useCallback(async () => {
        const answer = await askConfirm({
            title: `Удалить бренд «${brand.name}»?`,
            text: 'Вместе с брендом уйдут его предложения и весь их склад кодов.',
            consequence: 'Действие необратимо. Если под неоплаченные заказы забронированы коды, сервер откажет.',
            confirmText: 'Удалить',
            tone: 'danger',
        });

        if (answer) remove.run(brand.id);
    }, [brand, remove]);

    return (
        <div className={style.form}>
            <div className={style.formGrid}>
                <Field label="Название" required>
                    <Input value={draft.name} onChange={(event) => set('name', event.target.value)}/>
                </Field>

                <Field label="Глиф" hint="Эмодзи или буква, когда иконки нет">
                    <Input value={draft.glyph} onChange={(event) => set('glyph', event.target.value)}/>
                </Field>

                <Field label="Акцент" hint="Цвет карточки на витрине, hex вида #4f8cff">
                    <Input value={draft.accent} onChange={(event) => set('accent', event.target.value)} mono/>
                </Field>

                <Field label="Подпись уровня" hint="«Тариф» у Spotify, «Уровень» у PS Plus">
                    <Input value={draft.groupLabel} onChange={(event) => set('groupLabel', event.target.value)}/>
                </Field>

                <Field label="Подпись активации">
                    <Input value={draft.activationNote} onChange={(event) => set('activationNote', event.target.value)}/>
                </Field>

                <Field label="Подпись доставки" hint="Для позиций, которые оформляет менеджер">
                    <Input value={draft.deliveryNote} onChange={(event) => set('deliveryNote', event.target.value)}/>
                </Field>

                <Field label="Порядок на витрине">
                    <Input
                        value={draft.serialNumber}
                        inputMode="numeric"
                        onChange={(event) => set('serialNumber', event.target.value)}
                    />
                </Field>
            </div>

            <div className={style.iconRow}>
                {draft.icon
                    ? <img className={style.iconPreview} src={draft.icon} alt=""/>
                    : <span className={style.iconEmpty}>{draft.glyph || '🎁'}</span>}

                <div className={style.iconActions}>
                    <label className={style.upload}>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(event) => onIcon(event.target.files?.[0])}
                        />
                        <span>Загрузить иконку</span>
                    </label>
                    {draft.icon ? (
                        <Button size="s" variant="ghost" onClick={() => set('icon', '')}>Убрать</Button>
                    ) : null}
                    <span className={style.uploadNote}>Картинка ужимается до {ICON_SIZE} px и хранится в базе.</span>
                </div>
            </div>

            <Toggle
                checked={draft.isHidden}
                onChange={(next) => set('isHidden', next)}
                label="Скрыт с витрины"
            />

            <Note>
                Пока бренд скрыт, покупатели его не видят — удобно собрать тарифы и склад, а показать одним движением.
            </Note>

            <ButtonRow>
                <Button variant="primary" disabled={!dirty || !draft.name.trim()} loading={save.loading} onClick={onSave}>
                    Сохранить
                </Button>
                <Button variant="ghost" disabled={!dirty} onClick={() => setDraft(toDraft(brand))}>
                    Отменить правки
                </Button>
                <Button variant="danger" loading={remove.loading} onClick={onRemove}>Удалить бренд</Button>
            </ButtonRow>
        </div>
    );
}
