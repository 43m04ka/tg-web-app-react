import React, {useState} from 'react';
import TabPane from '../../Elements/WorkTabs/TabPane';
import f, {Group, Row, Sheet} from '../../Elements/FormLayout/FormLayout';
import s from './Search.module.scss';
import useData from '../../useData';
import useGlobalData from '../../legacy/useGlobalData';
import {useServer} from './useServer';
import {useFeedback} from '../../Elements/Feedback/Feedback';

/**
 * Подсказка в поиске: текст и страница, на которой она показывается.
 *
 * Заменила попап «Создать подсказку». Заодно закрыты две дыры прежнего экрана:
 *  - редактирования не было вовсе, опечатку чинили удалением и пересозданием;
 *  - удаление шло без подтверждения, одним кликом по строке таблицы.
 *
 * Вкладка живёт дольше рендера, в котором её открыли, поэтому внутрь передаются
 * только примитивы (id, стартовые значения) и стабильные колбэки.
 */
const ClueForm = ({clueId, initialName = '', initialPageId = null, onClose, onSaved}) => {
    const isNew = clueId === -1;

    const {pageList} = useGlobalData();
    const {authenticationData} = useData();
    const {createClue, updateClue, deleteClue} = useServer();
    const {showToast, confirm} = useFeedback();

    const [values, setValues] = useState(() => ({
        name: initialName,
        structurePageId: initialPageId ?? '',
    }));

    const [changed, setChanged] = useState({});
    const [saving, setSaving] = useState(false);

    const handleChange = (key, value) => {
        setValues((prev) => ({...prev, [key]: value}));
        setChanged((prev) => ({...prev, [key]: value}));
    };

    const hasChanges = Object.keys(changed).length > 0;
    const nameFilled = String(values.name || '').trim().length > 0;
    const pageFilled = values.structurePageId !== '' && values.structurePageId !== null;

    const handleSave = async () => {
        if (!nameFilled) {
            showToast('Пустая подсказка ничего не подскажет — введите текст', 'error');
            return;
        }
        if (!pageFilled) {
            showToast('Выберите страницу, на которой показывать подсказку', 'error');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                name: String(values.name).trim(),
                structurePageId: Number(values.structurePageId),
            };

            if (isNew) {
                // У новой записи нет значений, от которых отсчитать «что изменилось» —
                // шлём форму целиком
                await createClue(authenticationData, payload);
                showToast(`Подсказка «${payload.name}» создана`, 'success');
            } else {
                await updateClue(authenticationData, clueId, payload);
                showToast('Подсказка сохранена', 'success');
            }

            // Перезагрузку списка делает вызвавший экран — второй запрос здесь лишний
            onSaved?.();
            onClose();
        } catch (error) {
            showToast(error.message || 'Не удалось сохранить подсказку', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        const agreed = await confirm({
            title: 'Удалить подсказку?',
            text: `«${initialName || clueId}» пропадёт из поиска на витрине. Действие необратимо.`,
            confirmLabel: 'Удалить',
            danger: true,
        });
        if (!agreed) return;

        setSaving(true);
        try {
            await deleteClue(authenticationData, clueId);
            showToast('Подсказка удалена', 'success');
            onSaved?.();
            onClose();
        } catch (error) {
            showToast(error.message || 'Не удалось удалить подсказку', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <TabPane
            narrow
            footer={(
                <>
                    <span className={s['formStatus']}>
                        {isNew
                            ? 'Новая подсказка'
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
                        {saving ? 'Сохранение…' : 'Сохранить'}
                    </button>
                </>
            )}
        >
            <Sheet>
                <Group title="Подсказка">
                    <Row label="Текст" hint="Покупатель видит его в подсказках под строкой поиска" wide>
                        <input className={f.input} type="text" value={values.name}
                               onChange={(event) => handleChange('name', event.target.value)}/>
                    </Row>
                    <Row label="Страница" hint="Подсказка показывается только в поиске этой страницы">
                        <select className={`${f.input} ${f.select}`}
                                value={values.structurePageId}
                                onChange={(event) => handleChange('structurePageId', event.target.value)}>
                            <option value="">Не выбрана</option>
                            {(pageList || []).map((page) => (
                                <option key={page.id} value={page.id}>
                                    {page.name || `Страница ${page.id}`}
                                </option>
                            ))}
                        </select>
                    </Row>
                </Group>
            </Sheet>
        </TabPane>
    );
};

export default ClueForm;
