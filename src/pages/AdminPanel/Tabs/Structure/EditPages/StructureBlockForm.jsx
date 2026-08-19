import React, {useMemo, useState} from 'react';
import f, {Group, Row, Sheet} from '../../../Elements/FormLayout/FormLayout';
import s from './StructurePanel.module.scss';
import {
    kindsFor, kindByKey, LINK_TARGETS, toBlockPayload, toFormValues,
} from './structureKinds';

/**
 * Форма блока витрины — одна на карусель и на основное содержимое, на создание и на правку.
 *
 * Заменила CreateHead, CreateBody и EditDataCatalog. Они делали одно и то же тремя разными
 * способами: два создавали блок через вложенный виджет выбора (AP_CreateNewCatalog),
 * третий правил его же обычными полями, и наборы полей у них разошлись — например,
 * при создании элемента карусели можно было задать закругления, а при правке баннера
 * тела нельзя было поменять иконку.
 *
 * Какие поля показывать, решает описание вида блока (structureKinds.js), а не набор
 * ветвлений в разметке.
 */
const StructureBlockForm = ({group, item, structurePageId, nextSerialNumber, onSubmit, onCancel}) => {
    const isNew = !item;

    const [values, setValues] = useState(() => (item
        ? toFormValues(item, group)
        : {...toFormValues(null, group), serialNumber: nextSerialNumber ?? 0}));
    const [saving, setSaving] = useState(false);

    const kinds = kindsFor(group);
    const kind = kindByKey(group, values.kind);
    const fields = kind.fields;

    const change = (key, value) => setValues((prev) => ({...prev, [key]: value}));

    const targetOption = useMemo(
        () => LINK_TARGETS.find((target) => target.key === values.linkTarget) || LINK_TARGETS[0],
        [values.linkTarget],
    );

    const handleSubmit = async () => {
        setSaving(true);
        try {
            await onSubmit(toBlockPayload(values, {
                group,
                // Страницу указываем только при создании: у существующего блока
                // её менять нельзя — это переезд между страницами, а не правка
                structurePageId: isNew ? structurePageId : undefined,
            }));
        } finally {
            setSaving(false);
        }
    };

    const readFile = async (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    return (
        <div className={s['form']}>
            <div className={s['formHead']}>
                <span className={s['formTitle']}>
                    {isNew ? 'Новый блок' : 'Блок'} · {group === 'head' ? 'карусель' : 'основное содержимое'}
                </span>
            </div>

            <div className={s['formBody']}>
                <Sheet>
                    <Group title="Вид блока">
                        <Row label="Что это" hint={kind.hint} wide>
                            <div className={s['kindGrid']}>
                                {kinds.map((option) => (
                                    <button key={option.key} type="button"
                                            className={`${s['kindBtn']} ${values.kind === option.key ? s['kindBtnActive'] : ''}`}
                                            onClick={() => change('kind', option.key)}>
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </Row>

                        {fields.link ? (
                            <>
                                <Row label="Ведёт на" hint="Куда попадёт покупатель по клику">
                                    <select className={`${f.input} ${f.select}`} value={values.linkTarget}
                                            onChange={(event) => change('linkTarget', event.target.value)}>
                                        {LINK_TARGETS.map((target) => (
                                            <option key={target.key} value={target.key}>{target.label}</option>
                                        ))}
                                    </select>
                                </Row>
                                <Row label={targetOption.valueLabel} wide>
                                    <input className={`${f.input} ${f.mono}`} type="text" value={values.linkValue}
                                           onChange={(event) => change('linkValue', event.target.value)}/>
                                </Row>
                            </>
                        ) : null}

                        {fields.name ? (
                            <Row label="Название" hint="Подпись плитки в витрине" wide>
                                <input className={f.input} type="text" value={values.name}
                                       onChange={(event) => change('name', event.target.value)}/>
                            </Row>
                        ) : null}

                        {fields.catalogPath ? (
                            <Row label="Путь каталога" hint="Путь категории, товары которой покажет блок" wide>
                                <input className={`${f.input} ${f.mono}`} type="text" value={values.path}
                                       onChange={(event) => change('path', event.target.value)}/>
                            </Row>
                        ) : null}
                    </Group>

                    <Group title="Оформление">
                        {fields.image ? (
                            <Row label="Изображение" hint="Прямая ссылка на картинку" top wide>
                                <div className={s['imageField']}>
                                    <input className={`${f.input} ${f.mono}`} type="text" value={values.url}
                                           placeholder="https://…"
                                           onChange={(event) => change('url', event.target.value)}/>
                                    {values.url ? (
                                        <img className={s['imagePreview']} src={values.url} alt=""/>
                                    ) : null}
                                </div>
                            </Row>
                        ) : null}

                        {fields.icon ? (
                            <Row label="Иконка" hint="Показывается на плитке каталога" top wide>
                                <div className={s['iconField']}>
                                    {values.imageIcon ? (
                                        <img className={s['iconPreview']} src={values.imageIcon} alt=""/>
                                    ) : (
                                        <span className={s['iconEmpty']}>нет</span>
                                    )}
                                    <label className={s['uploadBtn']}>
                                        Загрузить
                                        <input type="file" accept="image/*" hidden
                                               onChange={async (event) => {
                                                   const file = event.target.files?.[0];
                                                   if (!file) return;
                                                   change('imageIcon', await readFile(file));
                                                   event.target.value = '';
                                               }}/>
                                    </label>
                                    {values.imageIcon ? (
                                        <button type="button" className={s['ghostBtn']}
                                                onClick={() => change('imageIcon', '')}>
                                            Убрать
                                        </button>
                                    ) : null}
                                </div>
                            </Row>
                        ) : null}

                        {fields.color ? (
                            <Row label="Цвет фона" hint="Пусто — без заливки">
                                <div className={s['colorField']}>
                                    <input type="color" className={s['colorPicker']}
                                           value={/^#[0-9a-f]{6}$/i.test(values.backgroundColor) ? values.backgroundColor : '#000000'}
                                           onChange={(event) => change('backgroundColor', event.target.value)}/>
                                    <input className={`${f.input} ${f.mono}`} type="text" value={values.backgroundColor}
                                           placeholder="#1c2230"
                                           onChange={(event) => change('backgroundColor', event.target.value)}/>
                                    {values.backgroundColor ? (
                                        <button type="button" className={s['ghostBtn']}
                                                onClick={() => change('backgroundColor', '')}>
                                            Убрать
                                        </button>
                                    ) : null}
                                </div>
                            </Row>
                        ) : null}

                        <Row label="Скругления" wide>
                            <div className={f.checkGrid}>
                                <label className={f.checkRow}>
                                    <input type="checkbox" checked={values.isRoundedBorderTop}
                                           onChange={(event) => change('isRoundedBorderTop', event.target.checked)}/>
                                    <span>Сверху</span>
                                </label>
                                <label className={f.checkRow}>
                                    <input type="checkbox" checked={values.isRoundedBorderBottom}
                                           onChange={(event) => change('isRoundedBorderBottom', event.target.checked)}/>
                                    <span>Снизу</span>
                                </label>
                            </div>
                        </Row>
                    </Group>

                    <Group title="Порядок">
                        <Row label="Позиция" hint="Меньше — выше в списке. Порядок удобнее менять стрелками в списке">
                            <input className={f.input} type="number" value={values.serialNumber}
                                   onChange={(event) => change('serialNumber', Number(event.target.value) || 0)}/>
                        </Row>

                        {fields.deleteDate ? (
                            <Row label="Дата удаления"
                                 hint="Поле сохраняется, но витрина его сейчас не читает — осталось с прежней механики акций">
                                <input className={f.input} type="number" value={values.deleteDate}
                                       onChange={(event) => change('deleteDate', event.target.value)}/>
                            </Row>
                        ) : null}
                    </Group>
                </Sheet>
            </div>

            <div className={s['formFooter']}>
                <button type="button" className={s['btn']} onClick={onCancel} disabled={saving}>Отмена</button>
                <button type="button" className={`${s['btn']} ${s['btnPrimary']}`}
                        onClick={handleSubmit} disabled={saving}>
                    {saving ? 'Сохранение…' : (isNew ? 'Создать' : 'Сохранить')}
                </button>
            </div>
        </div>
    );
};

export default StructureBlockForm;
