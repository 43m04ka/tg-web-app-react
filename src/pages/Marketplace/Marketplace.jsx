import React from 'react';
import {useNavigate} from 'react-router-dom';
import {useAppInsets} from '../../shared/hooks/useAppInsets';
import {hapticImpact, hapticSelection} from '../../shared/lib/haptic';
import LegalNote from '../../shared/ui/LegalNote/LegalNote';
import MarketplaceLogo from './MarketplaceLogo';
import {CONTACT_FIELDS, MARKETPLACES, NAME_FIELD, ORDER_FIELDS, SUPPORT_URL, useMarketplaceForm} from './useMarketplaceForm';
import steam from '../Steam/Steam.module.scss';
import style from './Marketplace.module.scss';

export default function Marketplace() {
    const {contentSafeAreaInset, safeAreaInset} = useAppInsets();
    const navigate = useNavigate();
    const flow = useMarketplaceForm();

    const renderField = (field) => (
        <label key={field.key} className={style.field}>
            <span className={style.label}>{field.title}</span>
            <input
                className={`${steam.input} ${field.type === 'date' ? style.date : ''} ${flow.isBad(field.key) ? steam.inputBad : ''}`}
                type={field.type || 'text'}
                value={flow.form[field.key]}
                placeholder={field.placeholder}
                autoComplete="off"
                onChange={(event) => flow.update(field.key, event.target.value)}
            />
        </label>
    );

    if (flow.isDone) {
        return (
            <div className={steam.stateScreen}>
                <div className={steam.stateCard}>
                    <div className={`${steam.stateIcon} ${steam.stateIconDone}`} aria-hidden="true">✓</div>
                    <h1 className={steam.stateTitle}>Вы отправили заявку на активацию заказа</h1>

                    <div className={steam.stateText}>
                        <span className={steam.stateLead}>
                            Менеджер магазина свяжется с Вами для активации продукта из Вашего заказа в ближайшее время.
                        </span>
                    </div>

                    <div className={steam.stateActions}>
                        <button type="button" className={steam.statePrimary} onClick={() => navigate('/')}>
                            Вернуться на главную
                        </button>
                        <a className={`${steam.stateSecondary} ${style.link}`} href={SUPPORT_URL} target="_blank" rel="noreferrer">
                            Поддержка
                        </a>
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
                <h1 className={steam.title}>Активация заказа с маркетплейса</h1>
            </div>

            <div
                className={steam.content}
                style={{paddingBottom: `calc(${safeAreaInset.bottom}px + 20 * var(--u))`}}
            >
                <section className={steam.block}>
                    <h2 className={steam.blockTitle}>Выберите площадку:</h2>

                    <div className={style.chips}>
                        {MARKETPLACES.map((item) => (
                            <button
                                key={item.name}
                                type="button"
                                className={`${style.chip} ${flow.form.marketplace === item.name ? style.chipActive : ''} ${flow.isTouched && !flow.form.marketplace ? style.chipBad : ''}`}
                                onClick={() => {
                                    hapticSelection();
                                    flow.update('marketplace', item.name);
                                }}
                            >
                                <MarketplaceLogo logo={item.logo} className={style.logo}/>
                                {item.name}
                            </button>
                        ))}
                    </div>
                </section>

                <section className={steam.block}>
                    <h2 className={steam.blockTitle}>Данные по заказу:</h2>
                    <div className={style.fields}>
                        {ORDER_FIELDS.map(renderField)}
                        {renderField(NAME_FIELD)}
                    </div>
                </section>

                <section className={steam.block}>
                    <h2 className={steam.blockTitle}>Способ связи с Вами:</h2>
                    <div className={style.fields}>{CONTACT_FIELDS.map(renderField)}</div>
                </section>
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

                <LegalNote className={steam.legal} action="Отправить заявку"/>
            </div>
        </div>
    );
}
