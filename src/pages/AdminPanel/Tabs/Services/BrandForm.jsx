import React, {useEffect, useMemo, useState} from 'react';
import TabPane from '../../Elements/WorkTabs/TabPane';
import f, {Group, Row, Sheet} from '../../Elements/FormLayout/FormLayout';
import useData from '../../useData';
import {useFeedback} from '../../Elements/Feedback/Feedback';
import ImageField from '../../Elements/ImageField/ImageField';
import AccentPicker from './AccentPicker';
import {useServer} from './useServer';
import {brandStock, KIND_OPTIONS} from './serviceModel';
import s from './Services.module.scss';

const BrandForm = ({brandId, findBrand, onClose, onSaved}) => {
    const isNew = brandId === -1;

    const {authenticationData} = useData();
    const {createBrand, updateBrand, deleteBrand, getCatalogs} = useServer();
    const {showToast, confirm} = useFeedback();

    const source = useMemo(() => (isNew ? null : findBrand(brandId)), [isNew, findBrand, brandId]);

    const initial = useMemo(() => ({
        name: String(source?.name ?? ''),
        icon: String(source?.icon ?? ''),
        glyph: String(source?.glyph ?? '🎁'),
        accent: String(source?.accent ?? ''),
        activationNote: String(source?.activationNote ?? ''),
        deliveryNote: String(source?.deliveryNote ?? ''),
        groupLabel: String(source?.groupLabel ?? ''),
        catalogId: source?.catalogId ? String(source.catalogId) : '',
        catalogKind: String(source?.catalogKind ?? 'subscription'),
        serialNumber: String(source?.serialNumber ?? 0),
        isHidden: Boolean(source?.isHidden),
    }), [source]);

    const [values, setValues] = useState(initial);
    const [saving, setSaving] = useState(false);
    const [catalogs, setCatalogs] = useState(null);

    useEffect(() => {
        let alive = true;

        getCatalogs()
            .then((list) => { if (alive) setCatalogs(list); })
            .catch(() => { if (alive) setCatalogs([]); });

        return () => { alive = false; };
    }, []);

    const linkedCatalog = useMemo(
        () => (catalogs || []).find((item) => String(item.id) === String(values.catalogId)) || null,
        [catalogs, values.catalogId],
    );

    const handleChange = (key, value) => setValues((prev) => ({...prev, [key]: value}));

    const changed = useMemo(() => {
        const result = {};
        Object.keys(initial).forEach((key) => {
            if (String(values[key]) !== String(initial[key])) result[key] = values[key];
        });
        return result;
    }, [values, initial]);

    const hasChanges = Object.keys(changed).length > 0;

    const buildPayload = () => {
        const name = values.name.trim();
        if (!name) {
            showToast('Без названия бренд не на что вешать — заполните поле', 'error');
            return null;
        }

        const serialNumber = Number(String(values.serialNumber).trim() || 0);
        if (!Number.isInteger(serialNumber) || serialNumber < 0) {
            showToast('Порядок — целое число не меньше нуля', 'error');
            return null;
        }

        return {
            name,
            icon: values.icon || null,
            glyph: values.glyph.trim() || '🎁',
            accent: values.accent.trim() || null,
            activationNote: values.activationNote.trim() || null,
            deliveryNote: values.deliveryNote.trim() || null,
            groupLabel: values.groupLabel.trim() || null,
            catalogId: values.catalogId ? Number(values.catalogId) : null,
            catalogKind: values.catalogKind,
            serialNumber,
            isHidden: Boolean(values.isHidden),
        };
    };

    const handleSave = async () => {
        const payload = buildPayload();
        if (!payload) return;

        setSaving(true);
        try {
            if (isNew) {
                await createBrand(authenticationData, payload);
                showToast(`Бренд «${payload.name}» создан`, 'success');
            } else {
                const updateData = {};
                Object.keys(changed).forEach((key) => { updateData[key] = payload[key]; });

                await updateBrand(authenticationData, brandId, updateData);
                showToast('Бренд сохранён', 'success');
            }

            onSaved?.();
            onClose();
        } catch (error) {
            showToast(error.message || 'Не удалось сохранить бренд', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        const stock = source ? brandStock(source) : null;
        const offers = source?.offers?.length || 0;

        const agreed = await confirm({
            title: 'Удалить бренд?',
            text: `«${source?.name || brandId}» исчезнет с витрины вместе с ${offers} номиналами`
                + `${stock ? ` и складом на ${stock.available} свободных кодов` : ''}.`
                + ' Проданные коды тоже удалятся, но состав заказов сохранится. Действие необратимо.',
            confirmLabel: 'Удалить',
            danger: true,
        });
        if (!agreed) return;

        setSaving(true);
        try {
            await deleteBrand(authenticationData, brandId);
            showToast('Бренд удалён', 'success');
            onSaved?.();
            onClose();
        } catch (error) {
            showToast(error.message || 'Не удалось удалить бренд', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (!isNew && !source) {
        return (
            <TabPane narrow>
                <p className={s['formNote']}>Бренд не найден — возможно, его удалили.</p>
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
                            ? 'Новый бренд'
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
                    <Row label="Название" hint="Подпись под плиткой бренда на витрине">
                        <input className={f.input} type="text" placeholder="Steam"
                               value={values.name}
                               onChange={(event) => handleChange('name', event.target.value)}/>
                    </Row>
                    <Row label="Иконка" hint="Картинка на плитке бренда. Ужимается до 192px, прозрачный PNG выглядит лучше всего">
                        <ImageField value={values.icon}
                                    onChange={(value) => handleChange('icon', value)}
                                    emptyText="Нет"/>
                    </Row>
                    <Row label="Символ" hint="Запасной вариант: показывается, пока иконка не загружена">
                        <input className={`${f.input} ${f.mono}`} type="text" maxLength={4} placeholder="🎮"
                               value={values.glyph}
                               onChange={(event) => handleChange('glyph', event.target.value)}/>
                    </Row>
                    <Row label="Акцент" hint="Цвет плитки бренда на витрине: готовый набор или своя oklch-строка">
                        <AccentPicker value={values.accent}
                                      onChange={(value) => handleChange('accent', value)}/>
                    </Row>
                </Group>

                <Group title="Каталог">
                    <p className={s['formNote']}>
                        Привязка к обычному каталогу заменяет ручное заведение позиций: товары каталога
                        сами становятся предложениями бренда. Ничего не копируется — правка карточки
                        в каталоге сразу видна на витрине. Колонка сетки выбора становится тарифом,
                        строка — номиналом. Такие позиции всегда оформляет менеджер.
                    </p>
                    <Row label="Каталог" hint="Пусто — бренд живёт только на своих позициях">
                        <select className={f.input} value={values.catalogId}
                                onChange={(event) => handleChange('catalogId', event.target.value)}>
                            <option value="">Без привязки</option>
                            {(catalogs || []).map((item) => (
                                <option key={item.id} value={item.id}>
                                    {[item.pageName, item.path].filter(Boolean).join(' · ')}
                                    {` — ${item.productCount} карточек`}
                                </option>
                            ))}
                        </select>
                    </Row>
                    {values.catalogId ? (
                        <Row label="Тип позиций" hint="Под каким типом товары каталога встанут на витрине">
                            <select className={f.input} value={values.catalogKind}
                                    onChange={(event) => handleChange('catalogKind', event.target.value)}>
                                {KIND_OPTIONS.map((option) => (
                                    <option key={option.key} value={option.key}>{option.name}</option>
                                ))}
                            </select>
                        </Row>
                    ) : null}
                    {values.catalogId && linkedCatalog && linkedCatalog.productCount === 0 ? (
                        <p className={s['formNote']}>
                            В этом каталоге нет ни одной видимой карточки в продаже — на витрине
                            от привязки ничего не появится.
                        </p>
                    ) : null}
                    {values.catalogId && catalogs && !linkedCatalog ? (
                        <p className={s['formNote']}>
                            Каталог с id {values.catalogId} не найден — возможно, его удалили.
                        </p>
                    ) : null}
                </Group>

                <Group title="Витрина">
                    <Row label="Активация" hint="Строка в блоке «Активация» на экране покупки">
                        <input className={f.input} type="text" placeholder="без VPN"
                               value={values.activationNote}
                               onChange={(event) => handleChange('activationNote', event.target.value)}/>
                    </Row>
                    <Row label="Доставка" hint="Что видит покупатель у позиций, которые оформляет менеджер">
                        <input className={f.input} type="text" placeholder="Оформит менеджер после оплаты"
                               value={values.deliveryNote}
                               onChange={(event) => handleChange('deliveryNote', event.target.value)}/>
                    </Row>
                    <Row label="Подпись тарифов" hint="Заголовок ряда тарифов на витрине. Пусто — «Тариф»">
                        <input className={f.input} type="text" placeholder="Тариф"
                               value={values.groupLabel}
                               onChange={(event) => handleChange('groupLabel', event.target.value)}/>
                    </Row>
                    <Row label="Порядок" hint="Меньше — левее в ряду брендов">
                        <input className={f.input} type="number" min={0} step={1}
                               value={values.serialNumber}
                               onChange={(event) => handleChange('serialNumber', event.target.value)}/>
                    </Row>
                    <Row label="Скрыть с витрины" hint="Бренд остаётся в админке, но покупатель его не видит">
                        <input type="checkbox"
                               checked={values.isHidden}
                               onChange={(event) => handleChange('isHidden', event.target.checked)}/>
                    </Row>
                </Group>
            </Sheet>
        </TabPane>
    );
};

export default BrandForm;
