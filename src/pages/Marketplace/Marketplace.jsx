import React, {useRef} from 'react';
import {useAppInsets} from '../../shared/hooks/useAppInsets';
import {hapticImpact, hapticSelection} from '../../shared/lib/haptic';
import {FIELDS, MARKETPLACES, useMarketplaceForm} from './useMarketplaceForm';
import steam from '../Steam/Steam.module.scss';
import pay from '../Pay/Pay.module.scss';
import style from './Marketplace.module.scss';

export default function Marketplace() {
    const {contentSafeAreaInset, safeAreaInset} = useAppInsets();
    const fileRef = useRef(null);
    const flow = useMarketplaceForm();

    if (flow.isDone) {
        return (
            <div className={steam.stateScreen}>
                <div className={steam.stateCard}>
                    <div className={`${steam.stateIcon} ${steam.stateIconDone}`} aria-hidden="true">✓</div>
                    <h1 className={steam.stateTitle}>Заявка отправлена</h1>

                    <div className={steam.stateText}>
                        <span className={steam.stateLead}>Менеджер свяжется с вами: {flow.form.contact}</span>
                    </div>

                    <div className={steam.stateActions}>
                        <button type="button" className={steam.statePrimary} onClick={flow.reset}>
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
                                className={`${style.chip} ${flow.form.marketplace === name ? style.chipActive : ''} ${flow.isTouched && !flow.form.marketplace ? style.chipBad : ''}`}
                                onClick={() => {
                                    hapticSelection();
                                    flow.update('marketplace', name);
                                }}
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                </section>

                {FIELDS.map((field) => {
                    const className = `${steam.input} ${field.multiline ? style.textarea : ''} ${field.type === 'date' ? style.date : ''} ${flow.isBad(field.key) ? steam.inputBad : ''}`;

                    return (
                        <section key={field.key} className={steam.block}>
                            <h2 className={steam.blockTitle}>{field.title}</h2>

                            {field.multiline ? (
                                <textarea
                                    className={className}
                                    value={flow.form[field.key]}
                                    placeholder={field.placeholder}
                                    rows={3}
                                    onChange={(event) => flow.update(field.key, event.target.value)}
                                />
                            ) : (
                                <input
                                    className={className}
                                    type={field.type || 'text'}
                                    value={flow.form[field.key]}
                                    placeholder={field.placeholder}
                                    autoComplete="off"
                                    onChange={(event) => flow.update(field.key, event.target.value)}
                                />
                            )}
                        </section>
                    );
                })}

                <section className={steam.block}>
                    <h2 className={steam.blockTitle}>Чек или скриншот заказа</h2>

                    <button type="button" className={style.file} onClick={() => fileRef.current?.click()}>
                        <span className={style.fileName}>{flow.file ? flow.file.name : 'Прикрепить файл'}</span>
                        {flow.file ? (
                            <span
                                role="button"
                                className={style.fileClear}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    flow.pickFile(null);
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
                        onChange={(event) => {
                            flow.pickFile(event.target.files?.[0]);
                            event.target.value = '';
                        }}
                    />
                </section>

                <button
                    type="button"
                    role="checkbox"
                    aria-checked={flow.isAgreed}
                    className={`${pay.agree} ${style.agree} ${flow.isTouched && !flow.isAgreed ? pay.agreeBad : ''}`}
                    onClick={() => {
                        hapticSelection();
                        flow.setAgreed((value) => !value);
                    }}
                >
                    <span className={`${pay.agreeBox} ${flow.isAgreed ? pay.agreeBoxOn : ''}`} aria-hidden="true">
                        <svg viewBox="0 0 16 16" fill="none">
                            <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </span>
                    <span className={pay.agreeText}>Согласен на обработку персональных данных</span>
                </button>
            </div>

            <div className={steam.actionBar}>
                {flow.blockReason ? <p className={steam.actionError}>{flow.blockReason}</p> : null}
                {flow.error ? <p className={steam.actionError}>{flow.error}</p> : null}

                <button
                    type="button"
                    className={steam.primary}
                    disabled={flow.isSending}
                    onClick={() => {
                        if (flow.isReady) hapticImpact('medium');
                        flow.submit();
                    }}
                >
                    {flow.isSending ? 'Отправляем…' : 'Отправить заявку'}
                </button>
            </div>
        </div>
    );
}
