import React, {useEffect, useState} from 'react';
import {useServer} from "../../../useServer";
import style from "../EditCards.module.scss";
import useData from "../../../useData";
import TabPane from "../../../Elements/WorkTabs/TabPane";
import CardForm from "./CardForm";
import useGlobalData from '../../../legacy/useGlobalData';

// Поля карточки разложены по смысловым секциям — раньше шли одним списком из 21 строки.
const sections = [
    {
        title: 'Основное',
        fields: [
            {type: 'text', key: 'name', label: 'Название', wide: true},
            {type: 'text', key: 'platform', label: 'Платформа'},
            {
                type: 'select', key: 'type', label: 'Тип',
                options: [
                    {label: 'Игра', value: 'GAME'},
                    {label: 'Подписка', value: 'SUBSCRIPTION'},
                    {label: 'Код', value: 'CODE'},
                    {label: 'DLC', value: 'ADD_ON'},
                    {label: 'Комплект', value: 'COMPLECT'},
                    {label: 'Донат', value: 'DONATION'},
                    {label: 'Другое', value: 'OTHER'},
                ],
            },
            {type: 'text', key: 'typeLabel', label: 'Подпись типа', hint: 'Показывается вместо кода типа'},
            {type: 'text', key: 'publisherName', label: 'Издатель'},
            {type: 'switch', key: 'onSale', label: 'Включено в продажу', hint: 'Виден покупателю в витрине'},
            {type: 'textarea', key: 'description', label: 'Описание'},
        ],
    },
    {
        title: 'Цены',
        fields: [
            {type: 'number', key: 'price', label: 'Цена'},
            {type: 'number', key: 'oldPrice', label: 'Старая цена', hint: 'Показывается зачёркнутой'},
            {type: 'number', key: 'priceInOtherCurrency', label: 'Цена в другой валюте'},
            {
                type: 'number', key: 'oldPriceInOtherCurrency', label: 'Старая цена в другой валюте',
                hint: 'Из неё считается процент скидки',
            },
            {
                // В БД endDatePromotion — строка с миллисекундами, поэтому отдаём число.
                type: 'date', key: 'endDatePromotion', label: 'Конец акции', asTimestamp: true,
                hint: 'Хранится числом (мс)',
            },
            {
                type: 'offers', key: 'subscriptionOffers', label: 'Цены по подписке',
                hint: 'PS Plus, Game Pass, EA Play — заполняется парсингом',
            },
        ],
    },
    {
        title: 'Медиа',
        fields: [
            {type: 'image', key: 'image', label: 'Обложка'},
            {type: 'image', key: 'logoUrl', label: 'Логотип'},
            {type: 'image', key: 'backgroundUrl', label: 'Фон'},
            {type: 'image', key: 'fourToThreeBannerUrl', label: 'Баннер 4:3'},
            {type: 'image', key: 'portraitBannerUrl', label: 'Баннер вертикальный'},
            {type: 'text', key: 'videoUrl', label: 'Видео', wide: true},
            {type: 'list', key: 'descriptionImages', label: 'Дополнительные изображения', isImage: true},
        ],
    },
    {
        title: 'Характеристики',
        fields: [
            {type: 'combo', key: 'genre', label: 'Жанр'},
            {type: 'text', key: 'numberPlayers', label: 'Количество игроков'},
            {type: 'text', key: 'language', label: 'Язык'},
            {type: 'text', key: 'regionActivate', label: 'Регион активации'},
            {
                type: 'date', key: 'releaseDate', label: 'Дата релиза', asTimestamp: true,
                hint: 'Хранится числом (мс)',
            },
            {type: 'list', key: 'bubbles', label: 'Островки'},
        ],
    },
    {
        // Позиции с вариантами (подписки, валюта) собираются в двухуровневый выбор:
        // сперва покупатель выбирает вид, потом подвид внутри него. Товары с одинаковым
        // видом склеиваются в одну группу — поэтому написание должно совпадать точь-в-точь.
        title: 'Подписка / валюта',
        fields: [
            {
                type: 'combo', key: 'choiceColumn', label: 'Вид',
                hint: 'Первый уровень выбора: группа, в которую попадёт позиция',
            },
            {
                type: 'combo', key: 'choiceRow', label: 'Подвид',
                hint: 'Второй уровень: вариант внутри вида',
                // Пока вид выбран, подсказываем только подвиды, встречающиеся с ним.
                scopeBy: 'choiceColumn',
            },
        ],
    },
    {
        title: 'Размещение',
        fields: [
            // Каталог меняется переносом товара, а не правкой поля, — только показываем.
            {
                type: 'readonly', key: 'catalogId', label: 'Каталог',
                render: (values) => (values.catalogId
                    ? `${values.catalogPath ? `${values.catalogPath} · ` : ''}ID ${values.catalogId}`
                    : null),
            },
            {type: 'number', key: 'serialNumber', label: 'Порядковый номер', hint: 'Сортировка внутри каталога'},
            {type: 'text', key: 'serviceId', label: 'ID у площадки', hint: 'По нему товар сопоставляется при парсинге'},
            {type: 'text', key: 'linkToOriginal', label: 'Ссылка на оригинал', wide: true},
            {type: 'list', key: 'conceptAddOns', label: 'Связанные дополнения'},
            {type: 'list', key: 'conceptProducts', label: 'Связанные издания'},
        ],
    },
];

