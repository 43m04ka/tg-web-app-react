import React, {useRef, useState} from 'react';
import TabPane from '../../../Elements/WorkTabs/TabPane';
import RecalculateModalContent from '../Elements/RecalculatePriceTab';
import useGlobalData from '../../../legacy/useGlobalData';
import s from './Panels.module.scss';

/**
 * Пересчёт цен каталога отдельной вкладкой.
 * Список каталогов берём из глобальных данных, а не из пропсов, — вкладка живёт
 * дольше выделения в списке и должна опираться на актуальные данные.
 */
const RecalculatePanel = ({catalogId, onClose}) => {
    const {catalogList} = useGlobalData();
    const catalog = catalogList?.find((item) => item.id === catalogId);

    // Запуск живёт в форме, а кнопка — в нижней полосе вкладки: связываем их ссылкой.
    const runRef = useRef(null);
    const [loading, setLoading] = useState(false);

    return (
        <TabPane
            narrow
            footer={(
                <>
                    <button type="button" className={s.btn} onClick={onClose}>Закрыть</button>
                    <button type="button" className={`${s.btn} ${s.btnPrimary}`}
                            disabled={!catalog || loading}
                            onClick={() => runRef.current?.()}>
                        {loading ? 'Пересчёт…' : 'Пересчитать цены'}
                    </button>
                </>
            )}
        >
            {catalog
                ? (
                    <RecalculateModalContent
                        catalogId={catalogId}
                        catalogsList={catalogList}
                        runRef={runRef}
                        onLoadingChange={setLoading}
                    />
                )
                : <p className={s.hint}>Каталог не найден — возможно, он был удалён.</p>}
        </TabPane>
    );
};

export default RecalculatePanel;
