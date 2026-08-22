import React, {useEffect, useState} from 'react';
import f, {Rail, Row, Sheet, Split} from '../../../Elements/FormLayout/FormLayout';
import s from './CardForm.module.scss';

// Поле с кнопкой очистки: крестик появляется, только когда есть что стирать.
const Clearable = ({empty, onClear, children}) => (
    <span className={s.inputWrap}>
        {children}
        {empty ? null : (
            <button type="button" className={s.clearBtn} onClick={onClear} aria-label="Очистить поле" tabIndex={-1}>
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
            </button>
        )}
    </span>
);

// Значения приходят из парсинга: PS отдаёт serviceBranding, Xbox — eligibilityInfo.type.
const OFFER_BRANDINGS = [
    {value: 'PS_PLUS', label: 'PS Plus'},
    {value: 'GamePass', label: 'Game Pass'},
    {value: 'PCGamePass', label: 'PC Game Pass'},
    {value: 'EAPlay', label: 'EA Play'},
    {value: 'EAAccess', label: 'EA Access'},
];

const OFFER_CURRENCIES = ['TRY', 'INR', 'USD', 'EUR', 'RUB'];

const isEmpty = (value) => value === null || value === undefined || value === '';

// В БД даты лежат по-разному: endDatePromotion — строка с миллисекундами,
// releaseDate — дата. Приводим и то, и другое к yyyy-mm-dd для нативного пикера.
const toDateInput = (value) => {
    if (isEmpty(value)) return '';
    const raw = String(value).trim();
    const date = /^\d+$/.test(raw) ? new Date(Number(raw)) : new Date(raw);
    if (Number.isNaN(date.getTime())) return '';
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
};

/**
 * Форма карточки товара: разделы слева, поля справа построчно.
 * Показывается только выбранный раздел — форма не превращается в длинную ленту.
 */
