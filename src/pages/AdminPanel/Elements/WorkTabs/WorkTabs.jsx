import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import s from './WorkTabs.module.scss';

export const ROOT_TAB_ID = '__root__';

const WorkTabsContext = createContext(null);

/**
 * Доступ к строке вкладок из любого места внутри экрана.
 * Правило: во вкладку передаём только примитивы (id) и стабильные колбэки —
 * содержимое вкладки живёт своей жизнью и не перерисовывается вместе с родителем.
 */
export const useWorkTabs = () => {
    const ctx = useContext(WorkTabsContext);
    if (!ctx) throw new Error('useWorkTabs вызван вне <WorkTabs>');
    return ctx;
};

/**
 * Строка вкладок в верху рабочей области — как в браузере.
 * Первая вкладка — сам экран (список), её закрыть нельзя.
 * Остальные открываются действиями и остаются смонтированными в фоне,
 * поэтому сохраняют своё состояние: прокрутку, введённые значения, страницу списка.
 */
const WorkTabs = ({rootTitle, rootSubtitle, children}) => {
    const [state, setState] = useState({tabs: [], activeId: ROOT_TAB_ID});

    const openTab = useCallback((tab) => {
        setState((prev) => {
            const exists = prev.tabs.some((item) => item.id === tab.id);
            return {
                activeId: tab.id,
                tabs: exists
                    ? prev.tabs.map((item) => (item.id === tab.id ? {...item, ...tab, content: item.content} : item))
                    : [...prev.tabs, tab],
            };
        });
    }, []);

    const closeTab = useCallback((id) => {
        setState((prev) => {
            const index = prev.tabs.findIndex((item) => item.id === id);
            if (index === -1) return prev;
            const tabs = prev.tabs.filter((item) => item.id !== id);
            // Закрыли активную — переходим на соседнюю справа, иначе на слева, иначе к списку.
            const activeId = prev.activeId === id
                ? (tabs[index]?.id || tabs[index - 1]?.id || ROOT_TAB_ID)
                : prev.activeId;
            return {tabs, activeId};
        });
    }, []);

    /** Принудительное закрытие по признаку: сущность пропала, сменился контекст страницы и т.п. */
    const closeTabsWhere = useCallback((predicate) => {
        setState((prev) => {
            const doomed = prev.tabs.filter((item) => predicate(item));
            if (doomed.length === 0) return prev;
            const tabs = prev.tabs.filter((item) => !predicate(item));
            const activeId = doomed.some((item) => item.id === prev.activeId)
                ? (tabs[tabs.length - 1]?.id || ROOT_TAB_ID)
                : prev.activeId;
            return {tabs, activeId};
        });
    }, []);

    /** Обновление подписи открытой вкладки, когда данные снаружи изменились. */
    const updateTab = useCallback((id, patch) => {
        setState((prev) => {
            const target = prev.tabs.find((item) => item.id === id);
            if (!target) return prev;
            const changed = Object.keys(patch).some((key) => target[key] !== patch[key]);
            if (!changed) return prev;
            return {...prev, tabs: prev.tabs.map((item) => (item.id === id ? {...item, ...patch} : item))};
        });
    }, []);

    const selectTab = useCallback((id) => {
        setState((prev) => (prev.activeId === id ? prev : {...prev, activeId: id}));
    }, []);

    const {tabs, activeId} = state;

    const activeIdRef = useRef(activeId);
    activeIdRef.current = activeId;

    // Esc закрывает активную вкладку — привычный жест «назад к списку».
    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.key !== 'Escape') return;
            const current = activeIdRef.current;
            if (current === ROOT_TAB_ID) return;
            const target = event.target;
            // Не перехватываем Esc в полях ввода: там он отменяет ввод, а не закрывает вкладку.
            if (target && ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) return;
            closeTab(current);
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [closeTab]);

    const api = useMemo(
        () => ({openTab, closeTab, closeTabsWhere, updateTab, selectTab, tabs, activeId}),
        [openTab, closeTab, closeTabsWhere, updateTab, selectTab, tabs, activeId],
    );

    const renderTabButton = (tab, closable) => {
        const active = activeId === tab.id;
        return (
            <div
                key={tab.id}
                className={`${s.tab} ${active ? s.tabActive : ''}`}
                role="tab"
                aria-selected={active}
                tabIndex={0}
                onClick={() => selectTab(tab.id)}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        selectTab(tab.id);
                    }
                }}
                // Средняя кнопка мыши закрывает вкладку — как в браузере.
                onMouseDown={(event) => {
                    if (event.button === 1 && closable) {
                        event.preventDefault();
                        closeTab(tab.id);
                    }
                }}
                title={tab.subtitle ? `${tab.title} · ${tab.subtitle}` : tab.title}
            >
                <span className={s.tabText}>
                    <span className={s.tabTitle}>{tab.title}</span>
                    {tab.subtitle ? <span className={s.tabSubtitle}>{tab.subtitle}</span> : null}
                </span>
                {closable ? (
                    <button
                        type="button"
                        className={s.tabClose}
                        aria-label="Закрыть вкладку"
                        onClick={(event) => {
                            event.stopPropagation();
                            closeTab(tab.id);
                        }}
                    >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                        </svg>
                    </button>
                ) : null}
            </div>
        );
    };

    return (
        <WorkTabsContext.Provider value={api}>
            <div className={s.root}>
                <div className={s.bar} role="tablist">
                    {renderTabButton({id: ROOT_TAB_ID, title: rootTitle, subtitle: rootSubtitle}, false)}
                    {tabs.map((tab) => renderTabButton(tab, true))}
                </div>

                <div className={s.panes}>
                    <div className={`${s.pane} ${activeId === ROOT_TAB_ID ? '' : s.paneHidden}`}>{children}</div>
                    {tabs.map((tab) => (
                        <div key={tab.id} className={`${s.pane} ${activeId === tab.id ? '' : s.paneHidden}`}>
                            {tab.content}
                        </div>
                    ))}
                </div>
            </div>
        </WorkTabsContext.Provider>
    );
};

export default WorkTabs;
