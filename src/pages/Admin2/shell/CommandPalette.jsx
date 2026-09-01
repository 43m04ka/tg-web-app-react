import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {BASE, moduleCommands, moduleSearchers, modules} from '../platform/registry';
import Icon from './Icon';
import style from './CommandPalette.module.scss';

const matches = (text, query) => text.toLowerCase().includes(query.toLowerCase());

export default function CommandPalette({open, onClose, go, extraCommands = []}) {
    const [query, setQuery] = useState('');
    const [cursor, setCursor] = useState(0);
    const [pending, setPending] = useState(null);
    const [found, setFound] = useState([]);

    const inputRef = useRef(null);

    const commands = useMemo(() => {
        const navigation = modules
            .filter((item) => item.routes?.length)
            .map((item) => ({
                id: `go.${item.id}`,
                title: item.title,
                hint: 'Перейти в раздел',
                moduleTitle: 'Разделы',
                icon: item.icon,
                run: ({go: navigate}) => navigate(item.routes[0].path),
            }));

        return [...navigation, ...moduleCommands(), ...extraCommands];
    }, [extraCommands]);

    const visible = useMemo(() => {
        if (pending) return [];
        if (!query.trim()) return commands.slice(0, 12);

        return commands.filter((command) => (
            matches(command.title, query) || matches(command.moduleTitle || '', query)
        )).slice(0, 20);
    }, [commands, query, pending]);

    const rows = useMemo(() => [...visible, ...found], [visible, found]);

    useEffect(() => {
        if (!open) return;

        setQuery('');
        setPending(null);
        setFound([]);
        setCursor(0);

        const timerId = setTimeout(() => inputRef.current?.focus(), 20);
        return () => clearTimeout(timerId);
    }, [open]);

    useEffect(() => {
        setCursor(0);
    }, [query]);

    useEffect(() => {
        if (!open || pending || query.trim().length < 2) {
            setFound([]);
            return undefined;
        }

        let alive = true;

        const timerId = setTimeout(async () => {
            const searchers = moduleSearchers();
            const results = await Promise.all(searchers.map(async (item) => {
                try {
                    const list = await item.search(query.trim());
                    return (list || []).slice(0, 5).map((entry) => ({
                        id: `${item.moduleId}.${entry.id}`,
                        title: entry.title,
                        hint: entry.hint || '',
                        moduleTitle: item.moduleTitle,
                        icon: entry.icon || 'search',
                        run: ({go: navigate}) => navigate(entry.path),
                    }));
                } catch {
                    return [];
                }
            }));

            if (alive) setFound(results.flat());
        }, 250);

        return () => {
            alive = false;
            clearTimeout(timerId);
        };
    }, [open, query, pending]);

    const runCommand = useCallback(async (command, value) => {
        if (command.prompt && value === undefined) {
            setPending(command);
            setQuery('');
            return;
        }

        onClose();

        await command.run({
            go: (path) => go(path.startsWith(BASE) ? path : `${BASE}${path}`),
            close: onClose,
            value,
        });
    }, [go, onClose]);

    const onKeyDown = (event) => {
        if (event.key === 'Escape') {
            if (pending) {
                setPending(null);
                setQuery('');
                return;
            }
            onClose();
            return;
        }

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setCursor((value) => Math.min(value + 1, Math.max(rows.length - 1, 0)));
            return;
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault();
            setCursor((value) => Math.max(value - 1, 0));
            return;
        }

        if (event.key === 'Enter') {
            event.preventDefault();

            if (pending) {
                runCommand(pending, query.trim());
                setPending(null);
                return;
            }

            const command = rows[cursor];
            if (command) runCommand(command);
        }
    };

    if (!open) return null;

    return (
        <div className={style.backdrop} onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
        }}>
            <div className={style.panel} role="dialog" aria-modal="true">
                <div className={style.inputRow}>
                    <Icon name={pending ? 'chevron' : 'search'} size={15}/>
                    <input
                        ref={inputRef}
                        className={style.input}
                        value={query}
                        placeholder={pending ? pending.prompt : 'Раздел, команда, номер заказа или товар'}
                        onChange={(event) => setQuery(event.target.value)}
                        onKeyDown={onKeyDown}
                    />
                    {pending ? <span className={style.pendingTag}>{pending.title}</span> : null}
                </div>

                {pending ? (
                    <div className={style.pendingHint}>Введите значение и нажмите Enter</div>
                ) : (
                    <div className={style.list}>
                        {rows.length ? rows.map((command, index) => (
                            <button
                                key={command.id}
                                type="button"
                                className={`${style.row} ${index === cursor ? style.rowActive : ''}`}
                                onMouseEnter={() => setCursor(index)}
                                onClick={() => runCommand(command)}
                            >
                                <Icon name={command.icon || 'tasks'} size={15}/>
                                <span className={style.rowTitle}>{command.title}</span>
                                {command.hint ? <span className={style.rowHint}>{command.hint}</span> : null}
                                <span className={style.rowModule}>{command.moduleTitle || ''}</span>
                            </button>
                        )) : (
                            <div className={style.nothing}>Ничего не нашлось</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
