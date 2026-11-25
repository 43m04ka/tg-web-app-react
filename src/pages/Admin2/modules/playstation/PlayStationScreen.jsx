import React, {useCallback, useEffect, useState} from 'react';
import {
    Badge,
    Button,
    ErrorState,
    Field,
    Grid,
    Input,
    Panel,
    SkeletonRows,
    Toggle,
    Workspace,
} from '../../ui';
import {usePageHeader} from '../../shell/pageHeader';
import {useResource} from '../../platform/useResource';
import {useMutation} from '../../platform/useMutation';
import {keys} from '../../platform/resources';
import {fetchIndiaCodesStock, fetchSettings, fetchTurkeyCodesStock, updateSetting} from './api';
import style from './PlayStationScreen.module.scss';

const rub = (value) => `${Math.round(Number(value) || 0).toLocaleString('ru-RU')} ₽`;

const percentValid = (raw) => {
    const parsed = Number(String(raw).replace(',', '.'));
    return Number.isFinite(parsed) && parsed >= 0 && parsed < 100;
};

const StockBlock = ({resource, suffix, emptyText}) => {
    const stock = resource.data?.result || null;
    const stockBalance = stock?.balance || null;

    return (
        <div className={style.actionStack}>
            <div className={style.actionMain}>
                <div className={style.actionText}>
                    <span className={style.actionTitle}>Доступность кодов PanYanStore</span>
                    {stockBalance ? (
                        <span className={style.actionHint}>
                            {`Баланс ${rub(stockBalance.balance)}${stockBalance.creditLimit > 0 ? ` · кредит ${rub(stockBalance.creditLimit)}` : ''}`}
                        </span>
                    ) : null}
                </div>
                <Button
                    size="s"
                    variant="ghost"
                    loading={resource.isFetching}
                    onClick={() => resource.refresh()}
                >
                    Обновить
                </Button>
            </div>

            {resource.error ? (
                <Badge tone="danger">{resource.error.message || 'Остатки недоступны'}</Badge>
            ) : !stock ? (
                <SkeletonRows rows={2}/>
            ) : !stock.configured ? (
                <Badge tone="warning">PanYanStore не настроен на сервере</Badge>
            ) : stock.denoms.length ? (
                <ul className={style.stockList}>
                    {stock.denoms.map((denom) => (
                        <li key={`${denom.amount}-${denom.price}`} className={style.stockRow}>
                            <span className={style.stockAmount}>{denom.amount} {suffix}</span>
                            <span className={style.stockMeta}>{rub(denom.price)}</span>
                            <Badge tone={denom.inStock > 0 ? 'positive' : 'danger'}>
                                {denom.inStock > 0 ? `${denom.inStock} шт` : 'нет'}
                            </Badge>
                        </li>
                    ))}
                </ul>
            ) : (
                <span className={style.actionHint}>{emptyText}</span>
            )}
        </div>
    );
};

const ProfitField = ({settingKey, saved, write}) => {
    const [raw, setRaw] = useState(String(saved ?? ''));

    useEffect(() => {
        setRaw(String(saved ?? ''));
    }, [saved]);

    const invalid = raw !== '' && !percentValid(raw);
    const savedText = String(saved ?? '');

    return (
        <Field
            label="Минимальная прибыль при автовыдаче, %"
            hint={invalid ? '' : 'Если сетка покрывает закупку с этой надбавкой — продаём по сетке, иначе цена поднимается до закупка + процент'}
            error={invalid ? 'Число от 0 до 100' : ''}
        >
            <div className={style.row}>
                <Input
                    value={raw}
                    inputMode="decimal"
                    invalid={invalid}
                    onChange={(event) => setRaw(event.target.value)}
                />
                <Button
                    size="s"
                    disabled={invalid || raw === savedText}
                    loading={write.loading}
                    onClick={() => write.run({key: settingKey, value: Number(String(raw).replace(',', '.')), type: 'number'})}
                >
                    Сохранить
                </Button>
            </div>
        </Field>
    );
};

