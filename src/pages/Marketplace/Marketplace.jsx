import React, {useRef, useState} from 'react';
import {useAppInsets} from '../../shared/hooks/useAppInsets';
import {hapticImpact, hapticSelection} from '../../shared/lib/haptic';
import {getTelegramObject} from '../../shared/lib/telegram';
import {sendMarketplaceOrder} from '../../shared/api/marketplaceOrder';
import steam from '../Steam/Steam.module.scss';
import pay from '../Pay/Pay.module.scss';
import style from './Marketplace.module.scss';

const MARKETPLACES = ['Ozon', 'Wildberries', 'Яндекс Маркет', 'МегаМаркет', 'Avito', 'Другой'];
const MAX_FILE_BYTES = 10 * 1024 * 1024;

const FIELDS = [
    {key: 'orderNumber', title: 'Номер заказа', placeholder: 'Например, 0472-XXXX', required: true},
    {key: 'orderDate', title: 'Дата заказа', type: 'date', required: true},
    {key: 'product', title: 'Что заказали', placeholder: 'Например, PS Plus Extra 3 мес', required: true},
    {key: 'name', title: 'Имя', placeholder: 'Как к вам обращаться', required: true},
    {key: 'contact', title: 'Telegram / e-mail / телефон', placeholder: '@username', required: true},
    {key: 'accountData', title: 'Данные для активации', placeholder: 'Логин/ID аккаунта PSN или Xbox', multiline: true, required: true},
    {key: 'comment', title: 'Комментарий', placeholder: 'Необязательно', multiline: true}
];

const initialForm = () => {
    const username = getTelegramObject().initDataUnsafe?.user?.username;

    return {
        marketplace: '',
        orderNumber: '',
        orderDate: '',
        product: '',
        name: '',
        contact: username ? `@${username}` : '',
        accountData: '',
        comment: ''
    };
};

const readFile = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
});

function Agree({isChecked, isBad, onToggle}) {
    return (
        <button
            type="button"
            role="checkbox"
            aria-checked={isChecked}
            className={`${pay.agree} ${isBad ? pay.agreeBad : ''}`}
            onClick={onToggle}
        >
            <span className={`${pay.agreeBox} ${isChecked ? pay.agreeBoxOn : ''}`} aria-hidden="true">
                <svg viewBox="0 0 16 16" fill="none">
                    <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </span>
            <span className={pay.agreeText}>Согласен на обработку персональных данных</span>
        </button>
    );
}

