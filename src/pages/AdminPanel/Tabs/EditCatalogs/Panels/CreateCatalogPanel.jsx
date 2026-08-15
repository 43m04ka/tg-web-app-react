import React, {useState} from 'react';
import TabPane from '../../../Elements/WorkTabs/TabPane';
import f, {Group, Row, Sheet} from '../../../Elements/FormLayout/FormLayout';
import {useServer} from '../useServer';
import useData from '../../../useData';
import s from './Panels.module.scss';

/**
 * Создание каталога отдельной вкладкой: своё состояние, чтобы форма не сбрасывалась,
 * пока пользователь уходит в список и возвращается обратно.
 */
const CreateCatalogPanel = ({pageId, pageName, onCreated, onClose}) => {
    const {createCatalog} = useServer();
    const {authenticationData} = useData();

    const [path, setPath] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleCreate = () => {
        const value = path.trim();
        if (!value || saving) return;
        if (!pageId) {
            setError('Не выбрана страница');
            return;
        }

        setSaving(true);
        setError('');
        createCatalog(() => {
            setSaving(false);
            onCreated();
            onClose();
        }, authenticationData, {path: value, structurePageId: pageId, type: 'DEFAULT'});
    };

    return (
        <TabPane
            narrow
            footer={(
                <>
                    {error ? <span className={s.status}>{error}</span> : null}
                    <button type="button" className={s.btn} onClick={onClose}>Отмена</button>
                    <button type="button" className={`${s.btn} ${s.btnPrimary}`}
                            disabled={!path.trim() || saving}
                            onClick={handleCreate}>
                        {saving ? 'Создание…' : 'Создать'}
                    </button>
                </>
            )}
        >
            <Sheet>
                <Group>
                    <Row label="Путь до каталога"
                         hint={<>Идентификатор при парсинге (<code>bdPath</code>)</>}>
                        <input className={f.input} type="text" placeholder="xbox_new"
                               value={path}
                               onChange={(event) => setPath(event.target.value)}
                               onKeyDown={(event) => {
                                   if (event.key === 'Enter') handleCreate();
                               }} />
                    </Row>
                    <Row label="Страница" hint="Задана при открытии вкладки">
                        <span className={s.readonly}>{pageName || '—'}</span>
                    </Row>
                </Group>
            </Sheet>
        </TabPane>
    );
};

export default CreateCatalogPanel;