const EditDataCard = ({cardId, onReload, onClose, suggestions}) => {
    const [cardData, setCardData] = useState(null);
    const [values, setValues] = useState({});
    const [changed, setChanged] = useState({});
    const [saving, setSaving] = useState(false);

    const {authenticationData} = useData();
    const {getCard, updateCardData: updateCard} = useServer();
    const {catalogList} = useGlobalData();

    // Путь каталога подмешиваем только для показа — в changed он не попадает.
    const catalogPath = catalogList?.find((item) => item.id === values.catalogId)?.path;

    useEffect(() => {
        getCard((data) => {
            setCardData(data);
            setValues(data || {});
            setChanged({});
        }, cardId).then();
    }, [cardId]);

    const loaded = cardData !== null && typeof cardData?.name !== 'undefined';
    const hasChanges = Object.keys(changed).length > 0;

    // Шлём только изменённые поля: ручка updateCardData делает частичный update.
    const handleChange = (key, value) => {
        setValues((prev) => ({...prev, [key]: value}));
        setChanged((prev) => ({...prev, [key]: value}));
    };

    const handleSave = () => {
        if (!hasChanges) {
            onClose();
            return;
        }
        setSaving(true);
        updateCard(() => {
            setSaving(false);
            onReload();
            onClose();
        }, authenticationData, cardId, changed);
    };

    return (
        <TabPane
            narrow
            footer={(
                <>
                    <span className={style['panelStatus']}>
                        {hasChanges ? `Изменено полей: ${Object.keys(changed).length}` : 'Изменений нет'}
                    </span>
                    <button type="button" className={style['panelBtn']} onClick={onClose}>
                        Отмена
                    </button>
                    <button
                        type="button"
                        className={`${style['panelBtn']} ${style['panelBtnPrimary']}`}
                        disabled={!loaded || saving || !hasChanges}
                        onClick={handleSave}
                    >
                        {saving ? 'Сохранение…' : 'Сохранить'}
                    </button>
                </>
            )}
        >
            {loaded ? (
                <>
                    {cardData.similarCard ? (
                        <p className={style['similarHint']}>
                            Мин. цена с аналогичных карт: {cardData.similarCard.price}
                        </p>
                    ) : null}

                    <CardForm sections={sections} values={{...values, catalogPath}} onChange={handleChange}
                              suggestions={suggestions} />
                </>
            ) : (
                <p className={style['similarHint']}>Загрузка карточки…</p>
            )}
        </TabPane>
    );
};

export default EditDataCard;
