import React, {useMemo, useState} from 'react';
import TabPane from '../../Elements/WorkTabs/TabPane';
import f, {Group, Row, Sheet} from '../../Elements/FormLayout/FormLayout';
import s from './InfoBlock.module.scss';
import useData from '../../useData';
import {useServer} from './useServer';
import {useFeedback} from '../../Elements/Feedback/Feedback';

/**
 * Форма акции в разделе «ещё»: одна вкладка и на создание, и на редактирование.
 *
 * Заменила попап CreateInfoBlock, в котором было два бага: заголовок окна гласил
 * «Создать промокод» (скопирован из соседнего раздела), а список после создания
 * не обновлялся — компонент принимал проп setBlockList, но внутри читал setPromoList,
 * то есть всегда undefined.
 *
 * Правки блока раньше не было вовсе: опечатку в заголовке или ссылке лечили
 * удалением и созданием заново.
 */
const InfoBlockForm = ({blockId, findBlock, onClose, onSaved}) => {
    const isNew = blockId === -1;

    const {authenticationData} = useData();
    const {createInfoBlock, updateInfoBlock, deleteInfoBlock} = useServer();
    const {showToast, confirm} = useFeedback();

    const source = useMemo(() => (isNew ? null : findBlock(blockId)), [isNew, findBlock, blockId]);

    const initial = useMemo(() => ({
        name: String(source?.name ?? ''),
        body: String(source?.body ?? ''),
        path: String(source?.path ?? ''),
    }), [source]);

    const [values, setValues] = useState(initial);
    const [saving, setSaving] = useState(false);

    const handleChange = (key, value) => setValues((prev) => ({...prev, [key]: value}));

    const changed = useMemo(() => {
        const result = {};
        Object.keys(initial).forEach((key) => {
            if (values[key].trim() !== initial[key].trim()) result[key] = values[key];
        });
        return result;
    }, [values, initial]);

    const hasChanges = Object.keys(changed).length > 0;

    const buildPayload = () => {
        const name = values.name.trim();
        if (!name) {
            showToast('Без заголовка блок будет пустой строкой в списке — заполните поле', 'error');
            return null;
        }

        const path = values.path.trim();
        // Ссылку витрина отдаёт в window.open как есть: без схемы браузер откроет её
        // как относительный путь внутри витрины, а не как внешний сайт
        if (path && !/^https?:\/\//i.test(path)) {
            showToast('Ссылка должна начинаться с http:// или https://', 'error');
            return null;
        }

        return {name, body: values.body.trim(), path};
    };

    const handleSave = async () => {
        const payload = buildPayload();
        if (!payload) return;

        setSaving(true);
        try {
            if (isNew) {
                await createInfoBlock(authenticationData, payload);
                showToast(`Блок «${payload.name}» создан`, 'success');
            } else {
                const updateData = {};
                Object.keys(changed).forEach((key) => { updateData[key] = payload[key]; });

                await updateInfoBlock(authenticationData, blockId, updateData);
                showToast('Блок сохранён', 'success');
            }

            onSaved?.();
            onClose();
        } catch (error) {
            showToast(error.message || 'Не удалось сохранить блок', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        const agreed = await confirm({
            title: 'Удалить блок?',
            text: `«${source?.name || blockId}» сразу пропадёт из раздела «ещё» у покупателей. Действие необратимо.`,
            confirmLabel: 'Удалить',
            danger: true,
        });
        if (!agreed) return;

        setSaving(true);
        try {
            await deleteInfoBlock(authenticationData, blockId);
            showToast('Блок удалён', 'success');
            onSaved?.();
            onClose();
        } catch (error) {
            showToast(error.message || 'Не удалось удалить блок', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (!isNew && !source) {
        return (
            <TabPane narrow>
                <p className={s['formNote']}>Блок не найден — возможно, его удалили.</p>
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
                            ? 'Новый блок'
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
                <Group title="Содержимое">
                    <Row label="Заголовок" hint="Первая строка блока в разделе «ещё»" wide>
                        <input className={f.input} type="text"
                               placeholder="Скидка 20% на подписки"
                               value={values.name}
                               onChange={(event) => handleChange('name', event.target.value)}/>
                    </Row>
                    <Row label="Описание" hint="Вторая строка, под заголовком. Можно оставить пустым" top wide>
                        <textarea className={`${f.input} ${f.textarea}`} rows={4}
                                  placeholder="Коротко о том, что за акция"
                                  value={values.body}
                                  onChange={(event) => handleChange('body', event.target.value)}/>
                    </Row>
                    <Row label="Ссылка"
                         hint="Куда ведёт нажатие на блок. Пусто — блок останется некликабельным" wide>
                        <input className={`${f.input} ${f.mono}`} type="text"
                               placeholder="https://t.me/gwstore_admin"
                               value={values.path}
                               onChange={(event) => handleChange('path', event.target.value)}/>
                    </Row>
                </Group>

                {!isNew ? (
                    <Group title="Служебное">
                        <Row label="ID">
                            <span className={s['formValue']}>{blockId}</span>
                        </Row>
                    </Group>
                ) : null}
            </Sheet>
        </TabPane>
    );
};

export default InfoBlockForm;
