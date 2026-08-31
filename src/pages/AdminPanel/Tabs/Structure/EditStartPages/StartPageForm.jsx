import React, {useEffect, useMemo, useState} from 'react';
import TabPane from '../../../Elements/WorkTabs/TabPane';
import f, {Group, Row, Sheet} from '../../../Elements/FormLayout/FormLayout';
import s from './EditStartPages.module.scss';
import useData from '../../../useData';
import useGlobalData from '../../../legacy/useGlobalData';
import {useServer} from '../useServer';
import {useFeedback} from '../../../Elements/Feedback/Feedback';
import {START_PAGE_DEFAULTS, TYPE_LABELS} from './startPageContent';

/**
 * Форма элемента стартового экрана: заголовок, надпись, карточка страницы или ссылка.
 *
 * Заменила попап EditStartPageItem. Кроме перевода на вкладку здесь закрыто:
 *  - отладочный console.log(payload) прямо перед сохранением;
 *  - удаление без подтверждения — стартовый экран собирают руками, и снести
 *    карточку одним промахом мыши было слишком легко;
 *  - собственный infoLabel вместо общих тостов: сообщение об ошибке жило внутри
 *    попапа и исчезало вместе с ним.
 *
 * Тип элемента у существующей записи не меняется: у типов разный набор полей,
 * и смена превратила бы карточку страницы в ссылку с осиротевшим structurePageId.
 */

const isDataUrl = (value) => typeof value === 'string' && value.startsWith('data:');

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
});

/** Поле картинки: превью, загрузка, сброс. Тот же приём, что в PageForm. */
const ImageField = ({value, onChange, emptyText = 'Нет'}) => (
    <div className={s['iconField']}>
        {isDataUrl(value) || value ? (
            <img className={s['iconPreview']} src={value} alt=""/>
        ) : (
            <span className={s['iconEmpty']}>{emptyText}</span>
        )}
        <label className={s['iconUpload']}>
            Загрузить
            <input type="file" accept="image/*" hidden
                   onChange={async (event) => {
                       const file = event.target.files?.[0];
                       if (!file) return;
                       onChange(await readFileAsDataUrl(file));
                       event.target.value = '';
                   }}/>
        </label>
        {value ? (
            <button type="button" className={s['btnGhost']} onClick={() => onChange('')}>
                Убрать
            </button>
        ) : null}
    </div>
);

