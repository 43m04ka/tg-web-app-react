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

const REQUIRED_KEYS = ['login', 'password'];

export default function AccountFields({pageType, kind, values, isTouched, onKind, onChange}) {
    const form = accountForm(pageType);

    if (!form) return null;

    const isNew = kind === ACCOUNT_KINDS.NEW;
    const shortFields = form.fields.filter((field) => field.short);
    const longFields = form.fields.filter((field) => !field.short);

    const isMissing = (field) => !isNew && isTouched
        && REQUIRED_KEYS.includes(field.key)
        && String(values[field.key] || '').trim() === '';

    const missingCount = form.fields.filter(isMissing).length;

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
                <p key={isNew ? 'new' : 'own'} className={style.hint}>{isNew ? form.newHint : form.ownHint}</p>

                <div className={`${style.reveal} ${style.revealInline} ${isNew ? '' : style.revealOpen}`}>
                    <div className={style.revealInner}>
                        <div className={style.fields}>
                            {longFields.map((field) => (
                                <input
                                    key={field.key}
                                    className={`${style.input} ${isMissing(field) ? style.inputBad : ''}`}
                                    value={values[field.key] || ''}
                                    placeholder={field.placeholder}
                                    autoComplete="off"
                                    autoCapitalize="none"
                                    spellCheck="false"
                                    tabIndex={isNew ? -1 : undefined}
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
                                            tabIndex={isNew ? -1 : undefined}
                                            onChange={(event) => onChange(field.key, event.target.value)}
                                        />
                                    ))}
                                </div>
                            ) : null}

                            {missingCount > 0 ? (
                                <span className={style.fieldError}>
                                    Заполните логин и пароль от аккаунта {form.service} — без них заказ не оформить
                                </span>
                            ) : null}

                            <button
                                type="button"
                                className={style.guide}
                                tabIndex={isNew ? -1 : undefined}
                                onClick={() => openGuide(form.guide.url)}
                            >
                                {form.guide.label}
                                <span aria-hidden="true">›</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
