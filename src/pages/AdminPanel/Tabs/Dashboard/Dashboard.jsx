import React, {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import styles from './Dashboard.module.scss';
import MaintenanceToggle from '../../Blocks/MaintenanceToggle/MaintenanceToggle';
import SteamSettings from '../../Blocks/SteamSettings/SteamSettings';
import RefreshActions from '../../Blocks/RefreshActions/RefreshActions';

const sections = [
    {
        name: 'Данные',
        items: [
            {
                path: 'edit-cards',
                name: 'Товары',
                short: 'Карточки и их цены',
                full: 'Список всех карточек с фильтрами и поиском: название, цена, регион, привязка к каталогу. Отсюда заводят новые позиции, правят содержимое карточки и убирают её с витрины.'
            },
            {
                path: 'edit-directories',
                name: 'Каталоги',
                short: 'Группы товаров и разбор',
                full: 'Каталоги собирают товары в группы: у каждого свой регион и тип. Внутри каталога — его карточки, разбор источника и пересчёт цен.'
            },
            {
                path: 'parsing',
                name: 'Сетки цен',
                short: 'Таблицы наценки',
                full: 'Три таблицы наценки, по которым закупочная цена превращается в цену витрины. Сам разбор источников отсюда не запускается — только правила пересчёта.'
            },
            {
                path: 'steam',
                name: 'Steam',
                short: 'Витрина пополнения',
                full: 'Пополнение баланса Steam не собирается каталогами и блоками: суммы и проценты считает сервер, тарифы задаются на главной. Настройки самой витрины появятся здесь.'
            },
            {
                path: 'services',
                name: 'Сервисы',
                short: 'Бренды и подписки',
                full: 'Витрина сервисов: бренды, их тарифы и периоды подписок, ручное оформление менеджером и связь бренда с каталогом.'
            }
        ]
    },
    {
        name: 'Визуал',
        items: [
            {
                path: 'pages',
                name: 'Страницы и главная',
                short: 'Экраны витрины',
                full: 'Слева — список страниц витрины, справа — карусель и тело выбранной страницы. Здесь собирается всё, что покупатель листает в боте.'
            },
            {
                path: 'start-menu',
                name: 'Стартовый экран',
                short: 'Первый экран бота',
                full: 'Экран, который покупатель видит при первом запуске: текст, картинка и кнопки перехода в разделы витрины.'
            },
            {
                path: 'search',
                name: 'Подсказки в поиске',
                short: 'Готовые запросы',
                full: 'Подсказки под строкой поиска: текст подсказки и страница, на которую она ведёт.'
            },
            {
                path: 'more',
                name: 'Акции в «ещё»',
                short: 'Блоки раздела «ещё»',
                full: 'Информационные блоки и акции раздела «ещё»: заголовок, описание, картинка и ссылка, если она нужна.'
            }
        ]
    },
    {
        name: 'Продажи',
        items: [
            {
                path: 'history-orders',
                name: 'Заказы',
                short: 'История покупок',
                full: 'Все заказы с типом и статусом: что купили, чем закончилась оплата и что было выдано покупателю.'
            },
            {
                path: 'promo',
                name: 'Промокоды',
                short: 'Скидки и лимиты',
                full: 'Промокоды витрины: процент скидки и остаток применений. Отсюда же коды создают и отключают.'
            }
        ]
    },
    {
        name: 'Прочее',
        items: [
            {
                path: 'broadcast',
                name: 'Рассылка Tg',
                short: 'Сообщение по базе',
                full: 'Отправка сообщения пользователям бота: текст, вложение и кнопки. Перед отправкой видно, как сообщение будет выглядеть.'
            },
            {
                path: 'hosting',
                name: 'Хостинг',
                short: 'Картинки и файлы',
                full: 'Хранилище загруженных файлов с папками и поиском: сюда попадают картинки карточек, страниц и рассылок, отсюда берутся ссылки на них.'
            }
        ]
    }
];

const TabCard = ({item, hintOpen, onHint, onOpen}) => (
    <div className={styles['card']}>
        <button type="button" className={styles['cardMain']} onClick={onOpen}>
            <span className={styles['cardName']}>{item.name}</span>
            <span className={styles['cardShort']}>{item.short}</span>
        </button>

        <button
            type="button"
            className={`${styles['hintBtn']} ${hintOpen ? styles['hintBtnOpen'] : ''}`}
            onClick={onHint}
            aria-expanded={hintOpen}
            aria-label={`Подробнее: ${item.name}`}
        >
            !
        </button>

        {hintOpen ? (
            <div className={styles['hintPopover']} role="dialog" aria-label={item.name}>
                <span className={styles['hintTitle']}>{item.name}</span>
                <span className={styles['hintText']}>{item.full}</span>
            </div>
        ) : null}
    </div>
);

const Dashboard = () => {
    const navigate = useNavigate();
    const [openHint, setOpenHint] = useState(null);
    const gridsRef = useRef(null);

    useEffect(() => {
        if (!openHint) return;
        const close = (event) => {
            if (gridsRef.current && !gridsRef.current.contains(event.target)) setOpenHint(null);
        };
        const escape = (event) => {
            if (event.key === 'Escape') setOpenHint(null);
        };
        document.addEventListener('mousedown', close);
        document.addEventListener('keydown', escape);
        return () => {
            document.removeEventListener('mousedown', close);
            document.removeEventListener('keydown', escape);
        };
    }, [openHint]);

    return (
        <div className={styles['container']}>
            <h1 className={styles['title']}>Главная</h1>

            <div ref={gridsRef} className={styles['sections']}>
                {sections.map((section) => (
                    <section key={section.name} className={styles['section']}>
                        <div className={styles['sectionTitle']}>{section.name}</div>
                        <div className={styles['cardGrid']}>
                            {section.items.map((item) => (
                                <TabCard
                                    key={item.path}
                                    item={item}
                                    hintOpen={openHint === item.path}
                                    onHint={() => setOpenHint(openHint === item.path ? null : item.path)}
                                    onOpen={() => navigate(item.path)}
                                />
                            ))}
                        </div>
                    </section>
                ))}

                <section className={styles['section']}>
                    <div className={styles['sectionTitle']}>Управление</div>
                    <div className={styles['panelGrid']}>
                        <div className={styles['panel']}>
                            <div className={styles['panelHeader']}>Статус витрины</div>
                            <div className={styles['panelBody']}><MaintenanceToggle/></div>
                        </div>
                        <div className={styles['panel']}>
                            <div className={styles['panelHeader']}>Обслуживание</div>
                            <div className={styles['panelBody']}><RefreshActions/></div>
                        </div>
                        <div className={styles['panel']}>
                            <div className={styles['panelHeader']}>Steam</div>
                            <div className={styles['panelBody']}><SteamSettings/></div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Dashboard;