export default function PlayStationScreen() {
    usePageHeader('PlayStation');

    const settings = useResource(keys.settings, fetchSettings);
    const turkeyStock = useResource(keys.serviceTurkeyCodes, fetchTurkeyCodesStock);
    const indiaStock = useResource(keys.serviceIndiaCodes, fetchIndiaCodesStock);
    const values = settings.data?.settings || {};

    const write = useMutation(updateSetting, {invalidates: [keys.settings], done: 'Настройка сохранена'});

    const turkeyValue = values.ps_turkey_methods?.value || {};
    const turkeyMethods = {
        manager: turkeyValue.manager !== false,
        codes: turkeyValue.codes !== false
    };

    const indiaValue = values.ps_india_methods?.value || {};
    const indiaMethods = {
        manager: indiaValue.manager !== false,
        codes: indiaValue.codes === true
    };

    // Турция: хотя бы один способ всегда остаётся включённым
    const onTurkeyMethod = useCallback((field, next) => {
        const draft = {...turkeyMethods, [field]: next};

        if (!draft.manager && !draft.codes) return;

        write.run({key: 'ps_turkey_methods', value: draft, type: 'object'});
    }, [write, turkeyMethods]);

    // Индия: режимы взаимоисключающие — включение одного выключает другой
    const onIndiaMethod = useCallback((field, next) => {
        if (!next) return;

        write.run({key: 'ps_india_methods', value: {manager: field === 'manager', codes: field === 'codes'}, type: 'object'});
    }, [write]);

    if (settings.error) {
        return (
            <Workspace>
                <Panel scroll><ErrorState error={settings.error} onRetry={settings.refresh}/></Panel>
            </Workspace>
        );
    }

    if (settings.isLoading) {
        return (
            <Workspace>
                <Panel scroll><SkeletonRows count={8}/></Panel>
            </Workspace>
        );
    }

    return (
        <Workspace>
            <Panel scroll wide>
                <Grid columns={2}>
                    <section className={style.card}>
                        <header className={style.cardHead}>
                            <span className={style.cardTitle}>PS Турция</span>
                            <Badge tone={turkeyMethods.manager && turkeyMethods.codes ? 'positive' : 'warning'}>
                                {turkeyMethods.manager && turkeyMethods.codes ? 'выбор у покупателя' : 'один способ'}
                            </Badge>
                        </header>

                        <div className={style.actionStack}>
                            <div className={style.actionMain}>
                                <div className={style.actionText}>
                                    <span className={style.actionTitle}>Оформляет менеджер</span>
                                    <span className={style.actionHint}>
                                        Пополнение по данным аккаунта вручную, как раньше.
                                    </span>
                                </div>
                                <Toggle
                                    checked={turkeyMethods.manager}
                                    onChange={(next) => onTurkeyMethod('manager', next)}
                                    label="Оформляет менеджер"
                                />
                            </div>

                            <div className={style.actionMain}>
                                <div className={style.actionText}>
                                    <span className={style.actionTitle}>Кодами сразу</span>
                                    <span className={style.actionHint}>
                                        Мгновенная выдача кодов пополнения после оплаты. Коды покупаются
                                        у PanYanStore автоматически. Цены — в правилах price_rules_ps_turkey_codes.
                                    </span>
                                </div>
                                <Toggle
                                    checked={turkeyMethods.codes}
                                    onChange={(next) => onTurkeyMethod('codes', next)}
                                    label="Кодами сразу"
                                />
                            </div>

                            <span className={style.actionHint}>
                                Если включены оба способа, покупатель выбирает сам в карточке игры и в корзине.
                                Хотя бы один способ всегда остаётся включённым.
                            </span>
                        </div>

                        <ProfitField
                            settingKey="ps_turkey_min_profit_percent"
                            saved={values.ps_turkey_min_profit_percent?.value}
                            write={write}
                        />

                        <StockBlock
                            resource={turkeyStock}
                            suffix="₺"
                            emptyText="Номиналы TRY не найдены в каталоге поставщика."
                        />
                    </section>

                    <section className={style.card}>
                        <header className={style.cardHead}>
                            <span className={style.cardTitle}>PS Индия</span>
                            <Badge tone={indiaMethods.codes ? 'positive' : 'warning'}>
                                {indiaMethods.codes ? 'автовыдача кодов' : 'коды выдаёт менеджер'}
                            </Badge>
                        </header>

                        <div className={style.actionStack}>
                            <div className={style.actionMain}>
                                <div className={style.actionText}>
                                    <span className={style.actionTitle}>Коды выдаёт менеджер</span>
                                    <span className={style.actionHint}>
                                        После оплаты менеджер присылает коды пополнения в сообщении
                                        покупателю, как сейчас. Цены — в правилах price_rules_ps_india.
                                    </span>
                                </div>
                                <Toggle
                                    checked={indiaMethods.manager}
                                    onChange={(next) => onIndiaMethod('manager', next)}
                                    label="Коды выдаёт менеджер"
                                />
                            </div>

                            <div className={style.actionMain}>
                                <div className={style.actionText}>
                                    <span className={style.actionTitle}>Кодами сразу</span>
                                    <span className={style.actionHint}>
                                        Мгновенная выдача кодов пополнения после оплаты. Коды покупаются
                                        у PanYanStore автоматически.
                                    </span>
                                </div>
                                <Toggle
                                    checked={indiaMethods.codes}
                                    onChange={(next) => onIndiaMethod('codes', next)}
                                    label="Кодами сразу"
                                />
                            </div>

                            <span className={style.actionHint}>
                                Режимы взаимоисключающие: включение одного выключает другой.
                                Без способа выдачи регион остаться не может.
                            </span>
                        </div>

                        <ProfitField
                            settingKey="ps_india_min_profit_percent"
                            saved={values.ps_india_min_profit_percent?.value}
                            write={write}
                        />

                        <StockBlock
                            resource={indiaStock}
                            suffix="₹"
                            emptyText="Номиналы INR не найдены в каталоге поставщика."
                        />
                    </section>
                </Grid>
            </Panel>
        </Workspace>
    );
}
