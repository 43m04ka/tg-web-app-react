import React, {useRef} from 'react';
import {FIELDS, MARKETPLACES, useMarketplaceForm} from '../../../pages/Marketplace/useMarketplaceForm';
import Spinner from '../../ui/Spinner';
import StatusStage, {StatusActions, statusStyle} from '../../ui/StatusStage';
import steam from '../Steam/DesktopSteam.module.scss';
import pay from '../Pay/DesktopPay.module.scss';
import style from './DesktopMarketplace.module.scss';

export default function DesktopMarketplace() {
    const fileRef = useRef(null);
    const flow = useMarketplaceForm();

    if (flow.isDone) {
        return (
            <StatusStage tone="done" icon="✓" title="Заявка отправлена" lead={`Менеджер свяжется с вами: ${flow.form.contact}`}>
                <StatusActions>
                    <button type="button" className={statusStyle.primary} onClick={flow.reset}>
                        Новая заявка
                    </button>
                </StatusActions>
            </StatusStage>
        );
    }

    return (
        <div className={steam.screen}>
            <header className={steam.head}>
                <h1 className={steam.title}>
                    Активация заказа <span className={pay.brand}>Геймворд</span>
                </h1>
            </header>

            <div className={steam.body}>
                <div className={steam.main}>
                    <section className={steam.block}>
                        <h2 className={steam.blockTitle}>Маркетплейс</h2>

                        <div className={steam.presets}>
                            {MARKETPLACES.map((name, index) => (
                                <button
                                    key={name}
                                    type="button"
                                    style={{'--i': index}}
                                    className={`${steam.preset} ${flow.form.marketplace === name ? steam.presetActive : ''} ${flow.isTouched && !flow.form.marketplace ? style.presetBad : ''}`}
                                    onClick={() => flow.update('marketplace', name)}
                                >
                                    {name}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className={steam.block}>
                        <h2 className={steam.blockTitle}>Данные заказа</h2>

                        <div className={style.grid}>
                            {FIELDS.map((field) => {
                                const className = `${steam.input} ${field.multiline ? style.textarea : ''} ${field.type === 'date' ? style.date : ''} ${flow.isBad(field.key) ? steam.inputBad : ''}`;

                                return (
                                    <label key={field.key} className={`${style.field} ${field.multiline || field.wide ? style.wide : ''}`}>
                                        <span className={style.label}>{field.title}</span>

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
                                    </label>
                                );
                            })}

                            <div className={`${style.field} ${style.wide}`}>
                                <span className={style.label}>Чек или скриншот заказа</span>

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
                            </div>
                        </div>
                    </section>

                    <button
                        type="button"
                        role="checkbox"
                        aria-checked={flow.isAgreed}
                        className={flow.isTouched && !flow.isAgreed ? `${pay.agree} ${pay.agreeBad}` : pay.agree}
                        onClick={() => flow.setAgreed((value) => !value)}
                    >
                        <span className={flow.isAgreed ? `${pay.agreeBox} ${pay.agreeBoxOn}` : pay.agreeBox} aria-hidden="true">
                            <svg viewBox="0 0 16 16" fill="none">
                                <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </span>
                        <span className={pay.agreeText}>Согласен на обработку персональных данных</span>
                    </button>
                </div>

                <aside className={steam.panel}>
                    <div className={steam.summaryRow}>
                        <span className={steam.summaryLabel}>Маркетплейс</span>
                        <span className={steam.summaryValue}>{flow.form.marketplace || '—'}</span>
                    </div>

                    <div className={steam.summaryRow}>
                        <span className={steam.summaryLabel}>Номер заказа</span>
                        <span className={steam.summaryValue}>{flow.form.orderNumber.trim() || '—'}</span>
                    </div>

                    {flow.blockReason ? <p className={steam.error}>{flow.blockReason}</p> : null}
                    {flow.error ? <p className={steam.error}>{flow.error}</p> : null}

                    <button
                        type="button"
                        className={steam.primary}
                        disabled={flow.isSending}
                        onClick={flow.submit}
                    >
                        {flow.isSending ? <Spinner/> : null}
                        {flow.isSending ? 'Отправляем…' : 'Отправить заявку'}
                    </button>
                </aside>
            </div>
        </div>
    );
}
