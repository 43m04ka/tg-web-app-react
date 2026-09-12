import React, {useCallback, useEffect, useState} from 'react';
import {askConfirm, toast} from '../../platform/notify';
import style from './DocTabs.module.scss';

const classes = (...list) => list.filter(Boolean).join(' ');

const readStored = (key) => {
    try {
        const list = JSON.parse(window.localStorage.getItem(key) || '[]');
        return Array.isArray(list) ? list.filter((item) => item && item.id) : [];
    } catch {
        return [];
    }
};

const writeStored = (key, tabs) => {
    try {
        window.localStorage.setItem(key, JSON.stringify(tabs.map(({dirty, ...rest}) => rest)));
    } catch {
        return null;
    }

    return null;
};

const defined = (value) => Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined));

const sameMeta = (item, meta) => Object.entries(meta).every(([key, value]) => item[key] === value);

export function useWorkspaceTabs({storageKey, activeId, go, limit = 10, fallbackTitle = (id) => `#${id}`}) {
    const [tabs, setTabs] = useState(() => readStored(storageKey).slice(0, limit));

    useEffect(() => {
        writeStored(storageKey, tabs);
    }, [storageKey, tabs]);

    const open = useCallback((tab) => {
        const id = String(tab.id);
        const meta = defined({...tab, id});

        if (!tabs.some((item) => item.id === id) && tabs.length >= limit) {
            toast({tone: 'info', title: `Открыто ${limit} вкладок`, text: 'Самая старая вкладка закрыта, чтобы освободить место.'});
        }

        setTabs((current) => {
            if (current.some((item) => item.id === id)) {
                return current.map((item) => (item.id === id && !sameMeta(item, meta) ? {...item, ...meta} : item));
            }

            const next = [...current, {title: fallbackTitle(id), ...meta}];
            if (next.length <= limit) return next;

            const victim = next.find((item) => item.id !== id && !item.dirty) || next[0];
            return next.filter((item) => item !== victim);
        });
    }, [tabs, limit, fallbackTitle]);

    const patch = useCallback((id, meta) => {
        const clean = defined(meta);

        setTabs((current) => {
            const target = current.find((item) => item.id === String(id));
            if (!target || sameMeta(target, clean)) return current;

            return current.map((item) => (item === target ? {...item, ...clean} : item));
        });
    }, []);

    const drop = useCallback((ids) => {
        const list = new Set(ids.map(String));
        setTabs((current) => (current.some((item) => list.has(item.id)) ? current.filter((item) => !list.has(item.id)) : current));
    }, []);

    const move = useCallback((from, to) => {
        setTabs((current) => {
            if (from === to || !current[from] || !current[to]) return current;

            const next = current.slice();
            const [moved] = next.splice(from, 1);
            next.splice(to, 0, moved);
            return next;
        });
    }, []);

    const close = useCallback(async (id, {confirmed = false} = {}) => {
        const index = tabs.findIndex((item) => item.id === String(id));
        if (index < 0) return;

        const tab = tabs[index];

        if (tab.dirty && !confirmed) {
            const answer = await askConfirm({
                title: 'Закрыть вкладку без сохранения?',
                text: `«${tab.title}»: в карточке есть несохранённые правки.`,
                consequence: 'Правки будут потеряны.',
                confirmText: 'Закрыть',
                tone: 'danger',
            });

            if (!answer) return;
        }

        drop([tab.id]);

        if (tab.id === activeId) {
            const rest = tabs.filter((item) => item.id !== tab.id);
            const next = rest[index] || rest[index - 1] || null;
            go(next ? next.id : null);
        }
    }, [tabs, drop, activeId, go]);

    useEffect(() => {
        if (activeId) open({id: activeId});
    }, [activeId]);

    return {tabs, open, patch, drop, move, close};
}

export function DocTabs({listTitle, listCount = null, tabs, active, limit = 10, onSelect, onClose, onMove}) {
    const [dragIndex, setDragIndex] = useState(null);
    const [overIndex, setOverIndex] = useState(null);

    const reset = () => {
        setDragIndex(null);
        setOverIndex(null);
    };

    return (
        <div className={style.strip} role="tablist">
            <button
                type="button"
                role="tab"
                aria-selected={!active}
                className={active ? style.listTab : style.listTabOn}
                onClick={() => onSelect(null)}
            >
                <span className={style.listIcon}>☰</span>
                <span className={style.listTitle}>{listTitle}</span>
                {listCount !== null && listCount !== undefined ? <span className={style.listCount}>{listCount}</span> : null}
            </button>

            {tabs.length ? <span className={style.split}/> : null}

            <div className={style.tabs}>
                {tabs.map((tab, index) => {
                    const isActive = tab.id === active;
                    const dropSide = dragIndex !== null && overIndex === index && dragIndex !== index
                        ? (dragIndex < index ? style.dropAfter : style.dropBefore)
                        : null;

                    return (
                        <div
                            key={tab.id}
                            role="tab"
                            tabIndex={0}
                            aria-selected={isActive}
                            draggable
                            title={[tab.caption, tab.title].filter(Boolean).join(' · ')}
                            className={classes(style.tab, isActive && style.tabOn, dragIndex === index && style.dragging, dropSide)}
                            onClick={() => onSelect(tab.id)}
                            onKeyDown={(event) => {
                                if (event.key !== 'Enter' && event.key !== ' ') return;
                                event.preventDefault();
                                onSelect(tab.id);
                            }}
                            onMouseDown={(event) => {
                                if (event.button === 1) event.preventDefault();
                            }}
                            onAuxClick={(event) => {
                                if (event.button !== 1) return;
                                event.preventDefault();
                                onClose(tab.id);
                            }}
                            onDragStart={(event) => {
                                setDragIndex(index);
                                event.dataTransfer.effectAllowed = 'move';
                                event.dataTransfer.setData('text/plain', tab.id);
                            }}
                            onDragOver={(event) => {
                                event.preventDefault();
                                if (overIndex !== index) setOverIndex(index);
                            }}
                            onDrop={(event) => {
                                event.preventDefault();
                                if (dragIndex !== null && dragIndex !== index) onMove(dragIndex, index);
                                reset();
                            }}
                            onDragEnd={reset}
                        >
                            <span className={style.tabText}>
                                <span className={style.caption}>{tab.caption || '…'}</span>
                                <span className={style.title}>{tab.title}</span>
                            </span>

                            {tab.dirty ? <span className={style.dirty} title="Есть несохранённые правки"/> : null}

                            <button
                                type="button"
                                className={style.close}
                                aria-label="Закрыть вкладку"
                                title="Закрыть вкладку"
                                onMouseDown={(event) => event.stopPropagation()}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onClose(tab.id);
                                }}
                            >
                                ×
                            </button>
                        </div>
                    );
                })}
            </div>

            <span className={classes(style.counter, tabs.length >= limit && style.counterFull)}>
                {tabs.length} / {limit}
            </span>
        </div>
    );
}

export function TabbedScreen({strip, children}) {
    return (
        <div className={style.screen}>
            {strip}
            <div className={style.body}>{children}</div>
        </div>
    );
}

export function TabPane({active, children}) {
    return <div className={style.pane} hidden={!active}>{children}</div>;
}
