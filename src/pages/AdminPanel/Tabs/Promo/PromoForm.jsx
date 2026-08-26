import React, {useMemo, useState} from 'react';
import TabPane from '../../Elements/WorkTabs/TabPane';
import f, {Group, Row, Sheet} from '../../Elements/FormLayout/FormLayout';
import s from './Promo.module.scss';
import useData from '../../useData';
import {useServer} from './useServer';
import {useFeedback} from '../../Elements/Feedback/Feedback';

/**
 * Форма промокода: одна вкладка и на создание, и на редактирование.
 *
 * Заменила попап CreatePromo, у которого не было ни редактирования, ни проверок:
 * `Number(e.target.value)` на пустом поле давал NaN, и в базу уезжал промокод
 * с нулевым процентом, который «работает», но ничего не скидывает.
 *
 * Семантика счётчиков взята из services/orders/promoService.js:
 *  - totalNumberUses — ОСТАТОК использований, при оплате он декрементируется;
 *    при значении 0 промокод считается исчерпанным и скидку не даёт;
 *  - personalNumberUses — задел на лимит для одного пользователя, сейчас сервером
 *    не проверяется, поэтому в подписи честно сказано, что поле пока справочное.
 */

// Пустое поле счётчика = 0. Отдельного «без ограничения» у модели нет: сервер сравнивает
// остаток с нулём, поэтому 0 означает «исчерпан», а не «безлимит».
const parseCount = (raw) => {
    const text = String(raw).trim();
    if (!text) return 0;

    const value = Number(text);
    if (!Number.isFinite(value) || !Number.isInteger(value) || value < 0) return null;

    return value;
};