const StartPageForm = ({item, platform, onClose, onSaved}) => {
    const isNew = !item?.id;

    const {authenticationData} = useData();
    const {pageList} = useGlobalData();
    const {createStartPage, updateStartPage, deleteStartPage} = useServer();
    const {showToast, confirm} = useFeedback();

    const type = item?.type || 'title';

    const [values, setValues] = useState(() => ({
        text: item?.text || '',
        title: item?.title || '',
        icon: item?.icon || '',
        color: item?.color || '#000000',
        url: item?.url || '',
        structurePageId: item?.structurePageId ?? null,
    }));
    const [saving, setSaving] = useState(false);

    const handleChange = (key, value) => setValues((prev) => ({...prev, [key]: value}));

    // Скрытую страницу покупатель не увидит — привязывать к ней карточку бессмысленно
    const availablePages = useMemo(
        () => (pageList || []).filter((page) => page.isHidden !== 1),
        [pageList],
    );

    // Карточка без привязки не имеет смысла: подставляем первую доступную страницу,
    // чтобы форма не открывалась в заведомо несохраняемом состоянии
    useEffect(() => {
        if (type !== 'page' || values.structurePageId || !availablePages.length) return;
        handleChange('structurePageId', availablePages[0].id);
    }, [type, values.structurePageId, availablePages]);

    const buildPayload = () => {
        if (type === 'page' && !values.structurePageId) {
            showToast('Выберите страницу для карточки', 'error');
            return null;
        }

        if (type === 'link') {
            const url = values.url.trim();
            if (!url) {
                showToast('Ссылке нужен адрес — заполните URL', 'error');
                return null;
            }
            if (!/^https?:\/\//i.test(url)) {
                showToast('URL должен начинаться с http:// или https://', 'error');
                return null;
            }
        }

        return {
            type,
            text: values.text,
            title: values.title,
            icon: values.icon,
            color: values.color,
            url: values.url.trim(),
            ...(type === 'page' ? {structurePageId: values.structurePageId} : {}),
        };
    };

    const handleSave = async () => {
        const payload = buildPayload();
        if (!payload) return;

        setSaving(true);
        try {
            if (isNew) {
                await createStartPage(authenticationData, {
                    ...payload,
                    platform,
                    serialNumber: item?.serialNumber ?? 0,
                });
                showToast(`${TYPE_LABELS[type]} добавлен на стартовый экран`, 'success');
            } else {
                await updateStartPage(authenticationData, item.id, payload);
                showToast('Элемент сохранён', 'success');
            }

            onSaved?.();
            onClose();
        } catch (error) {
            showToast(error.message || 'Не удалось сохранить элемент', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        const agreed = await confirm({
            title: 'Удалить элемент?',
            text: `${TYPE_LABELS[type]} пропадёт со стартового экрана сразу. Действие необратимо.`,
            confirmLabel: 'Удалить',
            danger: true,
        });
        if (!agreed) return;

        setSaving(true);
        try {
            await deleteStartPage(authenticationData, item.id);
            showToast('Элемент удалён', 'success');
            onSaved?.();
            onClose();
        } catch (error) {
            showToast(error.message || 'Не удалось удалить элемент', 'error');
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
                        {isNew ? `Новый элемент: ${TYPE_LABELS[type]}` : TYPE_LABELS[type]}
                    </span>
                    {!isNew ? (
                        <button type="button" className={`${s['btn']} ${s['btnDanger']}`}
                                disabled={saving} onClick={handleDelete}>
                            Удалить
                        </button>
                    ) : null}
                    <button type="button" className={s['btn']} onClick={onClose}>Отмена</button>
                    <button type="button" className={`${s['btn']} ${s['btnPrimary']}`}
                            disabled={saving} onClick={handleSave}>
                        {saving ? 'Сохранение…' : (isNew ? 'Добавить' : 'Сохранить')}
                    </button>
                </>
            )}
        >
            <Sheet>
                {type === 'title' ? (
                    <Group title="Заголовок">
                        <Row label="Текст" hint="Крупная строка в самом верху экрана" wide>
                            <input className={f.input} type="text"
                                   placeholder={START_PAGE_DEFAULTS.title}
                                   value={values.text}
                                   onChange={(event) => handleChange('text', event.target.value)}/>
                        </Row>
                        <Row label="Иконка" hint="Показывается рядом с текстом" top wide>
                            <ImageField value={values.icon}
                                        onChange={(value) => handleChange('icon', value)}
                                        emptyText="Нет иконки"/>
                        </Row>
                    </Group>
                ) : null}

                {type === 'label' ? (
                    <Group title="Надпись">
                        <Row label="Текст" hint="Мелкая пояснительная строка" wide>
                            <input className={f.input} type="text"
                                   placeholder={START_PAGE_DEFAULTS.label}
                                   value={values.text}
                                   onChange={(event) => handleChange('text', event.target.value)}/>
                        </Row>
                    </Group>
                ) : null}

                {type === 'page' ? (
                    availablePages.length ? (
                        <>
                            <Group title="Привязка">
                                <Row label="Страница" hint="Куда ведёт карточка. Скрытые страницы в списке не показаны">
                                    <select className={`${f.input} ${f.select}`}
                                            value={values.structurePageId ?? ''}
                                            onChange={(event) => handleChange('structurePageId', Number(event.target.value))}>
                                        {availablePages.map((page) => (
                                            <option key={page.id} value={page.id}>
                                                {page.name} (#{page.id})
                                            </option>
                                        ))}
                                    </select>
                                </Row>
                            </Group>

                            <Group title="Карточка">
                                <Row label="Заголовок" wide>
                                    <input className={f.input} type="text"
                                           value={values.title}
                                           onChange={(event) => handleChange('title', event.target.value)}/>
                                </Row>
                                <Row label="Текст под заголовком" wide>
                                    <input className={f.input} type="text"
                                           value={values.text}
                                           onChange={(event) => handleChange('text', event.target.value)}/>
                                </Row>
                                <Row label="Цвет" hint="Фон карточки">
                                    <input className={s['colorInput']} type="color"
                                           value={values.color}
                                           onChange={(event) => handleChange('color', event.target.value)}/>
                                </Row>
                                <Row label="Иконка" top wide>
                                    <ImageField value={values.icon}
                                                onChange={(value) => handleChange('icon', value)}
                                                emptyText="Нет иконки"/>
                                </Row>
                            </Group>
                        </>
                    ) : (
                        <Group title="Привязка">
                            <Row label="Страница" wide>
                                <span className={s['formNote']}>
                                    Нет доступных страниц — сначала создайте хотя бы одну видимую страницу.
                                </span>
                            </Row>
                        </Group>
                    )
                ) : null}

                {type === 'link' ? (
                    <Group title="Ссылка">
                        <Row label="Текст" hint="Подпись на кнопке" wide>
                            <input className={f.input} type="text"
                                   value={values.text}
                                   onChange={(event) => handleChange('text', event.target.value)}/>
                        </Row>
                        <Row label="URL" hint="Полный адрес, с http:// или https://" wide>
                            <input className={`${f.input} ${f.mono}`} type="text"
                                   placeholder="https://t.me/gwstore_admin"
                                   value={values.url}
                                   onChange={(event) => handleChange('url', event.target.value)}/>
                        </Row>
                        <Row label="Цвет">
                            <input className={s['colorInput']} type="color"
                                   value={values.color}
                                   onChange={(event) => handleChange('color', event.target.value)}/>
                        </Row>
                        <Row label="Иконка" top wide>
                            <ImageField value={values.icon}
                                        onChange={(value) => handleChange('icon', value)}
                                        emptyText="Нет иконки"/>
                        </Row>
                    </Group>
                ) : null}

                {!isNew ? (
                    <Group title="Служебное">
                        <Row label="ID">
                            <span className={s['formValue']}>{item.id}</span>
                        </Row>
                        <Row label="Тип" hint="У существующего элемента не меняется: у типов разный набор полей">
                            <span className={s['formValue']}>{TYPE_LABELS[type]}</span>
                        </Row>
                    </Group>
                ) : null}
            </Sheet>
        </TabPane>
    );
};

export default StartPageForm;
