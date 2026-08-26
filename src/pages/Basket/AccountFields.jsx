import React from 'react';
import {hapticImpact} from '../../shared/lib/haptic';
import {getTelegramObject} from '../../shared/lib/telegram';
import {ACCOUNT_KINDS, accountForm} from './cartModel';
import style from './Basket.module.scss';

const openGuide = (url) => {
    hapticImpact('light');

    const tg = getTelegramObject();
    if (typeof tg.openTelegramLink === 'function' && url.includes('t.me/')) tg.openTelegramLink(url);
    else if (typeof tg.openLink === 'function') tg.openLink(url);
    else window.open(url, '_blank', 'noopener');
};

export default function AccountFields({pageType, kind, values, onKind, onChange}) {
    const form = accountForm(pageType);

    if (!form) return null;

    const isNew = kind === ACCOUNT_KINDS.NEW;
    const shortFields = form.fields.filter((field) => field.short);
    const longFields = form.fields.filter((field) => !field.short);

    return (
        <section className={style.block}>
            <h2 className={style.blockTitle}>Куда оформить заказ</h2>

            <div className={style.switcher}>
                <button
                    type="button"
                    className={`${style.switcherButton} ${isNew ? style.switcherActive : ''}`}
                    onClick={() => {
                        hapticImpact('light');
                        onKind(ACCOUNT_KINDS.NEW);
                    }}
                >
                    Новый аккаунт
                </button>

                <button
                    type="button"
                    className={`${style.switcherButton} ${isNew ? '' : style.switcherActive}`}
                    onClick={() => {
                        hapticImpact('light');
                        onKind(ACCOUNT_KINDS.OWN);
                    }}
                >
                    На мой аккаунт
                </button>
            </div>

            <div className={style.card}>
                <p className={style.hint}>{isNew ? form.newHint : form.ownHint}</p>

                {isNew ? null : (
                    <div className={style.fields}>
                        {longFields.map((field) => (
                            <input
                                key={field.key}
                                className={style.input}
                                value={values[field.key] || ''}
                                placeholder={field.placeholder}
                                autoComplete="off"
                                autoCapitalize="none"
                                spellCheck="false"
                                onChange={(event) => onChange(field.key, event.target.value)}
                            />
                        ))}

                        {shortFields.length ? (
                            <div className={style.fieldsRow}>
                                {shortFields.map((field) => (
                                    <input
                                        key={field.key}
                                        className={`${style.input} ${style.inputShort}`}
                                        value={values[field.key] || ''}
                                        placeholder={field.placeholder}
                                        maxLength={field.maxLength}
                                        inputMode="numeric"
                                        autoComplete="off"
                                        onChange={(event) => onChange(field.key, event.target.value)}
                                    />
                                ))}
                            </div>
                        ) : null}
                    </div>
                )}

                {isNew ? null : (
                    <button type="button" className={style.guide} onClick={() => openGuide(form.guide.url)}>
                        {form.guide.label}
                        <span aria-hidden="true">›</span>
                    </button>
                )}
            </div>
        </section>
    );
}