const PromoForm = ({promoId, findPromo, onClose, onSaved}) => {
    const isNew = promoId === -1;

    const {authenticationData} = useData();
    const {createPromo, updatePromo, deletePromo} = useServer();
    const {showToast, confirm} = useFeedback();

    const source = useMemo(() => (isNew ? null : findPromo(promoId)), [isNew, findPromo, promoId]);

    // Значения храним строками: числовой input умеет быть пустым, и приведение к Number
    // прямо в onChange превращало бы промежуточное пустое поле в NaN
    const initial = useMemo(() => ({
        name: String(source?.name ?? ''),
        percent: source?.percent === undefined || source?.percent === null ? '' : String(source.percent),
        totalNumberUses: String(source?.totalNumberUses ?? 0),
        personalNumberUses: String(source?.personalNumberUses ?? 0),
    }), [source]);

    const [values, setValues] = useState(initial);
    const [saving, setSaving] = useState(false);

    const handleChange = (key, value) => setValues((prev) => ({...prev, [key]: value}));

    const changed = useMemo(() => {
        const result = {};
        Object.keys(initial).forEach((key) => {
            if (String(values[key]).trim() !== String(initial[key]).trim()) result[key] = values[key];
        });
        return result;
    }, [values, initial]);

    const hasChanges = Object.keys(changed).length > 0;

    // Возвращает готовый payload или null, показав причину отказа
    const buildPayload = () => {
        const name = values.name.trim().toUpperCase();
        if (!name) {
            showToast('Без названия промокод нечего вводить в корзине — заполните поле', 'error');
            return null;
        }

        const percentText = values.percent.trim();
        const percent = Number(percentText);
        if (!percentText || !Number.isInteger(percent) || percent < 1 || percent > 100) {
            showToast('Процент скидки — целое число от 1 до 100', 'error');
            return null;
        }

        const totalNumberUses = parseCount(values.totalNumberUses);
        if (totalNumberUses === null) {
            showToast('Общее кол-во использований — целое число не меньше нуля', 'error');
            return null;
        }

        const personalNumberUses = parseCount(values.personalNumberUses);
        if (personalNumberUses === null) {
            showToast('Личное кол-во использований — целое число не меньше нуля', 'error');
            return null;
        }

        return {name, percent, totalNumberUses, personalNumberUses};
    };

    const handleSave = async () => {
        const payload = buildPayload();
        if (!payload) return;

        setSaving(true);
        try {
            if (isNew) {
                await createPromo(authenticationData, payload);
                showToast(`Промокод «${payload.name}» создан`, 'success');
            } else {
                // Шлём только изменённые поля: чужие правки того же промокода не затираются
                const updateData = {};
                Object.keys(changed).forEach((key) => { updateData[key] = payload[key]; });

                await updatePromo(authenticationData, promoId, updateData);
                showToast('Промокод сохранён', 'success');
            }

            // Перезагрузку списка делает вызвавший экран — второй запрос здесь лишний
            onSaved?.();
            onClose();
        } catch (error) {
            showToast(error.message || 'Не удалось сохранить промокод', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        const agreed = await confirm({
            title: 'Удалить промокод?',
            text: `«${source?.name || promoId}» перестанет действовать сразу: покупатели с этим кодом в корзине потеряют скидку. Действие необратимо.`,
            confirmLabel: 'Удалить',
            danger: true,
        });
        if (!agreed) return;

        setSaving(true);
        try {
            await deletePromo(authenticationData, promoId);
            showToast('Промокод удалён', 'success');
            onSaved?.();
            onClose();
        } catch (error) {
            showToast(error.message || 'Не удалось удалить промокод', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (!isNew && !source) {
        return (
            <TabPane narrow>
                <p className={s['formNote']}>Промокод не найден — возможно, его удалили.</p>
            </TabPane>
        );
    }

    return (
        <TabPane
            narrow
            footer={(
                <>
                    <span className={s['formStatus']}>
                        {isNew
                            ? 'Новый промокод'
                            : (hasChanges ? `Изменено полей: ${Object.keys(changed).length}` : 'Изменений нет')}
                    </span>
                    {!isNew ? (
                        <button type="button" className={`${s['btn']} ${s['btnDanger']}`}
                                disabled={saving} onClick={handleDelete}>
                            Удалить
                        </button>
                    ) : null}
                    <button type="button" className={s['btn']} onClick={onClose}>Отмена</button>
                    <button type="button" className={`${s['btn']} ${s['btnPrimary']}`}
                            disabled={saving || (!isNew && !hasChanges)}
                            onClick={handleSave}>
                        {saving ? 'Сохранение…' : (isNew ? 'Создать' : 'Сохранить')}
                    </button>
                </>
            )}
        >
            <Sheet>
                <Group title="Основное">
                    <Row label="Название" hint="Его покупатель вводит в корзине; сохраняется в верхнем регистре">
                        <input className={`${f.input} ${f.mono}`} type="text"
                               placeholder="NEWPROMO2025"
                               value={values.name}
                               onChange={(event) => handleChange('name', event.target.value.toUpperCase())}/>
                    </Row>
                    <Row label="Процент скидки" hint="Целое число от 1 до 100">
                        <input className={f.input} type="number" min={1} max={100} step={1}
                               placeholder="3"
                               value={values.percent}
                               onChange={(event) => handleChange('percent', event.target.value)}/>
                    </Row>
                </Group>

                <Group title="Лимиты">
                    <Row label="Общее кол-во использований"
                         hint="Остаток: каждая оплата уменьшает его на 1, при 0 промокод перестаёт действовать">
                        <input className={f.input} type="number" min={0} step={1}
                               placeholder="1000"
                               value={values.totalNumberUses}
                               onChange={(event) => handleChange('totalNumberUses', event.target.value)}/>
                    </Row>
                    <Row label="Личное кол-во использований на пользователя"
                         hint="0 — без ограничения. Сервер это поле пока не проверяет">
                        <input className={f.input} type="number" min={0} step={1}
                               placeholder="0"
                               value={values.personalNumberUses}
                               onChange={(event) => handleChange('personalNumberUses', event.target.value)}/>
                    </Row>
                </Group>
            </Sheet>
        </TabPane>
    );
};

export default PromoForm;
