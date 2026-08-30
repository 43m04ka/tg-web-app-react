import React, {useMemo, useState} from 'react';
import TabPane from '../../Elements/WorkTabs/TabPane';
import f, {Group, Row, Sheet} from '../../Elements/FormLayout/FormLayout';
import useData from '../../useData';
import {useFeedback} from '../../Elements/Feedback/Feedback';
import {useServer} from './useServer';
import CodeStock from './CodeStock';
import {KIND_OPTIONS, parsePrice} from './serviceModel';
import s from './Services.module.scss';

const OfferForm = ({offerId, brandId, findOffer, onClose, onSaved}) => {
    const isNew = offerId === -1;

    const {authenticationData} = useData();
    const {createOffer, updateOffer, deleteOffer} = useServer();
    const {showToast, confirm} = useFeedback();

    const source = useMemo(() => (isNew ? null : findOffer(offerId)), [isNew, findOffer, offerId]);

    const initial = useMemo(() => ({
        kind: String(source?.kind ?? 'gift_card'),
        regionName: String(source?.regionName ?? 'Россия'),
        regionFlag: String(source?.regionFlag ?? ''),
        denomination: String(source?.denomination ?? ''),
        price: source?.price === undefined || source?.price === null ? '' : String(source.price),
        oldPrice: source?.oldPrice === undefined || source?.oldPrice === null ? '' : String(source.oldPrice),
        serialNumber: String(source?.serialNumber ?? 0),
        isHidden: Boolean(source?.isHidden),
    }), [source]);

    const [values, setValues] = useState(initial);
    const [saving, setSaving] = useState(false);

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
        const denomination = values.denomination.trim();
        if (!denomination) {
            showToast('Номинал — это то, что покупатель выбирает в списке. Заполните поле', 'error');
            return null;
        }

        const regionName = values.regionName.trim();
        if (!regionName) {
            showToast('Регион обязателен — он же попадает в строку активации', 'error');
            return null;
        }

        const price = parsePrice(values.price);
        if (price === null || price <= 0) {
            showToast('Цена за один код — целое число больше нуля', 'error');
            return null;
        }

        const oldPriceText = String(values.oldPrice).trim();
        const oldPrice = oldPriceText ? parsePrice(oldPriceText) : null;
        if (oldPriceText && oldPrice === null) {
            showToast('Старая цена — целое число не меньше нуля либо пусто', 'error');
            return null;
        }

        const serialNumber = Number(String(values.serialNumber).trim() || 0);
        if (!Number.isInteger(serialNumber) || serialNumber < 0) {
            showToast('Порядок — целое число не меньше нуля', 'error');
            return null;
        }

        return {
            kind: values.kind,
            regionName,
            regionFlag: values.regionFlag.trim() || null,
            denomination,
            price,
            oldPrice,
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
                await createOffer(authenticationData, {...payload, brandId});
                showToast(`Номинал «${payload.denomination}» создан`, 'success');
            } else {
                const updateData = {};
                Object.keys(changed).forEach((key) => { updateData[key] = payload[key]; });

                await updateOffer(authenticationData, offerId, updateData);
                showToast('Номинал сохранён', 'success');
            }

            onSaved?.();
            onClose();
        } catch (error) {
            showToast(error.message || 'Не удалось сохранить номинал', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        const stock = source?.stock;

        const agreed = await confirm({
            title: 'Удалить номинал?',
            text: `«${source?.denomination || offerId}» исчезнет с витрины вместе со складом`
                + `${stock ? ` (${stock.available} свободных, ${stock.sold} проданных)` : ''}.`
                + ' Действие необратимо.',
            confirmLabel: 'Удалить',
            danger: true,
        });
        if (!agreed) return;

        setSaving(true);
        try {
            await deleteOffer(authenticationData, offerId);
            showToast('Номинал удалён', 'success');
            onSaved?.();
            onClose();
        } catch (error) {
            showToast(error.message || 'Не удалось удалить номинал', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (!isNew && !source) {
        return (
            <TabPane narrow>
                <p className={s['formNote']}>Номинал не найден — возможно, его удалили.</p>
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
                            ? 'Новый номинал'
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
                <Group title="Товар">
                    <Row label="Тип" hint="Селектор «Тип товара» на витрине">
                        <select className={f.input} value={values.kind}
                                onChange={(event) => handleChange('kind', event.target.value)}>
                            {KIND_OPTIONS.map((option) => (
                                <option key={option.key} value={option.key}>{option.name}</option>
                            ))}
                        </select>
                    </Row>
                    <Row label="Номинал" hint="Как покупатель видит его в списке: «1 000 ₸», «1 месяц»">
                        <input className={f.input} type="text" placeholder="1 000 ₸"
                               value={values.denomination}
                               onChange={(event) => handleChange('denomination', event.target.value)}/>
                    </Row>
                    <Row label="Регион" hint="Попадает и в переключатель региона, и в строку активации">
                        <input className={f.input} type="text" placeholder="Казахстан"
                               value={values.regionName}
                               onChange={(event) => handleChange('regionName', event.target.value)}/>
                    </Row>
                    <Row label="Флаг" hint="Эмодзи флага рядом с названием региона">
                        <input className={`${f.input} ${f.mono}`} type="text" maxLength={4} placeholder="🇰🇿"
                               value={values.regionFlag}
                               onChange={(event) => handleChange('regionFlag', event.target.value)}/>
                    </Row>
                </Group>

                <Group title="Цена">
                    <Row label="Цена за код" hint="Рубли, целое число. Именно её платит покупатель за один код">
                        <input className={f.input} type="number" min={1} step={1} placeholder="1490"
                               value={values.price}
                               onChange={(event) => handleChange('price', event.target.value)}/>
                    </Row>
                    <Row label="Старая цена" hint="Зачёркнутая цена для скидки. Пусто — скидки нет">
                        <input className={f.input} type="number" min={0} step={1} placeholder=""
                               value={values.oldPrice}
                               onChange={(event) => handleChange('oldPrice', event.target.value)}/>
                    </Row>
                </Group>

                <Group title="Витрина">
                    <Row label="Порядок" hint="Меньше — выше в списке номиналов">
                        <input className={f.input} type="number" min={0} step={1}
                               value={values.serialNumber}
                               onChange={(event) => handleChange('serialNumber', event.target.value)}/>
                    </Row>
                    <Row label="Скрыть с витрины" hint="Склад сохранится, но купить номинал будет нельзя">
                        <input type="checkbox"
                               checked={values.isHidden}
                               onChange={(event) => handleChange('isHidden', event.target.checked)}/>
                    </Row>
                </Group>

                {isNew ? (
                    <Group title="Склад кодов">
                        <p className={s['formNote']}>
                            Коды можно будет загрузить сразу после создания номинала — склад привязан к нему.
                        </p>
                    </Group>
                ) : (
                    <CodeStock offerId={offerId} onChanged={onSaved}/>
                )}
            </Sheet>
        </TabPane>
    );
};

export default OfferForm;
