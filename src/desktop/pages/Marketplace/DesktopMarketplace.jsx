import React from 'react';
import {useNavigate} from 'react-router-dom';
import {
    CONTACT_FIELDS,
    MARKETPLACES,
    NAME_FIELD,
    ORDER_FIELDS,
    SUPPORT_URL,
    useMarketplaceForm
} from '../../../pages/Marketplace/useMarketplaceForm';
import MarketplaceLogo from '../../../pages/Marketplace/MarketplaceLogo';
import LegalNote from '../../../shared/ui/LegalNote/LegalNote';
import Spinner from '../../ui/Spinner';
import StatusStage, {StatusActions, statusStyle} from '../../ui/StatusStage';
import steam from '../Steam/DesktopSteam.module.scss';
import style from './DesktopMarketplace.module.scss';

export default function DesktopMarketplace() {
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
            <StatusStage
                tone="done"
                icon="✓"
                title="Вы отправили заявку на активацию заказа"
                lead="Менеджер магазина свяжется с Вами для активации продукта из Вашего заказа в ближайшее время."
            >
                <StatusActions>
                    <button type="button" className={statusStyle.primary} onClick={() => navigate('/')}>
                        Вернуться на главную
                    </button>
                    <a className={statusStyle.secondary} href={SUPPORT_URL} target="_blank" rel="noreferrer">
                        Поддержка
                    </a>
                </StatusActions>
            </StatusStage>
        );
    }

    return (
        <div className={steam.screen}>
            <header className={steam.head}>
                <h1 className={steam.title}>Активация заказа с маркетплейса</h1>
            </header>

            <div className={steam.body}>
                <div className={steam.main}>
                    <section className={steam.block}>
                        <h2 className={steam.blockTitle}>Выберите площадку:</h2>

                        <div className={steam.presets}>
                            {MARKETPLACES.map((item, index) => (
                                <button
                                    key={item.name}
                                    type="button"
                                    style={{'--i': index}}
                                    className={`${steam.preset} ${style.preset} ${flow.form.marketplace === item.name ? steam.presetActive : ''} ${flow.isTouched && !flow.form.marketplace ? style.presetBad : ''}`}
                                    onClick={() => flow.update('marketplace', item.name)}
                                >
                                    <MarketplaceLogo logo={item.logo} className={style.logo}/>
                                    {item.name}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className={steam.block}>
                        <h2 className={steam.blockTitle}>Данные по заказу:</h2>

                        <div className={style.grid}>
                            {ORDER_FIELDS.map(renderField)}
                            {renderField(NAME_FIELD)}
                        </div>
                    </section>

                    <section className={steam.block}>
                        <h2 className={steam.blockTitle}>Способ связи с Вами:</h2>

                        <div className={`${style.grid} ${style.contacts}`}>
                            {CONTACT_FIELDS.map(renderField)}
                        </div>
                    </section>
                </div>

                <aside className={steam.panel}>
                    <div className={steam.summaryRow}>
                        <span className={steam.summaryLabel}>Площадка</span>
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

                    <LegalNote className={steam.legal} action="Отправить заявку"/>
                </aside>
            </div>
        </div>
    );
}