const CardForm = ({sections, values, onChange, suggestions = {}}) => {
    const [active, setActive] = useState(sections[0]?.title);

    useEffect(() => {
        if (!sections.some((section) => section.title === active)) {
            setActive(sections[0]?.title);
        }
    }, [sections, active]);

    const setValue = (key, value) => onChange(key, value);

    const setListItem = (key, index, value) => {
        const list = [...(values[key] || [])];
        list[index] = value;
        onChange(key, list);
    };

    const addListItem = (key) => onChange(key, [...(values[key] || []), '']);

    const removeListItem = (key, index) => {
        const list = [...(values[key] || [])];
        list.splice(index, 1);
        onChange(key, list);
    };

    const renderField = (field) => {
        const value = values[field.key];

        switch (field.type) {
            case 'textarea':
                return (
                    <Row key={field.key} label={field.label} hint={field.hint} top wide>
                        <Clearable empty={isEmpty(value)} onClear={() => setValue(field.key, '')}>
                            <textarea
                                className={`${f.input} ${f.textarea} ${s.clearable}`}
                                rows={4}
                                value={value ?? ''}
                                onChange={(e) => setValue(field.key, e.target.value)}
                            />
                        </Clearable>
                    </Row>
                );

            case 'number':
                return (
                    <Row key={field.key} label={field.label} hint={field.hint}>
                        <Clearable empty={isEmpty(value)} onClear={() => setValue(field.key, null)}>
                            <input
                                className={`${f.input} ${s.clearable}`}
                                type="number"
                                value={value ?? ''}
                                onChange={(e) => setValue(field.key, e.target.value === '' ? null : Number(e.target.value))}
                            />
                        </Clearable>
                    </Row>
                );

            // Значений вида/подвида в базе ограниченный набор, но он не зафиксирован в коде:
            // предлагаем списком то, что уже используется, и не мешаем ввести новое.
            case 'combo': {
                // Подвид сужаем до тех, что уже встречались с выбранным видом:
                // выбор двухуровневый, и мешать варианты разных групп нельзя.
                const scopeValue = field.scopeBy ? values[field.scopeBy] : null;
                const scoped = field.scopeBy && scopeValue
                    ? suggestions[`${field.key}By${field.scopeBy}`]?.[scopeValue]
                    : null;
                const options = scoped || suggestions[field.key] || [];
                const listId = `combo-${field.key}`;
                return (
                    <Row key={field.key} label={field.label}
                         hint={options.length ? field.hint : 'Готовых значений пока нет'}>
                        <Clearable empty={isEmpty(value)} onClear={() => setValue(field.key, '')}>
                            <input
                                className={`${f.input} ${s.clearable}`}
                                type="text"
                                list={listId}
                                value={value ?? ''}
                                onChange={(e) => setValue(field.key, e.target.value)}
                            />
                        </Clearable>
                        <datalist id={listId}>
                            {options.map((option) => <option key={option} value={option} />)}
                        </datalist>
                    </Row>
                );
            }

            // Значение, которое из карточки менять нельзя: показываем как контекст.
            case 'readonly':
                return (
                    <Row key={field.key} label={field.label} hint={field.hint}>
                        <span className={s.readonly}>
                            {isEmpty(field.render ? field.render(values) : value)
                                ? '—'
                                : (field.render ? field.render(values) : value)}
                        </span>
                    </Row>
                );

            case 'date': {
                const asInput = toDateInput(value);
                return (
                    <Row key={field.key} label={field.label}
                         hint={asInput ? field.hint : (value ? `Сейчас: ${value}` : field.hint)}>
                        <Clearable empty={isEmpty(value)} onClear={() => setValue(field.key, null)}>
                            <input
                                className={`${f.input} ${s.clearable}`}
                                type="date"
                                value={asInput}
                                // Наружу отдаём число (мс) — так поле и хранится в БД.
                                onChange={(e) => setValue(
                                    field.key,
                                    e.target.value ? new Date(`${e.target.value}T00:00:00`).getTime() : null,
                                )}
                            />
                        </Clearable>
                    </Row>
                );
            }

            case 'select':
                return (
                    <Row key={field.key} label={field.label} hint={field.hint}>
                        <select
                            className={`${f.input} ${f.select}`}
                            value={value ?? field.options[0]?.value}
                            onChange={(e) => setValue(field.key, e.target.value)}
                        >
                            {field.options.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </Row>
                );

            case 'switch':
                return (
                    <Row key={field.key} label={field.label} hint={field.hint}>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={Boolean(value)}
                            className={`${f.switch} ${value ? f.switchOn : ''}`}
                            onClick={() => setValue(field.key, !value)}
                        >
                            <span className={f.switchDot} />
                        </button>
                    </Row>
                );

            case 'image':
                return (
                    <Row key={field.key} label={field.label} hint={field.hint} top wide>
                        <Clearable empty={isEmpty(value)} onClear={() => setValue(field.key, '')}>
                            <input
                                className={`${f.input} ${s.clearable}`}
                                type="text"
                                value={value ?? ''}
                                placeholder="https://…"
                                onChange={(e) => setValue(field.key, e.target.value)}
                            />
                        </Clearable>
                        {value ? <img className={s.preview} src={value} alt="" /> : null}
                    </Row>
                );

            // subscriptionOffers — массив объектов из парсинга: цена по подписке
            // (PS Plus, Game Pass, EA Play) с базовой ценой, рублёвым эквивалентом и сроком.
            case 'offers': {
                const offers = Array.isArray(value) ? value : [];

                const patchOffer = (index, patch) => {
                    const next = offers.map((offer, i) => (i === index ? {...offer, ...patch} : offer));
                    setValue(field.key, next);
                };

                const removeOffer = (index) => {
                    const next = offers.filter((_, i) => i !== index);
                    setValue(field.key, next.length ? next : null);
                };

                const addOffer = () => setValue(field.key, [...offers, {
                    branding: OFFER_BRANDINGS[0].value, kind: null, tier: null,
                    price: null, basePrice: null, priceRub: null,
                    discountText: null, endTime: null, currency: null,
                }]);

                return (
                    <Row key={field.key} label={field.label} hint={field.hint} top wide>
                        {offers.length === 0 ? <span className={s.listEmpty}>Предложений нет</span> : null}
                        {offers.map((offer, index) => (
                            <div key={index} className={s.offer}>
                                <div className={s.offerHead}>
                                    <select
                                        className={`${f.input} ${f.select} ${s.offerService}`}
                                        value={offer.branding ?? ''}
                                        onChange={(e) => patchOffer(index, {branding: e.target.value || null})}
                                    >
                                        {OFFER_BRANDINGS.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                    <button type="button" className={s.listRemove}
                                            onClick={() => removeOffer(index)} aria-label="Удалить предложение">
                                        ✕
                                    </button>
                                </div>

                                <div className={s.offerGrid}>
                                    <label className={s.offerField}>
                                        <span className={s.offerLabel}>Подпись</span>
                                        <input className={f.input} type="text" value={offer.tier ?? ''}
                                               placeholder="Game Pass"
                                               onChange={(e) => patchOffer(index, {tier: e.target.value || null})} />
                                    </label>
                                    <label className={s.offerField}>
                                        <span className={s.offerLabel}>Скидка</span>
                                        <input className={f.input} type="text" value={offer.discountText ?? ''}
                                               placeholder="-20%"
                                               onChange={(e) => patchOffer(index, {discountText: e.target.value || null})} />
                                    </label>
                                    <label className={s.offerField}>
                                        <span className={s.offerLabel}>Цена в валюте</span>
                                        <input className={f.input} type="number" value={offer.price ?? ''}
                                               onChange={(e) => patchOffer(index, {
                                                   price: e.target.value === '' ? null : Number(e.target.value),
                                               })} />
                                    </label>
                                    <label className={s.offerField}>
                                        <span className={s.offerLabel}>Базовая цена</span>
                                        <input className={f.input} type="number" value={offer.basePrice ?? ''}
                                               onChange={(e) => patchOffer(index, {
                                                   basePrice: e.target.value === '' ? null : Number(e.target.value),
                                               })} />
                                    </label>
                                    <label className={s.offerField}>
                                        <span className={s.offerLabel}>Цена ₽</span>
                                        <input className={f.input} type="number" value={offer.priceRub ?? ''}
                                               onChange={(e) => patchOffer(index, {
                                                   priceRub: e.target.value === '' ? null : Number(e.target.value),
                                               })} />
                                    </label>
                                    <label className={s.offerField}>
                                        <span className={s.offerLabel}>Валюта</span>
                                        <select className={`${f.input} ${f.select}`} value={offer.currency ?? ''}
                                                onChange={(e) => patchOffer(index, {currency: e.target.value || null})}>
                                            <option value="">—</option>
                                            {OFFER_CURRENCIES.map((code) => (
                                                <option key={code} value={code}>{code}</option>
                                            ))}
                                        </select>
                                    </label>
                                    <label className={s.offerField}>
                                        <span className={s.offerLabel}>Действует до</span>
                                        <input className={f.input} type="date" value={toDateInput(offer.endTime)}
                                               onChange={(e) => patchOffer(index, {
                                                   endTime: e.target.value
                                                       ? new Date(`${e.target.value}T00:00:00`).getTime()
                                                       : null,
                                               })} />
                                    </label>
                                </div>
                            </div>
                        ))}
                        <button type="button" className={f.addBtn} onClick={addOffer}>
                            + Добавить предложение
                        </button>
                    </Row>
                );
            }

            case 'list': {
                const list = values[field.key] || [];
                return (
                    <Row key={field.key} label={field.label} hint={field.hint} top wide>
                        {list.length === 0 ? <span className={s.listEmpty}>Пусто</span> : null}
                        {list.map((item, index) => (
                            <div key={index} className={s.listRow}>
                                {field.isImage && item ? (
                                    <img className={s.previewSmall} src={item} alt="" />
                                ) : null}
                                <Clearable
                                    empty={isEmpty(item)}
                                    onClear={() => setListItem(field.key, index, '')}
                                >
                                    <input
                                        className={`${f.input} ${s.clearable}`}
                                        type="text"
                                        value={item ?? ''}
                                        placeholder={field.isImage ? 'https://…' : 'Текст'}
                                        onChange={(e) => setListItem(field.key, index, e.target.value)}
                                    />
                                </Clearable>
                                <button
                                    type="button"
                                    className={s.listRemove}
                                    onClick={() => removeListItem(field.key, index)}
                                    aria-label="Удалить"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                        <button type="button" className={f.addBtn} onClick={() => addListItem(field.key)}>
                            + {field.isImage ? 'Добавить изображение' : 'Добавить'}
                        </button>
                    </Row>
                );
            }

            default:
                return (
                    <Row key={field.key} label={field.label} hint={field.hint} wide={field.wide}>
                        <Clearable empty={isEmpty(value)} onClear={() => setValue(field.key, '')}>
                            <input
                                className={`${f.input} ${s.clearable}`}
                                type="text"
                                value={value ?? ''}
                                onChange={(e) => setValue(field.key, e.target.value)}
                            />
                        </Clearable>
                    </Row>
                );
        }
    };

    const current = sections.find((section) => section.title === active) || sections[0];

    return (
        <Sheet>
            <Split>
                <Rail
                    items={sections.map((section) => section.title)}
                    active={current?.title}
                    onSelect={setActive}
                />
                <div className={f.rows}>
                    {current?.fields.map(renderField)}
                </div>
            </Split>
        </Sheet>
    );
};

export default CardForm;
