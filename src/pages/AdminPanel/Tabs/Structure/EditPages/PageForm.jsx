import React, {useMemo, useState} from 'react';
import TabPane from '../../../Elements/WorkTabs/TabPane';
import f, {Group, Row, Sheet} from '../../../Elements/FormLayout/FormLayout';
import s from './EditPages.module.scss';
import useData from '../../../useData';
import useGlobalData from '../../../legacy/useGlobalData';
import {useServer} from '../useServer';
import {useFeedback} from '../../../Elements/Feedback/Feedback';
import {TYPE_OPTIONS, BOT_OPTIONS} from './pageOptions';

/**
 * Форма страницы витрины.
 *
 * Заменила попап: длинная форма в модальном окне не даёт держать открытыми несколько
 * страниц сразу и сверять их между собой (см. дизайн-систему, «Строка вкладок»).
 *
 * Здесь же закрыты две дыры прежней формы:
 *  - переключатель «Страница скрыта» писал поле isHide, которого у модели нет:
 *    Sequelize молча отбрасывал его, и скрыть страницу из формы было невозможно
 *    (в списке при этом читалось правильное isHidden);
 *  - botType — площадка, в которой страница показывается, — не редактировался нигде,
 *    хотя именно от него зависит, увидит ли её покупатель.
 */
const PageForm = ({pageId, onClose, onSaved}) => {
    const isNew = pageId === -1;

    const {pageList} = useGlobalData();
    const {authenticationData} = useData();
    const {createPage, updatePageData, deletePageData} = useServer();
    const {showToast, confirm} = useFeedback();

    const source = useMemo(
        () => (pageList || []).find((page) => page.id === pageId) || null,
        [pageList, pageId],
    );

    const [values, setValues] = useState(() => ({
        name: source?.name ?? '',
        link: source?.link ?? '',
        barIcon: source?.barIcon ?? '',
        type: source?.type ?? 'other',
        botType: source?.botType ?? 'tg',
        isHidden: source?.isHidden === 1 ? 1 : 0,
        serialNumber: source?.serialNumber ?? 0,
    }));

    const [changed, setChanged] = useState({});
    const [saving, setSaving] = useState(false);

    const handleChange = (key, value) => {
        setValues((prev) => ({...prev, [key]: value}));
        setChanged((prev) => ({...prev, [key]: value}));
    };

    const hasChanges = Object.keys(changed).length > 0;
    const nameFilled = String(values.name || '').trim().length > 0;

    const handleSave = async () => {
        if (!nameFilled) {
            showToast('Без названия страницу не отличить от других — заполните имя', 'error');
            return;
        }

        setSaving(true);
        try {
            if (isNew) {
                // При создании шлём форму целиком: у новой записи нет значений по умолчанию,
                // от которых можно было бы отсчитать «что изменилось»
                await createPage(() => {}, authenticationData, values);
                showToast(`Страница «${values.name}» создана`, 'success');
            } else {
                await updatePageData(authenticationData, pageId, changed);
                showToast('Страница сохранена', 'success');
            }

            // Перезагрузку списка делает вызвавший экран — второй запрос здесь лишний
            onSaved?.();
            onClose();
        } catch (error) {
            showToast(error.message || 'Не удалось сохранить страницу', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        const agreed = await confirm({
            title: 'Удалить страницу?',
            // Удаление каскадное: вместе со страницей уходят её каталоги, блоки и подсказки
            text: `«${source?.name || pageId}» и всё, что к ней привязано — каталоги, блоки оформления и подсказки в поиске. Действие необратимо.`,
            confirmLabel: 'Удалить',
            danger: true,
        });
        if (!agreed) return;

        setSaving(true);
        try {
            await deletePageData(authenticationData, pageId);
            showToast('Страница удалена', 'success');
            // Перезагрузку списка делает вызвавший экран — второй запрос здесь лишний
            onSaved?.();
            onClose();
        } catch (error) {
            showToast(error.message || 'Не удалось удалить страницу', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (!isNew && !source) {
        return (
            <TabPane narrow>
                <p className={s['formNote']}>Страница не найдена — возможно, её удалили.</p>
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
                            ? 'Новая страница'
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
                <Group title="Основное">
                    <Row label="Название" hint="Видно покупателю в баре разделов" wide>
                        <input className={f.input} type="text" value={values.name}
                               onChange={(event) => handleChange('name', event.target.value)}/>
                    </Row>
                    <Row label="Ссылка" hint="Путь раздела внутри витрины" wide>
                        <input className={`${f.input} ${f.mono}`} type="text" value={values.link}
                               onChange={(event) => handleChange('link', event.target.value)}/>
                    </Row>
                    <Row label="Порядок" hint="Чем меньше число, тем левее в баре">
                        <input className={f.input} type="number" value={values.serialNumber}
                               onChange={(event) => handleChange('serialNumber', Number(event.target.value) || 0)}/>
                    </Row>
                </Group>

                <Group title="Назначение">
                    <Row label="Витрина"
                         hint="Определяет парсер и сетку наценки для каталогов этой страницы">
                        <select className={`${f.input} ${f.select}`} value={values.type}
                                onChange={(event) => handleChange('type', event.target.value)}>
                            {TYPE_OPTIONS.map((option) => (
                                <option key={option.key} value={option.key}>{option.name}</option>
                            ))}
                        </select>
                    </Row>
                    <Row label="Площадка" hint="В каком боте показывать страницу">
                        <select className={`${f.input} ${f.select}`} value={values.botType}
                                onChange={(event) => handleChange('botType', event.target.value)}>
                            {BOT_OPTIONS.map((option) => (
                                <option key={option.key} value={option.key}>{option.name}</option>
                            ))}
                        </select>
                    </Row>
                    <Row label="Скрыта" hint="Скрытая страница остаётся в админке, но пропадает из витрины">
                        <button type="button" role="switch"
                                aria-checked={values.isHidden === 1}
                                className={`${f.switch} ${values.isHidden === 1 ? f.switchOn : ''}`}
                                onClick={() => handleChange('isHidden', values.isHidden === 1 ? 0 : 1)}>
                            <span className={f.switchDot}/>
                        </button>
                    </Row>
                </Group>

                <Group title="Оформление">
                    <Row label="Иконка в баре" hint="Показывается рядом с названием раздела" top wide>
                        <div className={s['iconField']}>
                            {values.barIcon ? (
                                <img className={s['iconPreview']} src={values.barIcon} alt=""/>
                            ) : (
                                <span className={s['iconEmpty']}>Иконки нет</span>
                            )}
                            <label className={s['iconUpload']}>
                                Загрузить
                                <input type="file" accept="image/*" hidden
                                       onChange={async (event) => {
                                           const file = event.target.files?.[0];
                                           if (!file) return;

                                           const dataUrl = await new Promise((resolve, reject) => {
                                               const reader = new FileReader();
                                               reader.onload = () => resolve(reader.result);
                                               reader.onerror = reject;
                                               reader.readAsDataURL(file);
                                           });

                                           handleChange('barIcon', dataUrl);
                                           event.target.value = '';
                                       }}/>
                            </label>
                            {values.barIcon ? (
                                <button type="button" className={s['btnGhost']}
                                        onClick={() => handleChange('barIcon', '')}>
                                    Убрать
                                </button>
                            ) : null}
                        </div>
                    </Row>
                </Group>
            </Sheet>
        </TabPane>
    );
};

export default PageForm;
