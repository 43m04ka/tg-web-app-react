import React, {useCallback} from 'react';
import {Button, Field, IconButton, Input, Note, Select} from '../../ui';
import {BUTTON_TYPES, buttonProblem, countButtons, emptyButton, emptyRow} from './broadcastModel';
import style from './BroadcastScreen.module.scss';

const VALUE_FIELDS = {
    url: {field: 'url', label: 'Адрес', placeholder: 'https://', hint: 'http://, https:// или tg://'},
    web_app: {field: 'webAppUrl', label: 'Адрес мини-приложения', placeholder: 'https://', hint: 'Только https://'},
    callback_data: {
        field: 'callback_data',
        label: 'Что получит бот',
        placeholder: 'promo_summer',
        hint: 'До 64 байт в UTF-8 — кириллица занимает по два'
    },
    switch_inline_query: {
        field: 'switch_inline_query',
        label: 'Запрос при выборе чата',
        placeholder: 'можно оставить пустым',
        hint: 'Откроется выбор чата, куда покупатель перешлёт сообщение'
    },
    switch_inline_query_current_chat: {
        field: 'switch_inline_query_current_chat',
        label: 'Запрос в текущем чате',
        placeholder: 'можно оставить пустым',
        hint: 'Подставится в поле ввода того же чата'
    }
};

export default function KeyboardEditor({rows, disabled, limits, onChange}) {
    const total = countButtons(rows);
    const maxButtons = limits?.inlineKeyboard?.maxButtonsTotal ?? 100;

    const patchButton = useCallback((rowId, buttonId, patch) => {
        onChange(rows.map((row) => (row.id !== rowId ? row : {
            ...row,
            buttons: row.buttons.map((button) => (button.id === buttonId ? {...button, ...patch} : button))
        })));
    }, [rows, onChange]);

    const addRow = useCallback(() => onChange([...rows, emptyRow()]), [rows, onChange]);

    const dropRow = useCallback(
        (rowId) => onChange(rows.filter((row) => row.id !== rowId)),
        [rows, onChange]
    );

    const addButton = useCallback((rowId) => {
        onChange(rows.map((row) => (row.id !== rowId ? row : {...row, buttons: [...row.buttons, emptyButton()]})));
    }, [rows, onChange]);

    const dropButton = useCallback((rowId, buttonId) => {
        onChange(rows
            .map((row) => (row.id !== rowId ? row : {
                ...row,
                buttons: row.buttons.filter((button) => button.id !== buttonId)
            }))
            .filter((row) => row.buttons.length > 0));
    }, [rows, onChange]);

    return (
        <div className={style.keyboard}>
            {rows.length === 0 ? (
                <p className={style.keyboardEmpty}>
                    Без кнопок сообщение уйдёт обычным текстом. Кнопки — ряд под сообщением в Telegram.
                </p>
            ) : null}

            {rows.map((row, rowIndex) => (
                <div key={row.id} className={style.keyboardRow}>
                    <div className={style.keyboardRowHead}>
                        <span className={style.keyboardRowTitle}>Ряд {rowIndex + 1}</span>

                        <div className={style.keyboardRowTools}>
                            <Button size="s" variant="ghost" disabled={disabled} onClick={() => addButton(row.id)}>
                                Кнопка в ряд
                            </Button>
                            <IconButton label="Убрать ряд" onClick={() => dropRow(row.id)}>×</IconButton>
                        </div>
                    </div>

                    {row.buttons.map((button) => {
                        const spec = VALUE_FIELDS[button.actionType];
                        const problem = buttonProblem(button);
                        const filled = String(button.text || '').trim().length > 0;

                        return (
                            <div key={button.id} className={style.keyboardButton}>
                                <div className={style.keyboardGrid}>
                                    <Field label="Подпись" error={filled ? problem === 'Подпись длиннее 256 знаков' ? problem : '' : ''}>
                                        <Input
                                            value={button.text}
                                            disabled={disabled}
                                            placeholder="Открыть магазин"
                                            onChange={(event) => patchButton(row.id, button.id, {text: event.target.value})}
                                        />
                                    </Field>

                                    <Field label="Действие">
                                        <Select
                                            options={BUTTON_TYPES}
                                            value={button.actionType}
                                            disabled={disabled}
                                            onChange={(event) => patchButton(row.id, button.id, {actionType: event.target.value})}
                                        />
                                    </Field>
                                </div>

                                {spec ? (
                                    <Field
                                        label={spec.label}
                                        hint={spec.hint}
                                        error={filled && problem && problem !== 'Без подписи кнопка не отправится' && problem !== 'Подпись длиннее 256 знаков' ? problem : ''}
                                    >
                                        <Input
                                            value={button[spec.field] ?? ''}
                                            disabled={disabled}
                                            placeholder={spec.placeholder}
                                            onChange={(event) => patchButton(row.id, button.id, {[spec.field]: event.target.value})}
                                        />
                                    </Field>
                                ) : null}

                                <div className={style.keyboardButtonFoot}>
                                    <Button
                                        size="s"
                                        variant="ghost"
                                        disabled={disabled}
                                        onClick={() => dropButton(row.id, button.id)}
                                    >
                                        Убрать кнопку
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ))}

            <div className={style.keyboardFoot}>
                <Button size="s" variant="secondary" disabled={disabled} onClick={addRow}>
                    Добавить ряд
                </Button>

                <span className={style.keyboardCount}>{total} из {maxButtons}</span>
            </div>

            {total > maxButtons ? (
                <Note tone="danger">Кнопок больше, чем примет Telegram.</Note>
            ) : null}
        </div>
    );
}
