import React from 'react';
import style from './Broadcast.module.scss';
import {nextId} from './broadcastConstants';

const ACTION_OPTIONS = [
    {value: 'url', label: 'Ссылка (url)'},
    {value: 'callback_data', label: 'callback_data'},
    {value: 'web_app', label: 'Web App (HTTPS)'},
    {value: 'switch_inline_query', label: 'switch_inline_query'},
    {value: 'switch_inline_query_current_chat', label: 'switch_inline_query_current_chat'},
];

const newButton = () => ({
    id: nextId(),
    text: '',
    actionType: 'url',
    url: '',
    callback_data: '',
    webAppUrl: '',
    switch_inline_query: '',
    switch_inline_query_current_chat: '',
});

const newRow = () => ({
    id: nextId(),
    buttons: [newButton()],
});

const BroadcastInlineKeyboardEditor = ({keyboardRows, onChange}) => {
    const rows = keyboardRows || [];

    const setRows = (next) => {
        onChange(next);
    };

    const addRow = () => setRows([...rows, newRow()]);

    const removeRow = (rowId) => setRows(rows.filter((r) => r.id !== rowId));

    const addButton = (rowId) => {
        setRows(
            rows.map((r) => (r.id === rowId ? {...r, buttons: [...r.buttons, newButton()]} : r)),
        );
    };

    const removeButton = (rowId, buttonId) => {
        setRows(
            rows
                .map((r) => {
                    if (r.id !== rowId) return r;
                    const nextBtns = r.buttons.filter((b) => b.id !== buttonId);
                    if (nextBtns.length === 0) return null;
                    return {...r, buttons: nextBtns};
                })
                .filter(Boolean),
        );
    };

    const patchButton = (rowId, buttonId, patch) => {
        setRows(
            rows.map((r) =>
                r.id !== rowId
                    ? r
                    : {
                          ...r,
                          buttons: r.buttons.map((b) => (b.id === buttonId ? {...b, ...patch} : b)),
                      },
            ),
        );
    };

    const renderActionFields = (rowId, b) => {
        switch (b.actionType) {
            case 'url':
                return (
                    <input
                        className={style['kbInput']}
                        placeholder="https://… или tg://…"
                        value={b.url}
                        onChange={(e) => patchButton(rowId, b.id, {url: e.target.value})}
                    />
                );
            case 'callback_data':
                return (
                    <input
                        className={style['kbInput']}
                        placeholder="До 64 байт UTF-8"
                        value={b.callback_data}
                        onChange={(e) => patchButton(rowId, b.id, {callback_data: e.target.value})}
                    />
                );
            case 'web_app':
                return (
                    <input
                        className={style['kbInput']}
                        placeholder="https://… (только HTTPS)"
                        value={b.webAppUrl}
                        onChange={(e) => patchButton(rowId, b.id, {webAppUrl: e.target.value})}
                    />
                );
            case 'switch_inline_query':
                return (
                    <input
                        className={style['kbInput']}
                        placeholder="Запрос (допускается пусто)"
                        value={b.switch_inline_query}
                        onChange={(e) => patchButton(rowId, b.id, {switch_inline_query: e.target.value})}
                    />
                );
            case 'switch_inline_query_current_chat':
                return (
                    <input
                        className={style['kbInput']}
                        placeholder="Запрос для текущего чата"
                        value={b.switch_inline_query_current_chat}
                        onChange={(e) =>
                            patchButton(rowId, b.id, {switch_inline_query_current_chat: e.target.value})
                        }
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className={style['kbSection']}>
            <p className={style['sectionLabel']}>Inline-кнопки (опционально)</p>
            <p className={style['kbHint']}>
                Каждая кнопка: подпись и одно действие. Не используйте pay и login_url — бэк их не примет.
            </p>
            {rows.map((row, rowIndex) => (
                <div key={row.id} className={style['kbRow']}>
                    <div className={style['kbRowHeader']}>
                        <span className={style['kbRowTitle']}>Ряд {rowIndex + 1}</span>
                        <button type="button" className={style['kbRowRemove']} onClick={() => removeRow(row.id)}>
                            Удалить ряд
                        </button>
                    </div>
                    {row.buttons.map((b) => (
                        <div key={b.id} className={style['kbButtonCard']}>
                            <div className={style['kbButtonGrid']}>
                                <input
                                    className={style['kbInput']}
                                    placeholder="Текст на кнопке (1–256 симв.)"
                                    value={b.text}
                                    onChange={(e) => patchButton(row.id, b.id, {text: e.target.value})}
                                />
                                <select
                                    className={style['kbSelect']}
                                    value={b.actionType}
                                    onChange={(e) => patchButton(row.id, b.id, {actionType: e.target.value})}
                                >
                                    {ACTION_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>
                                            {o.label}
                                        </option>
                                    ))}
                                </select>
                                {renderActionFields(row.id, b)}
                                <button
                                    type="button"
                                    className={style['kbBtnMini']}
                                    onClick={() => removeButton(row.id, b.id)}
                                    disabled={row.buttons.length <= 1}
                                >
                                    − Кнопка
                                </button>
                            </div>
                        </div>
                    ))}
                    <button type="button" className={style['kbAddInRow']} onClick={() => addButton(row.id)}>
                        + Кнопка в этот ряд
                    </button>
                </div>
            ))}
            <button type="button" className={style['kbAddRow']} onClick={addRow}>
                + Ряд кнопок
            </button>
        </div>
    );
};

export default BroadcastInlineKeyboardEditor;