export default function Marketplace() {
    const {contentSafeAreaInset, safeAreaInset} = useAppInsets();
    const fileRef = useRef(null);

    const [form, setForm] = useState(initialForm);
    const [file, setFile] = useState(null);
    const [isAgreed, setAgreed] = useState(false);
    const [isTouched, setTouched] = useState(false);
    const [isSending, setSending] = useState(false);
    const [isDone, setDone] = useState(false);
    const [error, setError] = useState('');

    const missing = (key) => !form[key].trim();
    const isFormReady = Boolean(form.marketplace)
        && FIELDS.every((field) => !field.required || !missing(field.key))
        && isAgreed;

    const blockReason = !isTouched || isFormReady
        ? null
        : !form.marketplace
            ? 'Выберите маркетплейс'
            : FIELDS.some((field) => field.required && missing(field.key))
                ? 'Заполните обязательные поля'
                : 'Подтвердите согласие на обработку данных';

    const update = (key, value) => setForm((current) => ({...current, [key]: value}));

    const pickFile = (event) => {
        const picked = event.target.files?.[0] || null;
        event.target.value = '';

        if (picked && picked.size > MAX_FILE_BYTES) {
            setError('Файл больше 10 МБ');
            return;
        }

        setError('');
        setFile(picked);
    };

    const submit = async () => {
        setTouched(true);

        if (!isFormReady || isSending) return;

        hapticImpact('medium');
        setSending(true);
        setError('');

        try {
            const attached = file
                ? {name: file.name, type: file.type, data: await readFile(file)}
                : null;

            const result = await sendMarketplaceOrder({...form, agree: true, file: attached});

            if (!result.ok) {
                setError(typeof result.error === 'string' && result.httpStatus < 500
                    ? result.error
                    : 'Не удалось отправить заявку. Попробуйте ещё раз.');
                return;
            }

            setDone(true);
        } catch (requestError) {
            setError('Нет связи с сервером. Попробуйте ещё раз.');
        } finally {
            setSending(false);
        }
    };

    const reset = () => {
        setForm(initialForm());
        setFile(null);
        setAgreed(false);
        setTouched(false);
        setDone(false);
    };

    if (isDone) {
        return (
            <div className={steam.stateScreen}>
                <div className={steam.stateCard}>
                    <div className={`${steam.stateIcon} ${steam.stateIconDone}`} aria-hidden="true">✓</div>
                    <h1 className={steam.stateTitle}>Заявка отправлена</h1>

                    <div className={steam.stateText}>
                        <span className={steam.stateLead}>Менеджер свяжется с вами: {form.contact}</span>
                    </div>

                    <div className={steam.stateActions}>
                        <button type="button" className={steam.statePrimary} onClick={reset}>
                            Новая заявка
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={steam.screen}>
            <div
                className={steam.header}
                style={{paddingTop: `calc(${contentSafeAreaInset.top}px + 14 * var(--u))`}}
            >
                <h1 className={steam.title}>Активация заказа <span className={pay.brand}>Геймворд</span></h1>
            </div>

            <div
                className={steam.content}
                style={{paddingBottom: `calc(${safeAreaInset.bottom}px + 20 * var(--u))`}}
            >
                <section className={steam.block}>
                    <h2 className={steam.blockTitle}>Маркетплейс</h2>

                    <div className={style.chips}>
                        {MARKETPLACES.map((name) => (
                            <button
                                key={name}
                                type="button"
                                className={`${style.chip} ${form.marketplace === name ? style.chipActive : ''} ${isTouched && !form.marketplace ? style.chipBad : ''}`}
                                onClick={() => {
                                    hapticSelection();
                                    update('marketplace', name);
                                }}
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                </section>

                {FIELDS.map((field) => {
                    const isBad = isTouched && field.required && missing(field.key);
                    const className = `${steam.input} ${field.multiline ? style.textarea : ''} ${field.type === 'date' ? style.date : ''} ${isBad ? steam.inputBad : ''}`;

                    return (
                        <section key={field.key} className={steam.block}>
                            <h2 className={steam.blockTitle}>{field.title}</h2>

                            {field.multiline ? (
                                <textarea
                                    className={className}
                                    value={form[field.key]}
                                    placeholder={field.placeholder}
                                    rows={3}
                                    onChange={(event) => update(field.key, event.target.value)}
                                />
                            ) : (
                                <input
                                    className={className}
                                    type={field.type || 'text'}
                                    value={form[field.key]}
                                    placeholder={field.placeholder}
                                    autoComplete="off"
                                    onChange={(event) => update(field.key, event.target.value)}
                                />
                            )}
                        </section>
                    );
                })}

                <section className={steam.block}>
                    <h2 className={steam.blockTitle}>Чек или скриншот заказа</h2>

                    <button type="button" className={style.file} onClick={() => fileRef.current?.click()}>
                        <span className={style.fileName}>{file ? file.name : 'Прикрепить файл'}</span>
                        {file ? (
                            <span
                                role="button"
                                className={style.fileClear}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setFile(null);
                                }}
                            >
                                ✕
                            </span>
                        ) : null}
                    </button>

                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*,application/pdf"
                        hidden
                        onChange={pickFile}
                    />
                </section>

                <Agree
                    isChecked={isAgreed}
                    isBad={isTouched && !isAgreed}
                    onToggle={() => {
                        hapticSelection();
                        setAgreed((value) => !value);
                    }}
                />
            </div>

            <div className={steam.actionBar}>
                {blockReason ? <p className={steam.actionError}>{blockReason}</p> : null}
                {error ? <p className={steam.actionError}>{error}</p> : null}

                <button
                    type="button"
                    className={steam.primary}
                    disabled={isSending}
                    onClick={submit}
                >
                    {isSending ? 'Отправляем…' : 'Отправить заявку'}
                </button>
            </div>
        </div>
    );
}
